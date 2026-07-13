# Service Desk 구현 전략

## 목표

이 문서는 `sunghwan-portal`의 현재 Service Desk 구현 방식을 설명한다.

현재 코드에 존재하는 주요 구현 경계:

- route handler 기반 LOCAL/REMOTE runtime branching
- tenant-scoped settings
- REMOTE ticket draft
- attachment preparation
- approval/work routing
- Ticket Action command execution
- event-based ticket history
- work session
- React Query server-state ownership

개념적 진화는 [`service-desk-evolution.md`](service-desk-evolution.md)에서 다루고,
당시 의사결정 맥락은 `decision-log`에 보존한다.

---

## Runtime Strategy

Service Desk runtime은 깊은 UI component가 아니라 API/server boundary에서 선택한다.

```txt id="runtime-flow"
UI
-> feature API client
-> Next.js route handler
-> LOCAL handler or REMOTE data service
```

UI는 LOCAL demo state와 REMOTE persistence 중 어디서 왔는지와 관계없이 같은
application-facing DTO shape를 소비해야 한다.

### LOCAL Runtime

LOCAL runtime은 portfolio/demo workflow를 위한 경로다. Server-side mutable demo
state와 reset behavior를 사용할 수 있다.

### REMOTE Runtime

REMOTE runtime은 `src/server/data`의 server data service, repository, row mapper,
DTO를 사용한다.

현재 REMOTE 구현 범위:

- settings tenant/category/approval-step/assignment-rule read/mutation
- ticket create/read/search/requester update/draft
- ticket action execution
- ticket history read/write
- work-session list/create
- expired resolved ticket auto close

REMOTE라고 해서 모든 production infrastructure가 완성된 것은 아니다. Attachment
binary는 여전히 controlled demo asset으로 대체한다.

---

## Route Handler Boundary

Next.js route handler는 HTTP orchestration boundary다.

책임:

- HTTP input parsing
- session/runtime context resolution
- feature/domain handler delegation
- application-facing DTO response

소유하지 않는 것:

- SQL details
- row-to-DTO mapping
- business rule branching
- attachment preparation internals
- ticket history construction internals

중요 route surface:

```txt id="service-desk-routes"
/api/service-desk/tickets
/api/service-desk/tickets/search
/api/service-desk/tickets/draft
/api/service-desk/tickets/[ticketId]
/api/service-desk/tickets/[ticketId]/actions
/api/service-desk/tickets/[ticketId]/actions/[actionNo]
/api/service-desk/tickets/[ticketId]/command/start-work
/api/service-desk/tickets/[ticketId]/command/[action]
/api/service-desk/tickets/[ticketId]/histories
/api/service-desk/tickets/[ticketId]/work-session
/api/service-desk/tickets/attachments/prepare
/api/service-desk/tenants
/api/service-desk/categories
/api/service-desk/approval-steps
/api/service-desk/assignment-rules
```

---

## Settings 구현

Service Desk Settings는 tenant-scoped behavior configuration이다.

```txt id="settings-boundary"
Company reference data
-> Service Desk Tenant
-> Category / Approval Step / Assignment Rule
-> Ticket workflow
```

현재 settings 구현:

- `Tenant`: `companyId`, localized `name`, `color`, `active`
- category scope: `"PORTAL"` / `"INTERNAL"`
- main/subcategory hierarchy
- typed assignee를 가진 ordered approval steps
- job-field IDs와 employee usernames 기반 group assignment rules
- settings server state는 React Query가 소유

Settings 변경은 미래 workflow resolution에 영향을 준다. 기존 ticket history의 의미를
조용히 rewrite하지 않는다.

---

## Draft 구현

REMOTE draft는 `Draft` 상태의 ticket row로 구현된다.

핵심 동작:

- requester당 하나의 active draft
- create dialog가 active draft를 로드
- dirty create form을 닫으면 draft 저장 가능
- final create가 existing draft row를 재사용 가능
- discard는 active draft workflow를 제거

Draft는 durable attachment recovery를 제공하지 않는다. Browser `File` 객체는
transient이며 production object storage는 현재 범위가 아니다.

---

## Attachment 구현

Attachment는 prepare boundary를 사용한다.

```txt id="attachment-implementation-flow"
browser File[] and rich-text body
-> POST /api/service-desk/tickets/attachments/prepare
-> prepared body, files, images
-> ticket command payload
```

Prepare API 책임:

- filename/extension/size validation
- selected file을 controlled demo URL로 대체
- inline data image를 controlled demo image URL로 대체
- unsupported image source reject
- normalized metadata 반환

Ticket write command는 raw binary가 아니라 prepared metadata만 persist한다.

---

## Ticket Workflow 구현

현재 ticket status:

```ts id="ticket-status-union"
type TicketStatus =
  | "Draft"
  | "Approval"
  | "Declined"
  | "Assigned"
  | "Working"
  | "Pending"
  | "Rejected"
  | "Resolved"
  | "Closed";
```

Legacy row value는 mapper에서 normalize될 수 있지만 current design docs는
`Open`, `Approved`, `Reopen`을 active status로 설명하지 않는다.

Create/submit:

- approval step이 필요하면 `Approval`
- 바로 work assignment가 되면 `Assigned`
- submit은 event-based history를 기록

Requester update:

- requester만 가능
- `Approval`, `Assigned`에서만 가능
- routing-sensitive change는 routing reset
- routing-neutral change는 routing preserve

Explicit work start:

- `start-work`는 current work assignee가 `Assigned`를 `Working`으로 전환한다.
- status change는 history로 기록된다.

---

## Approval and Work Routing

Routing은 phase-aware이다.

