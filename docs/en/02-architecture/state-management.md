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

```id="core-principle"
Prefer server state over client state whenever possible
```

---

## State Classification

The system divides state into two main categories:

1. **Server State**
2. **Client State**

---

## 1. Server State

### Definition

Data that originates from the backend and must stay in sync with it.

### Examples

- Ticket list
- Ticket detail
- Category data
- User data

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

```ts id="server-state-example"
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

Managed using **Zustand**

---

### Why Zustand?

- Minimal boilerplate
- Simple API
- No provider required
- Fine-grained reactivity
- Easy to scope state

---

### Example

```ts id="client-state-example"
const useDialogStore = create((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));
```

---

## State Boundary Rules

### Rule 1

```id="rule-1"
Do not store server data in client state
```

---

### Rule 2

```id="rule-2"
Do not use global state for local UI concerns
```

---

### Rule 3

```id="rule-3"
Keep state as close as possible to where it is used
```

---

## Server State Strategy

### Query Key Design

- Structured and predictable keys

```ts id="query-key"
["tickets", params][("ticket", id)];
```

---

### Query Types

#### Static Data

- Rarely changes (e.g., category)

```ts id="static-query"
staleTime: Infinity;
```

---

#### Dynamic Data

- Frequently updated (e.g., ticket list)

```ts id="dynamic-query"
refetchOnWindowFocus: true;
staleTime: 0;
```

---

## Mutation Strategy

Mutations are handled through React Query.

### Principles

- Mutations trigger refetch or cache update
- UI should react immediately to mutation results

---

### Example

```ts id="mutation-example"
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

| State Type         | Location          |
| ------------------ | ----------------- |
| Component-specific | useState          |
| Feature-wide       | Zustand           |
| App-wide           | Zustand (limited) |

---

### Principle

```id="client-principle"
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

---

## URL State

Some state is stored in the URL.

### Examples

- Filters
- Pagination
- Sorting

---

### Principle

```id="url-state"
If state affects navigation → store in URL
```

---

## Derived State

Derived state should not be stored explicitly.

### Example

```ts id="derived-state"
const isOwner = ticket.requesterId === currentUser.id;
```

---

### Principle

```id="derived-rule"
Derive instead of store
```

---

## Anti-Patterns Avoided

### 1. Global State Overuse

- ❌ Storing everything in Zustand

---

### 2. Server State Duplication

- ❌ Copying API data into local state

---

### 3. Prop Drilling Abuse

- ❌ Passing state unnecessarily through many layers

---

### 4. Uncontrolled Side Effects

- ❌ Fetching data inside components without abstraction

---

## Trade-offs

### Pros

- Clear separation of concerns
- Predictable data flow
- Reduced bugs from state sync issues
- Scalable architecture

---

### Cons

- Requires understanding of multiple tools
- Initial learning curve
- Slightly more setup complexity

---

## Alternatives Considered

### 1. Redux

- ✔ Powerful and scalable
- ❌ Too much boilerplate for this use case

---

### 2. Context API Only

- ✔ Built-in
- ❌ Poor performance for frequent updates

---

### 3. Single State Store (All in Zustand)

- ✔ Simpler mental model
- ❌ Hard to sync with server data

---

## Design Principles Alignment

This strategy aligns with:

- Separation of concerns
- Single source of truth
- Minimal global state
- Performance optimization

---

## Summary

The state management strategy separates **server state and client state clearly**,
leveraging React Query for backend synchronization and Zustand for local UI state,
resulting in a scalable, maintainable, and production-ready architecture.
