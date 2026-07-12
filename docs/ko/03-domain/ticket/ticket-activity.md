# 티켓 활동 모델

## 목표

티켓 활동 모델은 티켓 내부에서 발생하는 모든 의미 있는 상호작용과
운영 작업을 시스템에서 어떻게 표현할지 정의합니다.

이 모델은 댓글 중심 접근 방식을 액션 중심 모델로 대체합니다. 즉,
의미 있는 모든 변경이나 커뮤니케이션은 명시적인 제약과 추적 가능한
효과를 가진 activity로 표현됩니다.

이 모델은 다음을 보장합니다.

- 커뮤니케이션과 운영 작업이 하나의 일관된 상호작용 모델을 공유한다
- 액션은 유효한 사용자만, 유효한 상태에서만 실행된다
- 라이프사이클 전이는 명시적이고 감사 가능하게 유지된다
- 타임라인은 의도와 결과를 모두 반영한다

---

## 핵심 개념

```txt
Activity = Action + Context + Reason + Execution Rules
```

각 activity는 다음을 나타냅니다.

- 무엇이 일어났는가: action type
- 왜 일어났는가: reason 또는 message
- 추가 문맥: action별 metadata
- 어떻게 통제되는가: permission, state, restriction rule

---

## 왜 Comment 대신 Activity인가

전통적인 티켓 시스템은 주된 상호작용 모델로 comment에 의존하는 경우가
많습니다.

하지만 이 접근에는 몇 가지 한계가 있습니다.

- comment는 구조화되지 않은 텍스트다
- 운영상 변경이 메시지 안에 숨겨진다
- 커뮤니케이션과 시스템 액션의 구분이 명확하지 않다
- permission과 lifecycle rule을 일관되게 강제하기 어렵다

### 핵심 아이디어

```txt
Comment is data
Action is behavior
Activity is the unified representation of both
```

activity 모델은 동작을 텍스트 안에 숨기지 않고 명시적으로 드러냅니다.

---

## Activity 유형

시스템은 여러 activity type을 지원하며, 각 type은 특정 작업을 나타냅니다.

### 커뮤니케이션

- `comment`: 관련 사용자에게 공개되는 커뮤니케이션
- `note`: `private`, `shared` visibility rule을 가진 내부 커뮤니케이션

### 운영 액션

- `assign`: 사용자를 할당 또는 재할당하고, 필요하면 작업을 재개한다
- `adjust`: priority, risk level, due date를 수정한다
- `merge`: 현재 티켓을 다른 티켓으로 병합한다
- `reject`: 명확한 사유와 함께 요청을 반려한다

### 확장 워크플로 액션

activity 모델은 다음과 같은 workflow 지향 액션도 지원하도록 설계되어
있습니다.

- `reopen`: 해결된 티켓을 다시 연다
- `resubmit`: declined/rejected 티켓을 초기 routing으로 다시 보낸다
- `assignSelf`: 현재 work assignee가 multi-assignee 작업을 직접 가져가게 한다

이 액션들은 재진입과 재검토 루프를 명시적으로 표현하기 때문에 개선된
activity 설계의 일부입니다.

---

## 커뮤니케이션 액션 vs 운영 액션

activity는 변경 가능성과 효과를 기준으로 두 범주로 나뉩니다.

### 커뮤니케이션 액션

- `comment`
- `note`

이 액션들은 다음과 같습니다.

- 사용자 간 커뮤니케이션을 표현한다
- 일반 규칙 하에서 작성자가 수정 또는 삭제할 수 있다
- 티켓 lifecycle state를 직접 바꾸지 않는다

### 운영 액션

- `assign`
- `adjust`
- `merge`
- `reject`
- `reopen`
- `resubmit`
- `assignSelf`

이 액션들은 다음과 같습니다.

- 운영상의 의사결정을 표현한다
- 생성 후에는 일반적으로 수정 불가능하다
- lifecycle 전이를 유발할 수 있다
- 더 강한 validation과 traceability가 필요하다

### 실무적 구분

```txt
Communication = message-oriented and partially mutable
Operation = decision-oriented and immutable
```

---

## Activity 구조

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

정확한 metadata shape은 action type에 따라 달라지지만, activity 모델은
저장, 렌더링, 감사 가능성을 위해 최상위 구조를 통일해서 유지합니다.

현재 rule 모델에서는 `content` 필드가 optional이 아닙니다. 메시지가
자동 생성되는 경우에도 activity는 여전히 구체적인 content를 저장합니다.

---

## Content (Reason)

`content` 필드는 액션 뒤에 있는 의도를 설명하는 데 사용됩니다.

- rich text로 저장된다
- 커뮤니케이션 form과 운영 form 모두에서 공유된다
- 모든 action에서 필수다

이는 다음을 보장합니다.

- 명확한 의도
- 감사 가능성
- 운영 추적 가능성

### 사용 예시

- 왜 티켓이 반려되었는가
- 왜 priority가 올라갔는가
- 왜 담당자가 바뀌었는가
- 왜 해결 후 재작업이 요청되었는가

