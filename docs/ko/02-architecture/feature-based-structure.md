# Feature-Based Structure

## Goal

이 프로젝트는 프로덕션 수준의 프론트엔드 시스템에서 **확장성, 유지보수성, 관심사의 분리**를 강화하기 위해 **feature-based architecture**를 채택합니다.

이 문서는 현재 소스 폴더 경계와 의존성 방향의 source of truth다. 과거
decision log는 당시의 판단 근거를 보존하며, 현재 규칙은 이 문서를 따른다.

주요 목표는 다음과 같습니다.

- 비즈니스 로직을 feature 경계 안에 캡슐화하기
- 관련 없는 모듈 간 결합도 줄이기
- 기능별 독립 개발을 가능하게 하기
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
- 범용 타입, 값 처리, formatting, UI primitive를 소유
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

- 하나 이상의 domain을 조합하는 공통 application policy를 소유
- domain 모델과 runtime 사이의 mapper 및 adapter를 소유
- `domain`과 `shared`를 참조할 수 있음
- `feature`, `server`, `app`, 전역 `components`를 참조하지 않음

환경별 의존성은 명시적인 하위 경계로 분리한다.

```txt
lib/
  application/  # client/server 공용 순수 정책
  client/       # browser, Zustand, client HTTP runtime
  server/       # database, secret, server-only infrastructure
```

`lib`은 이름이 모호하다는 이유로 소유권이 불명확한 코드를 모으는 dumping
ground로 사용하지 않는다.

---

### 4. feature/ (Feature Layer)

- 사용자가 수행하는 기능과 워크플로를 소유
- feature UI, form, hook, API client, client state를 캡슐화
- `lib`, `domain`, `shared`를 참조할 수 있음
- `server` 구현을 직접 참조하지 않음

다른 feature를 직접 참조하지 않는다. 여러 feature를 조합해야 하는 경우 상위
`app` 또는 전역 widget이 각 feature의 명시된 public contract를 사용해 조합한다.

---

### 5. server/ (Server Layer)

- repository, database data access, server use case, 외부 API adapter를 소유
- 독립 서버 저장소로 함께 이동할 수 있는 코드만 포함
- `lib/server`, `lib/application`, `domain`, `shared`를 참조할 수 있음
- `app`, `feature`, `components`, `mocks`, client API를 참조하지 않음

LOCAL demo 구현은 `app/api/_adapters/localDemo`, fixture는 `mocks`가 소유한다.
웹 adapter와 서버가 함께 사용하는 DTO, schema, 순수 mapper는
`lib/application/contracts`가 소유하여 서로의 구현을 직접 참조하지 않는다.

---

### 6. components/ (Application Widget Layer)

- 여러 route 또는 feature를 조합하는 애플리케이션 전역 UI widget을 소유
- feature public API와 하위 계층을 사용할 수 있음
- 범용 UI primitive는 `shared/ui`, feature 전용 UI는 해당 feature, route 전용
  UI는 `app/**/_components`를 우선함

---

### 7. app/ (Routing / Composition Layer)

- 라우트 정의(App Router)
- page와 layout에서 feature 및 widget을 최종 조합
- route handler에서 HTTP parsing, authentication, runtime 분기를 오케스트레이션
- 지속되는 비즈니스 규칙, data access, client state를 직접 소유하지 않음

```tsx id="app-example"
export default function Page() {
  return <ServiceDeskPage />;
}
```

---

### Supporting / Framework Folders

- `auth/`: NextAuth integration adapter. `lib/server`과 같은 server-only 의존 규칙을 따르며 app을 역참조하지 않음
- `mocks/`: LOCAL demo와 test fixture. domain/shared를 사용할 수 있지만 production 하위 계층의 source of truth가 되지 않음
- `types/`: framework module augmentation과 ambient declaration 전용. 비즈니스 타입을 두지 않음
- `stories/`: Storybook 전용 최상위 consumer. runtime production module에서 참조하지 않음
- `styles/`: global style과 design token stylesheet. 비즈니스 로직을 두지 않음

