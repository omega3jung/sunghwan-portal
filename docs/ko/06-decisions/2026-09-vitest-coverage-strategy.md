# Vitest Coverage Strategy (2026-09)

## Context

`sunghwan-portal`의 Vitest 작업은 2026년 8월 말부터 단계적으로 확대되었습니다.

처음 목표는 오래된 테스트를 현재 구현에 맞게 복구하고, 핵심 Service Desk 동작의
회귀를 막는 것이었습니다. 그러나 테스트를 추가할수록 중요한 질문은 단순한 테스트 수나
전체 coverage 비율을 넘어 다음 질문으로 바뀌었습니다.

```txt
어떤 동작이 깨지면 영향이 큰가?
-> 그 동작은 어느 계층이 소유하는가?
-> 가장 작은 안정적 경계에서 어떻게 검증할 것인가?
-> 어느 수준까지 보호하면 충분한가?
```

프로젝트는 다음과 같이 서로 다른 책임을 가진 코드를 한 저장소 안에 포함합니다.

```txt
domain
lib
feature
server
app/api
app/(protected)
LOCAL demo implementation
REMOTE PostgreSQL implementation
shared client state
reusable UI
```

또한 포트폴리오 특성상 현재는 App/BFF 성격의 코드와 server/backend 성격의 코드가 한
저장소에 있지만, 일부 경계는 실제 운영 환경에서 별도 배포 또는 별도 코드베이스로
분리할 수 있는 구조를 지향합니다.

따라서 테스트 전략은 다음 두 가지를 동시에 만족해야 했습니다.

1. 중요한 workflow와 security contract를 충분히 보호합니다.
2. 테스트 자체가 프로젝트의 목적이 될 정도로 확대하지 않습니다.

---

## Background

Vitest 보강은 대략 다음 순서로 진행되었습니다.

```txt
2026-08-27
-> archived Vitest suite 복원
-> fixture와 expectation을 current domain contract에 정렬

2026-08-29
-> unit project / npm test 기준 정립
-> node 기본 환경 + test별 jsdom 사용

2026-08-31
-> domain rule, feature workflow, form, draft, action, work-session 보강

2026-09-05
-> authentication, authorization, tenant isolation
-> Route Handler, LOCAL/REMOTE dispatch, server service 보강

2026-09-06
-> protected Service Desk / Settings page orchestration 보강

2026-09-07
-> 남아 있던 HTTP/service/runtime contract와 상태 관리 공백 보강
```

마지막 보강 단계에서는 남은 후보를 위험도에 따라 다시 분류했습니다.

```txt
P1
1~4  authentication / access boundary
5~6  Ticket / Tenant HTTP·Service boundary
7~9  REMOTE Settings / Action / Runtime contract

P2
10~16 state persistence / synchronization / integration

Deferred
17+ shared UI state utilities
P3 presentation / wrapper / low-risk utilities
```

이 분류를 마지막 확장 범위로 사용하고, 17번 이후의 낮은 위험 영역은 의도적으로
Vitest 확대 범위에서 제외했습니다.

최종 보강 후 unit suite는 다음 상태까지 확장되었습니다.

```txt
164 test files passed
853 tests passed
1 todo
```

이 숫자는 결과를 보여주는 snapshot일 뿐, 앞으로 유지해야 하는 품질 threshold는 아닙니다.

---

## Problem

### 1. 높은 전체 Coverage가 중요한 Contract를 보장하지 않는다

다음과 같은 page-level happy-path test는 많은 line을 실행할 수 있습니다.

```txt
render page
-> load success state
-> assert visible heading
```

하지만 다음 위험은 그대로 남을 수 있습니다.

- 다른 Tenant의 resource 접근
- impersonation privilege escalation
- authorization 이전 LOCAL/REMOTE dispatch
- 잘못된 Ticket state transition
- Ticket state는 바뀌었지만 History가 기록되지 않는 부분 실패
- REMOTE에서 LOCAL과 다른 principal/scope 사용
- transaction 중간 실패 후 일부 write만 남는 문제

반대로 작은 authorization policy test 하나가 적은 line만 실행하면서도 훨씬 큰 위험을
보호할 수 있습니다.

따라서 line coverage만으로 안전성을 판단할 수 없습니다.

---

