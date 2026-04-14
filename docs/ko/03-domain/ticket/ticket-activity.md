# Ticket Activity Model

## 목표

Ticket activity model은 티켓 안에서 발생하는 모든 의미 있는 상호작용과
운영 작업을 시스템에서 어떻게 표현할지를 정의합니다.

이 모델은 comment 중심 접근을 behavior-driven 모델로 대체합니다.
즉, 모든 의미 있는 변경이나 커뮤니케이션을 activity로 표현합니다.

---

## 핵심 개념

```txt
Activity = Action + Context + Reason
```

각 activity는 다음을 나타냅니다.

- 무엇이 일어났는가: action type
- 왜 일어났는가: reason 또는 message
- 추가 컨텍스트: action에 특화된 metadata

---

## 왜 Comment 대신 Activity인가

전통적인 티켓 시스템은 comment를 주요 상호작용 모델로 사용하는 경우가 많습니다.

하지만 이 접근에는 몇 가지 한계가 있습니다.

- comments는 구조화되지 않은 텍스트입니다.
- 운영 변경이 메시지 안에 숨겨집니다.
- 커뮤니케이션과 시스템 액션의 구분이 명확하지 않습니다.

### 핵심 아이디어

```txt
Comment is data
Action is behavior
Activity is the unified representation of both
```

---

## Activity Types

시스템은 여러 activity type을 지원하며,
각 type은 특정 작업을 나타냅니다.

### Communication

- `comment`: 관련 사용자에게 공개되는 커뮤니케이션
- `note`: 팀 내부에서만 보이는 내부 커뮤니케이션

### Operational Actions

- `assign`: 사용자를 할당하고 필요 시 category를 업데이트
- `adjust`: priority, risk level, due date 수정
- `merge`: 현재 티켓을 다른 티켓에 병합
- `reject`: 명확한 이유와 함께 요청 거절

---

## Activity Structure

각 activity는 일관된 형태를 따릅니다.

```ts
type TicketActivity = {
  id: string;
  type: ActivityType;

  content?: string; // rich text reason or message

  metadata?: Record<string, unknown>; // action-specific data

  createdBy: string;
  createdAt: Date;
};
```

---

## Content (Reason)

`content` 필드는 액션 뒤에 있는 의도를 설명하는 데 사용됩니다.

- rich text로 저장됩니다.
- 일부 action type에서는 optional입니다.
- 커뮤니케이션 폼과 운영 폼에서 공통으로 사용됩니다.

### Example Uses

- 왜 티켓이 거절되었는지
- 왜 priority가 올라갔는지
- assignment에 대한 추가 컨텍스트

---

## Metadata

각 action type은 action-specific metadata를 가질 수 있습니다.

### Examples

#### `assign`

- `assigneeIds`
- `categoryId`

#### `adjust`

- `priority`
- `riskLevel`
- `dueDate`

#### `merge`

- `targetTicketId`

---

## Ticket과의 관계

하나의 ticket은 activity 목록을 가집니다.

```ts
ticket.activities: TicketActivity[];
```

Activities는:

- 시간순으로 정렬됩니다.
- timeline의 기반이 됩니다.
- 티켓의 전체 activity history를 표현합니다.

---

## Ticket History와의 관계

Activity model과 history model은 관련되어 있지만 동일하지는 않습니다.

### Activity

- 의미 있는 사용자/운영 상호작용을 표현합니다.
- message 또는 reason을 action-specific context와 함께 저장합니다.
- action 중심 ticket timeline을 구성합니다.

### History

- 티켓 변경에서 생성된 불변 event trace를 기록합니다.
- 감사 가능성과 before/after 상태 전이를 강조합니다.
- activity 실행으로부터 파생되거나 트리거될 수 있습니다.

### 실무적 구분

```txt
Activity = 사용자에게 보이는 운영 상호작용
History = 불변 감사/event 기록
```

이 구분은 강한 traceability를 유지하면서도 도메인을 풍부하게 표현하게 해 줍니다.

---

## Timeline 표현

UI는 activity를 통합 timeline으로 렌더링합니다.

각 activity는:

- type별 정보를 표시합니다.
- 필요한 경우 metadata 변경을 보여줍니다.
- optional rich text content를 포함합니다.

### Benefits

- 명확하고 구조화된 이력
- 무엇이 일어났는지 이해하기 쉬움
- 모든 activity type에 걸친 일관된 렌더링

---

## Form 구조

모든 activity form은 일관된 패턴을 따릅니다.

```txt
[ Action-specific fields ]
[ Reason (rich text editor) ]
```

### Examples

#### Assign

- assignee
- category
- reason

#### Adjust

- priority
- risk
- due date
- reason

#### Merge

- target ticket
- reason

#### Comment / Note

- reason only

---

## Audit and Traceability

각 activity는 다음을 명시적으로 기록합니다.

- actor (`createdBy`)
- timestamp (`createdAt`)
- intent (`content`)
- effect (`metadata`)

### Result

- 강한 audit trail
- 더 쉬운 디버깅
- 더 명확한 책임 추적

---

## 확장성

Activity model은 확장 가능하도록 설계되었습니다.

새로운 action type은 핵심 구조를 바꾸지 않고도 추가할 수 있습니다.

- `resolve`
- `close`
- `reopen`
- `escalate`

---

## 관련 문서

- [Ticket History](./ticket-history.md)
- [Ticket Model](./ticket-model.md)
- [Action Strategy](./strategy/action-strategy.md)

---

## 설계 요약

Ticket activity model은 시스템을 다음과 같이 바꿉니다.

```txt
Text-based logging -> Behavior-driven activity tracking
```

이를 통해 다음이 가능해집니다.

- 더 나은 도메인 명확성
- 더 강한 감사 가능성
- 일관된 UI 패턴
- 확장 가능한 기능 확장
