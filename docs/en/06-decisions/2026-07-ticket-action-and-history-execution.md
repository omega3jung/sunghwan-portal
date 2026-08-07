# Ticket Action and History Execution (2026-07)

## Context

The Service Desk previously introduced `TicketAction` to replace a comment-centered interaction model.

The core idea was:

```txt
Comment is data.
Action is behavior.
```

That model allowed the system to represent ticket interactions such as:

- `COMMENT`
- `NOTE`
- `ASSIGN`
- `ASSIGN_SELF`
- `ADJUST`
- `APPROVE`
- `DECLINE`
- `REJECT`
- `RESUBMIT`
- `REOPEN`
- `MERGE`
- `CANCEL`

The earlier action decision explained why actions should exist as first-class domain entities.

The July 2026 work needed to define how actions actually execute against PostgreSQL-backed tickets.

A ticket action may affect more than the action timeline.

Depending on the type, one command may need to:

- validate the current user
- validate ticket visibility
- validate the current status
- validate action-specific input
- create a Ticket Action record
- update ticket fields
- change approval routing
- change work assignment
- change ticket status
- create immutable History records
- finish related work sessions when a lifecycle command requires it
- expose a future notification integration point

This revealed that a Ticket Action cannot be implemented as a simple insert into `ticket_action`.

---

## Core Principle

```txt
Ticket Action
= user intent + validated context + controlled effect
```

```txt
Ticket History
= immutable record of the effect that occurred
```

The execution relationship is:

```txt
Command
-> authenticate
-> authorize
-> validate current state
-> insert action when applicable
-> mutate ticket when applicable
-> create history
-> return stable DTOs
```

An action is not complete merely because an activity row was inserted.

The ticket state and history must reflect the same successfully executed command.

---

## Problem

### 1. Action insert alone did not represent the operation

This simple implementation is insufficient:

```txt
POST action
-> INSERT ticket_action
```

It works for a basic comment, but operational actions need effects.

Examples:

- `ASSIGN` may update assignees and status.
- `APPROVE` may advance approval or resolve work assignment.
- `ADJUST` may update priority, risk level, or due date.
- `MERGE` may close the source ticket and store a merge reference.
- `CANCEL` may close the ticket and record a close reason.

The action row explains the user's intent.

The command must also apply the resulting domain effect.

---

### 2. Ticket, action, and history writes could diverge

Without one command boundary, partial results are possible.

Example:

```txt
Insert ASSIGN action succeeds
-> ticket assignment update fails
```

The timeline would show an assignment that never occurred.

The reverse is also unsafe:

```txt
Ticket update succeeds
-> action or history insert fails
```

The ticket would change without a complete audit trail.

Operational commands need transactional consistency.

---

### 3. History semantics needed one authoritative event field

The earlier history model could represent "what happened" in multiple places:

```txt
historyAction = UPDATED
metadata.event = APPROVAL_APPROVED
type = APPROVAL
```

That made filtering, display, and validation ambiguous.

The model needed one first-class semantic event field.

---

### 4. `SYSTEM` mixed source and domain area

History type should describe the affected area:

- `TICKET`
- `STATUS`
- `ASSIGNMENT`
- `APPROVAL`
- `COMMENT`
- `NOTE`
- `PLANNING`

System-generated behavior describes source, not domain area.

```txt
type
-> what area changed

source
-> which behavior or rule produced it
```

A system close is still a status event.

It should be:

```txt
type = STATUS
source = SYSTEM_AUTO
event = RESOLUTION_CLOSE
```

---

### 5. String-only before/after values were too weak

Simple strings can represent one status change:

```txt
fromValue = "Open"
toValue = "Working"
```

They do not represent richer effects well:

- previous and next assignees
- approval step progression
- planning changes
- merge target context
- routing reset details

Structured JSON values are needed for audit and future reporting.

---

### 6. LOCAL and REMOTE needed the same command meaning

LOCAL uses mutable demo state.

REMOTE uses PostgreSQL repositories and transactions.

The persistence mechanisms differ, but observable command behavior should not drift.

Example of unacceptable drift:

```txt
LOCAL assign
-> update assignee only

REMOTE assign
-> update assignee and status
```

Runtime differences must stay behind the Route Handler and command boundaries.

---

## Decision

Execute Ticket Actions as server-controlled commands.

The command boundary includes:

- authorization
- current-state validation
- action-specific validation
- action persistence
- ticket mutation
- history creation
- work-session side effects when required
- future notification intent/resolution

For operational actions, execute required writes in a transaction so that:

```txt
Ticket Action
Ticket mutation
Ticket History
```

remain consistent.

Use `tkh_event` as the authoritative History event field.

Do not use `metadata.event` as the primary event.

Use separate History dimensions:

```txt
type
-> affected domain area

event
-> what happened

source
-> which action, rule, or system behavior produced it
```

