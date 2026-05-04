# Service Desk Decision Log (2026-03)

## Context

This document captures key architectural and implementation decisions made during March 2026
while developing the Service Desk module.

Unlike finalized design documents in `docs/`, this log focuses on:

- practical trade-offs encountered during implementation
- alignment between real code and design principles
- decisions made to improve clarity, scalability, and realism of the system

---

## 1. Query Strategy: Static vs Dynamic Data Separation

### Context

Service Desk data naturally falls into two categories:

- **Static data**
  - Category
  - Department
  - Job field
- **Dynamic data**
  - Ticket list
  - Ticket detail

---

### Problem

Using a single query strategy for all data leads to:

- unnecessary refetching for static data
- stale UI for dynamic ticket data

---

### Decision

Separate query strategies:

```txt
Static Data  -> STATIC_QUERY_OPTIONS
Dynamic Data -> DYNAMIC_QUERY_OPTIONS
```

### Implementation

```ts
// Static
staleTime: Infinity;

// Dynamic
staleTime: 0;
refetchOnWindowFocus: true;
```

### Notes

- `keepPreviousData` is optional and mainly useful for pagination UX
- for tickets, freshness is more important than UI continuity

### Impact

- Static data is efficiently cached
- Ticket data stays up to date with minimal staleness

---

## 2. Form Mode Design: `create` / `update` / `view`

### Context

The ticket form uses the same input fields for both create and update operations.

---

### Problem

Using:

```ts
type?: "create" | "edit";
```

creates ambiguity:

- `edit` may be used even when the actual lifecycle is not well defined
- the name does not reflect real behavior differences

---

### Decision

Define explicit modes:

```ts
type FormMode = "create" | "update" | "view";
```

### Rationale

- `create` and `update` differ in API semantics (`POST` vs `PUT`)
- `view` represents a read-only UI state

### Insight

```txt
Even if the fields are identical, modes should reflect behavior, not structure.
```

### Impact

- Clearer submission logic
- Easier permission handling for read-only mode
- Better alignment with backend semantics

---

## 3. Component Boundary: Data Fetching Responsibility

### Context

The previous Page Router system colocated:

- UI
- data fetching
- business logic

inside page modules.

The new structure follows a feature-based architecture.

---

### Problem

Responsibility was unclear:

- should components receive data only via props?
- or should they fetch internally?

---

### Decision

Define clear boundaries:

```txt
Feature-level components -> handle data fetching
Child components         -> receive props (presentational)
Page layer               -> orchestration only
```

### Example

```tsx
<TicketList>
  <TicketItem />
</TicketList>
```

- `TicketList` fetches data
- `TicketItem` remains presentational

### Rationale

- Keeps data logic close to domain features
- Improves reusability of child components
- Prevents unnecessary prop drilling

### Impact

- Better separation of concerns
- Scalable component structure
- Consistent data access patterns

---

## 4. Routing Strategy: Ticket Detail as a Page

### Context

Two main approaches existed for ticket detail:

- drawer or modal-based UI
- full page route

---

### Problem

A drawer-based approach introduces:

- nested UI complexity
- harder state management
- lack of deep linking

---

### Decision

```txt
/service-desk/[ticketId] -> page-based detail view
Drawer                   -> secondary interactions only
```

### Rationale

- Ticket detail is a primary workflow
- It requires a stable URL for:
  - direct access
  - bookmarking
  - debugging

### Impact

- Simplified UI structure
- Better navigation consistency
- Improved scalability for complex interactions

---

## 5. i18n Strategy: Explicit Key Usage

### Context

A helper abstraction such as this was considered:

```ts
fieldLabel(name);
```

---

### Problem

- Adds unnecessary abstraction
- Reduces readability for reviewers
- Hides the actual translation keys

---

### Decision

Use explicit keys directly:

```ts
t(`field.${name}.label`, { ns: "common" });
```

### Rationale

- More readable in a portfolio context
- Easier for reviewers to understand
- Avoids premature abstraction

### Insight

```txt
In a portfolio, clarity is more valuable than abstraction.
```

### Impact

- Improved readability
- Better alignment with review and interview contexts

---

## 6. Ticket Data Freshness as a Priority

### Context

Ticket data is affected by:

- SLA
- assignment
- status changes
- approval state

---

### Decision

Always treat ticket queries as dynamic:

```ts
useQuery({
  ...DYNAMIC_QUERY_OPTIONS,
});
```

### Rationale

- Stale ticket data leads to incorrect UI state
- Service Desk systems require near real-time accuracy

### Impact

- More consistent and reliable UI state
- Better alignment with SLA-driven workflows

---

## 7. UI Responsibility: Page vs Drawer

### Context

The system needed a clear rule for when to use a page and when to use a drawer.

---

### Decision

```txt
Page   -> primary workflow
Drawer -> secondary interactions
```

### Examples

#### Page

- Ticket detail
- Main workflows

#### Drawer

- Comments
- History
- Quick actions

### Insight

```txt
A drawer is an interaction surface, not a workflow container.
```

### Impact

- Clear UI hierarchy
- Reduced complexity
- More predictable user experience

---

## Summary

The March decisions converge on a single principle:

```txt
Align implementation with real-world system behavior.
```

### Key Themes

- Separate static and dynamic data clearly
- Define component boundaries based on responsibility
- Treat routing as part of domain design
- Prefer clarity over abstraction in a portfolio context
- Keep ticket data fresh and reliable
- Distinguish primary workflows from secondary interactions

---

## Final Note

These decisions were not theoretical.
They emerged from:

- migrating a real-world system
- restructuring legacy patterns
- aligning implementation with documented architecture

As a result, they represent practical, production-aligned trade-offs
rather than idealized design.
