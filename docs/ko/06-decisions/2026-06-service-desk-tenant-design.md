# Service Desk Tenant 설계 (2026-06)

## 배경

2026년 6월 Service Desk settings 구현 과정에서 프로젝트는 `Tenant`를 명시적인 도메인 개념으로 도입했다.

이전 Service Desk 설계 문서에서는 `Client`를 최상위 category 경계로 사용했다.

```txt
Client -> Main Category -> Sub Category
```

이 모델은 초기 모델링 단계에서는 유용했다. Service Desk 모듈이 실제 내부 IT Help Desk / Service Hub 경험에서 영감을 받았고, 요청을 고객 또는 조직 단위로 그룹화할 수 있었기 때문이다.

그러나 시스템이 Supabase PostgreSQL, DTO/API 경계, Service Desk settings 관리와 함께 더 production-aligned 구조로 이동하면서 `Client`라는 용어는 너무 좁고 모호해졌다.

프로젝트에는 customer-only 의미와 혼동되지 않으면서 Service Desk configuration의 운영 경계를 표현할 수 있는 더 명확한 개념이 필요했다.

변경된 방향은 다음과 같다.

```txt
Tenant -> Main Category -> Sub Category
```

이 모델에서 `Tenant`는 Service Desk configuration boundary가 되고, `Company`는 organization/reference data로 남는다.

---

## 문제

### 1. `Client`는 Service Desk 경계로 너무 좁았음

`Client`라는 단어는 외부 고객 또는 고객 회사를 떠올리게 했다.

그러나 Service Desk 모듈은 더 넓은 운영 경계를 지원해야 한다.

- 내부 portal owner organization
- customer 또는 tenant company
- Service Desk configuration scope
- category tree ownership
- approval, assignment, SLA configuration scope

`Client`를 category tree의 root로 사용하면 도메인 정밀도가 낮아진다. 모든 Service Desk 경계를 customer-facing client로 해석해서는 안 되기 때문이다.

---

### 2. `Company`와 Service Desk Configuration은 책임이 다름

프로젝트는 이미 `Company`를 organization/reference data로 사용한다.

company record는 다음과 같은 질문에 답한다.

- 어떤 조직이 존재하는가?
- code 또는 display name은 무엇인가?
- active 상태인가?
- portal owner인가?

Service Desk settings에는 다른 개념이 필요하다.

Service Desk tenant는 다음과 같은 질문에 답한다.

- 어떤 조직에 Service Desk behavior가 설정되어 있는가?
- 어떤 category tree가 이 operational scope에 속하는가?
- 어떤 approval step과 assignment rule이 적용되는가?
- 어떤 tenant를 Service Desk settings와 ticket workflow에서 선택할 수 있는가?

`Company`가 곧바로 Service Desk configuration root가 되면, 프로젝트는 organization reference data와 module-specific behavior configuration을 섞게 된다.

---

### 3. Category Behavior에는 명확한 Configuration Root가 필요했음

이 프로젝트에서 category는 단순 분류가 아니다.

Category는 다음을 결정한다.

- default priority
- default risk level
- default SLA days
- approval requirements
- assignment behavior
- request template behavior

따라서 top-level category boundary는 명시적이어야 한다.

시스템에는 다음과 같은 구조가 필요했다.

```txt
Tenant
-> Category
-> Approval Step
-> Assignment Rule
-> SLA-related defaults
```

이 구조는 Service Desk settings model을 더 이해하기 쉽게 만들고, behavior configuration이 서로 무관한 organization data에 흩어지는 것을 방지한다.

---

### 4. LOCAL과 REMOTE Mode는 같은 Domain Vocabulary가 필요했음

프로젝트는 LOCAL과 REMOTE runtime path를 모두 지원한다.

```txt
LOCAL  -> mock-backed demo behavior
REMOTE -> Supabase PostgreSQL-backed behavior
```

