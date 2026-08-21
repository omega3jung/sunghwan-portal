# Category 활성화 및 Routing 준비 상태 (2026-08)

## 배경

Category는 Service Desk ticket 동작을 구성하는 중심 설정이다.

Category는 다음에 영향을 준다.

- request 분류
- approval routing
- work assignment
- priority 및 risk 기본값
- SLA 기반 due date 기대치
- requester update routing

기존 category lifecycle은 새 ticket workflow에서 category를 선택할 수 있는지를
`active` field로 결정했다.

```txt
active = true
-> available for new workflows

active = false
-> unavailable for new workflows
-> historical references remain valid
```

Service Desk Settings가 구체화되면서 설정 문제가 드러났다.

새로 생성된 Category의 Assignment Rule이 work ownership을 만들 준비가 되기 전에
Category가 active 상태가 될 수 있었다.

이로 인해 Settings에서는 유효해 보이지만 ticket이 work assignment 단계에 도달하면
실패하는 설정이 만들어질 수 있었다.

Assignment 결정이 다음 두 종류를 모두 지원하기 때문에 이 문제는 더 중요해졌다.

- 명시적인 Employee reference
- Job Field reference

또한 Sub Category는 자체 Assignment Rule을 정의하거나 Main Category rule을 상속할 수
있다.

따라서 프로젝트에는 다음 두 상태 사이를 더 명확하게 구분하는 lifecycle이 필요했다.

```txt
Category exists
and
Category is ready to participate in ticket routing
```

아울러 가벼운 설정 준비 상태와 실제 ticket을 routing할 때 필요한 더 강한 검증을
구분해야 했다.

---

## 문제

### 1. Category 생성과 운영 가능 상태를 같은 상태로 취급함

Category는 workflow 설정이 완료되기 전에도 구조적으로 유효할 수 있다.

예를 들면 다음과 같다.

```txt
create Category
-> configure defaults
-> configure Approval Steps
-> configure Assignment Rule
```

Category 생성 직후 다음 상태가 되면,

```txt
active = true
```

assignment 설정이 준비되기 전에 Category를 선택할 수 있게 된다.

그러면 다음과 같은 잘못된 workflow 구간이 생긴다.

```txt
Category created
-> visible to requester
-> Ticket submitted
-> no usable Assignment Rule
-> work routing cannot resolve ownership
```

기본 record가 성공적으로 생성되었다는 이유만으로 설정 entity가 운영 환경과 같은
workflow 가능 상태로 진입해서는 안 된다.

---

### 2. Assignment Rule의 존재만으로는 준비 상태를 정의할 수 없음

Assignment Rule은 다음과 같은 reference를 포함한다.

```ts
type AssigneeGroup = {
  jobFieldIds: string[];
  assigneeUsernames: string[];
};
```

다음과 같은 여러 상태가 가능하다.

```txt
no Assignment Rule
empty Assignment Rule
Assignment Rule with inactive references
Assignment Rule with active references
```

이 상태를 모두 같게 취급하면 설정 검증이 약해진다.

특히 명시적으로 저장된 빈 Assignment Rule은 의미가 모호하다.

다음 중 어느 의미인지 구분할 수 없다.

- 설정이 아직 완료되지 않음
- 의도적으로 worker가 없음
- Main Category rule 상속
- 잘못된 설정이 실수로 저장됨

시스템은 Assignment Rule의 부재와 존재에 각각 하나의 명확한 의미를 부여해야 했다.

---

### 3. Sub Category fallback이 잘못된 설정을 숨길 수 있음

Assignment 결정은 이미 다음 우선순위를 따른다.

```txt
selected Sub Category
-> own Assignment Rule when present
-> otherwise Main Category Assignment Rule
```

다음과 같이 구현하고 싶을 수 있다.

```txt
Sub Category own rule exists but is invalid
-> silently fall back to Main Category rule
```

이 방식은 UI를 견고해 보이게 만들지만 잘못된 설정을 숨긴다.

