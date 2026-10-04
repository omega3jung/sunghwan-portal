# Settings 변경 및 진행 중 Ticket 정책 (2026-08)

## 배경

Service Desk 설정은 티켓을 처리하는 업무 규칙을 정의합니다.

주요 settings 영역은 다음과 같습니다.

```txt
Tenant
-> Category
-> Approval Step
-> Assignment Rule
```

이 settings는 다음에 영향을 줄 수 있습니다.

- ticket classification
- category 기본값
- approval 요구 사항
- 현재 및 향후 approver
- work assignment
- tenant 및 scope boundary
- routing 동작

이전 설계에서는 Settings를 현재 설정으로 다뤘습니다. 과거 처리 당시의 설정 상태를
보관하는 용도로 사용하지는 않았습니다.

단순화한 정책은 다음과 같았습니다.

```txt
Settings change
-> affects future workflow resolution

Existing Ticket state / History
-> remains unchanged
```

이 정책은 이력 무결성을 보호했습니다. 관리 설정을 변경해도 이미 실행한 업무
이벤트를 다시 작성하지 않도록 했습니다.

하지만 REMOTE Service Desk 구현이 구체화되면서 다음 사례가 중요해졌습니다.

```txt
A Ticket is still in progress
while
the Settings that define its current routing are changed.
```

예를 들면 다음과 같습니다.

```txt
Ticket
-> status = Approval
-> current approver resolved from Approval Step

Admin changes Category / Approval Step configuration
-> current routing may no longer match the configuration
```

기존 티켓을 계속 보존하기만 하면 과거 상태는 보호할 수 있습니다. 하지만 진행 중인
업무에서 더 이상 유효하지 않은 설정을 계속 사용하게 될 수 있습니다.

따라서 프로젝트는 다음을 구분해야 했습니다.

```txt
historical meaning
from
current operational validity
```

---

## 문제

### 1. "Settings는 향후 Ticket에만 영향을 준다"는 규칙이 너무 포괄적임

설정 변경으로 과거 업무 기록의 의미를 소급해 바꾸면 안 되므로 기존 규칙은 유용했습니다.

하지만 다음 두 가지는 서로 다른데도 같은 것으로 취급했습니다.

```txt
Past workflow evidence
Current in-flight workflow state
```

두 상태의 책임은 서로 다릅니다.

과거 workflow 증거에는 다음이 포함됩니다.

- Ticket Action
- Ticket History
- 완료된 approval event
- 이전 assignment event
- 이전 status transition

이 기록들은 변경할 수 없는 상태로 유지해야 합니다.

현재 진행 중인 상태에는 다음이 포함됩니다.

- 현재 `status`
- 현재 `approvalStepId`
- 현재 `assigneeUsernames`
- 현재 approval responsibility
- 현재 work responsibility

이 상태는 업무를 **현재** 누가 담당하는지 나타냅니다.

설정 변경으로 현재 담당자 관계가 유효하지 않게 되었는데도 계속 유지하면 진행 중인
티켓이 현재 Service Desk 정책과 맞지 않을 수 있습니다.

---

### 2. 모든 Ticket을 조용히 재계산하는 방식도 안전하지 않음

반대 정책은 다음과 같습니다.

```txt
Settings mutation
-> automatically recalculate every related Ticket
```

이 방식에도 문제가 있습니다.

Settings를 편집하면 예기치 않게 다음이 발생할 수 있습니다.

- 현재 approver 교체
- 현재 worker 교체
- approval 재시작
- ticket status 변경
- 여러 Ticket의 운영 responsibility 변경

관리자는 설정을 편집할 때 진행 중인 티켓 처리까지 바뀐다는 사실을 알지 못할 수 있습니다.

따라서 설정 변경이 티켓 업무 상태를 숨겨진 부수 효과로 변경하도록 해서는 안 됩니다.

---

### 3. 과거 audit와 현재 routing을 혼동해서는 안 됨

Ticket이 approval step 1을 완료했다고 가정합니다.

```txt
APPROVAL_APPROVED
actor = userA
```

이후 Settings에서 Approval Step 설정이 변경됩니다.

기존 History는 계속 다음을 의미해야 합니다.

```txt
userA approved the Ticket under the routing that existed at that time
```

새 approver가 승인한 것처럼 다시 작성해서는 안 됩니다.

