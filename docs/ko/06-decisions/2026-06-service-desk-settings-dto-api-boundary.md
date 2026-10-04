# Service Desk Settings DTO/API Boundary (2026-06)

## 배경

2026년 6월에는 여러 Service Desk 설정을 로컬 mock으로만 처리하던 방식에서
LOCAL/REMOTE API를 구분해 처리하는 구조로 옮겼습니다.

변경 대상인 Service Desk 설정은 다음과 같습니다.

- Tenant
- Category
- Approval Step
- Assignment Rule

다음 참조 데이터도 함께 연결했습니다.

- Company
- Department
- Job Field

이 단계에서는 안전한 LOCAL 데모를 유지하면서, Service Desk 모듈에서
Supabase PostgreSQL 데이터에 접근하는 구조를 적용하고 있었습니다.

요청 처리 구조는 이미 다음과 같이 정해져 있었습니다.

```txt id="wjvgzj"
UI
-> feature API client
-> Next.js Route Handler
-> LOCAL handler or REMOTE/Supabase DTO service
```

6월 작업에서는 이 구조를 Service Desk 설정에 구체적으로 적용했습니다.

---

## 문제

### 1. Database Row, Mock Data, DTO, UI Model이 서로 달라질 수 있음

같은 설정 데이터를 저장하거나 전달하는 형식이 여러 가지였습니다.

```txt id="9jzzs8"
Database Row
Mock Data
DTO
UI Model
Form Value
```

각 형식을 독립적으로 변경하면 서로 맞지 않을 수 있어 유지보수가 어려워집니다.

가능한 문제는 다음과 같습니다.

- DB의 `snake_case` 필드가 UI 모델에 노출
- mock 데이터와 REMOTE 데이터가 서로 다른 응답 형식 반환
- 설정 폼이 DB 구현 세부 사항에 의존
- Route Handler에 데이터 변환 로직이 과도하게 집중
- UI 컴포넌트에서 실행 환경별 분기 필요
- LOCAL 데모와 REMOTE의 동작 차이 발생

따라서 각 데이터 형식의 용도와 변환 위치를 명확히 구분할 필요가 있었습니다.

---

### 2. Route Handler가 너무 커질 수 있음

Next.js Route Handler는 HTTP 요청을 받고 실제 처리를 서비스 함수에 맡겨야 합니다.
도메인 처리 전체를 직접 담당해서는 안 됩니다.

Route Handler가 다음 작업을 모두 직접 처리하면 읽기 어렵고 재사용하기도 어려워집니다.

- 요청 파싱
- 세션 검증
- LOCAL/REMOTE 선택
- SQL 실행
- DB 행 변환
- 업무 규칙 적용
- mock 상태 변경

따라서 Route Handler는 요청 확인과 처리 위임에 집중할 필요가 있었습니다.

---

### 3. Settings는 단순 CRUD Record가 아님

Service Desk 설정은 시스템의 동작을 결정합니다.

예를 들면 다음과 같습니다.

- 카테고리는 티켓 동작을 정의합니다.
- 승인 단계는 승인 검증 흐름을 정의합니다.
- 배정 규칙은 담당자 결정 방식을 정의합니다.
- 테넌트는 Service Desk 설정이 적용되는 범위를 정의합니다.

각 설정을 일반 CRUD 항목으로 취급하면 API 구성은 단순해 보이지만,
UI에서 실제로 설정을 편집하는 방식과 맞지 않습니다.

일부 설정은 개별 레코드보다 트리 구조나 관련 정책 묶음으로 편집하는 것이 더 적합합니다.

---

### 4. Speculative API Path가 유지보수 비용을 증가시킴

구현 중 일부 API 경로는 나중에 유용할 수 있다는 이유만으로 존재했습니다.

현재 UI 흐름에서 사용하지 않는 경로는 다음 문제를 만듭니다.

- 테스트해야 할 범위 증가
- 실제로 지원하지 않는 기능이 있는 것처럼 보임
- Route Handler 구조 검토의 어려움
- LOCAL과 REMOTE의 동작이 달라질 가능성 증가
- 실제 구현 범위보다 넓어 보이는 포트폴리오 설명

