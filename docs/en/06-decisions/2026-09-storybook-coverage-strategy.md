# Storybook Coverage Strategy (2026-09)

## Background

In September 2026, after organizing risk-based Vitest coverage, the project
needed a separate decision about where to verify the visual states and browser
interactions of reusable UI components.

Vitest primarily protects application correctness across these areas:

```txt
domain rule
-> authorization
-> Route Handler
-> server workflow
-> feature orchestration
-> page/view-model composition
```

Application-owned reusable UI, however, benefits from review in an isolated
browser environment because it exposes:

- multiple visual states;
- configurable public props;
- controlled values;
- browser interactions;
- caller-provided composition;
- theme-dependent and locale-dependent presentation.

The early project maintained component playground pages under
`src/app/(protected)/demo` to inspect `src/components/custom`.

```txt
application route
-> demo page
-> custom component
-> demo-specific control UI
```

As Storybook coverage expanded, the application route and Storybook began to
duplicate the same component-inspection responsibility. The project therefore
needed to define both the overall Storybook coverage boundary and the criteria
for replacing the previous `/demo` playground.

---

## Problem

### 1. A Story Alone Does Not Replace the Demo Playground

Even when Storybook Controls are present, users cannot explore a public
parameter if its `args` do not reach the rendered component. If a controlled
component reads only the initial `useState(args.value)`, later Control changes
and Canvas interactions can also diverge into separate states.

```txt
Story exists
!=
Storybook can inspect the public component contract
```

Replacement requires all of the following:

```txt
representative Story
+ configurable public Controls
+ args connected to rendering
+ meaningful browser interaction
+ observable controlled result
```

### 2. The Demo Provided Parameter Exploration as Well as Visual States

The previous demo pages allowed direct changes to public parameters such as:

```txt
AvatarMultiComboBox -> maxImages
DatePicker family   -> minDate / maxDate / minuteStep / compact / range options
FileAttachment      -> maxCount / maxSizeMB / accept / limitBehavior
SortableTree        -> reorderScope / indentation / collapsible
Stepper             -> orientation / visual composition
```

Failing to distinguish meaningful states from continuous parameter variation
creates unnecessary near-duplicate Stories.

```txt
meaningfully different state
-> Story

continuous public parameter variation
-> Controls
```

### 3. Components in the Same Family Can Have Different Public Contracts

The following components belong to shared families but expose different public
APIs:

```txt
AvatarComboBox / AvatarMultiComboBox
DatePicker / DateTimePicker / DateRangePicker / SearchDateFilter
HierarchicalSelect / MultiHierarchicalSelect
MultiComboBox / TreeMultiComboBox
```

If one Meta renders another public component only through a custom renderer,
that component's own props may not appear naturally in Controls. Storybook
hierarchy should reflect public component contracts rather than source-folder
grouping.

### 4. The Overall Storybook Scope Is Not the Same as the `/demo` Replacement Scope

The previous `/demo` route was a playground for `src/components/custom`.
Storybook as a whole, however, was designed to cover application-owned reusable
UI across three primary areas:

```txt
src/components/custom
src/components/layout
src/components/menu
```

It also allows a small number of feature presentation components when they can
render independently without recreating application workflows.

The project therefore distinguishes these two boundaries:

```txt
/demo replacement boundary
-> src/components/custom

overall Storybook boundary
-> custom
-> selected layout/menu
-> selected independent feature presentation
```

### 5. Component Variants and Caller Composition Must Remain Distinct

For example, a Stepper label such as `Step 1: Request` is caller-provided label
composition, not a Stepper variant. Adding a production component variant that
does not belong to its public responsibility would make the Story document a
different contract from the real component.

### 6. Storybook-Only Contracts Can Drift from Production

When a production option constant or type already exists, Storybook should
reuse it. Hard-coding the same options again or adding a Storybook-only
production prop allows the two contracts to evolve independently.

---

## Decision Drivers

1. Application-owned reusable UI contracts must be independently inspectable.
2. Parameter exploration and interaction available in the Demo must remain
   available.
