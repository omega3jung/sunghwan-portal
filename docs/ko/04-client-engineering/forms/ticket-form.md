# 티켓 폼 설계

## 목표

티켓 폼은 Service Desk 티켓 생성과 요청자 수정을 위한 입력을 수집합니다.
업무 규칙 적용과 상태 변경은 서버에서 수행합니다.

현재 구현 기준:

- `CreateTicketDialog`는 신규 티켓 제출과 초안 복구를 담당합니다.
- `UpdateTicketDialog`는 작업 시작 전 요청자 수정을 담당합니다.
- React Hook Form은 다이얼로그가 열려 있는 동안의 미저장 입력을 소유합니다.
- Attachment Prepare API가 브라우저 파일과 본문 이미지를 검증하고 첨부 정보를 반환합니다.
- 티켓 서비스가 승인, 작업자 배정, 담당자 결정, 이력 기록을 처리합니다.

---

## 핵심 원칙

```txt
폼은 의도를 수집한다.
티켓 워크플로는 서버가 실행한다.
```

폼은 기본값을 보여주고 입력을 검증할 수 있지만, 최종 승인자 결정,
작업자 배정과 이력 기록 규칙은 서버가 담당합니다.

---

## 현재 폼 표면

### 티켓 생성

티켓 생성·수정·상세 화면은 다음처럼 역할을 나눕니다. `CreateTicketDialog`는
요청자가 티켓을 생성하는 화면입니다.

지원 항목:

- 다단계 입력
- 카테고리, 제목, 본문, 기한, 우선순위, 위험도, 이메일, 첨부 입력
- 초안 조회와 닫기 시 저장
- 최종 생성 전 첨부 준비
- 티켓 생성 요청 실행

### 티켓 수정

`UpdateTicketDialog`는 요청자 소유 티켓의 수정 워크플로입니다.

지원 항목:

- 열릴 때 최신 티켓 상세 로드
- 기존 준비된 `files`와 `images` 유지
- 새로 선택한 파일과 본문 이미지 준비
- 기존 첨부 정보와 새로 준비한 첨부 정보 병합
- 요청자 수정 API 호출

### 티켓 상세

티켓 상세는 폼 다이얼로그가 아니라 페이지 수준 워크플로입니다.

```txt
/service-desk/[ticketId]
```

---

## 단계 설계

현재 단계 식별자는 다음과 같습니다.

```txt
issueDetails
attachments
review
```

| 단계 | 책임 |
| --- | --- |
| `issueDetails` | 카테고리, 제목, 본문, 기한, 우선순위, 위험도, 이메일 |
| `attachments` | 선택 파일과 서식 있는 본문의 이미지 입력 |
| `review` | 최종 제출 전 검토 |

현재 구현에는 카테고리만 선택하는 별도 단계나 전역 공통 단계 전환 컴포넌트가 없습니다.

---

## 스키마와 검증

폼은 Zod와 React Hook Form으로 검증합니다.

주요 필드:

```ts
type TicketFormValues = {
  id?: string;
  category: string;
  subject: string;
  body: string;
  dueAt: Date;
  priority: Priority;
  riskLevel: RiskLevel;
  email: string[];
  requester: string;
  attachment: File[];
};
```

주요 규칙:

- `subject`는 200자 제한입니다.
- `dueAt`은 오늘 이후여야 합니다.
- `attachment`는 준비 전까지 브라우저 `File[]`입니다.
- 최종 티켓 변경 요청에서는 준비된 첨부 정보를 다시 검증합니다.

---

## 카테고리 기본값

카테고리를 선택하면 다음 기본값을 적용할 수 있습니다.

- 우선순위
- 위험도
- 카테고리 SLA 일수에 따른 완료 예정일

UI는 사용성을 위해 기본값을 적용할 수 있습니다. 서버는 카테고리 유효성과
승인자 결정·작업자 배정 동작의 최종 판단을 수행합니다.

---

## 첨부 준비

브라우저 파일 입력은 임시 상태입니다.

```txt
form body and File[]
-> POST /api/service-desk/tickets/attachments/prepare
-> prepared body, files, images
-> ticket create/update payload
```

티켓 저장 명령에는 준비된 본문과 첨부 정보만 전달합니다. 원본 `File`은 전달하지
않으며, 현재 준비 API는 실제 파일 저장소 대신 지정된 데모 파일을 사용합니다.

자세한 내용은 [`ticket-attachment.md`](ticket-attachment.md)를 참고합니다.

