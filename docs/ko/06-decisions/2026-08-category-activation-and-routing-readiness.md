# Category 활성화 및 Routing 준비 상태 (2026-08)

## 배경

Category는 Service Desk 티켓 처리 방식을 정하는 핵심 설정입니다.

Category가 영향을 주는 항목은 다음과 같습니다.

- request 분류
- approval routing
- work assignment
- priority 및 risk 기본값
- SLA 기반 due date 기대치
- requester update routing

기존 category lifecycle은 새 ticket workflow에서 category를 선택할 수 있는지를
`active` field로 결정했습니다.

```txt
active = true
-> available for new workflows

active = false
-> unavailable for new workflows
-> historical references remain valid
```

Service Desk Settings가 구체화되면서 설정 문제가 드러났습니다.

새로 생성한 Category에 작업자를 배정할 Assignment Rule이 준비되지 않아도
Category가 활성화될 수 있었습니다.

그 결과 설정 화면에서는 유효해 보이지만 티켓이 작업자 배정 단계에 도달하면
실패하는 설정이 생길 수 있었습니다.

Assignment 결정이 다음 두 종류를 모두 지원하기 때문에 이 문제는 더 중요해졌습니다.

- 명시적인 Employee reference
- Job Field reference

또한 Sub Category는 자체 Assignment Rule을 정의하거나 Main Category rule을 상속할 수
있습니다.

따라서 프로젝트에는 다음 두 상태를 더 명확하게 구분하는 lifecycle이 필요했습니다.

```txt
Category exists
and
Category is ready to participate in ticket routing
```

설정의 준비 여부를 확인하는 검사와 실제 티켓의 담당자를 결정할 때 필요한 더
엄격한 검증도 구분해야 했습니다.

---

## 문제

### 1. Category 생성과 운영 가능 상태를 같은 상태로 취급함

Category는 workflow 설정이 완료되기 전에도 구조적으로 유효할 수 있습니다.

예를 들면 다음과 같습니다.

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

assignment 설정이 준비되기 전에 Category를 선택할 수 있게 됩니다.

그러면 다음과 같은 잘못된 workflow 구간이 생깁니다.

```txt
Category created
-> visible to requester
-> Ticket submitted
-> no usable Assignment Rule
-> work routing cannot resolve ownership
```

기본 레코드를 생성했다는 이유만으로 새 티켓에서 사용할 수 있는 설정이 되어서는
안 됩니다.

---

### 2. Assignment Rule의 존재만으로는 준비 상태를 정의할 수 없음

Assignment Rule은 다음과 같은 reference를 포함합니다.

```ts
type AssigneeGroup = {
  jobFieldIds: string[];
  assigneeUsernames: string[];
};
```

다음과 같은 여러 상태가 가능합니다.

```txt
no Assignment Rule
empty Assignment Rule
Assignment Rule with inactive references
Assignment Rule with active references
```

이 상태를 모두 같게 취급하면 설정 검증이 약해집니다.

특히 명시적으로 저장된 빈 Assignment Rule은 의미가 모호합니다.

다음 중 어느 의미인지 구분할 수 없습니다.

- 설정이 아직 완료되지 않음
- 의도적으로 worker가 없음
- Main Category rule 상속
- 잘못된 설정이 실수로 저장됨

시스템은 Assignment Rule의 부재와 존재에 각각 하나의 명확한 의미를 부여해야 했습니다.

---

### 3. Sub Category fallback이 잘못된 설정을 숨길 수 있음

Assignment 결정은 이미 다음 우선순위를 따릅니다.

```txt
selected Sub Category
-> own Assignment Rule when present
-> otherwise Main Category Assignment Rule
```

다음과 같이 구현하고 싶을 수 있습니다.

```txt
Sub Category own rule exists but is invalid
-> silently fall back to Main Category rule
```

이 방식은 UI가 문제없이 동작하는 것처럼 보이게 하지만 잘못된 설정을 숨깁니다.

관리자는 Sub Category의 자체 배정 정책이 적용된다고 생각하지만, 실제 실행에서는
다른 정책을 사용할 수 있습니다.

Fallback은 다음을 의미해야 합니다.

```txt
no override exists
```

다음을 의미해서는 안 됩니다.

```txt
the override exists but does not work
```

---

### 4. 활성화 준비 상태와 실제 routing eligibility는 서로 다른 문제임

설정 단계에서는 활성 참조 항목이 포함되어 있는지 판단할 수 있습니다.

하지만 실제 티켓의 담당자는 나중에 그 시점의 업무 맥락까지 확인해 결정합니다.

설정 시점과 ticket 실행 시점 사이에 다음이 발생할 수 있습니다.