Store `fromValue` and `toValue` as structured JSON values.

---

## Scope Rules

### 1. Keep Route Handlers thin

The Route Handler is responsible for:

- parsing HTTP input
- resolving session and role context
- selecting LOCAL or REMOTE execution
- delegating to the command layer
- returning mapped DTOs

It should not own ticket mutation or history rules directly.

---

### 2. Execute commands with trusted server context

The client sends intent and action-specific input.

Example:

```ts
type AssignTicketActionInput = {
  actionType: "ASSIGN";
  content: string;
  assigneeUsernames: string[];
};
```

The client must not send trusted final effects such as:

```ts
{
  status: "Working",
  approvalStepId: null,
  historyEvent: "ASSIGNMENT_UPDATED"
}
```

Those values are resolved on the server from:

- authenticated user
- role
- ticket ownership
- current status
- current approval phase
- current assignees
- action rules

---

### 3. Use a shared validation pipeline

Every command should pass through common checks:

- ticket exists
- ticket is active
- actor can view or operate on the ticket
- action path and payload match
- action content is present when required
- current status allows the action
- actor satisfies requester, approver, assignee, or admin rules
- Draft tickets reject normal operational actions
- Closed tickets reject normal mutations unless an admin exception is explicit

UI action visibility is only a convenience layer.

```txt
Permission-aware UI
!= authorization boundary
```

---

### 4. Keep action-specific effects explicit

Each action handler describes the effect of a valid command.

Conceptually:

```ts
type TicketActionEffect = {
  action: TicketActionInsert;
  ticketPatch?: TicketPatch;
  histories: TicketHistoryInsert[];
  notification?: TicketNotificationIntent;
};
```

The exact TypeScript shape can evolve.

The important rule is that effects are server-generated and explicit.

---

### 5. Persist action intent

A Ticket Action stores user-facing intent and activity.

Core information includes:

- ticket ID
- per-ticket action number
- action type
- content or reason
- action-specific metadata
- files or images where supported
- owner username
- active flag
- created timestamp

The action number is scoped per ticket:

```txt
ticket A -> action 1, action 2, action 3
ticket B -> action 1
```

---

### 6. Separate communication and operational mutability

Communication actions:

- `COMMENT`
- `NOTE`

These may be edited or soft-deleted under controlled rules.

Typical restrictions:

- only the author can change the action
- closed tickets block normal edits
- deletion is soft deletion with `active = false`
- changes create History

Operational actions:

- `ASSIGN`
- `ASSIGN_SELF`
- `ADJUST`
- `APPROVE`
- `DECLINE`
- `REJECT`
- `RESUBMIT`
- `REOPEN`
- `MERGE`
- `CANCEL`

These are immutable after execution.

Incorrect operational decisions should be corrected by a new command, not by rewriting the old action.

---

### 7. Keep History event-oriented

The service-level history type is:

```ts
type TicketHistoryType =
  | "TICKET"
  | "STATUS"
  | "CATEGORY"
  | "ASSIGNMENT"
  | "APPROVAL"
  | "COMMENT"
  | "NOTE"
  | "PLANNING";
```

The current source values are:

```ts
type TicketHistorySource =
  | "USER_ACTION"
  | "SYSTEM_AUTO"
  | "ROUTING_RULE"
  | "APPROVAL_RULE"
  | "ASSIGNMENT_RULE";
```

The current event values include:

```txt
TICKET_SUBMITTED
TICKET_UPDATED
TICKET_REOPENED
TICKET_REJECTED
TICKET_MERGED
TICKET_CANCELED
CATEGORY_UPDATED
STATUS_UPDATED
RESOLUTION_CLOSE
APPROVAL_REQUESTED
APPROVAL_APPROVED
APPROVAL_DECLINED
ASSIGNMENT_RESOLVED
ASSIGNMENT_UPDATED
COMMENT_CREATED
COMMENT_UPDATED
COMMENT_DELETED
NOTE_CREATED
NOTE_UPDATED
NOTE_DELETED
PLANNING_UPDATED
WORK_SESSION_STARTED
WORK_SESSION_STOPPED
WORK_SESSION_UPDATED
WORK_SESSION_DELETED
ROUTING_RESET
ROUTING_PRESERVED
```

Event names must match the domain union.

Do not introduce ad hoc assignment-change event names when the supported event is `ASSIGNMENT_UPDATED`.

---

### 8. Keep metadata supplemental

History metadata may include display and audit context:

- changed fields
- previous and next status labels
- assignee usernames
- approval step IDs
- merge target ID
- routing reset details
- action-specific reason context

Metadata must not become a second authoritative event system.

The row-level `tkh_event` remains the required event.

---

### 9. Use structured before/after values

`fromValue` and `toValue` should store structured JSON when the change is richer than one primitive.

Examples:

```json
{
  "assigneeUsernames": ["worker-a"]
}
```

