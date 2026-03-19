# Approval System

## Goal

승인 시스템은 실행 전에 추가 검증이 필요한 티켓을 위해
**설정 가능하고 확장 가능한 검증 파이프라인**을 제공하도록 설계되었다.

이 시스템은 다음을 보장한다.

- 정책 준수
- 중복 방지
- 조직 기준 검증
- 운영 리스크 감소

---

## Core Concept

승인은 **카테고리 기반(category-driven)** 으로 결정되며,
**순차적인 파이프라인(sequential pipeline)** 으로 실행된다.

각 카테고리는 자신만의 승인 워크플로우를 정의할 수 있다.

```txt
Category -> approvalSteps[]
```

각 단계는 `index` 값을 기준으로 순서대로 처리된다.

---

## Approval Flow

```txt
Pre -> Open -> Approved / Declined -> Working
```

### Status Definitions

- **Pre**: 티켓은 생성되었지만 승인 절차는 아직 시작되지 않은 상태
- **Open**: 승인 절차가 진행 중인 상태
- **Approved**: 모든 승인 단계가 성공적으로 완료된 상태
- **Declined**: 어느 한 승인 단계에서 거절된 상태

---

## Data Structure

### ApprovalSteps

```ts
type ApprovalStep = {
  index: number;
  assigneeType: "MANAGER" | "DEPARTMENT" | "JOB_FIELD" | "EMPLOYEE";
  payload: Record<string, unknown>;
  skipAccessLevel?: number;
};
```

---

## Assignee Types

각 승인 단계는 승인자를 동적으로 결정한다.

### 1. MANAGER

요청자의 매니저에게 승인을 할당한다.

```ts
payload: {
  level: 1 | 2;
}
```

- `1`: 직속 매니저
- `2`: 상위 매니저

---

### 2. DEPARTMENT

특정 부서에 승인을 할당한다.

```ts
payload: {
  departmentId: string;
}
```

---

### 3. JOB_FIELD

직무 전문 분야를 기준으로 승인을 할당한다.

```ts
payload: {
  jobFieldId: string;
}
```

---

### 4. EMPLOYEE

특정 개인에게 승인을 할당한다.

```ts
payload: {
  employeeIds: string[];
}
```

---

## Execution Rules

### 1. Sequential Processing

- 각 단계는 `index` 오름차순으로 실행된다.
- 현재 단계가 승인되어야만 다음 단계가 시작된다.

---

### 2. Early Termination

- 어느 한 단계라도 **declined** 되면 전체 승인 프로세스는 즉시 중단된다.
- 티켓 상태는 `Declined`가 된다.

---

### 3. Completion

- 모든 단계가 승인되면 티켓 상태는 `Approved`가 된다.
- 이후 티켓은 assignment 단계로 이동한다.

---

## Skip Policy

요청자의 권한 수준에 따라 일부 승인 단계는 자동으로 건너뛸 수 있다.

### Rule

```txt
if requester.accessLevel >= skipAccessLevel
-> skip this step
```

### Purpose

- 고권한 사용자에게 불필요한 승인 절차를 줄인다.
- 워크플로우 효율을 높인다.
- 긴급 상황에서 병목을 줄인다.

---

## Example Scenario

### Case: IT Request with Manager Approval

```ts
approvalSteps = [
  {
    index: 1,
    assigneeType: "MANAGER",
    payload: { level: 1 },
  },
  {
    index: 2,
    assigneeType: "DEPARTMENT",
    payload: { departmentId: "IT" },
  },
];
```

### Flow

1. 직속 매니저가 승인한다.
2. IT 부서가 검증한다.
3. 티켓 상태는 `Approved`가 된다.

---

## UI Considerations

- 승인 단계는 **progress timeline** 형태로 보여야 한다.
- 각 단계에는 다음 정보가 표시되어야 한다.
  - assignee
  - status (pending / approved / declined)
  - timestamp

- 건너뛴 단계는 **"skipped"** 로 명시적으로 표시되어야 한다.

---

## Audit & History

모든 승인 활동은 History 모델에 기록되어야 한다.

### Recorded Data

- approvalStep index
- assignee
- action (approved / declined / skipped)
- timestamp
- note (optional)

### Purpose

- 전체 추적 가능성 확보
- 컴플라이언스 및 감사 대응
- 워크플로우 문제 디버깅

---

## Edge Cases

### 1. Missing Assignee

- 승인자를 해석할 수 없는 경우:
  fallback 처리 또는 시스템 알림이 필요하다.

---

### 2. Parallel Approval (Not Supported)

- 현재 설계는 순차 승인만 지원한다.
- 단순성을 위해 병렬 승인은 의도적으로 제외했다.

---

### 3. Dynamic Organization Changes

- 승인 진행 중 조직 구조가 바뀌더라도:
  승인은 현재 시점의 조직 상태를 기준으로 해석되어야 한다.

---

## Trade-offs

### Pros

- 매우 유연하고 설정 가능하다.
- 복잡한 조직 구조를 지원할 수 있다.
- 명확한 감사 추적 경로를 제공한다.

### Cons

- 설정 복잡도가 높아진다.
- 순차 흐름 특성상 지연이 발생할 수 있다.
- 정확한 조직 데이터가 필요하다.

---

## Alternatives Considered

### 1. No Approval System

- 구현은 단순하다.
- 엔터프라이즈 워크플로우에는 적합하지 않다.

---

### 2. Hardcoded Approval Logic

- 구현은 더 쉽다.
- 확장성과 유지보수성이 떨어진다.

---

### 3. Parallel Approval

- 처리 속도는 빨라질 수 있다.
- 결과 해석 복잡도와 모호성이 증가한다.

---

## Design Principles Alignment

이 시스템은 프로젝트의 핵심 원칙과 정렬된다.

- 카테고리 기반 워크플로우
- 설정 가능한 파이프라인
- 완전한 감사 추적
- 비파괴적 운영

---

## Summary

승인 시스템은 조직의 요구사항에 맞춰 동작하면서도
일관성과 통제를 유지할 수 있도록 하는
**유연하고, 감사 가능하며, 확장 가능한 검증 메커니즘**을 제공한다.