동시에 티켓이 여전히 `Approval`이라면 현재 승인 담당자를 다시 계산해야 할 수 있습니다.

따라서 다음 관계가 성립합니다.

```txt
preserve History
!=
preserve current routing forever
```

---

### 4. Settings 변경마다 안전 수준이 다름

모든 Settings mutation이 같은 영향을 가져서는 안 됩니다.

예시는 다음과 같습니다.

```txt
Category display name changed
-> no routing impact
```

```txt
Category default priority changed
-> generally affects future derivation
```

```txt
Approval Step changed
-> may invalidate current Approval ownership
```

```txt
Assignment Rule changed
-> may affect future work resolution
```

```txt
Category moved to another Tenant
-> changes the workflow/security boundary itself
```

따라서 시스템은 다음을 구분해야 합니다.

- 안전한 설명/설정 변경
- workflow-sensitive 변경
- immutable boundary 변경

---

### 5. Tenant 변경은 routing 재계산과 근본적으로 다름

Tenant는 Service Desk 설정을 구분하고 접근 범위를 제한하는 기준입니다.

Category를 한 Tenant에서 다른 Tenant로 변경하면 다음이 달라질 수 있습니다.

- company context
- authorization
- 사용 가능한 approver
- eligible worker
- category scope
- ticket visibility
- reporting ownership

이는 단순한 routing refresh가 아닙니다.

테넌트 간 이동은 해당 설정 자체의 의미를 바꿉니다.

관련 티켓의 담당자를 다시 계산해서 사후에 이 변경을 복구하려 해서는 안 됩니다.

---

## 검토한 선택지

### 선택지 1 — Settings 변경은 새 Ticket에만 적용

```txt
Settings change
-> existing Tickets always keep current state
-> only new Tickets use new configuration
```

#### 장점

- 가장 단순한 동작
- 강한 이력 안정성
- 숨겨진 Ticket mutation이 없음
- 설명하기 쉬움

#### 단점

- active Ticket이 잘못된 approver 또는 worker를 계속 사용할 수 있음
- 운영 설정 변경이 적용되는 데 걸리는 시간이 제한 없이 길어질 수 있음
- 관리자가 현재 workflow의 잘못된 routing 설정을 안전하게 수정할 수 없음
- immutable history와 변경 가능한 current responsibility를 혼동함

완전한 정책으로는 이 선택지를 채택하지 않았습니다.

다만 이력 무결성 원칙은 유지합니다.

---

### 선택지 2 — 영향을 받는 모든 Ticket을 자동으로 재계산

```txt
Settings save
-> find affected Tickets
-> automatically reroute all of them
```

#### 장점

- active Ticket이 즉시 현재 설정을 따름
- stale routing이 남지 않음

#### 단점

- Settings mutation에 큰 운영 side effect가 숨겨짐
- 관리자가 실행 전 영향을 검토할 수 없음
- 작은 설정 변경으로 많은 Ticket이 예기치 않게 재시작될 수 있음
- bulk recalculation 실패를 설명하기 어려움
- Ticket workflow 변경이 명시적인 command가 아니라 암묵적인 동작이 됨
- auditability가 약해짐

이 선택지는 채택하지 않았습니다.

---

### 선택지 3 — 영향을 받는 Ticket이 있으면 모든 Settings 변경 차단

```txt
affected Ticket exists
-> reject Settings mutation
```

#### 장점

- active Ticket이 불일치 상태가 되지 않음
- 단순한 safety model
- rerouting side effect가 없음

#### 단점

- active Service Desk에서 설정이 사실상 immutable 상태가 될 수 있음
- 모든 Ticket이 끝날 때까지 잘못된 settings를 수정하지 못할 수 있음
- 관리자가 필요한 운영 제어 권한을 잃음
- 오래 실행되는 Ticket에는 실용적이지 않음

일반적인 Category 설정 변경에는 이 선택지를 채택하지 않았습니다.

Immutable domain boundary를 넘는 변경에는 이 차단 원칙을 유지합니다.

---

### 선택지 4 — 영향을 확인하고 boundary를 구분하여 허용된 경우 명시적으로 rerouting

```txt
Settings mutation requested
-> inspect affected in-flight Tickets
-> classify change
-> warn or block
-> apply explicit supported impact policy
```

일반적인 Category/routing 설정은 다음과 같이 처리합니다.

