# Vitest Coverage Strategy (2026-09)

## Context

Vitest work in `sunghwan-portal` expanded incrementally beginning in late August
2026.

The initial goal was to restore older tests against the current implementation
and prevent regressions in core Service Desk behavior. As tests were added,
however, the important questions shifted away from the raw number of tests or
the overall coverage percentage toward the following:

```txt
Which behaviors have a high impact when they break?
-> Which layer owns each behavior?
-> How can it be verified at the smallest stable boundary?
-> How much protection is sufficient?
```

The project contains code with different responsibilities in one repository:

```txt
domain
lib
feature
server
app/api
app/(protected)
LOCAL demo implementation
REMOTE PostgreSQL implementation
shared client state
reusable UI
```

Because this is a portfolio project, App/BFF-style code and
server/backend-style code currently live in one repository. Some boundaries are
nevertheless designed so they can be deployed separately or moved into separate
codebases in a production environment.

The testing strategy therefore needed to satisfy both of the following:

1. Protect important workflow and security contracts sufficiently.
2. Avoid expanding testing until it becomes the purpose of the project itself.

---

## Background

Vitest coverage was strengthened in roughly the following sequence:

```txt
2026-08-27
-> restore archived Vitest suites
-> align fixtures and expectations with current domain contracts

2026-08-29
-> establish the unit project and npm test baseline
-> use node by default and opt into jsdom per test

2026-08-31
-> strengthen domain rules, feature workflows, forms, drafts, actions,
   and Work Sessions

2026-09-05
-> strengthen authentication, authorization, and tenant isolation
-> strengthen Route Handlers, LOCAL/REMOTE dispatch, and server services

2026-09-06
-> strengthen protected Service Desk and Settings page orchestration

2026-09-07
-> close remaining HTTP/service/runtime contract and state-management gaps
```

In the final strengthening phase, the remaining candidates were classified
again by risk:

```txt
P1
1-4  authentication / access boundary
5-6  Ticket / Tenant HTTP and Service boundary
7-9  REMOTE Settings / Action / Runtime contract

P2
10-16 state persistence / synchronization / integration

Deferred
17+ shared UI state utilities
P3 presentation / wrapper / low-risk utilities
```

This classification defined the final expansion scope. Lower-risk areas from
item 17 onward were intentionally excluded from further Vitest expansion.

After the final work, the unit suite had expanded to the following state:

```txt
164 test files passed
853 tests passed
1 todo
```

These numbers are a snapshot of the result, not quality thresholds that must be
maintained in the future.

---

## Problem

### 1. High Overall Coverage Does Not Guarantee Important Contracts

A page-level happy-path test like the following may execute many lines:

```txt
render page
-> load success state
-> assert visible heading
```

The following risks may nevertheless remain:

- access to a resource from another Tenant;
- impersonation privilege escalation;
- LOCAL/REMOTE dispatch before authorization;
- an invalid Ticket state transition;
- a partial failure where Ticket state changes but History is not recorded;
- a different principal or scope in REMOTE than in LOCAL;
- partial writes left behind after a transaction fails midway.

Conversely, a small authorization policy test may execute only a few lines while
protecting a much larger risk.

Line coverage alone therefore cannot determine safety.

---

### 2. Each Layer Has a Different Failure Boundary

The project's main layers cannot all be tested in the same way.

```txt
domain
-> business invariant

lib
-> application contract / normalization / shared policy

server
-> use case / persistence / transaction

feature
-> user-facing workflow / mutation / state

app/api
-> HTTP / auth / runtime dispatch

app/(protected)
-> page / view-model / capability composition
```

Repeating a business branch already verified in a lower layer at every higher
layer increases the number of tests and the maintenance cost together.

Conversely, assigning every lower-level rule to one high-level orchestration
test makes failures difficult to diagnose and can leave important denial
branches uncovered.

---

### 3. LOCAL and REMOTE Must Share an Application Contract Despite Different Implementations

LOCAL may use demo-safe mutable state or browser-local state, while REMOTE uses
PostgreSQL, repositories, transactions, and DTO services.

The two runtimes do not need identical line coverage.

What matters more is the following:

```txt
same authorized intent
-> LOCAL
-> REMOTE
-> equivalent application-facing meaning
```

LOCAL and REMOTE should therefore be compared by the following contracts rather
than implementation size:

- the same authorization result;
- the same Tenant and scope meaning;
- the same Ticket workflow meaning;
- compatible DTOs;
- the same ownership/capability projection.

---

### 4. Duplicate Runtime Implementations Can Drift Even Within One Repository

The portfolio keeps App runtime and server runtime implementations together in
one repository.

For example, Ticket ownership projection has separate implementations at the
following two boundaries:

```txt
App/BFF runtime ownership projection
Server/backend runtime ownership projection
```

Merging these implementations merely because they currently share a repository
would make testing easier, but it could weaken an architectural boundary that
may be separated in production.

The problem is not code duplication itself. It is drift in the following
contracts:

```txt
owner
assignedApprover
assignedWorker
current username normalization
```

The project therefore needed a way to retain independent implementations while
applying the same contract suite to both.

---

### 5. Test Candidates Never End, So an Explicit Stop Condition Is Required

Searching for tests always reveals more candidates.

Examples include:

- Route loading;
- breadcrumbs;
- DatePicker utilities;
- SortableTree helpers;
- small presentational components;
- thin wrappers;
- framework delegation code.

If tests are added simply because code can be tested, maintenance cost eventually
grows faster than risk reduction.

The stopping point therefore needed to be based on whether important risks were
sufficiently protected, not on whether more tests could be written.

---

### 6. Browser, Visual, and Database Tests Have Different Responsibilities from Unit Coverage

Storybook browser tests and Playwright E2E tests are useful for verifying actual
rendering and navigation.

However, forcing them into the same execution boundary as the Node-based Vitest
unit suite allows environment concerns such as the following to block domain and
security regression tests:

- browser executables;
- preview servers;
- addons;
- CI images;
- external-service fixtures.

Likewise, mock-based repository tests cannot fully prove the following actual
PostgreSQL behavior:

- constraints;
- RLS;
- grants;
- database functions;
- transaction isolation.

Unit tests, browser tests, and database integration tests own different failure
classes.

---

## Decision Drivers

The following criteria were prioritized in this decision:

1. Detect security, Tenant-isolation, and workflow-integrity regressions first.
2. Place each test at the smallest stable boundary that owns the responsibility.
3. Avoid breaking unnecessary numbers of tests during internal refactoring.
4. Detect LOCAL/REMOTE and App/Server runtime contract drift.
5. Preserve defect fixes as executable regression cases.
6. Use coverage to find blind spots without making coverage itself the goal.
7. Do not distort production structure merely to test unimportant code.
8. Stop expanding Vitest after important risks are sufficiently protected.
9. Expand visual, browser, and database verification into separate execution
   boundaries when needed.

---

## Options Considered

### Option 1 — Leave Testing to Each Change Author's Discretion

Advantages:

- Initial work is faster.
- There is little cost for maintaining separate standards.

Disadvantages:

- Similar risks may receive different testing depth.
- Authorization negative paths are easily omitted.
- LOCAL/REMOTE parity remains an implicit expectation.
- Regression tests are not retained consistently.

Conclusion:

This option was rejected as insufficient for the current structure, where
Service Desk workflows and runtime boundaries have become complex.

---

### Option 2 — Immediately Enforce a Repository-Wide Coverage Threshold

Example:

```txt
Statements >= 80%
Branches >= 80%
Functions >= 80%
Lines >= 80%
```

Advantages:

- The rule is simple.
- It is easy to automate.
- Areas with almost no tests are easy to discover.

Disadvantages:

- Work may concentrate on low-risk UI and wrappers.
- Easy-to-execute lines may be covered instead of important denial branches.
- Low-quality tests with excessive mocks can also increase the metric.
- The current source structure and browser-test boundary have different meanings.
- Meeting a high threshold may require large amounts of testing work unrelated
  to feature delivery.

Conclusion:

Coverage reports will be used, but a repository-wide threshold will not be
enforced.

---

### Option 3 — Retain Only Pure Unit Tests

Advantages:

- They are fast and deterministic.
- They are suitable for domain rules and normalization.
- Failures are easy to diagnose.

Disadvantages:

- They do not protect auth-before-dispatch in Route Handlers.
- Transaction, History, and Work Session coordination are difficult to verify.
- React Query invalidation, state synchronization, and page orchestration are
  missed.
- Runtime contract drift is difficult to detect.

Conclusion:

Pure unit tests remain the foundation but are insufficient as the entire
strategy.

---

### Option 4 — Center Testing on Browser and E2E Coverage

Advantages:

- Tests are close to actual user workflows.
- They can find integration problems involving frameworks and rendering.

Disadvantages:

- Detailed authorization and workflow branches are difficult to express.
- Execution is slower and fixture maintenance is more expensive.
- Failures are harder to isolate.
- Browser or environment failures can block business-rule tests.

Conclusion:

Browser and E2E testing will be used as separate future layers, not as a
replacement for the Vitest unit strategy.

---

### Option 5 — Adopt Risk-Based Layered Testing

Approach:

```txt
Pure rule
-> unit test

State / hook
-> hook/store test

HTTP/auth/runtime
-> Route Handler test

Workflow / transaction
-> service test

LOCAL/REMOTE or App/Server parity
-> contract test

Page composition
-> view-model/component test
```

Critical behavior protects denial, boundary, and failure side effects as well as
successful cases.

Advantages:

- Testing effort can be allocated according to actual failure impact.
- Each layer's responsibilities are visible in the test structure.
- Tests are relatively resilient to refactoring.
- Runtime contract drift can be verified explicitly.
- Security and workflow invariants that are difficult to describe with coverage
  metrics can be protected.

Disadvantages:

- The standard requires more judgment than a single percentage.
- Reviewers need to understand the domain and architecture.
- Unverified Critical branches must be reviewed periodically.

Conclusion:

This option is adopted.

---

## Decision

### 1. Use the Vitest Unit Suite as the Default Regression Boundary

The default direction is:

```txt
Vitest unit project
-> node environment by default
-> jsdom opt-in for DOM tests
```

Server and domain tests do not pay the default cost of a browser environment.

---

### 2. Prioritize Contract Coverage over Coverage Percentage

Before adding a test, ask:

```txt
What can regress?
Who can perform the operation?
What must be denied?
What state may change?
What must remain immutable?
Which runtime owns the behavior?
Which observable result must remain equivalent?
```

Choose the smallest stable test boundary that owns the answer.

---

### 3. Each Layer Directly Verifies Only the Responsibility It Owns

```txt
domain
-> pure invariant

lib
-> application contract / normalization / shared policy

server
-> use case / transaction / persistence coordination

feature
-> user-facing workflow / cache / state orchestration

app/api
-> HTTP validation / auth / LOCAL-REMOTE dispatch

app/(protected)
-> page / route state / view-model / capability composition
```

The same business branch is not repeated at every layer.

---

### 4. Critical Boundaries Protect Denial and Failure as Well as Allow Cases

Critical areas include:

- authentication;
- session identity;
- impersonation;
- authorization;
- tenant/category scope;
- ticket ownership;
- lifecycle transitions;
- approval/assignment;
- transactions;
- immutable History;
- Work Session cleanup;
- LOCAL/REMOTE dispatch and parity.

Where possible, test the following meaningful branches:

```txt
allow
deny
boundary / mismatch
malformed trusted input
dependency failure
forbidden side effect
LOCAL / REMOTE when applicable
```

In particular, authorization must fail before runtime dispatch or repository
access.

---

### 5. Protect LOCAL/REMOTE Parity as an Independent Contract

LOCAL and REMOTE do not need to share a storage implementation.

Where a feature is shared, however, its application-facing meaning must be
compatible.

```txt
authorized target
-> LOCAL implementation
-> REMOTE implementation
-> equivalent application contract
```

Storage differences in LOCAL are allowed; differences in authorization and
workflow meaning are not.

---

### 6. Synchronize Independent App/Server Runtime Implementations with Contract Tests

When a runtime boundary can be separated in production, implementations are not
forcibly merged merely to remove duplication.

Where both sides need the same meaning, as with Ticket ownership projection,
apply:

```txt
App implementation
Server implementation
-> same shared contract suite
```

The invariant preserved in tests is not that both implementations currently
live in one repository, but the following:

```txt
App runtime projection
===
Server runtime projection
```

---

### 7. Do Not Enforce a Global Coverage Threshold

No single repository-wide threshold is applied to statements, branches,
functions, or lines.

Coverage reports are used to:

- find unexecuted Critical branches;
- find new behavior with no tests;
- investigate sharp decreases between changes;
- assess whether future area-specific thresholds would be useful.

The following rules are not adopted:

```txt
add tests because coverage is low
```

```txt
assume the system is safe because coverage is high
```

---

### 8. Retain Regression Fixes as Tests After Confirming the Contract

When a defect is found, use the following sequence:

```txt
reproduce
-> confirm the current contract
-> determine whether production code or the fixture is wrong
-> make the smallest correction
-> retain the regression test
```

Do not freeze incorrect current behavior in a test.

Conversely, do not change correct production behavior merely to make a fixture
pass.

If a deleted requirement or temporary guard is no longer current behavior,
remove its related tests as well.

---

### 9. Limit Additional Vitest Coverage to P1/P2 Risk Gaps

The final strengthening phase expanded the remaining gaps only through the
following levels:

```txt
P1
authentication / authorization
Ticket / Tenant HTTP and service
REMOTE settings/action/runtime contract

P2
query construction
session storage
AppUser bootstrap
preference synchronization
attachment hook
organization contract
History persistence
```

At this point, the following major boundaries were protected:

```txt
domain invariants
-> application contracts
-> feature workflows
-> server use cases
-> HTTP/runtime orchestration
-> authentication / impersonation
-> tenant/scope isolation
-> LOCAL/REMOTE parity
-> App/Server ownership parity
-> page/view-model composition
-> state persistence/synchronization
-> History / Work Session persistence
```

This is the current stop condition for expanding Vitest.

---

### 10. Intentionally Exclude P3 and Low-Risk Shared UI Utilities

The following areas remain outside the current Vitest stopping boundary:

- RouteLoadingProvider;
- breadcrumb utilities;
- DatePicker utilities;
- SortableTree utilities;
- shadcn/Base UI wrappers;
- layout-only components;
- badges, skeletons, and icons;
- types, constants, and barrels;
- thin Axios/API forwarding code;
- presentation-only components.

These areas are not impossible to test.

They are intentionally not prioritized in the current project because the risk
they protect is low relative to the testing cost.

---

### 11. Keep Storybook and Browser Tests as a Separate Responsibility

For complex reusable UI and visual or interaction states, Storybook browser
testing is more appropriate than indefinitely expanding Vitest.

Examples:

- reusable component states;
- form-control variants;
- dialogs;
- disabled/loading/error variants;
- responsive and visual interactions.

Full user journeys involving authentication, navigation, and backend persistence
belong in a Playwright E2E boundary when needed.

Do not duplicate the same scenario in Vitest, Storybook, and E2E merely to
increase test counts.

---

### 12. Verify Actual Database Guarantees in a Separate Integration Suite When Needed

Mock-based repository and service tests are suitable for fast regression
detection but cannot fully prove:

- PostgreSQL constraints;
- RLS;
- grants;
- database functions;
- actual isolation and rollback;
- migration compatibility.

When these risks enter the actual change scope, consider a separate database
integration suite.

Increasing unit coverage numbers does not replace database guarantees.

---

## Verification Snapshot

The verification result at the completion of the final Vitest strengthening
work was:

```txt
164 test files passed
853 tests passed
1 todo
TypeScript passed
ESLint passed
git diff --check passed
```

These numbers are not the success criteria for the strategy.

The meaningful outcome is that the following gaps were closed:

- fail-closed auth identity projection;
- Service Desk settings authorization orchestration;
- login/logout redirect regression;
- Ticket HTTP route boundary;
- Tenant lifecycle;
- REMOTE settings handlers;
- Ticket Action input validation;
- App/Server Ticket ownership contract parity;
- session/storage synchronization;
- preference stale-result protection;
- attachment input policy;
- organization write boundary;
- History persistence.

