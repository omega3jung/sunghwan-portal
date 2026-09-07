# 테스트 전략

## 목표

이 문서는 `sunghwan-portal`에서 자동화 테스트를 선택하고 구성하는 방법을 정의합니다.

목표는 테스트 파일 수를 최대화하거나 저장소 전체의 coverage 비율을 달성하는 것이
아닙니다. 회귀가 중요한 workflow, security boundary, data contract 또는 사용자에게
보이는 상태를 깨뜨릴 가능성이 있는 곳에 테스트를 추가합니다.

```txt
Risk
-> observable contract
-> smallest stable test boundary
-> deterministic regression protection
```

현재 자동화 테스트 suite는 Vitest를 중심으로 구성되어 있습니다. Storybook browser test와
end-to-end browser workflow는 책임이 다르므로 기본 unit-test 경계 밖에 둡니다.

---

## 핵심 원칙

```txt
Protect contracts, not implementation details.
```

테스트는 구현 세부 사항이 바뀌어도 어떤 조건이 계속 성립해야 하는지를 설명해야 합니다.

안정적인 contract의 예는 다음과 같습니다.

- 권한이 없는 사용자는 보호된 operation에 도달할 수 없습니다.
- request input으로 tenant 및 scope boundary를 우회할 수 없습니다.
- ticket command는 예상한 workflow effect와 History를 만듭니다.
- LOCAL과 REMOTE runtime은 application-facing behavior가 동등합니다.
- mutation은 stale해질 수 있는 server state를 invalidate합니다.
- page 또는 view model은 입력에 맞는 state와 capability를 노출합니다.

내부 helper 호출 순서, component 구조 또는 framework 구현 세부 사항은 그 자체가
contract인 경우가 아니면 테스트 대상이 아닙니다.

---

## 현재 테스트 경계

기본 Vitest project는 `src` 아래에 함께 배치된 테스트를 실행합니다.

```txt
environment = node
include = src/**/*.{test,spec}.{ts,tsx}
```

DOM 동작이 필요한 테스트는 파일 단위로 jsdom을 선택합니다.

```ts
// @vitest-environment jsdom
```

일반적인 command는 다음과 같습니다.

```bash
npm test
npm run test:watch
npm exec vitest -- run --project unit --coverage
```

기본 Vitest suite는 다음을 증명하려 하지 않습니다.

- 모든 UI state의 시각적 정확성
- 전체 application에 걸친 실제 browser navigation
- production database를 대상으로 한 PostgreSQL constraint, grant, RLS 또는
  infrastructure 동작
- production object storage, notification 전달 또는 그 밖의 연기된 infrastructure

이러한 관심사가 구현 범위에 포함되면 다른 테스트 환경이 필요합니다.

---

## 계층별 테스트 책임

프로젝트는 책임에 따라 서로 다른 테스트 경계를 사용합니다.

| 계층 | 주요 테스트 책임 |
| --- | --- |
| `domain` | 순수 business invariant, status rule, authorization과 독립적인 domain policy |
| `lib` | application contract, normalization, shared policy, query 및 mapping 동작 |
| `server` | use-case 조정, persistence rule, transaction 동작, History 및 Work Session effect |
| `feature` | 사용자-facing workflow orchestration, form/hook 동작, mutation 및 cache 조정 |
| `app/api` | HTTP parsing, authentication, authorization context, LOCAL/REMOTE dispatch, error mapping |
| `app/(protected)` / page composition | search state, view model, loading/error/data state, capability composition |
| shared client state | hydration, persistence, race 처리, 동작이 단순하지 않은 storage synchronization |
| 표현 전용 UI | 선택적으로 테스트하며, visual 및 interaction 중심 coverage는 주로 Storybook/browser testing이 담당 |

같은 business branch를 모든 계층에서 반복해서는 안 됩니다.

예를 들면 다음과 같습니다.

```txt
Domain policy
-> operation 허용 여부를 결정

Route Handler
-> dispatch 전에 policy 결과가 강제되는지 증명

Page/view model
-> 결과 capability가 올바르게 표현되는지 증명
```

각 테스트는 해당 계층이 소유한 책임을 보호합니다.

---

## 위험 기반 우선순위

테스트 깊이는 파일 크기나 import 횟수가 아니라 실패 영향과 회귀 위험으로 결정합니다.

