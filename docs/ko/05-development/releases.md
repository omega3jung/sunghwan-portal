# 프로덕션 릴리스

## 목적

이 문서는 포털 사용자와 검토자가 이용하는 프로덕션 브랜치인 `main`에 병합된
변경 사항을 기록한다.

Pull Request가 `main`에 적용된 후에만 이 문서에 릴리스로 기록한다. 각 항목은
Pull Request의 구현 세부 사항, 배포 체크리스트 또는 스크린샷을 그대로 복사하지
않고 프로덕션에 반영된 결과를 독립적으로 요약한다. 추적할 수 있도록 병합된 PR
제목은 유지하지만, 이 문서는 별도의 PR 설명 파일에 의존하지 않는다.

---

## 릴리스 이력

### 2026-08-07 — 프런트엔드 현대화와 명확한 클라이언트 경계

refactor(frontend): complete Base UI migration and strengthen frontend boundaries

- 공유 UI primitive를 Radix 기반 shadcn 컴포넌트에서 현재의 Base UI 기반
  foundation으로 마이그레이션했다.
- 새로운 컴포넌트 contract에 맞춰 인증, 내비게이션, 환경 설정, Service Desk,
  설정, 티켓, Insights 및 데모 인터페이스를 업데이트했다.
- 로그인 경험, 반응형 포털 레이아웃, 설정 editor, 계층형 selector, sortable tree,
  첨부파일 화면 및 공유 데모를 개선했다.
- App Router 페이지의 책임을 단순화하고 route composition, 데이터 orchestration,
  view-model, presentation 및 서버 contract의 경계를 명확히 했다.
- UI primitive 경계에서는 presentation state를 유지하면서 `canEdit`, `canSubmit`,
  `canNavigate`와 같은 긍정형 capability API를 표준화했다.
- 프로덕션 구현, workflow reference 및 architecture guidance가 동일한 현재 시스템을
  설명하도록 localization과 문서 구조를 재구성했다.

### 2026-07-24 — Tenant 범위 workflow와 Next.js 16 플랫폼 기준선

feat(service-desk): enforce tenant-scoped workflows and migrate platform to Next.js 16

- Service Desk 설정, 티켓, Insights, 조직 reference, action, merge 및 escalation
  workflow 전반에 tenant, company 및 운영 scope 경계를 적용했다.
- Internal-to-portal escalation과 tenant 기반 Insight filtering을 포함해 `INTERNAL`과
  `PORTAL` scope를 인식하는 검색 및 내비게이션을 추가했다.
- 설정, approver 및 assignee 선택, employee reference, impersonation 및 티켓 작업에
  대한 서버 측 authorization을 강화했다.
- 다국어 tenant 기반 데모 scenario를 확장하고 LOCAL과 REMOTE 동작이 동일한 domain
  및 API contract를 따르도록 정렬했다.
- Async Request API, proxy convention, Flat Config 및 Turbopack build를 포함해
  프로덕션 기준선을 Next.js 16, React 19, Node.js 24, npm 11 및 ESLint 9로
  업그레이드했다.
- 설치, type checking, lint와 architecture boundary, 프로덕션 build, 인증, 설정 및
  핵심 티켓 조회 경로를 검증했다.

### 2026-07-14 — Ticket Action workflow와 audit control 완성

feat(service-desk): complete ticket action workflow and strengthen history and permission controls

- Assignment, self-assignment, adjustment, rejection, merge, reopen, resubmission,
  cancellation, approval 및 decline action의 LOCAL과 REMOTE 실행 경로를 완성했다.
- 두 runtime mode에서 action permission, status transition, assignment routing,
  query invalidation 및 immutable history 생성을 정렬했다.
- History event와 source를 명시적인 audit field로 승격하고, 화면 표시 및 action별
  맥락은 metadata에 유지했다.
- 현재 worker와 이전 worker 모두 작업 시간을 기록할 수 있게 하되, status 변경
  권한은 현재 worker에게만 부여했다.
- 만료된 resolved ticket을 위한 idempotent하고 cron-ready한 자동 종료 경로를
  포함해 일관된 Work Session 정리 및 lifecycle 처리를 추가했다.
- Effective user가 프로덕션 동작을 제어하도록 impersonation 기반 내비게이션,
  profile, settings guard 및 permission projection을 수정했다.

### 2026-07-08 — REMOTE 티켓 workflow와 action-history 통합