- employee가 inactive 상태가 됨
- employee가 다른 company로 이동함
- organization 관계가 변경됨
- Job Field가 더 이상 eligible employee를 결정하지 못함
- Tenant 또는 Company 상태가 변경됨
- category authorization 또는 scope context가 변경됨

따라서 다음 전제는 안전하지 않습니다.

```txt
Category was ready when activated
-> Category will always resolve a worker later
```

활성화 검증은 담당자를 결정하는 시점의 검증을 대신하지 못합니다.

---

### 5. Parent Category의 사용 가능 상태가 Sub Category에 영향을 줌

Sub Category는 Main Category에 속하며 그 workflow scope를 상속합니다.

다음 상태를 허용하면,

```txt
Main Category active = false
Sub Category active = true
-> Sub Category selectable
```

계층 구조가 깨집니다.

Main Category를 일시적으로 비활성화할 때 Sub Category에 저장된 활성 값을
자동으로 덮어쓰면 기존 설정이 손실됩니다.

따라서 model은 다음을 구분해야 했습니다.

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

이 선택지는 채택하지 않았습니다.

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

이 선택지는 채택하지 않았습니다.

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

이 선택지를 채택했습니다.

---

## 결정

Category를 생성한 뒤 별도로 활성화하는 절차를 도입했습니다.

핵심 model은 다음과 같습니다.

```txt
Category created
-> inactive
-> configuration may be completed
-> readiness checked
-> explicitly activated
-> available for new Ticket workflows
```

Category 생성이 Category를 자동으로 운영 가능 상태로 만들어서는 안 됩니다.

Main Category와 Sub Category는 모두 생성 시 다음 값으로 저장합니다.

```txt
active = false
```

client가 active 값을 전달해도 이 규칙을 적용합니다.

LOCAL과 REMOTE 모두 서버에서 이 규칙을 적용합니다.

---

## Category Lifecycle

의도한 lifecycle은 다음과 같습니다.

```txt
Create
-> Inactive
-> Configure
-> Ready
-> Activate
-> Active
```

Deactivation도 계속 지원합니다.

```txt
Active
-> Deactivate
-> Inactive
```

비활성화한 뒤에도 과거 티켓의 카테고리 참조는 유효하게 유지합니다.

Category가 마지막으로 활성화된 뒤 참조하는 조직 데이터가 바뀌었을 수 있으므로,
재활성화할 때 준비 상태를 다시 검증합니다.

---

## Assignment 준비 상태

Category는 실제 적용할 Assignment Rule에 활성 배정 참조 항목이 하나 이상 있을
때만 활성화할 수 있습니다.

조건을 만족하는 reference는 다음 중 하나입니다.

```txt
active Job Field
or
active Employee
```

개념적으로 다음과 같습니다.

```txt
effective Assignment Rule
-> active Job Field reference count >= 1
   OR
-> active Employee reference count >= 1
-> Category may be activated
```

이 검사는 설정이 준비되었는지 확인합니다.

배정 설정이 비어 있지 않고, 현재 활성 상태인 배정 참조 항목이 하나 이상 있는지
확인합니다.

실제 티켓을 처리할 때 자격을 갖춘 작업자가 항상 하나 이상 결정된다는 보장은
**아닙니다**.

---

## 비어 있는 Assignment Rule

비어 있는 Assignment Rule은 저장할 수 있는 유효한 배정 설정이 아닙니다.

다음 상태를 저장해서는 안 됩니다.

```txt
jobFieldIds = []
assigneeUsernames = []
```

Assignment reference가 없는 Assignment Rule에는 운영상 의미가 없습니다.

이 구분은 Sub Category에서 특히 중요합니다.

```txt
no own Assignment Rule
-> inherit Main Category Assignment Rule

own Assignment Rule exists
-> use that rule
```

따라서 비어 있는 Sub Category Assignment Rule을 상속을 나타내는 placeholder로
사용해서는 안 됩니다.

Sub Category가 Main Category를 상속해야 한다면 자체 Assignment Rule이 없어야 합니다.

---

## Sub Category Rule 결정

기존 assignment 우선순위를 유지합니다.

```txt
selected Sub Category
-> own Assignment Rule when present
-> otherwise Main Category Assignment Rule
```

Fallback은 Sub Category에 **자체 Assignment Rule이 없을 때만** 발생합니다.

자체 규칙이 있지만 잘못되었다면 상위 규칙으로 대신 처리하지 않습니다.

거부하는 동작은 다음과 같습니다.

```txt
Sub own rule exists
-> invalid or unusable
-> silently use Main rule
```

필요한 동작은 다음과 같습니다.

```txt
Sub own rule exists
-> validate that rule
-> failure remains visible

Sub own rule absent
-> use Main rule
```

이 방식은 설정 의도를 명시적으로 유지합니다.

