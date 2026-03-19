# Assignment Policy

## Goal

할당 시스템은 사전에 정의된 규칙을 기반으로 티켓을 적절한 담당자에게
**자동으로 라우팅**하여 수작업 개입을 줄이고 운영 효율을 높이도록 설계되었다.

이 시스템은 다음을 보장한다.

- 빠른 초기 응답
- 명확한 소유권
- 조정 비용 감소
- 확장 가능한 업무 분산

---

## Core Concept

할당은 기본적으로 **카테고리 기반(category-driven)** 으로 동작한다.

```id="r9h3zc"
Ticket -> Category -> Assignment Rule -> Assignee
```

카테고리는 책임 대상을 결정하는 **source of truth** 역할을 한다.

---

## Assignment Flow

```id="qz6t7a"
Ticket Created
-> Category Selected
-> (Optional) Approval Completed
-> Assignment Resolved
-> Assigned
-> Working
```

---

## Assignment Types

시스템은 여러 가지 할당 전략을 지원한다.

### 1. Auto Assignment (Default)

티켓은 카테고리 설정에 따라 자동으로 할당된다.

#### Example

```ts
assignmentRule = {
  type: "DEPARTMENT",
  departmentId: "IT_SUPPORT",
};
```

---

### 2. Direct Assignment

특정 사용자를 직접 담당자로 지정한다.

```ts
assignmentRule = {
  type: "EMPLOYEE",
  employeeId: "user_123",
};
```

---

### 3. Role-Based Assignment

직무 역할 또는 전문 분야를 기준으로 할당한다.

```ts
assignmentRule = {
  type: "JOB_FIELD",
  jobFieldId: "NETWORK_ENGINEER",
};
```

---

## Assignment Resolution

시스템은 rule type에 따라 담당자를 동적으로 해석한다.

### Resolution Logic

```ts
switch (assignmentRule.type) {
  case "EMPLOYEE":
    return employeeId;

  case "DEPARTMENT":
    return findAvailableUserInDepartment(departmentId);

  case "JOB_FIELD":
    return findQualifiedUser(jobFieldId);
}
```

---

## Assignment Timing

할당은 승인 절차가 필요한 경우 그 이후에 수행된다.

### Rules

- 승인이 존재하면:
  `Approved` 이후에 할당한다.
- 승인이 없으면:
  생성 직후 즉시 할당한다.

---

## Reassignment Policy

특정 조건에서는 티켓 재할당이 가능하다.

### Allowed Cases

- 작업량 균형 조정
- 잘못된 초기 할당 수정
- escalation 시나리오

### Restrictions

- 재할당 이력은 History에 기록되어야 한다.
- 소유권은 항상 명확해야 한다.

---

## Assignment During Working State

티켓이 `Working` 상태에 들어간 이후에도 재할당은 가능하다.

### Requirements

- 명시적으로 트리거되어야 한다.
- 반드시 기록되어야 한다.
- UI는 변경 사항을 즉시 반영해야 한다.

---

## Fallback Strategy

할당을 해석할 수 없는 경우에는 fallback 전략이 필요하다.

### Options

1. 기본 fallback 사용자에게 할당
2. 팀 큐에 할당
3. 시스템 알림 발생

### Example

```ts
if (!assignee) {
  assignTo("DEFAULT_SUPPORT_QUEUE");
}
```

---

## Load Distribution Strategy

업무가 불균형하게 쏠리지 않도록 할당 시 분산 로직을 적용할 수 있다.

### Strategies

- Round-robin
- Least-loaded user
- Skill-based selection

### Example

```ts
findAvailableUserInDepartment(departmentId, {
  strategy: "least_loaded",
});
```

---

## Manual Override

충분한 권한이 있는 사용자는 자동 할당을 수동으로 덮어쓸 수 있다.

### Use Cases

- 긴급 처리
- 특수 사례
- VIP 요청

---

## UI Considerations

### Assignment Visibility

- 담당자는 명확하게 표시되어야 한다.
- 할당 이력은 쉽게 접근 가능해야 한다.

---

### Assignment Actions

- Assign
- Reassign
- Unassign (optional)

---

### Feedback

- 사용자는 할당 변경 사항을 실시간으로 확인할 수 있어야 한다.

---

## Edge Cases

### 1. No Available Assignee

- 모든 사용자가 부재 중이거나 필터링되어 선택할 수 없는 경우
  fallback 전략이 필요하다.

---

### 2. Multiple Eligible Assignees

- 시스템은 분산 전략을 적용해야 한다.

---

### 3. Invalid Category Configuration

- assignment rule이 누락된 경우
  시스템 fallback 또는 validation error가 필요하다.

---

### 4. Reassignment Conflicts

- 여러 재할당 시도가 동시에 발생하는 경우
  last-write wins 정책 또는 locking 제어가 필요하다.

---

## Trade-offs

### Pros

- 수작업 부담을 줄인다.
- 일관된 라우팅을 보장한다.
- 조직 규모가 커져도 확장 가능하다.
- 자동화를 가능하게 한다.

---

### Cons

- 정확한 설정이 필요하다.
- 해석 로직이 복잡해질 수 있다.
- 규칙이 잘못되면 오할당 가능성이 있다.

---

## Alternatives Considered

### 1. Manual Assignment Only

- 구현은 단순하다.
- 운영 부담이 크다.
- 응답 속도가 느려질 수 있다.

---

### 2. First-Responder Assignment

- 먼저 티켓을 집은 사람이 담당자가 된다.
- 업무 분산이 예측 불가능해진다.

---

### 3. Fixed Assignment per Category

- 항상 같은 사용자에게 할당한다.
- 확장성이 떨어진다.
- 병목이 발생하기 쉽다.

---

## Design Principles Alignment

이 정책은 다음 시스템 원칙과 정렬된다.

- 카테고리 기반 워크플로우
- 설정 가능한 동작
- 운영 효율성
- 명확한 소유권

---

## Summary

할당 시스템은 **유연하고 자동화된 라우팅 메커니즘**을 제공하여,
적절한 시점에 적절한 사람이 티켓을 처리하도록 만들고,
동시에 확장성, 일관성, 운영 명확성을 유지한다.
