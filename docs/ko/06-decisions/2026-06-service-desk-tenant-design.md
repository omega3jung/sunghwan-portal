# Service Desk Tenant 설계 (2026-06)

## 배경

2026년 6월 Service Desk 설정을 구현하면서 `Tenant`를 별도 도메인 개념으로 도입했습니다.

이전 Service Desk 설계 문서에서는 `Client`를 카테고리가 속하는 최상위 범위로 사용했습니다.

```txt
Client -> Main Category -> Sub Category
```

이 모델은 초기 모델링 단계에서는 유용했습니다. Service Desk 모듈이 실제 내부 IT Help Desk / Service Hub 경험에서 영감을 받았고, 요청을 고객 또는 조직 단위로 그룹화할 수 있었기 때문입니다.

Supabase PostgreSQL 접근, DTO/API 분리, Service Desk 설정 관리를 프로덕션 설계에
맞추는 과정에서 `Client`라는 용어는 너무 좁고 모호해졌습니다.

외부 고객만을 뜻하는 이름과 구분하면서, Service Desk 설정이 적용되는 운영 범위를
표현할 개념이 필요했습니다.

변경된 방향은 다음과 같습니다.

```txt
Tenant -> Main Category -> Sub Category
```

이 모델에서 `Tenant`는 Service Desk 설정의 적용 범위를 나타내고,
`Company`는 조직 참조 데이터로 남습니다.

---

## 문제

### 1. `Client`는 Service Desk 경계로 너무 좁았음

`Client`라는 단어는 외부 고객 또는 고객 회사를 떠올리게 했습니다.

그러나 Service Desk 모듈은 더 넓은 운영 경계를 지원해야 합니다.

- 내부 포털 운영 조직
- 고객 또는 테넌트 회사
- Service Desk 설정 적용 범위
- 카테고리 트리가 속한 범위
- 승인, 배정, SLA 설정 적용 범위

`Client`를 카테고리 트리의 최상위 개념으로 사용하면 이 범위가 모호해집니다.
모든 Service Desk 운영 범위가 외부 고객을 뜻하지는 않기 때문입니다.

---

### 2. `Company`와 Service Desk Configuration은 책임이 다름

프로젝트는 이미 `Company`를 조직 참조 데이터로 사용합니다.

회사 레코드는 다음 정보를 제공합니다.

- 어떤 조직이 존재하는가?
- 코드 또는 표시 이름은 무엇인가?
- 활성 상태인가?
- 포털 소유자인가?

Service Desk 설정에는 별도의 개념이 필요합니다.
Service Desk 테넌트는 다음 정보를 제공합니다.

- 어떤 조직에 Service Desk 동작이 설정되어 있는가?
- 어떤 카테고리 트리가 이 운영 범위에 속하는가?
- 어떤 승인 단계와 배정 규칙이 적용되는가?
- 어떤 테넌트를 Service Desk 설정과 티켓 업무 흐름에서 선택할 수 있는가?

`Company`를 Service Desk 설정의 최상위 개념으로 사용하면 조직 참조 데이터와
특정 모듈의 동작 설정을 섞게 됩니다.

---

### 3. Category Behavior에는 명확한 Configuration Root가 필요했음

이 프로젝트에서 카테고리는 요청을 분류하면서 다음 동작도 결정합니다.

- 기본 우선순위
- 기본 위험도
- 기본 SLA 일수
- 승인 필요 조건
- 담당자 배정 방식
- 요청 템플릿 동작

따라서 카테고리 설정의 최상위 적용 범위가 명확해야 합니다.

시스템에는 다음과 같은 구조가 필요했습니다.

```txt
Tenant
-> Category
-> Approval Step
-> Assignment Rule
-> SLA-related defaults
```

이 구조로 Service Desk 설정 모델을 쉽게 이해할 수 있고, 동작 설정이 서로
관련 없는 조직 데이터에 흩어지는 것을 막을 수 있습니다.

---

### 4. LOCAL과 REMOTE Mode는 같은 Domain Vocabulary가 필요했음

프로젝트는 LOCAL과 REMOTE 실행 환경을 모두 지원합니다.

```txt
LOCAL  -> mock-backed demo behavior
REMOTE -> Supabase PostgreSQL-backed behavior
```

