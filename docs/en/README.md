# Service Desk System Documentation

## Goal

This documentation explains the design, architecture, and implementation
thinking behind the Service Desk system in `sunghwan-portal`.

It separates three document responsibilities:

- **Current design docs** describe the implementation-aligned model.
- **Decision logs** preserve point-in-time context, alternatives, and reasons.
- **README/overview docs** summarize structure and link to source-of-truth docs.

---

## Current Canonical Spec

The shortest current system specification is:

- [Canonical Ticket System Specification](../spec/ticket-system.md)

Use it as the top-level ticket-system contract before reading deeper domain
documents.

---

## Documentation Areas

The `docs/en` folder is organized by responsibility:

- `01-overview`: project and Service Desk evolution
- `02-architecture`: application and runtime boundaries
- `03-domain`: current Service Desk domain model and workflow rules
- `04-engineering`: implementation patterns, UI, forms, data fetching, i18n,
  conventions, and documentation practices
- `05-releases`: release-specific records
- `06-decisions`: historical decision records

---

## Overview

Overview documents orient readers to the repository and its evolution.

Key document:

- [Service Desk Evolution](./01-overview/service-desk-evolution.md)

---

## Architecture

Architecture documents explain runtime and application boundaries.

Key documents:

- [Feature-Based Structure](./02-architecture/feature-based-structure.md)
- [Routing Strategy](./02-architecture/routing-strategy.md)
- [State Management](./02-architecture/state-management.md)
- [Auth & Session Strategy](./02-architecture/auth-session-strategy.md)
- [Impersonation Strategy](./02-architecture/impersonation-strategy.md)
- [Database Strategy](./02-architecture/database-strategy.md)

---

## Domain Design

Domain documents define current Service Desk behavior.

Key documents:

- [Service Desk Settings](./03-domain/service-desk/settings.md)
- [Ticket System Overview](./03-domain/service-desk/ticket/ticket-system-overview.md)
- [Ticket Lifecycle](./03-domain/service-desk/ticket/ticket-lifecycle.md)
- [Ticket Model](./03-domain/service-desk/ticket/ticket-model.md)
- [Ticket Action Model](./03-domain/service-desk/ticket/ticket-action.md)
- [Ticket History](./03-domain/service-desk/ticket/ticket-history.md)
- [Ticket Work Session](./03-domain/service-desk/ticket/ticket-work-session.md)
- [Action Strategy](./03-domain/service-desk/ticket/strategy/action-strategy.md)
- [Category Strategy](./03-domain/service-desk/ticket/strategy/category-strategy.md)
- [Approval System](./03-domain/service-desk/ticket/strategy/approval-system.md)
- [Assignment Policy](./03-domain/service-desk/ticket/strategy/assignment-policy.md)
- [SLA Strategy](./03-domain/service-desk/ticket/strategy/sla-strategy.md)
- [Ticket Operation Rules](./03-domain/service-desk/ticket/reference/ticket-operation-rules.md)
- [Ticket Action Workflow Matrix](./03-domain/service-desk/ticket/reference/ticket-action-workflow-matrix.xlsx)
- [Employee Reference Scope Matrix](./03-domain/service-desk/ticket/reference/restrict-employee-list.xlsx)

Current domain themes:

- statuses are `Draft`, `Approval`, `Declined`, `Assigned`, `Working`,
  `Pending`, `Rejected`, `Resolved`, and `Closed`
- approval and work assignment are phase-aware
- requester update can preserve or reset routing
- Ticket Action commands execute operational workflow
- ticket history is event-based
- settings are tenant-scoped behavior configuration

---

## Engineering

Engineering documents cover implementation practices and client-side
responsibility boundaries.

### UI/UX

UI/UX documents describe how workflow behavior is represented in the interface.

Key documents:

- [Component Boundary](./04-engineering/ui/component-boundary.md)
- [Dialog Pattern](./04-engineering/ui/dialog-pattern.md)
- [Form Pattern](./04-engineering/forms/form-pattern.md)
- [Dashboard and Insight](./04-engineering/ui/dashboard-and-insight.md)

The current policy is:

```txt
Page   -> primary workflow
Dialog -> atomic action or short form
```

Ticket detail is a page. Create, requester update, and ticket actions are
focused dialog/tool workflows.

---

