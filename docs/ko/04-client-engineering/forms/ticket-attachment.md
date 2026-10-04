# 티켓 첨부 설계

## 목표

티켓 첨부는 요청자와 운영자가 업무에 필요한 파일과 본문 이미지를 추가하게 합니다.
현재 데모는 첨부 정보를 저장하고 지정된 데모 파일을 보여줍니다. 실제 파일을 운영
환경용 객체 저장소에 저장하는 기능은 제공하지 않습니다.

첨부 설계의 목표는 다음과 같습니다.

- 브라우저 원본 `File` 객체는 임시로 보관합니다.
- 티켓 저장 전에 첨부 정보를 준비합니다.
- 정해진 형식의 첨부 정보와 지정된 데모 URL만 저장합니다.
- LOCAL과 REMOTE가 같은 응답 형식과 기대 동작을 제공합니다.
- 이후 객체 저장소를 연결해도 티켓 UI가 사용하는 형식을 유지할 수 있게 합니다.

---

## 핵심 개념

```txt
Browser file input은 transient하다.
Ticket persistence는 prepared metadata만 저장한다.
```

브라우저에서 선택한 파일은 임시로 보관하고, 티켓에는 준비 API가 반환한 첨부 정보만
저장합니다. 첨부 준비는 티켓 생성, 요청자 수정, 댓글, 거절 같은 업무 명령과
분리하여 처리합니다.

---

## 현재 흐름

```txt
Browser input
-> Attachment Prepare API
-> prepared body, files, and images
-> ticket command payload
-> ticket persistence
```

준비 API는 선택 파일과 본문 이미지를 검증한 뒤 첨부 정보를 반환합니다. 티켓 저장
명령은 이 준비 결과를 사용합니다.

---

## 입력 유형

### 선택 파일

선택 파일은 브라우저 file input에서 옵니다.

```ts
type TicketAttachmentPrepareInput = {
  body: string;
  files: File[];
};
```

선택 파일에는 이미지와 일반 파일이 모두 포함될 수 있습니다. 서버는 준비 결과를
`files`와 `images`로 분류합니다.

### Rich-Text 이미지

본문 이미지는 제출한 `body`에 포함됩니다. 준비 과정에서 `data:image/*` 주소를
지정된 데모 이미지 URL로 교체합니다.

임의의 외부 URL, 편집기 밖으로 전달된 blob URL, 파일 경로처럼 지원하지 않는
이미지 주소는 준비 서비스가 거부합니다.

---

## Prepare API

### Endpoint

```txt
POST /api/service-desk/tickets/attachments/prepare
```

Feature API client는 다음 값을 포함한 `FormData`를 보냅니다.

- `body`: 현재 rich-text body
- `files`: 선택된 브라우저 파일

### Response

```ts
type PrepareTicketAttachmentsResponseDto = {
  body: string;
  files: TicketPreparedAttachmentDto[];
  images: TicketPreparedInlineImageDto[];
};
```

새 첨부 입력을 저장할 때 티켓 명령은 이 응답 형식의 첨부 정보만 신뢰해야 합니다.

### 경계 규칙

Prepare API가 소유하는 책임은 다음과 같습니다.

- 파일 이름 검증
- 확장자 검증
- 파일별 크기와 전체 크기 제한 검증
- 선택 파일을 데모 파일로 교체
- 본문의 data 이미지를 데모 이미지로 교체
- 지원하지 않는 이미지 주소 거부
- 정해진 형식의 첨부 정보 반환

티켓 생성·수정·액션 명령은 업무 동작을 담당합니다. 첨부 준비 로직을 중복해서
구현하면 안 됩니다.

---

## Metadata Contract

현재 저장하는 첨부 정보의 형식은 다음과 같습니다.

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

### 필드 의미

- `originalName`: 브라우저 입력 또는 본문 이미지 레이블의 파일 이름
- `replacedName`: 앱이 보여주는 지정된 데모 파일 이름
- `extension`: 표준 형식으로 정리한 파일 확장자
- `size`: 원본 입력의 크기(바이트)
- `type`: 확인할 수 있는 경우 MIME 타입
- `demoUrl`: 지정된 `/files/demo-*` URL
- `replaced`: 현재 데모 교체 모델에서는 항상 `true`
- `reason`: 추적과 UI 설명에 사용하는 고정 교체 사유

