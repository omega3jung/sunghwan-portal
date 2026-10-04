# Category Strategy

## 목표

Category는 Service Desk 티켓의 처리 방식을 결정하는 핵심 설정입니다.

카테고리는 다음에 영향을 줍니다.

- 요청 분류
- 기본 우선순위
- 기본 위험도
- 기본 SLA 일수와 기한 초기값
- 승인 단계 결정
- 배정 규칙 결정
- 요청자 수정 시 담당자 유지·재결정 정책

현재 카테고리 모델은 Tenant별로 구분하며 Service Desk 설정 구조를 따릅니다.

---

## 핵심 개념

```txt
Tenant -> Main Category -> Sub Category -> Ticket behavior
```

`Company`는 조직 참조 데이터입니다. `Tenant`는 Service Desk 설정을 구분하는 단위이며,
카테고리는 Tenant에 속합니다.

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

`Client -> Main Category -> Sub Category` 같은 과거 용어는 현재 모델이 아닙니다.
현재 설정은 Tenant별로 구분합니다.

---

## Hierarchy

### Tenant

카테고리 트리는 Tenant의 Service Desk 업무 설정에 속합니다. 여기서 "속한다"는
설정을 Tenant별로 구분한다는 뜻이며, 한 사용자가 모든 리소스를 관리한다는 의미는 아닙니다.
실제 조회·관리 권한은 Tenant 종류, 카테고리 scope, 설정 리소스, 인증된 사용자 정보로 결정합니다.

### Main Category

상위 카테고리는 필수 기본값을 제공합니다.

- scope
- priority
- risk level
- SLA days
- active state
- display order

### Sub Category

하위 카테고리는 상위 카테고리를 세분화합니다. 기본 우선순위, 위험도, SLA 일수에
자체 값을 설정할 수 있습니다. 하위 카테고리에 값이 없으면 상위 카테고리 값을 사용합니다.

---

## Scope

상위 카테고리는 다음 scope union을 사용합니다.

```ts
type CategoryScope = "PORTAL" | "INTERNAL";
```

| Scope | Meaning |
| --- | --- |
| `PORTAL` | 포털 요청자의 업무 흐름에서 사용할 수 있는 카테고리 |
| `INTERNAL` | 내부 Service Desk 업무용 카테고리 |

하위 카테고리의 조회 권한과 담당자 결정에는 상위 카테고리의 scope를 적용합니다.

---

## Category Settings Authorization

Owner Admin은 인증된 사용자 정보의 `permission >= ADMIN`, `userScope = INTERNAL`로
식별합니다. Tenant Admin은 `permission >= ADMIN`, `userScope = CLIENT`로 식별하며,
현재 권한 판단 대상 사용자의 `companyId -> Tenant.companyId` 관계로 Tenant를 결정합니다.

| Target | Owner Admin | 동일 company Tenant Admin | 다른 Tenant Admin |
| --- | --- | --- | --- |
| Owner Tenant, `INTERNAL` 또는 `PORTAL` | manage | none | none |
| Customer Tenant, `INTERNAL` | none | manage | none |
| Customer Tenant, `PORTAL` | manage | read | none |

고객 `INTERNAL` 카테고리에는 Owner Admin의 지원·조회 예외가 없습니다. Owner Admin과
Tenant Admin은 상하 관계의 역할이 아니며, 공통 설정 정책이 리소스별 권한을 결정합니다.

상위 카테고리 생성도 같은 접근 조건을 따릅니다.

- Owner Admin은 Owner Tenant에서 두 scope를 모두 생성할 수 있습니다.
- Owner Admin은 customer Tenant에서 `PORTAL`만 생성할 수 있습니다.
- Tenant Admin은 자신의 customer Tenant에서 `INTERNAL`만 생성할 수 있습니다.

조회 API는 이 정책에 따라 카테고리 트리를 필터링합니다.
클라이언트가 선택한 Tenant나 scope는 권한을 부여하지 않습니다.

---

## Immutable Boundary

생성 후에는 다음 값을 다른 Tenant나 scope로 이동할 수 없습니다.

- 카테고리 Tenant
- 상위 카테고리 scope
- Tenant 또는 scope를 넘는 하위 카테고리의 상위 카테고리 변경

하위 카테고리는 상위 카테고리의 Tenant와 scope를 모두 상속하며,
독립적인 scope 관리 권한은 갖지 않습니다.

