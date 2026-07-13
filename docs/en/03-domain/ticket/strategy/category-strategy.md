# Category Strategy

## Goal

Category is the main behavior configuration for Service Desk tickets.

It influences:

- request classification
- default priority
- default risk level
- default SLA days / due date seed
- approval-step resolution
- assignment-rule resolution
- requester update routing policy

The current category model is tenant-scoped and aligned with Service Desk
Settings.

---

## Core Concept

```txt id="category-core"
Tenant -> Main Category -> Sub Category -> Ticket behavior
```

`Company` remains organization reference data. `Tenant` is the Service Desk
configuration boundary. Categories belong to a tenant.

---

## Current Domain Shape

```ts id="category-domain-shape"
type CategoryScope = "PORTAL" | "INTERNAL";

type CategoryBase = {
  id: string;
  name: LocalizedText;
  description?: LocalizedText;
  requestTemplate?: LocalizedText;
  index: number;
  active: boolean;
};

type MainCategory = CategoryBase & {
  scope: CategoryScope;
  defaultPriority: Priority;
  defaultRiskLevel: RiskLevel;
  defaultSlaDays: number;
  subCategories: SubCategory[];
};

type SubCategory = CategoryBase & {
  defaultPriority?: Priority;
  defaultRiskLevel?: RiskLevel;
  defaultSlaDays?: number;
};
```

Older terms such as `Client -> Main Category -> Sub Category` are not the
current model. The current boundary is tenant-scoped.

---

## Hierarchy

### Tenant

The tenant owns the category tree for a Service Desk configuration scope.

### Main Category

Main categories provide required defaults:

- scope
- priority
- risk level
- SLA days
- active state
- display order

### Sub Category

Subcategories refine a main category. They may override default priority, risk
level, or SLA days. If a subcategory does not provide a value, the main category
value remains the fallback.

---

## Scope

Main categories use this scope union:

```ts id="category-scope"
type CategoryScope = "PORTAL" | "INTERNAL";
```

| Scope | Meaning |
| --- | --- |
| `PORTAL` | category can be offered for portal requester workflows |
| `INTERNAL` | category is intended for internal Service Desk operation |

Subcategories inherit the main category scope for visibility and routing
purposes.

---

## Default Resolution

Category defaults resolve from the selected subcategory to its parent main
category.

```txt id="category-default-resolution"
Sub Category default
-> Main Category default
```

For example:

```ts id="category-default-example"
priority = sub.defaultPriority ?? main.defaultPriority;
riskLevel = sub.defaultRiskLevel ?? main.defaultRiskLevel;
slaDays = sub.defaultSlaDays ?? main.defaultSlaDays;
```

Ticket-level values may be present in the form or action payload, but the server
validates the final workflow effect.

---

## Active Policy

Categories are deactivated instead of destructively removed from historical use.

```txt id="category-active-policy"
active = false
```

Behavior:

- inactive categories should not be selectable for new requester workflows
- existing tickets that reference inactive categories remain readable
- history is not rewritten when category settings change

---

## Category and Ticket Creation

On ticket creation, category selection participates in:

- priority and risk defaulting
- due date seeding from category SLA days where the UI applies it
- approval-step lookup
- work assignment lookup

The ticket service remains authoritative for final workflow status:

- `Approval` when approval is required
- `Assigned` when work assignment is resolved directly

---

## Category and Approval

Approval steps are configured against the parent/main category. A selected
subcategory classifies the ticket, but the approval pipeline is resolved from
that subcategory's parent/main category.

```txt id="category-approval-flow"
Ticket submitted
-> selected category
-> resolve parent/main category
-> approval steps on main category resolved in order
-> current approval assignees stored on ticket
-> ticket enters Approval when needed
```

Approval configuration affects future resolution. It does not silently change
tickets that are already in progress.

---

## Category and Assignment

Assignment rules allow a subcategory override. If the selected subcategory has
no assignment rule, resolution falls back to the parent/main category rule.

```txt id="category-assignment-flow"
Ticket ready for work
-> selected category
-> selected subcategory assignment rule, when present
-> otherwise parent/main category assignment rule
-> current work assignees stored on ticket
-> ticket enters Assigned
```

The current assignment rule model is group-based and uses job-field IDs and
employee usernames. It does not use a separate `ruleType` field.

---

## Category and Requester Update

Requester updates are allowed only before active work starts:

```txt id="category-update-statuses"
Approval
Assigned
```

Category changes are routing-sensitive.

When a requester changes category, the ticket update service should:

- revalidate category selection
- rederive priority and risk defaults where applicable
- re-evaluate the minimum due date from the new category default SLA days
- re-evaluate approval or assignment routing
- record `ROUTING_RESET`

The next due date should be the later of the current due date and the new
category minimum due date. Category change must not pull the due date earlier.

If category does not change and only routing-neutral fields change, routing can
be preserved and `ROUTING_PRESERVED` is recorded.

---

## UI Responsibilities

The UI should:

- display the tenant-scoped category tree
- show only selectable active categories for new workflows
- preserve inactive category display for existing tickets
- apply useful defaults for priority, risk, and due date
- warn users when a requester update can reset routing

The UI should not:

- invent final routing output
- hide category changes as ordinary field edits
- treat category settings as local-only client state

---

## Settings Change Policy

Category settings define future behavior.

| Change | Effect |
| --- | --- |
| main/subcategory name changed | future display uses new label; existing history remains recorded |
| defaults changed | future tickets and future routing evaluations use updated defaults |
| category deactivated | new selection should stop; existing tickets remain readable |
| approval/assignment settings changed | future resolution uses updated settings |

Existing ticket state and history should change only through explicit ticket
commands.

---

## Deferred Scope

The current category strategy does not claim:

- settings version publishing
- scheduled category changes
- full historical category snapshot rendering
- per-tenant category governance workflow
- advanced assignment load balancing
- tenant-level SLA calendars

---

## Related Documents

- [`../../service-desk-settings.md`](../../service-desk-settings.md)
- [`approval-system.md`](approval-system.md)
- [`assignment-policy.md`](assignment-policy.md)
- [`sla-strategy.md`](sla-strategy.md)
- [`../ticket-lifecycle.md`](../ticket-lifecycle.md)
- [`../ticket-history.md`](../ticket-history.md)
- [`../../../08-dev-strategy/decision-log/2026-07-ticket-routing-and-update-policy.md`](../../../08-dev-strategy/decision-log/2026-07-ticket-routing-and-update-policy.md)

---

## Summary

The current category model is tenant-scoped:

```txt
Tenant -> Main Category -> Sub Category
```

Main categories provide required defaults and `PORTAL`/`INTERNAL` scope.
Subcategories refine those defaults. Approval resolves from the parent/main
category; assignment uses subcategory override with parent/main fallback.
Category changes are routing-sensitive ticket updates, while settings changes
affect future workflow resolution rather than silently rewriting existing
tickets.
