# 테스트 전략

## 목표

이 문서는 `sunghwan-portal`에서 자동화 테스트를 선택하고 구성하는 방법을 정의합니다.

테스트는 중요한 업무 흐름, 접근 제한, 데이터 응답 형식, 화면 상태를 회귀로부터
보호하기 위해 추가합니다. 파일 수나 저장소 전체의 코드 실행 비율(coverage)을
늘리는 것 자체를 목표로 삼지는 않습니다.

```txt
Risk
-> observable contract
-> smallest stable test boundary
-> deterministic regression protection
```

현재 자동화 테스트는 Vitest를 중심으로 구성합니다. Storybook에서는 프로젝트가
직접 만든 재사용 UI를 브라우저에서 독립적으로 표시하고 조작해 검토합니다. 주요
범위는 `src/components/custom`입니다. 애플리케이션 공통 레이아웃·메뉴 UI와
독립적으로 렌더링 가능한 일부 기능 표시 컴포넌트도 선별해 포함합니다. 여러 화면에
걸친 전체 사용자 흐름을 검증하는 E2E 테스트는 기본 단위 테스트와 구분합니다.

---

## 핵심 원칙

```txt
Protect contracts, not implementation details.
```

테스트는 구현 세부 사항이 바뀌어도 어떤 조건이 계속 성립해야 하는지를 설명해야 합니다.

구현이 바뀌어도 지켜야 하는 동작과 응답 규칙의 예는 다음과 같습니다.

- 권한이 없는 사용자는 보호된 작업을 실행할 수 없습니다.
- 요청 입력값으로 테넌트와 접근 범위 제한을 우회할 수 없습니다.
- 티켓 명령은 예상한 업무 처리 결과와 이력을 만듭니다.
- LOCAL과 REMOTE는 애플리케이션에서 같은 의미의 동작을 제공합니다.
- 데이터 변경 후 오래된 값이 될 수 있는 서버 상태의 캐시를 무효화합니다.
- 페이지나 뷰 모델은 입력에 맞는 상태와 작업 가능 여부를 제공합니다.

내부 헬퍼 호출 순서, 컴포넌트 구조, 프레임워크 구현 세부 사항은 그 자체가 반드시
지켜야 하는 규칙인 경우에만 테스트합니다.

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

기본 Vitest 테스트로는 다음을 검증하지 않습니다.

- 모든 UI 상태의 시각적 정확성
- 전체 애플리케이션에서의 실제 브라우저 페이지 이동
- 프로덕션 데이터베이스의 PostgreSQL 제약 조건, 권한 부여, 행 수준 보안(RLS),
  인프라 동작
- 프로덕션 객체 저장소, 알림 전달, 그 밖에 현재 범위에서 제외한 인프라

이러한 관심사가 구현 범위에 포함되면 다른 테스트 환경이 필요합니다.

---

## 계층별 테스트 책임

프로젝트는 각 계층이 담당하는 동작에 맞춰 검증 범위를 나눕니다.

| 계층 | 주요 테스트 책임 |
| --- | --- |
| `domain` | 업무에서 항상 성립해야 하는 조건, 상태 규칙, 권한 판단과 독립적인 도메인 정책 |
| `lib` | 애플리케이션의 응답·동작 규칙, 값 정규화, 공통 정책, 조회·매핑 동작 |
| `server` | 업무 처리 조정, 저장 규칙, 트랜잭션, History 및 Work Session에 미치는 영향 |
| `feature` | 사용자 업무 흐름의 처리 조정, 폼·훅 동작, 데이터 변경과 캐시 조정 |
| `app/api` | HTTP 요청 파싱, 인증, 권한 판단에 필요한 정보, LOCAL/REMOTE 처리 선택, 오류 응답 변환 |
| `app/(protected)` / page composition | 검색 상태, 뷰 모델, 로딩·오류·데이터 상태, 작업 가능 여부 구성 |
| shared client state | 저장된 상태 복원(hydration), 상태 저장, 동시 처리 충돌, 단순하지 않은 저장소 동기화 |
| 프로젝트가 소유한 reusable UI | `src/components/custom`과 선별된 애플리케이션 공통 레이아웃·메뉴 UI의 상태, Controls, 구성, 브라우저 조작을 주로 Storybook에서 검토 |
| feature presentation UI | 독립적으로 렌더링할 수 있고 애플리케이션의 업무 처리 기반 기능이 필요하지 않은 경우에만 선별적으로 추가 |
| 그 밖의 표현 전용 UI | 선택적으로 테스트하며, Storybook을 저장소의 모든 컴포넌트를 검증하는 수단으로 사용하지 않음 |

