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
Draft -> Open -> Approved -> Working -> Resolved -> Closed
```

This is the main success path. In practice, the lifecycle also supports
alternative branches:

```txt
Draft -> Open -> Working -> Resolved -> Closed
Open -> Declined -> Open
Working <-> Pending
Working / Pending -> Rejected -> Open or Reopen
Resolved -> Reopen -> Working -> Resolved -> Closed
Working / Pending / Resolved -> Closed (merge path)
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

### Open

- ticket is submitted and enters the active workflow
- waiting for approval, assignment, or requester/manager follow-up
- initial operational state after creation

### Approved

- approval flow is completed successfully
- ticket is accepted for execution
- ready to move into active work

### Declined

- approval was rejected
- ticket is not accepted for execution
- requester may revise the request and resubmit it

### Working

- ticket is assigned and being processed
- assignees are responsible for execution
- work sessions may be recorded through track time

### Pending

- work is temporarily paused
- commonly caused by an external dependency, waiting condition, or work interruption
- ticket remains active but is not currently progressing

### Rejected

- ticket is operationally rejected after review by the assignee or manager
- indicates that the request cannot proceed in its current form
- requester or manager may later reactivate the ticket

### Reopen

- ticket is explicitly reactivated after being resolved or rejected
- represents re-entry into the lifecycle for rework or reprocessing
- separated from `Open` so rework can be tracked clearly

### Resolved

- work is completed and a solution is provided
- waiting for a follow-up closure decision or requester review
- may still return to active processing if rework is requested

### Closed

- Closed state is read-only.
- normal work is complete and the lifecycle is finished
- no further actions are normally allowed
- no updates are permitted
- exceptional administrative operations may still apply
- manager-level merge may still be allowed in exceptional cases

---

## State Transitions

The lifecycle is driven by explicit transitions.

### 1. Draft -> Open

Triggered by:

- user submission

### 2. Open -> Approved

Triggered by:

- completion of all required approval steps

### 3. Open -> Declined

Triggered by:

- approval rejection

### 4. Open -> Working

Condition:

- no approval is required, or active work starts immediately through assignment

### 5. Approved -> Working

Triggered by:

- assignment and start of execution

### 6. Declined -> Open

Triggered by:

- requester update and resubmission

### 7. Working -> Pending

Triggered by:

- temporary pause caused by dependency, interruption, or workflow hold

### 8. Pending -> Working

Triggered by:

- resumed work

### 9. Working -> Resolved

Triggered by:

- assignee completes the work

### 10. Working / Pending -> Rejected

Triggered by:

- operational rejection by assignee or manager

### 11. Rejected -> Open

Triggered by:

- requester review and resubmission

### 12. Rejected -> Reopen

Triggered by:

- manager-driven reassignment or explicit reactivation for processing

### 13. Resolved -> Reopen

Triggered by:

- requester review request or rework request

### 14. Resolved -> Closed

Implementation-specific closure path:

- [`Ticket Rules`](../../08-dev-strategy/ticket-rules.md) does not currently
  define the concrete trigger
- requester confirmation or a system close policy may exist, but they are not
  treated as current implementation rules here

### 15. Working / Pending / Resolved -> Closed

Exceptional case:

- assignee merge closes the source ticket from `Working`, `Pending`, or
  `Resolved`
- manager merge may also close the source ticket from `Open`, `Approved`,
  `Rejected`, or even `Closed` in exceptional cases
- merged tickets use `closeReason = Merged`

---

## Action-Driven Lifecycle

The lifecycle is not only controlled by system configuration. It is also driven
by explicit actions.

```txt
State Transition = Result of Action
```

Examples:

| Action                         | From                                | To         |
| ------------------------------ | ----------------------------------- | ---------- |
| submit ticket                  | `Draft`                             | `Open`     |
| approve                        | `Open`                              | `Approved` |
| update declined ticket         | `Declined`                          | `Open`     |
| assign / assignSelf         | `Open` or `Approved`                | `Working`  |
| pause or hold work             | `Working`                           | `Pending`  |
| resume work                    | `Pending`                           | `Working`  |
| reject                         | `Working` or `Pending`              | `Rejected` |
| reopen                | `Resolved`                          | `Reopen`   |
| resubmit               | `Rejected`                          | `Open`     |
| manager reassign               | `Declined` or `Rejected`            | `Reopen`   |
| merge                          | `Working`, `Pending`, or `Resolved` | `Closed`   |
| manager merge                  | `Open`, `Approved`, `Rejected`, `Resolved`, or `Closed` | `Closed`   |

There are no implicit status changes. Every transition must have a clear cause.

---

## Conditional Workflow

The lifecycle is not fixed for every ticket.

It depends on category configuration:

```txt
Category -> determines -> Workflow
```

Examples:

- simple request: `Draft -> Open -> Working -> Resolved -> Closed`
- approval required: `Draft -> Open -> Approved -> Working -> Resolved -> Closed`
- approval rejected: `Draft -> Open -> Declined -> Open -> Approved -> Working`
- blocked work: `Working -> Pending -> Working -> Resolved -> Closed`
- rework flow: `Working -> Resolved -> Reopen -> Working -> Resolved -> Closed`

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
- `Open -> Resolved`
- `Pending -> Closed` without a valid closing action
- `Closed -> Working` without exceptional intervention
- `Closed -> any normal action` except for documented admin-level exceptions

### 3. State Integrity

Each state must reflect a clear responsibility.

- `Open`: waiting for approval, assignment, or follow-up
- `Approved`: ready for execution
- `Working`: owned by assignee
- `Pending`: temporarily paused
- `Resolved`: waiting for closure or review
- `Rejected`: not executable in current form
- `Declined`: not approved
- `Reopen`: reprocessing after prior completion or rejection

### 4. Reopen Strategy

The lifecycle explicitly separates `Reopen` from `Open`.

This allows:

- tracking rework frequency as a KPI
- distinguishing new intake from reprocessing
- preserving operational clarity after a ticket has already progressed

### 5. Closure Policy

The current implementation rules define merge-driven closure explicitly.

Other closure policies, such as requester confirmation or auto-close review
windows, may be added later, but they are not currently defined in
[`Ticket Rules`](../../08-dev-strategy/ticket-rules.md).

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
- `reopen` may move a ticket into `Reopen`
- `resubmit` may move a ticket into `Open`

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
- determines whether a ticket becomes `Approved` or `Declined`

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

States such as `Declined`, `Rejected`, `Pending`, and `Reopen` are kept
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