```json
{
  "priority": "high",
  "riskLevel": "medium",
  "dueAt": "2026-07-20T00:00:00.000Z"
}
```

History granularity should follow meaningful domain effects, not raw database column count.

---

### 10. Keep notification recipients out of ticket email settings

Ticket email metadata stores requester-configured recipients.

Routing recipients are different:

- current approvers
- current workers
- action-specific recipients

Assignment or approval actions must not permanently append derived assignee emails into `tk_email`.

Notification delivery should resolve trusted employee email addresses on the server at send time.

If delivery is deferred or simulated, it still must not corrupt ticket email configuration.

---

### 11. Keep work sessions separate from Ticket Actions

Work tracking is related to ticket execution, but it is not a normal Ticket Action.

Work-session commands include:

- start
- finish
- switch
- manual update

They operate on work-session records.

```txt
Ticket Action
-> meaningful timeline interaction or operational decision

Work Session
-> evidence of actual working time
```

Opening or reading a ticket must not mutate status.

Stopping a timer must not automatically resolve a ticket.

---

### 12. Treat automatic close as a system command

Resolved tickets may be closed automatically after the configured grace period.

The baseline is the resolution history event timestamp, not generic `updatedAt`.

Current direction:

```txt
resolution event + 7 days
-> Closed
```

Automatic close creates History without a Ticket Action.

Example:

```txt
type = STATUS
event = RESOLUTION_CLOSE
source = SYSTEM_AUTO
actorUsername = null
actionNo = null
```

Read requests must remain read-only.

---

## What Was Aligned

### 1. Command execution

Action execution is a server use case, not a generic activity insert.

REMOTE commands use PostgreSQL repositories inside a transaction.

LOCAL commands follow the same conceptual command behavior using demo state.

---

### 2. Transaction boundary

For operational actions, required writes are grouped:

```txt
BEGIN
1. load current ticket
2. validate latest status and permission
3. insert Ticket Action
4. mutate Ticket
5. insert Ticket History
6. apply related work-session side effects where required
COMMIT
```

If a required step fails, the command rolls back.

---

### 3. History model

History is modeled around:

```txt
type + event + source + actor + fromValue + toValue + metadata
```

This makes history useful for audit, filtering, display, and reporting.

---

### 4. Action examples

Comment:

```txt
validate ticket access
-> insert COMMENT action
-> create COMMENT_CREATED history
```

Assign:

```txt
validate assignment permission
-> insert ASSIGN action
-> update assignees
-> create ASSIGNMENT_UPDATED history
```

Approve:

```txt
validate current approver
-> insert APPROVE action
-> create APPROVAL_APPROVED history
-> resolve next approval step or work assignment
-> create APPROVAL_REQUESTED or ASSIGNMENT_RESOLVED history
```

Merge:

```txt
validate source and target tickets
-> require the same persisted category Tenant
-> allow the same scope or one-way INTERNAL -> PORTAL
-> insert MERGE action
-> close source as Merged or Escalated from the derived scope relationship
-> create TICKET_MERGED history
```

---

## Consequences

### Positive

- Action, ticket effect, and history stay consistent.
- Server authorization is the real command boundary.
- History uses first-class `type`, `event`, and `source`.
- Operational actions are auditable and immutable.
- LOCAL and REMOTE expose the same action semantics.
- Work tracking and ticket actions remain distinct.
- Notification design can be added without mutating ticket email settings.
- The portfolio demonstrates command handling and audit-oriented modeling.

---

### Negative / Trade-offs

- Operational actions need more structure than generic CRUD.
- Event names must be maintained carefully.
- Complex commands can create multiple history records.
- Transactions require repository coordination.
- Notification delivery remains a separate reliability problem.
- LOCAL atomicity is simulated rather than provided by database infrastructure.

---

## Follow-up Policy

- Do not implement operational actions as plain action-row inserts.
- Keep route handlers thin and command services responsible for effects.
- Keep `tkh_event` as the authoritative event field.
- Keep `metadata` supplemental.
- Use supported event names from the domain union.
- Do not mutate ticket status in GET/read flows.
- Do not treat timer finish as ticket resolution.
- Keep derived notification recipients out of `tk_email`.
- When adding a new action type, define its allowed statuses, permission rule, ticket effect, history events, and query invalidation targets.

---

## Summary

Ticket Action is now treated as a controlled Service Desk command.

The model is:

```txt
Ticket Action
= user-facing intent and command input

Ticket
= current workflow state

Ticket History
= immutable event record of what actually changed
```

The execution model is:

```txt
User submits action
-> server resolves trusted context
-> shared guards validate access and state
-> action-specific logic applies effect
-> transaction persists action, ticket changes, and history
-> affected client queries refresh
```

This keeps the timeline meaningful while making ticket state changes precise, auditable, and safe across LOCAL and REMOTE runtimes.
