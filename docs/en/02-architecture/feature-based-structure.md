# Feature-Based Structure

## Goal

The project adopts a **feature-based architecture** to improve scalability, maintainability,
and separation of concerns in a production-level frontend system.

This document is the source of truth for current source-folder boundaries and
dependency direction. Historical decision logs preserve the rationale at the
time of each decision; current rules follow this document.

It aims to:

- Keep durable business rules in domain modules and workflow logic in the
  capability that owns it
- Reduce coupling between unrelated modules
- Make feature ownership and cross-feature collaboration explicit
- Improve long-term maintainability

---

## Background

The previous system was based on a **Page Router structure**, where:

- Most logic was colocated inside page modules
- Components, API calls, and state logic were tightly coupled
- Reusability was limited
- Code ownership was unclear

---

## Problems with Page-Centric Structure

### 1. Poor Separation of Concerns

- UI, business logic, and data fetching mixed together

---

### 2. Low Reusability

- Components tied to specific pages
- Difficult to extract shared logic

---

### 3. Difficult Scaling

- As features grow, page files become large and complex

---

### 4. Weak Domain Representation

- Folder structure does not reflect business domains

---

## Core Concept

The system separates **domain models**, **user-facing capabilities**, and
**runtime implementations**, while organizing features around user workflows.

```id="feature-concept"
domain = business concepts and pure rules
feature = user-facing capability with an explicit workflow owner
```

Each feature may encapsulate:

- UI components
- API logic
- state management
- feature contracts and workflow logic

Features do not own core domain models or pure business rules. Those belong to
`src/domain` and may be shared by multiple features and server use cases.

---

## Directory Structure

```bash id="feature-structure"
src/
  app/          # Next.js routing and final composition
  components/   # application-wide UI widgets
  domain/       # domain models and pure business rules
  feature/      # user-facing workflows and UI
  lib/          # domain-aware shared policies and runtime integration
  server/       # server use cases, data access, and external API implementations
  shared/       # application-agnostic foundation code
```

---

## Responsibilities

### 1. shared/ (Foundation Layer)

- Lowest layer, unaware of the application and its business domains
- Owns generic types, value helpers, formatting, routing parameters, and
  application-agnostic browser helpers
- Does not import from `domain`, `lib`, `feature`, `server`, or `app`

Self-check:

```txt
Could this code be used in a shop or banking application in a similar form?
```

Code that needs business terms such as `Ticket`, `Company`, or `ServiceDesk`
does not belong in shared.

---

### 2. domain/ (Domain Layer)

- Owns domain models, value types, enums, and pure business rules
- Does not know about React, Next.js, HTTP, databases, or browser storage
- May only import from `shared`

Rules derived only from model state may be separated from `model.ts` into
`rules.ts` or `policy.ts`. This separation does not move them out of the domain.

```txt
domain/serviceDesk/ticket/
  model.ts
  rules.ts
```

---

### 3. lib/ (Application / Integration Layer)

`lib` contains project infrastructure and domain-aware code shared by more than
one caller. It is not one uniform runtime layer.

The current explicit sub-boundaries are:

```txt
lib/
  application/  # domain-aware policies and mappings without UI/runtime ownership
  client/       # browser-facing helpers, client state, toast, theme, and client i18n
  config/       # public environment normalization and shared route configuration
```

- `lib/application` may import `domain` and `shared`. It must remain usable by
  both client and server callers.
- `lib/client` may import `lib/application`, `lib/config`, `domain`, and
  `shared`, and may use browser or client-state dependencies.
- `lib/config` owns configuration that is safe in both runtimes, currently
  normalized public environment values and route/path configuration. It does
  not import application, feature, UI, or server implementations.
- The `lib` root contains only these explicit sub-boundaries; runtime-specific
  modules are not exposed through a mixed root barrel.
