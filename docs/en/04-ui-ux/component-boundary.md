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

- Data fetching
- State management
- Business logic orchestration

---

### Characteristics

- Uses hooks (React Query, Zustand)
- Knows about API and domain logic
- Passes data down via props

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
- No business logic

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

- No data fetching inside presentational components
- No API calls in deeply nested UI components

---

## Feature-Level Boundary

The boundary is enforced at the **feature level**.

---

### Rule

```id="feature-boundary"
Feature entry components handle data fetching
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

- Always inside **container components or feature hooks**

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

### Good Example

```tsx id="good-props"
<TicketItem title={ticket.title} status={ticket.status} />
```

---

### Bad Example

```tsx id="bad-props"
<TicketItem ticket={ticket} />
```

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
State should live in the highest component that needs it
```

---

### Examples

- Dialog open state → component or Zustand
- Filter state → URL or container
- Form state → react-hook-form

---

## Interaction Handling

### Principle

```id="interaction-principle"
UI handles interaction, container handles logic
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

- Highly reusable
- Can be shared across features

---

### Container Components

- Feature-specific
- Not intended for reuse

---

## Dependency Rules

### Allowed

- Presentational → Presentational
- Container → Presentational

---

### Not Allowed

- Presentational → Container
- Cross-feature direct dependency

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

## Summary

The component boundary strategy enforces a clear distinction between **data-aware container components**
and **pure UI presentational components**, enabling a scalable and maintainable frontend architecture.
