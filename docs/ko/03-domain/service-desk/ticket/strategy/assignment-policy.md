# Assignment Policy

## 목표

이 문서는 현재 작업 담당자를 결정하고 변경하는 방식을 정의합니다.

배정 정보는 `approvalStepId`에 따라 승인 담당자 또는 작업 담당자를 나타냅니다.
담당자 목록만 보지 않고 현재 단계를 함께 판단해야 합니다.

---

## Source of Truth

```txt
tk_approval_step_id
tk_assignee_usernames
```

`approvalStepId == null`이면 티켓은 작업 단계이며, `assigneeUsernames`는 현재 작업자를 의미합니다.

DTO로 계산해 제공하는 값:

- `assignmentPhase = "WORK"`
- `workAssigneeUsernames`
- `assignedWorker`

---

## Assignment Rule Settings

배정 규칙은 카테고리 설정 아래에 둡니다.

작업자 결정에서는 선택한 하위 카테고리를 먼저 확인합니다.
하위 카테고리의 배정 규칙이 없으면 상위 카테고리 규칙을 사용합니다.

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

현재 모델은 직무와 직원으로 구성한 그룹을 사용합니다. 별도의 `ruleType` 필드는 사용하지 않습니다.

규칙이 없는 상태와 빈 규칙은 서로 다릅니다. 설정 화면은 규칙이 없는 상태를
`0 Job Fields / 0 Employees`로 표시할 수 있지만, 두 배열 중 하나 이상이 비어 있지
않을 때만 규칙을 저장합니다. 하위 카테고리의 자체 규칙을 제거하면 규칙을 삭제하고
상위 규칙을 다시 사용하며, 빈 배열을 자체 규칙으로 저장하지 않습니다.
활성화 전에 규칙을 준비할 수 있도록 비활성 카테고리도 설정할 수 있습니다.

관련 문서: [Service Desk Settings](../../settings.md)

---

## Assignment Settings Authorization

Assignment Rule 권한은 저장된 카테고리의 `Category -> Tenant -> Company` 관계로
판단합니다. 규칙에 `tenantId`를 중복 저장해 독립된 권한 기준으로 사용하지 않으며,
요청의 회사 값도 권한 판단의 근거가 아닙니다.

| Category target             | Owner Admin | 동일 company Tenant Admin | 다른 Tenant Admin |
| --------------------------- | ----------- | ------------------------- | ----------------- |
| Owner Tenant, 모든 scope    | manage      | none                      | none              |
| Customer Tenant, `INTERNAL` | none        | manage                    | none              |
| Customer Tenant, `PORTAL`   | manage      | read                      | none              |

고객 `PORTAL` 작업자 배정은 소유자·서비스 제공자가 관리합니다. Tenant Admin의 읽기
전용 화면에는 현재 참조된 제공자 담당자의 표시 정보를 포함할 수 있지만,
제공자 회사 직원 디렉터리 전체에서 후보를 검색할 권한은 부여하지 않습니다.

조회·변경 경로 모두 카테고리 관계를 불러와 공통 설정 권한 정책을 적용합니다.
권한이 없는 API 요청은 `403`을 반환하며, 조회 응답에는 access가 `none`인 규칙을 포함하지 않습니다.

---

## Assignee Eligibility

허용되는 작업자는 카테고리의 Tenant와 scope를 기준으로 결정합니다.

| Category context                  | 허용되는 employee company                                |
| --------------------------------- | -------------------------------------------------------- |
| Owner Tenant의 `INTERNAL`         | owner/service-provider company                           |
| Customer Tenant의 `INTERNAL`      | 해당 customer Tenant company                             |
| `PORTAL`, default                 | owner/service-provider company                           |
| `PORTAL`, explicit joint handling | owner/service-provider company와 category Tenant company |

명시적인 `assigneeUsernames`와 `jobFieldIds`에서 구한 직원은 모두 회사 필터를 통과해야
합니다. 서버는 전체 직원 검색, 다른 고객 회사 직원, Tenant·회사 필터가 없는 직무,
클라이언트가 보낸 회사 ID를 사용하면 안 됩니다. 제공자와 카테고리 Tenant 회사의
공동 처리는 저장된 PORTAL 배정 규칙의 `includeTenantCompany`로만 활성화합니다.
기본값은 `false`이며, 선택한 직원이나 클라이언트가 보낸 회사 정보로 추론하지 않습니다.

후보 조회는 카테고리를 기준으로 하며, API 요청을 보낸 사용자의 배정 규칙 권한과 purpose별 회사 범위를
모두 검사합니다. 자격은 규칙 저장 시 검증하고, 제출·재제출 또는 명시적인 담당자
재결정 시 다시 검증합니다. 설정 저장은 참조 대상의 활성 여부를 검증하지만, 활성
직무에서 즉시 직원을 찾을 수 있어야 하는 것은 아닙니다. 카테고리 활성화는 활성 직무
또는 활성 직원 참조가 있는지 확인합니다. 실행 시에는 참조를 실제 작업자로 확장하고,
현재 직원·회사·Tenant·Category에 대한 더 엄격한 검증을 적용합니다. 직원이 비활성화되거나
회사를 이동하면 담당자 결정 시 거부합니다. 유효한 작업자가 0명이면 담당자 결정은
실패하며, 담당자 없는 `Assigned` 티켓을 만들지 않습니다.

---

## Initial Work Assignment

