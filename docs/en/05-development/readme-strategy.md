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

The root README should guide the reader with enough project, domain,
architecture, demo, and scope context to decide where to continue. It should
summarize those areas without becoming their canonical specification.

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

- workflow-driven Ticket, Ticket Action, Ticket History, and Ticket Work Session
  design
- feature, Route Handler, LOCAL/REMOTE, and server-data boundaries
- approval, assignment, draft, and attachment scope
- production-aligned versus production-complete status

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

## Root README Detail Boundary

Include enough domain and architecture context for a reviewer to understand why
the project is significant and how the implemented system is divided.

Do not duplicate:

- exhaustive workflow transition or permission matrices
- DTO, database-row, and field-by-field contracts
- full operation-rule tables
- long decision reasoning or rejected alternatives

Those details belong in the canonical specification, current design documents,
reference matrices, and Decision Logs.

---

## README and Docs Relationship

### Principle

```txt
Root README -> concise reviewer-oriented project, domain, architecture, demo, and scope summary
Canonical spec and current design docs -> precise workflow and implementation rules
Decision Logs -> historical reasoning and alternatives
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
    01-overview/     # project and Service Desk evolution
    02-architecture/ # application and runtime boundaries
    03-domain/       # current domain models and workflow rules
    04-client-engineering/ # UI, form, and localization patterns
    05-development/        # implementation, testing, project practices, and releases
    06-decisions/          # historical decision records
```

Current design documents explain the implementation-aligned system. Development
documents include testing strategy and the consolidated release record, while
decision logs preserve point-in-time context. README and overview documents
orient readers and link to the appropriate source-of-truth documents.

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

- root README -> reviewer entry and technical summary layer
- canonical spec/current docs -> current system design layer
- Decision Logs -> historical reasoning layer

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
- Keep concise, reviewer-useful domain and architecture summaries in the root
  README
- Keep precise rules, matrices, contracts, and extended reasoning in `docs/`

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
- Reviewer-oriented technical context remains in the root README
- Canonical rules and historical reasoning remain separated from the project
  introduction

This allows the repository to function both as a **working project** and a **well-documented portfolio artifact**.
