# Ticket System Specification

## Languages

- [English](./ticket-system.md)
- [Korean](./ticket-system.ko.md)

## Goal

This specification summarizes the current Service Desk ticket system.

The ticket system is workflow-driven, not CRUD-driven. A ticket is a workflow
entity that moves through approval, assignment, SLA, activity, history, and work
session behavior.

This file is a high-level specification and documentation hub. Detailed rules,
implementation notes, and decision history live in the linked documents.

## Current Scope

The current project covers:

- ticket list, detail, create, and update flows
- tenant-scoped category configuration
- category-driven approval, assignment, SLA, priority, risk, and request template behavior
- action-based activity and timeline behavior
- immutable history and audit records
- session-based work tracking direction
- LOCAL demo behavior with safe server-side mock state
- REMOTE/Supabase-aligned DTO/API boundaries for settings and reference data

The project is production-aligned, not production-complete. It intentionally
keeps some infrastructure-heavy areas deferred while still modeling realistic
Service Desk workflows.

## Core Domain Model

The current Service Desk model separates configuration from ticket execution.

```txt
Tenant
  -> Category
  -> Approval
  -> Assignment
  -> SLA

Ticket
  -> Activity / Action
  -> Track Time
  -> History
```

`Ticket` is not only a database record. It is the current state of a controlled
workflow, while related models explain how that state was configured, changed,
and audited.

## Tenant and Category Configuration

The current configuration model is:

```txt
Company = organization/reference entity
Tenant = Service Desk configuration boundary
Category = tenant-scoped behavior configuration
```

Category hierarchy:

```txt
Tenant -> Main Category -> Sub Category
```

A tenant owns the Service Desk configuration scope. Categories belong to a
tenant and drive ticket behavior.

- Main Category provides defaults.
- Sub Category refines or overrides those defaults.
- Approval, assignment, SLA, priority, risk, and request templates are
  interpreted within tenant scope.
- Ticket-level overrides are allowed only when they are explicit, visible, and
  traceable.

See:

- [Category Strategy](../en/03-domain/ticket/strategy/category-strategy.md)
- [2026-06 Service Desk Tenant Design](../en/08-dev-strategy/decision-log/2026-06-service-desk-tenant-design.md)

## Ticket Lifecycle and Status

The lifecycle models both the happy path and operational branches.

Current status vocabulary includes:

```txt
Draft
Open
Approved
Declined
Working
Pending
Rejected
Reopen
Resolved
Closed
```

The main success path is:

```txt
Draft -> Open -> Approved -> Working -> Resolved -> Closed
```

Real workflows may skip approval, pause in `Pending`, become `Rejected`, return
through `Reopen`, or close through merge handling. This spec does not define
every transition; executable transition rules are kept in the rules document.

See:

- [Ticket Lifecycle](../en/03-domain/ticket/ticket-lifecycle.md)
- [Ticket Operation Rules](../en/08-dev-strategy/ticket-operation-rules.md)

## Action / Activity Model

The system is action-oriented, not comment-only.

```txt
Activity = Action + Context + Reason + Execution Rules
```

Communication and operational changes share one activity model.

Current or documented action types include:

- `comment`
- `note`
- `assign`
- `adjust`
- `merge`
- `reject`
- `requestReview`
- `reopen`
- `resubmit`
- `assignSelf`

Communication actions may be mutable under author-based rules. Operational
actions represent decisions and are normally immutable.

See:

- [Ticket Activity Model](../en/03-domain/ticket/ticket-activity.md)
- [Action Strategy](../en/03-domain/ticket/strategy/action-strategy.md)
- [2026-04 Ticket Action](../en/08-dev-strategy/decision-log/2026-04-ticket-action.md)

## History and Audit Model

Activity and history have different responsibilities.

```txt
Activity = user-facing meaningful interaction
History = immutable event/audit record
```

History records are generated from meaningful changes and should not be updated
or deleted in normal workflow operations. Corrections should be represented as
new events.

See:

- [Ticket History](../en/03-domain/ticket/ticket-history.md)

## Approval Strategy

Approval is category-driven and sequential.

```txt
Tenant-scoped Category -> approvalSteps[]
```

Approval steps belong to category configuration and are interpreted within the
tenant boundary. Approval may be skipped based on requester authority when the
category configuration defines a skip threshold.

See:

- [Approval System](../en/03-domain/ticket/strategy/approval-system.md)

## Assignment Strategy

Assignment is resolved from tenant-scoped category configuration.

```txt
Ticket -> Category -> Assignment Rule -> Assignee
```

Assignment rules determine routing, assignees, or fallback behavior. Reassignment
is allowed only through explicit actions and must remain visible in activity and
history.

See:

- [Assignment Policy](../en/03-domain/ticket/strategy/assignment-policy.md)

## SLA Strategy

SLA behavior is category/risk/priority-aware.

Category configuration may seed default risk, priority, and SLA values. The SLA
matrix remains the resolution model for due dates and service expectations.

SLA breach handling, escalation automation, business calendars, and holiday
engines remain production extension points unless implemented explicitly.

See:

- [SLA Strategy](../en/03-domain/ticket/strategy/sla-strategy.md)

## Work Session / Track Time

Work time is modeled as sessions, not as a single source-of-truth accumulated
field.

```txt
Work = collection of sessions
```

