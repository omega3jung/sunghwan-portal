# 티켓 시스템 명세

## 언어

- [English](./ticket-system.md)
- [Korean](./ticket-system.ko.md)

## 목표

이 문서는 현재 Service Desk 티켓 시스템의 canonical high-level 명세입니다.

티켓 시스템은 CRUD 중심이 아니라 workflow 중심입니다. 티켓은 draft, approval,
work assignment, execution, resolution, audit history, work session을 거치는
workflow entity입니다.

상세 규칙은 링크된 설계 문서에서 다룹니다. Decision log는 과거 선택의 이유와 변화
과정을 보존하는 문서이며, 현재 설계 문서처럼 다시 쓰지 않습니다.

---

## 현재 범위

현재 프로젝트가 다루는 범위는 다음과 같습니다.

- ticket list, search, detail, create, requester update, command execution
- `status = Draft`인 ticket row로 저장되는 REMOTE draft
- category, approval step, assignment rule을 위한 tenant-scoped settings
- category-driven priority, risk, due date, approval, work assignment
- controlled demo replacement를 사용하는 attachment preparation
- command-based ticket actions
- event-based immutable history
- work-session create/list와 tracked-minute aggregate
- LOCAL demo behavior와 REMOTE PostgreSQL/DTO boundary

이 프로젝트는 production-aligned이지만 production-complete는 아닙니다. Production
object storage, notification delivery, full SLA engine, real-time updates,
compliance-grade audit infrastructure는 명시적으로 구현되기 전까지 deferred scope입니다.

---

## 현재 Status Model

Persisted ticket status union은 다음과 같습니다.

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

중요 규칙:

- `Open`은 persisted status가 아닙니다.
- `Approved`는 persisted status가 아닙니다.
- `Reopen`은 persisted status가 아닙니다.
- Approval 완료는 `APPROVAL_APPROVED` history로 기록됩니다.
- Reopen은 ticket action이며 현재 결과는 `Resolved -> Working`입니다.
- GET/read request는 ticket status를 변경하면 안 됩니다.

관련 문서:

- [Ticket Lifecycle](../ko/03-domain/service-desk/ticket/ticket-lifecycle.md)
- [Ticket Operation Rules](../ko/03-domain/service-desk/ticket/reference/ticket-operation-rules.md)

---

## 핵심 도메인 모델

```txt id="core-domain-model"
Company
-> Service Desk Tenant
   -> Category
      -> Approval Step
      -> Assignment Rule

Ticket
-> Action
-> History
-> Work Session
-> Attachment metadata
```

Tenant는 configuration scope입니다. Category는 중심 behavior configuration입니다.
Approval Step은 선택된 subcategory의 parent/main category 기준으로 평가됩니다.
Assignment Rule은 선택된 subcategory rule을 먼저 적용하고, 없을 때만
parent/main category rule로 fallback합니다.

Category workflow availability는 다음 불변 조건을 따릅니다.

```txt
Category creation -> 비활성화
Assignment Rule -> 적어도 하나 이상의 할당된 직무 또는 직원 필요
Category activation -> 유효 규칙에 활성된 직무 또는 직원 필요
Ticket Create -> 유효하게 활성화된 main/sub category만
Ticket routing -> 실제 작업자 자격은 서버에서 재검증됨
```

Operational availability는 저장된 Tenant와 그 기반 Company가 모두 active여야 합니다.
Ticket create/update는 persisted Category에서 Tenant를 파생하고 object-level Category
access를 적용하며, payload Tenant ID를 authoritative source로 사용하지 않습니다.
`PORTAL` assignment는 기본적으로 provider company를 사용하고 persisted
`includeTenantCompany`가 있을 때만 category Tenant company를 추가합니다.

Main category와 subcategory의 active flag는 독립적으로 저장하며, subcategory의
effective availability는 `main.active && sub.active`로 계산합니다. Subcategory own
Assignment Rule이 있으면 이를 사용하고, own rule이 없을 때만 main-category rule로
fallback합니다. Assignment Rule이 없는 상태를 persisted empty rule로 표현하지 않습니다.

