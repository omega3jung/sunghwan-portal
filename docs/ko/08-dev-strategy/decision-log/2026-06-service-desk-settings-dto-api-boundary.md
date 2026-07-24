# Service Desk Settings DTO/API Boundary (2026-06)

## 배경

2026년 6월 Service Desk settings 구현 과정에서 프로젝트는 여러 settings domain을 local mock-only behavior에서 더 명시적인 LOCAL/REMOTE API 구조로 이동시켰다.

영향을 받은 Service Desk settings domain은 다음과 같다.

- Tenant
- Category
- Approval Step
- Assignment Rule

프로젝트는 다음과 같은 supporting reference data도 연결했다.

- Company
- Department
- Job Field

이 단계에서 Service Desk 모듈은 더 이상 local UI demo에만 머물지 않았다. 안전한 local demo 경험을 유지하면서 Supabase PostgreSQL-backed data access와 정렬되고 있었다.

중요한 architectural direction은 이미 확립되어 있었다.

```txt id="wjvgzj"
UI
-> feature API client
-> Next.js Route Handler
-> LOCAL handler or REMOTE/Supabase DTO service
```

6월 작업은 이 방향을 Service Desk settings에 구체적으로 적용했다.

---

## 문제

### 1. Database Row, Mock Data, DTO, UI Model이 서로 달라질 수 있음

프로젝트에는 같은 conceptual settings data를 위한 여러 data shape가 있었다.

```txt id="9jzzs8"
Database Row
Mock Data
DTO
UI Model
Form Value
```

이 shape들이 서로 독립적으로 발전하도록 두면 시스템 유지보수가 어려워진다.

가능한 문제는 다음과 같다.

- database `snake_case` field가 UI model로 새어 나감
- mock data와 remote data가 서로 다른 shape를 반환함
- settings form이 database implementation detail에 의존함
- route handler에 mapping logic이 지나치게 많아짐
- UI component에 runtime-specific branching이 필요해짐
- local demo behavior가 remote behavior와 달라짐

프로젝트에는 명확한 data boundary가 필요했다.

---

### 2. Route Handler가 너무 커질 수 있음

Next.js Route Handler는 HTTP boundary로 유용하지만 full domain service가 되어서는 안 된다.

route handler가 다음을 직접 처리하면:

- request parsing
- session validation
- LOCAL/REMOTE branching
- SQL execution
- row mapping
- business rules
- mock mutation logic

읽기 어렵고 나중에 재사용하기도 어려워진다.

프로젝트에는 route handler를 thin하고 orchestration-focused 상태로 유지할 필요가 있었다.

---

### 3. Settings는 단순 CRUD Record가 아님

Service Desk settings는 behavior-defining configuration이다.

예를 들면 다음과 같다.

- category는 ticket behavior를 정의한다.
- approval step은 validation flow를 정의한다.
- assignment rule은 routing behavior를 정의한다.
- tenant는 Service Desk configuration boundary를 정의한다.

각 setting을 generic CRUD resource로 취급하면 API surface는 단순해 보이지만, UI가 실제로 settings를 편집하는 방식과 맞지 않는다.

일부 settings는 isolated record가 아니라 configuration tree 또는 grouped policy로 편집하는 것이 더 적합하다.

---

### 4. Speculative API Path가 유지보수 비용을 증가시킴

구현 중 일부 API path는 나중에 유용할 수도 있다는 이유만으로 존재했다.

그러나 현재 UI workflow에서 사용하지 않는 path는 여러 문제를 만든다.

- test해야 할 surface area가 늘어난다.
- 실제로 지원하지 않는 capability를 암시한다.
- route-handler structure를 review하기 어렵게 만든다.
- inconsistent LOCAL/REMOTE behavior 가능성을 높인다.
- 시스템이 실제보다 넓어 보이게 만들어 portfolio 설명력을 약화한다.

프로젝트는 실제 workflow와 정렬된 API path만 유지해야 했다.

---

### 5. LOCAL Demo Mutation에는 Server-Side Consistency가 필요했음

