# sunghwan-portal

정성환의 포트폴리오 프로젝트입니다.

## 언어

- [English](./README.md)
- [한국어](./README.ko.md)

## 개요

`sunghwan-portal`은 내부 IT 지원 요청을 접수하고 승인·배정·작업·종료까지
관리하는 **Service Desk 프로토타입**입니다. Next.js 16 App Router, React 19,
TypeScript를 사용하며, 실제 운영 환경의 구조와 규칙을 고려해 설계했습니다.

내부 IT Help Desk에서 경험한 업무 흐름을 Service Desk의 도메인 모델과 규칙으로
재설계했습니다. 티켓은 단순한 CRUD 데이터가 아니라 접수, 승인, 배정, 작업,
해결, 종료를 거치는 업무 단위입니다. 각 단계의 변경은 이력으로 추적합니다.

```txt
Service Desk is not a CRUD board.
It is a workflow-driven operational system.
```

독립적으로 실행할 수 있는 `LOCAL` 데모와 PostgreSQL 기반 `REMOTE` 서비스를
지원합니다. 두 환경은 같은 API 요청·응답 형식을 사용하며, Next.js Route Handler가
각 환경의 처리를 연결합니다. 운영 환경을 고려한 설계이지만 실제 운영에 필요한
모든 기능을 구현한 것은 아닙니다.

## 라이브 데모

