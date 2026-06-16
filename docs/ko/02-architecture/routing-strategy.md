# Routing Strategy

## Goal

이 라우팅 전략은 Next.js 14 App Router를 기반으로
**명확하고, 확장 가능하며, UI 일관성을 유지하는 내비게이션 구조**를 제공하기 위해 설계되었다.

구체적인 목표는 다음과 같다.

- URL에 도메인 구조를 자연스럽게 반영한다.
- 페이지 기반 UI와 오버레이 기반 UI를 모두 지원한다.
- 예측 가능한 내비게이션 동작을 유지한다.
- 핵심 화면 전반에서 딥 링크를 가능하게 한다.
- UI를 로컬/원격 런타임 분기와 독립적으로 유지.

---

## Core Concept

라우팅은 **리소스 중심 URL**과
**UI 중심 렌더링 전략(page vs overlay)**의 조합으로 설계된다.

```id="routing-concept"
Route = Resource + UI Representation
```

---

## Base Route Structure

```bash id="base-routes"
/service-desk
/service-desk/[ticketId]
```

---

## Route Responsibilities

### 1. `/service-desk`

- 티켓 목록을 표시한다.
- 필터링과 검색을 지원한다.
- 티켓 관련 작업의 진입점 역할을 한다.

---

### 2. `/service-desk/[ticketId]`

- 티켓 상세 화면을 표시한다.
- 티켓 수정 및 검토를 지원한다.
- 티켓 상세에 대한 **single source of truth** 역할을 한다.

---

## Why Page-Based Detail Instead of Modal Routing?

### Decision

티켓 상세는 모달 라우트가 아니라 **전체 페이지**로 구현한다.

---

### Reasoning

#### 1. Complexity Control

- 중첩 모달(drawer 위에 drawer)이 생기면 UI 복잡도가 빠르게 증가한다.
- 상태와 내비게이션을 관리하기가 어려워진다.

---

#### 2. Clear Navigation

- 각 티켓은 고유한 URL을 가진다.
- 직접 접근과 북마크를 자연스럽게 지원할 수 있다.

---

#### 3. Consistent UX

- 상세 화면은 일시적인 오버레이가 아니라 주요 워크플로우로 다뤄진다.

---

## UI Strategy: Page vs Drawer

### Principle

```id="ui-principle"
일시적 상호작용에는 Drawer 사용
주요 워크플로우에는 Page 사용
```

---

### Drawer Usage

다음과 같은 경우 Drawer를 사용한다.

- 빠른 액션
- 보조 상호작용
- 중요도가 낮은 보조 워크플로우

---

### Page Usage

다음과 같은 경우 Page를 사용한다.

- 핵심 워크플로우(티켓 상세)
- 복잡한 폼
- 상대적으로 오래 머무르는 상호작용

---

## Detail View Strategy

### Route

```bash id="detail-route"
/service-desk/[ticketId]
```

---

### UI Behavior

- 메인 콘텐츠는 티켓 정보를 표시한다.
- Drawer는 **하위 액션**에만 사용한다.

---

### Example

- 티켓 상세 페이지(메인)
- 댓글 Drawer
- 이력 Drawer

---

## Deep Linking

모든 핵심 상태는 URL을 통해 직접 접근할 수 있어야 한다.

### Benefits

- 특정 티켓으로 직접 이동 가능
- 공유 가능한 링크 제공
- 디버깅 및 지원 효율 향상

---

## Dynamic Routing

### Pattern

```bash id="dynamic-route"
/service-desk/[ticketId]
```

---

### ID Strategy

- 증가형 ID 대신 **UUID(권장)** 를 사용한다.

---

### Rationale

- 예측 가능한 ID 접근을 방지한다.
- 보안을 강화한다.
- 분산 시스템에서 충돌 문제를 줄일 수 있다.

---

## Route Handler Orchestration

Next.js 라우트 핸들러는 다음과 같은 오케스트레이션 경계로 사용됩니다.