---

## Draft 워크플로

현재 초안 모델은 LOCAL과 REMOTE를 모두 지원합니다.

유효한 카테고리를 선택한 뒤에만 저장할 수 있습니다. 카테고리가 없으면 변경 내용은
React Hook Form의 미저장 상태로만 남으며, 초안 API 요청이나 `localStorage`
쓰기를 수행하지 않습니다. 처음 닫으려 하면 편집기를 열어 둔 채 카테고리를 선택하거나
다시 닫아 저장 없이 종료하도록 안내합니다. 다음 닫기 시도에서는 이전 초안을
변경하지 않고 미저장 입력을 버립니다. 경고는 다이얼로그를 열 때마다 초기화합니다.
카테고리만 있어도 저장할 수 있으며, `subject`와 `body`는 아직 완성되지 않아도 됩니다.

### LOCAL Draft

LOCAL 초안은 브라우저 로컬 복구 상태입니다. 기능 초안 저장소는 현재 데모 사용자에
연결된 하나의 `localStorage` 레코드를 읽고 쓰며, 소유자가 다른 레코드는 제거합니다.
생성 워크플로에서 사용하는 동일한 기능 hook을 통해 결과를 노출합니다. React Query가
결과를 캐시할 수 있지만 캐시나 server-side LOCAL handler가 이 상태를 소유하지
않습니다. LOCAL 초안 작업은 초안 Route Handler를 호출하지 않으며 REMOTE PostgreSQL
초안 모델과 영속성 측면에서 동등하지 않습니다.

### REMOTE Draft

REMOTE 초안은 DB의 `Draft` 상태 티켓 행이며, 요청자당 활성 초안 하나를 유지합니다.

`tk_category_id`는 NOT NULL을 유지하며, 기존 Category FK와 tenant trigger가 draft의
도메인 식별 관계를 결정합니다. 빈 제목이나 공백뿐인 제목, `<p></p>`처럼 의미상 비어
있는 본문은 SQL NULL로 저장합니다. Draft mapper는 이를 빈 문자열로 반환하여 public
DTO와 폼의 데이터 형식을 유지합니다. 제목만 수정하면 카테고리와 NULL 본문은
유지합니다. 서버는 초안 저장 전에 사용할 수 없는 카테고리를 거부합니다.

```txt
create dialog open
-> active draft load
-> edit form
-> close while dirty
-> Category 선택 필요 (없으면 한 번 경고한 뒤 저장 없이 닫기 허용)
-> save draft
-> reopen and recover values
-> final submit reuses draft ticket row
```

초안은 폼 데이터 복구에 초점을 두며, 첨부 복구는 보장하지 않습니다.

- 브라우저 `File` 객체는 새로고침 이후 복구할 수 없습니다.
- 초안을 저장할 때 임시 첨부 입력을 비웁니다.
- 본문 이미지는 저장 전에 준비하고 지정된 URL을 통해 복구합니다.
  data/blob 이미지 주소는 저장 단계에서 허용하지 않습니다.
- 최종 제출 시 현재 첨부 입력을 준비합니다.
- 운영 환경용 객체 저장소는 현재 구현 범위에서 제외합니다.

---

## 생성 제출

```txt
validate form
-> prepare attachments
-> map to ticket payload
-> create or submit existing draft
-> server resolves approval/work assignment
-> invalidate ticket and draft queries
```

HTTP 스키마와 서버 생성 서비스는 모두 불완전한 제출을 거부합니다. 카테고리는
유효하고 실제로 사용 가능해야 합니다. `subject`는 공백뿐이어서는 안 되며, `body`에는
의미 있는 텍스트나 본문 이미지가 있어야 합니다. 빈 서식 태그와 공백은 내용으로
인정하지 않습니다. 이 검증은 초안 행을 제출 상태로 전환하거나 이력을 생성하기 전에
수행합니다. 기존 SLA, 첨부 준비, 담당자 결정, 트랜잭션, 소유권 검증도 그대로
적용합니다. 유효한 제출은 초안의 null 허용 필드를 완성된 문자열로 덮어쓰며 같은
행을 재사용합니다.

서버는 제출된 티켓을 다음 중 하나로 이동시킵니다.

- 승인 단계가 필요하면 `Approval`
- 바로 작업 할당되면 `Assigned`

생성은 `TICKET_SUBMITTED`, `APPROVAL_REQUESTED`,
`ASSIGNMENT_RESOLVED` 같은 이벤트 단위 이력을 기록합니다.

