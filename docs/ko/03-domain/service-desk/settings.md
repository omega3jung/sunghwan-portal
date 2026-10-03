# 서비스 데스크 설정

## 목표

서비스 데스크 설정은 티켓이 생성되고, 승인되고, 배정되고, 화면에 표시되는
방식을 제어하는 구성입니다.

이 문서는 현재 애플리케이션 모델, API의 담당 역할, LOCAL/REMOTE 실행 환경의
차이를 기준으로 서비스 데스크 설정 설계를 설명합니다.

서비스 데스크 설정은 일반적인 관리자 CRUD가 아니라 서비스 데스크 도메인의
동작을 정의하는 구성입니다.

---

## 핵심 개념

```txt
설정은 이후 티켓 동작을 구성한다.
이미 존재하는 티켓 이력은 원래 의미를 유지한다.
```

설정은 티켓 워크플로에서 사용되지만, 그 자체가 티켓 이벤트는 아닙니다. 설정
변경은 다음 티켓 생성, 승인 해석, 배정 해석, 요청자 수정에 영향을 줄 수
있습니다. 하지만 이미 기록된 티켓 이력의 의미를 조용히 다시 쓰면 안 됩니다.

---

## 도메인 위치

서비스 데스크 설정은 조직 기준 데이터와 티켓 실행 사이에 위치합니다.

```txt
조직 기준 데이터
-> 서비스 데스크 설정
-> 티켓 워크플로
-> 티켓 이력
```

설정 영역이 소유하는 것은 다음과 같습니다.

- 서비스 데스크 테넌트
- 카테고리 구성
- 승인 단계 구성
- 배정 규칙 구성

설정 영역이 참조하지만 소유하지 않는 것은 다음과 같습니다.

- 회사 데이터
- 부서 데이터
- 직무 데이터
- 직원 데이터

---

## 설정 범위

현재 설정 화면은 다음 구조로 구성됩니다.

```txt
Service Desk Settings
-> Tenant
-> Category
-> Approval Step
-> Assignment Rule
```

각 설정 영역은 별도의 기능 API 클라이언트, Route/API Handler 경로, 도메인 모델,
LOCAL/REMOTE 구현을 가집니다.

---

## 런타임과 API 경계

UI는 설정 데이터가 LOCAL 데모 상태에서 왔는지, REMOTE 데이터베이스에서 왔는지에
따라 다르게 처리하면 안 됩니다.

```txt
UI
-> feature API client
-> Next.js Route Handler
-> Service Desk API handler
-> LOCAL state handler or REMOTE DTO service
```

Route Handler는 HTTP 요청을 파싱하고 세션과 실행 환경을 확인한 뒤 실제 처리를
서비스 함수에 맡깁니다. SQL 실행, mock 상태 변경 규칙, DB 행을 DTO(데이터 전달 객체)로
변환하는 작업을 직접 담당해서는 안 됩니다.

LOCAL에서는 설정을 수정할 수 있도록 서버 메모리의 데모 상태를 사용합니다.
REMOTE에서는 DTO Service와 Repository를 통해 데이터베이스에 접근합니다.
두 실행 환경은 호환되는 애플리케이션 응답 형식을 반환해야 합니다.

권한은 LOCAL/REMOTE를 선택하기 전에 결정합니다. 따라서 조회 결과 필터링,
변경 요청 검증, 담당자 후보 조회는 두 환경에서 같은 권한 결과를 만들어야 합니다.

---

## 설정 권한

### 신뢰할 수 있는 Principal

서비스 데스크 설정에는 두 종류의 관리자가 있습니다. 관리자 유형은 클라이언트의
주장 값이나 역할 서열이 아니라 서버가 확인한 기준 사용자 정보인 `AppUser`로 결정합니다.

| 설정 관리자 유형      | 필요한 신뢰 필드                                      |
| --------------------- | ----------------------------------------------------- |
| Owner Admin           | `permission >= ADMIN` (`9`) 및 `userScope = INTERNAL` |
| Tenant Admin          | `permission >= ADMIN` (`9`) 및 `userScope = CLIENT`   |
| 설정 관리자 권한 없음 | `userScope`와 무관하게 더 낮은 permission             |

숫자 임계값을 여러 곳에 중복하지 않고 기준 접근 수준 상수를 사용합니다.

API Route의 설정 작업은 먼저 인증된 JWT의 `getUserAccessLevel(request) >= 9`를
검사합니다. 그다음 서버는 세션에서 현재 작업 사용자의 username을 구하고 기준
애플리케이션 사용자 정보를 불러와 `permission`, `userScope`, `companyId`를 확인합니다.
Impersonation 중 리소스 권한은 현재 작업 사용자(effective user)를 기준으로 판단합니다.
감사 정보에는 원래 사용자와 현재 작업 사용자의 username을 모두 유지합니다.