첨부 정보에는 원본 바이트, 로컬 파일 경로, 실제 저장소의 객체 키를 넣지 않습니다.

---

## 지원 유형과 제한

현재 demo boundary가 지원하는 확장자는 다음과 같습니다.

```txt
jpg, jpeg, png, gif, webp,
txt, log, csv, json,
xlsx, docx, pptx, pdf,
zip, 7z
```

현재 제한은 다음과 같습니다.

- 선택 파일 최대 개수: 10
- 선택 파일 1개 최대 크기: 10 MB
- 선택 파일 전체 최대 크기: 50 MB
- inline image 최대 개수: 20
- inline image 1개 최대 크기: 5 MB
- inline image 전체 최대 크기: 20 MB
- file name 최대 길이: 200자

이 제한은 현재 데모의 상수입니다. Tenant별 첨부 정책은 현재 구현 범위에 포함하지 않습니다.

---

## 선택 파일 Preparation

선택 파일은 다음 과정으로 준비합니다.

```txt
File
-> validate name, extension, and size
-> choose controlled demo URL by extension
-> return TicketAttachmentMetadata
```

이미지 선택 파일은 prepared `images` 배열로 반환됩니다. 그 외 선택 파일은
prepared `files` 배열로 반환됩니다.

원본 `File` 객체는 티켓 저장 단계로 전달하지 않습니다.

---

## Rich-Text 이미지 Preparation

Rich-text body preparation은 다음 과정을 따릅니다.

```txt
HTML body
-> find inline data images
-> validate image type and size
-> replace source with controlled demo URL
-> return prepared body and image metadata
```

티켓에는 준비된 본문을 저장합니다. 이 값에 base64 이미지 데이터를 포함하면 안 됩니다.

---

## 티켓 저장

티켓은 준비된 첨부 정보를 파일 필드와 이미지 필드로 나누어 저장합니다.

```txt
tk_content -> prepared body
tk_files   -> TicketAttachmentMetadata[]
tk_images  -> TicketAttachmentMetadata[]
```

Ticket DTO에서도 애플리케이션이 이 구분을 그대로 사용할 수 있습니다.

```ts
type TicketAttachmentFields = {
  files: TicketAttachmentMetadata[];
  images: TicketAttachmentMetadata[];
};
```

파일 첨부와 본문 이미지를 구분해 표시하면서 같은 첨부 정보 형식을 사용합니다.

---

## Create와 Update 통합

티켓 생성과 요청자 수정은 최종 티켓 변경 요청 전에 준비 API를 호출합니다.

```txt
form values
-> prepare attachments
-> toTicketMutateRequestPayloadFromFormValues(...)
-> POST or PUT ticket endpoint
```

최종 ticket mutation payload에는 다음이 포함됩니다.

- prepared body
- prepared `files`
- prepared `images`
- category, due date, priority, risk, email 같은 일반 ticket field

티켓 변경 스키마는 서버가 티켓을 저장하기 전에 준비된 첨부 정보의 형식을 다시 검증합니다.

---

## Requester Update 통합

요청자 수정에서는 기존 첨부 정보를 유지하면서 새 파일이나 본문 이미지를 추가할 수 있습니다.

```txt
existing attachments
+ newly prepared attachments
-> requester update payload
-> ticket update service
-> history comparison
```

요청자 수정 계층은 기존 첨부 정보와 새 준비 결과를 병합합니다. 서버는 최종 요청
데이터를 검증합니다.

---

## Ticket Action 통합

티켓 액션 폼은 의사소통이나 운영자 업무에 필요한 본문과 첨부파일을 포함할 수 있습니다.

첨부 입력을 지원하는 액션 도구는 요청 데이터를 만들기 전에 본문과 파일을 준비합니다.
승인만 처리하는 액션은 첨부 준비가 필요하지 않습니다.

