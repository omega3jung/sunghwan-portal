# Category Strategy

## 목표

Category는 Service Desk ticket의 주요 behavior configuration이다.

Category는 다음에 영향을 준다.

- request classification
- default priority
- default risk level
- default SLA days / due date seed
- approval-step resolution
- assignment-rule resolution
- requester update routing policy

현재 category model은 tenant-scoped이며 Service Desk Settings와 정렬되어 있다.

---

## 핵심 개념

```txt
Tenant -> Main Category -> Sub Category -> Ticket behavior
```

`Company`는 organization reference data로 남는다. `Tenant`는 Service Desk
configuration boundary다. Category는 tenant에 속한다.

---

## 현재 Domain Shape

```ts
type CategoryScope = "PORTAL" | "INTERNAL";

type CategoryBase = {
  id: string;
  name: LocalizedText;
  description?: LocalizedText;
  requestTemplate?: LocalizedText;
  index: number;
  active: boolean;
};

type MainCategory = CategoryBase & {
  scope: CategoryScope;
  defaultPriority: Priority;
  defaultRiskLevel: RiskLevel;
  defaultSlaDays: number;
  subCategories: SubCategory[];
};

type SubCategory = CategoryBase & {
  defaultPriority?: Priority;
  defaultRiskLevel?: RiskLevel;
  defaultSlaDays?: number;
};
```

`Client -> Main Category -> Sub Category` 같은 오래된 용어는 현재 model이 아니다.
현재 boundary는 tenant-scoped다.

---

## Hierarchy

### Tenant

Category tree는 tenant의 Service Desk workflow boundary에 속한다. 여기서 "속한다"는
scoping을 의미하며, 한 actor가 모든 resource를 관리한다는 뜻이 아니다. 실제 read/manage
권한은 tenant kind, category scope, settings resource, trusted principal로 결정한다.

### Main Category

Main category는 필수 default를 제공한다.

- scope
- priority
- risk level
- SLA days
- active state
- display order

### Sub Category

Subcategory는 main category를 refine한다. Default priority, risk level, SLA days를
override할 수 있다. Subcategory가 값을 제공하지 않으면 main category 값이 fallback으로
남는다.

---

## Scope

Main category는 다음 scope union을 사용한다.

```ts
type CategoryScope = "PORTAL" | "INTERNAL";
```

| Scope | Meaning |
| --- | --- |
| `PORTAL` | portal requester workflow에 제공할 수 있는 category |
| `INTERNAL` | internal Service Desk operation용 category |

Subcategory는 visibility와 routing 목적에서 main category scope를 상속한다.

---

## Category Settings Authorization

Owner Admin은 trusted `permission >= ADMIN`과 `userScope = INTERNAL`로 식별한다.
Tenant Admin은 trusted `permission >= ADMIN`과 `userScope = CLIENT`로 식별하며,
effective user의 `companyId -> Tenant.companyId` 관계로 tenant를 해석한다.

| Target | Owner Admin | 동일 company Tenant Admin | 다른 Tenant Admin |
| --- | --- | --- | --- |
| Owner Tenant, `INTERNAL` 또는 `PORTAL` | manage | none | none |
| Customer Tenant, `INTERNAL` | none | manage | none |
| Customer Tenant, `PORTAL` | manage | read | none |

Customer `INTERNAL` category에는 Owner Admin support/read 예외가 없다. Owner Admin과
Tenant Admin은 상하 관계의 role이 아니며 central settings policy가 resource capability를
결정한다.

Main-category 생성도 같은 boundary를 따른다.

- Owner Admin은 Owner Tenant에서 두 scope를 모두 생성할 수 있다.
- Owner Admin은 customer Tenant에서 `PORTAL`만 생성할 수 있다.
- Tenant Admin은 자신의 customer Tenant에서 `INTERNAL`만 생성할 수 있다.

Read API는 이 policy에 따라 category tree를 filter한다. Client-selected tenant나 scope는
권한을 부여하지 않는다.

---

## Immutable Boundary

다음 값은 생성 후 다른 boundary로 이동할 수 없다.

