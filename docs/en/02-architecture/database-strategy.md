# Database Strategy

## Goal

The database strategy defines how `sunghwan-portal` accesses persisted
application data from server code while keeping UI contracts stable.

The current Service Desk implementation uses this direction:

```txt id="database-core"
server-only database access
+ role-separated connections
+ row / mapper / DTO boundaries
+ service-owned workflow rules
```

The UI does not access tables directly. Feature clients call application APIs,
and server services decide how rows are queried, mapped, validated, and written.

---

## Runtime Flow

```txt id="database-runtime-flow"
UI
-> feature API client
-> Next.js route handler
-> server service
-> repository
-> query client
-> PostgreSQL
```

Route handlers are HTTP orchestration boundaries. They should not contain SQL or
row mapping logic.

---

## Role Separation

The project separates database access by responsibility.

```txt id="database-roles"
auth_api     -> authentication-only database access
portal_api   -> application data access
service_role -> not used for normal application flows
```

### `auth_api`

Used for login and authentication-related data access.

Examples:

- validate credentials
- read active auth account data
- update login metadata

### `portal_api`

Used after authentication for application data access.

Examples:

- read user profiles
- read and mutate Service Desk tickets
- read and mutate Service Desk settings
- execute workflow operations through repositories/services

### `service_role`

`service_role` is not the normal application data path. Broad privileged access
should remain an administrative/platform capability, not a routine app flow.

---

## Row / Mapper / DTO Boundary

Database rows and application DTOs have different responsibilities.

```txt id="row-mapper-dto"
Database Row
-> Mapper
-> Application DTO
```

| Layer | Responsibility |
| --- | --- |
| Row | SQL-facing shape, usually `snake_case`, nullable where the DB allows |
| Mapper | naming conversion, null normalization, legacy normalization, DTO shaping |
| DTO | application-facing API contract consumed by feature code |
| Repository | parameterized SQL and persistence logic |
| Service | workflow rules and use-case coordination |

The UI should not depend on `snake_case` row names or database-only columns.

---

## Service Desk Schema Boundary

Service Desk data is organized under the Service Desk data boundary in
`src/server/data/serviceDesk`.

Current important areas include:

- settings: tenants, categories, approval steps, assignment rules
- ticket: ticket create/search/detail/update/workflow services
- ticket draft: active requester draft workflow
- ticket action: command rules and execution
- ticket history: event-based audit records
- work session: work evidence records

The application-facing domain types live under `src/domain/serviceDesk`.

---

## Ticket Persistence

Tickets persist the current workflow state and routing facts.

Current ticket status values are:

```ts id="ticket-status"
type TicketStatus =
  | "Draft"
  | "Approval"
  | "Declined"
  | "Assigned"
  | "Working"
  | "Pending"
  | "Rejected"
  | "Resolved"
  | "Closed";
```

The mapper may normalize older row values for compatibility, but current design
and DTO contracts should use the current status union.

Important persistence boundaries:

- a REMOTE draft is a ticket row in `Draft` status
- submitted tickets move to `Approval` or `Assigned`
- current approval/work routing uses ticket assignment fields
- `tk_approval_step_id` represents the current approval step when applicable
- `tk_assignee_usernames` represents current responsible usernames
- attachment fields store prepared metadata, not raw files

---

## Routing Persistence

Approval and work routing are phase-aware.

```ts id="assignment-phase"
type TicketAssignmentPhase = "APPROVAL" | "WORK";
```

The database row stores the minimal current routing facts. The mapper and DTO
derive readable projections such as:

- `assignmentPhase`
- `approvalAssigneeUsernames`
- `workAssigneeUsernames`
- `assignedApprover`
- `assignedWorker`

Approval-step and assignment-rule settings are resolved into ticket state when a
workflow transition requires it. Settings changes do not silently rewrite
existing ticket routing or history.

The REMOTE routing boundary delegates approval and assignment resolution to the
Service Desk database functions used by the repository:
`service_desk.get_next_approval_step`,
`service_desk.get_approval_step_assignee_usernames`, and
`service_desk.get_category_assignment_usernames`. The design contract is:
approval steps resolve from the selected category's parent/main category, while
assignment rules use selected subcategory override and parent/main fallback.

---

## Draft Persistence

REMOTE draft behavior is implemented through ticket persistence, not a separate
client-only draft model.

Key rules:

- one active draft per requester
- create can reuse the active draft row
- discarding a draft removes that active draft workflow
- draft data is form-oriented
- raw files and durable attachment recovery are not promised

This makes draft behavior available across sessions while keeping attachment
storage limits honest.

---

## Attachment Persistence

The current database strategy does not persist attachment binaries.

Attachment writes use this flow:

```txt id="attachment-persistence-flow"
browser File[] / inline data images
-> Attachment Prepare API
-> prepared metadata
-> ticket row files/images fields
```

Prepared metadata includes fields such as:

- `originalName`
- `replacedName`
- `extension`
- `size`
- `type`
- `demoUrl`
- `replaced`
- `reason`

Future object storage may introduce storage object keys or signed URL behavior,
but the current implementation stores controlled demo metadata only.

---

## History Persistence

