# Service Desk Settings

## Goal

Service Desk Settings define the configuration that controls how tickets are
created, approved, assigned, and displayed.

The goal of this document is to describe the current settings design in a way
that is aligned with the application model, the API boundary, and the
LOCAL/REMOTE runtime split.

Service Desk Settings are not generic admin CRUD. They are behavior-defining
configuration for the Service Desk domain.

---

## Core Concept

```txt id="service-desk-settings-core"
Settings configure future ticket behavior.
Existing ticket history keeps its original meaning.
```

Settings are used by ticket workflows, but they are not themselves ticket
events. A settings change may affect the next ticket creation, approval
resolution, assignment resolution, or requester update. It must not silently
rewrite the meaning of already recorded ticket history.

---

## Domain Position

Service Desk Settings sit between organization reference data and ticket
execution.

```txt id="service-desk-settings-position"
Organization reference data
-> Service Desk Settings
-> Ticket workflow
-> Ticket history
```

The settings area owns:

- Service Desk tenants
- category configuration
- approval-step configuration
- assignment-rule configuration

It consumes, but does not own:

- company data
- department data
- job-field data
- employee data

---

## Settings Scope

The current settings surface is organized as:

```txt id="service-desk-settings-scope"
Service Desk Settings
-> Tenant
-> Category
-> Approval Step
-> Assignment Rule
```

Each settings area has its own feature client, route/API handler path, domain
model, and LOCAL/REMOTE implementation boundary.

---

## Runtime and API Boundary

The UI should not depend on whether settings data comes from local demo state
or REMOTE persistence.

```txt id="service-desk-settings-api-flow"
UI
-> feature API client
-> Next.js Route Handler
-> Service Desk API handler
-> LOCAL state handler or REMOTE DTO service
```

Route handlers are HTTP orchestration boundaries. They should parse requests,
resolve session/runtime context, and delegate. They should not own SQL, mock
mutation rules, or row-to-DTO mapping.

LOCAL settings behavior uses server-side mutable demo state where the demo
allows mutation. REMOTE behavior uses DTO services and repositories. Both
runtimes must return compatible application-facing shapes.

Authorization is resolved before the LOCAL/REMOTE branch. Query filtering,
mutation validation, and actor-candidate lookup must therefore produce the
same authorization result in both runtimes.

---

## Settings Authorization

### Trusted Principal

Service Desk Settings has two administrative principal types. They are derived
from a server-resolved canonical `AppUser`, not from a client claim or role
hierarchy.

| Settings admin type      | Required trusted fields                               |
| ------------------------ | ----------------------------------------------------- |
| Owner Admin              | `permission >= ADMIN` (`9`) and `userScope = INTERNAL` |
| Tenant Admin             | `permission >= ADMIN` (`9`) and `userScope = CLIENT`   |
| no Settings admin access | any lower permission, regardless of `userScope`       |

Use the canonical access-level constant rather than duplicating the numeric
value in feature code. `role`, `dataScope`, the focused tenant, request
`tenantId`/`companyId`, and client state do not determine the admin type.

For settings operations, the API route first requires the authenticated JWT's
`getUserAccessLevel(request) >= 9`. The server then resolves the effective
username from the session and loads the canonical application user so that
`permission`, `userScope`, and `companyId` are server-trusted. During
impersonation, resource capability follows the effective user. Audit context
keeps both the original and effective usernames.

Owner Admin and Tenant Admin are peers with different resource capabilities.
Owner Admin is not a super-role over Tenant Admin: for example, a customer
`PORTAL` approval pipeline is managed by the customer Tenant Admin while the
Owner Admin has read-only access.

### Tenant Boundary and Management Authority

Tenant answers _where_ category-driven workflow configuration applies. The
authorization policy answers _who_ can read or manage each settings resource.
The phrase "tenant owns configuration" means that configuration belongs to a
tenant boundary; it does not mean that one tenant-side actor manages every
resource in that boundary.