---

## Consequences

### Positive

- Testing investment is concentrated on actual security and workflow risks.
- Each layer verifies the contract it owns.
- Duplication between lower-level rule tests and higher-level orchestration tests
  is reduced.
- LOCAL/REMOTE drift can be detected explicitly.
- Behavioral parity between App and server runtimes that may be separated can be
  protected.
- Regression fixes remain as executable cases.
- Coverage reports remain useful for discovering gaps.
- An explicit stop condition prevents unlimited test expansion.

### Negative / Trade-offs

- The strategy is harder to explain than one repository-wide percentage.
- Reviewers need to understand the domain and architecture.
- Without a global threshold, one automatic numerical gate cannot prevent every
  omission of an important new branch.
- Mock-based tests cannot fully prove actual database and infrastructure policy.
- Contract-test fixtures must evolve with DTO and runtime changes.

---

## Rejected Simplifications

The following rules are not adopted:

```txt
Every file must have a test file.
```

```txt
80% coverage means the feature is safe.
```

```txt
One page test can replace domain, authorization, and workflow tests.
```

```txt
Mock every dependency until the test becomes easy.
```

```txt
LOCAL passing implies REMOTE parity.
```

```txt
App and server implementations should always be merged because they are in one repository.
```

```txt
Browser tests should run inside every unit test command.
```

```txt
Repository mock tests prove database security.
```

```txt
Keep tests for deleted behavior because more tests are always better.
```

These rules are simple and easy to measure, but they can hide missing contracts
or obsolete requirements.

---

## Revisit Conditions

Revisit coverage thresholds or test boundaries when:

- Critical areas can be classified reliably by separate globs or packages;
- coverage trends have accumulated over several releases;
- the Storybook browser-test execution boundary is stable;
- Playwright E2E needs to become an actual CI gate;
- schema and RLS changes increasingly require database integration tests;
- CI can produce unit, browser, and database-test artifacts consistently.

Even if thresholds are introduced, prioritize the following over one
repository-wide number:

```txt
Critical branch coverage
changed-code regression
contract-specific threshold
```

---

## Current Direction

```txt
Code change
-> identify regression risk
-> identify owning layer
-> add/update the smallest stable test
-> run targeted tests
-> run full Vitest
-> TypeScript
-> ESLint
```

```txt
Coverage report
-> inspect meaningful uncovered behavior
-> prioritize Critical/High gaps
-> ignore low-value percentage chasing
```

```txt
Bug fix
-> reproduce
-> confirm contract
-> fix
-> keep regression test
```

```txt
Visual / reusable UI
-> Storybook/browser boundary
```

```txt
Full user journey
-> Playwright when intentionally introduced
```

```txt
Database guarantees
-> integration suite when required
```

---

## Related Documents

- [Testing Strategy](../05-development/testing-strategy.md)
- [Development Approach](../05-development/development-approach.md)
- [Service Desk Implementation Strategy](../05-development/service-desk-implementation-strategy.md)
- [React Query Strategy](../05-development/react-query-strategy.md)
- [Category Activation and Routing Readiness](./2026-08-category-activation-and-routing-readiness.md)
- [Settings Change and In-Flight Ticket Policy](./2026-08-settings-change-and-in-flight-ticket-policy.md)

---

## Summary

The project adopts risk-based layered testing instead of percentage-first
coverage.

```txt
Critical behavior
-> meaningful allow / deny / boundary coverage

Layer responsibility
-> matching stable test boundary

LOCAL / REMOTE
-> application contract parity

App / Server runtime
-> independent implementations + shared contract suite

Coverage
-> diagnostic signal, not quality target

Vitest
-> stop when important risks are sufficiently protected
```

The important outcome is not that every file has a test or that one percentage
is high.

The important outcome is that authentication, authorization, tenant isolation,
workflow transitions, transaction behavior, immutable History, state
synchronization, and runtime parity are protected by assertions at the
responsibility boundaries that own them.

Lower-risk visual and shared UI behavior remains outside the current Vitest stop
condition and should be covered by Storybook/browser testing when that boundary
provides more value.

---

## Status

Accepted
