# Service Desk Settings DTO/API Boundary (2026-06)

## Context

During the June 2026 Service Desk settings implementation, the project moved several settings domains from local mock-only behavior toward a more explicit LOCAL/REMOTE API structure.

The affected Service Desk settings domains include:

- Tenant
- Category
- Approval Step
- Assignment Rule

The project also connected supporting reference data such as:

- Company
- Department
- Job Field

At this stage, the Service Desk module was no longer only a local UI demo. It was being aligned with Supabase PostgreSQL-backed data access while preserving the safe local demo experience.

The important architectural direction was already established:

```txt id="wjvgzj"
UI
-> feature API client
-> Next.js Route Handler
-> LOCAL handler or REMOTE/Supabase DTO service
```

The June work applied this direction concretely to Service Desk settings.

---

## Problem

### 1. Database Rows, Mock Data, DTOs, and UI Models Could Drift

The project had multiple data shapes for the same conceptual settings data:

```txt id="9jzzs8"
Database Row
Mock Data
DTO
UI Model
Form Value
```

If these shapes were allowed to evolve independently, the system would become harder to maintain.

Possible problems included:

- database `snake_case` fields leaking into UI models
- mock data and remote data returning different shapes
- settings forms depending on database implementation details
- route handlers containing too much mapping logic
- UI components needing runtime-specific branching
- local demo behavior becoming different from remote behavior

The project needed a clear data boundary.

---

### 2. Route Handlers Could Become Too Large

Next.js Route Handlers are useful as HTTP boundaries, but they should not become full domain services.

If route handlers directly handled:

- request parsing
- session validation
- LOCAL/REMOTE branching
- SQL execution
- row mapping
- business rules
- mock mutation logic

then they would become difficult to read and hard to reuse later.

The project needed route handlers to remain thin and orchestration-focused.

---

### 3. Settings Are Not Simple CRUD Records

Service Desk settings are behavior-defining configuration.

For example:

- category defines ticket behavior
- approval steps define validation flow
- assignment rules define routing behavior
- tenant defines the Service Desk configuration boundary

Treating each setting as a generic CRUD resource would make the API surface look simple, but it would not match how the UI actually edits settings.

Some settings are better edited as configuration trees or grouped policies rather than isolated records.

---

### 4. Speculative API Paths Increased Maintenance Cost

During implementation, some API paths existed only because they might be useful later.

However, paths that are not used by the current UI workflow create several problems:

- they increase the surface area to test
- they imply capabilities that are not actually supported
- they make route-handler structure harder to review
- they increase the chance of inconsistent LOCAL/REMOTE behavior
- they weaken the portfolio explanation by making the system look broader than it is

The project needed to keep only API paths aligned with real workflows.

---

### 5. LOCAL Demo Mutation Needed Server-Side Consistency

The local demo is not just static mock data.

The demo allows users to modify Service Desk settings safely during portfolio review.

React Query cache alone is not enough for this behavior because local mutations need to be reflected across API calls.

The local demo therefore needed server-side local state modules or mock handlers that behave like a lightweight backend.

This also meant LOCAL and REMOTE settings APIs needed to return compatible DTOs.

---

## Decision

Use a DTO-oriented API boundary for Service Desk settings.

The core decision is:

```txt id="96e6bi"
Settings API = workflow-oriented route handlers + domain handlers + LOCAL/REMOTE DTO contract
```

The intended flow is:

```txt id="o5sv57"
UI
-> feature API client
-> Next.js Route Handler
-> Service Desk settings API handler
-> domain handler
-> LOCAL handler or REMOTE service/repository
-> DTO response
```

The UI should consume stable DTOs and should not know whether the data came from mock state or Supabase PostgreSQL.

---

## Scope Rules

### 1. Keep Route Handlers Thin

Route handlers should focus on:

- HTTP method handling
- request parsing
- invoking the shared session/principal and settings authorization boundary
- runtime context resolution
- delegating to the correct domain handler
- returning `NextResponse`

Route handlers should not directly own:

- SQL queries
- row-to-DTO mapping
- settings mutation rules
- local demo state mutation details
- domain-specific branching

This keeps route handlers readable and makes future backend extraction easier.

---

### 2. Keep Domain Handlers Focused by Settings Area

Service Desk settings handlers should be separated by domain responsibility.

Recommended domains:

```txt id="z3j7x6"
tenant
category
approvalStep
assignmentRule
```

Each domain handler should own the API behavior for its settings area.

This avoids one large Service Desk settings handler becoming a central switchboard for unrelated logic.

---

### 3. Keep Row / DTO / Mapper Boundaries

Database rows and API DTOs have different responsibilities.

