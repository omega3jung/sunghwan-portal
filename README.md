# sunghwan-portal

Portfolio project by Sunghwan Jung.

## Languages

- [English](./README.md)
- [Korean](./README.ko.md)

## Overview

`sunghwan-portal` is a **Service Desk system prototype** built with **Next.js 14 App Router**.

It is designed as a production-aligned frontend portfolio project rather than a simple UI showcase.
The project focuses on realistic Service Desk workflows, domain structure, role-aware UX, authentication/session boundaries, and documented design decisions.

The core idea is:

```txt
Service Desk is not a CRUD board.
It is a workflow-driven operational system.
```

This project models tickets as workflow entities that move through request intake, approval, assignment, work, resolution, history, and audit flows.

## Live Demo

**Live Demo**: [sunghwan-portal.vercel.app](https://sunghwan-portal.vercel.app/)

The project centers on a Service Desk domain with:

- Category-driven ticket workflow
- Approval and assignment logic
- SLA-aware behavior
- Audit/history tracking
- Role-aware dashboard and settings UX
- Authentication and impersonation strategy

It also serves as a documentation-heavy portfolio project.
The design intent, trade-offs, and implementation approach are documented in
[`docs/en`](./docs/en/README.md).

## Project Purpose

This project was built to demonstrate more than screen implementation.

It focuses on showing the ability to:

- understand a real business workflow
- redesign a legacy-style IT Help Desk idea into a clearer Service Desk domain
- structure a frontend project around maintainable feature and domain boundaries
- separate UI, server state, client state, authentication, and server-only data access
- document architectural reasoning and trade-offs clearly

The project is based on real operational experience from an internal Service Hub / IT Help Desk environment, then redesigned as a portfolio-ready Service Desk prototype.

## Current Focus

The project has evolved from an earlier authentication/template-style application into a concrete Service Desk system.

Current focus areas include:

- workflow-driven ticket lifecycle
- tenant-scoped Service Desk configuration
- category-driven approval, assignment, SLA, priority, and risk behavior
- action-oriented activity model
- immutable ticket history and auditability
- session-based work tracking direction
- role-aware and permission-aware UI
- LOCAL demo behavior and REMOTE/Supabase integration path
- DTO/API boundaries for Service Desk settings
- documentation and decision logs as part of the project deliverable

## Core Service Desk Model

The current Service Desk model is organized around the following concepts:

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

### Tenant and Category

The current configuration model is:

```txt
Company = organization/reference entity
Tenant = Service Desk configuration boundary
Category = tenant-scoped behavior configuration
```

Category is not just a label.
It drives key ticket behavior, including:

- approval requirements
- assignment rules
- default priority
- default risk level
- SLA defaults
- request template behavior

The category hierarchy is:

```txt
Tenant -> Main Category -> Sub Category
```

### Ticket Workflow

A ticket is treated as a workflow entity, not just a database record.

The lifecycle includes normal and non-happy paths such as:

```txt
Draft -> Open -> Approved -> Working -> Resolved -> Closed

Open -> Declined -> Open
Working <-> Pending
Working / Pending -> Rejected
Resolved -> Reopen -> Working
```

State changes should be caused by explicit actions and rules, not hidden field updates.

### Activity and History

The project separates user-facing activity from immutable history.

```txt
Activity = meaningful user/operational interaction
History = immutable audit/event record
```

Examples of activity/action types include:

- comment
- note
- assign
- adjust
- merge
- reject
- request review
- reopen
- resubmit

This makes the timeline easier to understand and keeps operational changes traceable.

## Main Features

### Service Desk

- Ticket list, search, filter, sort, and pagination
- Ticket detail page as a primary workflow
- Ticket creation dialog with structured form flow
- Status, priority, assignee, SLA, and history display
- Action-oriented ticket interactions
- Merge/reject/reopen/review-oriented workflow direction
- Mobile-supported core Service Desk views

### Service Desk Settings

- Tenant settings
- Category configuration
- Approval step configuration
- Assignment rule configuration
- Company / department / job field reference data integration direction
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
- Database / Backend Direction: `supabase` PostgreSQL
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

The general runtime flow is:

```txt
UI
-> feature API client
-> Next.js Route Handler
-> LOCAL handler or REMOTE/Supabase DTO service
```

The UI should not know whether a request is backed by local demo state or remote persistence.

## Runtime Strategy

The project distinguishes LOCAL and REMOTE behavior.

```txt
LOCAL  = mock-backed, safe portfolio demo behavior
REMOTE = Supabase PostgreSQL / API-backed behavior
```

### LOCAL

LOCAL mode is designed for portfolio review.

It provides:

- safe demo interaction
- mock-backed data
- server-side mutable local state
- resettable demo behavior
- realistic API flow without requiring production infrastructure

### REMOTE

REMOTE mode is the Supabase/PostgreSQL-backed path.

It is designed around:

- server-only database access
- separated database roles
- Row / Mapper / DTO boundaries
- route handler orchestration
- future backend extraction readiness

The project treats Supabase as PostgreSQL persistence, not just a client-side BaaS shortcut.

## Data and API Boundary

The database/API direction follows:

```txt
Database Row -> Mapper -> DTO
```

Service Desk settings data uses DTO/API boundaries to keep the UI independent from database schema details.

Settings domains include:

- Tenant
- Category
- Approval Step
- Assignment Rule

Route handlers are treated as orchestration boundaries.
They should resolve request/session/runtime context and delegate domain logic to server-side handlers or services.

Speculative CRUD routes are avoided unless they support an actual workflow.

## State Management

Server state is managed with React Query.

Examples:

- ticket list
- ticket detail
- tenant/category/settings data
- reference data
- history/activity data
- mutable LOCAL demo server state responses

Client state is kept limited.

Examples:

- dialog open state
- temporary UI state
- runtime facade state
- local interaction state

The project avoids duplicating server data into Zustand.

## Documentation

Documentation is one of the main deliverables of this project.

The documentation explains not only what was built, but why it was designed that way.

Recommended entry points:

1. [Ticket System Specification](./docs/spec/ticket-system.md)
2. [Service Desk System Documentation](./docs/en/README.md)
3. [Feature-Based Structure](./docs/en/02-architecture/feature-based-structure.md)
4. [Database Strategy](./docs/en/02-architecture/database-strategy.md)
5. [Auth & Session Strategy](./docs/en/02-architecture/auth-session-strategy.md)
6. [Ticket System Overview](./docs/en/03-domain/ticket/ticket-system-overview.md)
7. [Ticket Lifecycle](./docs/en/03-domain/ticket/ticket-lifecycle.md)
8. [Ticket Activity Model](./docs/en/03-domain/ticket/ticket-activity.md)
9. [Ticket History](./docs/en/03-domain/ticket/ticket-history.md)
10. [Service Desk Implementation Strategy](./docs/en/08-dev-strategy/service-desk-implementation-strategy.md)
11. [Ticket Operation Rules](./docs/en/08-dev-strategy/ticket-operation-rules.md)

## Key Decision Logs

The decision logs capture important architectural and domain decisions made during development.

Important recent logs include:

- [Service Desk Documentation Alignment](./docs/en/08-dev-strategy/decision-log/2026-05-service-desk-documentation-alignment.md)
- [Database Role and Access Strategy](./docs/en/08-dev-strategy/decision-log/2026-05-database-role-and-access-strategy.md)
- [Barrel Export Boundary Policy](./docs/en/08-dev-strategy/decision-log/2026-05-barrel-export-boundary.md)
- [Service Desk Tenant Design](./docs/en/08-dev-strategy/decision-log/2026-06-service-desk-tenant-design.md)
- [Service Desk Settings DTO/API Boundary](./docs/en/08-dev-strategy/decision-log/2026-06-service-desk-settings-dto-api-boundary.md)

These documents help explain how the system evolved through practical implementation pressure.

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

Current implementation includes a working LOCAL demo and staged REMOTE/Supabase integration.

Some production-grade areas are intentionally deferred, including:

- full remote persistence for every Service Desk workflow
- production-grade file upload/storage/security
- real notification delivery
- real-time WebSocket updates
- full enterprise rule engine
- complete SLA calendar/holiday engine
- full compliance-grade audit infrastructure

These are treated as future expansion points, not as ignored concerns.

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
