# Approval System

## 목표

이 문서는 Service Desk 티켓의 현재 승인 단계와 승인자 결정 방식을 정의합니다.

승인은 카테고리 설정에 따라 순서대로 진행합니다. 현재 승인 단계와 담당자는
티켓의 다음 필드에 저장합니다.

```txt
tk_approval_step_id
tk_assignee_usernames
```

---

## 현재 Approval Status

승인 중인 티켓은 저장된 상태값 `Approval`을 사용합니다.

`Approved`라는 상태값은 저장하지 않습니다. 승인 완료는 이력 이벤트
`APPROVAL_APPROVED`로 기록합니다. 마지막 승인 이후에는 작업자를 결정하고
티켓을 `Assigned`로 이동시킵니다.

---

## Approval Phase

티켓은 다음 조건일 때 승인 단계입니다.

```txt
approvalStepId != null
assignmentPhase = APPROVAL
assigneeUsernames = current approvers
```

애플리케이션 DTO는 저장된 값을 바탕으로 다음 응답 값을 계산합니다.

- `assignmentPhase = "APPROVAL"`
- `approvalAssigneeUsernames`
- `assignedApprover`

이 값들은 조회 시 계산하며, 담당자 결정의 별도 기준으로 저장하지 않습니다.

---

## Approval Step Settings

승인 단계는 상위 카테고리 아래에 설정합니다.

승인자를 결정할 때는 항상 선택한 하위 카테고리의 상위 카테고리를 사용합니다.
선택한 하위 카테고리는 티켓 분류에 사용하지만, 별도 승인 흐름을 정의하지 않습니다.

```ts
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

승인자 지정 유형:

```txt
MANAGER
DEPARTMENT
JOB_FIELD
EMPLOYEE
```

REMOTE DTO는 `approval_step_assignee`와 `skip_access_level`을 사용합니다. LOCAL과
REMOTE 설정은 애플리케이션에서 같은 동작으로 해석해야 합니다.

`MANAGER` level 1은 저장된 요청자 Job Field의 바로 위 직무, level 2는 두 단계 위
직무를 의미합니다. 해당 Job Field에서 자격을 충족한 직원이 승인자가 됩니다.
이는 역할·접근 수준 7 또는 9를 뜻하지 않습니다. 요청자의 `skipAccessLevel`
비교는 별개이며 조직 계층 해석을 바꾸지 않습니다.

관련 문서: [Service Desk Settings](../../settings.md)

---

## Approval Settings Authorization

Approval Step 권한은 저장된 상위 카테고리의 `Category -> Tenant -> Company`
관계로 판단합니다. 단계에 중복 저장한 `tenantId`나 클라이언트가 선택한 회사로 판단하지 않습니다.

| Main-category target | Owner Admin | 동일 company Tenant Admin | 다른 Tenant Admin |
| --- | --- | --- | --- |
| Owner Tenant, 모든 scope | manage | none | none |
| Customer Tenant, `INTERNAL` | none | manage | none |
| Customer Tenant, `PORTAL` | read | manage | none |

고객 `PORTAL` 승인은 고객의 승인 체계입니다. Owner Admin은 현재 설정을 조회할 수
있지만 변경할 수 없습니다. 읽기 전용 조회에는 참조된 승인자의 표시 정보를 포함할 수
있지만, 고객 직원 디렉터리 전체에서 후보를 검색할 권한은 부여하지 않습니다.

조회·변경 경로 모두 카테고리 관계를 불러와 공통 설정 권한 정책을 적용합니다.
권한이 없는 API 요청은 `403`을 반환하며, 조회 응답에는 access가 `none`인
승인 설정을 포함하지 않습니다.

---

## Approver Eligibility

`INTERNAL`과 `PORTAL` 카테고리 모두에서 승인 후보와 최종 승인자는
카테고리 Tenant의 회사에 속해야 합니다.

| Assignee type | Company validation |
| --- | --- |
| `EMPLOYEE` | 각 employee의 `companyId`가 category tenant company와 같음 |
| `DEPARTMENT` | department와 resolved employee가 해당 company 안에 유지됨 |
| `JOB_FIELD` | job field가 shared여도 최종 employee resolution에 company filter 적용 |
| `MANAGER` | resolved manager가 해당 company에 속함 |

후보 조회는 카테고리를 기준으로 하며, API 요청을 보낸 사용자의 Approval Step 권한도 검사합니다.
요청의 `categoryId`, `purpose`, `companyId`는 대상만 선택하며 권한을 부여하지 않습니다.

승인자 자격은 Approval Step 저장 시 검증하고, 제출·재제출 또는 명시적인 담당자 결정
명령을 실행할 때 다시 검증합니다. 설정 이후 직원이 비활성화되거나 다른 회사로
이동할 수 있기 때문입니다. 유효한 승인자가 0명이면 담당자 결정은 실패하며,
담당자 없는 `Approval` 티켓을 만들지 않습니다.

---

## Initial Approval Routing

티켓 제출과 재제출은 모두 적용 가능한 첫 승인 단계부터 승인자 결정을 시작합니다.

```txt
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

승인자를 결정할 수 없으면 담당자 없는 승인 티켓을 만들지 않고 명령을 실패시킵니다.

---

## Approve

Approve는 티켓 액션 명령입니다.

