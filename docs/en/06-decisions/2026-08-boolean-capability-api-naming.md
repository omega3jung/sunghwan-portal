# Boolean Capability API Naming (2026-08)

## Context

The project had accumulated boolean names across several layers:

- feature component props
- permission and capability projections
- hooks and context
- form and query state
- domain state
- UI primitive props
- external library and API contracts

Many values were individually understandable, but their responsibilities were
not always visible from their names.

Examples of ambiguous or presentation-oriented feature APIs included patterns
such as:

```ts
isApproveDisabled
isAssignDisabled
isNotEditable
hideWhenUnauthorized
```

These names often appeared after combining:

- authorization
- ticket status
- ownership
- loading state
- validation state
- presentation behavior

The issue became more visible during the August refactoring work following the
shadcn/Base UI migration.

The refactoring aimed to improve component boundaries, remove unnecessary
client boundaries, replace deprecated patterns, and stabilize public component
APIs before broader Vitest and Storybook coverage was added.

Although the naming discussion began in July, the application-wide capability
API work was applied on August 1, 2026. The decision is therefore recorded as an
August decision.

---

## Problem

### 1. Negative feature props exposed presentation instead of capability

A feature-level component receiving:

```tsx
<TicketActions isApproveDisabled={...} />
```

does not explain why approval is unavailable.

The prop may represent:

- missing permission
- wrong ticket status
- actor not being the current approver
- mutation pending
- a deliberate read-only mode

The API describes the final button presentation rather than the application
capability.

---

### 2. Repeated negation created hard-to-read call sites

Negative props often produced patterns such as:

```tsx
<TicketActions
  isApproveDisabled={!canApprove}
  isAssignDisabled={!canAssign}
/>
```

or double negatives such as:

```ts
!isNotEditable
!hideWhenUnauthorized
```

This increases review cost and makes boolean mistakes easier.

---

### 3. Capability, state, and presentation were being mixed

The project needed to distinguish:

```txt
what the actor can do
what is currently true
how the UI primitive renders
```

Without this distinction, names such as `isDisabled`, `isAllowed`, `canOpen`,
and `hasPermission` could be used inconsistently across the application.

---

### 4. A blind positive-boolean rule would also be wrong

Not every boolean should become `can*`.

Examples such as:

```ts
isLoading
isSaving
isPending
isDirty
isOpen
isClosed
isRejected
hasError
disabled
readOnly
```

already describe meaningful state or presentation.

Negative domain states such as `isBlocked` or `isRejected` may also be the most
accurate names.

The project needed a responsibility-based rule rather than a mechanical rename.

---

### 5. UI capability must not be confused with server authorization

A `canApprove` prop can improve component semantics, but it is still a
client/application projection.

It cannot replace server validation of:

- authenticated identity
- effective impersonated identity
- Tenant and company scope
- ticket status
- approval step
- current assignee relationship
- stored resource context

The naming decision needed to preserve that security boundary.

---

## Options Considered

### Option 1 — Keep presentation-oriented props throughout feature components

```tsx
<TicketActions
  approveDisabled={...}
  assignDisabled={...}
/>
```

#### Advantages

- maps directly to button props
- minimal refactoring
- component internals remain simple

#### Disadvantages

- public APIs expose rendering details
- callers repeat negation
- permission, workflow, and loading concerns are mixed
- components become harder to reuse with a different presentation

This option was rejected for feature and application component APIs.

---

### Option 2 — Convert every boolean to a positive `can*` name

```ts
canLoad
canBePending
canHaveError
```

#### Advantages

- superficially consistent
- eliminates many negative names

#### Disadvantages

- destroys the distinction between capability and state
- produces unnatural names
- conflicts with React Query, React Hook Form, HTML, DTO, and domain vocabulary
- changes external contracts without value

This option was rejected.

---

### Option 3 — Classify booleans by responsibility

```txt
Capability
State
Presence
Presentation
Domain state
External contract
```

Then apply the naming rule that matches each category.

#### Advantages

- preserves semantic differences
- improves public component APIs
- avoids unnecessary contract changes
- supports gradual audit and refactoring
- aligns with server/client responsibility boundaries

#### Disadvantages

- requires judgment rather than automated replacement
- some values need discussion before classification
- mixed booleans may need decomposition into capability and state

