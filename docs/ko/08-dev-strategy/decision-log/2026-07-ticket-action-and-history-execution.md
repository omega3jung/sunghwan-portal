# 티켓 Action 및 History 실행 (2026-07)

## 배경

Service Desk는 이전에 comment 중심 interaction model을 대체하기 위해 `TicketAction`을 도입했다.

핵심 아이디어는 다음과 같았다.

```txt
Comment is data.
Action is behavior.
```

이 모델은 다음과 같은 ticket interaction을 표현할 수 있게 했다.

- `COMMENT`
- `NOTE`
- `ASSIGN`
- `ASSIGN_SELF`
- `ADJUST`
- `APPROVE`
- `DECLINE`
- `REJECT`
- `RESUBMIT`
- `REOPEN`
- `MERGE`
- `CANCEL`

이전 action decision은 action이 first-class domain entity로 존재해야 하는 이유를 설명했다.

2026년 7월 작업에서는 action이 PostgreSQL-backed ticket에 대해 실제로 어떻게 실행되어야 하는지 정의해야 했다.

Ticket action은 action timeline보다 더 많은 것에 영향을 줄 수 있다.

Type에 따라 하나의 command가 다음을 수행해야 할 수 있다.

- current user validation
- ticket visibility validation
- current status validation
- action-specific input validation
- Ticket Action record 생성
- ticket field update
- approval routing 변경
- work assignment 변경
- ticket status 변경
- immutable History record 생성
- lifecycle command가 요구하는 경우 related work session finish
- future notification integration point 노출

이로 인해 Ticket Action은 단순히 `ticket_action`에 insert하는 방식으로 구현할 수 없다는 점이 드러났다.

---

## 핵심 원칙

```txt
Ticket Action
= user intent + validated context + controlled effect
```

```txt
Ticket History
= immutable record of the effect that occurred
```

실행 관계는 다음과 같다.

```txt
Command
-> authenticate
-> authorize
-> validate current state
-> insert action when applicable
-> mutate ticket when applicable
-> create history
-> return stable DTOs
```

Activity row가 insert되었다고 action이 완료된 것은 아니다.

Ticket state와 history는 성공적으로 실행된 같은 command를 반영해야 한다.

---

## 문제

### 1. Action insert만으로는 operation을 표현하지 못함

다음의 단순 구현은 충분하지 않다.

```txt
POST action
-> INSERT ticket_action
```

기본 comment에는 동작할 수 있지만 operational action에는 effect가 필요하다.

예시:

- `ASSIGN`은 assignee와 status를 update할 수 있다.
- `APPROVE`는 approval을 진행하거나 work assignment를 resolve할 수 있다.
- `ADJUST`는 priority, risk level, due date를 update할 수 있다.
- `MERGE`는 source ticket을 close하고 merge reference를 저장할 수 있다.
- `CANCEL`은 ticket을 close하고 close reason을 기록할 수 있다.

Action row는 사용자의 intent를 설명한다.

Command는 그 결과인 domain effect도 적용해야 한다.

---

### 2. Ticket, action, history write가 서로 어긋날 수 있음

하나의 command boundary가 없으면 partial result가 가능하다.

예시:

```txt
Insert ASSIGN action succeeds
-> ticket assignment update fails
```

Timeline에는 실제로 일어나지 않은 assignment가 표시된다.

반대도 안전하지 않다.

```txt
Ticket update succeeds
-> action or history insert fails
```

Ticket은 변경되었지만 audit trail은 완성되지 않는다.

Operational command에는 transactional consistency가 필요하다.

---

### 3. History semantics에는 authoritative event field가 필요했음

이전 history model은 "무엇이 일어났는가"를 여러 곳에 표현할 수 있었다.

```txt
historyAction = UPDATED
metadata.event = APPROVAL_APPROVED
type = APPROVAL
```

이는 filtering, display, validation을 모호하게 만들었다.

Model에는 first-class semantic event field가 필요했다.

---

### 4. `SYSTEM`은 source와 domain area를 섞었음

History type은 affected area를 설명해야 한다.

- `TICKET`
- `STATUS`
- `ASSIGNMENT`
- `APPROVAL`
- `COMMENT`
- `NOTE`
- `PLANNING`

System-generated behavior는 domain area가 아니라 source를 설명한다.

```txt
type
-> what area changed

source
-> which behavior or rule produced it
```

