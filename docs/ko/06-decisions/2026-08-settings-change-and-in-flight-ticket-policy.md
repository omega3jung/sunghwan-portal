# Settings 변경 및 진행 중 Ticket 정책 (2026-08)

## 배경

Service Desk Settings는 ticket workflow에서 사용하는 동작을 정의한다.

주요 settings 영역은 다음과 같다.

```txt
Tenant
-> Category
-> Approval Step
-> Assignment Rule
```

이 settings는 다음에 영향을 줄 수 있다.

- ticket classification
- category 기본값
- approval 요구 사항
- 현재 및 향후 approver
- work assignment
- tenant 및 scope boundary
- routing 동작

이전 설계에서는 Settings를 과거 workflow 상태가 아니라 현재 설정으로 의도적으로
취급했다.

단순화한 정책은 다음과 같았다.

```txt
Settings change
-> affects future workflow resolution

Existing Ticket state / History
-> remains unchanged
```

이 정책은 이력 무결성을 보호하고 관리 설정 변경이 이미 실행된 workflow event를
조용히 다시 작성하는 것을 막았다.

하지만 REMOTE Service Desk 구현이 구체화되면서 다음 사례가 중요해졌다.

```txt
A Ticket is still in progress
while
the Settings that define its current routing are changed.
```

예를 들면 다음과 같다.

```txt
Ticket
-> status = Approval
-> current approver resolved from Approval Step

Admin changes Category / Approval Step configuration
-> current routing may no longer match the configuration
```

기존 ticket을 계속 보존하기만 하면 과거 상태는 보호할 수 있지만, active workflow가
더 이상 유효하지 않은 설정을 계속 사용하게 될 수 있다.

따라서 프로젝트는 다음을 구분해야 했다.

```txt
historical meaning
from
current operational validity
```

---

## 문제

### 1. "Settings는 향후 Ticket에만 영향을 준다"는 규칙이 너무 포괄적임

Settings가 과거 workflow의 의미를 소급하여 다시 작성해서는 안 되므로 기존 rule은
유용했다.

하지만 서로 다른 다음 두 가지를 같은 것으로 취급했다.

```txt
Past workflow evidence
Current in-flight workflow state
```

두 상태의 책임은 서로 다르다.

과거 workflow 증거에는 다음이 포함된다.

- Ticket Action
- Ticket History
- 완료된 approval event
- 이전 assignment event
- 이전 status transition

이 record들은 immutable 상태로 유지해야 한다.

현재 진행 중인 상태에는 다음이 포함된다.

- 현재 `status`
- 현재 `approvalStepId`
- 현재 `assigneeUsernames`
- 현재 approval responsibility
- 현재 work responsibility

이 상태는 workflow를 **현재** 누가 소유하는지를 나타낸다.

설정 변경으로 ownership이 무효화되었는데도 이를 무기한 보존하면 active ticket이 현재
Service Desk 정책과 일치하지 않을 수 있다.

---

### 2. 모든 Ticket을 조용히 재계산하는 방식도 안전하지 않음

반대 정책은 다음과 같다.

```txt
Settings mutation
-> automatically recalculate every related Ticket
```

이 방식에도 문제가 있다.

Settings를 편집하면 예기치 않게 다음이 발생할 수 있다.

- 현재 approver 교체
- 현재 worker 교체
- approval 재시작
- ticket status 변경
- 여러 Ticket의 운영 responsibility 변경

관리자는 설정을 편집하는 operation이 active Ticket workflow까지 변경한다는 사실을
인식하지 못할 수 있다.

따라서 Settings mutation과 Ticket workflow mutation을 보이지 않는 side effect로
결합해서는 안 된다.

---

### 3. 과거 audit와 현재 routing을 혼동해서는 안 됨

Ticket이 approval step 1을 완료했다고 가정한다.

```txt
APPROVAL_APPROVED
actor = userA
```

이후 Settings에서 Approval Step 설정이 변경된다.

기존 History는 계속 다음을 의미해야 한다.

```txt
userA approved the Ticket under the routing that existed at that time
```

새 approver가 승인한 것처럼 다시 작성해서는 안 된다.

동시에 Ticket이 여전히 `Approval` 상태라면 현재 approval ownership을 재계산해야 할 수
있다.

따라서 다음 관계가 성립한다.

```txt
preserve History
!=
preserve current routing forever
```

---

### 4. Settings 변경마다 안전 수준이 다름

모든 Settings mutation이 같은 영향을 가져서는 안 된다.

예시는 다음과 같다.

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

따라서 시스템은 다음을 구분해야 한다.