따라서 실제 업무 흐름에서 사용하는 API 경로만 유지해야 했습니다.

---

### 5. LOCAL Demo Mutation에는 Server-Side Consistency가 필요했음

LOCAL 데모에서는 포트폴리오를 검토하는 사용자가 Service Desk 설정을 안전하게
수정할 수 있습니다. 수정 결과는 이후 API 호출에도 반영되어야 하므로
React Query 캐시만 바꾸는 것으로는 충분하지 않습니다.

따라서 작은 백엔드처럼 동작하는 서버 측 LOCAL 상태 모듈 또는 mock 핸들러가
필요했습니다. LOCAL과 REMOTE 설정 API는 서로 호환되는 DTO를 반환해야 합니다.

---

## 결정

Service Desk 설정 API가 DTO(데이터 전달 객체)를 기준으로 응답하도록 결정했습니다.

핵심 결정은 다음과 같습니다.

```txt id="96e6bi"
Settings API = workflow-oriented route handlers + domain handlers + LOCAL/REMOTE DTO contract
```

의도한 흐름은 다음과 같습니다.

```txt id="o5sv57"
UI
-> feature API client
-> Next.js Route Handler
-> Service Desk settings API handler
-> domain handler
-> LOCAL handler or REMOTE service/repository
-> DTO response
```

UI는 일정한 DTO 응답 형식을 사용해야 합니다. 데이터가 mock 상태에서 왔는지
Supabase PostgreSQL에서 왔는지에 따라 UI 처리가 달라져서는 안 됩니다.

---

## Scope Rules

### 1. Route Handler를 Thin하게 유지함

Route Handler는 다음 작업에 집중해야 합니다.

- HTTP 메서드 처리
- 요청 파싱
- 공통 세션·사용자 확인과 설정 권한 검사 호출
- 실행 환경 결정
- 해당 도메인 핸들러로 처리 위임
- `NextResponse` 반환

Route Handler가 다음을 직접 담당해서는 안 됩니다.

- SQL 쿼리
- DB 행을 DTO로 변환하는 작업
- 설정 변경 규칙
- LOCAL 데모 상태 변경의 세부 처리
- 도메인별 분기

이렇게 하면 Route Handler를 읽기 쉽고, 향후 백엔드를 별도 서비스로 분리하기도 쉽습니다.

---

### 2. Domain Handler를 Settings Area별로 집중시킴

Service Desk 설정 핸들러는 담당 도메인별로 분리해야 합니다.

권장 도메인은 다음과 같습니다.

```txt id="z3j7x6"
tenant
category
approvalStep
assignmentRule
```

각 도메인 핸들러는 자신이 맡은 설정 영역의 API 동작을 담당해야 합니다.
이렇게 나누면 서로 관련 없는 로직이 하나의 큰 설정 핸들러에 몰리지 않습니다.

---

### 3. Row / DTO / Mapper Boundary를 유지함

DB 행은 저장·조회 결과를 표현하고 API DTO는 응답 형식을 정의합니다.

```txt id="lznuec"
Row -> Mapper -> DTO
```

#### Row

Row 타입은 DB 쿼리 결과의 구조를 표현합니다.

특징:

- SQL에 가깝습니다.
- DB 저장 구조를 기준으로 합니다.
- 보통 `snake_case`를 사용합니다.
- `null`이 허용되는 DB 필드를 포함할 수 있습니다.
- UI 컴포넌트가 직접 사용해서는 안 됩니다.

#### DTO

DTO는 애플리케이션에 제공하는 API 응답 형식을 정의합니다.

특징:

- 프런트엔드가 안정적으로 사용할 수 있습니다.
- 보통 `camelCase`를 사용합니다.
- DB의 필드 이름과 외부 응답 이름을 분리합니다.
- `null`일 수 있는 값을 일관된 형태로 정리합니다.
- LOCAL과 REMOTE 응답 형식을 맞출 수 있습니다.

#### Mapper

Mapper는 DB 행을 DTO로 변환합니다.

책임:

- 필드 이름 변환
- JSON 구조 구성
- `null` 값 정규화
- 응답으로 공개해도 되는 필드 선택
- 필요한 경우 LOCAL/REMOTE 응답 형식 맞추기

