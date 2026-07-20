# Action Strategy

## Goal

This document defines the current Ticket Action command execution strategy.

Ticket Action is not generic CRUD. It is a server-controlled command pipeline
that validates status, permissions, input, ticket effects, and history.

---

## Current Action Union

```txt id="ticket-action-union"
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

Route paths use:

```txt id="ticket-action-route-paths"
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

The explicit start-work command is implemented as a separate command route, not
as a Ticket Action union member:

```txt id="start-work-command-route"
POST /api/service-desk/tickets/:ticketId/command/start-work
```

---

## Command Pipeline

```txt id="ticket-action-pipeline"
POST /api/service-desk/tickets/:ticketId/command/:action
-> authenticate current employee
-> resolve user role
-> normalize payload
-> validate action/status/permission
-> insert action row
-> apply ticket effect
-> create history rows
-> return action DTO
```

Approval commands use the same command route but validate a stricter payload:
content only, no files or inline images.

---

## Permission and Status Guards

Each action has a status guard and ownership rule.

Examples:

- approver or Admin can `APPROVE`/`DECLINE` in `Approval`
- current work assignee or Admin can `ASSIGN`, `ADJUST`, `REJECT`, `MERGE`
  where status allows
- requester can `RESUBMIT`, `REOPEN`, or `CANCEL` where status allows
- Admin can override selected assignment, adjustment, merge, and rejection
  paths

The detailed matrix is in
[Ticket Operation Rules](../../../08-dev-strategy/ticket-operation-rules.md).

---

## Transaction Boundary

REMOTE command execution groups the action row, ticket mutation, and history
rows as one use case.

This matters because operational action results must not partially commit:

```txt id="action-transaction"
action row
+ ticket mutation
+ history rows
= one command result
```

LOCAL command execution mirrors the same contract with demo-safe mutable state.

---

## Action-Specific Inputs

Common input:

- `content`
- optional prepared files/images for supported non-approval actions

Action-specific input:

- `ASSIGN`: `assigneeUsernames`
- `ADJUST`: `priority`, `riskLevel`, `dueAt`
- `MERGE`: `targetTicketId`
- `APPROVE`/`DECLINE`: content only

Every action requires content, except the UI may generate content for
`ASSIGN_SELF`.

`MERGE` also covers the controlled handoff of an existing `INTERNAL` ticket
into an existing `PORTAL` ticket. It does not create the target ticket. The
server permits same-scope merge inside one Tenant and the one-way
`INTERNAL -> PORTAL` transition inside that same Tenant. The latter retains
the `MERGE` action and `TICKET_MERGED` event but closes the source with
`closeReason = Escalated`. Reverse-scope and cross-Tenant merge are rejected.

---

## Mutability Policy

### Communication Actions

`COMMENT` and `NOTE` are user-facing communication entries.

Existing comments remain visible after a ticket is `Closed`. Visibility of an
existing row is different from permission to create a new row after closure.
New communication rows are governed by the closed-ticket operation rules.

Current route behavior supports soft delete by the original writer when the
ticket is not `Draft` or `Closed`.

### Operational Actions

Operational actions are immutable.

Examples:

- `ASSIGN`
- `ADJUST`
- `REJECT`
- `MERGE`
- `REOPEN`
- `RESUBMIT`
- `CANCEL`
- approval actions

If an operational decision needs correction, create a new corrective command.

---

## Action Without Ticket Mutation

`COMMENT` and `NOTE` insert action rows and history without changing status.

The start-work command changes ticket status without inserting a Ticket Action
row: `Assigned -> Working`, with `STATUS_UPDATED` history.

Some system operations can create history without any action row. For example,
resolved auto-close creates `RESOLUTION_CLOSE` with source `SYSTEM_AUTO` and
`actionNo = null`.

---

## Notification Boundary

Action commands may provide the point where notification should be triggered,
but persisted ticket fields must not be polluted with derived notification
recipients.

In particular, assignment commands must not append resolved assignee emails to
`tk_email`. Assignee emails should be resolved at notification-send time.

Production notification delivery is deferred unless explicitly implemented.

---

## LOCAL and REMOTE Parity

Both runtime paths should expose the same action command surface and DTO shape.

```txt id="action-runtime"
LOCAL command handler
REMOTE portal API/service
-> TicketActionDto
```

Differences in storage implementation should remain behind the route handler.

---

## Related Documents

- [Ticket Activity Model](../ticket-activity.md)
- [Ticket History](../ticket-history.md)
- [Ticket Operation Rules](../../../08-dev-strategy/ticket-operation-rules.md)
- [Ticket Lifecycle](../ticket-lifecycle.md)

---

## Summary

Ticket Action is the command layer for Service Desk operations. It validates
status and actor rules, creates action records, applies ticket effects, and
creates immutable history. It keeps communication timeline entries separate
from event/audit history.