local demo는 단순한 static mock data가 아니다.

demo는 portfolio review 중 사용자가 Service Desk settings를 안전하게 수정할 수 있게 한다.

local mutation이 API call 전체에 반영되어야 하므로 React Query cache만으로는 이 behavior를 충분히 지원할 수 없다.

따라서 local demo에는 lightweight backend처럼 동작하는 server-side local state module 또는 mock handler가 필요했다.

이는 LOCAL과 REMOTE settings API가 compatible DTO를 반환해야 한다는 뜻이기도 하다.

---

## 결정

Service Desk settings에 DTO-oriented API boundary를 사용한다.

핵심 결정은 다음과 같다.

```txt id="96e6bi"
Settings API = workflow-oriented route handlers + domain handlers + LOCAL/REMOTE DTO contract
```

의도한 흐름은 다음과 같다.

```txt id="o5sv57"
UI
-> feature API client
-> Next.js Route Handler
-> Service Desk settings API handler
-> domain handler
-> LOCAL handler or REMOTE service/repository
-> DTO response
```

UI는 stable DTO를 소비해야 하며, data가 mock state에서 왔는지 Supabase PostgreSQL에서 왔는지 알 필요가 없어야 한다.

---

## Scope Rules

### 1. Route Handler를 Thin하게 유지함

route handler는 다음에 집중해야 한다.

- HTTP method handling
- request parsing
- 공통 session/principal 및 settings authorization boundary 호출
- runtime context resolution
- 올바른 domain handler로 위임
- `NextResponse` 반환

route handler가 다음을 직접 소유해서는 안 된다.

- SQL queries
- row-to-DTO mapping
- settings mutation rules
- local demo state mutation details
- domain-specific branching

이렇게 하면 route handler가 읽기 쉬워지고 향후 backend extraction도 쉬워진다.

---

### 2. Domain Handler를 Settings Area별로 집중시킴

Service Desk settings handler는 domain responsibility별로 분리해야 한다.

권장 domain은 다음과 같다.

```txt id="z3j7x6"
tenant
category
approvalStep
assignmentRule
```

각 domain handler는 자기 settings area의 API behavior를 소유해야 한다.

이렇게 하면 하나의 거대한 Service Desk settings handler가 서로 관련 없는 logic을 모두 처리하는 central switchboard가 되는 것을 피할 수 있다.

---

### 3. Row / DTO / Mapper Boundary를 유지함

database row와 API DTO는 서로 다른 책임을 가진다.

```txt id="lznuec"
Row -> Mapper -> DTO
```

#### Row

row type은 database result shape를 표현한다.

특징:

- SQL에 가깝다.
- database-oriented이다.
- 보통 `snake_case`를 사용한다.
- nullable database field를 포함할 수 있다.
- UI component가 직접 소비해서는 안 된다.

#### DTO

DTO는 application-facing API response contract를 표현한다.

특징:

- frontend use에 안정적이다.
- 보통 `camelCase`를 사용한다.
- database naming을 숨긴다.
- nullable value를 normalize한다.
- LOCAL과 REMOTE response를 맞출 수 있다.

#### Mapper

mapper는 row를 DTO로 변환한다.

책임:

- naming conversion
- JSON shaping
- null normalization
- response-safe field selection
- 필요할 때 local/remote shape alignment

---

### 4. LOCAL과 REMOTE Contract를 정렬함

LOCAL과 REMOTE는 같은 application-facing DTO shape를 반환해야 한다.

UI에 다음과 같은 logic이 필요해서는 안 된다.

```ts id="r4a7mk"
if (runtime === "LOCAL") {
  // use mock shape
} else {
  // use remote shape
}
```

대신 runtime-specific behavior는 API boundary 뒤에 숨겨야 한다.

```txt id="y1vz78"
LOCAL mock/state -> DTO
REMOTE row       -> DTO
```

이렇게 하면 backend implementation이 변경되어도 frontend를 안정적으로 유지할 수 있다.

---

### 5. Generic CRUD보다 Workflow-Oriented Settings API를 선호함