새로운 framework integration은 별도 최상위 폴더를 늘리기보다 `lib/client`,
`lib/server` 또는 app composition boundary를 우선한다.

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

- **Route Server Component 또는 feature container/hook** 이 데이터 페칭을 담당
- **Child component** 는 props로 데이터 전달받음

---

### Example

```tsx id="component-boundary"
<TicketList>
  <TicketItem />
</TicketList>
```

- `TicketList` 는 데이터를 가져옴
- `TicketItem` 은 표현만 담당

---

## Data Fetching Strategy

- Server Component는 server use case를 통해 source에 가까운 곳에서 조회할 수 있음
- Client Component의 서버 상태는 feature hook과 React Query로 관리
- presentational component는 직접 API를 호출하지 않음

### Benefits

- API 로직 중앙화
- 일관된 캐싱 전략
- 더 쉬운 테스트 구조

---

## State Management Strategy

### Server State

- React Query로 관리

---

### Client State

- 필요 시 Zustand로 관리

---

### Principle

```id="state-principle"
가능한 한 client state보다 server state를 우선한다
```

---

## Dependency Rules

의존성은 상위 조합 계층에서 하위 안정 계층 방향으로만 흐른다.

| 출발 계층 | 허용 대상 |
| --- | --- |
| `shared` | 외부 라이브러리, 동일 shared |
| `domain` | shared |
| `lib/application` | domain, shared |
| `lib/client` | lib/application, domain, shared |
| `lib/server` | lib/application, domain, shared |
| `feature` | lib/client, lib/application, domain, shared, 동일 feature |
| `server` | lib/server, lib/application, domain, shared, 동일 server |
| `components` | feature public API, lib, domain, shared |
| `app` | components, feature, server, lib, domain, shared |

### 금지 규칙

- shared -> domain / lib / feature / server / app
- domain -> lib / feature / server / app
- lib -> feature / server / app / components
- feature -> server
- server -> feature
- feature A -> feature B
- client-only module -> server-only module 및 그 반대

`feature`와 `server`는 서로를 참조하는 상하 계층이 아니라, app에서 조합되는
형제 adapter 계층이다.

### Cross-Feature 규칙

동일한 상위 비즈니스 영역에 있더라도 slice의 내부 경로를 직접 참조하지 않는다.

```txt
feature/serviceDesk/ticketDraft
-> feature/serviceDesk/ticket/forms 내부 직접 참조 금지
```

공유 대상이 순수 도메인 개념이면 domain으로, domain-aware 공통 정책이면
lib/application으로 이동한다. 사용자 기능을 조합하는 경우 app 또는 application
widget이 담당한다.

### Runtime 규칙

- browser API, Zustand, client HTTP wrapper는 `lib/client` 또는 client feature entry에 둠
- database, secret, filesystem 접근은 `lib/server` 또는 server에 둠
- 환경 오염을 막기 위해 `client-only`, `server-only` 경계를 사용
- client/server를 함께 노출하는 root barrel을 만들지 않음

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

여기서 `server-safe`는 Server Component 또는 route handler에서 실행 가능한
module graph라는 뜻이다. 이는 `server` 계층이 `feature`를 참조해도 된다는
의미가 아니다. 런타임 호환성과 계층 의존성 허용은 별도로 판단한다.

Client-only shared utilities는 다음과 같은 경계로 분리한다.

```txt
src/lib/client/
```

단, domain을 모르는 범용 browser helper라면 `src/shared/client`를 사용할 수 있다.

---

## Reusability Strategy

### Shared Components

- 비즈니스 의미를 모르는 UI primitive만 `shared/ui`로 추출
- 여러 feature를 조합하는 애플리케이션 widget은 전역 `components/`에 위치

---

### Feature Components

- 다른 곳에서 재사용되지 않는 한 feature 내부에 유지

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

## Summary

feature-based structure는 애플리케이션을 **비즈니스 도메인 중심**으로 구성함으로써, 각 기능이 독립 모듈처럼 동작하게 만듭니다.

그 결과 프로젝트는 더 확장 가능하고, 유지보수하기 쉬우며, 프로덕션 지향적인 구조를 갖게 됩니다.
