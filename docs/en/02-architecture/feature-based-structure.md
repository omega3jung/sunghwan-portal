# Feature-Based Structure

## Goal

The project adopts a **feature-based architecture** to improve scalability, maintainability,
and separation of concerns in a production-level frontend system.

It aims to:

- Encapsulate business logic within feature boundaries
- Reduce coupling between unrelated modules
- Enable independent feature development
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

The system is structured around **features (domain-driven modules)**.

```id="feature-concept"
feature = independent unit of business logic
```

Each feature encapsulates:

- UI components
- API logic
- state management
- types and domain models

---

## Directory Structure

```bash id="feature-structure"
src/
  app/        # routing layer
  domain/     # domain models and rules
  feature/    # feature workflows and UI
  server/     # server-side local/demo logic
  shared/     # reusable utilities and components
```

---

## Responsibilities

### 1. app/ (Routing Layer)

- Defines routes (App Router)
- Minimal logic
- Orchestrates feature components

```tsx id="app-example"
export default function Page() {
  return <ServiceDeskPage />;
}
```

---

### 2. feature/ (Business Layer)

Contains all business logic grouped by domain.

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

- Domain-specific TypeScript types
- Shared within the feature

---

### utils/

- Feature-specific utility functions

---

## Component Boundary Strategy

### Rule

- **Feature-level components** handle data fetching
- **Child components** receive data via props

---

### Example

```tsx id="component-boundary"
<TicketList>
  <TicketItem />
</TicketList>
```

- `TicketList` → fetches data
- `TicketItem` → purely presentational

---

## Data Fetching Strategy

- Data fetching is colocated within feature hooks
- Uses React Query for server state

### Benefits

- Centralized API logic
- Consistent caching strategy
- Easier testing

---

## State Management Strategy

### Server State

- Managed via React Query

---

### Client State

- Managed via Zustand (when needed)

---

### Principle

```id="state-principle"
Prefer server state over client state whenever possible
```

---

## Dependency Rules

### Allowed

- feature → shared
- feature → same feature

---

### Not Allowed

- feature A → feature B (direct dependency)

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

Client-only shared utilities should be separated under boundaries such as:

```txt
src/shared/client/
```

---

## Reusability Strategy

### Shared Components

- Extracted into `shared/` or `components/` (global)

---

### Feature Components

- Stay within feature unless reused elsewhere

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

## Summary

The feature-based structure organizes the application around **business domains**,
allowing each feature to operate as an independent module,
resulting in a scalable, maintainable, and production-ready architecture.
