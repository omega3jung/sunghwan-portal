# sunghwan-portal

Portfolio project by Sunghwan Jung.

## Languages

- [English](./README.md)
- [Korean](./README.ko.md)

## Overview

`sunghwan-portal` is a **production-aligned Service Desk prototype** built with
Next.js 16 App Router, React 19, and TypeScript.

It redesigns workflows learned from an internal IT Help Desk environment as an
explicit Service Desk domain. Tickets are treated as operational entities that
move through intake, approval, assignment, work, resolution, closing, and
traceable history—not as generic CRUD records.

```txt
Service Desk is not a CRUD board.
It is a workflow-driven operational system.
```

The same feature contracts and Next.js Route Handler boundaries support a
self-contained `LOCAL` portfolio experience and PostgreSQL-backed `REMOTE`
services. The project is production-aligned, but intentionally not
production-complete.

## Live Demo

[sunghwan-portal.vercel.app](https://sunghwan-portal.vercel.app/)

Select **Try Demo** on the login page for the fastest review path. The LOCAL
experience exercises implemented ticket and settings workflows without database
credentials. REMOTE service boundaries and workflows are also implemented, but
the hosted REMOTE account deliberately guards direct Service Desk page access.

## Quick Review

A focused review takes about five minutes:

1. Open the live demo and select **Try Demo**.
2. Enter **Service Desk**, open a ticket, and inspect its details, permitted
   actions, work evidence, and **Ticket History**.
3. Open the user menu, select **Impersonation**, and compare controls across
   demo roles.
4. Open **Settings → IT Service Desk Settings** and review Tenant, Category,
   Approval Steps, and Assignment Rules.
5. Review the [canonical ticket specification](./docs/spec/ticket-system.md),
   [operation rules](./docs/en/03-domain/service-desk/ticket/reference/ticket-operation-rules.md), or
   [documentation index](./docs/en/README.md) for the underlying decisions.

## What This Project Demonstrates

- structuring a complex operational workflow as a maintainable frontend system
- redesigning a legacy Help Desk concept as an explicit Service Desk domain
- modeling commands, routing, immutable history, and work evidence beyond CRUD
- separating UI, server state, form state, client state, and server-only access
- designing role- and relationship-aware UX for requesters, assignees,
  approvers, and administrators
- keeping PostgreSQL row, repository, mapper, DTO, service, and HTTP boundaries
  explicit
- accounting for failure handling, traceability, and change impact based on
  operational experience
- maintaining current design documents separately from historical decision logs

## Key Highlights

- end-to-end ticket intake, approval, assignment, work, resolution, and closing
  workflow
- server-controlled commands paired with event-based immutable history
- category-derived priority, risk, due date, approval, and assignment behavior
- LOCAL demo adapters and PostgreSQL-backed REMOTE services behind shared
  contracts
- role/permission-aware controls with LOCAL and REMOTE impersonation flows
- per-requester draft recovery and attachment preparation boundaries
- work-session evidence with tracked-minute aggregation
- responsive dashboard, insights, ticket, and settings experiences

## Current Status

The LOCAL portfolio experience is working and can be reviewed without external
infrastructure. It includes mutable demo data for ticket workflows,
tenant-scoped settings, role-aware commands, history, and work sessions.

The REMOTE path implements server-only PostgreSQL repositories, DTO mapping,
services, transactions, and optional external API adapters for the major ticket
and settings workflows. Running it outside the hosted review path requires the
corresponding database schema and credentials or compatible external services.

The system is production-aligned rather than production-complete. Deferred
production concerns are listed under [Project Limitations](#project-limitations).

## Domain and Workflow

Tenant is the Service Desk configuration boundary, while category is the central
behavior configuration.

```txt
Company
└─ Service Desk Tenant
   └─ Category
      ├─ Approval Step
      └─ Assignment Rule

Ticket
├─ Action
├─ History
├─ Work Session
└─ Attachment metadata
```

Approval steps are resolved from the selected subcategory's parent/main
category. Assignment rules first check the selected subcategory, then fall back
to the parent/main category when no subcategory rule exists.

The persisted ticket status union is:

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

The main path is:

```txt
Draft
  -> Approval | Assigned
  -> Working
  <-> Pending
  -> Resolved
  -> Closed
```

`Open`, `Approved`, and `Reopen` are not persisted statuses. Approval completion
is an `APPROVAL_APPROVED` history event; reopen is an action that currently
transitions `Resolved -> Working`. Read requests do not mutate workflow state.

### Draft and Attachment Boundaries

REMOTE drafts are ordinary ticket rows with `status = Draft`. One active draft
is retained per requester, and final submission reuses that row before resolving
approval and work routing. Operational lists exclude drafts.

LOCAL drafts use browser `localStorage`, scoped to the current demo user. They
provide the corresponding UX but do not claim persistence equivalence with
REMOTE drafts.

Attachment input passes through the prepare route before metadata is written:

```txt
File[] / inline image
  -> Attachment Prepare API
  -> prepared body, files, and images
  -> Draft / Create / Update / Action
  -> metadata persistence
```

The current prepare route uses controlled demo-file replacement in both data
scopes. Raw files, binary data, data URLs, blob URLs, and local paths are not
persisted in ticket or history metadata.

### Action, History, and Work-Session Boundaries

Ticket actions follow a server-controlled command pipeline:

```txt
authenticate
  -> authorize
  -> validate status and input
  -> insert action when applicable
  -> mutate the ticket
  -> append immutable history
```

The current action union is:

```txt
APPROVE | DECLINE | COMMENT | NOTE | ASSIGN | ASSIGN_SELF
REJECT | MERGE | ADJUST | REOPEN | RESUBMIT | CANCEL
```

The explicit start-work route is separate from that union:

```txt
POST /api/service-desk/tickets/:ticketId/command/start-work
```

History records the affected domain area (`type`), cause (`source`),
authoritative event, actor, structured before/after values, and supplemental
metadata. Work sessions remain separate from ticket actions. The current route
surface supports list/create behavior and supported work-status transitions;
complete timer-style start/finish/switch routes are deferred.

## Architecture and State Ownership

The codebase separates domain rules, feature workflows, application contracts,
Route Handler adapters, and server data access.

```txt
Browser UI
  -> feature API/repository
  -> same-origin Next.js Route Handler
     ├─ LOCAL session -> local demo adapter/state
     └─ REMOTE session
        -> embedded portal/auth service -> PostgreSQL
        or
        -> external auth/portal API adapter
```

REMOTE portal and authentication requests use embedded services by default.
Deployment configuration can replace either boundary with a compatible external
API adapter.

The embedded data path is:

```txt
PostgreSQL row
  -> repository
  -> mapper
  -> DTO
  -> service
  -> Route Handler
  -> feature API
  -> UI
```

PostgreSQL access and credentials stay server-only. Client components consume
application contracts and do not receive database rows.

State ownership follows the same boundary discipline:

- React Query owns tickets, actions, history, work sessions, settings, and
  organization server state.
- React Hook Form owns form input and validation state.
- Zustand owns cross-component client state such as session, impersonation,
  preferences, and sidebar state.
- Component state owns transient interaction details such as dialogs and form
  steps.

Ticket, history, settings, and organization query results are not mirrored into
Zustand.

## Project Evolution and Migration

This repository was modernized incrementally while preserving the operational
behavior already represented by the project.

### Framework and Tooling

- upgraded the dependency baseline through Next.js 14 → 15 → 16
- moved React 18 → 19 and the Node.js baseline from the Node 20 range → 24,
  followed by npm 11 alignment
- adapted pages and Route Handlers to asynchronous `params`, `searchParams`,
  and request APIs required by the newer App Router
- migrated `middleware.ts` to the Next.js 16 `proxy.ts` convention while
  retaining JWT route protection and impersonation behavior
- replaced legacy lint configuration and `next lint` with ESLint 9 flat config
- preserved dependency-direction checks by integrating
  `eslint-plugin-boundaries` into the repository lint command

### UI Foundation

- migrated shadcn/ui primitives from Radix UI to Base UI and the current
  `base-nova` configuration
- moved the styling foundation from Tailwind CSS 3 to Tailwind CSS 4
- adapted shared primitives and application-specific combobox, date-picker,
  toast, menu, dialog, and form consumers to the changed component APIs
- followed the primitive migration with targeted adjustments across login,
  dashboard, ticket, mobile, and settings screens to retain established layout
  and interaction behavior

No performance improvement figures are claimed; the migration work focused on
compatibility, maintained behavior, and a current dependency baseline.

## Tech Stack

| Area                  | Current stack                                                                               |
| --------------------- | ------------------------------------------------------------------------------------------- |
| Runtime               | Node.js 24, npm 11                                                                          |
| Framework             | Next.js 16 App Router, React 19                                                             |
| Language              | TypeScript 5                                                                                |
| Styling and UI        | Tailwind CSS 4, shadcn/ui components generated with shadcn 4 on Base UI, Lucide             |
| Authentication        | NextAuth 4 Credentials Provider, JWT sessions                                               |
| Backend and data      | Next.js Route Handlers, PostgreSQL through `pg`, embedded services or external API adapters |
| Server state and HTTP | TanStack React Query 5, Axios, native server `fetch`                                        |
| Forms and validation  | React Hook Form 7, Zod 4, `@hookform/resolvers`                                             |
| Client state          | Zustand 5                                                                                   |
| Internationalization  | i18next, react-i18next                                                                      |
| Data UI               | TanStack Table 8, Recharts 3, Tiptap 3                                                      |
| Interaction           | dnd-kit, Embla Carousel, React Query Builder                                                |
| Component development | Storybook 10 with the Next.js/Vite framework                                                |
| Quality tooling       | ESLint 9, Vitest 4 browser mode, Playwright Chromium provider, Testing Library              |
| Deployment            | Vercel Analytics, Next.js standalone output                                                 |

Versions describe the installed major versions in `package.json`. The active
application data path uses `pg`; the installed Supabase JavaScript client is not
part of that path.

## Project Structure

```txt
src/
  app/          # App Router pages, layouts, providers, and Route Handlers
  auth/         # Credentials auth, session callbacks, and auth adapters
  components/   # shared UI primitives and composed widgets
  domain/       # framework-independent domain models and rules
  feature/      # feature UI, hooks, repositories, mappers, and API clients
  lib/          # application contracts, configuration, and infrastructure
  mocks/        # LOCAL users, organization data, and Service Desk scenarios
  server/       # embedded services, repositories, mappers, and DTOs
  shared/       # reusable hooks, types, constants, and utilities
  stories/      # Storybook examples
  styles/       # global Tailwind CSS and theme tokens
  types/        # global and library type augmentation
docs/
  en/           # English architecture and domain documentation
  ko/           # Korean architecture and domain documentation
  spec/         # canonical ticket-system specification
```

## Documentation

Documentation is a project deliverable rather than an afterthought. Current
design documents describe the implementation as it exists; decision logs retain
the historical context and trade-offs behind earlier choices.

Recommended entry points:

1. [Ticket System Specification](./docs/spec/ticket-system.md)
2. [Service Desk Documentation Index](./docs/en/README.md)
3. [Ticket Lifecycle](./docs/en/03-domain/service-desk/ticket/ticket-lifecycle.md)
4. [Ticket Model](./docs/en/03-domain/service-desk/ticket/ticket-model.md)
5. [Ticket Activity and Actions](./docs/en/03-domain/service-desk/ticket/ticket-activity.md)
6. [Ticket History](./docs/en/03-domain/service-desk/ticket/ticket-history.md)
7. [Service Desk Settings](./docs/en/03-domain/service-desk/settings.md)
8. [Ticket Form](./docs/en/04-engineering/forms/ticket-form.md) and
   [Attachment Design](./docs/en/04-engineering/forms/ticket-attachment.md)
9. [Implementation Strategy](./docs/en/04-engineering/service-desk-implementation-strategy.md)
10. [Ticket Operation Rules](./docs/en/03-domain/service-desk/ticket/reference/ticket-operation-rules.md)

Historical implementation decisions are under
[`docs/en/06-decisions`](./docs/en/06-decisions/).

## Quality and Verification

Current repository-level verification includes:

- Next.js production build and TypeScript compilation through `npm run build`
- ESLint 9 static analysis through `npm run lint`
- architecture dependency policies enforced by `eslint-plugin-boundaries` as
  part of that lint command
- Storybook static-build verification through `npm run build-storybook`
- Storybook/Vitest browser-mode configuration with a Playwright Chromium
  provider

The current Storybook surface contains three story files and its configuration
MDX. Testing Library is installed, but the repository contains no standalone
`*.test` or `*.spec` suites and exposes no repository-level `test` script.
Automated coverage remains an improvement area.

## Local Development

### Prerequisites

- Node.js `24.x`
- npm `11.x`

The versions are enforced through the `engines` field in `package.json`.

### Run the LOCAL Demo

```bash
npm ci
cp .env.example .env.local
npm run dev
```

On PowerShell, use `Copy-Item .env.example .env.local` instead of `cp` if
needed. Set `NEXTAUTH_SECRET` in `.env.local` to a non-empty development value,
then open [http://localhost:3000](http://localhost:3000) and select **Try Demo**.
The LOCAL experience does not require PostgreSQL or an external API.

### Available Scripts

| Command                   | Purpose                                         |
| ------------------------- | ----------------------------------------------- |
| `npm run dev`             | Start the Next.js development server            |
| `npm run dev:clean`       | Remove `.next` and start the development server |
| `npm run build`           | Create a production build                       |
| `npm run start`           | Start a previously built production server      |
| `npm run lint`            | Run ESLint and architecture boundary rules      |
| `npm run storybook`       | Start Storybook on port 6006                    |
| `npm run build-storybook` | Create a static Storybook build                 |

## Environment Variables

The checked-in [`.env.example`](./.env.example) contains the common local
configuration. Secrets and database connections must remain server-only.

### Common Application Configuration

| Variable                     | Purpose                                                                             |
| ---------------------------- | ----------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_CONTEXT`        | Presentation/runtime label such as `development`; it does not select the data scope |
| `NEXT_PUBLIC_BASE_PATH`      | Optional Next.js base path                                                          |
| `NEXT_PUBLIC_ASSET_LOGO`     | Public logo asset path                                                              |
| `NEXTAUTH_URL`               | Canonical NextAuth URL; locally `http://localhost:3000`                             |
| `NEXTAUTH_SECRET`            | Secret used to sign and encrypt NextAuth tokens                                     |
| `NEXT_PUBLIC_DB_API_URL`     | Optional client database API base URL                                               |
| `NEXT_PUBLIC_PORTAL_API_URL` | Optional client portal/file API base URL                                            |
| `NEXT_PUBLIC_NODE_API_URL`   | Optional separate Node API base URL                                                 |

LOCAL versus REMOTE behavior is selected by the authenticated session's
`dataScope`, not by `NEXT_PUBLIC_CONTEXT`.

### REMOTE Deployment Boundary

- Embedded REMOTE services use server-only authentication and portal database
  connections.
- External REMOTE adapters use server-only authentication and portal service
  base URLs instead of embedded dispatch.
- These deployment credentials are intentionally not included in the checked-in
  local example.

## Project Limitations

The current portfolio scope deliberately stops before these production
extensions:

- object storage, malware scanning, and signed download URLs
- real notification delivery
- a complete SLA calendar, pause/resume clock, breach, and escalation engine
- real-time updates
- complete work-session update/delete and timer route surfaces
- compliance-grade audit infrastructure
- advanced assignment load balancing

These boundaries distinguish implemented workflow behavior from the additional
infrastructure and controls required for a production-complete service.

## Author

**Sunghwan Jung**
Frontend Developer (React / Next.js)

- [GitHub](https://github.com/omega3jung)
- [Repository](https://github.com/omega3jung/sunghwan-portal)
- [LinkedIn](https://www.linkedin.com/in/sunghwan4jung/)
