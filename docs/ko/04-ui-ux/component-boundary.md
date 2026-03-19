# 컴포넌트 경계

## 목표

컴포넌트 경계 전략은 **컴포넌트 간 책임을 명확하게 분리**하여,
유지보수성, 재사용성, 그리고 예측 가능한 데이터 흐름을 보장하기 위해 설계된다.

이 전략의 목적은 다음과 같다.

- 컴포넌트 간 결합도 감소
- 재사용성 향상
- 테스트 단순화
- 데이터 소유권 명확화

---

## 핵심 원칙

```id="boundary-principle"
Components should have a single responsibility
```

---

## 컴포넌트 유형

시스템은 컴포넌트를 두 가지 주요 유형으로 구분한다.

1. **Container Components**
2. **Presentational Components**

---

## 1. 컨테이너 컴포넌트

### 정의

다음 책임을 가지는 컴포넌트이다.

- 데이터 조회
- 상태 관리
- 비즈니스 로직 오케스트레이션

---

### 특징

- 훅을 사용한다 (`React Query`, `Zustand`)
- API와 도메인 로직을 이해한다
- props를 통해 하위 컴포넌트에 데이터를 전달한다

---

### 예시

```tsx id="container-example"
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

다음 책임을 가지는 컴포넌트이다.

- UI 렌더링
- 사용자 상호작용 처리 (UI 수준에 한정)

---

### 특징

- props를 통해 데이터를 전달받는다
- 직접 데이터를 조회하지 않는다
- 비즈니스 로직을 포함하지 않는다

---

### 예시

```tsx id="presentational-example"
export function TicketItem({ ticket }) {
  return <div>{ticket.title}</div>;
}
```

---

## 경계 규칙

### 규칙

```id="boundary-rule"
Data flows from container -> presentational components via props
```

---

### 의미

- 프레젠테이셔널 컴포넌트 내부에서는 데이터를 조회하지 않는다
- 깊게 중첩된 UI 컴포넌트에서 API 호출을 하지 않는다

---

## 기능 단위 경계

이 경계는 **feature 수준**에서 적용된다.

---

### 규칙

```id="feature-boundary"
Feature entry components handle data fetching
```

---

### 예시 구조

```bash id="feature-boundary-structure"
TicketList (container)
  -> TicketItem (presentational)
  -> TicketStatusBadge
  -> TicketActions
```

---

## 데이터 조회 전략

### 위치

- 항상 **컨테이너 컴포넌트 또는 feature hook 내부**에 둔다

---

### 이유

- 데이터 로직을 중앙화할 수 있다
- 캐싱과 재조회가 쉬워진다
- 중복 요청을 피할 수 있다

---

## Props 설계 전략

### 원칙

```id="props-principle"
Pass only what is needed
```

---

### 좋은 예시

```tsx id="good-props"
<TicketItem title={ticket.title} status={ticket.status} />
```

---

### 좋지 않은 예시

```tsx id="bad-props"
<TicketItem ticket={ticket} />
```

---

### 트레이드오프

| Approach       | Pros           | Cons          |
| -------------- | -------------- | ------------- |
| Specific props | Clear contract | More verbose  |
| Object props   | Flexible       | Less explicit |

---

## 상태 배치 전략

### 규칙

```id="state-placement"
State should live in the highest component that needs it
```

---

### 예시

- 다이얼로그 open 상태 -> 컴포넌트 또는 `Zustand`
- 필터 상태 -> URL 또는 컨테이너
- 폼 상태 -> `react-hook-form`

---

## 상호작용 처리

### 원칙

```id="interaction-principle"
UI handles interaction, container handles logic
```

---

### 예시

```tsx id="interaction-example"
<TicketItem onClick={handleSelectTicket} />
```

- `TicketItem`은 이벤트를 발생시킨다
- `TicketList`는 로직을 처리한다

---

## 재사용성 전략

### 프레젠테이셔널 컴포넌트

- 재사용성이 높다
- 여러 feature에서 공유할 수 있다

---

### 컨테이너 컴포넌트

- feature 전용이다
- 재사용을 목적으로 하지 않는다

---

## 의존성 규칙

### 허용

- Presentational -> Presentational
- Container -> Presentational

---

### 비허용

- Presentational -> Container
- feature 간 직접 의존

---

## 피하려는 안티패턴

### 1. UI 컴포넌트 내부의 데이터 조회

- 중복과 비일관성을 초래한다

---

### 2. 지나치게 똑똑한 컴포넌트

- UI와 비즈니스 로직이 혼합된다

---

### 3. 과도한 Prop Drilling

- 불필요한 데이터를 여러 계층에 걸쳐 전달하게 된다

---

### 4. 전역 상태 남용

- 지역 UI 상태에 `Zustand`를 사용하는 문제를 낳는다

---

## 트레이드오프

### 장점

- 관심사가 명확하게 분리된다
- 테스트가 쉬워진다
- 재사용성이 향상된다
- 데이터 흐름을 예측하기 쉽다

---

### 단점

- 관리해야 할 컴포넌트 수가 늘어난다
- 보일러플레이트가 약간 증가한다
- 구조를 지키는 규율이 필요하다

---

## 고려한 대안

### 1. 완전한 Smart Component 방식

- 보일러플레이트가 적다
- 유지보수와 테스트가 어렵다

---

### 2. 완전한 Dumb Component 방식

- UI는 단순해진다
- 너무 많은 로직이 상위로 밀려 올라간다

---

### 3. 명확한 경계가 없는 방식

- 초기 개발 속도는 빠를 수 있다
- 장기적으로 복잡도가 급증한다

---

## 설계 원칙과의 정렬

이 전략은 다음 원칙과 정렬된다.

- 관심사 분리
- 컴포넌트 재사용성
- 예측 가능한 데이터 흐름
- 확장 가능한 UI 아키텍처

---

## 요약

컴포넌트 경계 전략은 **데이터를 인지하는 컨테이너 컴포넌트**와
**순수 UI 프레젠테이셔널 컴포넌트**를 명확히 구분함으로써,
확장 가능하고 유지보수 가능한 프런트엔드 아키텍처를 가능하게 한다.