기능 코드에서도 같은 접근 수준 상수를 사용합니다. `role`, `dataScope`, 화면에서
편집 중인 테넌트, 요청의 `tenantId`/`companyId`, 클라이언트 상태는 관리자 유형을
결정하지 않습니다.

Owner Admin과 Tenant Admin은 리소스별 권한이 다른 동등한 관리자입니다.
Owner Admin에게 Tenant Admin의 모든 권한이 포함되지는 않습니다. 예를 들어 고객사의
`PORTAL` 승인 파이프라인은 해당 고객사의 Tenant Admin이 관리하고,
Owner Admin은 읽기 전용 권한만 가집니다.

### Tenant 경계와 관리 권한

Tenant는 카테고리 기반 업무 설정이 _어디에_ 적용되는지를 나타냅니다.
권한 정책은 각 설정 리소스를 _누가_ 읽거나 관리할 수 있는지를 정합니다.
"tenant가 설정을 소유한다"는 표현은 설정이 해당 테넌트 범위에 속한다는 뜻입니다.
테넌트 측 관리자 한 명이 모든 리소스를 관리한다는 뜻은 아닙니다.

Tenant Admin의 대상은 서버에서 다음 관계로 결정합니다.

```txt
effective AppUser.companyId
-> Tenant.companyId
-> 해당 customer Tenant
```

클라이언트는 다른 테넌트를 선택해 이 접근 범위를 확장할 수 없습니다.
Owner Tenant와 포털 운영·서비스 제공 회사는 하드코딩한 ID가 아니라
기준 포털 소유자 회사 조회 함수 또는 플래그로 식별합니다.

### Capability Matrix

Access 값의 의미는 다음과 같습니다.

- `manage`: 생성, 수정, 비활성화 또는 해당 엔티티에 정의된 교체·삭제 처리 허용
- `read`: 조회와 표시만 허용
- `none`: 조회와 변경 모두 금지

| 대상                        | Resource        | Owner Admin | 동일 회사 Tenant Admin | 다른 Tenant Admin |
| --------------------------- | --------------- | ----------- | ---------------------- | ----------------- |
| Tenant Settings             | Tenant          | manage      | none                   | none              |
| Owner Tenant, 양쪽 scope    | Category        | manage      | none                   | none              |
| Owner Tenant, 양쪽 scope    | Approval Step   | manage      | none                   | none              |
| Owner Tenant, 양쪽 scope    | Assignment Rule | manage      | none                   | none              |
| Customer Tenant, `INTERNAL` | Category        | none        | manage                 | none              |
| Customer Tenant, `INTERNAL` | Approval Step   | none        | manage                 | none              |
| Customer Tenant, `INTERNAL` | Assignment Rule | none        | manage                 | none              |
| Customer Tenant, `PORTAL`   | Category        | manage      | read                   | none              |
| Customer Tenant, `PORTAL`   | Approval Step   | read        | manage                 | none              |
| Customer Tenant, `PORTAL`   | Assignment Rule | manage      | read                   | none              |

Owner Admin에게 고객사의 `INTERNAL` 설정 지원·조회 권한이 암묵적으로 주어지지는 않습니다.
별도의 플랫폼·지원 권한은 이 정책의 범위에 포함하지 않습니다.

Tenant Admin은 다른 설정 페이지에서 자신의 테넌트를 표시하는 데 필요한 최소
정보를 받을 수 있습니다. 이 정보 제공이 Tenant Settings 목록 조회나 변경 API
접근 권한을 부여하지는 않습니다.

---

## 테넌트

### 책임

서비스 데스크 테넌트는 티켓 카테고리, 승인 단계, 배정 규칙의 조직·업무 적용 범위를
정의합니다. 이 범위 안의 관리 권한은 설정 권한 표에서 별도로 결정합니다.

Tenant는 Company와 연결되지만 같은 개념은 아닙니다. Company는 조직 기준 데이터이고,
Tenant는 회사에서 만들거나 회사에 연결한 서비스 데스크 설정의 적용 범위입니다.

### 현재 도메인 형태