- Database access, secrets, filesystem access, and server use-case
  implementation currently remain under `server`, `auth`, or a server-only
  `app` entry. There is no current `lib/server` boundary.

`lib` is not a dumping ground. A module should state whether it is an
application policy, client integration, framework integration, or runtime
helper through its location and imports.

---

### 4. feature/ (Feature Layer)

- Owns user-facing capabilities and workflows
- Encapsulates feature UI, forms, hooks, API clients, and client state
- May import client-safe `lib` modules, `domain`, `shared`, and reusable
  components
- Does not directly import server implementations

Features coordinate user-facing workflows, consume domain rules and API
contracts, and integrate React Query for interactive server state. They do not
become the source of truth for durable domain rules.

The current code has collaborating feature slices, especially under
`feature/serviceDesk`, and application workflows such as auth/session and user
preference reuse. Prefer an explicit, runtime-safe entry or direct contract
module over importing another slice's internal component, hook, or context.
Composition that does not have a clear feature owner belongs in `app` or an
application-wide component.

---

### 5. server/ (Server Layer)

- Owns repositories, database access, server use cases, and external API adapters
- Includes both LOCAL demo and REMOTE implementation boundaries
- May import server-safe `lib` modules, `lib/application`, `domain`, and
  `shared`
- Does not import feature components, hooks, forms, or client APIs

Some current LOCAL demo and portal modules consume feature-owned DTO types,
payload contracts, and pure mappers. These imports are allowed only when the
referenced module graph is server-safe. They do not permit server code to
import feature hooks, components, contexts, forms with client hooks, or client
API entry points.

Place a shared concept according to its actual ownership: a durable business
concept in `domain`, an HTTP/DTO contract with the API boundary that owns it,
and a generic reusable type in `shared`. Do not create a new application layer
only to shorten an import path.

---

### 6. components/ (Application Widget Layer)

- `components/ui` owns the current reusable UI primitives
- `components/custom`, `components/layout`, and `components/menu` own
  project-wide composed widgets
- Application widgets may consume feature contracts and lower layers
- Domain-aware workflow UI stays in the owning feature; route-specific UI may
  stay next to its route

---

### 7. app/ (Routing / Composition Layer)

- Defines routes (App Router)
- Performs final composition of features and widgets in pages and layouts
- Orchestrates HTTP parsing, authentication, and runtime selection in route handlers
- Does not directly own durable business rules, data access, or client state

Runtime permission depends on the entry, not merely on being under `app`:

- A Server Component, route handler, or server-only loader may import server-safe
  modules.
- A Client Component must not import repositories, database clients, secrets,
  filesystem code, or other server-only modules.
- The same runtime rule applies to components imported by an app entry.

```tsx id="app-example"
export default function Page() {
  return <ServiceDeskPage />;
}
```

---

### Supporting / Framework Folders

- `auth/`: current NextAuth credentials, authorize, JWT, and session integration.
  It is server-oriented and currently reaches the auth route helper for login
- `mocks/`: LOCAL demo and test fixtures. May use domain/shared but is not a source of truth for production lower layers
- `types/`: Framework module augmentation and ambient declarations only; no business types
- `stories/`: Storybook-only top-level consumer; never imported by production runtime modules
- `styles/`: Global styles and design-token stylesheets; no business logic

For new framework integrations, prefer an existing `lib` runtime boundary,
`server`, `auth`, or the app composition boundary instead of adding another
top-level folder without an established responsibility.

---

## Feature Module Structure

Each feature follows a consistent structure.

```bash id="feature-module"
feature/serviceDesk/
  components/
  api/
  hooks/
  types/
  utils/
```

---

### components/

- UI components specific to the feature
- Can include both container and presentational components

---

### api/

- API calls and mutations
- Encapsulates backend interaction
- Split into server-safe helpers and client-only wrappers when needed

```ts id="api-example"
export const serviceDeskTicketApi = {
  list: (params) => fetch(...),
  get: (id) => fetch(...),
};
```

