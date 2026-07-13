# 티켓 시스템 Overview

## 목표

이 문서는 Service Desk ticket system의 high-level current design overview다.

안정된 model을 요약하고 canonical detail 문서로 연결한다. 모든 operation rule을
반복하지 않는다. 시스템의 형태를 이해한 뒤 실행 세부사항은 링크된 문서를 따른다.

---

## 현재 Ticket System

```txt id="ticket-system-current"
Tenant-scoped settings
-> category-driven ticket intake
-> approval or work routing
-> command-based ticket actions
-> event-based history
-> work-session evidence
```

Service Desk ticket domain은 workflow-oriented다. Ticket은 generic CRUD row가 아니다.
Current state, current ownership, configuration context, actions, history,
attachments, work-session records를 가진다.

---

## Persisted Status Model

현재 `TicketStatus` union:

```txt id="ticket-status-union"
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

`Open`, `Approved`, `Reopen`은 persisted status가 아니다.

- `Open`은 UI grouping/search concept으로만 사용할 수 있다.
- Approval completion은 `APPROVAL_APPROVED` history로 기록된다.
- Reopen은 현재 `Resolved`를 `Working`으로 되돌리는 action이다.

Detail read는 status를 변경하면 안 된다. Work start는 explicit command다.

관련 문서: [Ticket Lifecycle](./ticket-lifecycle.md)

---

## Draft

REMOTE draft는 `status = "Draft"`인 일반 ticket row로 저장된다.

현재 draft rule:

- requester당 active draft는 하나다.
- draft는 별도 draft table이 아니라 ticket table을 사용한다.
- draft save/update는 draft API를 사용한다.
- final submit은 draft row를 재사용하고 `Approval` 또는 `Assigned`로 이동시킨다.
- operational list와 insight는 draft ticket을 제외한다.
- LOCAL draft는 feature API boundary 뒤의 simplified demo-safe 구현을 사용하며
  REMOTE PostgreSQL draft model과 persistence-equivalent하지 않다.

관련 문서: [Ticket Form Design](../../06-form-design/ticket-form.md)

---

## Approval and Work Routing

현재 routing source of truth:

```txt id="routing-source-of-truth"
tk_approval_step_id
tk_assignee_usernames
```

해석:

```txt id="routing-phase"
tk_approval_step_id != null
-> assignmentPhase = APPROVAL
-> tk_assignee_usernames = current approvers

tk_approval_step_id == null
-> assignmentPhase = WORK
-> tk_assignee_usernames = current workers
```

DTO는 UI 편의를 위해 projection field를 노출한다.

- `assignmentPhase`
- `approvalAssigneeUsernames`
- `workAssigneeUsernames`
- `assignedApprover`
- `assignedWorker`

이 값들은 mapper/service projection이며 별도 database source of truth가 아니다.

관련 문서:

- [Approval System](./strategy/approval-system.md)
- [Assignment Policy](./strategy/assignment-policy.md)

---

## Initial Routing

Ticket submission은 선택된 category와 requester에서 routing을 resolve한다.

```txt id="initial-routing"
next approval step exists
-> status = Approval
-> approvalStepId = next step
-> assigneeUsernames = approvers

