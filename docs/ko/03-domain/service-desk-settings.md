# 서비스 데스크 설정

## 목표

서비스 데스크 설정은 티켓이 생성되고, 승인되고, 배정되고, 화면에 표시되는
방식을 제어하는 구성이다.

이 문서의 목표는 현재 애플리케이션 모델, API 경계, LOCAL/REMOTE 런타임
분리를 기준으로 서비스 데스크 설정 설계를 설명하는 것이다.

서비스 데스크 설정은 일반적인 관리자 CRUD가 아니다. 서비스 데스크 도메인의
동작을 정의하는 구성이다.

---

## 핵심 개념

```txt id="service-desk-settings-core"
설정은 이후 티켓 동작을 구성한다.
이미 존재하는 티켓 이력은 원래 의미를 유지한다.
```

설정은 티켓 워크플로에서 사용되지만, 그 자체가 티켓 이벤트는 아니다. 설정
변경은 다음 티켓 생성, 승인 해석, 배정 해석, 요청자 수정에 영향을 줄 수
있다. 하지만 이미 기록된 티켓 이력의 의미를 조용히 다시 쓰면 안 된다.

---

## 도메인 위치

서비스 데스크 설정은 조직 기준 데이터와 티켓 실행 사이에 위치한다.

```txt id="service-desk-settings-position"
조직 기준 데이터
-> 서비스 데스크 설정
-> 티켓 워크플로
-> 티켓 이력
```

설정 영역이 소유하는 것은 다음과 같다.

- 서비스 데스크 테넌트
- 카테고리 구성
- 승인 단계 구성
- 배정 규칙 구성

설정 영역이 참조하지만 소유하지 않는 것은 다음과 같다.

- 회사 데이터
- 부서 데이터
- 직무 데이터
- 직원 데이터

---

## 설정 범위

현재 설정 화면은 다음 구조로 구성된다.

```txt id="service-desk-settings-scope"
Service Desk Settings
-> Tenant
-> Category
-> Approval Step
-> Assignment Rule
```

각 설정 영역은 자체 feature client, route/API handler 경로, 도메인 모델,
LOCAL/REMOTE 구현 경계를 가진다.

---

## 런타임과 API 경계

UI는 설정 데이터가 로컬 데모 상태에서 왔는지, REMOTE 영속성에서 왔는지에
의존하면 안 된다.

```txt id="service-desk-settings-api-flow"
UI
-> feature API client
-> Next.js Route Handler
-> Service Desk API handler
-> LOCAL state handler or REMOTE DTO service
```

Route handler는 HTTP 오케스트레이션 경계다. 요청을 파싱하고, 세션과 런타임
컨텍스트를 확인한 뒤, 실제 처리를 위임해야 한다. SQL, mock mutation 규칙,
row-to-DTO 매핑을 route handler가 직접 소유하면 안 된다.

LOCAL 설정 동작은 수정 가능한 데모 흐름에서 서버 측 mutable demo state를
사용한다. REMOTE 동작은 DTO service와 repository를 사용한다. 두 런타임은
호환 가능한 애플리케이션 응답 형태를 반환해야 한다.

---

## 테넌트

### 책임

서비스 데스크 테넌트는 티켓 카테고리, 승인 단계, 배정 규칙의 구성 경계를
정의한다.

Tenant는 Company와 관련되지만 같은 개념은 아니다. Company는 조직 기준
데이터이고, Tenant는 회사에서 만들어지거나 회사에 연결된 서비스 데스크 구성
표면이다.

### 현재 도메인 형태

```ts id="tenant-domain-shape"
type Tenant = {
  id: string;
  companyId: string;
  name: LocalizedText;
  color: string;
  active: boolean;
};
```

서버 DTO는 API 데이터 경계에서 `tenant_id`, `tenant_company_id`,
`tenant_name`, `tenant_color`, `tenant_active` 같은 numeric, `snake_case`
필드를 사용한다. UI와 도메인 코드는 매핑된 애플리케이션 형태를 소비해야 한다.

### 포털 소유자 테넌트

포털 소유자 테넌트는 보호되는 구성이다. 일반적인 테넌트 관리 작업으로
삭제되면 안 되며, 서비스 데스크 테넌트로 계속 사용 가능해야 한다.

UI는 테넌트 설정 페이지에서 사용하는 tenant/company projection을 통해
포털 소유자 동작을 파생한다. 이 보호 동작은 자유롭게 수정 가능한 일반 설정이
아니다.

### Focused Tenant와 Selected Tenants

설정 페이지는 두 개념을 구분한다.

