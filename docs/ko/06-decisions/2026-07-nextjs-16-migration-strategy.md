# Next.js 16 마이그레이션 전략 (2026-07)

## Context

`sunghwan-portal`은 주요 LOCAL 데모와 REMOTE Service Desk 업무 흐름의 역할 분리를
구현한 뒤, Next.js 14 기반에서 안정적인 단계에 도달했습니다.

프로젝트는 이미 다음을 사용하고 있었습니다.

- Next.js App Router
- React
- TypeScript
- NextAuth
- Route Handler
- Tailwind CSS
- React Query
- server-only PostgreSQL access
- LOCAL 및 REMOTE runtime path

다음 기술 과제는 자동화 테스트, Storybook 검토 범위, 구조 개선을 확대하기 전에
프레임워크와 실행 환경의 기준 버전을 올리는 것이었습니다.

목표 방향은 다음과 같았습니다.

```txt
Node.js 24
npm 11
Next.js 16
React 19
ESLint 9
```

마이그레이션은 패키지 버전과 함께 다음 프레임워크 API와 사용 규칙에도 영향을 주었습니다.

- 비동기 요청 API와 경로 매개변수
- App Router 페이지와 Route Handler 함수 선언 형식
- `searchParams`
- middleware/proxy 규칙
- ESLint 설정
- React와 관련 라이브러리의 peer dependency
- Turbopack과 빌드 동작
- Node.js 실행 환경 요구사항

구현된 Service Desk 동작을 보존하면서 실패 원인을 추적하고 변경 내용을
검토할 수 있는 마이그레이션 전략이 필요했습니다.

---

## Problem

### 1. Next.js 14에서 16으로 직접 upgrade하면 서로 무관한 위험이 결합됨

Next.js 14에서 16으로 직접 upgrade하면 다음과 같은 여러 종류의 failure가 동시에
드러날 수 있었습니다.

```txt
dependency compatibility
framework API compatibility
runtime compatibility
lint configuration
build tooling
application behavior
```

이 모든 요소를 구분 없이 한 단계에서 변경하면 failure의 원인이 다음 중
어디에 있는지 식별하기 어려웠습니다.

- Next.js 15 transition requirement
- Next.js 16 requirement
- React 19
- Node.js 24
- ESLint 9
- application-level compatibility change

---

### 2. Framework migration과 domain refactoring을 혼합하면 reviewability가 약화됨

Service Desk domain에는 이미 다음과 같은 복잡한 동작이 있었습니다.

- approval 및 work routing
- requester update policy
- Ticket Action command
- immutable History
- Work Session handling
- LOCAL 및 REMOTE data path

프레임워크 기준 버전과 도메인 구조를 함께 바꾸면 기존 동작이 깨지는 회귀 오류의
원인을 분리하기 어렵습니다. 업무 동작을 재설계하지 않고도 기존 아키텍처가
프레임워크 업그레이드 후 동작한다는 점을 확인해야 했습니다.

---

### 3. Next.js 15에 장기간 머무르면 불필요한 중간 target이 추가됨

Next.js 15에서 긴 stabilization phase를 두면 당장의 migration 위험은 줄일 수 있지만,
다음과 같은 문제도 생깁니다.

- 임시 runtime baseline을 하나 더 만듦
- 실제 target version 도달을 지연함
- dependency 및 compatibility review를 반복해야 함
- 최종 project target이 아닌 version의 maintenance 작업이 증가함

Next.js 15를 거치며 버전별 문제 원인을 확인할 필요는 있었지만,
이를 장기 릴리스 대상으로 유지할 필요는 없었습니다.

---

### 4. Upgrade에는 명확한 commit 및 verification boundary가 필요함

대규모 migration commit에서는 다음을 검토하기 어렵습니다.

- package version 때문에 변경된 항목
- Node.js 또는 Next.js requirement 때문에 변경된 항목
- application code에서 변경된 항목
- 후속 compatibility fix에 무관한 refactoring까지 포함되었는지 여부

Migration에는 명시적인 순서가 필요했습니다.

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

이 option은 선택하지 않았습니다.

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

이 option은 전체 전략으로 선택하지 않았습니다.

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

이 option을 선택했습니다.

---

## Decision

전용 Next.js 16 마이그레이션 브랜치 하나에서 단계적으로 전환하기로 했습니다.

Migration 순서는 다음과 같습니다.

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

중간 Next.js 15 상태는 문제 원인을 확인하는 체크포인트로 사용합니다.
장기 제품 릴리스로 유지하지 않습니다.

---

## Migration Boundaries

### 1. Dependency change와 application change를 분리

가능한 경우 패키지·실행 환경의 기준 버전 변경은 애플리케이션 호환성 수정과
별도 커밋으로 나눠야 합니다.

이를 통해 다음을 구분할 수 있습니다.

```txt
package compatibility
와
source-code compatibility
```

---

### 2. Service Desk 동작 보존

Migration에서는 다음을 재설계하지 않습니다.

- 티켓 상태
- 승인자 결정
- 작업자 배정
- 요청자 수정 규칙
- Ticket Action 실행
- History의 의미
- Work Session 동작
- LOCAL/REMOTE DTO 응답 형식과 규칙

