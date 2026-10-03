# 상태 관리 전략

## 목표

상태 관리 전략은 **서버 상태와 클라이언트 상태를 명확하게 분리**하여,
프로덕션 환경에서 예측 가능한 데이터 흐름, 확장성, 유지보수성을 확보하는 것을 목표로 합니다.

구체적인 목표는 다음과 같습니다.

- 불필요한 전역 상태를 최소화합니다.
- 데이터 판단의 기본 기준은 서버 상태에 둡니다.
- 상태 동기화 복잡도를 줄입니다.
- 성능과 개발자 경험을 함께 개선합니다.

---

## 핵심 원칙

```txt
Prefer server state over client state whenever possible
```

---

## 상태 분류

시스템은 상태를 세 가지 주요 범주로 나눕니다.

1. **Server State**
2. **Client State**
3. **UI Persistence State (Page Local Session)**

---

## 1. Server State

### 정의

백엔드에서 비롯되고, 서버와 지속적으로 동기화되어야 하는 데이터입니다.

### 예시

- 티켓 목록
- 티켓 상세 정보
- 카테고리 데이터
- 사용자 프로필 데이터
- 로컬 데모에서 변경 가능한 티켓/설정 상태 (서버 측 메모리 내 모듈)

---

### 해결 방식

서버 상태는 **React Query (@tanstack/react-query v5)** 로 관리합니다.

---

### Why React Query?

- 내장 캐싱
- 백그라운드 리패치
- 최신 조회가 필요한 데이터 관리
- 중복 요청 제거
- 에러 및 로딩 상태 처리

---

### Example

```ts
export const useFetchTickets = (params) => {
  return useQuery({
    queryKey: ["tickets", params],
    queryFn: () => api.getTickets(params),
  });
};
```

---

### 핵심 전략

- 사용자 조작에 따라 조회·변경하는 도메인 서버 상태는 React Query 훅으로 접근하며
  별도의 클라이언트 저장소에 중복 저장하지 않습니다.
- 인증·세션의 공통 접근 계층은 예외입니다. 화면 셸에서 사용할 `AppUser`를 캐시하지만,
  인증과 프로필 판단의 기준은 JWT·세션과 프로필 API에 둡니다.
  [Auth & Session Strategy](auth-session-strategy.md)를 참고하세요.
- Server Component는 React Query 없이 서버에서 실행 가능한 로더로 렌더링에 필요한
  데이터를 읽을 수 있습니다.

---

## 2. Client State

### 정의

클라이언트에만 존재하고, 백엔드와 동기화할 필요가 없는 상태입니다.

---

### 예시

- 다이얼로그 열림/닫힘 상태
- UI 토글 상태
- 임시 폼 상태
- 선택된 필터(로컬 전용)

---

### 해결 방식

클라이언트 상태는 **Zustand** 또는 로컬 컴포넌트 상태로 관리합니다.

상태를 여러 컴포넌트나 기능 사이에서 공유해야 할 때만 Zustand를 사용합니다.

---

### Why Zustand?

- 보일러플레이트가 적습니다.
- API가 단순합니다.
- Provider가 필요 없습니다.
- 세밀한 반응성을 제공합니다.
- 상태 범위를 나누기 쉽습니다.

---

### Example

```ts
const useDialogStore = create((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));
```

---

## 3. UI Persistence State (Page Local Session)

### 정의

백엔드 동기화 없이도, 새로고침이나 내비게이션 이후에
페이지 수준의 UI 동작을 유지하기 위해 사용하는 상태입니다.

이 상태는 서버 상태가 아니며, 전역 클라이언트 상태와도 다릅니다.

UI가 사용자의 검색 조건과 보기 상태를 복원하도록 돕는 **페이지 로컬 세션** 역할을 합니다.

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

- 새로고침 이후에도 의미 있는 UI 맥락을 복원합니다.
- 반복적인 사용자 입력을 줄입니다.
- 동일한 브라우징 흐름 안에서 연속성을 유지합니다.

---

### 해결 방식

상태를 유지해야 하는 기간과 공유 범위에 따라 다음 저장 방식을 사용합니다.

1. 현재의 일시적인 페이지 상태 저장은 **sessionStorage**
2. 상태를 공유하거나 북마크할 수 있어야 할 때는 **URL**
3. 장기 사용자 선호값이 필요할 때는 **Database**

현재 Service Desk 티켓 검색과 Insights 페이지는 `sessionStorage`를 사용하며 필터,
정렬, 페이지네이션을 URL과 동기화하지 않습니다.

---

## 상태 경계 규칙

### Rule 1

```txt
Do not store server data in client state
```

---

### Rule 2

```txt
Do not use global state for local UI concerns
```

---

### Rule 3

```txt
Keep state as close as possible to where it is used
```

---

### Rule 4

```txt
Persist page-level UI state separately from auth/runtime stores
```

---

## 서버 상태 전략

### Query Key Design

- 구조적이고 예측 가능한 query key를 사용합니다.

