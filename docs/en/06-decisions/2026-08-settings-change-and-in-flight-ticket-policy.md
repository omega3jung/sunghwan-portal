# Settings Change and In-Flight Ticket Policy (2026-08)

## Context

Service Desk Settings define behavior used by ticket workflows.

The main settings areas are:

```txt
Tenant
-> Category
-> Approval Step
-> Assignment Rule
```

These settings can influence:

- ticket classification
- category defaults
- approval requirements
- current and future approvers
- work assignment
- tenant and scope boundaries
- routing behavior

The earlier design intentionally treated Settings as current configuration rather
than historical workflow state.

The simplified policy was:

```txt
Settings change
-> affects future workflow resolution

Existing Ticket state / History
-> remains unchanged
```

This protected historical integrity and prevented administrative configuration
changes from silently rewriting already executed workflow events.

As the REMOTE Service Desk implementation became more complete, however, another
case became important:

```txt
A Ticket is still in progress
while
the Settings that define its current routing are changed.
```

For example:

```txt
Ticket
-> status = Approval
-> current approver resolved from Approval Step

Admin changes Category / Approval Step configuration
-> current routing may no longer match the configuration
```

Simply preserving the existing ticket forever would protect historical state,
but it could also leave an active workflow using configuration that is no longer
valid.

The project therefore needed to distinguish:

```txt
historical meaning
from
current operational validity
```

---

## Problem

### 1. "Settings affect only future Tickets" was too broad

The original rule was useful because Settings must not retroactively rewrite
past workflow meaning.

However, it treated two different things as if they were the same:

```txt
Past workflow evidence
Current in-flight workflow state
```

These have different responsibilities.

Past workflow evidence includes:

- Ticket Action
- Ticket History
- completed approval events
- previous assignment events
- previous status transitions

These records must remain immutable.

Current in-flight state includes:

- current `status`
- current `approvalStepId`
- current `assigneeUsernames`
- current approval responsibility
- current work responsibility

That state represents who owns the workflow **now**.

If configuration changes invalidate that ownership, preserving it indefinitely
can make the active ticket inconsistent with the current Service Desk policy.

---

### 2. Silently recalculating every Ticket would also be unsafe

The opposite policy would be:

```txt
Settings mutation
-> automatically recalculate every related Ticket
```

This is also problematic.

A Settings edit could unexpectedly:

- replace current approvers
- replace current workers
- restart approval
- change ticket status
- alter operational responsibility for many Tickets

An administrator editing configuration might not realize that the operation also
changes active Ticket workflows.

Settings mutation and Ticket workflow mutation therefore cannot be coupled as an
invisible side effect.

---

### 3. Historical audit and current routing must not be conflated

Suppose a Ticket completed approval step 1:

```txt
APPROVAL_APPROVED
actor = userA
```

and Settings later change the Approval Step configuration.

The old History must still mean:

```txt
userA approved the Ticket under the routing that existed at that time
```

It must not be rewritten to show the new approver.

At the same time, if the Ticket is still in `Approval`, the current approval
ownership may need to be recalculated.

Therefore:

```txt
preserve History
!=
preserve current routing forever
```

---

### 4. Different Settings changes have different levels of safety

Not every Settings mutation should have the same impact.

Examples:

```txt
Category display name changed
-> no routing impact
```

```txt
Category default priority changed
-> generally affects future derivation
```

```txt
Approval Step changed
-> may invalidate current Approval ownership
```

```txt
Assignment Rule changed
-> may affect future work resolution
```

```txt
Category moved to another Tenant
-> changes the workflow/security boundary itself
```

The system therefore needs to distinguish:

- safe descriptive/configuration changes
- workflow-sensitive changes
- immutable boundary changes

---

### 5. Tenant changes are fundamentally different from routing recalculation

Tenant is the Service Desk configuration boundary.

Changing a Category from one Tenant to another would potentially change:

- company context
- authorization
- available approvers
- eligible workers
- category scope
- ticket visibility
- reporting ownership

This is not merely a routing refresh.

A cross-Tenant move changes the meaning of the resource itself.

The system should not attempt to repair this afterward by rerouting related
Tickets.

---

## Options Considered

### Option 1 — Settings changes affect only new Tickets

```txt
Settings change
-> existing Tickets always keep current state
-> only new Tickets use new configuration
```

#### Advantages

- simplest behavior
- strong historical stability
- no hidden Ticket mutations
- easy to explain

