# 티켓 첨부파일 경계 (2026-06)

## 배경

Service Desk 티켓 form은 두 종류의 첨부 입력을 받는다.

- 브라우저 file input으로 선택한 파일
- rich-text content 안에 삽입한 이미지

사용자가 form을 편집하는 동안 브라우저는 다음과 같은 값을 임시로 보관할 수 있다.

- `File`
- `File[]`
- base64 data URL
- blob URL
- embedded base64 image를 포함한 rich-text HTML

이 값들은 편집과 preview에는 유용하지만, 티켓 영속화 값으로는 안전하지 않다.

REMOTE ticket creation, requester update, draft behavior가 PostgreSQL-backed flow로 이동하면서 프로젝트에는 다음 사이의 명확한 경계가 필요했다.

```txt
browser attachment input
and
persisted ticket attachment metadata
```

프로젝트는 현재 production object storage를 구현하지 않는다.

의도적으로 제공하지 않는 항목은 다음과 같다.

- 영구 binary object storage
- storage bucket lifecycle 관리
- signed file delivery
- malware scanning
- upload-session recovery
- orphaned-file cleanup

그래도 구현은 demo reference를 production-grade storage처럼 보이게 만들지 않으면서 현실적인 첨부 workflow를 보여줘야 한다.

---

## 문제

### 1. Browser file object는 ticket data가 될 수 없음

Form은 자연스럽게 browser object를 사용한다.

```ts
type TicketFormValues = {
  attachment: File[];
};
```

`File` object는 browser-runtime state다.

이는 다음이 아니다.

- stable DTO
- JSON database value
- server-side attachment reference
- durable ticket state에 안전한 값

`File` object를 ticket DTO에 통과시키면 form input, file transfer, storage, ticket persistence가 뒤섞인다.

---

### 2. Base64와 blob URL은 임시 표현임

Rich-text editor는 일시적으로 다음을 포함할 수 있다.

```html
<img src="data:image/png;base64,..." />
```

또는:

```txt
blob:https://example.com/...
```

Base64 content는 ticket row를 암묵적인 binary store로 만든다.

Blob URL은 현재 browser runtime에만 속하며 reload, tab close, revoke, server rendering 이후 깨질 수 있다.

두 값 모두 PostgreSQL, LOCAL mutable state, action metadata, history metadata에 저장하면 안 된다.

---

### 3. Ticket command가 file-processing infrastructure를 소유하면 안 됨

별도 preparation boundary가 없으면 ticket create/update command가 다음을 처리해야 한다.

- multipart parsing
- selected-file validation
- rich-text image source detection
- demo 또는 storage URL replacement
- ticket validation
- approval and assignment routing
- ticket row persistence
- history creation

그러면 ticket command가 attachment infrastructure와 workflow behavior를 모두 책임지게 된다.

```txt
Ticket command
!= file-processing pipeline
```

Ticket command는 persistence-safe ticket input을 받아야 한다.

---

### 4. LOCAL과 REMOTE shape가 달라질 수 있음

LOCAL은 static demo reference를 사용할 수 있고, 미래 REMOTE 구현은 object storage를 사용할 수 있다.

두 runtime이 서로 다른 attachment shape를 노출하면 feature component에 다음과 같은 분기가 필요해진다.

```ts
if (dataScope === "LOCAL") {
  // render demo attachment
} else {
  // render remote attachment
}
```

UI에는 하나의 안정적인 application-facing attachment shape가 필요하다.

---

### 5. Draft behavior에도 같은 persistence boundary가 필요함

Draft persistence도 raw file, base64 image, blob URL을 저장하면 안 된다.

Draft와 submitted ticket이 서로 다른 attachment shape를 사용하면 submit 시점에 또 다른 conversion step이 필요하다.

이는 draft behavior를 설명하기 어렵게 만들고 깨지기 쉽게 만든다.

의도한 설계는 draft persistence와 submitted ticket persistence가 같은 normalized attachment contract를 공유하는 것이다.

---

## 결정

최종 ticket create 또는 requester update persistence 전에 server-controlled attachment preparation step을 도입한다.

핵심 결정은 다음과 같다.

```txt
Raw attachment input is transient.

Only normalized attachment metadata may cross the final ticket persistence boundary.
```

최종 write flow는 다음과 같다.

```txt
Form input
-> Attachment Prepare API
-> prepared body, files, and images
-> Ticket Create / Update API
-> ticket persistence
```

