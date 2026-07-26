# 티켓 Routing 및 Update 정책 (2026-07)

## 배경

REMOTE ticket creation, approval, assignment, requester update flow가 PostgreSQL에 연결되면서 ticket model은 다음을 더 명확히 표현해야 했다.

- 현재 다음 workflow action을 누가 소유하는가
- ticket이 approval phase인지 work assignment phase인지
- approval completion이 어떻게 work assignment로 이동하는가
- 어떤 requester update가 current routing을 보존하는가
- 어떤 requester update가 existing approval 또는 assignment를 무효화하는가

이전 ticket model은 다음과 같은 broad workflow status를 사용했다.

```txt
Open
Approved
Working
```

이 값들은 conceptually 이해하기 쉬웠지만 구현 중 모호해졌다.

`Open`은 다음을 의미할 수 있었다.

- approval 대기
- assignment 대기
- submit되었지만 아직 처리되지 않음
- 일반적으로 active이고 closed가 아님

`Approved`는 completed approval result를 설명했지만, 이후 ticket을 현재 누가 소유하는지는 설명하지 못했다.

구현 과정에서는 requester update 문제도 드러났다.

Submit된 ticket의 모든 edit이 approval과 assignment를 다시 시작해야 하는 것은 아니다.

예시:

- notification recipient 변경은 request 자체를 바꾸지 않는다
- requested due date 변경은 반드시 approval을 무효화하지 않는다
- category, subject, body, files, images 변경은 request meaning을 바꿀 수 있다

따라서 시스템에는 다음이 필요했다.

1. explicit approval/work routing model
2. current responsibility와 정렬된 status
3. requester update를 위한 field-impact policy
4. server-controlled routing preservation and recalculation
5. routing effect를 설명하는 history record

---

## 핵심 원칙

```txt
Ticket routing represents current workflow responsibility.
```

```txt
Requester updates affect routing only when they change the meaning or classification of the request.
```

Routing model은 다음과 같다.

```txt
Ticket
-> Category configuration
-> Approval phase, when required
-> Work assignment phase
-> Active work
```

Update policy는 다음과 같다.

```txt
Routing-neutral field change
-> preserve current routing

Routing-sensitive field change
-> recalculate approval and assignment from the beginning
```

---

## 문제

### 1. `Open`은 current responsibility를 표현하지 못함

`Open` 상태의 ticket은 approver, worker 또는 다른 workflow operation을 기다리는 중일 수 있었다.

Status는 중요한 질문에 답하지 못했다.

```txt
Who is responsible for the next action?
```

그 결과 UI와 server가 inference에 의존하게 되었다.

```ts
if (ticket.status === "Open" && ticket.approvalStepId) {
  // approval phase
}

if (ticket.status === "Open" && !ticket.approvalStepId) {
  // work phase
}
```

Status는 unrelated inference 없이 current workflow meaning을 전달해야 한다.

---

### 2. `Approved`는 durable state가 아니라 event였음

Approval completion은 중요하지만 long-lived ticket state로 남을 필요는 없다.

Final approval 이후:

- approval phase는 끝난다
- worker가 resolve된다
- responsibility가 work assignment로 이동한다

따라서 approval completion은 History로 표현하는 것이 더 적절하다.

```txt
APPROVAL_APPROVED
-> ASSIGNMENT_RESOLVED
-> status = Assigned
```

---

### 3. Separate approval/work assignee column은 ownership을 중복함

가능한 모델 중 하나는 다음이었다.

```txt
approvalAssignees
workAssignees
```

이는 두 group을 모두 노출하지만, 현재 workflow phase를 소유하는 group은 하나뿐이다.

둘 다 persisted current-state column으로 유지하면 stale 또는 contradictory data가 생길 수 있다.

Previous approval ownership은 action과 history record에 속한다.

Ticket row는 current responsibility를 표현해야 한다.

---

### 4. 모든 update에서 routing reset은 지나치게 공격적임

다음 단순 규칙은 안전하지만 noisy하다.

```txt
Any requester update
-> reset approval
-> resolve routing again
```

이는 다음과 같은 harmless edit에도 불필요한 approval loop를 만든다.

- due date changes
- email recipient changes

그 결과 operator interruption, noisy history, notification volume 증가가 발생한다.

---

### 5. 모든 update에서 routing preserve는 지나치게 허용적임

반대 규칙도 안전하지 않다.

```txt
Any requester update
-> preserve current routing
```

Requester가 category, subject, body, files, images를 바꾸면 workflow가 더 이상 request와 맞지 않을 수 있다.

이전 request version에 대한 approval decision이 materially changed request에 조용히 적용되어서는 안 된다.

---

## 결정

다음 기반의 explicit approval/work routing model을 사용한다.

