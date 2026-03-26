# 티켓 이력

## 목적

티켓 이력 모델은 티켓의 생명주기 전반에서 발생하는
의미 있는 모든 변경과 이벤트를 추적하기 위해 설계되었다.

이를 통해 다음을 보장한다.

- 액션에 대한 완전한 추적 가능성
- 사용자 책임 추적
- 컴플라이언스를 위한 감사 가능성
- 운영 과정의 투명성

---

## 핵심 개념

중요한 모든 티켓 변경은 이력 이벤트를 생성한다.

```txt
Action -> Event -> Stored History Record
```

이 시스템은 추적 관점에서 이벤트 중심(event-driven)으로 동작하며,
단순한 상태 중심 모델이 아니다.

---

## 무엇을 추적하는가

시스템은 중요한 티켓 변경 사항을 기록한다.

### 1. 상태 변경

- created
- approved
- assigned
- working
- pending
- resolved
- closed

### 2. 필드 변경

- priority
- risk level
- category
- assignee
- 필요 시 description

### 3. 할당 이벤트

- assigned
- reassigned
- unassigned

### 4. SLA 이벤트

- SLA started
- SLA paused
- SLA resumed
- SLA breached

### 5. 승인 이벤트

- approval requested
- approved
- rejected

### 6. 시스템 이벤트

- auto-assignment triggered
- escalation triggered
- fallback assignment applied

---

## 이력 레코드 구조

각 이력 항목은 일관된 구조를 따른다.

```ts
type History = {
  id: string;
  ticketId: string;

  type: HistoryType;
  action: string;

  actorId: string | null; // 시스템 액션의 경우 null

  fromValue?: unknown;
  toValue?: unknown;

  metadata?: Record<string, unknown>;

  createdAt: Date;
};
```

---

## 이력 유형

### 예시 Enum

```ts
type HistoryType =
  | "STATUS"
  | "FIELD"
  | "ASSIGNMENT"
  | "SLA"
  | "APPROVAL"
  | "SYSTEM";
```

---

## 행위자 모델

각 이력 레코드는 누가 해당 액션을 수행했는지를 식별한다.

### 행위자 유형

- user
- requester
- system

---

## 이벤트 세분성

### 세분화된 추적

각 변경은 개별 이벤트로 기록된다.

#### 예시

```txt
Priority: Medium -> High
Status: Open -> Working
```

이 경우 두 개의 개별 이력 레코드가 생성된다.

### 트레이드오프

| Approach     | Pros               | Cons            |
| ------------ | ------------------ | --------------- |
| Fine-grained | Precise, auditable | More records    |
| Aggregated   | Less storage       | Harder to trace |

---

## 읽기 모델과 쓰기 모델

### Write Model

- 이벤트 저장에 최적화됨
- append-only 구조

### Read Model

- 타임라인 표시를 위해 최적화됨
- UI 가독성을 위해 항목을 집계하거나 포맷할 수 있음

---

## 불변성

이력 레코드는 불변이다.

### 규칙

- 업데이트할 수 없다.
- 일반 운영에서는 삭제할 수 없다.
- 수정이 필요하면 새로운 이벤트로 기록한다.

---

## 정렬과 일관성

이력은 시간 순서대로 정렬되어야 한다.

### 고려사항

- 서버 타임스탬프를 사용한다.
- 클라이언트 측 정렬에 의존하지 않는다.
- 동시 업데이트를 신중하게 처리한다.

---

## UI 표현

### 타임라인 뷰

- 이벤트를 시간순 목록으로 표시
- 최신순 또는 토글 가능한 정렬 지원

### 예시

```txt
[10:32] Assigned to John
[10:30] Status changed to Working
[10:20] Ticket Created
```

### 핵심 UX 요소

- 명확한 액션 설명
- 행위자 표시
- 타임스탬프
- 중요한 변경에 대한 강조

---

## 메타데이터 활용

메타데이터는 단순한 before/after 값만으로는 부족한 추가 문맥을 제공한다.

### 예시

```ts
metadata: {
  reason: "Manual reassignment",
  previousAssignee: "user_1",
}
```

---

## 시스템 액션과 사용자 액션

시스템이 생성한 이벤트는 사용자 액션과 구분될 수 있어야 한다.

### 예시

- "Auto-assigned by system"
- "Escalated due to SLA breach"

---

## 성능 고려사항

### 과제

- 높은 이력 레코드 수
- 빈번한 쓰기 작업

### 해결 방안

- `ticketId`, `createdAt` 기준 인덱스 조회
- UI 페이징
- 필요한 경우 오래된 레코드 아카이빙

---

## 다른 도메인과의 연계

### SLA

- SLA 생명주기 이벤트를 기록한다.

### Assignment

- 소유권 변경을 추적한다.

### Approval

- 승인 결정을 기록한다.

### Track Time

- 시작, 종료, 전환, 수동 수정 등을 기록한다.

---

## 예외 상황

### 1. 짧은 시간 내 연속 업데이트

- 밀리초 단위로 여러 이벤트가 발생할 수 있다.
- 그럼에도 정렬은 결정 가능하게 유지되어야 한다.

### 2. 일괄 업데이트

- 하나의 액션이 여러 필드를 동시에 바꿀 수 있다.
- 시스템은 이를 나눠 기록할지, 묶어서 기록할지 결정해야 한다.

### 3. 시스템 실패

- 부분적인 이력 기록은 허용되지 않는다.
- 가능하다면 트랜잭션 처리가 선호된다.

### 4. 민감 데이터 변경

- 민감한 값을 그대로 저장해서는 안 된다.
- 마스킹 또는 생략이 필요할 수 있다.

---

## 왜 전체 Event Sourcing을 사용하지 않는가?

이 시스템은 하이브리드 접근을 채택한다.

- 메인 모델은 상태 기반
- 이력 추적은 이벤트 기반

### 이유

- 구현이 더 단순하다.
- 감사 기능으로는 충분하다.
- 성능 균형이 더 좋다.

---

## 관련 문서

- [Ticket Lifecycle](./ticket-lifecycle.md)
- [Ticket Track Time](./ticket-track-time.md)
- [Approval System](./strategy/approval-system.md)
- [Assignment Policy](./strategy/assignment-policy.md)
- [SLA Strategy](./strategy/sla-strategy.md)

---

## 요약

티켓 이력 모델은 중요한 티켓 이벤트를 포괄적이고, 구조적이며, 불변하게 기록한다.

이를 통해 워크플로는 운영, 디버깅, 리뷰 관점에서 설명 가능하고 추적 가능한 형태가 된다.