### Data Fetching

React Query owns Service Desk server state.

Key document:

- [React Query Strategy](./04-engineering/data-fetching/react-query-strategy.md)

Current query families include tickets, drafts, actions, histories, work
sessions, and tenant-scoped settings. REMOTE draft queries resolve server state;
LOCAL draft hooks orchestrate browser-local repository state.

---

### Form Design

Form documents describe ticket creation, requester update, draft, and attachment
boundaries.

Key documents:

- [Ticket Form Design](./04-engineering/forms/ticket-form.md)
- [Ticket Attachment Design](./04-engineering/forms/ticket-attachment.md)

Current form themes:

- `CreateTicketDialog` and `UpdateTicketDialog` are separate workflow surfaces
- LOCAL draft recovery is browser `localStorage` state scoped to the current
  demo user and accessed through the feature draft repository
- REMOTE draft is a `Draft` ticket row with one active draft per requester
- raw browser files are transient
- the Attachment Prepare API returns prepared metadata before ticket writes

---

### Localization

i18n documents describe locale and validation-message structure.

Key documents:

- [Locale Structure](./04-engineering/i18n/locale-structure.md)
- [Validation Messages](./04-engineering/i18n/validation-messages.md)

---

### Development Strategy

Development strategy documents explain how the current system was built and how
design responsibilities are separated.

Key documents:

- [Development Approach](./04-engineering/development-approach.md)
- [Service Desk Implementation Strategy](./04-engineering/service-desk-implementation-strategy.md)

---

### Conventions and Documentation Practices

Project-wide conventions and documentation practices apply across feature,
application, domain, and UI boundaries.

Key documents:

- [Boolean Naming Convention](./04-engineering/conventions/boolean-naming-convention.md)
- [README Strategy](./04-engineering/documentation/readme-strategy.md)

---

## Releases

Release documentation records version changes, migrations, architecture impact,
verification results, and related pull requests or decisions.

- [Release Documentation](./05-releases/README.md)

---

## Decisions

Decision logs are historical records. They may contain older terms when those
terms were part of the decision context. Do not rewrite them into current design
docs unless the decision log itself contains a factual error about what was
decided at that time.

- [Decision Documentation](./06-decisions/README.md)

---

## Recommended Reading Order

1. [Canonical Ticket System Specification](../spec/ticket-system.md)
2. [Ticket System Overview](./03-domain/service-desk/ticket/ticket-system-overview.md)
3. [Service Desk Settings](./03-domain/service-desk/settings.md)
4. [Ticket Lifecycle](./03-domain/service-desk/ticket/ticket-lifecycle.md)
5. [Ticket Model](./03-domain/service-desk/ticket/ticket-model.md)
6. [Ticket Action Model](./03-domain/service-desk/ticket/ticket-action.md)
7. [Ticket History](./03-domain/service-desk/ticket/ticket-history.md)
8. [Ticket Work Session](./03-domain/service-desk/ticket/ticket-work-session.md)
9. [Action Strategy](./03-domain/service-desk/ticket/strategy/action-strategy.md)
10. [Approval System](./03-domain/service-desk/ticket/strategy/approval-system.md)
11. [Assignment Policy](./03-domain/service-desk/ticket/strategy/assignment-policy.md)
12. [Category Strategy](./03-domain/service-desk/ticket/strategy/category-strategy.md)
13. [SLA Strategy](./03-domain/service-desk/ticket/strategy/sla-strategy.md)
14. [Ticket Form Design](./04-engineering/forms/ticket-form.md)
15. [Ticket Attachment Design](./04-engineering/forms/ticket-attachment.md)
16. [React Query Strategy](./04-engineering/data-fetching/react-query-strategy.md)
17. [Routing Strategy](./02-architecture/routing-strategy.md)
18. [Database Strategy](./02-architecture/database-strategy.md)
19. [Service Desk Implementation Strategy](./04-engineering/service-desk-implementation-strategy.md)
20. [Ticket Operation Rules](./03-domain/service-desk/ticket/reference/ticket-operation-rules.md)
21. [Decision Documentation](./06-decisions/README.md)

---

## Summary

`docs/en` presents the Service Desk system as an implementation-aligned,
traceable workflow domain. Current design docs describe the latest model.
Decision logs preserve why the model changed over time.
