# Ticket History

## 목표

Ticket history 모델은 티켓의 라이프사이클 전반에서 발생하는
모든 의미 있는 변경과 이벤트를 추적하도록 설계되었습니다.

이를 통해 다음을 보장합니다.

- 액션의 전체 추적 가능성
- 사용자 책임 추적
- 컴플라이언스를 위한 감사 가능성
- 운영의 투명성

---

## 핵심 개념

모든 중요한 티켓 변경은 history event를 생성합니다.

```txt
Action -> Event -> Stored History Record
```

이 시스템은 상태 중심이 아니라, 추적 관점에서는 event-driven 방식입니다.
History는 항상 activity 실행의 결과로 생성되며,
이를 통해 모든 변경이 추적 가능하고 불변으로 유지됩니다.

---

## Ticket Activity와의 관계

Ticket history와 ticket activity는 서로 관련되어 있지만 목적은 다릅니다.

### Ticket Activity

- 사용자에게 보이는 커뮤니케이션과 운영 액션을 표현합니다.
- 의도, 메시지, 구조화된 액션 컨텍스트를 저장합니다.
- 통합된 ticket timeline을 구성합니다.

### Ticket History

- 티켓 변경으로부터 생성된 불변 event trace를 기록합니다.
- before/after 값과 감사 가능성을 강조합니다.
- 실제로 무엇이 발생했는지에 대한 더 낮은 수준의 운영 기록을 보존합니다.

### 실무적 구분

```txt
Activity = 의미 있는 상호작용 또는 운영 액션
History = 변경에 의해 생성된 불변 이벤트 기록
```

이 구분 덕분에 UI 수준에서는 도메인을 풍부하게 표현하면서도,
감사와 디버깅 관점에서는 정밀함을 유지할 수 있습니다.

---

## 무엇을 추적하는가

시스템은 모든 핵심 티켓 변경을 기록합니다.

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
- description, 필요한 경우

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

## History Record 구조

각 history entry는 일관된 구조를 따릅니다.

```ts
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

```ts
type HistoryType =
  | "TICKET"
  | "STATUS"
  | "CATEGORY"
  | "ASSIGNMENT"
  | "APPROVAL"
  | "COMMENT"
  | "NOTE"
  | "PLANNING";
```

---

## Actor Model

각 history record는 누가 해당 액션을 수행했는지 식별합니다.

### Actor Types

- user
- requester
- system

---

## 이벤트 세분화 수준

### Fine-Grained Tracking

각 변경은 개별 이벤트로 기록됩니다.

#### Example

```txt
Priority: Medium -> High
Status: Assigned -> Working
```

이 경우 두 개의 분리된 history record가 생성됩니다.

### Trade-Off

| Approach     | Pros               | Cons            |
| ------------ | ------------------ | --------------- |
| Fine-grained | 정확하고 감사 가능 | 레코드 수 증가  |
| Aggregated   | 저장량 감소        | 추적이 더 어려움 |

---

## Read Model vs Write Model

### Write Model

- 이벤트 저장에 최적화됩니다.
- append-only 구조를 가집니다.

### Read Model

- timeline 표시를 위해 최적화됩니다.
- UI 가독성을 위해 entry를 집계하거나 포맷할 수 있습니다.

---

## 불변성

History record는 immutable합니다.

### Rules

- 업데이트할 수 없습니다.
- 일반 운영에서 삭제할 수 없습니다.
- 수정 사항은 새로운 이벤트로 기록합니다.

---

## 정렬과 일관성

History는 시간 순서대로 정렬되어야 합니다.

### Considerations

- server timestamp를 사용합니다.
- client-side ordering에 의존하지 않습니다.
- 동시 업데이트를 신중히 처리합니다.

---

## UI 표현

### Timeline View

- 시간순 이벤트 목록
- 최신순 또는 전환 가능한 정렬 방식

### Example

```txt
[10:32] John에게 할당됨
[10:30] 상태가 Working으로 변경됨
[10:20] Ticket 생성됨
```

### Key UX Elements

- 명확한 액션 설명
- 보이는 actor
- timestamp
- 중요한 변경에 대한 강조

---

## Metadata 사용

단순한 before/after 값만으로 부족할 때 metadata가 추가 컨텍스트를 제공합니다.

### Example

```ts
metadata: {
  reason: "Manual reassignment",
  previousAssignee: "user_1",
}
```

---

## System vs User Actions

시스템이 생성한 이벤트는 사용자 액션과 구분 가능해야 합니다.

### Examples

- "Auto-assigned by system"
- "Escalated due to SLA breach"

---

## 성능 고려사항

### Challenges

- 많은 양의 history record
- 빈번한 쓰기 작업

### Solutions

- `ticketId`와 `createdAt` 기준 index query
- UI pagination
- 필요 시 오래된 record 아카이빙

---

## 다른 도메인과의 통합

### SLA

- SLA 라이프사이클 이벤트를 기록합니다.

### Assignment

- 소유권 변경을 추적합니다.

### Approval

- 승인 결정을 기록합니다.

### Track Time

- 시작, 종료, 전환, 수동 보정을 기록합니다.

---

## Edge Cases

### 1. Rapid Consecutive Updates

- 여러 이벤트가 몇 밀리초 안에 연속 발생할 수 있습니다.
- 그래도 정렬은 결정적으로 유지되어야 합니다.

### 2. Bulk Updates

- 하나의 액션이 여러 필드를 동시에 바꿀 수 있습니다.
- 시스템은 이를 분리할지 집계할지 결정해야 합니다.

### 3. System Failures

- 부분적인 history write는 허용되지 않습니다.
- 가능하다면 transactional handling이 바람직합니다.

### 4. Sensitive Data Changes

- 민감한 값은 그대로 저장하면 안 됩니다.
- masking이나 omission이 필요할 수 있습니다.

---

## 왜 Full Event Sourcing이 아닌가?

이 시스템은 hybrid 접근을 채택합니다.

- 상태 기반 메인 모델
- 이벤트 기반 history tracking

### Reason

- 구현이 더 단순합니다.
- 감사 기능으로 충분합니다.
- 성능 균형이 더 좋습니다.

---

## 관련 문서

- [Ticket Activity Model](./ticket-activity.md)
- [Ticket Lifecycle](./ticket-lifecycle.md)
- [Ticket Track Time](./ticket-track-time.md)
- [Action Strategy](./strategy/action-strategy.md)
- [Approval System](./strategy/approval-system.md)
- [Assignment Policy](./strategy/assignment-policy.md)
- [SLA Strategy](./strategy/sla-strategy.md)

---

## 요약

Ticket history 모델은 중요한 티켓 이벤트에 대한 포괄적이고, 불변이며,
구조화된 기록을 제공하여 운영, 디버깅, 리뷰 관점에서 워크플로를 설명 가능하게 만듭니다.
