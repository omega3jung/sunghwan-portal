# Ticket Merge and Escalation Policy (2026-07)

## Context

The Service Desk Ticket Action model already supported `MERGE` as an
operational command.

The original merge concept was primarily intended for duplicate or related
tickets inside the same operational scope:

```txt
source ticket
-> Closed
-> linked to target ticket
-> closeReason = Merged
```

As the ticket model became explicitly tenant-scoped and category scope was
divided into `INTERNAL` and `PORTAL`, a practical workflow question emerged.

An internally created ticket may later need to be connected to an existing
customer-facing PORTAL ticket.

Example:

```txt
INTERNAL ticket
-> investigation confirms a customer-facing incident
-> existing PORTAL ticket already represents the official external workflow
```

The system needed to decide whether this should be:

- prohibited because the scopes differ
- treated as a normal merge
- implemented immediately as a new escalation command
- represented through the existing merge execution with explicit escalation
  semantics

This decision is separate from the generic Ticket Action transaction design.

The Action execution decision explains how commands, ticket mutation, and
History stay consistent. This decision explains which scope transitions are
allowed and what they mean.

---

## Problem

### 1. Allowing all cross-scope merges would weaken the scope boundary

A broad rule such as:

```txt
any readable ticket
-> may merge into any other readable ticket
```

would create several risks:

- cross-Tenant data relationships
- accidental INTERNAL-to-customer information exposure
- unclear reporting semantics
- reverse movement from PORTAL into INTERNAL workflows
- authorization based on UI visibility rather than stored Tenant and scope
- difficulty explaining whether merge means deduplication or escalation

Ticket visibility alone is not enough evidence that two tickets may be merged.

---

### 2. Prohibiting every INTERNAL-to-PORTAL relationship would ignore a real workflow

An INTERNAL ticket can legitimately become part of an external service process.

Completely blocking the relationship would cause:

- duplicate operational work
- disconnected audit trails
- manual references in free-text comments
- unclear ownership of the official customer-facing ticket
- difficulty explaining why the INTERNAL source was closed

The model needed a controlled handoff path.

---

### 3. Treating escalation as an ordinary same-scope merge would lose meaning

Same-scope merge and INTERNAL-to-PORTAL handoff are related but not identical.

```txt
same-scope merge
-> duplicate consolidation

INTERNAL -> PORTAL
-> operational escalation or official external handoff
```

Using only:

```txt
closeReason = Merged
```

for both cases would make reporting and UI explanation weaker.

---

### 4. Introducing a complete ESCALATE command immediately would expand the workflow surface

A dedicated command could provide the clearest long-term semantics:

```txt
ESCALATE_TO_PORTAL
```

However, introducing it immediately would require coordinated changes across:

- Ticket Action union
- command route validation
- command payload
- permission and status rules
- UI action availability
- Action form and labels
- History event semantics
- notification policy
- reporting
- tests and documentation

The immediate requirement was to represent a controlled relationship between
existing tickets, not to build a complete escalation subsystem.

---

## Options Considered

### Option 1 — Allow merge across Tenant and scope whenever the actor can read both tickets

#### Advantages

- flexible
- simple UI rule
- minimal special-case logic

#### Disadvantages

- visibility becomes an unsafe authorization shortcut
- Tenant isolation is weakened
- INTERNAL and PORTAL meaning becomes unstable
- reverse and unrelated customer merges become possible
- reporting cannot distinguish consolidation from escalation

This option was rejected.

---

### Option 2 — Allow merge only when both tickets have the same scope

```txt
INTERNAL -> INTERNAL
PORTAL -> PORTAL
```

#### Advantages

- simplest scope rule
- preserves strict separation
- merge retains one meaning

#### Disadvantages

- cannot represent a legitimate INTERNAL-to-PORTAL handoff
- forces manual cross-reference behavior
- creates duplicate operational records without a controlled closure reason

This option was not sufficient by itself.

---

### Option 3 — Introduce a dedicated escalation command immediately

```txt
INTERNAL ticket
-> ESCALATE_TO_PORTAL
-> existing or new PORTAL ticket
```

#### Advantages

- strongest semantic clarity
- independent authorization and History rules
- room for notification and customer communication behavior
- merge remains limited to duplicate consolidation

#### Disadvantages

- significantly expands the current command surface
- requires new UI and payload design
- risks premature abstraction before escalation-specific requirements are
  stable
- could duplicate much of the existing merge transaction behavior

This option was deferred as a possible future direction.

---

### Option 4 — Reuse MERGE execution and distinguish escalation through close reason

```txt
same-scope
-> MERGE
-> closeReason = Merged

same-Tenant INTERNAL -> PORTAL
-> MERGE
-> closeReason = Escalated
```

#### Advantages

- reuses the existing validated command and transaction boundary
- keeps one target-linking implementation
- preserves Action and History traceability
- distinguishes reporting meaning
- limits scope expansion
- leaves room for a future dedicated command

#### Disadvantages

- the Action type alone does not fully communicate escalation
- UI and reports must inspect `closeReason`
- future escalation-specific behavior may eventually require a separate command

This option was selected.

---

## Decision

Allow merge only within one Service Desk Tenant and only in these directions:

```txt
same-Tenant INTERNAL -> INTERNAL
-> allowed
-> closeReason = Merged

same-Tenant PORTAL -> PORTAL
-> allowed
-> closeReason = Merged

same-Tenant INTERNAL -> PORTAL
-> allowed
-> closeReason = Escalated
```

