# Component Boundary

## Goal

The component boundary strategy is designed to **clearly separate responsibilities between components**,
ensuring maintainability, reusability, and predictable data flow.

It aims to:

- Reduce coupling between components
- Improve reusability
- Simplify testing
- Clarify data ownership

---

## Core Principle

```id="boundary-principle"
Components should have a single responsibility
```

---

## Component Types

The system distinguishes between two main types of components:

1. **Container Components**
2. **Presentational Components**

---

## 1. Container Components

### Definition

Components responsible for:

- Data loading or mutation orchestration
- UI and workflow state composition
- Translating permission, domain, and API results into presentational props
- Coordinating loading, error, and empty states

---

### Characteristics

- Calls a server-safe loader/service from a Server Component or feature hooks
  from a Client Component
- Knows the workflow contract and consumes domain rules
- Passes data down via props

Containers coordinate workflows. They do not become the source of truth for
durable domain rules, authorization policy, or persistence behavior. A
container may select and present the result of a rule, but it should not
reimplement that rule in JSX or event handlers.

---

### Example

```tsx id="container-example"
export function TicketList() {
  const { data } = useFetchTickets();

  return (
    <div>
      {data.map((ticket) => (
        <TicketItem key={ticket.id} ticket={ticket} />
      ))}
    </div>
  );
}
```

---

## 2. Presentational Components

### Definition

Components responsible for:

- Rendering UI
- Handling user interaction (UI-level only)

---

### Characteristics

- Receives data via props
- No direct data fetching
- May contain display-only derivation, formatting, badge/variant mapping,
  accessibility behavior, local open/close state, and UI event callbacks
- Does not own durable workflow, persistence, or authorization rules

Examples of responsibilities that do not belong in a presentational component:

- Direct API calls or persistence mutations
- Authorization decisions used as the source of truth
- Ticket status transitions or approval/assignment routing decisions
- React Query server-state ownership

---

### Example

```tsx id="presentational-example"
export function TicketItem({ ticket }) {
  return <div>{ticket.title}</div>;
}
```

---

## Boundary Rule

### Rule

```id="boundary-rule"
Data flows from container → presentational components via props
```

---

### Implication

- Presentational components do not call APIs directly
- Tree depth alone does not decide whether fetching is allowed
- A nested subtree may own data only when it has an explicit independent
  container boundary and its own query, loading, and error lifecycle

---

## Feature-Level Boundary

The boundary is enforced at the **feature level**.

---

### Rule

```id="feature-boundary"
Route Server Components or feature containers own data orchestration
```

---

### Example Structure

```bash id="feature-boundary-structure"
TicketList (container)
  ├── TicketItem (presentational)
  ├── TicketStatusBadge
  └── TicketActions
```

---

## Data Fetching Strategy

### Location

- A Server Component may load server-rendered data through a server-safe
  loader, service, or use-case boundary
- An interactive Client Component container uses feature hooks and React Query
- Independently loaded widgets or Suspense subtrees may own a local container
- Presentational components do not call APIs directly

---

### Why?

- Centralized data logic
- Easier caching and refetching
- Avoids duplicated requests

---

## Props Design Strategy

### Principle

```id="props-principle"
Pass only what is needed
```

---

### When Only a Few Fields Are Needed

```tsx id="good-props"
<TicketItem title={ticket.title} status={ticket.status} />
```

---

### When the Object Is the Component Contract

```tsx id="object-props-example"
<TicketItem ticket={ticket} />
```

An object prop is not inherently an anti-pattern. Prefer specific props when a
child needs only a few fields, and use an object prop when the domain object is
itself a meaningful component contract.

---

### Trade-off

| Approach       | Pros           | Cons          |
| -------------- | -------------- | ------------- |
| Specific props | Clear contract | More verbose  |
| Object props   | Flexible       | Less explicit |

---

## State Placement Strategy

### Rule

```id="state-placement"
State should live in the lowest common owner that needs it
```

---

### Examples

- Dialog open state → local component/container state by default
- Filter state → URL when navigational, otherwise the owning container
- Form input and validation state → React Hook Form within the form boundary
- Interactive server state → React Query, not a duplicated Zustand store

