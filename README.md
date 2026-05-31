# sunghwan-portal

Portfolio project by Sunghwan Jung.

## Languages

- [English](README.md)
- [Korean](README.ko.md)

This repository is a **Service Desk system prototype** built with **Next.js 14 App Router**.
It is designed as a production-aligned frontend system rather than a simple UI showcase,
with a strong focus on domain structure, operational workflows, and documented design decisions.

## Overview

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

## Current Focus

The repository reflects a shift from an earlier auth-template-style project into a more concrete
Service Desk application.

Today, the project is organized around:

- Domain-first design instead of generic CRUD
- Feature-based frontend architecture
- NextAuth-based authentication with JWT session strategy
- LOCAL/REMOTE runtime separation through route-handler orchestration
- React Query for server-state management
- Admin/configuration workflows such as Service Desk Settings
- Decision logs that explain how the project evolved month by month

## Tech Stack

- Framework: `next@14`
- Language: `typescript`
- UI: `tailwindcss`, `shadcn/ui`, `radix-ui`, `lucide-react`
- Auth: `next-auth@4` with Credentials provider and JWT session strategy
- Data Fetching: `axios`, `@tanstack/react-query`
- Forms: `react-hook-form`, `zod`
- State: `zustand`
- Charts / Tables / Editors: `recharts`, `@tanstack/react-table`, `@tiptap/react`
- Storybook: `storybook@10`
- Testing: `vitest`, `jest`, `@testing-library/*`, `playwright`

## Project Structure

The project uses a layered structure under [`src`](./src):

```txt
src/
  app/         # Next.js routes, layouts, protected/public pages
  auth/        # NextAuth integration, authorize/session logic
  components/  # Shared and custom UI components
  domain/      # Service Desk domain models and rules
  feature/     # Feature-level screens and workflows
  lib/         # App-wide configuration and infrastructure helpers
  server/      # Server-specific logic
  shared/      # Reusable shared utilities and UI
  types/       # Cross-cutting TypeScript types
```

Some important top-level paths:

- [`src/app`](./src/app): route structure for demo, settings, and protected pages
- [`src/feature`](./src/feature): feature-level Service Desk flows
- [`src/auth.config.ts`](./src/auth.config.ts): NextAuth configuration
- [`src/middleware.ts`](./src/middleware.ts): middleware-based route protection
- [`docs/en`](./docs/en/README.md): design and decision documentation

## Service Desk Design Themes

The system design consistently emphasizes:

- Ticket lifecycle as a structured workflow, not just records
- Category and settings as domain configuration
- Approval, assignment, and SLA as first-class behaviors
- Activity (interaction) and History (immutable audit events) as separate models
- Clear UI boundaries between overview, analysis, and editing flows
- Traceability through history and impersonation-aware session design

If you want the high-level design overview first, start here:

1. [`docs/en/README.md`](./docs/en/README.md)
2. [`docs/en/02-architecture/feature-based-structure.md`](./docs/en/02-architecture/feature-based-structure.md)
3. [`docs/en/03-domain/ticket/ticket-system-overview.md`](./docs/en/03-domain/ticket/ticket-system-overview.md)
4. [`docs/en/03-domain/ticket/ticket-model.md`](./docs/en/03-domain/ticket/ticket-model.md)
5. [`docs/en/03-domain/ticket/ticket-lifecycle.md`](./docs/en/03-domain/ticket/ticket-lifecycle.md)
6. [`docs/en/08-dev-strategy/development-approach.md`](./docs/en/08-dev-strategy/development-approach.md)
7. [`docs/en/08-dev-strategy/ticket-operation-rules.md`](./docs/en/08-dev-strategy/ticket-operation-rules.md)

## Authentication and Session

Authentication is currently based on **NextAuth v4** with:

- Credentials provider
- JWT session strategy
- Middleware-assisted route protection
- Session-oriented impersonation design documented in architecture and decision logs

The project treats authentication and session not as isolated login concerns,
but as part of overall system behavior, especially for protected routes,
role-aware UI, and impersonation.

Current boundary:

- `AuthUser`: authentication identity (JWT truth)
- `SessionUser`: session-safe projection without `accessToken`
- `AppUser`: application-facing user model resolved via server/API and synced into runtime stores

Related docs:

- [`docs/en/02-architecture/auth-session-strategy.md`](./docs/en/02-architecture/auth-session-strategy.md)
- [`docs/en/02-architecture/impersonation-strategy.md`](./docs/en/02-architecture/impersonation-strategy.md)
- [`docs/en/08-dev-strategy/decision-log/2025-12-impersonation.md`](./docs/en/08-dev-strategy/decision-log/2025-12-impersonation.md)
- [`docs/en/08-dev-strategy/decision-log/2026-01-impersonation.md`](./docs/en/08-dev-strategy/decision-log/2026-01-impersonation.md)

## Local Development

Install dependencies and start the app:

```bash
npm install
npm run dev
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

Default local URL:

```txt
http://localhost:3000
```

## Environment

The repository includes both [`.env.local`](./.env.local) and [`.env-cmdrc`](./.env-cmdrc).

Current environment-related values include:

- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `NEXT_PUBLIC_BASE_PATH`
- API endpoint variables for DB / portal / node services
- `NEXT_PUBLIC_CONTEXT`

## Documentation

The design documentation in [`docs/en`](./docs/en/README.md) is one of the main deliverables of this project.

It covers:

- Architecture
- Domain design
- UI/UX patterns
- Data fetching strategy
- Form design
- i18n structure
- Development philosophy and decision logs

This means the repository is useful not only as code, but also as a written record
of how the system was shaped.

Recommended documentation entry points:

- [Service Desk Spec](./docs/spec/ticket-system.md)
- [Ticket Activity](./docs/en/03-domain/ticket/ticket-activity.md)
- [Ticket History](./docs/en/03-domain/ticket/ticket-history.md)

## Notes

- This is a portfolio/demo project, but it is intentionally structured like a real application.
- Some areas still contain mock data or partial implementation details.
- The codebase is actively being modernized around Next.js 14, reusable UI patterns, and clearer domain boundaries.

## Author

**Sunghwan Jung**  
Frontend Developer (React / Next.js)

- GitHub: <https://github.com/omega3jung>
- Repository: <https://github.com/omega3jung/sunghwan-portal>
- LinkedIn: <https://www.linkedin.com/in/sunghwan4jung/>
