# Form Pattern

## Goal

The form pattern is designed to provide a **scalable, type-safe, and user-friendly form system**
for handling complex data input in a consistent manner.

It aims to:

- Ensure type safety with TypeScript
- Improve user experience with validation and step-based input
- Reduce boilerplate through reusable patterns
- Maintain clear separation between form logic and UI

---

## Core Principle

```id="form-principle"
Form state should be isolated, controlled, and type-safe
```

---

## Form Library

Forms are managed using **react-hook-form**.

---

## Why react-hook-form?

- Minimal re-renders (performance)
- Strong TypeScript support
- Built-in validation integration
- Flexible control over form state
- Works well with uncontrolled inputs

---

## Form Structure

### Basic Structure

```tsx id="form-structure"
const form = useForm<FormValues>();

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField name="title" />
  </form>
</Form>;
```

---

## Type Safety

### Rule

```id="type-rule"
All forms must define a TypeScript schema
```

---

### Example

```ts id="form-type"
type TicketForm = {
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
};
```

---

## Validation Strategy

Validation is handled using schema-based validation (e.g., Zod).

---

### Example

```ts id="validation-example"
const schema = z.object({
  title: z.string().min(1),
});
```

---

### Benefits

- Centralized validation logic
- Consistent error messages
- Type inference support

---

## Multi-Step Form Pattern

Used for complex input flows (e.g., TicketFormDialog).

---

### Structure

```tsx id="multi-step"
Step 1 → Step 2 → Step 3 → Submit
```

---

### Characteristics

- Step-by-step input
- Partial validation per step
- Final validation on submit

---

### State Handling

- Single form instance across all steps
- Step index managed separately

---

## Field Structure

### Rule

```id="field-rule"
Each field should be self-contained and reusable
```

---

### Pattern

```tsx id="field-pattern"
<FormField
  control={form.control}
  name="title"
  render={({ field }) => <Input {...field} />}
/>
```

---

## useWatch Strategy

Used for observing field values dynamically.

---

### Example

```ts id="usewatch-example"
const files = useWatch({
  control: form.control,
  name: "attachments",
});
```

---

### Note

- Avoid incorrect defaultValue typing
- Prefer explicit casting when necessary

---

## Default Value Strategy

### Rule

```id="default-value"
Avoid incorrect defaultValue types
```

---

### Problem

- Type mismatch in generic forms

---

### Solution

- Remove defaultValue when not required
- Use type assertion carefully

---

## Controlled vs Uncontrolled Inputs

### Strategy

- Prefer uncontrolled inputs (react-hook-form default)
- Use controlled inputs only when necessary

---

## Submission Flow

### Pattern

```tsx id="submit-flow"
form.handleSubmit(onSubmit);
```

---

### Behavior

- Validate form
- Execute mutation
- Handle success/failure

---

## Integration with API

### Rule

```id="api-rule"
Form submission should trigger mutation, not direct API calls
```

---

### Example

```ts id="mutation-flow"
const mutation = useMutation(createTicket);

const onSubmit = (data) => {
  mutation.mutate(data);
};
```

---

## Error Handling

### Strategy

- Field-level errors (validation)
- Form-level errors (API)

---

### Example

- Validation → inline message
- API error → toast or alert

---

## Reset Strategy

### Use Cases

- After successful submission
- When dialog closes

---

### Example

```ts id="reset-example"
form.reset();
```

---

## UX Considerations

### 1. Inline Validation

- Show errors near fields

---

### 2. Disable Submit

- Prevent submission when invalid

---

### 3. Loading State

- Disable inputs during submission

---

### 4. Step Navigation

- Prevent moving forward if invalid

---

## Reusability Strategy

### Shared Fields

- Extract common fields (Input, Select, etc.)

---

### Feature-Specific Fields

- Keep domain-specific logic inside feature

---

## Anti-Patterns Avoided

### 1. Storing Form State in Global Store

- ❌ Breaks isolation

---

### 2. Mixing UI and Validation Logic

- ❌ Hard to maintain

---

### 3. Duplicated Validation Rules

- ❌ Inconsistent behavior

---

### 4. Overusing Controlled Inputs

- ❌ Performance degradation

---

## Trade-offs

### Pros

- Strong type safety
- High performance
- Scalable form structure
- Clear separation of concerns

---

### Cons

- Learning curve for react-hook-form
- Slight complexity in generic typing
- Requires discipline in structure

---

## Alternatives Considered

### 1. useState-based Forms

- ✔ Simple
- ❌ Hard to scale

---

### 2. Formik

- ✔ Popular
- ❌ More re-renders

---

### 3. Fully Controlled Forms

- ✔ Explicit state
- ❌ Performance cost

---

## Design Principles Alignment

This pattern aligns with:

- Type safety
- Performance optimization
- Separation of concerns
- Reusable UI components

---

## Summary

The form pattern provides a **type-safe, performant, and scalable approach**
to handling complex user input, leveraging react-hook-form and schema validation
to ensure consistency and maintainability across the system.
