# Service Desk Implementation Strategy

This document focuses on the **new implementation** strategies added to build the redesigned Service Desk domain in the current portfolio project.

## 1. Purpose

This document explains the implementation strategy used to build the **Service Desk** module in `sunghwan-portal`.

The companion document, `service-desk-evolution.md`, explains how the previous Service Hub / IT Help Desk experience was improved into a clearer Service Desk domain. This document focuses on how that redesigned domain is implemented in the current portfolio project.

The goal is to describe practical implementation decisions, not to define the domain model from scratch.

This document is intended for:

- engineers reviewing the frontend architecture
- interviewers evaluating practical implementation judgment
- future maintainers who need to understand local demo behavior, runtime boundaries, and project structure

---

## 2. Recommended Documentation Location

Recommended path:

```txt
docs/en/08-dev-strategy/service-desk-implementation-strategy.md
```

Use this document for:

- implementation-specific strategies
- local demo and local/remote runtime design
- auth/session/impersonation boundaries
- routing, forms, search, query, state, i18n, and architecture decisions

Conceptual/domain evolution belongs in:

```txt
docs/en/08-dev-strategy/service-desk-evolution.md
```

---

## 3. Implementation Goal and Scope

The Service Desk module is implemented as a production-aligned portfolio feature.

The implementation target is not a toy mock screen. It is a working demo that shows realistic frontend architecture and backend-like behavior while keeping the scope appropriate for a portfolio project.

The implementation focuses on:

- local and remote runtime separation
- realistic local demo mutation behavior
- session-aware identity and access handling
- page, drawer, and dialog interaction boundaries
- form, search, query, and API responsibility separation
- feature-based project structure
- safe server/client module boundaries
- maintainable documentation and decision history

The current implementation intentionally avoids overbuilding areas that require full production infrastructure, such as persistent file storage, real notification delivery, WebSocket updates, or complete enterprise rule evaluation.

The guiding principle is:

```txt
credible architecture
+ working local demo
+ clear implementation boundaries
+ room for future remote persistence
```

---

## 4. Runtime Strategy

The Service Desk module supports different runtime behavior depending on data scope.

The local runtime is designed for demo and portfolio review. The remote runtime is reserved for future API and database-backed execution.

### 4.1 Local and Remote Runtime Separation

The project separates Service Desk behavior into two runtime paths:

```txt
LOCAL  -> mock-backed demo behavior
REMOTE -> future API / database-backed behavior
```

This separation affects:

- ticket fetching
- action execution
- ownership calculation
- demo reset behavior
- query strategy
- mutation behavior

The UI should not need to know whether every operation is backed by local mock state or remote persistence. Instead, the route and API layers decide the runtime path.

The general direction is:

```txt
UI
-> feature API client
-> Next.js route handler
-> LOCAL handler or REMOTE proxy
```

This keeps the frontend close to a real production flow while still allowing the portfolio demo to run without a real database.

### 4.2 Local Demo Permission Simplification

The local demo does not attempt to reproduce every enterprise authorization rule.

Instead, it uses a simpler role-aware model:

```txt
ADMIN     -> broad permission
non-ADMIN -> must be related to the ticket
```

Additional local behavior includes:

- `ADMIN` can perform major Service Desk operations.
- Non-admin users need ownership, assignment, or another relevant relationship.
- `LEADER` and above can read broader ticket lists.
- `USER` mainly works with tickets they created or are related to.
- Some creation flows allow `ADMIN` or `MANAGER` to bypass approval.

This keeps the demo understandable while still showing permission-aware behavior.

The future remote implementation can apply full organization, department, job-field, and relationship-based rules.

### 4.3 Local Demo State and Reset

React Query cache reset is not enough for the local demo.

The local demo mutates server-side in-memory mock state. Therefore, mutable demo data is centralized in server-side local state modules.

Example direction:

```txt
server/serviceDesk/ticket/state.ts
server/serviceDesk/settings/state.ts
```

A reset endpoint restores the demo to a known state:

```txt
/api/demo/service-desk/reset
```

