# 티켓 폼 설계

## 목표

티켓 폼은 Service Desk 티켓 생성과 요청자 수정을 위한 입력을 수집한다.
워크플로 결정은 폼이 아니라 서버 경계에서 수행한다.

현재 구현 기준:

- `CreateTicketDialog`는 신규 티켓 제출과 draft 복구를 담당한다.
- `UpdateTicketDialog`는 작업 시작 전 요청자 수정을 담당한다.
- React Hook Form은 다이얼로그가 열려 있는 동안의 미저장 입력을 소유한다.
- Attachment Prepare API가 브라우저 파일과 본문 이미지를 준비된 metadata로 변환한다.
- 티켓 서비스가 승인, 할당, 라우팅, 이력을 결정한다.

---

## 핵심 원칙

```txt id="ticket-form-core"
폼은 의도를 수집한다.
티켓 워크플로는 서버가 실행한다.
```

폼은 기본값을 보여주고 입력을 검증할 수 있지만 최종 승인 라우팅,
작업 할당, 이력 의미를 결정하지 않는다.

---

## 현재 폼 표면

### 티켓 생성

`CreateTicketDialog`는 요청자용 생성 워크플로다.

지원 항목:

- 다단계 입력
- 카테고리, 제목, 본문, 기한, 우선순위, 위험도, 이메일, 첨부 입력
- draft 로드와 닫기 시 저장
- 최종 생성 전 첨부 준비
- ticket create mutation 실행

### 티켓 수정

`UpdateTicketDialog`는 요청자 소유 티켓의 수정 워크플로다.

지원 항목:

- 열릴 때 최신 티켓 상세 로드
- 기존 준비된 `files`와 `images` 유지
- 새로 선택한 파일과 본문 이미지 준비
- 기존 첨부 metadata와 신규 준비 metadata 병합
- requester update API 호출

### 티켓 상세

티켓 상세는 폼 다이얼로그가 아니라 페이지 수준 워크플로다.

```txt id="ticket-detail-route"
/service-desk/[ticketId]
```

---

## 단계 설계

현재 단계 식별자는 다음과 같다.

```txt id="ticket-form-steps"
issueDetails
attachments
review
```

| 단계 | 책임 |
| --- | --- |
| `issueDetails` | 카테고리, 제목, 본문, 기한, 우선순위, 위험도, 이메일 |
| `attachments` | 선택 파일과 rich-text 이미지 입력 |
| `review` | 최종 제출 전 검토 |

현재 구현은 별도 category-only 단계나 전역 generic stepper를 사용하지 않는다.

---

## 스키마와 검증

폼은 Zod와 React Hook Form으로 검증한다.

주요 필드:

