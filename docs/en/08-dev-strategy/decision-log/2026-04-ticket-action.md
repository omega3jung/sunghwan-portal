# Ticket Action Model Introduction (2026-04)

## Context

The Service Desk system originally used a `TicketComment`-based structure
to represent user communication and activity within a ticket.

This approach was sufficient for simple message exchange, but as the system evolved,
additional requirements emerged:

- representing operational actions such as assignment, priority changes, and ticket merging
- providing a structured and traceable history of ticket-related activities
- supporting auditability and clearer intent behind each change
- aligning UI behavior with real-world service desk workflows

At this stage, the limitation of a comment-only model became apparent.

---

## Problem

### 1. Lack of Semantic Meaning

- Comments were plain text entries
- There was no distinction between different types of actions
- System-level changes and human communication were mixed together

---

### 2. Poor Representation of Operational Actions

Key actions such as:

- assigning users
- adjusting priority, risk level, or due date
- merging tickets
- rejecting requests

could not be represented as first-class entities.

Instead, they had to be:

- implicitly described in text
- or handled separately from the comment timeline

This led to fragmented logic and unclear history.

---

### 3. Weak Traceability and Auditability

- No structured way to track who did what
- Difficult to distinguish between intent (reason) and effect (change)
- Hard to build reliable audit logs

---

### 4. UI and Timeline Inconsistency

- The timeline mixed different types of events without clear differentiation
- The UI had to infer meaning from text rather than structured data
- Activity summaries and filtering remained limited

---

## Options Considered

### 1. Extend the `TicketComment` Model

Enhance the existing comment model by adding:

- type fields such as `"assignment"` or `"update"`
- additional metadata

#### Pros

- Minimal refactoring
- Reuses existing structures

#### Cons

- Overloads the concept of `comment`
- Blurs the boundary between communication and system actions
- Leads to complex conditional logic
- Becomes harder to scale as more action types are added

---

### 2. Introduce a Separate `TicketAction` Model (Chosen)

Create a new `TicketAction` domain model that represents all meaningful operations on a ticket.

#### Key Idea

```txt
Comment is data
Action is behavior
```

#### Structure

Each action contains:

- `type` (`assign`, `adjust`, `merge`, `reject`, `comment`, `note`)
- `content` (rich text reason or message)
- `metadata` (fields relevant to the action)
- `createdBy`
- `createdAt`

---

## Decision

We introduced a `TicketAction`-based model to replace the `TicketComment`-centric approach.

### Core Changes

- Replace `TicketComment` with `TicketAction` as the primary activity unit
- Represent all meaningful interactions as actions
- Separate:
  - what happened (`action type` and metadata)
  - why it happened (reason or content)

---

### Action Types

The system now supports the following action types:

- `comment`: public communication
- `note`: internal team communication
- `assign`: assignment and category updates
- `adjust`: priority, risk, and due date changes
- `merge`: ticket merging
- `reject`: rejection with reason

---

### UI Alignment

- The timeline is now action-based instead of comment-based
- Each action renders:
  - structured metadata
  - optional reason content from a shared rich text editor
- Forms are structured as:
  - action-specific fields
  - a shared reason editor

---

## Consequences

### 1. Clearer Domain Model

- Actions represent real-world operations
- The model aligns more closely with actual service desk workflows

---

### 2. Improved Traceability

Each action explicitly captures:

- actor
- intent (reason)
- effect (metadata)

This enables more reliable audit logs.

---

### 3. More Consistent UI and Timeline Behavior

- Unified timeline structure
- Better readability and filtering
- Clear distinction between communication and operational activity

---

### 4. Better Extensibility

New action types can be added without breaking the overall model, for example:

- `resolve`
- `close`
- `reopen`
- `escalate`

---

### 5. Cleaner Frontend Architecture

- Form structure is unified as action-specific fields plus a shared editor
- Duplication is reduced
- Component boundaries are easier to reason about

---

## Trade-offs

### Pros

- Stronger domain clarity
- Better support for structured workflows
- Improved auditability
- Better extensibility for future features
- More coherent timeline and UI behavior

---

### Cons

- Larger refactoring scope
- Required replacing comment APIs, components, mocks, and types
- Introduced a new domain concept that increased initial modeling complexity

---

## Summary

The transition from `TicketComment` to `TicketAction` was a shift
from a text-centric model to a behavior-centric model.

This change:

- improved domain clarity
- enabled structured workflows
- strengthened auditability
- provided a scalable foundation for future Service Desk features