#### Disadvantages

- active Tickets may continue with invalid approvers or workers
- operational configuration changes can take an unbounded amount of time to
  take effect
- administrators cannot safely correct broken routing configuration for current
  workflows
- conflates immutable history with mutable current responsibility

This option was rejected as a complete policy.

Its historical-integrity principle is retained.

---

### Option 2 — Automatically recalculate all affected Tickets

```txt
Settings save
-> find affected Tickets
-> automatically reroute all of them
```

#### Advantages

- active Tickets immediately follow current configuration
- no stale routing remains

#### Disadvantages

- Settings mutation has a large hidden operational side effect
- administrators cannot review impact before execution
- a small configuration edit may unexpectedly restart many Tickets
- failures during bulk recalculation become difficult to explain
- Ticket workflow changes become implicit rather than command-like
- weakens auditability

This option was rejected.

---

### Option 3 — Block every Settings change while affected Tickets exist

```txt
affected Ticket exists
-> reject Settings mutation
```

#### Advantages

- no active Ticket becomes inconsistent
- simple safety model
- no rerouting side effects

#### Disadvantages

- configuration can become effectively immutable in an active Service Desk
- broken settings may be impossible to correct until all Tickets finish
- administrators lose necessary operational control
- impractical for long-running Tickets

This option was rejected for normal Category configuration changes.

The blocking principle is retained for changes that cross immutable domain
boundaries.

---

### Option 4 — Inspect impact, distinguish boundaries, and explicitly reroute where allowed

```txt
Settings mutation requested
-> inspect affected in-flight Tickets
-> classify change
-> warn or block
-> apply explicit supported impact policy
```

For normal Category/routing configuration:

```txt
impact detected
-> administrator sees impact
-> mutation may proceed explicitly
-> affected current routing is recalculated when required
-> previous workflow evidence remains in History
```

For immutable Tenant/scope boundary changes:

```txt
mutation requested
-> reject
```

This option was selected.

---

## Decision

Settings changes must preserve historical workflow meaning while explicitly
handling affected in-flight Tickets.

The core policy is:

```txt
Past History
-> immutable

Current Ticket routing
-> may be recalculated when the Settings mutation invalidates it

Tenant / scope identity
-> immutable after creation
```

Settings mutation must not silently rewrite active Ticket workflow.

When a workflow-sensitive mutation can affect in-flight Tickets, the server
must inspect the impact before completing the change.

---

## Historical Integrity

The following records are not recalculated because Settings changed:

```txt
Ticket Action
Ticket History
completed approval events
completed assignment events
previous status transitions
work-session evidence
```

Example:

```txt
APPROVAL_APPROVED
actor = alice
createdAt = previous timestamp
```

remains unchanged even if:

- the Approval Step is edited
- the approver configuration is replaced
- the Category configuration changes later

History records what actually occurred.

```txt
Settings describe current configuration.
History describes executed workflow.
```

These responsibilities must remain separate.

---

## Current Ticket State Is Not Historical Evidence

The Ticket row represents current workflow state.

Important routing fields include:

```txt
status
approvalStepId
assigneeUsernames
categoryId
```

These fields may legitimately change when an explicit workflow operation
requires it.

Therefore:

```txt
History immutable
```

does not imply:

```txt
Ticket current routing immutable
```

If a supported Settings mutation makes the current routing invalid, the Ticket
may be explicitly rerouted while previous routing remains visible through
History.

---

## Impact Inspection

Before applying a workflow-sensitive Settings mutation, the server should
determine whether in-flight Tickets depend on the affected configuration.

Conceptually:

```txt
Settings mutation
-> resolve stored Tenant / Category relationship
-> identify affected configuration
-> query related in-flight Tickets
-> determine workflow impact
-> apply mutation policy
```

The impact check must use stored server-side relationships.

Client-provided:

```txt
tenantId
companyId
category scope
affected ticket count
```

must not be trusted as authorization or impact evidence.

---

## In-Flight Ticket Scope

The impact policy is concerned with Tickets that still have active workflow
responsibility.

Examples include:

```txt
Approval
Assigned
Working
Pending
```

The exact affected status set depends on the Settings resource being changed.

Terminal or historical states do not need their completed routing rewritten.

Examples:

```txt
Declined
Rejected
Resolved
Closed
```

may remain historically associated with the configuration under which their
workflow occurred unless another explicit Ticket operation later re-enters
routing.