LOCAL demo가 `client`에 가까운 naming을 사용하고 REMOTE database가 다른 구조를 사용한다면 DTO/API boundary 유지보수가 어려워진다.

domain vocabulary는 다음 영역에서 정렬될 필요가 있었다.

- mock data
- API response DTOs
- route handlers
- server data mapping
- settings UI
- documentation

---

### 5. Settings Entity Lifecycle을 더 명시해야 했음

settings 구현 중 서로 다른 Service Desk settings entity가 서로 다른 lifecycle 특성을 보였다.

예를 들면 다음과 같다.

- tenant는 비활성화된 뒤 나중에 다시 활성화될 수 있다.
- category는 일반적으로 historical reference를 보존해야 한다.
- approval step은 category configuration의 일부로 교체될 수 있다.
- assignment rule은 현재 routing policy로 업데이트되거나 교체될 수 있다.

모든 settings entity에 하나의 deletion 또는 activation rule을 적용하는 것은 지나치게 단순하다.

프로젝트에는 각 entity의 책임에 맞는 실용적인 lifecycle policy가 필요했다.

---

## 결정

`Tenant`를 명시적인 Service Desk configuration boundary로 도입한다.

변경된 hierarchy는 다음과 같다.

```txt
Tenant -> Main Category -> Sub Category
```

핵심 model distinction은 다음과 같다.

```txt
Company = organization/reference entity
Tenant = Service Desk configuration boundary
Category = tenant-scoped behavior configuration
```

tenant는 company에 mapping되지만, company와 같은 개념은 아니다.

### 권한 명확화 (2026-07)

이 결정은 하나의 관리 actor가 아니라 configuration *경계*를 정의한다. "tenant가
설정을 소유한다"는 표현은 category, approval step, assignment rule이 해당 tenant의
workflow와 company 경계 안에서 해석된다는 뜻이다. Tenant Admin이 모든 resource를
관리한다는 뜻은 아니다.

Category-scope 설정 정책은 관리 권한을 다음과 같이 별도로 배정한다.

- owner-tenant 설정은 Owner Admin이 관리한다.
- customer `INTERNAL` 설정은 해당 customer Tenant Admin이 관리한다.
- customer `PORTAL` category와 assignment는 Owner Admin이 관리한다.
- customer `PORTAL` approval은 해당 customer Tenant Admin이 관리한다.

Tenant 경계를 하나의 소유자에게 배정하는 것으로 오해할 수 있는 곳에서는 이
권한 정책을 적용한다.

---

## Scope Rules

### 1. Tenant는 Service Desk Configuration Boundary임

Service Desk behavior configuration은 tenant 경계에 속한다.

tenant-scoped settings에는 다음이 포함된다.

- category tree
- approval steps
- assignment rules
- category configuration을 통한 SLA-related defaults
- name, color 같은 tenant-specific display metadata

이를 통해 Service Desk 모듈은 각 tenant를 operational scope로 다룰 수 있다.

각 항목을 읽거나 관리할 수 있는 관리자는 category-scope 설정 권한 정책에서
별도로 결정한다.

---

### 2. Company는 Organization Reference Data로 유지함

`Company`는 더 넓은 reference entity로 남는다.

Company는 Service Desk-specific configuration behavior를 직접 가져서는 안 된다.

company는 현재 Service Desk tenant configuration에 참여하지 않더라도 organization/reference data로 존재할 수 있다.

이렇게 하면 organization model을 더 넓은 portal 전반에서 재사용할 수 있다.

---

### 3. Category는 Tenant Scope를 가짐

category는 tenant에 속한다.

category hierarchy는 tenant boundary 안에서 해석된다.

```txt
Tenant
-> Main Category
-> Sub Category
```

즉 category name, default priority, default risk level, SLA default, approval step, assignment rule은 선택된 tenant 안에서 해석된다.

---

### 4. Tenant는 UI 전용 개념이 아님

