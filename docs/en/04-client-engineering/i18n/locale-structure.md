# Locale Structure

## Goal

The localization structure keeps translation ownership explicit while allowing
large namespaces to be maintained as smaller source files. Translation keys
should follow the application responsibility that owns the copy, not the route
or component that happens to render it.

The structure aims to:

- keep the same namespace and key shape in every supported language;
- separate shared vocabulary, reusable component copy, and feature copy;
- let large namespaces grow without creating one oversized JSON file;
- keep translation calls explicit and easy to trace.

## Runtime Model

Namespace contracts live in `src/lib/application/i18n`. Each language is
composed by its `locales/<language>/index.ts`, and
`src/lib/client/i18n/runtime.ts` registers the completed resources with
i18next.

The current runtime bundles `en`, `es`, `fr`, and `ko` eagerly. Splitting a
namespace into a directory is therefore a source-ownership decision; it does
not create route-level or namespace-level lazy loading. English remains the
fallback language.

## Namespace List

The application currently registers these namespaces through `NS`:

```txt
auth
common
component
dashboard
documents
error
message
serviceDesk
settings
shared
storybook
validation
```

Use the `NS` constant instead of repeating namespace string literals.

```ts
const { t } = useTranslation(NS.serviceDesk);

t("field.priority", { ns: NS.common });
```

## Directory Structure

Each supported language mirrors the same structure. English is shown below as
the canonical example.

```txt
src/lib/application/i18n/locales/en/
├─ index.ts
├─ auth.json
├─ common.json
├─ dashboard.json
├─ message.json
├─ storybook.json
├─ validation.json
├─ component/
├─ documents/
├─ error/
├─ serviceDesk/
├─ settings/
└─ shared/
   ├─ enum.json
   └─ index.ts
```

A small, cohesive namespace may stay in one JSON file. A namespace with
multiple independent owners or a growing catalog uses a directory and an
`index.ts` composition boundary.

For example, `serviceDesk` is maintained as feature-aligned fragments while
remaining one public i18next namespace:

```ts
import insights from "./insights.json";
import shared from "./shared.json";
import ticket from "./ticket.json";
import ticketAction from "./ticketAction.json";

const serviceDesk = {
  ...shared,
  ...ticket,
  ...ticketAction,
  ...insights,
};

export default serviceDesk;
```

The physical file split must not require consumers to know which fragment owns
a key. Consumers continue to use `NS.serviceDesk` and the existing public key
path.

## Namespace Responsibilities

### `common`

Generic UI vocabulary shared across the application:

- action labels such as save, cancel, and search;
- common field names;
- pagination, sorting, table, and empty-state vocabulary;
- generic placeholders.

`common` describes reusable interface language, not stable code-value catalogs.

### `shared`

Localized labels for stable application values that can be rendered by
selectors, filters, badges, and similar consumers.

Current examples include:

```txt
shared.enum.accessLevel
shared.enum.priority
shared.enum.riskLevel
shared.enum.dueAt
```

The `shared` namespace is intentionally narrow. Add a key only when it maps a
stable application value to a user-facing label. Page copy, validation text,
workflow messages, and component instructions do not belong here.

```ts
const { t } = useTranslation(NS.shared, {
  keyPrefix: "enum.priority.options",
});

const highLabel = t("high");
```

Generic date-range preset labels remain owned by `component.datePicker`
because they are part of the reusable DatePicker product rather than a shared
application enum catalog.

### `component`

Copy owned by reusable application components, such as placeholders, empty
states, and interaction labels inside DatePicker, RichEditor, or combo-box
components.

### `storybook`

Copy used by `src/stories` to describe component states and fixtures. Actual
application page copy does not belong in this namespace.

The `dashboard` namespace owns home-page copy, while `serviceDesk` owns the
Service Desk reset action copy.

### Feature namespaces

`serviceDesk`, `settings`, `documents`, and `auth` own workflow and page copy
for their respective application responsibilities. Reusable components should
not depend on these namespaces unless the component itself is feature-owned.

### Feedback namespaces

- `validation`: inline input and schema validation feedback;
- `message`: expected action feedback such as success and confirmation copy;
- `error`: system, API, and exceptional failure messages.

See [Validation Messages](./validation-messages.md) for the detailed feedback
policy.

## Ownership Decision

Use the following order when deciding where a translation belongs:

1. If a reusable component owns the behavior and wording, use `component`.
2. If the key maps a stable application value to a label, use `shared`.
3. If the wording belongs to a feature workflow or page, use that feature
   namespace.
4. If the wording is generic UI vocabulary, use `common`.
5. If it communicates validation, action feedback, or an exceptional failure,
   use `validation`, `message`, or `error` respectively.

`shared` and `common` must not become fallback locations for copy whose owner is
unclear. Resolve the owner before adding the key.

## Language Parity

Every structural change must be applied to `en`, `es`, `fr`, and `ko` together:

- directory and file names must match;
- composed namespace shapes must match;
- key paths must remain stable;
- English provides fallback text when a non-English catalog is incomplete.

When splitting an existing JSON file, compare the recomposed value with the
original object before removing the old file.

## Naming and Access

Prefer predictable, semantic key paths and explicit namespace access.

```ts
const { t: tShared } = useTranslation(NS.shared);

tShared(`enum.riskLevel.options.${riskLevel}`);
```

Avoid raw namespace strings:

```ts
// Avoid
t("enum.priority.options.high", { ns: "shared" });

// Prefer
t("enum.priority.options.high", { ns: NS.shared });
```

The locale namespace named `shared` is unrelated to the repository's
`src/shared` code layer, just as feature namespaces do not define TypeScript
domain boundaries.

## Anti-Patterns

- one global translation file;
- creating a namespace for a single page when an existing owner is clear;
- duplicating the same value labels in `shared` and `component`;
- mixing validation, success messages, and feature copy;
- splitting files in only one language;
- changing public key paths only because the physical files were reorganized;
- assuming a directory split provides runtime lazy loading.

## Summary

Namespaces are public translation contracts. Files and directories are
maintenance details behind those contracts. Keep small namespaces cohesive,
split growing namespaces by responsibility, reserve `shared` for stable
value-to-label catalogs, and preserve the same composed shape across every
supported language.
