# Ticket Activity Model

## 목표

Ticket activity model은 티켓 안에서 발생하는 모든 의미 있는 상호작용과
운영 작업을 시스템에서 어떻게 표현할지를 정의합니다.

이 모델은 comment 중심 접근을 action-driven 모델로 대체합니다.
즉, 모든 의미 있는 변경이나 커뮤니케이션을 명시적인 제약과 추적 가능한
효과를 가진 activity로 표현합니다.

이를 통해 다음을 보장합니다.

- 커뮤니케이션과 운영 작업이 하나의 일관된 상호작용 모델을 공유합니다
- action은 유효한 사용자와 유효한 상태에서만 실행됩니다
- lifecycle 전이는 명시적이고 감사 가능하게 유지됩니다
- timeline이 의도와 효과를 함께 반영합니다

---

## 핵심 개념

```txt
Activity = Action + Context + Reason + Execution Rules
```

각 activity는 다음을 나타냅니다.

- 무엇이 일어났는가: action type
- 왜 일어났는가: reason 또는 message
- 추가 컨텍스트: action에 특화된 metadata
- 어떻게 통제되는가: permission, state, restriction rule

---

## 왜 Comment 대신 Activity인가

전통적인 티켓 시스템은 comment를 주요 상호작용 모델로 사용하는 경우가 많습니다.

하지만 이 접근에는 몇 가지 한계가 있습니다.

- comments는 구조화되지 않은 텍스트입니다
- 운영 변경이 메시지 안에 숨겨집니다
- 커뮤니케이션과 시스템 액션의 구분이 명확하지 않습니다
- permission과 lifecycle rule을 일관되게 강제하기 어렵습니다

### 핵심 아이디어

```txt
Comment is data
Action is behavior
Activity is the unified representation of both
```

Activity model은 동작을 텍스트 안에 숨기지 않고 명시적으로 드러냅니다.

---

## Activity Types

시스템은 여러 activity type을 지원하며,
각 type은 특정 작업을 나타냅니다.

### Communication

- `comment`: 관련 사용자에게 공개되는 커뮤니케이션
- `note`: `private`, `shared` visibility rule을 가지는 내부 커뮤니케이션

### Operational Actions

- `assign`: 사용자를 할당 또는 재할당하고, 필요 시 실행을 다시 시작합니다
- `adjust`: priority, risk level, due date를 수정합니다
- `merge`: 현재 티켓을 다른 티켓에 병합합니다
- `reject`: 명확한 이유와 함께 요청을 거절합니다

### Extended Workflow Actions

Activity model은 다음과 같은 workflow 지향 action도 지원하도록 설계됩니다.

- `reportResolved`: 해결된 티켓을 다시 엽니다
- `reviewRejected`: 거절된 티켓을 다시 `Open`으로 되돌립니다
- `assign myself`: 적격한 운영자가 빠르게 소유권을 가져갑니다

이 action들은 재진입과 review loop를 명시적으로 표현하기 때문에
개선된 activity 설계의 일부입니다.

---

## Communication vs Operational Actions

Activity는 변경 가능성과 효과에 따라 두 범주로 나뉩니다.

### Communication Actions

- `comment`
- `note`

이 action들은:

- 사용자 간 커뮤니케이션을 표현합니다
- 일반 규칙에 따라 작성자가 수정하거나 삭제할 수 있습니다
- 티켓 lifecycle 상태를 직접 바꾸지 않습니다

### Operational Actions

- `assign`
- `adjust`
- `merge`
- `reject`
- `reportResolved`
- `reviewRejected`
- `assign myself`

이 action들은:

- 운영 의사결정을 표현합니다
- 생성 후 일반적으로 immutable합니다
- lifecycle 전이를 유발할 수 있습니다
- 더 강한 검증과 추적 가능성을 요구합니다

### 실무적 구분

```txt
Communication = message-oriented and partially mutable
Operation = decision-oriented and immutable
```

---

## Activity Structure

각 activity는 일관된 형태를 따릅니다.

```ts
type TicketActivity = {
  id: string;
  type: ActivityType;

  content: string; // required rich text reason or message

  metadata?: Record<string, unknown>; // action-specific data

  createdBy: string;
  createdAt: Date;

  active?: boolean; // soft-delete support for mutable communication items
};
```

정확한 metadata shape은 action type에 따라 달라지지만,
activity model은 저장, 렌더링, 감사 가능성을 위해 일관된 top-level 구조를 유지합니다.

현재 rule model에서는 `content`가 optional이 아닙니다.
메시지가 자동 생성되는 경우에도 activity는 실제 content를 저장합니다.

---

## Content (Reason)

`content` 필드는 액션 뒤에 있는 의도를 설명하는 데 사용됩니다.