LOCAL 데모가 `client` 중심의 이름을 쓰고 REMOTE DB가 다른 구조를 사용하면
DTO와 API를 함께 유지보수하기 어렵습니다. 다음 영역에서 도메인 용어를 통일할 필요가 있었습니다.

- mock 데이터
- API 응답 DTO
- Route Handler
- 서버 데이터 변환
- 설정 UI
- 문서

---

### 5. Settings Entity Lifecycle을 더 명시해야 했음

설정을 구현하면서 Service Desk 엔티티마다 활성화·수정·삭제 방식이 다르다는 점을 확인했습니다.

예를 들면 다음과 같습니다.

- 테넌트는 비활성화한 뒤 다시 활성화할 수 있습니다.
- 카테고리는 일반적으로 과거 기록에서 참조할 수 있도록 보존해야 합니다.
- 승인 단계는 카테고리 설정 수정 시 교체할 수 있습니다.
- 배정 규칙은 현재 담당자 배정 정책에 맞게 수정하거나 교체할 수 있습니다.

모든 설정 엔티티에 같은 삭제·활성화 규칙을 적용하면 이 차이를 처리할 수 없습니다.
각 엔티티의 역할에 맞는 상태 변경·삭제 정책이 필요했습니다.

---

## 결정

Service Desk 설정의 적용 범위를 나타내는 `Tenant`를 도입했습니다.

변경된 계층은 다음과 같습니다.

```txt
Tenant -> Main Category -> Sub Category
```

모델의 역할은 다음과 같이 구분합니다.

```txt
Company = organization/reference entity
Tenant = Service Desk configuration boundary
Category = tenant-scoped behavior configuration
```

테넌트는 회사에 연결되지만, 회사와 같은 개념은 아닙니다.

### 권한 명확화 (2026-07)

이 결정은 설정이 적용되는 *범위*를 정의합니다. "tenant가 설정을 소유한다"는
표현은 카테고리, 승인 단계, 배정 규칙을 해당 테넌트의 업무 흐름과 회사 범위 안에서
해석한다는 뜻입니다. Tenant Admin이 모든 리소스를 관리한다는 뜻은 아닙니다.

카테고리 scope별 설정 정책은 관리 권한을 다음과 같이 별도로 배정합니다.

- 포털 소유자 테넌트 설정은 Owner Admin이 관리합니다.
- 고객사의 `INTERNAL` 설정은 해당 고객사의 Tenant Admin이 관리합니다.
- 고객사의 `PORTAL` 카테고리와 배정 규칙은 Owner Admin이 관리합니다.
- 고객사의 `PORTAL` 승인은 해당 고객사의 Tenant Admin이 관리합니다.

Tenant 경계를 하나의 소유자에게 배정하는 것으로 오해할 수 있는 곳에서는 이
권한 정책을 적용합니다.

---

## Scope Rules

### 1. Tenant는 Service Desk Configuration Boundary임

Service Desk 동작 설정은 테넌트 범위에 속합니다.

테넌트별 설정에는 다음이 포함됩니다.

- 카테고리 트리
- 승인 단계
- 배정 규칙
- 카테고리 설정에 포함된 SLA 기본값
- 이름, 색상 같은 테넌트별 표시 정보

이를 통해 Service Desk 모듈은 테넌트별로 운영 설정을 적용할 수 있습니다.

각 항목을 읽거나 관리할 수 있는 관리자는 카테고리 scope별 설정 권한 정책에서
별도로 결정합니다.

---

### 2. Company는 Organization Reference Data로 유지함

`Company`는 여러 기능에서 사용하는 조직 참조 엔티티로 남습니다.

Company에 Service Desk 전용 동작 설정을 직접 넣어서는 안 됩니다.
회사는 Service Desk 테넌트 설정에 참여하지 않아도 조직 참조 데이터로 존재할 수 있습니다.
이렇게 분리하면 조직 모델을 포털의 다른 기능에서도 재사용할 수 있습니다.

---

### 3. Category는 Tenant Scope를 가짐

카테고리는 테넌트에 속하며 카테고리 계층도 해당 테넌트 범위 안에서 해석합니다.