- category tenant
- main-category scope
- tenant 또는 scope를 넘는 subcategory parent 변경

Subcategory는 parent main category의 tenant와 scope를 모두 상속하며 독립적인 scope
management capability를 갖지 않는다.

Update와 deactivation은 authorization 전에 기존 category를 load한다. Creation은 target
tenant와 requested scope를 server에서 검증한다. Subcategory 생성 또는 update는 저장된
parent main category를 load하고 그 관계에서 boundary를 파생한다. Payload의 `tenantId`,
`scope`, `parentId`는 authorization fact가 아니다.

다른 scope가 필요하면 기존 category를 deactivate하고 새 category를 생성한다. Category
제거는 hard delete가 아니라 `active = false`를 사용하여 ticket과 history reference를
보존한다.

---

## Default Resolution

Category default는 선택된 subcategory에서 parent main category로 resolve된다.

```txt
Sub Category default
-> Main Category default
```

예:

```ts
priority = sub.defaultPriority ?? main.defaultPriority;
riskLevel = sub.defaultRiskLevel ?? main.defaultRiskLevel;
slaDays = sub.defaultSlaDays ?? main.defaultSlaDays;
```

Ticket-level value는 form이나 action payload에 있을 수 있지만, server가 최종 workflow
effect를 validate한다.

---

## Active Policy

Category는 historical use에서 파괴적으로 제거하는 대신 deactivate한다.

```txt
active = false
```

동작:

- 새 main category와 subcategory는 항상 inactive 상태로 저장한다.
- Activation에는 active Job Field 또는 active Employee reference를 포함한 effective
  Assignment Rule이 필요하다.
- inactive category는 새 requester workflow에서 선택할 수 없어야 한다.
- inactive category를 참조하는 기존 ticket은 계속 읽을 수 있다.
- 필요한 configuration을 계속 resolve할 수 있으면 기존 `Approval` workflow는 다음
  approval 또는 work assignment로 진행할 수 있다.
- category settings가 바뀌어도 history는 다시 쓰지 않는다.

Main category와 subcategory의 active flag는 독립적으로 저장한다. Subcategory는 두
flag가 모두 active일 때만 effectively active다.

```ts
effectiveActive = mainCategory.active && subCategory.active;
```

Main category를 deactivate해도 subcategory의 stored flag를 덮어쓰면 안 된다.
Activation은 readiness gate일 뿐이며, runtime routing은 실제 worker와 모든
company/tenant eligibility constraint를 계속 다시 검증한다.

---

## Category and Ticket Creation

Ticket creation에서 category selection은 다음에 참여한다.

- priority/risk defaulting
- UI가 적용하는 경우 category SLA days 기반 due date seeding
- approval-step lookup
- work assignment lookup

Ticket service는 최종 workflow status의 authority로 남는다.

- approval이 필요하면 `Approval`
- work assignment가 바로 resolve되면 `Assigned`

---

## Category and Approval

Approval step은 parent/main category에 설정된다. 선택된 subcategory는 ticket을
classify하지만 approval pipeline은 해당 subcategory의 parent/main category에서
resolve된다.

```txt
Ticket submitted
-> selected category
-> resolve parent/main category
-> approval steps on main category resolved in order
-> current approval assignees stored on ticket
-> ticket enters Approval when needed
```

Approval configuration은 future resolution에 영향을 준다. 이미 진행 중인 ticket을
조용히 변경하지 않는다. 단, `Approval` ticket에 영향을 주는 tree 변경은 impact
확인 후 force apply로 initial routing부터 명시적으로 재시작하고 `ROUTING_RESET`
History를 하나의 transaction에서 append할 수 있다.

---

## Category and Assignment

Assignment rule은 subcategory override를 허용한다. 선택된 subcategory에 assignment
rule이 없으면 parent/main category rule로 fallback한다.

```txt
Ticket ready for work
-> selected category
-> selected subcategory assignment rule, when present
-> otherwise parent/main category assignment rule
-> current work assignees stored on ticket
-> ticket enters Assigned
```

