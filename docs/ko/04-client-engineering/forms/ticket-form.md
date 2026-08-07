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

```txt
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

```txt
/service-desk/[ticketId]
```

---

## 단계 설계

현재 단계 식별자는 다음과 같다.

```txt
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

```txt
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

LOCAL 초안은 브라우저 로컬 복구 상태다. 기능 초안 저장소는 현재 데모 사용자에
연결된 하나의 `localStorage` 레코드를 읽고 쓰며, 소유자가 다른 레코드는 제거한다.
생성 워크플로에서 사용하는 동일한 기능 hook을 통해 결과를 노출한다. React Query가
결과를 캐시할 수 있지만 캐시나 server-side LOCAL handler가 이 상태를 소유하지
않는다. LOCAL 초안 작업은 초안 Route Handler를 호출하지 않으며 REMOTE PostgreSQL
초안 모델과 영속성 측면에서 동등하지 않다.

### REMOTE Draft

REMOTE draft는 `Draft` 상태의 티켓 row이며, 요청자당 하나의 active draft를
가진다.

```txt
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

```txt
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

```txt
Approval
Assigned
```

요청자는 티켓 소유자여야 한다.

Update flow:

```txt
load latest ticket detail
-> keep existing prepared attachments
-> prepare new body/files/images
-> merge prepared metadata
-> submit requester update
-> server decides routing reset or preservation
```

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
| REMOTE active draft data | React Query와 draft API, PostgreSQL 티켓 행 |
| LOCAL draft recovery | 기능 초안 저장소와 브라우저 `localStorage` |
| raw browser files | 열린 폼의 React Hook Form |
| prepared attachment metadata | API payload와 persisted ticket data |

Zustand는 form input, draft, attachment metadata의 source of truth가 아니다.

---

## Reset and Close Policy

Create 또는 update 성공 시:

- dialog를 닫는다.
- form state를 reset한다.
- 영향받은 ticket query를 invalidate한다.
- 필요한 경우 제출한 draft를 clear 또는 remove한다.

Dirty input이 있는 create dialog를 닫을 때:

- draft behavior가 활성화되어 있으면 draft를 저장한다.
- 현재 dialog behavior에 따라 경고하거나 미저장 intent를 보존한다.
- attachment recovery를 보장하지 않는다.

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

### Silent Requester Updates

Routing-sensitive field에 영향을 주는 requester update는 history event를 통해 추적할
수 있어야 한다.

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

티켓 폼은 워크플로 권위자가 아니라 워크플로 진입점이다. 현재 설계는
`CreateTicketDialog`, `UpdateTicketDialog`, 브라우저 로컬 LOCAL 초안 복구,
티켓 초안 API를 통한 REMOTE 초안 복구, 영속화 전 첨부파일 준비, 서버 소유의
요청자 업데이트 라우팅을 사용한다. 이를 통해 UI 사용성을 유지하면서도 승인,
할당, 상태, 이력의 source of truth는 티켓 서비스에 둔다.