Ticket history is event-based.

The current model separates:

- history `type`
- history `source`
- history `event`
- previous/current values
- actor and timestamp

`event` is the authoritative classification for what happened. Current design
should not rely on legacy names such as `tkh_history_action` or
`metadata.event` as the primary event model.

History rows are written by successful commands/services:

- ticket submit
- requester update
- approval and assignment routing
- ticket action execution
- work-session creation
- automatic close of expired resolved tickets

---

## Settings Persistence

Service Desk Settings use the same row/mapper/DTO rule.

Current application-facing settings include:

- `Tenant`
- `MainCategory`
- `SubCategory`
- `ApprovalStep`
- `AssignmentRule`

The tenant is the Service Desk organizational/workflow boundary. It is not a
single management-authority label. Categories, approval steps, and assignment
rules are evaluated inside tenant scope, while the application authorization
policy selects the actual `manage`, `read`, or `none` capability by Owner
Tenant/customer Tenant, category `INTERNAL`/`PORTAL` scope, and resource.

Approval Step and Assignment Rule persistence derives tenant/company context
from relationships rather than storing a second independent authorization
source:

```txt id="settings-persistence-boundary"
Approval Step / Assignment Rule
-> Category
-> Tenant
-> Company
```

A DTO may project derived tenant context for a workflow, but it does not make
that client-visible value authoritative. Repository queries and mutations join
or load the stored relationship before authorization.

Category tenant and main-category scope are immutable after creation. A
subcategory cannot move its parent across tenant/scope boundaries. Repository
and database constraints should enforce these invariants where available, in
addition to service validation. Category removal uses deactivation so existing
ticket and history references remain intact.

Settings changes affect future workflow resolution. Existing tickets keep their
stored state, routing, activity, and history unless an explicit ticket command
changes them.

---

## Query Clients and Environment

Database URLs and privileged credentials are server-only.

Typical environment responsibility:

| Variable | Purpose | Exposure |
| --- | --- | --- |
| `AUTH_DATABASE_URL` | direct PostgreSQL connection for auth data | server-only |
| `PORTAL_DATABASE_URL` | direct PostgreSQL connection for portal data | server-only |
| `NEXTAUTH_URL` | auth runtime URL | environment |
| `NEXTAUTH_SECRET` | auth signing secret | secret |
| public Supabase values | public infrastructure reference where used | public |

Rule:

```txt id="database-env-rule"
Choose the query client by responsibility, not convenience.
```

Auth repositories use auth access. Portal feature repositories use portal
application access.

---

## RLS and Grants

Effective permission is the combination of grants and row-level security.

```txt id="rls-grants"
effective permission = object grants + RLS policies
```

Every app-facing table or view should be reviewed for:

- schema usage grants
- table/view/function grants
- RLS policy coverage
- least-privilege role behavior

Missing RLS policy can look like an application bug because a query may
correctly return no rows for an application role.

For Service Desk Settings, RLS/grants and database functions are defense in
depth for tenant relationships. They should not replace the resource-specific
Owner Admin/Tenant Admin capability matrix, especially customer `PORTAL` where
category, approval, and assignment have different managers.

---

## Transaction Policy

Workflow commands should be transaction-aware when they update multiple records.

Examples:

- submit ticket and write history
- reset routing and write routing history
- execute action and write action/history/status changes
- finish running work sessions while closing, canceling, rejecting, or merging

The service layer owns the use-case boundary. Repositories own the individual
SQL operations.

---

## LOCAL and REMOTE Relationship

LOCAL runtime may use server-side mutable demo state. REMOTE runtime uses the
database data layer.

Both should expose compatible application-facing contracts:

```txt id="local-remote-dto-contract"
LOCAL state shape or REMOTE row shape
-> mapper/handler
-> application DTO
-> feature UI
```

This allows the UI to remain stable while implementation storage changes.

---

## Deferred Scope

The current database strategy does not claim the following as complete:

- durable binary attachment storage
- complete per-table RLS policy catalog in docs
- migration/versioning guide for every schema change
- full settings version publishing
- full audit export/compliance infrastructure
- production notification persistence
- complete SLA breach/escalation persistence

---

## Related Documents

- [`../03-domain/service-desk-settings.md`](../03-domain/service-desk-settings.md)
- [`../03-domain/ticket/ticket-model.md`](../03-domain/ticket/ticket-model.md)
- [`../03-domain/ticket/ticket-history.md`](../03-domain/ticket/ticket-history.md)
- [`../03-domain/ticket/ticket-track-time.md`](../03-domain/ticket/ticket-track-time.md)
- [`../06-form-design/ticket-attachment.md`](../06-form-design/ticket-attachment.md)
- [`../08-dev-strategy/service-desk-implementation-strategy.md`](../08-dev-strategy/service-desk-implementation-strategy.md)

---

## Summary

The database strategy keeps persisted data behind server-only, role-separated
access and stable DTO contracts.

For Service Desk, the important current boundaries are ticket row persistence,
REMOTE drafts as `Draft` tickets, prepared attachment metadata, event-based
history, phase-aware routing fields, tenant-scoped settings, and
transaction-aware workflow services.