같은 업무 규칙의 분기를 모든 계층에서 반복해 검증하지 않습니다.

예를 들면 다음과 같습니다.

```txt
Domain policy
-> operation 허용 여부를 결정

Route Handler
-> dispatch 전에 policy 결과가 강제되는지 증명

Page/view model
-> 결과 capability가 올바르게 표현되는지 증명
```

각 테스트는 해당 계층이 담당하는 동작을 보호합니다.

---

## 위험 기반 우선순위

테스트 깊이는 파일 크기나 import 횟수보다 실패 영향과 회귀 위험을 기준으로 정합니다.

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

Critical 변경은 일반적으로 대표적인 성공·거부·경계 조건과 실패 시 부수 효과를
검증합니다. 실패 후 실행되어서는 안 되는 저장이나 후속 작업도 확인합니다.

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

React, HTTP, 데이터베이스 없이 같은 입력에 같은 결과를 내는 로직은 순수 단위
테스트로 검증합니다.

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

표시된 마크업보다 상태 전환이나 부수 효과가 중요한 경우 훅·저장소 테스트를 사용합니다.

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

사용자가 보거나 실행하는 동작을 확인해야 한다면 DOM 테스트를 사용합니다.

일반적인 대상:

- form과 action tool
- access guard/provider
- Service Desk settings editor
- ticket list/detail/insight composition
- loading, empty, error, retry 및 capability state

역할·레이블 등 의미를 기준으로 요소를 찾는 쿼리와 사용자에게 보이는 동작을 우선합니다.

다음 항목만 고정하는 테스트는 피합니다.

- Tailwind class
- 내부 child-component 구조
- icon 구현
- framework primitive 동작

페이지 테스트는 페이지에 상태와 컴포넌트가 올바르게 조합되는지 검증합니다. 하위
계층에서 이미 검증한 도메인·기능 규칙을 모두 반복하지 않습니다.

### Route Handler Test

Route Handler 테스트는 HTTP 요청 처리와 LOCAL/REMOTE 실행 경로 선택을 검증합니다.

일반적인 assertion은 다음과 같습니다.

- authentication 누락
- 금지된 접근
- 잘못된 request/path/query input
- canonical principal 및 tenant/scope 결정
- LOCAL/REMOTE dispatch 이전 authorization
- LOCAL handler 또는 REMOTE client로 전달되는 값
- method, query, body 및 trusted identity header forwarding
- application error에서 HTTP status로의 mapping

Route Handler 테스트에서 사용 중인 업무 정책 전체를 다시 구현하지 않습니다.

### Service 및 Workflow Test

여러 저장 작업이 함께 하나의 업무 결과를 만드는 경우 서비스·업무 흐름 테스트를
사용합니다.

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

- 사전 조건 검증 후에만 저장 시작
- 허용되는 상태 전환과 거부되는 상태 전환
- 예상한 Action/History 메타데이터
- 실패 후 후속 저장이 실행되지 않음
- 함께 성공하거나 실패해야 하는 작업에서 트랜잭션 실행기 사용
- 수명 주기에 맞는 정리 동작

### Repository 및 외부 Adapter Boundary Test

통신 방식이나 저장 데이터 변환 자체가 중요한 규칙이라면 저장소·어댑터 테스트가
유용합니다.

예:

- tenant/scope SQL predicate
- parameter binding
- row/DTO mapping
- query/header/body forwarding
- transaction executor 사용
- 외부 error mapping

Mock 기반 저장소 테스트는 실제 PostgreSQL 제약 조건, RLS, 권한 부여, 데이터베이스
함수의 동작을 입증하지 못합니다. 이 요소가 중요한 위험이 되면 별도 데이터베이스
통합 테스트가 필요합니다.

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

실행 환경을 분리하는 이유가 있다면 테스트를 쉽게 만들기 위해 두 구현을 합치지
않습니다. 공통 동작을 검증하는 테스트 묶음을 양쪽에 적용하면 한 구현이 다른
구현을 import하지 않아도 동작이 일치하는지 확인할 수 있습니다.

---

## Authorization 테스트 정책

권한 검증은 성공 사례만으로 접근 제한이 안전하다고 판단할 수 없습니다. 거부
사례와 경계 조건도 주의해서 검증합니다.

해당하는 경우 대표 사례는 다음을 포함해야 합니다.

