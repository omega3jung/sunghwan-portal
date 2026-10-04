# 티켓 Routing 및 Update 정책 (2026-07)

## 배경

REMOTE의 티켓 생성·승인·배정·요청자 수정 처리를 PostgreSQL에 연결하면서,
티켓 모델에서 다음을 더 명확히 표현해야 했습니다.

- 다음 업무 작업을 맡은 현재 담당자
- 티켓이 승인 단계인지 작업 배정 단계인지
- 승인 완료 후 작업자 배정으로 넘어가는 방식
- 현재 승인자·작업자를 유지하는 요청자 수정
- 기존 승인이나 배정을 무효화하는 요청자 수정

이전 티켓 모델은 여러 처리 단계를 포괄하는 다음 상태를 사용했습니다.

```txt
Open
Approved
Working
```

이 값들은 개념적으로 이해하기 쉬웠지만 구현 과정에서 의미가 모호해졌습니다.

`Open`은 다음을 의미할 수 있었습니다.

- approval 대기
- assignment 대기
- submit되었지만 아직 처리되지 않음
- 일반적으로 active이고 closed가 아님

`Approved`는 승인이 완료되었다는 결과를 나타냈지만, 그 이후 티켓의 현재 담당자가
누구인지는 나타내지 못했습니다.

구현 과정에서는 requester update 문제도 드러났습니다.

제출한 티켓을 수정할 때마다 승인과 배정을 처음부터 다시 시작할 필요는 없었습니다.

예시:

- 알림 수신자 변경은 요청 자체를 바꾸지 않습니다.
- 요청 기한 변경이 반드시 승인을 무효화하는 것은 아닙니다.
- 카테고리·제목·본문·파일·이미지 변경은 요청의 의미를 바꿀 수 있습니다.

따라서 시스템에는 다음이 필요했습니다.

1. 승인자 결정과 작업자 배정을 구분하는 모델
2. 현재 담당 역할을 나타내는 상태
3. 요청자 수정이 필드별로 미치는 영향을 정한 정책
4. 서버에서 담당자 유지 여부 판단과 재계산
5. 담당자 결정에 생긴 변화를 설명하는 이력

---

## 핵심 원칙

```txt
Ticket routing represents current workflow responsibility.
```

```txt
Requester updates affect routing only when they change the meaning or classification of the request.
```

Routing model은 다음과 같습니다.

```txt
Ticket
-> Category configuration
-> Approval phase, when required
-> Work assignment phase
-> Active work
```

Update policy는 다음과 같습니다.

```txt
Routing-neutral field change
-> preserve current routing

Routing-sensitive field change
-> recalculate approval and assignment from the beginning
```

---

## 문제

### 1. `Open`은 current responsibility를 표현하지 못함

`Open` 티켓은 승인자나 작업자를 기다리거나 다른 업무 처리를 기다리는 상태일 수 있었습니다.

Status는 중요한 질문에 답하지 못했습니다.

```txt
Who is responsible for the next action?
```

그 결과 UI와 서버가 다른 필드를 함께 보고 처리 단계를 추론하게 되었습니다.

```ts
if (ticket.status === "Open" && ticket.approvalStepId) {
  // approval phase
}

if (ticket.status === "Open" && !ticket.approvalStepId) {
  // work phase
}
```

상태값만으로 현재 처리 단계를 이해할 수 있어야 합니다.

---

### 2. `Approved`는 durable state가 아니라 event였음

승인 완료는 중요한 결과이지만, 오래 유지하는 티켓 상태로 남길 필요는 없습니다.

최종 승인 이후:

- 승인 단계 종료
- 작업 담당자 결정
- 담당 역할이 작업자 배정으로 이동

따라서 approval completion은 History로 표현하는 것이 더 적절합니다.

```txt
APPROVAL_APPROVED
-> ASSIGNMENT_RESOLVED
-> status = Assigned
```

---

### 3. Separate approval/work assignee column은 ownership을 중복함

가능한 모델 중 하나는 다음이었습니다.

```txt
approvalAssignees
workAssignees
```

이 모델은 두 그룹을 모두 제공하지만 현재 처리 단계를 담당하는 그룹은 하나뿐입니다.

두 그룹을 모두 현재 상태 컬럼으로 저장하면 오래된 값이나 서로 모순되는 값이 생길 수 있습니다.

과거 승인 담당자는 액션과 이력에 기록합니다.

티켓 행에는 현재 담당 역할을 저장합니다.

---

### 4. 모든 update에서 routing reset은 지나치게 공격적임

다음 단순 규칙은 안전하지만 불필요한 재처리를 만듭니다.

```txt
Any requester update
-> reset approval
-> resolve routing again
```