- `focusedTenantId`: 현재 구성을 편집 중인 테넌트
- `selectedTenantIds`: 현재 서비스 데스크 테넌트로 활성화된 회사 집합

한 번에 하나의 focused tenant만 편집한다. 테넌트 설정 워크플로에서는 여러
테넌트가 선택되거나 활성화될 수 있다.

### 활성화 정책

테넌트 활성화는 회사가 서비스 데스크 구성 표면에 참여하는지 제어한다.

- 테넌트를 활성화하면 설정 구성 대상으로 사용할 수 있다.
- 테넌트를 비활성화하면 active 설정 워크플로에서 제외된다.
- 포털 소유자 보호 동작은 서버 경계에서 강제해야 한다.
- 테넌트가 나중에 비활성화되어도 기존 티켓은 읽을 수 있어야 한다.

---

## 카테고리

### 책임

카테고리는 티켓의 핵심 동작 구성이다. 요청 분류, 기본 우선순위, 기본 위험도,
기본 SLA 일수, 승인 구성, 배정 구성을 결정한다.

### 현재 도메인 형태

현재 도메인 모델은 main category와 subcategory를 구분한다.

```ts id="category-domain-shape"
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

API DTO는 같은 `"PORTAL" | "INTERNAL"` 값을 가진 `category_scope:
CategoryScope`를 사용한다. `"CLIENT"`를 사용하는 오래된 설명은 현재 모델과
맞지 않는다.

### 계층

```txt id="category-hierarchy"
Tenant
-> Main Category
-> Sub Category
```

Main category는 필수 기본값을 가진다. Subcategory는 일부 기본값을 덮어쓸 수
있다. Subcategory에 기본값이 없으면 main category 값이 fallback으로
사용된다.

### Scope

Category scope는 main category가 포털 요청자를 위한 것인지, 내부 서비스
데스크 사용을 위한 것인지 제어한다.

- `PORTAL`: 포털 요청자에게 제공할 수 있는 카테고리
- `INTERNAL`: 내부 운영자와 내부 워크플로를 위한 카테고리

Scope는 main category에 속한다. Subcategory는 표시와 라우팅 목적에서 main
category의 scope를 상속한다.

### Active 정책

비활성 카테고리는 새 티켓 선택지로 제공되지 않는다. 이미 비활성 카테고리를
참조하는 기존 티켓은 계속 읽을 수 있고 감사 가능해야 한다.

비활성화는 이후 선택과 이후 평가에 영향을 주어야 한다. 기존 티켓 이력을
지우거나 다시 해석하면 안 된다.

---

## 승인 단계

### 책임

승인 단계는 main category의 순서 있는 승인 동작을 정의한다.

승인 단계는 설정이지 티켓 이력이 아니다. 티켓이 승인 상태로 들어갈 때 현재
승인 설정이 티켓의 현재 승인 담당자로 해석된다. 이후 승인 활동은 티켓에
기록된다.

선택된 티켓 category가 subcategory인 경우에도 approval은 parent/main category에서
resolve된다. Subcategory는 요청을 classify하지만 독립적인 approval pipeline을 만들지
않는다.

### 현재 도메인 형태

```ts id="approval-step-domain-shape"
type ApprovalStep = {
  id: string;
  name: LocalizedText;
  description?: LocalizedText;
  index: number;
  categoryId: string;
  stepAssignee: ApprovalAssigneeType;
  skipAccessLevel?: AccessLevel;
};

type ApprovalAssigneeType =
  | { type: "MANAGER"; level: 1 | 2 }
  | { type: "DEPARTMENT"; departmentId: string }
  | { type: "JOB_FIELD"; jobFieldId: string }
  | { type: "EMPLOYEE"; employeeUsernames: string[] };
```

서버 DTO는 같은 개념을 `approval_step_assignee`와 `skip_access_level`로
표현한다.

### 순서 있는 파이프라인

승인 단계는 `index` 오름차순으로 평가된다.

```txt id="approval-step-flow"
Ticket submitted
-> category selected
-> parent/main category resolved
-> approval steps resolved from main category
-> current approval assignee stored on ticket
-> approval activity advances or declines the ticket
```

티켓 row는 현재 책임자를 ticket assignment field에 저장한다. 과거 승인 구성
전체를 위한 별도 영구 컬럼이 필요하지 않다.

### Skip 정책

`skipAccessLevel`은 요청자의 access level이 충분할 때 해당 단계를 건너뛰게
한다.

Skip 규칙은 구성 규칙이다. 승인 실행이 발생할 때 티켓 워크플로는 그 결과
활동과 이력을 기록해야 한다.

### 검증

승인 단계 mutation은 다음을 검증해야 한다.

- 테넌트와 카테고리 소유 관계
- 정렬된 index 값
- 지원되는 assignee type
- 참조된 부서, 직무, 직원, manager level
- skip access level

클라이언트는 사용자가 유효한 입력을 만들도록 도울 수 있지만, 서버가 최종
권한을 가진다.

---

## 배정 규칙

### 책임

배정 규칙은 승인이 필요 없을 때, 승인이 완료되었을 때, 또는 워크플로가 현재
작업 담당자를 해석해야 할 때 work assignee를 결정한다.

### 현재 도메인 형태

```ts id="assignment-rule-domain-shape"
type AssigneeGroup = {
  jobFieldIds: string[];
  assigneeUsernames: string[];
};