```txt
impact detected
-> administrator sees impact
-> mutation may proceed explicitly
-> affected current routing is recalculated when required
-> previous workflow evidence remains in History
```

Immutable Tenant/scope boundary 변경은 다음과 같이 처리합니다.

```txt
mutation requested
-> reject
```

이 선택지를 채택했습니다.

---

## 결정

설정 변경은 과거 처리 기록의 의미를 보존하면서 영향을 받는 진행 중 티켓을
명시적으로 처리해야 합니다.

핵심 정책은 다음과 같습니다.

```txt
Past History
-> immutable

Current Ticket routing
-> may be recalculated when the Settings mutation invalidates it

Tenant / scope identity
-> immutable after creation
```

설정 변경이 진행 중인 티켓의 업무 상태를 조용히 다시 작성해서는 안 됩니다.

업무 흐름을 바꾸는 설정 변경이 진행 중인 티켓에 영향을 줄 수 있으면 서버는
변경을 완료하기 전에 영향을 확인해야 합니다.

---

## 이력 무결성

Settings가 변경되어도 다음 record는 재계산하지 않습니다.

```txt
Ticket Action
Ticket History
completed approval events
completed assignment events
previous status transitions
work-session evidence
```

예를 들어 아래 event는

```txt
APPROVAL_APPROVED
actor = alice
createdAt = previous timestamp
```

다음 상황에서도 변경하지 않습니다.

- Approval Step 편집
- approver 설정 교체
- 이후 Category 설정 변경

History는 실제로 발생한 일을 기록합니다.

```txt
Settings describe current configuration.
History describes executed workflow.
```

두 책임은 분리된 상태로 유지해야 합니다.

---

## 현재 Ticket 상태는 과거 증거가 아님

Ticket row는 현재 workflow 상태를 나타냅니다.

중요한 routing field는 다음과 같습니다.

```txt
status
approvalStepId
assigneeUsernames
categoryId
```

명시적인 workflow operation이 요구하면 이 field들은 정당하게 변경될 수 있습니다.

따라서 다음 원칙이

```txt
History immutable
```

다음을 의미하지는 않습니다.

```txt
Ticket current routing immutable
```

지원하는 설정 변경으로 현재 담당자 결정이 유효하지 않게 되면 티켓의 담당자를
명시적으로 다시 계산할 수 있습니다. 이전 담당자 결정은 이력에서 계속 확인할 수 있습니다.

---

## 영향 확인

Workflow-sensitive Settings mutation을 적용하기 전에 server는 진행 중인 Ticket이
영향받는 설정에 의존하는지 판단해야 합니다.

개념적으로 다음과 같습니다.

```txt
Settings mutation
-> resolve stored Tenant / Category relationship
-> identify affected configuration
-> query related in-flight Tickets
-> determine workflow impact
-> apply mutation policy
```

영향을 확인할 때는 서버에 저장된 관계를 사용해야 합니다.

Client가 제공하는 다음 값은

```txt
tenantId
companyId
category scope
affected ticket count
```

권한이나 영향 판단의 근거로 신뢰해서는 안 됩니다.

---

## 진행 중인 Ticket 범위

이 영향 정책은 아직 active workflow responsibility가 있는 Ticket을 대상으로 합니다.

예시는 다음과 같습니다.

```txt
Approval
Assigned
Working
Pending
```

정확한 대상 상태는 변경하는 설정 항목에 따라 달라집니다.

Terminal 또는 historical state에서 완료된 routing을 다시 작성할 필요는 없습니다.

예를 들어 다음 상태는

```txt
Declined
Rejected
Resolved
Closed
```

이후 다른 명시적 Ticket operation이 routing에 다시 진입시키지 않는 한 workflow가
실행되던 당시 설정과 과거 관계를 유지할 수 있습니다.

초안은 제출할 때 담당자를 결정하므로 제출 시점에 유효한 현재 설정을 사용합니다.

---

## 변경 분류

Settings mutation은 영향에 따라 분류해야 합니다.

### 1. 설명 변경

예시는 다음과 같습니다.

```txt
Category name
description
request template
display color or similar presentation metadata
```

일반적인 영향은 다음과 같습니다.

```txt
Settings update
-> no current routing reset
```

기존 History는 변경하지 않습니다.

현재 UI가 Category reference data를 결정할 때 최신 Category label을 표시할 수 있지만,
과거 event의 의미를 다시 작성하지는 않습니다.

