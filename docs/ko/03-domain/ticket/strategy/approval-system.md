# Approval System

## 목표

이 문서는 Service Desk ticket의 현재 approval routing model을 정의한다.

Approval은 category-driven, sequential이며 현재 ticket routing field로 표현된다.

```txt id="approval-routing-fields"
tk_approval_step_id
tk_assignee_usernames
```

---

## 현재 Approval Status

Approval은 persisted ticket status `Approval`을 사용한다.

Persisted `Approved` status는 없다. Approval completion은 history event
`APPROVAL_APPROVED`로 기록된다. Final approval 이후 ticket은 work assignment를
resolve하고 `Assigned`로 이동한다.

---

## Approval Phase

Ticket은 다음 상태일 때 approval phase다.

```txt id="approval-phase"
approvalStepId != null
assignmentPhase = APPROVAL
assigneeUsernames = current approvers
```

Application DTO는 이를 다음으로 project한다.

- `assignmentPhase = "APPROVAL"`
- `approvalAssigneeUsernames`
- `assignedApprover`

이 값들은 projection이다. 별도의 persisted routing source가 아니다.

---

## Approval Step Settings

Approval step은 main category 아래에 설정된다.

Approval resolution은 항상 선택된 subcategory의 parent/main category를 사용한다.
선택된 subcategory는 ticket classification으로 남지만 별도의 approval pipeline을
정의하지 않는다.

```ts id="approval-step-shape"
type ApprovalStep = {
  id: string;
  name: LocalizedText;
  description?: LocalizedText;
  index: number;
  categoryId: string;
  stepAssignee: ApprovalAssigneeType;
  skipAccessLevel?: AccessLevel;
};
```

Assignee type:

```txt id="approval-assignee-types"
MANAGER
DEPARTMENT
JOB_FIELD
EMPLOYEE
```

REMOTE DTO는 `approval_step_assignee`와 `skip_access_level`을 사용한다. LOCAL과
REMOTE settings는 같은 application-facing behavior로 resolve되어야 한다.

관련 문서: [Service Desk Settings](../../service-desk-settings.md)

---

## Approval Settings Authorization

Approval Step 권한은 step이나 client-selected company에 중복 저장된 `tenantId`가
아니라 저장된 main category의 `Category -> Tenant -> Company` 관계로 해석한다.

| Main-category target | Owner Admin | 동일 company Tenant Admin | 다른 Tenant Admin |
| --- | --- | --- | --- |
| Owner Tenant, 모든 scope | manage | none | none |
| Customer Tenant, `INTERNAL` | none | manage | none |
| Customer Tenant, `PORTAL` | read | manage | none |

Customer `PORTAL` approval은 customer의 approval system이다. Owner Admin은 현재
configuration을 조회할 수 있지만 변경할 수 없다. Read-only 조회는 참조된 approver의
display information을 포함할 수 있지만 customer employee directory 전체의 candidate
search 권한을 부여하지 않는다.

Read와 mutation path 모두 category 관계를 load하고 shared settings policy를 사용한다.
Unauthorized API request는 `403`을 반환하며, query response는 access가 `none`인
approval settings를 포함하지 않는다.

---

## Approver Eligibility

`INTERNAL`과 `PORTAL` category 모두에서 모든 approval candidate와 최종 resolved
approver는 category tenant의 company에 속해야 한다.

| Assignee type | Company validation |
| --- | --- |
| `EMPLOYEE` | 각 employee의 `companyId`가 category tenant company와 같음 |
| `DEPARTMENT` | department와 resolved employee가 해당 company 안에 유지됨 |
| `JOB_FIELD` | job field가 shared여도 최종 employee resolution에 company filter 적용 |
| `MANAGER` | resolved manager가 해당 company에 속함 |

Candidate lookup은 category-centered이며 caller의 Approval Step capability도 검사한다.
Request의 `categoryId`, `purpose`, `companyId`는 target을 선택할 뿐 권한을 부여하지
않는다.

Eligibility는 Approval Step 저장 시점과 submit, resubmit 또는 explicit routing
command에서 approver를 resolve하는 시점에 다시 검증한다. Configuration 이후 employee가
inactive가 되거나 다른 company로 이동할 수 있기 때문이다. Valid approver가 0명이면
routing은 실패하며 unowned `Approval` ticket을 만들지 않는다.

---

## Initial Approval Routing

