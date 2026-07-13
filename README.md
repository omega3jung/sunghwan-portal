# sunghwan-portal

Portfolio project by Sunghwan Jung.

## Languages

- [English](./README.md)
- [Korean](./README.ko.md)

## Overview

`sunghwan-portal` is a **Service Desk system prototype** built with **Next.js 14 App Router**.

It is a production-aligned frontend portfolio project, not a simple UI showcase. The project focuses on realistic Service Desk workflows, domain boundaries, role-aware UX, authentication/session boundaries, server-state ownership, and implementation-aligned design documentation.

The core idea is:

```txt
Service Desk is not a CRUD board.
It is a workflow-driven operational system.
```

Tickets are modeled as workflow entities that move through draft, approval, work assignment, execution, resolution, immutable history, and work-session evidence.

## Live Demo

**Live Demo**: [sunghwan-portal.vercel.app](https://sunghwan-portal.vercel.app/)

The project centers on a Service Desk domain with:

- tenant-scoped Service Desk settings
- category-driven ticket intake, defaults, approval, assignment, and SLA
- REMOTE draft persistence as ticket rows with `status = Draft`
- attachment preparation with controlled demo replacement
- command-based ticket actions
- event-based immutable history
- work-session create/list and tracked-minute aggregation
- role-aware dashboard, ticket, and settings UX
- LOCAL demo behavior and REMOTE PostgreSQL/DTO boundaries

The design intent, trade-offs, and implementation approach are documented in
[`docs/en`](./docs/en/README.md).

## Project Purpose

This project was built to demonstrate more than screen implementation.

It focuses on showing the ability to:

- understand a real operational workflow
- redesign a legacy-style IT Help Desk idea into a clearer Service Desk domain
- structure a frontend project around maintainable feature and domain boundaries
- separate UI, server state, client state, authentication, and server-only data access
- model workflow commands, history, and work evidence explicitly
- document architectural reasoning and trade-offs clearly

The project is based on real operational experience from an internal Service Hub / IT Help Desk environment, then redesigned as a portfolio-ready Service Desk prototype.

## Current Scope

The current project covers:

- ticket list, search, detail, create, requester update, and command execution
- REMOTE draft persistence as normal ticket rows
- tenant-scoped settings for category, approval step, and assignment rule
- category-driven priority, risk, due date, approval, and work assignment
- attachment preparation before draft/create/update/action commands
- action-oriented ticket commands
- event-based immutable ticket history
- work-session list/create and tracked-minute aggregation
- LOCAL demo behavior and REMOTE PostgreSQL/DTO service boundaries
- documentation and decision logs as project deliverables

The project is production-aligned, not production-complete. Production object storage, notification delivery, full SLA engine, real-time updates, complete timer routes, and compliance-grade audit infrastructure remain deferred unless
explicitly implemented.

## Core Service Desk Model

```txt
Company
-> Service Desk Tenant
   -> Category
      -> Approval Step
      -> Assignment Rule

Ticket
-> Action
-> History
-> Work Session
-> Attachment metadata
```

Tenant is the configuration scope. Category is the central behavior configuration.

Approval and assignment intentionally use different resolution rules:

- Approval steps are resolved from the selected subcategory's parent/main category.
- Assignment rules check the selected subcategory first, then fall back to the parent/main category only when no subcategory rule exists.

## Ticket Workflow

The current persisted status union is:

```txt
Draft
Approval
Declined
Assigned
Working
Pending
Rejected
Resolved
Closed
```

Important rules:

- `Open` is not a persisted status.
- `Approved` is not a persisted status.
- `Reopen` is not a persisted status.
- Approval completion is recorded as `APPROVAL_APPROVED` history.
- Reopen is a ticket action whose current result is `Resolved -> Working`.
- GET/read requests must not mutate ticket status.

Main flow:

```txt
Draft
-> Approval | Assigned
-> Working
<-> Pending
-> Resolved
-> Closed
```

State changes are caused by explicit commands, workflow rules, or system operations, not hidden field updates.

## Draft and Attachment Boundary

REMOTE draft is not browser-only state and not a separate draft table.

```txt
ticket row
+ status = Draft
```

Rules:

- one active draft per requester
- draft save/update uses the draft API
- final submit reuses the same row
- submit resolves initial approval/work routing
- operational ticket lists exclude drafts
- LOCAL draft uses a simplified demo-safe implementation behind the feature API boundary and is not persistence-equivalent to the REMOTE PostgreSQL draft

Attachment input is prepared before ticket commands write metadata.

```txt
File[] / inline image
-> Attachment Prepare API
-> prepared body, files, images
-> Draft / Create / Update / Action command where applicable
-> metadata persistence
```

The current implementation uses controlled demo replacement. It does not provide production object storage. Raw `File`, binary data, base64 data URLs, blob URLs, and local paths must not be persisted in ticket rows, DTOs, action metadata, or history metadata.

## Actions, History, and Work Sessions

Ticket Action is a server-controlled command model.

```txt
Action command
-> authenticate
-> authorize
-> validate current status
-> validate action input
-> insert action when applicable
-> mutate ticket when applicable
-> create history
```

Current action union:

```txt
APPROVE
DECLINE
COMMENT
NOTE
ASSIGN
ASSIGN_SELF
REJECT
MERGE
ADJUST
REOPEN
RESUBMIT
CANCEL
```

The explicit start-work command is separate from the Ticket Action union:

```txt
POST /api/service-desk/tickets/:ticketId/command/start-work
```

It moves `Assigned -> Working`, creates `STATUS_UPDATED` history, and does not
insert a Ticket Action row.

History is event-based and immutable:

```txt
type   -> affected domain area
source -> why or which rule produced it
event  -> what happened
actor  -> who initiated it
from/to value -> structured JSON before/after
metadata -> supplemental display/audit context
```

`event` is authoritative. `SYSTEM_AUTO` is a source, not a history type.

Resolved auto-close is implemented as a system operation:

```txt
Resolved history timestamp
+ 7-day grace period
-> Closed
-> closeReason = Completed
-> finish running work sessions where applicable
-> RESOLUTION_CLOSE history
-> source = SYSTEM_AUTO
-> actionNo = null
```

Work Session is separate from Ticket Action. The current route surface supports list/create, tracked-minute aggregation, and supported work-status transitions. Timer-style start/finish/switch routes are not part of the current route surface.

## Main Features

### Service Desk

- Ticket list, search, filter, sort, and pagination
- Ticket detail page as a primary workflow
- Ticket creation and requester update flows
- REMOTE draft row recovery through draft APIs
- Attachment preparation before ticket commands
- Status, priority, risk, assignee, due date, history, and work evidence display
- Action-oriented ticket interactions
- Reopen, resubmit, reject, merge, cancel, adjust, assign, comment, and note commands
- Mobile-supported core Service Desk views

### Service Desk Settings

- Tenant settings
- Main/subcategory configuration
- Main-category approval step configuration
- Subcategory assignment override and parent/main fallback
- Company, department, job field, and employee reference integration
- LOCAL and REMOTE behavior alignment through API/DTO contracts

### Dashboard and Insights

- Dashboard as quick operational overview
- Insights as analytical/reporting view
- Chart-based summaries for Service Desk state
- Status/category/assignee/requester-department/SLA-oriented visibility

### Authentication and Session

- NextAuth v4 Credentials Provider
- JWT session strategy
- Middleware-assisted route protection
- Session-safe user projection
- Application user model separated from session model
- Session-aware impersonation design
- Role-aware UI behavior

## Tech Stack

- Framework: `next@14` App Router
- Language: `typescript`, `react@18`
- UI: `tailwindcss`, `shadcn/ui`, `radix-ui`, `lucide-react`
- Authentication: `next-auth@4`, Credentials Provider, JWT session strategy
- Database / Backend Direction: PostgreSQL through server-only access and Supabase-related infrastructure
- Data Fetching: `@tanstack/react-query`, `axios`
- Form: `react-hook-form`, `zod`
- Client State: `zustand`
- Table / Chart / Editor: `@tanstack/react-table`, `recharts`, `tiptap`
- Testing / Tooling: `vitest`, `jest`, `@testing-library/*`, `playwright`, `storybook`
- Deployment: `vercel`

## Architecture Overview

The project uses a layered, feature-based structure.

```txt
src/
  app/         # Next.js routes, layouts, route handlers
  auth/        # NextAuth integration and auth/session logic
  components/  # shared/custom UI components
  domain/      # Service Desk domain models and rules
  feature/     # feature-level screens, workflows, hooks, API clients
  lib/         # app-wide configuration and infrastructure helpers
  server/      # server-only logic, DTOs, local demo state, data access
  shared/      # reusable utilities and shared UI
  types/       # cross-cutting TypeScript types
```

Runtime flow:

```txt
UI
-> feature API client
-> Next.js Route Handler
-> LOCAL handler or REMOTE portal API/service
-> DTO
```

REMOTE data flow:

```txt
DB Row
-> Mapper
-> DTO
-> Service
-> Route Handler
-> Feature API client
-> UI
```

UI code should not access Supabase or database rows directly.

## Runtime Strategy

```txt
LOCAL  = safe portfolio demo behavior behind API routes
REMOTE = PostgreSQL / portal API-service behavior behind DTO boundaries
```

### LOCAL

LOCAL mode is designed for portfolio review.

It provides:

- safe demo interaction
- mock/demo-backed data
- server-side mutable demo state
- resettable demo behavior
- realistic API flow without requiring production infrastructure

### REMOTE

REMOTE mode is the PostgreSQL-backed path.

It is designed around:

- server-only database access
- separated database roles
- row / mapper / DTO boundaries
- route handler orchestration
- transaction boundaries for workflow mutations
- future backend extraction readiness

The project treats Supabase-related infrastructure as PostgreSQL persistence, not as a client-side shortcut.

## State Management

Server state belongs to React Query.

Examples:

- ticket list/search/detail
- active draft
- ticket actions and history
- work-session list
- tenant/category/approval-step/assignment-rule settings
- organization reference data

Client state is kept limited.

Examples:

- dialog open state
- current form step
- transient form input
- temporary UI interaction state

The project avoids duplicating server data into Zustand.

## Documentation

Documentation is one of the main deliverables of this project. It explains not only what was built, but why it was designed that way.

Recommended entry points:

1. [Ticket System Specification](./docs/spec/ticket-system.md)
2. [Service Desk System Documentation](./docs/en/README.md)
3. [Ticket System Overview](./docs/en/03-domain/ticket/ticket-system-overview.md)
4. [Ticket Lifecycle](./docs/en/03-domain/ticket/ticket-lifecycle.md)
5. [Ticket Model](./docs/en/03-domain/ticket/ticket-model.md)
6. [Ticket Activity Model](./docs/en/03-domain/ticket/ticket-activity.md)
7. [Ticket History](./docs/en/03-domain/ticket/ticket-history.md)
8. [Ticket Track Time](./docs/en/03-domain/ticket/ticket-track-time.md)
9. [Ticket Form Design](./docs/en/06-form-design/ticket-form.md)
10. [Ticket Attachment Design](./docs/en/06-form-design/ticket-attachment.md)
11. [Service Desk Settings](./docs/en/03-domain/service-desk-settings.md)
12. [Service Desk Implementation Strategy](./docs/en/08-dev-strategy/service-desk-implementation-strategy.md)
13. [Ticket Operation Rules](./docs/en/08-dev-strategy/ticket-operation-rules.md)

## Key Decision Logs

Decision logs capture important architectural and domain decisions made during development. They preserve historical reasoning and are not rewritten as current design.

Important recent logs include:

- [Service Desk Documentation Alignment](./docs/en/08-dev-strategy/decision-log/2026-05-service-desk-documentation-alignment.md)
- [Database Role and Access Strategy](./docs/en/08-dev-strategy/decision-log/2026-05-database-role-and-access-strategy.md)
- [Service Desk Tenant Design](./docs/en/08-dev-strategy/decision-log/2026-06-service-desk-tenant-design.md)
- [Service Desk Settings DTO/API Boundary](./docs/en/08-dev-strategy/decision-log/2026-06-service-desk-settings-dto-api-boundary.md)
- [Ticket Form and Draft Workflow](./docs/en/08-dev-strategy/decision-log/2026-06-ticket-form-and-draft-workflow.md)
- [Ticket Attachment Boundary](./docs/en/08-dev-strategy/decision-log/2026-06-ticket-attachment-boundary.md)
- [Ticket Routing and Update Policy](./docs/en/08-dev-strategy/decision-log/2026-07-ticket-routing-and-update-policy.md)
- [Ticket Action and History Execution](./docs/en/08-dev-strategy/decision-log/2026-07-ticket-action-and-history-execution.md)

## Local Development

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Default local URL:

```txt
http://localhost:3000
```

Useful scripts:

```bash
npm run dev
npm run dev:clean
npm run build
npm run start
npm run lint
npm run storybook
npm run build-storybook
```

## Environment

The project uses environment variables for authentication, runtime context, and API/database behavior.

Common environment values include:

- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `NEXT_PUBLIC_BASE_PATH`
- `NEXT_PUBLIC_CONTEXT`
- database/API connection variables for server-side access

Secrets and database credentials should remain server-only.

## Project Status

This is a portfolio/demo project, but it is intentionally structured like a real application.

Current implementation includes a working LOCAL demo and staged REMOTE PostgreSQL/DTO integration.

Production-grade areas intentionally deferred include:

- production object storage, file scanning, and signed download URLs
- real notification delivery
- full SLA calendar, pause/resume clock, breach, and escalation engine
- real-time updates
- complete work-session update/delete/timer route surface
- compliance-grade audit infrastructure
- advanced assignment load balancing

These are future expansion points, not ignored concerns.

## What This Project Demonstrates

This project is intended to demonstrate:

- practical frontend architecture with Next.js App Router
- workflow-oriented domain modeling
- TypeScript-based API and model boundaries
- role-aware and permission-aware UI design
- server/client boundary awareness
- React Query server-state strategy
- local demo architecture that behaves like a realistic API flow
- authentication/session/impersonation design judgment
- database access and DTO boundary thinking
- documentation and decision-log discipline

## Author

**Sunghwan Jung**
Frontend Developer (React / Next.js)

- GitHub: https://github.com/omega3jung
- Repository: https://github.com/omega3jung/sunghwan-portal
- LinkedIn: https://www.linkedin.com/in/sunghwan4jung/
