# Category Activation and Routing Readiness (2026-08)

## Context

Category is the central behavior configuration for Service Desk tickets.

It influences:

- request classification
- approval routing
- work assignment
- priority and risk defaults
- SLA-related due date expectations
- requester update routing

The existing category lifecycle used an `active` field to determine whether a
category could be selected for new ticket workflows.

```txt
active = true
-> available for new workflows

active = false
-> unavailable for new workflows
-> historical references remain valid
```

As Service Desk Settings became more complete, a configuration problem became
visible.

A newly created Category could become active before its Assignment Rule was
ready to produce work ownership.

This could create a configuration that looked valid in Settings but failed when
a ticket reached work assignment.

The issue became more important because assignment resolution supports both:

- explicit Employee references
- Job Field references

and because Sub Categories may either define their own Assignment Rule or inherit
the Main Category rule.

The project therefore needed a clearer lifecycle between:

```txt
Category exists
and
Category is ready to participate in ticket routing
```

It also needed to distinguish lightweight configuration readiness from the
stronger validation required when an actual ticket is routed.

---

## Problem

### 1. Category creation and operational availability were being treated as the same state

A Category can be structurally valid before its workflow configuration is
complete.

For example:

```txt
create Category
-> configure defaults
-> configure Approval Steps
-> configure Assignment Rule
```

If Category creation immediately produced:

```txt
active = true
```

the Category could become selectable before assignment configuration was ready.

That creates an invalid workflow window:

```txt
Category created
-> visible to requester
-> Ticket submitted
-> no usable Assignment Rule
-> work routing cannot resolve ownership
```

A configuration entity should not enter production-like workflow availability
simply because its base record was successfully created.

---

### 2. Assignment Rule existence alone was not enough to define readiness

An Assignment Rule contains references such as:

```ts
type AssigneeGroup = {
  jobFieldIds: string[];
  assigneeUsernames: string[];
};
```

Several states are possible:

```txt
no Assignment Rule
empty Assignment Rule
Assignment Rule with inactive references
Assignment Rule with active references
```

Treating all of these as equivalent would weaken configuration validation.

In particular, an explicitly stored empty Assignment Rule would be ambiguous.

It could mean:

- configuration has not been completed
- intentionally no workers exist
- inherit the Main Category rule
- invalid configuration accidentally saved

The system needed one unambiguous meaning for Assignment Rule absence and
presence.

---

### 3. Sub Category fallback could hide invalid configuration

Assignment resolution already follows this direction:

```txt
selected Sub Category
-> own Assignment Rule when present
-> otherwise Main Category Assignment Rule
```

A tempting implementation would be:

```txt
Sub Category own rule exists but is invalid
-> silently fall back to Main Category rule
```

This would make the UI appear resilient, but it would hide broken
configuration.

An administrator could believe that a Sub Category had its own routing policy
while runtime behavior silently used a different policy.

Fallback needed to mean:

```txt
no override exists
```

not:

```txt
the override exists but does not work
```

---

### 4. Activation readiness and actual routing eligibility are different questions

Settings can determine whether the configuration contains usable active
references.

However, ticket routing occurs later and has more context.

Between configuration and ticket execution:

- an employee may become inactive
- an employee may move to another company
- organization relationships may change
- a Job Field may no longer resolve eligible employees
- Tenant or Company state may change
- category authorization or scope context may change

Therefore this implication is unsafe:

```txt
Category was ready when activated
-> Category will always resolve a worker later
```

Activation validation cannot replace routing-time validation.

---

### 5. Parent Category availability affects Sub Category availability

A Sub Category belongs to a Main Category and inherits its workflow scope.

Allowing this state:

```txt
Main Category active = false
Sub Category active = true
-> Sub Category selectable
```

would break the hierarchy.

At the same time, automatically overwriting the stored Sub Category value when
the Main Category is temporarily deactivated would lose useful configuration.

The model needed to distinguish:

```txt
stored active state
and
effective active state
```

---

## Options Considered

### Option 1 — Create Categories as active and fail only during ticket routing

```txt
Create Category
-> active = true
-> allow selection
-> detect routing failure when Ticket is submitted
```

#### Advantages

- simplest Category lifecycle
- minimal Settings validation
- routing remains the single final validation point

#### Disadvantages

- exposes incomplete configuration to requesters
- turns an administrative configuration error into a user workflow failure
- allows obvious routing problems to remain undetected until Ticket creation
- weakens the meaning of `active`
- makes Settings less useful as an operational configuration surface

