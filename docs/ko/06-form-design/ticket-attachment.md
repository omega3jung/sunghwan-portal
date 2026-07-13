# 티켓 첨부 설계

## 목표

티켓 첨부는 요청자와 운영자가 티켓 워크플로에 보조 파일과 rich-text 이미지를
추가할 수 있게 한다. 동시에 현재 데모가 raw binary file을 production-grade
object storage에 저장하는 것처럼 보이게 만들지 않는다.

첨부 설계의 목표는 다음과 같다.

- 브라우저의 raw `File` 객체를 transient 상태로 유지한다.
- 티켓 write 전에 첨부를 prepare한다.
- normalized metadata와 controlled demo URL만 저장한다.
- LOCAL과 REMOTE 동작의 contract를 맞춘다.
- 이후 object-storage 통합이 가능하도록 ticket UI contract를 안정적으로
  유지한다.

---

## 핵심 개념

```txt id="ticket-attachment-core"
Browser file input은 transient하다.
Ticket persistence는 prepared metadata만 저장한다.
```

첨부 계층은 preparation boundary다. Ticket create, requester update,
comment, reject 같은 ticket command와 분리된다.

---

## 현재 흐름

```txt id="ticket-attachment-flow"
Browser input
-> Attachment Prepare API
-> prepared body, files, and images
-> ticket command payload
-> ticket persistence
```

Prepare API는 선택 파일과 rich-text inline image에 대한 안전한 metadata를
반환한다. Ticket write command는 그 prepared result를 소비한다.

---

## 입력 유형

### 선택 파일

선택 파일은 브라우저 file input에서 온다.

```ts id="selected-file-input"
type TicketAttachmentPrepareInput = {
  body: string;
  files: File[];
};
```

선택 파일에는 이미지와 일반 파일이 모두 포함될 수 있다. 서버는 prepared
result를 `files`와 `images`로 분류한다.

### Rich-Text 이미지

Rich-text 이미지는 제출된 body 안에서 발견된다. Inline `data:image/*`
source는 preparation 중 controlled demo image URL로 교체된다.

임의 remote URL, editor boundary 밖으로 나온 blob URL, file path 같은
지원되지 않는 image source는 preparation service가 거부한다.

---

## Prepare API

### Endpoint

```txt id="ticket-attachment-prepare-endpoint"
POST /api/service-desk/tickets/attachments/prepare
```

Feature API client는 다음 값을 포함한 `FormData`를 보낸다.

- `body`: 현재 rich-text body
- `files`: 선택된 브라우저 파일

### Response

```ts id="ticket-attachment-prepare-response"
type PrepareTicketAttachmentsResponseDto = {
  body: string;
  files: TicketPreparedAttachmentDto[];
  images: TicketPreparedInlineImageDto[];
};
```

이 response가 새 attachment input에 대해 ticket write command가 신뢰해야 할
유일한 첨부 형태다.

### 경계 규칙

Prepare API가 소유하는 책임은 다음과 같다.

- file name 검증
- extension 검증
- file size와 total size limit 검증
- 선택 파일을 demo asset으로 교체
- rich-text inline data image를 demo asset으로 교체
- 지원하지 않는 image source 거부
- normalized metadata 반환

Ticket create, update, action command는 workflow behavior를 소유한다. 이들이
attachment preparation logic을 중복 구현하면 안 된다.

---

## Metadata Contract

현재 저장되는 metadata 형태는 다음과 같다.