Use Zustand only when unrelated or distant client subtrees must share the same
runtime state. Do not globalize local dialog state solely to avoid passing one
callback, and do not copy React Query data into Zustand.

---

## Server / Client Component Boundary

Keep Next.js pages and layouts as Server Components by default.

### Server Component Responsibilities

- Load server-rendered data through server-safe loaders, services, or use cases
- Use secrets and server-only dependencies
- Pass serializable props to Client Components

### Client Component Responsibilities

- Event handlers and local state
- Lifecycle hooks
- Browser APIs
- Client hooks such as React Query, Zustand, forms, and translations

`"use client"` is an entry boundary for the client module graph, not a marker
that must be repeated in every descendant file. Keep interactive subtrees as
small as practical, and use `client-only` and `server-only` to reject imports
from the wrong runtime.

Normalize runtime-specific values before crossing from a Server Component to a
Client Component.

| Boundary value | Guidance |
| --- | --- |
| DTO, string, number, boolean, serializable array/object, ISO date string | Pass directly |
| `Date`, `Map`, `Set`, database row | Normalize to an application-facing serializable value |
| Repository, database client, request/response object, runtime handle | Do not pass |

---

## Interaction Handling

### Principle

```id="interaction-principle"
UI reports interaction, container coordinates the workflow
```

---

### Example

```tsx id="interaction-example"
<TicketItem onClick={handleSelectTicket} />
```

- `TicketItem` → triggers event
- `TicketList` → handles logic

---

## Reusability Strategy

### Presentational Components

- Reusable when their visual and interaction contract is stable
- Business-agnostic primitives belong in the current `components/ui` boundary
- Generic composed controls belong in `components/custom`
- Domain-aware components stay in the owning feature or an application-wide
  widget even when multiple screens use them

Reuse count alone does not determine ownership. For example, a generic button,
dialog primitive, or table shell may belong in the reusable component boundary,
while a ticket status view, approval editor, or assignment-rule card retains
Service Desk ownership.

---

### Container Components

- Usually feature-specific
- May be reused inside the owning feature when the workflow contract is stable
- Should not move to a shared location only because two screens currently use it

---

## Dependency Rules

### Allowed

- Presentational → Presentational
- Container → Presentational

---

### Not Allowed

- Presentational → container workflow ownership
- Presentational → direct persistence or authorization implementation
- Client component → server-only module

UI that composes independent features belongs to `app` or an application-wide
`components` widget. Closely related workflow slices may consume explicit,
runtime-safe feature contracts as described in
`feature-based-structure.md`; this does not permit importing another slice's
internal component or client hook without a clear workflow owner.

---

## Anti-Patterns Avoided

### 1. Data Fetching in UI Components

- ❌ Leads to duplication and inconsistency

---

### 2. Overly Smart Components

- ❌ Mixing UI and business logic

---

### 3. Prop Drilling Abuse

- ❌ Passing unnecessary data through many layers

---

### 4. Global State Overuse

- ❌ Using Zustand for local UI state

---

## Trade-offs

### Pros

- Clear separation of concerns
- Easier testing
- Better reusability
- Predictable data flow

---

### Cons

- More components to manage
- Slightly more boilerplate
- Requires discipline in structure

---

## Alternatives Considered

### 1. Fully Smart Components

- ✔ Less boilerplate
- ❌ Hard to maintain and test

---

### 2. Fully Dumb Components

- ✔ Simple UI
- ❌ Too much logic pushed upward

---

### 3. No Clear Boundary

- ✔ Faster initial development
- ❌ Long-term complexity explosion

---

## Design Principles Alignment

This strategy aligns with:

- Separation of concerns
- Component reusability
- Predictable data flow
- Scalable UI architecture

---

## Related Documents

- [`../02-architecture/feature-based-structure.md`](../02-architecture/feature-based-structure.md)
- [`../02-architecture/state-management.md`](../02-architecture/state-management.md)
- [`dialog-pattern.md`](dialog-pattern.md)

---

## Summary

The component boundary strategy distinguishes **workflow-coordinating
containers** from **rendering and locally interactive presentational
components**. Presentational components may contain display logic, while
durable domain, persistence, authorization, and server-state rules remain with
their owning boundaries.