---

### 4. LOCAL과 REMOTE Contract를 정렬함

LOCAL과 REMOTE는 애플리케이션에 같은 DTO 응답 형식을 반환해야 합니다.

UI에서 데이터 형식에 따라 다음과 같이 분기할 필요가 없어야 합니다.

```ts id="r4a7mk"
if (runtime === "LOCAL") {
  // use mock shape
} else {
  // use remote shape
}
```

실행 환경별 차이는 API 내부에서 처리해야 합니다.

```txt id="y1vz78"
LOCAL mock/state -> DTO
REMOTE row       -> DTO
```

이렇게 하면 백엔드 구현이 바뀌어도 프런트엔드의 응답 처리를 유지할 수 있습니다.

---

### 5. Generic CRUD보다 Workflow-Oriented Settings API를 선호함

Service Desk 설정 화면에서는 개별 레코드뿐 아니라 서로 연결된 설정을 편집합니다.
카테고리, 승인 단계, 배정 규칙은 묶어서 편집하는 경우가 많습니다.
따라서 가능한 모든 CRUD 경로보다 목록 조회와 설정 트리 저장 API가 더 적합할 수 있습니다.

권장 방향:

```txt id="cz8yv6"
GET  settings data needed by the UI
POST/PUT save the configuration shape used by the UI
```

이렇게 하면 API가 실제 편집 흐름을 지원합니다.

---

### 6. 사용하지 않거나 Speculative한 API Path를 제거함

나중에 유용할 수 있다는 이유만으로 사용하지 않는 API 경로를 유지하지 않습니다.

API 경로는 다음 조건을 만족할 때 유지해야 합니다.

- 현재 UI가 사용합니다.
- 문서에 설명한 업무 흐름을 지원합니다.
- LOCAL과 REMOTE의 동작이 명확합니다.
- 테스트하고 설명할 수 있습니다.

API 경로는 다음 조건에 해당하면 제거하거나 현재 구현 범위에서 제외해야 합니다.

- 현재 UI에서 사용하지 않습니다.
- 실제 사용 없이 예상만으로 CRUD 동작을 제공합니다.
- 데모 개선 없이 경로 수만 늘립니다.
- LOCAL과 REMOTE의 동작이 달라집니다.
- 구현 검토를 어렵게 만듭니다.

이 기준으로 실제 지원 범위를 명확히 하고 유지보수할 수 있습니다.

---

### 7. Server Data를 Client State로 중복 저장하지 않음

Service Desk 설정 데이터는 서버가 관리하는 상태입니다.

이는 Zustand에 중복 저장하지 않고 React Query로 관리해야 합니다.

Zustand는 UI와 실행 중 필요한 상태에 사용할 수 있습니다. 테넌트 목록, 카테고리 트리,
승인 단계, 배정 규칙 같은 설정 데이터는 React Query로 조회·관리해야 합니다.

규칙은 다음과 같습니다.

```txt id="m4d2am"
Server data -> React Query
UI state    -> local state or Zustand only when needed
```

---

### 8. Local Demo State를 Server-Side Mutable State로 취급함

LOCAL 데모는 mock 상태를 사용할 수 있지만 서버 데이터처럼 동작해야 합니다.
설정을 변경할 때 React Query 캐시와 함께 서버 측 LOCAL 상태 모듈도 갱신해야 합니다.

이를 통해 다음을 지원할 수 있습니다.

- 반복할 수 있는 데모 동작
- 검토자가 안전하게 설정을 변경하는 흐름
- 초기화할 수 있는 LOCAL 상태
- 실제와 유사한 API 요청 흐름
- LOCAL과 REMOTE의 동작 일치

---

## 권한 보충 (2026-07)

DTO/API 처리 과정에는 카테고리 범위의 설정 권한 검사도 포함됩니다.
이 검사는 LOCAL/REMOTE를 선택하기 전에 공통으로 적용합니다.
UI 표시 조건으로만 처리하거나 두 실행 환경에서 각각 다르게 판단하지 않습니다.

```txt id="settings-authorization-api-flow"
Route Handler
-> 인증된 JWT access level >= ADMIN (9) 검사
-> effective canonical AppUser 결정
-> 대상 Category -> Tenant -> Company context 결정
-> manage / read / none capability 적용
-> LOCAL handler 또는 REMOTE service로 위임
-> filter된 DTO response 반환
```