### 2. 각 계층은 서로 다른 실패 경계를 가진다

프로젝트의 주요 계층은 같은 방식으로 테스트할 수 없습니다.

```txt
domain
-> business invariant

lib
-> application contract / normalization / shared policy

server
-> use case / persistence / transaction

feature
-> user-facing workflow / mutation / state

app/api
-> HTTP / auth / runtime dispatch

app/(protected)
-> page / view-model / capability composition
```

하위 계층에서 이미 검증한 business branch를 상위 계층에서 다시 반복하면 테스트 수는
늘어나지만 유지보수 비용도 같이 증가합니다.

반대로 상위 orchestration test 하나에 모든 하위 규칙을 맡기면 실패 원인을 찾기 어렵고,
중요한 거부 branch가 빠질 수 있습니다.

---

### 3. LOCAL과 REMOTE는 구현이 달라도 Application Contract는 같아야 한다

LOCAL은 demo-safe mutable state 또는 browser-local state를 사용할 수 있고, REMOTE는
PostgreSQL, repository, transaction, DTO service를 사용합니다.

두 runtime의 line coverage가 같을 필요는 없습니다.

더 중요한 것은 다음입니다.

```txt
same authorized intent
-> LOCAL
-> REMOTE
-> equivalent application-facing meaning
```

따라서 LOCAL/REMOTE는 구현량이 아니라 다음 contract를 기준으로 비교해야 합니다.

- 동일한 authorization 결과
- 동일한 Tenant / scope 의미
- 동일한 Ticket workflow 의미
- 호환되는 DTO
- 동일한 ownership/capability projection

---

### 4. 같은 저장소 안의 중복 Runtime 구현도 Drift할 수 있다

포트폴리오에서는 App runtime과 server runtime이 한 저장소에 함께 존재합니다.

예를 들어 Ticket ownership projection은 다음 두 경계에 별도 구현이 존재합니다.

```txt
App/BFF runtime ownership projection
Server/backend runtime ownership projection
```

현재 한 저장소에 있다는 이유만으로 이 구현을 하나로 합치면 테스트는 쉬워지지만,
실제 운영에서 runtime이 분리될 수 있다는 아키텍처 경계를 약하게 만들 수 있습니다.

문제는 코드 중복 자체가 아니라 다음 contract drift입니다.

```txt
owner
assignedApprover
assignedWorker
current username normalization
```

따라서 독립 구현을 유지하면서 동일한 contract suite를 적용하는 방식이 필요했습니다.

---

### 5. 테스트 후보는 계속 발견되므로 명시적인 Stop Condition이 필요하다

테스트 대상을 살펴보면 추가 후보는 계속 발견됩니다.

예:

- Route loading
- breadcrumb
- DatePicker utilities
- SortableTree helpers
- 작은 presentation component
- thin wrapper
- framework delegation code

이 코드를 테스트할 수 있다는 사실만으로 테스트를 추가하면, 어느 시점부터는 위험 감소
효과보다 유지보수 비용이 더 커집니다.

따라서 "더 테스트할 수 있는가"가 아니라 "중요한 위험이 충분히 보호되었는가"를 기준으로
종료점을 정의할 필요가 있었습니다.

---

### 6. Browser / Visual / Database Test는 Unit Coverage와 다른 책임을 가진다

Storybook browser test나 Playwright E2E는 실제 rendering/navigation을 검증하는 데
유용합니다.

하지만 Node 기반 Vitest unit suite와 같은 경계에서 실행하도록 강제하면:

- browser executable
- preview server
- addon
- CI image
- external service fixture

같은 환경 문제로 domain/security regression test까지 막힐 수 있습니다.

마찬가지로 mock 기반 repository test만으로는 실제 PostgreSQL의 다음 항목을

- constraint
- RLS
- grant
- database function
- transaction isolation

완전히 증명하지 못합니다.

Unit test, browser test, database integration test는 서로 다른 실패 책임을 가집니다.

---

## Decision Drivers

이번 결정에서 우선한 기준은 다음과 같습니다.