승인이 필요하지 않거나 마지막 승인이 완료되면 작업 담당자를 결정합니다.

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

작업자를 한 명도 결정할 수 없으면 담당자 없는 작업을 만들지 않고 티켓 생성이나 담당자 결정을 실패시킵니다.

상위 규칙을 사용하는 조건은 “하위 카테고리 규칙이 존재하지 않음”입니다. 존재하는 규칙이
비어 있거나 유효하지 않다고 해서 상위 규칙을 사용하지 않습니다. 빈 규칙은 저장 전에 거부하거나 제거합니다.

---

## Assigned vs Working

`Assigned`와 `Working`은 다른 상태입니다.

- `Assigned`: 작업자는 정해졌지만 작업은 아직 시작되지 않았습니다.
- `Working`: 현재 작업자가 명시적으로 작업을 시작했거나 기록했습니다.

`Assigned -> Working`은 별도 start-work 명령으로 실행할 수 있습니다.
작업 시간 기록 제출도 지원하는 작업 상태 전이를 적용할 수 있지만, Work Session은
별도 작업 내역 모델로 유지합니다. GET·상세 조회로 작업을 시작하면 안 됩니다.

---

## Assign Action

`ASSIGN`은 현재 담당자를 변경합니다.

일반 작업자 배정:

- actor: 현재 작업 담당자
- status: `Assigned`, `Working`, `Pending`
- effect: 작업 담당자 교체
- `Pending -> Working`
- history: `ASSIGNMENT_UPDATED`

Admin 예외:

- actor: Admin
- approval assignment: 상태 `Approval`
- work assignment: `Assigned`, `Working`, `Pending`
- effect: 현재 승인자 또는 작업자 교체
- history: `ASSIGNMENT_UPDATED`

이 티켓 액션의 관리자 예외는 Service Desk 설정의 관리자 구분으로 판단하지 않습니다.
Owner Admin이나 Tenant Admin이라는 이유만으로 현재 승인자·작업자가 되는 것은
아니며, 설정 권한 헬퍼로 `ASSIGN`을 허용하면 안 됩니다.

수동 `ASSIGN`의 검증 범위는 자동 담당자 결정보다 좁습니다. 실행자, 상태, 비어 있지
않은 username 목록을 검증하지만, 제출한 후보를 Category·단계별 자격 정책이나 저장된
배정 규칙으로 다시 검증하지 않습니다. UI 후보는 현재 권한 판단 대상 실행자의 회사에서
가져옵니다. 이 차이 때문에 참조 워크북의 `REVIEW_REQUIRED`를 유지하며,
앞서 설명한 자동 담당자 결정의 보장은 수동 재배정에 적용되지 않습니다.

담당자 알림은 저장된 `tk_email` 필드와 별도로 이메일을 결정해야 합니다.
담당자 이메일을 요청자의 이메일 수신자 설정에 저장하지 않습니다.

---

## Assign Self

`ASSIGN_SELF`는 여러 담당자가 배정된 작업을 현재 작업자 한 명이 맡도록 변경합니다.

규칙:

- 실행자는 이미 현재 작업 담당자여야 합니다.
- 현재 작업 담당자 목록은 최소 두 명을 포함해야 합니다.
- 결과는 `[actor]`입니다.
- 상태는 변경하지 않습니다.
- history: `ASSIGNMENT_UPDATED`

---

## Resubmission and Reassignment

`Declined` 또는 `Rejected` 이후 요청자의 `RESUBMIT`은 최초 승인자·작업자 결정을 다시 실행합니다.

설정 변경은 기존 티켓을 소급해서 다시 쓰지 않습니다. 기존 티켓은 티켓 명령으로
변경하기 전까지 현재 담당자를 유지합니다. 따라서 배정 규칙을 변경해도 현재 작업자는
보존하며, 이후 업무 전이에서 담당자를 다시 결정할 때만 새 규칙을 사용합니다.

티켓 액션의 Admin 예외는 티켓 조회 권한을 확인한 뒤 현재 권한 판단 대상 사용자의
역할을 사용합니다. Tenant 조회 제한을 우회하거나 impersonation 중 원래 Admin의
역할을 상속하지 않습니다. 티켓 조회 제한을 우회하는 별도 플랫폼 권한은
포트폴리오 범위에 포함하지 않습니다.

---

## History

배정 이벤트:

```txt
ASSIGNMENT_RESOLVED
ASSIGNMENT_UPDATED
```

`ASSIGNMENT_CHANGED`가 아니라 `ASSIGNMENT_UPDATED`를 사용합니다.

`ASSIGNMENT_RESOLVED`는 담당자 결정·배정 규칙이 만듭니다.
`ASSIGNMENT_UPDATED`는 사용자·Admin의 배정 명령이 만듭니다.

---

## Deferred Scope

다음은 현재 구현된 동작으로 설명하지 않습니다.

- 순환 배정
- 작업량이 가장 적은 담당자 배정
- 일정에 따른 배정
- 처리 용량 분산
- 설정 변경 이후 자동 재배정
- 알림 전달 보장

이는 향후 확장할 수 있는 기능입니다.

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

배정은 카테고리에 따라 현재 작업 담당자를 결정합니다. 데이터베이스는 현재 담당자
배열 하나를 저장하고, `approvalStepId`로 배열이 승인자인지 작업자인지 구분합니다.
배정 규칙은 이후의 작업 담당자 결정에 사용하고, 티켓 액션은 현재 담당자를 갱신합니다.