```txt
Tenant
-> Main Category
-> Sub Category
```

카테고리 이름, 기본 우선순위·위험도·SLA, 승인 단계, 배정 규칙은 선택한 테넌트
안에서 해석합니다.

---

### 4. Tenant는 UI 전용 개념이 아님

테넌트는 설정 페이지에만 사용하는 UI 개념이 아닙니다.

이는 다음에 영향을 주는 도메인 개념입니다.

- 설정 구조
- 티켓 생성 동작
- 카테고리 선택
- 승인자 결정
- 배정 규칙에 따른 작업자 결정
- 리포트와 필터링
- 향후 REMOTE 저장

UI는 테넌트 선택 기능을 제공할 수 있지만, 테넌트의 의미는 Service Desk 도메인에서 정합니다.

---

### 5. Portal Owner는 신중하게 다뤄야 함

포털 소유자 회사는 회사 참조 데이터와 관리 작업 정보에 나타날 수 있습니다.
포털 소유자 처리 방식은 명시적으로 구분해야 합니다. 고객 화면이나 테넌트를 선택하는
Service Desk 흐름에서는 업무상 필요가 명확하지 않으면 포털 소유자를 일반 테넌트 회사와
동일하게 취급해서는 안 됩니다.

이는 다음 사이의 우발적인 혼합을 방지합니다.

- 내부 포털 소유 관계
- 테넌트·고객 설정
- 선택할 수 있는 Service Desk 운영 범위

---

### 6. LOCAL과 REMOTE는 같은 API Contract를 공유해야 함

LOCAL과 REMOTE는 애플리케이션에 같은 API 응답 형식과 동작 규칙을 제공해야 합니다.

UI는 테넌트 데이터가 다음 중 어디에서 왔는지에 따라 다르게 처리하면 안 됩니다.

- mock 기반 LOCAL 상태
- Supabase PostgreSQL 행
- 향후 백엔드 API

의도한 흐름은 다음과 같습니다.

```txt
UI
-> feature API client
-> Next.js Route Handler
-> LOCAL handler or REMOTE DTO/service
```

Tenant DTO는 데이터가 LOCAL mock에서 왔는지 REMOTE DB 행에서 왔는지에 따라
달라져서는 안 됩니다.

---

## Entity Lifecycle Policy

### Tenant

테넌트는 비활성화와 재활성화를 지원합니다.
새 Service Desk 설정이나 티켓 업무 흐름에서 사용하지 않는 테넌트는 비활성화할 수 있습니다.

테넌트 레코드는 다음 기록과 연결될 수 있으므로 쉽게 삭제해서는 안 됩니다.

- 기존 카테고리
- 과거 티켓
- 리포팅 데이터
- 회사 수준 설정

권장 동작은 다음과 같습니다.

```txt
deactivate -> keep record
reactivate -> reuse existing record
```

같은 회사에 중복 테넌트를 만들지 않고, 기존 기록과의 연결을 유지할 수 있습니다.

---

### Category

카테고리는 계속 활성·비활성 상태로 관리해야 합니다.
카테고리는 티켓 이력, 리포트, 기존 티켓의 참조에 영향을 줍니다.
새 티켓에서 더 이상 사용할 수 없는 카테고리는 다음과 같이 처리합니다.

```txt
category.active = false
```

과거 기록을 표시하고 일관되게 감사할 수 있도록 카테고리를 보존해야 합니다.

---

### Approval Step

승인 단계는 카테고리의 세부 설정입니다.
카테고리의 승인 흐름이 바뀌면 제거하거나 교체할 수 있습니다.
다음 조건에서는 승인 단계의 영구 삭제를 허용할 수 있습니다.

- 단계를 현재 설정으로 취급합니다.
- 과거 티켓의 승인 동작을 티켓·액션·이력 기록에 별도로 보존합니다.
- 설정을 삭제해도 과거 티켓 이벤트를 다시 쓰지 않습니다.

이 조건을 따르면 더 이상 사용하지 않는 설정 행을 과도하게 보존하지 않고 설정 모델을 유지할 수 있습니다.

---

### Assignment Rule