---

### hooks/

- Custom hooks
- Handles data fetching and state composition

```ts id="hook-example"
export const useFetchTickets = () => {
  return useQuery(...);
};
```

---

### types/

- Feature contracts and UI/form-specific TypeScript types
- Does not redefine core domain models

---

### utils/

- Feature-specific utility functions

---

## Component Boundary Strategy

### Rule

- **Server Components** may load server-rendered data through a server-safe
  loader, service, or use-case boundary
- **Client feature containers/hooks** use React Query for interactive server
  state and mutations
- **Presentational children** receive data and callbacks through props

---

### Example

```tsx id="component-boundary"
<TicketList>
  <TicketItem />
</TicketList>
```

- `TicketList` coordinates the query and result states
- `TicketItem` renders ticket data and reports UI events

---

## Data Fetching Strategy

Server-rendered data and interactive client-side server state use different
owners.

| Data flow | Owner |
| --- | --- |
| Server-rendered route data | Server Component through a server-safe loader, service, or use case; follows Next.js request/cache semantics |
| Interactive client-side server state | Feature hook/container through React Query for query caching, refetch, invalidation, and mutation state |
| Client/UI state | Local component state by default; Zustand only when distant consumers share runtime state |

The current documents page loads Markdown in a Server Component. Interactive
Service Desk data primarily follows feature client → route handler → LOCAL or
REMOTE server implementation. Presentational components do not call APIs
directly.

In this document, React Query-managed server state means backend data consumed
by the interactive client graph. Data loaded and rendered through a Server
Component follows the Server Component and Next.js request/cache lifecycle.

### Benefits

- Centralized API logic
- Consistent caching strategy
- Easier testing

---

## State Management Strategy

### Server State

- React Query manages server state consumed interactively by client features
- Server Components may load data for server rendering without copying it into
  a React Query cache

---

### Client State

- Keep local UI state in the lowest component owner
- Use React Hook Form for form state
- Use Zustand when unrelated or distant client subtrees need the same runtime
  state

---

### Principle

```id="state-principle"
Prefer server state over client state whenever possible
```

---

## Dependency Rules

The table below is the default direction for new and refactored modules. Runtime
compatibility still applies within every allowed dependency.

| Source layer | Allowed dependencies |
| --- | --- |
| `shared` | external libraries, same shared layer |
| `domain` | shared |
| `lib/application` | domain, shared |
| `lib/config` | shared or external runtime values without upper-layer imports |
| `lib/client` | lib/application, lib/config, domain, shared |
| `feature` | client-safe lib, domain, shared, components, runtime-safe feature contracts |
| `server` | server-safe lib, lib/application, domain, shared, server-safe DTO/pure contract modules currently owned by feature or app API boundaries |
| `components` | feature public APIs, client-safe lib, domain, shared |
| `app` | components, feature, server, lib, domain, shared |

### Forbidden Dependencies

- `shared` → domain / lib / feature / server / app
- `domain` → lib / feature / server / app
- `feature` → server implementation
- `server` → feature hooks / components / contexts / client API
- Client Component or client entry → database, secret, filesystem, or other
  server-only module
- Server module → browser API, Zustand hook, React hook, or client-only module

### Cross-Feature Rule

Feature-to-feature reuse is evaluated by ownership and runtime, not by directory
depth alone. Current Service Desk workflows intentionally reuse ticket forms,
query contracts, and shared Service Desk client helpers across adjacent slices.

- Use a stable public entry or a focused direct module whose runtime is clear.
- Do not import another feature's internal component, context, or hook merely
  to avoid composition.
- Move durable domain concepts to `domain`, domain-aware cross-cutting policies
  to `lib/application`, and generic reusable types to `shared`.
- Compose independent user capabilities in `app` or an application-wide widget.

### Runtime Rules

- Browser APIs, Zustand, and client HTTP wrappers belong in `lib/client`, an
  existing client-safe root integration, or a client feature entry