- rich text로 저장됩니다
- 커뮤니케이션 폼과 운영 폼에서 공통으로 사용됩니다
- 모든 action에 필수입니다

이를 통해 다음을 보장합니다.

- 명확한 의도
- 감사 가능성
- 운영 추적 가능성

### Example Uses

- 왜 티켓이 거절되었는지
- 왜 priority가 올라갔는지
- 왜 ownership이 변경되었는지
- 왜 해결 이후 재검토가 요청되었는지

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
- `dueAt`

#### `merge`

- `targetTicketId`

#### `reportResolved` / `reviewRejected`

- `reviewType`
- `requestedState`

Metadata는 모호한 generic key-value 형태가 아니라
명시적이고 domain-shaped한 구조를 유지해야 합니다.

---

## Execution Constraints

각 activity는 언제, 어떻게 실행될 수 있는지를 정의하는 명시적 제약에 의해 통제됩니다.

```txt
Action = behavior with controlled execution rules
```

각 action은 다음 차원으로 정의됩니다.

- `who`: 누가 이 action을 수행할 수 있는가
- `when`: 어떤 ticket state에서 허용되는가
- `effect`: 어떤 변경이 적용되는가
- `purpose`: 왜 이 action이 존재하는가
- `restriction`: 추가 제약과 가드레일

이 제약을 통해 다음을 보장합니다.

- action이 올바른 사용자에 의해서만 실행됩니다
- action이 유효한 상태에서만 허용됩니다
- 시스템 동작이 예측 가능하게 유지됩니다
- domain rule이 일관되게 강제됩니다

이 제약은 실행 로직에 직접 매핑될 수 있습니다.

```ts
type ActionConstraint = {
  allowedStatus?: TicketStatus[];
  allowedRoles?: Role[];
  requiresOwnership?: "requester" | "assignee";
  blockedWhenLocked?: boolean;
};
```

---

## Constraint Examples

### Comment

- who: 티켓 접근 권한이 있는 모든 사용자
- when: `Closed`를 제외한 모든 상태
- effect: comment 생성 및 notification 전송
- purpose: 외부 또는 공유 커뮤니케이션
- restriction: content 필수, 작성자만 수정/삭제 가능

### Note

- who: 티켓 접근 권한이 있는 모든 사용자
- when: `Closed`를 제외한 모든 상태
- effect: internal note 생성
- purpose: 내부 전용 커뮤니케이션
- restriction: content 필수, 작성자만 수정/삭제 가능

Visibility:

- `private`: 작성자만 볼 수 있음
- `shared`: 내부 처리 권한자와 작성자가 볼 수 있음

### Assign

- who: `Working` 상태의 assignee 또는 더 넓은 운영 상태의 manager/admin
- when: 역할과 현재 상태에 따라 달라짐
- effect: assignee를 변경하고 필요하면 작업을 다시 활성화함
- purpose: ownership 이전, routing, 다시 처리 시작
- restriction: 운영 명확성을 위해 content 필수

### Adjust

- who: assignee 또는 manager/admin
- when: 유효한 운영 상태에서만 허용됨
- effect: priority, risk level, due date를 변경함
- purpose: 실행 계획 조정
- restriction: content 필수

### Merge

- who: assignee 또는 manager/admin
- when: 유효한 작업/검토 상태에서 허용되며, manager는 더 넓은 예외 범위를 가짐
- effect: target ticket으로 병합하고 source를 닫음
- purpose: 중복 또는 유사 티켓 정리
- restriction: self-merge 금지, merged child 금지, target은 유효해야 함

### Reject

- who: assignee 또는 manager/admin
- when: 역할에 따라 제한된 상태에서만 허용됨
- effect: ticket이 `Rejected`가 됨
- purpose: 현재 형태로는 처리할 수 없는 ticket을 명시함
- restriction: content 필수

### Report Resolved

- who: requester
- when: `Resolved`
- effect: `Reopen`
- purpose: 해결 결과 재검토
- restriction: content 필수

### Review Rejected

- who: requester
- when: `Rejected`
- effect: `Open`
- purpose: 승인 흐름으로 재진입
- restriction: content 필수

### Assign Myself

- who: category assignee 또는 job-field rule에 맞는 적격 사용자
- when: `Open`, `Approved`, `Working`
- effect: 자신을 할당하고 필요 시 ticket을 `Working`으로 전이함
- purpose: 빠른 self-assignment
- restriction: 중복 assignee 추가 금지, content는 자동 생성됨

---

## Ticket과의 관계

하나의 ticket은 activity 목록을 가집니다.

```ts
ticket.activities: TicketActivity[];
```

Activities는:

- 시간순으로 정렬됩니다
- timeline의 기반이 됩니다
- 티켓의 운영 상호작용 이력을 표현합니다
- 현재 상태뿐 아니라 왜 그렇게 바뀌었는지도 설명해 줍니다

---

## Ticket Lifecycle과의 관계

Activity는 사용자가 무엇을 말했는지만 설명하지 않습니다.
Lifecycle 전이 자체도 drive합니다.

```txt
Action -> State Transition
```

예시:

- `assign`은 ticket을 `Working`으로 이동시킬 수 있습니다
- `reject`는 ticket을 `Rejected`로 이동시킵니다
- `reportResolved`는 ticket을 `Reopen`으로 이동시킬 수 있습니다
- `reviewRejected`는 ticket을 `Open`으로 이동시킬 수 있습니다
- manager reassignment는 declined 또는 rejected ticket을 다시 활성화할 수 있습니다

이를 통해 다음을 보장합니다.

- lifecycle 전이가 명시적입니다
- 상태 변경이 사용자 의도와 연결됩니다
- 워크플로가 이해 가능하고 감사 가능하게 유지됩니다

---

## Ticket History와의 관계

Activity model과 history model은 관련되어 있지만 동일하지는 않습니다.

### Activity

- 의미 있는 사용자/운영 상호작용을 표현합니다
- message 또는 reason을 action-specific context와 함께 저장합니다
- action 중심 ticket timeline을 구성합니다

### History

- 티켓 변경으로부터 생성된 immutable event trace를 기록합니다
- before/after 값과 감사 가능성을 강조합니다
- activity 실행으로부터 파생되거나 트리거될 수 있습니다

### 실무적 구분

```txt
Activity = user-facing operational interaction
History = immutable audit/event record
```

이 구분은 강한 traceability를 유지하면서도 도메인을 풍부하게 표현하게 해 줍니다.

---

## Timeline 표현

UI는 activity를 통합 timeline으로 렌더링합니다.

각 activity는:

- type별 정보를 표시합니다
- 필요한 경우 metadata 변경을 보여줍니다
- rich text content를 포함합니다
- communication과 operational action을 시각적으로 구분할 수 있습니다

### Benefits

- 명확하고 구조화된 이력
- 무엇이 일어났는지 이해하기 쉬움
- 모든 activity type에 걸친 일관된 렌더링
- UI와 도메인 동작의 더 나은 정렬

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

#### Report Resolved / Review Rejected

- review intent
- reason

#### Comment / Note

- reason only

이 일관성은 UI 파편화를 줄이고 동작을 더 쉽게 학습하게 해 줍니다.

---

## Edit and Delete Rules

Activity model은 변경 가능한 커뮤니케이션과 immutable한 운영 작업을 구분합니다.

### Mutable

- `comment`
- `note`

이 action들은 일반적인 author-based rule 아래에서 수정 또는 soft-delete를 지원할 수 있습니다.

### Immutable

- `assign`
- `adjust`
- `merge`
- `reject`
- `reportResolved`
- `reviewRejected`
- `assign myself`

이 action들은 downstream effect를 가지는 운영 의사결정이므로
일반 workflow에서는 수정하거나 삭제해서는 안 됩니다.

---

## Audit and Traceability

각 activity는 다음을 명시적으로 기록합니다.

- actor (`createdBy`)
- timestamp (`createdAt`)
- intent (`content`)
- effect (`metadata`)
- execution rule outcome (action type과 resulting history에 암묵적으로 반영됨)

### Result

- 강한 audit trail
- 더 쉬운 디버깅
- 더 명확한 책임 추적
- 사용자 의도와 lifecycle change 사이의 명시적 연결

---

## 확장성

Activity model은 확장 가능하도록 설계되었습니다.

새로운 action type은 핵심 구조를 바꾸지 않고도 추가할 수 있습니다.

- `resolve`
- `close`
- `reopen`
- `escalate`
- approval 관련 action
- track-time 관련 workflow action

핵심 규칙은 새 action이 명시적인 intent와 effect를 가진
의미 있는 domain event여야 한다는 점입니다.

---

## 관련 문서

- [Ticket Lifecycle](./ticket-lifecycle.md)
- [Ticket History](./ticket-history.md)
- [Ticket Track Time](./ticket-track-time.md)
- [Ticket Model](./ticket-model.md)
- [Action Strategy](./strategy/action-strategy.md)

---

## 설계 요약

Ticket activity model은 시스템을 다음과 같이 바꿉니다.

```txt
Comment-based logging -> Action-driven activity tracking
```

이를 통해 다음이 가능해집니다.

- 더 나은 도메인 명확성
- 통제된 workflow 실행
- 더 강한 감사 가능성
- 일관된 UI 패턴
- 확장 가능한 기능 확장
