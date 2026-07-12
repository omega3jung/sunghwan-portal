# Ticket Activity Model

## Goal

The ticket activity model defines how all meaningful interactions and
operations within a ticket are represented in the system.

It replaces a comment-centric approach with an action-driven model, where every
meaningful change or communication is expressed as an activity with explicit
constraints and traceable effects.

It ensures that:

- communication and operations share one consistent interaction model
- actions are executed only by valid users in valid states
- lifecycle transitions remain explicit and auditable
- the timeline reflects both intent and effect

---

## Core Concept

```txt
Activity = Action + Context + Reason + Execution Rules
```

Each activity represents:

- what happened: action type
- why it happened: reason or message
- additional context: metadata specific to the action
- how it is controlled: permission, state, and restriction rules

---

## Why Activity Instead of Comment

Traditional ticket systems often rely on comments as the primary interaction
model.

However, this approach has several limitations:

- comments are unstructured text
- operational changes are hidden inside messages
- there is no clear distinction between communication and system actions
- permissions and lifecycle rules are hard to enforce consistently

### Key Idea

```txt
Comment is data
Action is behavior
Activity is the unified representation of both
```

The activity model makes behavior explicit instead of hiding it inside text.

---

## Activity Types

The system supports multiple activity types, each representing a specific
operation.

### Communication

- `comment`: public communication visible to relevant users
- `note`: internal communication with `private` and `shared` visibility rules

### Operational Actions

- `assign`: assign or reassign users and, when needed, resume execution
- `adjust`: modify priority, risk level, or due date
- `merge`: merge the current ticket into another ticket
- `reject`: reject the request with a clear reason

### Extended Workflow Actions

The activity model is also designed to support workflow-oriented actions such
as:

- `reopen`: reopen a resolved ticket
- `resubmit`: rerun initial routing after a declined or rejected ticket
- `assignSelf`: allow a current work assignee to claim multi-assignee work

These actions are part of the improved activity design because they make
re-entry and review loops explicit.

---

## Communication vs Operational Actions

Activities are divided into two categories based on mutability and effect.

### Communication Actions

- `comment`
- `note`

These actions:

- represent communication between users
- may be edited or deleted by the author under normal rules
- do not directly change the ticket lifecycle state

### Operational Actions

- `assign`
- `adjust`
- `merge`
- `reject`
- `reopen`
- `resubmit`
- `assignSelf`

These actions:

- represent operational decisions
- are normally immutable once created
- may trigger lifecycle transitions
- require stronger validation and traceability

### Practical Distinction

```txt
Communication = message-oriented and partially mutable
Operation = decision-oriented and immutable
```

---

## Activity Structure

Each activity follows a consistent shape.

```ts
type TicketActivity = {
  id: string;
  type: ActivityType;

  content: string; // required rich text reason or message

  metadata?: Record<string, unknown>; // action-specific data

  createdBy: string;
  createdAt: Date;

  active?: boolean; // soft-delete support for mutable communication items
};
```

The exact metadata shape depends on the action type, but the activity model
keeps a unified top-level structure for storage, rendering, and auditability.

The `content` field is not optional in the current rule model. Even when the
message is generated automatically, the activity still stores concrete content.

---

## Content (Reason)

The `content` field is used to explain the intent behind an action.

- stored as rich text
- shared across communication and operational forms
- required for all actions

This ensures:

- clear intent
- auditability
- operational traceability

### Example Uses

- why a ticket was rejected
- why priority was increased
- why ownership was changed
- why rework was requested after resolution

---

## Metadata

Each action type may include action-specific metadata.

### Examples

#### `assign`

- `assigneeIds`
- `categoryId`

#### `adjust`

- `priority`
- `riskLevel`
- `dueAt`

#### `merge`

- `mergedIntoTicketId`
- `mergedIntoTicketNo`

#### `reopen` / `resubmit`

- `reviewType`
- `requestedState`

Metadata should remain explicit and domain-shaped rather than becoming a vague
generic key-value dump.

---

## Execution Constraints

Each activity is governed by explicit constraints that define how and when it
can be executed.

```txt
Action = behavior with controlled execution rules
```

Each action is defined by the following dimensions:

- `who`: who can perform the action
- `when`: in which ticket states the action is allowed
- `effect`: what changes are applied to the ticket
- `purpose`: why the action exists
- `restriction`: additional rules and limitations

These constraints ensure that:

- actions are executed only by the right users
- actions are allowed only in valid states
- system behavior remains predictable
- domain rules are consistently enforced

These constraints can be mapped directly to execution logic:

```ts
type ActionConstraint = {
  allowedStatus?: TicketStatus[];
  allowedRoles?: Role[];
  requiresOwnership?: "requester" | "assignee";
  blockedWhenLocked?: boolean;
};
```

---

## Constraint Examples

### Comment

- who: any user with ticket access
- when: any non-`Draft` state, including `Closed`
- effect: create comment and send notification
- purpose: external or shared communication
- restriction: content required; editable only by the author while not `Closed`

### Note

- who: any user with ticket access
- when: any non-`Draft`, non-`Closed` state
- effect: create internal note
- purpose: internal-only communication
- restriction: content required; editable only by the author while not `Closed`

Visibility:

- `private`: visible only to the author
- `shared`: visible to internal operators and the author

### Assign

- who: current work assignee, or Admin
- when: `Assigned`, `Working`, or `Pending`; Admin can also assign approvers in `Approval`
- effect: update assignee; `Pending` moves to `Working`
- purpose: ownership transfer, routing, or resumed handling
- restriction: content required for operational clarity