- 허용된 principal
- 거부된 principal
- 누락되거나 잘못된 trusted identity
- same-tenant 및 cross-tenant access
- `INTERNAL` 및 `PORTAL` scope
- original identity와 impersonated/effective identity
- active 및 inactive resource
- LOCAL/REMOTE dispatch 또는 repository access 이전 authorization

서버에 판단 기준이 되는 데이터가 있으면 클라이언트가 제공한 테넌트·회사·범위·역할·
사용자 정보를 권한 판단의 근거로 신뢰하지 않습니다.

신뢰해야 하는 필드가 잘못되면 작업 권한을 늘리지 않고 요청을 거부해야 합니다
(fail closed).

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

설계에서 명시한 인프라 차이는 허용합니다. 예를 들어 LOCAL 초안 복구는 브라우저
저장소를, REMOTE 초안은 데이터베이스 행을 사용합니다. 사용자에게 호환되는 기능을
제공하기 위해 저장 구현까지 같게 만들 필요는 없습니다.

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

Mock은 테스트할 역할을 외부 의존성과 분리하는 데 사용합니다. 전체 애플리케이션을
재현하지 않습니다.

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

모듈을 import하는 시점에 Mock이 필요하면 `vi.hoisted`를 사용합니다. 테스트 사이에는
변경 가능한 Mock 상태를 초기화합니다.

---

## 결정적 테스트 정책

테스트는 실행 순서나 개발자 컴퓨터 환경에 의존하지 않아야 합니다.

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

프로젝트는 현재 저장소 전체에 하나의 coverage 비율 기준을 강제하지 않습니다.

하나의 숫자로 평가하면 성격이 매우 다른 다음 코드도 똑같이 취급하게 됩니다.

- security policy
- workflow service
- UI primitive
- framework wrapper
- type-only module

대신 중요한 동작과 응답 규칙이 테스트로 보호되는지 검토합니다.

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

현재 Storybook은 `src/components/custom`, `src/components/layout`,
`src/components/menu` 아래에서 프로젝트가 직접 만든 재사용 UI를 검토합니다.
Custom 컴포넌트는 포괄적으로 다루고, 레이아웃·메뉴는 독립적인 시각 검토가 유용한
항목만 선별합니다. API 없이 렌더링 가능한 일부 기능 표시 컴포넌트도 포함할 수
있습니다. 시각 요소이거나 재사용 가능하다는 이유만으로 모두 포함하지는 않습니다.

---

## Storybook 및 Browser Test 경계

Vitest는 application logic과 결정적인 component 동작을 보호합니다.

Storybook은 현재 프로젝트에서 다음의 집중된 책임을 가집니다.

```txt
src/components/custom
-> reusable UI contract
-> representative states
-> configurable public parameters
-> browser interaction
-> composition examples

selected layout/menu UI
-> application-wide visual states

selected feature presentation UI
-> independently renderable domain presentation
```

Storybook을 repository-wide component coverage 도구로 사용하지 않습니다.

기본 Storybook 범위에서 제외하는 대상은 다음과 같습니다.

- 대부분 shadcn/Base UI primitive와 얇은 project wrapper인 `src/components/ui`
- feature container, Route Handler/API 연결 UI 및 Service Desk workflow controller. 단,
  status나 history 표시처럼 독립적인 소수의 presentation component는 허용합니다.
- application page 및 route composition
- 이미 Vitest 또는 server-side test가 소유하는 domain, authorization, routing 및
  persistence 동작

이 경계를 통해 Storybook은 프로젝트가 직접 소유하며 격리된 browser 검토의 가치가 있는
UI에 집중합니다. 현재 custom 외부 Story는 `RouteLoadingOverlay`, `PreferencesMenu`,
`UserMenu`, `TicketStatusBadge`, `TicketHistoryTimeline`을 다룹니다. 이는 repository-wide
coverage를 요구하는 것이 아니라 의도적으로 제한한 예외입니다.

### 이전 Demo Playground와의 관계

애플리케이션은 이전에 `src/components/custom`을 위한 내부 playground로
`src/app/(protected)/demo`를 사용했습니다.

Storybook은 public component contract를 동일하거나 더 잘 검토할 수 있을 때 그 책임을
대체합니다.

대체 기준은 단순히 Story가 존재하는지가 아닙니다.

```txt
representative Story
+ Controls for configurable public parameters
+ args connected to the rendered component
+ browser interaction
+ observable controlled result
= component playground replacement
```

Storybook Controls가 같은 public parameter를 표현한다면 demo 전용 control form을
Storybook으로 복제하지 않습니다.

