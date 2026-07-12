# Action Strategy

## Goal

This document defines the design strategy behind the ticket action system.

The goal is to provide a structured, scalable, and audit-friendly way to
represent meaningful ticket interactions, including both communication and
operational changes.

---

## Core Concept

The system models actions as explicit domain behavior rather than plain text.

```txt
Action = Intent + Effect + Context
```

This means each action should express:

- what happened
- why it happened
- what changed as a result

---

## Design Principles

### 1. Behavior Over Text

- The system should represent behavior, not just messages
- Comments alone are insufficient for real workflows
- Every meaningful operation should be modeled as a first-class entity

---

### 2. Separation of Intent and Effect

Each action explicitly separates:

- intent: the reason or explanation
- effect: the actual structured change

```txt
Intent -> rich text reason
Effect -> metadata such as priority, assignee, or due date
```

---

### 3. Unified Activity Model

All interactions are represented through a single activity model:

```txt
Activity = Communication + Operation
```

This avoids fragmentation between:

- comments
- system logs
- manual operational changes

---

### 4. Traceability First

Every action should answer:

- who did it
- when it happened
- what changed
- why it was done

---

## Action Design Strategy

### 1. Action Types as Domain Events

Each action represents a meaningful domain-level event.

### Examples

- `assign`: ownership or routing change
- `adjust`: priority, risk, or due date update
- `merge`: structural ticket change
- `reject`: workflow decision with explicit reason

---

### 2. Action Types Must Be Explicit

Avoid hiding meaning inside text.

#### Bad

```txt
"Assigning this to John"
```

#### Good

```ts
{
  type: "assign",
  assigneeIds: ["john"],
}
```

Explicit action types improve readability, validation, and auditability.

---

### 3. Reason Content Is Required

- Reason content is required for all actions
- Communication and operational actions share this rule
- Auto-generated actions still store concrete content

---

## UI Strategy

### 1. Consistent Form Pattern

All action forms follow a unified structure:

```txt
[ Action-specific fields ]
[ Reason editor ]
```

---

### 2. Shared Reason Component

- The rich text editor is shared across action types
- Duplication is reduced
- UX remains consistent

---

### 3. Field Responsibility Separation

- action-specific fields handle structured data input
- the reason editor handles contextual explanation

---

### 4. Timeline-First Design

The UI is built around a unified timeline.

Each action:

- renders as a timeline item
- shows structured metadata
- includes optional reason content

This helps users understand both what changed and why.

---

## Metadata Strategy

### 1. Action-Specific Metadata

Each action type defines its own metadata contract.

### Examples

#### `assign`

- assignee
- category

#### `adjust`

- priority
- risk level
- due date

#### `merge`

- target ticket

#### `reject`

- may rely mainly on reason content, with little or no extra metadata

---

### 2. Avoid Generic Key-Value Abuse

Do not rely on vague metadata structures when a clear domain shape exists.

#### Bad

```ts
metadata: { field: "priority", value: "high" }
```

#### Good

```ts
metadata: { priority: "high" }
```

---

### 3. Strong Typing per Action

Each action type should have a clearly defined shape.

This improves:

- type safety
- readability
- maintainability

---

## Communication Strategy

### 1. `comment` vs `note`

#### `comment`

- public communication
- may trigger notifications

#### `note`

- internal communication
- no external notification
- private to the team or operational context

---

### 2. Communication Is Still an Action

Even communication is treated as intentional behavior.

```txt
communication = action
```

This ensures:

- consistency in the timeline
- unified rendering logic
- a single interaction model across the ticket domain

---

## Audit Strategy

### 1. Full Activity Log

All actions should be preserved as append-oriented operational records.

- only `comment` and `note` are editable/deletable under author rules
- operational actions are immutable
- in `Closed`, no action can be edited or deleted
- delete is soft-delete (`active = false`) for mutable communication items

---

### 2. Explicit Actor Tracking

Each action records:

- `createdBy`
- `createdAt`

---

### 3. Reason as Audit Context

Reason content helps explain decisions and is especially important for:

- debugging
- review
- compliance-sensitive workflows

---

## Extensibility Strategy

The system is designed to support future actions without structural redesign.

### Potential Extensions

- `resolve`
- `close`
- additional review or escalation actions
- `escalate`
- `reassign`
- approval-related actions

### Rule for Adding New Actions

A new action should:

- represent a meaningful domain event
- define its own metadata shape
- integrate into the timeline
- follow the same form pattern

---

## Trade-offs

### Pros

- strong domain alignment
- improved auditability
- better UI consistency
- scalable action architecture

---

### Cons

- increased modeling complexity
- larger refactoring cost
- higher initial learning curve for developers

---

## Related Documents

- [Ticket Activity Model](../ticket-activity.md)
- [Ticket History](../ticket-history.md)
- [Ticket Model](../ticket-model.md)

---

## Summary

The action strategy transforms the system from:

```txt
Comment-driven system -> Action-driven system
```

This shift enables:

- structured workflows
- clearer intent representation
- stronger audit trails
- more consistent UI architecture