- Database, secret, and filesystem access belongs in `server`, `auth`, or a
  server-only route/loader boundary
- Use `client-only` and `server-only` boundaries to prevent environment poisoning
- Do not expose client and server modules through the same root barrel

### Current Compatibility Couplings

The current source still contains a few ownership couplings that the dependency
table alone does not show:

- LOCAL demo and portal server modules consume server-safe feature DTOs, payload
  types, and pure mappers.
- Several server modules reuse error, filtering, and response helpers currently
  located under `app/api`.
- A small number of feature API/mapper modules still import server-owned DTO
  types. Treat these as existing exceptions; new feature code must not add a
  dependency on server implementation.
- Base i18n resources and namespace contracts live in `lib/application/i18n`;
  the client runtime lives in `lib/client/i18n`. Application component locale
  registration is composed above lib in `components/i18n`.

These couplings describe current implementation ownership; they do not make
feature UI safe for server code or server implementation safe for client code.
When one is refactored, move the contract to the boundary that actually owns it
instead of adding a new layer by default.

---

### Purpose

- Prevent tight coupling
- Maintain independence of features

---

## Barrel Export Policy

Barrel files are treated as explicit public contracts.

Rule:

```txt
Barrel file != dumping ground
```

Service Desk direction:

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

Here, `server-safe` means that the complete module graph can execute in a Server
Component, route handler, or server implementation. Current server code may
consume such feature-owned DTO or pure mapper contracts, but this never makes a
client feature entry safe for the server. Runtime compatibility and ownership
are separate review questions.

Client-only shared utilities should be separated under boundaries such as:

```txt
src/lib/client/
```

Generic browser helpers that do not know the domain may still use
`src/shared/client`.

---

## Reusability Strategy

### Reusable Components

- Business-agnostic UI primitives currently live in `components/ui`
- Generic composed controls live in `components/custom`
- Application-wide widgets that consume features live in `components/layout`
  or `components/menu`

---

### Feature Components

- Stay with the owning feature while they carry that workflow's domain meaning
- Move only when the component contract becomes genuinely generic or
  application-wide; reuse count alone is not sufficient

### Route Components

- UI used by one route is colocated under `app/**/_components`
- Ownership takes priority over reuse count when deciding whether to move code

---

## Trade-offs

### Pros

- Clear domain separation
- Scalable structure
- Improved maintainability
- Easier onboarding

---

### Cons

- Initial setup complexity
- Requires strict discipline
- Possible duplication between features

---

## Alternatives Considered

### 1. Page-Based Structure

- ❌ Poor scalability
- ❌ Weak domain separation

---

### 2. Layer-Based Structure (api / components / hooks globally)

- ✔ Easy to understand
- ❌ Business logic scattered across folders

---

### 3. Fully Shared Component Structure

- ✔ Maximum reuse
- ❌ Hard to maintain ownership

---

## Design Principles Alignment

This architecture aligns with:

- Domain-driven design (DDD)
- Separation of concerns
- Scalability and maintainability
- Feature independence

---

## Related Documents

- [`state-management.md`](state-management.md)
- [`routing-strategy.md`](routing-strategy.md)
- [`database-strategy.md`](database-strategy.md)
- [`../04-ui-ux/component-boundary.md`](../04-ui-ux/component-boundary.md)
- [`../08-dev-strategy/decision-log/2026-05-barrel-export-boundary.md`](../08-dev-strategy/decision-log/2026-05-barrel-export-boundary.md)
- [`../08-dev-strategy/decision-log/2026-05-service-desk-documentation-alignment.md`](../08-dev-strategy/decision-log/2026-05-service-desk-documentation-alignment.md)

---

## Summary

The feature-based structure organizes the application around **business domains**,
allowing each feature to operate as an independent module,
resulting in a scalable, maintainable, and production-ready architecture.
