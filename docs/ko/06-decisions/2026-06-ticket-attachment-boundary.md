# 티켓 첨부파일 경계 (2026-06)

## 배경

Service Desk 티켓 폼은 두 종류의 첨부 입력을 받습니다.

- 브라우저 파일 입력에서 선택한 파일
- 서식 있는 본문(rich text)에 삽입한 이미지

사용자가 폼을 편집하는 동안 브라우저는 다음 값을 임시로 보관할 수 있습니다.

- `File`
- `File[]`
- base64 data URL
- blob URL
- base64 이미지를 포함한 서식 있는 본문 HTML

이 값들은 편집과 미리보기에 유용하지만, 티켓에 그대로 저장하기에는 적합하지 않습니다.

REMOTE의 티켓 생성, 요청자 수정, 초안 처리를 PostgreSQL 기반으로 옮기면서
다음 두 종류의 값을 명확히 구분할 필요가 생겼습니다.

```txt
browser attachment input
and
persisted ticket attachment metadata
```

이 시점의 프로젝트에는 프로덕션용 객체 저장소가 구현되어 있지 않습니다.

의도적으로 제공하지 않는 항목은 다음과 같습니다.

- 영구 바이너리 객체 저장소
- 저장소 버킷의 수명주기 관리
- 서명된 URL을 통한 파일 전달
- 악성 코드 검사
- 업로드 세션 복구
- 참조가 끊긴 파일 정리

데모 파일 참조를 실제 프로덕션 저장소로 오해하게 하지 않으면서,
현실적인 첨부 처리 흐름은 보여줘야 합니다.

---

## 문제

### 1. Browser file object는 ticket data가 될 수 없음

폼에서는 브라우저 객체로 선택한 파일을 처리합니다.

```ts
type TicketFormValues = {
  attachment: File[];
};
```

`File` 객체는 브라우저 실행 중에만 사용하는 상태입니다.

이는 다음이 아닙니다.

- 일정한 DTO 형식
- DB에 저장할 JSON 값
- 서버 측 첨부 참조
- 지속적으로 보관할 티켓 상태에 안전한 값

`File` 객체를 티켓 DTO에 전달하면 폼 입력, 파일 전송, 파일 저장소 처리, 티켓 저장의 역할이 뒤섞입니다.

---

### 2. Base64와 blob URL은 임시 표현임

서식 있는 본문 편집기는 일시적으로 다음 값을 포함할 수 있습니다.

```html
<img src="data:image/png;base64,..." />
```

또는:

```txt
blob:https://example.com/...
```

Base64 본문을 저장하면 티켓 행에 바이너리 데이터까지 함께 저장하게 됩니다.
Blob URL은 현재 브라우저 실행 환경에만 속하므로 새로고침, 탭 닫기, URL 해제,
서버 렌더링 이후 사용할 수 없을 수 있습니다.

두 값 모두 PostgreSQL, LOCAL의 변경 가능한 상태, 액션 메타데이터,
이력 메타데이터에 저장하면 안 됩니다.

---

### 3. Ticket command가 file-processing infrastructure를 소유하면 안 됨

첨부 준비 처리를 분리하지 않으면 티켓 생성·수정 명령이 다음을 모두 처리해야 합니다.

- multipart 요청 파싱
- 선택한 파일 검증
- 서식 있는 본문에서 이미지 출처 확인
- 데모 또는 저장소 URL로 교체
- 티켓 입력 검증
- 승인자 결정과 작업자 배정
- 티켓 행 저장
- 이력 생성

그러면 티켓 명령이 첨부 처리 기반 기능과 업무 흐름을 모두 담당하게 됩니다.

```txt
Ticket command
!= file-processing pipeline
```

티켓 명령은 저장할 수 있는 형태로 준비된 입력을 받아야 합니다.

---

### 4. LOCAL과 REMOTE shape가 달라질 수 있음

LOCAL은 정적인 데모 파일 참조를 사용할 수 있고, 향후 REMOTE 구현은 객체 저장소를 사용할 수 있습니다.
두 실행 환경이 서로 다른 첨부 형식을 제공하면 기능 컴포넌트에 다음 분기가 필요해집니다.

```ts
if (dataScope === "LOCAL") {
  // render demo attachment
} else {
  // render remote attachment
}
```

UI에는 실행 환경에 따라 달라지지 않는 첨부 데이터 형식이 필요합니다.

---

### 5. Draft behavior에도 같은 persistence boundary가 필요함

초안에도 원본 파일, base64 이미지, blob URL을 저장하면 안 됩니다.
초안과 제출된 티켓의 첨부 형식이 다르면 제출할 때 다시 변환해야 합니다.
이 차이는 초안 동작을 설명하기 어렵게 하고 오류 가능성도 높입니다.
초안과 제출된 티켓을 저장할 때 같은 방식으로 정리한 첨부 형식을 사용하도록 설계했습니다.

---

## 결정

최종 티켓 생성이나 요청자 수정 내용을 저장하기 전에,
서버에서 첨부파일을 준비하는 단계를 도입했습니다.

핵심 결정은 다음과 같습니다.