### Critical

가장 우선순위가 높은 영역은 다음과 같습니다.

- authentication과 신뢰할 수 있는 identity projection
- impersonation과 effective-user 결정
- authorization, tenant isolation 및 scope 제한
- ticket lifecycle과 status transition
- approval 및 assignment routing
- merge, cancel, reopen, resubmit 및 그 밖의 운영 command
- current approver/current worker 및 ownership projection
- transaction 동작과 immutable History 무결성
- workflow transition 중 Work Session 정리
- LOCAL/REMOTE contract parity
- attachment preparation 및 persistence-safe metadata boundary

Critical 변경을 검증할 때는 일반적으로 대표적인 성공, 거부, 경계 및 실패 side-effect
사례를 포함해야 합니다.

### High

예:

- Route Handler orchestration
- settings mutation 영향
- business 의미가 있는 DTO/mapper contract
- query invalidation
- draft persistence
- tenant lifecycle
- server-side workflow handler

### Normal

예:

- hook과 view model
- search/filter/sort 동작
- form state
- 저장되는 page-local state
- 의미 있는 분기가 있는 display transformation

### Low

예:

- 얇은 wrapper
- 정적 상수
- type-only module
- 단순 re-export
- 프로젝트 고유 동작 없이 위임하는 framework primitive

Low-risk 코드는 실제 회귀 위험을 보호하는 경우에만 전용 테스트를 작성합니다.

---

## 테스트 종류

### 순수 Unit Test

React, HTTP 또는 database 없이 설명할 수 있는 결정적 로직에는 순수 unit test를
사용합니다.

일반적인 대상:

- domain rule과 policy
- schema validation
- normalization
- mapper
- query/filter/sort utility
- payload builder
- 날짜 및 값 변환

중요한 사례:

- 대표적인 valid input
- 빈 값과 boundary value
- invalid input
- fallback과 precedence
- normalization
- 필요한 경우 input immutability

### Store 및 Hook Test

주요 contract가 렌더링된 markup보다 state transition 또는 side effect인 경우
hook/store test를 사용합니다.

일반적인 대상:

- Zustand state
- React Query mutation orchestration
- form/dialog state
- session 및 AppUser synchronization
- preference synchronization
- draft recovery
- session-storage persistence

중요한 사례:

- initial state
- 성공과 실패
- reset/remove
- stale-response protection
- race 처리
- query invalidation
- storage/API synchronization

### Component 및 Page Composition Test

관찰 가능한 contract가 사용자가 보거나 실행할 수 있는 것이라면 DOM test를 사용합니다.

일반적인 대상:

- form과 action tool
- access guard/provider
- Service Desk settings editor
- ticket list/detail/insight composition
- loading, empty, error, retry 및 capability state

semantic query와 사용자에게 보이는 동작을 우선합니다.

다음 항목만 고정하는 테스트는 피합니다.

- Tailwind class
- 내부 child-component 구조
- icon 구현
- framework primitive 동작

Page-level test는 page-level composition을 검증해야 하며, 하위 계층에서 이미 검증한
모든 domain 또는 feature rule을 반복해서는 안 됩니다.

### Route Handler Test

Route test는 HTTP와 runtime orchestration boundary를 보호합니다.

일반적인 assertion은 다음과 같습니다.

- authentication 누락
- 금지된 접근
- 잘못된 request/path/query input
- canonical principal 및 tenant/scope 결정
- LOCAL/REMOTE dispatch 이전 authorization
- LOCAL handler 또는 REMOTE client로 전달되는 값
- method, query, body 및 trusted identity header forwarding
- application error에서 HTTP status로의 mapping

Route test는 자신이 사용하는 전체 business policy를 다시 구현해서는 안 됩니다.

### Service 및 Workflow Test

여러 persistence operation이 함께 하나의 business result를 구성하는 경우
service/workflow test를 사용합니다.

예:

```txt
Ticket Action
-> validate
-> mutate Ticket
-> create Action
-> create History
-> 필요한 경우 finish Work Session
```

중요한 assertion은 다음과 같습니다.