이 규칙은 요청 의미를 바꾸지 않는 다음 수정에도 승인을 반복하게 합니다.

- due date changes
- email recipient changes

그 결과 담당자의 작업이 끊기고 불필요한 이력과 알림이 늘어납니다.

---

### 5. 모든 update에서 routing preserve는 지나치게 허용적임

반대 규칙도 안전하지 않습니다.

```txt
Any requester update
-> preserve current routing
```

요청자가 카테고리·제목·본문·파일·이미지를 바꾸면 기존 처리 절차가 수정된 요청과
맞지 않을 수 있습니다.

이전 요청에 대한 승인을 내용이 크게 달라진 요청에 그대로 적용해서는 안 됩니다.

---

## 결정

다음 필드를 기준으로 승인자 결정과 작업자 배정을 구분하기로 했습니다.

```txt
tk_approval_step_id
tk_assignee_usernames
```

티켓 행에는 현재 처리 단계를 담당하는 사용자만 저장합니다.

현재 담당 역할을 나타내는 상태를 사용합니다.

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

저장하는 `TicketStatus` 유니온에서 `Open`과 `Approved`를 제거했습니다.

`Open`은 필요한 경우에만 프런트엔드의 상태 그룹이나 검색 개념으로 사용합니다.

승인 완료는 오래 유지하는 상태 대신 이력으로 기록합니다.

요청자가 수정할 수 있는 필드는 다음 두 종류로 구분합니다.

- routing-neutral: 현재 승인자·작업자 결정에 영향을 주지 않는 필드
- routing-sensitive: 요청 내용이나 분류를 바꿔 담당자를 다시 결정해야 하는 필드

routing-neutral 수정은 현재 승인이나 작업 배정을 유지합니다.

routing-sensitive 수정은 카테고리 규칙에 따라 승인자 결정과 작업자 배정을 처음부터
다시 실행합니다.

---

## 범위 규칙

### 1. Approval step으로 phase를 결정함

현재 단계는 `tk_approval_step_id`로 결정합니다.

```txt
tk_approval_step_id is not null
-> APPROVAL phase

tk_approval_step_id is null
-> WORK phase
```

`tk_assignee_usernames`는 항상 현재 책임자를 나타냅니다.

```txt
APPROVAL phase
-> current approver usernames

WORK phase
-> current worker usernames
```

데이터베이스에는 현재 승인자 배열과 작업자 배열을 각각 저장하지 않습니다.

---

### 2. DTO에서 phase-specific array를 project함

서버 변환기는 화면에서 담당 역할을 구분할 수 있도록 배정 필드를 제공합니다.

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

이 배열은 저장된 담당자와 현재 단계를 바탕으로 계산한 응답 값입니다. 별도로 저장해
담당자 판단의 기준으로 사용하지 않습니다.

---

### 3. Precise status를 사용함

#### Draft

요청자가 티켓을 작성 중입니다.

승인자 결정과 작업자 배정은 시작되지 않았습니다.

#### Approval

티켓이 현재 승인 단계의 처리를 기다립니다.

```txt
status = Approval
approvalStepId != null
assigneeUsernames = current approvers
```

#### Declined

승인자가 요청을 반려했습니다.

허용된 요청자 수정이나 재제출이 이루어질 때까지 담당자 결정은 중단합니다.

#### Assigned

승인이 필요 없거나 완료되었고 작업자가 결정되었습니다.

```txt
status = Assigned
approvalStepId = null
assigneeUsernames = current workers
```

#### Working

배정된 작업자가 작업 시작을 명시적으로 실행했습니다.

티켓을 읽는 것만으로 `Working`으로 전환하지 않습니다.

#### Pending

작업이 일시 중지되었거나 대기 중입니다.

#### Rejected

현재 요청 내용으로는 작업할 수 없다고 거부된 티켓입니다.

#### Resolved

작업이 완료되었고 종료·검토 정책에 따른 처리를 기다립니다.

#### Closed

티켓 수명 주기가 끝났으며 일반적인 변경은 차단합니다.

---

### 4. Submission 시 initial routing을 resolve함

초안이나 새 요청을 제출하면 서버가 다음 처리 단계를 결정합니다.

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

REMOTE에서는 데이터베이스 함수나 저장소 같은 세부 구현을 서버의 담당자 결정
로직 안에 둘 수 있습니다.

```txt
get_next_approval_step(...)
get_approval_step_assignee_usernames(...)
get_category_assignment_usernames(...)
```

UI는 이 함수를 직접 호출하지 않습니다.

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

최종 승인은 변경할 수 없는 이력에 남깁니다.

---

### 6. Decline 시 routing을 멈춤