---

## 요청자 수정 제출

요청자 수정은 작업 시작 전 상태에서만 허용됩니다.

```txt
Approval
Assigned
```

요청자는 티켓 소유자여야 합니다.

Update flow:

```txt
load latest ticket detail
-> keep existing prepared attachments
-> prepare new body/files/images
-> merge prepared metadata
-> submit requester update
-> server decides routing reset or preservation
```

담당자 결정을 바꿀 수 있는 필드:

- category
- subject
- content/body
- files
- images

담당자 결정을 유지하는 필드:

- due date
- email recipients

담당자 결정을 바꿀 수 있는 필드가 변경되면 서버는 `ROUTING_RESET`을 기록하고
승인자·작업자를 다시 결정합니다. 담당자 결정에 영향을 주지 않는 필드만 변경되면
`ROUTING_PRESERVED`를 기록합니다.

카테고리가 변경되면 카테고리 기본값으로 우선순위, 위험도, 최소 완료 예정일도 다시
평가합니다. 최종 완료 예정일은 현재 완료 예정일, 제출한 완료 예정일, 새 카테고리의
최소 완료 예정일 중 가장 늦은 값입니다. 더 늦게 제출한 날짜는 유지하며 카테고리
변경으로 완료 예정일을 앞당기지 않습니다.

---

## 상태 소유권

| 상태 | 소유자 |
| --- | --- |
| 미저장 필드 입력 | React Hook Form |
| 현재 폼 단계 | component state |
| persisted ticket data | React Query |
| REMOTE active draft data | React Query와 draft API, PostgreSQL 티켓 행 |
| LOCAL draft recovery | 기능 초안 저장소와 브라우저 `localStorage` |
| raw browser files | 열린 폼의 React Hook Form |
| prepared attachment metadata | API payload와 persisted ticket data |

Zustand는 폼 입력, 초안, 첨부 정보를 관리하는 기준 저장소가 아닙니다.

---

## Reset and Close Policy

Create 또는 update 성공 시:

- dialog를 닫습니다.
- form state를 reset합니다.
- 영향받은 ticket query를 invalidate합니다.
- 필요한 경우 제출한 draft를 clear 또는 remove합니다.

Dirty input이 있는 create dialog를 닫을 때:

- draft behavior가 활성화되어 있으면 draft를 저장합니다.
- 현재 dialog behavior에 따라 경고하거나 미저장 intent를 보존합니다.
- attachment recovery를 보장하지 않습니다.

---

## 안티패턴

### Generic `TicketFormDialog`

현재 구현은 생성·수정·조회 전체를 하나의 공통 `TicketFormDialog`에 넣지 않습니다.
생성과 수정은 필드를 공유해도 초안, 제출, 초기화, 담당자 결정 동작이 다릅니다.

### Raw File Persistence

Raw browser file은 ticket row, React Query cache, draft DTO, global state에 저장하지 않습니다.

### Client-Side Routing Decision

클라이언트는 경고와 기본값을 표시할 수 있지만, 승인 초기화, 작업자 배정, 담당자
결정 이력은 서버가 처리합니다.

### Silent Requester Updates

Routing-sensitive field에 영향을 주는 requester update는 history event를 통해 추적할
수 있어야 합니다.

---

## 관련 문서

- [티켓 첨부파일 설계](ticket-attachment.md)
- [티켓 모델](../../03-domain/service-desk/ticket/ticket-model.md)
- [티켓 생명주기](../../03-domain/service-desk/ticket/ticket-lifecycle.md)
- [티켓 이력](../../03-domain/service-desk/ticket/ticket-history.md)
- [티켓 폼 및 초안 워크플로 (2026-06)](../../06-decisions/2026-06-ticket-form-and-draft-workflow.md)
- [티켓 라우팅 및 업데이트 정책 (2026-07)](../../06-decisions/2026-07-ticket-routing-and-update-policy.md)

---

## 요약

티켓 폼은 입력을 수집해 서버의 업무 처리를 시작합니다. 현재 설계는
`CreateTicketDialog`, `UpdateTicketDialog`, 브라우저 로컬 LOCAL 초안 복구,
티켓 초안 API를 통한 REMOTE 초안 복구, 영속화 전 첨부파일 준비, 서버 소유의
요청자 수정 시 담당자 결정을 사용합니다. 이 역할 구분으로 UI 사용성을 유지하면서
승인, 배정, 상태, 이력의 판단 기준은 티켓 서비스에 둡니다.