no approval step
-> status = Assigned
-> approvalStepId = null
-> assigneeUsernames = workers
```

Final approval은 다음 approval step으로 이동하거나 work assignment를 resolve하고
ticket을 `Assigned`로 이동시킨다.

Decline은 approval routing을 종료한다.

```txt id="decline-routing"
status = Declined
approvalStepId = null
assigneeUsernames = []
```

---

## Requester Update Routing

Requester update는 현재 구현에서 requester-owned ticket이 `Approval` 또는 `Assigned`
상태일 때만 허용된다.

Routing-neutral fields:

- due date
- email recipients

Routing-sensitive fields:

- category
- subject
- content
- files
- images

실제 normalized value change만 routing behavior를 trigger한다. Routing-neutral field만
변경되면 status, approval step, assignee를 유지하고 history는 `ROUTING_PRESERVED`를
기록한다.

Routing-sensitive value가 변경되면 routing을 처음부터 다시 계산하고 history는
`ROUTING_RESET`을 기록한다.

Category가 변경되면 priority, risk, minimum due date를 새 category default에서 다시
평가한다. 다음 due date는 현재 due date와 새 category minimum 중 더 늦은 값이며,
category change는 due date를 더 이른 날짜로 당기면 안 된다.

관련 문서:

- [Ticket Lifecycle](./ticket-lifecycle.md)
- [Ticket Operation Rules](../../08-dev-strategy/ticket-operation-rules.md)

---

## Attachment Boundary

Ticket attachment input은 ticket command가 metadata를 쓰기 전에 prepare된다.

```txt id="attachment-flow"
File[] / inline image
-> Attachment Prepare API
-> prepared body, files, images
-> ticket command payload
-> tk_content, tk_files, tk_images
```

현재 LOCAL/REMOTE behavior는 controlled demo replacement를 사용한다. Production object
storage를 제공하지 않는다.

Raw `File`, binary data, base64 data URL, blob URL, local file path는 ticket row, DTO,
action metadata, history metadata에 persist하면 안 된다.

관련 문서: [Ticket Attachment Design](../../06-form-design/ticket-attachment.md)

---

## Ticket Action Command Model

Ticket action은 server-controlled command다.

```txt id="ticket-action-command"
Action command
-> authenticate
-> authorize
-> validate status
-> validate input
-> insert action when applicable
-> mutate ticket when applicable
-> create history
```

현재 action type:

```txt id="ticket-action-types"
APPROVE
DECLINE
COMMENT
NOTE
ASSIGN
ASSIGN_SELF
REJECT
MERGE
ADJUST
REOPEN
RESUBMIT
CANCEL
```

Communication action은 timeline entry를 만든다. Operational action은 status,
assignee, planning field, merge state, close reason을 변경할 수 있다. Operational
action은 normal workflow에서 immutable하다.

Closure 전에 생성된 comment는 `Closed` 이후에도 계속 표시된다. 이 visibility는
closure 이후 새 comment creation이 허용된다는 뜻이 아니다.

관련 문서:

- [Ticket Activity Model](./ticket-activity.md)
- [Action Strategy](./strategy/action-strategy.md)

---

## Event-Based History

History는 immutable event/audit data다.

```txt id="history-shape"
type   -> changed domain area
source -> why or which rule produced it
event  -> what happened
actor  -> who initiated it
from/to value -> structured JSON change
metadata -> supplemental display/audit context
```

`event`는 authoritative하다. `metadata.event`는 event source of truth가 아니다.
`SYSTEM_AUTO`는 history source이지 history type이 아니다.

하나의 action은 여러 history record를 만들 수 있다. 일부 system operation은 ticket
action row 없이 history를 만들 수 있다.

관련 문서: [Ticket History](./ticket-history.md)

---

## Work Session

Work Session은 실제 work-time evidence를 기록한다. Ticket Action과 분리된다.

현재 route surface:

```txt id="work-session-routes"
GET  /api/service-desk/tickets/:ticketId/work-session
POST /api/service-desk/tickets/:ticketId/work-session
```

현재 behavior:

- current work assignee만 work를 track할 수 있다.
- `Assigned`는 `Working`으로의 transition이 필요하다.
- `Working`은 `Pending` 또는 `Resolved`로 이동할 수 있다.
- `Pending`은 `Working` 또는 `Resolved`로 이동할 수 있다.
- tracked minutes는 ticket work total로 aggregate된다.
- GET은 status를 변경하지 않는다.
- timer-style start/finish/switch route는 현재 route surface에 포함되지 않는다.

관련 문서: [Ticket Track Time](./ticket-track-time.md)

---

## Settings Relationship

Service Desk settings는 ticket workflow가 사용하는 behavior configuration을 제공한다.

```txt id="settings-relationship"
Company
-> Service Desk Tenant
   -> Category
      -> Approval Step
      -> Assignment Rule
```

Tenant는 configuration scope다. Category는 central behavior configuration이다.
Approval Step은 main-category approval routing을 제어한다. Assignment Rule은
subcategory override와 parent/main fallback으로 work ownership을 resolve한다.

관련 문서: [Service Desk Settings](../service-desk-settings.md)

---

## Runtime Boundary

UI는 feature API client를 사용한다. Route handler는 LOCAL 또는 REMOTE behavior를
선택한다.

```txt id="runtime-boundary"
UI
-> feature API client
-> Next.js Route Handler
-> LOCAL handler or REMOTE portal API/service
-> DTO
```

REMOTE는 server-only data access, row/mapper/DTO boundary, repository service,
workflow change에 atomicity가 필요할 때 transaction을 사용한다.

LOCAL은 safe portfolio demo behavior를 제공하고, 지원되는 workflow에서는 DTO contract를
REMOTE와 맞춰 유지해야 한다.

---

## Document Map

- Status and transitions: [Ticket Lifecycle](./ticket-lifecycle.md)
- Current executable rules: [Ticket Operation Rules](../../08-dev-strategy/ticket-operation-rules.md)
- Ticket entity and DTO boundary: [Ticket Model](./ticket-model.md)
- Action timeline: [Ticket Activity Model](./ticket-activity.md)
- Command execution: [Action Strategy](./strategy/action-strategy.md)
- Immutable audit model: [Ticket History](./ticket-history.md)
- Approval rules: [Approval System](./strategy/approval-system.md)
- Work assignment: [Assignment Policy](./strategy/assignment-policy.md)
- Work sessions: [Ticket Track Time](./ticket-track-time.md)
- Form workflow: [Ticket Form Design](../../06-form-design/ticket-form.md)
- Attachment boundary: [Ticket Attachment Design](../../06-form-design/ticket-attachment.md)
- Settings structure: [Service Desk Settings](../service-desk-settings.md)

---

## 요약

현재 Service Desk ticket system은 precise persisted statuses, phase-aware routing,
REMOTE draft rows, attachment preparation, command-based actions, event-based
history, work-session evidence, tenant-scoped settings를 중심으로 구성된다.

설계 목표는 workflow behavior를 명시적이고 감사 가능하게 유지하며, 오래된
`Open`/`Approved` lifecycle terminology가 아니라 현재 구현과 정렬하는 것이다.