```txt
tk_approval_step_id
tk_assignee_usernames
```

Ticket row는 current workflow phase를 책임지는 사용자만 저장한다.

Current responsibility를 설명하는 status를 사용한다.

```txt
Draft
Approval
Declined
Assigned
Working
Pending
Rejected
Resolved
Closed
```

Persisted `TicketStatus` union에서 `Open`과 `Approved`를 제거한다.

`Open`은 필요할 때 frontend grouping 또는 search concept로만 사용한다.

Approval completion은 long-lived status가 아니라 History로 취급한다.

Requester-editable field를 다음으로 분류한다.

- routing-neutral
- routing-sensitive

Routing-neutral update는 current approval 또는 work assignment를 보존한다.

Routing-sensitive update는 category-driven routing을 처음부터 다시 시작한다.

---

## 범위 규칙

### 1. Approval step으로 phase를 결정함

Current phase는 `tk_approval_step_id`로 결정한다.

```txt
tk_approval_step_id is not null
-> APPROVAL phase

tk_approval_step_id is null
-> WORK phase
```

`tk_assignee_usernames`는 항상 현재 책임자를 나타낸다.

```txt
APPROVAL phase
-> current approver usernames

WORK phase
-> current worker usernames
```

Database는 별도 current approval/work assignee array를 persist하지 않는다.

---

### 2. DTO에서 phase-specific array를 project함

Server mapper는 더 명확한 application-facing assignment field를 노출한다.

개념적으로:

```ts
type TicketAssignmentPhase = "APPROVAL" | "WORK";

type TicketRoutingDto = {
  assignmentPhase: TicketAssignmentPhase;
  approvalAssigneeUsernames: string[];
  workAssigneeUsernames: string[];
  assignedApprover: boolean;
  assignedWorker: boolean;
};
```

Derived behavior:

```ts
const assignmentPhase =
  ticket.approvalStepId !== null ? "APPROVAL" : "WORK";

const approvalAssigneeUsernames =
  assignmentPhase === "APPROVAL" ? ticket.assigneeUsernames : [];

const workAssigneeUsernames =
  assignmentPhase === "WORK" ? ticket.assigneeUsernames : [];
```

이 array들은 projection이며 별도로 persisted source of truth가 아니다.

---

### 3. Precise status를 사용함

#### Draft

Requester가 아직 ticket을 준비 중이다.

Routing은 시작되지 않았다.

#### Approval

Ticket이 current approval step을 기다리고 있다.

```txt
status = Approval
approvalStepId != null
assigneeUsernames = current approvers
```

#### Declined

Approver가 request를 decline했다.

Allowed requester revision 또는 resubmission이 발생하기 전까지 routing은 멈춘다.

#### Assigned

Approval이 필요 없거나 완료되었고, worker가 resolve되었다.

```txt
status = Assigned
approvalStepId = null
assigneeUsernames = current workers
```

#### Working

Assigned worker가 명시적으로 work를 시작했다.

Ticket을 읽는 것만으로 `Working`으로 이동하지 않는다.

#### Pending

Work가 일시 중지되었거나 waiting 상태다.

#### Rejected

Ticket이 현재 형태로는 실행 불가능하다고 reject되었다.

#### Resolved

Work가 완료되었고 close/review policy를 기다린다.

#### Closed

Lifecycle이 close되었고 normal mutation이 차단된다.

---

### 4. Submission 시 initial routing을 resolve함

Draft 또는 new request가 submit되면 server가 다음 workflow phase를 resolve한다.

```txt
Submit ticket
-> resolve next approval step
-> if step exists:
     status = Approval
     approvalStepId = next step
     assigneeUsernames = approvers
   else:
     status = Assigned
     approvalStepId = null
     assigneeUsernames = workers
```

REMOTE implementation은 database function 또는 repository 같은 세부 구현을 server routing boundary 뒤에 둘 수 있다.

```txt
get_next_approval_step(...)
get_approval_step_assignee_usernames(...)
get_category_assignment_usernames(...)
```

UI는 이 function을 직접 호출하지 않는다.

---

### 5. Approval을 work assignment로 진행함

Approver가 current step을 approve하면:

```txt
Approve action
-> create approval action
-> record APPROVAL_APPROVED history
-> resolve next approval step
```

다음 approval step이 있으면:

```txt
status = Approval
approvalStepId = next approval step
assigneeUsernames = next approvers
```

더 이상 approval step이 없으면:

```txt
status = Assigned
approvalStepId = null
assigneeUsernames = resolved workers
```

Final approval은 immutable history에 남는다.

---

### 6. Decline 시 routing을 멈춤

Current approver가 decline하면:

```txt
status = Declined
approvalStepId = null
assigneeUsernames = []
```

시스템은 다음을 기록한다.

