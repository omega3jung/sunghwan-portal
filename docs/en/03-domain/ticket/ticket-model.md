# Ticket Model

## Goal

The ticket model defines the core domain structure of a ticket as a workflow
entity in the Service Desk system.

It aims to:

- represent a ticket as a structured, stateful entity
- support workflow-driven operations instead of simple CRUD
- maintain consistency across API, UI, and domain logic
- provide a clear contract for data handling and rendering

---

## Core Concept

```txt
A ticket is not just data; it is a workflow entity with state, ownership, and context.
```

A ticket represents:

- a request
- an issue
- a task

that moves through a defined lifecycle and is processed by assigned users.

Unlike a simple data model, a ticket:

- evolves over time
- interacts with multiple domain systems
- maintains history and auditability

---

## Domain Shape

The ticket model exposes the current state required by the workflow,
operational UI, and related systems.

```ts
export interface Ticket {
  id: string;
  ticketNumber: string;

  createdAt: ISODateString;
  updatedAt: ISODateString;

  requesterId: string;

  status: TicketStatus;
  priority: Priority;

  categoryId: string;

  subject: string;
  body: string;

  dueAt: ISODateString;

  assigneeIds: string[];

  trackTimeMinutes: number;

  lastCommentAt?: ISODateString;
  lastCommenterEmail?: string;

  approvalStepId?: string;

  owner: boolean;
  assigned: boolean;
  active: boolean;

  files: Attach[];
  images: Attach[];
}
```

---

## Core Model Areas

### Identity

- `id`: unique identifier
- `ticketNumber`: human-readable reference

### Timestamps

- `createdAt`: when the ticket was created
- `updatedAt`: last modification time

### Request Context

- `requesterId`: user who created the ticket
- `subject`: short summary of the request
- `body`: detailed description

### Status and Workflow

- `status`: current workflow state
- `priority`: urgency level
- `approvalStepId`: current approval context when applicable

Related document: [Ticket Lifecycle](./ticket-lifecycle.md)

---

### Category

- `categoryId`: links the ticket to category configuration

Category determines:

- assignment
- SLA behavior
- approval requirement
- workflow behavior

The ticket therefore depends on category configuration rather than embedding
those business rules directly.

Related document: [Category Strategy](./strategy/category-strategy.md)

---

### Assignment

- `assigneeIds`: current responsible users

Assignment is part of the core model because it directly affects execution,
ownership, and operational visibility.

Related document: [Assignment Policy](./strategy/assignment-policy.md)

---

### SLA

- `dueAt`: calculated deadline based on SLA rules

This allows urgency and timing expectations to remain visible at the ticket
level.

Related document: [SLA Strategy](./strategy/sla-strategy.md)

---

### Work Tracking

- `trackTimeMinutes`: aggregated working time

Actual work sessions are managed separately in the track-time model.

Related document: [Ticket Track Time](./ticket-track-time.md)

---

### Activity Metadata

- `lastCommentAt`: last interaction timestamp
- `lastCommenterEmail`: last actor for quick UI rendering

These fields help the UI surface recent activity without loading the entire
history immediately.

Related documents:

- [Ticket Activity Model](./ticket-activity.md)
- [Ticket History](./ticket-history.md)

---

### Ownership Flags

The ticket also exposes derived ownership flags.

```ts
type Ownership = {
  owner: boolean;
  assigned: boolean;
};
```

- `owner`: current user is the requester
- `assigned`: current user is an assignee

These flags are useful for:

- permission handling
- UI conditional rendering

---

### Attachments

- `files`: general attachments
- `images`: image-specific attachments

Attachments remain part of the ticket context even though their behavior may be
handled by supporting systems.

---

### Active State

- `active`: soft-delete flag

Tickets are not physically deleted in normal workflow operations. The model
preserves them for history, reporting, and reference integrity.

Related document: [Ticket History](./ticket-history.md)

---

## Domain Characteristics

### 1. Workflow-Oriented

A ticket is not static data.

- it changes state over time
- it triggers domain events
- it interacts with multiple subsystems

### 2. Category-Driven Behavior

The ticket itself does not contain the full set of business rules.

Instead:

```txt
Ticket -> Category -> Behavior
```

This keeps the model cleaner and the behavior more configurable.

### 3. Immutable History Outside the Ticket

The ticket does not store its own history internally.

Instead:

- all changes are recorded in `TicketHistory`
- the ticket represents the current state only

### 4. Activity as a Related Interaction Model

The ticket also participates in an activity model used for communication and
operational interaction.

Instead:

- meaningful interactions are represented in `TicketActivity`
- structured communication and operational actions share a unified model
- recent activity metadata is surfaced on the ticket read model for fast UI access

### 5. Session-Based Work Tracking

Work is not represented as a single source-of-truth number.

Instead:

- work is a collection of sessions
- `trackTimeMinutes` is derived or aggregated
- detailed tracking is handled in a separate model

---

## Relationships

The ticket interacts with multiple domain models:

```txt
Ticket
  -> Category
  -> Approval
  -> Assignment
  -> SLA
  -> TicketActivity
  -> TicketHistory
  -> TicketTrackTime
  -> Attachment
```

This relationship structure is one reason the ticket model should remain clear
and explicit.

Related strategy document: [Action Strategy](./strategy/action-strategy.md)

---

## Read Model vs Write Model

### Write Model

- optimized for updates
- contains normalized fields
- used by API and backend logic

### Read Model

- optimized for UI
- may include derived fields such as:
  - `owner`
  - `assigned`
  - aggregated time
  - display-oriented metadata

---

## Derived State

Some values should be derived instead of blindly persisted.

```ts
const isOwner = ticket.requesterId === currentUser.id;
```

Prefer deriving state when possible, especially for user-specific context.

---

## Design Trade-Offs

### Pros

- clear and predictable structure
- supports complex workflows
- scales with domain complexity
- separates concerns effectively

### Cons

- more complex than basic CRUD models
- requires understanding of related systems
- has a higher initial design cost

---

## Summary

The ticket model is the central domain entity of the Service Desk system.

It is designed to:

- represent workflow state
- integrate with category-driven configuration
- connect cleanly with activity and history models
- support auditability and SLA tracking
- remain clean by delegating detailed behavior to related systems