3. Stories and Controls must reflect production public APIs.
4. Representative states must be distinguished from continuous parameter
   variation.
5. Controls and Canvas must share consistent state for controlled components.
6. Storybook must not expand into a replacement for application workflow or
   domain tests.
7. The project must not redocument shadcn/Base UI itself.
8. Duplicate maintenance of an application-internal component playground must
   be removed.
9. The overall Storybook scope must not be confused with the `/demo`
   replacement boundary.

---

## Options Considered

### Option 1. Keep Both `/demo` and Storybook

This would preserve both application-context and isolated-context inspection,
but it would duplicate maintenance of the same custom components, fixtures, and
control UI. Variants and fixtures could also drift between the two environments.

This option was rejected because Storybook can provide equivalent or better
inspection capability.

### Option 2. Remove `/demo` as Soon as a Matching Story Exists

This would remove the duplicate route quickly, but configurable parameters,
args connections, controlled interactions, and observable results could be
lost.

This option was rejected because Story existence alone is not a sufficient
replacement criterion.

### Option 3. Put Every UI and Feature Component in Storybook

Story count would increase rapidly, but this would redocument shadcn/Base UI
and encourage Storybook to reproduce React Query, APIs, workflows, and the
application provider tree.

This option was rejected as disproportionate to the project's purpose.

### Option 4. Use Application-Owned Reusable UI as the Explicit Boundary

The project adopted the following boundary:

```txt
src/components/custom
-> comprehensive reusable component coverage

src/components/layout
src/components/menu
-> selected application-wide visual UI

independent feature presentation
-> small, explicit exceptions

domain / workflow / authorization
-> Vitest

full application workflow
-> Live Demo

future cross-page browser journey
-> E2E / Playwright
```

This structure replaces the `/demo` playground without turning Storybook into
another application.

---

## Decision

### 1. `src/components/custom` Receives Comprehensive Storybook Coverage

Storybook should cover the public families of reusable custom components owned
by the project wherever practical. It does not create one Story for every
internal implementation file.

```txt
public component contract
-> Storybook Meta

internal implementation detail
-> covered through the public component
```

### 2. Layout and Menu Components Are Included Selectively

From `src/components/layout` and `src/components/menu`, Storybook includes only
components whose application-wide visual states are useful in isolation and do
not require excessive runtime reconstruction.

The current implementation includes:

```txt
Layout/RouteLoading
Menu/PreferencesMenu
Menu/UserMenu
```

### 3. Feature Stories Are Limited to Independent Presentation Components

Feature workflows and containers do not move into Storybook. A small number of
presentation components may be included when they reuse domain types and render
without API or workflow infrastructure.

The current exceptions are:

```txt
ServiceDesk/TicketStatusBadge
ServiceDesk/TicketHistoryTimeline
```

### 4. Storybook Has No Repository-Wide Coverage Target

The project does not use these goals:

```txt
Every React component needs a Story
Every UI file needs Storybook coverage
```

Story count and Story-file count are not quality metrics. Coverage is evaluated
by whether a public contract can be inspected independently.

### 5. Meaningfully Different States Become Stories

States worth inspecting separately, such as `Default`, `WithValue`, `Empty`,
`Disabled`, `ReadOnly`, `Loading`, and `Multiple`, may receive dedicated
Stories.

Continuously varying parameter values do not become near-duplicate Stories.

### 6. Continuous Public Parameters Use Controls

Configurable values such as the following belong in Storybook Controls by
default:

```txt
maxImages
minDate / maxDate
minuteStep
maxCount / maxSizeMB
orientation
indentation
collapsible
```

Demo-specific `<Input>`, `<Select>`, or `<Switch>` controls are not reproduced
when Storybook Controls provide the same capability.

### 7. Controls and Canvas Share Controlled State

```txt
Controls change
-> args
-> rendered component

Canvas interaction
-> callback
-> args/state update
-> observable result
```