- precondition이 성공한 뒤에만 write가 시작됩니다.
- 유효하거나 유효하지 않은 state transition
- 예상한 Action/History metadata
- 실패 이후 후속 write가 실행되지 않습니다.
- atomic behavior가 필요한 곳에서 transaction executor가 사용됩니다.
- cleanup 동작이 lifecycle과 일치합니다.

### Repository 및 외부 Adapter Boundary Test

Transport 또는 persistence mapping 자체가 중요한 contract라면 repository와 adapter
test가 유용합니다.

예:

- tenant/scope SQL predicate
- parameter binding
- row/DTO mapping
- query/header/body forwarding
- transaction executor 사용
- 외부 error mapping

Mock 기반 repository test는 PostgreSQL constraint, RLS, grant 또는 database function을
증명하지 못합니다. 이러한 요소가 중요한 위험이 되면 별도의 database integration-test
경계가 필요합니다.

### Cross-Runtime Contract Test

독립 구현이 같은 application 의미를 유지해야 한다면 shared contract suite를 사용합니다.

예:

- App runtime과 server runtime의 ownership projection
- LOCAL과 REMOTE의 application-facing behavior
- 독립적으로 구현된 DTO/command contract

```txt
Independent implementation A
Independent implementation B
-> same behavioral contract
```

Runtime 분리가 아키텍처적으로 의미 있다면 테스트를 쉽게 만들기 위해 해당 경계를
제거하지 않습니다. Shared contract suite는 한 runtime이 다른 runtime을 import하도록
강제하지 않으면서 behavior parity를 보호할 수 있습니다.

---

## Authorization 테스트 정책

올바른 성공 경로만으로 boundary의 안전성을 증명할 수 없으므로 authorization test는
특별히 주의해야 합니다.

해당하는 경우 대표 사례는 다음을 포함해야 합니다.

- 허용된 principal
- 거부된 principal
- 누락되거나 잘못된 trusted identity
- same-tenant 및 cross-tenant access
- `INTERNAL` 및 `PORTAL` scope
- original identity와 impersonated/effective identity
- active 및 inactive resource
- LOCAL/REMOTE dispatch 또는 repository access 이전 authorization

Server가 canonical source를 소유하는 경우 client가 제공한 tenant, company, scope,
role 또는 identity 값을 authorization truth로 취급하지 않습니다.

잘못된 trusted field는 capability를 조용히 늘리는 대신 fail closed해야 합니다.

---

## LOCAL / REMOTE 테스트 정책

LOCAL과 REMOTE는 서로 다른 runtime 구현을 사용하지만, feature가 구현된 곳에서는
안정적인 application contract를 노출해야 합니다.

```txt
same authorized intent
-> LOCAL implementation
-> REMOTE implementation
-> equivalent application-facing meaning
```

테스트는 다음에 집중해야 합니다.

- 동등한 authorization 결과
- 호환되는 DTO
- 동등한 workflow 의미
- tenant/scope 일관성
- REMOTE의 올바른 transport forwarding
- LOCAL에만 존재하는 authorization 우회가 없음

명시적으로 설계된 infrastructure 차이는 허용됩니다. 예를 들어 LOCAL draft recovery와
REMOTE persisted draft row는 호환되는 feature behavior를 노출하기 위해 같은 storage
구현을 공유할 필요가 없습니다.

---

## 회귀 테스트 정책

Bug fix를 할 때는 일반적으로 가장 낮은 안정적 경계에 실패를 재현하는 테스트를 남겨야 합니다.

```txt
reproduce
-> confirm intended contract
-> fix
-> keep regression test
```

이전 동작을 설명한다는 이유만으로 assertion을 보존하지 않습니다.

현재 구현이 잘못되었다면 다음을 수행합니다.

1. 현재 설계 또는 contract를 확인합니다.
2. production code와 fixture 중 어느 쪽이 잘못되었는지 식별합니다.
3. 가장 작은 production 수정을 적용합니다.
4. 의도한 동작을 표현하도록 테스트를 추가하거나 갱신합니다.

삭제된 동작의 오래된 테스트는 archive하지 않고 제거합니다.

---

## Mocking 전략

Mock은 전체 application을 재현하는 것이 아니라 boundary를 격리해야 합니다.

### 적절한 Mock 대상

- network client
- 테스트 대상 외부의 database executor/repository
- system time
- Next.js router/navigation
- storage
- NextAuth/session boundary
- 테스트 대상이 소유하지 않는 무거운 editor/chart/portal UI
- 실패와 race를 결정적으로 재현하는 데 사용하는 async dependency

