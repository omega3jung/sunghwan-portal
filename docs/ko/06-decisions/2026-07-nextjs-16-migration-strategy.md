# Next.js 16 마이그레이션 전략 (2026-07)

## Context

`sunghwan-portal`은 주요 LOCAL demo와 REMOTE Service Desk workflow boundary 구현을
완료한 후 Next.js 14 기반에서 안정적인 milestone에 도달했다.

프로젝트는 이미 다음을 사용하고 있었다.

- Next.js App Router
- React
- TypeScript
- NextAuth
- Route Handler
- Tailwind CSS
- React Query
- server-only PostgreSQL access
- LOCAL 및 REMOTE runtime path

다음 주요 기술 단계는 automated test, Storybook coverage, 추가 구조 refactoring을
확대하기 전에 framework와 runtime baseline을 upgrade하는 것이었다.

목표 방향은 다음과 같았다.

```txt
Node.js 24
npm 11
Next.js 16
React 19
ESLint 9
```

이는 단순한 package version update가 아니었다.

Migration은 다음과 같은 framework-facing contract에 영향을 주었다.

- asynchronous request 및 route parameter
- App Router page 및 Route Handler signature
- `searchParams`
- middleware/proxy convention
- ESLint configuration
- React 및 ecosystem peer dependency
- Turbopack 및 build behavior
- Node.js runtime requirement

프로젝트에는 구현된 Service Desk 동작을 보존하면서 failure의 원인을 추적하고
검토할 수 있게 하는 migration 전략이 필요했다.

---

## Problem

### 1. Next.js 14에서 16으로 직접 upgrade하면 서로 무관한 위험이 결합됨

Next.js 14에서 16으로 직접 upgrade하면 다음과 같은 여러 종류의 failure가 동시에
드러날 수 있었다.

```txt
dependency compatibility
framework API compatibility
runtime compatibility
lint configuration
build tooling
application behavior
```

이 모든 요소를 구분되지 않은 하나의 단계에서 변경하면 failure의 원인이 다음 중
어디에 있는지 식별하기 어려웠다.

- Next.js 15 transition requirement
- Next.js 16 requirement
- React 19
- Node.js 24
- ESLint 9
- application-level compatibility change

---

### 2. Framework migration과 domain refactoring을 혼합하면 reviewability가 약화됨

Service Desk domain에는 이미 다음과 같은 복잡한 동작이 있었다.

- approval 및 work routing
- requester update policy
- Ticket Action command
- immutable History
- Work Session handling
- LOCAL 및 REMOTE data path

Framework baseline을 변경하면서 domain 구조까지 바꾸면 regression을 분리하기가
더 어려워진다.

Migration은 business behavior를 재설계하지 않고도 기존 architecture가 framework
upgrade를 견딜 수 있음을 입증해야 했다.

---

### 3. Next.js 15에 장기간 머무르면 불필요한 중간 target이 추가됨

Next.js 15에서 긴 stabilization phase를 두면 당장의 migration 위험은 줄일 수 있지만,
다음과 같은 문제도 생긴다.

- 임시 runtime baseline을 하나 더 만듦
- 실제 target version 도달을 지연함
- dependency 및 compatibility review를 반복해야 함
- 최종 project target이 아닌 version의 maintenance 작업이 증가함

프로젝트에는 Next.js 15 transition이 주는 diagnostic value가 필요했지만, Next.js 15를
장기 release target으로 만들 필요는 없었다.

---

### 4. Upgrade에는 명확한 commit 및 verification boundary가 필요함

대규모 migration commit에서는 다음을 검토하기 어렵다.

- package version 때문에 변경된 항목
- Node.js 또는 Next.js requirement 때문에 변경된 항목
- application code에서 변경된 항목
- 후속 compatibility fix에 무관한 refactoring까지 포함되었는지 여부

Migration에는 명시적인 순서가 필요했다.

---

## Options Considered

### Option 1 — Next.js 14에서 16으로 한 번에 직접 upgrade

```txt
Next.js 14
-> 모든 dependency update
-> 모든 error 수정
-> Next.js 16
```

#### Advantages

- 겉보기에는 가장 짧은 migration path
- 중간 commit이 적음
- 최종 target에 즉시 집중할 수 있음