```ts id="assignment-phase"
type TicketAssignmentPhase = "APPROVAL" | "WORK";
```

Ticket row는 current routing fact를 저장한다.

- current approval step ID
- current assignee usernames

DTO projection:

- `assignmentPhase`
- `approvalAssigneeUsernames`
- `workAssigneeUsernames`
- `assignedApprover`
- `assignedWorker`

Approval step과 assignment rule은 settings이다. Workflow transition이 필요할 때
ticket state로 resolve된다. 기존 ticket은 나중에 settings가 바뀌었다는 이유만으로
조용히 변경되지 않는다.

Approval과 assignment는 하나의 generic category inheritance rule을 공유하지 않는다.
Approval resolution은 선택된 category의 parent/main category approval step을 사용한다.
Work assignment resolution은 선택된 subcategory rule을 먼저 확인하고, 필요할 때만
parent/main category rule로 fallback한다.

---

## Ticket Action 구현

Ticket action은 command execution path다.

현재 action type:

```ts id="ticket-action-types"
type TicketActionType =
  | "APPROVE"
  | "DECLINE"
  | "COMMENT"
  | "NOTE"
  | "ASSIGN"
  | "ASSIGN_SELF"
  | "REJECT"
  | "MERGE"
  | "ADJUST"
  | "REOPEN"
  | "RESUBMIT"
  | "CANCEL";
```

현재 command path name:

```txt id="ticket-action-paths"
approve
decline
comment
note
assign
assignSelf
adjust
reject
merge
reopen
resubmit
cancel
```

Action rule은 누가 실행할 수 있는지, 어떤 status에서 가능한지, content/reason/
attachment를 받는지, 어떤 status/routing/history effect가 발생하는지를 소유한다.

Operational action은 실행 후 immutable이다. Comment/note entry는 현재 action detail
route를 통해 soft delete될 수 있다.

---

## Event-Based History 구현

History는 event-based이다.

현재 모델은 다음을 분리한다.

- `type`
- `source`
- `event`
- previous/current values
- actor/timestamp

`event` enum이 authoritative classification이다. `metadata.event`나 legacy action
name에 의존하는 설명은 현재 모델이 아니다.

성공한 command만 history를 만든다.

예시:

- create submit -> `TICKET_SUBMITTED`
- approval request -> `APPROVAL_REQUESTED`
- assignment resolution -> `ASSIGNMENT_RESOLVED`
- requester update with routing reset -> `ROUTING_RESET`
- requester update with routing preserved -> `ROUTING_PRESERVED`
- work-session create -> `WORK_SESSION_STARTED`, `WORK_SESSION_STOPPED`,
  `WORK_SESSION_UPDATED`
- reopen action -> authoritative status event `TICKET_REOPENED`
- auto close -> `SYSTEM_AUTO` source와 `actionNo = null`인 `RESOLUTION_CLOSE`

---

## Work Session 구현

Work session은 operational work evidence이다.

현재 route surface:

```txt id="work-session-route"
GET  /api/service-desk/tickets/[ticketId]/work-session
POST /api/service-desk/tickets/[ticketId]/work-session
```

현재 동작:

- ticket work session list
- manual duration/range session create
- `Assigned` -> `Working` start work
- 허용되는 next status로 `Working`/`Pending` 전환
- current work assignee만 write 가능
- work-session history event 기록

Feature client에는 detail/update/delete/timer-style helper가 있지만 matching route
handler가 없으므로 API surface가 구현되기 전까지 extension point로 취급한다.

---

## React Query 구현

React Query는 server state를 소유한다.

현재 Service Desk query family:

- ticket list/search/detail
- data scope/user별 active draft
- ticket actions list/detail
- ticket histories
- work sessions
- settings tenants/categories/approval steps/assignment rules

Mutation은 target query family를 invalidate해야 하며 server state를 Zustand에
중복 저장하지 않는다.

---

## Deferred Production Scope

현재 구현에서 미래 범위로 남겨둔 항목:

- durable object storage for attachment binaries
- production notification delivery
- complete work-session timer/update/delete route surface
- full SLA breach/escalation engine
- settings versioning and approval workflow
- full audit/compliance export
- WebSocket/subscription real-time updates
- enterprise assignment load balancing

Current design docs는 이 항목을 완료된 동작으로 설명하지 않는다.

---

## 관련 문서

- [`../03-domain/service-desk-settings.md`](../03-domain/service-desk-settings.md)
- [`../03-domain/ticket/ticket-system-overview.md`](../03-domain/ticket/ticket-system-overview.md)
- [`../03-domain/ticket/ticket-lifecycle.md`](../03-domain/ticket/ticket-lifecycle.md)
- [`../03-domain/ticket/ticket-activity.md`](../03-domain/ticket/ticket-activity.md)
- [`../03-domain/ticket/ticket-history.md`](../03-domain/ticket/ticket-history.md)
- [`../03-domain/ticket/ticket-track-time.md`](../03-domain/ticket/ticket-track-time.md)
- [`../06-form-design/ticket-form.md`](../06-form-design/ticket-form.md)
- [`../06-form-design/ticket-attachment.md`](../06-form-design/ticket-attachment.md)
- [`ticket-operation-rules.md`](ticket-operation-rules.md)

---

## 요약

현재 Service Desk 구현은 LOCAL mock 설계에 머무르지 않는다. REMOTE draft,
attachment preparation, tenant-scoped settings, approval/work routing,
command-based ticket action, event-based history, work-session recording을 포함한다.

구현 전략은 UI contract를 안정적으로 유지하고, route handler는 얇게 두며, server
service를 workflow 권위자로 삼고, production infrastructure의 deferred scope를
완료된 동작과 분리하는 것이다.