관리자는 Sub Category에 자체 routing 정책이 있다고 생각하지만 runtime에서는 다른
정책을 조용히 사용할 수 있다.

Fallback은 다음을 의미해야 한다.

```txt
no override exists
```

다음을 의미해서는 안 된다.

```txt
the override exists but does not work
```

---

### 4. 활성화 준비 상태와 실제 routing eligibility는 서로 다른 문제임

Settings에서는 설정에 사용할 수 있는 active reference가 포함되어 있는지 판단할 수
있다.

하지만 ticket routing은 나중에 더 많은 context와 함께 실행된다.

설정 시점과 ticket 실행 시점 사이에 다음이 발생할 수 있다.

- employee가 inactive 상태가 됨
- employee가 다른 company로 이동함
- organization 관계가 변경됨
- Job Field가 더 이상 eligible employee를 결정하지 못함
- Tenant 또는 Company 상태가 변경됨
- category authorization 또는 scope context가 변경됨

따라서 다음 전제는 안전하지 않다.

```txt
Category was ready when activated
-> Category will always resolve a worker later
```

활성화 검증은 routing 시점의 검증을 대체할 수 없다.

---

### 5. Parent Category의 사용 가능 상태가 Sub Category에 영향을 줌

Sub Category는 Main Category에 속하며 그 workflow scope를 상속한다.

다음 상태를 허용하면,

```txt
Main Category active = false
Sub Category active = true
-> Sub Category selectable
```

계층 구조가 깨진다.

반면 Main Category를 일시적으로 deactivate할 때 저장된 Sub Category 값을 자동으로
덮어쓰면 유용한 설정이 손실된다.

따라서 model은 다음을 구분해야 했다.

```txt
stored active state
and
effective active state
```

---

## 검토한 선택지

### 선택지 1 — Category를 active로 생성하고 ticket routing에서만 실패 처리

```txt
Create Category
-> active = true
-> allow selection
-> detect routing failure when Ticket is submitted
```

#### 장점

- 가장 단순한 Category lifecycle
- 최소한의 Settings 검증
- routing을 유일한 최종 검증 지점으로 유지

#### 단점

- 완료되지 않은 설정을 requester에게 노출함
- 관리 설정 오류를 사용자 workflow 실패로 전환함
- 명백한 routing 문제가 Ticket 생성 때까지 감지되지 않을 수 있음
- `active`의 의미가 약해짐
- 운영 설정 화면으로서 Settings의 유용성이 낮아짐

이 선택지는 채택하지 않았다.

---

### 선택지 2 — Category 생성 시 완전한 routing 설정을 요구

```txt
Create Category
-> require valid Assignment Rule immediately
-> create as active
```

#### 장점

- 명백히 불완전한 상태의 Category가 존재할 수 없음
- lifecycle 상태가 적음

#### 단점

- 기본 Category 생성과 Assignment Rule 편집이 결합됨
- 설정 순서가 불필요하게 경직됨
- 관리자가 category 계층을 먼저 생성할 수 없음
- Approval Step과 Assignment Rule 설정을 별도의 Settings workflow로 다루기 어려움
- Category 생성의 크기와 책임이 커짐

이 선택지는 채택하지 않았다.

---

### 선택지 3 — Inactive로 생성하고 별도로 설정한 뒤 준비되면 활성화

```txt
Create Category
-> force inactive

Configure Category / Approval / Assignment
-> validate readiness

Explicit activation
-> active
```

#### 장점

- 존재 여부와 운영 가능 상태를 분리함
- 단계적인 관리 설정을 지원함
- 완료되지 않은 Category가 requester workflow에 진입하지 못하게 함
- Settings의 책임을 분리된 상태로 유지함
- `active`에 더 강한 운영 의미를 부여함
- routing 시점 검증을 별도의 안전 경계로 유지함

#### 단점

- 설정 lifecycle이 추가됨
- UI에서 활성화 관련 feedback이 필요함
- LOCAL과 REMOTE가 같은 rule을 강제해야 함
- routing logic 외에 readiness logic이 필요함

