# Feature-Based Structure

## Goal

이 프로젝트는 프로덕션 수준의 프론트엔드 시스템에서 **확장성, 유지보수성, 관심사의 분리**를 강화하기 위해 **feature-based architecture**를 채택합니다.

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

시스템은 **feature(도메인 중심 모듈)** 를 기준으로 구조화됩니다.

```id="feature-concept"
feature = 독립적인 비즈니스 로직 단위
```

각 feature는 다음을 함께 포함합니다.

- UI components
- API logic
- state management
- types and domain models

---

## Directory Structure

```bash id="feature-structure"
src/
  app/        # 라우팅 계층
  domain/     # 도메인 모델 및 규칙
  feature/    # 기능 워크플로 및 UI
  server/     # 서버 측 로컬/데모 로직
  shared/     # 재사용 가능한 유틸리티 및 컴포넌트
```

---

## Responsibilities

### 1. app/ (Routing Layer)

- 라우트 정의(App Router)
- 최소한의 로직만 유지
- feature 컴포넌트를 조합하는 역할

```tsx id="app-example"
export default function Page() {
  return <ServiceDeskPage />;
}
```

---

### 2. feature/ (Business Layer)

도메인별로 묶인 비즈니스 로직이 위치합니다.

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

- feature 내부에서 공유하는 도메인 전용 TypeScript 타입

---

### utils/

- feature 전용 유틸리티 함수

---

## Component Boundary Strategy

### Rule

- **Feature-level component** 가 데이터 페칭을 담당
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

- 데이터 페칭은 feature hook 내부에 위치
- 서버 상태는 React Query 사용

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

### Allowed

- feature -> shared
- feature -> same feature

---

### Not Allowed

- feature A -> feature B 직접 의존

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

Client-only shared utilities는 다음과 같은 경계로 분리한다.

```txt
src/shared/client/
```

---

## Reusability Strategy

### Shared Components

- `shared/` 또는 전역 `components/` 로 추출

---

### Feature Components

- 다른 곳에서 재사용되지 않는 한 feature 내부에 유지

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