---

### 2. 기본값 및 향후 파생 변경

예시는 다음과 같습니다.

```txt
default priority
default risk
default SLA days
```

일반적으로 다음에 영향을 줍니다.

- 향후 Ticket
- 향후 requester routing-sensitive update
- 향후 명시적인 routing recalculation

그 자체로 현재 Ticket planning value를 조용히 다시 작성하지는 않습니다.

기본값 변경은 진행 중인 모든 티켓에 `ADJUST`를 실행하는 것과 다릅니다.

---

### 3. Routing-Sensitive 변경

다음을 결정하는 설정의 변경이 포함됩니다.

```txt
approval pipeline
approval assignee resolution
assignment rule
effective category routing
```

이 변경은 현재 workflow ownership에 영향을 줄 수 있습니다.

Server는 mutation을 완료하기 전에 관련된 진행 중 Ticket을 확인해야 합니다.

---

### 4. Boundary 변경

예시는 다음과 같습니다.

```txt
Category Tenant
Main Category scope
Sub Category parent when it crosses Tenant/scope
```

이 update는 지원하지 않습니다.

Ticket rerouting으로 복구하는 대신 거부해야 합니다.

지원하는 migration pattern은 다음과 같습니다.

```txt
deactivate old configuration
-> create new configuration in the correct boundary
```

이를 통해 다음을 보존합니다.

- Tenant isolation
- 과거 Category reference
- 현재 Ticket 의미
- authorization 일관성

---

## Category 변경 정책

변경이 기존 Tenant 및 scope boundary 안에서 이루어지고 관리자가 영향을 확인한 후
명시적으로 진행한다면, 관련 active Ticket이 있어도 Category 설정을 변경할 수 있습니다.

개념적으로 다음과 같습니다.

```txt
Category mutation
-> affected Ticket check
```

관련된 진행 중 Ticket이 없으면 다음을 수행합니다.

```txt
apply Settings mutation
```

관련 Ticket이 있으면 다음을 수행합니다.

```txt
show impact warning
-> administrator explicitly proceeds
-> apply supported Ticket impact policy
```

UI warning은 관리자의 이해를 돕기 위한 것입니다.

실제로 영향을 받는 Ticket은 server가 결정합니다.

---

## Approval 영향 정책

`Approval` Ticket은 현재 Approval Step과 현재 approver를 저장하므로 Approval 설정은
특히 민감합니다.

Category나 Approval Step 변경으로 현재 승인자 결정이 유효하지 않게 되면,
완료되지 않은 이전 승인 절차를 계속 유효한 판단 기준으로 사용해서는 안 됩니다.

선택한 정책은 다음과 같습니다.

```txt
affected Ticket in Approval
-> preserve previous approval History
-> reset current approval context
-> rerun routing from the beginning
```

개념적으로 다음과 같습니다.

```txt
current Approval Ticket
-> clear invalid current approval routing
-> resolve first applicable Approval Step again
-> resolve current approvers
```

더 이상 approval이 필요하지 않다면 다음과 같이 처리합니다.

```txt
-> resolve work Assignment
-> status = Assigned
```

계속 approval이 필요하다면 다음과 같이 처리합니다.

```txt
-> status = Approval
-> approvalStepId = newly resolved step
-> assigneeUsernames = newly resolved approvers
```

이미 완료된 승인은 과거 이벤트로 보존합니다.

새로 계산한 승인 절차의 단계가 승인되었다는 근거로 재사용하지 않습니다.

이는 requester routing-sensitive update와 같은 원칙을 따릅니다.

```txt
old routing result invalidated
-> routing starts again
```

---

## Approval을 처음부터 다시 시작하는 이유

"가장 가까운 동등한" step부터 계속하는 방식은 채택하지 않았습니다.

예를 들면 다음과 같습니다.

```txt
old steps:
A -> B -> C

new steps:
A -> D -> C
```

Ticket이 현재 `B`에 있다면 다음을 추론해야 합니다.

```txt
A is still valid
C should remain pending
D has effectively been skipped
```

이렇게 판단하려면 설정 버전별 의미를 구분해야 하지만 프로젝트에는 현재 구현되어
있지 않습니다.

더 안전하고 설명하기 쉬운 rule은 다음과 같습니다.

```txt
routing-invalidating configuration change
-> restart approval resolution
```

