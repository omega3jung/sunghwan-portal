# Category Strategy

## Goal

카테고리 시스템은 시스템 전반에서 티켓의 동작을 결정하는
**중앙 설정 계층(central configuration layer)** 으로 작동하도록 설계되었다.

카테고리는 다음 요소를 결정한다.

- 티켓 할당
- 우선순위와 위험 수준
- SLA (Service Level Agreement)
- 승인 필요 여부
- 책임 팀

목표는 카테고리 중심 아키텍처를 통해
**일관되고, 확장 가능하며, 유지보수 가능한 운영 체계**를 만드는 것이다.

---

## Core Concept

카테고리는 **계층형 트리 구조**로 설계된다.

```txt
Client -> MainCategory -> SubCategory
```

각 계층은 티켓 동작을 정의하는 데 서로 다른 역할을 맡는다.

---

## Category Hierarchy

### 1. Client

- 테넌트(조직 또는 고객)를 나타낸다.
- 서로 다른 클라이언트 간 완전한 격리를 보장한다.

---

### 2. MainCategory

- **기본 운영 규칙(default operational rules)** 을 정의한다.
- 베이스 설정 계층 역할을 한다.

```ts
type MainCategory = {
  id: string;
  defaultPriority: Priority;
  defaultRiskLevel: RiskLevel;
  defaultSlaDays: number;
  active: boolean;
};
```

---

### 3. SubCategory

- MainCategory 설정을 세분화하거나 override한다.
- 더 구체적인 비즈니스 사례를 표현한다.

```ts
type SubCategory = {
  id: string;
  overridePriority?: Priority;
  overrideRiskLevel?: RiskLevel;
  overrideSlaDays?: number;
  active: boolean;
};
```

---

## Override Strategy

SubCategory 값은 MainCategory 기본값보다 우선한다.

### Rule

```txt
SubCategory > MainCategory
```

### Resolution Logic

```ts
priority = sub.overridePriority ?? main.defaultPriority;
riskLevel = sub.overrideRiskLevel ?? main.defaultRiskLevel;
sla = sub.overrideSlaDays ?? main.defaultSlaDays;
```

### Purpose

- 설정을 중복하지 않고도 세밀한 제어를 가능하게 한다.
- 유연성을 유지하면서도 전체 일관성을 보장한다.

---

## Category ID Policy

모든 category ID는 **숫자의 문자열 표현(string representation of numbers)** 으로 저장한다.

### Example

```txt
"12", "203"
```

### Rationale

- 데이터베이스 제약과 호환된다.
- 숫자 연산이 필요할 때 안전하게 파싱할 수 있다.
- 시스템 간 의도치 않은 타입 불일치를 방지한다.

---

## Active Policy

카테고리는 **삭제하지 않는다**.

대신 다음과 같이 비활성화한다.

```txt
active = false
```

### Behavior

- 새 티켓에서는 선택할 수 없다.
- 기존 티켓은 계속 유효하다.

### Purpose

- 이력 무결성을 보존한다.
- 리포팅 일관성을 유지한다.
- 끊어진 참조를 방지한다.

---

## Category-Driven Assignment

티켓 할당은 기본적으로 카테고리 설정에 의해 결정된다.

### Responsibilities Defined by Category

- 책임 팀
- 기본 담당자(optional)
- 워크플로우 소유권

### Flow

```txt
Ticket created -> Category selected -> Assignment resolved
```

---

## Category-Driven SLA

SLA는 카테고리 설정을 기준으로 계산된다.

### Rule

```txt
dueDate = createdDate + SLA
```

### Resolution

- SubCategory SLA가 MainCategory SLA보다 우선한다.
- 정의되어 있지 않으면 MainCategory를 fallback으로 사용한다.

---

## Category-Driven Approval

승인 워크플로우도 카테고리별로 정의된다.

```txt
Category -> approvalSteps[]
```

### Behavior

- 어떤 카테고리는 승인이 필요하다.
- 어떤 카테고리는 승인 절차를 완전히 생략할 수 있다.

### Purpose

- 비즈니스 요구에 맞게 워크플로우 복잡도를 조절한다.
- 불필요한 승인 절차를 줄인다.

---

## UI Considerations

### Category Selection

- 계층형 선택기(Main -> Sub)를 사용한다.
- 선택 가능한 대상은 active 상태의 카테고리로 제한한다.

---

### Default Value Application

카테고리를 선택하면 다음 값이 자동으로 채워져야 한다.

- Priority
- Risk level
- SLA

허용되는 경우 사용자가 값을 override할 수 있다.

---

### Disabled Categories

- 비활성 카테고리는 선택 목록에 나타나지 않아야 한다.
- 기존 티켓에서는 해당 카테고리가 계속 표시되어야 한다.

---

## Edge Cases

### 1. Missing SubCategory

- MainCategory만 선택된 경우:
  MainCategory 기본값을 사용한다.

---

### 2. Partial Overrides

- SubCategory가 일부 값만 정의한 경우:
  나머지 값은 MainCategory에서 상속한다.

---

### 3. Category Deactivation

- 이미 사용 중인 카테고리가 inactive가 된 경우:
  기존 티켓은 그대로 유지되어야 한다.

---

## Trade-offs

### Pros

- 설정이 중앙화된다.
- 티켓 전반의 높은 일관성을 유지할 수 있다.
- 유연한 override 메커니즘을 제공한다.
- 대규모 조직에서도 확장 가능하다.

---

### Cons

- 카테고리 설계 복잡도가 증가한다.
- 잘못된 설정이 여러 워크플로우에 영향을 줄 수 있다.
- 거버넌스와 관리 체계가 필요하다.

---

## Alternatives Considered

### 1. Flat Category Structure

- 구현은 더 단순하다.
- 복잡한 비즈니스 규칙을 지원하기 어렵다.

---

### 2. Hardcoded Ticket Rules

- 초기 구현은 쉽다.
- 확장성과 유지보수성이 떨어진다.

---

### 3. Fully Dynamic Per-Ticket Configuration

- 유연성은 가장 높다.
- 동작 일관성이 무너지고 사용자 부담이 커진다.

---

## Design Principles Alignment

이 전략은 다음 시스템 원칙과 정렬된다.

- 카테고리 기반 워크플로우
- 설정 가능한 동작
- 파괴적 삭제 금지
- 일관된 운영 규칙

---

## Summary

카테고리 시스템은 **전체 티켓 워크플로우의 기반** 으로 작동하며,
계층형 override 구조를 통해 유연성을 유지하면서도
모든 티켓에 대해 확장 가능하고 일관되며 설정 가능한 동작을 가능하게 한다.
