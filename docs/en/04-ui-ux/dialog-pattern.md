# Dialog Pattern

## Goal

The dialog pattern is designed to provide a **consistent and scalable interaction model**
for handling user inputs and actions in a controlled UI environment.

It aims to:

- Standardize dialog usage across the system
- Separate transient interactions from primary workflows
- Improve user experience consistency
- Reduce UI complexity

---

## Core Principle

```txt
Use dialog for transient interactions, not primary workflows
```

---

## Dialog vs Page

### Rule

| Use Dialog | Use Page |
| ---------- | -------- |
| Quick actions | Core workflows |
| Short forms | Complex forms |
| Temporary interactions | Long-lived interactions |

---

### Example

- Create ticket -> Dialog
- Edit ticket (complex) -> Page
- View ticket detail -> Page

---

## Dialog Types

### 1. Form Dialog

Used for creating or editing data.

#### Example

- Ticket creation
- Quick edit

---

### 2. Confirmation Dialog

Used for destructive or critical actions.

#### Example

- Delete ticket
- Close ticket

---

### 3. Informational Dialog

Used to display non-editable content.

---

## TicketFormDialog Pattern

The system uses a **step-based dialog pattern** for ticket creation.

---

### Structure

```tsx
<Dialog>
  <DialogTrigger />
  <DialogContent>
    <Header />
    <StepContent />
    <Footer />
  </DialogContent>
</Dialog>
```

---

### Characteristics

- Multi-step flow
- Controlled navigation (`next` / `prev`)
- Final submission at the last step

---

## State Management

### Controlled State

Dialog open state is **controlled externally**.

```tsx
const [open, setOpen] = useState(false);
```

---

### Why Controlled?

- Allows closing after mutation
- Enables programmatic control
- Improves integration with business logic

---

## Trigger Strategy

### Rule

```txt
DialogTrigger should be optional and replaceable
```

---

### Pattern

- Accept `trigger` as a prop
- Fallback to a default button

---

### Example

```tsx
<Dialog trigger={trigger ?? <DefaultButton />} />
```

---

## Closing Strategy

### Methods

1. User interaction (close button)
2. Outside click
3. Programmatic close after success

---

### Recommended

```tsx
onSuccess: () => setOpen(false);
```

---

## Stepper Pattern

### When to Use

- Complex forms
- Multiple dependent inputs

---

### Current Decision

- Implemented only in `TicketFormDialog`
- Not abstracted globally yet

---

### Reason

- Avoid premature abstraction
- Keep flexibility for future changes

---

## Data Flow

### Rule

```txt
Dialog should not fetch data unless necessary
```

---

### Preferred

- Pass required data via props
- Fetch only when the dialog itself is the entry point

---

## Validation Strategy

- Use `react-hook-form` inside the dialog
- Validate per step or on submit

---

## UX Considerations

### 1. Focus Management

- Focus should move into the dialog on open
- Focus should return to the trigger on close

---

### 2. Scroll Handling

- Use a scroll area for long content

---

### 3. Escape Handling

- `ESC` closes the dialog unless restricted

---

### 4. Accessibility

- Proper ARIA roles
- Keyboard navigation support

---

## Performance Considerations

### Lazy Rendering

- Render dialog content only when open

---

### Avoid Heavy Initialization

- Delay expensive logic until the dialog opens

---

## Anti-Patterns Avoided

### 1. Nested Dialogs

- Dialog inside dialog

---

### 2. Dialog for Primary Workflow

- Complex page-like workflows inside dialog

---

### 3. Uncontrolled Dialog State

- No reliable control over open and close behavior

---

### 4. Data Fetching in Deep UI

- API calls inside dialog children

---

## Trade-offs

### Pros

- Consistent interaction pattern
- Better UX for quick actions
- Reduced navigation overhead

---

### Cons

- Limited space for complex UI
- Requires state management
- Can become complex if overused

---

## Alternatives Considered

### 1. Page-Based Only

- Pro: simple routing
- Con: slower interaction for quick actions

---

### 2. Drawer-Based Only

- Pro: flexible layout
- Con: harder to standardize behavior

---

### 3. Global Dialog Manager

- Pro: centralized control
- Con: increased complexity
- Con: harder to debug

---

## Design Principles Alignment

This pattern aligns with:

- Separation of concerns
- UX consistency
- Controlled state management
- Scalable UI architecture

---

## Summary

The dialog pattern provides a **structured and consistent approach**
for handling transient interactions, ensuring that dialogs remain lightweight,
predictable, and aligned with the overall system architecture.