Draft behavior is resolved when the Draft is submitted and therefore uses the
current valid Settings at submission time.

---

## Change Classification

Settings mutations should be classified by impact.

### 1. Descriptive Change

Examples:

```txt
Category name
description
request template
display color or similar presentation metadata
```

Typical effect:

```txt
Settings update
-> no current routing reset
```

Existing History remains unchanged.

The current UI may display the newest Category label when resolving Category
reference data, but historical event meaning is not rewritten.

---

### 2. Default / Future-Derivation Change

Examples:

```txt
default priority
default risk
default SLA days
```

These normally affect:

- future Tickets
- future requester routing-sensitive updates
- future explicit routing recalculation

They do not by themselves silently rewrite current Ticket planning values.

Changing a default is not equivalent to issuing `ADJUST` against every active
Ticket.

---

### 3. Routing-Sensitive Change

Examples include changes to configuration that determines:

```txt
approval pipeline
approval assignee resolution
assignment rule
effective category routing
```

These may affect current workflow ownership.

The server must inspect related in-flight Tickets before completing the
mutation.

---

### 4. Boundary Change

Examples:

```txt
Category Tenant
Main Category scope
Sub Category parent when it crosses Tenant/scope
```

These are not supported updates.

They must be rejected rather than repaired through Ticket rerouting.

The supported migration pattern is:

```txt
deactivate old configuration
-> create new configuration in the correct boundary
```

This preserves:

- Tenant isolation
- historical Category references
- current Ticket meaning
- authorization consistency

---

## Category Change Policy

Category configuration may be changed even when related active Tickets exist,
provided the mutation remains inside the existing Tenant and scope boundary and
the administrator explicitly proceeds after impact is known.

Conceptually:

```txt
Category mutation
-> affected Ticket check
```

When no relevant in-flight Ticket is affected:

```txt
apply Settings mutation
```

When relevant Tickets are affected:

```txt
show impact warning
-> administrator explicitly proceeds
-> apply supported Ticket impact policy
```

The UI warning is for administrator understanding.

The server remains responsible for determining the actual affected Tickets.

---

## Approval Impact Policy

Approval configuration is especially sensitive because an `Approval` Ticket
stores its current Approval Step and current approvers.

If a Category or Approval Step change invalidates the current approval routing,
the Ticket must not continue by pretending that its previous incomplete
approval pipeline is still authoritative.

The selected policy is:

```txt
affected Ticket in Approval
-> preserve previous approval History
-> reset current approval context
-> rerun routing from the beginning
```

Conceptually:

```txt
current Approval Ticket
-> clear invalid current approval routing
-> resolve first applicable Approval Step again
-> resolve current approvers
```

If approval is no longer required:

```txt
-> resolve work Assignment
-> status = Assigned
```

If approval is still required:

```txt
-> status = Approval
-> approvalStepId = newly resolved step
-> assigneeUsernames = newly resolved approvers
```

Previous completed approvals are preserved as historical events.

They are not reused as proof that steps in the newly calculated pipeline have
already been approved.

This follows the same principle as requester routing-sensitive updates:

```txt
old routing result invalidated
-> routing starts again
```

---

## Why Approval Restarts from the Beginning

Trying to continue from the "closest equivalent" step was rejected.

For example:

```txt
old steps:
A -> B -> C

new steps:
A -> D -> C
```

If the Ticket was currently at `B`, attempting to infer whether:

```txt
A is still valid
C should remain pending
D has effectively been skipped
```

would require configuration-version semantics that the project does not
currently implement.

The safer and more explainable rule is:

```txt
routing-invalidating configuration change
-> restart approval resolution
```

History still shows that previous approvals occurred.

The restarted workflow represents the new current policy.

---

## Assignment Impact Policy

Assignment Settings describe how workers are resolved when the Ticket enters or
re-enters work routing.

A Settings mutation must not silently rewrite current work ownership merely
because the Assignment Rule changed.

Therefore the baseline remains:

```txt
existing current workers
-> remain current workers
until an explicit workflow operation changes work assignment
```

Assignment Rule changes affect:

- new Ticket routing
- final approval transitioning to work assignment
- resubmission
- requester routing-sensitive update
- another explicit routing recalculation

This avoids turning Assignment Rule editing into an invisible bulk `ASSIGN`
command.

If a future operational requirement introduces administrator-triggered
reassignment of affected active Tickets, that should be modeled as a separate
explicit command or bulk operation with its own History semantics.

---

