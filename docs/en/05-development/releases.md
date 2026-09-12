# Production Releases

## Purpose

This document records changes merged into `main`, the production branch used by
portal users and reviewers.

A release is recorded here only after its pull request has been applied to
`main`. Each entry is a self-contained summary of the production outcome rather
than a copy of implementation details, deployment checklist items, or
screenshots from the pull request. The merged PR title is retained for
traceability; this document does not depend on separate PR-description files.

---

## Release History

### 2026-09-12 — Stability safeguards and Service Desk UX polish

fix(service-desk, ui): strengthen stability and refine UX polish

- Closed REMOTE ticket-visibility gaps when creating comments and internal notes, and limited LOCAL demo resets to authenticated requests in LOCAL auth mode.
- Completed LOCAL demo resets by clearing mutable Work Session state, and sanitized persisted rich text before rendering to prevent unsafe HTML.
- Applied compatible production dependency security updates while keeping the existing application and workflow contracts unchanged.
- Simplified a small set of redundant markup and Tailwind styles and added restrained, reduced-motion-aware interaction transitions.
- Expanded and refined initial-loading Skeleton states across core Service Desk ticket list, detail, action, history, and update workflows while preserving existing data during refetch.

### 2026-09-11 — Integrated Storybook component coverage

feat(storybook): replace demo playground with integrated component coverage

- Replaced the application-internal component demo playground with project-specific
  Storybook coverage for reusable custom components and their public contracts.
- Added representative states, Controls, controlled Canvas examples, selected
  `play` interactions, and global locale and light/dark theme switching.
- Added the protected `/storybook` route, combined Next.js and Storybook local
  development, and static Storybook output in production builds and navigation.
- Removed obsolete demo routes and reorganized their routing, fixtures,
  localization, and navigation resources after equivalent coverage was verified.
- Added an accessible, reusable password visibility input based on the existing
  InputGroup primitives and integrated it into the login form.
- Localized password visibility actions in English, Korean, French, and Spanish
  and aligned Storybook-related locale ownership with the new structure.
- Published English and Korean Storybook coverage decisions and updated testing,
  routing, state, authentication, README, and development documentation.
- Stabilized update-ticket tests with Testing Library `act` and a relative due
  date while preserving Vitest ownership of workflow and application behavior.

### 2026-09-07 — Complete portal localization coverage

fix(i18n): complete locale coverage across the portal

- Added missing translations for document pages, Service Desk workflows, API
  errors, shared actions, and toast messages across the supported locales.
- Corrected locale key paths and namespace alignment that could expose fallback
  text or untranslated keys in user-facing flows.
- Refined Korean document titles and descriptions to match current project
  terminology while retaining intentional English technical terms.
- Widened document navigation to accommodate longer localized labels without
  unnecessary clipping or wrapping.
- Completed the localization hotfix without changing Service Desk workflow
  behavior, authorization policy, or API contracts.

### 2026-09-07 — Risk-based regression coverage and workflow safeguards

test(vitest): strengthen regression coverage and workflow safeguards

- Restored and modernized the Vitest suite, expanding risk-based regression
  coverage across domain rules, authentication, authorization, Service Desk
  workflows, server services, route handlers, client state, and protected pages.
- Strengthened trusted session identity handling, tenant and scope authorization,
  impersonation safeguards, and fail-closed behavior before LOCAL or REMOTE
  dispatch.
- Protected ticket lifecycle, action, approval, assignment, merge, draft,
  history, Work Session, and settings orchestration contracts, including
  transaction failures and immutable audit behavior.
- Added shared contract coverage for LOCAL and REMOTE behavior and for the
  independently implemented App and server runtime ownership boundaries.
- Corrected regressions in assignee normalization, settings validation context,
  session storage persistence, preference synchronization, sign-out routing,
  and asynchronous cleanup.
- Published the English and Korean testing strategy and Vitest coverage decision,
  updated localized Documents Hub navigation, and refined Korean technical
  documentation.
- Removed the obsolete remote route guard and deprecated compatibility APIs,
  enabled ESLint deprecation checks, and released the application as `0.9.9`.

### 2026-08-23 — Workflow integrity and impersonation safeguards

fix(service-desk, auth): strengthen workflow integrity and impersonation

- Strengthened CLIENT-scope login, effective impersonation identity, and
  company-scoped employee selection while preserving authenticated-session
  boundaries.
- Enforced tenant, scope, actor, and object-level authorization consistently
  across ticket lists, search, details, actions, histories, Work Sessions, and
  Service Desk settings.
- Required Category activation readiness for new workflows, preserved effective
  parent availability, and safely rerouted affected approvals when settings
  changed without breaking valid in-flight workflows.
- Aligned PORTAL assignment eligibility, Assignment Rule fallback behavior,
  Category SLA validation, and LOCAL and REMOTE configuration semantics; made
  remote Category tree saves atomic.
