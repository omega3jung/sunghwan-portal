# Service Desk Tenant Design (2026-06)

## Context

During the June 2026 Service Desk settings implementation, the project introduced `Tenant` as an explicit domain concept.

Earlier Service Desk design documents used `Client` as the top-level category boundary:

```txt
Client -> Main Category -> Sub Category
```

This was useful during early modeling because the Service Desk module was inspired by a real internal IT Help Desk / Service Hub experience where requests could be grouped by customer or organization.

However, as the system moved toward a more production-aligned structure with Supabase PostgreSQL, DTO/API boundaries, and Service Desk settings management, the term `Client` became too narrow and ambiguous.

The project needed a clearer concept that could represent the operational boundary for Service Desk configuration without being confused with customer-only meaning.

The updated direction is:

```txt
Tenant -> Main Category -> Sub Category
```

In this model, `Tenant` becomes the Service Desk configuration boundary, while `Company` remains organization/reference data.

---

## Problem

### 1. `Client` Was Too Narrow for the Service Desk Boundary

The word `Client` suggested an external customer or client company.

However, the Service Desk module needs to support a broader operational boundary:

- internal portal owner organization
- customer or tenant company
- Service Desk configuration scope
- category tree ownership
- approval, assignment, and SLA configuration scope

Using `Client` as the root of the category tree made the domain less precise because not every Service Desk boundary should be interpreted as a customer-facing client.

---

### 2. `Company` and Service Desk Configuration Had Different Responsibilities

The project already uses `Company` as organization/reference data.

A company record answers questions such as:

- what organization exists?
- what is its code or display name?
- is it active?
- is it the portal owner?

Service Desk settings need a different concept.

A Service Desk tenant answers questions such as:

- which organization has Service Desk behavior configured?
- which category tree belongs to this operational scope?
- which approval steps and assignment rules apply?
- which tenant is selectable in Service Desk settings and ticket workflows?

If `Company` directly became the Service Desk configuration root, the project would mix organization reference data with module-specific behavior configuration.

---

### 3. Category Behavior Needed a Clear Configuration Root

Category is not just classification in this project.

Category determines:

- default priority
- default risk level
- default SLA days
- approval requirements
- assignment behavior
- request template behavior

Therefore, the top-level category boundary must be explicit.

The system needed a structure like:

```txt
Tenant
-> Category
-> Approval Step
-> Assignment Rule
-> SLA-related defaults
```

This makes the Service Desk settings model easier to reason about and prevents behavior configuration from being scattered across unrelated organization data.

---

### 4. LOCAL and REMOTE Modes Needed the Same Domain Vocabulary

The project supports both LOCAL and REMOTE runtime paths.

```txt
LOCAL  -> mock-backed demo behavior
REMOTE -> Supabase PostgreSQL-backed behavior
```

If the LOCAL demo used `client`-like naming while the REMOTE database used a different structure, the DTO/API boundary would become harder to maintain.

The domain vocabulary needed to be aligned across:

- mock data
- API response DTOs
- route handlers
- server data mapping
- settings UI
- documentation

---

### 5. Settings Entity Lifecycle Needed to Be More Explicit

During the settings implementation, different Service Desk settings entities showed different lifecycle characteristics.

For example:

- a tenant may be deactivated and later reactivated
- a category should usually preserve historical references
- approval steps can be replaced as part of category configuration
- assignment rules can be updated or replaced as current routing policy

Using one deletion or activation rule for every settings entity would be too simplistic.

The project needed a practical lifecycle policy that matched each entity's responsibility.

---

## Decision

Introduce `Tenant` as the explicit Service Desk configuration boundary.

The updated hierarchy is:

```txt
Tenant -> Main Category -> Sub Category
```

The core model distinction is:

```txt
Company = organization/reference entity
Tenant = Service Desk configuration boundary
Category = tenant-scoped behavior configuration
```

A tenant is mapped to a company, but it is not the same concept as a company.

---

## Scope Rules

### 1. Tenant Is the Service Desk Configuration Boundary

A tenant owns Service Desk behavior configuration.

Tenant-scoped settings include:

- category tree
- approval steps
- assignment rules
- SLA-related defaults through category configuration
- tenant-specific display metadata such as name and color

This allows the Service Desk module to treat each tenant as an operational scope.

---

### 2. Company Remains Organization Reference Data

`Company` remains a broader reference entity.

It should not directly carry Service Desk-specific configuration behavior.

A company can exist as organization/reference data even if it does not currently participate in Service Desk tenant configuration.