---

## Metadata

각 action type은 action별 metadata를 포함할 수 있습니다.

### 예시

#### `assign`

- `assigneeIds`
- `categoryId`

#### `adjust`

- `priority`
- `riskLevel`
- `dueAt`

#### `merge`

- `mergedIntoTicketId`
- `mergedIntoTicketNo`

#### `reopen` / `resubmit`

- `reviewType`
- `requestedState`

metadata는 모호한 generic key-value dump가 되기보다는, 명시적이고
도메인 형태를 유지해야 합니다.

---

## 실행 제약

각 activity는 언제, 어떻게 실행될 수 있는지를 정의하는 명시적인
제약으로 관리됩니다.

```txt
Action = behavior with controlled execution rules
```

각 action은 다음 차원으로 정의됩니다.

- `who`: 누가 action을 수행할 수 있는가
- `when`: 어떤 ticket state에서 허용되는가
- `effect`: 티켓에 어떤 변경이 적용되는가
- `purpose`: 이 action이 존재하는 이유는 무엇인가
- `restriction`: 추가 제약과 제한은 무엇인가

이 제약은 다음을 보장합니다.

- 액션이 올바른 사용자에 의해서만 실행된다
- 액션이 유효한 상태에서만 허용된다
- 시스템 동작이 예측 가능하게 유지된다
- 도메인 규칙이 일관되게 강제된다

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

## 제약 예시

### Comment

- who: 티켓 접근 권한이 있는 모든 사용자
- when: `Draft`를 제외한 모든 상태, `Closed` 포함
- effect: comment 생성 및 알림 전송
- purpose: 외부 또는 공유 커뮤니케이션
- restriction: content 필수, ticket이 `Closed`가 아닐 때 작성자만 수정 가능

### Note

- who: 티켓 접근 권한이 있는 모든 사용자
- when: `Draft`, `Closed`를 제외한 모든 상태
- effect: 내부 note 생성
- purpose: 내부 전용 커뮤니케이션
- restriction: content 필수, ticket이 `Closed`가 아닐 때 작성자만 수정 가능

Visibility:

- `private`: 작성자만 볼 수 있다
- `shared`: 내부 운영자와 작성자만 볼 수 있다

### Assign

- who: 현재 work assignee 또는 Admin
- when: `Assigned`, `Working`, `Pending`; Admin은 `Approval`에서 approver도 변경할 수 있다
- effect: assignee를 갱신하고 `Pending`이면 `Working`으로 이동한다
- purpose: ownership 이전, routing, 또는 작업 재개
- restriction: 운영상 명확성을 위해 content 필수

### Adjust

- who: 현재 work assignee 또는 Admin
- when: `Assigned`, `Working`, `Pending`; Admin correction은 `Resolved`, `Closed`에서 허용된다
- effect: priority, risk level, due date를 갱신한다
- purpose: 실행 계획을 조정한다
- restriction: content 필수, resolved/closed correction에서는 due date 변경 불가

### Merge

- who: 현재 work assignee 또는 Admin
- when: assignee는 `Assigned`, `Working`, `Pending`, `Resolved`; Admin은 모든 non-`Draft` 상태
- effect: 대상 티켓으로 병합하고 source를 닫는다
- purpose: 중복 또는 관련 티켓을 통합한다
- restriction: self-merge 금지, merged child 금지, target은 유효해야 한다

### Reject

- who: 현재 work assignee 또는 Admin
- when: `Assigned`, `Working`, `Pending`
- effect: ticket이 `Rejected`가 된다
- purpose: 현재 형태로는 실행할 수 없음을 표시한다
- restriction: content 필수

### Reopen

- who: requester 또는 Admin
- when: `Resolved`
- effect: `Working`, history event = `TICKET_REOPENED`
- purpose: 해결 결과를 다시 평가한다
- restriction: content 필수, 기존 work assignee가 있어야 한다

### Resubmit

- who: requester
- when: `Declined` 또는 `Rejected`
- effect: 초기 routing을 다시 실행해 `Approval` 또는 `Assigned`로 이동한다
- purpose: approval 또는 assignment flow에 다시 진입한다
- restriction: content 필수

### Assign Self

- who: 현재 work assignee
- when: `Assigned`, `Working`, 또는 `Pending`
- effect: 현재 assignee 목록을 actor 1명으로 교체하고 status는 유지한다
- purpose: 빠른 self-assignment
- restriction: 현재 assignee가 2명 이상이어야 하며, content는 자동 생성된다

---

## Ticket과의 관계

티켓은 activity 목록을 포함합니다.

```ts
ticket.activities: TicketActivity[];
```

activity는 다음과 같습니다.

- 시간 순서대로 정렬된다
- timeline의 기반이 된다
- 티켓의 운영 상호작용 이력을 표현한다
- 현재 상태가 무엇인지뿐 아니라 왜 그렇게 바뀌었는지를 설명한다

---

## Ticket Lifecycle과의 관계