관련 문서:

- [Service Desk Settings](../ko/03-domain/service-desk/settings.md)
- [Category Strategy](../ko/03-domain/service-desk/ticket/strategy/category-strategy.md)

---

## Draft

REMOTE draft는 browser-only state가 아니며 별도 draft table도 아닙니다.

```txt id="remote-draft"
ticket row
+ status = Draft
```

규칙:

- requester당 active draft는 하나입니다.
- draft save/update는 draft API를 사용합니다.
- final submit은 같은 row를 재사용합니다.
- submit은 initial approval/work routing을 수행합니다.
- operational ticket list는 draft를 제외합니다.
- LOCAL draft는 feature API boundary 뒤의 simplified demo-safe 구현이며
  REMOTE PostgreSQL draft와 persistence가 동일하지 않습니다.

관련 문서:

- [Ticket Form Design](../ko/04-client-engineering/forms/ticket-form.md)

---

## Approval and Work Routing

현재 routing source of truth는 다음입니다.

```txt id="routing-source-of-truth"
tk_approval_step_id
tk_assignee_usernames
```

해석:

```txt id="routing-phase"
approvalStepId != null
-> APPROVAL phase
-> assigneeUsernames = current approvers

approvalStepId == null
-> WORK phase
-> assigneeUsernames = current workers
```

Application DTO는 `assignmentPhase`, `approvalAssigneeUsernames`,
`workAssigneeUsernames`, `assignedApprover`, `assignedWorker` 같은 phase-aware
projection field를 제공합니다.

관련 문서:

- [Approval System](../ko/03-domain/service-desk/ticket/strategy/approval-system.md)
- [Assignment Policy](../ko/03-domain/service-desk/ticket/strategy/assignment-policy.md)

---

## Requester Update

Requester update는 normalized previous/next value를 비교합니다.

Routing-neutral change는 status, approval step, assignee를 유지합니다.

- due date
- email recipients

Routing-sensitive change는 category-driven routing을 처음부터 다시 수행합니다.

- category
- subject
- content
- files
- images

Category가 변경되면 default priority, default risk level, minimum due date를
새 category 기준으로 다시 평가합니다. 결과 due date는 현재 due date와 새 category
minimum 중 더 늦은 값입니다.

History는 결과를 `ROUTING_PRESERVED` 또는 `ROUTING_RESET`으로 기록합니다.

---

## Attachment Boundary

현재 attachment flow는 다음과 같습니다.

```txt id="attachment-flow"
File[] / inline image
-> Attachment Prepare API
-> prepared body, files, images
-> Draft / Create / Update / Action command where applicable
-> metadata persistence
```

LOCAL과 REMOTE 모두 현재 controlled demo replacement를 사용합니다. 현재 구현에는
production object storage가 없습니다.

시스템은 raw `File`, binary data, base64 data URL, blob URL, local file path를
ticket row, DTO, action metadata, history metadata에 저장하면 안 됩니다.

관련 문서:

- [Ticket Attachment Design](../ko/04-client-engineering/forms/ticket-attachment.md)

---

## Action Command Model

현재 action union은 다음과 같습니다.