This keeps the organization model reusable across the wider portal.

---

### 3. Category Is Scoped by Tenant

Categories belong to a tenant.

The category hierarchy is resolved within a tenant boundary:

```txt
Tenant
-> Main Category
-> Sub Category
```

This means category names, default priority, default risk level, SLA defaults, approval steps, and assignment rules are interpreted within the selected tenant.

---

### 4. Tenant Is Not a UI-Only Concept

Tenant is not introduced only for the settings page UI.

It is a domain concept that affects:

- settings structure
- ticket creation behavior
- category selection
- approval resolution
- assignment rule resolution
- reporting and filtering
- future remote persistence

The UI may present tenant selection, but the meaning belongs to the Service Desk domain.

---

### 5. Portal Owner Requires Careful Handling

The portal owner company may exist in company/reference data and may also appear in administrative contexts.

However, portal owner handling should remain explicit.

For customer-facing or tenant-selectable Service Desk behavior, the portal owner should not be silently treated the same as ordinary tenant companies unless the workflow requires it.

This prevents accidental mixing between:

- internal portal ownership
- tenant/customer configuration
- selectable Service Desk operating scope

---

### 6. LOCAL and REMOTE Must Share the Same API Contract

LOCAL and REMOTE behavior should use the same application-facing contract.

The UI should not depend on whether tenant data comes from:

- mock-backed local state
- Supabase PostgreSQL rows
- future backend APIs

The intended flow remains:

```txt
UI
-> feature API client
-> Next.js Route Handler
-> LOCAL handler or REMOTE DTO/service
```

Tenant DTOs should hide whether the source is local mock data or remote database rows.

---

## Entity Lifecycle Policy

### Tenant

Tenant supports deactivation and reactivation.

A tenant may become inactive when it is no longer used for new Service Desk configuration or ticket workflows.

However, tenant records should not be casually deleted because they may be connected to:

- existing categories
- historical tickets
- reporting data
- company-level configuration

Recommended behavior:

```txt
deactivate -> keep record
reactivate -> reuse existing record
```

This avoids duplicate tenant creation for the same company and preserves historical continuity.

---

### Category

Category should continue to use an active/inactive lifecycle.

Categories affect ticket history, reporting, and existing ticket references.

When a category is no longer valid for new tickets:

```txt
category.active = false
```

The category should remain available for historical display and audit consistency.

---

### Approval Step

Approval steps are configuration details under a category.

They can be removed or replaced when the category approval workflow changes.

Hard delete can be acceptable for approval steps when:

- the step is treated as current configuration
- historical ticket approval behavior is preserved separately through ticket/action/history records
- deleting the setting does not rewrite past ticket events

This keeps the settings model practical without over-preserving obsolete configuration rows.

---

### Assignment Rule

Assignment rules represent current routing policy for a category.

They may be updated, replaced, or removed when the category routing strategy changes.

Hard delete or replacement is acceptable when:

- existing ticket assignment history remains preserved
- past ticket ownership is not recalculated silently
- the current assignment rule only affects future or newly evaluated workflow behavior

---

## What Was Aligned

### 1. Domain Vocabulary

The Service Desk vocabulary was aligned around `Tenant` instead of `Client`.

Previous direction:

```txt
Client -> Main Category -> Sub Category
```

Updated direction:

```txt
Tenant -> Main Category -> Sub Category
```

This better reflects the actual responsibility of the root configuration layer.

---

### 2. Company and Tenant Boundary

The distinction between company data and Service Desk tenant configuration was clarified.

```txt
Company
-> organization/reference data

Tenant
-> Service Desk configuration scope
```

This prevents company records from becoming overloaded with Service Desk-specific behavior.

---

### 3. Settings Structure

The settings structure was aligned around tenant-scoped configuration.

Tenant settings act as the entry point for configuring:

- category hierarchy
- approval behavior
- assignment behavior
- SLA-related defaults

This makes Service Desk settings more coherent as an administrative configuration surface.

---

### 4. LOCAL / REMOTE Runtime Consistency

Tenant behavior was aligned with the existing LOCAL/REMOTE strategy.

LOCAL mode can use mock-backed or server-side local state.

REMOTE mode can use Supabase PostgreSQL with DTO mapping.

Both paths should return the same application-facing DTO shape.

---

### 5. Historical Integrity

The tenant design was aligned with the existing audit and history principles.

Settings changes should not silently rewrite past ticket meaning.

Past ticket records, actions, and histories should remain understandable even if tenant/category/approval/assignment settings change later.