1. 보안, Tenant isolation, workflow 무결성 회귀를 가장 먼저 감지합니다.
2. 테스트는 해당 책임을 소유한 가장 작은 안정적 경계에 둡니다.
3. 내부 리팩터링만으로 불필요하게 많은 테스트가 깨지지 않도록 합니다.
4. LOCAL/REMOTE 및 App/Server runtime contract drift를 감지합니다.
5. 결함 수정은 실행 가능한 regression case로 남깁니다.
6. coverage는 사각지대를 찾는 도구로 사용하고 목표 자체로 만들지 않습니다.
7. 중요하지 않은 코드를 테스트하기 위해 production 구조를 왜곡하지 않습니다.
8. 충분한 위험 보호가 이루어지면 Vitest 확대를 멈춥니다.
9. visual/browser/database 검증은 필요한 시점에 별도 실행 경계로 확장합니다.

---

## Options Considered

### Option 1 — 테스트 작성 여부를 변경 담당자의 재량에 둔다

장점:

- 초기 작업이 빠릅니다.
- 별도 기준 관리 비용이 적습니다.

단점:

- 비슷한 위험에도 테스트 깊이가 달라질 수 있습니다.
- authorization negative path가 쉽게 빠집니다.
- LOCAL/REMOTE parity가 암묵적인 기대에 머뭅니다.
- regression test가 일관되게 남지 않습니다.

결론:

Service Desk의 workflow와 runtime 경계가 복잡해진 현재 구조를 충분히 보호하지 못해 이 안은 거부했습니다.

---

### Option 2 — Repository-wide Coverage Threshold를 즉시 강제한다

예:

```txt
Statements >= 80%
Branches >= 80%
Functions >= 80%
Lines >= 80%
```

장점:

- 규칙이 단순합니다.
- 자동화하기 쉽습니다.
- 테스트가 거의 없는 영역을 쉽게 발견할 수 있습니다.

단점:

- 위험이 낮은 UI/wrapper를 테스트하는 데 노력이 집중될 수 있습니다.
- 중요한 deny branch보다 실행하기 쉬운 line을 채우게 됩니다.
- mock을 과도하게 사용한 낮은 품질 테스트도 수치를 높입니다.
- 현재 source 구성과 browser test 경계가 서로 다른 의미를 가집니다.
- 높은 threshold에 맞추기 위해 기능과 무관한 대규모 테스트 작업이 발생할 수 있습니다.

결론:

Coverage report는 사용하지만 repository-wide threshold는 강제하지 않기로 했습니다.

---

### Option 3 — Pure Unit Test만 유지한다

장점:

- 빠르고 결정적입니다.
- domain rule과 normalization을 검증하기 좋습니다.
- 실패 원인을 찾기 쉽습니다.

단점:

- Route Handler의 auth-before-dispatch를 보호하지 못합니다.
- transaction/history/work-session coordination을 검증하기 어렵습니다.
- React Query invalidation, state synchronization, page orchestration을 놓칩니다.
- runtime contract drift를 발견하기 어렵습니다.

결론:

Pure unit test는 기반이지만 단독 전략으로는 부족합니다.

---

### Option 4 — Browser / E2E 중심으로 통합한다

장점:

- 실제 사용자 흐름과 가깝습니다.
- framework와 rendering 조합 문제를 발견할 수 있습니다.

단점:

- 세밀한 authorization/workflow branch를 표현하기 어렵습니다.
- 실행 시간이 길고 fixture 관리 비용이 높습니다.
- 실패 원인 분리가 어렵습니다.
- browser/environment failure가 business rule test까지 막을 수 있습니다.

결론:

향후 별도 테스트 계층으로 사용하되 Vitest unit 전략의 대체재로 사용하지 않습니다.

---

### Option 5 — Risk-based Layered Testing을 채택한다

내용:

```txt
Pure rule
-> unit test

State / hook
-> hook/store test

HTTP/auth/runtime
-> Route Handler test

Workflow / transaction
-> service test

LOCAL/REMOTE or App/Server parity
-> contract test

Page composition
-> view-model/component test
```

Critical behavior는 성공 사례뿐 아니라 거부·경계·실패 side effect를 함께 보호합니다.

장점:

- 실제 실패 영향에 맞게 테스트 비용을 배분할 수 있습니다.
- 각 계층의 책임이 테스트 구조에 드러납니다.
- 리팩터링에 상대적으로 안정적입니다.
- runtime contract drift를 명시적으로 검증할 수 있습니다.
- coverage 숫자로 설명하기 어려운 security/workflow invariant를 보호할 수 있습니다.

