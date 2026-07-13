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

- [`../spec/ticket-system.md`](../spec/ticket-system.md)

Use it as the top-level ticket-system contract before reading deeper domain
documents.

---

## Documentation Areas

The `docs/en` folder is organized by responsibility:

- `01-project`: repository and README documentation strategy
- `02-architecture`: app structure, routing, database, state, auth/session
- `03-domain`: Service Desk domain rules and workflow behavior
- `04-ui-ux`: UI interaction patterns
- `05-data-fetching`: React Query and server-state ownership
- `06-form-design`: ticket form, draft, and attachment behavior
- `07-i18n`: localization and validation-message strategy
- `08-dev-strategy`: implementation strategy, evolution, operation rules, and
  decision logs

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

- [Service Desk Settings](./03-domain/service-desk-settings.md)
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

Current domain themes:

- statuses are `Draft`, `Approval`, `Declined`, `Assigned`, `Working`,
  `Pending`, `Rejected`, `Resolved`, and `Closed`
- approval and work assignment are phase-aware
- requester update can preserve or reset routing
- Ticket Action commands execute operational workflow
- ticket history is event-based
- settings are tenant-scoped behavior configuration

---

## UI/UX

UI/UX documents describe how workflow behavior is represented in the interface.

Key documents:

- [Component Boundary](./04-ui-ux/component-boundary.md)
- [Dialog Pattern](./04-ui-ux/dialog-pattern.md)
- [Form Pattern](./04-ui-ux/form-pattern.md)
- [Dashboard and Insight](./04-ui-ux/dashboard-and-insight.md)

The current policy is:

```txt
Page   -> primary workflow
Dialog -> atomic action or short form
```

Ticket detail is a page. Create, requester update, and ticket actions are
focused dialog/tool workflows.

---

## Data Fetching

React Query owns Service Desk server state.

Key document:

- [React Query Strategy](./05-data-fetching/react-query-strategy.md)

Current query families include tickets, drafts, actions, histories, work
sessions, and tenant-scoped settings.

---

## Form Design

Form documents describe ticket creation, requester update, draft, and attachment
boundaries.

Key documents:

- [Ticket Form Design](./06-form-design/ticket-form.md)
- [Ticket Attachment Design](./06-form-design/ticket-attachment.md)

Current form themes:

- `CreateTicketDialog` and `UpdateTicketDialog` are separate workflow surfaces
- REMOTE draft is a `Draft` ticket row with one active draft per requester
- raw browser files are transient
- the Attachment Prepare API returns prepared metadata before ticket writes

---

## Localization

i18n documents describe locale and validation-message structure.

Key documents:

- [Locale Structure](./07-i18n/locale-structure.md)
- [Validation Messages](./07-i18n/validation-messages.md)

---

## Development Strategy

Development strategy documents explain how the current system was built and how
design responsibilities are separated.

Key documents:

- [Development Approach](./08-dev-strategy/development-approach.md)
- [Service Desk Evolution](./08-dev-strategy/service-desk-evolution.md)
- [Service Desk Implementation Strategy](./08-dev-strategy/service-desk-implementation-strategy.md)
- [Ticket Operation Rules](./08-dev-strategy/ticket-operation-rules.md)

---

## Decision Logs

Decision logs are historical records. They may contain older terms when those
terms were part of the decision context. Do not rewrite them into current design
docs unless the decision log itself contains a factual error about what was
decided at that time.

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
- [2026-06 Service Desk Tenant Design](./08-dev-strategy/decision-log/2026-06-service-desk-tenant-design.md)
- [2026-06 Service Desk Settings DTO/API Boundary](./08-dev-strategy/decision-log/2026-06-service-desk-settings-dto-api-boundary.md)
- [2026-06 Ticket Attachment Boundary](./08-dev-strategy/decision-log/2026-06-ticket-attachment-boundary.md)
- [2026-06 Ticket Form and Draft Workflow](./08-dev-strategy/decision-log/2026-06-ticket-form-and-draft-workflow.md)
- [2026-07 Ticket Action and History Execution](./08-dev-strategy/decision-log/2026-07-ticket-action-and-history-execution.md)
- [2026-07 Ticket Routing and Update Policy](./08-dev-strategy/decision-log/2026-07-ticket-routing-and-update-policy.md)

---

## Recommended Reading Order

1. [`../spec/ticket-system.md`](../spec/ticket-system.md)
2. [Service Desk Settings](./03-domain/service-desk-settings.md)
3. [Ticket System Overview](./03-domain/ticket/ticket-system-overview.md)
4. [Ticket Lifecycle](./03-domain/ticket/ticket-lifecycle.md)
5. [Ticket Model](./03-domain/ticket/ticket-model.md)
6. [Ticket Activity Model](./03-domain/ticket/ticket-activity.md)
7. [Ticket History](./03-domain/ticket/ticket-history.md)
8. [Ticket Track Time](./03-domain/ticket/ticket-track-time.md)
9. [Action Strategy](./03-domain/ticket/strategy/action-strategy.md)
10. [Approval System](./03-domain/ticket/strategy/approval-system.md)
11. [Assignment Policy](./03-domain/ticket/strategy/assignment-policy.md)
12. [Category Strategy](./03-domain/ticket/strategy/category-strategy.md)
13. [SLA Strategy](./03-domain/ticket/strategy/sla-strategy.md)
14. [Ticket Form Design](./06-form-design/ticket-form.md)
15. [Ticket Attachment Design](./06-form-design/ticket-attachment.md)
16. [React Query Strategy](./05-data-fetching/react-query-strategy.md)
17. [Routing Strategy](./02-architecture/routing-strategy.md)
18. [Database Strategy](./02-architecture/database-strategy.md)
19. [Service Desk Implementation Strategy](./08-dev-strategy/service-desk-implementation-strategy.md)
20. [Ticket Operation Rules](./08-dev-strategy/ticket-operation-rules.md)

---

## Summary

`docs/en` presents the Service Desk system as an implementation-aligned,
traceable workflow domain. Current design docs describe the latest model.
Decision logs preserve why the model changed over time.
