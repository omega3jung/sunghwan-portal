# Service Desk Implementation Strategy

## Goal

This document explains how the current Service Desk module is implemented in
`sunghwan-portal`.

It focuses on implementation boundaries that are now present in the codebase:

- LOCAL/REMOTE runtime branching through route handlers
- tenant-scoped settings
- REMOTE ticket drafts
- attachment preparation
- approval and work routing
- Ticket Action command execution
- event-based ticket history
- work sessions
- React Query ownership of server state

Conceptual evolution belongs in
[`service-desk-evolution.md`](service-desk-evolution.md). Historical decisions
belong in the `decision-log` directory.

---

## Runtime Strategy

The Service Desk runtime is selected at the API/server boundary, not inside
deep UI components.

```txt id="runtime-flow"
UI
-> feature API client
-> Next.js route handler
-> LOCAL handler or REMOTE data service
```

The UI should consume the same application-facing DTO shapes whether the data
comes from LOCAL demo state or REMOTE persistence.

### LOCAL Runtime

LOCAL runtime exists for portfolio/demo workflows. It may use server-side
mutable demo state and controlled reset behavior.

LOCAL runtime should still respect the same public API contract as REMOTE where
the feature is implemented.

### REMOTE Runtime

REMOTE runtime uses server-side data services, repositories, row mappers, and
DTOs under `src/server/data`.

REMOTE implementation currently covers the major Service Desk workflows:

- settings tenant/category/approval-step/assignment-rule reads and mutations
- ticket create, read, search, requester update, and draft behavior
- ticket action execution
- ticket history retrieval and recording
- work-session list and creation
- automatic close of expired resolved tickets

REMOTE does not mean every production infrastructure concern is complete. For
example, attachment binaries are still replaced by controlled demo assets.

---

## Route Handler Boundary

Next.js route handlers are orchestration boundaries.

They should:

- parse HTTP input
- resolve session/runtime context
- delegate to feature/domain handlers
- return application-facing DTOs

They should not own:

- SQL details
- row-to-DTO mapping
- business rule branching
- attachment preparation internals
- ticket history construction beyond delegation

Important Service Desk route surfaces include:

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

## Settings Implementation

Service Desk Settings are tenant-scoped behavior configuration.

```txt id="settings-boundary"
Company reference data
-> Service Desk Tenant
-> Category / Approval Step / Assignment Rule
-> Ticket workflow
```

Current settings implementation uses:

- `Tenant` with `companyId`, localized `name`, `color`, and `active`
- category scope values `"PORTAL"` and `"INTERNAL"`
- main/subcategory hierarchy
- ordered approval steps with typed assignees
- group-based assignment rules with job-field IDs and employee usernames
- React Query for settings server state

The settings UI must not treat settings as client-owned Zustand data. Settings
changes affect future workflow resolution. Existing ticket history keeps the
meaning of already executed ticket events.

---

## Draft Implementation

REMOTE draft is implemented as a ticket row in `Draft` status.

Key behavior:

- one active draft per requester
- create dialog loads an active draft when available
- dirty create forms can save a draft on close
- final create can reuse the existing draft row
- draft discard removes the active draft workflow

Drafts do not provide durable attachment recovery. Browser `File` objects are
transient, and production object storage is not implemented in the current
scope.

---

## Attachment Implementation

Attachment handling uses an explicit preparation boundary.

```txt id="attachment-implementation-flow"
browser File[] and rich-text body
-> POST /api/service-desk/tickets/attachments/prepare
-> prepared body, files, images
-> ticket command payload
```

The Prepare API:

- validates file names, extensions, and size limits
- replaces selected files with controlled demo file URLs
- replaces inline data images with controlled demo image URLs
- rejects unsupported image sources
- returns normalized metadata

Ticket write commands persist prepared metadata only. They do not persist raw
binary files.

---

## Ticket Workflow Implementation

Current ticket statuses are:

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

Legacy row values may still be normalized by mappers, but current design docs
must not describe `Open`, `Approved`, or `Reopen` as active statuses.

Create/submit behavior:

- submitted tickets enter `Approval` when an approval step is required
- otherwise they enter `Assigned`
- submit records event-based history

Requester update behavior:

- allowed only for the requester
- allowed only in `Approval` and `Assigned`
- routing-sensitive changes reset routing
- routing-neutral changes preserve routing