This option was rejected.

---

### Option 2 — Require complete routing configuration during Category creation

```txt
Create Category
-> require valid Assignment Rule immediately
-> create as active
```

#### Advantages

- Category cannot exist in an obviously incomplete state
- fewer lifecycle states

#### Disadvantages

- couples basic Category creation with Assignment Rule editing
- makes configuration order unnecessarily rigid
- prevents administrators from creating the category hierarchy first
- makes Approval Step and Assignment Rule setup harder to treat as separate
  Settings workflows
- increases the size and responsibility of Category creation

This option was rejected.

---

### Option 3 — Create inactive, configure separately, activate when ready

```txt
Create Category
-> force inactive

Configure Category / Approval / Assignment
-> validate readiness

Explicit activation
-> active
```

#### Advantages

- separates existence from operational availability
- supports incremental administration
- prevents incomplete Categories from entering requester workflows
- keeps Settings responsibilities separated
- gives `active` a stronger operational meaning
- preserves routing-time validation as a separate safety boundary

#### Disadvantages

- introduces a configuration lifecycle
- requires activation feedback in the UI
- requires LOCAL and REMOTE to enforce the same rule
- requires readiness logic in addition to routing logic

This option was selected.

---

## Decision

Introduce an explicit Category activation lifecycle.

The core model is:

```txt
Category created
-> inactive
-> configuration may be completed
-> readiness checked
-> explicitly activated
-> available for new Ticket workflows
```

Category creation must not automatically make a Category operational.

Both Main Category and Sub Category creation are persisted with:

```txt
active = false
```

regardless of a client-supplied active value.

The server boundary is authoritative for this rule in both LOCAL and REMOTE
runtime modes.

---

## Category Lifecycle

The intended lifecycle is:

```txt
Create
-> Inactive
-> Configure
-> Ready
-> Activate
-> Active
```

Deactivation remains supported:

```txt
Active
-> Deactivate
-> Inactive
```

Historical ticket references remain valid after deactivation.

Reactivation requires readiness validation again because referenced
organization data may have changed since the Category was previously active.

---

## Assignment Readiness

A Category can be activated only when its effective Assignment Rule contains at
least one active assignment reference.

A qualifying reference is either:

```txt
active Job Field
or
active Employee
```

Conceptually:

```txt
effective Assignment Rule
-> active Job Field reference count >= 1
   OR
-> active Employee reference count >= 1
-> Category may be activated
```

This is a Settings readiness check.

It proves that the routing configuration is not structurally empty and that it
contains at least one currently active assignment reference.

It does **not** prove that an actual Ticket will always resolve at least one
eligible worker.

---

## Empty Assignment Rules

An empty Assignment Rule is not a valid persisted routing configuration.

This state must not be saved:

```txt
jobFieldIds = []
assigneeUsernames = []
```

An Assignment Rule with no assignment references has no operational meaning.

For a Sub Category, the distinction is especially important:

```txt
no own Assignment Rule
-> inherit Main Category Assignment Rule

own Assignment Rule exists
-> use that rule
```

Therefore an empty Sub Category Assignment Rule must not be used as a
placeholder for inheritance.

If the Sub Category should inherit from Main Category, the own Assignment Rule
must be absent.

---

## Sub Category Rule Resolution

The existing assignment precedence remains:

```txt
selected Sub Category
-> own Assignment Rule when present
-> otherwise Main Category Assignment Rule
```

Fallback occurs only when the Sub Category has **no own Assignment Rule**.

It must not occur because an existing own rule is invalid.

Rejected behavior:

```txt
Sub own rule exists
-> invalid or unusable
-> silently use Main rule
```

Required behavior:

```txt
Sub own rule exists
-> validate that rule
-> failure remains visible

Sub own rule absent
-> use Main rule
```

This keeps configuration intent explicit.

An invalid override is a configuration error, not a fallback signal.

---

## Effective Assignment Rule for Activation

Main Category readiness uses its own Assignment Rule.

```txt
Main Category
-> Main Assignment Rule
```

Sub Category readiness uses the same precedence as ticket routing:

```txt
Sub Category
-> own Assignment Rule when present
-> otherwise Main Category Assignment Rule
```

This keeps activation behavior aligned with the routing model without
duplicating a different inheritance rule.

---

## Stored Active State vs Effective Active State