잘못된 자체 규칙은 설정 오류입니다. 상위 규칙을 적용하라는 신호로 취급하지 않습니다.

---

## 활성화를 위한 Effective Assignment Rule

Main Category의 readiness는 자체 Assignment Rule을 사용합니다.

```txt
Main Category
-> Main Assignment Rule
```

Sub Category의 readiness는 ticket routing과 같은 우선순위를 사용합니다.

```txt
Sub Category
-> own Assignment Rule when present
-> otherwise Main Category Assignment Rule
```

활성화 검사와 실제 배정에 같은 상속 규칙을 적용해 서로 다른 규칙을 중복 구현하지
않습니다.

---

## 저장된 Active 상태와 Effective Active 상태

Sub Category의 사용 가능 여부는 상위·하위 두 카테고리의 활성 상태로 결정합니다.

```ts
effectiveActive = mainCategory.active && subCategory.active;
```

따라서 다음과 같습니다.

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
덮어쓸 필요는 없습니다.

예를 들어 다음 상태를 저장된 채로 유지할 수 있습니다.

```txt
Main.active = false
Sub.active = true
```

다음 조건으로 인해 Sub Category는 여전히 사용할 수 없습니다.

```txt
effectiveActive = false
```

Main Category가 나중에 다시 활성화되면, Sub Category의 자체 상태를 덮어쓰지 않고
저장된 값을 기준으로 다시 평가할 수 있습니다.

---

## Ticket 선택 정책

새 Ticket workflow에서는 effective active 상태인 Category만 사용할 수 있습니다.

Sub Category의 경우 requester가 선택할 수 있으려면 다음 조건을 만족해야 합니다.

```txt
main.active
&& sub.active
&& category visible in the current Tenant/scope context
```

기존 Ticket은 나중에 inactive가 된 Category를 계속 표시할 수 있습니다.

Category를 비활성화해도 과거 티켓의 분류는 유지해야 합니다.

---

## 활성화 준비 상태와 Routing 시점 검증

시스템은 활성화 검사와 실제 담당자 검증을 각각 수행합니다.

### 활성화 시점 준비 상태

활성화는 다음을 확인합니다.

```txt
Is this Category configuration sufficiently prepared to be exposed to new
Ticket workflows?
```

다음과 같은 설정 준비 상태를 검사합니다.

- 실제 적용할 Assignment Rule 존재 여부
- 활성 Job Field 또는 Employee 참조 항목이 하나 이상 존재하는지
- Category 계층 구조가 유효한지
- 상위 Category 상태가 활성화를 허용하는지
- 설정 변경 권한이 있는지

이를 통해 명백히 완료되지 않은 설정이 active 상태가 되는 것을 막습니다.

---

### Routing 시점 검증

Ticket routing은 다음을 확인합니다.

```txt
Can this specific Ticket resolve valid current ownership now?
```

Routing은 더 강한 검증을 수행해야 합니다.

다음을 계속 검증합니다.

- 현재 Category와 Tenant 상태
- 현재 Company에 따른 접근·배정 범위
- 현재 Assignment Rule
- 참조하는 Job Field
- 참조하는 Employee
- 직원 활성 여부
- 직원이 해당 회사에 배정될 자격이 있는지
- 범위별 배정 규칙
- 최종 결정된 작업자 집합

핵심 invariant는 다음과 같습니다.

```txt
resolved workers.length >= 1
```

자격을 갖춘 작업자를 결정할 수 없으면 배정은 실패합니다.

시스템은 다음 상태를 생성해서는 안 됩니다.

```txt
status = Assigned
assigneeUsernames = []
```

활성화 검사는 새 티켓에 노출할 설정의 준비 상태를 확인합니다.

실제로 배정할 수 있는지는 티켓 처리 시점의 담당자 검증 결과를 기준으로 판단합니다.

---

## 활성화 시 Worker를 결정하고 고정하지 않는 이유

Category를 활성화할 때 작업자 사용자명을 결정하고 그 결과를 이후에도 배정 가능하다는
근거로 사용하는 대안이 있습니다.

이 대안은 채택하지 않았습니다.

Assignment 설정은 Job Field를 reference할 수 있고, 활성화 후 organization data가
변경될 수 있습니다.

활성화 시점에 결정한 작업자 목록을 저장하거나 계속 신뢰하면 이후 조직 변경을
반영하지 못합니다.

의도한 관계는 다음과 같습니다.

```txt
Settings
-> stores routing references

Activation
-> validates configuration readiness

Ticket routing
-> resolves current eligible workers
```

이를 통해 organization membership을 동적으로 유지하면서 완료되지 않은 Settings가
불필요하게 노출되는 것을 막습니다.

---

## UI Capability

Settings UI는 다음과 같은 파생 capability를 노출할 수 있습니다.

```ts
canActivateCategory
```