## Category Change vs Tenant Change

The distinction is intentional.

### Category Configuration

Within the same immutable Tenant/scope boundary:

```txt
may change
-> impact can be inspected
-> affected Approval routing can be explicitly recalculated
```

### Tenant / Scope Boundary

```txt
must not change
```

This prevents an administrator from turning:

```txt
Tenant A Category
```

into:

```txt
Tenant B Category
```

while existing Tickets still reference the same Category identity.

Tenant movement is not a Settings edit.

It creates a new domain identity and authorization context.

---

## Warning vs Authorization

The UI may present:

- number of affected Tickets
- affected workflow type
- confirmation message
- explanation that Approval may restart

This improves administrator awareness.

However:

```txt
UI confirmation
!= authorization
```

The server must still validate:

- authenticated identity
- effective impersonated identity
- Settings capability
- stored Tenant relationship
- Category scope
- mutation input
- affected Ticket relationship

The server also determines whether rerouting is required.

---

## Transaction Boundary

A Settings mutation that also changes affected Ticket routing must not leave the
system in a partial state.

Unsafe result:

```txt
Approval Step updated
-> Ticket rerouting fails
-> Ticket still references invalid current Approval Step
```

or:

```txt
Ticket rerouted
-> Settings write fails
```

Where the supported mutation requires immediate Ticket recalculation, the
operation should be treated as one application use case.

Conceptually:

```txt
validate Settings mutation
-> inspect affected Tickets
-> validate rerouting result
-> persist Settings change
-> persist Ticket routing changes
-> append History
-> commit
```

REMOTE execution should use an appropriate database transaction boundary.

LOCAL mutable demo behavior should mirror the same visible result.

---

## History for Settings-Induced Rerouting

Settings mutation must never edit previous History.

When current Ticket routing is reset because of a Settings change, the reset
itself is a new event.

The History model should make the cause explicit enough to distinguish:

```txt
requester changed request content
```

from:

```txt
administrator changed workflow configuration
```

The existing event/source model should be reused where it can accurately
represent the effect.

If the current History contract cannot distinguish these causes without
ambiguity, extending History metadata or source semantics is preferable to
rewriting an old event.

The important invariant is:

```txt
old History remains
+
new routing effect is appended
```

not:

```txt
old History is recomputed
```

---

## Failure Policy

A Settings mutation that requires rerouting can fail if the new configuration
cannot produce a valid workflow.

Examples:

```txt
no valid approver can be resolved
no valid worker can be resolved when approval is no longer required
referenced organization data became invalid
Category is not operationally ready
```

The system must not persist a state such as:

```txt
status = Approval
assigneeUsernames = []
```

or:

```txt
status = Assigned
assigneeUsernames = []
```

when the workflow requires ownership.

If required rerouting cannot produce a valid result, the mutation should not
leave affected Tickets partially updated.

---

## LOCAL and REMOTE Consistency

The policy applies to both runtime modes.

```txt
Settings UI
-> feature API
-> Route Handler / application handler
-> impact policy
-> LOCAL handler or REMOTE service
```

### LOCAL

LOCAL mutable demo state should:

- identify affected demo Tickets
- expose the same warning/impact result
- reject immutable boundary changes
- reroute affected Approval Tickets where the supported policy requires it
- append corresponding History rather than rewriting existing events

### REMOTE

REMOTE should:

- derive impact from stored relationships
- enforce authorization before mutation
- use transaction-aware Settings and Ticket services
- rerun server routing logic
- persist updated Ticket state
- append immutable History

The UI should consume one application-facing contract.

---

## Relationship with Requester Update Routing

The project already uses the following policy for requester updates:

```txt
routing-neutral change
-> preserve current routing

routing-sensitive change
-> invalidate current routing
-> restart routing from the beginning
```

Settings-induced approval invalidation follows the same architectural principle:

```txt
current routing assumptions became invalid
-> do not patch them incrementally
-> recompute routing through the server authority
```

The cause is different:

```txt
Requester update
-> request meaning changed

Settings mutation
-> workflow configuration changed
```

but both require explicit and traceable recalculation rather than hidden field
mutation.

---

## Relationship with Settings Versioning

This decision does not introduce Settings snapshots or versioned configuration.

The project does not currently persist:

```txt
ticket.categoryConfigVersion
ticket.approvalConfigVersion
ticket.assignmentConfigVersion
```

Therefore it cannot safely replay an exact historical Settings snapshot as the
current workflow policy.