```ts
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
필드를 사용합니다. UI와 도메인 코드는 매핑된 애플리케이션 형태를 소비해야 합니다.

### 포털 소유자 테넌트

포털 소유자 테넌트는 보호되는 구성입니다. 일반적인 테넌트 관리 작업으로
삭제되면 안 되며, 서비스 데스크 테넌트로 계속 사용 가능해야 합니다.

UI는 테넌트 설정 페이지에 제공된 테넌트·회사 정보를 바탕으로 포털 소유자 보호 동작을
결정합니다. 이 보호 동작은 자유롭게 수정할 수 있는 일반 설정이 아닙니다.

### Focused Tenant와 Selected Tenants

설정 페이지는 두 개념을 구분합니다.

- `focusedTenantId`: 현재 구성을 편집 중인 테넌트
- `selectedTenantIds`: 현재 서비스 데스크 테넌트로 활성화된 회사 집합

한 번에 하나의 테넌트에 집중해 편집합니다. 테넌트 설정 흐름에서는 여러
테넌트가 선택되거나 활성화될 수 있습니다.

### 활성화 정책

테넌트 활성화는 회사를 서비스 데스크 설정 대상으로 사용할지 결정합니다.

- 테넌트를 활성화하면 설정 구성 대상으로 사용할 수 있습니다.
- 테넌트를 비활성화하면 활성 설정 흐름에서 제외됩니다.
- 포털 소유자 보호 동작은 서버 경계에서 강제해야 합니다.
- 테넌트가 나중에 비활성화되어도 기존 티켓은 읽을 수 있어야 합니다.

Tenant Settings 목록 조회와 관리는 Owner Admin에게만 허용합니다. Tenant Admin에게는
Tenant Settings 탭을 표시하지 않습니다. 페이지에 직접 접근하면 UI에서 Settings Home으로
이동시킵니다. 권한 없는 Tenant Settings API 요청은 `403`을 반환하며 다른 페이지로
이동시키지 않습니다.

---

## 카테고리

### 책임

카테고리는 티켓의 핵심 동작 구성입니다. 요청 분류, 기본 우선순위, 기본 위험도,
기본 SLA 일수, 승인 구성, 배정 구성을 결정합니다.

### 현재 도메인 형태

현재 도메인 모델은 메인 카테고리와 서브카테고리를 구분합니다.

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

API DTO는 같은 `"PORTAL" | "INTERNAL"` 값을 가진 `category_scope:
CategoryScope`를 사용합니다. `"CLIENT"`를 사용하는 오래된 설명은 현재 모델과
맞지 않습니다.

### 계층

```txt
Tenant
-> Main Category
-> Sub Category
```

메인 카테고리는 필수 기본값을 가집니다. 서브카테고리는 일부 기본값을 재정의할 수
있습니다. 서브카테고리에 해당 기본값이 없으면 메인 카테고리 값을 사용합니다.

### Scope

Category scope는 main category가 포털 요청자를 위한 것인지, 내부 서비스
데스크 사용을 위한 것인지 제어합니다.

- `PORTAL`: 포털 요청자에게 제공할 수 있는 카테고리
- `INTERNAL`: 내부 운영자와 내부 워크플로를 위한 카테고리

Scope는 메인 카테고리에 속합니다. 서브카테고리를 표시하거나 담당자를 결정할 때는
메인 카테고리의 scope를 상속해 사용합니다.

### Active 정책

카테고리 생성과 활성화는 별도의 처리 단계입니다.

```txt
create Category
-> stored active = false
-> configure Category
-> configure Assignment Rule
-> explicitly activate Category
```

클라이언트가 `active = true`를 제출해도 서버의 생성 처리는 새 메인·서브카테고리를
모두 `active = false`로 저장합니다. 비활성 카테고리도 Settings에서 표시하고 설정할 수
있지만, 새 티켓의 선택지로 제공하지는 않습니다.

`inactive -> active` 전환에는 현재 활성인 Job Field 또는 Employee 참조를 하나 이상
포함한 실효 배정 규칙(effective Assignment Rule)이 필요합니다. 메인 카테고리는
자신의 규칙을 사용합니다. 서브카테고리는 자체 규칙이 있으면 이를 우선 사용하고,
자체 규칙이 없을 때만 메인 카테고리 규칙을 사용합니다. 자체 규칙이 존재하지만
유효하지 않으면 부모 규칙으로 대체하지 않습니다.

활성화 검증은 필요한 설정이 준비되었는지 확인합니다. 실제 담당자를 결정할 수 있는지
검증하는 단계와는 구분합니다.

```txt
Category activation validation
!=
Ticket routing-time validation
```

활성화할 때는 Job Field에 속한 현재 직원을 조회해 작업자로 결정하지 않습니다.
티켓 제출, 재제출, 카테고리에 영향을 주는 수정, 명시적인 담당자 재결정 시에는
직원·회사·테넌트 자격 정책을 더 엄격하게 적용합니다. 실제 작업자를 결정할 수 없으면
실패합니다.

메인·서브카테고리의 저장된 상태는 독립적입니다. 메인 카테고리를 비활성화해도
하위 카테고리의 저장된 상태를 덮어쓰지 않습니다.

```ts
const effectiveActive = mainCategory.active && subCategory.active;
```

따라서 메인 카테고리를 다시 활성화하면 각 하위 카테고리의 이전 실효 활성 상태가
복원됩니다. 이미 비활성 카테고리를 참조하는 기존 티켓은 계속 조회하고 감사할 수 있어야 합니다.

비활성화는 이후 선택과 이후 평가에 영향을 주어야 합니다. 기존 티켓 이력을
지우거나 다시 해석하면 안 됩니다.

### 생성 및 경계 불변 조건

메인 카테고리 생성은 설정 권한 표를 따릅니다.

- Owner Admin은 Owner Tenant에 `INTERNAL`, `PORTAL` 카테고리를 만들 수 있습니다.
- Owner Admin은 고객사 테넌트에 `PORTAL` 카테고리만 만들 수 있습니다.
- 고객사의 Tenant Admin은 자신의 테넌트에 `INTERNAL` 카테고리만 만들 수 있습니다.

생성 후 다음 경계 필드는 변경할 수 없습니다.

- 카테고리 `tenantId`
- 메인 카테고리 `scope`
- 테넌트 또는 scope 범위를 넘게 되는 서브카테고리 `parentId`

Scope를 변경하려면 기존 카테고리를 비활성화하고 새 카테고리를 만듭니다.
카테고리는 영구 삭제 대신 `active = false`를 사용해 기존 티켓과 이력의 참조를
보존합니다. 서브카테고리는 부모 메인 카테고리의 테넌트와 scope를 상속하며
독립적인 scope별 권한을 갖지 않습니다.

수정·비활성화 시 서버는 저장된 카테고리를 먼저 불러온 뒤 권한을 확인합니다.
생성 시에는 대상 테넌트와 요청한 scope를 검증합니다. 서브카테고리는 부모 메인
카테고리를 불러와 그 관계에서 테넌트와 scope를 구합니다.
요청 payload의 필드를 권한 근거로 신뢰하지 않습니다.

---

## 승인 단계

### 책임

승인 단계는 메인 카테고리의 순서 있는 승인 동작을 정의합니다.

승인 단계는 설정이지 티켓 이력이 아닙니다. 티켓이 승인 상태로 들어갈 때 현재
승인 설정이 티켓의 현재 승인 담당자로 해석됩니다. 이후 승인 활동은 티켓에
기록됩니다.

티켓에서 서브카테고리를 선택해도 승인 단계는 부모 메인 카테고리에서 결정합니다.
서브카테고리는 요청을 분류하며, 독립된 승인 파이프라인을 만들지 않습니다.

### 현재 도메인 형태

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

type ApprovalAssigneeType =
  | { type: "MANAGER"; level: 1 | 2 }
  | { type: "DEPARTMENT"; departmentId: string }
  | { type: "JOB_FIELD"; jobFieldId: string }
  | { type: "EMPLOYEE"; employeeUsernames: string[] };
```