단점:

- 단일 percentage보다 판단 기준이 복잡합니다.
- reviewer가 domain과 architecture를 이해해야 합니다.
- 미검증 Critical branch를 주기적으로 살펴봐야 합니다.

결론:

이 방식을 채택했습니다.

---

## Decision

### 1. Vitest Unit Suite를 기본 Regression Boundary로 사용한다

기본 방향은 다음입니다.

```txt
Vitest unit project
-> node environment by default
-> jsdom opt-in for DOM tests
```

Server/domain test에는 기본적으로 browser environment 실행 비용이 들지 않도록 합니다.

---

### 2. Coverage Percentage보다 Contract Coverage를 우선한다

테스트를 추가하기 전에 다음 질문을 먼저 합니다.

```txt
What can regress?
Who can perform the operation?
What must be denied?
What state may change?
What must remain immutable?
Which runtime owns the behavior?
Which observable result must remain equivalent?
```

그 답을 소유한 가장 작은 안정적 테스트 경계를 선택합니다.

---

### 3. 각 계층은 자신이 소유한 책임만 직접 검증한다

```txt
domain
-> pure invariant

lib
-> application contract / normalization / shared policy

server
-> use case / transaction / persistence coordination

feature
-> user-facing workflow / cache / state orchestration

app/api
-> HTTP validation / auth / LOCAL-REMOTE dispatch

app/(protected)
-> page / route state / view-model / capability composition
```

동일 business branch를 모든 계층에서 반복하지 않습니다.

---

### 4. Critical Boundary는 Allow뿐 아니라 Deny와 Failure를 보호한다

Critical 영역:

- authentication
- session identity
- impersonation
- authorization
- tenant/category scope
- ticket ownership
- lifecycle transition
- approval/assignment
- transaction
- immutable History
- Work Session cleanup
- LOCAL/REMOTE dispatch/parity

가능하면 다음 의미 있는 branch를 검증합니다.

```txt
allow
deny
boundary / mismatch
malformed trusted input
dependency failure
forbidden side effect
LOCAL / REMOTE when applicable
```

특히 authorization은 runtime dispatch나 repository access보다 먼저 실패해야 합니다.

---

### 5. LOCAL / REMOTE Parity를 독립 Contract로 보호한다

LOCAL과 REMOTE가 저장 구현을 공유할 필요는 없습니다.

그러나 feature가 같은 경우 application-facing 의미는 호환되어야 합니다.

```txt
authorized target
-> LOCAL implementation
-> REMOTE implementation
-> equivalent application contract
```

LOCAL의 저장 방식 차이는 허용하지만 권한과 workflow 의미 차이는 허용하지 않습니다.

---

### 6. App / Server Runtime의 독립 구현은 Contract Test로 동기화한다

실제 분리 가능한 runtime boundary가 존재하는 경우, 단순 중복 제거를 위해 구현을
강제로 합치지 않습니다.

Ticket ownership projection처럼 양쪽에 동일 의미가 필요한 경우:

```txt
App implementation
Server implementation
-> same shared contract suite
```

를 적용합니다.

테스트에 남겨야 하는 핵심은 "현재 한 repository에 존재한다"는 설명이 아니라 다음
invariant입니다.

```txt
App runtime projection
===
Server runtime projection
```

---

### 7. 전역 Coverage Threshold는 강제하지 않는다

Statements, branches, functions, lines에 하나의 repository-wide threshold를 적용하지
않습니다.

Coverage report는 다음 용도로 사용합니다.

- 미실행 Critical branch 탐색
- 테스트가 없는 신규 behavior 탐색
- 변경 전후 급격한 감소 조사
- 향후 영역별 threshold 가능성 판단

다음 규칙은 채택하지 않습니다.

```txt
coverage가 낮으므로 테스트를 추가한다
```

```txt
coverage가 높으므로 충분히 안전하다
```

---

### 8. Regression Fix는 Contract 확인 후 Test와 함께 남긴다

결함을 발견하면 다음 순서를 따릅니다.

```txt
reproduce
-> current contract 확인
-> production bug인지 fixture 문제인지 판단
-> 최소 수정
-> regression test 유지
```