- approver
- approval step
- reason
- previous routing context
- decline event
- timestamp

Ticket은 자동으로 work assignment로 진행되지 않는다.

---

### 7. Requester update permission과 routing effect를 분리함

이 정책은 authorization이 성공한 뒤의 requester update effect를 정의한다.

Routing policy 자체가 update permission을 부여하지 않는다.

Permission check는 ticket operation rule에 남는다.

Server는 다음을 validate해야 한다.

- authenticated identity
- effective requester identity
- ticket ownership
- current status
- editable field scope
- impersonation restrictions where relevant

Authorization이 성공한 뒤에만 routing policy를 실행한다.

---

### 8. Due date와 email은 routing-neutral로 취급함

다음 field만 변경된 경우 current routing을 보존한다.

```txt
dueAt
email recipients
```

Due-date-only update는 다음을 바꾸지 않는다.

- request classification
- approval requirement
- responsible department
- assigned workers
- request content

Email metadata는 requester-configured additional recipient를 나타낸다.

Approver나 worker를 결정하지 않는다.

따라서 이 변경들은 다음을 보존한다.

```txt
status
approvalStepId
assigneeUsernames
```

---

### 9. Request meaning field는 routing-sensitive로 취급함

다음 field의 normalized persisted value가 변경되면 routing을 다시 시작한다.

```txt
category
subject
content/body
files
images
```

Category는 다음을 바꿀 수 있다.

- approval steps
- approval assignee rules
- work assignment rules
- default priority
- default risk level
- responsible organization

Subject, body, files, images는 요청 내용 자체를 material하게 바꿀 수 있다.

따라서 approval과 assignment를 다시 계산해야 한다.

---

### 10. 실제 변경이 있을 때만 recalculate함

Routing-sensitive recalculation에는 persisted value change가 필요하다.

Update payload에 field가 존재한다는 사실만으로는 충분하지 않다.

개념적으로:

```ts
const routingChanged =
  previous.categoryId !== next.categoryId ||
  previous.subject !== next.subject ||
  previous.content !== next.content ||
  !isEqual(previous.files, next.files) ||
  !isEqual(previous.images, next.images);
```

비교에는 normalized value를 사용해야 한다.

- prepared attachment metadata
- normalized rich-text body
- normalized nullable values
- deterministic attachment comparison keys

---

### 11. Neutral change에서는 routing을 preserve함

Routing-neutral field만 변경되면:

```txt
Update ticket fields
-> preserve status
-> preserve approvalStepId
-> preserve assigneeUsernames
-> record history
```

예시:

```txt
Approval + due date update
-> remains Approval
-> current approvers remain assigned
```

```txt
Assigned + email update
-> remains Assigned
-> current workers remain assigned
```

---

### 12. Sensitive change에서는 routing을 restart함

Routing-sensitive field가 하나라도 변경되면:

```txt
Update request content
-> invalidate existing routing result
-> restart category-driven routing
```

Server는 다음을 수행한다.

1. update permission validate
2. next value prepare 및 validate
3. routing-sensitive change detect
4. current approval context reset
5. approval을 처음부터 resolve
6. approval이 필요 없으면 work assignment resolve
7. ticket과 routing state persist
8. reset을 설명하는 history 생성

Previous approval progress는 history에 보존되고 재사용되지 않는다.

---

### 13. Category 변경 시 category default를 적용함

Category가 변경되면 category-driven default value를 다시 평가한다.

- default priority
- default risk level
- minimum SLA-based due date

가능한 경우 new category snapshot에서 가져온다.

이는 old category에서 상속된 value가 new-category default로 오해되는 것을 방지한다.

Requester-facing due date에 대한 정책은 다음과 같다.

```txt
nextDueAt = later of:
- existing requested due date
- new category minimum due date
```

이렇게 하면 updated ticket이 new category의 minimum SLA expectation을 위반하지 않으면서 불필요하게 deadline을 앞당기지 않는다.

Future SLA model은 다음을 분리할 수 있다.

- requester requested date
- SLA target
- operational due date
- override reason

이는 별도 문서화된 확장으로 다룬다.

---

### 14. Server를 routing authority로 유지함

UI는 predicted warning을 표시할 수 있지만 다음을 결정할 수 없다.

- routing-sensitive value가 변경되었는지
- 어떤 approval step이 적용되는지
- approver가 누구인지
- worker가 누구인지
- approval을 skip할 수 있는지
- 어떤 status를 persist할지

Flow:

```txt
UpdateTicketDialog
-> normalized update payload
-> Route Handler
-> ticket update service
-> compare persisted and next values
-> preserve or recalculate routing
-> repository transaction
-> response DTO
```

Client는 다음과 같은 trusted routing result를 requester-controlled decision으로 보내면 안 된다.