feat(service-desk): connect remote ticket workflow and refine action history model

- REMOTE 티켓 목록, 상세, draft, 생성, requester update, approval, history, action 및
  Work Session 데이터 흐름을 연결했다.
- 서버에서 제어하는 requester, actor 및 ownership 검사와 category 기반 approval 및
  assignment routing을 추가했다.
- 생성 및 업데이트 dialog를 분리하고 계층형 category 선택, routing 재계산 feedback
  및 draft-safe form validation을 도입했다.
- Raw browser file, blob URL, base64 content 또는 클라이언트가 제어하는 binary data를
  저장하지 않고 metadata만 보존하는 attachment preparation을 추가했다.
- 티켓 상세가 Tickets context에 유지되도록 하면서 기존 navigation bar를 포털 메뉴
  기반 breadcrumb navigation으로 교체했다.
- 서버 실행 경로가 완성될 때까지 지원하지 않는 REMOTE action을 비활성화했다.

### 2026-06-28 — 데모에서 최근 티켓 표시 복구

chore(service-desk): refresh ticket mock dates for demo visibility

- 대표 티켓이 기본 최근 3개월 filter에 표시되도록 티켓 scenario 날짜를 앞으로
  이동했다.
- 티켓 identity, 관계, workflow scenario, filtering 동작, DTO contract 및 REMOTE
  persistence 가정은 그대로 유지했다.

### 2026-06-20 — Impersonation 복구와 runtime indicator 명확화

fix(auth, ui): restore impersonation flow and clarify runtime state indicators

- Credential 조회와 impersonation 대상 조회를 분리해 로그인 계정 username과 employee
  username이 다른 경우에도 impersonation이 동작하도록 복구했다.
- Password hash와 인증 username은 로그인 흐름 내부에서만 사용하도록 유지했다.
- Protected layout에 데모, impersonation 및 데모와 impersonation이 결합된 상태를
  나타내는 다국어 visual indicator를 추가했다.

### 2026-06-18 — Service Desk 한국어 scenario 텍스트 복구

fix(service-desk): restore Korean mock scenario text

- Service Desk 데모 scenario에 표시되던 손상된 한국어 문자열을 복구했다.
- 기존 scenario 구조, workflow 의미, route, UI 및 persistence 동작은 유지했다.

### 2026-06-17 — Vercel 프로덕션의 Documents Hub rendering 수정

fix(documents): include markdown docs in Vercel server bundle

- Documents route에서 사용하는 Vercel server bundle에 저장소의 Markdown 문서와 root
  README를 포함했다.
- 서버 측 Markdown loading, 문서 identifier, 경로 및 페이지 구조는 유지하면서
  프로덕션 `ENOENT` 오류를 수정했다.

### 2026-06-16 — Service Desk 문서와 Hub navigation 정렬

docs(service-desk): publish documentation alignment and docs hub navigation

- Service Desk 문서를 tenant 범위 설정, DTO/API boundary, LOCAL/REMOTE runtime 책임 및
  현재 티켓 시스템 명세에 맞게 정렬했다.
- 더 빠르게 검토할 수 있도록 다국어 Documents Hub navigation을 추가하고 decision
  record를 연월별로 그룹화했다.
- 영문과 한국어 명세 entry point를 갱신하고 REMOTE 데모에서 이용할 수 있는 페이지를
  명확히 했다.

### 2026-06-14 — Service Desk 설정 데이터 통합

feat(service-desk): publish settings data integration

- 데이터베이스 기반 Tenant, Category, Approval Step 및 Assignment Rule read model을
  연결하고 각 설정 workflow를 완성했다.
- Tenant를 Service Desk 설정 경계로 도입하고 tenant 설정, company data, 조직
  reference 및 tenant reactivation을 추가했다.
- 저장, React Query refetch, 페이지 새로고침 및 데모 reset 전반에서 LOCAL 설정
  persistence를 안정화했다.
- LOCAL과 REMOTE handler, response shape, CRUD 동작, identity naming 및 Work Session
  용어를 정렬했다.
- 설정 workspace를 표준화하고 tenant 설정에 재사용할 수 있는 color picker를
  추가했다.

### 2026-05-31 — 데이터베이스 기반 REMOTE 데모 foundation

feat(database): publish DB-backed remote demo and Service Desk polish

- LOCAL 데모를 유지하면서 Supabase 기반 인증 지원, user profile, preference,
  navigation 및 impersonation을 추가했다.