```txt id="action-union"
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

Action execution은 server-controlled command입니다.

```txt id="action-command-pipeline"
Action command
-> authenticate
-> authorize
-> validate current status
-> validate action input
-> insert action when applicable
-> mutate ticket when applicable
-> create history
```

명시적 start-work command는 Ticket Action union과 별도로 구현됩니다. 이 command는
`Assigned -> Working`으로 이동시키고 `STATUS_UPDATED` history를 만들며 Ticket
Action row를 만들지 않습니다.

Operational action은 immutable합니다. Communication action은 closure 전
`COMMENT`와 `NOTE`에 대해 soft delete를 지원합니다. 기존 comment는 `Closed`
이후에도 표시되지만 closed ticket operation rule은 새 comment 생성을 차단합니다.
Update event는 history model에 예약되어 있지만 현재 route behavior로 노출되어
있지 않습니다.

관련 문서:

- [Ticket Action Model](../ko/03-domain/service-desk/ticket/ticket-action.md)
- [Action Strategy](../ko/03-domain/service-desk/ticket/strategy/action-strategy.md)

---

## History

History는 event-based immutable model입니다.

```txt id="history-model"
type   -> affected domain area
source -> why or which rule produced it
event  -> what happened
actor  -> who initiated it
from/to value -> structured JSON before/after
metadata -> supplemental display/audit context
```

`event`가 authoritative field입니다. `SYSTEM_AUTO`는 source이지 history type이
아닙니다.

Reopen history는 `Resolved -> Working` 전이에 대해 `type = STATUS`,
`source = USER_ACTION`, `event = TICKET_REOPENED`를 사용합니다.

Resolved auto-close는 resolved-history timestamp와 7-day grace period를 기준으로
`status = Closed`, `closeReason = Completed`를 설정하고, 필요한 경우 running work
session을 종료하며, `RESOLUTION_CLOSE` history를 `SYSTEM_AUTO` 및
`actionNo = null`로 기록합니다.

관련 문서:

- [Ticket History](../ko/03-domain/service-desk/ticket/ticket-history.md)

---

## Work Session

Work Session은 Ticket Action과 분리됩니다.

현재 route surface:

```txt id="work-session-routes"
GET  /api/service-desk/tickets/:ticketId/work-session
POST /api/service-desk/tickets/:ticketId/work-session
```

현재 동작:

- current work assignee만 work를 기록할 수 있습니다.
- tracked minutes는 ticket aggregate에 반영됩니다.
- work-session submission은 `Assigned -> Working`을 적용할 수 있습니다.
- `Working -> Pending | Resolved`
- `Pending -> Working | Resolved`
- GET은 side effect가 없습니다.
- timer start/finish/switch route는 현재 route surface에 없습니다.

관련 문서:

- [Ticket Work Session](../ko/03-domain/service-desk/ticket/ticket-work-session.md)

---

## Runtime and Data Boundary

```txt id="runtime-boundary"
UI
-> feature API client
-> Next.js Route Handler
-> LOCAL handler or REMOTE portal API/service
-> DTO
```

REMOTE data access는 다음 흐름을 따릅니다.

```txt id="data-boundary"
DB Row
-> Mapper
-> DTO
-> Service
-> Route Handler
-> Feature API client
-> UI
```

UI code는 Supabase나 database row에 직접 접근하면 안 됩니다. LOCAL mutable state와
REMOTE service는 지원하는 workflow에서 compatible DTO contract를 유지해야 합니다.

관련 문서:

- [Database Strategy](../ko/02-architecture/database-strategy.md)
- [React Query Strategy](../ko/05-development/react-query-strategy.md)
- [Service Desk Implementation Strategy](../ko/05-development/service-desk-implementation-strategy.md)

---

## Deferred Scope

Deferred production scope는 다음을 포함합니다.

- production object storage, file scanning, signed download URL
- real notification delivery
- full SLA calendar, pause/resume clock, breach, escalation engine
- real-time updates
- complete work-session update/delete/timer route surface
- compliance-grade audit infrastructure
- advanced assignment load balancing

Deferred item은 current implementation처럼 설명하면 안 됩니다.

---

## 관련 문서

### Current Design

- [Service Desk Documentation Index](../ko/README.md)
- [Ticket System Overview](../ko/03-domain/service-desk/ticket/ticket-system-overview.md)
- [Ticket Lifecycle](../ko/03-domain/service-desk/ticket/ticket-lifecycle.md)
- [Ticket Model](../ko/03-domain/service-desk/ticket/ticket-model.md)
- [Ticket Action Model](../ko/03-domain/service-desk/ticket/ticket-action.md)
- [Ticket History](../ko/03-domain/service-desk/ticket/ticket-history.md)
- [Ticket Work Session](../ko/03-domain/service-desk/ticket/ticket-work-session.md)
- [Ticket Form Design](../ko/04-client-engineering/forms/ticket-form.md)
- [Ticket Attachment Design](../ko/04-client-engineering/forms/ticket-attachment.md)
- [Service Desk Settings](../ko/03-domain/service-desk/settings.md)

### Strategies

- [Action Strategy](../ko/03-domain/service-desk/ticket/strategy/action-strategy.md)
- [Approval System](../ko/03-domain/service-desk/ticket/strategy/approval-system.md)
- [Assignment Policy](../ko/03-domain/service-desk/ticket/strategy/assignment-policy.md)
- [Category Strategy](../ko/03-domain/service-desk/ticket/strategy/category-strategy.md)
- [SLA Strategy](../ko/03-domain/service-desk/ticket/strategy/sla-strategy.md)
- [Ticket Operation Rules](../ko/03-domain/service-desk/ticket/reference/ticket-operation-rules.md)
- [Service Desk Implementation Strategy](../ko/05-development/service-desk-implementation-strategy.md)

### Decision Logs

- [2026-06 Ticket Form and Draft Workflow](../ko/06-decisions/2026-06-ticket-form-and-draft-workflow.md)
- [2026-06 Ticket Attachment Boundary](../ko/06-decisions/2026-06-ticket-attachment-boundary.md)
- [2026-07 Ticket Routing and Update Policy](../ko/06-decisions/2026-07-ticket-routing-and-update-policy.md)
- [2026-07 Ticket Action and History Execution](../ko/06-decisions/2026-07-ticket-action-and-history-execution.md)

---

## 현재 Authorization 및 Workflow 영향 불변 조건

REMOTE Ticket read는 `vw_ticket` query에서 저장된 Ticket Tenant, `cat_scope`,
requester, 현재 approver/worker assignee, effective principal의 company/scope를
함께 평가합니다. List, search, detail, action list, History, Work Session read는 같은
visibility boundary를 사용하며 list에서 보이지 않는 Ticket을 ID나 subresource로
조회할 수 없습니다. LOCAL도 같은 predicate 의미를 사용합니다.

Category 비활성화는 신규 workflow availability만 변경합니다. 진행 중인 Ticket이
main/subcategory를 사용하면 impact 확인이 필요하지만, force 확인 후에도 기존
Ticket routing과 History는 변경하지 않습니다. 진행 중인 Approval은 비활성 Category를
참조해 계속 진행할 수 있지만 신규 또는 재시작 routing은 operational Category를
요구합니다.

`Approval` Ticket에 영향을 주는 Approval Step tree 변경은 force apply가 필요합니다.
서버는 유효한 설정 저장, 모든 영향 Ticket의 초기 routing reset, reason이
`APPROVAL_CONFIGURATION_CHANGED`인 `ROUTING_RESET` History 기록을 하나의
transaction으로 처리하고 중간 실패 시 전체 rollback합니다. 고객 Tenant는
`Draft`, `Closed`가 아닌 Ticket이 있으면 force 없이 비활성화/삭제가 차단됩니다.

Ticket 생성은 유효한 명시적 priority/risk를 보존하고 누락 값만
subcategory -> main category default 순서로 결정합니다. 서버는 Category SLA 최소값보다
이른 due date를 거부합니다. Category 변경 시 due date는
`later(currentDueAt, submittedDueAt, newCategoryMinimumDueAt)`이며 priority/risk는
새 Category default를 사용합니다.

## 요약

현재 티켓 시스템은 precise persisted status, REMOTE draft row,
phase-aware approval/work routing, attachment preparation, server-controlled
ticket action, immutable event history, work-session evidence를 사용합니다. 이
명세는 현재 구현과 deferred production infrastructure를 분리하고, 상세 규칙을
현재 설계 문서에 연결합니다.
