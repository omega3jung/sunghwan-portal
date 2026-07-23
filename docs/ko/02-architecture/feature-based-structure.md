# Feature-Based Structure

## Goal

이 프로젝트는 프로덕션 수준의 프론트엔드 시스템에서 **확장성, 유지보수성, 관심사의 분리**를 강화하기 위해 **feature-based architecture**를 채택합니다.

이 문서는 현재 소스 폴더 경계와 의존성 방향의 source of truth다. 과거
decision log는 당시의 판단 근거를 보존하며, 현재 규칙은 이 문서를 따른다.

주요 목표는 다음과 같습니다.

- 지속되는 비즈니스 규칙은 domain module에, workflow logic은 이를 소유한 capability에 두기
- 관련 없는 모듈 간 결합도 줄이기
- feature ownership과 cross-feature collaboration을 명시적으로 만들기
- 장기 유지보수성을 높이기

---

## Background

이전 시스템은 **Page Router 중심 구조**였으며, 다음과 같은 특성이 있었습니다.

- 대부분의 로직이 page 모듈 안에 함께 배치됨
- 컴포넌트, API 호출, 상태 로직이 강하게 결합됨
- 재사용성이 제한됨
- 코드 소유권이 불분명함

---

## Problems with Page-Centric Structure

### 1. Poor Separation of Concerns

- UI, 비즈니스 로직, 데이터 페칭이 한곳에 섞임

---

### 2. Low Reusability

- 컴포넌트가 특정 페이지에 종속됨
- 공통 로직을 분리하기 어려움

---

### 3. Difficult Scaling

- 기능이 커질수록 page 파일이 비대해짐

---

### 4. Weak Domain Representation

- 폴더 구조가 비즈니스 도메인을 잘 드러내지 못함

---

## Core Concept

시스템은 **도메인 모델**, **사용자 기능**, **런타임 구현**을 서로 다른 경계로
분리하고, feature를 사용자 워크플로 단위로 구성합니다.

```id="feature-concept"
domain = 비즈니스 개념과 순수 규칙
feature = 사용자가 수행하는 독립적인 기능 단위
```

각 feature는 다음을 함께 포함할 수 있습니다.

- UI components
- API logic
- state management
- feature contracts and workflow logic

도메인 모델과 순수 비즈니스 규칙은 feature가 소유하지 않는다. 이들은
`src/domain`에 위치하며 여러 feature와 server use case에서 공유된다.

---

## Directory Structure

```bash id="feature-structure"
src/
  app/          # Next.js 라우팅과 최종 조합
  components/   # 애플리케이션 전역 UI widget
  domain/       # 도메인 모델과 순수 비즈니스 규칙
  feature/      # 사용자 기능 워크플로와 UI
  lib/          # domain-aware 공통 정책과 런타임 통합
  server/       # 서버 use case, data access, 외부 API 구현
  shared/       # 애플리케이션 비종속 기반 코드
```

---

## Responsibilities

### 1. shared/ (Foundation Layer)

- 애플리케이션과 비즈니스 도메인을 모르는 최하위 계층
- 범용 타입, 값 처리, formatting, routing parameter, application-agnostic browser helper를 소유
- `domain`, `lib`, `feature`, `server`, `app`을 참조하지 않음

판단 기준:

```txt
이 코드를 쇼핑몰이나 은행 애플리케이션에서도 비슷한 형태로 사용할 수 있는가?
```

`Ticket`, `Company`, `ServiceDesk`처럼 프로젝트의 비즈니스 용어를 알아야 하는
코드는 shared에 두지 않는다.

---

### 2. domain/ (Domain Layer)

- 도메인 모델, value type, enum, 순수 비즈니스 규칙을 소유
- React, Next.js, HTTP, database, browser storage를 알지 않음
- `shared`만 참조할 수 있음

