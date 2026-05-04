# 상태 관리 전략

## 목표

상태 관리 전략은 **서버 상태와 클라이언트 상태를 명확하게 분리**하여,
프로덕션 환경에서 예측 가능한 데이터 흐름, 확장성, 유지보수성을 확보하는 것을 목표로 한다.

구체적인 목표는 다음과 같다.

- 불필요한 전역 상태를 최소화한다.
- 서버 상태를 기본적인 source of truth로 사용한다.
- 상태 동기화 복잡도를 줄인다.
- 성능과 개발자 경험을 함께 개선한다.

---

## 핵심 원칙

```id="core-principle"
Prefer server state over client state whenever possible
```

---

## 상태 분류

시스템은 상태를 세 가지 주요 범주로 나눈다.

1. **Server State**
2. **Client State**
3. **UI Persistence State (Page Local Session)**

---

## 1. Server State

### 정의

백엔드에서 비롯되고, 서버와 지속적으로 동기화되어야 하는 데이터다.

### 예시

- 티켓 목록
- 티켓 상세 정보
- 카테고리 데이터
- 사용자 프로필 데이터

---

### 해결 방식

서버 상태는 **React Query (@tanstack/react-query v5)** 로 관리한다.

---

### Why React Query?

- 내장 캐싱
- 백그라운드 리패치
- stale data 관리
- 중복 요청 제거
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

### 핵심 전략

- 서버 상태를 클라이언트 상태에 **중복 저장하지 않는다**.
- 서버 데이터는 항상 React Query 훅을 통해 접근한다.

---

## 2. Client State

### 정의

클라이언트에만 존재하고, 백엔드와 동기화할 필요가 없는 상태다.

---

### 예시

- 다이얼로그 열림/닫힘 상태
- UI 토글 상태
- 임시 폼 상태
- 선택된 필터(로컬 전용)

---

### 해결 방식

클라이언트 상태는 **Zustand** 또는 로컬 컴포넌트 상태로 관리한다.

상태가 여러 컴포넌트나 feature 경계를 넘어 공유되어야 할 때만 Zustand를 사용한다.

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

## 3. UI Persistence State (Page Local Session)

### 정의

백엔드 동기화 없이도, 새로고침이나 내비게이션 이후에
페이지 수준의 UI 동작을 유지하기 위해 사용하는 상태다.

이 상태는 server state가 아니며, 전역 client state와도 다르다.

즉, UI가 사용자 맥락을 복원할 수 있도록 돕는 **page local session** 역할을 한다.

---

### 예시

- 티켓 검색 조건
- 테이블 컬럼 표시 여부
- 보기 모드(`grid` / `list`)
- 확장/축소된 섹션 상태
- 필터 패널 상태
- 마지막으로 사용한 페이지 옵션

---

### 목적

- 새로고침 이후에도 의미 있는 UI 맥락을 복원한다.
- 반복적인 사용자 입력을 줄인다.
- 동일한 브라우징 흐름 안에서 연속성을 유지한다.

---

### 해결 방식

다음과 같은 계층형 persistence 접근으로 관리한다.

1. 내비게이션 관련 상태는 **URL**
2. 일시적인 페이지 로컬 persistence는 **sessionStorage**
3. 장기 사용자 선호값이 필요할 때는 **Database**

---

## 상태 경계 규칙

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

### Rule 4

```id="rule-4"
Persist page-level UI state separately from auth/runtime stores
```

---

## 서버 상태 전략

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

- 자주 갱신되는 데이터(예: 티켓 목록)

```ts id="dynamic-query"
refetchOnWindowFocus: true;
staleTime: 0;
```

---

## Mutation 전략

변경 요청(mutation)은 React Query를 통해 처리한다.

### 원칙

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

## Cache 전략

### 목표

- 불필요한 네트워크 요청을 줄인다.
- UI 반응성을 유지한다.

---

### 기법

- Query invalidation
- Optimistic updates (선택적 적용)
- 백그라운드 리패치

---

## 클라이언트 상태 전략

### Local vs Global

| State Type | Location |
| --- | --- |
| 컴포넌트 전용 상태 | `useState` |
| 기능 범위 상태 | Zustand |
| 앱 전역 상태 | Zustand (제한적으로) |
| Page local session | Feature hook + `sessionStorage`/URL |

---

### 원칙

```id="client-principle"
Only globalize state when necessary
```

---

## Form 상태

폼 상태는 **react-hook-form** 으로 별도 관리한다.

### 이유

- 폼 처리에 최적화되어 있다.
- 기본적인 검증 지원이 있다.
- 큰 폼에서도 성능이 좋다.

---

### 규칙

- 폼 상태를 Zustand에 저장하지 않는다.
- UX 연속성이 꼭 필요할 때만 폼 관련 페이지 맥락을 persistence한다.

---

## URL 상태

일부 상태는 URL에 저장한다.

### 예시

- 필터
- 페이지네이션
- 정렬

---

### 원칙

```id="url-state"
If state affects navigation -> store in URL
```

---

## Page Local Session 전략

Page local session은 서버 상태가 아닌, 페이지 지향 UI 동작을 위한 persistence 계층이다.

