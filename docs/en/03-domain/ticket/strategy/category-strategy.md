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

In the current project, category/settings behavior is treated as domain
foundation, while full enterprise policy resolution remains a REMOTE extension path.

---

## Core Concept

Categories are structured as a **hierarchical tree**:

```txt
Tenant -> Main Category -> Sub Category
```

Each level plays a specific role in defining ticket behavior.

The domain boundary is:

```txt
Company = organization/reference data
Tenant = Service Desk configuration boundary
Category = tenant-scoped behavior configuration
```

`Company` remains reference data. `Tenant` is the root boundary for Service Desk
configuration, and categories are interpreted inside that tenant scope.

---

## Category Hierarchy

### 1. Tenant

- Represents the Service Desk configuration boundary
- Owns the category tree for an operational scope
- Keeps category behavior separate from broader company reference data

---

### 2. Main Category

- Defines **default operational rules**
- Acts as the base configuration layer
- Provides tenant-scoped defaults for priority, risk, SLA, approval, and assignment

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

### 3. Sub Category

- Refines or overrides Main Category settings
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

Sub Category values take precedence over Main Category defaults.

### Rule

```txt
Sub Category > Main Category
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

Ticket assignment is primarily determined by tenant-scoped category configuration.

### Responsibilities Defined by Category

- Responsible team
- Default assignee (optional)
- Workflow ownership

### Flow

```txt
Ticket created → Category selected → Assignment resolved
```

---

## Category-Driven SLA

SLA is calculated based on tenant-scoped category configuration.

### Rule

```txt
dueAt = createdDate + SLA
```

### Resolution

- Sub Category SLA overrides Main Category SLA
- If not defined, fallback to Main Category

---

## Category-Driven Approval

Approval workflows are defined per tenant-scoped category.

```txt
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

### 1. Missing Sub Category

- If only Main Category is selected:
  → use Main Category defaults

---

### 2. Partial Overrides

- If Sub Category defines only some values:
  → inherit the remaining values from Main Category

---

### 3. Category Deactivation

- If a category already used by tickets becomes inactive:
  → existing tickets remain valid

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
enabling scalable, consistent, and configurable behavior across all tickets.
Tenant provides the Service Desk configuration boundary, while Main Category and
Sub Category provide tenant-scoped defaults and overrides.