```txt id="lznuec"
Row -> Mapper -> DTO
```

#### Row

A row type represents the database result shape.

Characteristics:

- close to SQL
- database-oriented
- often `snake_case`
- may include nullable database fields
- should not be consumed directly by UI components

#### DTO

A DTO represents the application-facing API response contract.

Characteristics:

- stable for frontend use
- usually `camelCase`
- hides database naming
- normalizes nullable values
- can match LOCAL and REMOTE responses

#### Mapper

A mapper converts rows into DTOs.

Responsibilities:

- naming conversion
- JSON shaping
- null normalization
- response-safe field selection
- local/remote shape alignment when needed

---

### 4. Keep LOCAL and REMOTE Contracts Aligned

LOCAL and REMOTE must return the same application-facing DTO shape.

The UI should not require logic such as:

```ts id="r4a7mk"
if (runtime === "LOCAL") {
  // use mock shape
} else {
  // use remote shape
}
```

Instead, runtime-specific behavior should be hidden behind the API boundary.

```txt id="y1vz78"
LOCAL mock/state -> DTO
REMOTE row       -> DTO
```

This allows the frontend to remain stable while backend implementation changes.

---

### 5. Prefer Workflow-Oriented Settings APIs Over Generic CRUD

Service Desk settings are configuration workflows, not only isolated records.

For category, approval step, and assignment rule configuration, the UI often edits grouped settings.

Therefore, APIs such as list and save-tree style operations can be more appropriate than exposing every possible CRUD route.

Recommended direction:

```txt id="cz8yv6"
GET  settings data needed by the UI
POST/PUT save the configuration shape used by the UI
```

This keeps the API aligned with actual workflows.

---

### 6. Remove Unused or Speculative API Paths

Do not keep unused API paths only because they may be useful later.

An API path should remain when:

- the current UI uses it
- it supports a documented workflow
- it has a clear LOCAL and REMOTE behavior
- it can be tested and explained

An API path should be removed or deferred when:

- it is not used by the current UI
- it represents speculative CRUD behavior
- it increases route surface without improving the demo
- it creates inconsistent local/remote behavior
- it makes the implementation harder to review

This keeps the project honest and maintainable.

---

### 7. Do Not Duplicate Server Data into Client State

Service Desk settings data is server state.

It should be managed by React Query, not duplicated into Zustand.

Zustand may be used for UI/runtime state, but settings data such as tenant list, category tree, approval steps, and assignment rules should remain query-driven.

The rule remains:

```txt id="m4d2am"
Server data -> React Query
UI state    -> local state or Zustand only when needed
```

---

### 8. Treat Local Demo State as Server-Side Mutable State

The local demo may use mock-backed state, but it should behave like server data.

Local settings mutations should update server-side local state modules, not only React Query cache.

This allows:

- repeatable demo behavior
- safe reviewer interaction
- resettable local state
- realistic API request flow
- LOCAL/REMOTE implementation parity

---

## Authorization Addendum (2026-07)

The DTO/API boundary also carries the category-scope settings authorization
decision. Authorization is application behavior shared above the LOCAL/REMOTE
branch; it is not a UI condition and is not delegated independently to two
runtime implementations.

```txt id="settings-authorization-api-flow"
Route Handler
-> resolve effective canonical AppUser
-> resolve target Category -> Tenant -> Company context
-> apply manage / read / none capability
-> delegate to LOCAL handler or REMOTE service
-> return filtered DTO response
```

The canonical principal supplies server-trusted `permission`, `userScope`, and
`companyId`. Request body/query admin type, tenant/company claims, focused
tenant, `role`, `dataScope`, and client state do not establish authority.
During impersonation, the effective user is authorized while original and
effective identities remain available for audit.

Read APIs must filter out `none` resources. Mutation APIs load the stored
category/tenant relationship before applying `manage`, and return `403` for
read-only or out-of-bound principals. A page may redirect to Settings Home for
user experience; an API does not redirect an unauthorized mutation.

Approval Step and Assignment Rule DTOs do not duplicate tenant authority. The
source relationship remains:

```txt id="settings-dto-authorization-context"
Approval Step / Assignment Rule
-> Category
-> Tenant
-> Company
```

Category update DTO validation treats tenant, main-category scope, and a
subcategory parent move across tenant/scope as immutable. The server derives
context from stored state for update/deactivation and from the stored parent
for subcategories; it does not trust payload context alone.

Actor candidate lookup is category-centered and purpose-aware. It resolves
approval candidates from the category tenant company and assignment candidates
from the category-dependent allowed company. The lookup checks the caller's
resource capability as well as the company filter. Read-only access may return
display data for currently referenced actors without granting employee
directory search.

