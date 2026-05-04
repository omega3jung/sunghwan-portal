# Ticket Form Design

## Goal

The ticket form is designed to handle **complex, structured user input**
in a scalable and user-friendly way.

It aims to:

- Simplify ticket creation for users
- Support complex domain logic (category, SLA, priority, etc.)
- Provide a guided input experience
- Maintain strong type safety and validation

---

## Core Concept

```id="ticket-form-concept"
Complex input should be guided, not overwhelming
```

---

## Form Type Strategy

The ticket form supports multiple modes:

```ts id="form-type"
type Mode = "create" | "update" | "view";
```

---

### Rationale

- `create` → new ticket submission
- `update` → editing existing ticket
- `view` → read-only display

---

### Decision

Even though create and update share fields:

- They are **logically separated**
- Different API behavior (POST vs PUT)
- Different UX expectations

---

## Multi-Step Form Design

### Why Multi-Step?

Ticket creation involves:

- Category selection
- Contextual fields
- Detailed description
- Attachments

👉 A single form would be overwhelming.

---

### Structure

```txt id="steps"
Step 1 → Category Selection
Step 2 → Basic Information
Step 3 → Details & Attachments
Step 4 → Review & Submit
```

---

### Benefits

- Reduces cognitive load
- Guides users through input
- Enables contextual validation

---

## Step Navigation Strategy

- Controlled navigation (next / previous)
- Prevent moving forward if invalid
- Final submission only at last step

---

### State Handling

- Single `react-hook-form` instance
- Separate `step` state

---

## Category-Driven Form

### Core Idea

```id="category-driven"
Form behavior depends on selected category
```

---

### Effects

- Default priority
- Default risk level
- SLA calculation
- Available subcategories

---

### Strategy

- Category is selected early (Step 1)
- Subsequent steps adapt based on category

---

## SLA / Priority / Risk Integration

### Background

The system uses:

- Risk Level (low → critical)
- Priority (low → urgent)
- SLA (calculated per combination)

---

### Form Behavior

- Default values applied from category
- User can override if allowed
- SLA is calculated dynamically

---

### Benefit

- Aligns user input with business rules
- Reduces incorrect configurations

---

## Field Design Strategy

### Rule

```id="field-design"
Fields must be predictable, reusable, and typed
```

---

### Field Types

- Text input (title, description)
- Select (category, priority)
- Date (due date)
- File upload (attachments)

---

## Attachment Handling

### Strategy

- Managed via `useWatch`
- Stored as `File[]`

---

### Implementation Note

- Avoid incorrect `defaultValue` typing
- Use explicit casting when necessary

---

## Validation Strategy

### Approach

- Schema-based validation (Zod)
- Step-level validation + final validation

---

### Example

- Step 1 → category required
- Step 2 → title required
- Step 3 → optional fields
- Final → full validation

---

## Draft Strategy (Considered)

### Problem

Users may not complete the form in one session.

---

### Options Considered

1. Local draft (client storage)
2. Server draft (temporary ticket)
3. No draft support

---

### Current Decision

- Not implemented yet
- Deferred to avoid premature complexity

---

### Rationale

- Requires additional API and state handling
- Not critical for MVP

---

## Dialog Integration

The ticket form is implemented inside a dialog.

---

### Pattern

- Controlled open state
- Close after successful submission
- Trigger can be customized

---

## Submission Flow

### Process

```txt id="submission"
Validate → Transform → Mutate → Close Dialog → Refetch List
```

---

### Implementation

- Uses React Query mutation
- Invalidates ticket list on success

---

## Error Handling

### Types

1. Validation errors (field-level)
2. API errors (form-level)

---

### UX

- Inline messages for validation
- Toast for API errors

---

## Reset Strategy

### When

- After successful submission
- When dialog closes

---

### Implementation

```ts id="reset"
form.reset();
```

---

## Reusability Strategy

### Shared Logic

- Form structure
- Validation schema
- Field components

---

### Feature-Specific Logic

- Category rules
- SLA calculation
- Ticket-specific fields

---

## Stepper Abstraction (Considered)

### Idea

Create a reusable stepper dialog component.

---

### Decision

- Not implemented yet

---

### Rationale

- Content structure varies per feature
- Would require excessive props
- Considered premature abstraction

---

## UX Considerations

### 1. Progressive Disclosure

- Show only necessary inputs per step

---

### 2. Clear Feedback

- Validation messages
- Step progress indicator

---

### 3. Minimal Friction

- Defaults applied automatically
- Reduced manual input

---

### 4. Consistency

- Same structure across create/update

---

## Anti-Patterns Avoided

### 1. Single Large Form

- ❌ Overwhelming UX

---

### 2. Over-Abstraction

- ❌ Generic stepper too early

---

### 3. Duplicate Forms

- ❌ Separate create/update implementations

---

### 4. Business Logic in UI

- ❌ SLA calculation inside components

---

## Trade-offs

### Pros

- Guided user experience
- Strong alignment with domain logic
- Scalable form structure
- High type safety

---

### Cons

- More complex implementation
- Step management overhead
- Requires careful validation design

---

## Design Principles Alignment

This design aligns with:

- User-centered design
- Domain-driven design
- Progressive disclosure
- Separation of concerns

---

## Summary

The ticket form is designed as a **guided, multi-step input system**,
leveraging category-driven logic and strong validation to ensure
a balance between usability and business rule enforcement.
