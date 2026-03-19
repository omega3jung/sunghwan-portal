# Category Design Decision (2026-01)

## Context

The category system is the central configuration layer of the Service Desk system.

It defines:

- Assignment behavior
- SLA calculation
- Approval requirements
- Default priority and risk level

Initially, category design focused on a **hierarchical structure**:

```txt
Client -> MainCategory -> SubCategory
```

with `SubCategory` overriding `MainCategory` values.

During implementation and integration with ticket workflows, several practical questions emerged around:

- how strictly category should act as the source of truth
- how much flexibility should be allowed at the ticket level
- how to balance configuration and runtime overrides

---

## Problem

### 1. Should Category Fully Determine Ticket Behavior?

- Assignment, SLA, approval, priority, and risk all come from category
- This creates a strongly category-driven system

However:

- if the model is too rigid, real-world exceptions become hard to handle
- if the model is too flexible, system consistency breaks down

---

### 2. Where Should Overrides Be Allowed?

Two approaches were considered.

#### Option A. Strict Category-Driven Model

```txt
Category = single source of truth
Ticket = no override
```

**Pros**

- Strong consistency
- Predictable behavior
- Easier auditing

**Cons**

- Low flexibility
- Hard to handle operational exceptions

---

#### Option B. Category as Default + Ticket Overrides

```txt
Category = default configuration
Ticket = selective override
```

**Pros**

- Flexible
- Better for real-world operational cases

**Cons**

- Higher risk of inconsistent behavior
- Harder to reason about the final system rule set

---

## Decision

Adopt a **hybrid model**:

```txt
Category = default configuration layer
Ticket = controlled override layer
```

---

### 1. Category Remains the Foundation

By default, the following values are derived from category:

- Assignment
- SLA
- Approval
- Priority
- Risk

This preserves the category-driven workflow principle.

---

### 2. Overrides Are Allowed, but Controlled

Ticket-level overrides are allowed only when they are:

- explicitly required by business logic
- visible in the UI
- traceable in history

Examples:

- Priority adjustment
- Assignee reassignment
- Optional SLA recalculation

---

### 3. Override Hierarchy Remains Explicit

The category hierarchy is unchanged:

```txt
SubCategory > MainCategory
```

When ticket-level override is introduced, the final resolution order becomes:

```txt
Ticket > SubCategory > MainCategory
```

---

### 4. Overrides Must Be Traceable

All overrides must:

- be recorded in history
- include actor and reason

This keeps override behavior auditable rather than implicit.

---

### 5. UI Must Clearly Reflect Override State

- Default values derived from category should remain visible
- Overridden values must be distinguishable from defaults

Example:

- `Default SLA: 3 days`
- `Overridden SLA: 5 days (manual)`

---

## Rationale

This decision balances three system qualities.

### Consistency

- Category still drives the default workflow
- Core ticket behavior remains predictable

---

### Flexibility

- Real-world exceptions can be handled
- Operators are not blocked by rigid configuration

---

### Auditability

- Overrides are explicit
- Meaningful changes remain visible and reviewable

---

## Trade-offs

### Pros

- Flexible but controlled system behavior
- Better fit for operational reality
- Preserves category-driven architecture

---

### Cons

- Increased system complexity
- Requires clear UI design
- Requires strict history tracking

---

## Alternatives Considered

### 1. Fully Category-Driven Model (No Overrides)

- Simple and predictable
- Too rigid for real operations

---

### 2. Fully Dynamic Ticket Configuration

- Maximum flexibility
- Breaks system consistency
- Hard to maintain and audit

---

## Impact

### On Category Strategy

- No structural change is required in `category-strategy.md`
- The current category model already supports this direction conceptually

---

### On Ticket System

- Ticket models must support override fields
- History tracking becomes critical infrastructure

---

### On UI/UX

- Default and overridden values must be clearly distinguished
- Forms and detail views must expose override state intentionally

---

## Summary

The system adopts a **category-driven but override-capable model**:

- Category defines default behavior
- Ticket allows controlled overrides
- All overrides must be explicit and traceable

This keeps the system:

- Consistent
- Flexible
- Auditable

without compromising the core category-driven design.