A Tenant Admin's target is resolved on the server through:

```txt id="tenant-admin-boundary"
effective AppUser.companyId
-> Tenant.companyId
-> that customer Tenant
```

The client cannot select another tenant to expand this boundary. The Owner
Tenant and owner/service-provider company are identified through the canonical
portal-owner company resolver or flag, never through a hard-coded ID.

### Capability Matrix

Access values have these meanings:

- `manage`: create, update, deactivate, or use the entity's documented
  replace/delete lifecycle
- `read`: query and display only
- `none`: neither query nor mutate

| Target                      | Resource        | Owner Admin | Same-company Tenant Admin | Other Tenant Admin |
| --------------------------- | --------------- | ----------- | ------------------------- | ------------------ |
| Tenant Settings             | Tenant          | manage      | none                      | none               |
| Owner Tenant, either scope  | Category        | manage      | none                      | none               |
| Owner Tenant, either scope  | Approval Step   | manage      | none                      | none               |
| Owner Tenant, either scope  | Assignment Rule | manage      | none                      | none               |
| Customer Tenant, `INTERNAL` | Category        | none        | manage                    | none               |
| Customer Tenant, `INTERNAL` | Approval Step   | none        | manage                    | none               |
| Customer Tenant, `INTERNAL` | Assignment Rule | none        | manage                    | none               |
| Customer Tenant, `PORTAL`   | Category        | manage      | read                      | none               |
| Customer Tenant, `PORTAL`   | Approval Step   | read        | manage                    | none               |
| Customer Tenant, `PORTAL`   | Assignment Rule | manage      | read                      | none               |

Owner Admin has no implicit support/read access to customer `INTERNAL`
configuration. A separate platform/support capability is not part of this
policy.

Tenant Admin may receive the minimum metadata needed to label its own tenant on
other settings pages. That does not grant access to the Tenant Settings list or
its mutation APIs.

---

## Tenant

### Responsibility

A Service Desk tenant defines the organizational and workflow boundary for
ticket categories, approval steps, and assignment rules. Management authority
inside that boundary is resolved separately by the settings capability matrix.

Tenant is related to Company, but it is not the same concept. Company is
organization reference data. Tenant is the Service Desk configuration surface
created from or linked to a company.

### Current Domain Shape

```ts id="tenant-domain-shape"
type Tenant = {
  id: string;
  companyId: string;
  name: LocalizedText;
  color: string;
  active: boolean;
};
```

Server DTOs use numeric and `snake_case` fields at the API data boundary, for
example `tenant_id`, `tenant_company_id`, `tenant_name`, `tenant_color`, and
`tenant_active`. UI and domain code should consume the mapped application
shape.

### Portal Owner Tenant

The portal owner tenant is protected configuration. It should remain available
as a Service Desk tenant and should not be removed through ordinary tenant
management.

The UI derives portal-owner behavior from the tenant/company projection used by
the tenant settings page. This protection is not a free-form editable setting.

### Focused Tenant and Selected Tenants

Settings pages distinguish two concepts:

- `focusedTenantId`: the tenant whose configuration is currently being edited
- `selectedTenantIds`: the set of companies currently activated as Service Desk
  tenants

Only one focused tenant is edited at a time. Multiple tenants may be selected
or active in the tenant settings workflow.

### Activation Policy

Tenant activation controls whether a company participates in the Service Desk
configuration surface.

- activating a tenant makes it available for settings configuration
- deactivating a tenant removes it from active settings workflows
- protected portal-owner behavior must be enforced by the server boundary
- existing tickets should remain readable even if a tenant is later inactive

Only Owner Admin can list and manage Tenant Settings. Tenant Admin does not see
the Tenant Settings tab, and direct page access redirects to Settings Home as a
UI guard. An unauthorized Tenant Settings API request returns `403`; API
authorization never uses a redirect.

---

## Category

### Responsibility