서버 DTO는 같은 개념을 `approval_step_assignee`와 `skip_access_level`로
표현합니다.

`MANAGER`의 level 1은 요청자 Job Field의 부모, level 2는 조부모 Job Field에
속한 직원을 선택합니다. 이 level은 조직 계층의 거리이며 인증 권한 수준이 아닙니다.
`skipAccessLevel`은 별도의 승인 단계 건너뛰기 규칙입니다.

LOCAL과 REMOTE 모두 티켓에 저장된 요청자를 기준으로 합니다. 설정 저장 시에는
특정 티켓 요청자가 없으므로 카테고리 테넌트의 회사 안에서 지원할 수 있는
요청자·상위 Job Field·직원 조합과 활성 직원·직무·부서 참조를 검증합니다.
실제 승인자 결정 시에는 해당 요청자로 다시 계산하며, 자격을 갖춘 승인자가 없으면
실패합니다.

### 순서 있는 파이프라인

승인 단계는 `index` 오름차순으로 평가됩니다.

```txt
Ticket submitted
-> category selected
-> parent/main category resolved
-> approval steps resolved from main category
-> current approval assignee stored on ticket
-> approval activity advances or declines the ticket
```

티켓 행은 현재 담당자를 티켓 배정 필드에 저장합니다. 과거 승인 구성
전체를 위한 별도 영구 컬럼이 필요하지 않습니다.

### Skip 정책

`skipAccessLevel`은 요청자의 access level이 충분할 때 해당 단계를 건너뛰게
합니다.

Skip 규칙은 구성 규칙입니다. 승인 실행이 발생할 때 티켓 워크플로는 그 결과
활동과 이력을 기록해야 합니다.

### 검증

승인 단계 변경은 다음을 검증해야 합니다.

- 저장된 테넌트·카테고리 관계
- 저장된 메인 카테고리의 테넌트·scope에 대한 설정 권한
- 정렬된 index 값
- 지원하는 담당자 유형
- 참조된 부서, 직무, 직원, manager level
- 승인 단계를 건너뛰는 접근 수준