History에는 이전 approval이 발생했다는 사실이 계속 표시됩니다.

재시작한 workflow는 새로운 현재 정책을 나타냅니다.

---

## Assignment 영향 정책

배정 설정은 티켓이 작업자 배정 단계에 진입하거나 다시 진입할 때 작업자를
결정하는 방식을 설명합니다.

Assignment Rule을 변경했다는 이유만으로 설정 변경이 현재 작업 담당자를
조용히 교체해서는 안 됩니다.

따라서 baseline은 다음과 같습니다.

```txt
existing current workers
-> remain current workers
until an explicit workflow operation changes work assignment
```

Assignment Rule 변경은 다음에 영향을 줍니다.

- 새 Ticket routing
- 최종 approval에서 work assignment로 전환
- resubmission
- requester routing-sensitive update
- 다른 명시적인 routing recalculation

이 규칙은 Assignment Rule 편집이 숨겨진 일괄 `ASSIGN` 명령이 되는 것을 막습니다.

향후 관리자가 영향을 받는 진행 중 티켓을 재배정해야 한다면, 별도 이력 의미를
가진 명시적 명령이나 일괄 작업으로 설계해야 합니다.

---

## Category 변경과 Tenant 변경

두 변경은 의도적으로 구분합니다.

### Category 설정

동일한 immutable Tenant/scope boundary 안에서는 다음이 가능합니다.

```txt
may change
-> impact can be inspected
-> affected Approval routing can be explicitly recalculated
```

### Tenant 및 Scope Boundary

```txt
must not change
```

이를 통해 관리자가 기존 Ticket이 동일한 Category identity를 계속 reference하는
상태에서 아래 Category를

```txt
Tenant A Category
```

다음으로 바꾸는 것을 막습니다.

```txt
Tenant B Category
```

Tenant 이동은 Settings edit가 아닙니다.

새로운 domain identity와 authorization context를 생성하는 일입니다.

---

## Warning과 Authorization

UI는 다음을 표시할 수 있습니다.

- 영향을 받는 Ticket 수
- 영향을 받는 workflow 유형
- 확인 message
- Approval이 재시작될 수 있다는 설명

이를 통해 관리자가 영향을 더 잘 인식할 수 있습니다.

하지만 다음 관계가 성립합니다.

```txt
UI confirmation
!= authorization
```

Server는 계속 다음을 검증해야 합니다.

- authenticated identity
- effective impersonated identity
- Settings capability
- 저장된 Tenant relationship
- Category scope
- mutation input
- 영향을 받는 Ticket relationship

Rerouting 필요 여부도 server가 결정합니다.

---

## Transaction Boundary

설정과 영향을 받는 티켓 담당자를 함께 변경할 때 일부 변경만 반영된 상태가
남아서는 안 됩니다.

안전하지 않은 결과는 다음과 같습니다.

```txt
Approval Step updated
-> Ticket rerouting fails
-> Ticket still references invalid current Approval Step
```

또는 다음과 같습니다.

```txt
Ticket rerouted
-> Settings write fails
```

지원하는 설정 변경에 즉시 티켓 재계산이 필요하면 전체 작업을 하나의 애플리케이션
처리로 다뤄야 합니다.

개념적으로 다음과 같습니다.

```txt
validate Settings mutation
-> inspect affected Tickets
-> validate rerouting result
-> persist Settings change
-> persist Ticket routing changes
-> append History
-> commit
```

REMOTE에서는 관련 데이터베이스 변경을 적절한 트랜잭션으로 함께 처리해야 합니다.

LOCAL의 변경 가능한 데모 상태도 사용자에게 같은 결과를 제공해야 합니다.

---

## Settings로 인한 Rerouting History

설정 변경은 이전 이력을 편집해서는 안 됩니다.

설정 변경으로 현재 담당자 결정을 초기화하면 그 초기화 자체를 새 이벤트로 기록합니다.

History model은 다음 두 원인을 명확하게 구분할 수 있어야 합니다.

```txt
requester changed request content
```

```txt
administrator changed workflow configuration
```

기존 event/source model이 영향을 정확히 나타낼 수 있으면 재사용합니다.

현재 이력 형식으로 두 원인을 명확히 구분할 수 없다면 기존 이벤트를 다시 쓰는 대신
이력 메타데이터나 출처의 의미를 확장하는 편이 낫습니다.