현재 assignment rule model은 group-based이며 job-field ID와 employee username을
사용한다. 별도의 `ruleType` field를 사용하지 않는다.

Fallback은 rule의 존재 여부를 기준으로 한다. Subcategory own rule의 reference가 이후
inactive가 되면 activation과 routing은 해당 own rule을 기준으로 실패하며, parent
rule로 조용히 전환하지 않는다.

---

## Category and Requester Update

Requester update는 active work가 시작되기 전만 허용된다.

```txt
Approval
Assigned
```

Category change는 routing-sensitive다.

Requester가 category를 변경하면 ticket update service는 다음을 수행해야 한다.

- category selection 재검증
- 필요한 경우 priority/risk default 재파생
- 새 category default SLA days에서 minimum due date 재평가
- approval 또는 assignment routing 재평가
- `ROUTING_RESET` 기록

다음 due date는 current due date, submitted due date, 새 category minimum due date
중 가장 늦은 값이어야 한다. Category change는 due date를 더 이른 날짜로 당기면
안 된다.

Category가 바뀌지 않고 routing-neutral field만 바뀌면 routing은 preserve될 수 있고
`ROUTING_PRESERVED`가 기록된다.

---

## UI Responsibilities

UI는 다음을 해야 한다.

- tenant-scoped category tree 표시
- settings access가 `none`인 category tree 숨김
- `read` category tree를 명확한 read-only로 표시하고 관리 주체 안내
- 새 workflow에는 selectable active category만 표시
- 기존 ticket에는 inactive category display 보존
- priority, risk, due date에 유용한 default 적용
- requester update가 routing을 reset할 수 있음을 사용자에게 경고

UI는 다음을 하면 안 된다.

- final routing output을 만들어내기
- category change를 ordinary field edit처럼 숨기기
- category settings를 local-only client state로 취급하기
- edit control을 숨기는 것을 authorization boundary로 취급하기

---

## Settings Change Policy

Category settings는 future behavior를 정의한다.

| Change | Effect |
| --- | --- |
| main/subcategory name changed | future display는 새 label 사용; existing history는 기록된 상태 유지 |
| defaults changed | future ticket과 future routing evaluation은 updated default 사용 |
| category deactivated | impact 확인; new selection 중단; existing state/routing/history 보존 |
| approval settings changed | future resolution은 updated setting 사용; force apply는 영향받은 `Approval` ticket을 명시적으로 재시작 가능 |
| assignment settings changed | current worker 보존; future assignment resolution은 updated setting 사용 |

Existing ticket state와 history는 explicit ticket command를 통해서만 변경되어야 한다.

---

## Deferred Scope

현재 category strategy는 다음을 current behavior로 주장하지 않는다.

- settings version publishing
- scheduled category changes
- full historical category snapshot rendering
- per-tenant category governance workflow
- advanced assignment load balancing
- tenant-level SLA calendars

---

## 관련 문서

- [서비스 데스크 설정](../../settings.md)
- [승인 시스템](approval-system.md)
- [할당 정책](assignment-policy.md)
- [SLA 전략](sla-strategy.md)
- [티켓 생명주기](../ticket-lifecycle.md)
- [티켓 이력](../ticket-history.md)
- [티켓 라우팅 및 업데이트 정책 (2026-07)](../../../../06-decisions/2026-07-ticket-routing-and-update-policy.md)

---

## 요약

현재 category model은 tenant-scoped다.

```txt
Tenant -> Main Category -> Sub Category
```

Main category는 required default와 `PORTAL`/`INTERNAL` scope를 제공한다.
Subcategory는 해당 default를 refine하며 parent의 tenant와 scope를 상속한다. Central
settings policy는 tenant workflow boundary와 실제 management authority를 분리한다.
Approval은 parent/main category에서 resolve되고, assignment는 subcategory override와
parent/main fallback을 사용한다. Category change는 routing-sensitive ticket update이며,
settings change는 existing ticket을 조용히 다시 쓰지 않고 future workflow resolution에
영향을 준다.