Current approver가 decline하면:

```txt
status = Declined
approvalStepId = null
assigneeUsernames = []
```

시스템은 다음을 기록합니다.

- approver
- approval step
- reason
- previous routing context
- decline event
- timestamp

티켓을 작업자 배정 단계로 자동 진행하지 않습니다.

---

### 7. Requester update permission과 routing effect를 분리함

이 정책은 권한 검증 후 요청자 수정이 담당자 결정에 미치는 영향을 정의합니다.

담당자 결정 정책 자체가 수정 권한을 부여하지는 않습니다.

수정 권한은 티켓 운영 규칙에서 검증합니다.

Server는 다음을 validate해야 합니다.

- authenticated identity
- effective requester identity
- ticket ownership
- current status
- editable field scope
- impersonation restrictions where relevant

권한 검증을 통과한 뒤에만 담당자 결정 정책을 적용합니다.

---

### 8. Due date와 email은 routing-neutral로 취급함

다음 field만 변경된 경우 current routing을 보존합니다.

```txt
dueAt
email recipients
```

Due-date-only update는 다음을 바꾸지 않습니다.

- request classification
- approval requirement
- responsible department
- assigned workers
- request content

이메일 메타데이터는 요청자가 설정한 추가 수신자입니다.

승인자나 작업자를 결정하는 데 사용하지 않습니다.

따라서 이 변경들은 다음을 보존합니다.

```txt
status
approvalStepId
assigneeUsernames
```

---

### 9. Request meaning field는 routing-sensitive로 취급함

다음 필드의 형식을 정리한 저장 값이 변경되면 담당자 결정을 다시 시작합니다.

```txt
category
subject
content/body
files
images
```

Category는 다음을 바꿀 수 있습니다.

- approval steps
- approval assignee rules
- work assignment rules
- default priority
- default risk level
- responsible organization

제목·본문·파일·이미지는 요청 내용 자체를 크게 바꿀 수 있습니다.

따라서 승인자 결정과 작업자 배정을 다시 계산해야 합니다.

---

### 10. 실제 변경이 있을 때만 recalculate함

담당자를 다시 계산하려면 routing-sensitive 필드의 저장 값이 실제로 달라져야 합니다.

수정 요청에 해당 필드가 포함되어 있다는 사실만으로는 다시 계산하지 않습니다.

개념적으로:

```ts
const routingChanged =
  previous.categoryId !== next.categoryId ||
  previous.subject !== next.subject ||
  previous.content !== next.content ||
  !isEqual(previous.files, next.files) ||
  !isEqual(previous.images, next.images);
```

비교에는 normalized value를 사용해야 합니다.

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

서버는 다음 순서로 처리합니다.

1. 수정 권한 검증
2. 변경 후 값 준비와 검증
3. routing-sensitive 필드의 실제 변경 확인
4. 현재 승인 정보 초기화
5. 승인자 결정을 처음부터 다시 실행
6. 승인이 필요 없으면 작업 담당자 결정
7. 티켓과 담당자 결정 결과 저장
8. 초기화 이유를 설명하는 이력 생성

이전 승인 진행 내용은 이력에 보존하며 새 승인에 재사용하지 않습니다.

---

### 13. Category 변경 시 category default를 적용함

카테고리가 바뀌면 해당 카테고리의 기본값을 다시 평가합니다.

- default priority
- default risk level
- minimum SLA-based due date

값이 있으면 새 카테고리에서 가져옵니다.

이렇게 하면 이전 카테고리에서 가져온 값을 새 카테고리 기본값으로 오해하지 않습니다.

Requester-facing due date에 대한 정책은 다음과 같습니다.

```txt
nextDueAt = later of:
- existing requested due date
- new category minimum due date
```

이 규칙은 새 카테고리의 SLA 기준 최소 기한을 지키면서 기존 요청 기한을 불필요하게
앞당기지 않습니다.

Future SLA model은 다음을 분리할 수 있습니다.

- requester requested date
- SLA target
- operational due date
- override reason

이는 별도로 문서화하는 확장 범위로 다룹니다.

---

### 14. Server를 routing authority로 유지함

UI는 예상한 영향을 경고로 표시할 수 있지만 다음을 결정할 수 없습니다.

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

클라이언트는 다음과 같은 담당자 결정 결과를 요청자가 직접 정한 값으로 보내면 안 됩니다.

```ts
{
  status: "Assigned",
  approvalStepId: null,
  assigneeUsernames: ["worker-a"]
}
```

---

### 15. Routing effect를 history에 기록함

모든 요청자 수정은 처리 결과에 맞는 이력을 만듭니다.

Routing-neutral update:

```txt
event = ROUTING_PRESERVED
```

Routing-sensitive update:

```txt
event = ROUTING_RESET
```

History metadata는 다음을 포함할 수 있습니다.

- changed fields
- previous approval step
- next approval step
- previous assignees
- next assignees
- routing이 reset 또는 preserved 되었는지

생성된 assignment 또는 approval effect는 필요할 때 추가 history를 만들 수 있습니다.

---

### 16. Notification은 ticket email settings와 분리함

routing-neutral 수정은 티켓이 수정되었다는 이유만으로 승인·배정 알림을 새로 만들지 않습니다.

routing-sensitive 수정은 알림 전달 기능을 구현한 뒤 새 승인·배정 알림을 발생시킬 수 있습니다.

티켓 이메일 수신자는 요청자가 설정한 메타데이터로 유지합니다.

승인자와 작업자의 이메일 주소는 알림을 보낼 때 서버가 결정해야 합니다.

---

### 17. LOCAL과 REMOTE behavior를 정렬함

LOCAL과 REMOTE는 같은 conceptual routing behavior를 노출해야 합니다.

```txt
Routing-neutral update
-> preserve phase and assignees

Routing-sensitive update
-> recalculate from category rules
```

LOCAL은 단순화한 데모용 담당자 결정 로직을 사용할 수 있습니다.

REMOTE는 데이터베이스의 카테고리·승인·배정 설정을 사용합니다.

UI에 제공하는 DTO 형식은 같게 유지합니다.

---

## 정렬한 내용

### 1. Status vocabulary

Persisted status는 current workflow responsibility를 설명합니다.

`Open`과 `Approved`는 persisted status가 아닙니다.

---

### 2. Assignment representation

Ticket row는 하나의 current assignee field를 사용합니다.

DTO mapping은 readability를 위해 approval-specific 및 work-specific array를 project합니다.

---

### 3. Requester update impact

Requester update behavior는 field-aware합니다.

Neutral change는 routing을 preserve합니다.

Meaning-changing request edit은 routing을 reset합니다.

---

### 4. History explanation

Routing effect는 `ROUTING_PRESERVED`와 `ROUTING_RESET` history event로 audit 가능합니다.

---

## 결과 영향

### 긍정적 영향

- Status와 assignee data가 current ownership을 식별합니다.
- Approval completion이 모호한 state가 아니라 event로 표현됩니다.
- Database model이 duplicate current assignee column을 피합니다.
- Harmless update는 불필요한 workflow noise를 피합니다.
- Material change는 approval과 assignment로 올바르게 다시 진입합니다.
- History가 routing이 변경되거나 유지된 이유를 설명합니다.
- UI가 phase-aware assignment field를 사용할 수 있습니다.

---

### 부정적 영향 / 트레이드오프

- Update service가 previous/next normalized value를 비교해야 합니다.
- 새 requester-editable field는 모두 분류해야 합니다.
- Routing-sensitive update는 여러 history record를 만들 수 있습니다.
- DTO mapping이 더 명시적입니다.
- Requester update permission은 별도로 유지해야 합니다.
- Simplified due-date model은 requester date와 SLA target을 완전히 분리하지 않습니다.

---

## 후속 정책

- `Open` 또는 `Approved`를 persisted status로 다시 도입하지 않습니다.
- `Open`은 필요할 때만 UI grouping으로 유지합니다.
- `tk_approval_step_id`와 `tk_assignee_usernames`를 현재 단계와 담당자 판단의 기준으로 유지합니다.
- 새 requester-editable field는 routing-neutral 또는 routing-sensitive로 분류합니다.
- 더 좁은 규칙이 문서화되지 않는 한 category, subject, body, files, images는 routing-sensitive로 유지합니다.
- Product policy가 바뀌지 않는 한 due date와 email은 routing-neutral로 유지합니다.
- Client가 trusted routing result를 선택하게 하지 않습니다.
- 더 고도화된 SLA due-date model은 추가 due-date field 도입 전에 문서화합니다.

---

## 요약

Routing model은 다음과 같습니다.

```txt
approvalStepId != null
-> APPROVAL phase
-> assigneeUsernames = approvers

approvalStepId == null
-> WORK phase
-> assigneeUsernames = workers
```

Status model은 다음과 같습니다.

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

Requester update behavior는 다음과 같습니다.

```txt
dueAt or email only
-> preserve routing

category, subject, body, files, or images changed
-> reset routing from category rules
```

이 설계는 요청 의미가 바뀌면 카테고리 규칙에 따라 승인·배정을 다시 실행합니다.
요청 의미를 바꾸지 않는 수정에는 불필요한 승인·배정 초기화를 적용하지 않습니다.