Service Desk settings는 isolated record만이 아니라 configuration workflow이다.

category, approval step, assignment rule configuration에서 UI는 grouped settings를 편집하는 경우가 많다.

따라서 가능한 모든 CRUD route를 노출하는 것보다 list와 save-tree style operation 같은 API가 더 적합할 수 있다.

권장 방향:

```txt id="cz8yv6"
GET  settings data needed by the UI
POST/PUT save the configuration shape used by the UI
```

이렇게 하면 API가 실제 workflow와 정렬된다.

---

### 6. 사용하지 않거나 Speculative한 API Path를 제거함

나중에 유용할 수 있다는 이유만으로 사용하지 않는 API path를 유지하지 않는다.

API path는 다음 조건을 만족할 때 유지해야 한다.

- 현재 UI가 사용한다.
- documented workflow를 지원한다.
- 명확한 LOCAL 및 REMOTE behavior가 있다.
- test하고 설명할 수 있다.

API path는 다음 조건에 해당하면 제거하거나 deferred해야 한다.

- 현재 UI에서 사용하지 않는다.
- speculative CRUD behavior를 나타낸다.
- demo 개선 없이 route surface를 늘린다.
- inconsistent local/remote behavior를 만든다.
- implementation review를 어렵게 만든다.

이렇게 하면 프로젝트를 정직하고 유지보수 가능한 상태로 유지할 수 있다.

---

### 7. Server Data를 Client State로 중복 저장하지 않음

Service Desk settings data는 server state이다.

이는 Zustand에 중복 저장하지 않고 React Query로 관리해야 한다.

Zustand는 UI/runtime state에 사용할 수 있지만 tenant list, category tree, approval step, assignment rule 같은 settings data는 query-driven 상태로 남아야 한다.

규칙은 다음과 같다.

```txt id="m4d2am"
Server data -> React Query
UI state    -> local state or Zustand only when needed
```

---

### 8. Local Demo State를 Server-Side Mutable State로 취급함

local demo는 mock-backed state를 사용할 수 있지만 server data처럼 동작해야 한다.

local settings mutation은 React Query cache만이 아니라 server-side local state module을 업데이트해야 한다.

이를 통해 다음을 지원할 수 있다.

- repeatable demo behavior
- safe reviewer interaction
- resettable local state
- realistic API request flow
- LOCAL/REMOTE implementation parity

---

## 권한 보충 (2026-07)

DTO/API 경계는 category-scope 설정 권한 결정도 전달한다. 권한은 LOCAL/REMOTE
분기 위에서 공유하는 application behavior다. UI 조건이 아니며 두 runtime
implementation이 각자 다르게 처리하도록 위임하지 않는다.

```txt id="settings-authorization-api-flow"
Route Handler
-> 인증된 JWT access level >= ADMIN (9) 검사
-> effective canonical AppUser 결정
-> 대상 Category -> Tenant -> Company context 결정
-> manage / read / none capability 적용
-> LOCAL handler 또는 REMOTE service로 위임
-> filter된 DTO response 반환
```

Canonical principal은 서버가 신뢰하는 `permission`, `userScope`, `companyId`를
제공한다. Request body/query의 admin type, tenant/company claim, focused tenant,
`role`, `dataScope`, client state는 권한을 성립시키지 않는다. Impersonation 중에는
effective user의 resource capability를 적용하고 original/effective identity는 감사에
사용할 수 있도록 유지한다.

Read API는 `none` resource를 filter해야 한다. Mutation API는 `manage`를 적용하기
전에 저장된 category/tenant 관계를 로드하고 read-only 또는 경계 밖 principal에게
`403`을 반환한다. Page는 UX를 위해 Settings Home으로 redirect할 수 있지만 API는
권한 없는 mutation을 redirect하지 않는다.

Approval Step과 Assignment Rule DTO는 tenant 권한을 중복 저장하지 않는다.
Source relationship은 다음과 같다.

```txt id="settings-dto-authorization-context"
Approval Step / Assignment Rule
-> Category
-> Tenant
-> Company
```