Category is the central behavior configuration for tickets. It drives request
classification, default priority, default risk level, default SLA days,
approval configuration, and assignment configuration.

### Current Domain Shape

The current domain model separates main categories from subcategories.

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

The API DTO uses `category_scope: CategoryScope` with the same
`"PORTAL" | "INTERNAL"` values. Older descriptions that use `"CLIENT"` are not
aligned with the current model.

### Hierarchy

```txt id="category-hierarchy"
Tenant
-> Main Category
-> Sub Category
```

Main categories own the required defaults. Subcategories may override selected
defaults. If a subcategory omits a default, the main category value remains the
fallback.

### Scope

Category scope controls whether the main category is intended for portal-facing
requests or internal Service Desk use.

- `PORTAL`: category can be offered to portal requesters
- `INTERNAL`: category is for internal operators and internal workflows

Scope belongs to the main category. Subcategories inherit their main category's
scope for visibility and routing purposes.

### Active Policy

Inactive categories are not offered for new ticket selection. Existing tickets
that already reference an inactive category remain readable and auditable.

Deactivation should affect future selection and future evaluation. It must not
erase or reinterpret existing ticket history.

### Creation and Boundary Invariants

Main-category creation follows the capability matrix:

- Owner Admin may create `INTERNAL` and `PORTAL` categories in the Owner Tenant
- Owner Admin may create only `PORTAL` categories in a customer Tenant
- the customer Tenant Admin may create only `INTERNAL` categories in its own
  Tenant

After creation, these boundary fields are immutable:

- category `tenantId`
- main-category `scope`
- subcategory `parentId` when a change would cross a tenant or scope boundary

A scope change is modeled by deactivating the old category and creating a new
one. Categories use `active = false`, not hard delete, so existing tickets and
history retain their category references. A subcategory inherits tenant and
scope from its parent main category and has no independent scope capability.

For update or deactivation, the server loads the stored category before
authorizing. For create, it validates the target tenant and requested scope.
For a subcategory, it loads the parent main category and derives tenant/scope
from that relationship. Request payload fields are not authorization facts.

---

## Approval Step

### Responsibility

Approval steps define ordered approval behavior for a main category.

They are settings, not ticket history. When a ticket enters approval, the
current approval settings are resolved into the ticket's current approval
ownership. Subsequent ticket approval activity is recorded on the ticket.

If the selected ticket category is a subcategory, approval still resolves from
its parent/main category. Subcategories classify the request; they do not create
an independent approval pipeline.

### Current Domain Shape

```ts id="approval-step-domain-shape"
type ApprovalStep = {
  id: string;
  name: LocalizedText;
  description?: LocalizedText;
  index: number;
  categoryId: string;
  stepAssignee: ApprovalAssigneeType;
  skipAccessLevel?: AccessLevel;
};

type ApprovalAssigneeType =
  | { type: "MANAGER"; level: 1 | 2 }
  | { type: "DEPARTMENT"; departmentId: string }
  | { type: "JOB_FIELD"; jobFieldId: string }
  | { type: "EMPLOYEE"; employeeUsernames: string[] };
```

The server DTO represents the same concept with `approval_step_assignee` and
`skip_access_level`.

### Ordered Pipeline

Approval steps are evaluated in ascending `index` order.

```txt id="approval-step-flow"
Ticket submitted
-> category selected
-> parent/main category resolved
-> approval steps resolved from main category
-> current approval assignee stored on ticket
-> approval activity advances or declines the ticket
```

The ticket row stores the current responsible users through the ticket
assignment fields. It does not need separate permanent columns for every past
approval configuration.

### Skip Policy

`skipAccessLevel` allows a step to be skipped when the requester already has
sufficient access level.

The skip rule is a configuration rule. The ticket workflow should record the
resulting activity and history when approval execution occurs.

### Validation

Approval-step mutation must validate:

- stored tenant/category relationship
- settings capability for the stored main category's tenant and scope
- ordered index values
- supported assignee type
- referenced department, job field, employee, or manager level
- skip access level

Every resolved approver must belong to the category tenant's company:

- `EMPLOYEE`: every employee has the category tenant `companyId`
- `DEPARTMENT`: the department and resolved employees stay in that company
- `JOB_FIELD`: final employee resolution applies the company filter even when
  job field is shared reference data
- `MANAGER`: the resolved manager belongs to that company

Eligibility is enforced at two different boundaries. Candidate read APIs return
only references that the current principal may select. A REMOTE settings write
does not fetch those candidate lists again: PostgreSQL validates all submitted
approval references as a set against the stored category, tenant, company, and
active organization rows in the same transaction that persists the tree.
Ticket submit/resubmit and explicit routing recalculation validate eligibility
again because organization data may change after configuration. Routing fails
when no valid approver remains; it does not create an unowned `Approval` ticket.

Read-only Owner Admin access to customer `PORTAL` approval settings may include
display data for currently referenced approvers. It does not grant customer
employee-directory candidate search.

The client may help the user build valid input, but the server remains the
authority.

---

## Assignment Rule

### Responsibility

Assignment rules define how work assignees are resolved after approval is not
needed, after approval completes, or when a workflow needs to resolve current
work ownership.

### Current Domain Shape

```ts id="assignment-rule-domain-shape"
type AssigneeGroup = {
  jobFieldIds: string[];
  assigneeUsernames: string[];
};

type AssignmentRule = {
  categoryId: string;
  assignee: AssigneeGroup;
};
```

The current model is group-based. It does not use a separate `ruleType` field.
REMOTE DTOs use `job_field_id` and `employee_username` arrays and are mapped
back to the application model.

### Resolution

Assignment resolution should happen on the server boundary.

```txt id="assignment-resolution"
Selected subcategory
-> subcategory assignment rule, when present
-> parent/main category assignment rule fallback
-> job-field and employee references
-> resolved work assignee usernames
-> ticket current assignee field
```

The client may display assignment recommendations, but it must not submit
trusted final routing output as if it were authoritative.

### Validation

Assignment-rule mutation must validate:

- stored tenant/category relationship
- settings capability for the stored category's tenant and inherited scope
- referenced job fields
- referenced employee usernames
- empty or invalid assignment groups
- cross-tenant or inactive reference usage

Employees and organization references are filtered and validated against the
selected Tenant company. Employee lookup uses `e_company_id`; department lookup
uses `d_company_id`; and job-field lookup joins `jf_department_id = d_id` before
applying `d_company_id`. Client-provided category scope, purpose, owner flags,
or precomputed allowed-company lists are not organization lookup inputs.

Candidate read APIs receive the selected company ID and choose the corresponding
repository query before returning departments, job fields, and employees.
On REMOTE save, PostgreSQL resolves the canonical policy from the stored
category and validates all submitted job-field and employee references in one
set-based query inside the assignment-tree write transaction. The write API
does not reproduce the candidate lookup. Submit, resubmit, and explicit routing
commands validate eligibility again because organization data may change after
configuration. Routing fails when no valid worker remains instead of creating
an unowned `Assigned` ticket.

Read-only Tenant Admin access to a customer `PORTAL` assignment rule may
include display data for its currently referenced provider assignees. It does
not grant candidate search across the owner-company employee directory.

Assignment-rule changes affect future routing decisions. Existing tickets keep
their current assignees and recorded history.

---

## Organization Reference Data

Service Desk Settings consume organization data.

### Company

Company data is used to create and display tenant options.

### Department

Department data is used by approval-step assignee configuration.

### Job Field

Job-field data is used by approval-step and assignment-rule configuration.

### Employee

Employee data is used for explicit approval assignees, explicit assignment
targets, and assignment recommendation display.

Organization lookup is company-centered. Conceptually:

```ts id="settings-eligible-actors"
getEmployeesByCompanyId(companyId);
getDepartmentsByCompanyId(companyId);
getJobFieldsByCompanyId(companyId);
```

The settings page obtains `companyId` from its selected, authorized Tenant.
Repository variants apply the company predicate in SQL rather than loading an
organization-wide list and filtering it in application code. Approval Step and
Assignment Rule do not persist `tenantId` as an independent authorization
source; a DTO may project derived context:

```txt id="settings-resource-boundary"
Approval Step / Assignment Rule
-> Category
-> Tenant
-> Company
```

The settings domain should not duplicate organization ownership. It should
store references and resolve them through the proper reference data boundary.

---

## Relationship Model

```txt id="service-desk-settings-relationship"
Company
-> Tenant
-> Main Category
-> Sub Category

Main Category
-> Approval Step[]
-> Assignment Rule fallback

Sub Category
-> Assignment Rule override

Department / Job Field / Employee
-> referenced by Approval Step and Assignment Rule
```

Tenant and category form the configuration hierarchy. Approval and assignment
settings hang from the category because category is the main behavior unit for
ticket workflow.

Approval resolution uses main-category approval steps. Assignment resolution
uses subcategory override first and parent/main fallback only when needed.

---

## Configuration Change Policy

Settings changes affect future behavior.

### Category Changed

New tickets use the updated category configuration. Existing tickets keep their
stored category, priority, risk, due date, assignees, activity, and history.

### Approval Step Changed

New approval resolution uses the updated approval steps. Tickets already in an
approval state should keep their current approval ownership unless an explicit
ticket action recalculates or updates it.

### Assignment Rule Changed

New assignment resolution uses the updated rule. Existing tickets keep their
current work assignees until a ticket command changes them.

### Requester Update

Requester updates may change category and content before work execution. When
category changes, the server should revalidate category defaults, approval
needs, assignment behavior, minimum due date, and attachment payloads according
to the requester update policy.

---

## Query and Client State

Settings data is server state.

Use React Query for:

- tenant lists
- active tenant lists
- category trees
- approval-step settings
- assignment rules
- organization reference lists

Use local component state or small UI stores for:

- selected tab
- focused tenant
- active language
- form draft values before mutation
- transient tree editing state

Do not duplicate settings server data into Zustand as another source of truth.

---

## UI Structure

The settings UI follows the settings scope:

```txt id="service-desk-settings-ui"
/settings/service-desk-settings
-> tenant
-> category
-> approval-step
-> assignment-rule
```

Shared UI responsibilities include:

- tenant selection
- language selection for localized labels
- loading and empty states
- consistent mutation feedback
- preserving tenant context across settings pages
- applying the shared `manage` / `read` / `none` result

Each page should present the configuration in the shape the user actually edits.
For example, category is tree-shaped, approval steps are ordered under a
category, and assignment rules are shown by category.

Read-only views identify the responsible party, for example "Managed by
service provider", "Managed by customer", and "Read only". Hiding a tab or
button is a usability behavior only; it does not replace server authorization.

---

## Validation and Security

The server boundary is authoritative.

Validation must cover:

- authenticated user and administrative access
- canonical Owner Admin/Tenant Admin classification
- stored tenant/company relationship
- category-scope resource capability
- cross-tenant reference protection
- valid category hierarchy
- immutable tenant, main scope, and parent boundary
- valid approval assignee references
- valid assignment references
- active/inactive behavior
- protected portal-owner tenant behavior

Read APIs filter out `none` resources; they must not return another tenant's
settings and rely on the UI to hide them. Mutation APIs reload stored resource
context and return `403` for a principal without `manage` access. DTO validation
rejects attempts to claim an admin type/company boundary or mutate immutable
category context.

The shared application policy is invoked above the LOCAL/REMOTE split and is
rechecked in server services/repositories where persisted relationships are
resolved. Existing RLS, database functions, and constraints should preserve
the same tenant boundary as defense in depth.