Stories use `useArgs` or an equivalent Storybook-controlled pattern when
needed. Copying initial args into local state and ignoring later Control changes
is not accepted as a complete connection.

### 8. Meta Boundaries Follow Public Component Contracts

Components use separate Meta definitions when they expose materially different
public APIs, even if they share one source family. The current Avatar,
DatePicker, HierarchicalSelect, and MultiComboBox families are separated by
public component.

### 9. Stories Do Not Redefine Production Contracts

Storybook reuses production types, option constants, and public enum/value
definitions. For example, the DateRangePicker preset Control uses the production
`DEFAULT_DATE_RANGE_PRESETS` constant.

Production props are not added merely to make Storybook easier to configure.

### 10. Caller Composition Remains Separate from Component Variants

The Stepper numbered-label example is a composition Story using caller-provided
content. It does not add a `showStepNumber` or `showStepPrefix` responsibility
to Stepper.

### 11. Browser Interaction Is Verified According to Inspection Value

The Storybook Canvas should support public interactions such as:

- select, remove, and clear;
- date and range selection;
- text/editor input;
- attachment add/remove;
- tree expand/collapse and supported reordering;
- step navigation.

Manual Canvas interaction can be sufficient. A `play` interaction is added only
when it is stable and provides meaningful regression value. The current
ColorPicker, FileAttachment, RichEditor, SortableTree, and Stepper Stories have
`play` interactions.

### 12. Full Application Workflows Do Not Move into Storybook

Vitest and the Live Demo review complete workflows at their respective
boundaries, including:

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

Future cross-page, real-browser regressions belong to a Playwright E2E
boundary. Storybook does not reproduce the complete application provider and
API architecture.

### 13. Storybook Replaces the Previous `/demo` Playground

The custom-component playground responsibility previously provided by
`src/app/(protected)/demo` has moved to Storybook Stories, Controls, args
connections, interactions, and observable results.

The route had no application-workflow responsibility that could not be moved to
Storybook, so it has been removed.

```txt
previous
-> src/app/(protected)/demo

current
-> src/components/custom
-> src/stories
-> Storybook
```

This does not remove the login-page `Try Demo` flow, the LOCAL runtime, mutable
demo state, or the Service Desk Live Demo. Only the application-internal custom
component playground route was removed.

### 14. Storybook Is Available through the `/storybook` Route

In development, the protected application `/storybook` route displays
Storybook from port 6006 in an iframe. `npm run dev:all` starts Next.js and
`npm run storybook:no` (`storybook dev -p 6006 --no-open`) together.

In production builds, the Storybook static output is copied into
`public/storybook-static` and served through the same protected route.

```txt
development
/storybook -> http://localhost:6006

production
/storybook -> ${basePath}/storybook-static/index.html
```

### 15. Theme, Locale, and Runtime Providers Are Shared

The Storybook preview loads application CSS and provides:

- a light/dark theme toolbar;
- `en`, `ko`, `fr`, and `es` locale options;
- the application i18next runtime;
- a React Query provider with queries disabled;
- an empty NextAuth session provider.

Global query defaults and Story-specific fixtures prevent unintended network
requests.

### 16. The Storybook Browser Project Remains Separate from Default Unit Tests

Vitest includes a `storybook` browser project using `@storybook/addon-vitest`
and headless Playwright Chromium. Changes to `play` interactions or browser-only
behavior can run it explicitly:

```bash
npm exec vitest -- run --project storybook
```

The default `npm test` command runs only the `unit` project. The Storybook
browser project is not currently a clean, enforced CI gate.

---

## Current Implementation Result

At the time this decision was implemented, the Storybook surface was:

| Scope | Story files | Responsibility |
| --- | ---: | --- |
| `src/components/custom` | 17 | Comprehensive coverage of public reusable component families |
| `src/components/layout` | 1 | Route-loading visual states |
| `src/components/menu` | 2 | Application-wide preference and identity menus |
| Selected feature presentation | 2 | Ticket status and history presentation |
| Total | 22 | 94 Story entries |

The implementation provides:

- Meta definitions and representative states aligned with custom-component
  public APIs;
- args and `useArgs` connections for controlled Stories, with the remaining
  browser-runner failures tracked as a verification gap;
- reuse of production options and types;
- global switching across themes and four locales;
- selective `play` coverage for stable interactions;
- removal of the `/demo` component playground;
- development and production Storybook through the protected `/storybook`
  route;
- integration of the Storybook static build into the application production
  build.

The Storybook browser project currently passes 90 of 94 Story tests. Four
`play` scenarios still fail under the Vitest browser runner:

```txt
ColorPicker / Default
RichEditor / Empty
SortableTree / Collapse Interaction
Stepper / Default
```

The project therefore treats the browser project as a diagnostic check rather
than a required CI gate. This does not change the accepted coverage boundary,
but automated interaction coverage should not be described as fully passing
until these failures are resolved.

---

## Costs and Constraints

- Storybook Meta definitions and Controls must evolve with public APIs.
- Controlled Stories can be more complex than static Stories.
- Editors, file inputs, and drag-and-drop require browser timing and interaction
  considerations.
- Not every parameter combination receives automated verification.
- Storybook builds and browser-tooling compatibility require separate
  maintenance.
- The Storybook browser project is configured but still has four failing
  interaction scenarios and is not yet a default test or CI gate.

---

## Application Guide

| Target | Default verification boundary |
| --- | --- |
| Public reusable UI in `src/components/custom` | Comprehensive Storybook coverage |
| Selected `layout` / `menu` UI | Storybook |
| Independent feature presentation component | Limited Storybook exception |
| Meaningfully different visual/state variation | Story |
| Configurable public prop | Controls |
| Controlled public value | args / `useArgs` synchronization |
| Caller-provided content composition | Composition Story |
| Important, stable browser interaction | Canvas + selective `play` |
| shadcn/Base UI primitive | Excluded from Storybook by default |
| Feature workflow/container | Vitest / Live Demo |
| Domain/authorization/routing | Vitest |
| Full cross-page browser workflow | Future E2E |

---

## Rejected Simplifications

The project does not adopt these rules:

```txt
Every component needs a Story
A Story exists, so the Demo is replaceable
Every prop combination should be a separate Story
Storybook Controls may duplicate production options
Caller-provided content should become a component variant
Every browser interaction needs a play test
Feature workflows should move into Storybook for completeness
Storybook should recreate the full application provider tree
```

---

## Reconsideration Triggers

Reconsider the Storybook coverage boundary when:

- an independent, application-owned design-system area appears outside the
  current three areas;
- a feature component is reused across multiple surfaces without workflow
  dependencies;
- visual regressions become a significant source of production defects;
- shared Storybook accessibility automation becomes necessary;
- the Storybook browser project becomes a stable CI gate;
- custom components move into a separate package or design system.

Even then, expand the boundary according to public ownership and regression
risk rather than applying Storybook to the whole repository at once.

---

## Related Documents

- [Testing Strategy](../05-development/testing-strategy.md)
- [Vitest Coverage Strategy](./2026-09-vitest-coverage-strategy.md)
- [Component Boundary](../04-client-engineering/ui/component-boundary.md)
- [Development Approach](../05-development/development-approach.md)
- [Feature-Based Structure](../02-architecture/feature-based-structure.md)
- [Boolean Naming Convention](../05-development/boolean-naming-convention.md)

---

## Summary

Storybook is not a repository-wide component coverage tool.

```txt
Custom reusable UI
-> comprehensive Storybook coverage

Selected layout/menu UI
-> application-wide visual inspection

Selected feature presentation
-> small, independent exceptions

Domain / workflow correctness
-> Vitest

Full application workflow
-> Live Demo / future E2E
```

The public parameter exploration and interactions previously available in the
`/demo` component playground have moved to Stories, Controls, args connections,
and controlled results. Application routes now focus on product workflows and
the embedded Storybook entry, while Storybook owns independent development and
review of reusable UI.

---

## Status

Accepted and implemented