Ticket submit과 resubmit은 모두 첫 applicable approval step부터 routing을 시작한다.

```txt id="initial-approval-routing"
selected category
-> parent/main category approval steps
next approval step exists
-> status = Approval
-> approvalStepId = next step
-> assigneeUsernames = approvers

no approval step
-> status = Assigned
-> approvalStepId = null
-> assigneeUsernames = workers
```

Approval assignee를 resolve할 수 없으면 unowned approval ticket을 만들지 않고 command가
실패한다.

---

## Approve

Approve는 ticket action command다.

- action type: `APPROVE`
- allowed status: `Approval`
- actor: current approver 또는 Admin
- payload: content only
- file과 inline image를 거부한다.
- action row가 insert된다.
- history는 `APPROVAL_APPROVED`를 기록한다.

Approve 이후:

```txt id="approve-routing"
next approval step exists
-> status = Approval
-> approvalStepId = next step
-> assigneeUsernames = next approvers
-> history = APPROVAL_REQUESTED

no next approval step
-> status = Assigned
-> approvalStepId = null
-> assigneeUsernames = workers
-> history = ASSIGNMENT_RESOLVED
```

---

## Decline

Decline은 ticket action command다.

- action type: `DECLINE`
- allowed status: `Approval`
- actor: current approver 또는 Admin
- payload: content only
- file과 inline image를 거부한다.
- action row가 insert된다.
- history는 `APPROVAL_DECLINED`를 기록한다.

Decline은 approval routing을 종료한다.

```txt id="decline-routing"
status = Declined
approvalStepId = null
assigneeUsernames = []
```

Requester는 나중에 initial routing으로 resubmit할 수 있다.

---

## Ticket Action Authorization Boundary

Approval Step settings authorization과 ticket action authorization은 별도 policy다.
Settings의 Owner Admin 또는 Tenant Admin이라고 해서 `APPROVE`/`DECLINE`의 current
approver 조건을 자동으로 만족하지 않으며, settings helper를 action override로 재사용하면
안 된다.

현재 ticket action matrix에는 generic Admin override가 남아 있다. 별도 후속 작업에서
cross-tenant behavior를 검토하고 intentional break-glass capability를 정의해야 한다.
이번 settings decision은 기존 action matrix를 암묵적으로 확장하거나 변경하지 않는다.

---

## Skip Rule

`skipAccessLevel`은 requester access level이 설정 threshold를 만족할 때 approval
step을 skip할 수 있게 한다.

Skip behavior는 approval routing/resolution에 속한다. 모든 approval이 skip되면
assignment rule이 work owner를 resolve하고 ticket은 `Assigned`로 이동한다.

---

## History

Approval 관련 event:

```txt id="approval-history-events"
APPROVAL_REQUESTED
APPROVAL_APPROVED
APPROVAL_DECLINED
ASSIGNMENT_RESOLVED
```

Approve action은 둘 이상의 history record를 만들 수 있다.

```txt id="approval-history-flow"
APPROVAL_APPROVED
-> APPROVAL_REQUESTED
or
APPROVAL_APPROVED
-> ASSIGNMENT_RESOLVED
```

---

## Requester Update와의 관계

Requester update는 routing-sensitive field가 실제로 바뀔 때 approval routing을 reset할
수 있다.

- category
- subject
- content
- files
- images

Routing reset은 approval resolution을 처음부터 시작하고 `ROUTING_RESET`을 기록한다.
Routing-neutral change는 `ROUTING_PRESERVED`를 기록한다.

---

## Deferred Scope

현재 approval model은 다음을 구현하지 않는다.

- parallel approval voting
- quorum approval
- delegation calendars
- approval SLA timers
- approval notification delivery guarantees

이는 future production extension이다.

---

## 관련 문서

- [Ticket Lifecycle](../ticket-lifecycle.md)
- [Ticket Operation Rules](../../../08-dev-strategy/ticket-operation-rules.md)
- [Assignment Policy](./assignment-policy.md)
- [Ticket History](../ticket-history.md)
- [Service Desk Settings](../../service-desk-settings.md)

---

## 요약

Approval은 sequential category-driven routing phase다. Current approver는 work
routing에 사용되는 같은 current assignee field에 저장되며, `approvalStepId`가
approval phase와 work phase를 구분한다. Final approval은 `Approved` status를 만들지
않고 worker를 resolve한 뒤 ticket을 `Assigned`로 이동한다.