잘못된 현재 동작을 단순히 테스트로 고정하지 않습니다.

반대로 fixture를 통과시키기 위해 정상 production behavior를 변경하지 않습니다.

삭제된 요구사항이나 임시 guard가 더 이상 current behavior가 아니라면 관련 테스트도
같이 제거합니다.

---

### 9. P1/P2 Risk Gap까지만 Vitest 보강 범위로 삼는다

마지막 보강에서는 남은 공백을 다음 수준까지만 확장했습니다.

```txt
P1
authentication / authorization
Ticket / Tenant HTTP and service
REMOTE settings/action/runtime contract

P2
query construction
session storage
AppUser bootstrap
preference synchronization
attachment hook
organization contract
History persistence
```

이 수준에서 다음 주요 경계가 보호되었습니다.

```txt
domain invariants
-> application contracts
-> feature workflows
-> server use cases
-> HTTP/runtime orchestration
-> authentication / impersonation
-> tenant/scope isolation
-> LOCAL/REMOTE parity
-> App/Server ownership parity
-> page/view-model composition
-> state persistence/synchronization
-> History / Work Session persistence
```

이를 Vitest 확대의 현재 stop condition으로 결정했습니다.

---

### 10. P3와 낮은 위험의 Shared UI Utility는 의도적으로 제외한다

다음 영역은 현재 Vitest 종료선 밖에 둡니다.

- RouteLoadingProvider
- breadcrumb utility
- DatePicker utility
- SortableTree utility
- shadcn/Base UI wrapper
- layout-only component
- badge/skeleton/icon
- type/constants/barrel
- thin Axios/API forwarding code
- presentation-only component

이 영역에 테스트를 추가할 수 없는 것이 아닙니다.

현재 프로젝트에서는 테스트 비용 대비 보호하는 위험이 낮기 때문에 의도적으로 우선하지
않습니다.

---

### 11. Storybook / Browser Test는 별도 책임으로 둔다

복잡한 reusable UI와 visual/interaction state는 Vitest를 계속 확장하기보다 Storybook
browser testing이 더 적절합니다.

예:

- reusable component states
- form control variants
- dialogs
- disabled/loading/error variants
- responsive/visual interaction

전체 인증/navigation/backend persistence를 포함하는 사용자 여정은 필요할 때 Playwright
E2E 경계에서 다룹니다.

같은 scenario를 Vitest, Storybook, E2E에서 반복하여 테스트 수만 늘리지 않습니다.

---

### 12. 실제 Database 보장은 필요 시 별도 Integration Suite로 검증한다

Mock 기반 repository/service test는 빠른 regression detection에 적합하지만 다음을
완전히 증명하지 못합니다.

- PostgreSQL constraint
- RLS
- grants
- database function
- actual isolation / rollback
- migration compatibility

이 위험이 실제 변경 범위가 되면 별도 database integration suite를 검토합니다.

Unit coverage 숫자를 높이는 것으로 database guarantee를 대체하지 않습니다.

---

## Verification Snapshot

마지막 Vitest 보강 작업 완료 시점의 검증 결과는 다음과 같습니다.

```txt
164 test files passed
853 tests passed
1 todo
TypeScript passed
ESLint passed
git diff --check passed
```

이 수치는 전략의 성공 조건이 아닙니다.

의미 있는 변화는 테스트 개수가 아니라 다음과 같은 검증 공백을 해소했다는 점입니다.

- fail-closed auth identity projection
- Service Desk settings authorization orchestration
- login/logout redirect regression
- Ticket HTTP route boundary
- Tenant lifecycle
- REMOTE settings handlers
- Ticket Action input validation
- App/Server Ticket ownership contract parity
- session/storage synchronization
- preference stale-result protection
- attachment input policy
- organization write boundary
- History persistence

---

## Consequences

### Positive

- 테스트 투자가 실제 security/workflow risk에 집중됩니다.
- 각 계층이 자신이 소유한 contract를 검증합니다.
- 하위 rule과 상위 orchestration test의 중복이 줄어듭니다.
- LOCAL/REMOTE drift를 명시적으로 감지할 수 있습니다.
- 실제 분리 가능한 App/Server runtime의 behavioral parity를 보호할 수 있습니다.
- regression fix가 실행 가능한 사례로 남습니다.
- coverage report를 gap discovery에 계속 활용할 수 있습니다.
- 명시적인 stop condition으로 과도한 테스트 확대를 막을 수 있습니다.

