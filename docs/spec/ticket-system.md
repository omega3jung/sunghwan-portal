# Ticket System Specification

## Languages

- [English](./ticket-system.md)
- [Korean](./ticket-system.ko.md)

## Goal

This specification is the canonical high-level description of the current
Service Desk ticket system.

The ticket system is workflow-driven, not CRUD-driven. A ticket is a workflow
entity that moves through draft, approval, work assignment, execution,
resolution, audit history, and work-session behavior.

Detailed rules live in the linked design documents. Decision logs preserve the
historical reasoning behind earlier choices and are not rewritten as current
design.

---

## Current Scope

The current project covers:

- ticket list, search, detail, create, requester update, and command execution
- REMOTE draft persistence as ticket rows with `status = Draft`
- tenant-scoped settings for category, approval step, and assignment rule
- category-driven priority, risk, due date, approval, and work assignment
- attachment preparation with controlled demo replacement
- command-based ticket actions
- event-based immutable history
- work-session create/list and tracked-minute aggregation
- LOCAL demo behavior and REMOTE PostgreSQL/DTO boundaries

The project is production-aligned, not production-complete. Production object
storage, notification delivery, full SLA engine, real-time updates, and
compliance-grade audit infrastructure remain deferred unless explicitly
implemented.

---

## Current Status Model

The persisted ticket status union is:

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

Important rules:

- `Open` is not a persisted status.
- `Approved` is not a persisted status.
- `Reopen` is not a persisted status.
- Approval completion is recorded as `APPROVAL_APPROVED` history.
- Reopen is a ticket action whose current result is `Resolved -> Working`.
- GET/read requests must not mutate ticket status.

See:

- [Ticket Lifecycle](../en/03-domain/ticket/ticket-lifecycle.md)
- [Ticket Operation Rules](../en/08-dev-strategy/ticket-operation-rules.md)

---

## Core Domain Model

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

Tenant is the configuration scope. Category is the central behavior
configuration. Approval Step is evaluated from the selected category's
parent/main category. Assignment Rule checks the selected subcategory first and
falls back to the parent/main category only when no subcategory rule exists.

See:

- [Service Desk Settings](../en/03-domain/service-desk-settings.md)
- [Category Strategy](../en/03-domain/ticket/strategy/category-strategy.md)

---

## Draft

REMOTE draft is not browser-only state and not a separate draft table.

```txt id="remote-draft"
ticket row
+ status = Draft
```

Rules:

- one active draft per requester
- draft save/update uses the draft API
- final submit reuses the same row
- submit resolves initial approval/work routing
- operational ticket lists exclude drafts
- LOCAL draft uses a simplified demo-safe implementation behind the feature API
  boundary and is not persistence-equivalent to REMOTE PostgreSQL draft

See:

- [Ticket Form Design](../en/06-form-design/ticket-form.md)

---

## Approval and Work Routing

The current routing source of truth is:

```txt id="routing-source-of-truth"
tk_approval_step_id
tk_assignee_usernames
```

Interpretation:

```txt id="routing-phase"
approvalStepId != null
-> APPROVAL phase
-> assigneeUsernames = current approvers

approvalStepId == null
-> WORK phase
-> assigneeUsernames = current workers
```

Application DTOs expose phase-aware projection fields such as
`assignmentPhase`, `approvalAssigneeUsernames`, `workAssigneeUsernames`,
`assignedApprover`, and `assignedWorker`.

See:

- [Approval System](../en/03-domain/ticket/strategy/approval-system.md)
- [Assignment Policy](../en/03-domain/ticket/strategy/assignment-policy.md)

---

## Requester Update

Requester update compares normalized previous and next values.

Routing-neutral changes preserve status, approval step, and assignees:

- due date
- email recipients

Routing-sensitive changes rerun category-driven routing from the beginning:

- category
- subject
- content
- files
- images

On category change, default priority, default risk level, and the minimum due
date are re-evaluated from the new category. The resulting due date is the later
of the current due date and the new category minimum.

History records the result as `ROUTING_PRESERVED` or `ROUTING_RESET`.

---

## Attachment Boundary

Current attachment flow:

```txt id="attachment-flow"
File[] / inline image
-> Attachment Prepare API
-> prepared body, files, images
-> Draft / Create / Update / Action command where applicable
-> metadata persistence
```

Both LOCAL and REMOTE currently use controlled demo replacement. There is no
production object storage in the current implementation.

The system must not persist raw `File`, binary data, base64 data URLs, blob
URLs, or local file paths in ticket rows, DTOs, action metadata, or history
metadata.

See:

- [Ticket Attachment Design](../en/06-form-design/ticket-attachment.md)

---

## Action Command Model

Current action union:

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

Action execution is server-controlled:

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

The explicit start-work command is implemented separately from the Ticket Action
union. It moves `Assigned -> Working`, creates `STATUS_UPDATED` history, and
does not insert a Ticket Action row.

Operational actions are immutable. Communication actions currently support
soft delete for `COMMENT` and `NOTE` before closure. Existing comments remain
visible after `Closed`, but new comment creation is blocked by the closed-ticket
operation rules. Update events are reserved by the history model but are not
exposed as current route behavior.

