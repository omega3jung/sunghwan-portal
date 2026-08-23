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

```txt
Tenant -> Main Category -> Sub Category -> Ticket behavior
```

`Company` remains organization reference data. `Tenant` is the Service Desk
configuration boundary. Categories belong to a tenant.

---

## Current Domain Shape

```ts
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

The category tree belongs to the tenant's Service Desk workflow boundary.
"Belongs to" is a scoping statement, not a statement that one actor manages
every resource. Actual read/manage authority is selected by tenant kind,
category scope, settings resource, and trusted principal.

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

```ts
type CategoryScope = "PORTAL" | "INTERNAL";
```

| Scope | Meaning |
| --- | --- |
| `PORTAL` | category can be offered for portal requester workflows |
| `INTERNAL` | category is intended for internal Service Desk operation |

Subcategories inherit the main category scope for visibility and routing
purposes.

---

## Category Settings Authorization

Owner Admin is identified by trusted `permission >= ADMIN` and
`userScope = INTERNAL`. Tenant Admin is identified by trusted
`permission >= ADMIN` and `userScope = CLIENT`; its tenant is resolved through
the effective user's `companyId -> Tenant.companyId` relationship.

Category access is:

| Target | Owner Admin | Same-company Tenant Admin | Other Tenant Admin |
| --- | --- | --- | --- |
| Owner Tenant, `INTERNAL` or `PORTAL` | manage | none | none |
| Customer Tenant, `INTERNAL` | none | manage | none |
| Customer Tenant, `PORTAL` | manage | read | none |

There is no Owner Admin support/read exception for customer `INTERNAL`
categories. Owner Admin and Tenant Admin are not ordered roles; the central
settings policy resolves the resource capability.

Main-category creation follows the same boundary:

- Owner Admin can create either scope in the Owner Tenant
- Owner Admin can create only `PORTAL` in a customer Tenant
- Tenant Admin can create only `INTERNAL` in its own customer Tenant

Read APIs filter category trees by this policy. A client-selected tenant or
scope never grants access.

---

## Immutable Boundary

The following values cannot be moved after creation:

- category tenant
- main-category scope
- subcategory parent when the change crosses tenant or scope

Subcategories inherit both tenant and scope from the parent main category. They
do not have an independent scope-management capability.

Update and deactivation load the existing category before authorization.
Creation validates the target tenant and requested scope on the server.
Subcategory creation or update loads the parent main category and derives its
boundary from the stored parent. Payload `tenantId`, `scope`, and `parentId`
claims are not authorization facts.

When a category needs another scope, deactivate it and create a new category.
Category removal is `active = false`, not hard delete, so ticket and history
references remain valid.

---

## Default Resolution

Category defaults resolve from the selected subcategory to its parent main
category.

```txt
Sub Category default
-> Main Category default
```

For example:

```ts
priority = sub.defaultPriority ?? main.defaultPriority;
riskLevel = sub.defaultRiskLevel ?? main.defaultRiskLevel;
slaDays = sub.defaultSlaDays ?? main.defaultSlaDays;
```

Ticket-level values may be present in the form or action payload, but the server
validates the final workflow effect.

---

## Active Policy

Categories are deactivated instead of destructively removed from historical use.

```txt
active = false
```

Behavior:

- new main categories and subcategories are always stored inactive
- activation requires an effective Assignment Rule containing an active Job
  Field or active Employee reference
- inactive categories should not be selectable for new requester workflows
- existing tickets that reference inactive categories remain readable
- an existing `Approval` workflow may continue to its next approval or work
  assignment when the referenced configuration can still be resolved
- history is not rewritten when category settings change

Main and subcategory active flags are stored independently. A subcategory is
effectively active only when both flags are active:

```ts
effectiveActive = mainCategory.active && subCategory.active;
```

Deactivating a main category must not overwrite the stored flags of its
subcategories. Activation is only a readiness gate; runtime routing still
revalidates actual workers and every company/tenant eligibility constraint.

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

```txt
Ticket submitted
-> selected category
-> resolve parent/main category
-> approval steps on main category resolved in order
-> current approval assignees stored on ticket
-> ticket enters Approval when needed
```

Approval configuration affects future resolution. It does not silently change
tickets that are already in progress. A tree change that affects tickets in
`Approval` is the explicit exception: after impact confirmation, force apply
atomically restarts those tickets from initial routing and appends
`ROUTING_RESET` history.

---

## Category and Assignment

Assignment rules allow a subcategory override. If the selected subcategory has
no assignment rule, resolution falls back to the parent/main category rule.

```txt
Ticket ready for work
-> selected category
-> selected subcategory assignment rule, when present
-> otherwise parent/main category assignment rule
-> current work assignees stored on ticket
-> ticket enters Assigned
```

The current assignment rule model is group-based and uses job-field IDs and
employee usernames. It does not use a separate `ruleType` field.

Fallback is based on rule existence. If a subcategory owns a rule whose
references later become inactive, activation and routing fail against that own
rule; the system does not silently switch to the parent rule.

---

## Category and Requester Update

Requester updates are allowed only before active work starts:

```txt
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

The next due date is the latest of the current due date, submitted due date,
and new category minimum due date. Category change must not pull the due date
earlier.

If category does not change and only routing-neutral fields change, routing can
be preserved and `ROUTING_PRESERVED` is recorded.

---

## UI Responsibilities

The UI should:

- display the tenant-scoped category tree
- hide category trees for which settings access is `none`
- make `read` category trees visibly read-only and identify the managing party
- show only selectable active categories for new workflows
- preserve inactive category display for existing tickets
- apply useful defaults for priority, risk, and due date
- warn users when a requester update can reset routing

The UI should not:

- invent final routing output
- hide category changes as ordinary field edits
- treat category settings as local-only client state
- treat a hidden edit control as the authorization boundary

---

## Settings Change Policy

Category settings define future behavior.

| Change | Effect |
| --- | --- |
| main/subcategory name changed | future display uses new label; existing history remains recorded |
| defaults changed | future tickets and future routing evaluations use updated defaults |
| category deactivated | impact confirmation; new selection stops; existing state/routing/history is preserved |
| approval settings changed | future resolution uses updated settings; force apply may explicitly restart affected `Approval` tickets |
| assignment settings changed | current workers are preserved; future assignment resolution uses updated settings |

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

- [Service Desk Settings](../../settings.md)
- [Approval System](approval-system.md)
- [Assignment Policy](assignment-policy.md)
- [SLA Strategy](sla-strategy.md)
- [Ticket Lifecycle](../ticket-lifecycle.md)
- [Ticket History](../ticket-history.md)
- [Ticket Routing and Update Policy (2026-07)](../../../../06-decisions/2026-07-ticket-routing-and-update-policy.md)

---

## Summary

The current category model is tenant-scoped:

```txt
Tenant -> Main Category -> Sub Category
```

Main categories provide required defaults and `PORTAL`/`INTERNAL` scope.
Subcategories refine those defaults and inherit the parent's tenant and scope.
The central settings policy separates the tenant workflow boundary from actual
management authority. Approval resolves from the parent/main category;
assignment uses subcategory override with parent/main fallback. Category
changes are routing-sensitive ticket updates, while settings changes affect
future workflow resolution rather than silently rewriting existing tickets.
