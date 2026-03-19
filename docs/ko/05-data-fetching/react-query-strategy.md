# React Query 전략

## 목표

데이터 페칭 전략은 **서버 상태를 효율적으로 관리**하여,
애플리케이션 전반의 일관성, 성능, 확장성을 보장하도록 설계된다.

이 전략의 목적은 다음과 같다.

- 서버 데이터를 위한 단일 진실 원천(single source of truth)을 제공한다
- 불필요한 네트워크 요청을 줄인다
- 캐싱과 백그라운드 업데이트를 통해 사용자 경험을 개선한다
- 예측 가능한 데이터 동기화를 가능하게 한다

---

## 핵심 원칙

```id="rq-core"
Server state should be managed declaratively and cached intelligently
```

---

## 왜 React Query 인가?

시스템은 서버 상태 관리를 위해 **@tanstack/react-query v5**를 사용한다.

---

### 주요 장점

- 자동 캐싱
- 백그라운드 재조회
- 요청 중복 제거
- 내장된 로딩 및 오류 상태 처리
- Query invalidation 지원

---

## Query 분류

모든 query는 두 가지 유형으로 분류한다.

1. **Static Queries**
2. **Dynamic Queries**

---

## 1. Static Queries

### 정의

거의 변경되지 않는 데이터.

---

### 예시

- 카테고리 목록
- 부서 목록
- 직무 분야 목록

---

### 전략

```ts id="static-query"
staleTime: Infinity;
gcTime: Infinity;
refetchOnWindowFocus: false;
```

---

### 근거

- 불필요한 재조회를 방지한다
- 캐시 재사용을 극대화한다
- 성능을 향상한다

---

## 2. Dynamic Queries

### 정의

자주 변경되며 최신 상태를 유지해야 하는 데이터.

---

### 예시

- 티켓 목록
- 티켓 상세
- 대시보드 데이터

---

### 전략

```ts id="dynamic-query"
staleTime: 0;
refetchOnWindowFocus: true;
```

---

### 근거

- 항상 최신 데이터를 가져온다
- UI가 최신 상태를 반영하도록 보장한다
- 실시간에 가까운 동작을 지원한다

---

## Query Key 전략

### 규칙

```id="query-key-rule"
Query keys must be deterministic and structured
```

---

### 예시

```ts id="query-keys"
["tickets", params][("ticket", id)]["categories"];
```

---

### 장점

- 정밀한 캐시 제어가 가능하다
- 필요한 대상만 정확히 invalidate할 수 있다
- 캐시 충돌을 방지한다

---

## Query Co-location

### 규칙

```id="co-location"
Queries should be defined within feature modules
```

---

### 구조

```bash id="query-location"
feature/serviceDesk/api/
feature/serviceDesk/hooks/
```

---

### 이점

- 도메인 로직을 캡슐화할 수 있다
- 유지보수성이 향상된다

---

## Mutation 전략

mutation은 `useMutation`으로 처리한다.

---

### 원칙

- 부수 효과(create/update/delete)를 트리거한다
- 관련 query를 invalidate하거나 직접 업데이트한다

---

### 예시

```ts id="mutation"
const mutation = useMutation({
  mutationFn: createTicket,
  onSuccess: () => {
    queryClient.invalidateQueries(["tickets"]);
  },
});
```

---

## Invalidation 전략

### 규칙

```id="invalidate-rule"
Invalidate only what is necessary
```

---

### 예시

- 티켓 생성 -> `["tickets"]` invalidate
- 티켓 수정 -> `["ticket", id]`와 목록 invalidate

---

### 피해야 할 것

- 모든 query를 전역으로 invalidate하는 방식

---

## 낙관적 업데이트 (선택 사항)

체감 성능 향상을 위해 사용한다.

---

### 예시

```ts id="optimistic"
onMutate: async (newData) => {
  await queryClient.cancelQueries(["tickets"]);
  queryClient.setQueryData(["tickets"], (old) => [...old, newData]);
};
```

---

### 트레이드오프

| Pros                | Cons                  |
| ------------------- | --------------------- |
| Instant UI feedback | Complexity            |
| Better UX           | Risk of inconsistency |

---

## 페이지네이션 전략

### 접근 방식

- 서버 사이드 페이지네이션
- query key에 페이지네이션 파라미터를 포함한다

---

### 예시

```ts id="pagination"
["tickets", { page, pageSize }];
```

---

### 옵션

```ts id="keep-prev"
keepPreviousData: true;
```

---

### 이점

- 부드러운 페이지네이션 UX를 제공한다
- UI 깜빡임을 방지한다

---

## Refetch 전략

### 언제 Refetch 하는가

- 윈도우 포커스 시 (dynamic query)
- mutation 이후
- 수동 새로고침 시

---

### 언제 Refetch 하지 않는가

- 정적 데이터
- 중요도가 낮은 백그라운드 데이터

---

## 오류 처리

### 전략

- query 단위 오류 처리
- 전역 error boundary (선택 사항)

---

### UX

- 대체 UI를 표시한다
- 재시도 옵션을 제공한다

---

## 로딩 전략

### 유형

1. 초기 로딩
2. 백그라운드 재조회

---

### UX 패턴

- 초기 로드에는 스켈레톤을 사용한다
- 백그라운드 업데이트에는 은은한 표시기를 사용한다

---

## 캐시 생명주기

### 핵심 개념

- `staleTime`: 데이터 신선도 유지 시간
- `gcTime`: 캐시 보존 시간

---

### 전략

| Query Type | staleTime | gcTime   |
| ---------- | --------- | -------- |
| Static     | Infinity  | Infinity |
| Dynamic    | 0         | Default  |

---

## 데이터 동기화

### 원칙

```id="sync-principle"
Do not manually sync server state into local state
```

---

### 이유

- 데이터 중복을 피할 수 있다
- 비일관성을 방지할 수 있다

---

## 피하려는 안티패턴

### 1. API 데이터를 Zustand에 저장

- 단일 진실 원천을 깨뜨린다

---

### 2. 과도한 페칭

- 같은 데이터를 여러 번 가져오는 문제를 만든다

---

### 3. 전역 invalidation

- 성능 저하를 유발한다

---

### 4. 명령형 데이터 페칭

- 유지보수가 어려워진다

---

## 트레이드오프

### 장점

- 효율적인 데이터 페칭
- 강력한 캐싱 전략
- 향상된 UX
- 확장 가능한 아키텍처

---

### 단점

- 캐시 동작에 대한 이해가 필요하다
- 더 많은 설정이 필요하다
- 디버깅이 복잡할 수 있다

---

## 고려한 대안

### 1. 수동 페칭 (`useEffect`)

- 단순하다
- 캐싱이 없다
- 확장성이 떨어진다

---

### 2. SWR

- 가볍다
- 복잡한 케이스에 대한 제어력이 상대적으로 낮다

---

### 3. 서버 상태를 Redux로 관리

- 중앙화는 쉽다
- 비동기 캐싱에 최적화되어 있지 않다

---

## 설계 원칙과의 정렬

이 전략은 다음 원칙과 정렬된다.

- 서버 상태 분리
- 성능 최적화
- 예측 가능한 데이터 흐름
- 확장 가능한 아키텍처

---

## 요약

React Query 전략은 **견고하고 확장 가능한 서버 상태 관리 방식**을 제공하며,
지능적인 캐싱, 정밀한 invalidation, query 분류를 활용하여
성능과 일관성을 모두 보장한다.