- 안전한 설명/설정 변경
- workflow-sensitive 변경
- immutable boundary 변경

---

### 5. Tenant 변경은 routing 재계산과 근본적으로 다름

Tenant는 Service Desk 설정 boundary다.

Category를 한 Tenant에서 다른 Tenant로 변경하면 다음이 달라질 수 있다.

- company context
- authorization
- 사용 가능한 approver
- eligible worker
- category scope
- ticket visibility
- reporting ownership

이는 단순한 routing refresh가 아니다.

Cross-Tenant 이동은 resource 자체의 의미를 변경한다.

시스템은 관련 Ticket을 rerouting하여 사후에 이 변경을 복구하려 해서는 안 된다.

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

완전한 정책으로는 이 선택지를 채택하지 않았다.

다만 이력 무결성 원칙은 유지한다.

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

이 선택지는 채택하지 않았다.

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

일반적인 Category 설정 변경에는 이 선택지를 채택하지 않았다.

Immutable domain boundary를 넘는 변경에는 이 차단 원칙을 유지한다.

---

### 선택지 4 — 영향을 확인하고 boundary를 구분하여 허용된 경우 명시적으로 rerouting

```txt
Settings mutation requested
-> inspect affected in-flight Tickets
-> classify change
-> warn or block
-> apply explicit supported impact policy
```

일반적인 Category/routing 설정은 다음과 같이 처리한다.

```txt
impact detected
-> administrator sees impact
-> mutation may proceed explicitly
-> affected current routing is recalculated when required
-> previous workflow evidence remains in History
```

Immutable Tenant/scope boundary 변경은 다음과 같이 처리한다.

```txt
mutation requested
-> reject
```

이 선택지를 채택했다.

---

## 결정

Settings 변경은 과거 workflow의 의미를 보존하면서 영향을 받는 진행 중 Ticket을
명시적으로 처리해야 한다.

핵심 정책은 다음과 같다.

```txt
Past History
-> immutable

Current Ticket routing
-> may be recalculated when the Settings mutation invalidates it

Tenant / scope identity
-> immutable after creation
```

Settings mutation이 active Ticket workflow를 조용히 다시 작성해서는 안 된다.

Workflow-sensitive mutation이 진행 중인 Ticket에 영향을 줄 수 있으면 server는 변경을
완료하기 전에 그 영향을 확인해야 한다.

---

## 이력 무결성

Settings가 변경되어도 다음 record는 재계산하지 않는다.

```txt
Ticket Action
Ticket History
completed approval events
completed assignment events
previous status transitions
work-session evidence
```

예를 들어 다음 event는,

```txt
APPROVAL_APPROVED
actor = alice
createdAt = previous timestamp
```

다음 상황에서도 변경하지 않는다.

- Approval Step 편집
- approver 설정 교체
- 이후 Category 설정 변경

History는 실제로 발생한 일을 기록한다.

```txt
Settings describe current configuration.
History describes executed workflow.
```

두 책임은 분리된 상태로 유지해야 한다.

---

## 현재 Ticket 상태는 과거 증거가 아님

Ticket row는 현재 workflow 상태를 나타낸다.

중요한 routing field는 다음과 같다.

```txt
status
approvalStepId
assigneeUsernames
categoryId
```

명시적인 workflow operation이 요구하면 이 field들은 정당하게 변경될 수 있다.

따라서 다음 원칙이,

```txt
History immutable
```

다음을 의미하지는 않는다.

```txt
Ticket current routing immutable
```

지원되는 Settings mutation으로 현재 routing이 잘못되면 Ticket을 명시적으로
rerouting할 수 있으며, 이전 routing은 History를 통해 계속 확인할 수 있다.

---

## 영향 확인

Workflow-sensitive Settings mutation을 적용하기 전에 server는 진행 중인 Ticket이
영향받는 설정에 의존하는지 판단해야 한다.

개념적으로 다음과 같다.

```txt
Settings mutation
-> resolve stored Tenant / Category relationship
-> identify affected configuration
-> query related in-flight Tickets
-> determine workflow impact
-> apply mutation policy
```

영향 확인에는 server에 저장된 relationship을 사용해야 한다.

Client가 제공하는 다음 값은,

```txt
tenantId
companyId
category scope
affected ticket count
```

authorization 또는 impact evidence로 신뢰해서는 안 된다.

---

## 진행 중인 Ticket 범위

이 영향 정책은 아직 active workflow responsibility가 있는 Ticket을 대상으로 한다.

예시는 다음과 같다.

```txt
Approval
Assigned
Working
Pending
```

정확한 대상 status 집합은 변경되는 Settings resource에 따라 달라진다.