모델 상태만으로 결정되는 규칙은 `model.ts`에 섞기보다 `rules.ts` 또는
`policy.ts`로 분리할 수 있다. 이러한 분리는 domain 밖으로 이동한다는 의미가
아니다.

```txt
domain/serviceDesk/ticket/
  model.ts
  rules.ts
```

---

### 3. lib/ (Application / Integration Layer)

`lib`은 project infrastructure와 둘 이상의 caller가 공유하는 domain-aware code를
담지만 하나의 runtime 계층은 아니다.

```txt
lib/
  application/  # UI/runtime ownership 없는 domain-aware policy와 mapping
  client/       # browser helper, client state, toast, theme, client i18n
  config/       # public environment normalization과 공용 route configuration
```

- `lib/application`은 `domain`, `shared`를 사용할 수 있고 client/server 양쪽에서 사용 가능해야 한다.
- `lib/client`는 `lib/application`, `lib/config`, `domain`, `shared`를 사용하고 browser/client-state dependency를 가질 수 있다.
- `lib/config`는 양쪽 runtime에 안전한 configuration만 소유하며 상위 application, feature, UI, server 구현을 참조하지 않는다.
- `lib` root에는 이 명시적 경계만 두고 runtime이 섞인 root barrel을 만들지 않는다.
- Database, secret, filesystem, server use-case 구현은 `server`, `auth`, server-only `app` entry에 둔다. 현재 `lib/server` 경계는 없다.

`lib`은 dumping ground가 아니다. 위치와 import를 통해 application policy, client
integration, framework integration, runtime helper 중 어느 책임인지 드러내야 한다.

---

### 4. feature/ (Feature Layer)

- 사용자가 수행하는 기능과 워크플로를 소유
- feature UI, form, hook, API client, client state를 캡슐화
- client-safe `lib`, `domain`, `shared`, reusable component를 참조할 수 있음
- `server` 구현을 직접 참조하지 않음

Feature는 사용자 workflow를 조정하고 domain rule과 API contract를 소비하며
interactive server state에 React Query를 연결한다. 지속되는 domain rule의 source of
truth가 되어서는 안 된다.

현재 code에는 `feature/serviceDesk`의 인접 slice와 auth/session, user preference처럼
서로 협업하는 application workflow가 있다. 다른 slice의 internal component, hook,
context를 편의를 위해 참조하기보다 runtime-safe public entry 또는 책임이 명확한
contract module을 사용한다. 명확한 feature owner가 없는 조합은 `app` 또는
application-wide component가 담당한다.

---

### 5. server/ (Server Layer)

- repository, database data access, server use case, 외부 API adapter를 소유
- 독립 서버 저장소로 함께 이동할 수 있는 코드만 포함
- server-safe `lib`, `lib/application`, `domain`, `shared`를 참조할 수 있음
- `app`, `feature`, `components`, `mocks`, client API를 참조하지 않음

LOCAL demo 구현은 `app/api/_adapters/localDemo`, fixture는 `mocks`가 소유한다.
웹 adapter와 서버가 함께 사용하는 DTO, schema, 순수 mapper는
`lib/application/contracts`가 소유하여 서로의 구현을 직접 참조하지 않는다.

공유 개념은 실제 소유권에 따라 둔다. 지속되는 비즈니스 개념은 `domain`, API
경계가 소유한 HTTP/DTO contract는 해당 경계, 범용 reusable type은 `shared`에 둔다.
Import path를 줄이기 위해 새 application 계층을 만들지 않는다.

---

### 6. components/ (Application Widget Layer)

- `components/ui`는 현재 reusable UI primitive를 소유
- `components/custom`, `components/layout`, `components/menu`는 project-wide composed widget을 소유
- application widget은 feature contract와 하위 계층을 사용할 수 있음
- domain-aware workflow UI는 owning feature에, route-specific UI는 route 옆에 둠

---

### 7. app/ (Routing / Composition Layer)

