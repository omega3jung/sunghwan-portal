# sunghwan-portal

정성환의 포트폴리오 프로젝트입니다.

## 언어

- [English](./README.md)
- [한국어](./README.ko.md)

## 개요

`sunghwan-portal`은 Next.js 16 App Router, React 19, TypeScript로 구축한
**production-aligned Service Desk** 프로토타입입니다.

내부 IT Help Desk 환경에서 경험한 workflow를 명시적인 Service Desk
도메인으로 재설계했습니다. Ticket을 일반적인 CRUD record가 아니라 접수,
승인, 배정, 작업, 해결, 종료와 추적 가능한 history를 거치는 운영 entity로
다룹니다.

```txt
Service Desk is not a CRUD board.
It is a workflow-driven operational system.
```

동일한 feature contract와 Next.js Route Handler boundary를 통해 독립적으로
실행할 수 있는 `LOCAL` 포트폴리오 환경과 PostgreSQL 기반 `REMOTE` 서비스를
지원합니다. 이 프로젝트는 production-aligned 관점으로 설계했지만 의도적으로
production-complete 범위까지 구현하지는 않았습니다.

## 라이브 데모

[sunghwan-portal.vercel.app](https://sunghwan-portal.vercel.app/)

가장 빠르게 살펴보려면 로그인 화면에서 **Try Demo**를 선택하세요. LOCAL
환경에서는 database credential 없이 구현된 ticket 및 settings workflow를
확인할 수 있습니다. REMOTE service boundary와 workflow도 구현되어 있지만,
호스팅된 REMOTE 계정에서는 Service Desk page 직접 접근을 의도적으로
제한합니다.

## 빠른 리뷰

다음 순서로 약 5분 안에 핵심 내용을 살펴볼 수 있습니다.

1. 라이브 데모를 열고 **Try Demo**를 선택합니다.
2. **Service Desk**에서 ticket을 열어 상세 정보, 허용된 action, 작업 근거와
   **Ticket History**를 확인합니다.
3. 사용자 메뉴에서 **Impersonation**을 선택하고 demo role에 따라 control이
   어떻게 달라지는지 비교합니다.
4. **Settings → IT Service Desk Settings**에서 Tenant, Category, Approval
   Steps와 Assignment Rules를 확인합니다.
5. 설계와 workflow의 자세한 내용은 [Ticket System 표준 명세](./docs/spec/ticket-system.ko.md),
   [Ticket 운영 규칙](./docs/ko/03-domain/service-desk/ticket/reference/ticket-operation-rules.md),
   [문서 인덱스](./docs/ko/README.md)에서 확인합니다.

## 이 프로젝트가 보여주는 역량

- 복잡한 운영 workflow를 유지보수 가능한 frontend system으로 구조화
- legacy Help Desk 개념을 명시적인 Service Desk 도메인으로 재설계
- CRUD를 넘어 command, routing, immutable history와 work evidence를 모델링
- UI, server state, form state, client state와 server-only access의 책임 분리
- requester, assignee, approver, administrator의 role과 관계를 반영한 UX 설계
- PostgreSQL row, repository, mapper, DTO, service와 HTTP boundary를 명시적으로
  유지
- 실제 운영 경험을 바탕으로 failure handling, 추적성과 변경 영향 고려
- 현재 설계 문서와 과거의 decision log를 분리하여 관리

## 주요 특징

- ticket 접수, 승인, 배정, 작업, 해결과 종료까지 이어지는 end-to-end workflow
- server-controlled command와 event-based immutable history
- category 기반 priority, risk, due date, approval과 assignment behavior
- 공통 contract 뒤의 LOCAL demo adapter와 PostgreSQL 기반 REMOTE service
- LOCAL 및 REMOTE impersonation을 포함한 role/permission-aware control
- requester별 draft 복구와 attachment preparation boundary
- tracked-minute aggregation을 포함한 work-session evidence
- responsive dashboard, insights, ticket과 settings 화면

## 현재 상태

LOCAL 포트폴리오 환경은 외부 infrastructure 없이 실행하고 살펴볼 수 있습니다.
Ticket workflow, tenant-scoped settings, role-aware command, history와 work
session을 위한 변경 가능한 demo data를 제공합니다.

REMOTE 경로는 주요 ticket 및 settings workflow를 대상으로 server-only
PostgreSQL repository, DTO mapping, service, transaction과 선택적 external API
adapter를 구현합니다. 호스팅된 review 경로 밖에서 실행하려면 해당 database
schema와 credential 또는 호환되는 external service가 필요합니다.

이 시스템은 production-complete가 아니라 production-aligned 범위입니다.
의도적으로 미룬 production concern은
[프로젝트 제한 사항](#프로젝트-제한-사항)에 정리했습니다.

## 도메인과 Workflow

Tenant는 Service Desk의 configuration boundary이며, Category는 중심 behavior
configuration입니다.

```txt
Company
└─ Service Desk Tenant
   └─ Category
      ├─ Approval Step
      └─ Assignment Rule

Ticket
├─ Action
├─ History
├─ Work Session
└─ Attachment metadata
```

Approval step은 선택한 subcategory의 parent/main category를 기준으로 결정합니다.
Assignment rule은 선택한 subcategory를 먼저 확인하고, subcategory rule이
없을 때 parent/main category로 fallback합니다.

현재 persisted ticket status union은 다음과 같습니다.

```txt
Draft
Approval
Declined
Assigned
Working
Pending
Rejected
Resolved
Closed
```

주요 흐름은 다음과 같습니다.

```txt
Draft
  -> Approval | Assigned
  -> Working
  <-> Pending
  -> Resolved
  -> Closed
```

`Open`, `Approved`, `Reopen`은 persisted status가 아닙니다. Approval 완료는
`APPROVAL_APPROVED` history event이며, reopen은 현재
`Resolved -> Working`으로 전환하는 action입니다. Read request는 workflow
state를 변경하지 않습니다.

### Draft와 Attachment Boundary

REMOTE draft는 `status = Draft`인 일반 ticket row입니다. Requester별로 하나의
active draft를 유지하며, final submit은 해당 row를 재사용한 뒤 approval과 work
routing을 결정합니다. Operational list에서는 draft를 제외합니다.

LOCAL draft는 현재 demo user를 기준으로 browser `localStorage`를 사용합니다.
동일한 UX를 제공하지만 REMOTE draft와의 persistence equivalence를
주장하는 것은 아닙니다.

Attachment input은 metadata를 쓰기 전에 prepare route를 통과합니다.

```txt
File[] / inline image
  -> Attachment Prepare API
  -> prepared body, files, and images
  -> Draft / Create / Update / Action
  -> metadata persistence
```

현재 prepare route는 두 data scope 모두에서 controlled demo-file
replacement를 사용합니다. Raw file, binary data, data URL, blob URL과 local
path는 ticket 또는 history metadata에 저장하지 않습니다.

### Action, History와 Work-Session Boundary

Ticket action은 server-controlled command pipeline을 따릅니다.

```txt
authenticate
  -> authorize
  -> validate status and input
  -> insert action when applicable
  -> mutate the ticket
  -> append immutable history
```

현재 action union은 다음과 같습니다.

```txt
APPROVE | DECLINE | COMMENT | NOTE | ASSIGN | ASSIGN_SELF
REJECT | MERGE | ADJUST | REOPEN | RESUBMIT | CANCEL
```

명시적인 start-work route는 이 union과 분리되어 있습니다.

```txt
POST /api/service-desk/tickets/[ticketId]/command/start-work
```

History는 영향을 받은 domain area(`type`), 원인(`source`), authoritative
event, actor, 구조화된 before/after value와 보조 metadata를 기록합니다. Work
session은 ticket action과 분리합니다. 현재 route surface는 list/create behavior와
지원되는 work-status transition을 제공하며, 완전한 timer 방식의
start/finish/switch route는 deferred scope입니다.

## 아키텍처와 상태 소유권

Codebase는 domain rule, feature workflow, application contract, Route Handler
adapter와 server data access를 분리합니다.

```txt
Browser UI
  -> feature API/repository
  -> same-origin Next.js Route Handler
     ├─ LOCAL session -> local demo adapter/state
     └─ REMOTE session
        -> embedded portal/auth service -> PostgreSQL
        or
        -> external auth/portal API adapter
```

REMOTE portal과 authentication request는 기본적으로 embedded service를
사용합니다. Deployment configuration을 통해 각 boundary를 호환되는 external
API adapter로 교체할 수 있습니다.

Embedded data path는 다음과 같습니다.

```txt
PostgreSQL row
  -> repository
  -> mapper
  -> DTO
  -> service
  -> Route Handler
  -> feature API
  -> UI
```

PostgreSQL access와 credential은 server-only로 유지합니다. Client component는
application contract를 사용하며 database row를 전달받지 않습니다.

상태 소유권도 동일한 boundary 원칙을 따릅니다.

- React Query는 ticket, action, history, work session, settings와 organization
  server state를 소유합니다.
- React Hook Form은 form input과 validation state를 소유합니다.
- Zustand는 session, impersonation, preference와 sidebar state처럼 component
  사이에서 공유하는 client state를 소유합니다.
- Component state는 dialog와 form step 같은 일시적인 interaction detail을
  소유합니다.

Ticket, history, settings와 organization query result를 Zustand에 중복 저장하지
않습니다.

## 프로젝트 발전 과정과 마이그레이션

기존 프로젝트가 표현하던 운영 behavior를 유지하면서 repository를 단계적으로
현대화했습니다.

### Framework와 Tooling

- dependency baseline을 Next.js 14 → 15 → 16 순서로 upgrade
- React 18 → 19, Node.js baseline을 Node 20 범위 → 24로 전환한 뒤 npm 11로
  정렬
- 최신 App Router가 요구하는 asynchronous `params`, `searchParams`와 request
  API에 맞게 page와 Route Handler를 수정
- JWT route protection과 impersonation behavior를 유지하면서
  `middleware.ts`를 Next.js 16 `proxy.ts` convention으로 전환
- legacy lint configuration과 `next lint`를 ESLint 9 flat config로 교체
- `eslint-plugin-boundaries`를 repository lint command에 통합하여 dependency
  direction 검사 유지

### UI 기반

- shadcn/ui primitive를 Radix UI에서 Base UI와 현재 `base-nova`
  configuration으로 migration
- styling 기반을 Tailwind CSS 3에서 Tailwind CSS 4로 전환
- 변경된 component API에 맞게 shared primitive와 application 전용 combobox,
  date-picker, toast, menu, dialog, form consumer를 수정
- 기존 layout과 interaction behavior를 유지하기 위해 login, dashboard,
  ticket, mobile과 settings 화면을 대상으로 세부 조정

성능 개선 수치는 주장하지 않습니다. Migration 작업은 compatibility, 기존
behavior 유지와 최신 dependency baseline 정렬에 초점을 맞췄습니다.

## 기술 스택

| 영역                  | 현재 스택                                                                                 |
| --------------------- | ----------------------------------------------------------------------------------------- |
| Runtime               | Node.js 24, npm 11                                                                        |
| Framework             | Next.js 16 App Router, React 19                                                           |
| Language              | TypeScript 5                                                                              |
| Styling과 UI          | Tailwind CSS 4, Base UI 기반 shadcn 4로 생성한 shadcn/ui component, Lucide                |
| Authentication        | NextAuth 4 Credentials Provider, JWT session                                              |
| Backend와 data        | Next.js Route Handler, `pg`를 통한 PostgreSQL, embedded service 또는 external API adapter |
| Server state와 HTTP   | TanStack React Query 5, Axios, server native `fetch`                                      |
| Form과 validation     | React Hook Form 7, Zod 4, `@hookform/resolvers`                                           |
| Client state          | Zustand 5                                                                                 |
| Internationalization  | i18next, react-i18next                                                                    |
| Data UI               | TanStack Table 8, Recharts 3, Tiptap 3                                                    |
| Interaction           | dnd-kit, Embla Carousel, React Query Builder                                              |
| Component development | Next.js/Vite framework 기반 Storybook 10                                                  |
| Quality tooling       | ESLint 9, Vitest 4 browser mode, Playwright Chromium provider, Testing Library            |
| Deployment            | Vercel Analytics, Next.js standalone output                                               |

Version은 `package.json`에 명시된 major version을 기준으로 합니다. 현재 application
data path는 `pg`를 사용하며, 설치된 Supabase JavaScript client는 active data
path에 포함되지 않습니다.

## 프로젝트 구조

```txt
src/
  app/          # App Router page, layout, provider와 Route Handler
  auth/         # Credentials auth, session callback과 auth adapter
  components/   # shared UI primitive와 composed widget
  domain/       # framework-independent domain model과 rule
  feature/      # feature UI, hook, repository, mapper와 API client
  lib/          # application contract, configuration과 infrastructure
  mocks/        # LOCAL user, organization data와 Service Desk scenario
  server/       # embedded service, repository, mapper와 DTO
  shared/       # 재사용 가능한 hook, type, constant와 utility
  stories/      # Storybook example
  styles/       # global Tailwind CSS와 theme token
  types/        # global 및 library type augmentation
docs/
  en/           # 영어 overview, architecture, domain, engineering, release 및 decision 문서
  ko/           # 영어 문서 구조와 정렬된 한국어 번역
  spec/         # 영어 및 한국어 Ticket System 표준 명세
```

## 문서

문서는 부가물이 아니라 프로젝트의 주요 산출물입니다. 현재 설계 문서는 실제
구현 상태를 설명하고, decision log는 과거 선택의 맥락과 trade-off를
보존합니다.

추천 진입점:

1. [Ticket System 표준 명세](./docs/spec/ticket-system.ko.md)
2. [Service Desk 문서 인덱스](./docs/ko/README.md)
3. [Ticket System Overview](./docs/ko/03-domain/service-desk/ticket/ticket-system-overview.md)
4. [Service Desk Settings](./docs/ko/03-domain/service-desk/settings.md)
5. [Ticket Lifecycle](./docs/ko/03-domain/service-desk/ticket/ticket-lifecycle.md)
6. [Ticket Model](./docs/ko/03-domain/service-desk/ticket/ticket-model.md)
7. [Ticket Action](./docs/ko/03-domain/service-desk/ticket/ticket-action.md)
8. [Ticket History](./docs/ko/03-domain/service-desk/ticket/ticket-history.md)
9. [Ticket Work Session](./docs/ko/03-domain/service-desk/ticket/ticket-work-session.md)
10. [Ticket Form](./docs/ko/04-client-engineering/forms/ticket-form.md)과
   [Attachment 설계](./docs/ko/04-client-engineering/forms/ticket-attachment.md)
11. [구현 전략](./docs/ko/05-development/service-desk-implementation-strategy.md)
12. [Boolean 명명 규칙](./docs/ko/05-development/boolean-naming-convention.md)
13. [README 전략](./docs/ko/05-development/readme-strategy.md)
14. [Ticket 운영 규칙](./docs/ko/03-domain/service-desk/ticket/reference/ticket-operation-rules.md)

과거 decision record는
[Decision 문서](./docs/ko/06-decisions/README.md)에 정리되어 있습니다.

## 품질과 검증

현재 repository 수준의 검증 범위는 다음과 같습니다.

- `npm run build`를 통한 Next.js production build와 TypeScript compilation
- `npm run lint`를 통한 ESLint 9 static analysis
- lint command에 포함된 `eslint-plugin-boundaries`의 architecture dependency
  policy 검사
- `npm run build-storybook`을 통한 Storybook static build 검증
- Playwright Chromium provider를 사용하는 Storybook/Vitest browser-mode
  configuration

현재 Storybook surface는 세 개의 story file과 configuration MDX를 포함합니다.
Testing Library는 설치되어 있지만 repository에는 독립적인 `*.test` 또는
`*.spec` suite가 없으며 repository-level `test` script도 제공하지 않습니다.
Automated coverage는 앞으로 개선할 영역입니다.

## 로컬 개발

### 요구 사항

- Node.js `24.x`
- npm `11.x`

이 version 범위는 `package.json`의 `engines` field로 제한합니다.

### LOCAL Demo 실행

```bash
npm ci
cp .env.example .env.local
npm run dev
```

PowerShell에서는 필요에 따라 `cp` 대신
`Copy-Item .env.example .env.local`을 사용하세요. `.env.local`의
`NEXTAUTH_SECRET`에 비어 있지 않은 development value를 설정한 뒤
[http://localhost:3000](http://localhost:3000)을 열고 **Try Demo**를
선택합니다. LOCAL 환경에는 PostgreSQL이나 external API가 필요하지 않습니다.

### 사용 가능한 Script

| Command                   | 용도                                       |
| ------------------------- | ------------------------------------------ |
| `npm run dev`             | Next.js development server 실행            |
| `npm run dev:clean`       | `.next`를 제거하고 development server 실행 |
| `npm run build`           | production build 생성                      |
| `npm run start`           | 미리 build한 production server 실행        |
| `npm run lint`            | ESLint와 architecture boundary rule 실행   |
| `npm run storybook`       | 6006 port에서 Storybook 실행               |
| `npm run build-storybook` | Storybook static build 생성                |

## 환경 변수

Repository에 포함된 [`.env.example`](./.env.example)은 공통 local
configuration을 제공합니다. Secret과 database connection은 server-only로
유지해야 합니다.

### 공통 Application Configuration

| 변수                         | 용도                                                                         |
| ---------------------------- | ---------------------------------------------------------------------------- |
| `NEXT_PUBLIC_CONTEXT`        | `development` 같은 presentation/runtime label이며 data scope를 선택하지 않음 |
| `NEXT_PUBLIC_BASE_PATH`      | 선택적 Next.js base path                                                     |
| `NEXT_PUBLIC_ASSET_LOGO`     | public logo asset path                                                       |
| `NEXTAUTH_URL`               | NextAuth canonical URL, local 환경에서는 `http://localhost:3000`             |
| `NEXTAUTH_SECRET`            | NextAuth token signing과 encryption에 사용하는 secret                        |
| `NEXT_PUBLIC_DB_API_URL`     | 선택적 client database API base URL                                          |
| `NEXT_PUBLIC_PORTAL_API_URL` | 선택적 client portal/file API base URL                                       |
| `NEXT_PUBLIC_NODE_API_URL`   | 선택적 별도 Node API base URL                                                |

LOCAL과 REMOTE behavior는 `NEXT_PUBLIC_CONTEXT`가 아니라 authenticated
session의 `dataScope`로 결정합니다.

### REMOTE Deployment Boundary

- Embedded REMOTE service는 server-only authentication 및 portal database
  connection을 사용합니다.
- External REMOTE adapter는 embedded dispatch 대신 server-only authentication
  및 portal service base URL을 사용합니다.
- 이러한 deployment credential은 repository의 local example에 의도적으로
  포함하지 않습니다.

## 프로젝트 제한 사항

현재 포트폴리오 범위에서는 다음 production 확장 영역을 의도적으로 제외합니다.

- object storage, malware scanning과 signed download URL
- 실제 notification delivery
- 완전한 SLA calendar, pause/resume clock, breach와 escalation engine
- real-time update
- 완전한 work-session update/delete 및 timer route surface
- compliance-grade audit infrastructure
- 고급 assignment load balancing

이 boundary는 구현된 workflow behavior와 production-complete service에 추가로
필요한 infrastructure 및 control을 구분합니다.

## 작성자

**정성환**
Frontend Developer (React / Next.js)

- [GitHub](https://github.com/omega3jung)
- [Repository](https://github.com/omega3jung/sunghwan-portal)
- [LinkedIn](https://www.linkedin.com/in/sunghwan4jung/)
