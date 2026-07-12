# Ticket Lifecycle

## Goal

The ticket lifecycle defines how a ticket progresses from creation to
completion, including approval, execution, pause, rejection, rework, and final
closure.

It ensures that:

- every ticket follows a predictable workflow
- responsibilities are clearly defined at each stage
- transitions are explicit, controlled, and traceable
- the lifecycle reflects real operational scenarios rather than only the happy path

---

## Core Concept

```txt
A ticket is a controlled, stateful workflow driven by actions, approvals, and system rules.
```

A ticket moves through defined states based on:

- user actions
- approval decisions
- assignment and execution progress
- explicitly defined operational rules

Not all tickets pass through every stage. The actual path depends on category
configuration, approval requirements, and operational actions taken after the
ticket is created.

---

## Lifecycle Flow

At a high level, the lifecycle can be summarized as:

```txt
Draft -> Approval -> Assigned -> Working -> Resolved -> Closed
```

This is the main success path. In practice, the lifecycle also supports
alternative branches:

```txt
Draft -> Assigned -> Working -> Resolved -> Closed
Approval -> Declined -> Approval or Assigned
Assigned -> Working
Working <-> Pending
Assigned / Working / Pending -> Rejected -> Approval or Assigned
Resolved -> Working -> Resolved -> Closed
Assigned / Working / Pending / Resolved -> Closed (merge path)
```

The lifecycle therefore models not only completion, but also rejection,
temporary pause, and post-resolution reprocessing.

---

## State Definitions

### Draft

- temporary state before submission
- editable by requester only
- not visible as active work for assignees
- used to prepare incomplete requests before submission

### Approval

- ticket is submitted and waiting for an approval decision
- current approvers own the approval step
- approval approval either advances to the next approval step or resolves work assignment

### Declined

- approval was rejected
- ticket is not accepted for execution
- requester may revise the request and resubmit it

### Assigned

- approval is complete or not required
- work assignees are selected
- work has not started yet
- explicit start-work command moves the ticket to `Working`

### Working

- ticket is assigned and being processed
- assignees are responsible for execution
- work sessions may be recorded through track time

### Pending

- work is temporarily paused
- commonly caused by an external dependency, waiting condition, or work interruption
- ticket remains active but is not currently progressing

### Rejected

- ticket is operationally rejected after review by a work assignee or Admin
- indicates that the request cannot proceed in its current form
- requester may revise and resubmit it through initial routing

### Resolved

- work is completed and a solution is provided
- waiting for a follow-up closure decision or requester review
- may return to `Working` through the `reopen` action

### Closed

- Closed state is read-only.
- normal work is complete and the lifecycle is finished
- no further actions are normally allowed
- no updates are permitted
- exceptional administrative operations may still apply
- Admin merge may still be allowed in exceptional cases

---

## State Transitions

The lifecycle is driven by explicit transitions.

### 1. Draft -> Approval

Triggered by:

- user submission when approval is required

### 2. Draft -> Assigned

Triggered by:

- user submission when approval is not required

### 3. Approval -> Approval

Triggered by:

- approval of a non-final approval step

### 4. Approval -> Assigned

Triggered by:

- approval of the final approval step and assignment resolution

### 5. Approval -> Declined

Triggered by:

- approval rejection

### 6. Declined -> Approval / Assigned

Triggered by:

- requester resubmission through initial routing

### 7. Assigned -> Working

Triggered by:

- explicit start-work command by a current work assignee

### 8. Working -> Pending

Triggered by:

- temporary pause caused by dependency, interruption, or workflow hold

### 9. Pending -> Working

Triggered by:

- resumed work

### 10. Working / Pending -> Resolved

Triggered by:

- work assignee completes the work through work-session control

### 11. Assigned / Working / Pending -> Rejected

Triggered by:

- operational rejection by work assignee or Admin

### 12. Rejected -> Approval / Assigned

Triggered by:

- requester resubmission through initial routing

### 13. Resolved -> Working

Triggered by:

- `reopen` action by requester or Admin

### 14. Resolved -> Closed

Triggered by:

- system auto-close after the resolved history is at least 7 days old

### 15. Assigned / Working / Pending / Resolved -> Closed

Closing actions:

- requester cancel closes from `Approval`, `Declined`, `Assigned`, `Working`,
  `Pending`, or `Rejected`
- work assignee merge closes the source ticket from `Assigned`, `Working`, `Pending`, or
  `Resolved`
- Admin merge may close the source ticket from any non-`Draft` status, including
  `Closed`
- merged tickets use `closeReason = Merged`

---

## Action-Driven Lifecycle

The lifecycle is not only controlled by system configuration. It is also driven
by explicit actions.

```txt
State Transition = Result of Action
```

Examples:

| Action                 | From                                                    | To         |
| ---------------------- | ------------------------------------------------------- | ---------- |
| submit ticket          | `Draft`                                                 | `Approval` or `Assigned` |
| approve                | `Approval`                                              | `Approval` or `Assigned` |
| decline                | `Approval`                                              | `Declined` |
| resubmit               | `Declined` or `Rejected`                                | `Approval` or `Assigned` |
| start work             | `Assigned`                                              | `Working`  |
| assign                 | `Pending`                                               | `Working`  |
| assign / assignSelf    | `Assigned` or `Working`                                 | unchanged  |
| pause or hold work     | `Working`                                               | `Pending`  |
| resume work            | `Pending`                                               | `Working`  |
| resolve work           | `Working` or `Pending`                                  | `Resolved` |
| reject                 | `Assigned`, `Working`, or `Pending`                     | `Rejected` |
| reopen                 | `Resolved`                                              | `Working`  |
| merge                  | `Assigned`, `Working`, `Pending`, or `Resolved`         | `Closed`   |
| cancel                 | `Approval`, `Declined`, `Assigned`, `Working`, `Pending`, or `Rejected` | `Closed` |
| auto close             | `Resolved`                                              | `Closed`   |
| admin merge            | any non-`Draft` status                                  | `Closed`   |

