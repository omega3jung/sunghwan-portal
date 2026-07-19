# Assignment Policy

## 목표

이 문서는 현재 work ownership이 어떻게 resolve되고 변경되는지 정의한다.

Assignment는 generic owner field가 아니다. `approvalStepId`에 따라 의미가 달라지는
phase-aware routing state다.

---

## Source of Truth

```txt id="assignment-source"
tk_approval_step_id
tk_assignee_usernames
```

`approvalStepId == null`이면 티켓은 work phase이며 `assigneeUsernames`는 current
worker를 의미한다.

DTO projection:

- `assignmentPhase = "WORK"`
- `workAssigneeUsernames`
- `assignedWorker`

---

## Assignment Rule Settings

Assignment rule은 category settings 아래에 설정된다.

Work assignment resolution은 먼저 선택된 subcategory를 확인한다. Subcategory
assignment rule이 없으면 parent/main category rule로 fallback한다.

```ts id="assignment-rule-shape"
type AssigneeGroup = {
  jobFieldIds: string[];
  assigneeUsernames: string[];
};

type AssignmentRule = {
  categoryId: string;
  assignee: AssigneeGroup;
};
```

현재 model은 group-based다. 별도의 `ruleType` field를 사용하지 않는다.

관련 문서: [Service Desk Settings](../../service-desk-settings.md)

---

## Assignment Settings Authorization

Assignment Rule 권한은 저장된 category의 `Category -> Tenant -> Company` 관계로
해석한다. Persisted rule은 독립적인 authority로 `tenantId`를 중복 저장하지 않으며,
request company 값도 authorization source가 아니다.

| Category target | Owner Admin | 동일 company Tenant Admin | 다른 Tenant Admin |
| --- | --- | --- | --- |
| Owner Tenant, 모든 scope | manage | none | none |
| Customer Tenant, `INTERNAL` | none | manage | none |
| Customer Tenant, `PORTAL` | manage | read | none |

Customer `PORTAL` work routing은 owner/service provider가 관리한다. Tenant Admin의
read-only view는 현재 참조된 provider assignee의 display data를 포함할 수 있지만,
owner-company employee directory 전체의 candidate search 권한을 부여하지 않는다.

Read와 mutation path 모두 category 관계를 load하고 shared settings policy를 호출한다.
Unauthorized API request는 `403`을 반환하며, query response는 access가 `none`인 rule을
포함하지 않는다.

---

## Assignee Eligibility

허용되는 worker는 category context로부터 파생한다.

| Category context | 허용되는 employee company |
| --- | --- |
| Owner Tenant의 `INTERNAL` | owner/service-provider company |
| Customer Tenant의 `INTERNAL` | 해당 customer Tenant company |
| `PORTAL`, default | owner/service-provider company |
| `PORTAL`, explicit joint handling | owner/service-provider company와 category Tenant company |

Explicit `assigneeUsernames`와 `jobFieldIds`로부터 resolve된 employee는 모두 company
filter를 통과해야 한다. Server는 global employee search, 다른 customer company의
employee, tenant/company filter가 없는 job field, client-supplied company ID를 사용하면
안 된다. Provider와 category Tenant company의 joint handling은 persisted PORTAL
Assignment Rule option인 `includeTenantCompany`로만 활성화한다. 기본값은 `false`이며
선택된 employee나 client-supplied company context로 추론하지 않는다.

Candidate lookup은 category-centered이며 caller의 Assignment Rule capability와
purpose별 company boundary를 모두 검사한다. Eligibility는 rule 저장 시점과 submit,
resubmit 또는 explicit routing recalculation 시점에 다시 검증한다. Employee가
inactive가 되거나 company를 이동하면 routing 시 거부한다. Valid worker가 0명이면
routing은 실패하고 unowned `Assigned` ticket을 만들지 않는다.

---

## Initial Work Assignment

Ticket이 approval을 필요로 하지 않거나 final approval이 완료되면 work assignee를
resolve한다.

```txt id="initial-work-assignment"
no approval step
or final approval complete
-> resolve selected subcategory assignment rule if present
-> otherwise resolve parent/main category assignment rule
-> status = Assigned
-> approvalStepId = null
-> assigneeUsernames = workers
-> history = ASSIGNMENT_RESOLVED
```

