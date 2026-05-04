# Service Desk System Documentation

## Goal

This documentation explains the design, architecture, and implementation thinking behind a
**Service Desk system** built with **Next.js 14 App Router**.

The project is documented not as a simple UI demo, but as a **domain-driven, production-aligned system**
with attention to:

- Category-driven ticket workflow
- Approval and assignment logic
- SLA-based operations
- Auditability and history
- Role-aware UI/UX
- Practical migration and development decisions

---

## Audience

This documentation is intended for:

- Engineers reviewing the project structure
- Interviewers evaluating design decisions
- Developers interested in real-world frontend architecture

It is written to explain not only implementation, but also the reasoning behind key decisions.

---

## What This Documentation Covers

The `docs/en` folder is organized around the major design axes of the project.

At the moment, it contains:

- `01-project`: project entry-point documentation
- `02-architecture`: application structure and runtime boundaries
- `03-domain`: Service Desk domain rules and workflow design
- `04-ui-ux`: UI responsibility and interaction patterns
- `05-data-fetching`: query and caching strategy
- `06-form-design`: ticket form behavior and validation
- `07-i18n`: localization structure and validation messaging
- `08-dev-strategy`: development approach and decision logs

---

### 1. Project

The project documents explain how the repository should introduce itself before the reader
dives into deeper system design details.

They cover:

- README structure and purpose
- language separation strategy
- navigation flow from the repository entry point to detailed docs

Key document:

- [README Strategy](./01-project/readme-strategy.md)

---

### 2. Architecture

The architecture documents explain how the system is structured at the application level.

They cover:

- Feature-based project structure
- Routing strategy in Next.js App Router
- State management boundaries
- Authentication, session, and impersonation design

Key documents:

- [Feature-Based Structure](./02-architecture/feature-based-structure.md)
- [Routing Strategy](./02-architecture/routing-strategy.md)
- [State Management](./02-architecture/state-management.md)
- [Auth & Session Strategy](./02-architecture/auth-session-strategy.md)
- [Impersonation Strategy](./02-architecture/impersonation-strategy.md)

---

### 3. Domain Design

The domain documents define how the Service Desk behaves as a workflow-oriented system.

They cover:

- ticket overview and system scope
- ticket lifecycle and state transitions
- ticket model and ownership
- ticket activity and action-oriented interaction modeling
- work session tracking
- ticket history and audit trail
- category-driven strategy for actions, approval, assignment, and SLA

Key documents:

- [Ticket System Overview](./03-domain/ticket/ticket-system-overview.md)
- [Ticket Lifecycle](./03-domain/ticket/ticket-lifecycle.md)
- [Ticket Model](./03-domain/ticket/ticket-model.md)
- [Ticket Activity Model](./03-domain/ticket/ticket-activity.md)
- [Ticket Track Time](./03-domain/ticket/ticket-track-time.md)
- [Ticket History](./03-domain/ticket/ticket-history.md)
- [Action Strategy](./03-domain/ticket/strategy/action-strategy.md)
- [Category Strategy](./03-domain/ticket/strategy/category-strategy.md)
- [Approval System](./03-domain/ticket/strategy/approval-system.md)
- [Assignment Policy](./03-domain/ticket/strategy/assignment-policy.md)
- [SLA Strategy](./03-domain/ticket/strategy/sla-strategy.md)

---

### 4. UI/UX Principles

The UI/UX documents focus on how system behavior is translated into usable interfaces.

They cover:

- Component responsibility boundaries
- Dialog and form interaction patterns
- Dashboard vs insight separation
- Practical UI structure for complex workflows

Key documents:

- [Component Boundary](./04-ui-ux/component-boundary.md)
- [Dialog Pattern](./04-ui-ux/dialog-pattern.md)
- [Form Pattern](./04-ui-ux/form-pattern.md)
- [Dashboard and Insight](./04-ui-ux/dashboard-and-insight.md)

---

### 5. Data Fetching Strategy

This section explains how the project uses React Query and where server/client responsibilities are separated.

Key document:

- [React Query Strategy](./05-data-fetching/react-query-strategy.md)

---

### 6. Form Design

This section focuses on the ticket form as one of the most domain-heavy interactions in the system.

It covers:

- Multi-step form flow
- Category-driven behavior
- SLA, priority, and risk integration
- Validation and submission strategy

Key document:

- [Ticket Form Design](./06-form-design/ticket-form.md)

---

### 7. Localization (i18n)

The i18n documents describe how translation files are structured and how validation feedback is separated by message responsibility.

They cover:

- Namespace-based locale structure
- Validation vs message vs error separation
- Translation key explicitness and maintainability

Key documents:

- [Locale Structure](./07-i18n/locale-structure.md)
- [Validation Messages](./07-i18n/validation-messages.md)

---

### 8. Development Strategy

The development strategy documents explain how the project was actually built and evolved.

They cover:

- Migration-aware development philosophy
- Practical decision-making
- Decision logs for major design choices

Key documents:

- [Development Approach](./08-dev-strategy/development-approach.md)
- [Service Desk Evolution](./08-dev-strategy/service-desk-evolution.md)
- [Service Desk Implementation Strategy](./08-dev-strategy/service-desk-implementation-strategy.md)
- [Ticket Operation Rules](./08-dev-strategy/ticket-operation-rules.md)

#### Decision Log

The `decision-log` directory captures key design decisions made during development.

Each document focuses on:

- Context of the problem
- Options considered
- Final decision and reasoning

This reflects an **iterative, real-world development process** rather than a fully pre-designed system.

Current decision log topics include:

- [2025-12 Auth Session Architecture](./08-dev-strategy/decision-log/2025-12-auth-session-architecture.md)
- [2025-12 Impersonation](./08-dev-strategy/decision-log/2025-12-impersonation.md)
- [2025-12 Naming](./08-dev-strategy/decision-log/2025-12-naming.md)
- [2025-12 System Layout](./08-dev-strategy/decision-log/2025-12-system-layout.md)
- [2026-01 Category Design](./08-dev-strategy/decision-log/2026-01-category-design.md)
- [2026-01 Impersonation](./08-dev-strategy/decision-log/2026-01-impersonation.md)
- [2026-01 Session User Boundary](./08-dev-strategy/decision-log/2026-01-session-user-boundary.md)
- [2026-02 Service Desk Settings](./08-dev-strategy/decision-log/2026-02-service-desk-settings.md)
- [2026-03 Service Desk](./08-dev-strategy/decision-log/2026-03-service-desk.md)
- [2026-03 Ticket Form Dialog](./08-dev-strategy/decision-log/2026-03-ticket-form-dialog.md)
- [2026-03 Ticket Session](./08-dev-strategy/decision-log/2026-03-ticket-session.md)
- [2026-04 Entity Status Naming](./08-dev-strategy/decision-log/2026-04-entity-status-naming.md)
- [2026-04 Ticket Action](./08-dev-strategy/decision-log/2026-04-ticket-action.md)
- [2026-05 Barrel Export Boundary](./08-dev-strategy/decision-log/2026-05-barrel-export-boundary.md)

---

## Core Design Themes

Across all sections, the documentation consistently reflects these themes:

- **Domain-first design** over generic CRUD thinking
- **Traceability and auditability** as core system behavior
- **Role-aware UX** instead of one-size-fits-all screens
- **Practical iteration** over premature abstraction
- **Scalable structure** grounded in actual usage patterns

---

## Recommended Reading Order

If you are new to the project, this order gives the clearest overview:

1. [README Strategy](./01-project/readme-strategy.md)
2. [Feature-Based Structure](./02-architecture/feature-based-structure.md)
3. [Ticket System Overview](./03-domain/ticket/ticket-system-overview.md)
4. [Ticket Lifecycle](./03-domain/ticket/ticket-lifecycle.md)
5. [Ticket Model](./03-domain/ticket/ticket-model.md)
6. [Ticket Activity Model](./03-domain/ticket/ticket-activity.md)
7. [Ticket History](./03-domain/ticket/ticket-history.md)
8. [Action Strategy](./03-domain/ticket/strategy/action-strategy.md)
9. [Category Strategy](./03-domain/ticket/strategy/category-strategy.md)
10. [Approval System](./03-domain/ticket/strategy/approval-system.md)
11. [Assignment Policy](./03-domain/ticket/strategy/assignment-policy.md)
12. [SLA Strategy](./03-domain/ticket/strategy/sla-strategy.md)
13. [Ticket Track Time](./03-domain/ticket/ticket-track-time.md)
14. [Component Boundary](./04-ui-ux/component-boundary.md)
15. [React Query Strategy](./05-data-fetching/react-query-strategy.md)
16. [Ticket Form Design](./06-form-design/ticket-form.md)
17. [Locale Structure](./07-i18n/locale-structure.md)
18. [Development Approach](./08-dev-strategy/development-approach.md)
19. [Service Desk Evolution](./08-dev-strategy/service-desk-evolution.md)
20. [Service Desk Implementation Strategy](./08-dev-strategy/service-desk-implementation-strategy.md)
21. [Ticket Operation Rules](./08-dev-strategy/ticket-operation-rules.md)

---

## Why This Matters

This documentation is intended to show not only **what was built**, but also **why specific design decisions were made**.

It presents the project as a system with:

- Clear architectural boundaries
- Explicit domain rules
- Consistent UI patterns
- Documented implementation trade-offs

It should help a reader quickly answer:

- What kind of system is this?
- Where is each topic documented?
- Which documents explain stable design vs iterative implementation decisions?

---

## Summary

`docs/en` is an overview of the Service Desk system from **project documentation strategy to architecture, domain behavior, UI/UX, data strategy, forms, localization, and development decisions**.

Taken together, these documents describe a project that aims to be **practical, traceable, scalable, and grounded in real Service Desk workflows**, rather than just visually complete.

If you want the shortest path through the docs, start with this file, move to
[README Strategy](./01-project/readme-strategy.md), then continue through the recommended reading order above.
