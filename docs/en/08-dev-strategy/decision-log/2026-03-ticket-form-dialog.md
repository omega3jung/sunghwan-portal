# Ticket Form Dialog Decisions (2026-03)

## Context

The Ticket Form Dialog is one of the most critical components in the Service Desk system.

It is responsible for:

- Creating tickets
- Updating tickets
- Handling structured user input
- Integrating domain logic (category, SLA, priority, etc.)

---

## 1. Dialog vs Page

### Decision

Use **Dialog for ticket creation**, and **Page for ticket detail/edit**.

---

### Reason

- Ticket creation is a short-lived interaction
- Ticket detail/edit is a long-lived workflow
- Avoid nested drawer/dialog complexity

---

### Trade-off

- Dialog is faster for input
- Page is more scalable for complex interactions

---

## 2. Controlled Dialog State

### Decision

Use **controlled open state** (`open`, `setOpen`).

---

### Reason

- Close dialog after successful submission
- Allow programmatic control
- Improve integration with mutation flow

---

### Example

- Submit → success → `setOpen(false)`

---

## 3. Trigger Strategy

### Decision

Allow dialog trigger to be **customizable via props**.

---

### Pattern

- If `trigger` is provided → use it
- Otherwise → fallback to default button

---

### Reason

- Improves reusability
- Allows flexible integration across UI

---

## 4. Multi-Step Form (Stepper)

### Decision

Use **multi-step form inside dialog**

---

### Reason

- Ticket form is complex
- Single-page form would be overwhelming
- Step-based input improves UX

---

### Structure

1. Category selection
2. Basic information
3. Details / attachments
4. Review & submit

---

## 5. Stepper Abstraction

### Decision

Do **not** abstract stepper into a reusable component yet

---

### Reason

- Only one use case exists
- Content structure varies per step
- Abstraction would require excessive props
- Risk of premature abstraction

---

### Future Consideration

- Revisit if multiple step-based dialogs are introduced

---

## 6. Single Form Instance Across Steps

### Decision

Use **one react-hook-form instance across all steps**

---

### Reason

- Maintain a single source of truth
- Avoid data fragmentation
- Simplify validation and submission

---

## 7. Validation Strategy

### Decision

Use **step-level validation + final validation**

---

### Reason

- Prevent user from progressing with invalid data
- Reduce error accumulation at submission step
- Improve UX clarity

---

## 8. Category-Driven Behavior

### Decision

Make form behavior dependent on selected category

---

### Effects

- Default priority
- Default risk level
- SLA calculation
- Subcategory availability

---

### Reason

- Align input with domain rules
- Reduce incorrect configurations
- Improve usability

---

## 9. SLA / Priority / Risk Handling

### Decision

- Apply defaults from category
- Allow override when needed
- Calculate SLA dynamically

---

### Reason

- Reflect real-world Service Desk behavior
- Support flexible business rules

---

## 10. useWatch Usage for File Handling

### Decision

Use `useWatch` to observe file inputs

---

### Issue Encountered

- Type mismatch with `defaultValue`

---

### Solution

- Remove incorrect `defaultValue`
- Use type assertion when necessary

---

### Outcome

- Stable typing
- Clean integration with react-hook-form

---

## 11. Draft Feature (Considered)

### Options

1. Local draft (client storage)
2. Server draft
3. No draft

---

### Decision

Not implemented

---

### Reason

- Requires additional API and state complexity
- Not essential for MVP
- Deferred to future iteration

---

## 12. Dialog Data Fetching

### Decision

Avoid data fetching inside dialog unless necessary

---

### Strategy

- Pass required data via props
- Fetch at feature/container level

---

### Reason

- Prevent duplicate requests
- Maintain clean component boundaries

---

## 13. Integration with Dashboard

### Decision

Develop dashboard **after form implementation**

---

### Reason

- Dashboard depends on ticket data
- Requires realistic dataset
- Ensures meaningful visualization

---

## 14. Development Order

### Sequence

1. Ticket Form
2. Ticket List
3. Dashboard

---

### Reason

- Form defines domain structure
- List validates data flow
- Dashboard visualizes existing data

---

## Summary

The Ticket Form Dialog was developed with a focus on:

- Guided user input (multi-step form)
- Clear separation of concerns (dialog vs page)
- Avoiding premature abstraction
- Strong alignment with domain logic
- Practical, iterative decision-making

This approach ensured that the system remained **usable, flexible, and scalable**,  
while avoiding unnecessary complexity during early development.