- Repaired Ticket History persistence and Work Session status handling, moved
  automatic closure to the Service Desk cron boundary, and refreshed demo dates
  and authentication fixtures.
- Improved impersonation selection, responsive ticket navigation, localized UI
  feedback, tests, scripts, and implementation-aligned documentation.

### 2026-08-07 — Frontend modernization and clearer client boundaries

refactor(frontend): complete Base UI migration and strengthen frontend boundaries

- Completed the migration of shared UI primitives from Radix-based shadcn
  components to the current Base UI-based foundation.
- Updated authentication, navigation, preferences, Service Desk, settings,
  ticket, Insights, and demo interfaces for the new component contracts.
- Improved the login experience, responsive portal layouts, settings editors,
  hierarchical selectors, sortable trees, attachment views, and shared demos.
- Simplified App Router page responsibilities and clarified route composition,
  data orchestration, view-model, presentation, and server-contract boundaries.
- Standardized positive capability APIs such as `canEdit`, `canSubmit`, and
  `canNavigate`, while retaining presentation state at UI primitive boundaries.
- Reorganized localization and documentation so the production implementation,
  workflow references, and architecture guidance describe the same system.

### 2026-07-24 — Tenant-scoped workflows and Next.js 16 platform baseline

feat(service-desk): enforce tenant-scoped workflows and migrate platform to Next.js 16

- Enforced tenant, company, and operational-scope boundaries across Service Desk
  settings, tickets, insights, organization references, actions, merge, and
  escalation workflows.
- Added `INTERNAL` and `PORTAL` scope-aware search and navigation, including
  internal-to-portal escalation and tenant-aware insight filtering.
- Strengthened server-side authorization for settings, approver and assignee
  selection, employee references, impersonation, and ticket operations.
- Expanded localized, tenant-aware demo scenarios and aligned LOCAL and REMOTE
  behavior with the same domain and API contracts.
- Upgraded the production baseline to Next.js 16, React 19, Node.js 24, npm 11,
  and ESLint 9, including async Request APIs, the proxy convention, Flat Config,
  and Turbopack builds.
- Verified installation, type checking, lint and architecture boundaries,
  production builds, authentication, settings, and core ticket read paths.

### 2026-07-14 — Complete Ticket Action workflow and audit controls

feat(service-desk): complete ticket action workflow and strengthen history and permission controls

- Completed LOCAL and REMOTE execution for assignment, self-assignment,
  adjustment, rejection, merge, reopen, resubmission, cancellation, approval,
  and decline actions.
- Aligned action permissions, status transitions, assignment routing, query
  invalidation, and immutable history creation across both runtime modes.
- Promoted history event and source to explicit audit fields and preserved
  metadata for display and action-specific context.
- Allowed current and previous workers to record work time while restricting
  status-changing authority to current workers.
- Added consistent Work Session cleanup and lifecycle handling, including an
  idempotent, cron-ready automatic close path for expired resolved tickets.
- Corrected impersonation-aware navigation, profiles, settings guards, and
  permission projections so the effective user controls production behavior.

### 2026-07-08 — Remote ticket workflow and action-history integration

feat(service-desk): connect remote ticket workflow and refine action history model

- Connected remote ticket list, detail, draft, create, requester update,
  approval, history, action, and Work Session data flows.
- Added category-driven approval and assignment routing with server-controlled
  requester, actor, and ownership checks.
- Introduced separate create and update dialogs, hierarchical category
  selection, routing recalculation feedback, and draft-safe form validation.
- Added attachment preparation that persists metadata without storing raw
  browser files, blob URLs, base64 content, or client-controlled binary data.
- Replaced the legacy navigation bar with breadcrumb navigation derived from the
  portal menu while keeping ticket details within the Tickets context.
- Kept unsupported remote actions disabled until their server execution paths
  were completed.

### 2026-06-28 — Restore recent ticket visibility in the demo

chore(service-desk): refresh ticket mock dates for demo visibility

- Shifted ticket scenario dates forward so representative tickets appear within
  the default recent three-month filter.
- Preserved ticket identities, relationships, workflow scenarios, filtering
  behavior, DTO contracts, and remote persistence assumptions.

### 2026-06-20 — Restore impersonation and clarify runtime indicators

fix(auth, ui): restore impersonation flow and clarify runtime state indicators

- Restored impersonation when login-account usernames and employee usernames
  differ by separating credential lookup from impersonation target resolution.
- Kept password hashes and authentication usernames confined to the login flow.
- Added localized visual indicators for demo, impersonation, and combined
  demo-plus-impersonation states in the protected layout.

### 2026-06-18 — Restore Korean Service Desk scenario text

fix(service-desk): restore Korean mock scenario text

- Repaired corrupted Korean strings visible in Service Desk demo scenarios.
- Preserved the existing scenario structure, workflow meaning, routes, UI, and
  persistence behavior.

### 2026-06-17 — Fix Documents Hub rendering in Vercel production

fix(documents): include markdown docs in Vercel server bundle