### Negative / Trade-offs

- repository-wide percentage 하나보다 설명이 복잡합니다.
- reviewer가 domain과 architecture를 이해해야 합니다.
- 전역 threshold가 없기 때문에 중요한 신규 branch의 누락을 자동 숫자 gate 하나로
  차단할 수 없습니다.
- mock 기반 테스트만으로 실제 database/infrastructure 정책을 완전히 증명할 수 없습니다.
- contract test fixture도 DTO와 runtime 변화에 맞게 유지해야 합니다.

---

## Rejected Simplifications

다음 규칙은 채택하지 않습니다.

```txt
Every file must have a test file.
```

```txt
80% coverage means the feature is safe.
```

```txt
One page test can replace domain, authorization, and workflow tests.
```

```txt
Mock every dependency until the test becomes easy.
```

```txt
LOCAL passing implies REMOTE parity.
```

```txt
App and server implementations should always be merged because they are in one repository.
```

```txt
Browser tests should run inside every unit test command.
```

```txt
Repository mock tests prove database security.
```

```txt
Keep tests for deleted behavior because more tests are always better.
```

이 규칙들은 단순하고 측정하기 쉽지만 실제 contract 누락이나 오래된 요구사항을 숨길 수
있습니다.

---

## Revisit Conditions

Coverage threshold 또는 테스트 경계를 다시 검토할 조건은 다음과 같습니다.

- Critical 영역을 안정적으로 별도 glob/package로 분류할 수 있게 됨
- 여러 release 동안 coverage trend가 축적됨
- Storybook browser test 실행 경계가 안정됨
- Playwright E2E를 실제 CI gate로 사용할 필요가 생김
- database integration test가 필요한 schema/RLS 변경이 증가함
- CI에서 unit/browser/database test artifact를 일관되게 생성할 수 있음

Threshold를 도입하더라도 repository-wide 숫자 하나보다 다음을 우선 검토합니다.

```txt
Critical branch coverage
changed-code regression
contract-specific threshold
```

---

## Current Direction

```txt
Code change
-> identify regression risk
-> identify owning layer
-> add/update the smallest stable test
-> run targeted tests
-> run full Vitest
-> TypeScript
-> ESLint
```

```txt
Coverage report
-> inspect meaningful uncovered behavior
-> prioritize Critical/High gaps
-> ignore low-value percentage chasing
```

```txt
Bug fix
-> reproduce
-> confirm contract
-> fix
-> keep regression test
```

```txt
Visual / reusable UI
-> Storybook/browser boundary
```

```txt
Full user journey
-> Playwright when intentionally introduced
```

```txt
Database guarantees
-> integration suite when required
```

---

## Related Documents

- [Testing Strategy](../05-development/testing-strategy.md)
- [Development Approach](../05-development/development-approach.md)
- [Service Desk Implementation Strategy](../05-development/service-desk-implementation-strategy.md)
- [React Query Strategy](../05-development/react-query-strategy.md)
- [Category Activation and Routing Readiness](./2026-08-category-activation-and-routing-readiness.md)
- [Settings Change and In-Flight Ticket Policy](./2026-08-settings-change-and-in-flight-ticket-policy.md)

---

## Summary

The project adopts risk-based layered testing instead of percentage-first
coverage.

```txt
Critical behavior
-> meaningful allow / deny / boundary coverage

Layer responsibility
-> matching stable test boundary

LOCAL / REMOTE
-> application contract parity

App / Server runtime
-> independent implementations + shared contract suite

Coverage
-> diagnostic signal, not quality target

Vitest
-> stop when important risks are sufficiently protected
```

The important outcome is not that every file has a test or that one percentage is
high.

The important outcome is that authentication, authorization, tenant isolation,
workflow transitions, transaction behavior, immutable History, state
synchronization, and runtime parity are protected by assertions at the
responsibility boundary that owns them.

Lower-risk visual and shared UI behavior remains outside the current Vitest stop
condition and should be covered by Storybook/browser testing when that boundary
provides more value.

---

## Status

Accepted
