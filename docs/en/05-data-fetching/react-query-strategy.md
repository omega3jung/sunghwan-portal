# React Query Strategy

## Goal

The data fetching strategy is designed to **efficiently manage server state**,
ensuring consistency, performance, and scalability across the application.

It aims to:

- Provide a single source of truth for server data
- Reduce unnecessary network requests
- Improve user experience with caching and background updates
- Enable predictable data synchronization

---

## Core Principle

```id="rq-core"
Server state should be managed declaratively and cached intelligently
```

---

## Why React Query?

The system uses **@tanstack/react-query v5** for server state management.

---

### Key Benefits

- Automatic caching
- Background refetching
- Request deduplication
- Built-in loading and error states
- Query invalidation support

---

## Query Classification

All queries are categorized into two types:

1. **Static Queries**
2. **Dynamic Queries**

---

## 1. Static Queries

### Definition

Data that rarely changes.

---

### Examples

- Category list
- Department list
- Job field list
- Reference settings

---

### Strategy

```ts id="static-query"
staleTime: Infinity;
gcTime: Infinity;
refetchOnWindowFocus: false;
```

---

### Rationale

- Avoid unnecessary refetch
- Maximize cache reuse
- Improve performance

---

## 2. Dynamic Queries

### Definition

Data that changes frequently and must stay up-to-date.

---

### Examples

- Ticket list
- Ticket detail
- Draft
- Actions
- Histories
- Track time
- Local demo mutable state

---

### Strategy

```ts id="dynamic-query"
staleTime: 0;
refetchOnWindowFocus: true;
```

---

### Rationale

- Always fetch fresh data
- Ensure UI reflects latest state
- Support real-time-like behavior

In LOCAL demo mode, dynamic queries may reflect server-side in-memory mutations.
Therefore cache invalidation/reset must be coordinated with server reset behavior
(`/api/demo/service-desk/reset`) instead of assuming client cache reset alone is sufficient.

---

## Query Key Strategy

### Rule

```id="query-key-rule"
Query keys must be deterministic and structured
```

---

### Examples

```ts id="query-keys"
["tickets", params][("ticket", id)]["categories"];
```

---

### Benefits

- Precise cache control
- Targeted invalidation
- Avoid cache collision

---

## Query Co-location

### Rule

```id="co-location"
Queries should be defined within feature modules
```

---

### Structure

```bash id="query-location"
feature/serviceDesk/api/
feature/serviceDesk/hooks/
```

---

### Benefit

- Encapsulated domain logic
- Improved maintainability

---

## Mutation Strategy

Mutations are handled using `useMutation`.

---

### Principles

- Trigger side effects (create/update/delete)
- Invalidate or update related queries

---

### Example

```ts id="mutation"
const mutation = useMutation({
  mutationFn: createTicket,
  onSuccess: () => {
    queryClient.invalidateQueries(["tickets"]);
  },
});
```

---

## Invalidation Strategy

### Rule

```id="invalidate-rule"
Invalidate only what is necessary
```

---

### Examples

- Create ticket → invalidate `["tickets"]`
- Update ticket → invalidate `["ticket", id]` and list

---

### Avoid

- ❌ Invalidating all queries globally

---

## Optimistic Updates (Optional)

Used for improving perceived performance.

---

### Example

```ts id="optimistic"
onMutate: async (newData) => {
  await queryClient.cancelQueries(["tickets"]);
  queryClient.setQueryData(["tickets"], (old) => [...old, newData]);
};
```

---

### Trade-off

| Pros                | Cons                  |
| ------------------- | --------------------- |
| Instant UI feedback | Complexity            |
| Better UX           | Risk of inconsistency |

---

## Pagination Strategy

### Approach

- Server-side pagination
- Query key includes pagination params

---

### Example

```ts id="pagination"
["tickets", { page, pageSize }];
```

---

### Option

```ts id="keep-prev"
keepPreviousData: true;
```

---

### Benefit

- Smooth pagination UX
- Prevents UI flicker

---

## Refetch Strategy

### When to Refetch

- Window focus (dynamic queries)
- After mutation
- Manual refresh

---

### When NOT to Refetch

- Static data
- Non-critical background data

---

## Error Handling

### Strategy

- Query-level error handling
- Global error boundary (optional)

---

### UX

- Show fallback UI
- Provide retry option

---

## Loading Strategy

### Types

1. Initial loading
2. Background refetching

---

### UX Pattern

- Skeleton for initial load
- Subtle indicator for background updates

---

## Cache Lifecycle

### Key Concepts

- `staleTime`: freshness duration
- `gcTime`: cache retention duration

---

### Strategy

| Query Type | staleTime | gcTime   |
| ---------- | --------- | -------- |
| Static     | Infinity  | Infinity |
| Dynamic    | 0         | Default  |

---

## Data Synchronization

### Principle

```id="sync-principle"
Do not manually sync server state into local state
```

---

### Reason

- Avoid duplication
- Prevent inconsistency

---

## Anti-Patterns Avoided

### 1. Storing API data in Zustand

- ❌ Breaks single source of truth

---

### 2. Over-fetching

- ❌ Fetching same data multiple times

---

### 3. Global Invalidations

- ❌ Performance degradation

---

### 4. Imperative Data Fetching

- ❌ Hard to maintain

---

## Trade-offs

### Pros

- Efficient data fetching
- Strong caching strategy
- Improved UX
- Scalable architecture

---

### Cons

- Requires understanding of cache behavior
- More configuration needed
- Debugging can be complex

---

## Alternatives Considered

### 1. Manual Fetching (useEffect)

- ✔ Simple
- ❌ No caching
- ❌ Hard to scale

---

### 2. SWR

- ✔ Lightweight
- ❌ Less control over complex cases

---

### 3. Redux for Server State

- ✔ Centralized
- ❌ Not optimized for async caching

---

## Design Principles Alignment

This strategy aligns with:

- Server state separation
- Performance optimization
- Predictable data flow
- Scalable architecture

---

## Summary

The React Query strategy provides a **robust and scalable approach to server state management**,
leveraging intelligent caching, precise invalidation, and query classification
to ensure both performance and consistency.