type AssignmentRule = {
  categoryId: string;
  assignee: AssigneeGroup;
};
```

현재 모델은 group 기반이다. 별도의 `ruleType` 필드를 사용하지 않는다. REMOTE
DTO는 `job_field_id`와 `employee_username` 배열을 사용하며, 다시
애플리케이션 모델로 매핑된다.

### 해석

배정 해석은 서버 경계에서 이루어져야 한다.

```txt id="assignment-resolution"
Selected subcategory
-> subcategory assignment rule, when present
-> parent/main category assignment rule fallback
-> job-field and employee references
-> resolved work assignee usernames
-> ticket current assignee field
```

클라이언트는 배정 추천을 표시할 수 있지만, 최종 라우팅 결과를 신뢰 가능한
값처럼 직접 제출하면 안 된다.

### 검증

배정 규칙 mutation은 다음을 검증해야 한다.

- 테넌트와 카테고리 소유 관계
- 참조된 직무
- 참조된 직원 username
- 비어 있거나 유효하지 않은 assignee group
- cross-tenant 또는 inactive reference 사용

배정 규칙 변경은 이후 라우팅 결정에 영향을 준다. 기존 티켓은 현재 assignee와
기록된 이력을 유지한다.

---

## 조직 기준 데이터

서비스 데스크 설정은 조직 데이터를 참조한다.

### Company

Company 데이터는 테넌트 옵션을 만들고 표시하는 데 사용된다.

### Department

Department 데이터는 승인 단계 assignee 구성에 사용된다.

### Job Field

Job field 데이터는 승인 단계와 배정 규칙 구성에 사용된다.

### Employee

Employee 데이터는 명시적 승인 담당자, 명시적 배정 대상, 배정 추천 표시 등에
사용된다.

설정 도메인은 조직 소유권을 중복 저장하면 안 된다. 참조를 저장하고 적절한
기준 데이터 경계를 통해 해석해야 한다.

---

## 관계 모델

```txt id="service-desk-settings-relationship"
Company
-> Tenant
-> Main Category
-> Sub Category

Main Category
-> Approval Step[]
-> Assignment Rule fallback

Sub Category
-> Assignment Rule override