```ts id="ticket-attachment-metadata"
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

### 필드 의미

- `originalName`: 브라우저 입력 또는 inline image label에서 온 파일 이름
- `replacedName`: 앱이 노출하는 controlled demo file name
- `extension`: normalized file extension
- `size`: 원본 input size in bytes
- `type`: 가능한 경우 MIME type
- `demoUrl`: controlled `/files/demo-*` URL
- `replaced`: 현재 demo replacement model에서는 항상 `true`
- `reason`: auditability와 UI 설명을 위한 고정 replacement reason

Metadata에는 raw bytes, local filesystem path, trusted storage object key가
들어가지 않는다.

---

## 지원 유형과 제한

현재 demo boundary가 지원하는 확장자는 다음과 같다.

```txt id="ticket-attachment-supported-types"
jpg, jpeg, png, gif, webp,
txt, log, csv, json,
xlsx, docx, pptx, pdf,
zip, 7z
```

현재 제한은 다음과 같다.

- 선택 파일 최대 개수: 10
- 선택 파일 1개 최대 크기: 10 MB
- 선택 파일 전체 최대 크기: 50 MB
- inline image 최대 개수: 20
- inline image 1개 최대 크기: 5 MB
- inline image 전체 최대 크기: 20 MB
- file name 최대 길이: 200자

이 제한은 현재 demo constant다. Tenant-level attachment policy는 future scope다.

---

## 선택 파일 Preparation

선택 파일 preparation은 다음 과정을 따른다.

```txt id="selected-file-preparation"
File
-> validate name, extension, and size
-> choose controlled demo URL by extension
-> return TicketAttachmentMetadata
```

이미지 선택 파일은 prepared `images` 배열로 반환된다. 그 외 선택 파일은
prepared `files` 배열로 반환된다.

Raw `File` 객체는 ticket persistence boundary를 넘지 않는다.

---

## Rich-Text 이미지 Preparation

Rich-text body preparation은 다음 과정을 따른다.

```txt id="rich-text-image-preparation"
HTML body
-> find inline data images
-> validate image type and size
-> replace source with controlled demo URL
-> return prepared body and image metadata
```

Prepared body가 티켓에 저장되는 값이다. 이 값에는 inline base64 image payload가
들어가면 안 된다.

---

## 티켓 저장

티켓은 prepared attachment metadata를 file과 image field로 나누어 저장한다.

```txt id="ticket-attachment-persistence"
tk_content -> prepared body
tk_files   -> TicketAttachmentMetadata[]
tk_images  -> TicketAttachmentMetadata[]
```

Ticket DTO도 같은 애플리케이션 분리를 노출한다.

```ts id="ticket-attachment-ticket-dto"
type TicketAttachmentFields = {
  files: TicketAttachmentMetadata[];
  images: TicketAttachmentMetadata[];
};
```

이 구조는 file attachment display와 inline image display를 명확히 분리하면서
동일한 metadata contract를 공유하게 한다.

---

## Create와 Update 통합

Ticket create와 requester-owned update 흐름은 최종 ticket mutation 전에
Prepare API를 호출한다.

```txt id="ticket-create-attachment-flow"
form values
-> prepare attachments
-> toTicketMutateRequestPayloadFromFormValues(...)
-> POST or PUT ticket endpoint
```

최종 ticket mutation payload에는 다음이 포함된다.

- prepared body
- prepared `files`
- prepared `images`
- category, due date, priority, risk, email 같은 일반 ticket field

Ticket mutation schema는 서버 워크플로가 ticket을 쓰기 전에 prepared metadata
shape를 다시 검증한다.

---

## Requester Update 통합

Requester update는 기존 prepared attachment를 유지하면서 새 파일이나 rich-text
이미지를 추가할 수 있다.

```txt id="requester-update-attachment-flow"
existing attachments
+ newly prepared attachments
-> requester update payload
-> ticket update service
-> history comparison
```

Requester update layer는 existing metadata와 newly prepared result를 합치는
책임을 가진다. 서버는 최종 payload 검증을 계속 담당한다.

---

## Ticket Action 통합

Ticket action form은 communication 또는 operator workflow action을 위해
content와 attachment를 포함할 수 있다.

Action이 attachment input을 지원하면 action tool은 action payload를 만들기
전에 body와 files를 prepare한다. Approval-only action은 attachment preparation이
필요하지 않다.

Attachment preparation 자체는 여전히 action event가 아니다. Ticket command가
성공했을 때만 history가 생성된다.

---

## Draft 통합

현재 draft 구현은 attachment binary나 prepared attachment metadata를 복구
보장 대상으로 저장하지 않는다.

Create-ticket draft helper는 raw browser file을 이어 들고 가지 않도록 form
content를 저장할 때 attachment input을 비운다.

```txt id="ticket-draft-attachment-policy"
draft save
-> keep request fields
-> clear transient attachment input
-> final submit prepares current attachment input
```

LOCAL draft는 feature API boundary 뒤의 simplified demo-safe 구현을 사용한다.
REMOTE PostgreSQL draft model과 persistence-equivalent하지 않다. REMOTE draft
behavior는 draft route와 server DTO boundary를 거친다. 두 경우 모두 현재 draft
recovery는 form-data 중심이며 attachment 복원을 약속하지 않는다.

이는 현재 범위에서 의도된 제약이다. 브라우저 `File` 객체는 reload 후 안전하게
복원할 수 없고, production-grade attachment storage가 아직 구현되지 않았기
때문이다.

---

## LOCAL과 REMOTE 런타임

LOCAL과 REMOTE는 같은 visible attachment contract를 사용한다.

```txt id="ticket-attachment-runtime"
LOCAL  -> controlled demo replacement
REMOTE -> controlled demo replacement plus ticket row persistence
```

REMOTE PostgreSQL persistence가 binary file persistence를 의미하지는 않는다.
저장되는 값은 여전히 controlled demo asset을 가리키는 metadata다.

UI는 이를 production file upload가 아니라 demo replacement로 설명해야 한다.

---

## UI 동작

Attachment UI는 다음을 보여주어야 한다.

- 선택 파일 이름
- file count와 total size feedback
- validation message
- ticket detail의 prepared attachment display
- REMOTE mode에서도 demo replacement를 사용한다는 명확한 notice

Ticket detail은 shared attachment display component를 통해 prepared metadata를
렌더링한다. Display component는 user-facing label로 `originalName`을 사용하고,
controlled link target으로 `demoUrl`을 사용해야 한다.

---

## 검증

### Client Validation

Client validation은 prepare request 전에 feedback을 개선한다.

검사할 수 있는 항목은 다음과 같다.

- file count
- file size
- accepted extension
- required content

### Server Validation

Prepare API가 신뢰 가능한 attachment validation boundary다.

검증 항목은 다음과 같다.

- file name 존재와 길이
- extension allow-list
- single-file size
- total selected-file size
- inline image count
- inline image size
- total inline image size
- unsafe image source

### Ticket Write Validation

Ticket write schema는 저장될 attachment metadata가 expected prepared shape와
일치하는지 검증한다.

---

## State Management

React Hook Form은 form이 열려 있는 동안 unsaved file input을 소유한다.

React Query는 persisted ticket과 draft server state를 소유한다.

Zustand는 attachment source of truth로 사용하면 안 된다. 관련 없는 cross-feature
UI state에는 사용할 수 있지만, raw file이나 persisted attachment metadata를
소유하면 안 된다.

---

## History와 Notification

Attachment preparation만으로는 ticket history가 생성되지 않고 notification도
발송되지 않는다.

History와 notification은 성공한 ticket command에 속한다.

- prepared attachment가 포함된 ticket create
- attachment를 변경하는 requester update
- prepared attachment가 포함된 ticket action

History는 `replacedName`, `demoUrl`, `originalName`, `size` 같은 deterministic
field를 사용해 prepared metadata를 비교해야 한다.

---

## 보안 경계

현재 보안 방향은 보수적이다.

- raw browser `File` 객체를 저장하지 않는다.
- base64 image payload를 저장하지 않는다.
- arbitrary remote image URL을 허용하지 않는다.
- local filesystem path를 저장하지 않는다.
- 클라이언트가 trusted metadata를 만들어내게 하지 않는다.
- demo replacement를 durable storage로 설명하지 않는다.

이 방식은 데모가 misleading storage behavior를 보이지 않게 하고, future
object-storage boundary를 명확하게 유지한다.

---

## Future Object Storage 확장

Production attachment 구현은 내부 preparation mechanism을 object storage로
교체할 수 있다.

향후 요구사항은 다음과 같다.

- authenticated upload session
- server-issued object key
- virus and content scanning
- per-tenant limits
- download authorization checks
- deletion and retention policy
- signed URL 또는 proxy download behavior
- demo metadata에서 storage metadata로의 migration

Future metadata가 storage-backed URL이나 object key를 같은 display model 뒤에
추가한다면 UI contract는 현재 형태와 가깝게 유지될 수 있다.

---

## 피하는 Anti-Patterns

### Raw Files 저장

`File[]`은 ticket DTO, React Query cache, Zustand, server row에 저장하면 안
된다.

### Base64 Images 저장

Inline data image는 크고 안전하지 않을 수 있다. 반드시 prepare하고 replace해야
한다.

### Client Metadata 신뢰

클라이언트는 input을 보낼 수 있지만, 신뢰 가능한 prepared metadata는 서버가
생성해야 한다.

### Ticket Command에 Attachment Infrastructure 혼합

Ticket command는 prepared value를 소비해야 한다. File replacement, extension
validation, inline image parsing을 구현하면 안 된다.

### Production Upload 지원처럼 설명

현재 시스템은 controlled demo replacement를 사용한다. Production object storage를
제공하지 않는다.

---

## Testing Strategy

Attachment test는 다음을 다뤄야 한다.

- 허용 및 거부되는 extension
- selected file limits
- inline image replacement
- unsafe rich-text image rejection
- ticket create payload mapping
- requester update merge behavior
- ticket action attachment preparation
- transient attachment input을 비우는 draft behavior
- LOCAL/REMOTE contract parity

---

## 책임 매트릭스

| 영역 | 책임 |
| --- | --- |
| React Hook Form | transient browser input 소유 |
| Feature API client | prepare request와 ticket mutation 전송 |
| Prepare API | 검증과 prepared metadata 생성 |
| Ticket command | prepared value를 소비하고 workflow behavior 적용 |
| Ticket repository | prepared metadata field 저장 |
| Ticket detail UI | prepared metadata 표시 |
| Draft flow | attachment recovery 보장 없이 form value 저장 |
| Future storage service | 구현 시 durable binary storage 소유 |

---

## 관련 문서

- [`ticket-form.md`](ticket-form.md)
- [`../03-domain/ticket/ticket-model.md`](../03-domain/ticket/ticket-model.md)
- [`../03-domain/ticket/ticket-activity.md`](../03-domain/ticket/ticket-activity.md)
- [`../03-domain/ticket/ticket-history.md`](../03-domain/ticket/ticket-history.md)
- [`../02-architecture/database-strategy.md`](../02-architecture/database-strategy.md)
- [`../08-dev-strategy/decision-log/2026-06-ticket-attachment-boundary.md`](../08-dev-strategy/decision-log/2026-06-ticket-attachment-boundary.md)
- [`../08-dev-strategy/decision-log/2026-06-ticket-form-and-draft-workflow.md`](../08-dev-strategy/decision-log/2026-06-ticket-form-and-draft-workflow.md)
- [`../08-dev-strategy/decision-log/2026-07-ticket-routing-and-update-policy.md`](../08-dev-strategy/decision-log/2026-07-ticket-routing-and-update-policy.md)

---

## 요약

티켓 첨부는 명시적인 preparation boundary를 통해 처리된다.

Raw browser input은 transient 상태로 남는다. Prepare API는 선택 파일과
rich-text image를 검증하고 controlled demo asset으로 교체한 뒤 prepared
metadata를 반환한다. Ticket create, requester update, 지원되는 action flow는
prepared body, `files`, `images`만 저장한다.

Draft는 현재 attachment recovery를 보장하지 않는다. Production object storage는
future scope이며, 현재 UI는 첨부 동작을 durable upload support가 아니라 demo
replacement로 표현해야 한다.