결정된 모든 승인자는 카테고리 테넌트의 회사에 속해야 합니다.

- `EMPLOYEE`: 모든 직원의 `companyId`가 카테고리 테넌트의 회사 ID와 같아야 합니다.
- `DEPARTMENT`: 부서와 결정된 직원이 해당 회사에 속해야 합니다.
- `JOB_FIELD`: 직무가 공유 기준 데이터여도 최종 직원 결정에 회사 필터를 적용합니다.
- `MANAGER`: 결정된 관리자가 해당 회사에 속해야 합니다.

참조 자격은 두 처리 지점에서 확인합니다. 후보 조회 API는 현재 사용자가 선택할 수
있는 참조만 반환합니다. REMOTE 설정 저장 시에는 후보 목록을 다시 조회하지 않습니다.
PostgreSQL이 저장된 카테고리·테넌트·회사·활성 조직 행을 기준으로 제출된 승인 참조
전체를 설정 트리 저장 트랜잭션 안에서 검증합니다.

설정 후 조직 데이터가 바뀔 수 있으므로 티켓 제출·재제출과 명시적인 담당자 재계산에서
자격을 다시 검사합니다. 유효한 승인자가 없으면 실패하며 담당자 없는 `Approval`
티켓을 만들지 않습니다.

고객사의 `PORTAL` 승인 설정에 읽기 전용 권한이 있는 Owner Admin에게는 현재 참조된
승인자의 표시 정보를 제공할 수 있습니다. 이 권한으로 고객사 직원 디렉터리의 후보를
검색할 수는 없습니다.

클라이언트는 사용자가 유효하게 입력하도록 도울 수 있지만, 최종 권한은 서버에
있습니다.

---

## 배정 규칙

### 책임

배정 규칙은 승인이 필요 없을 때, 승인이 완료되었을 때, 또는 업무 흐름에서
현재 작업 담당자를 결정해야 할 때 작업자를 정합니다.

### 현재 도메인 형태

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

현재 모델은 담당자 그룹을 사용합니다. 별도의 `ruleType` 필드를 사용하지 않습니다. REMOTE
DTO는 `job_field_id`와 `employee_username` 배열을 사용하며, 다시
애플리케이션 모델로 매핑됩니다.

### 해석

작업자 배정은 서버에서 결정해야 합니다.

```txt
Selected subcategory
-> subcategory assignment rule, when present
-> parent/main category assignment rule fallback
-> job-field and employee references
-> resolved work assignee usernames
-> ticket current assignee field
```

클라이언트는 배정 추천을 표시할 수 있지만, 서버가 검증 없이 믿어야 하는
최종 배정 결과를 직접 제출하면 안 됩니다.

### 검증

배정 규칙 변경은 다음을 검증해야 합니다.

- 저장된 테넌트·카테고리 관계
- 저장된 카테고리의 테넌트·상속 scope에 대한 설정 권한
- 참조된 직무
- 참조된 직원 username
- 비어 있거나 유효하지 않은 담당자 그룹
- 테넌트 범위를 벗어나거나 비활성인 참조 사용

폼의 빈 입력 상태를 배정 규칙으로 저장하지 않습니다. 규칙은
`jobFieldIds.length > 0 || assigneeUsernames.length > 0`일 때만 저장할 수 있습니다.
서브카테고리의 재정의 규칙을 제거하면 해당 규칙을 삭제해 부모 규칙을 다시 사용합니다.
빈 재정의 규칙은 저장하지 않습니다. 명시적인 활성화 전에 설정을 준비해야 하므로
메인 카테고리가 비활성인 상태에서도 규칙을 구성할 수 있습니다.

배정 후보 조회, 저장 검증, 활성화 준비 검사, 추천, 실제 배정은 저장된 카테고리에서
계산한 하나의 정책을 사용합니다. Owner `INTERNAL`은 포털 운영 회사,
customer `INTERNAL`은 테넌트 회사, 기본 `PORTAL`은 포털 운영 회사,
`includeTenantCompany`가 설정된 `PORTAL`은 두 회사를 모두 사용합니다.
Employee와 Job Field 참조는 이 허용된 회사 집합에 속해야 합니다.
클라이언트가 전달한 카테고리 scope, owner 플래그, 미리 계산한 회사 목록은
판단의 기준으로 삼지 않습니다.

후보 조회 API도 같은 회사 집합을 계산한 뒤 부서, 직무, 직원을 반환합니다.
REMOTE 저장 시 PostgreSQL은 저장된 카테고리에서 기준 정책을 결정하고,
제출된 직무·직원 참조 전체를 배정 트리 저장 트랜잭션 안에서 집합 단위 쿼리로 검증합니다.