Reject:

```txt
PORTAL -> INTERNAL
cross-Tenant merge
Draft source or target
```

Detailed status and actor rules remain in the current Ticket Operation Rules.

The scope policy does not become broader for Admin merely because Admin has
more UI capability. Stored Tenant and scope remain server-validated constraints.

---

## Execution Semantics

### 1. Reuse the MERGE Action

The current execution remains:

```txt
actionType = MERGE
historyEvent = TICKET_MERGED
```

The close reason carries the reporting distinction:

```txt
Merged
Escalated
```

This avoids introducing a second command pipeline before escalation-specific
behavior is mature.

---

### 2. Close the source ticket

A successful merge or escalation closes the source ticket.

The source stores the target relationship:

```txt
mergedIntoTicketId
mergedIntoTicketNo
```

The close reason is:

```txt
Merged
or
Escalated
```

There is no separate persisted `Merged` or `Escalated` ticket status.

---

### 3. Use an existing target ticket

The current action links the source to an existing target ticket.

It does not:

- create a new target ticket
- clone the source into a new PORTAL ticket
- rerun target approval or assignment automatically
- treat the source and target as one database row

Target creation, if later required, belongs to a separate workflow.

---

### 4. Do not copy the source timeline into the target

The relationship does not copy:

- source Ticket Actions
- source Ticket History
- source attachments
- source rich-text content
- source Work Sessions

Those records keep their original Ticket identity and audit meaning.

The target may expose a relationship to the source where the UI or DTO supports
it, but historical records are not rewritten.

---

### 5. Keep the server as the authority

The client may submit a target ticket ID, but it does not prove:

- Tenant equality
- scope direction
- target eligibility
- merge permission
- source status validity

The command service must reload and validate both tickets from trusted data.

---

## Why INTERNAL to PORTAL Is One-Way

The allowed direction reflects workflow meaning.

```txt
INTERNAL
-> internal investigation or provider-side handling

PORTAL
-> official customer-facing workflow
```

An INTERNAL source may be escalated into an existing PORTAL target because the
external ticket can become the official workflow record.

The reverse direction is not equivalent.

```txt
PORTAL -> INTERNAL
```

could hide or downgrade a customer-facing request into an internal-only
workflow, weaken visibility expectations, and make audit interpretation
unclear.

Therefore the reverse direction remains rejected.

---

## Action and History Meaning

The command continues to follow the Ticket Action execution boundary:

```txt
MERGE Action
-> validate source and target
-> close source
-> store target relationship
-> append TICKET_MERGED History
```

The Action records the actor's intent and reason.

History records the immutable effect.

The close reason distinguishes:

```txt
duplicate consolidation
from
cross-scope escalation
```

---

## Consequences

### Positive

- Tenant isolation remains explicit.
- Same-scope duplicate consolidation stays supported.
- A realistic INTERNAL-to-PORTAL handoff is represented.
- Reporting can distinguish `Merged` and `Escalated`.
- Existing Action, transaction, and History infrastructure is reused.
- Source records retain their original audit identity.
- The design avoids prematurely adding a large escalation subsystem.

---

### Negative / Trade-offs

- `MERGE` now has two business meanings.
- Consumers must inspect `closeReason` to distinguish merge from escalation.
- `TICKET_MERGED` is shared by both outcomes.
- Escalation-specific notification and approval behavior is not represented.
- A future explicit escalation command may require migration or compatibility
  handling.

---

## Future Direction

If escalation gains behavior that materially differs from merge, introduce an
explicit command such as:

```txt
ESCALATE_TO_PORTAL
```

Possible triggers for that change include:

- creating the PORTAL target as part of the command
- customer notification delivery
- mandatory escalation reason categories
- different approval requirements
- copied or summarized source context
- separate History event
- separate reporting and SLA behavior
- explicit accept/reject handoff workflow

At that point:

```txt
MERGE
-> same-scope duplicate consolidation

ESCALATE_TO_PORTAL
-> controlled INTERNAL-to-PORTAL workflow
```

Until those requirements exist, the current `MERGE + Escalated closeReason`
design remains the smaller and more explainable implementation.

---

## Related Documents

- [Ticket Operation Rules](../03-domain/service-desk/ticket/reference/ticket-operation-rules.md)
- [Ticket Action Model](../03-domain/service-desk/ticket/ticket-action.md)
- [Ticket History](../03-domain/service-desk/ticket/ticket-history.md)
- [Ticket Lifecycle](../03-domain/service-desk/ticket/ticket-lifecycle.md)
- [Action Strategy](../03-domain/service-desk/ticket/strategy/action-strategy.md)
- [Ticket Action and History Execution](./2026-07-ticket-action-and-history-execution.md)
- [Ticket Routing and Update Policy](./2026-07-ticket-routing-and-update-policy.md)

---

## Summary

Ticket merge is constrained by trusted Tenant and scope relationships.

Same-scope tickets inside one Tenant may be consolidated with
`closeReason = Merged`.

An INTERNAL ticket may be linked to an existing PORTAL ticket inside the same
Tenant as a controlled escalation, using the existing `MERGE` Action and
`TICKET_MERGED` History while setting `closeReason = Escalated`.

PORTAL-to-INTERNAL and cross-Tenant merges remain rejected. A dedicated
escalation command is deferred until escalation requires behavior beyond the
current merge transaction.

---

## Status

Accepted and implemented.