See:

- [Ticket Activity Model](../en/03-domain/ticket/ticket-activity.md)
- [Action Strategy](../en/03-domain/ticket/strategy/action-strategy.md)

---

## History

History is event-based and immutable.

```txt id="history-model"
type   -> affected domain area
source -> why or which rule produced it
event  -> what happened
actor  -> who initiated it
from/to value -> structured JSON before/after
metadata -> supplemental display/audit context
```

`event` is authoritative. `SYSTEM_AUTO` is a source, not a history type.

Reopen history uses `type = STATUS`, `source = USER_ACTION`, and
`event = TICKET_REOPENED` for the `Resolved -> Working` transition.

Resolved auto-close uses the resolved-history timestamp plus a 7-day grace
period, then sets `status = Closed`, `closeReason = Completed`, finishes running
work sessions where applicable, and records `RESOLUTION_CLOSE` with
`SYSTEM_AUTO` and `actionNo = null`.

See:

- [Ticket History](../en/03-domain/ticket/ticket-history.md)

---

## Work Session

Work Session is separate from Ticket Action.

Current route surface:

```txt id="work-session-routes"
GET  /api/service-desk/tickets/:ticketId/work-session
POST /api/service-desk/tickets/:ticketId/work-session
```

Current behavior:

- only current work assignees can track work
- tracked minutes aggregate into the ticket
- work-session submission may apply `Assigned -> Working`
- `Working -> Pending | Resolved`
- `Pending -> Working | Resolved`
- GET has no side effect
- timer start/finish/switch routes are not part of the current route surface

See:

- [Ticket Track Time](../en/03-domain/ticket/ticket-track-time.md)

---

## Runtime and Data Boundary

```txt id="runtime-boundary"
UI
-> feature API client
-> Next.js Route Handler
-> LOCAL handler or REMOTE portal API/service
-> DTO
```

REMOTE data access follows:

```txt id="data-boundary"
DB Row
-> Mapper
-> DTO
-> Service
-> Route Handler
-> Feature API client
-> UI
```

UI code must not access Supabase or database rows directly. LOCAL mutable state
and REMOTE services should keep compatible DTO contracts where a workflow is
supported.

See:

- [Database Strategy](../en/02-architecture/database-strategy.md)
- [React Query Strategy](../en/05-data-fetching/react-query-strategy.md)
- [Service Desk Implementation Strategy](../en/08-dev-strategy/service-desk-implementation-strategy.md)

---

## Deferred Scope

Deferred production scope includes:

- production object storage, file scanning, and signed download URLs
- real notification delivery
- full SLA calendar, pause/resume clock, breach, and escalation engine
- real-time updates
- complete work-session update/delete/timer route surface
- compliance-grade audit infrastructure
- advanced assignment load balancing

Deferred items must not be described as current implementation.

---

## Related Documents

### Current Design

- [Service Desk Documentation Index](../en/README.md)
- [Ticket System Overview](../en/03-domain/ticket/ticket-system-overview.md)
- [Ticket Lifecycle](../en/03-domain/ticket/ticket-lifecycle.md)
- [Ticket Model](../en/03-domain/ticket/ticket-model.md)
- [Ticket Activity Model](../en/03-domain/ticket/ticket-activity.md)
- [Ticket History](../en/03-domain/ticket/ticket-history.md)
- [Ticket Track Time](../en/03-domain/ticket/ticket-track-time.md)
- [Ticket Form Design](../en/06-form-design/ticket-form.md)
- [Ticket Attachment Design](../en/06-form-design/ticket-attachment.md)
- [Service Desk Settings](../en/03-domain/service-desk-settings.md)

### Strategies

- [Action Strategy](../en/03-domain/ticket/strategy/action-strategy.md)
- [Approval System](../en/03-domain/ticket/strategy/approval-system.md)
- [Assignment Policy](../en/03-domain/ticket/strategy/assignment-policy.md)
- [Category Strategy](../en/03-domain/ticket/strategy/category-strategy.md)
- [SLA Strategy](../en/03-domain/ticket/strategy/sla-strategy.md)
- [Ticket Operation Rules](../en/08-dev-strategy/ticket-operation-rules.md)
- [Service Desk Implementation Strategy](../en/08-dev-strategy/service-desk-implementation-strategy.md)

### Decision Logs

- [2026-06 Ticket Form and Draft Workflow](../en/08-dev-strategy/decision-log/2026-06-ticket-form-and-draft-workflow.md)
- [2026-06 Ticket Attachment Boundary](../en/08-dev-strategy/decision-log/2026-06-ticket-attachment-boundary.md)
- [2026-07 Ticket Routing and Update Policy](../en/08-dev-strategy/decision-log/2026-07-ticket-routing-and-update-policy.md)
- [2026-07 Ticket Action and History Execution](../en/08-dev-strategy/decision-log/2026-07-ticket-action-and-history-execution.md)

---

## Summary

The current ticket system uses precise persisted statuses, REMOTE draft rows,
phase-aware approval/work routing, attachment preparation, server-controlled
ticket actions, immutable event history, and work-session evidence. The spec
separates current implementation from deferred production infrastructure and
links detailed rules to the current design documents.