There are no implicit status changes. Every transition must have a clear cause.

---

## Conditional Workflow

The lifecycle is not fixed for every ticket.

It depends on category configuration:

```txt
Category -> determines -> Workflow
```

Examples:

- simple request: `Draft -> Assigned -> Working -> Resolved -> Closed`
- approval required: `Draft -> Approval -> Assigned -> Working -> Resolved -> Closed`
- approval rejected: `Draft -> Approval -> Declined -> Approval -> Assigned -> Working`
- blocked work: `Working -> Pending -> Working -> Resolved -> Closed`
- rework flow: `Working -> Resolved -> Working -> Resolved -> Closed`

This makes the lifecycle flexible without making it arbitrary.

---

## Transition Rules

### 1. Controlled Transitions

State transitions are not arbitrary.

They must follow:

- approval results
- assignment and work ownership
- explicit user actions
- explicit rules defined by the current implementation

### 2. No Direct Jumping

Invalid transitions are not allowed.

Examples:

- `Draft -> Working`
- `Approval -> Resolved`
- `Pending -> Closed` without a valid closing action
- `Closed -> Working` without exceptional intervention
- `Closed -> any normal action` except for documented admin-level exceptions

### 3. State Integrity

Each state must reflect a clear responsibility.

- `Approval`: waiting for approval
- `Assigned`: ready for work to start
- `Working`: owned by assignee
- `Pending`: temporarily paused
- `Resolved`: waiting for closure or review
- `Rejected`: not executable in current form
- `Declined`: not approved

### 4. Reopen Strategy

The current lifecycle does not use a separate `Reopen` status.

This allows:

- rework to return directly from `Resolved` to `Working`
- rework tracking through the `TICKET_REOPENED` history event
- the status enum to stay focused on executable states

### 5. Closure Policy

The current implementation rules define merge, cancel, and resolved auto-close
explicitly. Resolved auto-close uses the resolved history timestamp plus a
7-day grace window, not `updatedAt`.

---

## Lifecycle vs Status

The lifecycle describes the overall process, while status represents the
current state.

```txt
Lifecycle = process
Status = snapshot
```

This distinction matters because the ticket domain is not only storing the
current state. It is also modeling how the ticket arrived there and what
transitions are valid next.

---

## Lifecycle vs Activity

The lifecycle defines the state machine, while activity represents the trigger
or operation that causes change.

```txt
Lifecycle = allowed states and transitions
Activity = explicit operation that triggers change
```

Examples:

- `assign` may move a ticket into `Working`
- `reject` may move a ticket into `Rejected`
- `reopen` may move a ticket from `Resolved` to `Working`
- `resubmit` may move a ticket into `Approval` or `Assigned`

This distinction keeps the lifecycle strict while allowing operational actions
to remain expressive.

---

## Relationship with Other Domains

### Category

- defines whether approval is required
- defines assignment rules
- determines which workflow path applies

Related document: [Category Strategy](./strategy/category-strategy.md)

---

### Approval

- controls transitions related to approval outcome
- determines whether a ticket stays in `Approval`, becomes `Assigned`, or becomes `Declined`

Related document: [Approval System](./strategy/approval-system.md)

---

### Assignment

- determines who handles the ticket in `Working`
- supports reassignment and reactivation flows
- can move a ticket from an intake state into active execution

Related document: [Assignment Policy](./strategy/assignment-policy.md)

---

### SLA

- influences urgency and deadlines
- may pause during `Pending`
- may affect escalation and closure monitoring

Related document: [SLA Strategy](./strategy/sla-strategy.md)

---

### Ticket Activity

- provides the explicit user-facing actions that drive many transitions
- explains why a transition happened

Related document: [Ticket Activity Model](./ticket-activity.md)

---

### Ticket Track Time

- records work sessions during `Working`
- can help explain transitions into or out of `Pending`

Related document: [Ticket Track Time](./ticket-track-time.md)

---

### Ticket History

- records all state transitions
- makes lifecycle changes auditable and explicit

State changes are never implicit. They are recorded as workflow events.

Related document: [Ticket History](./ticket-history.md)

---

## Design Considerations

### 1. Flexibility via Category

The lifecycle is intentionally configurable, not hardcoded per ticket type.

### 2. Real-World Alignment

The lifecycle reflects actual operational flow:

- validation before execution
- pause and resume during ongoing work
- rejection and revision loops
- completion confirmation and rework handling

### 3. Traceability

All transitions are recorded, ensuring auditability and debuggability.

### 4. Operational Clarity

States such as `Declined`, `Rejected`, `Pending`, and `Resolved` are kept
separate because they carry different ownership, meaning, and reporting value.

---

## Summary

The ticket lifecycle ensures that:

- tickets move through a controlled workflow
- responsibilities are clear at every stage
- rejections, pauses, and rework are modeled explicitly
- transitions remain predictable, auditable, and operationally meaningful

It is a core foundation for building a reliable and scalable service desk
system.