Sub Category availability is derived from both levels.

```ts
effectiveActive = mainCategory.active && subCategory.active;
```

Therefore:

```txt
Main active + Sub active
-> effectively active

Main active + Sub inactive
-> effectively inactive

Main inactive + Sub active
-> effectively inactive

Main inactive + Sub inactive
-> effectively inactive
```

When a Main Category is deactivated, the system does not need to overwrite every
Sub Category's stored `active` field.

For example:

```txt
Main.active = false
Sub.active = true
```

may remain stored.

The Sub Category is still unavailable because:

```txt
effectiveActive = false
```

If the Main Category is later reactivated, the Sub Category's own stored state
can be evaluated again instead of having been destructively rewritten.

---

## Ticket Selection Policy

New Ticket workflows may use only effectively active Categories.

For a Sub Category:

```txt
main.active
&& sub.active
&& category visible in the current Tenant/scope context
```

must hold before it can participate in requester selection.

Existing Tickets may continue to display Categories that later become inactive.

Category deactivation must not destroy historical classification.

---

## Activation Readiness vs Routing-Time Validation

The system intentionally keeps two validation boundaries.

### Activation-Time Readiness

Activation asks:

```txt
Is this Category configuration sufficiently prepared to be exposed to new
Ticket workflows?
```

It checks configuration readiness such as:

- effective Assignment Rule exists
- at least one active Job Field or active Employee reference exists
- Category hierarchy is valid
- applicable parent state permits activation
- Settings authorization permits the mutation

This prevents obvious incomplete configuration from becoming active.

---

### Routing-Time Validation

Ticket routing asks:

```txt
Can this specific Ticket resolve valid current ownership now?
```

Routing must perform the stronger validation.

It continues to validate:

- current Category and Tenant state
- current Company boundary
- current Assignment Rule
- referenced Job Fields
- referenced Employees
- employee activity
- employee company eligibility
- scope-specific assignment rules
- final resolved worker set

The critical invariant remains:

```txt
resolved workers.length >= 1
```

If no valid worker can be resolved, routing fails.

The system must not create:

```txt
status = Assigned
assigneeUsernames = []
```

Activation is therefore a configuration quality gate.

Routing remains the operational source of truth.

---

## Why Activation Does Not Resolve and Freeze Workers

One alternative would be to resolve actual worker usernames at Category
activation and treat that result as proof of future operability.

This was rejected.

Assignment configuration can reference Job Fields, and organization data can
change after activation.

Persisting or trusting a worker resolution snapshot at activation would become
stale.

The intended relationship is:

```txt
Settings
-> stores routing references

Activation
-> validates configuration readiness

Ticket routing
-> resolves current eligible workers
```

This keeps organization membership dynamic while preventing incomplete Settings
from being exposed unnecessarily.

---

## UI Capability

The Settings UI may expose a derived capability such as:

```ts
canActivateCategory
```

to control:

- activation switch availability
- explanatory messages
- disabled state
- administrator guidance

The capability is a UI/application projection.

It is not the authorization or validation source of truth.

Required boundary:

```txt
UI canActivateCategory
-> improve interaction

Server activation validation
-> authoritative decision
```

A manipulated request must not be able to activate an unready Category merely
because the client normally disables the control.

---

## LOCAL and REMOTE Consistency

The lifecycle applies to both runtime modes.

```txt
UI
-> feature API client
-> Route Handler / application boundary
-> LOCAL or REMOTE implementation
```

### LOCAL

LOCAL mutable demo state must:

- create Categories inactive
- enforce Assignment Rule readiness
- apply Main/Sub effective active behavior
- prevent invalid activation

### REMOTE

REMOTE services and repositories must:

- ignore or reject client attempts to create an active Category
- persist new Categories as inactive
- validate activation against stored Category and Assignment data
- validate organization references at the server/database boundary
- retain routing-time worker validation

The UI should not need to know which implementation supplied the result.

---

## Relationship with Approval Configuration

Category activation readiness is primarily gated by work Assignment readiness.

Approval configuration remains independently validated when Approval Steps are
saved and again when an actual approval route is resolved.

A Category without Approval Steps is valid because approval is optional.

A Category without any viable work-assignment configuration is not
operationally complete because every successfully processed Ticket eventually
needs work ownership.

Therefore:

```txt
Approval Steps
-> optional routing phase

Assignment Rule
-> required path to work ownership
```

