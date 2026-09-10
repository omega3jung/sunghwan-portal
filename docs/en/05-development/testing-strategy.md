# Testing Strategy

## Goal

This document defines how automated testing is selected and structured in
`sunghwan-portal`.

The goal is not to maximize the number of test files or achieve a repository-wide
coverage percentage. Tests are added where a regression is likely to break an
important workflow, security boundary, data contract, or user-facing state.

```txt
Risk
-> observable contract
-> smallest stable test boundary
-> deterministic regression protection
```

The current automated test suite is centered on Vitest. Storybook complements
that suite as the dedicated browser playground and interaction-review boundary
for application-owned reusable UI. Its primary scope is
`src/components/custom`, with selected application-wide layout and menu UI and
a small number of independently renderable feature presentation components.
End-to-end browser workflows have a different responsibility and remain outside
the default unit-test boundary.

---

## Core Principle

```txt
Protect contracts, not implementation details.
```

Tests should explain what must remain true when implementation details change.

Examples of stable contracts include:

- an unauthorized user cannot reach a protected operation;
- tenant and scope boundaries cannot be bypassed by request input;
- a ticket command produces the expected workflow effect and History;
- LOCAL and REMOTE runtimes expose equivalent application-facing behavior;
- a mutation invalidates the server state that can become stale;
- a page or view model exposes the correct state and capability for its inputs.

Internal helper-call order, component structure, or framework implementation
details are not test targets unless they are themselves part of the contract.

---

## Current Test Boundary

The default Vitest project runs source-local tests under `src`.

```txt
environment = node
include = src/**/*.{test,spec}.{ts,tsx}
```

Tests that require DOM behavior opt into jsdom at file level.

```ts
// @vitest-environment jsdom
```

Typical commands are:

```bash
npm test
npm run test:watch
npm exec vitest -- run --project unit --coverage
```

The default Vitest suite does not attempt to prove:

- visual correctness of every UI state;
- real browser navigation across the whole application;
- PostgreSQL constraints, grants, RLS, or infrastructure behavior against a
  production database;
- production object storage, notification delivery, or other deferred
  infrastructure.

Those concerns require a different test environment when they become part of
the implemented scope.

---

## Test Responsibility by Layer

The project uses different test boundaries for different responsibilities.

| Layer | Main test responsibility |
| --- | --- |
| `domain` | Pure business invariants, status rules, authorization-independent domain policy |
| `lib` | Application contracts, normalization, shared policy, query and mapping behavior |
| `server` | Use-case coordination, persistence rules, transaction behavior, History and Work Session effects |
| `feature` | User-facing workflow orchestration, form/hook behavior, mutation and cache coordination |
| `app/api` | HTTP parsing, authentication, authorization context, LOCAL/REMOTE dispatch, error mapping |
| `app/(protected)` / page composition | Search state, view models, loading/error/data state, capability composition |
| shared client state | Hydration, persistence, race handling, storage synchronization where behavior is non-trivial |
| application-owned reusable UI | `src/components/custom` and selected application-wide layout/menu UI are reviewed primarily through Storybook states, Controls, composition, and browser interaction |
| feature presentation UI | Added selectively when it is independently renderable and does not require application workflow infrastructure |
| other presentational UI | Tested selectively; Storybook is not a repository-wide component coverage target |

The same business branch should not be reproduced at every layer.

For example:

```txt
Domain policy
-> decides whether an operation is allowed

Route Handler
-> proves that the policy result is enforced before dispatch

Page/view model
-> proves that the resulting capability is presented correctly
```

Each test protects the responsibility owned by that layer.

---

## Risk-Based Priority

Test depth is determined by failure impact and regression risk, not by file size
or import count.

### Critical

Highest-priority areas include:

- authentication and trusted identity projection;
- impersonation and effective-user resolution;
- authorization, tenant isolation, and scope restrictions;
- ticket lifecycle and status transitions;
- approval and assignment routing;
- merge, cancel, reopen, resubmit, and other operational commands;
- current approver/current worker and ownership projection;
- transaction behavior and immutable History integrity;
- Work Session cleanup during workflow transitions;
- LOCAL/REMOTE contract parity;
- attachment preparation and persistence-safe metadata boundaries.

Critical changes should normally include representative success, denial,
boundary, and failure-side-effect cases.

### High

Examples:

- Route Handler orchestration;
- settings mutation impact;
- DTO/mapper contracts with business meaning;
- query invalidation;
- draft persistence;
- tenant lifecycle;
- server-side workflow handlers.

### Normal

Examples:

- hooks and view models;
- search/filter/sort behavior;
- form state;
- persisted page-local state;
- display transformation with meaningful branching.

### Low

Examples:

- thin wrappers;
- static constants;
- type-only modules;
- trivial re-exports;
- framework primitives delegated without project-specific behavior.

Low-risk code receives a dedicated test only when the test protects a real
regression risk.

---

## Test Types

### Pure Unit Tests

Use pure unit tests for deterministic logic that can be described without
React, HTTP, or a database.

Typical targets:

- domain rules and policies;
- schema validation;
- normalization;
- mappers;
- query/filter/sort utilities;
- payload builders;
- date and value transformations.

Important cases include:

- representative valid input;
- empty and boundary values;
- invalid input;
- fallback and precedence;
- normalization;
- input immutability where relevant.

### Store and Hook Tests

Use hook/store tests when the main contract is a state transition or side
effect rather than rendered markup.

Typical targets:

- Zustand state;
- React Query mutation orchestration;
- form/dialog state;
- session and AppUser synchronization;
- preference synchronization;
- draft recovery;
- session-storage persistence.

Important cases include:

- initial state;
- success and failure;
- reset/remove;
- stale-response protection;
- race handling;
- query invalidation;
- storage/API synchronization.

### Component and Page Composition Tests

Use DOM tests when the observable contract is what a user can see or do.

Typical targets:

- forms and action tools;
- access guards/providers;
- Service Desk settings editors;
- ticket list/detail/insight composition;
- loading, empty, error, retry, and capability states.

Prefer semantic queries and user-visible behavior.

Avoid tests that only lock:

- Tailwind classes;
- internal child-component structure;
- icon implementation;
- framework primitive behavior.

Page-level tests should validate page-level composition, not repeat every domain
or feature rule already covered below them.

### Route Handler Tests

Route tests protect the HTTP and runtime orchestration boundary.

Typical assertions include:

- missing authentication;
- forbidden access;
- invalid request/path/query input;
- canonical principal and tenant/scope resolution;
- authorization before LOCAL/REMOTE dispatch;
- values forwarded to LOCAL handlers or REMOTE clients;
- method, query, body, and trusted identity header forwarding;
- application error to HTTP status mapping.

Route tests should not reimplement the complete business policy they consume.

### Service and Workflow Tests

Use service/workflow tests when several persistence operations together form one
business result.

Examples:

```txt
Ticket Action
-> validate
-> mutate Ticket
-> create Action
-> create History
-> finish Work Session when required
```

Important assertions include:

- writes begin only after preconditions succeed;
- valid and invalid state transitions;
- expected Action/History metadata;
- subsequent writes do not occur after failure;
- transaction executors are used where atomic behavior is required;
- cleanup behavior remains consistent with the lifecycle.

### Repository and External Adapter Boundary Tests

Repository and adapter tests are useful when transport or persistence mapping is
itself an important contract.

Examples:

- tenant/scope SQL predicates;
- parameter binding;
- row/DTO mapping;
- query/header/body forwarding;
- transaction executor use;
- external error mapping.

Mock-based repository tests do not prove PostgreSQL constraints, RLS, grants, or
database functions. If those become a material risk, a separate database
integration-test boundary is required.

### Cross-Runtime Contract Tests

Use shared contract suites when independent implementations must preserve the
same application meaning.

Examples include:

- App runtime and server runtime ownership projection;
- LOCAL and REMOTE application-facing behavior;
- independently implemented DTO/command contracts.

```txt
Independent implementation A
Independent implementation B
-> same behavioral contract
```

When separation between runtimes is architecturally meaningful, do not remove
that boundary only to make a test easier. A shared contract suite can protect
behavioral parity without forcing one runtime to import the other.

---

## Authorization Test Policy

Authorization tests deserve additional care because a correct success path does
not prove that the boundary is safe.

Representative cases should cover, where applicable:

- allowed principal;
- denied principal;
- missing or malformed trusted identity;
- same-tenant and cross-tenant access;
- `INTERNAL` and `PORTAL` scope;
- original and impersonated/effective identity;
- active and inactive resources;
- authorization before LOCAL/REMOTE dispatch or repository access.

Client-supplied tenant, company, scope, role, or identity values are never
treated as authorization truth when the server owns a canonical source.

Invalid trusted fields should fail closed rather than silently increase
capability.

---

## LOCAL / REMOTE Test Policy

LOCAL and REMOTE use different runtime implementations but should expose stable
application contracts where the feature is implemented.

```txt
same authorized intent
-> LOCAL implementation
-> REMOTE implementation
-> equivalent application-facing meaning
```

Tests should focus on:

- equivalent authorization results;
- compatible DTOs;
- equivalent workflow meaning;
- tenant/scope consistency;
- correct transport forwarding for REMOTE;
- no LOCAL-only bypass of authorization.

Infrastructure differences are allowed where they are explicit by design. For
example, LOCAL draft recovery and REMOTE persisted draft rows do not need to
share the same storage implementation to expose compatible feature behavior.

---

## Regression Test Policy

A bug fix should normally leave behind a test at the lowest stable boundary that
reproduces the failure.

```txt
reproduce
-> confirm intended contract
-> fix
-> keep regression test
```

Do not preserve an assertion merely because it describes previous behavior.

If the current implementation is wrong:

1. verify the current design or contract;
2. identify whether production code or the fixture is wrong;
3. make the smallest production correction;
4. add or update the test to express the intended behavior.

Deleted behavior should have its obsolete tests removed rather than archived.

---

## Mocking Strategy

Mocks should isolate boundaries, not recreate the whole application.

### Appropriate mock targets

- network clients;
- database executors/repositories outside the test target;
- system time;
- Next.js router/navigation;
- storage;
- NextAuth/session boundaries;
- heavy editor/chart/portal UI not owned by the test;
- async dependencies used to reproduce failures and races deterministically.

### Avoid mocking

- the rule being tested;
- the test target itself;
- every internal helper only to make assertions easier;
- unrealistic abbreviated objects that hide required contract fields.

Use `vi.hoisted` when an import-time module mock requires it, and reset mutable
mock state between tests.

---

## Deterministic Test Policy

Tests must not depend on execution order or the developer machine.

- Reset mocks and mutable state between tests.
- Use fake timers or fixed dates for time-sensitive behavior.
- Avoid real network access in the default suite.
- Avoid real production database access in unit tests.
- Restore mutable LOCAL demo singleton state after a test changes it.
- Use `waitFor` or observable completion rather than arbitrary sleeps.
- Make locale/timezone-sensitive expectations explicit.
- Handle storage failure, malformed persisted state, and stale async results
  deterministically when those cases are part of the contract.

---

## Fixture and Assertion Guidelines

- Fixture factories should provide valid defaults and let each test override only
  the meaningful difference.
- Test names should state both the condition and expected behavior.
- Prefer assertions on contract-relevant fields over broad implementation
  snapshots.
- When the complete DTO shape is the public contract, validate the complete
  shape.
- Do not assert only that a dependency was called; verify important identity,
  tenant, scope, state, or payload values as well.
- Prefer error code/type/status over exact prose when wording is not the
  contract.
- Snapshot testing is not the default choice.
- `skip`/`todo` tests are not counted as implemented regression coverage.

---

## Coverage Policy

Coverage is a diagnostic tool, not the definition of quality.

Interpret uncovered code in this order:

```txt
Uncovered code
-> meaningful behavior?
-> failure impact?
-> reachable and supported?
-> correct stable test boundary?
```

The project does not currently enforce one repository-wide percentage threshold.

A single number would treat very different code equally:

- security policy;
- workflow service;
- UI primitive;
- framework wrapper;
- type-only module.

Instead, review focuses on whether important contracts are protected.

Expected outcomes include:

- Critical changes cover meaningful allow/deny/boundary branches;
- bug fixes include regression protection;
- new LOCAL/REMOTE branches protect runtime parity;
- workflow writes verify both current-state and History effects;
- coverage changes can be explained in terms of behavior rather than line count.

Do not add tests only to execute type-only files, trivial re-exports, or
unreachable defensive branches.

---

## What Is Intentionally Not Tested with Vitest

Vitest coverage is intentionally limited when another boundary is more useful.

Normally excluded unless project-specific behavior is added:

- shadcn/Base UI primitives and thin wrappers;
- static presentation-only components;
- badges, skeletons, icons, and layout-only wrappers;
- type-only files and constants without behavior;
- barrel exports;
- thin Axios/API forwarding helpers with no contract beyond delegation;
- deprecated or stub routes that intentionally expose no active workflow.

Complex reusable UI with meaningful visual or interaction behavior is a better
candidate for Storybook/browser interaction coverage than repeated page-level
Vitest tests.

In the current project, the primary Storybook boundary is application-owned
reusable UI under `src/components/custom`, `src/components/layout`, and
`src/components/menu`. The custom component area is the comprehensive target;
layout and menu components are selected only when isolated visual inspection is
valuable. A small number of independently renderable feature presentation
components may also be included. A component being visual or reusable does not
by itself make it a Storybook target.

---

## Storybook and Browser Test Boundary