```ts id="ticket-form-fields"
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

- `subject`는 200자 제한이다.
- `dueAt`은 오늘 이후여야 한다.
- `attachment`는 prepare 전까지 브라우저 `File[]`이다.
- 최종 ticket mutation은 준비된 첨부 metadata를 다시 검증한다.

---

## 카테고리 기본값

카테고리 선택은 다음 기본값을 seed할 수 있다.

- priority
- risk level
- category SLA days 기반 due date

UI는 사용성을 위해 기본값을 적용할 수 있다. 서버는 카테고리 유효성과
라우팅 동작의 최종 기준이다.

---

## 첨부 준비

브라우저 파일 입력은 임시 상태다.

```txt id="ticket-form-attachment-flow"
form body and File[]
-> POST /api/service-desk/tickets/attachments/prepare
-> prepared body, files, images
-> ticket create/update payload
```

티켓 쓰기 명령에는 raw `File`이 아니라 준비된 본문과 첨부 metadata만 전달한다.

자세한 내용은 [`ticket-attachment.md`](ticket-attachment.md)를 참고한다.

---

## Draft 워크플로

현재 draft model은 LOCAL과 REMOTE behavior를 모두 지원한다.

### LOCAL Draft

LOCAL draft는 feature API boundary 뒤의 simplified demo-safe 구현을 사용한다.
REMOTE PostgreSQL draft model과 persistence-equivalent하지 않다. 현재 LOCAL
구현은 demo convenience를 위해 제한적인 client-side recovery를 사용할 수 있지만,
그 recovery가 durable state boundary는 아니다.

### REMOTE Draft

REMOTE draft는 `Draft` 상태의 티켓 row이며, 요청자당 하나의 active draft를
가진다.

```txt id="remote-draft-flow"
create dialog open
-> active draft load
-> edit form
-> close while dirty
-> save draft
-> reopen and recover values
-> final submit reuses draft ticket row
```

Draft는 폼 데이터 중심 복구다. 첨부 복구를 보장하지 않는다.

- 브라우저 `File` 객체는 reload 이후 복구할 수 없다.
- draft save는 transient attachment input을 비운다.
- 최종 제출 시 현재 첨부 입력을 prepare한다.
- production object storage는 미래 범위다.

---

## 생성 제출

```txt id="create-submission-flow"
validate form
-> prepare attachments
-> map to ticket payload
-> create or submit existing draft
-> server resolves approval/work assignment
-> invalidate ticket and draft queries
```

서버는 제출된 티켓을 다음 중 하나로 이동시킨다.

- 승인 단계가 필요하면 `Approval`
- 바로 작업 할당되면 `Assigned`

생성은 `TICKET_SUBMITTED`, `APPROVAL_REQUESTED`,
`ASSIGNMENT_RESOLVED` 같은 event-based history를 기록한다.

---

## 요청자 수정 제출

요청자 수정은 작업 시작 전 상태에서만 허용된다.

```txt id="requester-update-statuses"
Approval
Assigned
```

요청자는 티켓 소유자여야 한다.

Routing-sensitive fields:

- category
- subject
- content/body
- files
- images

Routing-neutral fields:

- due date
- email recipients

라우팅 민감 필드가 바뀌면 서버는 `ROUTING_RESET`을 기록하고 승인/할당을
재평가한다. 라우팅 중립 필드만 바뀌면 `ROUTING_PRESERVED`를 기록한다.

Category가 변경되면 category default도 priority, risk, minimum due date를 다시
평가한다. 현재 due date가 새 category minimum보다 늦으면 그대로 유지하고, 더
이르면 해당 minimum까지 되돌린다.

---

## 상태 소유권

| 상태 | 소유자 |
| --- | --- |
| 미저장 필드 입력 | React Hook Form |
| 현재 폼 단계 | component state |
| persisted ticket data | React Query |
| active draft data | React Query와 draft API |
| raw browser files | 열린 폼의 React Hook Form |
| prepared attachment metadata | API payload와 persisted ticket data |

Zustand는 form input, draft, attachment metadata의 source of truth가 아니다.

---

## 안티패턴

### Generic `TicketFormDialog`

현재 구현은 하나의 generic `TicketFormDialog`에 create/update/view를 모두 넣지
않는다. 생성과 수정은 필드를 공유해도 draft, submit, reset, routing 동작이 다르다.

### Raw File Persistence

Raw browser file은 ticket row, React Query cache, draft DTO, global state에 저장하지 않는다.

### Client-Side Routing Decision

클라이언트는 경고와 기본값을 표시할 수 있지만 승인 reset, assignment resolution,
routing history의 권위자는 서버다.

---

## 관련 문서

- [`ticket-attachment.md`](ticket-attachment.md)
- [`../03-domain/ticket/ticket-model.md`](../03-domain/ticket/ticket-model.md)
- [`../03-domain/ticket/ticket-lifecycle.md`](../03-domain/ticket/ticket-lifecycle.md)
- [`../03-domain/ticket/ticket-history.md`](../03-domain/ticket/ticket-history.md)

---

## 요약

티켓 폼은 워크플로 권위자가 아니라 워크플로 진입점이다. 현재 설계는
`CreateTicketDialog`, `UpdateTicketDialog`, REMOTE draft, attachment preparation,
server-owned requester update routing을 기준으로 정렬된다.