이 값으로 다음을 제어할 수 있습니다.

- activation switch 사용 가능 여부
- 설명 message
- disabled 상태
- 관리자 안내

이 값은 UI·애플리케이션이 계산한 활성화 가능 여부입니다.

권한이나 활성화 조건을 최종 판단하는 근거는 아닙니다.

필요한 boundary는 다음과 같습니다.

```txt
UI canActivateCategory
-> improve interaction

Server activation validation
-> authoritative decision
```

화면에서 활성화 버튼을 비활성화하는 것만으로는 충분하지 않습니다. 요청을 조작해도
준비되지 않은 Category를 활성화할 수 없어야 합니다.

---

## LOCAL과 REMOTE 일관성

이 lifecycle은 두 runtime mode 모두에 적용합니다.

```txt
UI
-> feature API client
-> Route Handler / application boundary
-> LOCAL or REMOTE implementation
```

### LOCAL

LOCAL mutable demo state는 다음을 수행해야 합니다.

- Category를 inactive 상태로 생성
- Assignment Rule readiness 강제
- Main/Sub effective active 동작 적용
- 잘못된 활성화 방지

### REMOTE

REMOTE service와 repository는 다음을 수행해야 합니다.

- Category를 active 상태로 생성하려는 client 요청을 무시하거나 거부
- 새 Category를 inactive 상태로 저장
- 저장된 Category 및 Assignment data를 기준으로 활성화 검증
- server/database boundary에서 organization reference 검증
- routing 시점의 worker validation 유지

UI는 어떤 구현이 결과를 제공했는지 알 필요가 없어야 합니다.

---

## Approval 설정과의 관계

Category activation readiness는 주로 work Assignment readiness를 기준으로 제한합니다.

승인 설정은 Approval Step을 저장할 때와 실제 승인자를 결정할 때 각각 검증합니다.

Approval은 선택 사항이므로 Approval Step이 없는 Category도 유효합니다.

반면 정상적으로 처리된 모든 Ticket에는 결국 work ownership이 필요하므로, 실행 가능한
work-assignment 설정이 전혀 없는 Category는 운영상 완료되지 않은 상태입니다.

따라서 다음과 같습니다.

```txt
Approval Steps
-> optional routing phase

Assignment Rule
-> required path to work ownership
```

활성화 검사에서 "승인이 필요 없음"을 "작업자가 필요 없음"으로 해석해서는 안 됩니다.

---

## 이력 무결성과의 관계

이 결정은 Category가 향후 workflow에서 사용 가능해지는 시점을 변경합니다.

과거 ticket의 의미는 변경하지 않습니다.

```txt
Category configuration lifecycle
-> future Ticket availability

Existing Ticket / Action / History
-> preserved
```

비활성화되거나 이후 준비 조건을 충족하지 못하더라도 기존 티켓 이력을 다시 작성하지
않습니다.

기존 ticket의 상태 변경은 명시적인 Ticket workflow operation과 별도의 Settings 변경
영향 정책을 계속 따릅니다.

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

다음 shortcut은 의도적으로 사용하지 않습니다.

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
제거합니다.

---

## 구현 방향

의도한 구현 방향은 다음과 같습니다.

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

Sub Category의 경우 다음과 같습니다.

```txt
effectiveAssignmentRule =
  subOwnRule ?? mainRule
```

여기서 `subOwnRule`은 유효하게 저장된 자체 규칙이거나 존재하지 않는 값입니다.

잘못 저장한 자체 규칙을 규칙이 없는 상태로 변환해서는 안 됩니다.

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

Category는 생성했다고 자동으로 활성화하지 않습니다. 설정을 준비한 뒤 별도로
활성화합니다.

```txt
Create inactive
-> configure
-> validate readiness
-> explicitly activate
```

Assignment readiness에는 active Job Field 또는 active Employee reference가 하나 이상
포함된 effective Assignment Rule이 필요합니다.

Sub Category routing은 자체 rule이 있으면 이를 사용하고, 자체 rule이 없을 때만 Main
Category로 fallback합니다.

```txt
missing override
-> fallback

invalid override
-> error
```

Main Category 상태는 effective Sub Category availability도 제어합니다.

```txt
effectiveActive = main.active && sub.active
```

활성화 시점의 설정 준비 상태와 실제 티켓 배정 시점의 작업자 자격은 계속 구분합니다.

```txt
Activation
-> configuration quality gate

Routing
-> current operational validation
```

Category가 활성 상태라는 것은 새 티켓에서 선택할 수 있을 만큼 설정이 준비되었다는
뜻입니다.

실제 티켓의 담당자를 결정할 때마다 현재 자격을 갖춘 작업자를 조회하고 검증해야
한다는 요구사항은 유지합니다.

---

## 상태

승인됨