이 선택지를 채택했다.

---

## 결정

명시적인 Category 활성화 lifecycle을 도입한다.

핵심 model은 다음과 같다.

```txt
Category created
-> inactive
-> configuration may be completed
-> readiness checked
-> explicitly activated
-> available for new Ticket workflows
```

Category 생성이 Category를 자동으로 운영 가능 상태로 만들어서는 안 된다.

Main Category와 Sub Category는 모두 생성 시 다음 값으로 저장한다.

```txt
active = false
```

client가 active 값을 전달해도 이 규칙을 적용한다.

LOCAL과 REMOTE runtime mode 모두에서 server boundary가 이 규칙의 최종 권한을 가진다.

---

## Category Lifecycle

의도한 lifecycle은 다음과 같다.

```txt
Create
-> Inactive
-> Configure
-> Ready
-> Activate
-> Active
```

Deactivation도 계속 지원한다.

```txt
Active
-> Deactivate
-> Inactive
```

Deactivate 후에도 과거 ticket reference는 유효하게 유지한다.

Category가 이전에 active였던 이후 reference된 organization data가 변경되었을 수
있으므로 재활성화할 때 readiness validation을 다시 수행한다.

---

## Assignment 준비 상태

Category는 effective Assignment Rule에 active assignment reference가 하나 이상 있을
때만 활성화할 수 있다.

조건을 만족하는 reference는 다음 중 하나다.

```txt
active Job Field
or
active Employee
```

개념적으로 다음과 같다.

```txt
effective Assignment Rule
-> active Job Field reference count >= 1
   OR
-> active Employee reference count >= 1
-> Category may be activated
```

이는 Settings readiness check다.

Routing 설정이 구조적으로 비어 있지 않으며 현재 active 상태인 assignment reference가
하나 이상 포함되어 있음을 증명한다.

실제 Ticket에서 eligible worker가 항상 하나 이상 결정된다는 것을 증명하지는
**않는다**.

---

## 비어 있는 Assignment Rule

비어 있는 Assignment Rule은 유효한 persisted routing configuration이 아니다.

다음 상태를 저장해서는 안 된다.

```txt
jobFieldIds = []
assigneeUsernames = []
```

Assignment reference가 없는 Assignment Rule에는 운영상 의미가 없다.

이 구분은 Sub Category에서 특히 중요하다.

```txt
no own Assignment Rule
-> inherit Main Category Assignment Rule

own Assignment Rule exists
-> use that rule
```

따라서 비어 있는 Sub Category Assignment Rule을 상속을 나타내는 placeholder로
사용해서는 안 된다.

Sub Category가 Main Category를 상속해야 한다면 자체 Assignment Rule이 없어야 한다.

---

## Sub Category Rule 결정

기존 assignment 우선순위를 유지한다.

```txt
selected Sub Category
-> own Assignment Rule when present
-> otherwise Main Category Assignment Rule
```

Fallback은 Sub Category에 **자체 Assignment Rule이 없을 때만** 발생한다.

기존 자체 rule이 잘못되었다는 이유로 fallback해서는 안 된다.

거부하는 동작은 다음과 같다.

```txt
Sub own rule exists
-> invalid or unusable
-> silently use Main rule
```

필요한 동작은 다음과 같다.

```txt
Sub own rule exists
-> validate that rule
-> failure remains visible

Sub own rule absent
-> use Main rule
```

이 방식은 설정 의도를 명시적으로 유지한다.

잘못된 override는 설정 오류이지 fallback signal이 아니다.

---

## 활성화를 위한 Effective Assignment Rule

Main Category의 readiness는 자체 Assignment Rule을 사용한다.

```txt
Main Category
-> Main Assignment Rule
```

Sub Category의 readiness는 ticket routing과 같은 우선순위를 사용한다.

```txt
Sub Category
-> own Assignment Rule when present
-> otherwise Main Category Assignment Rule
```