활성 Job Field는 현재 활성 직원이 없어도 유효한 설정 참조입니다.
여기에 속한 실제 작업자를 결정하는 일은 티켓 배정 시점의 검증에서 담당합니다.
설정 후 조직 데이터가 바뀔 수 있으므로 제출, 재제출, 명시적 담당자 결정 명령은
자격을 다시 검사합니다. 유효한 작업자가 없으면 담당자 없는 `Assigned` 티켓을
만드는 대신 실패합니다.

고객사의 `PORTAL` 배정 규칙에 읽기 전용 권한이 있는 Tenant Admin에게는 현재
참조된 서비스 제공자 담당자의 표시 정보를 제공할 수 있습니다. 이 권한으로 포털 운영
회사의 직원 디렉터리 전체에서 후보를 검색할 수는 없습니다.

배정 규칙 변경은 이후 작업자 결정에 영향을 줍니다. 기존 티켓은 현재 담당자와
기록된 이력을 유지합니다.

---

## 조직 기준 데이터

서비스 데스크 설정은 조직 데이터를 참조합니다.

### Company

Company 데이터는 테넌트 옵션을 만들고 표시하는 데 사용됩니다.

### Department

Department 데이터는 승인 단계 담당자 구성에 사용됩니다.

### Job Field

Job Field 데이터는 승인 단계와 배정 규칙 구성에 사용됩니다.

### Employee

Employee 데이터는 명시적 승인 담당자, 명시적 배정 대상, 배정 추천 표시 등에
사용됩니다.

조직 참조 조회는 회사를 기준으로 합니다.

```ts
getEmployeesByCompanyId(companyId);
getDepartmentsByCompanyId(companyId);
getJobFieldsByCompanyId(companyId);
```

설정 페이지는 선택한 Tenant의 권한을 확인한 뒤 해당 Tenant에서 `companyId`를 얻습니다.
Repository의 조회 함수는 조직 전체를 읽어 애플리케이션에서 필터링하지 않고
SQL에 회사 조건을 적용합니다. Approval Step과 Assignment Rule은 독립적인 권한
기준으로 `tenantId`를 저장하지 않습니다. DTO는 관련 데이터에서 계산한 맥락을
응답에 포함할 수 있습니다.

```txt
Approval Step / Assignment Rule
-> Category
-> Tenant
-> Company
```

설정 도메인은 조직 소유권을 중복 저장하면 안 됩니다. 참조를 저장하고 적절한
기준 데이터 경계를 통해 해석해야 합니다.

---

## 관계 모델