---

## What Was Aligned

### 1. Settings API Responsibility

The Service Desk settings API was aligned around a layered flow.

```txt id="ywhp0s"
Route Handler
-> Service Desk settings API handler
-> domain-specific handler
-> LOCAL or REMOTE implementation
```

This improved readability and reduced the risk of mixing unrelated settings logic in one file.

---

### 2. Tenant API and DTO Direction

Tenant became a Service Desk configuration boundary.

The tenant API needed to return application-facing DTOs rather than raw company or tenant rows.

Conceptual DTO:

```ts id="mbjjfw"
type TenantDto = {
  id: string;
  companyId: string;
  name: LocalizedText;
  color: string | null;
  active: boolean;
};
```

This keeps tenant behavior separate from company reference data.

---

### 3. Category Tree API Direction

Category settings are tree-shaped configuration.

A category is not only a flat record; it belongs to a tenant and may have parent/child relationships.

Current conceptual DTO direction:

```ts id="f6ykgn"
type CategoryScope = "PORTAL" | "INTERNAL";

type CategoryTreeDto = {
  tenantId: string;
  categories: MainCategoryDto[];
};

type MainCategoryDto = {
  id: string;
  scope: CategoryScope;
  name: LocalizedText;
  description: LocalizedText | null;
  requestTemplate: LocalizedText | null;
  defaultPriority: Priority;
  defaultRiskLevel: RiskLevel;
  defaultSlaDays: number;
  index: number;
  active: boolean;
  subCategories: SubCategoryDto[];
};
```

`PORTAL`/`INTERNAL` is workflow scope. Main/subcategory is hierarchy and must
not be encoded as an alternative value of `CategoryScope`. Subcategories
inherit tenant and scope from the parent main category.

The API should support the way the UI edits the category tree instead of forcing the UI to coordinate many unrelated CRUD calls.

---

### 4. Approval Step API Direction

Approval steps are configuration details under a category.

They should be returned as DTOs that match the settings UI and approval strategy.

Conceptual DTO:

```ts id="r80lkg"
type ApprovalStepDto = {
  id: string;
  categoryId: string;
  index: number;
  assignee: ApprovalAssignee;
};
```

Approval steps may be replaced as part of a category configuration update, as long as historical ticket approval behavior is preserved through ticket/action/history records.

---

### 5. Assignment Rule API Direction

Assignment rules define current routing behavior for a category.

Conceptual DTO:

```ts id="zl52df"
type AssignmentRuleDto = {
  id: string;
  categoryId: string;
  assignee: {
    jobFieldIds: string[];
    assigneeUsernames: string[];
  };
};
```

The current assignment model is group-based and has no separate `ruleType`.

Assignment rule changes should affect future or newly evaluated behavior, not silently rewrite historical ticket assignment records.

---

### 6. Reference Data DTO Direction

Company, department, and job field data support Service Desk settings.

They should still follow DTO boundaries.

Example reference data usage:

```txt id="kwac2p"
Company     -> tenant selection and tenant creation
Department  -> approval/assignment configuration
Job Field   -> approval/assignment configuration
```

The settings UI should consume response-safe DTOs rather than raw database rows.

---

### 7. API Surface Pruning

The settings API surface was aligned with actual UI workflows.

Unused or speculative CRUD paths should be removed when they do not support current behavior.

This prevents the project from carrying untested routes that only exist as possible future expansion points.

Future expansion should be documented explicitly rather than implied by unused route files.

---

## Consequences

### Positive

- Clearer server/client boundary
- More stable settings API contracts
- Better LOCAL/REMOTE consistency
- Less database schema leakage into UI
- Smaller and more honest API surface
- Easier maintenance of Service Desk settings logic
- Easier future backend extraction
- Better portfolio explanation for production-aligned architecture
- Reduced risk of route handlers becoming oversized
- More realistic handling of mock-backed local demo mutations

---

### Negative / Trade-offs

- More files are needed for rows, DTOs, mappers, repositories, services, and handlers
- Mapping logic adds implementation overhead
- Simple CRUD operations may require more structure than a small demo normally needs
- API pruning requires discipline when adding future routes
- LOCAL and REMOTE parity requires additional test attention
- Settings save flows may look less generic because they follow workflow shape rather than pure CRUD shape

---

## Implementation Notes

### Recommended Server Data Structure

Recommended structure for remote settings data access:

```txt id="e7w34k"
src/server/data/serviceDesk/
  tenants/
    tenantRow.ts
    tenantDto.ts
    tenantMapper.ts
    tenantRepository.ts
    tenantService.ts

  categories/
    categoryRow.ts
    categoryDto.ts
    categoryMapper.ts
    categoryRepository.ts
    categoryService.ts

  approvalSteps/
    approvalStepRow.ts
    approvalStepDto.ts
    approvalStepMapper.ts
    approvalStepRepository.ts
    approvalStepService.ts

  assignmentRules/
    assignmentRuleRow.ts
    assignmentRuleDto.ts
    assignmentRuleMapper.ts
    assignmentRuleRepository.ts
    assignmentRuleService.ts
```

The exact file structure can evolve, but the responsibility boundary should remain stable.

---

### Recommended API Handler Structure

Recommended route/domain handler direction:

```txt id="ff5hfk"
src/app/api/service-desk/...
  route.ts
    -> parse HTTP request
    -> resolve session/runtime
    -> delegate to server handler

src/server/portalApi/serviceDesk/
  serviceDeskPortalApiHandler.ts
  tenantApiHandler.ts
  categoryApiHandler.ts
  approvalStepApiHandler.ts
  assignmentRuleApiHandler.ts
```

Route-level code should stay thin.

Domain handler code should remain focused on Service Desk settings behavior.

---

### Recommended Local Demo Structure

Local demo settings behavior should be centralized.

Example direction:

```txt id="tf8zk6"
src/server/serviceDesk/settings/
  localState.ts
  tenantLocalHandler.ts
  categoryLocalHandler.ts
  approvalStepLocalHandler.ts
  assignmentRuleLocalHandler.ts
```

The exact path can vary, but local mutation logic should not live inside UI components.

---

### Recommended API Surface Policy

Keep paths only when they map to real workflows.

Example direction:

```txt id="qzhwdq"
Use:
- list tenants
- save tenant
- list category configuration
- save category tree/configuration
- list approval configuration
- save approval configuration
- list assignment configuration
- save assignment configuration

Avoid:
- unused speculative nested CRUD paths
- routes that are not reachable from the UI
- routes without LOCAL/REMOTE parity
```

---

## Documents to Update

This decision affects the following documentation areas:

```txt id="r8k14k"
docs/en/02-architecture/database-strategy.md
docs/en/02-architecture/routing-strategy.md
docs/en/05-data-fetching/react-query-strategy.md
docs/en/08-dev-strategy/service-desk-implementation-strategy.md
docs/en/08-dev-strategy/decision-log/2026-05-database-role-and-access-strategy.md
docs/en/README.md
```

The May database role/access decision does not need to be rewritten.

Instead, this June decision log should be treated as a concrete Service Desk Settings application of that earlier direction.

---

## Follow-up Policy

### 1. Keep Route Handlers as Orchestration Boundaries

Future Service Desk settings routes should avoid accumulating domain logic directly in route files.

Route handlers should delegate to server-side handlers or services.

---

### 2. Keep DTOs Stable Even if Database Rows Change

Database schema may evolve.

DTOs should remain stable when possible so UI components and feature API clients do not need unnecessary changes.

---

### 3. Keep LOCAL and REMOTE Behavior Contract-Compatible

Any new settings API must define how LOCAL and REMOTE return the same application-facing shape.

Do not allow the UI to branch based on local mock shape versus remote database shape.

The same rule applies to capability and filtering results. LOCAL mutable state
and REMOTE repositories must not expose different tenant/category visibility
or accept different mutations for the same effective principal.

---

### 4. Add API Paths Only When a Workflow Requires Them

Avoid adding nested CRUD paths only because they might be useful later.

A new path should have:

- a current workflow
- a clear caller
- a clear DTO contract
- a clear LOCAL implementation
- a clear REMOTE implementation or documented deferred behavior

---

### 5. Preserve Historical Meaning When Settings Change

Settings changes should not silently rewrite past ticket meaning.

If category, approval, assignment, or tenant settings change, existing ticket actions and history should remain understandable.

---

### 6. Keep Settings as Configuration, Not Generic Admin CRUD

Service Desk Settings should continue to be treated as behavior-defining configuration.

This means API design should prioritize workflow clarity over generic CRUD completeness.

---

## Summary

The Service Desk settings implementation introduced a more explicit DTO/API boundary.

The core decision is:

```txt id="z6tjy5"
Settings API = workflow-oriented route handlers + domain handlers + LOCAL/REMOTE DTO contract
```

The UI consumes stable DTOs.

Route handlers remain thin.

Domain handlers organize settings behavior.

REMOTE data access uses row/mapper/DTO boundaries.

LOCAL demo behavior uses server-side mutable mock state while preserving the same API contract.

Unused API paths should be removed instead of kept as speculative CRUD.

This keeps the Service Desk Settings module production-aligned, easier to explain, and safer to expand later.