Department / Job Field / Employee
-> referenced by Approval Step and Assignment Rule
```

Tenant와 category는 구성 계층을 만든다. Approval과 assignment 설정은
category에 매달린다. Category가 티켓 워크플로의 주된 동작 단위이기 때문이다.

Approval resolution은 main-category approval step을 사용한다. Assignment resolution은
subcategory override를 먼저 사용하고 필요할 때만 parent/main fallback을 사용한다.

---

## 구성 변경 정책

설정 변경은 이후 동작에 영향을 준다.

### Category 변경

새 티켓은 갱신된 category 구성을 사용한다. 기존 티켓은 저장된 category,
priority, risk, due date, assignee, activity, history를 유지한다.

### Approval Step 변경

새 승인 해석은 갱신된 승인 단계를 사용한다. 이미 승인 상태에 있는 티켓은
명시적인 티켓 action이 다시 계산하거나 갱신하지 않는 한 현재 승인 담당자를
유지해야 한다.

### Assignment Rule 변경

새 배정 해석은 갱신된 규칙을 사용한다. 기존 티켓은 티켓 command가 변경하기
전까지 현재 work assignee를 유지한다.

### Requester Update

Requester update는 작업 실행 전 category와 content를 변경할 수 있다.
Category가 변경되면 서버는 requester update policy에 따라 category defaults,
approval 필요 여부, assignment 동작, minimum due date, attachment payload를 다시
검증해야 한다.

---

## Query와 Client State

설정 데이터는 server state다.

React Query가 소유해야 하는 것:

- tenant list
- active tenant list
- category tree
- approval-step settings
- assignment rules
- organization reference list

로컬 component state나 작은 UI store가 소유할 수 있는 것:

- 선택된 tab
- focused tenant
- active language
- mutation 전 form draft values
- transient tree editing state

설정 server data를 Zustand에 또 다른 source of truth로 중복 저장하면 안 된다.

---

## UI 구조

설정 UI는 설정 범위를 따른다.

```txt id="service-desk-settings-ui"
/settings/service-desk-settings
-> tenant
-> category
-> approval-step
-> assignment-rule
```

공통 UI 책임은 다음과 같다.

- tenant selection
- localized label을 위한 language selection
- loading and empty states
- 일관된 mutation feedback
- settings pages 사이의 tenant context 유지

각 페이지는 사용자가 실제로 편집하는 형태로 구성을 보여주어야 한다. 예를 들어
category는 tree 형태이고, approval step은 category 아래 순서 있는 단계이며,
assignment rule은 category별로 표시된다.

---

## 검증과 보안

서버 경계가 최종 권한을 가진다.

검증 대상은 다음과 같다.

- 인증된 사용자와 admin access
- tenant ownership
- cross-tenant reference protection
- 유효한 category hierarchy
- 유효한 approval assignee reference
- 유효한 assignment reference
- active/inactive behavior
- protected portal-owner tenant behavior

클라이언트는 즉각적인 feedback으로 사용성을 높일 수 있지만, 신뢰 가능한 설정
검증자가 될 수는 없다.

---

## 현재 범위

현재 설계가 지원하는 것은 다음과 같다.

- tenant activation and deactivation
- portal-owner tenant protection
- localized tenant and category labels
- category tree editing
- main/subcategory defaults
- category `PORTAL` and `INTERNAL` scope
- ordered approval steps
- manager, department, job-field, employee approval assignees
- job field와 employee username을 포함하는 assignment group
- LOCAL and REMOTE API boundary alignment
- mutable settings workflow를 위한 server-side local demo state
- React Query가 설정 server data를 소유하는 구조

---

## 지연된 Production 범위

다음 항목은 명시적으로 구현되기 전까지 지연 범위다.

- versioned settings publishing
- scheduled settings changes
- settings approval workflow
- full settings audit event stream
- bulk import/export
- advanced assignment load balancing
- tenant-level attachment limits
- per-tenant SLA calendar rules
- 티켓이 사용한 historical configuration의 hard deletion

---

## 책임 매트릭스

| 영역 | 책임 |
| --- | --- |
| Domain model | 애플리케이션 설정 형태 정의 |
| Feature API client | 설정 API 호출과 typed operation 제공 |
| Route handler | HTTP 파싱과 runtime별 위임 |
| LOCAL settings handler | 안전한 mutable demo behavior 제공 |
| REMOTE DTO service | persisted row를 stable DTO로 매핑 |
| React Query | 설정 server state 소유 |
| Settings UI | workflow-shaped form으로 구성 편집 |
| Ticket workflow | 현재 설정을 티켓 동작으로 해석 |
| Ticket history | 이미 실행된 티켓 action의 의미 보존 |

---

## 관련 문서

- [`ticket/ticket-system-overview.md`](ticket/ticket-system-overview.md)
- [`ticket/strategy/category-strategy.md`](ticket/strategy/category-strategy.md)
- [`ticket/strategy/approval-system.md`](ticket/strategy/approval-system.md)
- [`ticket/strategy/assignment-policy.md`](ticket/strategy/assignment-policy.md)
- [`../02-architecture/database-strategy.md`](../02-architecture/database-strategy.md)
- [`../02-architecture/routing-strategy.md`](../02-architecture/routing-strategy.md)
- [`../05-data-fetching/react-query-strategy.md`](../05-data-fetching/react-query-strategy.md)
- [`../08-dev-strategy/decision-log/2026-06-service-desk-settings-dto-api-boundary.md`](../08-dev-strategy/decision-log/2026-06-service-desk-settings-dto-api-boundary.md)
- [`../08-dev-strategy/decision-log/2026-07-ticket-routing-and-update-policy.md`](../08-dev-strategy/decision-log/2026-07-ticket-routing-and-update-policy.md)

---

## 요약

서비스 데스크 설정은 tenant, category, approval-step, assignment-rule
구성을 통해 이후 티켓 동작을 정의한다.

현재 모델은 tenant-scoped category tree, `PORTAL`/`INTERNAL` category
scope, typed assignee를 가진 ordered approval step, group-based assignment
rule을 사용한다.

설정 데이터는 React Query가 소유하는 server state이며 LOCAL/REMOTE API
경계를 통해 제공된다. 설정 변경은 이후 워크플로를 안내해야 하고, 기존 티켓
activity와 history는 이미 일어난 일의 의미를 보존해야 한다.
