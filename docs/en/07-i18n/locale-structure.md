# Locale Structure

## Goal

The localization (i18n) structure is designed to provide a **scalable, maintainable, and domain-oriented translation system**.

It aims to:

- Organize translations by domain and responsibility
- Improve readability for both developers and reviewers
- Enable flexible usage across multiple features
- Maintain consistency in translation keys

---

## Core Principle

```id="i18n-principle"
Localization should follow domain boundaries, not technical layers
```

---

## Namespace-Based Structure

Translations are divided into **namespaces**, each representing a domain or concern.

---

### Namespace List

```txt id="namespaces"
auth
common
dashboard
demo
error
message
serviceDesk
settings
validation
```

---

### Rationale

- Reflects **feature/domain boundaries**
- Prevents a single large translation file
- Improves maintainability and scalability

---

## Directory Structure

```bash id="locale-structure"
locales/
  en/
    common.json
    serviceDesk.json
    validation.json
  ko/
    common.json
    serviceDesk.json
    validation.json
```

---

### Strategy

- Language-based separation (`en`, `ko`)
- Namespace-based JSON files
- Same structure across languages

---

## Namespace Responsibilities

### common

- Shared UI labels
- Reusable field definitions

---

### serviceDesk

- Feature-specific translations
- Ticket-related labels and messages

---

### validation

- Validation messages
- Error feedback for forms

---

### message

- Toast messages
- Success/failure notifications

---

### error

- System-level error messages

---

## Translation Access Strategy

### Default Namespace

Each feature defines a **default namespace**.

---

### Example

```ts id="default-ns"
const { t } = useTranslation(NS.serviceDesk);
```

---

### Cross-Namespace Access

```ts id="cross-ns"
t("field.title.label", { ns: "common" });
```

---

### Rationale

- Keeps common fields centralized
- Allows reuse across features

---

## Field Structure

### Standard Format

```json id="field-structure"
{
  "field": {
    "title": {
      "label": "Title",
      "placeholder": "Enter title"
    }
  }
}
```

---

### Benefits

- Consistent field definition
- Easy reuse across forms
- Clear structure for non-developers

---

## Naming Convention

### Rule

```id="naming-rule"
Use structured and predictable keys
```

---

### Pattern

```txt id="naming-pattern"
field.<name>.label
field.<name>.placeholder
```

---

### Example

```ts id="naming-example"
t("field.title.label", { ns: "common" });
```

---

## Helper Function (Considered)

### Option

```ts id="helper"
function fieldLabel(name: string) {
  return t(`field.${name}.label`, { ns: "common" });
}
```

---

### Decision

- Not adopted

---

### Rationale

- Reduces readability
- Makes translation usage less explicit
- Harder for non-developers to trace

---

## Explicitness vs Abstraction

### Decision

```id="explicit-rule"
Prefer explicit translation keys over abstraction
```

---

### Reason

- Easier for reviewers (e.g., HR, designers)
- Improves clarity in code
- Reduces hidden logic

---

## Reusability Strategy

### Shared Fields

- Defined in `common`

---

### Feature-Specific Fields

- Defined in feature namespace

---

### Example

- `common.field.title`
- `serviceDesk.ticket.title`

---

## Validation Separation

Validation messages are separated into a dedicated namespace.

---

### Reason

- Avoid mixing UI labels with error messages
- Improve maintainability
- Enable reuse across forms

---

## Scalability Strategy

### Adding New Features

- Create new namespace (e.g., `inventory`)
- Avoid modifying existing namespaces unnecessarily

---

### Adding New Languages

- Replicate namespace structure
- Maintain key consistency

---

## Anti-Patterns Avoided

### 1. Single Global Translation File

- ❌ Hard to maintain
- ❌ Poor scalability

---

### 2. Over-Abstraction

- ❌ Hidden translation logic
- ❌ Reduced readability

---

### 3. Mixed Responsibilities

- ❌ UI + validation + message in one file

---

### 4. Inconsistent Key Naming

- ❌ Difficult to maintain

---

## Trade-offs

### Pros

- Clear domain separation
- Scalable structure
- Improved readability
- Better collaboration

---

### Cons

- More files to manage
- Requires discipline in naming
- Slightly more verbose usage

---

## Design Principles Alignment

This structure aligns with:

- Domain-driven design
- Separation of concerns
- Scalability and maintainability
- Developer and reviewer experience

---

## Summary

The locale structure is based on **namespace-driven organization**,
ensuring that translations are grouped by domain and remain scalable,
explicit, and easy to maintain across the application.