activity는 사용자가 무엇을 말했는지만 설명하지 않습니다. lifecycle
transition도 함께 유도합니다.

```txt
Action -> State Transition
```

예시:

- `assign`은 ticket을 `Working`으로 이동시킬 수 있다
- `reject`는 ticket을 `Rejected`로 이동시킨다
- `reopen`은 ticket을 `Resolved`에서 `Working`으로 이동시킬 수 있다
- `resubmit`은 ticket을 `Approval` 또는 `Assigned`로 이동시킬 수 있다
- Admin assignment는 `Pending` 작업을 재개할 수 있다

이는 다음을 보장합니다.

- lifecycle transition이 명시적이다
- state 변경이 사용자 의도와 연결된다
- workflow가 이해 가능하고 감사 가능하게 유지된다

---

## Ticket History와의 관계

activity 모델과 history 모델은 관련되어 있지만 동일하지는 않습니다.

### Activity

- 의미 있는 사용자 또는 운영 상호작용을 표현한다
- 메시지 또는 사유를 action별 문맥과 함께 저장한다
- action 중심 ticket timeline을 구동한다

### History

- ticket 변경으로 생성된 immutable event trace를 기록한다
- 감사 가능성과 before/after state transition을 강조한다
- activity 실행으로부터 유도되거나 실행에 의해 발생할 수 있다

### 실무적 구분

```txt
Activity = user-facing operational interaction
History = immutable audit/event record
```

이 구분은 강한 traceability를 유지하면서도 도메인을 더 풍부하게
표현할 수 있게 해줍니다.

---

## Timeline 표현

UI는 activity를 하나의 통합 timeline으로 렌더링합니다.

각 activity는 다음과 같습니다.

- type별 정보를 보여준다
- 필요한 경우 metadata 변경을 표시한다
- rich text content를 포함한다
- 커뮤니케이션과 운영 액션을 시각적으로 구분할 수 있다

### 장점

- 명확하고 구조적인 이력
- 어떤 일이 일어났는지 더 쉽게 이해 가능
- 모든 activity type에 대해 일관된 렌더링
- UI와 도메인 동작의 정렬 개선

---

## Form 구조

모든 activity form은 일관된 패턴을 따릅니다.

```txt
[ Action-specific fields ]
[ Reason (rich text editor) ]
```

### 예시

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

#### Reopen / Resubmit

- review intent
- reason

#### Comment / Note

- reason만

이 일관성은 UI 파편화를 줄이고, 동작을 더 쉽게 학습하게 해줍니다.

---

## 수정 및 삭제 규칙

activity 모델은 변경 가능한 커뮤니케이션과 변경 불가능한 운영 작업을
구분합니다.

### Mutable

- `comment`
- `note`

이들은 일반적인 작성자 기준 규칙 하에서 edit 또는 soft-delete를 지원할
수 있습니다.

### Immutable

- `assign`
- `adjust`
- `merge`
- `reject`
- `reopen`
- `resubmit`
- `assignSelf`

티켓이 '닫힘' 상태이면 어떤 활동도 편집하거나 삭제할 수 없습니다.
변경 가능한 커뮤니케이션 작업의 삭제 동작은 'active = false'를 통한 소프트 삭제입니다.

이들은 downstream effect를 가진 운영 의사결정을 나타내므로, 일반 workflow
에서는 수정하거나 삭제해서는 안 됩니다.

---

## Audit 및 Traceability

각 activity는 다음을 명시적으로 기록합니다.

- actor (`createdBy`)
- timestamp (`createdAt`)
- intent (`content`)
- effect (`metadata`)
- execution rule outcome (action type과 resulting history에 암묵적으로 반영됨)

### 결과

- 강한 audit trail
- 더 쉬운 디버깅
- 더 명확한 책임 추적
- 사용자 의도와 lifecycle change 사이의 명시적 연결

---

## 확장성

activity 모델은 확장 가능하도록 설계되어 있습니다.

예를 들어 core structure를 바꾸지 않고도 새로운 action type을 추가할 수
있습니다.

- `resolve`
- `close`
- `reopen`
- `escalate`
- approval 관련 action
- track-time 관련 workflow action

핵심 규칙은, 새로운 action은 명시적인 의도와 효과를 가진 의미 있는
도메인 event여야 한다는 점입니다.

---

## 관련 문서

- [티켓 라이프사이클](./ticket-lifecycle.md)
- [티켓 이력](./ticket-history.md)
- [티켓 작업 시간 추적](./ticket-track-time.md)
- [티켓 모델](./ticket-model.md)
- [액션 전략](./strategy/action-strategy.md)

---

## 설계 요약

티켓 activity 모델은 시스템을 다음과 같이 바꿉니다.

```txt
Comment-based logging -> Action-driven activity tracking
```

이를 통해 다음이 가능해집니다.

- 더 나은 도메인 명확성
- 통제된 workflow 실행
- 더 강한 감사 가능성
- 일관된 UI 패턴
- 확장 가능한 기능 확장
