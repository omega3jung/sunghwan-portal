# Boolean Capability API 명명 (2026-08)

## Context

프로젝트의 여러 layer에 걸쳐 boolean 이름이 누적되어 있었다.

- feature component prop
- permission 및 capability projection
- hook 및 context
- form 및 query state
- domain state
- UI primitive prop
- external library 및 API contract

각각의 값은 이해할 수 있었지만 이름에서 그 책임이 항상 드러나지는 않았다.

모호하거나 presentation 중심인 feature API의 예에는 다음과 같은 pattern이 있었다.

```ts
isApproveDisabled
isAssignDisabled
isNotEditable
hideWhenUnauthorized
```

이 이름은 다음 요소를 결합한 후 자주 나타났다.

- authorization
- ticket status
- ownership
- loading state
- validation state
- presentation behavior

이 문제는 shadcn/Base UI migration 이후 진행한 8월 refactoring 작업에서 더 분명해졌다.

이 refactoring의 목표는 component boundary를 개선하고, 불필요한 client boundary를
제거하고, deprecated pattern을 교체하고, 더 광범위한 Vitest 및 Storybook coverage를
추가하기 전에 public component API를 안정화하는 것이었다.

Naming 논의는 7월에 시작되었지만 application 전체의 capability API 작업은 2026년
8월 1일에 적용되었다. 따라서 이 결정은 8월 결정으로 기록한다.

---

## Problem

### 1. 부정형 feature prop이 capability 대신 presentation을 노출함

Feature-level component가 다음을 받는 경우를 살펴본다.

```tsx
<TicketActions isApproveDisabled={...} />
```

이 API는 approval을 사용할 수 없는 이유를 설명하지 않는다.

Prop은 다음을 나타낼 수 있다.

- permission 없음
- 잘못된 ticket status
- actor가 current approver가 아님
- mutation pending
- 의도적인 read-only mode

API가 application capability 대신 최종 button presentation을 설명한다.

---

### 2. 반복적인 부정으로 call site를 읽기 어려워짐

부정형 prop은 다음과 같은 pattern을 자주 만들었다.

```tsx
<TicketActions
  isApproveDisabled={!canApprove}
  isAssignDisabled={!canAssign}
/>
```

또는 다음과 같은 이중 부정을 만들었다.

```ts
!isNotEditable
!hideWhenUnauthorized
```

이는 review cost를 높이고 boolean mistake가 발생하기 쉽게 만든다.

---

### 3. Capability, state, presentation이 혼합됨

프로젝트에는 다음을 구분할 필요가 있었다.

```txt
actor가 무엇을 할 수 있는가
현재 무엇이 참인가
UI primitive가 어떻게 render되는가
```

이러한 구분이 없으면 `isDisabled`, `isAllowed`, `canOpen`, `hasPermission`과 같은 이름이
application 전체에서 일관되지 않게 사용될 수 있다.

---

### 4. 무조건적인 positive-boolean rule 역시 잘못됨

모든 boolean을 `can*`으로 바꾸어서는 안 된다.

다음과 같은 예는 이미 의미 있는 state 또는 presentation을 설명한다.

```ts
isLoading
isSaving
isPending
isDirty
isOpen
isClosed
isRejected
hasError
disabled
readOnly
```

`isBlocked` 또는 `isRejected`와 같은 negative domain state 역시 가장 정확한 이름일 수
있다.

프로젝트에는 기계적인 rename이 아닌 책임에 기반한 rule이 필요했다.

---

### 5. UI capability와 server authorization을 혼동해서는 안 됨

`canApprove` prop은 component semantic을 개선할 수 있지만 여전히 client/application
projection이다.

이는 다음에 대한 server validation을 대체할 수 없다.

- authenticated identity
- effective impersonated identity
- Tenant 및 company scope
- ticket status
- approval step
- current assignee relationship
- stored resource context

Naming 결정은 이 security boundary를 보존해야 했다.

---

## Options Considered

### Option 1 — Feature component 전반에서 presentation 중심 prop 유지

