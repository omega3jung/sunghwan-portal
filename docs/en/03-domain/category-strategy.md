# Category Strategy

## Goal

The category system is designed to act as the **central configuration layer**
that drives ticket behavior across the entire system.

It determines:

- Ticket assignment
- Priority and risk level
- SLA (Service Level Agreement)
- Approval requirements
- Responsible teams

The goal is to achieve **consistent, scalable, and maintainable operations**
through a category-driven architecture.

---

## Core Concept

Categories are structured as a **hierarchical tree**:

```
Client → MainCategory → SubCategory
```

Each level plays a specific role in defining ticket behavior.

---

## Category Hierarchy

### 1. Client

- Represents a tenant (organization or customer)
- Ensures full isolation between different clients

---

### 2. MainCategory

- Defines **default operational rules**
- Acts as the base configuration layer

```ts
type MainCategory = {
  id: string;
  defaultPriority: Priority;
  defaultRiskLevel: RiskLevel;
  defaultSlaDays: number;
  active: boolean;
};
```

---

### 3. SubCategory

- Refines or overrides MainCategory settings
- Represents more specific business cases

```ts
type SubCategory = {
  id: string;
  overridePriority?: Priority;
  overrideRiskLevel?: RiskLevel;
  overrideSlaDays?: number;
  active: boolean;
};
```

---

## Override Strategy

SubCategory values take precedence over MainCategory defaults.

### Rule

```
SubCategory > MainCategory
```

### Resolution Logic

```ts
priority = sub.overridePriority ?? main.defaultPriority;
riskLevel = sub.overrideRiskLevel ?? main.defaultRiskLevel;
sla = sub.overrideSlaDays ?? main.defaultSlaDays;
```

### Purpose

- Enable fine-grained control without duplicating configurations
- Maintain consistency while allowing flexibility

---

## Category ID Policy

All category IDs are stored as **string representations of numbers**.

### Example

```
"12", "203"
```

### Rationale

- Compatible with database constraints
- Allows safe parsing when numeric operations are needed
- Prevents unintended type inconsistencies across systems

---

## Active Policy

Categories are **never deleted**.

Instead:

```
active = false
```

### Behavior

- Cannot be selected for new tickets
- Existing tickets remain valid

### Purpose

- Preserve historical integrity
- Maintain reporting consistency
- Avoid broken references

---

## Category-Driven Assignment

Ticket assignment is primarily determined by category configuration.

### Responsibilities Defined by Category

- Responsible team
- Default assignee (optional)
- Workflow ownership

### Flow

```
Ticket created → Category selected → Assignment resolved
```

---

## Category-Driven SLA

SLA is calculated based on category configuration.

### Rule

```
dueDate = createdDate + SLA
```

### Resolution

- SubCategory SLA overrides MainCategory SLA
- If not defined, fallback to MainCategory

---

## Category-Driven Approval

Approval workflows are defined per category.

```
Category → approvalSteps[]
```

### Behavior

- Some categories require approval
- Others may skip approval entirely

### Purpose

- Align workflow complexity with business needs
- Avoid unnecessary approvals

---

## UI Considerations

### Category Selection

- Hierarchical selector (Main → Sub)
- Only active categories should be selectable

---

### Default Value Application

When a category is selected:

- Priority, risk level, SLA are auto-populated
- Users may override if allowed

---

### Disabled Categories

- Inactive categories should not appear in selection
- Existing tickets must still display their category

---

## Edge Cases

### 1. Missing SubCategory

- If only MainCategory is selected:
  → use MainCategory defaults

---

### 2. Partial Overrides

- If SubCategory defines only 일부 값:
  → 나머지는 MainCategory에서 상속

---

### 3. Category Deactivation

- 이미 사용된 category가 inactive 되는 경우:
  → 기존 ticket은 그대로 유지

---

## Trade-offs

### Pros

- Centralized configuration
- High consistency across tickets
- Flexible override mechanism
- Scalable for large organizations

---

### Cons

- Increased complexity in category design
- Misconfiguration can impact multiple workflows
- Requires governance and management

---

## Alternatives Considered

### 1. Flat Category Structure

- Simpler implementation
- ❌ Cannot support complex business rules

---

### 2. Hardcoded Ticket Rules

- Easier to implement initially
- ❌ Not scalable or maintainable

---

### 3. Fully Dynamic Per-Ticket Configuration

- Maximum flexibility
- ❌ Inconsistent behavior and high user burden

---

## Design Principles Alignment

This strategy aligns with core system principles:

- Category-driven workflow
- Configurable behavior
- No destructive deletes
- Consistent operational rules

---

## Summary

The category system serves as the **foundation of the entire ticketing workflow**,
enabling scalable, consistent, and configurable behavior across all tickets
while maintaining flexibility through hierarchical overrides.
