# Ticket Lifecycle

## Goal

The ticket lifecycle defines the current persisted statuses and the explicit
commands that move a ticket between them.

This document is the status and transition reference. Operation-specific
permission details are documented in
[Ticket Operation Rules](../../08-dev-strategy/ticket-operation-rules.md).

---

## Persisted Statuses

```txt id="ticket-statuses"
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

- `Open` may be used only as a frontend grouping/search concept.
- Approval completion is recorded as `APPROVAL_APPROVED` history.
- Reopen is an action. Its current result is `Resolved -> Working`.

---

## Main Flow

```txt id="main-lifecycle-flow"
Draft
-> Approval | Assigned
-> Working
<-> Pending
-> Resolved
-> Closed
```

Approval, rejection, resubmission, merge, cancel, and auto-close add controlled
branches around this main flow.

---

## State Definitions

### Draft

- requester is preparing a ticket
- REMOTE draft is a normal ticket row with `status = Draft`
- not part of operational ticket lists or insight views
- final submit reuses the same row and routes it to `Approval` or `Assigned`

### Approval

- submitted ticket is waiting for approval
- `approvalStepId != null`
- `assigneeUsernames` means current approvers
- approve can advance to another approval step or move to work assignment
- decline moves to `Declined`

### Declined

- approval was rejected
- approval routing is terminated
- `approvalStepId = null`
- `assigneeUsernames = []`
- requester may resubmit through initial routing

### Assigned

- work assignees have been resolved
- work has not started
- `approvalStepId = null`
- `assigneeUsernames` means current workers
- explicit `start-work` command moves to `Working`
- work-session submission may also apply supported work-status transitions

### Working

- ticket is in active work
- current work assignees own execution
- work sessions can add tracked minutes
- work-session control can move to `Pending` or `Resolved`

### Pending

- work is paused or waiting
- current work assignees still own the ticket
- assignment can reactivate it to `Working`
- work-session control can move to `Working` or `Resolved`

### Rejected

- work assignee or Admin rejected execution
- requester may resubmit through initial routing
- running work sessions are finished where supported

### Resolved

- work result is complete
- requester or Admin can reopen to `Working`
- system auto-close can move it to `Closed` after the resolved-history grace
  window

### Closed

- terminal state for normal workflow
- merge, cancel, or auto-close produces this state
- normal operational actions are blocked, except documented Admin exceptions

---

## Transition Reference

| From | To | Trigger | Primary History |
| --- | --- | --- | --- |
| `Draft` | `Approval` | final submit with approval step | `TICKET_SUBMITTED`, `APPROVAL_REQUESTED` |
| `Draft` | `Assigned` | final submit without approval step | `TICKET_SUBMITTED`, `ASSIGNMENT_RESOLVED` |
| `Approval` | `Approval` | approve non-final step | `APPROVAL_APPROVED`, `APPROVAL_REQUESTED` |
| `Approval` | `Assigned` | approve final step | `APPROVAL_APPROVED`, `ASSIGNMENT_RESOLVED` |
| `Approval` | `Declined` | decline | `APPROVAL_DECLINED` |
| `Declined` | `Approval` or `Assigned` | requester resubmit | `TICKET_SUBMITTED` plus routing history |
| `Assigned` | `Working` | start-work command; work-session submission may also transition | `STATUS_UPDATED` |
| `Working` | `Pending` | work session with next status | `STATUS_UPDATED` |
| `Pending` | `Working` | work session with next status, or assign from Pending | `STATUS_UPDATED` or `ASSIGNMENT_UPDATED` |
| `Working`/`Pending` | `Resolved` | work session with next status | `STATUS_UPDATED` |
| `Assigned`/`Working`/`Pending` | `Rejected` | reject action | `TICKET_REJECTED` |
| `Rejected` | `Approval` or `Assigned` | requester resubmit | `TICKET_SUBMITTED` plus routing history |
| `Resolved` | `Working` | reopen action | `TICKET_REOPENED` |
| `Approval`/`Declined`/`Assigned`/`Working`/`Pending`/`Rejected` | `Closed` | requester cancel | `TICKET_CANCELED` |
| active work statuses or Admin-allowed statuses | `Closed` | merge source ticket | `TICKET_MERGED` |
| `Resolved` | `Closed` | system auto-close | `RESOLUTION_CLOSE` |

---

## Routing Rules

Initial submit and resubmit use the same routing shape.

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

Final approval resolves the next approval step first. If there is no next step,
assignment rules resolve work assignees and the ticket moves to `Assigned`.

Decline ends approval routing:

```txt id="decline-routing"
status = Declined
approvalStepId = null
assigneeUsernames = []
```

---

## Requester Update

Requester update is currently allowed in `Approval` and `Assigned` for the
ticket requester.

Routing-neutral changes preserve status, approval step, and assignees.

- due date
- email recipients

Routing-sensitive changes rerun routing from the beginning.

- category
- subject
- content
- files
- images

History records the result as `ROUTING_PRESERVED` or `ROUTING_RESET`.

When category changes, default priority, default risk level, and the minimum due
date are re-evaluated from the new category. The next due date is the later of
the current due date and the new category minimum, so category change never
pulls the due date earlier.

---

## Work Session and Status

Start Work and Work Session have separate responsibilities. The start-work
command starts ticket workflow execution by moving `Assigned -> Working`. Work
Session is not a Ticket Action; it records work-time evidence and may apply a
supported work-status transition.

Current work-session status transitions:

```txt id="work-session-status"
Assigned -> Working
Working -> Pending | Resolved
Pending -> Working | Resolved
```

Timer stop is not a separate route in the current route surface and does not
implicitly resolve a ticket. GET requests never start work or mutate status.

---

## Auto Close

Resolved auto-close is a system operation.

- source: `SYSTEM_AUTO`
- event: `RESOLUTION_CLOSE`
- from: `Resolved`
- to: `Closed`
- close reason: `Completed`
- grace window: 7 days
- action link: `actionNo = null`
- running work sessions are finished where supported

The implementation uses resolved-history timing rather than a generic
`updatedAt` rule.

---

## Forbidden Shortcuts

The current lifecycle forbids implicit or hidden transitions.

Examples:

- reading ticket detail must not start work
- `Draft` must not jump directly to `Working`
- approval completion must not create an `Approved` status
- reopen must not create a `Reopen` status
- work-session GET must not mutate status
- attachment preparation alone must not create history

---

## Related Documents

- [Ticket System Overview](./ticket-system-overview.md)
- [Ticket Operation Rules](../../08-dev-strategy/ticket-operation-rules.md)
- [Approval System](./strategy/approval-system.md)
- [Assignment Policy](./strategy/assignment-policy.md)
- [Ticket Track Time](./ticket-track-time.md)
- [Ticket History](./ticket-history.md)

---

## Summary

The current lifecycle is precise and action-driven. Persisted status names
represent current responsibility. Approval/work ownership is derived from
`approvalStepId` and `assigneeUsernames`, and every status transition must come
from an explicit command, workflow rule, or system operation.