Assignment가 최소 한 명의 worker를 resolve할 수 없으면 unowned work를 만들지 않고
ticket creation 또는 routing이 실패한다.

---

## Assigned vs Working

`Assigned`와 `Working`은 다른 상태다.

- `Assigned`: worker는 정해졌지만 work는 아직 시작되지 않았다.
- `Working`: current worker가 명시적으로 work를 시작했거나 기록했다.

`Assigned -> Working`은 explicit start-work command를 통해 일어날 수 있다.
Work-session submission도 지원되는 work-status transition을 적용할 수 있지만, Work
Session은 별도의 work-evidence model로 남는다. GET/detail read는 work를 시작하면
안 된다.

---

## Assign Action

`ASSIGN`은 current assignee를 변경한다.

Standard work assignment:

- actor: current work assignee
- status: `Assigned`, `Working`, `Pending`
- effect: work assignee 교체
- `Pending -> Working`
- history: `ASSIGNMENT_UPDATED`

Admin override:

- actor: Admin
- approval assignment: status `Approval`
- work assignment: `Assigned`, `Working`, `Pending`
- effect: current approver 또는 worker 교체
- history: `ASSIGNMENT_UPDATED`

이 ticket action override는 Service Desk Settings admin classification에서 파생하지
않는다. Owner Admin 또는 Tenant Admin이라는 사실만으로 current approver/worker가
되는 것은 아니며 settings authorization helper로 `ASSIGN`을 authorize하면 안 된다.

Assignee notification은 persisted `tk_email` field 밖에서 email을 resolve해야 한다.
파생된 assignee email은 requester email configuration에 저장하지 않는다.

---

## Assign Self

`ASSIGN_SELF`는 current worker가 multi-assignee work를 claim하게 한다.

규칙:

- actor는 이미 current work assignee여야 한다.
- current work assignee list는 최소 두 명을 포함해야 한다.
- 결과는 `[actor]`다.
- status는 변경되지 않는다.
- history: `ASSIGNMENT_UPDATED`

---

## Resubmission and Reassignment

`Declined` 또는 `Rejected` 이후 requester `RESUBMIT`은 initial routing을 다시 실행한다.

Settings change는 기존 ticket을 retroactively rewrite하지 않는다. 기존 ticket은 ticket
command가 변경하기 전까지 current assignee를 유지한다.

현재 generic Admin ticket-action override는 별도의 cross-tenant audit가 필요하다.
유지한다면 explicit break-glass/platform policy를 정의해야 한다. 이 후속 작업은
category-scope settings policy와 별개이며 기존 ticket action matrix는 여기서 변경하지
않는다.

---

## History

Assignment event:

```txt id="assignment-history-events"
ASSIGNMENT_RESOLVED
ASSIGNMENT_UPDATED
```

`ASSIGNMENT_CHANGED`가 아니라 `ASSIGNMENT_UPDATED`를 사용한다.

`ASSIGNMENT_RESOLVED`는 routing/assignment rule이 만든다.
`ASSIGNMENT_UPDATED`는 user/Admin assignment command가 만든다.

---

## Deferred Scope

다음을 현재 behavior로 설명하지 않는다.

- round-robin assignment
- least-loaded assignment
- calendar-aware assignment
- capacity balancing
- settings mutation 이후 automatic reassignment
- notification delivery guarantees

이는 future extension이다.

---

## 관련 문서

- [Ticket Lifecycle](../ticket-lifecycle.md)
- [Ticket Operation Rules](../../../08-dev-strategy/ticket-operation-rules.md)
- [Approval System](./approval-system.md)
- [Ticket History](../ticket-history.md)
- [Service Desk Settings](../../service-desk-settings.md)

---

## 요약

Assignment는 category-driven current work ownership이다. Database는 하나의 current
assignee array를 저장하고, `approvalStepId`가 그 array가 approver를 의미하는지
worker를 의미하는지 결정한다. Assignment rule은 future work ownership을 resolve하고,
ticket action은 current ownership을 갱신한다.