배정 규칙은 카테고리의 현재 작업자 배정 정책을 나타냅니다.
카테고리의 배정 방식이 바뀌면 수정, 교체 또는 제거할 수 있습니다.

다음 조건에서는 영구 삭제나 교체를 허용할 수 있습니다.

- 기존 티켓의 배정 이력을 계속 보존합니다.
- 과거 티켓의 담당자를 변경 사실이 드러나지 않게 다시 계산하지 않습니다.
- 현재 배정 규칙은 이후 작업 또는 새로 평가하는 업무 흐름에만 영향을 줍니다.

---

## 정렬한 내용

### 1. Domain Vocabulary

Service Desk 용어를 `Client` 대신 `Tenant` 중심으로 정리했습니다.

이전 방향:

```txt
Client -> Main Category -> Sub Category
```

변경된 방향:

```txt
Tenant -> Main Category -> Sub Category
```

이는 설정이 적용되는 최상위 범위의 역할을 더 잘 표현합니다.

---

### 2. Company와 Tenant Boundary

회사 데이터와 Service Desk 테넌트 설정의 차이를 명확히 했습니다.

```txt
Company
-> organization/reference data

Tenant
-> Service Desk configuration scope
```

이 구분으로 회사 레코드에 Service Desk 전용 동작이 과도하게 섞이는 것을 막습니다.

---

### 3. Settings Structure

설정 구조를 테넌트별로 구성했습니다. 다음 항목을 설정할 때는 먼저 대상 테넌트를 선택합니다.

- 카테고리 계층
- 승인 동작
- 배정 동작
- SLA 관련 기본값

이 구조로 Service Desk 관리 설정을 일관되게 구성할 수 있습니다.

전체 설정 목록을 한 관리자가 담당한다는 뜻은 아닙니다. Owner Admin과
Tenant Admin의 권한은 리소스별로 `manage`, `read`, `none`으로 결정합니다.

---

### 4. LOCAL / REMOTE Runtime Consistency

테넌트 동작에도 기존 LOCAL/REMOTE 전략을 적용했습니다.
LOCAL은 mock 상태나 서버 측 LOCAL 상태를 사용할 수 있습니다.
REMOTE는 Supabase PostgreSQL 데이터를 DTO로 변환해 제공할 수 있습니다.
두 환경은 애플리케이션에 같은 DTO 형식을 반환해야 합니다.

---

### 5. Historical Integrity

테넌트 설계에도 기존 감사·이력 원칙을 적용했습니다.

설정을 바꾸면서 과거 티켓 기록의 의미를 드러나지 않게 바꾸어서는 안 됩니다.
테넌트·카테고리·승인·배정 설정이 바뀌어도 과거 티켓, 액션, 이력에서 당시의
동작을 이해할 수 있어야 합니다.

---

## 결과 영향

### 긍정적 영향

- 도메인 용어 명확화
- 조직 참조 데이터와 Service Desk 동작의 역할 분리
- 카테고리 설정 모델의 확장성 향상
- 설정 데이터의 DTO/API 담당 역할 명확화
- 검토자와 유지보수 담당자가 이해하기 쉬운 설명
- LOCAL 데모와 REMOTE DB 동작의 일관성 향상
- 포털 소유자와 테넌트·고객 범위 사이의 모호성 감소
- 프로덕션 설계에 맞는 Service Desk 구조

---

### 부정적 영향 / 트레이드오프

- 설명해야 할 도메인 개념 추가
- `Client`를 사용한 기존 문서를 업데이트해야 함
- 회사 DB 행과 테넌트 DTO 사이의 변환을 신중하게 처리해야 함
- 회사와 테넌트를 구분하므로 Settings UI가 약간 더 복잡해짐
- 설정 엔티티별 상태 변경·삭제 규칙을 명확히 구현해야 함

---

## Implementation Notes

### Recommended Database Direction

테넌트는 회사에 연결된 Service Desk 전용 엔티티로 저장할 수 있습니다.

개념적 구조는 다음과 같습니다.

```ts
type Tenant = {
  id: string;
  companyId: string;
  name: LocalizedText;
  color: string | null;
  active: boolean;
};
```

DB 행에는 DB 전용 이름을 사용할 수 있지만 API 응답은 일정한 DTO 형식을 제공해야 합니다.