Vitest protects application logic and deterministic component behavior.

Storybook has a focused responsibility in the current project:

```txt
src/components/custom
-> reusable UI contract
-> representative states
-> configurable public parameters
-> browser interaction
-> composition examples

selected layout/menu UI
-> application-wide visual states

selected feature presentation UI
-> independently renderable domain presentation
```

Storybook is not used as repository-wide component coverage.

The default Storybook scope excludes:

- `src/components/ui`, which mainly contains shadcn/Base UI primitives and thin
  project wrappers;
- feature containers, Route Handler/API-connected UI, and Service Desk workflow
  controllers, while allowing a small number of independent presentation
  components such as status or history displays;
- application pages and route composition;
- domain, authorization, routing, and persistence behavior already owned by
  Vitest or server-side tests.

This boundary keeps Storybook focused on UI that the project directly owns and
that benefits from isolated browser inspection. The current non-custom Stories
cover `RouteLoadingOverlay`, `PreferencesMenu`, `UserMenu`,
`TicketStatusBadge`, and `TicketHistoryTimeline`; they are deliberate, bounded
exceptions rather than a request for repository-wide coverage.

### Relationship with the Previous Demo Playground

The application previously used `src/app/(protected)/demo` as an internal
playground for `src/components/custom`.

Storybook replaces that responsibility when it provides equivalent or better
inspection of the public component contract.

The replacement criterion is not merely that a Story exists.

```txt
representative Story
+ Controls for configurable public parameters
+ args connected to the rendered component
+ browser interaction
+ observable controlled result
= component playground replacement
```

Demo-specific control forms should not be copied into Storybook when Storybook
Controls already represent the same public parameter.

For example:

```txt
meaningfully different UI state
-> Story

continuous public parameter variation
-> Controls
```

A `Disabled`, `Empty`, or `ReadOnly` state may deserve its own Story. A numeric
setting such as `maxImages`, or another continuous configuration value, should
normally remain a Control rather than becoming many near-duplicate Stories.

### Public Contract and Meta Policy

Storybook organization follows public component contracts, not folder size or
the number of `.tsx` files.

If two exported components in the same family expose materially different
public APIs, they should normally use separate Storybook Meta definitions so
their own Controls remain visible and type-safe.

Internal implementation pieces do not require independent Stories when their
behavior is already exercised through the public component.

Storybook must reuse existing production constants, types, fixtures, and option
definitions where they represent the real component contract. It should not
duplicate production option unions or introduce Storybook-only component props
to make a Story easier to configure.

### Controlled Story Policy

When a component is controlled, Storybook Controls and Canvas interaction
should observe the same state.

The intended direction is:

```txt
Controls change
-> Story args change
-> rendered component changes

Canvas interaction
-> component callback
-> Story args/state change
-> Controls and Canvas show the same result
```

`useArgs` or an equivalent Storybook-controlled pattern is preferred when it
keeps the component's public value contract synchronized in both directions.

Reading an initial value from `args` into local state without responding to
later arg changes is not considered a complete Controls connection.

### Interaction Policy

Storybook should preserve the meaningful browser interactions that were
previously useful in the component playground, such as:

- select, remove, and clear;
- date and range selection;
- text/editor input;
- attachment add/remove behavior;
- tree expand/collapse and supported reordering;
- step navigation;
- other interactions exposed by the public custom component API.

Manual Canvas interaction is sufficient when it provides the required
inspection capability.

Use `play` selectively when automated browser interaction provides meaningful
regression value and remains stable. Do not add `play` merely to increase test
counts, and do not force unstable browser behavior such as drag-and-drop into an
automated path when manual inspection is more reliable.

### Composition Stories

Not every visible difference belongs to a component variant or Control.

When the difference comes from caller-provided content or composition, represent
it as a composition Story instead of expanding the component API.

For example, a Stepper label such as:

```txt
Step 1: Request
```

may be demonstrated as caller-provided step content rather than modeled as a
Stepper-specific variant when the component does not own that behavior.

### Application Route and Access Boundary

The protected application route `/storybook` is a launcher that renders
Storybook in an iframe.

- In development, the iframe loads `http://localhost:6006`.
- In production, the application build copies the static Storybook output to
  `public/storybook-static`, and the iframe loads
  `/storybook-static/index.html` under the configured base path.

Authentication protects navigation to the `/storybook` application page. It
does not make the development server or files under `public/storybook-static`
an authenticated asset boundary. The static production artifact can be
requested directly, so the embedded route must not be treated as access
control for confidential Stories or fixtures.

### Storybook Verification