수정·비활성화는 권한 검사 전에 기존 카테고리를 불러옵니다. 생성 시에는 대상 Tenant와
요청한 scope를 서버에서 검증합니다. 하위 카테고리 생성·수정은 저장된 상위 카테고리를
불러와 그 관계에서 접근 범위를 결정합니다. 요청의 `tenantId`, `scope`, `parentId`는
권한 판단의 근거가 아닙니다.

다른 scope가 필요하면 기존 카테고리를 비활성화하고 새 카테고리를 생성합니다.
카테고리 제거는 행을 삭제하지 않고 `active = false`로 처리해 티켓과 이력의 참조를 보존합니다.

---

## Default Resolution

카테고리 기본값은 선택한 하위 카테고리 값을 먼저 확인하고, 없으면 상위 카테고리 값을 사용합니다.

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

폼이나 액션 요청에 티켓별 값을 넣을 수 있지만, 최종 업무 처리 결과는 서버가 검증합니다.

---

## Active Policy

과거 티켓의 참조를 보존하도록 카테고리는 삭제 대신 비활성화합니다.

```txt
active = false
```

동작:

- 새 상위·하위 카테고리는 항상 비활성 상태로 저장합니다.
- 활성화하려면 적용할 배정 규칙에 활성 Job Field 또는 활성 Employee 참조가 있어야 합니다.
- 비활성 카테고리는 새 요청자의 업무 흐름에서 선택할 수 없어야 합니다.
- 비활성 카테고리를 참조하는 기존 티켓은 계속 읽을 수 있습니다.
- 필요한 설정을 계속 해석할 수 있으면 기존 `Approval` 업무 흐름은 다음 승인 또는
  작업자 배정으로 진행할 수 있습니다.
- 카테고리 설정이 바뀌어도 이력은 다시 쓰지 않습니다.

상위·하위 카테고리의 활성 플래그는 각각 저장합니다. 하위 카테고리는 두 플래그가
모두 활성일 때만 실제로 사용할 수 있습니다.

```ts
effectiveActive = mainCategory.active && subCategory.active;
```

상위 카테고리를 비활성화해도 하위 카테고리의 저장된 플래그를 덮어쓰면 안 됩니다.
활성화는 설정의 준비 여부만 확인합니다. 실행 시 담당자 결정에서는 실제 작업자와
모든 회사·Tenant 자격 조건을 다시 검증합니다.

---

## Category and Ticket Creation

티켓 생성 시 선택한 카테고리는 다음 처리에 사용합니다.

- 우선순위·위험도 기본값 결정
- UI가 적용하는 경우 카테고리 SLA 일수에 따른 기한 초기값 설정
- 승인 단계 조회
- 작업자 배정 조회

티켓 서비스가 최종 업무 상태를 결정합니다.

- 승인이 필요하면 `Approval`
- 작업자를 바로 결정하면 `Assigned`

---

## Category and Approval

승인 단계는 상위 카테고리에 설정합니다. 선택한 하위 카테고리는 티켓을 분류하고,
승인 흐름은 해당 하위 카테고리의 상위 카테고리에서 결정합니다.

```txt
Ticket submitted
-> selected category
-> resolve parent/main category
-> approval steps on main category resolved in order
-> current approval assignees stored on ticket
-> ticket enters Approval when needed
```

승인 설정은 이후의 승인자 결정에 영향을 주며, 이미 진행 중인 티켓을 자동으로 바꾸지
않습니다. 다만 `Approval` 티켓에 영향을 주는 트리 변경은 영향을 확인한 뒤 강제 적용으로
최초 담당자 결정부터 명시적으로 재시작하고, `ROUTING_RESET` 이력 추가까지 하나의
트랜잭션으로 처리할 수 있습니다.

---

## Category and Assignment

하위 카테고리에 자체 배정 규칙을 설정할 수 있습니다.
선택한 하위 카테고리에 배정 규칙이 없으면 상위 카테고리 규칙을 사용합니다.

```txt
Ticket ready for work
-> selected category
-> selected subcategory assignment rule, when present
-> otherwise parent/main category assignment rule
-> current work assignees stored on ticket
-> ticket enters Assigned
```

현재 배정 규칙은 직무 ID와 직원 username으로 구성한 그룹을 사용합니다.
별도의 `ruleType` 필드를 사용하지 않습니다.

상위 규칙 사용 여부는 규칙의 존재 여부로 결정합니다. 하위 카테고리 자체 규칙의 참조가
나중에 비활성화되면 활성화와 담당자 결정은 해당 자체 규칙을 기준으로 실패합니다.
상위 규칙으로 자동 전환하지 않습니다.

---

## Category and Requester Update

