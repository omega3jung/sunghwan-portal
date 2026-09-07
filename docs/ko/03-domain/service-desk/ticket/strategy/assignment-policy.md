# Assignment Policy

## 목표

이 문서는 현재 work ownership이 어떻게 resolve되고 변경되는지 정의합니다.

Assignment는 generic owner field가 아닙니다. `approvalStepId`에 따라 의미가 달라지는
phase-aware routing state입니다.

---

## Source of Truth

```txt
tk_approval_step_id
tk_assignee_usernames
```

`approvalStepId == null`이면 티켓은 work phase이며 `assigneeUsernames`는 current
worker를 의미합니다.

DTO projection:

- `assignmentPhase = "WORK"`
- `workAssigneeUsernames`
- `assignedWorker`

---

## Assignment Rule Settings

Assignment rule은 category settings 아래에 설정됩니다.

Work assignment resolution은 먼저 선택된 subcategory를 확인합니다. Subcategory
assignment rule이 없으면 parent/main category rule로 fallback합니다.

```ts
type AssigneeGroup = {
  jobFieldIds: string[];
  assigneeUsernames: string[];
  includeTenantCompany?: boolean;
};

type AssignmentRule = {
  categoryId: string;
  assignee: AssigneeGroup;
};
```

현재 model은 group-based입니다. 별도의 `ruleType` field를 사용하지 않습니다.

Rule이 없는 상태와 empty rule은 서로 다릅니다. Settings는 rule이 없는 상태를
`0 Job Fields / 0 Employees`로 표시할 수 있지만, persistence는 두 배열 중 하나 이상이
비어 있지 않을 때만 rule을 저장합니다. Subcategory override를 제거하면 rule을 삭제하고
parent fallback을 복원하며, 빈 배열을 override로 저장하지 않습니다. Category activation
전에 rule을 준비할 수 있도록 inactive category도 계속 구성할 수 있습니다.

관련 문서: [Service Desk Settings](../../settings.md)

---

## Assignment Settings Authorization

Assignment Rule 권한은 저장된 category의 `Category -> Tenant -> Company` 관계로
해석합니다. Persisted rule은 독립적인 authority로 `tenantId`를 중복 저장하지 않으며,
request company 값도 authorization source가 아닙니다.

| Category target             | Owner Admin | 동일 company Tenant Admin | 다른 Tenant Admin |
| --------------------------- | ----------- | ------------------------- | ----------------- |
| Owner Tenant, 모든 scope    | manage      | none                      | none              |
| Customer Tenant, `INTERNAL` | none        | manage                    | none              |
| Customer Tenant, `PORTAL`   | manage      | read                      | none              |

Customer `PORTAL` work routing은 owner/service provider가 관리합니다. Tenant Admin의
read-only view는 현재 참조된 provider assignee의 display data를 포함할 수 있지만,
owner-company employee directory 전체의 candidate search 권한을 부여하지 않습니다.

Read와 mutation path 모두 category 관계를 load하고 shared settings policy를 호출합니다.
Unauthorized API request는 `403`을 반환하며, query response는 access가 `none`인 rule을
포함하지 않습니다.

---

## Assignee Eligibility

허용되는 worker는 category context를 기준으로 결정합니다.

| Category context                  | 허용되는 employee company                                |
| --------------------------------- | -------------------------------------------------------- |
| Owner Tenant의 `INTERNAL`         | owner/service-provider company                           |
| Customer Tenant의 `INTERNAL`      | 해당 customer Tenant company                             |
| `PORTAL`, default                 | owner/service-provider company                           |
| `PORTAL`, explicit joint handling | owner/service-provider company와 category Tenant company |

Explicit `assigneeUsernames`와 `jobFieldIds`로부터 resolve된 employee는 모두 company
filter를 통과해야 합니다. Server는 global employee search, 다른 customer company의
employee, tenant/company filter가 없는 job field, client-supplied company ID를 사용하면
안 됩니다. Provider와 category Tenant company의 joint handling은 persisted PORTAL
Assignment Rule option인 `includeTenantCompany`로만 활성화합니다. 기본값은 `false`이며
선택된 employee나 client-supplied company context로 추론하지 않습니다.

Candidate lookup은 category-centered이며 caller의 Assignment Rule capability와
purpose별 company boundary를 모두 검사합니다. Eligibility는 rule 저장 시점과 submit,
resubmit 또는 explicit routing recalculation 시점에 다시 검증합니다. Settings save는
active reference를 검증하지만 active Job Field가 즉시 employee를 resolve할 것을
요구하지 않습니다. Category activation은 active Job Field 또는 active Employee reference가
있는지 확인합니다. Routing은 해당 reference를 실제 worker로 확장하고 더 강한 현재
employee, company, tenant, category 검증을 적용합니다. Employee가 inactive가 되거나
company를 이동하면 routing 시 거부합니다. Valid worker가 0명이면 routing은 실패하고
unowned `Assigned` ticket을 만들지 않습니다.