```tsx
<TicketActions
  approveDisabled={...}
  assignDisabled={...}
/>
```

#### Advantages

- button prop에 직접 대응함
- refactoring 최소화
- component 내부가 단순하게 유지됨

#### Disadvantages

- public API가 rendering detail을 노출함
- caller가 부정을 반복함
- permission, workflow, loading concern이 혼합됨
- 다른 presentation으로 component를 재사용하기 어려워짐

Feature 및 application component API에는 이 option을 적용하지 않기로 했다.

---

### Option 2 — 모든 boolean을 positive `can*` 이름으로 변경

```ts
canLoad
canBePending
canHaveError
```

#### Advantages

- 표면적으로 일관됨
- 많은 부정형 이름을 제거함

#### Disadvantages

- capability와 state의 구분을 없앰
- 부자연스러운 이름을 만듦
- React Query, React Hook Form, HTML, DTO, domain vocabulary와 충돌함
- 가치 없이 external contract를 변경함

이 option은 기각했다.

---

### Option 3 — 책임에 따라 boolean 분류

```txt
Capability
State
Presence
Presentation
Domain state
External contract
```

그런 다음 각 category에 맞는 naming rule을 적용한다.

#### Advantages

- semantic 차이를 보존함
- public component API를 개선함
- 불필요한 contract change를 방지함
- 점진적인 audit 및 refactoring을 지원함
- server/client responsibility boundary와 일치함

#### Disadvantages

- automated replacement가 아닌 판단이 필요함
- 일부 값은 분류 전에 논의가 필요함
- 혼합된 boolean을 capability와 state로 분해해야 할 수 있음

이 option을 선택했다.

---

## Decision

Boolean의 이름을 정하기 전에 먼저 분류한다.

다음 규칙을 사용한다.

```txt
Feature/application capability
-> can*

Runtime 또는 domain state
-> is*

Presence
-> has*

HTML/UI presentation
-> disabled / readOnly / hidden

External contract
-> contract에 확립된 이름 유지
```

핵심 구분은 다음과 같다.

```txt
Capability
-> operation을 수행할 수 있는지 여부

State
-> 현재 참인 것

Presentation
-> UI element의 동작 또는 표시 방식
```

---

## Capability API Rule

Feature 및 application component는 positive capability prop을 받아야 한다.

다음을 선호한다.

```tsx
<TicketActions
  canApprove={capabilities.canApprove}
  canAssign={capabilities.canAssign}
  canReject={capabilities.canReject}
/>
```

다음은 피한다.

```tsx
<TicketActions
  isApproveDisabled={!capabilities.canApprove}
  isAssignDisabled={!capabilities.canAssign}
  isRejectDisabled={!capabilities.canReject}
/>
```

Capability 이름은 구체적인 operation을 설명해야 한다.

```ts
canCreate
canUpdate
canSave
canSubmit
canApprove
canDecline
canAssign
canAssignSelf
canAdjust
canReject
canMerge
canReopen
canResubmit
canCancel
canStartWork
canManageCategories
canManageApprovalSteps
canManageAssignmentRules
```

구체적인 operation이 있으면 지나치게 포괄적인 이름을 피한다.

```ts
canDo
canUse
canChange
canProcess
canInteract
```

---

## UI Primitive Boundary

Feature component는 UI primitive boundary에서 capability를 presentation state로 변환한다.

```tsx
function TicketApproveButton({
  canApprove,
  isPending,
}: {
  canApprove: boolean;
  isPending: boolean;
}) {
  return (
    <Button disabled={!canApprove || isPending}>
      Approve
    </Button>
  );
}
```

이를 통해 책임을 명확하게 드러낸다.

```txt
canApprove
-> application capability

isPending
-> mutation state

disabled
-> button presentation
```

`disabled`, `readOnly`, `hidden`은 UI primitive와 presentation 중심 component에서 계속
유효한 이름이다.

---

## State 및 Presence Rule

현재 condition에는 `is*`를 사용한다.

