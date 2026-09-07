# 티켓 모델

## 목표

이 문서는 현재 티켓 엔티티, DTO projection, 데이터 boundary 책임을 정의합니다.

개념 스케치가 아닙니다. 필드 이름과 모델 책임은 현재 domain type, DTO, mapper
동작과 맞춰져 있습니다.

---

## 핵심 개념

```txt
Ticket row = 현재 workflow state
Ticket DTO = application-facing projection
History = state가 어떻게 바뀌었는지에 대한 immutable record
```

티켓 row는 현재 상태를 저장합니다. 관련 subresource는 action, history,
work-session evidence를 저장합니다.

---

## 저장 상태

현재 status union:

```txt
Draft
Approval
Declined
Assigned
Working
Pending
Rejected
Resolved
Closed
```

`Open`, `Approved`, `Reopen`은 persisted status가 아닙니다. Ticket mapper는 오래된
row 값을 위한 compatibility normalization을 포함합니다.

- `Open`은 approval step 여부에 따라 `Approval` 또는 `Assigned`로 매핑됩니다.
- `Approved`는 `Assigned`로 매핑됩니다.
- `Reopen`은 `Working`으로 매핑됩니다.

새 설계 문서는 이러한 오래된 값을 현재 status처럼 설명하면 안 됩니다.

---

## 도메인 인터페이스

현재 domain read model은 `TicketSummary`와 `TicketDetail`입니다.

### Shared Core

```ts
type TicketBase = {
  id: string;
  ticketNumber: string;
  createdAt: ISODateString;
  updatedAt?: ISODateString;
  requesterUsername: string;
};

type TicketWorkflowState = {
  status: TicketStatus;
  priority: Priority;
  riskLevel: RiskLevel;
  closeReason?: TicketResolutionReason;
};
```

`TicketResolutionReason`에는 같은 scope 티켓 통합을 위한 `Merged`와,
`INTERNAL` source를 기존 `PORTAL` target으로 merge할 때 사용하는
`Escalated`가 포함됩니다. 두 경우 모두 merged-target 관계를 유지하며,
close reason으로 리포트와 화면 표시 의미를 구분합니다.

### Assignment Projection

```ts
type TicketAssignmentPhase = "APPROVAL" | "WORK";

type TicketAssignmentState = {
  assignmentPhase: TicketAssignmentPhase;
  approvalAssigneeUsernames: string[];
  workAssigneeUsernames: string[];
  assignedApprover: boolean;
  assignedWorker: boolean;
};
```

Persisted source of truth는 여전히 다음 필드입니다.

```txt
tk_approval_step_id
tk_assignee_usernames
```

Phase-aware field는 UI 명확성을 위한 DTO/domain projection입니다.

### Metrics and View State

```ts
type TicketMetrics = {
  workMinutes: number;
  lastCommentAt?: ISODateString;
  lastCommenterEmail?: string;
  lastUserActivityAt?: ISODateString;
  lastUserActivityEmail?: string;
  closedAt?: ISODateString;
};

type TicketViewState = {
  dueAt: ISODateString;
  owner: boolean;
  active: boolean;
};
```

`owner`, `assignedApprover`, `assignedWorker`는 현재 인증된 사용자를 기준으로
파생됩니다. 전역 persisted flag가 아닙니다.

### Detail Content

```ts
type TicketContent = {
  categoryId: string;
  approvalStepId: string | null;
  subject: string;
  content: string;
  email: {
    to: string[];
    cc: string[];
    bcc: string[];
  };
  files: TicketAttachmentMetadata[];
  images: TicketAttachmentMetadata[];
};
```

Ticket detail은 전체 content, email, files, images를 포함합니다. Ticket summary는
list/search에 최적화되어 있으며 전체 content나 attachment payload를 포함하지
않습니다.

---

## Database and DTO Boundary

REMOTE read path는 다음과 같습니다.

```txt
service_desk view/row
-> mapper
-> TicketListItemDto or TicketDetailDto
-> feature API mapper
-> domain model
```

