# State Management Strategy

## Goal

The state management strategy is designed to **clearly separate server state and client state**,
ensuring predictable data flow, scalability, and maintainability in a production environment.

It aims to:

- Minimize unnecessary global state
- Leverage server state as the primary source of truth
- Reduce complexity in state synchronization
- Improve performance and developer experience

---

## Core Principle

```txt
Prefer server state over client state whenever possible
```

---

## State Classification

The system divides state into three main categories:

1. **Server State**
2. **Client State**
3. **UI Persistence State (Page Local Session)**

---

## 1. Server State

### Definition

Data that originates from the backend and must stay in sync with it.

### Examples

- Ticket list
- Ticket detail
- Category data
- User profile data
- Local demo mutable ticket/settings state (server-side in-memory modules)

---

### Solution

Managed using **React Query (@tanstack/react-query v5)**

---

### Why React Query?

- Built-in caching
- Background refetching
- Stale data management
- Request deduplication
- Error and loading state handling

---

### Example

```ts
export const useFetchTickets = (params) => {
  return useQuery({
    queryKey: ["tickets", params],
    queryFn: () => api.getTickets(params),
  });
};
```

---

### Key Strategy

- Server state is **never duplicated into client state**
- Always accessed via React Query hooks

---

## 2. Client State

### Definition

State that exists only on the client and does not require backend synchronization.

---

### Examples

- Dialog open/close state
- UI toggles
- Temporary form state
- Selected filters (local only)

---

### Solution

Managed using **Zustand** or local component state.

Use Zustand only when the state must be shared across multiple components or feature boundaries.

---

### Why Zustand?

- Minimal boilerplate
- Simple API
- No provider required
- Fine-grained reactivity
- Easy to scope state

---

### Example

```ts
const useDialogStore = create((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));
```

---

## 3. UI Persistence State (Page Local Session)

### Definition

State used to persist page-level UI behavior across reloads or navigation
without involving backend synchronization.

This is not server state, and it is not the same as global client state.

It acts as a **page local session** that helps the UI restore user context.

---

### Examples

- Ticket search criteria
- Table column visibility
- View mode (`grid` / `list`)
- Expanded or collapsed sections
- Filter panel state
- Last-used page options

---

### Purpose

- Restore meaningful UI context after reload
- Reduce repetitive user actions
- Preserve continuity within the same browsing workflow

---

### Solution

Managed through a layered persistence approach:

1. **sessionStorage** for current temporary page-local persistence
2. **URL** when state must be shareable or bookmarkable
3. **Database** for long-term user preferences when necessary

The current Service Desk ticket search and Insights pages use
`sessionStorage`; they do not synchronize filters, sorting, or pagination to
the URL.

---

## State Boundary Rules

### Rule 1

```txt
Do not store server data in client state
```

---

### Rule 2

```txt
Do not use global state for local UI concerns
```

---

### Rule 3

```txt
Keep state as close as possible to where it is used
```

---

### Rule 4

```txt
Persist page-level UI state separately from auth/runtime stores
```

---

## Server State Strategy

### Query Key Design

- Structured and predictable keys

```ts
ticketQueryKeys.search(request);
ticketQueryKeys.detail(id);
```

---

### Query Option Profiles

The shared query layer provides two reusable profiles:

- `STATIC_QUERY_OPTIONS`: five-minute `staleTime`, with focus and reconnect
  refetch disabled
- `DYNAMIC_QUERY_OPTIONS`: zero `staleTime`, with focus refetch enabled

Current Service Desk queries, including settings and category queries, use the
runtime-aware `getServiceDeskQueryOptions` profile:

- REMOTE uses `DYNAMIC_QUERY_OPTIONS`
- LOCAL keeps dynamic freshness, retains inactive cache for 24 hours, disables
  focus/reconnect refetch, and always refetches on mount

Settings mutations invalidate their affected query families. Service Desk
reference data is not currently modeled with an infinite `staleTime`.

In LOCAL demo mode, React Query cache reset alone is not enough because
mutations can change server-side in-memory state. Demo reset should be
orchestrated through the reset endpoint:

```txt
/api/demo/service-desk/reset
```

LOCAL ticket draft recovery is a separate browser-local exception: the feature
draft repository owns its `localStorage` record, while React Query only caches
and orchestrates access to it.

---

## Mutation Strategy

Mutations are handled through React Query.

### Principles

- Mutations trigger refetch or cache update
- UI should react immediately to mutation results

---

### Example

```ts
const mutation = useMutation({
  mutationFn: createTicket,
  onSuccess: () => {
    queryClient.invalidateQueries(["tickets"]);
  },
});
```

---

## Cache Strategy

### Goals

- Reduce unnecessary network requests
- Keep UI responsive

---

### Techniques

- Query invalidation
- Optimistic updates (optional)
- Background refetching

---

## Client State Strategy

### Local vs Global