서버가 확인한 사용자 정보(canonical principal)의 `permission`, `userScope`,
`companyId`를 권한 판단에 사용합니다. 요청 본문·쿼리의 관리자 유형, 테넌트·회사
주장 값, 화면에서 선택한 테넌트, `role`, `dataScope`, 클라이언트 상태만으로는
권한이 생기지 않습니다. Impersonation 중에는 현재 작업 사용자(effective user)의
리소스 권한을 적용하고, 원래 사용자와 현재 작업 사용자 정보는 감사에 사용할 수
있도록 유지합니다.

조회 API는 권한이 `none`인 리소스를 응답에서 제외해야 합니다. 변경 API는
저장된 카테고리·테넌트 관계를 먼저 불러온 뒤 `manage` 권한을 적용합니다.
읽기 전용 사용자나 접근 범위를 벗어난 사용자에게는 `403`을 반환합니다.
페이지는 UX를 위해 Settings Home으로 이동할 수 있지만, API는 권한 없는 변경
요청을 다른 페이지로 보내지 않습니다.

Approval Step과 Assignment Rule DTO는 테넌트 권한을 중복 저장하지 않습니다.
권한 판단에 사용하는 관계는 다음과 같습니다.

```txt id="settings-dto-authorization-context"
Approval Step / Assignment Rule
-> Category
-> Tenant
-> Company
```

카테고리 수정 DTO 검증에서는 테넌트, 메인 카테고리의 scope, 테넌트·scope를
넘는 서브카테고리 부모 이동을 변경 불가능한 항목으로 다룹니다.
서버는 수정·비활성화 시 저장된 상태에서, 서브카테고리에서는 저장된 부모에서
권한 판단 맥락을 구합니다. 요청 payload의 맥락만 신뢰하지 않습니다.

담당자 후보 조회는 카테고리를 기준으로 하며 승인자와 작업자 조회를 구분합니다.
승인자 후보는 해당 카테고리 테넌트의 회사에서, 작업자 후보는 카테고리에 따라
허용된 회사에서 결정합니다. 회사 필터와 함께 호출자의 리소스 권한도 검사합니다.
읽기 전용 권한으로 현재 참조된 담당자의 표시 정보는 반환할 수 있지만,
직원 디렉터리 검색 권한을 부여하지는 않습니다.

---

## 정렬한 내용

### 1. Settings API Responsibility

Service Desk 설정 API의 요청 처리를 다음 계층으로 나눴습니다.

```txt id="ywhp0s"
Route Handler
-> Service Desk settings API handler
-> domain-specific handler
-> LOCAL or REMOTE implementation
```

이 구조로 코드를 읽기가 쉬워지고, 관련 없는 설정 로직이 한 파일에 섞일 위험이 줄었습니다.

---

### 2. Tenant API와 DTO 방향

Tenant는 Service Desk 설정의 적용 범위를 나타냅니다.
테넌트 API는 원본 회사·테넌트 DB 행 대신 애플리케이션에서 사용할 DTO를 반환해야 했습니다.

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

이렇게 하면 테넌트 동작과 회사 기준 데이터를 구분해서 유지할 수 있습니다.

---

### 3. Category Tree API 방향

카테고리 설정은 트리 구조입니다. 카테고리는 테넌트에 속하며 부모·자식 관계도 가질 수
있으므로, 단순히 개별 레코드를 나열하는 모델만으로는 충분하지 않습니다.

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

`PORTAL`/`INTERNAL`은 업무 흐름이 적용되는 scope입니다. 메인·서브카테고리는
계층 구분이므로 `CategoryScope`의 별도 값으로 표현하면 안 됩니다.
서브카테고리는 부모 메인 카테고리의 테넌트와 scope를 상속합니다.

API는 UI가 여러 개별 CRUD 호출을 조정하게 하기보다 카테고리 트리 편집 방식을 지원해야 합니다.

---

### 4. Approval Step API 방향

승인 단계는 카테고리에 속한 세부 설정입니다.
설정 UI와 승인 전략에서 사용할 수 있는 DTO로 반환해야 합니다.