### Mock을 피해야 하는 대상

- 검증 중인 rule
- 테스트 대상 자체
- assertion을 쉽게 만들기 위한 모든 내부 helper
- 필수 contract field를 숨기는 비현실적으로 축약된 object

Import 시점의 module mock에 필요하면 `vi.hoisted`를 사용하고, 테스트 사이에 mutable
mock state를 reset합니다.

---

## 결정적 테스트 정책

테스트는 실행 순서나 개발자 machine에 의존해서는 안 됩니다.

- 테스트 사이에 mock과 mutable state를 reset합니다.
- 시간에 민감한 동작에는 fake timer 또는 고정된 날짜를 사용합니다.
- 기본 suite에서 실제 network access를 피합니다.
- unit test에서 실제 production database access를 피합니다.
- 테스트가 변경한 mutable LOCAL demo singleton state를 복원합니다.
- 임의의 sleep 대신 `waitFor` 또는 관찰 가능한 완료 조건을 사용합니다.
- locale/timezone에 민감한 expectation을 명시적으로 만듭니다.
- contract에 포함된다면 storage 실패, 잘못 저장된 state 및 stale async result를
  결정적으로 처리합니다.

---

## Fixture 및 Assertion 지침

- Fixture factory는 유효한 기본값을 제공하고 각 테스트가 의미 있는 차이만 override할
  수 있게 합니다.
- 테스트 이름은 조건과 예상 동작을 모두 설명해야 합니다.
- 광범위한 구현 snapshot보다 contract와 관련된 field에 대한 assertion을 우선합니다.
- 전체 DTO shape가 public contract라면 전체 shape를 검증합니다.
- dependency가 호출되었다는 사실만 assertion하지 말고 중요한 identity, tenant, scope,
  state 또는 payload 값도 검증합니다.
- 문구 자체가 contract가 아니라면 정확한 문장보다 error code/type/status를 우선합니다.
- Snapshot testing은 기본 선택이 아닙니다.
- `skip`/`todo` test는 구현된 regression coverage로 계산하지 않습니다.

---

## Coverage 정책

Coverage는 품질의 정의가 아니라 진단 도구입니다.

실행되지 않은 코드는 다음 순서로 해석합니다.

```txt
Uncovered code
-> meaningful behavior?
-> failure impact?
-> reachable and supported?
-> correct stable test boundary?
```

프로젝트는 현재 저장소 전체에 하나의 percentage threshold를 강제하지 않습니다.

하나의 숫자로 평가하면 성격이 매우 다른 다음 코드도 똑같이 취급하게 됩니다.

- security policy
- workflow service
- UI primitive
- framework wrapper
- type-only module

대신 중요한 contract가 보호되는지를 검토합니다.

기대하는 결과는 다음과 같습니다.

- Critical 변경은 의미 있는 allow/deny/boundary branch를 보호합니다.
- Bug fix에는 regression protection이 포함됩니다.
- 새 LOCAL/REMOTE branch는 runtime parity를 보호합니다.
- Workflow write는 current-state와 History effect를 모두 검증합니다.
- Coverage 변화는 line 수가 아니라 behavior 관점에서 설명할 수 있습니다.

Type-only file, 단순 re-export 또는 도달할 수 없는 defensive branch를 실행하기
위해서만 테스트를 추가하지 않습니다.

---

## Vitest로 의도적으로 테스트하지 않는 것

다른 경계가 더 유용하다면 Vitest coverage를 의도적으로 제한합니다.

프로젝트 고유 동작이 추가되지 않는 한 일반적으로 제외하는 대상은 다음과 같습니다.

- shadcn/Base UI primitive와 얇은 wrapper
- 정적인 표현 전용 component
- badge, skeleton, icon 및 layout-only wrapper
- 동작이 없는 type-only file과 상수
- barrel export
- 위임 외에 별도 contract가 없는 얇은 Axios/API forwarding helper
- 의도적으로 active workflow를 노출하지 않는 deprecated 또는 stub route

의미 있는 visual 또는 interaction 동작을 가진 복잡한 reusable UI는 page-level Vitest
test를 반복하기보다 Storybook/browser interaction coverage에 더 적합합니다.

