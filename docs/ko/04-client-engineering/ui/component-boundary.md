# 컴포넌트 경계

## 목표

컴포넌트 경계 전략은 **컴포넌트 간 책임을 명확하게 분리**하는 데 초점을 둡니다.
이를 통해 유지보수성, 재사용성, 예측 가능한 데이터 흐름을 확보합니다.

이 전략의 목적은 다음과 같습니다.

- 컴포넌트 간 결합도 감소
- 재사용성 향상
- 테스트 단순화
- 데이터 소유권 명확화

---

## 핵심 원칙

```txt
Components should have a single responsibility
```

---

## 컴포넌트 유형

시스템은 컴포넌트를 두 가지 주요 유형으로 구분합니다.

1. **Container Components**
2. **Presentational Components**

---

## 1. 컨테이너 컴포넌트

### 정의

다음 책임을 가지는 컴포넌트입니다.

- 데이터 로딩 또는 mutation orchestration
- UI와 workflow state 조합
- permission, domain, API 결과를 presentational prop으로 변환
- loading, error, empty state 조정

---

### 특징

- Server Component에서는 server-safe loader/service를, Client Component에서는 feature hook을 호출합니다
- workflow contract를 알고 domain rule을 소비합니다
- props를 통해 하위 컴포넌트에 데이터를 전달합니다

Container는 workflow를 조정하지만 지속되는 domain rule, authorization policy,
persistence behavior의 source of truth가 되지 않습니다. 규칙의 결과를 선택하고 표시할
수는 있지만 JSX나 event handler에서 그 규칙을 다시 구현하면 안 됩니다.

---

### 예시

```tsx
export function TicketList() {
  const { data } = useFetchTickets();

  return (
    <div>
      {data.map((ticket) => (
        <TicketItem key={ticket.id} ticket={ticket} />
      ))}
    </div>
  );
}
```

---

## 2. 프레젠테이셔널 컴포넌트

### 정의

다음 책임을 가지는 컴포넌트입니다.

- UI 렌더링
- 사용자 상호작용 처리 (UI 수준에 한정)

---

### 특징

- props를 통해 데이터를 전달받습니다
- 직접 데이터를 조회하지 않습니다
- display-only derivation, formatting, badge/variant mapping, accessibility behavior,
  local open/close state, UI event callback을 가질 수 있습니다
- 지속되는 workflow, persistence, authorization rule을 소유하지 않습니다

Presentational component가 소유하면 안 되는 책임의 예:

- direct API call 또는 persistence mutation
- source of truth로 사용되는 authorization decision
- ticket status transition 또는 approval/assignment routing decision
- React Query server-state ownership

---

### 예시

```tsx
export function TicketItem({ ticket }) {
  return <div>{ticket.title}</div>;
}
```

---

## 경계 규칙

### 규칙

```txt
Data flows from container -> presentational components via props
```

---

### 의미

- presentational component는 API를 직접 호출하지 않습니다
- tree depth만으로 fetching 허용 여부를 결정하지 않습니다
- nested subtree가 명시적인 독립 container boundary와 자체 query/loading/error
  lifecycle을 가진 경우에는 data를 소유할 수 있습니다

---

## 기능 단위 경계

이 경계는 **feature 수준**에서 적용됩니다.

---

### 규칙

```txt
Route Server Components or feature containers own data orchestration
```

---

### 예시 구조

```bash
TicketList (container)
  -> TicketItem (presentational)
  -> TicketStatusBadge
  -> TicketActions
```

---

## 데이터 조회 전략

### 위치

- Server Component는 server-safe loader/service/use-case 경계를 통해 server-rendered data를 로드할 수 있습니다
- interactive Client Component container는 feature hook과 React Query를 사용합니다
- 독립적으로 로딩되는 widget이나 Suspense subtree는 자체 container를 가질 수 있습니다
- 프레젠테이셔널 컴포넌트는 직접 API를 호출하지 않습니다

---

### 이유

- 데이터 로직을 중앙화할 수 있습니다
- 캐싱과 재조회가 쉬워집니다
- 중복 요청을 피할 수 있습니다

---

## Props 설계 전략

### 원칙

```txt
Pass only what is needed
```

---

### 필요한 필드만 사용하는 경우

```tsx
<TicketItem title={ticket.title} status={ticket.status} />
```

---

### 객체 자체가 컴포넌트 계약인 경우

```tsx
<TicketItem ticket={ticket} />
```

객체 prop 자체를 안티패턴으로 보지 않습니다. 하위 컴포넌트에 필요한 필드가
소수라면 구체적인 prop을 사용하고, domain object 전체가 의미 있는 계약이라면
객체 prop을 사용할 수 있습니다.

---

### 트레이드오프

| Approach       | Pros           | Cons          |
| -------------- | -------------- | ------------- |
| Specific props | Clear contract | More verbose  |
| Object props   | Flexible       | Less explicit |

---

## 상태 배치 전략

### 규칙

```txt
State should live in the lowest common owner that needs it
```

---

### 예시

- 다이얼로그 open 상태 → 기본적으로 local component/container state
- 필터 상태 → navigation 의미가 있으면 URL, 아니면 owning container
- form input/validation state → form boundary 안의 React Hook Form
- interactive server state → 중복 Zustand store가 아니라 React Query

