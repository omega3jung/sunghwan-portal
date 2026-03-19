# State Management Strategy

## Goal

이 상태 관리 전략은 **서버 상태와 클라이언트 상태를 명확하게 분리**하여,
프로덕션 환경에서 예측 가능한 데이터 흐름, 확장성, 유지보수성을 확보하는 것을 목표로 한다.

구체적인 목적은 다음과 같다.

- 불필요한 전역 상태를 최소화한다.
- 서버 상태를 기본적인 single source of truth로 활용한다.
- 상태 동기화 복잡도를 줄인다.
- 성능과 개발자 경험을 함께 개선한다.

---

## Core Principle

```id="core-principle"
Prefer server state over client state whenever possible
```

---

## State Classification

시스템은 상태를 두 가지 주요 범주로 나눈다.

1. **Server State**
2. **Client State**

---

## 1. Server State

### Definition

백엔드에서 비롯되며, 서버와 지속적으로 동기화되어야 하는 데이터다.

### Examples

- 티켓 목록
- 티켓 상세 정보
- 카테고리 데이터
- 사용자 데이터

---

### Solution

서버 상태는 **React Query (@tanstack/react-query v5)** 로 관리한다.

---

### Why React Query?

- 내장 캐싱
- 백그라운드 재조회
- stale data 관리
- 요청 중복 제거
- 에러 및 로딩 상태 처리

---

### Example

```ts id="server-state-example"
export const useFetchTickets = (params) => {
  return useQuery({
    queryKey: ["tickets", params],
    queryFn: () => api.getTickets(params),
  });
};
```

---

### Key Strategy

- 서버 상태를 클라이언트 상태에 **중복 저장하지 않는다**.
- 서버 데이터는 항상 React Query 훅을 통해 접근한다.

---

## 2. Client State

### Definition

클라이언트에만 존재하며, 백엔드와의 동기화가 필요하지 않은 상태다.

---

### Examples

- 다이얼로그 열림/닫힘 상태
- UI 토글 상태
- 임시 폼 상태
- 선택된 필터(로컬 전용)

---

### Solution

클라이언트 상태는 **Zustand** 로 관리한다.

---

### Why Zustand?

- 보일러플레이트가 적다.
- API가 단순하다.
- Provider가 필요 없다.
- 세밀한 반응성을 제공한다.
- 상태 범위를 나누기 쉽다.

---

### Example

```ts id="client-state-example"
const useDialogStore = create((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));
```

---

## State Boundary Rules

### Rule 1

```id="rule-1"
Do not store server data in client state
```

---

### Rule 2

```id="rule-2"
Do not use global state for local UI concerns
```

---

### Rule 3

```id="rule-3"
Keep state as close as possible to where it is used
```

---

## Server State Strategy

### Query Key Design

- 구조적이고 예측 가능한 query key를 사용한다.

```ts id="query-key"
["tickets", params][("ticket", id)];
```

---

### Query Types

#### Static Data

- 자주 바뀌지 않는 데이터(예: 카테고리)

```ts id="static-query"
staleTime: Infinity;
```

---

#### Dynamic Data

- 자주 업데이트되는 데이터(예: 티켓 목록)

```ts id="dynamic-query"
refetchOnWindowFocus: true;
staleTime: 0;
```

---

## Mutation Strategy

변경 요청(mutation)은 React Query를 통해 처리한다.

### Principles

- mutation 이후에는 refetch 또는 cache update가 이어져야 한다.
- UI는 mutation 결과에 즉시 반응해야 한다.

---

### Example

```ts id="mutation-example"
const mutation = useMutation({
  mutationFn: createTicket,
  onSuccess: () => {
    queryClient.invalidateQueries(["tickets"]);
  },
});
```

---

## Cache Strategy

### Goals

- 불필요한 네트워크 요청을 줄인다.
- UI 반응성을 유지한다.

---

### Techniques

- Query invalidation
- Optimistic updates (선택적 적용)
- 백그라운드 재조회

---

## Client State Strategy

### Local vs Global

| State Type | Location |
| --- | --- |
| 컴포넌트 전용 상태 | useState |
| 기능 범위 상태 | Zustand |
| 앱 전역 상태 | Zustand (제한적으로) |

---

### Principle

```id="client-principle"
Only globalize state when necessary
```

---

## Form State

폼 상태는 **react-hook-form** 으로 별도 관리한다.

### Reason

- 폼 처리에 최적화되어 있다.
- 기본적인 검증 지원이 있다.
- 큰 폼에서도 성능이 좋다.

---

### Rule

- 폼 상태를 Zustand에 저장하지 않는다.

---

## URL State

일부 상태는 URL에 저장한다.

### Examples

- 필터
- 페이지네이션
- 정렬

---

### Principle

```id="url-state"
If state affects navigation -> store in URL
```

---

## Derived State

파생 상태는 별도로 저장하지 않는다.

### Example

```ts id="derived-state"
const isOwner = ticket.requesterId === currentUser.id;
```

---

### Principle

```id="derived-rule"
Derive instead of store
```

---

## Anti-Patterns Avoided

### 1. Global State Overuse

- 모든 상태를 Zustand에 넣는 방식은 피한다.

---

### 2. Server State Duplication

- API 데이터를 로컬 상태에 복사해 두는 방식은 피한다.

---

### 3. Prop Drilling Abuse

- 불필요하게 많은 계층을 통해 상태를 전달하는 방식은 피한다.

---

### 4. Uncontrolled Side Effects

- 추상화 없이 컴포넌트 내부에서 직접 데이터를 가져오는 방식은 피한다.

---

## Trade-offs

### Pros

- 관심사 분리가 명확하다.
- 데이터 흐름이 예측 가능하다.
- 상태 동기화 문제에서 발생하는 버그를 줄일 수 있다.
- 확장 가능한 아키텍처를 만들 수 있다.

---

### Cons

- 여러 도구에 대한 이해가 필요하다.
- 초기 학습 비용이 있다.
- 설정 복잡도가 다소 증가한다.

---

## Alternatives Considered

### 1. Redux

- 강력하고 확장성이 높다.
- 현재 사용 사례에는 보일러플레이트가 너무 많다.

---

### 2. Context API Only

- 내장 기능이라 도입이 쉽다.
- 잦은 업데이트에는 성능상 불리하다.

---

### 3. Single State Store (All in Zustand)

- 정신 모델은 단순해질 수 있다.
- 서버 데이터와의 동기화가 어려워진다.

---

## Design Principles Alignment

이 전략은 다음 원칙과 정렬된다.

- 관심사 분리
- Single source of truth
- 최소한의 전역 상태
- 성능 최적화

---

## Summary

이 상태 관리 전략은 **서버 상태와 클라이언트 상태를 명확히 분리**하고,
백엔드 동기화에는 React Query를, 로컬 UI 상태에는 Zustand를 사용함으로써,
확장 가능하고 유지보수 가능한 프로덕션 수준의 아키텍처를 만든다.