예:

```txt
meaningfully different UI state
-> Story

continuous public parameter variation
-> Controls
```

`Disabled`, `Empty`, `ReadOnly` 상태는 별도 Story가 필요할 수 있습니다. `maxImages`와
같은 숫자 설정이나 그 밖의 연속적인 configuration value는 유사한 Story를 여러 개
만들기보다 일반적으로 Control로 유지합니다.

### Public Contract 및 Meta 정책

Storybook 구성은 folder 크기나 `.tsx` 파일 수가 아니라 public component contract를
따릅니다.

같은 family의 두 exported component가 실질적으로 다른 public API를 제공한다면 각각의
Control을 type-safe하게 표시할 수 있도록 일반적으로 별도 Storybook Meta를 사용합니다.

Public component를 통해 동작을 충분히 검토할 수 있다면 내부 implementation component는
독립적인 Story가 필요하지 않습니다.

Storybook은 실제 component contract를 나타내는 기존 production constant, type, fixture
및 option definition을 재사용해야 합니다. Production option union을 중복 정의하거나
Story 작성을 쉽게 만들기 위한 Storybook 전용 component prop을 추가해서는 안 됩니다.

### Controlled Story 정책

Controlled component에서는 Storybook Controls와 Canvas interaction이 같은 state를
관찰해야 합니다.

의도한 흐름은 다음과 같습니다.

```txt
Controls change
-> Story args change
-> rendered component changes

Canvas interaction
-> component callback
-> Story args/state change
-> Controls and Canvas show the same result
```

Component의 public value contract를 양방향으로 동기화할 수 있다면 `useArgs` 또는 이와
동등한 Storybook-controlled pattern을 사용합니다.

`args`의 initial value를 local state에 한 번만 읽고 이후 args 변경에 반응하지 않는
구조는 완전한 Controls 연결로 보지 않습니다.

### Interaction 정책

Storybook은 이전 component playground에서 유용했던 다음과 같은 browser interaction을
유지해야 합니다.

- select, remove 및 clear
- date 및 range 선택
- text/editor input
- attachment add/remove 동작
- tree expand/collapse 및 지원되는 reordering
- step navigation
- 그 밖에 public custom component API가 노출하는 interaction

필요한 inspection capability를 제공한다면 수동 Canvas interaction으로 충분합니다.

자동화된 browser interaction이 의미 있는 regression 가치를 제공하고 안정적으로
유지될 때 `play`를 선별적으로 사용합니다. Test 수를 늘리기 위해서만 `play`를 추가하지
않으며, drag-and-drop처럼 불안정한 browser 동작을 수동 검토가 더 신뢰할 만한 경우
자동화하도록 강제하지 않습니다.

### Composition Story

모든 시각적 차이가 component variant 또는 Control에 속하는 것은 아닙니다.

차이가 caller가 제공한 content나 composition에서 발생한다면 component API를 확장하지
말고 composition Story로 표현합니다.

예를 들어 다음과 같은 Stepper label은:

```txt
Step 1: Request
```

component가 해당 동작을 소유하지 않는 경우 Stepper 전용 variant가 아니라 caller가
제공하는 step content로 보여줄 수 있습니다.

### 애플리케이션 Route와 Access Boundary

보호된 애플리케이션 route `/storybook`은 Storybook을 iframe으로 렌더링하는
launcher입니다.

- 개발 환경에서는 iframe이 `http://localhost:6006`을 load합니다.
- 프로덕션에서는 애플리케이션 build가 Storybook static output을
  `public/storybook-static`에 복사하고, iframe은 설정된 base path 아래의
  `/storybook-static/index.html`을 load합니다.

인증은 `/storybook` 애플리케이션 페이지로 이동하는 것을 제한합니다. 개발 서버와
`public/storybook-static` 아래 파일 자체에는 이 인증이 적용되지 않습니다. 프로덕션
정적 파일은 직접 요청할 수 있으므로 iframe 페이지의 인증을 기밀 Story나 fixture의
접근 통제로 취급하지 않습니다.

### Storybook 검증

Storybook 관련 변경은 일반적으로 다음을 검증해야 합니다.

```txt
TypeScript
-> ESLint
-> Storybook static build
-> representative browser rendering
```

Controls 또는 browser interaction이 실질적으로 변경되면 다음을 확인합니다.

- Controls가 실제 렌더링된 component를 갱신함
- controlled interaction이 관찰 가능한 state를 갱신함
- representative Story가 runtime error 없이 mount됨
- Storybook이 의도하지 않은 application API request를 만들지 않음