The client can improve usability with immediate feedback, but it cannot be the
trusted settings validator.

---

## Current Scope

The current design supports:

- tenant activation and deactivation
- portal-owner tenant protection
- localized tenant and category labels
- category tree editing
- main/subcategory defaults
- category `PORTAL` and `INTERNAL` scope
- Owner Admin/Tenant Admin capability resolution by category scope
- category-centered, company-filtered approver and assignee lookup
- ordered approval steps
- manager, department, job-field, and employee approval assignees
- assignment groups with job fields and employee usernames
- LOCAL and REMOTE API boundary alignment
- server-side local demo state for mutable settings workflows
- React Query ownership of settings server data

---

## Deferred Production Scope

The following items are deferred unless explicitly implemented:

- versioned settings publishing
- scheduled settings changes
- settings approval workflow
- full settings audit event stream
- bulk import/export
- advanced assignment load balancing
- tenant-level attachment limits
- per-tenant SLA calendar rules
- hard deletion of historical configuration used by tickets

---

## Responsibility Matrix

| Area                          | Responsibility                                          |
| ----------------------------- | ------------------------------------------------------- |
| Domain model                  | Define application-facing settings shapes               |
| Feature API client            | Call settings APIs and expose typed operations          |
| Route handler                 | Parse HTTP and delegate by runtime                      |
| Settings authorization policy | Resolve trusted principal and resource capability       |
| LOCAL settings handler        | Provide safe mutable demo behavior                      |
| REMOTE DTO service            | Map persisted rows to stable DTOs                       |
| Server service/repository     | Atomically validate stored category/organization relations and write REMOTE settings |
| React Query                   | Own settings server state                               |
| Settings UI                   | Edit configuration through workflow-shaped forms        |
| Ticket workflow               | Resolve current settings into ticket behavior           |
| Ticket history                | Preserve the meaning of executed ticket actions         |

---

## Related Documents

- [`ticket/ticket-system-overview.md`](ticket/ticket-system-overview.md)
- [`ticket/strategy/category-strategy.md`](ticket/strategy/category-strategy.md)
- [`ticket/strategy/approval-system.md`](ticket/strategy/approval-system.md)
- [`ticket/strategy/assignment-policy.md`](ticket/strategy/assignment-policy.md)
- [`../02-architecture/database-strategy.md`](../02-architecture/database-strategy.md)
- [`../02-architecture/routing-strategy.md`](../02-architecture/routing-strategy.md)
- [`../05-data-fetching/react-query-strategy.md`](../05-data-fetching/react-query-strategy.md)
- [`../08-dev-strategy/decision-log/2026-06-service-desk-settings-dto-api-boundary.md`](../08-dev-strategy/decision-log/2026-06-service-desk-settings-dto-api-boundary.md)
- [`../08-dev-strategy/decision-log/2026-07-service-desk-settings-reference-validation-boundary.md`](../08-dev-strategy/decision-log/2026-07-service-desk-settings-reference-validation-boundary.md)
- [`../08-dev-strategy/decision-log/2026-07-ticket-routing-and-update-policy.md`](../08-dev-strategy/decision-log/2026-07-ticket-routing-and-update-policy.md)

---

## Summary

Service Desk Settings define future ticket behavior through tenant, category,
approval-step, and assignment-rule configuration.

The current model uses tenant-scoped category trees, category scopes `PORTAL`
and `INTERNAL`, ordered approval steps with typed assignees, and group-based
assignment rules. Tenant is the workflow boundary; category-scope authorization
selects the actual manager for each resource. `INTERNAL` configuration is
managed by that tenant's administrator, while customer `PORTAL` category and
assignment are managed by Owner Admin and approval is managed by Tenant Admin.

Settings data is server state owned by React Query and served through a
LOCAL/REMOTE API boundary. Settings changes should guide future workflows while
existing ticket activity and history preserve the meaning of what already
happened.