이를 통해 별도의 상속 rule을 중복 구현하지 않고 활성화 동작을 routing model과
정렬한다.

---

## 저장된 Active 상태와 Effective Active 상태

Sub Category의 사용 가능 여부는 두 level에서 파생된다.

```ts
effectiveActive = mainCategory.active && subCategory.active;
```

따라서 다음과 같다.

```txt
Main active + Sub active
-> effectively active

Main active + Sub inactive
-> effectively inactive

Main inactive + Sub active
-> effectively inactive

Main inactive + Sub inactive
-> effectively inactive
```

Main Category를 deactivate할 때 시스템이 모든 Sub Category에 저장된 `active` field를
덮어쓸 필요는 없다.

예를 들어 다음 상태를 저장된 채로 유지할 수 있다.

```txt
Main.active = false
Sub.active = true
```

다음 조건으로 인해 Sub Category는 여전히 사용할 수 없다.

```txt
effectiveActive = false
```

Main Category가 나중에 다시 활성화되면, Sub Category에 저장된 자체 상태를 파괴적으로
덮어쓴 상태가 아니라 다시 평가할 수 있다.

---

## Ticket 선택 정책

새 Ticket workflow에서는 effective active 상태인 Category만 사용할 수 있다.

Sub Category의 경우 requester가 선택할 수 있으려면 다음 조건을 만족해야 한다.

```txt
main.active
&& sub.active
&& category visible in the current Tenant/scope context
```

기존 Ticket은 나중에 inactive가 된 Category를 계속 표시할 수 있다.

Category deactivation이 과거 classification을 파괴해서는 안 된다.

---

## 활성화 준비 상태와 Routing 시점 검증

시스템은 의도적으로 두 개의 validation boundary를 유지한다.

### 활성화 시점 준비 상태

활성화는 다음을 확인한다.

```txt
Is this Category configuration sufficiently prepared to be exposed to new
Ticket workflows?
```

다음과 같은 설정 준비 상태를 검사한다.

- effective Assignment Rule 존재 여부
- active Job Field 또는 active Employee reference가 하나 이상 존재하는지
- Category hierarchy가 유효한지
- 적용되는 parent state가 활성화를 허용하는지
- Settings authorization이 mutation을 허용하는지

이를 통해 명백히 완료되지 않은 설정이 active 상태가 되는 것을 막는다.

---

### Routing 시점 검증

Ticket routing은 다음을 확인한다.

```txt
Can this specific Ticket resolve valid current ownership now?
```

Routing은 더 강한 검증을 수행해야 한다.

다음을 계속 검증한다.

- 현재 Category 및 Tenant 상태
- 현재 Company boundary
- 현재 Assignment Rule
- reference된 Job Field
- reference된 Employee
- employee activity
- employee company eligibility
- scope별 assignment rule
- 최종 결정된 worker 집합

핵심 invariant는 다음과 같다.

```txt
resolved workers.length >= 1
```

유효한 worker를 결정할 수 없으면 routing은 실패한다.

시스템은 다음 상태를 생성해서는 안 된다.

```txt
status = Assigned
assigneeUsernames = []
```

따라서 활성화는 설정 품질 gate다.

Routing은 운영상의 source of truth로 유지한다.

---

## 활성화 시 Worker를 결정하고 고정하지 않는 이유

Category 활성화 시 실제 worker username을 결정한 뒤 그 결과를 이후 operability의
증거로 사용하는 대안이 있다.

이 대안은 채택하지 않았다.

Assignment 설정은 Job Field를 reference할 수 있고, 활성화 후 organization data가
변경될 수 있다.

활성화 시점의 worker resolution snapshot을 저장하거나 신뢰하면 stale 상태가 된다.

의도한 관계는 다음과 같다.

```txt
Settings
-> stores routing references

Activation
-> validates configuration readiness

Ticket routing
-> resolves current eligible workers
```

