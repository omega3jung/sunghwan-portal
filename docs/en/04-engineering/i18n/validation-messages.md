# Validation Messages

## Goal

The validation and feedback message structure is designed to provide a **clear separation of responsibilities** between different types of user-facing messages.

It aims to:

- Keep validation rules consistent across forms
- Separate inline form feedback from system or action feedback
- Improve maintainability of localization files
- Make message intent explicit and predictable

---

## Core Principle

```id="message-principle"
Different message types should be separated by purpose, not grouped only by UI location
```

---

## Message Categories

The system separates feedback messages into **three namespaces**, each with a distinct role.

---

### Namespace List

```txt id="message-categories"
validation
message
error
```

---

### Rationale

- Keeps message ownership clear
- Prevents mixed responsibilities in one file
- Improves reuse across features and forms

---

## Namespace Responsibilities

### validation

- Form validation messages
- Input-rule feedback
- Inline field errors

---

### message

- Action feedback messages
- Success and expected failure notifications
- Toast and banner content

---

### error

- System-level failures
- API and network errors
- Exceptional or unexpected states

---

## Validation Namespace

### Purpose

Contains messages directly tied to **input validation rules**.

---

### Typical Use Cases

- Required field
- Minimum length
- Maximum length
- Invalid format

---

### Example Structure

```json id="validation-example"
{
  "required": "This field is required.",
  "requiredWithField": "{{field}} is required.",
  "minLength": "Must be at least {{count}} characters.",
  "maxLength": "Must be less than {{count}} characters."
}
```

---

### Characteristics

- Usually shown inline near fields
- Closely tied to schema validation
- Reused across multiple forms and features

---

## Message Namespace

### Purpose

Contains general application feedback shown after **expected user actions**.

---

### Typical Use Cases

- Create success
- Update success
- Delete success
- Save completed

---

### Example Structure

```json id="message-example"
{
  "create": {
    "success": "Created successfully."
  },
  "update": {
    "success": "Updated successfully."
  },
  "delete": {
    "success": "Deleted successfully."
  }
}
```

---

### Characteristics

- Triggered after user actions
- Often shown in toast, banner, or status UI
- Represents application-level feedback, not field validation

---

## Error Namespace

### Purpose

Contains **system-level or exceptional** error messages.

---

### Typical Use Cases

- Network error
- Unauthorized access
- Unexpected server failure
- Data not found

---

### Example Structure

```json id="error-example"
{
  "network": "A network error occurred.",
  "unauthorized": "You are not authorized.",
  "forbidden": "You do not have permission.",
  "notFound": "The requested data was not found.",
  "unknown": "An unexpected error occurred."
}
```

---

### Characteristics

- Represents abnormal or exceptional states
- Often tied to backend, auth, or infrastructure issues
- May be shown in alerts, dialogs, or page-level fallback UI

---

## Responsibility Boundary

### validation.json

- Used for input rule feedback

---

### message.json

- Used for expected application feedback

---

### error.json

- Used for unexpected or system-level failures

---

## UI Mapping

### validation

- Inline field error
- Form helper text

---

### message

- Toast
- Success banner
- Action status

---

### error

- Alert
- Error page
- Global fallback
- API failure message

---

## Naming Strategy

### validation.json

```txt id="validation-keys"
required
requiredWithField
minLength
maxLength
invalidEmail
```

---

### message.json

```txt id="message-keys"
create.success
update.success
delete.success
save.success
```

---

### error.json

```txt id="error-keys"
network
unauthorized
forbidden
notFound
unknown
```

---

## Interpolation Strategy

Messages may support interpolation when dynamic context is needed.

---

### Example

```json id="interpolation-example"
{
  "requiredWithField": "{{field}} is required."
}
```

---

### Benefits

- Improves reusability
- Reduces duplication
- Supports dynamic context

---

## Why Not Use One File?

A single message file may look simpler at first, but it introduces long-term problems.

---

### Risks

- Mixed responsibilities
- Lower readability
- Harder maintenance
- Unclear message ownership

---

### Example

```txt id="message-comparison"
validation.required
message.create.success
error.network
```

These are all messages, but they serve fundamentally different roles.

---

## Reusability Strategy

### validation.json

- Highly reusable across all forms

---

### message.json

- Reusable across domains for common actions

---

### error.json

- Reusable across features for shared system errors

---

## Trade-offs

### Pros

- Clear separation of concerns
- Better maintainability
- Easier collaboration
- More predictable message ownership

---

### Cons

- More files to manage
- Requires naming discipline
- Slightly more setup effort

---

## Alternatives Considered

### 1. Single messages.json

- Simple initial setup
- Poor scalability
- Mixed responsibilities

---

### 2. Feature-Only Message Files

- Strong domain grouping
- Harder to reuse common validation and error patterns

---

### 3. Fully Centralized Global Message File

- One lookup location
- Becomes large and difficult to navigate

---

## Design Principles Alignment

This structure aligns with:

- Separation of concerns
- Scalable localization
- Predictable feedback design
- Better developer experience

---

## Summary

The validation message strategy separates **validation**, **general application feedback**,
and **system-level errors** into distinct namespaces so that each message type remains
clear in purpose, reusable in context, and maintainable as the application grows.