Terminal 또는 historical state에서 완료된 routing을 다시 작성할 필요는 없다.

예를 들어 다음 상태는,

```txt
Declined
Rejected
Resolved
Closed
```

이후 다른 명시적 Ticket operation이 routing에 다시 진입시키지 않는 한 workflow가
실행되던 당시 설정과 과거 관계를 유지할 수 있다.

Draft는 submit할 때 routing을 결정하므로 submit 시점의 현재 유효한 Settings를
사용한다.

---

## 변경 분류

Settings mutation은 영향에 따라 분류해야 한다.

### 1. 설명 변경

예시는 다음과 같다.

```txt
Category name
description
request template
display color or similar presentation metadata
```

일반적인 영향은 다음과 같다.

```txt
Settings update
-> no current routing reset
```

기존 History는 변경하지 않는다.

현재 UI가 Category reference data를 결정할 때 최신 Category label을 표시할 수 있지만,
과거 event의 의미를 다시 작성하지는 않는다.

---

### 2. 기본값 및 향후 파생 변경

예시는 다음과 같다.

```txt
default priority
default risk
default SLA days
```

일반적으로 다음에 영향을 준다.

- 향후 Ticket
- 향후 requester routing-sensitive update
- 향후 명시적인 routing recalculation

그 자체로 현재 Ticket planning value를 조용히 다시 작성하지는 않는다.

기본값 변경은 모든 active Ticket에 `ADJUST`를 실행하는 것과 같지 않다.

---

### 3. Routing-Sensitive 변경

다음을 결정하는 설정의 변경이 포함된다.

```txt
approval pipeline
approval assignee resolution
assignment rule
effective category routing
```

이 변경은 현재 workflow ownership에 영향을 줄 수 있다.

Server는 mutation을 완료하기 전에 관련된 진행 중 Ticket을 확인해야 한다.

---

### 4. Boundary 변경

예시는 다음과 같다.

```txt
Category Tenant
Main Category scope
Sub Category parent when it crosses Tenant/scope
```

이 update는 지원하지 않는다.

Ticket rerouting으로 복구하는 대신 거부해야 한다.

지원하는 migration pattern은 다음과 같다.

```txt
deactivate old configuration
-> create new configuration in the correct boundary
```

이를 통해 다음을 보존한다.

- Tenant isolation
- 과거 Category reference
- 현재 Ticket 의미
- authorization 일관성

---

## Category 변경 정책

변경이 기존 Tenant 및 scope boundary 안에서 이루어지고 관리자가 영향을 확인한 후
명시적으로 진행한다면, 관련 active Ticket이 있어도 Category 설정을 변경할 수 있다.

개념적으로 다음과 같다.

```txt
Category mutation
-> affected Ticket check
```

관련된 진행 중 Ticket이 없으면 다음을 수행한다.

```txt
apply Settings mutation
```

관련 Ticket이 있으면 다음을 수행한다.

```txt
show impact warning
-> administrator explicitly proceeds
-> apply supported Ticket impact policy
```

UI warning은 관리자의 이해를 돕기 위한 것이다.

실제로 영향을 받는 Ticket은 server가 결정한다.

---

## Approval 영향 정책

`Approval` Ticket은 현재 Approval Step과 현재 approver를 저장하므로 Approval 설정은
특히 민감하다.

Category 또는 Approval Step 변경으로 현재 approval routing이 무효화되면, 이전의
완료되지 않은 approval pipeline이 여전히 authoritative한 것처럼 Ticket을 계속
진행해서는 안 된다.

선택한 정책은 다음과 같다.

```txt
affected Ticket in Approval
-> preserve previous approval History
-> reset current approval context
-> rerun routing from the beginning
```

개념적으로 다음과 같다.

```txt
current Approval Ticket
-> clear invalid current approval routing
-> resolve first applicable Approval Step again
-> resolve current approvers
```

더 이상 approval이 필요하지 않다면 다음과 같이 처리한다.

```txt
-> resolve work Assignment
-> status = Assigned
```

계속 approval이 필요하다면 다음과 같이 처리한다.

```txt
-> status = Approval
-> approvalStepId = newly resolved step
-> assigneeUsernames = newly resolved approvers
```

이전에 완료된 approval은 과거 event로 보존한다.

새로 계산한 pipeline의 step이 이미 승인되었다는 증거로 재사용하지 않는다.

이는 requester routing-sensitive update와 같은 원칙을 따른다.

```txt
old routing result invalidated
-> routing starts again
```

---

## Approval을 처음부터 다시 시작하는 이유