현재 prepare implementation은 LOCAL과 REMOTE 모두에 controlled demo replacement를 사용한다.

이는 Supabase Storage나 production file store에 upload하는 것이 아니다.

---

## 범위 규칙

### 1. Raw browser input은 transient로 유지함

Form은 일시적으로 다음을 보관할 수 있다.

- `File[]`
- base64 image source
- blob URL
- editor preview

Ticket persistence는 다음을 저장하면 안 된다.

- raw `File`
- file binary
- base64 data URL
- blob URL
- browser object reference

---

### 2. 안정적인 Prepare API contract를 사용함

Feature client는 최종 ticket write 전에 attachment input을 preparation boundary로 보낸다.

Route shape는 변할 수 있지만, 현재 의도한 boundary는 다음과 같다.

```txt
POST /api/service-desk/tickets/attachments/prepare
```

개념적으로:

```ts
type PrepareTicketAttachmentsInput = {
  body: string;
  files: File[];
};

type PrepareTicketAttachmentsResponse = {
  body: string;
  files: TicketAttachmentMetadata[];
  images: TicketAttachmentMetadata[];
};
```

`body`는 image-source normalization 이후의 rich-text content를 의미한다.

Ticket create, draft submit, requester update는 ticket persistence boundary를 넘을 때 prepared content와 metadata를 사용한다.

---

### 3. Storage-client 값이 아니라 metadata를 저장함

현재 metadata shape는 다음과 같다.

```ts
type TicketAttachmentMetadata = {
  originalName: string;
  replacedName: string;
  extension: string;
  size: number;
  type: string;
  demoUrl: string;
  replaced: true;
  reason: "SECURITY_DEMO_REPLACEMENT";
};
```

이 shape는 다음 특성을 가진다.

- JSON serializable
- browser-runtime independent
- 현재 ticket DTO에 안전함
- LOCAL과 REMOTE가 공유 가능함
- demo replacement임을 명시함

Ticket model은 storage SDK object나 provider-specific upload response를 노출하면 안 된다.

---

### 4. Rich-text image를 persistence 전에 normalize함

Prepare API는 rich-text HTML의 image source를 검사한다.

현재 지원하는 방향은 다음과 같다.

- controlled demo file URL은 유지
- 지원되는 inline base64 image는 controlled demo URL로 replacement
- blob image URL 거절
- remote image URL 거절
- local file path 거절
- 지원하지 않는 image MIME type 거절

Preparation 이후 body에는 raw embedded base64 image data가 남아 있으면 안 된다.

```txt
Before prepare
<img src="data:image/png;base64,...">

After prepare
<img src="/files/demo-*.png">
```

이는 controlled simulation이며 production image storage가 아니다.

---

### 5. Controlled file metadata를 생성함

선택된 file은 client form workflow 안에서만 `File[]`로 표현된다.

Prepare API는 허용된 file을 다음 metadata로 변환한다.

- original display name
- replacement demo name
- extension
- file size
- MIME type
- controlled demo URL
- replacement reason

Original filename은 display metadata일 뿐이다.

다음으로 취급하면 안 된다.

- trusted storage key
- MIME type 증명
- safe filesystem path
- unique identifier

미래 storage 구현은 server-controlled object key를 생성해야 한다.

---

### 6. Normalized ticket value만 저장함

Ticket create와 requester update persistence는 prepared value만 받는다.

Ticket row는 다음을 저장할 수 있다.

```txt
tk_content
tk_files
tk_images
```

의미:

- `tk_content`는 prepared rich-text body를 저장한다
- `tk_files`는 JSON file metadata를 저장한다
- `tk_images`는 JSON image metadata를 저장한다

Repository는 raw browser attachment value를 저장하면 안 된다.

---

### 7. Draft와 submitted attachment contract를 정렬함

Draft persistence도 raw binary data, base64 content, blob URL을 저장하면 안 된다.

Draft ticket은 submitted ticket과 같은 normalized attachment contract를 사용해야 한다.

따라서:

```txt
Draft attachment shape
=
Submitted ticket attachment shape
```

이렇게 하면 draft submit 시점의 conversion step을 피할 수 있다.

새 attachment가 포함된 draft를 저장할 때도 durable persistence 전에는 같은 preparation boundary를 거쳐야 한다.

---

### 8. LOCAL과 REMOTE output을 compatible하게 유지함