A Storybook-related change should normally verify:

```txt
TypeScript
-> ESLint
-> Storybook static build
-> representative browser rendering
```

When Controls or browser interaction change materially, verify that:

- Controls update the actual rendered component;
- controlled interaction updates observable state;
- representative Stories mount without runtime errors;
- Storybook does not make unintended application API requests.

Selected `play` interactions provide additional regression protection. The
repository already configures a Storybook Vitest browser project with a
headless Playwright Chromium provider. It remains separate from the default
`npm test` command, which runs only the `unit` project. The browser project is
not currently a clean, enforced CI gate; its remaining `play` failures are a
known verification gap.

### E2E Boundary

Full user journeys across authentication, navigation, backend persistence, and
multiple pages belong to an end-to-end browser test boundary such as Playwright
when that coverage is intentionally added.

Examples include:

```txt
login
-> impersonation
-> ticket creation
-> approval
-> assignment
-> action
-> history
-> work session
```

Storybook should not reproduce those application workflows.

The project should not duplicate the same scenario across Vitest, Storybook, and
E2E merely to increase test counts. Each layer should own a different failure
class.

---

## Verification

A Vitest-related change should normally pass:

```txt
targeted Vitest tests
-> full Vitest suite
-> TypeScript
-> ESLint
```

A Storybook-related change should normally pass:

```txt
TypeScript
-> ESLint
-> Storybook static build
-> representative browser rendering
```

The configured Storybook browser project can be run explicitly when a change
affects `play` interactions or browser-only behavior:

```bash
npm exec vitest -- run --project storybook
```

This browser project is not part of the default `npm test` command and should
currently be treated as a diagnostic check until its remaining interaction
failures are resolved.

Additional repository checks may be included when the change affects them.

The test review is complete when:

- test names make the protected behavior understandable;
- important Critical/High contracts have representative success and failure
  protection;
- tests do not rely on real time, network, order, or developer-local state;
- production code is not exposed only for tests;
- failures provide enough information to distinguish implementation defects from
  fixture defects.

---

## Stop Condition

Testing should have an explicit stopping point.

The project does not continue adding Vitest tests simply because another
uncovered helper or component can be found.

The current strategy considers Vitest coverage sufficient when the important
risk boundaries are protected across:

```txt
domain invariants
-> application contracts
-> feature workflows
-> server use cases
-> HTTP/runtime orchestration
-> authentication and impersonation
-> tenant/scope boundaries
-> LOCAL/REMOTE parity
-> page/view-model composition
-> state persistence and synchronization
-> History and Work Session persistence
```

After those boundaries are protected, lower-risk visual coverage should not
continue to expand Vitest indiscriminately. Reusable UI under
`src/components/custom` should move to the Storybook boundary when isolated
states, Controls, interaction, or composition are the more useful form of
verification. Other visual components do not automatically become Storybook
targets.

---

## Maintenance

- Update tests and current design documentation together when a contract changes.
- Remove tests for deleted behavior.
- Fix the source of flaky behavior instead of hiding it with retries.
- Split long test files by responsibility or scenario rather than arbitrary
  size.
- Reduce shared fixtures when they begin to hide important domain differences.
- Track unprotected Critical workflow branches before low-coverage file lists.
- Keep test infrastructure proportional to the risk it protects.
- Keep comprehensive Storybook coverage scoped to `src/components/custom`.
  Add layout/menu or feature presentation Stories only when they remain
  independently renderable and provide clear application-wide inspection
  value.
- Keep Storybook Stories aligned with production public APIs and shared option
  constants instead of duplicating component contracts in Story files.

---

## Related Documents

- [Development Approach](./development-approach.md)
- [Service Desk Implementation Strategy](./service-desk-implementation-strategy.md)
- [React Query Strategy](./react-query-strategy.md)
- [Feature-Based Structure](../02-architecture/feature-based-structure.md)
- [Storybook Coverage Strategy](../06-decisions/2026-09-storybook-coverage-strategy.md)

---

## Summary

The testing strategy for `sunghwan-portal` is risk-based and responsibility-aware.

```txt
Protect contracts, not implementation details.
Test denial and boundaries, not only success.
Keep runtime contracts aligned without erasing meaningful boundaries.
Use coverage to find gaps, not to manufacture confidence.
Stop when important risks are protected.
```

Vitest protects domain rules, workflows, runtime orchestration, and deterministic
UI/application behavior. Storybook owns isolated browser inspection for custom
reusable UI, selected application-wide layout/menu UI, and a small number of
independent feature presentation components. Future E2E tests cover full-system
execution when that becomes the more useful boundary.