System close도 여전히 status event다.

따라서 다음이어야 한다.

```txt
type = STATUS
source = SYSTEM_AUTO
event = RESOLUTION_CLOSE
```

---

### 5. String-only before/after value는 약했음

단순 string은 하나의 status change를 표현할 수 있다.

```txt
fromValue = "Open"
toValue = "Working"
```

하지만 더 풍부한 effect를 잘 표현하지 못한다.

- previous and next assignees
- approval step progression
- planning changes
- merge target context
- routing reset details

Audit와 future reporting을 위해 structured JSON value가 필요하다.

---

### 6. LOCAL과 REMOTE는 같은 command meaning이 필요했음

LOCAL은 mutable demo state를 사용한다.

REMOTE는 PostgreSQL repository와 transaction을 사용한다.

Persistence mechanism은 다르지만 observable command behavior가 달라져서는 안 된다.

허용할 수 없는 drift 예:

```txt
LOCAL assign
-> update assignee only

REMOTE assign
-> update assignee and status
```

Runtime 차이는 Route Handler와 command boundary 뒤에 남아야 한다.

---

## 결정

Ticket Action을 server-controlled command로 실행한다.

Command boundary는 다음을 포함한다.

- authorization
- current-state validation
- action-specific validation
- action persistence
- ticket mutation
- history creation
- 필요한 경우 work-session side effect
- future notification intent/resolution

Operational action은 필요한 write를 transaction 안에서 실행하여 다음이 일관되게 유지되도록 한다.

```txt
Ticket Action
Ticket mutation
Ticket History
```

`tkh_event`를 authoritative History event field로 사용한다.

`metadata.event`를 primary event로 사용하지 않는다.

History dimension을 분리한다.

```txt
type
-> affected domain area

event
-> what happened

source
-> which action, rule, or system behavior produced it
```

`fromValue`와 `toValue`는 structured JSON value로 저장한다.

---

## 범위 규칙

### 1. Route Handler를 얇게 유지함

Route Handler의 책임:

- HTTP input parsing
- session 및 role context 해석
- LOCAL 또는 REMOTE execution 선택
- command layer에 위임
- mapped DTO 반환

Ticket mutation 또는 history rule을 직접 소유하면 안 된다.

---

### 2. Trusted server context로 command를 실행함

Client는 intent와 action-specific input을 보낸다.

예시:

```ts
type AssignTicketActionInput = {
  actionType: "ASSIGN";
  content: string;
  assigneeUsernames: string[];
};
```

Client는 다음과 같은 trusted final effect를 보내면 안 된다.

```ts
{
  status: "Working",
  approvalStepId: null,
  historyEvent: "ASSIGNMENT_UPDATED"
}
```

이 값들은 server에서 다음을 기준으로 해석된다.

- authenticated user
- role
- ticket ownership
- current status
- current approval phase
- current assignees
- action rules

---

### 3. Shared validation pipeline을 사용함

모든 command는 common check를 거친다.

- ticket exists
- ticket is active
- actor can view or operate on the ticket
- action path and payload match
- action content is present when required
- current status allows the action
- actor satisfies requester, approver, assignee, or admin rules
- Draft tickets reject normal operational actions
- Closed tickets reject normal mutations unless an admin exception is explicit

UI action visibility는 convenience layer일 뿐이다.

```txt
Permission-aware UI
!= authorization boundary
```

---

### 4. Action-specific effect를 명시적으로 유지함

각 action handler는 valid command의 effect를 설명한다.

개념적으로:

```ts
type TicketActionEffect = {
  action: TicketActionInsert;
  ticketPatch?: TicketPatch;
  histories: TicketHistoryInsert[];
  notification?: TicketNotificationIntent;
};
```

정확한 TypeScript shape는 변할 수 있다.

중요한 규칙은 effect가 server-generated이고 explicit하다는 점이다.

---

### 5. Action intent를 persist함

Ticket Action은 user-facing intent와 activity를 저장한다.

핵심 정보:

- ticket ID
- ticket별 action number
- action type
- content 또는 reason
- action-specific metadata
- 지원되는 경우 files 또는 images
- owner username
- active flag
- created timestamp

Action number는 ticket별로 scoped된다.

```txt
ticket A -> action 1, action 2, action 3
ticket B -> action 1
```

---

### 6. Communication과 operational mutability를 분리함

Communication action:

- `COMMENT`
- `NOTE`

