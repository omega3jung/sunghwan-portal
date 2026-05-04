# Action Strategy

## 목표

이 문서는 ticket action system 뒤에 있는 설계 전략을 정의합니다.

목표는 커뮤니케이션과 운영 변경을 모두 포함하는 의미 있는 ticket interaction을
구조적이고, 확장 가능하며, 감사 친화적인 방식으로 표현하는 것입니다.

---

## 핵심 개념

이 시스템은 action을 단순 텍스트가 아니라 명시적인 도메인 동작으로 모델링합니다.

```txt
Action = Intent + Effect + Context
```

즉, 각 action은 다음을 표현해야 합니다.

- 무엇이 일어났는가
- 왜 일어났는가
- 그 결과 무엇이 바뀌었는가

---

## 설계 원칙

### 1. Behavior Over Text

- 시스템은 단순 메시지가 아니라 behavior를 표현해야 합니다.
- 실제 workflow를 다루기에는 comments만으로 충분하지 않습니다.
- 모든 의미 있는 작업은 first-class entity로 모델링되어야 합니다.

---

### 2. Separation of Intent and Effect

각 action은 다음을 명시적으로 분리합니다.

- intent: 이유 또는 설명
- effect: 실제 구조화된 변경

```txt
Intent -> rich text reason
Effect -> priority, assignee, due date 같은 metadata
```

---

### 3. Unified Activity Model

모든 상호작용은 하나의 activity model로 표현됩니다.

```txt
Activity = Communication + Operation
```

이를 통해 다음 사이의 분절을 피할 수 있습니다.

- comments
- system logs
- 수동 운영 변경

---

### 4. Traceability First

모든 action은 다음 질문에 답할 수 있어야 합니다.

- 누가 했는가
- 언제 일어났는가
- 무엇이 바뀌었는가
- 왜 그렇게 했는가

---

## Action 설계 전략

### 1. Action Types as Domain Events

각 action은 의미 있는 domain-level event를 나타냅니다.

### Examples

- `assign`: 소유권 또는 라우팅 변경
- `adjust`: priority, risk, due date 수정
- `merge`: 구조적인 ticket 변경
- `reject`: 명시적인 이유를 동반한 workflow 결정

---

### 2. Action Types Must Be Explicit

의미를 텍스트 안에 숨기지 않습니다.

#### Bad

```txt
"Assigning this to John"
```

#### Good

```ts
{
  type: "assign",
  assigneeIds: ["john"],
}
```

명시적인 action type은 가독성, validation, auditability를 향상시킵니다.

---

### 3. Reason Is Optional but Encouraged

- Reason은 의사결정 컨텍스트를 더해줍니다.
- rejection 같은 중요한 action에는 reason이 필요합니다.
- 가벼운 action에서는 optional로 둘 수 있습니다.

---

## UI 전략

### 1. Consistent Form Pattern

모든 action form은 통일된 구조를 따릅니다.

```txt
[ Action-specific fields ]
[ Reason editor ]
```

---

### 2. Shared Reason Component

- rich text editor는 여러 action type에서 공유됩니다.
- 중복이 줄어듭니다.
- UX가 일관되게 유지됩니다.

---

### 3. Field Responsibility Separation

- action-specific field는 구조화된 데이터 입력을 담당합니다.
- reason editor는 컨텍스트 설명을 담당합니다.

---

### 4. Timeline-First Design

UI는 통합 timeline을 중심으로 구성됩니다.

각 action은:

- timeline item으로 렌더링됩니다.
- 구조화된 metadata를 보여줍니다.
- optional reason content를 포함합니다.

이를 통해 사용자는 무엇이 바뀌었는지와 왜 바뀌었는지를 함께 이해할 수 있습니다.

---

## Metadata 전략

### 1. Action-Specific Metadata

각 action type은 자신만의 metadata contract를 정의합니다.

### Examples

#### `assign`

- assignee
- category

#### `adjust`

- priority
- risk level
- due date

#### `merge`

- target ticket

#### `reject`

- 별도 metadata 없이 reason content 중심으로 표현될 수 있음

---

### 2. Avoid Generic Key-Value Abuse

명확한 도메인 구조가 있을 때는 모호한 metadata 구조에 기대지 않습니다.

#### Bad

```ts
metadata: { field: "priority", value: "high" }
```

#### Good

```ts
metadata: { priority: "high" }
```

---

### 3. Strong Typing per Action

각 action type은 명확히 정의된 shape를 가져야 합니다.

이는 다음을 향상시킵니다.

- type safety
- readability
- maintainability

---

## Communication 전략

### 1. `comment` vs `note`

#### `comment`

- 공개 커뮤니케이션
- notification을 유발할 수 있음

#### `note`

- 내부 커뮤니케이션
- 외부 notification 없음
- 팀 또는 운영 컨텍스트 내부에서만 보임

---

### 2. Communication Is Still an Action

커뮤니케이션조차도 의도적인 behavior로 취급합니다.

```txt
communication = action
```

이를 통해 다음이 보장됩니다.

- timeline의 일관성
- 통합 렌더링 로직
- ticket domain 전체에서 하나의 상호작용 모델 유지

---

## Audit 전략

### 1. Full Activity Log

모든 action은 append-oriented 운영 기록으로 보존되어야 합니다.

- 일반 workflow에서 파괴적 삭제 없음
- review와 debugging을 위해 action을 계속 조회 가능

---

### 2. Explicit Actor Tracking

각 action은 다음을 기록합니다.

- `createdBy`
- `createdAt`

---

### 3. Reason as Audit Context

Reason content는 의사결정을 설명해 주며 특히 다음에서 중요합니다.

- debugging
- review
- compliance-sensitive workflow

---

## Extensibility 전략

이 시스템은 구조를 다시 설계하지 않고도 미래 action을 지원하도록 설계되었습니다.

### Potential Extensions

- `resolve`
- `close`
- `reopen`
- `escalate`
- `reassign`
- approval-related actions

### Rule for Adding New Actions

새 action은 다음 조건을 만족해야 합니다.

- 의미 있는 domain event를 표현한다.
- 자신의 metadata shape를 정의한다.
- timeline에 통합된다.
- 같은 form pattern을 따른다.

---

## Trade-offs

### Pros

- 더 강한 도메인 명확성
- 구조화된 workflow 지원 향상
- 감사 가능성 향상
- 더 일관된 UI
- 확장 가능한 action 아키텍처

---

### Cons

- 모델링 복잡도 증가
- 리팩터링 비용 증가
- 개발자 입장에서 초기 학습 비용 증가

---

## 관련 문서

- [Ticket Activity Model](../ticket-activity.md)
- [Ticket History](../ticket-history.md)
- [Ticket Model](../ticket-model.md)

---

## 요약

Action strategy는 시스템을 다음과 같이 전환합니다.

```txt
Comment-driven system -> Action-driven system
```

이 변화는 다음을 가능하게 합니다.

- 구조화된 workflow
- 더 명확한 intent 표현
- 더 강한 audit trail
- 더 일관된 UI 아키텍처