```ts
isLoading
isSaving
isPending
isDirty
isValid
isOpen
isClosed
isArchived
isRejected
isBlocked
```

Boolean이 presence를 나타내면 `has*`를 사용한다.

```ts
hasError
hasSelection
hasAttachments
hasActiveDraft
hasNextApprovalStep
hasMultipleAssignees
```

정확한 domain state를 부정형이라는 이유만으로 rename하지 않는다.

```ts
isRejected
isBlocked
isBanned
```

이는 negative capability API가 아니라 의미 있는 business condition이다.

---

## Capability Composition

Capability는 permission, workflow state, ownership, runtime state를 결합할 수 있다.

예:

```ts
const canSave =
  canManage &&
  isDirty &&
  isValid &&
  !isSaving;
```

최종 capability는 가장 가까운 적절한 application policy, hook, context 또는 feature
container에서 계산해야 한다.

Component가 JSX에서 동일한 business condition을 반복해서 재구성해서는 안 된다.

하지만 이 결정이 모든 boolean에 새로운 policy layer를 만들도록 요구하지는 않는다.
이미 적합한 기존 boundary를 사용해야 한다.

---

## Server Authorization Boundary

Positive capability naming은 UI 및 application API 개선이다.

Authorization mechanism은 아니다.

```txt
UI can*
-> discoverability와 interaction을 제어

Server authorization
-> operation의 실제 허용 여부를 검증
```

Server는 계속 다음의 authority다.

- authentication
- effective user resolution
- impersonation rule
- permission
- Tenant 및 company scope
- ticket visibility
- current status
- requester, approver 또는 assignee relationship
- command payload
- stored resource relationship

위조된 `canApprove = true` 값으로 unauthorized approval이 성공해서는 안 된다.

---

## Refactoring Scope

다음 영역에 convention을 우선 적용한다.

1. Service Desk feature component prop
2. Settings 및 Ticket feature hook return value
3. application policy 및 permission projection
4. operation을 노출하는 context value
5. application-level composed component API
6. 해당 API를 사용하는 story 및 test

일반적으로 가치가 높은 candidate는 다음과 같다.

- negative capability prop
- 반복적으로 `!`와 함께 전달되는 public prop
- double negative
- 실제로 operation을 나타내는 `is*Disabled` 값
- 더 구체적으로 만들 수 있는 광범위한 `canUse` 값
- component call site에 중복된 workflow condition

---

## Exclusions

다음은 기계적으로 rename하지 않는다.

- HTML 및 Base UI primitive prop
- React Query state
- React Hook Form state
- DOM 및 third-party library contract
- DTO field
- database column
- API payload
- persisted domain contract
- 정확한 negative domain state
- compatibility cost가 semantic benefit보다 큰 이름

일반적으로 다음 예는 유지한다.

```ts
disabled
readOnly
hidden
isLoading
isPending
isDirty
isRejected
active
```

External contract naming은 explicit contract migration을 통해서만 변경해야 한다.

---

## Migration Procedure

### 1. Audit

다음과 같은 candidate를 검색한다.

```txt
is*Disabled
isNot*
notAllowed
hideIfUnauthorized
disabled={!can...}
반복적인 부정과 함께 전달되는 public boolean prop
```

---

### 2. Classify

각 candidate를 다음 중 하나로 분류한다.

```txt
CAPABILITY
STATE
PRESENCE
PRESENTATION
DOMAIN_STATE
EXTERNAL_CONTRACT
```

책임이 명확해지기 전에는 rename하지 않는다.

---

### 3. 전체 API surface rename

Feature capability를 rename할 때는 다음을 update한다.

- type definition
- component prop
- hook/context return
- destructuring
- call site
- story
- test
- comment
- documentation example

External consumer가 요구하지 않는 한 compatibility alias를 만들지 않는다.

---

### 4. Behavior 보존

Refactoring은 다음을 변경해서는 안 된다.

- server authorization
- ticket action availability rule
- status transition
- Tenant scope
- DTO/API contract
- visual design
- mutation behavior