이를 통해 organization membership을 동적으로 유지하면서 완료되지 않은 Settings가
불필요하게 노출되는 것을 막는다.

---

## UI Capability

Settings UI는 다음과 같은 파생 capability를 노출할 수 있다.

```ts
canActivateCategory
```

이 값으로 다음을 제어할 수 있다.

- activation switch 사용 가능 여부
- 설명 message
- disabled 상태
- 관리자 안내

이 capability는 UI/application projection이다.

Authorization 또는 validation의 source of truth가 아니다.

필요한 boundary는 다음과 같다.

```txt
UI canActivateCategory
-> improve interaction

Server activation validation
-> authoritative decision
```

일반적으로 client가 control을 disable한다는 이유만으로 조작된 request가 준비되지 않은
Category를 활성화할 수 있어서는 안 된다.

---

## LOCAL과 REMOTE 일관성

이 lifecycle은 두 runtime mode 모두에 적용한다.

```txt
UI
-> feature API client
-> Route Handler / application boundary
-> LOCAL or REMOTE implementation
```

### LOCAL

LOCAL mutable demo state는 다음을 수행해야 한다.

- Category를 inactive 상태로 생성
- Assignment Rule readiness 강제
- Main/Sub effective active 동작 적용
- 잘못된 활성화 방지

### REMOTE

REMOTE service와 repository는 다음을 수행해야 한다.

- Category를 active 상태로 생성하려는 client 요청을 무시하거나 거부
- 새 Category를 inactive 상태로 저장
- 저장된 Category 및 Assignment data를 기준으로 활성화 검증
- server/database boundary에서 organization reference 검증
- routing 시점의 worker validation 유지

UI는 어떤 구현이 결과를 제공했는지 알 필요가 없어야 한다.

---

## Approval 설정과의 관계

Category activation readiness는 주로 work Assignment readiness를 기준으로 제한한다.

Approval 설정은 Approval Step을 저장할 때와 실제 approval route를 결정할 때 각각
독립적으로 검증한다.

Approval은 선택 사항이므로 Approval Step이 없는 Category도 유효하다.

반면 정상적으로 처리된 모든 Ticket에는 결국 work ownership이 필요하므로, 실행 가능한
work-assignment 설정이 전혀 없는 Category는 운영상 완료되지 않은 상태다.

따라서 다음과 같다.

```txt
Approval Steps
-> optional routing phase

Assignment Rule
-> required path to work ownership
```

활성화 준비 상태는 "approval 불필요"와 "worker 불필요"를 혼동해서는 안 된다.

---

## 이력 무결성과의 관계

이 결정은 Category가 향후 workflow에서 사용 가능해지는 시점을 변경한다.

과거 ticket의 의미는 변경하지 않는다.

```txt
Category configuration lifecycle
-> future Ticket availability

Existing Ticket / Action / History
-> preserved
```

Deactivate하거나 향후 readiness rule을 만족하지 못하더라도 기존 Ticket History를
다시 작성해서는 안 된다.

기존 ticket의 상태 변경은 명시적인 Ticket workflow operation과 별도의 Settings 변경
영향 정책을 계속 따른다.

---

## 결과

### 긍정적 결과

- 완료되지 않은 Category가 requester workflow에 즉시 진입할 수 없음
- `active`가 운영 가능 상태를 더 명확하게 나타냄
- 관리자가 설정을 단계적으로 생성할 수 있음
- Assignment Rule 상속의 의미가 명확해짐
- 잘못된 Sub Category override를 fallback으로 숨길 수 없음
- Main/Sub active 계층이 명확해짐
- LOCAL과 REMOTE가 같은 lifecycle 동작을 따를 수 있음
- UI에서 Category를 아직 활성화할 수 없는 이유를 설명할 수 있음
- 활성화 후 organization이 변경되어도 routing이 계속 보호함
- 소유자가 없는 `Assigned` ticket 생성을 방지함

---

### 부정적 결과 및 Trade-off

