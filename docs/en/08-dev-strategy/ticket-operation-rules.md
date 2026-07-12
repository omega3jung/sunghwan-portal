# Ticket Rules

## Goal

The ticket rules document defines the **current implementation-oriented rules**
for ticket updates, action execution, and state-affecting operations.

It exists to make sure that:

- business rules are expressed in a form that can be implemented directly
- permissions, status guards, and side effects remain explicit
- domain documents and UI behavior stay aligned with current execution rules
- future changes can be reviewed against a clear source of truth

---

## Core Principle

```id="ticket-rules-principle"
Every ticket operation must have an explicit actor, valid state, predictable effect, and clear restriction.
```

---

## Purpose in the Documentation Set

This document is intentionally different from higher-level domain documents such
as the lifecycle or activity model.

### Domain Documents

- explain conceptual structure
- describe the meaning of states and actions
- clarify why the model exists

### This Rules Document

- defines what is currently allowed
- captures implementation-facing constraints
- serves as the current source of truth for execution behavior

In short:

```txt
Domain doc = conceptual model
Rules doc = current executable behavior
```

---

## Rule Format

Each rule is described using a consistent implementation-oriented structure.

### Rule Fields

- `who`: who can perform the operation
- `when`: in which states the operation is allowed
- `effect`: what changes happen as a result
- `purpose`: why the operation exists
- `restriction`: additional constraints or guardrails

This format is designed to map cleanly to:

- permission checks
- status validation
- command handlers
- audit and history generation

---

## Rule Areas

The current rule set is organized into two areas:

### 1. Ticket Update Rules

- rules for changing the ticket itself
- requester-driven revision behavior

### 2. Ticket Action Rules

- rules for communication and operational actions
- lifecycle-affecting behavior such as reject, merge, `reopen`, `resubmit`, and `cancel`

---

## Ticket Update Rules

### Update Ticket

- who: requester
- when: status = `Draft`
- effect: update ticket fields
- purpose: refine or complete a request before submission
- restriction:
  - ticket update is not the same command as `resubmit`
  - changes must be recorded in history

---

### Update Declined Ticket

- who: requester
- when: status = `Declined`
- effect:
  - update ticket fields
  - submit again through the same routing used by ticket creation
  - status -> `Approval` when approval is required
  - status -> `Assigned` when approval is not required
- purpose: revise a declined request and resubmit it
- restriction:
  - approval progress must be reset
  - changes must be recorded in history

---

## Action Execution Strategy

All ticket actions are governed by shared execution rules before
action-specific rules apply.

### Common Rule

- who: any user with ticket view permission
- when: action-specific status rule allows it
- effect:
  - create action
  - record history
- purpose: support ticket operation and communication
- restriction:
  - only `comment` and `note` can be edited or deleted
  - operational actions such as `assign`, `adjust`, `merge`, `reject`, `reopen`, `resubmit`, and `cancel` are immutable
  - content is required for all actions
  - no action can be edited or deleted in `Closed`
  - delete is soft delete via `active = false`

---

## Communication Actions

### Comment

- who: any user with ticket access
- when: any non-`Draft` status, including `Closed`
- effect:
  - create comment
  - send email notification
- purpose: external or shared communication
- restriction:
  - content required
  - only the author can edit or delete it while the ticket is not `Closed`

---

### Note

- who: any user with ticket access
- when: any non-`Draft`, non-`Closed` status
- effect:
  - create note
  - no email notification
- purpose: internal communication
- restriction:
  - content required
  - only the author can edit or delete it

### Visibility

- `private`: visible only to the author
- `shared`: visible to internal operators and the author

---

## Operational Actions

Operational actions are immutable in normal workflow and may affect ticket
state, ownership, or planning data.

### Assign (Standard)

- who: current work assignee
- when: status in `Assigned`, `Working`, `Pending`
- effect:
  - update work assignee
  - `Pending` -> `Working`
  - `Assigned` and `Working` keep their current status
  - send email notification
- purpose: delegate or reassign active work
- restriction:
  - content required

---

### Assign (Admin)

- who: Admin
- when:
  - approval assignment: status = `Approval`
  - work assignment: status in `Assigned`, `Working`, `Pending`
- effect:
  - approval assignment keeps the current approval step and changes approvers
  - work assignment updates assignees
  - `Pending` -> `Working`
  - send email notification
- purpose: manager-driven reassignment or reactivation
- restriction:
  - content required

---

### Adjust (Standard)

- who: current work assignee
- when: status in `Assigned`, `Working`, `Pending`
- effect:
  - update `priority`
  - update `riskLevel`
  - update `dueDate`
- purpose: adjust the execution plan during active work
- restriction:
  - content required

---

### Adjust (Admin)

- who: Admin
- when:
  - status in `Assigned`, `Working`, `Pending`
  - status in `Resolved`, `Closed` for correction only
- effect:
  - update `priority`
  - update `riskLevel`
  - update `dueDate` only before `Resolved`/`Closed`