```txt
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

테넌트와 카테고리는 설정 계층을 구성합니다. 승인·배정 설정은 티켓 업무 흐름의
주된 동작 단위인 카테고리에 연결됩니다.
승인자 결정에는 메인 카테고리의 승인 단계를 사용합니다. 작업자 배정에는
서브카테고리의 재정의 규칙을 우선 사용하고 필요한 경우에만 부모 메인 카테고리의 규칙을 사용합니다.

---

## 구성 변경 정책

설정 변경은 이후 동작에 영향을 줍니다.

### Category 변경

새 티켓은 갱신된 카테고리 설정을 사용합니다. 기존 티켓은 저장된 카테고리,
우선순위, 위험도, 기한, 담당자, 활동, 이력을 유지합니다.

### Approval Step 변경

`Approval` 상태의 티켓에 영향을 주는 승인 단계 트리 변경에는 명시적인
강제 적용(force apply)이 필요합니다. 일반 저장은 영향이 있으면 충돌을 반환합니다.
강제 적용은 트리 검증·저장, 영향을 받는 모든 티켓의 최초 담당자 결정 재시작,
reason이 `APPROVAL_CONFIGURATION_CHANGED`인 `ROUTING_RESET` 기록을 하나의
트랜잭션으로 처리합니다. 실패하면 설정과 티켓 변경을 모두 되돌립니다.

### Assignment Rule 변경

새 작업자 배정은 갱신된 규칙을 사용합니다. 기존 티켓은 티켓 명령으로 변경하기
전까지 현재 작업자를 유지합니다.

### Requester Update

요청자는 작업 실행 전에 카테고리와 본문을 수정할 수 있습니다.
카테고리가 바뀌면 서버는 요청자 수정 정책에 따라 카테고리 기본값, 승인 필요 여부,
배정 동작, 최소 기한, 첨부 payload를 다시 검증해야 합니다.

---

## Query와 Client State

설정 데이터는 서버에서 관리하는 상태입니다.

React Query에서 관리할 데이터는 다음과 같습니다.

- 테넌트 목록
- 활성 테넌트 목록
- 카테고리 트리
- 승인 단계 설정
- 배정 규칙
- 조직 참조 목록

로컬 컴포넌트 상태나 작은 UI 저장소에서 관리할 값은 다음과 같습니다.

- 선택한 탭
- 편집 중인 테넌트
- 현재 언어
- 변경 요청 전 폼의 임시 입력
- 트리 편집 중의 임시 상태

설정 서버 데이터를 Zustand에 중복 저장해 별도의 기준 데이터로 관리하면 안 됩니다.

---

## UI 구조

설정 UI는 설정 범위를 따릅니다.

```txt
/settings/service-desk-settings
-> tenant
-> category
-> approval-step
-> assignment-rule
```

공통 UI 책임은 다음과 같습니다.

- 테넌트 선택
- 번역된 라벨을 위한 언어 선택
- 로딩·빈 상태 표시
- 변경 결과의 일관된 안내
- 설정 페이지 사이의 테넌트 맥락 유지
- 공통 `manage` / `read` / `none` 결과 적용

각 페이지는 사용자가 실제로 편집하는 형태로 구성을 보여주어야 합니다. 예를 들어
카테고리는 트리로, 승인 단계는 카테고리 아래 순서 있는 단계로 표시합니다.
배정 규칙은 카테고리별로 표시합니다.

읽기 전용 화면은 "서비스 제공자가 관리", "고객사가 관리", "읽기 전용"과 같이
담당 주체를 표시합니다. 탭이나 버튼 숨기기는 사용 편의를 위한 동작이며 서버
권한 검사를 대신하지 않습니다.

---

## 검증과 보안

서버 경계가 최종 권한을 가집니다.

검증 대상은 다음과 같습니다.

- 인증된 사용자와 관리자 접근 권한
- 기준 사용자 정보에 따른 Owner Admin/Tenant Admin 분류
- 저장된 테넌트·회사 관계
- 카테고리 scope별 리소스 권한
- 다른 테넌트 참조에 대한 보호
- 유효한 카테고리 계층
- 변경할 수 없는 테넌트, 메인 scope, 부모 범위
- 유효한 승인자 참조
- 유효한 작업자 배정 참조
- 활성·비활성 동작
- 포털 소유자 테넌트 보호 동작

조회 API는 권한이 `none`인 리소스를 응답에서 제외해야 합니다.
다른 테넌트 설정을 반환한 뒤 UI가 숨길 것이라고 가정하면 안 됩니다.
변경 API는 저장된 리소스 정보를 다시 불러오고 `manage` 권한이 없는 사용자에게
`403`을 반환합니다. DTO 검증은 관리자 유형·회사 범위를 주장하거나 변경 불가능한
카테고리 맥락을 바꾸려는 요청을 거부합니다.

공통 애플리케이션 정책은 LOCAL/REMOTE를 선택하기 전에 실행하고,
저장된 관계를 확인하는 서버 Service·Repository에서 다시 검사합니다.
기존 RLS, DB 함수, 제약 조건도 추가 방어 수단으로 같은 테넌트 접근 제한을 유지해야 합니다.

클라이언트는 즉각적인 feedback으로 사용성을 높일 수 있지만, 신뢰 가능한 설정
검증자가 될 수는 없습니다.

---

## 현재 범위

현재 설계가 지원하는 것은 다음과 같습니다.

- 테넌트 활성화·비활성화
- 포털 소유자 테넌트 보호
- 테넌트·카테고리 라벨 번역
- 카테고리 트리 편집
- 메인·서브카테고리 기본값
- 카테고리 `PORTAL`·`INTERNAL` scope
- 카테고리 scope에 따른 Owner Admin/Tenant Admin 권한 결정
- 카테고리 기준으로 회사를 필터링하는 승인자·작업자 후보 조회
- 순서가 있는 승인 단계
- 관리자, 부서, 직무, 직원을 통한 승인자 지정
- 직무와 직원 username을 포함하는 담당자 그룹
- LOCAL과 REMOTE의 공통 API 응답 형식과 동작
- 설정 변경을 지원하는 서버 메모리의 LOCAL 데모 상태
- React Query에서 설정 서버 데이터를 관리하는 구조

---

## 지연된 Production 범위

다음 기능은 현재 구현 범위에 포함하지 않습니다. 실제로 구현하기 전까지 미구현 항목으로 다룹니다.

- 버전별 설정 게시
- 예약된 설정 변경
- 설정 변경 승인 흐름
- 전체 설정 감사 이벤트 스트림
- 일괄 가져오기·내보내기
- 고급 담당자 부하 분산
- 테넌트별 첨부 제한
- 테넌트별 SLA 달력 규칙
- 티켓이 참조한 과거 설정의 영구 삭제

---

## 책임 매트릭스

| 영역                          | 책임                                                                             |
| ----------------------------- | -------------------------------------------------------------------------------- |
| Domain model                  | 애플리케이션 설정 형태 정의                                                      |
| Feature API client            | 설정 API 호출과 타입이 정의된 작업 제공                                           |
| Route handler                 | HTTP 요청 파싱과 실행 환경별 처리 위임                                            |
| Settings authorization policy | 신뢰할 수 있는 사용자 정보와 리소스 권한 결정                                      |
| LOCAL settings handler        | 안전하게 변경할 수 있는 데모 동작 제공                                            |
| REMOTE DTO service            | DB에 저장된 행을 일정한 DTO 형식으로 변환                                          |
| Server service/repository     | 저장된 카테고리·조직 관계를 트랜잭션 안에서 검증하고 REMOTE 설정 저장               |
| React Query                   | 설정 서버 상태 관리                                                              |
| Settings UI                   | 실제 편집 흐름에 맞는 폼으로 설정 편집                                             |
| Ticket workflow               | 현재 설정을 티켓 동작으로 해석                                                   |
| Ticket history                | 이미 실행된 티켓 액션의 의미 보존                                                 |

---

## 관련 문서

- [티켓 시스템 개요](ticket/ticket-system-overview.md)
- [카테고리 전략](ticket/strategy/category-strategy.md)
- [승인 시스템](ticket/strategy/approval-system.md)
- [할당 정책](ticket/strategy/assignment-policy.md)
- [직원 참조 범위 매트릭스](ticket/reference/restrict-employee-list.xlsx)
- [데이터베이스 전략](../../02-architecture/database-strategy.md)
- [라우팅 전략](../../02-architecture/routing-strategy.md)
- [React Query 전략](../../05-development/react-query-strategy.md)
- [서비스 데스크 설정 DTO/API 경계 결정](../../06-decisions/2026-06-service-desk-settings-dto-api-boundary.md)
- [서비스 데스크 설정 참조 검증 경계 결정](../../06-decisions/2026-07-service-desk-settings-reference-validation-boundary.md)
- [티켓 라우팅 및 업데이트 정책 (2026-07)](../../06-decisions/2026-07-ticket-routing-and-update-policy.md)

---

## 현재 Workflow 영향 정책

- 고객 Tenant에 `Draft`, `Closed`가 아닌 운영 Ticket이 하나라도 있으면
  비활성화하거나 삭제할 수 없습니다. Portal-owner Tenant는 Ticket 유무와 관계없이
  항상 보호합니다.
- 진행 중인 티켓이 메인·서브카테고리를 사용하는 카테고리를 비활성화할 때는
  영향 경고와 명시적 확인이 필요합니다. 확인 후 비활성화해도 기존 티켓의 상태,
  승인·배정, History는 변경하지 않고 신규 업무 흐름에서의 사용 가능 여부만 변경합니다.
- 일반 카테고리 수정과 Assignment Rule 수정은 기존 티켓의 승인·배정을 자동으로
  초기화하지 않습니다.
- `Approval` 상태 티켓에 영향을 주는 Approval Step 트리 변경은 강제 적용이 필요합니다.
  강제 적용은 새 설정과 모든 담당자 재결정 결과를 검증한 뒤 설정 저장,
  첫 단계부터의 담당자 결정 초기화, reason이
  `APPROVAL_CONFIGURATION_CHANGED`인 `ROUTING_RESET` History 기록을 하나의
  트랜잭션으로 처리합니다. 하나라도 실패하면 전체를 되돌립니다.
- 이미 진행 중인 승인은 카테고리가 이후 비활성화되어도 계속할 수 있습니다.
  신규, 재제출, 명시적으로 재시작하는 담당자 결정에는 운영 가능한 카테고리가 필요합니다.

## 요약

서비스 데스크 설정은 tenant, category, approval-step, assignment-rule
구성을 통해 이후 티켓 동작을 정의합니다.

현재 모델은 테넌트별 카테고리 트리, `PORTAL`/`INTERNAL` 카테고리 scope,
담당자 유형이 정의된 순서형 승인 단계, 그룹 기반 배정 규칙을 사용합니다.
Tenant는 업무 설정의 적용 범위이며, 카테고리 scope별 권한이 각 리소스의 실제 관리자를
결정합니다. `INTERNAL` 설정은 해당 테넌트의 관리자가 담당합니다.
고객사의 `PORTAL` 카테고리와 배정 규칙은 Owner Admin이, 승인은 Tenant Admin이 관리합니다.

설정 데이터는 React Query가 관리하는 서버 상태이며 LOCAL/REMOTE API를 통해
제공됩니다. 설정 변경은 이후 업무 흐름에 적용하고, 기존 티켓의 활동과 이력은
이미 일어난 일의 의미를 보존해야 합니다.