중요한 invariant는 다음과 같습니다.

```txt
old History remains
+
new routing effect is appended
```

다음이 아닙니다.

```txt
old History is recomputed
```

---

## 실패 정책

Rerouting이 필요한 Settings mutation은 새 설정으로 유효한 workflow를 만들 수 없으면
실패할 수 있습니다.

예시는 다음과 같습니다.

```txt
no valid approver can be resolved
no valid worker can be resolved when approval is no longer required
referenced organization data became invalid
Category is not operationally ready
```

시스템은 다음과 같은 상태를 저장해서는 안 됩니다.

```txt
status = Approval
assigneeUsernames = []
```

또는 다음과 같은 상태를 저장해서는 안 됩니다.

```txt
status = Assigned
assigneeUsernames = []
```

workflow에 ownership이 필요한 경우 위 상태는 유효하지 않습니다.

필수 담당자 재계산이 유효한 결과를 만들 수 없으면 영향을 받는 티켓에 일부
변경만 반영된 상태가 남아서는 안 됩니다.

---

## LOCAL과 REMOTE 일관성

이 정책은 두 runtime mode 모두에 적용합니다.

```txt
Settings UI
-> feature API
-> Route Handler / application handler
-> impact policy
-> LOCAL handler or REMOTE service
```

### LOCAL

LOCAL mutable demo state는 다음을 수행해야 합니다.

- 영향을 받는 demo Ticket 식별
- 동일한 warning/impact 결과 노출
- immutable boundary 변경 거부
- 지원되는 정책에서 요구하면 영향을 받는 Approval Ticket rerouting
- 기존 event를 다시 작성하지 않고 대응하는 History 추가

### REMOTE

REMOTE는 다음을 수행해야 합니다.

- 저장된 relationship에서 영향 파생
- mutation 전에 authorization 강제
- transaction-aware Settings 및 Ticket service 사용
- server routing logic 재실행
- 변경된 Ticket 상태 저장
- immutable History 추가

UI는 두 실행 환경에서 같은 응답 형식과 업무 규칙을 사용해야 합니다.

---

## Requester Update Routing과의 관계

프로젝트는 requester update에 이미 다음 정책을 사용합니다.

```txt
routing-neutral change
-> preserve current routing

routing-sensitive change
-> invalidate current routing
-> restart routing from the beginning
```

Settings로 인한 approval 무효화도 같은 architecture 원칙을 따릅니다.

```txt
current routing assumptions became invalid
-> do not patch them incrementally
-> recompute routing through the server authority
```

원인은 서로 다릅니다.

```txt
Requester update
-> request meaning changed

Settings mutation
-> workflow configuration changed
```

하지만 두 경우 모두 숨겨진 field mutation 대신 명시적이고 추적 가능한 재계산이
필요합니다.

---

## Settings Versioning과의 관계

이 결정은 Settings snapshot 또는 versioned configuration을 도입하지 않습니다.

프로젝트는 현재 다음을 저장하지 않습니다.

```txt
ticket.categoryConfigVersion
ticket.approvalConfigVersion
ticket.assignmentConfigVersion
```

따라서 과거의 정확한 설정 상태를 현재 업무 정책으로 안전하게 다시 적용할 수 없습니다.

대신 다음과 같이 역할을 구분합니다.

```txt
History
-> preserves what happened

Ticket current state
-> preserves current workflow responsibility

Settings
-> defines current configuration

explicit recalculation
-> reconnects current Ticket state to current Settings when required
```

전체 configuration versioning은 향후 확장으로 남깁니다.

---

## 결과

### 긍정적 결과

- immutable한 과거 의미를 보존함
- 중요한 Settings 변경 후 stale하고 잘못된 Approval ownership이 남는 것을 방지함
- 조용한 bulk Ticket mutation을 방지함
- 관리자가 변경 영향을 확인할 수 있음
- Tenant/scope isolation을 엄격하게 유지함
- 기존 server routing authority를 재사용함
- Settings mutation 동작을 설명할 수 있음
- LOCAL과 REMOTE를 정렬함
- Versioning하지 않는 Settings를 versioning하는 것처럼 취급하지 않음
- configuration management와 Ticket Action 실행을 구분함

### 부정적 결과 및 Trade-off