요청자 수정은 작업이 시작되기 전의 다음 상태에서만 허용합니다.

```txt
Approval
Assigned
```

카테고리 변경은 승인자·작업자 재결정을 유발합니다.

요청자가 카테고리를 변경하면 티켓 수정 서비스는 다음을 수행해야 합니다.

- 카테고리 선택 재검증
- 필요한 경우 우선순위·위험도 기본값 재계산
- 새 카테고리의 기본 SLA 일수에서 최소 기한 재평가
- 승인자 또는 작업자 결정 재평가
- `ROUTING_RESET` 기록

다음 기한은 현재 기한, 제출한 기한, 새 카테고리 최소 기한 중 가장 늦은 값이어야 합니다.
카테고리 변경으로 기한을 더 이른 날짜로 당기면
안 됩니다.

카테고리가 바뀌지 않고 담당자 결정에 영향을 주지 않는 필드만 바뀌면 담당자를 유지할 수 있고,
`ROUTING_PRESERVED`가 기록됩니다.

---

## UI Responsibilities

UI가 해야 할 일은 다음과 같습니다.

- Tenant별 카테고리 트리 표시
- 설정 access가 `none`인 카테고리 트리 숨김
- `read` 카테고리 트리를 읽기 전용으로 명확히 표시하고 관리 주체 안내
- 새 업무 흐름에는 선택 가능한 활성 카테고리만 표시
- 기존 티켓에는 비활성 카테고리 표시 보존
- 우선순위, 위험도, 기한에 유용한 기본값 적용
- 요청자 수정이 담당자를 다시 결정할 수 있음을 사용자에게 경고

UI는 다음을 하면 안 됩니다.

- 최종 담당자 결정 결과를 클라이언트에서 만들어내기
- 카테고리 변경의 영향을 일반 필드 수정처럼 숨기기
- 카테고리 설정을 클라이언트에만 있는 상태로 취급하기
- 편집 버튼을 숨기는 것으로 권한 검사를 대신하기

---

## Settings Change Policy

카테고리 설정은 이후 업무 처리에 적용할 동작을 정의합니다.

| Change | Effect |
| --- | --- |
| 상위·하위 카테고리 이름 변경 | 이후 화면은 새 이름 사용; 기존 이력은 기록된 상태 유지 |
| 기본값 변경 | 이후 티켓과 담당자 결정은 변경한 기본값 사용 |
| 카테고리 비활성화 | 영향 확인; 신규 선택 중단; 기존 상태·담당자 결정 결과·이력 보존 |
| 승인 설정 변경 | 이후 승인자 결정은 변경한 설정 사용; 강제 적용은 영향받는 `Approval` 티켓을 명시적으로 재시작 가능 |
| 배정 설정 변경 | 현재 작업자 보존; 이후 작업자 결정은 변경한 설정 사용 |

일반적인 설정 변경은 기존 티켓의 상태와 담당자 결정 결과를 유지합니다. 관리자가 확인한
Approval Step 강제 적용은 통제된 예외입니다. 설정 검증·저장, 영향받는 `Approval`
티켓의 최초 담당자 결정 재시작, `APPROVAL_CONFIGURATION_CHANGED`를 reason으로
하는 `ROUTING_RESET` 추가를 하나의 원자적 작업으로 처리합니다. 기존 이력은
다시 쓰지 않습니다.

---

## Deferred Scope

현재 카테고리 전략은 다음을 구현된 동작으로 설명하지 않습니다.

- 설정 버전 발행
- 예약된 카테고리 변경
- 과거 카테고리 스냅샷 전체 표시
- Tenant별 카테고리 관리 절차
- 고급 작업 배정 부하 분산
- Tenant별 SLA 달력

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

현재 카테고리 모델은 Tenant별로 구분합니다.

```txt
Tenant -> Main Category -> Sub Category
```

상위 카테고리는 필수 기본값과 `PORTAL`/`INTERNAL` scope를 제공합니다. 하위 카테고리는
기본값을 세분화하고 상위의 Tenant와 scope를 상속합니다. 공통 설정 정책은 Tenant별
업무 설정 구분과 실제 관리 권한을 분리합니다. 승인자는 상위 카테고리에서 결정하고,
작업자는 하위 자체 규칙이 있으면 적용하며 없을 때 상위 규칙을 사용합니다.
카테고리 변경은 티켓의 담당자를 다시 결정합니다. 설정 변경은 기존 티켓을 자동으로
다시 쓰지 않고 이후 업무 처리의 담당자 결정에 영향을 줍니다.