```ts
{
  status: "Assigned",
  approvalStepId: null,
  assigneeUsernames: ["worker-a"]
}
```

---

### 15. Routing effect를 history에 기록함

모든 requester update는 effect에 맞는 history를 만든다.

Routing-neutral update:

```txt
event = ROUTING_PRESERVED
```

Routing-sensitive update:

```txt
event = ROUTING_RESET
```

History metadata는 다음을 포함할 수 있다.

- changed fields
- previous approval step
- next approval step
- previous assignees
- next assignees
- routing이 reset 또는 preserved 되었는지

생성된 assignment 또는 approval effect는 필요할 때 추가 history를 만들 수 있다.

---

### 16. Notification은 ticket email settings와 분리함

Routing-neutral update는 ticket이 edit되었다는 이유만으로 새 approval 또는 assignment notification을 만들면 안 된다.

Routing-sensitive update는 notification delivery가 구현되었을 때 새 approval 또는 assignment notification을 trigger할 수 있다.

Ticket email recipient는 requester-configured metadata로 유지한다.

Approver와 worker email address는 notification time에 server가 resolve해야 한다.

---

### 17. LOCAL과 REMOTE behavior를 정렬함

LOCAL과 REMOTE는 같은 conceptual routing behavior를 노출해야 한다.

```txt
Routing-neutral update
-> preserve phase and assignees

Routing-sensitive update
-> recalculate from category rules
```

LOCAL은 simplified demo resolver를 사용할 수 있다.

REMOTE는 database-backed category, approval, assignment resolution을 사용한다.

DTO shape는 UI에 대해 동일하게 유지된다.

---

## 정렬한 내용

### 1. Status vocabulary

Persisted status는 current workflow responsibility를 설명한다.

`Open`과 `Approved`는 persisted status가 아니다.

---

### 2. Assignment representation

Ticket row는 하나의 current assignee field를 사용한다.

DTO mapping은 readability를 위해 approval-specific 및 work-specific array를 project한다.

---

### 3. Requester update impact

Requester update behavior는 field-aware하다.

Neutral change는 routing을 preserve한다.

Meaning-changing request edit은 routing을 reset한다.

---

### 4. History explanation

Routing effect는 `ROUTING_PRESERVED`와 `ROUTING_RESET` history event로 audit 가능하다.

---

## 결과 영향

### 긍정적 영향

- Status와 assignee data가 current ownership을 식별한다.
- Approval completion이 모호한 state가 아니라 event로 표현된다.
- Database model이 duplicate current assignee column을 피한다.
- Harmless update는 불필요한 workflow noise를 피한다.
- Material change는 approval과 assignment로 올바르게 다시 진입한다.
- History가 routing이 변경되거나 유지된 이유를 설명한다.
- UI가 phase-aware assignment field를 사용할 수 있다.

---

### 부정적 영향 / 트레이드오프

- Update service가 previous/next normalized value를 비교해야 한다.
- 새 requester-editable field는 모두 분류해야 한다.
- Routing-sensitive update는 여러 history record를 만들 수 있다.
- DTO mapping이 더 명시적이다.
- Requester update permission은 별도로 유지해야 한다.
- Simplified due-date model은 requester date와 SLA target을 완전히 분리하지 않는다.

---

## 후속 정책

- `Open` 또는 `Approved`를 persisted status로 다시 도입하지 않는다.
- `Open`은 필요할 때만 UI grouping으로 유지한다.
- `tk_approval_step_id`와 `tk_assignee_usernames`를 current routing source of truth로 유지한다.
- 새 requester-editable field는 routing-neutral 또는 routing-sensitive로 분류한다.
- 더 좁은 규칙이 문서화되지 않는 한 category, subject, body, files, images는 routing-sensitive로 유지한다.
- Product policy가 바뀌지 않는 한 due date와 email은 routing-neutral로 유지한다.
- Client가 trusted routing result를 선택하게 하지 않는다.
- 더 고도화된 SLA due-date model은 추가 due-date field 도입 전에 문서화한다.

---

## 요약

Routing model은 다음과 같다.

```txt
approvalStepId != null
-> APPROVAL phase
-> assigneeUsernames = approvers

approvalStepId == null
-> WORK phase
-> assigneeUsernames = workers
```

Status model은 다음과 같다.

```txt
Draft
Approval
Declined
Assigned
Working
Pending
Rejected
Resolved
Closed
```

Requester update behavior는 다음과 같다.

```txt
dueAt or email only
-> preserve routing

category, subject, body, files, or images changed
-> reset routing from category rules
```

이 설계는 request meaning이 바뀔 때 category-driven workflow를 엄격하게 유지하면서, 운영상 harmless한 edit에 대해서는 불필요한 approval/assignment reset을 피한다.
