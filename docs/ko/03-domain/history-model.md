# History Model

## Goal

히스토리 모델은 티켓의 전체 생애주기 동안 발생하는
**의미 있는 모든 변경과 이벤트를 추적**하도록 설계되었다.

이 모델은 다음을 보장한다.

- 모든 작업에 대한 완전한 추적 가능성
- 사용자 책임 추적
- 컴플라이언스를 위한 감사 가능성
- 운영 과정의 투명성

---

## Core Concept

시스템에서 발생하는 모든 중요한 변경은 **history event**를 생성한다.

```id="core-history"
Action -> Event -> Stored History Record
```

이 시스템은 상태 자체보다는
**추적 관점에서 event-driven** 방식으로 동작한다.

---

## What is Tracked

시스템은 모든 핵심 변경 사항을 기록한다.

### 1. Status Changes

- Created
- Approved
- Assigned
- Working
- Pending
- Resolved
- Closed

---

### 2. Field Changes

- Priority
- Risk level
- Category
- Assignee
- Description (optional)

---

### 3. Assignment Events

- Assigned
- Reassigned
- Unassigned

---

### 4. SLA Events

- SLA started
- SLA paused
- SLA resumed
- SLA breached

---

### 5. Approval Events

- Approval requested
- Approved
- Rejected

---

### 6. System Events

- Auto-assignment triggered
- Escalation triggered
- Fallback assignment applied

---

## History Record Structure

각 히스토리 엔트리는 일관된 구조를 따른다.

```ts id="history-structure"
type History = {
  id: string;
  ticketId: string;

  type: HistoryType;
  action: string;

  actorId: string | null; // system action인 경우 null

  fromValue?: unknown;
  toValue?: unknown;

  metadata?: Record<string, unknown>;

  createdAt: Date;
};
```

---

## History Types

### Example Enum

```ts id="history-types"
type HistoryType =
  | "STATUS"
  | "FIELD"
  | "ASSIGNMENT"
  | "SLA"
  | "APPROVAL"
  | "SYSTEM";
```

---

## Actor Model

각 히스토리 레코드는 **누가 해당 작업을 수행했는지**를 식별해야 한다.

### Actor Types

- User (employee)
- Requester
- System (automated process)

---

## Event Granularity

### Fine-Grained Tracking (Recommended)

각 변경은 개별 이벤트로 기록하는 것을 권장한다.

#### Example

```id="granular-example"
Priority: Medium -> High
Status: Open -> Working
```

위 예시는 **서로 다른 두 개의 history record**를 생성한다.

---

### Trade-off

| Approach | Pros | Cons |
| --- | --- | --- |
| Fine-grained | 정밀하고 감사 가능함 | 레코드 수가 많아짐 |
| Aggregated | 저장량이 적음 | 추적이 어려워짐 |

---

## Read Model vs Write Model

### Write Model

- 이벤트 저장에 최적화된다.
- append-only 구조를 가진다.

---

### Read Model

- UI 표시용으로 최적화된다.
- history entry를 집계하거나 포맷팅할 수 있다.

---

## Immutability

히스토리 레코드는 **불변(immutable)** 이어야 한다.

### Rules

- 수정할 수 없다.
- 삭제할 수 없다. 단, 컴플라이언스 이슈가 있는 경우는 예외다.
- 정정은 새로운 이벤트로 기록한다.

---

## Ordering & Consistency

히스토리는 **시간 순서대로 정렬**되어야 한다.

### Considerations

- 서버 타임스탬프를 사용한다.
- 클라이언트 측 정렬에 의존하지 않는다.
- 동시 업데이트 상황을 신중하게 처리한다.

---

## UI Representation

### Timeline View

- 이벤트를 시간순 목록으로 보여준다.
- 최신순 우선 또는 토글 방식으로 제공할 수 있다.

---

### Example

```id="timeline-example"
[10:32] Assigned to John
[10:30] Status changed to Working
[10:20] Ticket Created
```

---

### Key UX Elements

- 명확한 작업 설명
- actor 식별 가능성
- timestamp
- 중요한 변경 강조

---

## Metadata Usage

metadata는 추가적인 맥락 정보를 제공한다.

### Examples

```ts id="metadata-example"
metadata: {
  reason: "Manual reassignment",
  previousAssignee: "user_1",
}
```

---

## System vs User Actions

시스템이 생성한 이벤트는 사용자 액션과 구분 가능해야 한다.

### Example

- "Auto-assigned by system"
- "Escalated due to SLA breach"

---

## Performance Considerations

### Challenges

- 히스토리 레코드 수가 많아질 수 있다.
- 쓰기 빈도가 높을 수 있다.

---

### Solutions

- 인덱스 기반 조회 (`ticketId`, `createdAt`)
- UI 페이지네이션
- 오래된 레코드 아카이빙

---

## Integration with Other Domains

### SLA

- SLA 생애주기 이벤트를 기록한다.

---

### Assignment

- 소유권 변경을 추적한다.

---

### Approval

- 승인 결정을 기록한다.

---

## Edge Cases

### 1. Rapid Consecutive Updates

- 밀리초 단위로 여러 이벤트가 연속 발생하는 경우
  올바른 순서를 보장해야 한다.

---

### 2. Bulk Updates

- 여러 필드가 한 번에 변경되는 경우
  개별 이벤트로 분리할지 집계할지 결정해야 한다.

---

### 3. System Failures

- 히스토리가 부분적으로만 기록되는 경우
  트랜잭션 처리 또는 일관성 보장이 필요하다.

---

### 4. Sensitive Data Changes

- 민감한 값을 직접 저장하지 않도록 주의해야 한다.
  필요하면 마스킹하거나 생략해야 한다.

---

## Alternatives Considered

### 1. No History Tracking

- 추적 가능성이 없다.
- 책임성을 확보할 수 없다.

---

### 2. Change Log Only (Diff-based)

- before/after snapshot만 저장한다.
- 맥락을 해석하기 어렵다.

---

### 3. Full Event Sourcing

- 전체 시스템을 이벤트 기반으로 운영한다.
- 추적 가능성은 최대화된다.
- 이 사용 사례에는 복잡도가 너무 높다.

---

## Why Not Full Event Sourcing?

이 시스템은 **hybrid approach**를 채택한다.

- 메인 모델은 state-based
- 히스토리 추적은 event-based

### Reason

- 구현이 더 단순하다.
- 충분한 감사 기능을 제공한다.
- 성능 균형이 더 좋다.

---

## Design Principles Alignment

이 모델은 다음 원칙과 정렬된다.

- 감사 가능성
- 투명성
- 시스템 관측 가능성
- 확장 가능한 데이터 아키텍처

---

## Summary

히스토리 모델은 시스템 내 모든 중요한 이벤트에 대한
**포괄적이고, 불변이며, 구조화된 기록**을 제공하여,
완전한 추적 가능성, 책임성, 운영 인사이트를 가능하게 한다.
