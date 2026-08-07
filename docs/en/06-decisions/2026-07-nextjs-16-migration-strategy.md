# Next.js 16 Migration Strategy (2026-07)

## Context

`sunghwan-portal` had reached a stable milestone on Next.js 14 after completing
the major LOCAL demo and REMOTE Service Desk workflow boundaries.

The project was already using:

- Next.js App Router
- React
- TypeScript
- NextAuth
- Route Handlers
- Tailwind CSS
- React Query
- server-only PostgreSQL access
- LOCAL and REMOTE runtime paths

The next major technical step was to upgrade the framework and runtime baseline
before expanding automated tests, Storybook coverage, and further structural
refactoring.

The target direction was:

```txt
Node.js 24
npm 11
Next.js 16
React 19
ESLint 9
```

This was not only a package-version update.

The migration affected framework-facing contracts such as:

- asynchronous request and route parameters
- App Router page and Route Handler signatures
- `searchParams`
- middleware/proxy conventions
- ESLint configuration
- React and ecosystem peer dependencies
- Turbopack and build behavior
- Node.js runtime requirements

The project needed a migration strategy that preserved implemented Service Desk
behavior while making failures attributable and reviewable.

---

## Problem

### 1. A direct Next.js 14 to 16 jump would combine unrelated risks

Upgrading directly from Next.js 14 to 16 could expose several kinds of failures
at the same time:

```txt
dependency compatibility
framework API compatibility
runtime compatibility
lint configuration
build tooling
application behavior
```

If all of these changed in one undifferentiated step, it would be difficult to
identify whether a failure came from:

- Next.js 15 transition requirements
- Next.js 16 requirements
- React 19
- Node.js 24
- ESLint 9
- an application-level compatibility change

---

### 2. Mixing framework migration with domain refactoring would weaken reviewability

The Service Desk domain already contained complex behavior:

- approval and work routing
- requester update policy
- Ticket Action commands
- immutable History
- Work Session handling
- LOCAL and REMOTE data paths

Changing domain structure while changing the framework baseline would make
regressions harder to isolate.

The migration needed to prove that the existing architecture could survive a
framework upgrade without redesigning business behavior.

---

### 3. Staying on Next.js 15 for an extended period would add an unnecessary intermediate target

A long stabilization phase on Next.js 15 could reduce immediate migration risk,
but it would also:

- create another temporary runtime baseline
- delay the actual target version
- require repeated dependency and compatibility review
- increase maintenance work for a version that was not the final project target

The project needed the diagnostic value of the Next.js 15 transition without
turning Next.js 15 into a long-lived release target.

---

### 4. The upgrade needed clear commit and verification boundaries

A large migration commit would make it difficult to review:

- what changed only because of package versions
- what changed because of Node.js or Next.js requirements
- what changed in application code
- whether a later compatibility fix also introduced unrelated refactoring

The migration needed an explicit sequence.

---

## Options Considered

### Option 1 — Upgrade directly from Next.js 14 to 16 in one step

```txt
Next.js 14
-> update all dependencies
-> fix all errors
-> Next.js 16
```

#### Advantages

- shortest apparent migration path
- fewer intermediate commits
- immediate focus on the final target

#### Disadvantages

- dependency and application failures become mixed
- Next.js 15 transition requirements are harder to identify
- regression attribution becomes weak
- review becomes a large before/after comparison

This option was not selected.

---

### Option 2 — Upgrade to Next.js 15, stabilize it as a release, then later move to 16

```txt
Next.js 14
-> Next.js 15 release
-> extended stabilization
-> Next.js 16 release
```

#### Advantages

- lowest immediate migration pressure
- each major version can be tested independently
- easier rollback to a released intermediate version

#### Disadvantages

- creates a temporary long-lived target
- duplicates upgrade and release work
- delays the intended Node.js 24 and Next.js 16 baseline
- adds limited value for a portfolio project already targeting the latest
  supported architecture

This option was not selected as the overall strategy.

---

### Option 3 — Use Next.js 15 as a migration checkpoint inside one Next.js 16 branch

```txt
Next.js 14
-> Next.js 15 dependency checkpoint
-> Node.js 24 and Next.js 16 dependency checkpoint
-> application compatibility changes
-> final verification
```

#### Advantages

- preserves version-by-version diagnostic value
- reaches the final target without maintaining an intermediate release
- separates dependency changes from source compatibility changes
- produces reviewable commits
- supports targeted rollback and debugging

#### Disadvantages

- requires more deliberate commit planning
- temporary intermediate states may not be feature-complete
- each checkpoint still needs enough verification to remain meaningful

This option was selected.

---

## Decision

Use a staged migration inside one dedicated Next.js 16 migration branch.

The migration sequence is:

```txt
Step 1
Next.js 15 dependency baseline

Step 2
Node.js 24 + npm 11 + Next.js 16 dependency baseline

Step 3
Application and tooling compatibility changes

Step 4
Repository-level verification
```