tenant는 settings page UI만을 위해 도입된 것이 아니다.

이는 다음에 영향을 주는 도메인 개념이다.

- settings structure
- ticket creation behavior
- category selection
- approval resolution
- assignment rule resolution
- reporting and filtering
- future remote persistence

UI는 tenant selection을 제공할 수 있지만, 그 의미는 Service Desk domain에 속한다.

---

### 5. Portal Owner는 신중하게 다뤄야 함

portal owner company는 company/reference data에 존재할 수 있고 administrative context에도 나타날 수 있다.

하지만 portal owner 처리는 명시적으로 유지해야 한다.

customer-facing 또는 tenant-selectable Service Desk behavior에서는 workflow가 요구하지 않는 한 portal owner를 ordinary tenant company와 조용히 동일하게 취급해서는 안 된다.

이는 다음 사이의 우발적인 혼합을 방지한다.

- internal portal ownership
- tenant/customer configuration
- selectable Service Desk operating scope

---

### 6. LOCAL과 REMOTE는 같은 API Contract를 공유해야 함

LOCAL과 REMOTE behavior는 같은 application-facing contract를 사용해야 한다.

UI는 tenant data의 출처가 무엇인지에 의존해서는 안 된다.

- mock-backed local state
- Supabase PostgreSQL rows
- future backend APIs

의도한 흐름은 다음과 같다.

```txt
UI
-> feature API client
-> Next.js Route Handler
-> LOCAL handler or REMOTE DTO/service
```

Tenant DTO는 source가 local mock data인지 remote database row인지 숨겨야 한다.

---

## Entity Lifecycle Policy

### Tenant

tenant는 deactivation과 reactivation을 지원한다.

tenant는 새 Service Desk configuration 또는 ticket workflow에서 더 이상 사용되지 않을 때 inactive가 될 수 있다.

하지만 tenant record는 다음과 연결될 수 있으므로 쉽게 삭제해서는 안 된다.

- existing categories
- historical tickets
- reporting data
- company-level configuration

권장 behavior는 다음과 같다.

```txt
deactivate -> keep record
reactivate -> reuse existing record
```

이 방식은 같은 company에 대해 중복 tenant가 생성되는 것을 피하고 historical continuity를 보존한다.

---

### Category

category는 active/inactive lifecycle을 계속 사용해야 한다.

category는 ticket history, reporting, existing ticket reference에 영향을 준다.

category가 새 ticket에 더 이상 유효하지 않으면 다음과 같이 처리한다.

```txt
category.active = false
```

category는 historical display와 audit consistency를 위해 계속 남아 있어야 한다.

---

### Approval Step

approval step은 category 아래의 configuration detail이다.

category approval workflow가 변경되면 제거되거나 교체될 수 있다.

다음 조건에서는 approval step의 hard delete를 허용할 수 있다.

- step이 current configuration으로 취급된다.
- historical ticket approval behavior가 ticket/action/history record를 통해 별도로 보존된다.
- setting 삭제가 past ticket event를 다시 쓰지 않는다.

이렇게 하면 obsolete configuration row를 과도하게 보존하지 않으면서 settings model을 실용적으로 유지할 수 있다.

---

### Assignment Rule

assignment rule은 category의 현재 routing policy를 나타낸다.

category routing strategy가 변경되면 업데이트, 교체 또는 제거될 수 있다.

다음 조건에서는 hard delete 또는 replacement를 허용할 수 있다.

- existing ticket assignment history가 계속 보존된다.
- past ticket ownership이 조용히 재계산되지 않는다.
- current assignment rule은 future 또는 newly evaluated workflow behavior에만 영향을 준다.

---

## 정렬한 내용

### 1. Domain Vocabulary

Service Desk vocabulary를 `Client` 대신 `Tenant` 중심으로 정렬했다.

이전 방향:

```txt
Client -> Main Category -> Sub Category
```

변경된 방향:

```txt
Tenant -> Main Category -> Sub Category
```

이는 root configuration layer의 실제 책임을 더 잘 반영한다.

---

### 2. Company와 Tenant Boundary

company data와 Service Desk tenant configuration의 차이를 명확히 했다.

```txt
Company
-> organization/reference data

Tenant
-> Service Desk configuration scope
```

이를 통해 company record가 Service Desk-specific behavior로 과부하되는 것을 방지한다.

---

### 3. Settings Structure

settings structure를 tenant-scoped configuration 중심으로 정렬했다.

Tenant 경계는 다음 항목을 구성하는 entry point 역할을 한다.

- category hierarchy
- approval behavior
- assignment behavior
- SLA-related defaults

이렇게 하면 Service Desk settings가 administrative configuration surface로서 더 일관성을 가진다.

이것이 전체 목록에 하나의 administrative actor가 있다는 뜻은 아니다. Owner Admin과
Tenant Admin은 resource별 `manage`, `read`, `none` capability를 받는다.

---

### 4. LOCAL / REMOTE Runtime Consistency

tenant behavior를 기존 LOCAL/REMOTE strategy와 정렬했다.

LOCAL mode는 mock-backed 또는 server-side local state를 사용할 수 있다.

REMOTE mode는 DTO mapping과 함께 Supabase PostgreSQL을 사용할 수 있다.

두 path는 같은 application-facing DTO shape를 반환해야 한다.

---

### 5. Historical Integrity

tenant design을 기존 audit 및 history 원칙과 정렬했다.

settings change가 past ticket meaning을 조용히 다시 써서는 안 된다.

tenant/category/approval/assignment settings가 나중에 변경되더라도 past ticket record, action, history는 당시 무슨 일이 있었는지 이해할 수 있어야 한다.

---

## 결과 영향

### 긍정적 영향

- 더 명확한 domain vocabulary
- organization reference data와 Service Desk behavior의 더 나은 분리
- 더 확장 가능한 category configuration model
- settings data를 위한 더 깔끔한 DTO/API boundary
- reviewer와 maintainer에게 더 쉬운 설명
- LOCAL demo와 REMOTE database-backed behavior 사이의 더 나은 정렬
- portal owner와 tenant/customer scope 사이의 모호성 감소
- 더 현실적인 production-aligned Service Desk design

---

### 부정적 영향 / 트레이드오프

- 설명해야 할 domain concept가 하나 더 추가됨
- `Client`를 사용한 기존 문서를 업데이트해야 함
- company row와 tenant DTO 사이의 mapping을 신중하게 처리해야 함
- company와 tenant가 더 이상 같은 개념이 아니므로 Settings UI가 약간 더 복잡해짐
- settings entity별 lifecycle rule이 다르므로 구현이 명시적이어야 함

---

## Implementation Notes

### Recommended Database Direction

tenant는 company에 mapping되는 Service Desk-specific entity로 저장할 수 있다.

개념적 shape는 다음과 같다.

```ts
type Tenant = {
  id: string;
  companyId: string;
  name: LocalizedText;
  color: string | null;
  active: boolean;
};
```

정확한 database row는 database-specific naming을 사용할 수 있지만, API response는 stable DTO를 노출해야 한다.

---

### Recommended DTO Direction

tenant DTO는 application-facing이어야 한다.

예시:

```ts
type TenantDto = {
  id: string;
  companyId: string;
  name: LocalizedText;
  color: string | null;
  active: boolean;
};
```

UI는 database row shape가 아니라 이 DTO를 소비해야 한다.

---

### Recommended Category Relationship

category는 configuration scope로 tenant를 참조해야 한다.

개념적 shape는 다음과 같다.

```ts
type MainCategory = {
  id: string;
  tenantId: string;
  scope: "PORTAL" | "INTERNAL";
  name: LocalizedText;
  active: boolean;
  subCategories: SubCategory[];
};
```