### Storage Layers

#### 1. URL (Primary)

내비게이션 관련 상태에 사용한다.

예시:

- 필터
- 정렬
- 페이지네이션

```txt
/service-desk?status=open&assignee=me&page=2
```

---

#### 2. sessionStorage (Secondary)

현재 브라우저 탭 안에서의 일시적인 UI persistence에 사용한다.

예시:

- 고급 필터 상태
- 레이아웃 선호값
- 마지막으로 사용한 검색 조건

특징:

- 브라우저 탭 단위로 범위가 제한된다.
- 탭이 닫히면 함께 사라진다.
- 빠르고 단순하다.

---

#### 3. Database (Optional)

장기적인 사용자 선호값에 사용한다.

예시:

- 저장된 필터 프리셋
- 대시보드 레이아웃 설정

특징:

- 기기 간에도 유지된다.
- 사용자 계정에 연결된다.

---

### 구현 패턴

```txt
page / component
-> feature hook
-> shared hook (useSessionStorageState)
-> storage utility (sessionStorage)
```

---

### Example

```ts
useSessionStorageState<T>();
```

```ts
useTicketSearchCriteriaState();
```

```ts
const { value, setValue, reset } = useTicketSearchCriteriaState();
```

---

### 설계 규칙

- storage 로직이 UI 컴포넌트로 새어 나오면 안 된다.
- 컴포넌트는 storage API가 아니라 의미 있는 훅을 소비해야 한다.
- 여러 시스템이 `sessionStorage`를 사용하더라도 논리적으로 분리되어야 한다.

| Purpose | Owner |
| --- | --- |
| Auth session | `authSessionStore` |
| UI persistence | `useSessionStorageState` |
| Navigation state | URL |

Prefer:

```ts
useTicketSearchCriteriaState();
```

Over:

```ts
readSessionStorage("some_key");
```

---

### 복원력

UI persistence는 장애에 강해야 한다.

- parse error가 발생하면 기본값으로 fallback한다.
- version mismatch를 처리한다.
- 구조가 바뀔 때 migration을 허용한다.

---

## Derived State

파생 상태는 별도로 저장하지 않는다.

### Example

```ts id="derived-state"
const isOwner = ticket.requesterId === currentUser.id;
```

---

### 원칙

```id="derived-rule"
Derive instead of store
```

---

## 피해야 할 안티패턴

### 1. Global State Overuse

- 모든 상태를 Zustand에 넣는 방식을 피한다.

---

### 2. Server State Duplication

- API 데이터를 로컬 상태로 복사하는 방식을 피한다.

---

### 3. Prop Drilling Abuse

- 불필요하게 많은 계층을 통해 상태를 전달하는 방식을 피한다.

---

### 4. Uncontrolled Side Effects

- 추상화 없이 컴포넌트 내부에서 직접 데이터를 가져오는 방식을 피한다.

---

### 5. Mixing Auth and UI State

- 페이지 설정을 `authSessionStore`에 결합하는 방식을 피한다.

Auth session과 UI persistence는 분리되어야 한다.

---

### 6. Direct Storage Access in Components

- page 컴포넌트 안에서 `readSessionStorage()`를 직접 호출하는 방식을 피한다.

---

### 7. Treating UI State as Server State

- 필터를 React Query cache로 관리하는 방식을 피한다.

---

## Trade-offs

### Pros

- 관심사 분리가 명확하다.
- 데이터 흐름이 예측 가능하다.
- 상태 동기화 문제에서 생기는 버그를 줄일 수 있다.
- 확장 가능한 아키텍처를 만들 수 있다.
- 새로고침 이후에도 UI 연속성을 유지하기 쉽다.

---

### Cons

- 여러 도구에 대한 이해가 필요하다.
- 초기 학습 비용이 있다.
- 설정 복잡도가 다소 증가한다.
- persistence 규칙에 대한 팀의 규율이 필요하다.

---

## 고려한 대안

### 1. Redux

- 강력하고 확장성이 높다.
- 현재 용도에는 보일러플레이트가 너무 많다.

---

### 2. Context API Only

- 내장 기능이라 도입이 쉽다.
- 잦은 업데이트에는 성능상 불리하다.

---

### 3. Single State Store (All in Zustand)

- 정신 모델은 단순할 수 있다.
- 서버 데이터와의 동기화가 어려워진다.
- runtime state와 page local session의 경계가 약해진다.

---

## 설계 원칙과의 정렬

이 전략은 다음 원칙과 정렬된다.

- 관심사 분리
- Single source of truth
- 최소한의 전역 상태
- 성능 최적화
- 페이지 워크플로우의 UX 연속성

---

## 요약

이 상태 관리 전략은 **server state**, **client state**, 그리고
**UI persistence state (page local session)** 를 명확하게 분리한다.

구체적으로는 다음을 사용한다.

- 백엔드 동기화에는 React Query
- 클라이언트 runtime 상태에는 Zustand 또는 local state
- page local session persistence에는 URL과 `sessionStorage`

그 결과, 확장 가능하고 유지보수 가능하며 프로덕션 수준에 적합한 아키텍처를 만들 수 있다.
