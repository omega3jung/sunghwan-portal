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

```txt
Different message types should be separated by purpose, not grouped only by UI location
```

---

## Message Categories

The system separates feedback messages into **three namespaces**, each with a distinct role.

`validation` and `message` currently use one JSON file per language. The `error`
namespace is composed from `error/` fragments through `error/index.ts`; namespace
ownership does not require a same-named JSON file. See
[Locale Structure](locale-structure.md).

---

### Namespace List

```txt
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

```json
{
  "required": {
    "default": "This field is required.",
    "withField": "{{field}} is required."
  },
  "length": {
    "min": "Must be at least {{count}} characters.",
    "max": "Must be at most {{count}} characters."
  }
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

```json
{
  "common": {
    "create": {
      "successfully": "Created successfully."
    },
    "update": {
      "successfully": "Updated successfully."
    },
    "delete": {
      "successfully": "Deleted successfully."
    }
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

```json
{
  "common": {
    "failed": "Failed",
    "load": {
      "title": "Failed to load",
      "message": "Failed to load {{item}}"
    }
  }
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

### error namespace

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

```txt
required.default
required.withField
length.min
length.max
format.invalid
```

---

### message.json

```txt
common.create.success
common.update.success
common.delete.success
common.save.success
```

---

### error namespace

```txt
common.failed
common.load.title
common.load.message
serviceDesk.ticketCommand.execute
```

---

## Interpolation Strategy

Use interpolation to insert values determined at runtime, such as field names
or counts, into a message.

---

### Example

```json
{
  "required": {
    "withField": "{{field}} is required."
  }
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

```txt
validation:required.default
message:common.create.success
error:common.load.message
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

### error namespace

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