| State Type         | Location                            |
| ------------------ | ----------------------------------- |
| Component-specific | `useState`                          |
| Feature-wide       | Zustand                             |
| App-wide           | Zustand (limited)                   |
| Page local session | Feature/page hook + `sessionStorage`; URL when explicitly implemented |

---

### Principle

```txt
Only globalize state when necessary
```

---

## Form State

Form state is managed separately using **react-hook-form**.

### Reason

- Optimized for form handling
- Built-in validation support
- Better performance for large forms

---

### Rule

- Form state should not be stored in Zustand
- Persist form-related page context only when UX continuity requires it

---

## URL State

URL state is appropriate when page state must participate in navigation,
sharing, or bookmarking.

### Examples

- Filters
- Pagination
- Sorting

### Principle

```txt
If state affects navigation -> store in URL
```

This is an addressability rule, not a claim that every current search page has
implemented URL synchronization. The current Service Desk ticket search and
Insights pages persist these values in `sessionStorage` instead.

---

## Page Local Session Strategy

Page local session is the persistence layer for non-server, page-oriented UI behavior.

### Storage Layers

#### 1. sessionStorage (Current Service Desk Implementation)

Used for temporary UI persistence within the current browser tab.

Current examples:

- ticket search criteria
- ticket list page, scope, sort field, and sort order
- Insights search criteria and scope

Characteristics:

- scoped to the browser tab
- cleared when the tab closes
- restored through page-level hooks after hydration

---

#### 2. URL (When Addressability Is Required)

Used when navigation, sharing, or bookmarking requires the state to be visible
in the route.

Examples:

- shareable filters
- sortable or pageable views whose URL is part of the public page contract

Characteristics:

- survives copying or bookmarking the URL
- participates in browser navigation
- requires explicit route/search-parameter synchronization

The current Service Desk search pages have not implemented this layer.

---

#### 3. Database (Optional)

Used for long-term user preferences.

Examples:

- Saved filter presets
- Dashboard layout settings

Characteristics:

- Persists across devices
- Tied to the user account

---

### Implementation Pattern

```txt
page / component
-> feature hook
-> shared hook (useSessionStorageState)
-> storage utility (sessionStorage)
```

---

### Example

```ts
useSessionStorageState<T>();
```

```ts
const { page, sort, changePage, changeSort } = useServiceDeskSearchState();
```

---

### Design Rules

- Storage logic must not leak into UI components
- Components should consume meaningful hooks, not storage APIs
- Even if multiple systems use `sessionStorage`, they must remain logically separated

| Purpose          | Owner                    |
| ---------------- | ------------------------ |
| Auth session     | `authSessionStore`       |
| UI persistence   | `useSessionStorageState` |
| Addressable navigation state | URL when the page implements it |

Prefer:

```ts
useServiceDeskSearchState();
```

Over:

```ts
readSessionStorage("some_key");
```

---

### Resilience

UI persistence must be fault-tolerant.

- Fallback to default on parse error
- Handle version mismatch
- Allow migration when structure changes

---

## Derived State

Derived state should not be stored explicitly.

### Example

```ts
const isOwner = ticket.requesterId === currentUser.id;
```

---

### Principle

```txt
Derive instead of store
```

---

## Anti-Patterns Avoided

### 1. Global State Overuse

- Avoid storing everything in Zustand

---

### 2. Server State Duplication

- Avoid copying API data into local state

---

### 3. Prop Drilling Abuse

- Avoid passing state unnecessarily through many layers

---

### 4. Uncontrolled Side Effects

- Avoid fetching data inside components without abstraction

---

### 5. Mixing Auth and UI State

- Avoid coupling page settings to `authSessionStore`

Auth session and UI persistence must remain separate.

---

### 6. Direct Storage Access in Components

- Avoid calling `readSessionStorage()` directly inside page components

---

### 7. Treating UI State as Server State

- Avoid managing filters via React Query cache

---

## Trade-offs

### Pros

- Clear separation of concerns
- Predictable data flow
- Reduced bugs from state sync issues
- Scalable architecture
- Improved UI continuity across reloads

---

### Cons

- Requires understanding of multiple tools
- Initial learning curve
- Slightly more setup complexity
- Persistence rules require discipline

---

## Alternatives Considered

### 1. Redux

- Powerful and scalable
- Too much boilerplate for this use case

---

### 2. Context API Only

- Built-in
- Poor performance for frequent updates

---

### 3. Single State Store (All in Zustand)

- Simpler mental model
- Hard to sync with server data
- Weak separation between runtime state and page local session

---

## Design Principles Alignment

This strategy aligns with:

- Separation of concerns
- Single source of truth
- Minimal global state
- Performance optimization
- UX continuity for page workflows

---

## Summary

The state management strategy separates **server state**, **client state**, and
**UI persistence state (page local session)** clearly.

It uses:

- React Query for backend synchronization
- Zustand or local state for client runtime state
- `sessionStorage` for current page-local persistence and URL state when a page
  explicitly requires addressability

This results in a scalable, maintainable, and production-aligned state model.
It does not imply that deferred production infrastructure is complete.