---

### Recommended DTO Direction

테넌트 DTO는 애플리케이션에서 사용할 형식이어야 합니다.

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

UI는 DB 행 형식 대신 이 DTO를 사용해야 합니다.

---

### Recommended Category Relationship

카테고리는 설정 적용 범위로 테넌트를 참조해야 합니다.

개념적 구조는 다음과 같습니다.

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

메인·서브카테고리는 계층 구분이며 category scope 값이 아닙니다.
서브카테고리는 메인 카테고리의 테넌트와 `PORTAL`/`INTERNAL` scope를 상속합니다.
이 구조로 카테고리 동작을 테넌트 범위 안에서 정의해 전역 카테고리의 모호함을 피합니다.

---

## 업데이트할 문서

테넌트 도입 결정은 기존 도메인·전략 문서에 영향을 줍니다.

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

주요 수정은 기존 카테고리 최상위 범위를 나타내는 다음 표현을 바꾸는 것입니다.

```txt
Client -> Main Category -> Sub Category
```

다음 표현으로 변경합니다.

```txt
Tenant -> Main Category -> Sub Category
```

또한 테넌트가 고객 표시 이름뿐 아니라 Service Desk 설정의 적용 범위를 뜻한다는 점을 명확히 해야 합니다.

---

## 후속 운영 정책

### 1. Category Root로 `Client`를 다시 도입하지 않음

향후 문서와 코드에서 Service Desk 카테고리의 최상위 범위를 `Client`로 표현하지 않습니다.
Service Desk 설정의 적용 범위를 가리킬 때는 `Tenant`를 사용합니다.

---

### 2. Company와 Tenant를 분리해서 유지함

향후 설계에서 명확한 근거를 제시하지 않는 한 회사 참조 데이터와 테넌트 동작 설정을 병합하지 않습니다.

기본 규칙은 다음과 같습니다.

```txt
Company != Tenant
```

테넌트는 회사를 참조할 수 있지만 두 개념을 같은 도메인 개념으로 취급해서는 안 됩니다.

---

### 3. Historical Ticket Meaning을 보존함

설정 변경으로 과거 티켓을 읽을 수 없게 만들거나 잘못 해석하게 해서는 안 됩니다.
테넌트, 카테고리, 승인 단계, 배정 규칙이 바뀌어도 기존 티켓 이력에서 당시 동작을 이해할 수 있어야 합니다.

---

### 4. LOCAL과 REMOTE Contract를 정렬된 상태로 유지함

향후 테넌트 관련 API는 LOCAL과 REMOTE에서 같은 DTO 형식을 유지해야 합니다.
UI에 실행 환경별 테넌트 처리 로직이 필요하지 않아야 합니다.

---

### 5. Tenant를 Future Remote Expansion의 Foundation으로 다룸

테넌트 설계는 다음과 같은 향후 확장을 지원해야 합니다.

- 테넌트별 리포트
- 테넌트별 카테고리 템플릿
- 테넌트 범위의 승인 정책
- 테넌트 범위의 배정 전략
- 현재 카테고리 scope별 설정 권한 표를 넘어서는 추가 테넌트 접근 제한
- 테넌트별 Service Desk 설정

이 기능들을 즉시 모두 구현할 필요는 없지만, 모델이 향후 구현을 막아서는 안 됩니다.

---

## 요약

프로젝트는 Service Desk 설정의 적용 범위를 나타내는 `Tenant`를 도입했습니다.
이는 `Client`를 최상위로 두던 카테고리 모델을 대체하고, 조직 데이터와
Service Desk 동작 설정의 관계를 명확히 합니다.

최종 개념 모델은 다음과 같습니다.

```txt
Company = organization/reference data
Tenant = Service Desk configuration boundary
Category = tenant-scoped behavior configuration
```

카테고리 계층은 다음과 같습니다.

```txt
Tenant -> Main Category -> Sub Category
```

이 결정으로 각 도메인 개념의 역할과 LOCAL/REMOTE의 공통 동작을 명확히 했습니다.
회사 데이터의 재사용성을 유지하면서, Service Desk 설정을 프로덕션 설계에 맞는
설정 모델로 쉽게 설명할 수 있습니다.
