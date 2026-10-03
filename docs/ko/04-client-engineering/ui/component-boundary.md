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

- 데이터 조회와 변경 요청 처리 순서 조정
- UI와 업무 상태 조합
- 권한·도메인 규칙·API 결과를 표시용 컴포넌트의 props로 변환
- 로딩·오류·빈 결과 상태 관리

---

### 특징

- Server Component에서는 서버에서 실행 가능한 로더·서비스를, Client Component에서는 기능 훅을 호출합니다
- 업무 흐름의 규칙과 기대 동작을 이해하고 도메인 규칙을 사용합니다
- props를 통해 하위 컴포넌트에 데이터를 전달합니다

컨테이너는 업무 흐름을 조정하지만 도메인 규칙, 권한 정책, 저장 동작 자체를 정의하지
않습니다. 규칙의 결과를 선택하고 표시할 수는 있지만 JSX나 이벤트 처리 함수에서
그 규칙을 다시 구현하면 안 됩니다.

---

### 예시

```tsx
export function TicketList() {
  const { data = [] } = useFetchTickets();

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
- 표시용 값 계산, 서식 변환, 배지·스타일 선택, 접근성 동작, 로컬 열림·닫힘 상태,
  UI 이벤트 콜백을 가질 수 있습니다
- 업무 흐름, 저장, 권한 규칙 자체는 담당하지 않습니다

표시용 컴포넌트가 담당하면 안 되는 책임의 예:

- 직접 API 호출 또는 저장 데이터 변경
- 최종 권한 판단
- 티켓 상태 전환 또는 승인자·작업자 결정
- React Query 서버 상태 관리

---

### 예시

```tsx
export function TicketItem({ ticket }) {
  return <div>{ticket.subject}</div>;
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

- 표시용 컴포넌트는 API를 직접 호출하지 않습니다
- 컴포넌트 트리의 깊이만으로 데이터 조회 가능 여부를 결정하지 않습니다
- 중첩된 하위 트리도 독립 컨테이너로 역할이 명확하고 자체 조회·로딩·오류 처리 흐름을
  가진 경우에는 데이터를 관리할 수 있습니다

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

- Server Component는 서버에서 실행 가능한 로더·서비스·업무 함수를 통해 렌더링 데이터를 조회할 수 있습니다
- 사용자 조작을 처리하는 Client Component 컨테이너는 기능 훅과 React Query를 사용합니다
- 독립적으로 로딩되는 위젯이나 Suspense 하위 트리는 자체 컨테이너를 가질 수 있습니다
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
<TicketItem subject={ticket.subject} status={ticket.status} />
```

---

### 객체 자체가 컴포넌트 계약인 경우

```tsx
<TicketItem ticket={ticket} />
```

객체 prop 자체를 안티패턴으로 보지 않습니다. 하위 컴포넌트에 필요한 필드가
소수라면 구체적인 prop을 사용합니다. 도메인 객체 전체가 컴포넌트에 필요한 입력이라면
객체 prop을 사용할 수 있습니다.

---

### 트레이드오프

| 방식 | 장점 | 단점 |
| -------------- | -------------- | ------------- |
| 개별 props | 필요한 입력이 명확함 | 선언이 길어짐 |
| 객체 props | 입력 구성이 유연함 | 사용하는 필드가 덜 명확함 |

---

## 상태 배치 전략

### 규칙

```txt
State should live in the lowest common owner that needs it
```

---

### 예시

- 다이얼로그 열림 상태 → 기본적으로 컴포넌트·컨테이너의 로컬 상태
- 필터 상태 → 화면 이동에 사용하면 URL, 그 외에는 해당 컨테이너
- 폼 입력·검증 상태 → 해당 폼의 React Hook Form
- 사용자 조작으로 조회·변경하는 서버 상태 → React Query

서로 무관하거나 멀리 떨어진 클라이언트 하위 트리가 같은 실행 중 상태를 공유할 때만
Zustand를 사용합니다. 콜백 하나를 전달하지 않으려고 다이얼로그 로컬 상태를 전역으로
옮기거나 React Query 데이터를 Zustand에 복사하지 않습니다.

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

`"use client"`는 클라이언트에서 실행할 모듈과 그 의존성의 진입점을 지정합니다.
모든 하위 파일에 반복할 필요는 없습니다. 사용자 조작을 처리하는 하위 트리를 가능한
작게 유지하고, `client-only`와 `server-only`로 실행 환경이 맞지 않는 import를 차단합니다.

Server Component에서 Client Component로 전달하기 전에 실행 환경에 종속된 값을
직렬화 가능한 형식으로 변환합니다.

| 경계 값 | 지침 |
| --- | --- |
| DTO, string, number, boolean, serializable array/object, ISO date string | 그대로 전달 |
| `Date`, `Map`, `Set`, database row | 애플리케이션에서 사용하는 직렬화 가능한 값으로 변환 |
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

재사용 횟수만으로 담당 위치를 정하지 않습니다. 범용 버튼, 다이얼로그 기본 컴포넌트,
테이블 틀은 공통 컴포넌트에 둘 수 있습니다. 티켓 상태 화면, 승인 편집기, 배정 규칙
카드는 Service Desk 안에 유지합니다.

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

여러 기능을 조합하는 UI는 `app` 또는 전역 `components` 위젯에서 담당합니다.
밀접한 업무 모듈은 `feature-based-structure.md`에 정의된 공개 형식과 규칙을 실행
환경에 맞게 사용할 수 있습니다. 다만 업무 담당 기능이 명확하지 않은 상태에서 다른
모듈의 내부 컴포넌트나 클라이언트 훅을 import하도록 허용하지는 않습니다.

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

이 전략은 **업무 흐름을 조정하는 컨테이너**와 **표시 및 로컬 상호작용을 담당하는
표시용 컴포넌트**를 구분합니다. 표시용 컴포넌트는 화면 표시 로직을 가질 수 있지만,
도메인, 저장, 권한, 서버 상태 규칙은 해당 역할을 담당하는 계층에 둡니다.
