# Barrel Export Boundary Policy (2026-05)

## Context

Service Desk 모듈 리팩터링 과정에서 `index.ts`를 만능 barrel export처럼 사용했다.
초기 의도는 import 경로를 짧게 만들고 feature 내부 접근을 편하게 만드는 것이었다.

예시:

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

하지만 Next.js App Router 환경에서는 server/client 경계가 중요하다.
API Route, server utility, local demo handler가 feature root barrel을 import하면
의도하지 않게 client-only module이 서버 번들로 유입될 수 있다.

실제 빌드 오류:

- 대상: `src/app/api/service-desk/tickets/[ticketId]/route.ts`
- 메시지:
  - `TypeError: (0 , r.createContext) is not a function`
  - `Failed to collect page data for /api/service-desk/tickets/[ticketId]`

원인은 route가 feature root barrel을 통해 `context`, `components`, `hooks`,
React Query hooks, browser-only wrapper를 간접 import한 것이었다.

---

## Problem

### 1. Server/Client Boundary Leakage

- root barrel이 client-only 모듈까지 함께 노출
- 서버 런타임에서 실행 불가능한 모듈이 route 번들로 유입

---

### 2. Import Intent Ambiguity

- `@/feature/.../ticket` 한 줄 import만으로는 pure/client 구분이 불명확
- 리뷰/유지보수 시 의존성 성격 판단 비용 증가

---

### 3. Over-exported Public Surface

- 폴더 단위 재-export가 누적되며 public API가 과도하게 커짐
- 내부 구현 변경이 외부 영향으로 번질 가능성 증가

---

## Decision

`index.ts`를 만능 export 파일로 사용하지 않는다.

- `index.ts`는 의도된 public API만 제한적으로 export한다
- feature root `index.ts`는 `server-safe` / `pure` 모듈만 export한다
- client-only 모듈은 root `index.ts`에서 export하지 않는다

---

## Rules

### 1. Feature Root `index.ts`는 Pure Public API만 Export

허용 예시:

```ts
export * from "./constants";
export * from "./mapper";
export * from "./mock";
export * from "./types";
export * from "./write";
```

단, `write.ts`는 React hook, browser API, client-only dependency를 사용하지 않는 pure mapper여야 한다.

---

### 2. Feature Root에서 하위 폴더 전체 재-export 금지

피해야 할 예시:

```ts
export * from "./api";
export * from "./components";
export * from "./context";
export * from "./forms";
export * from "./hooks";
export * from "./utils";
```

특히 root barrel에서 export하지 않는 항목:

- `components`
- `context`
- `hooks`
- API client hooks
- forms client hooks
- browser storage repo

---

### 3. 하위 폴더는 자기 책임 범위에서만 `index.ts` 운영

예시:

- `ticket/components/index.ts`
- `ticket/api/index.ts`
- `ticket/forms/index.ts`

`components/index.ts`는 components만 export:

```ts
export * from "./TicketFormDialog";
export * from "./TicketList";
export * from "./chart";
```

---

### 4. Pure/Client 혼합 폴더는 `index.ts`와 `client.ts` 분리

API 폴더:

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

주의: `api.ts`가 `@/lib/api` 같은 프론트엔드 HTTP wrapper를 쓰면 server-safe가 아니다.
이 경우 `api/client.ts`에서 export한다.

Forms 폴더:

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

### 5. Hooks / Context Barrel Export 최소화

hooks는 대부분 client-only 모듈이다.
따라서 hooks `index.ts`에서 무분별한 export를 피하고 직접 import를 권장한다.

```ts
import { useTicketDraft } from "@/feature/serviceDesk/ticket/hooks/useTicketDraft";
```

context도 `createContext`, `useContext`를 사용하므로 client-only로 본다.
context는 root `index.ts`에서 export하지 않는다.

---

### 6. Server 모듈에서는 Feature Root Barrel Import 금지

대상:

- API Route
- server module
- localDemo handler

잘못된 예:

```ts
import {
  mapTicketDetailPayload,
  toTicketWriteInput,
  toTicketWritePayload,
  updateTicketSchema,
} from "@/feature/serviceDesk/ticket";
```

권장 예:

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

### 1. `"use client"`를 붙이는 파일

아래를 직접 사용하는 파일:

- `useState`, `useEffect`, `useRef`, `useMemo`, `useCallback`, `useContext`, `useReducer`
- `useQuery`, `useMutation`, `useForm`, `Controller`
- `useSession`, `useTranslation`, zustand hook
- `window`, `document`, `localStorage`, `sessionStorage`

예시:

```ts
"use client";

import { useEffect, useMemo, useState } from "react";
```

---

### 2. `"use client"`를 붙이지 않는 파일

아래 파일은 기본적으로 non-client:

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

Browser API를 사용하는 유틸은 `"use client"`보다 browser-only 주석으로 의도를 명시한다.

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

- API Route에 client-only module이 섞이는 문제를 방지할 수 있다
- Next.js App Router의 server/client boundary가 명확해진다
- `createContext is not a function` 류의 서버 번들 오류를 줄일 수 있다
- import 경로가 다소 길어져도 import 의도가 더 명확해진다
- Vercel build/production build 안정성이 높아진다

---

### Negative

- feature root import 편의성이 줄어든다
- 일부 import 경로가 한 단계 길어진다
- 기존 방식보다 팀 규칙 관리가 더 필요하다

---

## Decision Summary

`index.ts`는 많이 export하기 위한 파일이 아니라,
의도된 public API를 제한적으로 공개하는 경계 파일이다.

- feature root `index.ts`는 pure/server-safe 모듈만 export한다
- client-only 모듈은 `client.ts` 또는 직접 import로 접근한다

이 정책을 통해 Next.js App Router 환경의 server/client boundary를 명확하게 유지한다.