프레임워크에 맞춰 업무 흐름을 호출하는 방식은 조정할 수 있지만,
그 업무 흐름의 의미를 바꾸어서는 안 됩니다.

---

### 3. Application 수정을 migration requirement로 제한

예상되는 compatibility 작업은 다음과 같습니다.

- 비동기 경로 `params`를 `await`로 처리
- 필요한 경우 페이지 `searchParams`를 비동기로 처리
- 요청 API 사용 방식 조정
- 기존 middleware 규칙을 proxy 규칙으로 교체
- ESLint 설정을 지원되는 flat-config 방식으로 전환
- 프레임워크 설정과 빌드 관련 코드 수정
- React 19와 관련 라이브러리의 호환성 문제 해결

무관한 UI, domain, feature refactoring은 migration commit 범위 밖에 둡니다.

---

### 4. 선택적 framework 확장 연기

마이그레이션을 이유로 새 프레임워크의 모든 선택 기능을 함께 도입하지 않습니다.

별도의 근거가 필요한 작업의 예는 다음과 같습니다.

- React Compiler 도입
- 광범위한 Server Component 전환
- 무관한 caching 재설계
- 대규모 routing 재설계
- automated test 확대
- Storybook 확대

업그레이드에서는 먼저 새 기준 버전에서 안정적으로 동작하는 상태를 만듭니다.

---

## Implementation Sequence

### Commit 1 — Next.js 15 baseline

목적:

- Next.js 14에서 15로의 transition을 별도로 드러냄
- 첫 framework dependency baseline을 update함
- 중간 major version에 기인하는 compatibility issue를 식별함

이 commit에는 무관한 source refactoring을 포함하지 않아야 합니다.

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

각각의 의미 있는 checkpoint에서는 해당 단계에서 가능한 검사를 실행해야 합니다.

최종 migration은 최소한 다음을 검증해야 합니다.

```txt
TypeScript
ESLint
architecture boundary
Next.js production build
Turbopack/build compatibility
```

자동화 테스트와 Storybook 검증을 사용할 수 있게 되면 최종 프레임워크 버전에서도
실행해야 합니다. 버전 설치 성공만으로 마이그레이션 완료를 판단하지 않습니다.

---

## Consequences

### Positive

- Framework migration 위험이 이해할 수 있는 범주로 분리됩니다.
- Dependency change와 application change를 계속 검토할 수 있습니다.
- Regression의 원인을 더 작은 migration stage로 한정할 수 있습니다.
- 불필요한 중간 release를 유지하지 않고 목표한 modern runtime에 도달합니다.
- 기존 domain 및 data boundary가 major framework change에 대해 검증됩니다.
- Migration은 단순한 package upgrade를 넘어 portfolio 설명을 강화합니다.

---

### Negative / Trade-offs

- Branch에 임시 중간 checkpoint가 포함됩니다.
- 더 많은 commit과 반복 verification이 필요합니다.
- 일부 compatibility fix는 필요하지만 기계적인 변경처럼 보일 수 있습니다.
- 선택적 framework 개선은 baseline 안정화 이후 별도로 계획해야 합니다.
- 여러 ecosystem package의 dependency issue는 여전히 case별 해결이 필요할 수 있습니다.

---

## Follow-up Policy

### 1. 향후 framework upgrade도 단계적으로 수행

향후 major framework 또는 runtime upgrade가 여러 layer에 영향을 주면 다음을 분리합니다.

```txt
dependency baseline
tooling baseline
application compatibility
behavioral refactoring
```

명확한 이유 없이 이들을 결합하지 않습니다.

---

### 2. Compatibility 입증 후 refactoring

불필요한 `"use client"` 선언 제거, 컴포넌트 API 개선, 더 이상 권장하지 않는
애플리케이션 구현 방식 교체는 마이그레이션에 직접 필요하지 않다면
후속 리팩터링에서 처리해야 합니다.

---

### 3. 최종 API surface에서 test 확대

Vitest, Storybook, Playwright의 검증 범위는 임시 마이그레이션 API가 아니라
최종 Next.js 16 컴포넌트와 업무 흐름의 역할을 대상으로 해야 합니다.

---

## Related Documents

- [개발 접근 방식](../05-development/development-approach.md)
- [기능 기반 구조](../02-architecture/feature-based-structure.md)
- [라우팅 전략](../02-architecture/routing-strategy.md)
- [상태 관리 전략](../02-architecture/state-management.md)
- [Service Desk 구현 전략](../05-development/service-desk-implementation-strategy.md)

---

## Summary

프로젝트는 단계별 체크포인트를 거쳐 Next.js 14에서 Next.js 16으로 전환했습니다.
Next.js 15에서는 버전별 문제를 확인했고, Node.js 24, npm 11, Next.js 16,
React 19, ESLint 9를 최종 기준 버전으로 구성했습니다.

의존성 변경, 애플리케이션 호환성 수정, 후속 리팩터링을 나누었습니다.
기존 Service Desk 업무 흐름과 LOCAL/REMOTE 구조를 보존하면서
마이그레이션 실패 원인을 구분하기 쉽게 했습니다.

---

## Status

승인 및 구현 완료.