#### Disadvantages

- dependency failure와 application failure가 혼합됨
- Next.js 15 transition requirement를 식별하기 어려움
- regression 원인 추적이 약해짐
- review가 대규모 before/after 비교가 됨

이 option은 선택하지 않았다.

---

### Option 2 — Next.js 15로 upgrade하여 release로 안정화한 후 나중에 16으로 이동

```txt
Next.js 14
-> Next.js 15 release
-> 장기간 stabilization
-> Next.js 16 release
```

#### Advantages

- 즉각적인 migration 부담이 가장 낮음
- 각 major version을 독립적으로 test할 수 있음
- release된 중간 version으로 rollback하기 쉬움

#### Disadvantages

- 임시 장기 target을 만듦
- upgrade 및 release 작업이 중복됨
- 목표인 Node.js 24 및 Next.js 16 baseline 도달을 지연함
- 이미 최신 supported architecture를 목표로 하는 portfolio project에는 제한적인
  가치만 제공함

이 option은 전체 전략으로 선택하지 않았다.

---

### Option 3 — 하나의 Next.js 16 branch 안에서 Next.js 15를 migration checkpoint로 사용

```txt
Next.js 14
-> Next.js 15 dependency checkpoint
-> Node.js 24 및 Next.js 16 dependency checkpoint
-> application compatibility change
-> final verification
```

#### Advantages

- version별 diagnostic value를 보존함
- 중간 release를 유지하지 않고 최종 target에 도달함
- dependency change와 source compatibility change를 분리함
- review 가능한 commit을 만듦
- 특정 단계의 rollback 및 debugging을 지원함

#### Disadvantages

- 더 신중한 commit 계획이 필요함
- 임시 중간 상태는 feature-complete하지 않을 수 있음
- 각 checkpoint가 의미를 가지려면 충분한 verification이 필요함

이 option을 선택했다.

---

## Decision

하나의 전용 Next.js 16 migration branch 안에서 단계적 migration을 수행한다.

Migration 순서는 다음과 같다.

```txt
Step 1
Next.js 15 dependency baseline

Step 2
Node.js 24 + npm 11 + Next.js 16 dependency baseline

Step 3
Application 및 tooling compatibility change

Step 4
Repository-level verification
```

중간 Next.js 15 상태는 diagnostic checkpoint이며 장기 product release가 아니다.

---

## Migration Boundaries

### 1. Dependency change와 application change를 분리

가능한 경우 package 및 runtime baseline change는 application compatibility change와
별도 commit으로 분리해야 한다.

이를 통해 다음을 구분할 수 있다.

```txt
package compatibility
와
source-code compatibility
```

---

### 2. Service Desk 동작 보존

Migration에서는 다음을 재설계하지 않는다.

- Ticket status
- approval routing
- work assignment
- requester update rule
- Ticket Action execution
- History semantic
- Work Session behavior
- LOCAL/REMOTE DTO contract

Framework-facing change는 해당 workflow에 도달하는 방식을 조정할 수 있지만 그 의미를
바꾸어서는 안 된다.

---

### 3. Application 수정을 migration requirement로 제한

예상되는 compatibility 작업은 다음과 같다.

- asynchronous route `params` await
- 필요한 경우 page `searchParams`를 asynchronous로 처리
- request API usage 조정
- 기존 middleware convention을 현재 proxy convention으로 교체
- ESLint configuration을 지원되는 flat-config 방향으로 migration
- framework configuration 및 build-facing code update
- React 19 및 관련 library compatibility 해결

무관한 UI, domain, feature refactoring은 migration commit 범위 밖에 둔다.

---

### 4. 선택적 framework 확장 연기

Migration은 새로운 framework baseline이 제공하는 모든 선택적 feature를 자동으로
도입하지 않는다.

별도의 근거가 필요한 작업의 예는 다음과 같다.

- React Compiler 도입
- 광범위한 Server Component 전환
- 무관한 caching 재설계
- 대규모 routing 재설계
- automated test 확대
- Storybook 확대

Upgrade에서는 먼저 안정적인 baseline을 확립한다.

---

## Implementation Sequence

### Commit 1 — Next.js 15 baseline

목적:

- Next.js 14에서 15로의 transition을 별도로 드러냄
- 첫 framework dependency baseline을 update함
- 중간 major version에 기인하는 compatibility issue를 식별함

이 commit에는 무관한 source refactoring을 포함하지 않아야 한다.

---

### Commit 2 — Node.js 24 및 Next.js 16 baseline

목적:

- runtime을 최종 target으로 이동함
- npm 및 framework dependency를 update함
- React 및 supporting package requirement를 정렬함
- source fix가 혼합되기 전에 최종 package baseline을 확립함

---

### Commit 3 — Application compatibility

목적:

- App Router 및 Route Handler signature update
- asynchronous request API 조정
- `params` 및 `searchParams` usage update
- middleware/proxy entry behavior migration
- ESLint 9 configuration 정렬
- build 및 Turbopack compatibility issue 수정
- 기존 application behavior 보존

---

## Verification Policy

각각의 의미 있는 checkpoint에서는 해당 단계에서 가능한 검사를 실행해야 한다.

최종 migration은 최소한 다음을 검증해야 한다.

```txt
TypeScript
ESLint
architecture boundary
Next.js production build
Turbopack/build compatibility
```

Automated test와 Storybook verification을 사용할 수 있게 되면 최종 framework
baseline에서도 실행해야 한다.

Version 설치 성공만으로는 migration 완료를 입증하기에 충분하지 않다.

---

## Consequences

### Positive

- Framework migration 위험이 이해할 수 있는 범주로 분리된다.
- Dependency change와 application change를 계속 검토할 수 있다.
- Regression의 원인을 더 작은 migration stage로 한정할 수 있다.
- 불필요한 중간 release를 유지하지 않고 목표한 modern runtime에 도달한다.
- 기존 domain 및 data boundary가 major framework change에 대해 검증된다.
- Migration은 단순한 package upgrade를 넘어 portfolio 설명을 강화한다.

---

### Negative / Trade-offs

- Branch에 임시 중간 checkpoint가 포함된다.
- 더 많은 commit과 반복 verification이 필요하다.
- 일부 compatibility fix는 필요하지만 기계적인 변경처럼 보일 수 있다.
- 선택적 framework 개선은 baseline 안정화 이후 별도로 계획해야 한다.
- 여러 ecosystem package의 dependency issue는 여전히 case별 해결이 필요할 수 있다.

---

## Follow-up Policy

### 1. 향후 framework upgrade도 단계적으로 수행

향후 major framework 또는 runtime upgrade가 여러 layer에 영향을 주면 다음을 분리한다.

```txt
dependency baseline
tooling baseline
application compatibility
behavioral refactoring
```

명확한 이유 없이 이들을 결합하지 않는다.

---

### 2. Compatibility 입증 후 refactoring

불필요한 `"use client"` boundary 제거, component API modernizing, deprecated
application pattern 교체와 같은 구조 개선은 framework migration에 직접 필요하지 않은 한
후속 refactoring 작업에서 처리해야 한다.

---

### 3. 최종 API surface에서 test 확대

Vitest, Storybook, Playwright coverage는 임시 migration API를 보존하기보다 최종
Next.js 16 component 및 workflow boundary를 대상으로 해야 한다.

---

## Related Documents

- [개발 접근 방식](../04-engineering/development-approach.md)
- [기능 기반 구조](../02-architecture/feature-based-structure.md)
- [라우팅 전략](../02-architecture/routing-strategy.md)
- [상태 관리 전략](../02-architecture/state-management.md)
- [Service Desk 구현 전략](../04-engineering/service-desk-implementation-strategy.md)

---

## Summary

프로젝트는 구분되지 않은 한 번의 upgrade 대신 단계적 checkpoint를 거쳐 Next.js 14에서
Next.js 16으로 migration했다.

Next.js 15는 diagnostic transition으로 사용했고 Node.js 24, npm 11, Next.js 16,
React 19, ESLint 9를 최종 baseline으로 구성했다.

Dependency change, application compatibility 작업, 후속 refactoring을 분리했다. 이를
통해 기존 Service Desk workflow와 LOCAL/REMOTE architecture를 보존하면서 migration의
모호성을 줄였다.

---

## Status

승인 및 구현 완료.