이들은 controlled rule 아래에서 edit 또는 soft-delete될 수 있다.

일반 restriction:

- author만 change 가능
- closed ticket은 normal edit 차단
- deletion은 `active = false` soft deletion
- change는 History 생성

Operational action:

- `ASSIGN`
- `ASSIGN_SELF`
- `ADJUST`
- `APPROVE`
- `DECLINE`
- `REJECT`
- `RESUBMIT`
- `REOPEN`
- `MERGE`
- `CANCEL`

이들은 실행 성공 후 immutable이다.

잘못된 operational decision은 old action을 rewrite하지 않고 새 command로 교정해야 한다.

---

### 7. History를 event-oriented로 유지함

Service-level history type은 다음과 같다.

```ts
type TicketHistoryType =
  | "TICKET"
  | "STATUS"
  | "CATEGORY"
  | "ASSIGNMENT"
  | "APPROVAL"
  | "COMMENT"
  | "NOTE"
  | "PLANNING";
```

현재 source value는 다음과 같다.

```ts
type TicketHistorySource =
  | "USER_ACTION"
  | "SYSTEM_AUTO"
  | "ROUTING_RULE"
  | "APPROVAL_RULE"
  | "ASSIGNMENT_RULE";
```

현재 event value에는 다음이 포함된다.

```txt
TICKET_SUBMITTED
TICKET_UPDATED
TICKET_REOPENED
TICKET_REJECTED
TICKET_MERGED
TICKET_CANCELED
CATEGORY_UPDATED
STATUS_UPDATED
RESOLUTION_CLOSE
APPROVAL_REQUESTED
APPROVAL_APPROVED
APPROVAL_DECLINED
ASSIGNMENT_RESOLVED
ASSIGNMENT_UPDATED
COMMENT_CREATED
COMMENT_UPDATED
COMMENT_DELETED
NOTE_CREATED
NOTE_UPDATED
NOTE_DELETED
PLANNING_UPDATED
WORK_SESSION_STARTED
WORK_SESSION_STOPPED
WORK_SESSION_UPDATED
WORK_SESSION_DELETED
ROUTING_RESET
ROUTING_PRESERVED
```

Event name은 domain union과 일치해야 한다.

지원되는 event가 `ASSIGNMENT_UPDATED`일 때 assignment change를 위한 ad hoc event name을 도입하지 않는다.

---

### 8. Metadata는 supplemental로 유지함

History metadata는 display 및 audit context를 포함할 수 있다.

- changed fields
- previous and next status labels
- assignee usernames
- approval step IDs
- merge target ID
- routing reset details
- action-specific reason context

Metadata가 두 번째 authoritative event system이 되면 안 된다.

Row-level `tkh_event`가 required event로 남는다.

---

### 9. Structured before/after value를 사용함

`fromValue`와 `toValue`는 change가 하나의 primitive보다 풍부할 때 structured JSON으로 저장해야 한다.

예시:

```json
{
  "assigneeUsernames": ["worker-a"]
}
```

```json
{
  "priority": "high",
  "riskLevel": "medium",
  "dueAt": "2026-07-20T00:00:00.000Z"
}
```

History granularity는 raw database column count가 아니라 meaningful domain effect를 따라야 한다.

---

### 10. Notification recipient를 ticket email settings에 넣지 않음

Ticket email metadata는 requester-configured recipient를 저장한다.

Routing recipient는 별개다.

- current approvers
- current workers
- action-specific recipients

Assignment 또는 approval action은 derived assignee email을 `tk_email`에 영구적으로 append하면 안 된다.

Notification delivery는 send time에 trusted employee email address를 server에서 resolve해야 한다.

Delivery가 deferred 또는 simulated이더라도 ticket email configuration을 훼손해서는 안 된다.

---

### 11. Work session을 Ticket Action과 분리함

Work tracking은 ticket execution과 관련 있지만 normal Ticket Action은 아니다.

Work-session command는 다음을 포함한다.

- start
- finish
- switch
- manual update

이들은 work-session record에 작동한다.

```txt
Ticket Action
-> meaningful timeline interaction or operational decision

Work Session
-> evidence of actual working time
```

Ticket을 열거나 읽는 행위가 status를 mutate하면 안 된다.

Timer stop이 ticket을 자동 resolve해서도 안 된다.

---

### 12. Automatic close는 system command로 취급함