### Adjust

- who: current work assignee, or Admin
- when: `Assigned`, `Working`, or `Pending`; Admin correction is allowed in `Resolved` and `Closed`
- effect: update priority, risk level, or due date
- purpose: adjust execution planning
- restriction: content required; resolved/closed correction cannot change due date

### Merge

- who: current work assignee, or Admin
- when: assignee in `Assigned`, `Working`, `Pending`, or `Resolved`; Admin in any non-`Draft` state
- effect: merge into target ticket and close the source
- purpose: consolidate duplicate or related tickets
- restriction: self-merge forbidden, merged child forbidden, target must be valid

### Reject

- who: current work assignee, or Admin
- when: `Assigned`, `Working`, or `Pending`
- effect: ticket becomes `Rejected`
- purpose: mark the ticket as not executable in its current form
- restriction: content required

### Reopen

- who: requester or Admin
- when: `Resolved`
- effect: `Working` with `TICKET_REOPENED` history
- purpose: re-evaluation of resolved result
- restriction: content required; an existing work assignee is required

### Resubmit

- who: requester
- when: `Declined` or `Rejected`
- effect: rerun initial routing to `Approval` or `Assigned`
- purpose: re-enter approval or assignment flow
- restriction: content required

### Assign Self

- who: current work assignee
- when: `Assigned`, `Working`, or `Pending`
- effect: replace the current work assignee list with the actor only; status is unchanged
- purpose: fast self-assignment
- restriction: current assignee list must contain at least two users; content is auto-generated

---

## Relationship with Ticket

A ticket contains a list of activities:

```ts
ticket.activities: TicketActivity[];
```

Activities:

- are ordered chronologically
- form the basis of the timeline
- represent the operational interaction history of the ticket
- help explain why the ticket changed, not only what the current state is

---

## Relationship with Ticket Lifecycle

Activities do not only describe what users said. They also drive lifecycle
transitions.

```txt
Action -> State Transition
```

Examples:

- `assign` may move a ticket into `Working`
- `reject` moves a ticket into `Rejected`
- `reopen` may move a ticket from `Resolved` to `Working`
- `resubmit` may move a ticket into `Approval` or `Assigned`
- Admin assignment may resume `Pending` work

This ensures that:

- lifecycle transitions are explicit
- state changes are tied to user intent
- the workflow stays understandable and auditable

---

## Relationship with Ticket History

The activity model and history model are related, but they are not identical.

### Activity

- represents a meaningful user or operational interaction
- stores the message or reason together with action-specific context
- drives the action-oriented ticket timeline

### History

- records immutable event traces generated by ticket changes
- emphasizes auditability and before/after state transitions
- may be derived from or triggered by activity execution

### Practical Distinction

```txt
Activity = user-facing operational interaction
History = immutable audit/event record
```

This distinction keeps the domain expressive while preserving strong
traceability.

---

## Timeline Representation

The UI renders activities as a unified timeline.

Each activity:

- displays type-specific information
- shows metadata changes when applicable
- includes rich text content
- may visually distinguish communication from operational actions

### Benefits

- clear and structured history
- easier understanding of what happened
- consistent rendering across all activity types
- better alignment between UI and domain behavior

---

## Form Structure

All activity forms follow a consistent pattern:

```txt
[ Action-specific fields ]
[ Reason (rich text editor) ]
```

### Examples

#### Assign

- assignee
- category
- reason

#### Adjust

- priority
- risk
- due date
- reason

#### Merge

- target ticket
- reason

#### Reopen / Resubmit

- review intent
- reason

#### Comment / Note

- reason only

This consistency reduces UI fragmentation and makes behavior easier to learn.

---

## Edit and Delete Rules

The activity model distinguishes between mutable communication and immutable
operations.

### Mutable

- `comment`
- `note`

These may support edit or soft-delete under normal author-based rules.

### Immutable

- `assign`
- `adjust`
- `merge`
- `reject`
- `reopen`
- `resubmit`
- `assignSelf`

These should not be edited or deleted in normal workflow because they represent
operational decisions with downstream effects.

No activity can be edited or deleted when the ticket is `Closed`.
Delete behavior for mutable communication actions is soft-delete via `active = false`.

---

## Audit and Traceability

Each activity explicitly records:

- actor (`createdBy`)
- timestamp (`createdAt`)
- intent (`content`)
- effect (`metadata`)
- execution rule outcome (implicit in the action type and resulting history)

### Result

- strong audit trail
- easier debugging
- clearer responsibility tracking
- explicit connection between user intent and lifecycle change

---

## Extensibility

The activity model is designed to be extensible.

New action types can be added without changing the core structure, for example:

- `resolve`
- `close`
- `reopen`
- `escalate`
- approval-related actions
- track-time-related workflow actions

The main rule is that a new action must represent a meaningful domain event
with explicit intent and effect.

---

## Related Documents

- [Ticket Lifecycle](./ticket-lifecycle.md)
- [Ticket History](./ticket-history.md)
- [Ticket Track Time](./ticket-track-time.md)
- [Ticket Model](./ticket-model.md)
- [Action Strategy](./strategy/action-strategy.md)

---

## Design Summary

The ticket activity model transforms the system from:

```txt
Comment-based logging -> Action-driven activity tracking
```

This enables:

- better domain clarity
- controlled workflow execution
- stronger auditability
- consistent UI patterns
- scalable feature expansion