기대하는 변경은 product behavior가 아닌 semantic clarity다.

---

### 5. Verify

관련 검사를 실행한다.

```txt
TypeScript
ESLint
architecture boundary check
production build
test
Storybook build
```

Refactoring 시점에 repository에 존재하는 검사를 사용한다.

---

## 이전 Naming 결정과의 관계

2025년 naming 결정은 다음과 같은 더 광범위한 원칙을 확립했다.

```txt
Naming은 implementation shape가 아닌 의미로 정의해야 한다.
```

2026년 entity-status 결정은 다음을 분리했다.

```txt
domain active
와
UI disabled
```

이 결정은 해당 원칙을 boolean feature API에 구체적으로 적용한다.

```txt
application capability
와
runtime state
와
UI presentation
```

이 결정은 이전 결정을 대체하지 않는다.

---

## Consequences

### Positive

- Feature API가 user 및 workflow capability를 직접 전달한다.
- Call site에서 불필요한 부정이 줄어든다.
- Double-negative mistake가 감소한다.
- Permission 및 workflow projection을 더 쉽게 review할 수 있다.
- UI primitive가 표준 platform vocabulary를 유지한다.
- Test 및 story가 안정적인 application semantic을 대상으로 한다.
- Server authorization을 client에 노출하지 않고 capability computation을 중앙화할 수
  있다.
- Component API와 특정 visual implementation의 coupling이 줄어든다.

---

### Negative / Trade-offs

- 분류에는 사람의 판단이 필요하다.
- Repository 전체의 rename이 많은 call site에 영향을 준다.
- 일부 component에는 capability prop과 state prop이 모두 필요하다.
- 혼합된 boolean이 기존에 숨겨져 있던 responsibility 문제를 드러낼 수 있다.
- External 및 persisted contract는 compatibility 때문에 application convention과 계속
  일치하지 않을 수 있다.
- Test와 story가 안정화되기 전에 일시적인 API churn이 발생한다.

---

## Follow-up Policy

### 1. Test 및 story 확대 전에 convention 적용

새로운 Vitest 및 Storybook coverage는 전환 중인 negative prop을 유지하지 말고 최종
positive capability API를 사용해야 한다.

---

### 2. Capability projection을 workflow ownership 가까이에 유지

이미 workflow를 소유한 기존 policy, hook, context 또는 container를 선호한다.

실제 반복적인 필요 없이 global permission store 또는 generic capability framework를
추가하지 않는다.

---

### 3. 새로운 public boolean prop 검토

Code review 중 다음을 질문한다.

```txt
이 값은 operation capability인가?
현재 state인가?
값의 presence인가?
presentation인가?
external contract인가?
```

답에 따라 이름을 결정해야 한다.

---

### 4. Server validation을 독립적으로 유지

향후 capability refactoring도 server-side authorization, status, Tenant, company,
relationship validation을 계속 보존해야 한다.

---

## Related Documents

- [Boolean 명명 규칙](../05-development/boolean-naming-convention.md)
- [Component Boundary](../04-client-engineering/ui/component-boundary.md)
- [기능 기반 구조](../02-architecture/feature-based-structure.md)
- [Naming 결정](./2025-12-naming.md)
- [엔티티 상태 명명 결정](./2026-04-entity-status-naming.md)
- [Ticket 운영 규칙](../03-domain/service-desk/ticket/reference/ticket-operation-rules.md)

---

## Summary

Boolean이 operation capability를 나타내는 경우 feature 및 application component API는
positive `can*` 이름을 사용한다.

Runtime state는 계속 `is*`, presence는 `has*`를 사용하고 UI primitive는 `disabled`,
`readOnly`, `hidden`과 같은 표준 이름을 유지한다.

이 convention은 무조건적인 positive-boolean rewrite가 아니라 책임에 기반한다. External
contract, domain state, server-side authorization을 보존하면서 component semantic을
개선한다.

---

## Status

2026년 8월 1일 승인 및 적용.