```txt
route.ts
-> 인증/세션 확인
-> 로컬 또는 원격 선택
-> 로컬 핸들러 또는 원격 프록시 호출
```

이렇게 하면 런타임이 UI 컴포넌트에서 분기되는 것을 방지하고 원격 경로 확장을 위한 준비 상태를 유지할 수 있습니다.

Service Desk Settings API도 같은 route handler 책임을 사용합니다. Route handler는
session과 runtime context를 해석한 뒤 settings/domain handler로 위임해야 합니다.

```txt
Route Handler
-> resolve session/runtime
-> delegate to settings/domain handler
-> LOCAL handler or REMOTE service
```

이렇게 하면 settings-specific mapping, mutation rule, DTO construction이 route file에
쌓이는 것을 방지할 수 있습니다.

---

## Navigation Flow

### Example Flow

```id="nav-flow"
List -> Click Ticket -> Navigate to /[ticketId]
-> Perform actions -> Return to list
```

---

### Back Navigation

- 브라우저 히스토리를 사용한다.
- 필터/검색 상태는 query params 또는 state를 통해 보존한다.

---

## Query Parameters

다음과 같은 상태는 query parameter로 표현한다.

- 필터
- 정렬
- 페이지네이션

---

### Example

```id="query-example"
/service-desk?status=open&assignee=me&page=2
```

---

## State Preservation Strategy

### Options

1. URL 기반 상태 관리(권장)
2. 클라이언트 상태 관리(보조 수단)

---

### Principle

```id="state-routing"
If state affects navigation -> store in URL
```

---

## Parallel Routes (Optional Future)

Next.js App Router는 parallel routes를 지원한다.

### Potential Use Cases

- 분할 화면(list + detail)
- 대시보드 패널

---

### Current Decision

- 현재는 복잡도를 줄이기 위해 사용하지 않는다.
- 필요해지면 이후에 도입할 수 있다.

---

## Error Handling

### Route-Level Errors

- 404: 티켓을 찾을 수 없음
- 403: 접근 권한 없음

---

### Strategy

- Next.js error boundary를 사용한다.
- 사용자 친화적인 fallback UI를 제공한다.

---

## Loading Strategy

### Route-Level Loading

- 페이지 전환 시 skeleton UI를 사용한다.

---

### Data-Level Loading

- 데이터 로딩 상태는 React Query가 관리한다.

---

## SEO Consideration

SEO가 최우선 목표는 아니지만 다음 이점이 있다.

- 리소스 중심 URL은 구조를 더 명확하게 만든다.
- 필요할 경우 향후 인덱싱 대응이 가능하다.

---

## Trade-offs

### Pros

- 명확하고 예측 가능한 내비게이션
- 도메인 모델과 강하게 정렬되는 구조
- 딥 링크 지원
- UI 복잡도 감소

---

### Cons

- 전체 페이지 전환이 모달보다 다소 무겁게 느껴질 수 있다.
- 상태 보존 전략을 별도로 고려해야 한다.
- 라우팅 구성이 약간 더 필요하다.

---

## Alternatives Considered

### 1. Modal-Based Routing

- 빠른 상호작용에는 유리함
- 딥 링크 품질이 떨어짐
- 중첩 UI 복잡도가 커짐

---

### 2. Drawer-Only Detail View

- UI는 가볍게 만들 수 있음
- 확장성이 떨어짐
- 복잡한 워크플로우에는 적합하지 않음

---

### 3. Parallel Routes for Detail

- 고급 레이아웃 구성이 가능함
- 복잡도가 증가함
- 유지보수가 더 어려워질 수 있음

---

## Design Principles Alignment

이 라우팅 전략은 다음 원칙과 정렬된다.

- 도메인 주도 설계
- 명확한 관심사 분리
- 예측 가능한 내비게이션
- 확장 가능한 UI 아키텍처

---

## Summary

이 라우팅 전략은 **리소스 중심 URL**과 **UI 중심 렌더링 결정**을 결합해,
내비게이션이 명확하고 확장 가능하며 시스템의 핵심 워크플로우와 일관되도록 만든다.