This option was selected.

---

## Decision

Classify a boolean before naming it.

Use:

```txt
Feature/application capability
-> can*

Runtime or domain state
-> is*

Presence
-> has*

HTML/UI presentation
-> disabled / readOnly / hidden

External contract
-> preserve the contract's established name
```

The core distinction is:

```txt
Capability
-> whether an operation may be performed

State
-> what is currently true

Presentation
-> how a UI element behaves or appears
```

---

## Capability API Rule

Feature and application components should receive positive capability props.

Prefer:

```tsx
<TicketActions
  canApprove={capabilities.canApprove}
  canAssign={capabilities.canAssign}
  canReject={capabilities.canReject}
/>
```

Avoid:

```tsx
<TicketActions
  isApproveDisabled={!capabilities.canApprove}
  isAssignDisabled={!capabilities.canAssign}
  isRejectDisabled={!capabilities.canReject}
/>
```

Capability names should describe concrete operations:

```ts
canCreate
canUpdate
canSave
canSubmit
canApprove
canDecline
canAssign
canAssignSelf
canAdjust
canReject
canMerge
canReopen
canResubmit
canCancel
canStartWork
canManageCategories
canManageApprovalSteps
canManageAssignmentRules
```

Avoid overly broad names when a concrete operation exists:

```ts
canDo
canUse
canChange
canProcess
canInteract
```

---

## UI Primitive Boundary

A feature component converts capability into presentation state at the UI
primitive boundary.

```tsx
function TicketApproveButton({
  canApprove,
  isPending,
}: {
  canApprove: boolean;
  isPending: boolean;
}) {
  return (
    <Button disabled={!canApprove || isPending}>
      Approve
    </Button>
  );
}
```

This keeps the responsibilities visible:

```txt
canApprove
-> application capability

isPending
-> mutation state

disabled
-> button presentation
```

`disabled`, `readOnly`, and `hidden` remain valid names for UI primitives and
presentation-focused components.

---

## State and Presence Rules

Use `is*` for a current condition:

```ts
isLoading
isSaving
isPending
isDirty
isValid
isOpen
isClosed
isArchived
isRejected
isBlocked
```

Use `has*` when the boolean represents presence:

```ts
hasError
hasSelection
hasAttachments
hasActiveDraft
hasNextApprovalStep
hasMultipleAssignees
```

Do not rename an accurate domain state merely because it is negative.

```ts
isRejected
isBlocked
isBanned
```

These are meaningful business conditions, not negative capability APIs.

---

## Capability Composition

A capability may combine permission, workflow state, ownership, and runtime
state.

Example:

```ts
const canSave =
  canManage &&
  isDirty &&
  isValid &&
  !isSaving;
```

The final capability should be calculated in the closest appropriate
application policy, hook, context, or feature container.

The component should not repeatedly reconstruct the same business condition in
JSX.

However, this decision does not require creating a new policy layer for every
boolean. Existing boundaries should be used where they already fit.

---

## Server Authorization Boundary

Positive capability naming is a UI and application API improvement.

It is not an authorization mechanism.

```txt
UI can*
-> controls discoverability and interaction

Server authorization
-> validates whether the operation is actually allowed
```

The server remains authoritative for:

- authentication
- effective user resolution
- impersonation rules
- permission
- Tenant and company scope
- ticket visibility
- current status
- requester, approver, or assignee relationship
- command payload
- stored resource relationships

A forged `canApprove = true` value must never make an unauthorized approval
succeed.

---

## Scope of the Refactoring

Apply the convention primarily to:

1. Service Desk feature component props
2. Settings and Ticket feature hook return values
3. application policy and permission projections
4. context values that expose operations
5. application-level composed component APIs
6. stories and tests that consume those APIs

Typical high-value candidates include:

- negative capability props
- public props repeatedly passed with `!`
- double negatives
- `is*Disabled` values that actually represent an operation
- broad `canUse` values that can be made more concrete
- duplicated workflow conditions in component call sites

---

## Exclusions

Do not mechanically rename:

- HTML and Base UI primitive props
- React Query state
- React Hook Form state
- DOM and third-party library contracts
- DTO fields
- database columns
- API payloads
- persisted domain contracts
- accurate negative domain states
- names whose compatibility cost exceeds their semantic benefit