- Included repository Markdown documents and the root README in the Vercel
  server bundle used by the Documents route.
- Fixed production `ENOENT` failures while preserving server-side Markdown
  loading, document identifiers, paths, and page structure.

### 2026-06-16 — Align Service Desk documentation and hub navigation

docs(service-desk): publish documentation alignment and docs hub navigation

- Aligned Service Desk documentation with tenant-scoped settings, DTO/API
  boundaries, LOCAL/REMOTE runtime responsibilities, and the current ticket
  system specification.
- Added localized Documents Hub navigation and grouped decision records by
  year-month for faster review.
- Refreshed English and Korean specification entry points and clarified which
  pages were available in the remote demo.

### 2026-06-14 — Service Desk settings data integration

feat(service-desk): publish settings data integration

- Connected database-oriented Tenant, Category, Approval Step, and Assignment
  Rule read models and completed their settings workflows.
- Introduced Tenant as the Service Desk configuration boundary and added tenant
  settings, company data, organization references, and tenant reactivation.
- Stabilized LOCAL settings persistence across saves, React Query refetches,
  page refreshes, and demo resets.
- Aligned LOCAL and REMOTE handlers, response shapes, CRUD behavior, identity
  naming, and Work Session terminology.
- Standardized settings workspaces and added a reusable color picker for tenant
  configuration.

### 2026-05-31 — Database-backed remote demo foundation

feat(database): publish DB-backed remote demo and Service Desk polish

- Added Supabase-backed authentication support, user profiles, preferences,
  navigation, and impersonation while preserving the LOCAL demo.
- Established explicit LOCAL and REMOTE runtime boundaries and introduced a
  temporary route guard for remote pages that were not yet connected.
- Added database-driven menus and localized user-facing identity data.
- Improved local ticket approval and assignment routing, persistent settings
  state, merge safeguards, date rendering, chart labels, and mutation feedback.
- Added a protected-route loading overlay to improve navigation feedback.

### 2026-05-12 — Production traffic analytics

chore(vercel): add Vercel Web Analytics

- Enabled Vercel Web Analytics at the root layout for application-wide page and
  visitor measurement.
- Added production traffic visibility without changing authentication, domain
  behavior, application routes, localization, or visible workflows.

### 2026-05-10 — Service Desk Insights and responsive ticket workflows

feat(service-desk): publish insights view and responsive ticket flow

- Added Service Desk Insights for status, category, department, assignee, and
  SLA summaries with date-range and chart-driven ticket filtering.
- Added full, compact, and hidden chart modes plus Portal, Internal, and Insights
  view selection.
- Introduced dedicated mobile layouts for the ticket list, ticket detail, and
  ticket creation dialog while preserving dense desktop workflows.
- Fixed rich-editor remount behavior that could clear a ticket body when moving
  between form steps.
- Added localized Insight, chart, filter, SLA, and empty-state labels across
  English, Korean, French, and Spanish.

### 2026-05-04 — Portal and local Service Desk production milestone

#### Service Desk demo, protected home, and Documents Hub

feat(portal): deliver service desk demo, home, and docs foundation

- Delivered the LOCAL Service Desk workflow from ticket creation through detail,
  actions, immutable history, work tracking, and demo reset.
- Added ticket search, filtering, sorting, pagination, role-aware controls, and
  lifecycle scenarios covering creation through closure and reopening.
- Added the protected portal home dashboard and improved login, session, redirect,
  language preference, and App Router boundaries.
- Published a server-rendered Documents Hub with localized document selection,
  English fallback, navigation, and repository documentation entry points.

#### Vercel production build fix

fix(vercel): resolve Vercel build error from font casing

- Corrected the Pretendard font import casing required by Vercel's case-sensitive
  Linux production environment.
- Resolved the production build failure without changing application behavior.

#### Live application link

feat(vercel): add Vercel app link

- Added the deployed Vercel application link to the project overview so users
  and reviewers can reach the production demo directly.

### 2026-02-28 — Service Desk settings foundation

feat(service-desk): deliver IT service desk settings foundation

- Added Category, Approval Step, and Assignment Rule settings interfaces with
  demo-ready mock APIs and data.
- Established protected internal and tenant settings routes with impersonation
  support.
- Improved model, view-model, API, feature, domain, and shared boundaries for
  subsequent ticket workflow development.
- Stabilized localization initialization, language state, and hydration across
  layouts and feature modules.

### 2025-12-30 — Portal production foundation

feat(portal): establish authentication, layout, and permission-driven portal foundation

- Established NextAuth credential authentication, JWT sessions, protected
  routing, centralized providers, and the initial impersonation model.
- Added role- and access-level authorization with permission-aware navigation
  and live menu changes during impersonation.
- Published the protected and public layout foundations, base home experience,
  navigation, redirects, and user preferences.
- Added theme and language updates, login and home localization, branding assets,
  unsupported-browser routing, and baseline project standards.