---

## Storybook 및 Browser Test 경계

Vitest는 application logic과 결정적인 component 동작을 보호합니다.

Storybook은 시각적 검토와 browser 실행에 적합한 reusable UI state와
interaction scenario를 검증해 이를 보완합니다.

일반적인 Storybook 대상은 다음과 같습니다.

- 복잡한 shared component
- 여러 state를 가진 form control
- dialog 및 interaction 중심 UI
- loading/empty/error/disabled variant
- DOM assertion만으로 가치가 적은 responsive 또는 visual state

Authentication, navigation, backend persistence 및 여러 page에 걸친 전체 사용자 여정은
해당 coverage를 의도적으로 추가할 때 Playwright 같은 end-to-end browser test 경계에
속합니다.

테스트 수를 늘리기 위해 Vitest, Storybook 및 E2E에서 같은 scenario를 중복해서는 안
됩니다. 각 계층은 서로 다른 failure class를 소유해야 합니다.

---

## 검증

테스트 관련 변경은 일반적으로 다음 검사를 통과해야 합니다.

```txt
targeted Vitest tests
-> full Vitest suite
-> TypeScript
-> ESLint
```

변경의 영향 범위에 따라 저장소의 다른 검사도 추가할 수 있습니다.

다음 조건을 만족하면 테스트 검토가 완료됩니다.

- 테스트 이름으로 보호되는 동작을 이해할 수 있습니다.
- 중요한 Critical/High contract에 대표적인 성공과 실패 보호가 있습니다.
- 테스트가 실제 시간, network, 실행 순서 또는 개발자 local state에 의존하지 않습니다.
- 테스트만을 위해 production code를 노출하지 않습니다.
- 실패 정보로 구현 결함과 fixture 결함을 구분할 수 있습니다.

---

## 종료 조건

테스트에는 명시적인 종료점이 있어야 합니다.

테스트할 수 있는 uncovered helper 또는 component가 더 있다는 이유만으로 Vitest
test를 계속 추가하지 않습니다.

현재 전략은 다음의 중요한 위험 경계가 보호되면 Vitest coverage가 충분하다고 봅니다.

```txt
domain invariants
-> application contracts
-> feature workflows
-> server use cases
-> HTTP/runtime orchestration
-> authentication and impersonation
-> tenant/scope boundaries
-> LOCAL/REMOTE parity
-> page/view-model composition
-> state persistence and synchronization
-> History and Work Session persistence
```

이 경계가 보호된 뒤에는 Vitest를 무분별하게 확대하기보다 낮은 위험의 visual 및
reusable component coverage를 Storybook/browser testing으로 이동해야 합니다.

---

## 유지보수

- Contract가 변경되면 테스트와 현재 설계 문서를 함께 갱신합니다.
- 삭제된 동작의 테스트를 제거합니다.
- Retry로 flaky 동작을 숨기지 말고 원인을 수정합니다.
- 긴 테스트 파일은 임의의 크기가 아니라 책임 또는 scenario에 따라 나눕니다.
- Shared fixture가 중요한 domain 차이를 숨기기 시작하면 축소합니다.
- Coverage가 낮은 파일 목록보다 보호되지 않은 Critical workflow branch를 먼저 추적합니다.
- 테스트 infrastructure는 보호하는 위험에 비례하도록 유지합니다.

---

## 관련 문서

- [개발 접근 방식](./development-approach.md)
- [Service Desk 구현 전략](./service-desk-implementation-strategy.md)
- [React Query 전략](./react-query-strategy.md)
- [Feature 기반 구조](../02-architecture/feature-based-structure.md)

---

## 요약

`sunghwan-portal`의 테스트 전략은 위험 기반이며 책임을 고려합니다.

```txt
Protect contracts, not implementation details.
Test denial and boundaries, not only success.
Keep runtime contracts aligned without erasing meaningful boundaries.
Use coverage to find gaps, not to manufacture confidence.
Stop when important risks are protected.
```

Vitest는 domain rule, workflow, runtime orchestration 및 결정적인 UI/application 동작을
보호합니다. Storybook과 향후 browser/E2E test는 visual interaction 또는 전체 system
실행이 더 유용한 테스트 경계인 경우 해당 coverage를 보완합니다.