"가장 가까운 동등한" step부터 계속하는 방식은 채택하지 않았다.

예를 들면 다음과 같다.

```txt
old steps:
A -> B -> C

new steps:
A -> D -> C
```

Ticket이 현재 `B`에 있다면 다음을 추론해야 한다.

```txt
A is still valid
C should remain pending
D has effectively been skipped
```

그러려면 프로젝트에서 현재 구현하지 않는 configuration-version semantic이 필요하다.

더 안전하고 설명하기 쉬운 rule은 다음과 같다.

```txt
routing-invalidating configuration change
-> restart approval resolution
```

History에는 이전 approval이 발생했다는 사실이 계속 표시된다.

재시작한 workflow는 새로운 현재 정책을 나타낸다.

---

## Assignment 영향 정책

Assignment Settings는 Ticket이 work routing에 진입하거나 재진입할 때 worker를
결정하는 방식을 설명한다.

Assignment Rule이 변경되었다는 이유만으로 Settings mutation이 현재 work ownership을
조용히 다시 작성해서는 안 된다.

따라서 baseline은 다음과 같다.

```txt
existing current workers
-> remain current workers
until an explicit workflow operation changes work assignment
```

Assignment Rule 변경은 다음에 영향을 준다.

- 새 Ticket routing
- 최종 approval에서 work assignment로 전환
- resubmission
- requester routing-sensitive update
- 다른 명시적인 routing recalculation

이를 통해 Assignment Rule 편집이 보이지 않는 bulk `ASSIGN` command로 바뀌는 것을
막는다.

향후 운영 요구 사항으로 영향받는 active Ticket을 관리자가 재할당해야 한다면, 자체
History semantic을 가진 별도의 명시적인 command 또는 bulk operation으로 modeling해야
한다.

---

## Category 변경과 Tenant 변경

두 변경은 의도적으로 구분한다.

### Category 설정

동일한 immutable Tenant/scope boundary 안에서는 다음이 가능하다.

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
상태에서 다음 Category를,

```txt
Tenant A Category
```

다음으로 바꾸는 것을 막는다.

```txt
Tenant B Category
```

Tenant 이동은 Settings edit가 아니다.

새로운 domain identity와 authorization context를 생성하는 일이다.

---

## Warning과 Authorization

UI는 다음을 표시할 수 있다.

- 영향을 받는 Ticket 수
- 영향을 받는 workflow 유형
- 확인 message
- Approval이 재시작될 수 있다는 설명

이를 통해 관리자가 영향을 더 잘 인식할 수 있다.

하지만 다음 관계가 성립한다.

```txt
UI confirmation
!= authorization
```

Server는 계속 다음을 검증해야 한다.

- authenticated identity
- effective impersonated identity
- Settings capability
- 저장된 Tenant relationship
- Category scope
- mutation input
- 영향을 받는 Ticket relationship

Rerouting 필요 여부도 server가 결정한다.

---

## Transaction Boundary

영향받는 Ticket routing도 변경하는 Settings mutation이 시스템을 부분 상태로
남겨서는 안 된다.

안전하지 않은 결과는 다음과 같다.

```txt
Approval Step updated
-> Ticket rerouting fails
-> Ticket still references invalid current Approval Step
```

또는 다음과 같다.

```txt
Ticket rerouted
-> Settings write fails
```

지원되는 mutation에 즉시 Ticket 재계산이 필요하면 operation을 하나의 application use
case로 취급해야 한다.

개념적으로 다음과 같다.

```txt
validate Settings mutation
-> inspect affected Tickets
-> validate rerouting result
-> persist Settings change
-> persist Ticket routing changes
-> append History
-> commit
```

REMOTE 실행은 적절한 database transaction boundary를 사용해야 한다.

LOCAL mutable demo 동작도 외부에 보이는 같은 결과를 제공해야 한다.

---

## Settings로 인한 Rerouting History

Settings mutation은 이전 History를 절대 편집해서는 안 된다.

Settings 변경으로 현재 Ticket routing을 reset하면 reset 자체가 새로운 event다.

History model은 다음 두 원인을 구분할 수 있을 만큼 명확하게 원인을 나타내야 한다.

```txt
requester changed request content
```

```txt
administrator changed workflow configuration
```

기존 event/source model이 영향을 정확히 나타낼 수 있으면 재사용한다.

현재 History contract에서 두 원인을 모호하지 않게 구분할 수 없다면 기존 event를 다시
작성하는 대신 History metadata 또는 source semantic을 확장하는 편이 낫다.

중요한 invariant는 다음과 같다.

```txt
old History remains
+
new routing effect is appended
```