Activation readiness must not confuse "no approval required" with "no worker
required."

---

## Relationship with Historical Integrity

This decision changes when a Category may become available for future workflow.

It does not change historical ticket meaning.

```txt
Category configuration lifecycle
-> future Ticket availability

Existing Ticket / Action / History
-> preserved
```

Deactivation or failure to meet future readiness rules must not rewrite existing
Ticket History.

Existing ticket state changes remain governed by explicit Ticket workflow
operations and the separate Settings-change impact policy.

---

## Consequences

### Positive

- incomplete Categories cannot immediately enter requester workflows
- `active` now represents operational availability more clearly
- administrators can create configuration incrementally
- Assignment Rule inheritance becomes unambiguous
- invalid Sub Category overrides cannot be hidden by fallback
- Main/Sub active hierarchy is explicit
- LOCAL and REMOTE behavior can follow the same lifecycle
- UI can explain why a Category cannot yet be activated
- routing still protects against organization changes after activation
- the design avoids creating unowned `Assigned` tickets

---

### Negative / Trade-offs

- Category now has a more explicit administrative lifecycle
- Settings UI needs readiness feedback
- activation requires additional server validation
- readiness logic and routing validation are intentionally separate and must not
  drift
- administrators may need to configure multiple Settings areas before enabling a
  Category
- an active Category can still become temporarily unroutable later if
  organization data changes, so runtime failure handling remains necessary

---

## Rejected Simplifications

The following shortcuts are intentionally not used:

```txt
Category created -> immediately active
```

```txt
Assignment Rule exists -> automatically ready
```

```txt
empty Sub rule -> Main fallback
```

```txt
invalid Sub rule -> Main fallback
```

```txt
Category activated once -> future routing validation unnecessary
```

```txt
Main deactivated -> permanently overwrite all Sub active flags
```

```txt
UI disabled state -> sufficient activation protection
```

Each shortcut would remove a useful boundary between configuration intent,
operational availability, and actual workflow execution.

---

## Implementation Direction

The intended implementation direction is:

```txt
Category Create
-> server forces active = false
```

```txt
Assignment Rule Save
-> reject empty rule
-> validate referenced Job Fields / Employees
```

```txt
Category Activation
-> resolve effective Assignment Rule
-> verify active assignment reference exists
-> persist active = true
```

```txt
Ticket Submit / Resubmit / Explicit Routing Recalculation
-> resolve current rule
-> resolve current eligible workers
-> require at least one worker
-> continue workflow
```

For Sub Categories:

```txt
effectiveAssignmentRule =
  subOwnRule ?? mainRule
```

where `subOwnRule` is either a valid persisted override or absent.

An invalid persisted override must not be normalized into absence.

---

## Related Documents

- [Service Desk Settings](../03-domain/service-desk/settings.md)
- [Category Strategy](../03-domain/service-desk/ticket/strategy/category-strategy.md)
- [Assignment Policy](../03-domain/service-desk/ticket/strategy/assignment-policy.md)
- [Approval System](../03-domain/service-desk/ticket/strategy/approval-system.md)
- [Ticket Lifecycle](../03-domain/service-desk/ticket/ticket-lifecycle.md)
- [Ticket Operation Rules](../03-domain/service-desk/ticket/reference/ticket-operation-rules.md)
- [Service Desk Settings DTO/API Boundary (2026-06)](./2026-06-service-desk-settings-dto-api-boundary.md)
- [Service Desk Tenant Design (2026-06)](./2026-06-service-desk-tenant-design.md)

---

## Summary

Category activation is an explicit configuration lifecycle, not a side effect of
Category creation.

```txt
Create inactive
-> configure
-> validate readiness
-> explicitly activate
```

Assignment readiness requires an effective Assignment Rule with at least one
active Job Field or active Employee reference.

Sub Category routing uses its own rule when present and falls back to the Main
Category only when the own rule is absent.

```txt
missing override
-> fallback

invalid override
-> error
```

Main Category state also controls effective Sub Category availability:

```txt
effectiveActive = main.active && sub.active
```

Activation-time readiness and ticket routing-time eligibility remain separate.

```txt
Activation
-> configuration quality gate

Routing
-> current operational validation
```

A Category being active means that it was sufficiently configured to enter new
workflow selection.

It does not remove the requirement to resolve and validate current eligible
workers whenever an actual Ticket is routed.

---

## Status

Accepted