개념적 DTO:

```ts id="r80lkg"
type ApprovalStepDto = {
  id: string;
  categoryId: string;
  index: number;
  assignee: ApprovalAssignee;
};
```

과거 티켓의 승인 동작이 티켓·액션·이력 기록에 보존된다면,
카테고리 설정 수정 시 승인 단계 설정을 교체할 수 있습니다.

---

### 5. Assignment Rule API 방향

배정 규칙은 카테고리의 현재 작업자 배정 방식을 정의합니다.

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

현재 배정 모델은 그룹을 사용하며 별도의 `ruleType`이 없습니다.

배정 규칙 변경은 이후 배정 또는 새로 평가하는 배정에 적용해야 합니다.
과거 티켓의 배정 기록을 변경 사실이 드러나지 않게 다시 써서는 안 됩니다.

---

### 6. Reference Data DTO 방향

회사, 부서, 직무 데이터는 Service Desk 설정에 사용하는 참조 데이터입니다.
이 데이터도 DTO로 전달해야 합니다.

참조 데이터 사용 예:

```txt id="kwac2p"
Company     -> tenant selection and tenant creation
Department  -> approval/assignment configuration
Job Field   -> approval/assignment configuration
```

설정 UI는 원본 DB 행 대신 응답으로 공개해도 되는 DTO를 사용해야 합니다.

---

### 7. API Surface Pruning

설정 API가 제공하는 작업을 실제 UI 흐름에 맞췄습니다.
현재 동작을 지원하지 않는 미사용 CRUD 경로와 예상만으로 만든 경로는 제거해야 합니다.
이 기준을 따르면 향후 확장을 위해서만 존재하는 미검증 경로를 남기지 않을 수 있습니다.
향후 확장 계획은 사용하지 않는 경로 파일 대신 문서로 명시해야 합니다.

---

## 결과 영향

### 긍정적 영향

- 서버와 클라이언트의 담당 역할 명확화
- 설정 API 응답 형식 안정화
- LOCAL과 REMOTE 동작의 일관성 향상
- UI에 DB 스키마가 노출될 위험 감소
- 실제 지원 범위에 맞는 API 구성
- Service Desk 설정 로직의 유지보수 편의 향상
- 향후 백엔드 서비스 분리 용이
- 프로덕션 설계에 맞는 구조를 포트폴리오에서 설명하기 쉬움
- Route Handler가 과도하게 커질 위험 감소
- mock 기반 LOCAL 데모의 설정 변경을 실제와 유사하게 처리

---

### 부정적 영향 / 트레이드오프

- Row, DTO, Mapper, Repository, Service, Handler별 파일 필요
- 데이터 변환 로직 구현 비용 증가
- 작은 데모에서도 단순 CRUD보다 많은 구조가 필요할 수 있음
- 향후 경로 추가 시 실제 사용 여부에 따른 API 정리 필요
- LOCAL과 REMOTE의 동작 일치를 위한 테스트 필요
- 설정 저장이 업무 흐름을 따르므로 일반 CRUD보다 범용성이 낮아 보일 수 있음

---

## Implementation Notes

### Recommended Server Data Structure

REMOTE 설정 데이터 접근을 위한 권장 구조:

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

파일 구조는 바뀔 수 있지만 각 계층이 담당하는 역할은 안정적으로 유지해야 합니다.

---

### Recommended API Handler Structure

권장 Route·도메인 핸들러 구조:

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

Route 코드는 요청 확인과 처리 위임에 집중해야 합니다.
도메인 핸들러는 Service Desk 설정 동작을 담당해야 합니다.

---

### Recommended Local Demo Structure

LOCAL 데모 설정 처리는 공통 모듈에서 관리해야 합니다.

예시 방향:

```txt id="tf8zk6"
src/server/serviceDesk/settings/
  localState.ts
  tenantLocalHandler.ts
  categoryLocalHandler.ts
  approvalStepLocalHandler.ts
  assignmentRuleLocalHandler.ts
```

경로는 달라질 수 있지만 LOCAL 상태 변경 로직이 UI 컴포넌트 안에 있어서는 안 됩니다.

---

