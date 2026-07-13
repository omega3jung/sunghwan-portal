# sunghwan-portal

정성환의 포트폴리오 프로젝트입니다.

## 언어

- [English](./README.md)
- [한국어](./README.ko.md)

## 개요

`sunghwan-portal`은 **Next.js 14 App Router**로 구축한 **Service Desk 시스템 프로토타입**입니다.

이 프로젝트는 단순한 UI 쇼케이스가 아니라 production-aligned 프론트엔드 포트폴리오 프로젝트입니다. 현실적인 Service Desk workflow, domain boundary, role-aware UX, authentication/session boundary, server-state ownership, 구현과 정렬된 설계 문서화에 초점을 둡니다.

핵심 아이디어는 다음과 같습니다.

```txt
Service Desk is not a CRUD board.
It is a workflow-driven operational system.
```

Ticket은 draft, approval, work assignment, execution, resolution, immutable history, work-session evidence를 거치는 workflow entity로 모델링됩니다.

## 라이브 데모

**Live Demo**: [sunghwan-portal.vercel.app](https://sunghwan-portal.vercel.app/)

이 프로젝트는 다음 Service Desk 도메인 요소를 중심으로 구성됩니다.

- tenant-scoped Service Desk settings
- category-driven ticket intake, defaults, approval, assignment, SLA
- `status = Draft`인 ticket row로 저장되는 REMOTE draft
- controlled demo replacement를 사용하는 attachment preparation
- command-based ticket actions
- event-based immutable history
- work-session create/list와 tracked-minute aggregation
- role-aware dashboard, ticket, settings UX
- LOCAL demo behavior와 REMOTE PostgreSQL/DTO boundary

설계 의도, trade-off, 구현 접근 방식은 [`docs/ko`](./docs/ko/README.md)에 정리되어 있습니다.

## 프로젝트 목적

이 프로젝트는 화면 구현 이상의 역량을 보여주기 위해 만들었습니다.

중점적으로 보여주고자 하는 역량은 다음과 같습니다.

- 실제 운영 workflow 이해
- legacy-style IT Help Desk 아이디어를 더 명확한 Service Desk 도메인으로 재설계
- 유지보수 가능한 feature/domain boundary 중심의 프론트엔드 프로젝트 구조화
- UI, server state, client state, authentication, server-only data access 분리
- workflow command, history, work evidence를 명시적으로 모델링
- architecture 판단과 trade-off를 명확하게 문서화

이 프로젝트는 내부 Service Hub / IT Help Desk 환경에서 얻은 실제 운영 경험을 바탕으로 하며, 이를 포트폴리오에 적합한 Service Desk prototype으로 재설계했습니다.

## 현재 범위

현재 프로젝트가 다루는 범위는 다음과 같습니다.

- ticket list, search, detail, create, requester update, command execution
- 일반 ticket row로 저장되는 REMOTE draft persistence
- category, approval step, assignment rule을 위한 tenant-scoped settings
- category-driven priority, risk, due date, approval, work assignment
- draft/create/update/action command 전에 수행되는 attachment preparation
- action-oriented ticket commands
- event-based immutable ticket history
- work-session list/create와 tracked-minute aggregation
- LOCAL demo behavior와 REMOTE PostgreSQL/DTO service boundary
- 프로젝트 산출물로서의 documentation과 decision log

이 프로젝트는 production-aligned이지만 production-complete는 아닙니다. Production object storage, notification delivery, full SLA engine, real-time updates, complete timer routes, compliance-grade audit infrastructure는 명시적으로 구현되기 전까지 deferred scope입니다.

## 핵심 Service Desk 모델

```txt
Company
-> Service Desk Tenant
   -> Category
      -> Approval Step
      -> Assignment Rule

Ticket
-> Action
-> History
-> Work Session
-> Attachment metadata
```

Tenant는 configuration scope입니다. Category는 중심 behavior configuration입니다.

Approval과 assignment는 의도적으로 서로 다른 resolution rule을 사용합니다.

- Approval step은 선택된 subcategory의 parent/main category에서 resolve됩니다.
- Assignment rule은 선택된 subcategory를 먼저 확인하고, subcategory rule이 없을 때만 parent/main category로 fallback합니다.

## Ticket Workflow

현재 persisted status union은 다음과 같습니다.

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

중요 규칙:

- `Open`은 persisted status가 아닙니다.
- `Approved`는 persisted status가 아닙니다.
- `Reopen`은 persisted status가 아닙니다.
- Approval completion은 `APPROVAL_APPROVED` history로 기록됩니다.
- Reopen은 ticket action이며 현재 결과는 `Resolved -> Working`입니다.
- GET/read request는 ticket status를 변경하면 안 됩니다.

Main flow:

```txt
Draft
-> Approval | Assigned
-> Working
<-> Pending
-> Resolved
-> Closed
```

상태 변경은 hidden field update가 아니라 explicit command, workflow rule, system operation에 의해 발생해야 합니다.

## Draft와 Attachment Boundary

REMOTE draft는 browser-only state가 아니며 별도 draft table도 아닙니다.

```txt
ticket row
+ status = Draft
```

규칙:

- requester당 active draft는 하나입니다.
- draft save/update는 draft API를 사용합니다.
- final submit은 같은 row를 재사용합니다.
- submit은 initial approval/work routing을 수행합니다.
- operational ticket list는 draft를 제외합니다.
- LOCAL draft는 feature API boundary 뒤의 simplified demo-safe 구현이며 REMOTE
  PostgreSQL draft와 persistence-equivalent하지 않습니다.

Attachment input은 ticket command가 metadata를 쓰기 전에 prepare됩니다.

```txt
File[] / inline image
-> Attachment Prepare API
-> prepared body, files, images
-> Draft / Create / Update / Action command where applicable
-> metadata persistence
```

현재 구현은 controlled demo replacement를 사용합니다. Production object storage를 제공하지 않습니다. Raw `File`, binary data, base64 data URL, blob URL, local path는 ticket row, DTO, action metadata, history metadata에 persist하면 안 됩니다.

## Actions, History, Work Sessions

Ticket Action은 server-controlled command model입니다.

```txt
Action command
-> authenticate
-> authorize
-> validate current status
-> validate action input
-> insert action when applicable
-> mutate ticket when applicable
-> create history
```

현재 action union:

```txt
APPROVE
DECLINE
COMMENT
NOTE
ASSIGN
ASSIGN_SELF
REJECT
MERGE
ADJUST
REOPEN
RESUBMIT
CANCEL
```

명시적 start-work command는 Ticket Action union과 분리됩니다.

```txt
POST /api/service-desk/tickets/:ticketId/command/start-work
```

이 command는 `Assigned -> Working`으로 이동시키고 `STATUS_UPDATED` history를 만들며 Ticket Action row를 insert하지 않습니다.

History는 event-based immutable model입니다.

```txt
type   -> affected domain area
source -> why or which rule produced it
event  -> what happened
actor  -> who initiated it
from/to value -> structured JSON before/after
metadata -> supplemental display/audit context
```

`event`가 authoritative field입니다. `SYSTEM_AUTO`는 source이지 history type이 아닙니다.

Resolved auto-close는 구현된 system operation입니다.

```txt
Resolved history timestamp
+ 7-day grace period
-> Closed
-> closeReason = Completed
-> finish running work sessions where applicable
-> RESOLUTION_CLOSE history
-> source = SYSTEM_AUTO
-> actionNo = null
```

Work Session은 Ticket Action과 분리됩니다. 현재 route surface는 list/create, tracked-minute aggregation, 지원되는 work-status transition을 지원합니다. Timer-style start/finish/switch route는 현재 route surface에 포함되지 않습니다.

## 주요 기능

### Service Desk

- Ticket list, search, filter, sort, pagination
- primary workflow로서의 ticket detail page
- ticket creation 및 requester update flow
- draft API를 통한 REMOTE draft row recovery
- ticket command 전 attachment preparation
- status, priority, risk, assignee, due date, history, work evidence 표시
- action-oriented ticket interaction
- reopen, resubmit, reject, merge, cancel, adjust, assign, comment, note command
- 모바일을 지원하는 핵심 Service Desk view

### Service Desk Settings

- Tenant settings
- Main/subcategory configuration
- Main-category approval step configuration
- Subcategory assignment override와 parent/main fallback
- Company, department, job field, employee reference integration
- API/DTO contract를 통한 LOCAL 및 REMOTE behavior 정렬

### Dashboard and Insights

- 빠른 운영 개요를 위한 Dashboard
- 분석/리포팅 view로서의 Insights
- Service Desk 상태를 요약하는 chart 기반 view
- status/category/assignee/requester-department/SLA 중심 가시성

### Authentication and Session

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
- Database / Backend Direction: server-only access와 Supabase 관련 infrastructure를 통한 PostgreSQL
- Data Fetching: `@tanstack/react-query`, `axios`
- Form: `react-hook-form`, `zod`
- Client State: `zustand`
- Table / Chart / Editor: `@tanstack/react-table`, `recharts`, `tiptap`
- Testing / Tooling: `vitest`, `jest`, `@testing-library/*`, `playwright`, `storybook`
- Deployment: `vercel`

## 아키텍처 개요

프로젝트는 layered, feature-based structure를 사용합니다.

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

Runtime flow:

```txt
UI
-> feature API client
-> Next.js Route Handler
-> LOCAL handler or REMOTE portal API/service
-> DTO
```

REMOTE data flow:

```txt
DB Row
-> Mapper
-> DTO
-> Service
-> Route Handler
-> Feature API client
-> UI
```

UI code는 Supabase나 database row에 직접 접근하면 안 됩니다.

## Runtime Strategy

```txt
LOCAL  = API route 뒤의 safe portfolio demo behavior
REMOTE = DTO boundary 뒤의 PostgreSQL / portal API-service behavior
```

### LOCAL

LOCAL mode는 포트폴리오 리뷰를 위해 설계되었습니다.

다음을 제공합니다.

- 안전한 demo interaction
- mock/demo-backed data
- server-side mutable demo state
- reset 가능한 demo behavior
- production infrastructure 없이도 현실적인 API flow

### REMOTE

REMOTE mode는 PostgreSQL-backed path입니다.

다음을 중심으로 설계됩니다.

- server-only database access
- separated database roles
- row / mapper / DTO boundary
- route handler orchestration
- workflow mutation을 위한 transaction boundary
- future backend extraction readiness

프로젝트는 Supabase 관련 infrastructure를 client-side shortcut이 아니라 PostgreSQL persistence로 취급합니다.

## 상태 관리

Server state는 React Query가 소유합니다.

예:

- ticket list/search/detail
- active draft
- ticket actions and history
- work-session list
- tenant/category/approval-step/assignment-rule settings
- organization reference data

Client state는 제한적으로 유지합니다.

예:

- dialog open state
- current form step
- transient form input
- temporary UI interaction state

프로젝트는 server data를 Zustand에 중복 저장하는 것을 피합니다.

## 문서

문서는 이 프로젝트의 주요 산출물 중 하나입니다. 무엇을 만들었는지만이 아니라 왜 그렇게 설계했는지도 설명합니다.

추천 진입점:

1. [Ticket System Specification](./docs/spec/ticket-system.ko.md)
2. [Service Desk System Documentation](./docs/ko/README.md)
3. [Ticket System Overview](./docs/ko/03-domain/ticket/ticket-system-overview.md)
4. [Ticket Lifecycle](./docs/ko/03-domain/ticket/ticket-lifecycle.md)
5. [Ticket Model](./docs/ko/03-domain/ticket/ticket-model.md)
6. [Ticket Activity Model](./docs/ko/03-domain/ticket/ticket-activity.md)
7. [Ticket History](./docs/ko/03-domain/ticket/ticket-history.md)
8. [Ticket Track Time](./docs/ko/03-domain/ticket/ticket-track-time.md)
9. [Ticket Form Design](./docs/ko/06-form-design/ticket-form.md)
10. [Ticket Attachment Design](./docs/ko/06-form-design/ticket-attachment.md)
11. [Service Desk Settings](./docs/ko/03-domain/service-desk-settings.md)
12. [Service Desk Implementation Strategy](./docs/ko/08-dev-strategy/service-desk-implementation-strategy.md)
13. [Ticket Operation Rules](./docs/ko/08-dev-strategy/ticket-operation-rules.md)

## 주요 Decision Log

Decision log는 개발 중 내려진 중요한 architecture 및 domain decision을 기록합니다. 과거 선택의 이유를 보존하는 문서이며, 현재 설계 문서처럼 다시 쓰지 않습니다.

최근 중요한 log:

- [Service Desk Documentation Alignment](./docs/ko/08-dev-strategy/decision-log/2026-05-service-desk-documentation-alignment.md)
- [Database Role and Access Strategy](./docs/ko/08-dev-strategy/decision-log/2026-05-database-role-and-access-strategy.md)
- [Service Desk Tenant Design](./docs/ko/08-dev-strategy/decision-log/2026-06-service-desk-tenant-design.md)
- [Service Desk Settings DTO/API Boundary](./docs/ko/08-dev-strategy/decision-log/2026-06-service-desk-settings-dto-api-boundary.md)
- [Ticket Form and Draft Workflow](./docs/ko/08-dev-strategy/decision-log/2026-06-ticket-form-and-draft-workflow.md)
- [Ticket Attachment Boundary](./docs/ko/08-dev-strategy/decision-log/2026-06-ticket-attachment-boundary.md)
- [Ticket Routing and Update Policy](./docs/ko/08-dev-strategy/decision-log/2026-07-ticket-routing-and-update-policy.md)
- [Ticket Action and History Execution](./docs/ko/08-dev-strategy/decision-log/2026-07-ticket-action-and-history-execution.md)

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

일반적으로 사용하는 환경 값:

- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `NEXT_PUBLIC_BASE_PATH`
- `NEXT_PUBLIC_CONTEXT`
- server-side access를 위한 database/API connection variables

Secret과 database credential은 server-only로 유지해야 합니다.

## 프로젝트 상태

이 프로젝트는 포트폴리오/데모 프로젝트이지만 실제 애플리케이션처럼 구조화하는 것을 목표로 합니다.

현재 구현에는 동작하는 LOCAL demo와 단계적으로 정렬 중인 REMOTE PostgreSQL/DTO integration이 포함됩니다.

의도적으로 deferred된 production-grade 영역:

- production object storage, file scanning, signed download URL
- real notification delivery
- full SLA calendar, pause/resume clock, breach, escalation engine
- real-time updates
- complete work-session update/delete/timer route surface
- compliance-grade audit infrastructure
- advanced assignment load balancing

이 항목들은 무시된 문제가 아니라 future expansion point입니다.

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
