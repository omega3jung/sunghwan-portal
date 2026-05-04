# README Strategy

## Goal

This document defines how README files are structured and organized across the project
in order to support:

- A clear first impression for reviewers
- Multi-language accessibility
- A scalable documentation structure
- Separation between the repository entry point and deep documentation

---

## Core Principle

```txt
README is an entry point, not the full documentation
```

The root README should guide the reader, not overwhelm them.

---

## Structure Overview

### Root Level

```txt
/README.md
/README.ko.md
/docs/
```

---

## Language Strategy

### Approach

Each language has its own README file:

- `README.md` -> English (default)
- `README.ko.md` -> Korean

---

### Language Switch Section

At the top of the root README:

```md
## **Languages**

- [English](../../../README.md)
- [Korean](../../../README.ko.md)
```

---

### Rationale

- GitHub defaults to `README.md`
- Each language stays fully readable without mixing content
- Inline translation complexity is avoided

---

## Role of Root README

The root README is designed to:

### 1. Explain the project quickly

- What the project is
- Why it exists
- What makes it interesting

---

### 2. Highlight key design themes

Examples:

- Domain-driven design
- Feature-based architecture
- SLA / approval / assignment system

---

### 3. Provide navigation to deeper docs

```md
See more in: docs/en/README.md
```

---

### 4. Show technical credibility

- Tech stack
- Project structure
- Key architectural decisions

---

## What Not to Include in Root README

Avoid:

- Deep domain explanations
- Full architecture breakdown
- Long decision reasoning

These belong in `docs/`.

---

## README and Docs Relationship

### Principle

```txt
README -> overview
Docs -> system explanation
```

---

### Flow

```txt
README -> docs/en/README.md -> detailed documents
```

---

## Docs Structure

Current structure:

```txt
docs/
  en/
    01-project/
    02-architecture/
    03-domain/
    04-ui-ux/
    05-data-fetching/
    06-form-design/
    07-i18n/
    08-dev-strategy/
```

---

### Why Separate Docs?

- Keeps README lightweight
- Enables scalable documentation
- Allows domain-driven explanation

---

## Why This Strategy

### 1. Reviewer Experience

Reviewers, especially in hiring, usually follow this flow:

1. Open the repository
2. Read the README
3. Decide whether to continue

A clear README improves this flow.

---

### 2. Separation of Concerns

- README -> communication layer
- docs -> system design layer

---

### 3. Scalability

As the project grows:

- README remains stable
- docs can expand freely

---

### 4. Maintainability

- Long explanations are not duplicated
- Updates are easier per section

---

## Alternatives Considered

### 1. Single README with All Content

- Pro: simple
- Con: becomes too long
- Con: hard to navigate

---

### 2. Inline Multi-Language README

- Pro: one file
- Con: poor readability
- Con: hard to maintain

---

### 3. Separate `readme/` Folder

```txt
/readme/README.ko.md
```

- Pro: organized
- Con: GitHub does not render it automatically
- Con: weaker first impression

---

## Decision

- Keep README files at the root level
- Use language-specific files (`README.md`, `README.ko.md`)
- Move detailed explanations into `docs/`

---

## Design Principles Alignment

This strategy aligns with:

- Clarity over completeness
- Separation of concerns
- Reviewer-first design
- Scalable documentation architecture

---

## Summary

The README strategy ensures that:

- The project makes a strong first impression
- Documentation remains scalable
- Multi-language support stays clean and maintainable
- System design is properly separated from project introduction

This allows the repository to function both as a **working project** and a **well-documented portfolio artifact**.
