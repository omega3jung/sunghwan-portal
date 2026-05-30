# Routing Strategy

## Goal

The routing strategy is designed to provide a **clear, scalable, and UI-consistent navigation structure**
using the Next.js 14 App Router.

It aims to:

- Reflect domain structure in URLs
- Support both page-based and overlay-based UI patterns
- Maintain predictable navigation behavior
- Enable deep linking for all critical views
- Keep UI independent from LOCAL/REMOTE runtime branching

---

## Core Concept

Routing is designed around **resource-based URLs** combined with
**UI-driven rendering strategies (page vs overlay)**.

```id="routing-concept"
Route = Resource + UI Representation
```

---

## Base Route Structure

```bash id="base-routes"
/service-desk
/service-desk/[ticketId]
```

---

## Route Responsibilities

### 1. `/service-desk`

- Displays ticket list
- Supports filtering and searching
- Entry point for ticket operations

---

### 2. `/service-desk/[ticketId]`

- Displays ticket detail view
- Supports editing and reviewing ticket
- Acts as the **single source of truth for ticket detail**

---

## Why Page-Based Detail Instead of Modal Routing?

### Decision

Ticket detail is implemented as a **full page**, not a modal route.

---

### Reasoning

#### 1. Complexity Control

- Nested modals (drawer over drawer) increase UI complexity
- Difficult to manage state and navigation

---

#### 2. Clear Navigation

- Each ticket has its own URL
- Supports direct access and bookmarking

---

#### 3. Consistent UX

- Detail view is treated as a primary workflow, not a temporary overlay

---

## UI Strategy: Page vs Drawer

### Principle

```id="ui-principle"
Use Drawer for transient interactions
Use Page for primary workflows
```

---

### Drawer Usage

Used for:

- Quick actions
- Secondary interactions
- Non-critical workflows

---

### Page Usage

Used for:

- Core workflows (ticket detail)
- Complex forms
- Long-lived interactions

---

## Detail View Strategy

### Route

```bash id="detail-route"
/service-desk/[ticketId]
```

---

### UI Behavior

- Main content displays ticket information
- Drawer is used for **sub-actions only**

---

### Example

- Ticket detail page (main)
  - Comment drawer
  - History drawer

---

## Deep Linking

All critical states are accessible via URL.

### Benefits

- Direct navigation to specific tickets
- Shareable links
- Better debugging and support

---

## Dynamic Routing

### Pattern

```bash id="dynamic-route"
/service-desk/[ticketId]
```

---

### ID Strategy

- Uses **UUID (recommended)** instead of incremental IDs

---

### Rationale

- Prevents predictable ID access
- Improves security
- Avoids collision issues in distributed systems

---

## Route Handler Orchestration

Next.js route handlers are used as orchestration boundaries:

```txt
route.ts
-> authenticate / check session
-> decide LOCAL or REMOTE
-> call local handler or remote proxy
```

This keeps runtime branching out of UI components and keeps the remote path
extension-ready.

---

## Navigation Flow

### Example Flow

```id="nav-flow"
List → Click Ticket → Navigate to /[ticketId]
→ Perform actions → Return to list
```

---

### Back Navigation

- Uses browser history
- Preserves filter/search state (via query params or state)

---

## Query Parameters

Used for:

- Filters
- Sorting
- Pagination

---

### Example

```id="query-example"
/service-desk?status=open&assignee=me&page=2
```

---

## State Preservation Strategy

### Options

1. URL-based state (preferred)
2. Client state (fallback)

---

### Principle

```id="state-routing"
If state affects navigation → store in URL
```

---

## Parallel Routes (Optional Future)

Next.js App Router supports parallel routes.

### Potential Use Cases

- Split view (list + detail)
- Dashboard panels

---

### Current Decision

- Not used to avoid complexity
- May be introduced later if needed

---

## Error Handling

### Route-Level Errors

- 404: Ticket not found
- 403: Access denied

---

### Strategy

- Use Next.js error boundaries
- Provide user-friendly fallback UI

---

## Loading Strategy

### Route-Level Loading

- Skeleton UI for page transitions

---

### Data-Level Loading

- Managed via React Query

---

## SEO Consideration

Although not primary focus:

- Resource-based URLs improve clarity
- Enables potential indexing if needed

---

## Trade-offs

### Pros

- Clear and predictable navigation
- Strong alignment with domain model
- Supports deep linking
- Reduced UI complexity

---

### Cons

- Full page navigation may feel heavier than modals
- Requires state preservation handling
- Slightly more routing setup

---

## Alternatives Considered

### 1. Modal-Based Routing

- ✔ Fast interaction
- ❌ Poor deep linking
- ❌ Complex nested UI

---

### 2. Drawer-Only Detail View

- ✔ Lightweight UI
- ❌ Hard to scale
- ❌ Not suitable for complex workflows

---

### 3. Parallel Routes for Detail

- ✔ Advanced layout possibilities
- ❌ Increased complexity
- ❌ Harder to maintain

---

## Design Principles Alignment

This routing strategy aligns with:

- Domain-driven design
- Clear separation of concerns
- Predictable navigation
- Scalable UI architecture

---

## Summary

The routing strategy combines **resource-based URLs with UI-driven rendering decisions**,
ensuring that navigation remains clear, scalable, and aligned with the system's core workflows.