첨부 준비 자체는 액션 이벤트가 아닙니다. 티켓 명령이 성공한 경우에만 이력을 생성합니다.

---

## Draft 통합

현재 초안은 첨부파일 바이너리나 준비된 첨부 정보의 복구를 보장하지 않습니다.

티켓 생성 초안의 보조 함수는 브라우저 원본 파일을 계속 보관하지 않도록 폼 내용을
저장할 때 첨부 입력을 비웁니다.

```txt
draft save
-> require selected category
-> keep request fields
-> prepare inline body images
-> clear transient attachment input
-> final submit prepares current attachment input
```

LOCAL 초안 복구는 기능 초안 저장소를 통해 브라우저 `localStorage`에 저장되며
초안 Route Handler를 호출하지 않습니다. REMOTE 초안은 초안 경로와 server DTO
경계를 거쳐 PostgreSQL 티켓 행에 저장됩니다. 두 runtime 모두 저장 전에 Category를
선택해야 합니다. Prepare된 inline image는 본문의 controlled URL을 통해 복구되지만,
선택한 raw `File` 객체는 reload 후 복구되지 않습니다. Data/blob source는 persistence
boundary에서 거부합니다. 이미지만 있는 본문도 의미 있는 내용으로 인정하며, 빈 editor
markup은 REMOTE draft에서 NULL로 저장하고 form에는 빈 문자열로 복구합니다.

이는 현재 범위의 의도된 제약입니다. 브라우저 `File` 객체는 새로고침 후 안전하게
복원할 수 없고, 운영 환경용 첨부 저장소도 구현하지 않았기 때문입니다.

---

## LOCAL과 REMOTE 런타임

LOCAL과 REMOTE는 UI에 같은 첨부 정보 형식과 동작을 제공합니다.

```txt
LOCAL  -> controlled demo replacement
REMOTE -> controlled demo replacement plus ticket row persistence
```

REMOTE가 PostgreSQL에 저장하는 것은 실제 파일의 바이너리가 아니라 지정된 데모
파일을 가리키는 첨부 정보입니다.

UI는 선택한 파일을 데모 파일로 교체한다는 점을 설명해야 합니다.

---

## UI 동작

Attachment UI는 다음을 보여주어야 합니다.

- 선택 파일 이름
- file count와 total size feedback
- validation message
- ticket detail의 prepared attachment display
- REMOTE mode에서도 demo replacement를 사용한다는 명확한 notice

Ticket detail은 shared attachment display component를 통해 prepared metadata를
렌더링합니다. Display component는 user-facing label로 `originalName`을 사용하고,
controlled link target으로 `demoUrl`을 사용해야 합니다.

---

## 검증

### Client Validation

Client validation은 prepare request 전에 feedback을 개선합니다.

검사할 수 있는 항목은 다음과 같습니다.

- file count
- file size
- accepted extension
- required content

### Server Validation

첨부 검증의 최종 판단은 서버의 준비 API가 수행합니다.

검증 항목은 다음과 같습니다.

- file name 존재와 길이
- extension allow-list
- single-file size
- total selected-file size
- inline image count
- inline image size
- total inline image size
- unsafe image source

### Ticket Write Validation

티켓 저장 스키마는 저장할 첨부 정보가 준비 API의 예상 형식과 일치하는지 검증합니다.

---

## State Management

React Hook Form은 폼이 열려 있는 동안 미저장 파일 입력을 관리합니다.

React Query는 저장된 티켓과 서버에 저장된 초안 상태를 관리합니다.

Zustand를 첨부 정보의 기준 저장소로 사용하면 안 됩니다. 첨부와 무관한 기능 간 공유
UI 상태에는 사용할 수 있지만, 원본 파일이나 저장된 첨부 정보는 관리하지 않습니다.

---

## History와 Notification

첨부 준비만으로는 티켓 이력을 생성하거나 알림을 발송하지 않습니다.

