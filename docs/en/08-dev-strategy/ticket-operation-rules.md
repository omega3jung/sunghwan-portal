# Ticket Operation Rules

## Goal

This document is the implementation-facing rule matrix for Service Desk ticket
operations.

It captures who can execute an operation, when it is allowed, what input it
accepts, what ticket state it changes, and which history event is produced.

Conceptual status meaning is documented in
[Ticket Lifecycle](../03-domain/ticket/ticket-lifecycle.md).

---

## Current Operation Surface

### Ticket Routes

```txt id="ticket-routes"
GET    /api/service-desk/tickets
POST   /api/service-desk/tickets
GET    /api/service-desk/tickets/search
GET    /api/service-desk/tickets/:ticketId
PUT    /api/service-desk/tickets/:ticketId
DELETE /api/service-desk/tickets/:ticketId
```

### Draft Routes

```txt id="draft-routes"
GET    /api/service-desk/tickets/draft
POST   /api/service-desk/tickets/draft
PUT    /api/service-desk/tickets/draft/:ticketId
DELETE /api/service-desk/tickets/draft/:ticketId
```

### Command Routes

```txt id="command-routes"
POST /api/service-desk/tickets/:ticketId/command/start-work
POST /api/service-desk/tickets/:ticketId/command/:action
```

`:action` is one of:

```txt id="command-actions"
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

### Subresource Routes

```txt id="subresource-routes"
GET   /api/service-desk/tickets/:ticketId/actions
GET   /api/service-desk/tickets/:ticketId/actions/:actionNo
PATCH /api/service-desk/tickets/:ticketId/actions/:actionNo

GET   /api/service-desk/tickets/:ticketId/histories