Main/subcategory는 category-scope 값이 아니라 hierarchy다. Subcategory는 main
category로부터 tenant와 `PORTAL`/`INTERNAL` scope를 상속한다. 이 구조는 category
behavior를 tenant-scoped로 유지하고 global category ambiguity를 피한다.

---

## 업데이트할 문서

tenant 결정은 기존 domain 및 strategy 문서에 영향을 준다.

권장 업데이트 대상:

```txt
docs/en/03-domain/ticket/ticket-system-overview.md
docs/en/03-domain/ticket/ticket-model.md
docs/en/03-domain/ticket/strategy/category-strategy.md
docs/en/03-domain/ticket/strategy/approval-system.md
docs/en/03-domain/ticket/strategy/assignment-policy.md
docs/en/03-domain/ticket/strategy/sla-strategy.md
docs/en/08-dev-strategy/service-desk-implementation-strategy.md
docs/en/README.md
```

가장 중요한 업데이트는 오래된 category root 표현을 다음과 같이 바꾸는 것이다.

```txt
Client -> Main Category -> Sub Category
```

다음 표현으로 변경한다.

```txt
Tenant -> Main Category -> Sub Category
```

또한 tenant가 단순한 customer label이 아니라 Service Desk configuration boundary라는 점을 명확히 해야 한다.

---

## 후속 운영 정책

### 1. Category Root로 `Client`를 다시 도입하지 않음

향후 문서와 code는 `Client`를 Service Desk category behavior의 root로 사용하는 것을 피해야 한다.

Service Desk configuration boundary를 가리킬 때는 `Tenant`를 사용한다.

---

### 2. Company와 Tenant를 분리해서 유지함

미래 설계가 명시적으로 정당화하지 않는 한 company reference data와 tenant configuration behavior를 병합하지 않는다.

기본 규칙은 다음과 같다.

```txt
Company != Tenant
```

tenant는 company를 참조할 수 있지만, 두 개념을 같은 domain concept로 취급해서는 안 된다.

---

### 3. Historical Ticket Meaning을 보존함

settings change가 old ticket을 읽을 수 없게 만들거나 오해하게 만들어서는 안 된다.

tenant, category, approval step, assignment rule이 변경되더라도 existing ticket history는 당시 무슨 일이 있었는지 계속 설명할 수 있어야 한다.

---

### 4. LOCAL과 REMOTE Contract를 정렬된 상태로 유지함

향후 tenant-related API는 LOCAL과 REMOTE path 모두에서 같은 DTO contract를 유지해야 한다.

UI는 runtime mode에 따라 별도의 tenant logic을 가질 필요가 없어야 한다.

---

### 5. Tenant를 Future Remote Expansion의 Foundation으로 다룸

tenant design은 다음과 같은 future expansion을 지원해야 한다.

- tenant-aware reporting
- tenant-specific category templates
- tenant-scoped approval policies
- tenant-scoped assignment strategies
- 현재 category-scope 설정 matrix를 넘어서는 추가 tenant-level access restriction
- tenant-specific Service Desk settings

이들을 즉시 완전히 구현할 필요는 없지만, model이 이를 막아서는 안 된다.

---

## 요약

프로젝트는 `Tenant`를 명시적인 Service Desk configuration boundary로 도입한다.

이는 이전의 `Client`-rooted category model을 대체하고 organization data와 Service Desk behavior 사이의 관계를 명확히 한다.

최종 conceptual model은 다음과 같다.

```txt
Company = organization/reference data
Tenant = Service Desk configuration boundary
Category = tenant-scoped behavior configuration
```

category hierarchy는 다음과 같다.

```txt
Tenant -> Main Category -> Sub Category
```

이 결정은 domain clarity를 높이고, LOCAL/REMOTE consistency를 지원하며, company data의 재사용성을 유지하고, Service Desk settings를 production-aligned configuration model로 더 쉽게 설명할 수 있게 한다.