서로 무관하거나 멀리 떨어진 client subtree가 같은 runtime state를 공유할 때만
Zustand를 사용합니다. Callback 하나를 전달하지 않으려고 local dialog state를
globalize하거나 React Query data를 Zustand에 복사하지 않습니다.

---

## Server / Client Component 경계

Next.js page와 layout은 기본적으로 Server Component로 유지합니다.

### Server Component 책임

- server-safe loader/service/use case를 통한 server-rendered data 조회
- secret 또는 server-only dependency 사용
- Client Component에 직렬화 가능한 props 전달

### Client Component 책임

- event handler와 local state
- lifecycle hook
- browser API
- React Query, Zustand, form, translation 등 client hook

`"use client"`는 모든 하위 파일에 반복하는 표시가 아니라 client module graph의
entry boundary입니다. interactive subtree를 가능한 작게 유지하고, `client-only`와
`server-only`를 사용해 잘못된 runtime import를 차단합니다.

Server Component에서 Client Component로 넘어가기 전에 runtime-specific value를
normalize합니다.

| 경계 값 | 지침 |
| --- | --- |
| DTO, string, number, boolean, serializable array/object, ISO date string | 그대로 전달 |
| `Date`, `Map`, `Set`, database row | application-facing serializable value로 normalize |
| Repository, database client, request/response object, runtime handle | 전달 금지 |

---

## 상호작용 처리

### 원칙

```txt
UI reports interaction, container coordinates the workflow
```

---

### 예시

```tsx
<TicketItem onClick={handleSelectTicket} />
```

- `TicketItem`은 이벤트를 발생시킵니다
- `TicketList`는 로직을 처리합니다

---

## 재사용성 전략

### 프레젠테이셔널 컴포넌트

- visual/interaction contract가 안정적이면 재사용할 수 있습니다
- business-agnostic primitive는 현재 `components/ui` 경계에 둡니다
- generic composed control은 `components/custom`에 둡니다
- domain-aware component는 여러 screen이 사용해도 owning feature 또는 application-wide widget에 유지합니다

재사용 횟수만으로 소유권을 정하지 않습니다. Generic button, dialog primitive, table
shell은 reusable component 경계에 둘 수 있지만 ticket status view, approval editor,
assignment-rule card는 Service Desk 소유권을 유지합니다.

---

### 컨테이너 컴포넌트

- 보통 feature 전용입니다
- workflow contract가 안정적이면 owning feature 안에서 재사용할 수 있습니다
- 두 screen이 사용한다는 이유만으로 shared 위치로 이동하지 않습니다

---

## 의존성 규칙

### 허용

- Presentational -> Presentational
- Container -> Presentational

---

### 비허용

- Presentational → container workflow ownership
- Presentational → direct persistence 또는 authorization implementation
- Client component → server-only module

여러 feature를 조합하는 UI는 `app` 또는 전역 `components` widget이 소유합니다.
서로 밀접한 workflow slice는 `feature-based-structure.md`에 정의된 명시적이고
runtime-safe한 feature contract를 사용할 수 있습니다. 이것이 명확한 workflow owner 없이
다른 slice의 internal component나 client hook을 import하도록 허용하지는 않습니다.

---

## 피하려는 안티패턴

### 1. UI 컴포넌트 내부의 데이터 조회

- 중복과 비일관성을 초래합니다

---

### 2. 지나치게 똑똑한 컴포넌트

- UI와 비즈니스 로직이 혼합됩니다

---

### 3. 과도한 Prop Drilling

- 불필요한 데이터를 여러 계층에 걸쳐 전달하게 됩니다

---

### 4. 전역 상태 남용

- 지역 UI 상태에 `Zustand`를 사용하는 문제를 낳습니다

---

## 트레이드오프

### 장점

- 관심사가 명확하게 분리됩니다
- 테스트가 쉬워집니다
- 재사용성이 향상됩니다
- 데이터 흐름을 예측하기 쉽습니다

---

### 단점

- 관리해야 할 컴포넌트 수가 늘어납니다
- 보일러플레이트가 약간 증가합니다
- 구조를 지키는 규율이 필요합니다

---

## 고려한 대안

### 1. 완전한 Smart Component 방식

- 보일러플레이트가 적습니다
- 유지보수와 테스트가 어렵습니다

---

### 2. 완전한 Dumb Component 방식

- UI는 단순해집니다
- 너무 많은 로직이 상위로 밀려 올라갑니다

---

### 3. 명확한 경계가 없는 방식

- 초기 개발 속도는 빠를 수 있습니다
- 장기적으로 복잡도가 급증합니다

---

## 설계 원칙과의 정렬

이 전략은 다음 원칙과 정렬됩니다.

- 관심사 분리
- 컴포넌트 재사용성
- 예측 가능한 데이터 흐름
- 확장 가능한 UI 아키텍처

---

## 관련 문서

- [기능 기반 구조](../../02-architecture/feature-based-structure.md)
- [상태 관리 전략](../../02-architecture/state-management.md)
- [다이얼로그 패턴](dialog-pattern.md)

---

## 요약

컴포넌트 경계 전략은 **workflow를 조정하는 container**와 **rendering 및 local
interaction을 담당하는 presentational component**를 구분합니다. Presentational
component는 display logic을 가질 수 있지만 지속되는 domain, persistence,
authorization, server-state rule은 이를 소유한 경계에 남습니다.