This makes the demo safer for repeated testing and recruiter review.

The user can explore ticket actions, status changes, settings updates, and list filtering without permanently damaging the sample data.

### 4.4 Scenario-Based Mock Data

Mock data is designed as workflow scenarios, not only static table rows.

Example direction:

```txt
scenarios/serviceDesk/SP-2026-0001
  ticket.ts
  actions.ts
  histories.ts
```

Scenario-based mock data can demonstrate:

- approval
- assignment
- rejection
- merge
- comments
- notes
- history
- time tracking
- multilingual examples

This makes the local demo more convincing because it shows realistic operations and history, not only a list of sample tickets.

### 4.5 Intentionally Deferred Scope

The current implementation avoids features that would add high complexity without improving the portfolio demo enough.

Deferred or simplified areas include:

- full remote database persistence
- production-grade file attachment storage
- full enterprise rule engine in local mode
- real-time WebSocket updates
- complete SLA calendar / holiday engine
- full notification delivery
- full audit compliance infrastructure

These are not ignored. They are intentionally left as future expansion points.

The current goal is to keep the system credible, maintainable, and reviewable.

---

## 5. Identity and Access Strategy

Service Desk behavior depends heavily on user context.

The implementation separates authentication identity, session-safe user data, and application-facing user data.

### 5.1 Auth, Session, and App User Boundary

The project separates identity concepts:

```txt
AuthUser    -> authentication identity
SessionUser -> session-safe projection
AppUser     -> application-facing user model
```

The session is not treated as the full user profile.

Instead:

```txt
JWT / Session -> trusted identity and access context
AppUser       -> fetched or resolved application user
Zustand       -> frontend runtime facade, not auth truth
```

This prevents the session from becoming too large or too coupled to UI needs.

It also keeps authentication, permission checks, and UI convenience data from being mixed together.

### 5.2 Impersonation as Session-Aware Behavior

Impersonation is treated as session-aware behavior, not a simple client-side override.

Important identity concepts:

```txt
original user  = authenticated actor
effective user = user currently being represented
```

This allows the UI and API layer to act using the effective user while preserving the original actor for audit and accountability.

This matters for Service Desk systems because support staff often need to reproduce or inspect user-specific behavior.

Current authorization boundary:

- only `INTERNAL` users with at least `ADMIN` access can start impersonation
- impersonation target must be a `TENANT` user
- the rule is enforced in the auth layer, not in UI components

### 5.3 Derived Ownership

Ticket ownership is calculated from the current session and ticket data rather than stored as a fixed field.

Example direction:

```ts
type Ownership = {
  owner: boolean;
  assigned: boolean;
};
```

Example logic:

```txt
owner    = currentUser.username === ticket.requesterId
assigned = ticket.assigneeIds.includes(currentUser.username)
```

Derived ownership supports:

- permission decisions
- list highlighting
- action availability
- detail page behavior
- local and remote behavior

In local mode, the route or local handler can compute these values. In remote mode, the server can compute them using the authenticated user context.

---

## 6. UI and Interaction Strategy

The Service Desk UI separates primary workflows, secondary panels, and atomic actions.

The goal is to avoid putting every interaction into a modal while still keeping the interface efficient.

### 6.1 Page, Drawer, and Dialog Policy

The project uses this interaction policy:

```txt
Page   -> primary workflow
Drawer -> secondary interaction
Dialog -> atomic action
```

Ticket detail is a page:

```txt
/service-desk/[ticketId]
```

This gives each ticket a stable URL and avoids nested modal complexity.

Drawers are suitable for secondary views such as history or side panels.

Dialogs are suitable for short forms, confirmations, or focused actions.

### 6.2 Ticket Form Architecture

The ticket form is implemented as a guided multi-step form.

Example flow:

```txt
Step 1 -> Category
Step 2 -> Basic information
Step 3 -> Details / attachments
Step 4 -> Review and submit
```

The form uses:

- `react-hook-form`
- `zod`
- step-level validation
- final validation
- category-driven default values

The form mode is explicit:

```ts
type Mode = "create" | "update" | "view";
```