The intermediate Next.js 15 state is a diagnostic checkpoint, not a long-lived
product release.

---

## Migration Boundaries

### 1. Separate dependency changes from application changes

Package and runtime baseline changes should be committed separately from
application compatibility changes where practical.

This makes it possible to distinguish:

```txt
package compatibility
from
source-code compatibility
```

---

### 2. Preserve Service Desk behavior

The migration must not redesign:

- Ticket statuses
- approval routing
- work assignment
- requester update rules
- Ticket Action execution
- History semantics
- Work Session behavior
- LOCAL/REMOTE DTO contracts

Framework-facing changes may adapt how those workflows are reached, but not
what they mean.

---

### 3. Limit application edits to migration requirements

Expected compatibility work includes:

- awaiting asynchronous route `params`
- treating page `searchParams` as asynchronous where required
- adapting request API usage
- replacing the previous middleware convention with the current proxy
  convention
- migrating ESLint configuration to the supported flat-config direction
- updating framework configuration and build-facing code
- resolving React 19 and related library compatibility

Unrelated UI, domain, and feature refactoring should remain outside the
migration commits.

---

### 4. Defer optional framework expansion

The migration does not automatically adopt every optional feature made
available by the new framework baseline.

Examples of work that should remain separately justified include:

- React Compiler adoption
- broad Server Component conversion
- unrelated caching redesign
- large routing redesign
- automated test expansion
- Storybook expansion

The upgrade establishes a stable baseline first.

---

## Implementation Sequence

### Commit 1 — Next.js 15 baseline

Purpose:

- expose the Next.js 14 to 15 transition separately
- update the first framework dependency baseline
- identify compatibility issues attributable to the intermediate major version

This commit should avoid unrelated source refactoring.

---

### Commit 2 — Node.js 24 and Next.js 16 baseline

Purpose:

- move the runtime to the final target
- update npm and framework dependencies
- align React and supporting package requirements
- establish the final package baseline before source fixes are mixed in

---

### Commit 3 — Application compatibility

Purpose:

- update App Router and Route Handler signatures
- adapt asynchronous request APIs
- update `params` and `searchParams` usage
- migrate middleware/proxy entry behavior
- align ESLint 9 configuration
- fix build and Turbopack compatibility issues
- preserve existing application behavior

---

## Verification Policy

Each meaningful checkpoint should run the checks available at that stage.

The final migration must verify at least:

```txt
TypeScript
ESLint
architecture boundaries
Next.js production build
Turbopack/build compatibility
```

When automated tests and Storybook verification are available, they should also
run against the final framework baseline.

A successful version install is not sufficient evidence of a completed
migration.

---

## Consequences

### Positive

- Framework migration risk is split into understandable categories.
- Dependency changes and application changes remain reviewable.
- Regressions can be attributed to a smaller migration stage.
- The final project reaches the intended modern runtime without maintaining an
  unnecessary intermediate release.
- Existing domain and data boundaries are tested against a major framework
  change.
- The migration strengthens the portfolio explanation beyond a simple package
  upgrade.

---

### Negative / Trade-offs

- The branch contains temporary intermediate checkpoints.
- More commits and repeated verification are required.
- Some compatibility fixes may appear mechanical even though they are necessary.
- Optional framework improvements must be scheduled separately after the
  baseline is stable.
- Dependency issues from multiple ecosystem packages may still require
  case-by-case resolution.

---

## Follow-up Policy

### 1. Keep future framework upgrades staged

When a future major framework or runtime upgrade affects multiple layers,
separate:

```txt
dependency baseline
tooling baseline
application compatibility
behavioral refactoring
```

Do not combine them without a clear reason.

---

### 2. Refactor after compatibility is proven

Structural improvements such as removing unnecessary `"use client"` boundaries,
modernizing component APIs, or replacing deprecated application patterns should
be handled in follow-up refactoring work unless directly required by the
framework migration.

---

### 3. Expand tests on the final API surface

Vitest, Storybook, and Playwright coverage should target the final Next.js 16
component and workflow boundaries rather than preserving temporary migration
APIs.

---

## Related Documents

- [Development Approach](../05-development/development-approach.md)
- [Feature-Based Structure](../02-architecture/feature-based-structure.md)
- [Routing Strategy](../02-architecture/routing-strategy.md)
- [State Management Strategy](../02-architecture/state-management.md)
- [Service Desk Implementation Strategy](../05-development/service-desk-implementation-strategy.md)

---

## Summary

The project migrated from Next.js 14 to Next.js 16 through staged checkpoints
rather than one undifferentiated upgrade.

Next.js 15 was used as a diagnostic transition, while Node.js 24, npm 11,
Next.js 16, React 19, and ESLint 9 formed the final baseline.

Dependency changes, application compatibility work, and later refactoring were
kept separate. This reduced migration ambiguity while preserving the existing
Service Desk workflow and LOCAL/REMOTE architecture.

---

## Status

Accepted and implemented.