Database row는 `tk_*`, `cat_*` 등 database-shaped field를 사용합니다. UI code는 raw
row column을 직접 소비하면 안 됩니다.

### DTO Assignment Fields

Ticket DTO는 다음 필드를 노출합니다.

- `assignment_phase`
- `approval_assignee_usernames`
- `work_assignee_usernames`
- `assigned_approver`
- `assigned_worker`
- `assignee_usernames`

`assignee_usernames`는 raw current assignee projection입니다. Phase-specific array는
해당 사용자가 approver인지 worker인지 명확히 합니다.

---

## Draft Identity

REMOTE draft는 ticket table을 사용합니다.

규칙:

- `status = Draft`
- requester당 active draft는 하나입니다.
- draft는 requester username으로 조회됩니다.
- submit은 draft row를 재사용하고 `Approval` 또는 `Assigned`로 변경합니다.
- draft row는 operational ticket list에서 제외됩니다.

LOCAL 초안 복구는 기능 초안 저장소가 소유하고 현재 데모 사용자 범위로 관리되는
브라우저 로컬 `localStorage` 상태입니다. 저장된 소유자가 effective user와 다르면
제거되고, 초안 Route Handler를 거치지 않으며, REMOTE PostgreSQL 초안 모델과
영속성 측면에서 동등하지 않습니다.

---

## Email Ownership

티켓의 `email`은 requester가 제공한 notification configuration입니다.

파생된 assignee email을 persisted `tk_email` 필드에 덧붙이면 안 됩니다.
Notification delivery는 전송 시점에 assignee email을 resolve해야 합니다.

---

## Attachment Metadata

Ticket attachment field는 prepared metadata만 저장합니다.

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

Ticket persistence는 다음을 사용합니다.

```txt
tk_content -> prepared body
tk_files   -> TicketAttachmentMetadata[]
tk_images  -> TicketAttachmentMetadata[]
```

Raw `File`, binary data, base64 data URL, blob URL, local path는 ticket row나
DTO의 일부가 아닙니다.

관련 문서: [Ticket Attachment Design](../../../04-client-engineering/forms/ticket-attachment.md)

---

## 관련 Subresource

### Ticket Action

Ticket action은 command로 생성되는 timeline entry입니다. History와 같지 않습니다. 일부
action은 ticket state를 변경하고 여러 history record를 만듭니다.

관련 문서: [Ticket Action Model](./ticket-action.md)

### Ticket History

History는 type, source, event, actor, JSON from/to value, display metadata를 가진
immutable event/audit data입니다.

관련 문서: [Ticket History](./ticket-history.md)

### Work Session

Work Session은 실제 tracked work를 기록합니다. 티켓은 aggregate `workMinutes`를
노출하지만, 개별 session은 별도 subresource로 남습니다.

관련 문서: [Ticket Work Session](./ticket-work-session.md)

---

## List vs Detail

### List Item

List/search DTO는 다음을 포함합니다.

- identity와 status
- assignment projection
- priority, risk, due date
- category display data
- owner/assigned flag
- work minutes와 recent activity timestamp
- close/merge field
- age

### Detail

Detail DTO는 다음을 추가합니다.

- full content
- email configuration
- prepared files
- prepared images

---

## Write Model

Create/update request payload는 다음을 사용합니다.

- category id
- subject/body
- due date
- priority/risk
- email
- prepared files/images
- optional existing draft id

Write는 attachment metadata를 validate하고 persistence 전에 row를 normalize합니다.

Requester update에는 별도의 routing-sensitive behavior가 있습니다.
[Ticket Lifecycle](./ticket-lifecycle.md)과
[Ticket Operation Rules](reference/ticket-operation-rules.md)를 참고합니다.

---

## 요약

현재 ticket model은 current row state, derived DTO projection, immutable history를
분리합니다. Routing phase, owner flag, assignee flag, work minutes, recent activity는
read-model 편의 값입니다. Persisted workflow source는 status, approval step,
assignees, category, content, planning fields, prepared attachment metadata로
명확하게 유지됩니다.