UI는 attachment URL이 어떻게 만들어졌는지 알 필요가 없어야 한다.

```txt
LOCAL
-> controlled static demo reference

REMOTE current scope
-> controlled replacement or future storage-backed reference behind the same DTO

REMOTE future implementation
-> object-storage-backed reference behind the same boundary
```

Rendering은 stable component contract를 사용한다.

```tsx
<TicketAttachmentList files={ticket.files} images={ticket.images} />
```

Feature component는 다음에 따라 분기하지 않는다.

- data scope
- storage provider
- upload strategy
- demo implementation

---

### 9. Preparation을 trusted validation boundary로 취급함

Client-side validation은 사용자 경험을 개선할 수 있지만 trusted boundary가 아니다.

Server preparation은 다음을 validate/normalize한다.

- file count
- file size
- total size
- extension
- 필요 시 MIME type
- inline image count
- inline image size
- unsupported source scheme
- controlled demo URL generation

Ticket write endpoint도 attachment metadata가 기대하는 DTO schema와 맞는지 추가로 검증할 수 있다.

---

### 10. History와 notification은 ticket command에 묶음

Attachment preparation 자체는 ticket workflow event가 아니다.

Attachment preparation만으로는 다음을 만들지 않는다.

- Ticket Action
- Ticket History
- status transition
- notification

History와 notification은 prepared result를 사용하는 ticket command가 성공했을 때만 발생한다.

---

## 정렬한 내용

### 1. Prepare API boundary

Attachment pipeline을 ticket workflow command에서 분리했다.

```txt
Feature client
-> Attachment Prepare Route Handler
-> attachment preparation service
-> prepared DTO
-> Ticket Create / Update Route Handler
```

이 경계는 ticket service가 ticket lifecycle behavior에 집중하도록 한다.

---

### 2. Ticket metadata shape

최종 ticket DTO는 files와 images에 `TicketAttachmentMetadata[]`를 사용한다.

Prepared selected file과 prepared inline image는 같은 metadata family를 사용한다.

---

### 3. Demo storage 표현

문서와 UI copy는 현재 behavior를 controlled demo replacement로 설명해야 한다.

다음을 암시하면 안 된다.

- permanent upload
- private object storage
- signed download delivery
- malware scanning
- production retention policy

---

## 결과 영향

### 긍정적 영향

- Ticket API가 JSON-safe attachment metadata를 받는다.
- Raw binary, base64, blob value가 PostgreSQL ticket data에 들어가지 않는다.
- Attachment processing을 ticket routing과 별도로 test할 수 있다.
- LOCAL과 REMOTE가 현재 같은 DTO shape를 노출한다.
- 미래 object storage를 preparation boundary 뒤에 추가할 수 있다.
- Storage limitation을 명확히 말함으로써 portfolio credibility를 유지한다.

---

### 부정적 영향 / 트레이드오프

- Ticket submission 전에 추가 prepare step이 필요하다.
- Feature workflow가 prepare failure와 ticket write failure를 함께 조정해야 한다.
- 현재 draft attachment recovery는 의도적으로 제한적이다.
- Demo URL은 production file storage가 아니다.
- 미래 real storage에는 upload token, cleanup, retention, access policy가 필요하다.

---

## 후속 정책

- Raw `File`, base64, blob value를 persisted ticket state에 두지 않는다.
- Prepare API를 유일한 trusted attachment normalization boundary로 유지한다.
- UI consumer를 위해 `TicketAttachmentMetadata`를 안정적으로 유지한다.
- Demo replacement URL을 production storage로 설명하지 않는다.
- Object storage를 추가하더라도 가능한 한 같은 application-facing prepare response shape를 유지한다.
- Draft upload recovery가 제품 요구사항이 되면 명시적인 draft upload/session cleanup policy를 추가한다.

---

## 요약

Attachment boundary는 browser-only attachment input이 ticket persistence에 들어가지 않도록 한다.

현재 model은 다음과 같다.

```txt
File[] / inline base64 / blob URL
-> Prepare API
-> prepared body + TicketAttachmentMetadata
-> Ticket create or requester update
-> tk_content / tk_files / tk_images
```

LOCAL과 REMOTE는 하나의 application-facing attachment metadata contract를 공유한다.

이는 현실적인 form experience를 유지하면서 production file storage에 대한 잘못된 인상을 피하기 위한 의도적인 결정이다.
