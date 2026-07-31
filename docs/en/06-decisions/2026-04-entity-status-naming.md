# Entity Status Naming Decision (2026-04)

## Context

While designing domain entities such as `Category`, `Ticket`, and `Attachment`,
we needed a consistent way to represent whether an entity is still usable in ongoing operations.

The naming candidates initially considered were:

- `active` / `inactive`
- `enabled` / `disabled`
- a dedicated `disabled` boolean flag

At first, these options looked interchangeable.
During implementation, however, it became clear that they represent different layers of meaning.

---

## Problem

### 1. Domain State vs UI State

Two concepts were being mixed together:

- **Domain state**
  - whether the entity is valid for new business operations
- **UI state**
  - whether a component is currently interactive

These concepts are related, but they are not the same.

For example:

- A category may no longer be selectable for new tickets
- A select input may be disabled because of permissions, loading state, or derived business rules

Using the same word for both concepts makes the model less clear.

---

### 2. Ambiguity of `disabled` at the Domain Level

If a domain model uses `disabled`, the meaning becomes unclear:

- Was it disabled by business policy?
- Is it temporarily unavailable?
- Is it just a UI-facing flag?

Because `disabled` is strongly associated with HTML and component behavior,
it introduces UI semantics into the domain model.

---

## Decision Summary

```txt
Domain entities use `active`.
UI components use `disabled`.
```

---

## 1. Domain Entities Use `active`

### Decision

Represent entity availability in the domain using an `active: boolean` field.

### Example

```ts
type Category = {
  active: boolean;
};
```

### Meaning

- `true` means the entity is valid for new operations
- `false` means the entity remains in the system but is no longer usable for new input or selection

### When `active` Becomes `false`

Typical cases include:

- A category is deprecated by administrators
- A feature or service is no longer supported
- A configuration is replaced by a new version

The entity is not deleted in these cases, so history and auditability can be preserved.

### Reason

- `active` expresses business meaning clearly
- it aligns with entity lifecycle semantics
- it remains independent from UI implementation details

---

## 2. UI Components Use `disabled`

### Decision

Represent interaction state in the UI using `disabled`.

### Example

```tsx
<Select disabled={!category.active} />
```

### Meaning

- `disabled` indicates whether the UI control is interactive
- it is derived from domain state, permissions, loading state, or other presentation conditions

### Reason

- `disabled` is the standard UI vocabulary
- it aligns with HTML semantics
- it keeps the presentation layer explicit

---

## 3. Separation Rule

### Rule

```txt
`active` describes business validity.
`disabled` describes UI interactivity.
```

### Practical Interpretation

- Domain models must not include UI vocabulary
- UI components may derive `disabled` from domain state
- the reverse must not define the domain model

---

## 4. Relationship with Soft Delete

### Interpretation

The `active` flag can function as a soft-deletion mechanism:

- entities are not physically removed
- `active = false` represents logical deactivation
- historical data remains intact for audit and reporting

### Benefits

This approach supports:

- auditability
- data integrity
- consistent reporting

---

## Rationale

### Consistency Across Domain Models

The system consistently uses `active` for entity-level state:

- `Category`
- `Ticket`
- `Attachment`

Maintaining this pattern improves readability and reinforces shared design rules.

---

### Clear Separation of Concerns

- `active` is a business/domain responsibility
- `disabled` is a UI/presentation responsibility

This separation preserves a clean architectural boundary.

---

### Reduced Semantic Leakage

Using `disabled` in domain models would introduce UI semantics into backend and shared types.

Choosing `active` ensures the model remains portable across:

- domain logic
- API contracts
- documentation
- frontend rendering

---

## Alternatives Considered

### 1. Use `disabled` in the Domain

Rejected.

Reason:

- too closely tied to UI semantics
- ambiguous at the business level
- weakens separation between model and presentation

---

### 2. Use `enabled`

Rejected.

Reason:

- less natural for lifecycle semantics
- reads more like a toggle than a state
- inconsistent with existing domain vocabulary

---

### 3. Use `deactive`

Rejected.

Reason:

- non-standard English
- likely to create confusion in code and documentation

---

## Implementation Guideline

- Always store `active` in domain entities
- Never expose `disabled` in API responses as a domain status field
- Always derive UI interaction state from domain state

### Example

```ts
const disabled = !entity.active;
```

---

## Impact

### On Domain Modeling

- Entities use `active` to represent operational validity
- Deactivated entities remain available for historical reference

---

### On UI Implementation

- Components derive `disabled` from domain rules and UI conditions
- UI state remains explicit and composable

---

### On Naming Consistency

- The same concept is expressed consistently across the system
- Reviewers can quickly distinguish domain logic from UI behavior

---

## Key Insight

```txt
Domain language should describe business meaning,
while UI language should describe interaction behavior.
```

---

## Summary

The project adopts a clear naming rule:

- use `active` for entity-level business status
- use `disabled` for UI interaction state

This keeps:

- the domain model clean
- the UI semantics explicit
- the overall system consistent and scalable