- workflow-sensitive Settings 변경이 더 복잡해짐
- mutation 전에 impact query가 필요함
- UI에 impact warning 또는 confirmation이 필요함
- 영향을 받는 Approval Ticket이 처음부터 재시작될 수 있음
- 관리자는 Settings 변경이 현재 workflow에 영향을 줄 수 있음을 이해해야 함
- Settings와 Ticket mutation에 더 큰 transaction boundary가 필요할 수 있음
- configuration versioning이 없으므로 이전 approval은 증거로 남지만 routing reset 후
  재사용하지 않음
- Assignment Rule 변경은 이미 assign된 active work를 자동으로 복구하지 않으므로
  별도의 운영 reassignment mechanism이 여전히 필요할 수 있음

---

## 거부한 동작

다음 동작은 의도적으로 사용하지 않습니다.

```txt
Settings changed
-> rewrite previous Ticket History
```

```txt
Approval Steps changed
-> keep invalid current approver forever
```

```txt
Settings changed
-> silently reroute every active Ticket
```

```txt
Assignment Rule changed
-> silently replace current workers
```

```txt
Category has active Tickets
-> all Category changes permanently blocked
```

```txt
Category Tenant changed
-> move existing Tickets into the new Tenant
```

```txt
Main Category scope changed
-> reinterpret historical Tickets under the new scope
```

```txt
UI confirmation
-> sufficient authorization for impact execution
```

---

## 구현 방향

의도한 application flow는 다음과 같습니다.

```txt
Settings mutation request
-> authenticate
-> resolve effective user
-> authorize stored Settings resource
-> classify mutation impact
-> find affected in-flight Tickets
```

Routing과 무관한 변경은 다음과 같이 처리합니다.

```txt
-> persist Settings
-> return
```

지원되는 routing-sensitive Category/Approval 변경은 다음과 같이 처리합니다.

```txt
-> return or expose impact to administrator
-> explicit proceed
-> validate new Settings
-> recalculate affected Approval routing
-> append new History
-> persist atomically
```

Boundary mutation은 다음과 같이 처리합니다.

```txt
tenant / scope / cross-boundary parent change
-> reject
```

Assignment Rule 변경은 다음과 같이 처리합니다.

```txt
-> persist valid current configuration
-> use it for future assignment resolution
-> do not silently replace current workers
```

---

## 관련 문서

- [Service Desk 설정](../03-domain/service-desk/settings.md)
- [Category 전략](../03-domain/service-desk/ticket/strategy/category-strategy.md)
- [Approval 시스템](../03-domain/service-desk/ticket/strategy/approval-system.md)
- [Assignment 정책](../03-domain/service-desk/ticket/strategy/assignment-policy.md)
- [Ticket History](../03-domain/service-desk/ticket/ticket-history.md)
- [Ticket Lifecycle](../03-domain/service-desk/ticket/ticket-lifecycle.md)
- [Ticket 운영 규칙](../03-domain/service-desk/ticket/reference/ticket-operation-rules.md)
- [Ticket Routing 및 Update 정책 (2026-07)](./2026-07-ticket-routing-and-update-policy.md)
- [Service Desk Tenant 설계 (2026-06)](./2026-06-service-desk-tenant-design.md)
- [Category 활성화 및 Routing 준비 상태 (2026-08)](./2026-08-category-activation-and-routing-readiness.md)

---

## 요약

Settings는 현재 업무 설정입니다.

History는 실제 수행한 업무를 기록한 변경 불가능한 근거입니다.

현재 티켓 담당자 정보는 현재 운영 상태입니다.

이 책임들은 서로 관련되지만 동일하지는 않습니다.

```txt
Settings change
-> never rewrite past History
```

```txt
Settings change invalidates active Approval routing
-> inspect impact
-> explicitly reroute
-> restart approval from the beginning
-> append new History
```

```txt
Assignment Rule change
-> affects future work resolution
-> does not silently replace current workers
```

```txt
Tenant / scope boundary change
-> reject
```

핵심 구분은 다음과 같습니다.

```txt
Preserving historical meaning
does not require preserving invalid current routing.
```

영향을 명시하고 권한·조건 검증과 추적 기록을 갖춘 경우에는 설정 변경으로 현재
담당 역할을 바꿀 수 있습니다.

과거 업무 기록은 실제와 다른 이벤트가 발생한 것처럼 바꾸지 않습니다.

---

## 상태

승인됨