- 명시적인 LOCAL과 REMOTE runtime boundary를 정립하고 아직 연결되지 않은 REMOTE
  페이지에 임시 route guard를 도입했다.
- 데이터베이스 기반 메뉴와 다국어 사용자 identity data를 추가했다.
- LOCAL 티켓 approval 및 assignment routing, 설정 persistence, merge safeguard, 날짜
  rendering, chart label 및 mutation feedback을 개선했다.
- Navigation feedback을 개선하기 위해 protected route loading overlay를 추가했다.

### 2026-05-12 — 프로덕션 트래픽 분석

chore(vercel): add Vercel Web Analytics

- 애플리케이션 전체의 페이지 및 방문자 측정을 위해 root layout에 Vercel Web
  Analytics를 활성화했다.
- 인증, domain 동작, application route, localization 또는 사용자에게 보이는
  workflow를 변경하지 않고 프로덕션 traffic visibility를 추가했다.

### 2026-05-10 — Service Desk Insights와 반응형 티켓 workflow

feat(service-desk): publish insights view and responsive ticket flow

- 날짜 범위와 chart 기반 티켓 filtering을 지원하는 status, category, department,
  assignee 및 SLA 요약용 Service Desk Insights를 추가했다.
- Full, compact 및 hidden chart mode와 Portal, Internal 및 Insights view 선택을
  추가했다.
- 밀도 높은 desktop workflow를 유지하면서 티켓 목록, 티켓 상세 및 티켓 생성
  dialog에 전용 mobile layout을 도입했다.
- Form step 사이를 이동할 때 티켓 본문이 지워질 수 있던 rich editor remount 동작을
  수정했다.
- 영문, 한국어, 프랑스어 및 스페인어에 Insight, chart, filter, SLA 및 empty-state
  label을 추가했다.

### 2026-05-04 — 포털과 LOCAL Service Desk 프로덕션 milestone

#### Service Desk 데모, protected home 및 Documents Hub

feat(portal): deliver service desk demo, home, and docs foundation

- 티켓 생성부터 상세, action, immutable history, 작업 추적 및 데모 reset까지의 LOCAL
  Service Desk workflow를 제공했다.
- 티켓 검색, filtering, sorting, pagination, role 기반 control 및 생성부터 종료와
  reopen까지의 lifecycle scenario를 추가했다.
- Protected portal home dashboard를 추가하고 login, session, redirect, language
  preference 및 App Router boundary를 개선했다.
- 다국어 문서 선택, 영문 fallback, navigation 및 저장소 문서 entry point를 제공하는
  server-rendered Documents Hub를 공개했다.

#### Vercel 프로덕션 build 수정

fix(vercel): resolve Vercel build error from font casing

- 대소문자를 구분하는 Vercel Linux 프로덕션 환경에 맞게 Pretendard font import의
  대소문자를 수정했다.
- 애플리케이션 동작을 변경하지 않고 프로덕션 build 오류를 해결했다.

#### 라이브 애플리케이션 링크

feat(vercel): add Vercel app link

- 사용자와 검토자가 프로덕션 데모에 직접 접근할 수 있도록 프로젝트 overview에
  배포된 Vercel 애플리케이션 링크를 추가했다.

### 2026-02-28 — Service Desk 설정 foundation

feat(service-desk): deliver IT service desk settings foundation

- 데모용 mock API와 데이터를 갖춘 Category, Approval Step 및 Assignment Rule 설정
  인터페이스를 추가했다.
- Impersonation을 지원하는 protected internal 및 tenant 설정 route를 정립했다.
- 이후 티켓 workflow 개발을 위해 model, view-model, API, feature, domain 및 shared
  boundary를 개선했다.
- Layout과 feature module 전반에서 localization initialization, language state 및
  hydration을 안정화했다.

### 2025-12-30 — 포털 프로덕션 foundation

feat(portal): establish authentication, layout, and permission-driven portal foundation

- NextAuth credential authentication, JWT session, protected routing, centralized
  provider 및 초기 impersonation model을 정립했다.
- Permission 기반 navigation과 impersonation 중 실시간 메뉴 변경을 지원하는 role 및
  access-level authorization을 추가했다.
- Protected 및 public layout foundation, 기본 home experience, navigation, redirect 및
  user preference를 공개했다.
- Theme 및 language update, login과 home localization, branding asset,
  unsupported-browser routing 및 프로젝트 기본 표준을 추가했다.