- Category에 더 명시적인 관리 lifecycle이 생김
- Settings UI에 readiness feedback이 필요함
- 활성화에 추가 server validation이 필요함
- readiness logic과 routing validation을 의도적으로 분리하므로 서로 달라지지 않게
  유지해야 함
- 관리자는 Category를 활성화하기 전에 여러 Settings 영역을 설정해야 할 수 있음
- organization data가 변경되면 active Category도 나중에 일시적으로 routing할 수 없는
  상태가 될 수 있으므로 runtime failure handling이 계속 필요함

---

## 거부한 단순화

다음 shortcut은 의도적으로 사용하지 않는다.

```txt
Category created -> immediately active
```

```txt
Assignment Rule exists -> automatically ready
```

```txt
empty Sub rule -> Main fallback
```

```txt
invalid Sub rule -> Main fallback
```

```txt
Category activated once -> future routing validation unnecessary
```

```txt
Main deactivated -> permanently overwrite all Sub active flags
```

```txt
UI disabled state -> sufficient activation protection
```

각 shortcut은 설정 의도, 운영 가능 상태, 실제 workflow 실행 사이의 유용한 boundary를
제거한다.

---

## 구현 방향

의도한 구현 방향은 다음과 같다.

```txt
Category Create
-> server forces active = false
```

```txt
Assignment Rule Save
-> reject empty rule
-> validate referenced Job Fields / Employees
```

```txt
Category Activation
-> resolve effective Assignment Rule
-> verify active assignment reference exists
-> persist active = true
```

```txt
Ticket Submit / Resubmit / Explicit Routing Recalculation
-> resolve current rule
-> resolve current eligible workers
-> require at least one worker
-> continue workflow
```

Sub Category의 경우 다음과 같다.

```txt
effectiveAssignmentRule =
  subOwnRule ?? mainRule
```

여기서 `subOwnRule`은 유효하게 저장된 override이거나 존재하지 않는다.

잘못 저장된 override를 부재 상태로 normalize해서는 안 된다.

---

## 관련 문서

- [Service Desk 설정](../03-domain/service-desk/settings.md)
- [Category 전략](../03-domain/service-desk/ticket/strategy/category-strategy.md)
- [Assignment 정책](../03-domain/service-desk/ticket/strategy/assignment-policy.md)
- [Approval 시스템](../03-domain/service-desk/ticket/strategy/approval-system.md)
- [Ticket Lifecycle](../03-domain/service-desk/ticket/ticket-lifecycle.md)
- [Ticket 운영 규칙](../03-domain/service-desk/ticket/reference/ticket-operation-rules.md)
- [Service Desk Settings DTO/API 경계 (2026-06)](./2026-06-service-desk-settings-dto-api-boundary.md)
- [Service Desk Tenant 설계 (2026-06)](./2026-06-service-desk-tenant-design.md)

---

## 요약

Category 활성화는 Category 생성의 side effect가 아니라 명시적인 설정 lifecycle이다.

```txt
Create inactive
-> configure
-> validate readiness
-> explicitly activate
```

Assignment readiness에는 active Job Field 또는 active Employee reference가 하나 이상
포함된 effective Assignment Rule이 필요하다.

Sub Category routing은 자체 rule이 있으면 이를 사용하고, 자체 rule이 없을 때만 Main
Category로 fallback한다.

```txt
missing override
-> fallback

invalid override
-> error
```

Main Category 상태는 effective Sub Category availability도 제어한다.

```txt
effectiveActive = main.active && sub.active
```

활성화 시점의 readiness와 ticket routing 시점의 eligibility는 계속 분리한다.

```txt
Activation
-> configuration quality gate

Routing
-> current operational validation
```

Category가 active라는 것은 새 workflow 선택에 진입할 수 있도록 충분히 설정되었음을
의미한다.

실제 Ticket을 routing할 때마다 현재 eligible worker를 결정하고 검증해야 한다는
요구 사항은 그대로 유지된다.

---

## 상태

승인됨