### Recommended API Surface Policy

실제 업무 흐름에서 사용하는 경로만 유지합니다.

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

이 결정은 다음 문서에 영향을 줍니다.

```txt id="r8k14k"
docs/en/02-architecture/database-strategy.md
docs/en/02-architecture/routing-strategy.md
docs/en/05-data-fetching/react-query-strategy.md
docs/en/08-dev-strategy/service-desk-implementation-strategy.md
docs/en/08-dev-strategy/decision-log/2026-05-database-role-and-access-strategy.md
docs/en/README.md
```

5월의 DB 역할·접근 결정 기록은 다시 작성할 필요가 없습니다.
이 6월 결정 기록은 기존 방향을 Service Desk Settings에 구체적으로 적용한 기록으로 다룹니다.

---

## 후속 운영 정책

### 1. Route Handler를 Orchestration Boundary로 유지함

향후 Service Desk 설정의 Route 파일에 도메인 로직을 직접 쌓아두면 안 됩니다.
Route Handler는 서버 측 핸들러나 서비스에 처리를 맡겨야 합니다.

---

### 2. Database Row가 바뀌어도 DTO는 안정적으로 유지함

DB 스키마는 바뀔 수 있습니다. 가능한 경우 DTO 형식을 유지해
UI 컴포넌트와 기능 API 클라이언트를 불필요하게 변경하지 않도록 해야 합니다.

---

### 3. LOCAL과 REMOTE Behavior를 Contract-Compatible하게 유지함

새 설정 API는 LOCAL과 REMOTE에서 같은 응답 형식을 반환하는 방법을 정의해야 합니다.
UI가 LOCAL mock과 REMOTE DB의 데이터 형식 차이에 따라 분기하게 하면 안 됩니다.

같은 규칙을 권한 판단과 응답 필터링에도 적용합니다. 같은 현재 작업 사용자에게
LOCAL 상태 모듈과 REMOTE Repository가 서로 다른 테넌트·카테고리를 보여주거나
서로 다른 변경 작업을 허용하면 안 됩니다.

---

### 4. Workflow가 요구할 때만 API Path를 추가함

나중에 유용할 수 있다는 이유만으로 중첩 CRUD 경로를 추가하지 않습니다.
새 경로는 다음 조건을 갖춰야 합니다.

- 현재 업무 흐름
- 명확한 호출 주체
- 명확한 DTO 응답 형식
- 명확한 LOCAL 구현
- 명확한 REMOTE 구현 또는 문서화한 미구현 동작

---

### 5. Settings가 변경될 때 Historical Meaning을 보존함

설정 변경으로 과거 티켓 기록의 의미를 드러나지 않게 바꾸어서는 안 됩니다.
카테고리, 승인, 배정, 테넌트 설정이 바뀌어도 기존 티켓 액션과 이력을 이해할 수 있어야 합니다.

---

### 6. Settings를 Generic Admin CRUD가 아니라 Configuration으로 유지함

Service Desk Settings는 계속 behavior-defining configuration으로 취급해야 합니다.

이는 API design이 generic CRUD completeness보다 workflow clarity를 우선해야 한다는 뜻입니다.

---

## 요약

Service Desk settings 구현은 더 명시적인 DTO/API boundary를 도입했습니다.

핵심 결정은 다음과 같습니다.

```txt id="z6tjy5"
Settings API = workflow-oriented route handlers + domain handlers + LOCAL/REMOTE DTO contract
```

UI는 일정한 DTO 형식으로 응답을 받습니다. Route Handler는 요청 확인과 처리 위임에
집중하고, 도메인 핸들러는 설정별 동작을 담당합니다.

REMOTE는 Row·Mapper·DTO로 데이터 조회와 응답 변환을 구분합니다.
LOCAL 데모는 서버에서 변경 가능한 mock 상태를 사용하면서 같은 API 응답 형식과
동작 규칙을 유지합니다. 사용하지 않는 API 경로는 향후 사용 가능성만으로
남겨두지 않고 제거해야 합니다.

이 구조로 Service Desk Settings를 프로덕션 설계에 맞게 유지하고,
동작을 쉽게 설명하며 이후 기능을 안전하게 확장할 수 있습니다.
