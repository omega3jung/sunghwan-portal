# Ticket System Overview

## Goal

The ticket system is designed to manage requests, approvals, and execution
workflows in a structured and traceable way.

Unlike simple CRUD-based systems, it focuses on:

- consistent workflow execution
- clear ownership and responsibility
- full auditability of actions
- realistic work tracking
- user-centric prioritization

The goal is to reflect real operational processes, not just store and display
data.

---

## Why Not a Simple CRUD System?

Many ticket systems follow a basic flow:

```txt
Create -> Update -> Resolve -> Close
```

This approach becomes insufficient in real environments because:

- different request types require different workflows
- approval may be required before execution
- responsibility must be clearly assigned
- SLA must be enforced
- work is often interrupted and resumed

As a result, a CRUD-based system leads to:

- inconsistent behavior
- unclear responsibility
- poor visibility of actual work

To solve this, the system models tickets as workflow-driven entities.

---

## Core Principles

The system is built on the following principles.

### 1. Category-Driven Behavior

Category is not just classification.

It defines:

- assignment rules
- approval requirements
- SLA policies
- workflow structure

### 2. Approval as a First-Class Workflow

Approval is treated as a core part of the lifecycle.

- configurable per category
- executed as a structured pipeline
- fully traceable

### 3. Session-Based Work Tracking

Work is not stored as a single accumulated value.

```txt
work = collection of sessions
```

This allows:

- interruption
- resumption
- task switching

### 4. Work Context-Driven Prioritization

Tickets are not displayed as a flat list.

The system derives a work context to prioritize:

- currently active work
- assigned tickets
- actionable tickets
- contextual tickets

### 5. Full Auditability

All important actions are recorded.

This ensures:

- traceability
- accountability
- explainability

---

## System Structure

The ticket system is composed of multiple domain components:

```txt
Ticket
  -> Category
  -> Approval
  -> Assignment
  -> SLA
  -> Track Time
  -> History
```

Each component is responsible for a specific concern, which keeps the system
modular and maintainable.

---

## Ticket Lifecycle

A ticket progresses through a structured lifecycle:

```txt
Draft -> Open -> Approval -> Working -> Resolved -> Closed
```

The actual flow depends on category configuration.

- some tickets skip approval
- some require multiple approval steps

Related document: [Ticket Lifecycle](./ticket-lifecycle.md)

---

## Work Session Model

Work performed on a ticket is tracked as sessions:

```txt
start -> work -> finish
```

Multiple sessions per ticket are allowed.

Example:

```txt
09:00 - 10:00
15:00 - 17:00
```

This reflects real-world work behavior more accurately than a single aggregated
time value.

Related document: [Ticket Track Time](./ticket-track-time.md)

---

## Work Context

The system derives a current work context for each user.

This enables:

- prioritized ticket lists
- context-aware UI actions
- reduced cognitive load

Example:

```txt
working on a ticket -> show Finish
working on another ticket -> show Switch
```

Related document: [Ticket Track Time](./ticket-track-time.md)

---

## Design Philosophy

The system prioritizes:

- predictability over flexibility
- configuration over hardcoding
- traceability over destructive simplicity
- operational realism over UI convenience

These choices ensure that the system:

- scales with complexity
- remains consistent
- is easy to reason about

---

## Related Documents

- [Ticket Model](./ticket-model.md)
- [Ticket Lifecycle](./ticket-lifecycle.md)
- [Ticket Track Time](./ticket-track-time.md)
- [Ticket History](./ticket-history.md)
- [Category Strategy](./strategy/category-strategy.md)
- [Approval System](./strategy/approval-system.md)
- [Assignment Policy](./strategy/assignment-policy.md)
- [SLA Strategy](./strategy/sla-strategy.md)

---

## Summary

This ticket system is designed as a workflow-oriented, user-centric system.

Its key characteristics are:

- category-driven behavior
- approval-aware flow
- session-based work tracking
- context-aware prioritization
- full auditability

It provides a foundation for building a realistic and scalable service desk
system.