Explicit work start:

- `start-work` moves an assigned worker from `Assigned` to `Working`
- the current work assignee must execute the command
- the status change is recorded in history

---

## Approval and Work Routing

Routing is phase-aware.

```ts id="assignment-phase"
type TicketAssignmentPhase = "APPROVAL" | "WORK";
```

The ticket row stores the current routing facts:

- current approval step ID
- current assignee usernames

The DTO exposes phase-aware projections:

- `assignmentPhase`
- `approvalAssigneeUsernames`
- `workAssigneeUsernames`
- `assignedApprover`
- `assignedWorker`

Approval steps and assignment rules are settings. They are resolved into ticket
state when a workflow transition needs them. Existing tickets do not silently
change just because settings changed later.

Approval and assignment do not share one generic category inheritance rule.
Approval resolution uses the selected category's parent/main category approval
steps. Work assignment resolution checks the selected subcategory rule first and
falls back to the parent/main category rule only when needed.

---

## Ticket Action Implementation

Ticket actions are command execution paths.

Current action types:

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

Current command path names are lower/camel case:

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

Action rules own:

- who may execute an action
- which statuses allow the action
- whether content, reason, or attachment input is accepted
- what status/routing/history effect occurs

Operational actions are immutable after execution. Comment and note entries can
currently be soft-deleted through the action detail route.

---

## Event-Based History Implementation

History is event-based.

The current model separates:

- `type`: broad history category
- `source`: why the change was produced
- `event`: exact domain event
- previous/current value fields
- actor and timestamp

The event enum is the authoritative event classification. Older descriptions
that rely on `metadata.event` or legacy action names are not current.

History is created by successful commands, not by UI intent alone.

Examples:

- create submit -> `TICKET_SUBMITTED`
- approval request -> `APPROVAL_REQUESTED`
- assignment resolution -> `ASSIGNMENT_RESOLVED`
- requester update with routing reset -> `ROUTING_RESET`
- requester update with routing preserved -> `ROUTING_PRESERVED`
- work-session creation -> `WORK_SESSION_STARTED`, `WORK_SESSION_STOPPED`, or
  `WORK_SESSION_UPDATED`
- reopen action -> `TICKET_REOPENED` as the authoritative status event
- automatic resolved-ticket close -> `RESOLUTION_CLOSE` with `SYSTEM_AUTO` and
  `actionNo = null`

---

## Work Session Implementation

Work sessions represent operational work evidence.

The current route surface is:

```txt id="work-session-route"
GET  /api/service-desk/tickets/[ticketId]/work-session
POST /api/service-desk/tickets/[ticketId]/work-session
```

Current implemented behavior:

- list work sessions for a ticket
- create manual duration/range sessions
- apply supported work-status transition from `Assigned` to `Working` during
  work-session creation
- move `Working` or `Pending` tickets to the submitted next status when allowed
- restrict write behavior to the current work assignee
- record work-session history events

The feature client contains helpers for additional work-session operations such
as detail/update/delete/timer-style flows, but matching route handlers are not
currently implemented. Those helpers should be treated as extension points until
the API surface exists.

---

## React Query Implementation

React Query owns server state.

Current Service Desk query families include:

- ticket list/search/detail
- active draft by data scope and user
- ticket actions list/detail
- ticket histories
- work sessions
- settings tenants/categories/approval steps/assignment rules

Mutations should invalidate targeted query families. They should not manually
duplicate server state into Zustand.

---

## Deferred Production Scope

The current implementation intentionally leaves these as future work:

- durable object storage for attachment binaries
- production notification delivery
- full work-session timer/update/delete route surface
- complete SLA breach/escalation engine
- settings versioning and approval workflow
- full audit/compliance export
- real-time updates through WebSocket or subscriptions
- enterprise-grade load balancing for assignment rules

These are not described as completed current behavior in current design docs.

---

## Related Documents

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

## Summary

The current Service Desk implementation is no longer only a LOCAL mock design.
It includes REMOTE drafts, attachment preparation, tenant-scoped settings,
approval/work routing, command-based ticket actions, event-based history, and
work-session recording.

The implementation strategy is to keep UI contracts stable, route handlers thin,
server services authoritative, and deferred production infrastructure explicitly
separate from completed behavior.