- 라우트 정의(App Router)
- page와 layout에서 feature 및 widget을 최종 조합
- route handler에서 HTTP parsing, authentication, runtime 분기를 오케스트레이션
- 지속되는 비즈니스 규칙, data access, client state를 직접 소유하지 않음

Runtime 허용 범위는 단순히 `app` 아래인지가 아니라 entry에 따라 결정한다.

- Server Component, route handler, server-only loader는 server-safe module을 사용할 수 있다.
- Client Component는 repository, database client, secret, filesystem code 등 server-only module을 참조하지 않는다.
- app entry가 import한 component에도 같은 runtime 규칙을 적용한다.

```tsx id="app-example"
export default function Page() {
  return <ServiceDeskPage />;
}
```

---

### Supporting / Framework Folders

- `auth/`: 현재 NextAuth credentials, authorize, JWT, session integration. Server 중심이며 현재 login을 위해 auth route helper에 접근함
- `mocks/`: LOCAL demo와 test fixture. domain/shared를 사용할 수 있지만 production 하위 계층의 source of truth가 되지 않음
- `types/`: framework module augmentation과 ambient declaration 전용. 비즈니스 타입을 두지 않음
- `stories/`: Storybook 전용 최상위 consumer. runtime production module에서 참조하지 않음
- `styles/`: global style과 design token stylesheet. 비즈니스 로직을 두지 않음

새로운 framework integration은 별도 최상위 폴더를 늘리기보다 기존 `lib` runtime
경계, `server`, `auth`, app composition boundary를 우선한다.

---

## Feature Module Structure

각 feature는 일관된 내부 구조를 따릅니다.

```bash id="feature-module"
feature/serviceDesk/
  components/
  api/
  hooks/
  types/
  utils/
```

---

### components/

- feature 전용 UI 컴포넌트
- container / presentational 컴포넌트를 모두 포함 가능

---

### api/

- 필요에 따라 서버에서 안전하게 사용할 수 있는 헬퍼 함수와 클라이언트 전용 래퍼 함수로 분리합니다.
- API 호출과 mutation 로직
- 백엔드 연동 세부 사항 캡슐화

```ts id="api-example"
export const serviceDeskTicketApi = {
  list: (params) => fetch(...),
  get: (id) => fetch(...),
};
```

---

### hooks/

- custom hook 위치
- 데이터 페칭과 상태 조합 담당

```ts id="hook-example"
export const useFetchTickets = () => {
  return useQuery(...);
};
```

---

### types/

- feature 내부 contract와 UI/form 전용 TypeScript 타입
- 핵심 도메인 모델을 중복 정의하지 않음

---

### utils/

- feature 전용 유틸리티 함수

---

## Component Boundary Strategy

### Rule

- **Server Component**는 server-safe loader, service, use-case 경계를 통해 server-rendered data를 로드할 수 있다.
- **Client feature container/hook**은 interactive server state와 mutation에 React Query를 사용한다.
- **Presentational child**는 props로 data와 callback을 전달받는다.

---

### Example

```tsx id="component-boundary"
<TicketList>
  <TicketItem />
</TicketList>
```

- `TicketList`는 query와 result state를 조정함
- `TicketItem`은 ticket data를 표시하고 UI event를 전달함

---

## Data Fetching Strategy

Server-rendered data와 interactive client-side server state는 owner가 다르다.

| Data flow | Owner |
| --- | --- |
| Server-rendered route data | Server Component가 server-safe loader/service/use case를 사용하며 Next.js request/cache semantics를 따름 |
| Interactive client-side server state | Feature hook/container가 React Query로 query cache, refetch, invalidation, mutation state를 관리 |
| Client/UI state | 기본은 local component state, 멀리 떨어진 consumer가 runtime state를 공유할 때만 Zustand |

현재 documents page는 Server Component에서 Markdown을 읽는다. Interactive Service
Desk data는 주로 feature client → route handler → LOCAL/REMOTE server implementation을
따른다. Presentational component는 API를 직접 호출하지 않는다.

