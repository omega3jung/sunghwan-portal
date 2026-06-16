# Ticket System Overview

## 목표

Ticket system은 요청, 승인, 실행 workflow를 구조적이고 추적 가능한 방식으로
관리하도록 설계되었습니다.

단순한 CRUD 기반 시스템과 달리, 다음에 초점을 둡니다.

- 일관된 workflow 실행
- 명확한 소유권과 책임
- 액션 중심의 커뮤니케이션과 운영
- 모든 액션의 완전한 감사 가능성
- 현실적인 작업 추적
- 사용자 중심 우선순위화

목표는 단순히 데이터를 저장하고 표시하는 것이 아니라,
실제 운영 프로세스를 반영하는 것입니다.

---

## 왜 단순 CRUD 시스템이 아닌가?

많은 티켓 시스템은 기본적으로 다음 흐름을 따릅니다.

```txt
Create -> Update -> Resolve -> Close
```

하지만 실제 환경에서는 이 접근만으로 부족해집니다.

- 요청 유형마다 다른 workflow가 필요합니다.
- 실행 전에 승인이 필요할 수 있습니다.
- 책임이 명확하게 할당되어야 합니다.
- SLA를 강제해야 합니다.
- 작업은 자주 중단되었다가 다시 이어집니다.

그 결과 CRUD 기반 시스템은 다음 문제를 낳습니다.

- 일관되지 않은 동작
- 불명확한 책임
- 실제 작업에 대한 낮은 가시성

이를 해결하기 위해, 시스템은 티켓을 workflow-driven entity로 모델링합니다.

---

## 핵심 원칙

시스템은 다음 원칙 위에 구축됩니다.

### 1. Category-Driven Behavior

Category는 단순 분류가 아닙니다.

다음을 정의합니다.

- assignment rules
- approval requirements
- SLA policies
- workflow structure

Service Desk behavior는 category와 settings configuration을 통해 tenant-scoped로
해석됩니다. Tenant는 configuration boundary를 제공하고, 그 tenant 안의
category가 ticket의 운영 동작을 결정합니다.

### 2. Approval as a First-Class Workflow

Approval은 lifecycle의 핵심 부분으로 다뤄집니다.

- category별로 설정 가능
- 구조화된 pipeline으로 실행
- 완전한 추적 가능성 보장

### 3. Session-Based Work Tracking

작업은 하나의 누적 값으로 저장되지 않습니다.

```txt
work = collection of sessions
```

이를 통해 다음이 가능해집니다.

- interruption
- resumption
- task switching

### 4. Work Context-Driven Prioritization

티켓은 평평한 목록으로만 표시되지 않습니다.

시스템은 work context를 도출하여 다음을 우선순위화합니다.

- currently active work
- assigned tickets
- actionable tickets
- contextual tickets

### 5. Full Auditability

모든 중요한 액션은 기록됩니다.

이를 통해 다음을 보장합니다.

- traceability
- accountability
- explainability

### 6. Action-Oriented Interaction Model

의미 있는 ticket interaction은 단순 comment가 아니라 activity로 모델링됩니다.

이를 통해 시스템은 다음을 표현할 수 있습니다.

- public communication
- internal notes
- assignment changes
- operational adjustments
- merge 및 rejection 결정
- 해결 이후 review/reopen 요청

관련 문서:

- [Ticket Activity Model](./ticket-activity.md)
- [Action Strategy](./strategy/action-strategy.md)

---

## 시스템 구조

Ticket system은 여러 도메인 컴포넌트로 구성됩니다.

```txt
Tenant
  -> Category
  -> Approval
  -> Assignment
  -> SLA
Ticket
  -> Activity
  -> Track Time
  -> History
```

각 컴포넌트는 특정 관심사를 맡기 때문에,
시스템은 모듈식이며 유지보수 가능하게 유지됩니다.

configuration side는 tenant-scoped입니다. ticket side는 선택된 category를
참조하고, 해당 category configuration이 정의한 approval, assignment, SLA
동작을 따릅니다.

---

## Ticket Lifecycle

티켓은 구조화된 라이프사이클을 따라 진행됩니다.

```txt
Draft -> Open -> Approval -> Working -> Resolved -> Closed
```

실제 흐름은 category configuration에 따라 달라집니다.

- 어떤 티켓은 approval을 건너뜁니다.
- 어떤 티켓은 여러 approval step을 필요로 합니다.
- 선택된 category는 tenant configuration boundary 안에서 해석됩니다.

관련 문서: [Ticket Lifecycle](./ticket-lifecycle.md)

---

## Work Session Model

티켓에서 수행된 작업은 session 단위로 추적됩니다.

```txt
start -> work -> finish
```

하나의 티켓에 여러 session이 허용됩니다.

Example:

```txt
09:00 - 10:00
15:00 - 17:00
```

이 방식은 하나의 집계 시간 값보다 실제 작업 행태를 더 정확하게 반영합니다.

관련 문서: [Ticket Track Time](./ticket-track-time.md)

---

## Activity와 History 모델

시스템은 사용자에게 보이는 activity와 불변 history를 구분합니다.

### Activity

- 의미 있는 커뮤니케이션과 운영 액션을 표현합니다.
- reason content와 structured metadata를 함께 저장합니다.
- 통합 timeline 경험을 구성합니다.

### History

- 티켓 변경으로부터 생성된 불변 event trace를 기록합니다.
- 감사와 before/after 변경 가시성을 지원합니다.
- activity model을 대체하는 것이 아니라 보완합니다.

```txt
Activity = 의미 있는 상호작용
History = 불변 이벤트 기록
```

관련 문서:

- [Ticket Activity Model](./ticket-activity.md)
- [Ticket History](./ticket-history.md)
- [Action Strategy](./strategy/action-strategy.md)

---

## Work Context

시스템은 각 사용자에 대해 현재 work context를 도출합니다.

이를 통해 다음이 가능해집니다.

- 우선순위가 반영된 ticket list
- context-aware UI action
- cognitive load 감소

Example:

```txt
working on a ticket -> Finish 표시
working on another ticket -> Switch 표시
```

관련 문서: [Ticket Track Time](./ticket-track-time.md)

---

## 설계 철학

이 시스템은 다음을 우선합니다.

- flexibility보다 predictability
- hardcoding보다 configuration
- 파괴적인 단순성보다 traceability
- UI 편의보다 운영 현실성

이 선택들은 시스템이 다음 특성을 갖도록 합니다.

- 복잡도와 함께 확장 가능
- 일관성 유지
- 이해하고 추론하기 쉬움

---

## 관련 문서

- [Ticket Model](./ticket-model.md)
- [Ticket Activity Model](./ticket-activity.md)
- [Ticket Lifecycle](./ticket-lifecycle.md)
- [Ticket Track Time](./ticket-track-time.md)
- [Ticket History](./ticket-history.md)
- [Action Strategy](./strategy/action-strategy.md)
- [Category Strategy](./strategy/category-strategy.md)
- [Approval System](./strategy/approval-system.md)
- [Assignment Policy](./strategy/assignment-policy.md)
- [SLA Strategy](./strategy/sla-strategy.md)

---

## 요약

이 ticket system은 workflow 중심이면서 사용자 중심적인 시스템으로 설계되었습니다.

핵심 특성은 다음과 같습니다.

- category-driven behavior
- approval-aware flow
- action-oriented communication and operations
- session-based work tracking
- 분리된 activity/history model
- context-aware prioritization
- full auditability

이는 현실적이고 확장 가능한 service desk system을 구축하기 위한 기반을 제공합니다.