Examples that normally remain:

```ts
disabled
readOnly
hidden
isLoading
isPending
isDirty
isRejected
active
```

External contract naming should change only through an explicit contract
migration.

---

## Migration Procedure

### 1. Audit

Search for candidates such as:

```txt
is*Disabled
isNot*
notAllowed
hideIfUnauthorized
disabled={!can...}
public boolean props passed with repeated negation
```

---

### 2. Classify

Classify each candidate as:

```txt
CAPABILITY
STATE
PRESENCE
PRESENTATION
DOMAIN_STATE
EXTERNAL_CONTRACT
```

Do not rename before the responsibility is clear.

---

### 3. Rename the complete API surface

When a feature capability is renamed, update:

- type definitions
- component props
- hook/context returns
- destructuring
- call sites
- stories
- tests
- comments
- documentation examples

Avoid compatibility aliases unless an external consumer requires them.

---

### 4. Preserve behavior

The refactoring should not change:

- server authorization
- ticket action availability rules
- status transitions
- Tenant scope
- DTO/API contracts
- visual design
- mutation behavior

The expected change is semantic clarity, not product behavior.

---

### 5. Verify

Run the relevant checks:

```txt
TypeScript
ESLint
architecture boundary checks
production build
tests
Storybook build
```

Use the checks that exist in the repository at the time of the refactoring.

---

## Relationship with Earlier Naming Decisions

The 2025 naming decision established the broader principle:

```txt
Naming should be defined by meaning, not implementation shape.
```

The 2026 entity-status decision separated:

```txt
domain active
from
UI disabled
```

This decision applies those principles specifically to boolean feature APIs:

```txt
application capability
from
runtime state
from
UI presentation
```

It does not replace the earlier decisions.

---

## Consequences

### Positive

- Feature APIs communicate user and workflow capability directly.
- Call sites contain fewer unnecessary negations.
- Double-negative mistakes are reduced.
- Permission and workflow projections become easier to review.
- UI primitives retain standard platform vocabulary.
- Tests and stories target stable application semantics.
- Capability computation can be centralized without leaking server
  authorization into the client.
- Component APIs are less coupled to one visual implementation.

---

### Negative / Trade-offs

- Classification requires human judgment.
- A repository-wide rename touches many call sites.
- Some components still need both capability and state props.
- Mixed booleans may expose previously hidden responsibility problems.
- External and persisted contracts may remain inconsistent with the application
  convention for compatibility reasons.
- Temporary API churn occurs before tests and stories stabilize.

---

## Follow-up Policy

### 1. Apply the convention before expanding tests and stories

New Vitest and Storybook coverage should use the final positive capability API
rather than preserving transitional negative props.

---

### 2. Keep capability projection close to workflow ownership

Prefer an existing policy, hook, context, or container that already owns the
workflow.

Do not add global permission stores or generic capability frameworks without a
real repeated need.

---

### 3. Review new public boolean props

During code review, ask:

```txt
Is this an operation capability?
Is this current state?
Is this value presence?
Is this presentation?
Is this an external contract?
```

The answer should determine the name.

---

### 4. Keep server validation independent

Future capability refactoring must continue to preserve server-side
authorization, status, Tenant, company, and relationship validation.

---

## Related Documents

- [Boolean Naming Convention](../05-development/boolean-naming-convention.md)
- [Component Boundary](../04-client-engineering/ui/component-boundary.md)
- [Feature-Based Structure](../02-architecture/feature-based-structure.md)
- [Naming Decision](./2025-12-naming.md)
- [Entity Status Naming Decision](./2026-04-entity-status-naming.md)
- [Ticket Operation Rules](../03-domain/service-desk/ticket/reference/ticket-operation-rules.md)

---

## Summary

Feature and application component APIs use positive `can*` names when a boolean
represents an operation capability.

Runtime state continues to use `is*`, presence uses `has*`, and UI primitives
retain standard names such as `disabled`, `readOnly`, and `hidden`.

The convention is responsibility-based rather than a blind positive-boolean
rewrite. It improves component semantics while preserving external contracts,
domain state, and server-side authorization.

---

## Status

Accepted and applied on August 1, 2026.