This keeps shared form UI from hiding different lifecycle behaviors.

### 6.3 Draft Strategy

Draft behavior is kept practical for the current demo.

A full production draft system can become expensive because rich body content and attachments require persistent storage guarantees.

The current direction is:

- support draft-like behavior only when it provides demo value
- avoid pretending attachments are safely persisted when they are not
- keep local draft behavior simple
- defer full server draft persistence until remote storage exists

This keeps the demo honest and avoids unnecessary complexity.

### 6.4 Rich Text Editor Consolidation

The action forms and ticket communication areas share a consolidated rich text editor.

The editor strategy:

- stores content as HTML strings
- uses a shared toolbar
- reduces duplicated editor logic
- supports consistent comment, note, and reason inputs

This supports the action-driven model without duplicating editor behavior across each action form.

### 6.5 UI Execution Refinements

Several UI refinements help the module feel like a realistic Service Desk system.

Examples:

- ticket detail page instead of modal-only detail
- history drawer with stable secondary interaction
- assigned-to-me badge instead of an overly strong icon
- careful use of row emphasis to avoid looking like selected state
- role-aware summary text on the protected home page
- dashboard and insight responsibilities separated
- consistent status badge patterns
- date picker and date-time picker behavior adjusted for real filtering and work tracking

The UI is not treated only as decoration. It communicates domain state, ownership, and workflow progress.

---

## 7. Data and API Strategy

The Service Desk data layer separates page concerns from server-side filtering, runtime branching, and mutation behavior.

### 7.1 Search Endpoint Strategy

The ticket list search moved away from complex query-string-only filtering.

The improved direction uses a dedicated search endpoint:

```txt
POST /api/service-desk/tickets/search
```

The page submits simple search criteria. The server maps those criteria to richer filtering rules.

This keeps the URL and client logic manageable while preparing for advanced filtering.

### 7.2 Date Range Normalization

Date range filters should match user expectations.

For date-only filters, the implementation normalizes boundaries:

```txt
start date -> startOfDay
end date   -> endOfDay
```

This avoids bugs where a filter based on the current time excludes tickets created earlier or later in the selected day.

For example, `Today` should mean the whole day, not only the time after the user opened the picker.

### 7.3 React Query Segmentation

Server data is separated by update frequency.

Static or reference-like data:

```txt
category
department
employee
job field
reference settings
```

Dynamic or mutable Service Desk data:

```txt
ticket list
ticket detail
draft
actions
histories
track time
local demo mutable state
```

This allows the project to use different query options depending on data behavior.

The strategy avoids one-size-fits-all caching. Static data can remain stable longer, while mutable Service Desk data can refetch after actions or state changes.

### 7.4 API Route Orchestration

Next.js route handlers act as orchestration boundaries.

General direction:

```txt
route.ts
-> authenticate / check session
-> decide LOCAL or REMOTE
-> call local handler or remote proxy
```

Local demo logic belongs in server-side local modules, not in UI components.

This keeps the future remote API path open without redesigning the frontend.

### 7.5 Service Desk Settings DTO/API Boundary

The June settings implementation aligned Service Desk settings around an
explicit tenant and DTO/API boundary.

Key direction:

```txt
Tenant = Service Desk configuration boundary
Category = tenant-scoped behavior configuration
```

Service Desk settings APIs should keep the same application-facing contract in
LOCAL and REMOTE modes. The UI should consume DTOs and should not care whether
settings data came from server-side local mock state or PostgreSQL-backed
repositories.

Implementation guidance:

- keep route handlers thin
- delegate settings behavior to domain handlers
- keep row / mapper / DTO boundaries for REMOTE data access
- keep LOCAL settings mutations in server-side local state modules
- remove speculative CRUD routes unless they support a real UI workflow

---

## 8. Architecture and Boundary Strategy

The project uses feature-based architecture and explicit module boundaries to keep the Service Desk maintainable.

### 8.1 Feature-Based Structure

The project structure separates routing, feature workflows, domain models, server logic, and shared utilities.

Example direction:

```txt
src/app      -> routing layer
src/feature  -> feature workflows and UI
src/domain   -> domain models and rules
src/server   -> server-side local/demo logic
src/shared   -> reusable utilities and components
```

This avoids page-centric files where UI, fetching, business logic, and domain behavior become tangled together.

It also fits Next.js App Router better because server/client boundaries are easier to reason about.

### 8.2 Barrel Export Policy

Overly broad `index.ts` barrel exports can create accidental dependency leaks.

The improved policy is:

```txt
index.ts should export only safe and intentional public API
```

For feature modules:

```txt
feature/serviceDesk/ticket/index.ts
-> constants, mapper, mock, types

feature/serviceDesk/ticket/components/index.ts
-> UI components

feature/serviceDesk/ticket/api/index.ts
-> server-safe API helpers

feature/serviceDesk/ticket/api/client.ts
-> client-only API exports
```

The lesson is:

```txt
A barrel file is a public contract, not a dumping ground.
```

This reduces accidental server/client boundary leaks.

### 8.3 Shared Client Utilities

Some shared utilities require client-only behavior, such as toast helpers or browser storage helpers.

The improved direction is to separate client-only shared utilities:

```txt
src/shared/client/
```

This keeps server-safe utilities separate from client-only modules.

It reduces accidental import problems in Next.js App Router, where server and client boundaries matter.

### 8.4 i18n Namespace Strategy

Translations are organized by namespace and responsibility.

Example namespaces:

```txt
common
serviceDesk
validation
message
error
settings
demo
```

Validation messages, expected user-facing messages, and system errors are separated.

Explicit translation keys are preferred over hidden helper abstractions because this portfolio benefits from readability.

Reviewers should be able to understand what each message means without chasing multiple layers of indirection.

---

## 9. Documentation and Maintainability Strategy

Documentation is treated as part of the project deliverable.

The Service Desk module is supported by:

- domain documents
- strategy documents
- architecture documents
- decision logs
- implementation notes

This helps explain not only what was built, but why it was built that way.

For a portfolio project, this matters because reviewers are not only evaluating whether the UI works. They are also evaluating design judgment, maintainability, and the ability to explain trade-offs.

The documentation strategy is:

```txt
domain docs      -> what the system means
architecture docs -> how the system is structured
strategy docs     -> why the implementation direction was chosen
decision logs     -> what changed and why
```

---

## 10. Suggested Cross References

This document can be linked from:

- `docs/en/README.md` (Development Strategy section)

Related references:

- `docs/en/08-dev-strategy/service-desk-evolution.md`
- `docs/en/02-architecture/feature-based-structure.md`
- `docs/en/02-architecture/auth-session-strategy.md`
- `docs/en/02-architecture/state-management.md`
- `docs/en/05-data-fetching/react-query-strategy.md`

---

## 11. Suggested README Summary

### Service Desk Implementation Strategy

This document describes how the Service Desk domain is implemented in the current portfolio project, including local/remote runtime separation, local demo state strategy, auth/session boundaries, API orchestration, and feature-based architecture decisions.

---

## 12. Summary

The Service Desk implementation strategy focuses on realistic execution without unnecessary overbuilding.

The most important implementation decisions are:

- separate local and remote runtime behavior
- keep local demo behavior mutable and resettable
- simplify local permissions while preserving role-aware behavior
- separate auth, session, app user, impersonation, and derived ownership concerns
- use pages for primary ticket workflows, drawers for secondary views, and dialogs for atomic actions
- keep form, draft, rich text, and UI behavior aligned with ticket workflow needs
- move advanced search and filtering responsibility to the server boundary
- segment React Query behavior by data mutability
- keep route handlers as orchestration boundaries
- align Service Desk settings through tenant-scoped DTO/API contracts
- use feature-based structure and safe barrel exports
- separate client-only shared utilities from server-safe utilities
- treat i18n and documentation as maintainability features

This strategy makes the portfolio stronger because it demonstrates not only UI implementation, but also practical frontend architecture, runtime boundary design, and maintainable project organization.
