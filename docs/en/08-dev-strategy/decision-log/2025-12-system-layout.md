# System Layout (2025-12)

## Context

As the Service Desk system evolved, UI complexity increased due to:

- Multiple interaction patterns (dialog, drawer, full page)
- Growing feature scope (ticket detail, forms, comments, history)
- The need for a consistent navigation and layout structure

Additionally, the system required:

- Clear separation between **primary workflows** and **secondary interactions**
- A stable **home layout foundation** for all features
- Predictable and scalable UI behavior

---

## Problem

### 1. Interaction Complexity

- Using dialogs for complex flows caused:
  - state management difficulty
  - poor navigation experience
- Nested overlays (drawer over drawer, dialog over dialog) increased complexity

---

### 2. Layout Inconsistency

- No clear definition of:
  - global layout (sidebar, navbar, footer)
  - feature-level rendering boundaries

---

### 3. Navigation vs Interaction Ambiguity

- Some views behaved like pages:
  - long-lived
  - navigable
- But they were implemented as dialogs or drawers

This resulted in inconsistent UX.

---

## Decision

### 1. Define a System-Level Layout

The application adopts a **home layout structure**:

```txt
App Layout
-> Sidebar (navigation)
-> Navbar (context / actions)
-> Main Content (page)
-> Footer (optional)
```

#### Characteristics

- Layout is applied at the protected route level
- All features are rendered inside this structure
- Sidebar reflects role-based rendering
- Layout is impersonation-aware

#### Why

- Provides a consistent navigation experience
- Establishes a stable UI foundation
- Enables role-aware UI (menu changes per user)
- Supports scalable feature expansion

---

### 2. Interaction Strategy: Page vs Drawer vs Dialog

#### Core Principle

```txt
Page -> primary workflow
Drawer -> secondary interaction
Dialog -> atomic action
```

#### Page

Used for:

- Core workflows
- Complex forms
- Long-lived interactions

Example:

```txt
/service-desk/[ticketId]
```

#### Drawer

Used for:

- Supporting interactions
- Contextual operations

Examples:

- Comment panel
- History view
- Sub-actions within the detail page

#### Dialog

Used for:

- Short-lived actions
- Confirmation flows
- Simple forms

Examples:

- Create ticket
- Confirm actions
- Small input forms

---

### 3. Key Decision: Ticket Detail = Page

#### Decision

Ticket detail is implemented as a full page, not a dialog or drawer.

#### Why

##### 1. Complexity Control

- Avoid nested overlays
- Simplify state management

##### 2. Navigation Clarity

- Each ticket has its own URL
- Supports deep linking

##### 3. UX Consistency

- Treated as a primary workflow
- Not treated as a temporary interaction

---

### 4. Layout + Interaction Integration

#### Combined Model

```txt
Home Layout (persistent)
-> Page (primary workflow)
-> Drawer (secondary interaction)
-> Dialog (atomic action)
```

#### Example Flow

```txt
Ticket List Page
-> Navigate to Ticket Detail Page
-> Open Comment Drawer
-> Open Confirm Dialog
```

#### Result

- Clear hierarchy of interactions
- No ambiguity between navigation and UI state
- Predictable user experience

---

### 5. Role-Aware Layout Behavior

The layout dynamically adapts based on user context.

#### Examples

- Sidebar menu changes per role
- Permissions affect visible features
- Impersonation changes the current-user UI context

#### Integration

- Uses session + impersonation context
- UI always reflects the current user

---

### 6. Impersonation Awareness

The layout is designed to support impersonation.

#### Behavior

- UI reflects the current user immediately
- Sidebar and navigation update dynamically
- Global indicator shows impersonation state

#### Purpose

- Prevent confusion
- Enable safe testing
- Maintain transparency

---

## Trade-offs

### Pros

- Clear UI hierarchy
- Scalable interaction model
- Consistent navigation
- Reduced complexity from nested overlays
- Strong alignment with domain workflows

---

### Cons

- Requires discipline in choosing UI patterns
- Requires more routing setup with a page-based approach
- Slightly heavier navigation compared to modal-first UX

---

## Alternatives Considered

### 1. Dialog-Driven UI

- Faster interactions
- Hard to scale
- Poor navigation clarity

---

### 2. Drawer-Only Detail View

- Lightweight UI
- Not suitable for complex workflows
- Difficult state management

---

### 3. Modal Routing

- Advanced UX patterns
- High complexity
- Difficult to maintain

---

## Impact

This decision defines:

- Future UI structure
- Navigation patterns
- Feature integration approach

It affects:

- Routing strategy
- Component boundary decisions
- State management
- UX consistency

---

## Summary

The system layout is defined by:

- A persistent home layout (sidebar + navbar)
- A page-based primary workflow
- A drawer-based secondary interaction model
- A dialog-based atomic action model

This creates a UI architecture that is:

- Predictable
- Scalable
- Role-aware
- Aligned with domain workflows

It ensures that the system behaves not as a collection of screens,
but as a coherent and structured application interface.