GET   /api/service-desk/tickets/:ticketId/work-session
POST  /api/service-desk/tickets/:ticketId/work-session
```

---

## Common Command Pipeline

```txt id="ticket-command-pipeline"
command request
-> authenticate
-> authorize
-> validate current status
-> validate payload
-> create action row when applicable
-> mutate ticket when applicable
-> create history rows
-> return DTO
```

Operational action creation, ticket mutation, and history creation must be
treated as one use case. REMOTE uses server-side services and transactions.
LOCAL uses demo-safe local handlers with the same DTO direction.

---

## Requester Update

- who: requester
- allowed status: `Approval`, `Assigned`
- input: category, subject, content, due date, email, prepared files/images
- validation:
  - requester owns the ticket
  - category is active and available
  - attachment metadata is already prepared
  - normalized previous/next values are compared
- ticket effect:
  - routing-neutral changes preserve status, approval step, assignees
  - routing-sensitive changes rerun routing from the first approval step
  - category changes can rederive priority and risk from category defaults
  - category changes re-evaluate the minimum due date from the new category SLA
    default and keep the later of current due date and new minimum
- action persistence: no ticket action row
- history event: `ROUTING_PRESERVED` or `ROUTING_RESET`
- notification boundary: not a separate notification source in the current docs
- query invalidation: ticket detail, ticket list/search, history

Routing-neutral fields:

- due date
- email recipients

Routing-sensitive fields:

- category
- subject
- content
- files
- images

---

## Submit Ticket

- who: requester
- allowed status:
  - new create with no draft
  - existing `Draft`
- input: ticket form values with prepared body/files/images
- validation:
  - category is valid
  - attachment metadata is prepared
  - approval or assignment can resolve at least one assignee
- ticket effect:
  - if next approval step exists: `Approval`
  - otherwise: `Assigned`
  - existing draft row is reused when present
- action persistence: no ticket action row
- history event:
  - `TICKET_SUBMITTED`
  - `APPROVAL_REQUESTED` or `ASSIGNMENT_RESOLVED`
- query invalidation: draft, ticket list/search/detail, history

---

## Start Work

- who: current work assignee
- allowed status: `Assigned`
- input: no body
- validation:
  - `approvalStepId = null`
  - actor is in current work assignees
- ticket effect: `Assigned -> Working`
- action persistence: no ticket action row
- history event: `STATUS_UPDATED`
- query invalidation: ticket detail/list/search, history

GET/read requests must not start work.

---

## Comment

- who: user with ticket access
- allowed status: all live non-`Draft`, non-`Closed` statuses
- input: content, prepared action attachments where supported
- validation:
  - content required
  - action path and payload type match
  - attachment payload cannot contain `blob:` or `data:` URLs
- ticket effect: none
- action persistence: `COMMENT`
- history event: `COMMENT_CREATED`
- notification boundary: shared communication can notify outside the command
  boundary
- query invalidation: action list, history, ticket recent activity

Soft delete:

- who: action writer
- disallowed status: `Draft`, `Closed`
- action type: `COMMENT` only
- history event: `COMMENT_DELETED`

The current route surface does not expose a comment update route, although the
history union reserves `COMMENT_UPDATED`.

Comments created before closure remain visible after `Closed`. This is timeline
visibility, not permission to create new comments on closed tickets.

---

## Note

- who: user with ticket access
- allowed status: all live non-`Draft`, non-`Closed` statuses
- input: content, prepared action attachments where supported
- validation: content required
- ticket effect: none
- action persistence: `NOTE`
- history event: `NOTE_CREATED`
- notification boundary: internal note, no external notification by default
- query invalidation: action list, history, ticket recent activity

Soft delete:

- who: action writer
- disallowed status: `Draft`, `Closed`
- action type: `NOTE` only
- history event: `NOTE_DELETED`

The current route surface does not expose a note update route, although the
history union reserves `NOTE_UPDATED`.

---

## Approve

- who: current approver, or Admin
- allowed status: `Approval`
- input: content only; approval actions reject files and inline images
- validation:
  - `approvalStepId != null`
  - actor is current approver unless Admin
  - content required
- ticket effect:
  - next approval step exists: stay `Approval`, move to next approvers
  - no next approval step: move to `Assigned`, resolve workers
- action persistence: `APPROVE`
- history event:
  - `APPROVAL_APPROVED`
  - `APPROVAL_REQUESTED` or `ASSIGNMENT_RESOLVED`
- query invalidation: ticket detail/list/search, actions, history

---

## Decline

- who: current approver, or Admin
- allowed status: `Approval`
- input: content only; approval actions reject files and inline images
- validation:
  - `approvalStepId != null`
  - actor is current approver unless Admin
  - content required
- ticket effect:
  - `Approval -> Declined`
  - `approvalStepId = null`
  - `assigneeUsernames = []`
- action persistence: `DECLINE`
- history event: `APPROVAL_DECLINED`
- query invalidation: ticket detail/list/search, actions, history

---

## Assign

- who:
  - current work assignee for work assignment
  - Admin for approval or work assignment override
- allowed status:
  - standard: `Assigned`, `Working`, `Pending`
  - Admin approval override: `Approval`
- input: content, assignee usernames
- validation:
  - content required
  - assignee list required
  - non-Admin actor must be a current work assignee
- ticket effect:
  - replace current assignee usernames
  - `Pending -> Working`
  - `Assigned`, `Working`, and `Approval` keep status unless mode resolves a
    status change
- action persistence: `ASSIGN`
- history event: `ASSIGNMENT_UPDATED`
- query invalidation: ticket detail/list/search, actions, history

Derived assignee emails must not be written into persisted `tk_email`.

---

## Assign Self

- who: current work assignee
- allowed status: `Assigned`, `Working`, `Pending`
- input: auto-generated content
- validation:
  - actor is already one of current workers
  - current work assignee list has at least two users
- ticket effect:
  - replace current assignees with actor only
  - status unchanged
- action persistence: `ASSIGN_SELF`
- history event: `ASSIGNMENT_UPDATED`
- query invalidation: ticket detail/list/search, actions, history

---

## Adjust

- who:
  - current work assignee
  - Admin
- allowed status:
  - standard: `Assigned`, `Working`, `Pending`
  - Admin correction: `Approval`, `Assigned`, `Working`, `Pending`,
    `Resolved`, `Closed`
- input: content, priority, risk level, due date
- validation:
  - content required
  - at least one planning field must change
  - resolved/closed Admin correction cannot change due date
- ticket effect:
  - update priority, risk, and due date where allowed
- action persistence: `ADJUST`
- history event: `PLANNING_UPDATED`
- query invalidation: ticket detail/list/search, actions, history

---

## Reject

- who: current work assignee, or Admin
- allowed status: `Assigned`, `Working`, `Pending`
- input: content
- validation:
  - content required
  - actor is work assignee unless Admin
- ticket effect:
  - status -> `Rejected`
  - running work sessions are finished where supported
- action persistence: `REJECT`
- history event: `TICKET_REJECTED`
- query invalidation: ticket detail/list/search, actions, history, work sessions

---

## Resubmit

- who: requester
- allowed status: `Declined`, `Rejected`
- input: content
- validation:
  - actor is requester
  - initial routing can resolve approval or workers
- ticket effect:
  - rerun initial routing
  - next approval step: `Approval`
  - no approval step: `Assigned`
- action persistence: `RESUBMIT`
- history event:
  - `TICKET_SUBMITTED`
  - `APPROVAL_REQUESTED` or `ASSIGNMENT_RESOLVED`
- query invalidation: ticket detail/list/search, actions, history

---

## Reopen

- who: requester, or Admin
- allowed status: `Resolved`
- input: content
- validation:
  - content required
  - existing work assignee is required
- ticket effect:
  - `Resolved -> Working`
  - assignees are preserved
- action persistence: `REOPEN`
- history type: `STATUS`
- history source: `USER_ACTION`
- history event: `TICKET_REOPENED`
- history from/to: `{ status: "Resolved" } -> { status: "Working" }`
- query invalidation: ticket detail/list/search, actions, history

---

## Merge

- who:
  - current work assignee for standard merge
  - Admin for override
- allowed status:
  - standard: `Assigned`, `Working`, `Pending`, `Resolved`
  - Admin override: `Approval`, `Declined`, `Assigned`, `Working`, `Pending`,
    `Rejected`, `Resolved`, `Closed`
- input: content, target ticket id
- validation:
  - target ticket is required
  - self-merge is forbidden
  - draft source or target is forbidden
  - already merged source or target is forbidden
  - source and target must belong to the same persisted category Tenant
  - same-scope merge is allowed
  - cross-scope merge is allowed only from `INTERNAL` to `PORTAL`
  - `PORTAL -> INTERNAL` and cross-Tenant merge are forbidden
  - the server derives Tenant and scope from stored ticket/category context;
    request fields are not authorization facts
  - domain merge rule accepts the source/target status pair
- ticket effect:
  - source ticket -> `Closed`
  - same-scope merge: `closeReason = Merged`
  - `INTERNAL -> PORTAL`: `closeReason = Escalated`
  - set merged target id/number
  - running work sessions are finished where supported
- action persistence: `MERGE`
- history event: `TICKET_MERGED`
- history metadata: close reason, source/target Tenant, source/target scope,
  merged target id/number, and operator reason
- content policy: merge links the tickets but never copies INTERNAL actions,
  history, attachments, or content into the PORTAL target
- query invalidation: ticket detail/list/search, actions, history, work sessions

---

## Cancel

- who: requester
- allowed status: `Approval`, `Declined`, `Assigned`, `Working`, `Pending`,
  `Rejected`
- input: content
- validation:
  - actor is requester
  - content required
- ticket effect:
  - status -> `Closed`
  - `closeReason = Canceled`
  - running work sessions are finished where supported
- action persistence: `CANCEL`
- history event: `TICKET_CANCELED`
- query invalidation: ticket detail/list/search, actions, history, work sessions

---

## Work Session Submit

The explicit start-work command route can move `Assigned -> Working` without
creating a work-session row. Work-session submission records work-time evidence
and may apply the supported status transitions below.

- who: current work assignee
- allowed status: `Assigned`, `Working`, `Pending`
- input:
  - `inputMode = duration | range`
  - tracked minutes
  - optional `nextStatus = Working | Pending | Resolved`
  - note
- validation:
  - actor is current work assignee
  - tracked minutes are positive
  - `Assigned` and `Pending` require an explicit status transition
  - allowed transitions:
    - `Assigned -> Working`
    - `Working -> Pending | Resolved`
    - `Pending -> Working | Resolved`
- ticket effect:
  - add tracked minutes to ticket aggregate
  - update status when `nextStatus` changes
  - resolving finishes running sessions where supported
- action persistence: no ticket action row
- history event: `STATUS_UPDATED` when status changes
- query invalidation: ticket detail/list/search, work-session list, history

Current route surface supports list/create. Feature-client methods for
work-session detail, update, delete, and timer start/finish/switch exist but do
not currently have matching route files.

---

## Resolved Auto Close

- who: system
- allowed status: `Resolved`
- input: cron/system request
- validation:
  - resolved-history grace window has elapsed
  - the grace window is measured from the latest history entry that resolved the
    ticket, not from generic ticket `updatedAt`
  - current grace value is 7 days
- ticket effect:
  - `Resolved -> Closed`
  - `closeReason = Completed`
  - running work sessions are finished where supported
- action persistence: no ticket action row
- history event: `RESOLUTION_CLOSE`
- history source: `SYSTEM_AUTO`
- history action link: `actionNo = null`
- query invalidation: system side effect, not user-triggered UI mutation

---

## Related Documents

- [Ticket System Overview](../03-domain/ticket/ticket-system-overview.md)
- [Ticket Lifecycle](../03-domain/ticket/ticket-lifecycle.md)
- [Ticket Activity Model](../03-domain/ticket/ticket-activity.md)
- [Action Strategy](../03-domain/ticket/strategy/action-strategy.md)
- [Ticket History](../03-domain/ticket/ticket-history.md)
- [Ticket Track Time](../03-domain/ticket/ticket-track-time.md)

---

## Summary

Ticket operations are command-driven. Every operation has an actor, status
guard, payload contract, ticket effect, action persistence rule, and history
event. Hidden status mutation is not allowed.
