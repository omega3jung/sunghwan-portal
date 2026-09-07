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

The current automated test suite is centered on Vitest. Storybook browser tests
and end-to-end browser workflows have different responsibilities and are kept
outside the default unit-test boundary.

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
| presentational UI | Tested selectively; visual and interaction-heavy coverage belongs primarily to Storybook/browser testing |

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

---

## Storybook and Browser Test Boundary

Vitest protects application logic and deterministic component behavior.

Storybook is intended to complement it by validating reusable UI states and
interaction scenarios that are easier to review visually and in a browser
environment.

Typical Storybook candidates include:

- complex shared components;
- form controls with multiple states;
- dialogs and interaction-heavy UI;
- loading/empty/error/disabled variants;
- responsive or visual states where DOM assertions alone provide little value.

Full user journeys across authentication, navigation, backend persistence, and
multiple pages belong to an end-to-end browser test boundary such as Playwright
when that coverage is intentionally added.

The project should not duplicate the same scenario across Vitest, Storybook, and
E2E merely to increase test counts. Each layer should own a different failure
class.

---

## Verification

A testing-related change should normally pass:

```txt
targeted Vitest tests
-> full Vitest suite
-> TypeScript
-> ESLint
```

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

After those boundaries are protected, lower-risk visual and reusable component
coverage should move to Storybook/browser testing rather than continuing to
expand Vitest indiscriminately.

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

---

## Related Documents

- [Development Approach](./development-approach.md)
- [Service Desk Implementation Strategy](./service-desk-implementation-strategy.md)
- [React Query Strategy](./react-query-strategy.md)
- [Feature-Based Structure](../02-architecture/feature-based-structure.md)

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
UI/application behavior. Storybook and future browser/E2E tests complement that
coverage where visual interaction or full-system execution is the more useful
test boundary.
