# Session User 경계 (2026-01)

## Context

이 프로젝트는 인증을 위해 **NextAuth (JWT 전략)** 를 사용합니다.

초기에는 세션 사용자(`session.user`)가 UI에서 사용할 전체 사용자 정보를 담을 후보로 검토되었습니다.

동시에 애플리케이션은 다음을 포함하는 더 풍부한 도메인 모델(`AppUser`)을 도입했습니다.

- 프로필 데이터(image)
- preference
- feature flag(impersonation, super user)
- 확장된 권한 컨텍스트

이로 인해 다음과 같은 핵심 질문이 생겼습니다.

> `session.user`를 `AppUser`에 맞게 확장해야 하는가?

---

## Problem

다음 두 모델 사이에는 성격 차이가 있었습니다.

- `session.user` (`AuthUser`, 최소 정보)
- `AppUser` (도메인 사용자, 확장된 정보)

이 둘을 하나로 합치려는 시도는 여러 문제를 만들었습니다.

### 1. 세션이 비대해진다

- JWT 크기가 커집니다
- 불필요한 데이터가 쿠키에 저장됩니다
- 세션 무효화 위험이 더 자주 발생합니다

---

### 2. 인증 계층으로 도메인이 새어 들어간다

- 세션이 UI 요구사항에 의존하게 됩니다
- 인증이 가져야 할 단일 책임이 흐려집니다

---

### 3. 클라이언트 타입이 불안정해진다

- `session.user`는 `AppUser`처럼 보입니다
- 하지만 실제 값은 불완전할 수 있다(`null`)
- 이는 안전하지 않은 가정을 유도합니다

---

### 4. 데이터 신선도 문제가 생긴다

- 프로필이나 preference 변경 시 세션 새로고침이 필요해집니다
- 실시간 UX 기대를 깨뜨립니다

---

## Options Considered

### Option 1. `session.user`를 전체 `AppUser`로 확장

```txt
session.user = AppUser
```

**장점**

- UI에서 쉽게 접근할 수 있습니다
- API 호출 수를 줄일 수 있습니다

**단점**

- 관심사의 분리를 해칩니다
- 세션 payload가 무거워집니다
- stale data 위험이 생깁니다
- 인증과 도메인 사이의 결합이 강해집니다

---

### Option 2. 세션은 최소화하고, `AppUser`는 별도로 조회

```txt
session.user = AuthUser (minimal)
AppUser = API를 통해 조회
```

**장점**

- 관심사의 분리가 깔끔합니다
- 세션이 작고 안정적으로 유지됩니다
- 실시간 데이터 갱신에 더 유리합니다
- 아키텍처 확장성이 좋습니다

**단점**

- 추가 fetch가 필요합니다
- bootstrap 복잡성이 생깁니다

---

### Option 3. 하이브리드(부분 확장)

```txt
session.user = partial AppUser
```

**장점**

- 어느 정도의 편의성이 있습니다

**단점**

- 경계가 불명확합니다
- 데이터 모델이 일관되지 않습니다
- 유지보수가 가장 어렵습니다

---

## Decision

**Option 2를 선택했습니다.**

> 세션은 최소 정보(`AuthUser`)만 유지합니다.
> 전체 사용자 데이터(`AppUser`)는 별도로 조회합니다.

---

## Implementation

### 1. 세션 구조

```ts
session.user = AuthUser;
```

- 신원 정보와 접근 제어 정보만 포함합니다

---

### 2. AppUser bootstrap

```tsx
<AppUserBootstrap userId={session.user.id}>{children}</AppUserBootstrap>
```

```txt
session.user.id
      ->
fetch AppUser
      ->
hydrate client state
```

---

### 3. 엄격한 경계 유지

- 세션에는 절대 다음이 들어가지 않습니다:
  - profile (image)
  - preference
  - feature flags

- `AppUser`는 항상 서버/API에서 가져옵니다

---

## Consequences

### Positive

- 인증과 도메인 사이의 경계가 명확해집니다
- 세션 동작이 안정적으로 유지됩니다
- 확장성이 좋아집니다
- 데이터 신선도가 향상됩니다
- 데이터 흐름을 이해하기 쉬워집니다

---

### Negative

- bootstrap 계층이 필요합니다
- 초기 데이터 조회가 약간 늘어납니다

---

## Follow-up Decisions

이 결정은 다음에 직접적인 영향을 주었습니다.

- `AppUserBootstrap` 도입
- `AuthUser`와 `AppUser`의 분리
- API 설계 (`/api/user-profile`)
- impersonation 처리 전략

---

## Key Insight

> **세션은 신원을 제공합니다.**
> **도메인은 행동을 제공합니다.**

이 둘을 섞으면 아키텍처가 불안정해집니다.

---

## Status

Accepted