선별된 `play` 상호작용 테스트는 회귀 방지를 보완합니다. 저장소에는 화면 없이 실행하는
Playwright Chromium 기반 Storybook Vitest 브라우저 프로젝트가 구성되어 있습니다.
이는 `unit` 프로젝트만 실행하는 기본 `npm test`와 분리되어 있습니다. 브라우저
프로젝트는 아직 모든 테스트 통과를 요구하는 CI 필수 검사가 아닙니다. 문서화된
`play` 실패는 포트폴리오 기능이 완료된 뒤에도 검증상의 제한으로 남아 있습니다.

### E2E 경계

Authentication, navigation, backend persistence 및 여러 page에 걸친 전체 사용자 여정은
해당 coverage를 의도적으로 추가할 때 Playwright 같은 end-to-end browser test 경계에
속합니다.

예:

```txt
login
-> impersonation
-> ticket creation
-> approval
-> assignment
-> action
-> history
-> work session
```

Storybook은 이러한 application workflow를 재현하지 않습니다.

테스트 수를 늘리기 위해 Vitest, Storybook 및 E2E에서 같은 scenario를 중복해서는 안
됩니다. 각 계층은 서로 다른 failure class를 소유해야 합니다.

---

## 검증

Vitest 관련 변경은 일반적으로 다음 검사를 통과해야 합니다.

```txt
targeted Vitest tests
-> full Vitest suite
-> TypeScript
-> ESLint
```

Storybook 관련 변경은 일반적으로 다음 검사를 통과해야 합니다.

```txt
TypeScript
-> ESLint
-> Storybook static build
-> representative browser rendering
```

`play` interaction 또는 browser 전용 동작에 영향을 주는 변경은 구성된 Storybook browser
project를 명시적으로 실행할 수 있습니다.

```bash
npm exec vitest -- run --project storybook
```

이 브라우저 프로젝트는 기본 `npm test`에 포함되지 않으며 문제를 확인하는 진단
검사로 사용합니다. 포트폴리오 기능이 완료되었다고 해서 문서화된 상호작용 테스트
실패까지 해결된 것은 아닙니다.

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

이 경계가 보호된 뒤에는 Vitest를 무분별하게 확대하지 않습니다. 격리된 state, Controls,
interaction 또는 composition이 더 유용한 검증 방식이라면 `src/components/custom`의
reusable UI coverage를 Storybook 경계로 이동합니다. 다른 visual component가 자동으로
Storybook 대상이 되는 것은 아닙니다.

---

## 유지보수

- Contract가 변경되면 테스트와 현재 설계 문서를 함께 갱신합니다.
- 삭제된 동작의 테스트를 제거합니다.
- Retry로 flaky 동작을 숨기지 말고 원인을 수정합니다.
- 긴 테스트 파일은 임의의 크기가 아니라 책임 또는 scenario에 따라 나눕니다.
- Shared fixture가 중요한 domain 차이를 숨기기 시작하면 축소합니다.
- Coverage가 낮은 파일 목록보다 보호되지 않은 Critical workflow branch를 먼저 추적합니다.
- 테스트 infrastructure는 보호하는 위험에 비례하도록 유지합니다.
- 포괄적인 Storybook coverage는 `src/components/custom`에 유지합니다. Layout/menu 또는
  feature presentation Story는 독립적으로 렌더링할 수 있고 application-wide inspection
  가치가 명확할 때만 추가합니다.
- Storybook Story는 component contract를 중복 정의하지 않고 production public API 및
  shared option constant와 일치하도록 유지합니다.

---

## 관련 문서

- [개발 접근 방식](./development-approach.md)
- [Service Desk 구현 전략](./service-desk-implementation-strategy.md)
- [React Query 전략](./react-query-strategy.md)
- [Feature 기반 구조](../02-architecture/feature-based-structure.md)
- [Storybook Coverage 전략](../06-decisions/2026-09-storybook-coverage-strategy.md)

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

Vitest는 도메인 규칙, 업무 흐름, 실행 경로 조정과 같은 입력에 같은 결과를 내는
UI·애플리케이션 동작을 검증합니다. Storybook은 custom 재사용 UI, 선별된 공통
레이아웃·메뉴 UI, 독립적인 일부 기능 표시 컴포넌트를 격리된 브라우저에서 검토합니다.
전체 시스템 E2E 검증은 완료된 포트폴리오 범위에 포함하지 않습니다.