The track-time model supports:

- start
- finish
- switch
- manual time entry as a separate mode
- derived aggregate duration

This better reflects interruption, resumption, and task switching in real
operations.

See:

- [Ticket Track Time](../en/03-domain/ticket/ticket-track-time.md)
- [2026-03 Ticket Session](../en/08-dev-strategy/decision-log/2026-03-ticket-session.md)

## Ownership and Permission Context

Ownership is derived, not stored as a fixed persisted state.

Typical ownership context includes:

- requester relationship
- assignee relationship
- current session user
- original/effective user during impersonation

Requester, assignee, permission, and current user context affect which actions
are visible and executable.

Authentication identity, session-safe user projection, and `AppUser` remain
separate. Impersonation is session-aware and preserves original and current user
context for auditability.

See:

- [Auth & Session Strategy](../en/02-architecture/auth-session-strategy.md)
- [Impersonation Strategy](../en/02-architecture/impersonation-strategy.md)

## Attachments

Tickets support file and image attachment concepts.

Attachment behavior is intentionally conservative in the current portfolio
scope. Local/demo behavior may use controlled or prepared attachment references.
Production-grade upload, storage, scanning, access control, and cleanup policies
are deferred unless implemented explicitly.

## LOCAL / REMOTE Runtime Boundary

The Service Desk supports two runtime paths:

```txt
LOCAL  = mock-backed demo behavior
REMOTE = Supabase PostgreSQL / API-backed behavior
```

The intended request flow is:

```txt
UI
-> feature API client
-> Next.js Route Handler
-> LOCAL handler or REMOTE DTO/service
```

The UI should not branch on LOCAL/REMOTE internals. Runtime-specific behavior
belongs behind route handlers, server handlers, local state modules, services,
repositories, and DTO mappers.

See:

- [Service Desk Implementation Strategy](../en/08-dev-strategy/service-desk-implementation-strategy.md)
- [React Query Strategy](../en/05-data-fetching/react-query-strategy.md)

## DTO / API Boundary

REMOTE data access should follow:

```txt
Database Row -> Mapper -> DTO
```

DTOs hide database row shape and provide application-facing contracts. LOCAL and
REMOTE paths should return compatible DTOs so UI code does not depend on mock
shape versus database shape.

Service Desk settings domains include:

- Tenant
- Category
- Approval Step
- Assignment Rule

Route handlers should remain orchestration boundaries. Speculative CRUD routes
should not be kept unless they support an actual workflow and have clear
LOCAL/REMOTE behavior.

See:

- [Database Strategy](../en/02-architecture/database-strategy.md)
- [2026-06 Service Desk Settings DTO/API Boundary](../en/08-dev-strategy/decision-log/2026-06-service-desk-settings-dto-api-boundary.md)

## Deferred Scope

Deferred or future expansion areas include:

- full remote persistence for every Service Desk workflow
- production-grade file upload, storage, and security
- complete enterprise authorization and rule engine
- real-time updates
- full notification delivery
- full SLA calendar and holiday engine
- full audit/compliance infrastructure

These are not promised by this spec. They are intentionally separated from the
current production-aligned portfolio scope.

## Related Documents

### Overview

- [Service Desk Documentation Index](../en/README.md)
- [Ticket System Overview](../en/03-domain/ticket/ticket-system-overview.md)
- [Ticket Model](../en/03-domain/ticket/ticket-model.md)

### Domain

- [Ticket Lifecycle](../en/03-domain/ticket/ticket-lifecycle.md)
- [Ticket Activity Model](../en/03-domain/ticket/ticket-activity.md)
- [Ticket History](../en/03-domain/ticket/ticket-history.md)
- [Ticket Track Time](../en/03-domain/ticket/ticket-track-time.md)

### Strategy

- [Category Strategy](../en/03-domain/ticket/strategy/category-strategy.md)
- [Approval System](../en/03-domain/ticket/strategy/approval-system.md)
- [Assignment Policy](../en/03-domain/ticket/strategy/assignment-policy.md)
- [SLA Strategy](../en/03-domain/ticket/strategy/sla-strategy.md)
- [Action Strategy](../en/03-domain/ticket/strategy/action-strategy.md)
- [Ticket Operation Rules](../en/08-dev-strategy/ticket-operation-rules.md)
- [Service Desk Implementation Strategy](../en/08-dev-strategy/service-desk-implementation-strategy.md)

### Architecture

- [Database Strategy](../en/02-architecture/database-strategy.md)
- [Auth & Session Strategy](../en/02-architecture/auth-session-strategy.md)
- [Impersonation Strategy](../en/02-architecture/impersonation-strategy.md)

### Data Fetching

- [React Query Strategy](../en/05-data-fetching/react-query-strategy.md)

### Decision Logs

- [2026-03 Ticket Session](../en/08-dev-strategy/decision-log/2026-03-ticket-session.md)
- [2026-04 Ticket Action](../en/08-dev-strategy/decision-log/2026-04-ticket-action.md)
- [2026-06 Service Desk Tenant Design](../en/08-dev-strategy/decision-log/2026-06-service-desk-tenant-design.md)
- [2026-06 Service Desk Settings DTO/API Boundary](../en/08-dev-strategy/decision-log/2026-06-service-desk-settings-dto-api-boundary.md)