```txt
Raw attachment input is transient.

Only normalized attachment metadata may cross the final ticket persistence boundary.
```

최종 저장 흐름은 다음과 같습니다.

```txt
Form input
-> Attachment Prepare API
-> prepared body, files, and images
-> Ticket Create / Update API
-> ticket persistence
```

당시 준비 API는 LOCAL과 REMOTE 모두에서 첨부 입력을 허용된 데모 파일로 교체합니다.
Supabase Storage나 프로덕션 파일 저장소에 업로드하지 않습니다.

---

## 범위 규칙

### 1. Raw browser input은 transient로 유지함

폼은 일시적으로 다음 값을 보관할 수 있습니다.

- `File[]`
- base64 이미지 출처
- blob URL
- 편집기 미리보기

티켓에는 다음 값을 저장하면 안 됩니다.

- 원본 `File`
- 파일 바이너리
- base64 data URL
- blob URL
- 브라우저 객체 참조

---

### 2. 안정적인 Prepare API contract를 사용함

기능 API 클라이언트는 최종 티켓 저장 전에 첨부 입력을 준비 API로 보냅니다.

경로 구조는 바뀔 수 있지만 현재 첨부 준비를 담당하는 API는 다음과 같습니다.

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

`body`는 이미지 출처를 정리한 서식 있는 본문을 뜻합니다.
티켓 생성, 초안 제출, 요청자 수정 시에는 이렇게 준비한 본문과 메타데이터를
티켓 저장 API에 전달합니다.

---

### 3. Storage-client 값이 아니라 metadata를 저장함

현재 메타데이터 형식은 다음과 같습니다.

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

이 형식은 다음 특성을 가집니다.

- JSON으로 직렬화 가능
- 브라우저 실행 상태와 독립적
- 현재 티켓 DTO에 포함 가능
- LOCAL과 REMOTE에서 공통 사용 가능
- 데모 파일 교체임을 명시

티켓 모델은 저장소 SDK 객체나 저장소 제공자 전용 업로드 응답을 노출하면 안 됩니다.

---

### 4. Rich-text image를 persistence 전에 normalize함

준비 API는 서식 있는 본문 HTML의 이미지 출처를 검사합니다.

현재 지원하는 방향은 다음과 같습니다.

- 허용된 데모 파일 URL은 유지
- 지원하는 인라인 base64 이미지는 허용된 데모 URL로 교체
- blob 이미지 URL 거절
- 외부 이미지 URL 거절
- 로컬 파일 경로 거절
- 지원하지 않는 이미지 MIME 타입 거절

준비 후 본문에는 원래 삽입된 base64 이미지 데이터가 남아 있으면 안 됩니다.

```txt
Before prepare
<img src="data:image/png;base64,...">

After prepare
<img src="/files/demo-*.png">
```

이 처리는 데모용 시뮬레이션입니다. 프로덕션 이미지 저장소는 아닙니다.

---

### 5. Controlled file metadata를 생성함

선택한 파일은 클라이언트 폼 안에서만 `File[]`로 표현합니다.
준비 API는 허용된 파일을 다음 메타데이터로 변환합니다.

- 원래 표시 이름
- 교체한 데모 파일 이름
- 확장자
- 파일 크기
- MIME 타입
- 허용된 데모 URL
- 교체 이유

원래 파일명은 화면에 표시하기 위한 메타데이터입니다.

다음으로 취급하면 안 됩니다.

- 신뢰할 수 있는 저장소 키
- MIME 타입의 증명
- 안전한 파일시스템 경로
- 고유 식별자

향후 저장소를 구현할 때는 서버가 객체 키를 생성해야 합니다.

---

### 6. Normalized ticket value만 저장함

티켓 생성·요청자 수정의 저장 처리는 준비된 값만 받습니다.
티켓 행에는 다음 값을 저장할 수 있습니다.

```txt
tk_content
tk_files
tk_images
```

의미:

- `tk_content`는 준비한 서식 있는 본문을 저장합니다.
- `tk_files`는 JSON 파일 메타데이터를 저장합니다.
- `tk_images`는 JSON 이미지 메타데이터를 저장합니다.

Repository는 브라우저의 원본 첨부 입력을 저장하면 안 됩니다.

---

### 7. Draft와 submitted attachment contract를 정렬함

초안에도 원본 바이너리 데이터, base64 본문, blob URL을 저장하면 안 됩니다.
초안 티켓은 제출된 티켓과 같은 방식으로 정리한 첨부 형식을 사용해야 합니다.

따라서:

```txt
Draft attachment shape
=
Submitted ticket attachment shape
```

이렇게 하면 초안을 제출할 때 첨부 형식을 다시 변환할 필요가 없습니다.

새 첨부파일이 포함된 초안을 저장할 때도, 지속적으로 보관할 저장소에 쓰기 전에
같은 준비 과정을 거쳐야 합니다.

---

### 8. LOCAL과 REMOTE output을 compatible하게 유지함

UI는 첨부 URL의 생성 방식에 의존하지 않아야 합니다.