다음이 아니다.

```txt
old History is recomputed
```

---

## 실패 정책

Rerouting이 필요한 Settings mutation은 새 설정으로 유효한 workflow를 만들 수 없으면
실패할 수 있다.

예시는 다음과 같다.

```txt
no valid approver can be resolved
no valid worker can be resolved when approval is no longer required
referenced organization data became invalid
Category is not operationally ready
```

시스템은 다음과 같은 상태를 저장해서는 안 된다.

```txt
status = Approval
assigneeUsernames = []
```

또는 다음과 같은 상태를 저장해서는 안 된다.

```txt
status = Assigned
assigneeUsernames = []
```

workflow에 ownership이 필요한 경우 위 상태는 유효하지 않다.

필수 rerouting이 유효한 결과를 만들 수 없으면 mutation이 영향을 받는 Ticket을 부분
update 상태로 남겨서는 안 된다.

---

## LOCAL과 REMOTE 일관성

이 정책은 두 runtime mode 모두에 적용한다.

```txt
Settings UI
-> feature API
-> Route Handler / application handler
-> impact policy
-> LOCAL handler or REMOTE service
```

### LOCAL

LOCAL mutable demo state는 다음을 수행해야 한다.

- 영향을 받는 demo Ticket 식별
- 동일한 warning/impact 결과 노출
- immutable boundary 변경 거부
- 지원되는 정책에서 요구하면 영향을 받는 Approval Ticket rerouting
- 기존 event를 다시 작성하지 않고 대응하는 History 추가

### REMOTE

REMOTE는 다음을 수행해야 한다.

- 저장된 relationship에서 영향 파생
- mutation 전에 authorization 강제
- transaction-aware Settings 및 Ticket service 사용
- server routing logic 재실행
- 변경된 Ticket 상태 저장
- immutable History 추가

UI는 하나의 application-facing contract를 사용해야 한다.

---

## Requester Update Routing과의 관계

프로젝트는 requester update에 이미 다음 정책을 사용한다.

```txt
routing-neutral change
-> preserve current routing

routing-sensitive change
-> invalidate current routing
-> restart routing from the beginning
```

Settings로 인한 approval 무효화도 같은 architecture 원칙을 따른다.

```txt
current routing assumptions became invalid
-> do not patch them incrementally
-> recompute routing through the server authority
```

원인은 서로 다르다.

```txt
Requester update
-> request meaning changed

Settings mutation
-> workflow configuration changed
```

하지만 두 경우 모두 숨겨진 field mutation 대신 명시적이고 추적 가능한 재계산이
필요하다.

---

## Settings Versioning과의 관계

이 결정은 Settings snapshot 또는 versioned configuration을 도입하지 않는다.

프로젝트는 현재 다음을 저장하지 않는다.

```txt
ticket.categoryConfigVersion
ticket.approvalConfigVersion
ticket.assignmentConfigVersion
```

따라서 정확한 과거 Settings snapshot을 현재 workflow 정책으로 안전하게 replay할 수
없다.

대신 다음과 같이 역할을 구분한다.

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

전체 configuration versioning은 향후 확장으로 남긴다.

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

다음 동작은 의도적으로 사용하지 않는다.

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

의도한 application flow는 다음과 같다.

```txt
Settings mutation request
-> authenticate
-> resolve effective user
-> authorize stored Settings resource
-> classify mutation impact
-> find affected in-flight Tickets
```

Routing과 무관한 변경은 다음과 같이 처리한다.

```txt
-> persist Settings
-> return
```

지원되는 routing-sensitive Category/Approval 변경은 다음과 같이 처리한다.

```txt
-> return or expose impact to administrator
-> explicit proceed
-> validate new Settings
-> recalculate affected Approval routing
-> append new History
-> persist atomically
```

Boundary mutation은 다음과 같이 처리한다.

```txt
tenant / scope / cross-boundary parent change
-> reject
```

Assignment Rule 변경은 다음과 같이 처리한다.

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

Settings는 현재 workflow 설정이다.

History는 실행된 workflow에 대한 immutable evidence다.

현재 Ticket routing은 운영 상태다.

이 책임들은 서로 관련되지만 동일하지는 않다.

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

핵심 구분은 다음과 같다.

```txt
Preserving historical meaning
does not require preserving invalid current routing.
```

영향이 명시적이고 authorized, validated, traceable한 경우 설정 변경으로 현재 workflow
responsibility를 update할 수 있다.

과거 workflow 증거가 실제와 다른 event가 발생한 것처럼 보이게 해서는 안 된다.

---

## 상태

승인됨