- action type: `APPROVE`
- allowed status: `Approval`
- actor: 현재 승인자 또는 Admin
- payload: 본문만
- 파일과 본문에 삽입한 이미지를 거부합니다.
- 액션 행을 저장합니다.
- 이력에 `APPROVAL_APPROVED`를 기록합니다.

승인 이후:

```txt
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

Decline은 티켓 액션 명령입니다.

- action type: `DECLINE`
- allowed status: `Approval`
- actor: 현재 승인자 또는 Admin
- payload: 본문만
- 파일과 본문에 삽입한 이미지를 거부합니다.
- 액션 행을 저장합니다.
- 이력에 `APPROVAL_DECLINED`를 기록합니다.

승인 거절은 승인자 결정 흐름을 종료합니다.

```txt
status = Declined
approvalStepId = null
assigneeUsernames = []
```

요청자는 나중에 최초 승인자·작업자 결정을 거쳐 재제출할 수 있습니다.

---

## Ticket Action Authorization Boundary

Approval Step 설정 권한과 티켓 액션 권한은 별도 정책입니다. 설정의 Owner Admin이나
Tenant Admin이라는 이유만으로 `APPROVE`/`DECLINE`의 현재 승인자 조건을 자동으로
만족하지 않습니다. 설정 권한 헬퍼를 액션의 관리자 예외 검사에 재사용하면 안 됩니다.

현재 티켓 액션 권한 표의 Admin 예외는 티켓 조회 권한을 확인한 뒤 현재 권한 판단
대상 사용자의 Admin 역할을 사용합니다. Admin도 액션 URL로 조회 권한이 없는 티켓에
접근할 수 없으며, impersonation 중 원래 사용자의 Admin 역할을 합산하지 않습니다.
Tenant 조회 제한을 우회하는 별도 플랫폼 권한은 포트폴리오 범위에 포함하지 않습니다.

---

## Skip Rule

`skipAccessLevel`은 요청자의 접근 수준이 설정한 기준을 만족할 때 승인 단계를
건너뛸 수 있게 합니다.

단계 건너뛰기는 승인자 결정 과정에서 처리합니다. 모든 승인을 건너뛰면
배정 규칙으로 작업 담당자를 결정하고 티켓을 `Assigned`로 이동시킵니다.

---

## History

승인 관련 이벤트:

```txt
APPROVAL_REQUESTED
APPROVAL_APPROVED
APPROVAL_DECLINED
ASSIGNMENT_RESOLVED
```

승인 액션은 둘 이상의 이력 레코드를 만들 수 있습니다.

```txt
APPROVAL_APPROVED
-> APPROVAL_REQUESTED
or
APPROVAL_APPROVED
-> ASSIGNMENT_RESOLVED
```

---

## Requester Update와의 관계

요청자 수정에서는 다음 필드가 실제로 바뀔 때 승인자 결정을 처음부터 다시 시작할 수 있습니다.

- 카테고리
- 제목
- 본문
- 첨부파일
- 이미지

담당자 재결정은 승인자 결정을 처음부터 시작하고 `ROUTING_RESET`을 기록합니다.
담당자 결정에 영향을 주지 않는 변경은 `ROUTING_PRESERVED`를 기록합니다.

---

## Deferred Scope

현재 승인 모델은 다음을 구현하지 않습니다.

- 병렬 승인 투표
- 정족수 기반 승인
- 위임 일정
- 승인 SLA 타이머
- 승인 알림 전달 보장

이는 향후 운영 환경에서 확장할 수 있는 기능입니다.

---

## 관련 문서

- [Ticket Lifecycle](../ticket-lifecycle.md)
- [Ticket Operation Rules](../reference/ticket-operation-rules.md)
- [직원 참조 범위 매트릭스](../reference/restrict-employee-list.xlsx)
- [Assignment Policy](./assignment-policy.md)
- [Ticket History](../ticket-history.md)
- [Service Desk Settings](../../settings.md)

---

## 설정 변경과 진행 중인 Approval

진행 중인 승인은 티켓이 참조하는 업무 흐름을 기준으로 계속됩니다. 따라서 Category가
나중에 비활성화되어도 다음 승인 단계 또는 작업자 배정으로 진행할 수 있습니다.

`Approval` 상태 티켓에 영향을 주는 승인 단계 트리 변경은 일반 저장 시 충돌을
반환합니다. 관리자가 강제 적용을 확인하면 서버는 새 설정과 모든 최초 담당자 결정을
검증합니다. 이어 설정 저장, 영향받는 티켓의 첫 단계부터 담당자 재결정, reason이
`APPROVAL_CONFIGURATION_CHANGED`인 `ROUTING_RESET` 이력 기록을 하나의
트랜잭션으로 처리합니다. 티켓 하나라도 담당자를 다시 결정할 수 없으면 전체를 되돌립니다.

## 요약

승인은 카테고리에 따라 순서대로 진행하는 담당자 결정 단계입니다. 현재 승인자는
작업자 배정에도 사용하는 현재 담당자 필드에 저장하며, `approvalStepId`로 승인 단계와
작업 단계를 구분합니다. 마지막 승인은 `Approved` 상태를 만들지 않고 작업자를
결정한 뒤 티켓을 `Assigned`로 이동시킵니다.