Instead:

```txt
History
-> preserves what happened

Ticket current state
-> preserves current workflow responsibility

Settings
-> defines current configuration

explicit recalculation
-> reconnects current Ticket state to current Settings when required
```

Full configuration versioning remains a future extension.

---

## Consequences

### Positive

- preserves immutable historical meaning
- avoids stale invalid Approval ownership after important Settings changes
- prevents silent bulk Ticket mutation
- gives administrators visibility into change impact
- keeps Tenant/scope isolation strict
- reuses the existing server routing authority
- makes Settings mutation behavior explainable
- keeps LOCAL and REMOTE aligned
- avoids pretending that Settings are versioned when they are not
- distinguishes configuration management from Ticket Action execution

### Negative / Trade-offs

- workflow-sensitive Settings changes become more complex
- impact queries are required before mutation
- the UI needs impact warnings or confirmation
- affected Approval Tickets may restart from the beginning
- administrators need to understand that Settings changes can affect current
  workflow
- Settings + Ticket mutations may require larger transaction boundaries
- without configuration versioning, previous approvals remain evidence but are
  not reused after a routing reset
- Assignment Rule changes do not automatically repair already assigned active
  work; a separate operational reassignment mechanism may still be needed

---

## Rejected Behaviors

The following behaviors are intentionally not used:

```txt
Settings changed
-> rewrite previous Ticket History
```

```txt
Approval Steps changed
-> keep invalid current approver forever
```

```txt
Settings changed
-> silently reroute every active Ticket
```

```txt
Assignment Rule changed
-> silently replace current workers
```

```txt
Category has active Tickets
-> all Category changes permanently blocked
```

```txt
Category Tenant changed
-> move existing Tickets into the new Tenant
```

```txt
Main Category scope changed
-> reinterpret historical Tickets under the new scope
```

```txt
UI confirmation
-> sufficient authorization for impact execution
```

---

## Implementation Direction

The intended application flow is:

```txt
Settings mutation request
-> authenticate
-> resolve effective user
-> authorize stored Settings resource
-> classify mutation impact
-> find affected in-flight Tickets
```

For a non-routing change:

```txt
-> persist Settings
-> return
```

For a supported routing-sensitive Category / Approval change:

```txt
-> return or expose impact to administrator
-> explicit proceed
-> validate new Settings
-> recalculate affected Approval routing
-> append new History
-> persist atomically
```

For a boundary mutation:

```txt
tenant / scope / cross-boundary parent change
-> reject
```

For Assignment Rule changes:

```txt
-> persist valid current configuration
-> use it for future assignment resolution
-> do not silently replace current workers
```

---

## Related Documents

- [Service Desk Settings](../03-domain/service-desk/settings.md)
- [Category Strategy](../03-domain/service-desk/ticket/strategy/category-strategy.md)
- [Approval System](../03-domain/service-desk/ticket/strategy/approval-system.md)
- [Assignment Policy](../03-domain/service-desk/ticket/strategy/assignment-policy.md)
- [Ticket History](../03-domain/service-desk/ticket/ticket-history.md)
- [Ticket Lifecycle](../03-domain/service-desk/ticket/ticket-lifecycle.md)
- [Ticket Operation Rules](../03-domain/service-desk/ticket/reference/ticket-operation-rules.md)
- [Ticket Routing and Update Policy (2026-07)](./2026-07-ticket-routing-and-update-policy.md)
- [Service Desk Tenant Design (2026-06)](./2026-06-service-desk-tenant-design.md)
- [Category Activation and Routing Readiness (2026-08)](./2026-08-category-activation-and-routing-readiness.md)

---

## Summary

Settings are current workflow configuration.

History is immutable evidence of executed workflow.

Current Ticket routing is operational state.

These responsibilities are related but not identical.

```txt
Settings change
-> never rewrite past History
```

```txt
Settings change invalidates active Approval routing
-> inspect impact
-> explicitly reroute
-> restart approval from the beginning
-> append new History
```

```txt
Assignment Rule change
-> affects future work resolution
-> does not silently replace current workers
```

```txt
Tenant / scope boundary change
-> reject
```

The central distinction is:

```txt
Preserving historical meaning
does not require preserving invalid current routing.
```

A configuration change may update current workflow responsibility when the
effect is explicit, authorized, validated, and traceable.

It must never make past workflow evidence appear as though different events
occurred.

---

## Status

Accepted
