# Ticket Lifecycle

## Goal

The ticket lifecycle defines how a ticket progresses from creation to
completion.

It ensures that:

- every ticket follows a predictable workflow
- responsibilities are clearly defined at each stage
- transitions are controlled and traceable
- the system reflects real operational processes

---

## Core Concept

```txt
A ticket is a stateful workflow, not a static record.
```

A ticket moves through defined states based on:

- user actions
- approval decisions
- system rules

Not all tickets pass through every stage. The actual path depends on category
configuration.

---

## Lifecycle Flow

At a high level, the lifecycle can be summarized as:

```txt
Draft -> Open -> Approval -> Working -> Resolved -> Closed
```

This is a simplified overview. In practice:

- some tickets move from `Open` directly to `Working`
- some tickets enter an approval stage before execution
- some tickets may be closed early when approval is declined

---

## State Definitions

### Draft

- temporary state before submission
- editable by requester only
- not visible to assignees
- used to prepare incomplete requests before submission

### Open

- ticket is submitted
- initial active state after creation
- waiting for approval or assignment

### Approval

- ticket is under an approval process
- one or more approval steps may exist
- progression depends on approval decisions

### Working

- ticket is assigned and being processed
- assignees are responsible for execution
- work sessions may be recorded

### Resolved

- work is completed
- a solution is provided
- waiting for confirmation or closure

### Closed

- final state
- no further modifications are normally expected
- ticket is considered complete

---

## State Transitions

The lifecycle is driven by explicit transitions.

### 1. Draft -> Open

Triggered by:

- user submission

### 2. Open -> Approval

Condition:

- category requires approval

### 3. Open -> Working

Condition:

- no approval is required

### 4. Approval -> Working

Triggered by:

- approval granted

### 5. Approval -> Closed

Triggered by:

- approval declined

### 6. Working -> Resolved

Triggered by:

- assignee completes the work

### 7. Resolved -> Closed

Triggered by:

- requester confirmation
- system auto-close

---

## Conditional Workflow

The lifecycle is not fixed for every ticket.

It depends on category configuration:

```txt
Category -> determines -> Workflow
```

Examples:

- simple request: `Open -> Working -> Closed`
- approval required: `Open -> Approval -> Working -> Closed`

---

## Transition Rules

### 1. Controlled Transitions

State transitions are not arbitrary.

They must follow:

- approval results
- assignment status
- system constraints

### 2. No Direct Jumping

Invalid transitions are not allowed.

Examples:

- `Draft -> Working`
- `Open -> Resolved`
- `Approval -> Closed` without an approval decision

### 3. State Consistency

Each state must reflect a clear responsibility.

- `Open`: waiting for system decision
- `Approval`: waiting for approver
- `Working`: owned by assignee
- `Resolved`: waiting for closure decision

---

## Lifecycle vs Status

The lifecycle describes the overall flow, while status represents the current
state.

```txt
Lifecycle = process
Status = snapshot
```

This distinction matters because the ticket domain is not only storing the
current state. It is also modeling how the ticket arrived there.

---

## Relationship with Other Domains

### Category

- defines whether approval is required
- defines assignment rules
- determines which workflow path applies

Related document: [Category Strategy](./strategy/category-strategy.md)

---

### Approval

- controls transitions from the approval stage
- determines whether the ticket proceeds or stops

Related document: [Approval System](./strategy/approval-system.md)

---

### Assignment

- determines who handles the ticket in the `Working` state
- affects operational ownership

Related document: [Assignment Policy](./strategy/assignment-policy.md)

---

### SLA

- influences urgency and deadlines
- may affect prioritization and monitoring

Related document: [SLA Strategy](./strategy/sla-strategy.md)

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
- responsibility transfer
- completion confirmation

### 3. Traceability

All transitions are recorded, ensuring auditability and debuggability.

---

## Summary

The ticket lifecycle ensures that:

- tickets move through a controlled workflow
- responsibilities are clear at every stage
- transitions are predictable and auditable

It is a core foundation for building a reliable and scalable service desk system.