Category update DTO validation은 tenant, main-category scope, tenant/scope 경계를
넘는 subcategory parent 이동을 immutable로 다룬다. 서버는 update/deactivation에는
저장된 state에서, subcategory에는 저장된 parent에서 context를 파생하며 payload
context만 신뢰하지 않는다.

Actor candidate lookup은 category 중심이며 purpose를 구분한다. Approval candidate는
category tenant company에서, assignment candidate는 category에 따라 허용된 company에서
결정한다. Lookup은 company filter뿐 아니라 caller의 resource capability도 검사한다.
Read-only access는 현재 참조된 actor의 표시 데이터를 반환할 수 있지만 employee
directory search 권한을 부여하지 않는다.

---

## 정렬한 내용

### 1. Settings API Responsibility

Service Desk settings API를 layered flow 중심으로 정렬했다.

```txt id="ywhp0s"
Route Handler
-> Service Desk settings API handler
-> domain-specific handler
-> LOCAL or REMOTE implementation
```

이를 통해 readability가 개선되고, 관련 없는 settings logic이 하나의 파일에 섞일 위험이 줄었다.

---

### 2. Tenant API와 DTO 방향

Tenant는 Service Desk configuration boundary가 되었다.

tenant API는 raw company row 또는 tenant row가 아니라 application-facing DTO를 반환해야 했다.

현재의 개념적 DTO 방향:

```ts id="mbjjfw"
type TenantDto = {
  id: string;
  companyId: string;
  name: LocalizedText;
  color: string | null;
  active: boolean;
};
```

이렇게 하면 tenant behavior를 company reference data와 분리해서 유지할 수 있다.

---

### 3. Category Tree API 방향

Category settings는 tree-shaped configuration이다.

category는 단순한 flat record가 아니다. tenant에 속하고 parent/child relationship을 가질 수 있다.

현재의 개념적 DTO 방향:

```ts id="f6ykgn"
type CategoryScope = "PORTAL" | "INTERNAL";

type CategoryTreeDto = {
  tenantId: string;
  categories: MainCategoryDto[];
};

type MainCategoryDto = {
  id: string;
  scope: CategoryScope;
  name: LocalizedText;
  description: LocalizedText | null;
  requestTemplate: LocalizedText | null;
  defaultPriority: Priority;
  defaultRiskLevel: RiskLevel;
  defaultSlaDays: number;
  index: number;
  active: boolean;
  subCategories: SubCategoryDto[];
};
```

`PORTAL`/`INTERNAL`은 workflow scope다. Main/subcategory는 hierarchy이므로
`CategoryScope`의 다른 값으로 표현하면 안 된다. Subcategory는 parent main
category로부터 tenant와 scope를 상속한다.

API는 UI가 여러 관련 없는 CRUD call을 조정하도록 강제하기보다, UI가 category tree를 편집하는 방식을 지원해야 한다.

---

### 4. Approval Step API 방향

Approval step은 category 아래의 configuration detail이다.

approval step은 settings UI와 approval strategy에 맞는 DTO로 반환되어야 한다.

개념적 DTO:

```ts id="r80lkg"
type ApprovalStepDto = {
  id: string;
  categoryId: string;
  index: number;
  assignee: ApprovalAssignee;
};
```

historical ticket approval behavior가 ticket/action/history record를 통해 보존되는 한, approval step은 category configuration update의 일부로 교체될 수 있다.

---

### 5. Assignment Rule API 방향

Assignment rule은 category의 현재 routing behavior를 정의한다.

개념적 DTO:

```ts id="zl52df"
type AssignmentRuleDto = {
  id: string;
  categoryId: string;
  assignee: {
    jobFieldIds: string[];
    assigneeUsernames: string[];
  };
};
```

현재 assignment model은 group 기반이며 별도의 `ruleType`이 없다.

assignment rule 변경은 future 또는 newly evaluated behavior에 영향을 줘야 하며, historical ticket assignment record를 조용히 다시 써서는 안 된다.

