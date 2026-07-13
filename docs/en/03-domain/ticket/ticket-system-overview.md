# Ticket System Overview

## Goal

This document is the high-level current design overview for the Service Desk
ticket system.

It summarizes the stable model and links to the canonical detail documents.
It does not repeat every operation rule. Use this document to understand the
shape of the system, then follow the links for execution details.

---

## Current Ticket System

```txt id="ticket-system-current"
Tenant-scoped settings
-> category-driven ticket intake
-> approval or work routing
-> command-based ticket actions
-> event-based history
-> work-session evidence
```

The Service Desk ticket domain is workflow-oriented. A ticket is not a generic
CRUD row. It has current state, current ownership, configuration context,
actions, history, attachments, and work-session records.

---

## Persisted Status Model

The current `TicketStatus` union is:

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

`Open`, `Approved`, and `Reopen` are not persisted statuses.

- `Open` may be used only as a UI grouping/search concept.
- Approval completion is recorded as `APPROVAL_APPROVED` history.
- Reopen is an action that currently moves `Resolved` back to `Working`.

Detail reads must not change status. Starting work is an explicit command.

Related document: [Ticket Lifecycle](./ticket-lifecycle.md)

---

## Draft

REMOTE draft is stored as a normal ticket row with `status = "Draft"`.

Current draft rules:

- one active draft per requester
- draft uses the ticket table, not a separate draft table
- draft save/update uses the draft API
- final submit reuses the draft row and moves it to `Approval` or `Assigned`
- operational lists and insights exclude draft tickets
- LOCAL draft uses a simplified demo-safe implementation behind the feature API
  boundary and is not persistence-equivalent to the REMOTE PostgreSQL draft model

Related document: [Ticket Form Design](../../06-form-design/ticket-form.md)

---

## Approval and Work Routing

Current routing source of truth:

```txt id="routing-source-of-truth"
tk_approval_step_id
tk_assignee_usernames
```

Interpretation:

```txt id="routing-phase"
tk_approval_step_id != null
-> assignmentPhase = APPROVAL
-> tk_assignee_usernames = current approvers

tk_approval_step_id == null
-> assignmentPhase = WORK
-> tk_assignee_usernames = current workers
```

DTOs expose projection fields for UI convenience:

- `assignmentPhase`
- `approvalAssigneeUsernames`
- `workAssigneeUsernames`
- `assignedApprover`
- `assignedWorker`

These are mapper/service projections, not separate database sources of truth.

Related documents:

- [Approval System](./strategy/approval-system.md)
- [Assignment Policy](./strategy/assignment-policy.md)

---

## Initial Routing

Ticket submission resolves routing from the selected category and requester.

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

Final approval either moves to the next approval step or resolves work
assignment and moves the ticket to `Assigned`.

Decline terminates approval routing:

```txt id="decline-routing"
status = Declined
approvalStepId = null
assigneeUsernames = []
```

---

## Requester Update Routing

Requester update is allowed only in the current implementation for requester
owned tickets in `Approval` or `Assigned`.

Routing-neutral fields:

- due date
- email recipients

Routing-sensitive fields:

- category
- subject
- content
- files
- images

Only actual normalized value changes trigger routing behavior. If only
routing-neutral fields change, status, approval step, and assignees are
preserved and history records `ROUTING_PRESERVED`.

If routing-sensitive values change, routing is recalculated from the beginning
and history records `ROUTING_RESET`.

When the category changes, priority, risk, and the minimum due date are
re-evaluated from the new category defaults. The next due date is the later of
the current due date and the new category minimum; category change must not pull
the due date earlier.

Related documents:

- [Ticket Lifecycle](./ticket-lifecycle.md)
- [Ticket Operation Rules](../../08-dev-strategy/ticket-operation-rules.md)

---

## Attachment Boundary

Ticket attachment input is prepared before ticket commands write metadata.

```txt id="attachment-flow"
File[] / inline image
-> Attachment Prepare API
-> prepared body, files, images
-> ticket command payload
-> tk_content, tk_files, tk_images
```

The current LOCAL and REMOTE behavior uses controlled demo replacement. It does
not provide production object storage.

Raw `File`, binary data, base64 data URLs, blob URLs, and local file paths must
not be persisted in ticket rows, DTOs, action metadata, or history metadata.

Related document: [Ticket Attachment Design](../../06-form-design/ticket-attachment.md)

---

## Ticket Action Command Model

Ticket actions are server-controlled commands.

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

Current action types:

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

Communication actions create timeline entries. Operational actions may mutate
status, assignees, planning fields, merge state, or close reason. Operational
actions are immutable in normal workflow.

Comments created before closure remain visible after `Closed`; that visibility
does not imply new comment creation is allowed after closure.

Related documents:

- [Ticket Activity Model](./ticket-activity.md)
- [Action Strategy](./strategy/action-strategy.md)

---

## Event-Based History

History is immutable event/audit data.

```txt id="history-shape"
type   -> changed domain area
source -> why or which rule produced it
event  -> what happened
actor  -> who initiated it
from/to value -> structured JSON change
metadata -> supplemental display/audit context
```

`event` is authoritative. `metadata.event` is not the event source of truth.
`SYSTEM_AUTO` is a history source, not a history type.

One action can produce multiple history records. Some system operations can
produce history without a ticket action row.

Related document: [Ticket History](./ticket-history.md)

---

## Work Session

Work Session records actual work-time evidence. It is separate from Ticket
Action.

Current route surface:

```txt id="work-session-routes"
GET  /api/service-desk/tickets/:ticketId/work-session
POST /api/service-desk/tickets/:ticketId/work-session
```

Current behavior:

- only current work assignees can track work
- `Assigned` requires transition to `Working`
- `Working` can move to `Pending` or `Resolved`
- `Pending` can move to `Working` or `Resolved`
- tracked minutes aggregate into the ticket work total
- GET does not mutate status
- timer-style start/finish/switch routes are not part of the current route surface

Related document: [Ticket Track Time](./ticket-track-time.md)

---

## Settings Relationship

Service Desk settings provide the behavior configuration used by ticket
workflows.

```txt id="settings-relationship"
Company
-> Service Desk Tenant
   -> Category
      -> Approval Step
      -> Assignment Rule
```

Tenant is the configuration scope. Category is the central behavior
configuration. Approval Step controls main-category approval routing.
Assignment Rule resolves work ownership with subcategory override and
parent/main fallback.

Related document: [Service Desk Settings](../service-desk-settings.md)

---

## Runtime Boundary

The UI uses feature API clients. Route handlers select LOCAL or REMOTE behavior.

```txt id="runtime-boundary"
UI
-> feature API client
-> Next.js Route Handler
-> LOCAL handler or REMOTE portal API/service
-> DTO
```

REMOTE uses server-only data access, row/mapper/DTO boundaries, repository
services, and transactions where workflow changes need atomicity.

LOCAL provides safe portfolio demo behavior and must keep DTO contracts aligned
with REMOTE where a workflow is supported.

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

## Summary

The current Service Desk ticket system is built around precise persisted
statuses, phase-aware routing, REMOTE draft rows, attachment preparation,
command-based actions, event-based history, work-session evidence, and
tenant-scoped settings.

The design goal is to keep workflow behavior explicit, auditable, and aligned
with the current implementation rather than with older `Open`/`Approved`
lifecycle terminology.