### Benefits

- API 로직 중앙화
- 일관된 캐싱 전략
- 더 쉬운 테스트 구조

---

## State Management Strategy

### Server State

- Client feature가 interactive하게 소비하는 server state는 React Query가 관리
- Server Component는 React Query cache에 복사하지 않고 server rendering data를 로드할 수 있음

---

### Client State

- local UI state는 가장 낮은 component owner에 유지
- form state는 React Hook Form 사용
- 서로 무관하거나 멀리 떨어진 client subtree가 같은 runtime state를 필요로 할 때 Zustand 사용

---

### Principle

```id="state-principle"
가능한 한 client state보다 server state를 우선한다
```

---

## Dependency Rules

다음 표는 새 module과 refactoring의 기본 방향이다. 허용된 dependency 안에서도
runtime compatibility를 지켜야 한다.

| 출발 계층 | 허용 대상 |
| --- | --- |
| `shared` | 외부 라이브러리, 동일 shared |
| `domain` | shared |
| `lib/application` | domain, shared |
| `lib/config` | shared 또는 상위 계층 import가 없는 외부 runtime 값 |
| `lib/client` | lib/application, lib/config, domain, shared |
| `feature` | client-safe lib, domain, shared, components, runtime-safe feature contract |
| `server` | server-safe lib, lib/application, domain, shared |
| `components` | feature public API, client-safe lib, domain, shared |
| `app` | components, feature, server, lib, domain, shared |

### 금지 규칙

- `shared` → domain / lib / feature / server / app
- `domain` → lib / feature / server / app
- `feature` → server implementation
- `server` → feature hook / component / context / client API
- Client Component 또는 client entry → database / secret / filesystem / server-only module
- Server module → browser API / Zustand hook / React hook / client-only module

### Cross-Feature 규칙

Feature 간 재사용은 directory depth가 아니라 ownership과 runtime을 기준으로
판단한다. 현재 Service Desk workflow는 인접한 `ticket*` slice 사이에서 ticket form,
query contract, 공용 Service Desk client helper를 의도적으로 재사용한다.

- Runtime이 분명한 stable public entry 또는 focused direct module을 사용한다.
- 조합을 피하려는 목적으로 다른 feature의 internal component/context/hook을 import하지 않는다.
- 지속되는 domain concept은 `domain`, domain-aware cross-cutting policy는 `lib/application`, 범용 type은 `shared`로 이동한다.
- 독립 사용자 capability의 조합은 `app` 또는 application-wide widget이 담당한다.

### Runtime 규칙

- browser API, Zustand, client HTTP wrapper는 `lib/client` 또는 client feature entry에 둠
- database, secret, filesystem 접근은 `server`, `auth`, server-only route/loader 경계에 둠
- 환경 오염을 막기 위해 `client-only`, `server-only` 경계를 사용
- client/server를 함께 노출하는 root barrel을 만들지 않음

### Repository Extraction 경계

- `server`는 production server 구현과 server-only infrastructure만 소유한다.
- `app/api/_adapters`는 Next.js route adaptation과 LOCAL demo 구현을 소유한다.
- `lib/application/contracts`는 repository 간 공유하는 DTO, schema, pure mapper를 소유한다.
- `mocks`는 LOCAL demo/test fixture를 소유하며 `server`가 import하지 않는다.
- 기본 i18n resource와 namespace contract는 `lib/application/i18n`, client runtime은 `lib/client/i18n`에 두고 application locale 등록은 `components/i18n`에서 조합한다.

### 자동 검사

```bash
npm run lint
```

`eslint-plugin-boundaries`가 `src` 아래의 project element를 분류하고
`.eslintrc.json`의 계층 허용 행렬을 적용한다. Import, re-export, dynamic import,
`require`를 검사하며 분류되지 않은 local file이나 dependency도 거부한다. 인접한
Service Desk `ticket*` feature slice 사이의 의도적인 협업은 `feature` element 정책으로
허용한다. Client/server runtime compatibility는 runtime marker와 Next.js build가
별도로 검증한다.