```txt
LOCAL
-> controlled static demo reference

REMOTE current scope
-> controlled replacement or future storage-backed reference behind the same DTO

REMOTE future implementation
-> object-storage-backed reference behind the same boundary
```

화면에서는 일정한 컴포넌트 입력 형식으로 첨부를 표시합니다.

```tsx
<TicketAttachmentList files={ticket.files} images={ticket.images} />
```

기능 컴포넌트는 다음에 따라 분기하지 않습니다.

- 데이터 범위
- 저장소 제공자
- 업로드 전략
- 데모 구현

---

### 9. Preparation을 trusted validation boundary로 취급함

클라이언트 검증은 사용자 경험을 개선하지만 서버 검증을 대신할 수 없습니다.
서버의 준비 처리는 다음을 검증하거나 정리합니다.

- 파일 개수
- 파일 크기
- 전체 크기
- 확장자
- 필요한 경우 MIME 타입
- 인라인 이미지 개수
- 인라인 이미지 크기
- 지원하지 않는 출처 스킴
- 허용된 데모 URL 생성

티켓 저장 API도 첨부 메타데이터가 기대하는 DTO 스키마에 맞는지 추가로 검증할 수 있습니다.

---

### 10. History와 notification은 ticket command에 묶음

첨부 준비 자체는 티켓 업무 흐름의 이벤트가 아닙니다.

첨부 준비만으로는 다음을 만들지 않습니다.

- Ticket Action
- Ticket History
- 상태 전이
- 알림

이력과 알림은 준비 결과를 사용하는 티켓 명령이 성공했을 때만 발생합니다.

---

## 정렬한 내용

### 1. Prepare API boundary

첨부 처리 흐름을 티켓 업무 명령에서 분리했습니다.

```txt
Feature client
-> Attachment Prepare Route Handler
-> attachment preparation service
-> prepared DTO
-> Ticket Create / Update Route Handler
```

이렇게 나누면 티켓 서비스는 티켓 상태와 업무 동작에 집중할 수 있습니다.

---

### 2. Ticket metadata shape

최종 티켓 DTO는 files와 images에 `TicketAttachmentMetadata[]`를 사용합니다.
준비된 선택 파일과 본문 이미지에는 같은 계열의 메타데이터를 사용합니다.

---

### 3. Demo storage 표현

문서와 UI 안내는 현재 동작을 허용된 데모 파일로 교체하는 처리로 설명해야 합니다.

다음을 암시하면 안 됩니다.

- 영구 업로드
- 비공개 객체 저장소
- 서명된 URL을 통한 다운로드
- 악성 코드 검사
- 프로덕션 보관 정책

---

## 결과 영향

### 긍정적 영향

- 티켓 API가 JSON으로 저장할 수 있는 첨부 메타데이터를 받습니다.
- 원본 바이너리, base64, blob 값이 PostgreSQL 티켓 데이터에 들어가지 않습니다.
- 첨부 처리를 승인자 결정·작업자 배정과 별도로 테스트할 수 있습니다.
- LOCAL과 REMOTE가 현재 같은 DTO 형식을 제공합니다.
- 향후 객체 저장소를 첨부 준비 처리 내부에 추가할 수 있습니다.
- 저장소의 제한을 명확히 설명해 포트폴리오의 신뢰성을 유지합니다.

---

### 부정적 영향 / 트레이드오프

- 티켓 제출 전에 첨부 준비 단계가 필요합니다.
- 기능 흐름에서 첨부 준비 실패와 티켓 저장 실패를 함께 처리해야 합니다.
- 현재 초안 첨부 복구는 의도적으로 제한되어 있습니다.
- 데모 URL은 프로덕션 파일 저장소가 아닙니다.
- 향후 실제 저장소에는 업로드 토큰, 정리, 보관, 접근 정책이 필요합니다.

---

## 후속 정책

- 원본 `File`, base64, blob 값을 저장된 티켓 상태에 두지 않습니다.
- 첨부 검증과 값 정리를 신뢰할 수 있게 수행하는 곳은 준비 API로 한정합니다.
- UI에서 사용할 `TicketAttachmentMetadata` 형식을 안정적으로 유지합니다.
- 데모 교체 URL을 프로덕션 저장소로 설명하지 않습니다.
- 객체 저장소를 추가해도 가능한 한 애플리케이션에 제공하는 준비 응답 형식을 유지합니다.
- 초안 업로드 복구가 제품 요구사항이 되면 초안 업로드·세션 정리 정책을 명시적으로 추가합니다.

---

## 요약

첨부 처리의 역할을 나눠 브라우저에서만 사용하는 입력을 티켓에 저장하지 않도록 합니다.

현재 모델은 다음과 같습니다.

```txt
File[] / inline base64 / blob URL
-> Prepare API
-> prepared body + TicketAttachmentMetadata
-> Ticket create or requester update
-> tk_content / tk_files / tk_images
```

LOCAL과 REMOTE는 UI에 같은 첨부 메타데이터 형식을 제공합니다.
현실적인 폼 입력 흐름을 보여주면서, 프로덕션 파일 저장소가 구현되어 있다는
잘못된 인상을 주지 않기 위한 결정입니다.