Resolved ticket은 configured grace period 이후 자동 close될 수 있다.

Baseline은 generic `updatedAt`이 아니라 resolution history event timestamp다.

현재 방향:

```txt
resolution event + 7 days
-> Closed
```

Automatic close는 Ticket Action 없이 History를 생성한다.

예시:

```txt
type = STATUS
event = RESOLUTION_CLOSE
source = SYSTEM_AUTO
actorUsername = null
actionNo = null
```

Read request는 read-only로 유지되어야 한다.

---

## 정렬한 내용

### 1. Command execution

Action execution은 generic activity insert가 아니라 server use case다.

REMOTE command는 transaction 안에서 PostgreSQL repository를 사용한다.

LOCAL command는 demo state를 사용하더라도 같은 conceptual command behavior를 따른다.

---

### 2. Transaction boundary

Operational action에서 필요한 write는 함께 묶인다.

```txt
BEGIN
1. load current ticket
2. validate latest status and permission
3. insert Ticket Action
4. mutate Ticket
5. insert Ticket History
6. apply related work-session side effects where required
COMMIT
```

필수 step이 실패하면 command는 rollback된다.

---

### 3. History model

History는 다음 중심으로 모델링한다.

```txt
type + event + source + actor + fromValue + toValue + metadata
```

이를 통해 history를 audit, filtering, display, reporting에 사용할 수 있다.

---

### 4. Action examples

Comment:

```txt
validate ticket access
-> insert COMMENT action
-> create COMMENT_CREATED history
```

Assign:

```txt
validate assignment permission
-> insert ASSIGN action
-> update assignees
-> create ASSIGNMENT_UPDATED history
```

Approve:

```txt
validate current approver
-> insert APPROVE action
-> create APPROVAL_APPROVED history
-> resolve next approval step or work assignment
-> create APPROVAL_REQUESTED or ASSIGNMENT_RESOLVED history
```

Merge:

```txt
validate source and target tickets
-> insert MERGE action
-> close source ticket with merge context
-> create TICKET_MERGED history
```

---

## 결과 영향

### 긍정적 영향

- Action, ticket effect, history가 일관되게 유지된다.
- Server authorization이 실제 command boundary가 된다.
- History가 first-class `type`, `event`, `source`를 사용한다.
- Operational action이 auditable하고 immutable해진다.
- LOCAL과 REMOTE가 같은 action semantics를 노출한다.
- Work tracking과 ticket action이 분리된다.
- Ticket email settings를 mutate하지 않고 notification design을 추가할 수 있다.
- Portfolio가 command handling과 audit-oriented modeling을 보여준다.

---

### 부정적 영향 / 트레이드오프

- Operational action은 generic CRUD보다 더 많은 구조가 필요하다.
- Event name을 신중하게 유지해야 한다.
- 복잡한 command는 여러 history record를 만들 수 있다.
- Transaction에는 repository coordination이 필요하다.
- Notification delivery는 별도의 reliability 문제로 남는다.
- LOCAL atomicity는 database infrastructure가 아니라 simulation으로 제공된다.

---

## 후속 정책

- Operational action을 plain action-row insert로 구현하지 않는다.
- Route handler는 얇게 유지하고 command service가 effect를 책임진다.
- `tkh_event`를 authoritative event field로 유지한다.
- `metadata`는 supplemental로 유지한다.
- Domain union의 supported event name을 사용한다.
- GET/read flow에서 ticket status를 mutate하지 않는다.
- Timer finish를 ticket resolution으로 취급하지 않는다.
- Derived notification recipient를 `tk_email`에 넣지 않는다.
- 새 action type을 추가할 때 allowed status, permission rule, ticket effect, history event, query invalidation target을 정의한다.

---

## 요약

Ticket Action은 이제 controlled Service Desk command로 취급된다.

모델은 다음과 같다.

```txt
Ticket Action
= user-facing intent and command input

Ticket
= current workflow state

Ticket History
= immutable event record of what actually changed
```

Execution model은 다음과 같다.

```txt
User submits action
-> server resolves trusted context
-> shared guards validate access and state
-> action-specific logic applies effect
-> transaction persists action, ticket changes, and history
-> affected client queries refresh
```

이 설계는 timeline을 의미 있게 유지하면서 ticket state change를 LOCAL과 REMOTE runtime 모두에서 precise하고 auditable하며 안전하게 만든다.