---

### 6. Reference Data DTO 방향

Company, department, job field data는 Service Desk settings를 지원한다.

이 data도 DTO boundary를 따라야 한다.

reference data 사용 예:

```txt id="kwac2p"
Company     -> tenant selection and tenant creation
Department  -> approval/assignment configuration
Job Field   -> approval/assignment configuration
```

settings UI는 raw database row가 아니라 response-safe DTO를 소비해야 한다.

---

### 7. API Surface Pruning

settings API surface를 실제 UI workflow와 정렬했다.

현재 behavior를 지원하지 않는 unused 또는 speculative CRUD path는 제거해야 한다.

이렇게 하면 프로젝트가 가능한 future expansion point로만 존재하는 untested route를 들고 가지 않게 된다.

future expansion은 사용하지 않는 route file로 암시하지 말고 명시적으로 문서화해야 한다.

---

## 결과 영향

### 긍정적 영향

- 더 명확한 server/client boundary
- 더 안정적인 settings API contract
- 더 나은 LOCAL/REMOTE consistency
- UI로 database schema가 새어 나갈 위험 감소
- 더 작고 정직한 API surface
- Service Desk settings logic 유지보수 용이성 향상
- 향후 backend extraction이 쉬워짐
- production-aligned architecture에 대한 portfolio 설명력 향상
- route handler가 과도하게 커질 위험 감소
- mock-backed local demo mutation을 더 현실적으로 처리

---

### 부정적 영향 / 트레이드오프

- row, DTO, mapper, repository, service, handler를 위한 파일이 더 필요함
- mapping logic으로 인한 구현 overhead가 추가됨
- 작은 demo에서 단순 CRUD operation보다 더 많은 구조가 필요할 수 있음
- future route를 추가할 때 API pruning 규율이 필요함
- LOCAL과 REMOTE parity에는 추가적인 test 주의가 필요함
- settings save flow가 pure CRUD shape가 아니라 workflow shape를 따르므로 덜 generic해 보일 수 있음

---

## Implementation Notes

### Recommended Server Data Structure

remote settings data access를 위한 권장 구조:

```txt id="e7w34k"
src/server/data/serviceDesk/
  tenants/
    tenantRow.ts
    tenantDto.ts
    tenantMapper.ts
    tenantRepository.ts
    tenantService.ts

  categories/
    categoryRow.ts
    categoryDto.ts
    categoryMapper.ts
    categoryRepository.ts
    categoryService.ts

  approvalSteps/
    approvalStepRow.ts
    approvalStepDto.ts
    approvalStepMapper.ts
    approvalStepRepository.ts
    approvalStepService.ts

  assignmentRules/
    assignmentRuleRow.ts
    assignmentRuleDto.ts
    assignmentRuleMapper.ts
    assignmentRuleRepository.ts
    assignmentRuleService.ts
```

정확한 file structure는 진화할 수 있지만 responsibility boundary는 안정적으로 유지되어야 한다.

---

### Recommended API Handler Structure

권장 route/domain handler 방향:

```txt id="ff5hfk"
src/app/api/service-desk/...
  route.ts
    -> parse HTTP request
    -> resolve session/runtime
    -> delegate to server handler

src/server/portalApi/serviceDesk/
  serviceDeskPortalApiHandler.ts
  tenantApiHandler.ts
  categoryApiHandler.ts
  approvalStepApiHandler.ts
  assignmentRuleApiHandler.ts
```

route-level code는 thin하게 유지해야 한다.

domain handler code는 Service Desk settings behavior에 집중해야 한다.

---

### Recommended Local Demo Structure

local demo settings behavior는 중앙화해야 한다.

예시 방향:

```txt id="tf8zk6"
src/server/serviceDesk/settings/
  localState.ts
  tenantLocalHandler.ts
  categoryLocalHandler.ts
  approvalStepLocalHandler.ts
  assignmentRuleLocalHandler.ts
```

정확한 path는 달라질 수 있지만 local mutation logic이 UI component 안에 있어서는 안 된다.

---

