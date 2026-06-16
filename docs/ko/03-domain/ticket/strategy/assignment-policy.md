# 할당 정책

## 목적

할당 시스템은 사전에 정의된 규칙에 따라 티켓을 적절한 담당자에게
**자동으로 라우팅** 하도록 설계되었으며,
수동 개입을 줄이고 운영 효율을 높이는 것을 목표로 한다.

이 시스템은 다음을 보장한다.

- 빠른 초기 대응
- 명확한 소유권
- 협업 조정 비용 감소
- 확장 가능한 업무 분배

---

Scope note:

- LOCAL demo는 단순화된 role-aware/relationship 기반 권한 규칙을 사용한다.
- 조직/부서/job-field 기반 full rule resolution은 REMOTE 확장 경로다.

## 핵심 개념

할당은 기본적으로 **카테고리 중심(category-driven)** 으로 결정된다.

```txt
Ticket -> Category -> Assignment Rule -> Assignee
```

카테고리는 책임 대상을 결정하는 **단일 기준(source of truth)** 으로 동작한다.
category 자체는 tenant-scoped이므로 assignment rule은 선택된 tenant의
Service Desk configuration 안에서 해석된다.

---

## 할당 흐름

```txt
Ticket Created
-> Category Selected
-> (Optional) Approval Completed
-> Assignment Resolved
-> Assigned
-> Working
```

---

## 할당 유형

시스템은 여러 가지 할당 전략을 지원한다.

### 1. 자동 할당 (기본)

티켓은 카테고리 설정에 따라 자동으로 할당된다.
이 설정은 tenant-scoped이며, 단순화된 흐름을
`Ticket -> Category -> Assignment Rule -> Assignee`로 표현하더라도 동일하다.

#### 예시

```ts
assignmentRule = {
  type: "DEPARTMENT",
  departmentId: "IT_SUPPORT",
};
```

---

### 2. 직접 할당

특정 사용자를 직접 지정하여 할당한다.

```ts
assignmentRule = {
  type: "EMPLOYEE",
  employeeUsername: "user_123",
};
```

---

### 3. 역할 기반 할당

직무 역할이나 전문 분야에 따라 할당한다.

```ts
assignmentRule = {
  type: "JOB_FIELD",
  jobFieldId: "NETWORK_ENGINEER",
};
```

---

## 할당 해석

시스템은 규칙 유형에 따라 담당자를 동적으로 결정한다.

### 해석 로직

```ts
switch (assignmentRule.type) {
  case "EMPLOYEE":
    return employeeUsername;

  case "DEPARTMENT":
    return findAvailableUserInDepartment(departmentId);

  case "JOB_FIELD":
    return findQualifiedUser(jobFieldId);
}
```

---

## 할당 시점

할당은 승인 필요 여부에 따라 다른 시점에 이루어진다.

### 규칙

- 승인 절차가 있는 경우:
  - `Approved` 이후에 할당한다.
- 승인이 필요 없는 경우:
  - 생성 직후 즉시 할당한다.

---

## 재할당 정책

특정 조건에서는 티켓을 재할당할 수 있다.

### 허용되는 경우

- 업무량 균형 조정
- 잘못된 초기 할당
- 에스컬레이션 상황

### 제한 사항

- 재할당은 History에 기록되어야 한다.
- 소유권은 항상 명확해야 한다.

---

## Working 상태에서의 할당

티켓이 `Working` 상태에 들어간 뒤에도 재할당은 가능하다.

### 요구사항

- 명시적으로 실행되어야 한다.
- 로그로 남아야 한다.
- UI는 변경 내용을 즉시 반영해야 한다.

---

## 대체 전략

할당 대상을 결정할 수 없는 경우 다음과 같은 대체 전략을 사용할 수 있다.

### 옵션

1. 기본 대체 사용자에게 할당
2. 팀 큐에 할당
3. 시스템 알림 발생

### 예시

```ts
if (!assignee) {
  assignTo("DEFAULT_SUPPORT_QUEUE");
}
```

---

## 업무 분배 전략

편중된 업무 분배를 방지하기 위해 할당 단계에 분배 로직을 포함할 수 있다.

### 전략 예시

- 라운드 로빈
- 가장 적게 배정된 사용자
- 스킬 기반 선택

### 예시

```ts
findAvailableUserInDepartment(departmentId, {
  strategy: "least_loaded",
});
```

---

## 수동 오버라이드

충분한 권한을 가진 사용자는 자동 할당 결과를 수동으로 변경할 수 있다.

### 사용 사례

- 긴급 처리
- 특수한 케이스
- VIP 요청

---

## UI 고려사항

### 할당 가시성

- 담당자는 명확하게 표시되어야 한다.
- 할당 이력은 조회할 수 있어야 한다.

---

### 할당 액션

- 할당
- 재할당
- 할당 해제(선택)

---

### 피드백

- 사용자는 할당 변경 사항을 실시간으로 확인할 수 있어야 한다.

---

## 예외 상황

### 1. 사용 가능한 담당자 없음

- 모든 사용자가 부재 중이거나 필터링된 경우:
  - 대체 전략이 필요하다.

---

### 2. 적격 담당자가 여러 명인 경우

- 시스템은 분배 전략을 적용해야 한다.

---

### 3. 잘못된 카테고리 설정

- 할당 규칙이 누락된 경우:
  - 시스템 대체 처리 또는 검증 에러가 필요하다.

---

### 4. 재할당 충돌

- 여러 번의 재할당 시도가 동시에 발생한 경우:
  - 마지막 쓰기 우선(last-write wins) 또는 락 기반 제어가 필요하다.

---

## 트레이드오프

### 장점

- 수작업 부담을 줄인다.
- 일관된 라우팅을 보장한다.
- 조직 규모가 커져도 확장 가능하다.
- 자동화를 지원한다.

---

### 단점

- 정확한 설정이 필요하다.
- 담당자 결정 로직이 복잡해질 수 있다.
- 규칙이 잘못되면 잘못된 할당이 발생할 수 있다.

---

## 대안 검토

### 1. 수동 할당만 사용하는 방식

- 구현은 단순하다.
- 운영 부담이 크다.
- 응답 속도가 느려질 수 있다.

---

### 2. 선점자 할당 방식

- 먼저 티켓을 가져간 사람이 담당자가 된다.
- 업무 분배가 예측 불가능해진다.

---

### 3. 카테고리별 고정 담당자 방식

- 항상 같은 사용자에게 할당한다.
- 확장성이 떨어진다.
- 병목을 유발할 수 있다.

---

## 설계 원칙과의 정렬

이 정책은 다음 시스템 원칙과 정렬된다.

- 카테고리 중심 워크플로
- 구성 가능한 동작
- 운영 효율성
- 명확한 소유권

---

## 요약

할당 시스템은 **유연하고 자동화된 라우팅 메커니즘**을 제공하여,
적절한 시점에 적절한 사람에게 티켓이 전달되도록 한다.

이를 통해 시스템은 확장성, 일관성, 운영 명확성을 유지하면서도
실질적인 업무 흐름을 지원할 수 있다.
