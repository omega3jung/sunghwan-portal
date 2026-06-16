# sunghwan-portal

정성환의 포트폴리오 프로젝트입니다.

## 언어

- [English](./README.md)
- [한국어](./README.ko.md)

## 개요

`sunghwan-portal`은 **Next.js 14 App Router**로 구축한 **Service Desk 시스템 프로토타입**입니다.

이 프로젝트는 단순한 UI 쇼케이스가 아니라, 실제 운영 환경을 고려한 production-aligned 프론트엔드 포트폴리오 프로젝트로 설계되었습니다.
현실적인 Service Desk workflow, 도메인 구조, 역할 인식형 UX, 인증/세션 경계, 문서화된 설계 의사결정에 초점을 둡니다.

핵심 아이디어는 다음과 같습니다.

```txt
Service Desk is not a CRUD board.
It is a workflow-driven operational system.
```

이 프로젝트는 티켓을 request intake, approval, assignment, work, resolution, history, audit 흐름을 거치는 workflow entity로 모델링합니다.

## 라이브 데모

**Live Demo**: [sunghwan-portal.vercel.app](https://sunghwan-portal.vercel.app/)

이 프로젝트는 다음 요소를 중심으로 Service Desk 도메인을 구성합니다.

- category-driven ticket workflow
- approval 및 assignment logic
- SLA-aware behavior
- audit/history tracking
- role-aware dashboard 및 settings UX
- authentication 및 impersonation strategy

또한 이 프로젝트는 문서 비중이 높은 포트폴리오 프로젝트입니다.
설계 의도, trade-off, 구현 접근 방식은 [`docs/ko`](./docs/ko/README.md)에 정리되어 있습니다.

## 프로젝트 목적

이 프로젝트는 화면 구현 이상의 역량을 보여주기 위해 만들었습니다.

중점적으로 보여주고자 하는 역량은 다음과 같습니다.

- 실제 비즈니스 workflow 이해
- legacy-style IT Help Desk 아이디어를 더 명확한 Service Desk 도메인으로 재설계
- 유지보수 가능한 feature/domain boundary 중심의 프론트엔드 프로젝트 구조화
- UI, server state, client state, authentication, server-only data access 분리
- 아키텍처 판단과 trade-off를 명확하게 문서화

이 프로젝트는 내부 Service Hub / IT Help Desk 환경에서 얻은 실제 운영 경험을 바탕으로 하며, 이를 포트폴리오에 적합한 Service Desk prototype으로 재설계했습니다.

## 현재 초점

이 프로젝트는 초기 authentication/template 성격의 애플리케이션에서 구체적인 Service Desk 시스템으로 발전했습니다.

현재 초점은 다음과 같습니다.

- workflow-driven ticket lifecycle
- tenant-scoped Service Desk configuration
- category-driven approval, assignment, SLA, priority, risk behavior
- action-oriented activity model
- immutable ticket history 및 auditability
- session-based work tracking 방향
- role-aware 및 permission-aware UI
- LOCAL demo behavior와 REMOTE/Supabase integration path
- Service Desk settings를 위한 DTO/API boundary
- 프로젝트 산출물로서의 documentation 및 decision log

## 핵심 Service Desk 모델

현재 Service Desk 모델은 다음 개념을 중심으로 구성됩니다.

```txt
Tenant
  -> Category
  -> Approval
  -> Assignment
  -> SLA

Ticket
  -> Activity / Action
  -> Track Time
  -> History
```

### Tenant와 Category

현재 configuration model은 다음과 같습니다.

```txt
Company = organization/reference entity
Tenant = Service Desk configuration boundary
Category = tenant-scoped behavior configuration
```

Category는 단순 label이 아닙니다.
다음과 같은 핵심 ticket behavior를 결정합니다.

- approval requirements
- assignment rules
- default priority
- default risk level
- SLA defaults
- request template behavior

Category hierarchy는 다음과 같습니다.

```txt
Tenant -> Main Category -> Sub Category
```

### Ticket Workflow

티켓은 단순 database record가 아니라 workflow entity로 취급됩니다.

lifecycle은 다음과 같은 정상/비정상 흐름을 포함합니다.

```txt
Draft -> Open -> Approved -> Working -> Resolved -> Closed

Open -> Declined -> Open
Working <-> Pending
Working / Pending -> Rejected
Resolved -> Reopen -> Working
```

상태 변경은 숨겨진 field update가 아니라 명시적인 action과 rule에 의해 발생해야 합니다.

### Activity와 History

프로젝트는 사용자에게 보이는 activity와 immutable history를 분리합니다.

```txt
Activity = meaningful user/operational interaction
History = immutable audit/event record
```

activity/action type 예시는 다음과 같습니다.

- comment
- note
- assign
- adjust
- merge
- reject
- request review
- reopen
- resubmit

이 구조는 timeline을 더 이해하기 쉽게 만들고, 운영 변경을 추적 가능하게 유지합니다.

## 주요 기능

### Service Desk

- 티켓 목록, 검색, 필터, 정렬, 페이지네이션
- primary workflow로서의 ticket detail page
- 구조화된 form flow를 가진 ticket creation dialog
- status, priority, assignee, SLA, history 표시
- action-oriented ticket interaction
- merge/reject/reopen/review 중심 workflow 방향
- 모바일을 지원하는 핵심 Service Desk view

### Service Desk Settings

- Tenant settings
- Category configuration
- Approval step configuration
- Assignment rule configuration
- Company / department / job field reference data integration 방향
- API/DTO contract를 통한 LOCAL 및 REMOTE behavior 정렬

### Dashboard와 Insights

- 빠른 운영 개요를 위한 Dashboard
- 분석/리포팅 view로서의 Insights
- Service Desk 상태를 요약하는 chart 기반 view
- status/category/assignee/requester-department/SLA 중심 가시성

### Authentication과 Session

- NextAuth v4 Credentials Provider
- JWT session strategy
- middleware-assisted route protection
- session-safe user projection
- session model과 분리된 application user model
- session-aware impersonation design
- role-aware UI behavior

## 기술 스택

- Framework: `next@14` App Router
- Language: `typescript`, `react@18`
- UI: `tailwindcss`, `shadcn/ui`, `radix-ui`, `lucide-react`
- Authentication: `next-auth@4`, Credentials Provider, JWT session strategy
- Database / Backend Direction: `supabase` PostgreSQL
- Data Fetching: `@tanstack/react-query`, `axios`
- Form: `react-hook-form`, `zod`
- Client State: `zustand`
- Table / Chart / Editor: `@tanstack/react-table`, `recharts`, `tiptap`
- Testing / Tooling: `vitest`, `jest`, `@testing-library/*`, `playwright`, `storybook`
- Deployment: `vercel`

## 아키텍처 개요

프로젝트는 layered, feature-based 구조를 사용합니다.

```txt
src/
  app/         # Next.js routes, layouts, route handlers
  auth/        # NextAuth integration and auth/session logic
  components/  # shared/custom UI components
  domain/      # Service Desk domain models and rules
  feature/     # feature-level screens, workflows, hooks, API clients
  lib/         # app-wide configuration and infrastructure helpers
  server/      # server-only logic, DTOs, local demo state, data access
  shared/      # reusable utilities and shared UI
  types/       # cross-cutting TypeScript types
```

일반적인 runtime flow는 다음과 같습니다.

```txt
UI
-> feature API client
-> Next.js Route Handler
-> LOCAL handler or REMOTE/Supabase DTO service
```

UI는 요청이 local demo state로 처리되는지 remote persistence로 처리되는지 알 필요가 없어야 합니다.

## 런타임 전략

프로젝트는 LOCAL과 REMOTE behavior를 구분합니다.

```txt
LOCAL  = mock-backed, safe portfolio demo behavior
REMOTE = Supabase PostgreSQL / API-backed behavior
```

### LOCAL

LOCAL mode는 포트폴리오 리뷰를 위해 설계되었습니다.

다음을 제공합니다.

- 안전한 demo interaction
- mock-backed data
- server-side mutable local state
- reset 가능한 demo behavior
- production infrastructure 없이도 현실적인 API flow

### REMOTE

REMOTE mode는 Supabase/PostgreSQL 기반 경로입니다.

다음을 중심으로 설계됩니다.

- server-only database access
- separated database roles
- Row / Mapper / DTO boundary
- route handler orchestration
- future backend extraction readiness

프로젝트는 Supabase를 단순 client-side BaaS shortcut이 아니라 PostgreSQL persistence로 취급합니다.

## Data 및 API Boundary

database/API 방향은 다음 구조를 따릅니다.

```txt
Database Row -> Mapper -> DTO
```

Service Desk settings data는 DTO/API boundary를 사용하여 UI가 database schema detail에 의존하지 않도록 합니다.

Settings domain에는 다음이 포함됩니다.

- Tenant
- Category
- Approval Step
- Assignment Rule

Route handler는 orchestration boundary로 취급됩니다.
request/session/runtime context를 해석한 뒤 domain logic을 server-side handler 또는 service로 위임해야 합니다.

실제 workflow를 지원하지 않는 speculative CRUD route는 피합니다.

## 상태 관리

Server state는 React Query로 관리합니다.

예시는 다음과 같습니다.

- ticket list
- ticket detail
- tenant/category/settings data
- reference data
- history/activity data
- mutable LOCAL demo server state responses

Client state는 제한적으로 유지합니다.

예시는 다음과 같습니다.

- dialog open state
- temporary UI state
- runtime facade state
- local interaction state

프로젝트는 server data를 Zustand에 중복 저장하는 것을 피합니다.

## 문서

문서는 이 프로젝트의 주요 산출물 중 하나입니다.

문서는 무엇을 만들었는지뿐 아니라 왜 그렇게 설계했는지도 설명합니다.

추천 진입점은 다음과 같습니다.

1. [Ticket System Specification](./docs/spec/ticket-system.ko.md)
2. [Service Desk System Documentation](./docs/ko/README.md)
3. [Feature-Based Structure](./docs/ko/02-architecture/feature-based-structure.md)
4. [Database Strategy](./docs/ko/02-architecture/database-strategy.md)
5. [Auth & Session Strategy](./docs/ko/02-architecture/auth-session-strategy.md)
6. [Ticket System Overview](./docs/ko/03-domain/ticket/ticket-system-overview.md)
7. [Ticket Lifecycle](./docs/ko/03-domain/ticket/ticket-lifecycle.md)
8. [Ticket Activity Model](./docs/ko/03-domain/ticket/ticket-activity.md)
9. [Ticket History](./docs/ko/03-domain/ticket/ticket-history.md)
10. [Service Desk Implementation Strategy](./docs/ko/08-dev-strategy/service-desk-implementation-strategy.md)
11. [Ticket Operation Rules](./docs/ko/08-dev-strategy/ticket-operation-rules.md)

## 주요 Decision Log

decision log는 개발 중 내려진 중요한 아키텍처 및 도메인 의사결정을 기록합니다.

최근 중요한 log는 다음과 같습니다.

- [Service Desk Documentation Alignment](./docs/ko/08-dev-strategy/decision-log/2026-05-service-desk-documentation-alignment.md)
- [Database Role and Access Strategy](./docs/ko/08-dev-strategy/decision-log/2026-05-database-role-and-access-strategy.md)
- [Barrel Export Boundary Policy](./docs/ko/08-dev-strategy/decision-log/2026-05-barrel-export-boundary.md)
- [Service Desk Tenant Design](./docs/ko/08-dev-strategy/decision-log/2026-06-service-desk-tenant-design.md)
- [Service Desk Settings DTO/API Boundary](./docs/ko/08-dev-strategy/decision-log/2026-06-service-desk-settings-dto-api-boundary.md)

이 문서들은 실제 구현 압력 속에서 시스템이 어떻게 진화했는지 설명합니다.

## 로컬 개발

의존성 설치:

```bash
npm install
```

개발 서버 실행:

```bash
npm run dev
```

기본 로컬 URL:

```txt
http://localhost:3000
```

유용한 scripts:

```bash
npm run dev
npm run dev:clean
npm run build
npm run start
npm run lint
npm run storybook
npm run build-storybook
```

## 환경

프로젝트는 authentication, runtime context, API/database behavior를 위해 환경 변수를 사용합니다.

일반적으로 사용하는 환경 값은 다음과 같습니다.

- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `NEXT_PUBLIC_BASE_PATH`
- `NEXT_PUBLIC_CONTEXT`
- server-side access를 위한 database/API connection variables

secret과 database credential은 server-only로 유지해야 합니다.

## 프로젝트 상태

이 프로젝트는 포트폴리오/데모 프로젝트이지만, 실제 애플리케이션처럼 구조화하는 것을 목표로 합니다.

현재 구현에는 동작하는 LOCAL demo와 단계적으로 정렬 중인 REMOTE/Supabase integration이 포함됩니다.

일부 production-grade 영역은 의도적으로 deferred되어 있습니다.

- 모든 Service Desk workflow에 대한 full remote persistence
- production-grade file upload/storage/security
- real notification delivery
- real-time WebSocket updates
- full enterprise rule engine
- complete SLA calendar/holiday engine
- full compliance-grade audit infrastructure

이 항목들은 무시된 문제가 아니라 future expansion point로 다룹니다.

## 이 프로젝트가 보여주는 것

이 프로젝트는 다음 역량을 보여주기 위해 구성되었습니다.

- Next.js App Router 기반의 실용적인 frontend architecture
- workflow-oriented domain modeling
- TypeScript 기반 API 및 model boundary
- role-aware 및 permission-aware UI design
- server/client boundary awareness
- React Query server-state strategy
- 현실적인 API flow처럼 동작하는 local demo architecture
- authentication/session/impersonation design judgment
- database access 및 DTO boundary thinking
- documentation 및 decision-log discipline

## 작성자

**정성환**  
Frontend Developer (React / Next.js)

- GitHub: https://github.com/omega3jung
- Repository: https://github.com/omega3jung/sunghwan-portal
- LinkedIn: https://www.linkedin.com/in/sunghwan4jung/
