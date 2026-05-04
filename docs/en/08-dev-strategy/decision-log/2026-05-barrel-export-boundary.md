# Barrel Export Boundary Policy (2026-05)

## Context

During Service Desk module refactoring, we used `index.ts` as an all-purpose barrel export.
The initial goal was to shorten import paths and make internal feature modules easier to access.

Example:

```ts
// src/feature/serviceDesk/ticket/index.ts
export * from "./api";
export * from "./components";
export * from "./constants";
export * from "./context";
export * from "./forms";
export * from "./hooks";
export * from "./types";
export * from "./utils";
export * from "./write";
```

However, in the Next.js App Router environment, the server/client boundary is critical.
If API Routes, server utilities, or local demo handlers import a feature root barrel,
client-only modules can unintentionally leak into the server bundle.

Actual build error:

- Target: `src/app/api/service-desk/tickets/[ticketId]/route.ts`
- Messages:
  - `TypeError: (0 , r.createContext) is not a function`
  - `Failed to collect page data for /api/service-desk/tickets/[ticketId]`

The cause was that the route indirectly imported `context`, `components`, `hooks`,
React Query hooks, and browser-only wrappers through the feature root barrel.

---

## Problem

### 1. Server/Client Boundary Leakage

- Root barrels expose client-only modules together with server-safe modules
- Modules that cannot run on the server leak into route bundles

---

### 2. Import Intent Ambiguity

- A single import like `@/feature/.../ticket` does not clearly show pure vs client intent
- Dependency review and maintenance become more expensive

---

### 3. Over-exported Public Surface

- Folder-level re-exports accumulate and make the public API too broad
- Internal implementation changes are more likely to spill into external impact

---

## Decision

Do not use `index.ts` as an all-purpose export file.

- `index.ts` must export only intended public APIs, in a limited way
- Feature root `index.ts` must export only `server-safe` / `pure` modules
- Do not export client-only modules from root `index.ts`

---

## Rules

### 1. Feature Root `index.ts` Must Export Only Pure Public APIs

Allowed example:

```ts
export * from "./constants";
export * from "./mapper";
export * from "./mock";
export * from "./types";
export * from "./write";
```

However, `write.ts` must be a pure mapper that does not use React hooks, browser APIs, or client-only dependencies.

---

### 2. Do Not Re-export Entire Subfolders from Feature Root

Avoid:

```ts
export * from "./api";
export * from "./components";
export * from "./context";
export * from "./forms";
export * from "./hooks";
export * from "./utils";
```

In particular, do not export these from root barrels:

- `components`
- `context`
- `hooks`
- API client hooks
- forms client hooks
- browser storage repo

---

### 3. Subfolders May Use `index.ts` Only Within Their Own Responsibility Boundary

Examples:

- `ticket/components/index.ts`
- `ticket/api/index.ts`
- `ticket/forms/index.ts`

`components/index.ts` should export only components:

```ts
export * from "./TicketFormDialog";
export * from "./TicketList";
export * from "./chart";
```

---

### 4. Split `index.ts` and `client.ts` in Mixed Pure/Client Folders

API folder:

- `ticket/api/index.ts` (server-safe)
- `ticket/api/client.ts` (client-only)

```ts
// api/index.ts
export * from "./mapper";
export * from "./queryKeys";
export * from "./types";
```

```ts
// api/client.ts
"use client";

export * from "./api";
export * from "./queries";
export * from "./mutations";
export * from "./repo";
```

Note: if `api.ts` uses a frontend HTTP wrapper like `@/lib/api`, it is not server-safe.
In that case, export it from `api/client.ts`.

Forms folder:

- `ticket/forms/index.ts` (pure)
- `ticket/forms/client.ts` (client-only)

```ts
// forms/index.ts
export * from "./defaultValues";
export * from "./schema";
export * from "./types";
```

```ts
// forms/client.ts
"use client";

export * from "./useTicketForm";
```

---

### 5. Minimize Barrel Exports for Hooks / Context

Most hooks are client-only modules.
Therefore, avoid broad exports from hooks `index.ts` and prefer direct imports.

```ts
import { useTicketDraft } from "@/feature/serviceDesk/ticket/hooks/useTicketDraft";
```

Context is also treated as client-only because it uses `createContext` and `useContext`.
Do not export context from root `index.ts`.

---

### 6. Ban Feature Root Barrel Imports in Server Modules

Targets:

- API Route
- server module
- localDemo handler

Bad:

```ts
import {
  mapTicketDetailPayload,
  toTicketWriteInput,
  toTicketWritePayload,
  updateTicketSchema,
} from "@/feature/serviceDesk/ticket";
```

Recommended:

```ts
import { mapTicketDetailPayload } from "@/feature/serviceDesk/ticket/api/mapper";
import {
  toTicketWriteInput,
  toTicketWritePayload,
  updateTicketSchema,
} from "@/feature/serviceDesk/ticket/write";
import type { TicketWriteRequestInput } from "@/feature/serviceDesk/ticket/write";
```

---

## `"use client"` Policy

### 1. Files That Must Include `"use client"`

Files that directly use:

- `useState`, `useEffect`, `useRef`, `useMemo`, `useCallback`, `useContext`, `useReducer`
- `useQuery`, `useMutation`, `useForm`, `Controller`
- `useSession`, `useTranslation`, zustand hooks
- `window`, `document`, `localStorage`, `sessionStorage`

Example:

```ts
"use client";

import { useEffect, useMemo, useState } from "react";
```

---

### 2. Files That Must Not Include `"use client"`

These files are non-client by default:

- `types`
- `constants`
- `schema`
- `defaultValues`
- `mapper`
- `queryKeys`
- write payload mapper
- domain model
- server route
- localDemo handler
- pure utils

For utilities using browser APIs, document intent with browser-only comments rather than adding `"use client"`.

```ts
/**
 * Browser-only file utilities.
 *
 * These helpers use browser APIs such as File, Blob, and atob.
 * Do not import this module from server components, route handlers, or server utilities.
 */
```

---

## Final Structure Example

```txt
src/feature/serviceDesk/ticket
├─ api
│  ├─ index.ts       # server-safe API support
│  ├─ client.ts      # client API wrapper, queries, mutations, repo
│  ├─ mapper.ts
│  ├─ queryKeys.ts
│  ├─ types.ts
│  ├─ api.ts
│  ├─ queries.ts
│  ├─ mutations.ts
│  └─ repo.ts
├─ components
│  └─ index.ts       # component-only entry
├─ context           # direct import only
├─ forms
│  ├─ index.ts       # schema, defaultValues, types
│  └─ client.ts      # useTicketForm
├─ hooks             # direct import only
├─ utils             # direct import or pure-only export
├─ constants.ts
├─ mapper.ts
├─ mock.ts
├─ types.ts
├─ write.ts
└─ index.ts          # pure feature public API only
```

---

## Consequences

### Positive

- Prevents client-only modules from leaking into API Route bundles
- Clarifies server/client boundaries in Next.js App Router
- Reduces server bundle errors like `createContext is not a function`
- Import paths may be slightly longer, but import intent is clearer
- Improves Vercel build and production build stability

---

### Negative

- Reduces convenience of feature root imports
- Some import paths become one level longer
- Requires more explicit team rules than the old barrel-export style

---

## Decision Summary

`index.ts` is not a file for exporting "as much as possible."
It is a boundary file that exposes only intended public APIs in a limited way.

- Feature root `index.ts` exports only pure/server-safe modules
- Client-only modules are accessed through `client.ts` or direct imports

This policy keeps the server/client boundary explicit in the Next.js App Router environment.