- purpose: admin-driven planning adjustment or correction
- restriction:
  - content required
  - resolved/closed correction cannot change due date
  - no-op adjustment is rejected

---

### Merge (Standard)

- who: current work assignee
- when: status in `Assigned`, `Working`, `Pending`, `Resolved`
- effect:
  - source ticket -> `Closed`
  - `closeReason = Merged`
  - set `mergedIntoTicketId` and `mergedIntoTicketNo`
- purpose: consolidate duplicate or related tickets
- restriction:
  - self merge is forbidden
  - merged child merge is forbidden
  - target must be active
  - target must be in the same client and scope

---

### Merge (Admin)

- who: Admin
- when: any non-`Draft` status, including `Closed`
- effect:
  - execute merge handling
- purpose: manager-level ticket consolidation
- restriction:
  - merge on `Closed` is allowed only as an exceptional case
  - client and scope must remain aligned

---

### Reject

- who: current work assignee or Admin
- when: status in `Assigned`, `Working`, `Pending`
- effect:
  - status -> `Rejected`
  - running work session is finished where possible
- purpose: close out work that cannot proceed
- restriction:
  - content required

### Reopen

- who: requester or Admin
- when: status = `Resolved`
- effect:
  - status -> `Working`
  - history event = `TICKET_REOPENED`
- purpose: request re-evaluation of a resolved result
- restriction:
  - content required
  - ticket must have an existing work assignee

---

### Resubmit

- who: requester
- when: status in `Declined`, `Rejected`
- effect:
  - rerun initial approval and assignment routing
  - status -> `Approval` when approval is required
  - status -> `Assigned` when approval is not required
- purpose: revise and resubmit a declined or rejected request
- restriction:
  - content required

---

### Assign Myself (`assignSelf`)

- who: current work assignee
- when: status in `Assigned`, `Working`, `Pending`
- effect:
  - current assignees are replaced by the actor only
  - status is unchanged
- purpose: fast self-assignment
- restriction:
  - current assignee list must contain at least two users
  - actor must already be one of the current work assignees
  - content is auto-generated

---

### Cancel

- who: requester
- when: status in `Approval`, `Declined`, `Assigned`, `Working`, `Pending`, `Rejected`
- effect:
  - status -> `Closed`
  - `closeReason = Canceled`
  - running work session is finished where possible
- purpose: requester-driven withdrawal before completion
- restriction:
  - content required

---

### Work Session Control

- who: current work assignee
- when:
  - start work: `Assigned` -> `Working`
  - track work: `Working` -> `Pending` or `Resolved`
  - resume/finish work: `Pending` -> `Working` or `Resolved`
- effect:
  - records tracked minutes
  - changes status only through explicit work-session command
- restriction:
  - ticket detail read must not mutate status
  - resolving work finishes the running session where possible

---

### Resolved Auto Close

- who: system
- when: latest resolved history is at least 7 days old
- effect:
  - `Resolved` -> `Closed`
  - `closeReason = Completed`
  - history event = `RESOLUTION_CLOSE`
  - history source = `SYSTEM_AUTO`
- restriction:
  - cutoff is based on resolved history time, not `updatedAt`
  - running work session is finished where possible

---

## Implementation Notes

These rules are meant to be stable enough for implementation, but they are not
the same thing as long-term conceptual design.

### Practical Implications

- when this document changes, command handlers and validation logic should be reviewed
- lifecycle and activity documents should stay consistent with this file
- speculative behavior should remain outside this file until it becomes a real rule

---

## Trade-offs

### Pros

- makes current behavior explicit
- improves consistency between frontend, API, and documentation
- reduces ambiguity in permission and status handling
- supports implementation review and regression checking

---

### Cons

- requires regular maintenance as rules evolve
- can diverge from conceptual documents if updates are not coordinated
- may feel verbose compared with a purely narrative domain document

---

## Alternatives Considered

### 1. Keep Rules Embedded Only in Domain Docs

- easier to read at first
- harder to use as an implementation source of truth

---

### 2. Keep Rules Only in Code

- avoids duplicate documentation
- makes policy review harder for design and product discussions

---

### 3. Write Rules as Loose Notes

- faster initially
- too ambiguous for consistent execution behavior

---

## Design Principles Alignment

This document aligns with:

- explicit business rule modeling
- implementation-oriented documentation
- audit-friendly workflow design
- separation between conceptual design and executable constraints

---

## Related Documents

- [Development Approach](./development-approach.md)
- [Ticket Lifecycle](../03-domain/ticket/ticket-lifecycle.md)
- [Ticket Activity Model](../03-domain/ticket/ticket-activity.md)
- [Ticket History](../03-domain/ticket/ticket-history.md)

---

## Summary

The ticket rules document defines the **current implementation source of truth**
for ticket update behavior and ticket action execution.

It translates business intent into explicit operational rules so that
permissions, status transitions, side effects, and restrictions remain
predictable, reviewable, and implementable.
