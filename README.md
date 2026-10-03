# sunghwan-portal

Portfolio project by Sunghwan Jung.

## Languages

- [English](./README.md)
- [Korean](./README.ko.md)

## Overview

`sunghwan-portal` is a **production-aligned Service Desk prototype** built with
Next.js 16 App Router, React 19, and TypeScript.

It adapts workflows learned from an internal IT Help Desk environment into
defined Service Desk rules. Each ticket moves through intake, approval,
assignment, work, resolution, and closing, with actions and changes recorded in
a traceable history.

```txt
Service Desk is not a CRUD board.
It is a workflow-driven operational system.
```

The feature APIs use the same request and response formats for the self-contained
`LOCAL` demo and PostgreSQL-backed `REMOTE` services. Next.js Route Handlers
select the appropriate processing path. The project follows production design
practices, while some capabilities needed for a complete production service are
outside its scope.

## Live Demo

[sunghwan-portal.vercel.app](https://sunghwan-portal.vercel.app/)

Select **Try Demo** on the login page to start reviewing the project. The LOCAL
demo lets you use the implemented ticket and settings workflows without
database credentials. REMOTE services and their workflows are also implemented.

## Quick Review

A focused review takes about five minutes:

1. Open the live demo and select **Try Demo**.
2. Enter **Service Desk**, open a ticket, and inspect its details, permitted
   actions, work records, and **Ticket History**.
3. Open the user menu, select **Impersonation**, and compare controls across
   demo roles.
4. Open **Settings → IT Service Desk Settings** and review Tenant, Category,
   Approval Steps, and Assignment Rules.
5. Open **Storybook** from the application menu and inspect reusable custom
   components, representative application-wide UI, Controls, and interactions.
6. Review the [canonical ticket specification](./docs/spec/ticket-system.md),
   [operation rules](./docs/en/03-domain/service-desk/ticket/reference/ticket-operation-rules.md), or
   [documentation index](./docs/en/README.md) for design and workflow details.

## What This Project Demonstrates

- structuring a complex operational workflow as a maintainable frontend system
- adapting a legacy Help Desk concept into defined Service Desk rules
- modeling commands, approval and work assignment, immutable history, and work
  records alongside basic data operations
- separating UI, server state, form state, client state, and server-only access
- designing role- and relationship-aware UX for requesters, assignees,
  approvers, and administrators
- assigning separate roles to PostgreSQL rows, repositories, mappers, data
  transfer objects (DTOs), services, and HTTP handlers
- accounting for failure handling, traceability, and change impact based on
  operational experience
- separating risk-based Vitest coverage from focused Storybook UI inspection
- maintaining current design documents separately from historical decision logs

## Key Highlights

- end-to-end ticket intake, approval, assignment, work, resolution, and closing
  workflow
- server-controlled commands paired with event-based immutable history
- deriving priority, risk, due dates, approval, and assignment from category
  settings
- LOCAL demo adapters and PostgreSQL-backed REMOTE services behind shared
  API formats and expected behavior
- role/permission-aware controls with LOCAL and REMOTE impersonation flows
- per-requester draft recovery and attachment preparation before saving
- separate work-session records with total tracked minutes
- responsive dashboard, ticket-backed Insights, ticket, and settings
  experiences
- focused Storybook UI inspection available through the application `/storybook`
  route

## Current Status

Feature development is complete for the portfolio scope. The repository
presents the implemented system and its design for review. The production
extensions listed below are excluded from this scope and do not describe planned
work.

The LOCAL portfolio experience is working and can be reviewed without external
infrastructure. It includes mutable demo data for ticket workflows,
tenant-scoped settings, role-aware commands, history, and work sessions.

The REMOTE path implements server-only PostgreSQL repositories, DTO mapping,
services, transactions, and optional external API adapters for the major ticket
and settings workflows. Running it outside the hosted review path requires the
corresponding database schema and credentials or compatible external services.
Database setup files are not included in the tracked repository, so the LOCAL
demo is the self-contained setup for reviewers.

In REMOTE, Supabase Cron directly calls the resolved-ticket auto-close database
function at the start of every hour. The function and scheduled calls have been
verified; verification evidence is recorded in the
[scheduling decision](./docs/en/06-decisions/2026-09-resolved-auto-close-scheduling.md).

The design accounts for production structure and rules, while some capabilities
needed to operate a complete production service remain outside the implemented
scope. See [Project Limitations](#project-limitations).

## Domain and Workflow

Service Desk settings are managed per Tenant. Categories define the rules that
control ticket behavior within a Tenant.

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

The ticket status values stored in the system are:

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

`Open`, `Approved`, and `Reopen` are not stored ticket statuses. Approval completion
is an `APPROVAL_APPROVED` history event; reopen is an action that currently
transitions `Resolved -> Working`. Ticket and subresource reads do not mutate
workflow state.

### Draft and Attachment Boundaries

REMOTE drafts are ordinary ticket rows with `status = Draft`. One active draft
is retained per requester. Final submission reuses that row, then determines
approval and work assignees. Operational ticket lists exclude drafts.

LOCAL drafts are stored in browser `localStorage` for the current demo user.
They provide the corresponding draft-recovery experience; REMOTE drafts are
stored in PostgreSQL, so the storage behavior differs.

Selected files and inline images pass through the prepare route before their
metadata is saved:

```txt
File[] / inline image
  -> Attachment Prepare API
  -> prepared body, files, and images
  -> Draft / Create / Update / Action
  -> metadata persistence
```

The current prepare route replaces selected files and inline images with
controlled demo files in both LOCAL and REMOTE. It does not upload them to a
file storage service. For attachments, tickets and history store only the
prepared metadata. Raw files, binary data, data URLs, blob URLs, and local paths
are not stored in ticket or history metadata.

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

The supported ticket action types are:

```txt
APPROVE | DECLINE | COMMENT | NOTE | ASSIGN | ASSIGN_SELF
REJECT | MERGE | ADJUST | REOPEN | RESUBMIT | CANCEL
```

The explicit start-work route is separate from those ticket action types:

```txt
POST /api/service-desk/tickets/[ticketId]/command/start-work
```

History records the affected domain area (`type`), cause (`source`), recorded
event that identifies the change, actor, structured before/after values, and
supplemental metadata. Work sessions remain separate from ticket actions. Current
and previous work assignees may submit work records, while only a current work
assignee may change status through a work-session submission. The current routes
support listing and creating work sessions and the supported work-status
transitions. Complete timer-style start/finish/switch routes are outside the
current scope.

## Architecture and State Ownership

The codebase separates domain rules, feature workflows, shared application data
formats and interfaces, HTTP request handling, and server data access.

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
Deployment configuration can replace either embedded service with an adapter
that calls a compatible external API.

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

Repositories query PostgreSQL, and mappers convert database rows into DTOs for
API responses. Services apply workflow rules, and Route Handlers receive HTTP
requests and delegate processing to services. PostgreSQL access and credentials
stay server-only. Client components consume the application response formats
and do not receive database rows.

Each kind of state has a specific owner:

- React Query owns tickets, actions, history, work sessions, settings, and
  organization server state.
- React Hook Form owns form input and validation state.
- Zustand owns cross-component client state such as session, impersonation,
  preferences, and sidebar state.
- Component state owns transient interaction details such as dialogs and form
  steps.
- Page-level hooks use `sessionStorage` to restore Service Desk ticket-search
  and Insights criteria, scope, sorting, and pagination within the current tab.

Ticket, history, settings, and organization query results are not mirrored into
Zustand. The current Service Desk search pages do not synchronize their search
state to URL query parameters.

## Project Evolution and Migration

The framework, tooling, and UI components were updated incrementally while
preserving the project's existing operational behavior.

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
- followed the migration with targeted adjustments across login,
  dashboard, ticket, mobile, and settings screens to retain established layout
  and interaction behavior

The migration focused on compatibility, preserving behavior, and updating the
dependency baseline. It does not claim measured performance improvements.

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
  stories/      # focused Storybook states, Controls, interactions, and compositions
  styles/       # global Tailwind CSS and theme tokens
  types/        # global and library type augmentation
docs/
  en/           # English overview, architecture, domain, engineering, release, and decision docs
  ko/           # Korean translations aligned to the English documentation structure
  spec/         # canonical English and Korean ticket-system specifications
```

## Documentation

Documentation is a core project deliverable. Current design documents describe
the implemented system; decision logs retain the historical context, alternatives,
and trade-offs behind earlier choices.

Recommended entry points:

1. [Ticket System Specification](./docs/spec/ticket-system.md)
2. [Service Desk Documentation Index](./docs/en/README.md)
3. [Ticket System Overview](./docs/en/03-domain/service-desk/ticket/ticket-system-overview.md)
4. [Service Desk Settings](./docs/en/03-domain/service-desk/settings.md)
5. [Ticket Lifecycle](./docs/en/03-domain/service-desk/ticket/ticket-lifecycle.md)
6. [Ticket Model](./docs/en/03-domain/service-desk/ticket/ticket-model.md)
7. [Ticket Action](./docs/en/03-domain/service-desk/ticket/ticket-action.md)
8. [Ticket History](./docs/en/03-domain/service-desk/ticket/ticket-history.md)
9. [Ticket Work Session](./docs/en/03-domain/service-desk/ticket/ticket-work-session.md)
10. [Ticket Form](./docs/en/04-client-engineering/forms/ticket-form.md) and
    [Attachment Design](./docs/en/04-client-engineering/forms/ticket-attachment.md)
11. [Implementation Strategy](./docs/en/05-development/service-desk-implementation-strategy.md)
12. [Testing Strategy](./docs/en/05-development/testing-strategy.md)
13. [Boolean Naming Convention](./docs/en/05-development/boolean-naming-convention.md)
14. [README Strategy](./docs/en/05-development/readme-strategy.md)
15. [Ticket Operation Rules](./docs/en/03-domain/service-desk/ticket/reference/ticket-operation-rules.md)

Historical decision records are indexed in
[Decision Documentation](./docs/en/06-decisions/README.md).

## Quality and Verification

Current repository-level verification includes:

- 178 source-local Vitest test/spec files matched by the unit project's include
  pattern (static file count; `npm test` runs this project)
- ESLint 9 static analysis through `npm run lint`
- architecture dependency policies enforced by `eslint-plugin-boundaries` as
  part of that lint command
- 23 Storybook files with 100 Story entries (static counts) across custom
  components and selected layout, menu, and feature-presentation UI
- Storybook static-build verification through `npm run build-storybook`
- a separate Storybook/Vitest browser project with six selected `play`
  interaction files and a headless Playwright Chromium provider
- an application production build that embeds the Storybook static output and
  then builds Next.js through `npm run build`

The default `npm test` command runs only the unit project. The Storybook browser
project is run explicitly to diagnose UI interactions. It still has documented
interaction failures and is not enforced as a passing CI requirement. See the
[Testing Strategy](./docs/en/05-development/testing-strategy.md) for ownership,
scope, and what each check verifies.

## Local Development

### Prerequisites

- Node.js `24.x`
- npm `11.x`

The supported versions are declared in the `engines` field in `package.json`.

### Run the LOCAL Demo

```bash
npm ci
cp .env.example .env.local
```

On PowerShell, use `Copy-Item .env.example .env.local` instead of `cp` if
needed. Set `NEXTAUTH_SECRET` in `.env.local` to a non-empty development value,
then start the application:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and select **Try Demo**.
The LOCAL experience does not require PostgreSQL or an external API.

To run Next.js and Storybook together and use the application `/storybook`
route, run `npm run dev:all`. This starts Storybook on port 6006 without opening
a browser automatically.

### Available Scripts

| Command                       | Purpose                                                                 |
| ----------------------------- | ----------------------------------------------------------------------- |
| `npm run dev`                 | Start only the Next.js development server                               |
| `npm run dev:all`             | Start Next.js and Storybook together without auto-opening a browser     |
| `npm run dev:clean`           | Remove `.next` and start the Next.js development server                 |
| `npm test`                    | Run the default Vitest unit project                                     |
| `npm run test:watch`          | Run the Vitest unit project in watch mode                               |
| `npm run lint`                | Run ESLint and architecture dependency rules                            |
| `npm run storybook`           | Start Storybook on port 6006 and allow its normal browser-open behavior |
| `npm run storybook:no`        | Start Storybook on port 6006 without opening a browser                  |
| `npm run build-storybook`     | Create a standalone static Storybook build                              |
| `npm run build-storybook:app` | Build Storybook and copy it into the application public assets          |
| `npm run build`               | Embed Storybook and create the Next.js production build                 |
| `npm run start`               | Start a previously built production server                              |

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

The authenticated session's `dataScope` selects LOCAL or REMOTE processing.
`NEXT_PUBLIC_CONTEXT` supplies a display/runtime label and does not select that
processing path.

### REMOTE Deployment Boundary

- Embedded REMOTE services use server-only authentication and portal database
  connections.
- External REMOTE adapters use server-only authentication and portal service
  base URLs to call external services instead of the embedded services.
- These deployment credentials are intentionally not included in the checked-in
  local example.

## Project Limitations

The portfolio retains these implementation limits and excludes the following
production capabilities:

- object storage, malware scanning, and signed download URLs
- real notification delivery
- a complete SLA calendar, pause/resume clock, breach, and escalation engine
- real-time updates
- complete work-session update/delete and timer routes
- compliance-grade audit infrastructure
- advanced assignment load balancing
- dashboard summary cards use fixed display values; Insights aggregates
  the authorized ticket search results
- manual `ASSIGN` validates the actor, status, and non-empty assignee list but
  does not revalidate candidate eligibility against the category routing policy;
  see the [Assignment Policy](./docs/en/03-domain/service-desk/ticket/strategy/assignment-policy.md)
- recipient addresses are saved without employee/company eligibility
  validation; notification delivery is outside the implemented scope

These limits identify the additional infrastructure and controls needed to run
the implemented workflows as a complete production service.

## Author

**Sunghwan Jung**
Frontend Developer (React / Next.js)

- [GitHub](https://github.com/omega3jung)
- [Repository](https://github.com/omega3jung/sunghwan-portal)
- [LinkedIn](https://www.linkedin.com/in/sunghwan4jung/)