이력은 성공한 티켓 명령에서 기록합니다. 이 명령은 알림을 연결하도록 설계한
지점이기도 하지만, 실제 알림 전달은 구현 범위 밖입니다.

- prepared attachment가 포함된 ticket create
- attachment를 변경하는 requester update
- prepared attachment가 포함된 ticket action

이력은 `replacedName`, `demoUrl`, `originalName`, `size`처럼 같은 입력에 같은 값을
갖는 필드로 준비된 첨부 정보를 비교해야 합니다.

---

## 보안 경계

현재 보안 방향은 보수적입니다.

- raw browser `File` 객체를 저장하지 않습니다.
- base64 image payload를 저장하지 않습니다.
- arbitrary remote image URL을 허용하지 않습니다.
- local filesystem path를 저장하지 않습니다.
- 클라이언트가 trusted metadata를 만들어내게 하지 않습니다.
- demo replacement를 durable storage로 설명하지 않습니다.

이 방식은 데모 파일 교체를 실제 파일 저장으로 오해하지 않게 하며, 향후 객체
저장소가 담당할 역할을 명확하게 남깁니다.

---

## Future Object Storage 확장

향후 운영 환경용 첨부 기능은 내부 준비 처리를 객체 저장소와 연결하는 방식으로
교체할 수 있습니다.

향후 요구사항은 다음과 같습니다.

- authenticated upload session
- server-issued object key
- virus and content scanning
- per-tenant limits
- download authorization checks
- deletion and retention policy
- signed URL 또는 proxy download behavior
- demo metadata에서 storage metadata로의 migration

같은 표시 모델에 실제 저장소의 URL이나 객체 키를 추가한다면 UI가 사용하는 데이터
형식은 현재와 비슷하게 유지할 수 있습니다.

---

## 피하는 Anti-Patterns

### Raw Files 저장

`File[]`은 ticket DTO, React Query cache, Zustand, server row에 저장하면 안
됩니다.

### Base64 Images 저장

Inline data image는 크고 안전하지 않을 수 있습니다. 반드시 prepare하고 replace해야
합니다.

### Client Metadata 신뢰

클라이언트는 input을 보낼 수 있지만, 신뢰 가능한 prepared metadata는 서버가
생성해야 합니다.

### Ticket Command에 Attachment Infrastructure 혼합

Ticket command는 prepared value를 소비해야 합니다. File replacement, extension
validation, inline image parsing을 구현하면 안 됩니다.

### Production Upload 지원처럼 설명

현재 시스템은 controlled demo replacement를 사용합니다. Production object storage를
제공하지 않습니다.

---

## Testing Strategy

Attachment test는 다음을 다뤄야 합니다.

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

- [티켓 폼 설계](ticket-form.md)
- [티켓 모델](../../03-domain/service-desk/ticket/ticket-model.md)
- [티켓 액션 모델](../../03-domain/service-desk/ticket/ticket-action.md)
- [티켓 이력](../../03-domain/service-desk/ticket/ticket-history.md)
- [데이터베이스 전략](../../02-architecture/database-strategy.md)
- [티켓 첨부파일 경계 (2026-06)](../../06-decisions/2026-06-ticket-attachment-boundary.md)
- [티켓 폼 및 초안 워크플로 (2026-06)](../../06-decisions/2026-06-ticket-form-and-draft-workflow.md)
- [티켓 라우팅 및 업데이트 정책 (2026-07)](../../06-decisions/2026-07-ticket-routing-and-update-policy.md)

---

## 요약

티켓 첨부는 별도의 준비 API로 처리합니다.

브라우저 원본 파일은 임시로 보관합니다. 준비 API는 선택 파일과 본문 이미지를
검증하고 지정된 데모 파일로 교체한 뒤 첨부 정보를 반환합니다. 티켓 생성,
요청자 수정, 첨부를 지원하는 액션은 준비된 본문, `files`, `images`만 저장합니다.

초안은 현재 첨부파일 복구를 보장하지 않습니다. 운영 환경용 객체 저장소는 현재 구현
범위에서 제외하며, UI는 첨부 동작을 데모 파일 교체로 설명해야 합니다.