### Recommended API Surface Policy

실제 workflow에 mapping되는 path만 유지한다.

예시 방향:

```txt id="qzhwdq"
Use:
- list tenants
- save tenant
- list category configuration
- save category tree/configuration
- list approval configuration
- save approval configuration
- list assignment configuration
- save assignment configuration

Avoid:
- unused speculative nested CRUD paths
- routes that are not reachable from the UI
- routes without LOCAL/REMOTE parity
```

---

## 업데이트할 문서

이 결정은 다음 documentation area에 영향을 준다.

```txt id="r8k14k"
docs/en/02-architecture/database-strategy.md
docs/en/02-architecture/routing-strategy.md
docs/en/05-data-fetching/react-query-strategy.md
docs/en/08-dev-strategy/service-desk-implementation-strategy.md
docs/en/08-dev-strategy/decision-log/2026-05-database-role-and-access-strategy.md
docs/en/README.md
```

5월 database role/access decision은 다시 작성할 필요가 없다.

대신 이 6월 decision log를 이전 방향을 Service Desk Settings에 구체적으로 적용한 기록으로 다룬다.

---

## 후속 운영 정책

### 1. Route Handler를 Orchestration Boundary로 유지함

향후 Service Desk settings route는 route file에 domain logic을 직접 쌓아두지 않아야 한다.

route handler는 server-side handler 또는 service로 위임해야 한다.

---

### 2. Database Row가 바뀌어도 DTO는 안정적으로 유지함

database schema는 진화할 수 있다.

가능한 경우 DTO는 안정적으로 유지해서 UI component와 feature API client에 불필요한 변경이 생기지 않도록 해야 한다.

---

### 3. LOCAL과 REMOTE Behavior를 Contract-Compatible하게 유지함

새 settings API는 LOCAL과 REMOTE가 같은 application-facing shape를 어떻게 반환하는지 정의해야 한다.

UI가 local mock shape와 remote database shape 차이를 기준으로 branch하도록 허용하지 않는다.

같은 규칙을 capability와 filtering 결과에도 적용한다. 같은 effective principal에 대해
LOCAL mutable state와 REMOTE repository가 서로 다른 tenant/category visibility를
노출하거나 서로 다른 mutation을 허용하면 안 된다.

---

### 4. Workflow가 요구할 때만 API Path를 추가함

나중에 유용할 수 있다는 이유만으로 nested CRUD path를 추가하지 않는다.

새 path는 다음을 가져야 한다.

- current workflow
- clear caller
- clear DTO contract
- clear LOCAL implementation
- clear REMOTE implementation 또는 documented deferred behavior

---

### 5. Settings가 변경될 때 Historical Meaning을 보존함

settings change가 past ticket meaning을 조용히 다시 써서는 안 된다.

category, approval, assignment, tenant settings가 변경되더라도 existing ticket action과 history는 이해 가능해야 한다.

---

### 6. Settings를 Generic Admin CRUD가 아니라 Configuration으로 유지함

Service Desk Settings는 계속 behavior-defining configuration으로 취급해야 한다.

이는 API design이 generic CRUD completeness보다 workflow clarity를 우선해야 한다는 뜻이다.

---

## 요약

Service Desk settings 구현은 더 명시적인 DTO/API boundary를 도입했다.

핵심 결정은 다음과 같다.

```txt id="z6tjy5"
Settings API = workflow-oriented route handlers + domain handlers + LOCAL/REMOTE DTO contract
```

UI는 stable DTO를 소비한다.

route handler는 thin하게 유지한다.

domain handler는 settings behavior를 조직화한다.

REMOTE data access는 row/mapper/DTO boundary를 사용한다.

LOCAL demo behavior는 같은 API contract를 유지하면서 server-side mutable mock state를 사용한다.

사용하지 않는 API path는 speculative CRUD로 유지하지 말고 제거해야 한다.

이렇게 하면 Service Desk Settings module은 production-aligned 상태를 유지하고, 설명하기 쉬우며, 나중에 더 안전하게 확장할 수 있다.