---

## Initial Work Assignment

Ticket이 approval을 필요로 하지 않거나 final approval이 완료되면 work assignee를
resolve합니다.

```txt
no approval step
or final approval complete
-> resolve selected subcategory assignment rule if present
-> otherwise resolve parent/main category assignment rule
-> status = Assigned
-> approvalStepId = null
-> assigneeUsernames = workers
-> history = ASSIGNMENT_RESOLVED
```

Assignment가 worker를 한 명도 resolve할 수 없으면 unowned work를 만들지 않고
ticket creation 또는 routing이 실패합니다.

여기서 fallback 조건은 “subcategory rule이 존재하지 않음”입니다. 존재하는 rule이
empty이거나 invalid하다고 해서 parent로 fallback하지 않습니다. Empty rule은 persistence
전에 거부하거나 제거합니다.

---

## Assigned vs Working

`Assigned`와 `Working`은 다른 상태입니다.

- `Assigned`: worker는 정해졌지만 work는 아직 시작되지 않았습니다.
- `Working`: current worker가 명시적으로 work를 시작했거나 기록했습니다.

`Assigned -> Working`은 explicit start-work command를 통해 일어날 수 있습니다.
Work-session submission도 지원되는 work-status transition을 적용할 수 있지만, Work
Session은 별도의 work-evidence model로 남습니다. GET/detail read는 work를 시작하면
안 됩니다.

---

## Assign Action

`ASSIGN`은 current assignee를 변경합니다.

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
않습니다. Owner Admin 또는 Tenant Admin이라는 사실만으로 current approver/worker가
되는 것은 아니며 settings authorization helper로 `ASSIGN`을 authorize하면 안 됩니다.

Assignee notification은 persisted `tk_email` field 밖에서 email을 resolve해야 합니다.
파생된 assignee email은 requester email configuration에 저장하지 않습니다.

---

## Assign Self

`ASSIGN_SELF`는 current worker가 multi-assignee work를 claim하게 합니다.

규칙:

- actor는 이미 current work assignee여야 합니다.
- current work assignee list는 최소 두 명을 포함해야 합니다.
- 결과는 `[actor]`입니다.
- status는 변경되지 않습니다.
- history: `ASSIGNMENT_UPDATED`

---

## Resubmission and Reassignment

`Declined` 또는 `Rejected` 이후 requester `RESUBMIT`은 initial routing을 다시 실행합니다.

Settings change는 기존 ticket을 retroactively rewrite하지 않습니다. 기존 ticket은 ticket
command가 변경하기 전까지 current assignee를 유지합니다.
따라서 Assignment Rule 변경은 current worker를 보존하며, 이후 workflow transition이
assignment를 다시 resolve할 때만 새 rule을 사용합니다.

현재 generic Admin ticket-action override는 별도의 cross-tenant audit가 필요합니다.
유지한다면 explicit break-glass/platform policy를 정의해야 합니다. 이 후속 작업은
category-scope settings policy와 별개이며 기존 ticket action matrix는 여기서 변경하지
않습니다.

---

## History

Assignment event:

```txt
ASSIGNMENT_RESOLVED
ASSIGNMENT_UPDATED
```

`ASSIGNMENT_CHANGED`가 아니라 `ASSIGNMENT_UPDATED`를 사용합니다.

`ASSIGNMENT_RESOLVED`는 routing/assignment rule이 만듭니다.
`ASSIGNMENT_UPDATED`는 user/Admin assignment command가 만듭니다.

---

## Deferred Scope

다음을 현재 behavior로 설명하지 않습니다.

- round-robin assignment
- least-loaded assignment
- calendar-aware assignment
- capacity balancing
- settings mutation 이후 automatic reassignment
- notification delivery guarantees

이는 future extension입니다.

---

## 관련 문서

- [Ticket Lifecycle](../ticket-lifecycle.md)
- [Ticket Operation Rules](../reference/ticket-operation-rules.md)
- [직원 참조 범위 매트릭스](../reference/restrict-employee-list.xlsx)
- [Approval System](./approval-system.md)
- [Ticket History](../ticket-history.md)
- [Service Desk Settings](../../settings.md)

---

## 요약

Assignment는 category-driven current work ownership입니다. Database는 하나의 current
assignee array를 저장하고, `approvalStepId`가 그 array가 approver를 의미하는지
worker를 의미하는지 결정합니다. Assignment rule은 future work ownership을 resolve하고,
ticket action은 current ownership을 갱신합니다.