[sunghwan-portal.vercel.app](https://sunghwan-portal.vercel.app/)

로그인 화면에서 **Try Demo**를 선택하면 빠르게 살펴볼 수 있습니다. LOCAL
환경에서는 데이터베이스 접속 정보 없이 티켓 처리와 설정 변경을 확인할 수 있습니다.
REMOTE에서도 이를 처리하는 서비스와 API 연동을 구현했습니다.

## 빠른 리뷰

다음 순서로 약 5분 안에 핵심 내용을 살펴볼 수 있습니다.

1. 라이브 데모를 열고 **Try Demo**를 선택합니다.
2. **Service Desk**에서 티켓을 열어 상세 정보, 허용된 액션, 작업 기록과
   **Ticket History**를 확인합니다.
3. 사용자 메뉴에서 **Impersonation**을 선택하고 데모 사용자의 역할에 따라
   사용할 수 있는 기능이 어떻게 달라지는지 비교합니다.
4. **Settings → IT Service Desk Settings**에서 Tenant, Category, Approval
   Steps와 Assignment Rules를 확인합니다.
5. 애플리케이션 메뉴에서 **Storybook**을 열고 재사용 컴포넌트, 애플리케이션의
   대표 UI, Controls와 상호작용을 확인합니다.
6. 설계와 업무 흐름의 자세한 내용은 [Ticket System 표준 명세](./docs/spec/ticket-system.ko.md),
   [Ticket 운영 규칙](./docs/ko/03-domain/service-desk/ticket/reference/ticket-operation-rules.md),
   [문서 인덱스](./docs/ko/README.md)에서 확인합니다.

## 이 프로젝트가 보여주는 역량

- 복잡한 업무 흐름을 유지보수 가능한 프런트엔드 시스템으로 구조화
- 기존 Help Desk 개념을 Service Desk의 도메인 모델과 규칙으로 재설계
- CRUD를 넘어 명령 처리, 승인자·작업자 결정, 변경할 수 없는 이력과 작업 기록을 모델링
- UI, 서버 데이터, 폼 상태, 공유 클라이언트 상태와 서버 전용 데이터 접근의 역할 분리
- 요청자, 작업 담당자, 승인자, 관리자의 역할과 관계를 반영한 UX 설계
- PostgreSQL 행 조회(repository), 응답 데이터(DTO, 데이터 전달 객체)로의
  변환(mapper), 서비스 처리와 HTTP 요청 처리의 역할 분리
- 실제 운영 경험을 바탕으로 실패 처리, 추적성과 변경 영향 고려
- 실패 영향과 회귀 위험에 따른 Vitest 검증과 선별한 Storybook UI 검토의 역할 구분
- 현재 설계 문서와 과거 결정 기록을 분리하여 관리

## 주요 특징

- 티켓 접수, 승인, 배정, 작업, 해결과 종료까지 이어지는 업무 흐름
- 서버에서 처리하는 명령과 이벤트별로 기록하고 변경하지 않는 이력
- 카테고리에 따른 우선순위, 위험도, 처리 기한, 승인자와 작업자 결정
- 같은 API 형식과 기능별 처리 규칙을 사용하는 LOCAL 데모 어댑터와 PostgreSQL 기반
  REMOTE 서비스
- LOCAL·REMOTE의 impersonation과 역할·권한에 따른 기능 제어
- 요청자별 초안 복구와 별도의 API를 통한 첨부파일 준비
- 작업 기록과 분 단위 시간 집계를 제공하는 Work Session
- 반응형 Dashboard, 티켓을 집계하는 Insights, 티켓과 설정 화면
- 애플리케이션 `/storybook` 경로에서 확인할 수 있는 선별한 Storybook 사례

## 현재 상태

포트폴리오 범위의 기능 개발은 완료되었습니다. 이 저장소는 구현된 시스템과 설계를
포트폴리오 결과물로 제공합니다. 아래의 운영 환경용 확장 항목은 예정된 기능 로드맵이
아닌 범위상의 제한 사항입니다.

LOCAL 환경은 외부 인프라 없이 실행할 수 있습니다. 데모 데이터를 직접 변경하면서
티켓 처리, Tenant별 설정, 역할에 따른 명령 실행, 이력과 Work Session을 확인할 수
있습니다.

REMOTE에서는 주요 티켓 처리와 설정 변경을 위해 서버 전용 PostgreSQL repository,
DTO 변환, 서비스, 트랜잭션과 선택적 외부 API 어댑터를 구현했습니다. 호스팅된
데모 외부에서 실행하려면 해당 데이터베이스 스키마와 접속 정보 또는 호환되는
외부 서비스가 필요합니다.

데이터베이스 구성 자료는 저장소에서 추적하는 파일에 포함하지 않습니다.
따라서 외부 환경을 준비하지 않고 실행하려면 LOCAL 구성을 사용합니다.

REMOTE에서는 Supabase Cron이 매시간 정각에 데이터베이스의 해결된 티켓 자동 종료
함수를 직접 호출합니다. 데이터베이스 함수와 예약 호출은
검증되었으며, 근거는
[스케줄링 결정](./docs/ko/06-decisions/2026-09-resolved-auto-close-scheduling.md)에 기록합니다.

이 시스템은 운영 환경의 구조와 규칙을 고려한 포트폴리오 구현입니다.
실제 운영을 위해 추가로 필요한 기능은
[프로젝트 제한 사항](#프로젝트-제한-사항)에 정리했습니다.

## 도메인과 Workflow

Tenant는 Service Desk 설정을 구분하는 단위입니다. 각 Tenant의 Category에서
우선순위, 위험도, 처리 기한, 승인과 작업자 배정에 필요한 규칙을 설정합니다.

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

승인 단계는 선택한 하위 카테고리의 상위(메인) 카테고리 설정으로 결정합니다.
작업자 배정은 하위 카테고리의 규칙을 먼저 확인하며, 해당 규칙이 없을 때만
상위(메인) 카테고리의 규칙을 사용합니다.

현재 저장되는 티켓 상태의 유니온 타입은 다음과 같습니다.

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

`Open`, `Approved`, `Reopen`은 저장되는 상태값이 아닙니다. 승인 완료는
`APPROVAL_APPROVED` 이력 이벤트로 기록합니다. 다시 열기는 현재
`Resolved -> Working`으로 전환하는 액션입니다. 티켓과 하위 리소스를 조회해도
업무 상태는 바뀌지 않습니다.

### Draft와 Attachment Boundary

REMOTE 초안은 데이터베이스에서 `status = Draft`인 일반 티켓 행으로 저장합니다.
요청자별로 하나의 활성 초안을 유지하며, 최종 제출할 때 같은 행을 재사용한 뒤
승인자와 작업자를 결정합니다. 운영용 티켓 목록에서는 초안을 제외합니다.

LOCAL 초안은 현재 데모 사용자별로 브라우저의 `localStorage`에 저장합니다.
두 환경은 같은 사용 흐름을 제공하지만 저장 방식은 다릅니다.

첨부파일은 메타데이터(파일 정보)를 저장하기 전에 준비 API를 거칩니다.

```txt
File[] / inline image
  -> Attachment Prepare API
  -> prepared body, files, and images
  -> Draft / Create / Update / Action
  -> metadata persistence
```

현재 준비 API는 LOCAL과 REMOTE 모두에서 선택한 파일과 본문 이미지를 지정된
데모 파일로 대체합니다. 실제 파일 저장소에 업로드하는 기능은 제공하지 않습니다.
원본 파일, 바이너리 데이터, data URL, blob URL과 로컬 경로는 티켓이나 이력의
메타데이터에 저장하지 않습니다.

### Action, History와 Work-Session Boundary

티켓 액션은 서버에서 다음 순서로 처리합니다.

```txt
authenticate
  -> authorize
  -> validate status and input
  -> insert action when applicable
  -> mutate the ticket
  -> append immutable history
```

현재 액션의 유니온 타입은 다음과 같습니다.

```txt
APPROVE | DECLINE | COMMENT | NOTE | ASSIGN | ASSIGN_SELF
REJECT | MERGE | ADJUST | REOPEN | RESUBMIT | CANCEL
```

작업 시작을 요청하는 별도의 경로는 이 유니온 타입에 포함하지 않습니다.

```txt
POST /api/service-desk/tickets/[ticketId]/command/start-work
```

이력에는 변경된 도메인 영역(`type`), 원인(`source`), 발생한 일을 판단하는 기준
이벤트, 처리 주체, 구조화된 변경 전후 값과 보조 메타데이터를 기록합니다.

Work Session은 티켓 액션과 별도로 작업 내용을 기록합니다. 현재 작업 담당자와
과거 작업 담당자는 작업 기록을 남길 수 있지만, Work Session 제출로 상태를
변경할 수 있는 주체는 현재 작업 담당자뿐입니다. 현재 API는 목록 조회, 기록 생성과
지원되는 작업 상태 전환을 제공합니다. 타이머 방식의 시작·완료·전환 API 전체는
현재 구현 범위에서 제외합니다.

## 아키텍처와 상태 소유권

코드는 도메인 규칙, 기능별 업무 흐름, 애플리케이션의 요청·응답 형식,
Route Handler 어댑터와 서버 데이터 접근의 역할을 나눕니다.

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

REMOTE의 포털·인증 요청은 기본적으로 애플리케이션 내부 서비스를 사용합니다.
배포 설정에 따라 포털과 인증을 각각 호환되는 외부 API 어댑터로 교체할 수 있습니다.

애플리케이션 내부 서비스의 데이터 처리 흐름은 다음과 같습니다.

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

Repository는 PostgreSQL을 조회하고, mapper는 데이터베이스 행을 API 응답용 DTO로
변환합니다. 서비스는 업무 규칙을 적용하며, Route Handler는 HTTP 요청을 받아
실제 처리를 서비스에 맡깁니다. PostgreSQL 접근과 접속 정보는 서버에서만 처리합니다.
클라이언트 컴포넌트에는 데이터베이스 행을 직접 전달하지 않고, 정해진 응답 형식의
데이터를 제공합니다.

상태도 용도에 따라 담당 도구를 구분합니다.

- React Query는 티켓, 액션, 이력, Work Session, 설정과 조직의 서버 데이터를
  관리합니다.
- React Hook Form은 폼 입력과 검증 상태를 관리합니다.
- Zustand는 세션, impersonation, 사용자 설정, 사이드바 상태처럼 컴포넌트
  사이에서 공유하는 클라이언트 상태를 관리합니다.
- 컴포넌트 상태는 대화상자와 폼 단계 같은 일시적인 UI 상태를 관리합니다.
- 페이지 수준 훅은 현재 탭 안에서 Service Desk 티켓 검색과 Insights의 조건,
  조회 범위, 정렬, 페이지네이션을 복원하기 위해 `sessionStorage`를 사용합니다.

티켓, 이력, 설정과 조직의 조회 결과를 Zustand에 중복 저장하지 않습니다.
현재 Service Desk 검색 페이지는 검색 상태를 URL 쿼리 매개변수와
동기화하지 않습니다.

## 프로젝트 발전 과정과 마이그레이션

기존 업무 동작을 유지하면서 프레임워크, 도구와 UI 기반을 단계적으로 개선했습니다.

### Framework와 Tooling

- Next.js 14 → 15 → 16 순서로 의존성 업그레이드
- React 18 → 19, Node.js 20 범위 → 24로 전환한 뒤 npm 11로 변경
- 최신 App Router가 요구하는 비동기 `params`, `searchParams`와 요청 API에 맞게
  페이지와 Route Handler 수정
- JWT 경로 접근 보호와 impersonation 동작을 유지하면서 `middleware.ts`를
  Next.js 16의 `proxy.ts` 규칙으로 전환
- 기존 lint 설정과 `next lint`를 ESLint 9 flat config로 교체
- `eslint-plugin-boundaries`를 저장소 lint 명령에 포함해 의존성 방향 검사 유지

### UI 기반

- shadcn/ui 기본 컴포넌트를 Radix UI에서 Base UI와 현재 `base-nova` 설정으로 이전
- 스타일 기반을 Tailwind CSS 3에서 Tailwind CSS 4로 전환
- 변경된 컴포넌트 API에 맞게 공통 기본 컴포넌트와 애플리케이션 전용 콤보박스,
  날짜 선택, 토스트, 메뉴, 대화상자, 폼 사용 코드 수정
- 기존 레이아웃과 상호작용을 유지하기 위해 로그인, Dashboard, 티켓, 모바일과
  설정 화면 세부 조정

이 작업은 호환성과 기존 동작을 유지하면서 최신 의존성을 적용하는 데 초점을
맞췄습니다. 성능 개선 수치는 제시하지 않습니다.

## 기술 스택

| 영역                  | 현재 스택                                                                                 |
| --------------------- | ----------------------------------------------------------------------------------------- |
| 실행 환경             | Node.js 24, npm 11                                                                        |
| 프레임워크            | Next.js 16 App Router, React 19                                                           |
| 언어                  | TypeScript 5                                                                              |
| 스타일과 UI           | Tailwind CSS 4, Base UI 기반 shadcn 4로 생성한 shadcn/ui 컴포넌트, Lucide                |
| 인증                  | NextAuth 4 Credentials Provider, JWT 세션                                                |
| 백엔드와 데이터       | Next.js Route Handler, `pg`를 통한 PostgreSQL, 내부 서비스 또는 외부 API 어댑터         |
| 서버 상태와 HTTP      | TanStack React Query 5, Axios, 서버의 기본 `fetch`                                       |
| 폼과 검증             | React Hook Form 7, Zod 4, `@hookform/resolvers`                                           |
| 클라이언트 상태       | Zustand 5                                                                                 |
| 다국어 처리           | i18next, react-i18next                                                                    |
| 데이터 UI             | TanStack Table 8, Recharts 3, Tiptap 3                                                    |
| 상호작용              | dnd-kit, Embla Carousel, React Query Builder                                              |
| 컴포넌트 개발         | Next.js/Vite 프레임워크 기반 Storybook 10                                                 |
| 품질 검사 도구        | ESLint 9, Vitest 4 브라우저 모드, Playwright Chromium provider, Testing Library           |
| 배포                  | Vercel Analytics, Next.js standalone output                                               |

버전은 `package.json`에 명시된 주 버전을 기준으로 합니다. 현재 애플리케이션의 데이터
처리는 `pg`를 사용합니다. 설치된 Supabase JavaScript client는 이 처리에 사용하지
않습니다.

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
  stories/      # 제한된 Storybook state, Control, interaction과 composition
  styles/       # global Tailwind CSS와 theme token
  types/        # global 및 library type augmentation
docs/
  en/           # 영어 overview, architecture, domain, engineering, release 및 decision 문서
  ko/           # 영어 문서 구조와 정렬된 한국어 번역
  spec/         # 영어 및 한국어 Ticket System 표준 명세
```

## 문서

문서는 프로젝트의 주요 산출물입니다. 현재 설계 문서는 실제 구현된 구조와 동작을
설명하고, 결정 기록은 과거 선택의 맥락과 장단점을 보존합니다.

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
12. [테스트 전략](./docs/ko/05-development/testing-strategy.md)
13. [Boolean 명명 규칙](./docs/ko/05-development/boolean-naming-convention.md)
14. [README 전략](./docs/ko/05-development/readme-strategy.md)
15. [Ticket 운영 규칙](./docs/ko/03-domain/service-desk/ticket/reference/ticket-operation-rules.md)

과거 결정 기록은
[Decision 문서](./docs/ko/06-decisions/README.md)에 정리되어 있습니다.

## 품질과 검증

현재 저장소에서 제공하는 검증 범위는 다음과 같습니다.

- `npm test`가 실행하는 단위 테스트 프로젝트의 include 패턴에 해당하는,
  소스와 함께 배치한 Vitest test/spec 파일 178개(정적 파일 집계)
- `npm run lint`를 통한 ESLint 9 정적 분석
- lint 명령에 포함된 `eslint-plugin-boundaries`의 아키텍처 의존성 규칙 검사
- 사용자 정의 컴포넌트와 선별한 레이아웃·메뉴·기능 UI를 포함하는 Storybook
  파일 23개와 Story 항목 100개(정적 집계)
- `npm run build-storybook`을 통한 Storybook 정적 빌드 검증
- 선별한 `play` 상호작용 파일 6개를 Playwright Chromium으로 브라우저 창 없이
  실행하는 별도의 Storybook/Vitest 브라우저 테스트 프로젝트
- Storybook 정적 결과물을 포함한 뒤 Next.js를 빌드하는 `npm run build`

기본 `npm test` 명령은 단위 테스트 프로젝트만 실행합니다. Storybook 브라우저
테스트는 필요할 때 명시적으로 실행하는 진단용 검사입니다. 모든 검사가 통과하는
상태가 아니며 CI 통과를 강제하는 필수 검사로도 사용하지 않습니다. 문서화된
상호작용 실패는 검증의 제한 사항으로 남아 있습니다. 검사별 역할과 범위는
[테스트 전략](./docs/ko/05-development/testing-strategy.md)을 참고하세요.

## 로컬 개발

### 요구 사항

- Node.js `24.x`
- npm `11.x`

지원하는 버전 범위는 `package.json`의 `engines` 필드에 선언합니다.

### LOCAL Demo 실행

```bash
npm ci
cp .env.example .env.local
```

PowerShell에서는 필요에 따라 `cp` 대신
`Copy-Item .env.example .env.local`을 사용하세요. `.env.local`의
`NEXTAUTH_SECRET`에 비어 있지 않은 개발용 값을 설정한 뒤 실행합니다.

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)을 열고 **Try Demo**를
선택합니다. LOCAL 환경에는 PostgreSQL이나 외부 API가 필요하지 않습니다.

Next.js와 Storybook을 함께 실행하고 애플리케이션 `/storybook` 경로를 사용하려면
`npm run dev:all`을 실행합니다. 이 명령은 브라우저를 자동으로 열지 않고
6006 포트에서 Storybook을 시작합니다.

### 사용 가능한 Script

| 명령어                        | 용도                                                           |
| ----------------------------- | -------------------------------------------------------------- |
| `npm run dev`                 | Next.js 개발 서버만 실행                                      |
| `npm run dev:all`             | 브라우저 자동 실행 없이 Next.js와 Storybook을 함께 실행        |
| `npm run dev:clean`           | `.next`를 제거하고 Next.js 개발 서버 실행                      |
| `npm test`                    | 기본 Vitest 단위 테스트 프로젝트 실행                         |
| `npm run test:watch`          | 변경 감지 모드로 Vitest 단위 테스트 프로젝트 실행              |
| `npm run lint`                | ESLint와 아키텍처 의존성 규칙 검사                             |
| `npm run storybook`           | 기본 브라우저 열기 동작을 허용하며 6006 포트에서 Storybook 실행 |
| `npm run storybook:no`        | 브라우저를 열지 않고 6006 포트에서 Storybook 실행               |
| `npm run build-storybook`     | 독립 실행용 Storybook 정적 빌드 생성                            |
| `npm run build-storybook:app` | Storybook을 빌드하여 애플리케이션의 공개 파일 경로로 복사        |
| `npm run build`               | Storybook을 포함하고 Next.js 운영 환경용 빌드 생성              |
| `npm run start`               | 미리 빌드한 운영 환경용 서버 실행                              |

## 환경 변수

저장소에 포함된 [`.env.example`](./.env.example)은 공통 로컬 설정을 제공합니다.
비밀 값과 데이터베이스 접속 정보는 서버에서만 사용해야 합니다.

### 공통 Application Configuration

| 변수                         | 용도                                                                         |
| ---------------------------- | ---------------------------------------------------------------------------- |
| `NEXT_PUBLIC_CONTEXT`        | `development` 같은 화면 표시·실행 환경 레이블이며 데이터 범위를 선택하지 않음 |
| `NEXT_PUBLIC_BASE_PATH`      | 선택적 Next.js 기본 경로                                                     |
| `NEXT_PUBLIC_ASSET_LOGO`     | 공개 로고 파일 경로                                                          |
| `NEXTAUTH_URL`               | NextAuth 기준 URL, 로컬 환경에서는 `http://localhost:3000`                    |
| `NEXTAUTH_SECRET`            | NextAuth 토큰 서명과 암호화에 사용하는 비밀 값                               |
| `NEXT_PUBLIC_DB_API_URL`     | 선택적 클라이언트 데이터베이스 API 기본 URL                                  |
| `NEXT_PUBLIC_PORTAL_API_URL` | 선택적 클라이언트 포털·파일 API 기본 URL                                     |
| `NEXT_PUBLIC_NODE_API_URL`   | 선택적 별도 Node API 기본 URL                                                |

LOCAL·REMOTE 동작은 `NEXT_PUBLIC_CONTEXT`가 아니라 인증된 세션의 `dataScope`로
결정합니다.

### REMOTE Deployment Boundary

- 내부 REMOTE 서비스는 서버 전용 인증·포털 데이터베이스 연결을 사용합니다.
- 외부 REMOTE 어댑터는 내부 서비스 호출 대신 서버 전용 인증·포털 서비스의
  기본 URL을 사용합니다.
- 이러한 배포용 접속 정보는 저장소의 로컬 설정 예제에 의도적으로 포함하지 않습니다.

## 프로젝트 제한 사항

포트폴리오에는 다음 구현상의 제한이 있으며, 아래 운영 기능은 범위에서 제외합니다.

- 객체 저장소, 악성 파일 검사와 서명된 다운로드 URL
- 실제 알림 전송
- 완전한 SLA 업무 달력, 시간 측정 일시 중지·재개, 기한 위반과 상위 담당자 전달 엔진
- 실시간 갱신
- 완전한 Work Session 수정·삭제와 타이머 API
- 규정 준수를 위한 감사 인프라
- 고급 작업자 배정 부하 분산
- Dashboard 요약 카드는 고정된 표시 값을 사용하며, Insights는 접근이 허용된
  티켓 검색 결과를 집계합니다.
- 수동 `ASSIGN`은 실행 주체, 상태, 비어 있지 않은 담당자 목록을 검증하지만
  카테고리의 담당자 결정 규칙에 따른 후보 자격은 다시 검증하지 않습니다.
  [Assignment Policy](./docs/ko/03-domain/service-desk/ticket/strategy/assignment-policy.md)를 참고하세요.
- 수신자 주소는 직원·회사 자격 검증 없이 저장하며, 알림 전송은 구현 범위 밖입니다.

이 목록은 구현된 업무 흐름과 실제 운영을 위해 추가로 필요한 인프라·제어 기능을
구분합니다.

## 작성자

**정성환**
Frontend Developer (React / Next.js)

- [GitHub](https://github.com/omega3jung)
- [Repository](https://github.com/omega3jung/sunghwan-portal)
- [LinkedIn](https://www.linkedin.com/in/sunghwan4jung/)
