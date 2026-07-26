# Category 설계 결정 (2026-01)

## Context

Category 시스템은 Service Desk 시스템의 중앙 설정 계층이다.

이 계층은 다음을 정의한다.

- 할당 동작
- SLA 계산
- 승인 필요 여부
- 기본 우선순위와 위험도

초기 category 설계는 다음과 같은 **계층 구조**를 중심으로 구성되었다.

```txt
Client -> MainCategory -> SubCategory
```

그리고 `SubCategory`가 `MainCategory`의 값을 재정의하도록 설계되었다.

하지만 구현과 티켓 워크플로 통합 과정에서 다음과 같은 실질적인 질문이 생겼다.

- category가 얼마나 엄격하게 source of truth 역할을 해야 하는가
- 티켓 레벨에서 어느 정도의 유연성을 허용해야 하는가
- 설정 기반 동작과 런타임 재정의를 어떻게 균형 있게 가져갈 것인가

---

## Problem

### 1. Category가 티켓 동작을 완전히 결정해야 하는가?

- 할당, SLA, 승인, 우선순위, 위험도는 모두 category에서 파생된다
- 이는 강한 **category-driven 시스템**을 만든다

하지만:

- 모델이 너무 엄격하면 현실적인 예외를 처리하기 어렵다
- 모델이 너무 유연하면 시스템 일관성이 무너진다

---

### 2. Override는 어디까지 허용해야 하는가?

두 가지 접근이 검토되었다.

#### Option A. 엄격한 Category-Driven 모델

```txt
Category = 단일 source of truth
Ticket = override 없음
```

**장점**

- 강한 일관성
- 예측 가능한 동작
- 감사 추적이 쉬움

**단점**

- 유연성이 낮음
- 운영상의 예외 처리가 어려움

---

#### Option B. Category를 기본값으로 두고 Ticket Override 허용

```txt
Category = 기본 설정
Ticket = 선택적 override
```

**장점**

- 유연함
- 실제 운영 상황에 더 잘 맞음

**단점**

- 일관되지 않은 동작이 생길 위험이 높음
- 최종 규칙 체계를 추론하기 더 어려움

---

## Decision

**하이브리드 모델**을 채택한다.

```txt
Category = 기본 설정 계층
Ticket = 제어된 override 계층
```

---

### 1. Category는 여전히 기반이 된다

기본적으로 다음 값들은 category에서 파생된다.

- 할당
- SLA
- 승인
- 우선순위
- 위험도

이 결정은 category-driven 워크플로 원칙을 유지한다.

---

### 2. Override는 허용하되, 통제되어야 한다

티켓 레벨 override는 다음 조건을 만족할 때만 허용한다.

- 비즈니스 로직상 명시적으로 필요해야 한다
- UI에 드러나야 한다
- 히스토리에서 추적 가능해야 한다

예시:

- 우선순위 조정
- 담당자 재할당
- 선택적 SLA 재계산

---

### 3. Override 계층 구조는 명확하게 유지한다

Category 계층 구조 자체는 바뀌지 않는다.

```txt
SubCategory > MainCategory
```

여기에 티켓 레벨 override가 도입되면 최종 해석 순서는 다음과 같다.

```txt
Ticket > SubCategory > MainCategory
```

---

### 4. Override는 반드시 추적 가능해야 한다

모든 override는 다음을 만족해야 한다.

- 히스토리에 기록되어야 한다
- 수행자(actor)와 사유(reason)를 포함해야 한다

이렇게 해야 override 동작이 암묵적이지 않고 감사 가능하게 유지된다.

---

### 5. UI는 Override 상태를 명확히 보여줘야 한다

- category에서 파생된 기본값은 계속 보이도록 해야 한다
- override된 값은 기본값과 구분 가능해야 한다

예시:

- `기본 SLA: 3일`
- `Override된 SLA: 5일 (수동)`

---

## Rationale

이 결정은 시스템의 세 가지 성질 사이의 균형을 맞춘다.

### Consistency

- category가 여전히 기본 워크플로를 결정한다
- 티켓의 핵심 동작이 예측 가능하게 유지된다

---

### Flexibility

- 현실적인 예외 상황을 처리할 수 있다
- 운영자가 지나치게 경직된 설정 때문에 막히지 않는다

---

### Auditability

- override는 명시적이다
- 의미 있는 변경은 계속 드러나고 검토 가능하다

---

## Trade-offs

### 장점

- 유연하지만 통제된 시스템 동작
- 실제 운영 환경에 더 잘 맞음
- category-driven 아키텍처를 유지함

---

### 단점

- 시스템 복잡도가 증가함
- 명확한 UI 설계가 필요함
- 엄격한 히스토리 추적이 필요함

---

## Alternatives Considered

### 1. 완전히 Category-Driven 모델 (Override 없음)

- 단순하고 예측 가능함
- 실제 운영에는 너무 경직됨

---

### 2. 완전히 동적인 Ticket 구성

- 유연성이 최대화됨
- 시스템 일관성을 해침
- 유지보수와 감사가 어려움

---

## Impact

### Category 전략에 대한 영향

- `category-strategy.md`에 구조적 변경은 필요하지 않다
- 현재 category 모델은 개념적으로 이미 이 방향을 지원하고 있다

---

### Ticket 시스템에 대한 영향

- 티켓 모델은 override 필드를 지원해야 한다
- 히스토리 추적이 핵심 인프라가 된다

---

### UI/UX에 대한 영향

- 기본값과 override된 값은 명확히 구분되어야 한다
- 폼과 상세 화면은 override 상태를 의도적으로 드러내야 한다

---

## Summary

시스템은 **category-driven이지만 override가 가능한 모델**을 채택한다.

- Category가 기본 동작을 정의한다
- Ticket은 통제된 override를 허용한다
- 모든 override는 명시적이어야 하며 추적 가능해야 한다

이를 통해 시스템은 다음 특성을 유지한다.

- 일관성
- 유연성
- 감사 가능성

즉, category-driven 설계의 핵심 원칙을 훼손하지 않으면서도
현실적인 운영 요구를 수용할 수 있게 된다.