```ts
ticketQueryKeys.search(request);
ticketQueryKeys.detail(id);
```

---

### Query Option Profile

공통 쿼리 계층은 다음 두 설정 묶음을 제공합니다.

- `STATIC_QUERY_OPTIONS`: `staleTime` 5분, focus 및 reconnect refetch 비활성화
- `DYNAMIC_QUERY_OPTIONS`: `staleTime` 0, focus refetch 활성화

설정과 카테고리를 포함한 현재 Service Desk 쿼리는 실행 환경에 따라 옵션을 선택하는
`getServiceDeskQueryOptions`를 사용합니다.

- REMOTE는 `DYNAMIC_QUERY_OPTIONS`를 사용합니다.
- LOCAL은 데이터를 즉시 오래된 상태로 판단하고 비활성 캐시를 24시간 보존합니다.
  포커스·재연결 시 재조회는 끄고, 컴포넌트가 마운트되면 항상 재조회합니다.

설정을 변경하면 영향받는 쿼리 그룹의 캐시를 무효화합니다. 현재 Service Desk의
참조 데이터에는 무한 `staleTime`을 사용하지 않습니다.

LOCAL 데모에서는 변경 요청이 서버 메모리 상태를 바꿀 수 있으므로 React Query
캐시 초기화만으로는 상태를 완전히 되돌릴 수 없습니다. 데모를 초기화할 때는
아래 API를 통해 서버 상태도 초기화해야 합니다.

```txt
/api/demo/service-desk/reset
```

LOCAL 티켓 초안 복구는 별도의 브라우저 로컬 예외입니다. 기능 초안 저장소가
`localStorage` 레코드를 소유하고, React Query는 해당 레코드에 대한 접근을
캐시하고 조정할 뿐입니다.

---

## Mutation 전략

변경 요청(mutation)은 React Query를 통해 처리합니다.

### 원칙

- 변경 요청 후에는 재조회하거나 캐시를 갱신해야 합니다.
- UI는 변경 결과에 즉시 반응해야 합니다.

---

### Example

```ts
const mutation = useMutation({
  mutationFn: createTicket,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ticketQueryKeys.all });
  },
});
```

---

## Cache 전략

### 목표

- 불필요한 네트워크 요청을 줄입니다.
- UI 반응성을 유지합니다.

---

### 기법

- Query invalidation
- Optimistic updates (선택적 적용)
- 백그라운드 리패치

---

## 클라이언트 상태 전략

### Local vs Global

| State Type         | Location                            |
| ------------------ | ----------------------------------- |
| 컴포넌트 전용 상태 | `useState`                          |
| 기능 범위 상태     | Zustand                             |
| 앱 전역 상태       | Zustand (제한적으로)                |
| Page local session | Feature/page hook + `sessionStorage`; 명시적으로 구현한 경우 URL |

---

### 원칙

```txt
Only globalize state when necessary
```

---

## Form 상태

폼 상태는 **react-hook-form** 으로 별도 관리합니다.

### 이유

- 폼 처리에 최적화되어 있습니다.
- 기본적인 검증 기능을 지원합니다.
- 큰 폼에서도 성능이 좋습니다.

---

### 규칙

- 폼 상태를 Zustand에 저장하지 않습니다.
- 작업 흐름을 이어갈 필요가 있을 때만 폼 관련 페이지 상태를 저장합니다.

---

## URL 상태

페이지 상태를 화면 이동, 공유 또는 북마크에 사용해야 할 때는 URL에 저장하는 방식이
적합합니다.

### 예시

- 필터
- 페이지네이션
- 정렬

---

### 원칙

```txt
If state affects navigation -> store in URL
```

이는 필요한 상태에 URL로 접근할 수 있게 하자는 원칙이며, 현재 모든 검색 페이지가
URL 동기화를 구현했다는 뜻은 아닙니다. Service Desk 티켓 검색과 Insights 페이지는 이 값들을
`sessionStorage`에 저장합니다.

---

## Page Local Session 전략

페이지 로컬 세션은 서버 상태와 별도로 페이지의 UI 상태를 저장하고 복원하는 계층입니다.

### Storage Layers

#### 1. sessionStorage (현재 Service Desk 구현)

현재 브라우저 탭에서 UI 상태를 일시적으로 유지하는 데 사용합니다.

현재 예시:

- 티켓 검색 조건
- 티켓 목록의 페이지, 조회 범위, 정렬 필드, 정렬 순서
- Insights 검색 조건과 조회 범위

특징:

- 브라우저 탭 단위로 범위가 제한됩니다.
- 탭이 닫히면 함께 사라집니다.
- 클라이언트 초기화 이후 페이지 훅을 통해 복원합니다.

---

#### 2. URL (Addressability가 필요할 때)

화면 이동, 공유 또는 북마크를 위해 상태를 URL에 표시해야 할 때 사용합니다.

예시:

- 공유 가능한 필터
- URL로 정렬이나 페이지네이션 상태를 표현하기로 정한 화면

특징:

- URL을 복사하거나 북마크해도 유지됩니다.
- 브라우저 내비게이션에 참여합니다.
- 라우트·검색 매개변수와 명시적으로 동기화해야 합니다.

현재 Service Desk 검색 페이지는 이 계층을 구현하지 않았습니다.

---

#### 3. Database (Optional)

장기적인 사용자 선호값에 사용합니다.

예시:

- 저장된 필터 프리셋
- 대시보드 레이아웃 설정

특징:

- 기기 간에도 유지됩니다.
- 사용자 계정에 연결됩니다.

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
const { page, sort, changePage, changeSort } = useServiceDeskSearchState();
```

---

### 설계 규칙

- UI 컴포넌트에서 저장소 처리 로직을 직접 구현하지 않습니다.
- 컴포넌트는 저장소 API 대신 업무 의미가 드러나는 훅을 사용해야 합니다.
- 여러 시스템이 `sessionStorage`를 사용하더라도 논리적으로 분리되어야 합니다.

| Purpose          | Owner                    |
| ---------------- | ------------------------ |
| Auth session     | `authSessionStore`       |
| UI persistence   | `useSessionStorageState` |
| Addressable navigation state | 페이지에서 구현한 경우 URL |

Prefer:

```ts
useServiceDeskSearchState();
```

Over:

```ts
readSessionStorage("some_key");
```

---

### 복원력

UI 상태 복원은 저장된 값에 문제가 있어도 동작해야 합니다.

- 파싱 오류가 발생하면 기본값을 사용합니다.
- 버전이 맞지 않는 경우를 처리합니다.
- 구조가 바뀌면 기존 값을 변환할 수 있어야 합니다.

---

## Derived State

파생 상태는 별도로 저장하지 않습니다.

### Example

```ts
const isOwner = ticket.requesterUsername === currentUser.username;
```

---

### 원칙

```txt
Derive instead of store
```

---

## 피해야 할 안티패턴

### 1. Global State Overuse

- 모든 상태를 Zustand에 넣지 않습니다.

---

### 2. Server State Duplication

- API 데이터를 로컬 상태로 복사하지 않습니다.

---

### 3. Prop Drilling Abuse

- 상태를 전달하는 계층을 불필요하게 늘리지 않습니다.

---

### 4. Uncontrolled Side Effects

- 추상화 없이 컴포넌트 내부에서 직접 데이터를 가져오지 않습니다.

---

### 5. Mixing Auth and UI State

- 페이지 설정을 `authSessionStore`에 결합하지 않습니다.

인증 세션과 저장된 UI 상태는 분리해야 합니다.

---

### 6. Direct Storage Access in Components

- page 컴포넌트 안에서 `readSessionStorage()`를 직접 호출하지 않습니다.

---

### 7. Treating UI State as Server State

- 필터를 React Query cache로 관리하지 않습니다.

---

## Trade-offs

### Pros

- 관심사 분리가 명확합니다.
- 데이터 흐름이 예측 가능합니다.
- 상태 동기화 문제에서 생기는 버그를 줄일 수 있습니다.
- 확장 가능한 아키텍처를 만들 수 있습니다.
- 새로고침 이후에도 UI 연속성을 유지하기 쉽습니다.

---

### Cons

- 여러 도구에 대한 이해가 필요합니다.
- 초기 학습 비용이 있습니다.
- 설정 복잡도가 다소 증가합니다.
- 팀이 상태 저장과 복원 규칙을 지켜야 합니다.

---

## 고려한 대안

### 1. Redux

- 강력하고 확장성이 높습니다.
- 현재 용도에는 보일러플레이트가 너무 많습니다.

---

### 2. Context API Only

- 내장 기능이라 도입이 쉽습니다.
- 잦은 업데이트에는 성능상 불리합니다.

---

### 3. Single State Store (All in Zustand)

- 상태 관리 구조를 이해하기는 쉬울 수 있습니다.
- 서버 데이터와의 동기화가 어려워집니다.
- 실행 중 상태와 페이지 로컬 세션을 구분하기 어려워집니다.

---

## 설계 원칙과의 정렬

이 전략은 다음 원칙과 정렬됩니다.

- 관심사 분리
- 각 데이터의 판단 기준을 한곳에 유지
- 최소한의 전역 상태
- 성능 최적화
- 페이지 워크플로우의 UX 연속성

---

## 요약

이 전략은 **서버 상태**, **클라이언트 상태**, **저장·복원하는 UI 상태(페이지 로컬 세션)**를
구분합니다.

구체적으로는 다음을 사용합니다.

- 백엔드 동기화에는 React Query
- 클라이언트 실행 중 상태에는 Zustand 또는 로컬 상태
- 현재 페이지 상태 저장에는 `sessionStorage`, URL로 접근할 필요가 있는 페이지에는
  URL 상태

이 구분은 운영 환경을 고려한 확장과 유지보수에 도움이 됩니다. 현재 구현에서 제외한
운영 환경용 기반 기능이 완성되었다는 뜻은 아닙니다.