---

## Consequences

### Positive

- Clearer domain vocabulary
- Better separation between organization reference data and Service Desk behavior
- More scalable category configuration model
- Cleaner DTO/API boundary for settings data
- Easier explanation for reviewers and maintainers
- Better alignment between LOCAL demo and REMOTE database-backed behavior
- Reduced ambiguity around portal owner vs tenant/customer scope
- More realistic production-aligned Service Desk design

---

### Negative / Trade-offs

- Adds one more domain concept to explain
- Requires updating existing documents that used `Client`
- Requires careful mapping between company rows and tenant DTOs
- Settings UI becomes slightly more complex because company and tenant are no longer the same concept
- Entity lifecycle rules differ by settings entity, so implementation must be explicit

---

## Implementation Notes

### Recommended Database Direction

A tenant can be stored as a Service Desk-specific entity mapped to a company.

Conceptual shape:

```ts
type Tenant = {
  id: string;
  companyId: string;
  name: LocalizedText;
  color: string | null;
  active: boolean;
};
```

The exact database row may use database-specific naming, but API responses should expose a stable DTO.

---

### Recommended DTO Direction

The tenant DTO should be application-facing.

Example:

```ts
type TenantDto = {
  id: string;
  companyId: string;
  name: LocalizedText;
  color: string | null;
  active: boolean;
};
```

The UI should consume this DTO rather than database row shapes.

---

### Recommended Category Relationship

Category should reference tenant as its configuration scope.

Conceptual shape:

```ts
type Category = {
  id: string;
  tenantId: string;
  parentId: string | null;
  scope: "MAIN" | "SUB";
  name: LocalizedText;
  active: boolean;
};
```

This keeps category behavior tenant-scoped and avoids global category ambiguity.

---

## Documents to Update

The tenant decision affects existing domain and strategy documents.

Recommended updates:

```txt
docs/en/03-domain/ticket/ticket-system-overview.md
docs/en/03-domain/ticket/ticket-model.md
docs/en/03-domain/ticket/strategy/category-strategy.md
docs/en/03-domain/ticket/strategy/approval-system.md
docs/en/03-domain/ticket/strategy/assignment-policy.md
docs/en/03-domain/ticket/strategy/sla-strategy.md
docs/en/08-dev-strategy/service-desk-implementation-strategy.md
docs/en/README.md
```

The most important update is replacing the older category root wording:

```txt
Client -> Main Category -> Sub Category
```

with:

```txt
Tenant -> Main Category -> Sub Category
```

The documents should also clarify that tenant is the Service Desk configuration boundary, not just a customer label.

---

## Follow-up Policy

### 1. Do Not Reintroduce `Client` as the Category Root

Future documents and code should avoid using `Client` as the root of Service Desk category behavior.

Use `Tenant` when referring to the Service Desk configuration boundary.

---

### 2. Keep Company and Tenant Separate

Do not merge company reference data and tenant configuration behavior unless a future design explicitly justifies it.

The default rule remains:

```txt
Company != Tenant
```

A tenant may reference a company, but the two should not be treated as the same domain concept.

---

### 3. Preserve Historical Ticket Meaning

Settings changes must not make old tickets unreadable or misleading.

If a tenant, category, approval step, or assignment rule changes, existing ticket history should still explain what happened at the time.

---

### 4. Keep LOCAL and REMOTE Contracts Aligned

Any future tenant-related API should preserve the same DTO contract across LOCAL and REMOTE paths.

The UI should not need separate tenant logic depending on runtime mode.

---

### 5. Treat Tenant as a Foundation for Future Remote Expansion

Tenant design should support future expansion such as:

- tenant-aware reporting
- tenant-specific category templates
- tenant-scoped approval policies
- tenant-scoped assignment strategies
- tenant-level access restrictions
- tenant-specific Service Desk settings

These do not need to be fully implemented immediately, but the model should not block them.

---

## Summary

The project introduces `Tenant` as the explicit Service Desk configuration boundary.

This replaces the earlier `Client`-rooted category model and clarifies the relationship between organization data and Service Desk behavior.

The final conceptual model is:

```txt
Company = organization/reference data
Tenant = Service Desk configuration boundary
Category = tenant-scoped behavior configuration
```

The category hierarchy becomes:

```txt
Tenant -> Main Category -> Sub Category
```

This decision improves domain clarity, supports LOCAL/REMOTE consistency, keeps company data reusable, and makes Service Desk settings easier to explain as a production-aligned configuration model.