---

### Purpose

- 강한 결합 방지
- feature 독립성 유지

---

## Barrel Export Policy

Barrel 파일은 명시적인 public contract로 취급한다.

규칙:

```txt
Barrel file != dumping ground
```

Service Desk 방향:

```txt
feature/serviceDesk/ticket/index.ts
-> constants, mapper, mock, types

feature/serviceDesk/ticket/components/index.ts
-> UI components

feature/serviceDesk/ticket/api/index.ts
-> server-safe API helpers

feature/serviceDesk/ticket/api/client.ts
-> client-only API exports
```

여기서 `server-safe`는 전체 module graph가 Server Component, route handler, server
implementation에서 실행 가능하다는 뜻이다. Runtime compatibility와 ownership은
서로 다른 review 항목이다. Production server와 공유하는 DTO 또는 pure mapper는
feature나 app 구현 경계가 아니라 `lib/application/contracts`에 둔다.

Client-only shared utilities는 다음과 같은 경계로 분리한다.

```txt
src/lib/client/
```

단, domain을 모르는 범용 browser helper라면 `src/shared/client`를 사용할 수 있다.

---

## Reusability Strategy

### Reusable Components

- 비즈니스 비종속 UI primitive는 현재 `components/ui`에 위치
- generic composed control은 `components/custom`에 위치
- feature를 소비하는 application-wide widget은 `components/layout` 또는 `components/menu`에 위치

---

### Feature Components

- 해당 workflow의 domain 의미가 있는 동안 owning feature에 유지
- 재사용 횟수만으로 이동하지 않고 contract가 실제로 generic/application-wide가 되었을 때 이동

### Route Components

- 특정 route에서만 사용하는 UI는 `app/**/_components`에 colocate
- 재사용 횟수만으로 shared로 이동하지 않고 비즈니스 소유권을 우선함

---

## Trade-offs

### Pros

- 명확한 도메인 분리
- 확장 가능한 구조
- 향상된 유지보수성
- 더 쉬운 온보딩

---

### Cons

- 초기 구조 설정 비용
- 엄격한 규율 필요
- feature 간 중복 가능성

---

## Alternatives Considered

### 1. Page-Based Structure

- 확장성이 낮음
- 도메인 분리가 약함

---

### 2. Layer-Based Structure (global api / components / hooks)

- 처음엔 이해하기 쉬움
- 비즈니스 로직이 여러 폴더에 흩어짐

---

### 3. Fully Shared Component Structure

- 최대 재사용 가능
- 소유권과 책임 경계가 흐려짐

---

## Design Principles Alignment

이 구조는 다음과 같은 원칙과 맞닿아 있습니다.

- Domain-driven design (DDD)
- 관심사 분리
- 확장성과 유지보수성
- feature 독립성

---

## Related Documents

- [`state-management.md`](state-management.md)
- [`routing-strategy.md`](routing-strategy.md)
- [`database-strategy.md`](database-strategy.md)
- [`../04-ui-ux/component-boundary.md`](../04-ui-ux/component-boundary.md)
- [`../08-dev-strategy/decision-log/2026-05-barrel-export-boundary.md`](../08-dev-strategy/decision-log/2026-05-barrel-export-boundary.md)
- [`../08-dev-strategy/decision-log/2026-05-service-desk-documentation-alignment.md`](../08-dev-strategy/decision-log/2026-05-service-desk-documentation-alignment.md)

---

## Summary

feature-based structure는 애플리케이션을 **비즈니스 도메인 중심**으로 구성함으로써, 각 기능이 독립 모듈처럼 동작하게 만듭니다.

그 결과 프로젝트는 더 확장 가능하고, 유지보수하기 쉬우며, 프로덕션 지향적인 구조를 갖게 됩니다.
