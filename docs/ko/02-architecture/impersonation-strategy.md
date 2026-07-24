# Impersonation Strategy

## Goal

impersonation 전략은 **안전하고 통제된 사용자 컨텍스트 전환**을 가능하게 하여, 관리자나 에이전트 같은 권한 있는 사용자가 다른 사용자를 대신해 동작할 수 있도록 설계됩니다.

주요 목적은 다음과 같습니다.

- 실제 서비스 데스크 업무 흐름 지원
- 사용자 이슈 재현과 디버깅 지원
- 엄격한 보안 경계 유지
- 모든 행동의 감사 추적 가능성 보존

---

## Core Principle

```id="impersonation-principle"
Impersonation은 원래 사용자를 추적할 수 있는 임시 identity override이다
```

---

## Background

Service Desk 시스템에서는 지원 담당자가 특정 사용자의 실제 경험을 그대로 재현해야 하는 경우가 있습니다.

---

### Typical Needs

- 에이전트는 사용자 문제를 재현해야 할 수 있음
- 관리자는 사용자를 대신해 작업해야 할 수 있음
- 지원팀은 실제 사용자 경험을 직접 검증해야 할 수 있음

---

### Problem

기본 인증만으로는 다음을 충분히 지원하기 어렵습니다.

- 다른 사용자로 행동하기
- 사용자별 문제 디버깅
- 올바른 컨텍스트에서 실제 사용자 흐름 시뮬레이션

---

## Key Requirement

시스템은 다음을 만족해야 합니다.

- 통제된 impersonation 허용
- 원래 사용자 identity 보존
- 모든 행동이 추적 가능하도록 보장

---

## Identity Model

### Dual Identity Concept

```txt id="identity-model"
현재 사용자 (Effective User)
원래 사용자 (Real User)
```

---

### Original User

- 실제 인증된 사용자
- impersonation을 시작한 사용자

---

### Impersonated User

- 대신 행동하는 대상 사용자
- impersonation 동안 시스템에서 실제로 사용되는 current identity

---

### Example

```txt id="identity-example"
관리자(originalUser) -> impersonates -> 직원(currentUser)
```

---

## Session Strategy

impersonation은 **세션 레벨**에서 처리됩니다.

---

### Session Structure

```ts id="session-structure"
session = {
  user: originalUser,
  impersonation: {
    originalUser: {
      id, // authentication/account identity id
      username, // internal unique key
    },
    impersonatedUser: {
      id, // authentication/account identity id
      username, // internal unique key
    },
    activatedAt,
};
```

---

### Behavior

- `session.user` 는 original user projection으로 유지됨
- `currentUser` 는 UI와 권한 판단 전반에서 사용됨
- `originalUser` 는 감사 및 보안 검증에 사용됨
- `isImpersonating` 은 현재 세션 상태를 명확히 나타냄

---

## Authentication Integration

### Strategy

**NextAuth** 를 기본 인증 계층으로 사용하고, 세션에 impersonation 메타데이터를 확장하여 붙입니다.

---

### Approach

- NextAuth를 인증의 기반으로 유지
- 세션 객체에 impersonation 컨텍스트를 주입
- 서버와 클라이언트 모두 같은 인증 흐름을 재사용

---

### Benefit

- 인증 로직을 중복 구현하지 않음
- 앱 전체에서 인증 동작의 일관성 유지
- impersonation을 별도 인증 시스템이 아닌 확장 기능으로 다룸

---

## Activation Flow

### Flow

```txt id="activation-flow"
관리자가 사용자 선택 -> impersonation 시작 -> 세션 업데이트
```

---

### Behavior

- 세션의 original user projection은 유지
- impersonation 이 활성화되면 `impersonatedUser` 로부터 `currentUser` 를 해석
- original user는 유지
- `isImpersonating = true` 설정

---

## Deactivation Flow

### Flow

```txt id="deactivation-flow"
impersonation 종료 -> original user 복원
```

---

### Behavior

- impersonation 컨텍스트 제거
- 세션을 original user로 초기화
- impersonation 플래그 해제

---

## Authorization Strategy

### Rule

```id="authorization-rule"
Impersonation은 original user의 권한 범위를 넘어서는 privilege escalation을 허용해서는 안 된다
```

---

### Implication

- 권한 검증은 신중하게 수행되어야 함
- 시스템은 privilege escalation을 방지해야 함
- current user가 바뀌더라도 original user는 항상 식별 가능해야 함
- 권한 부여 규칙은 UI 구성 요소가 아닌 인증 계층에서 적용됩니다.

---

### Example

- 관리자가 일반 사용자를 impersonate함
- UI와 동작은 사용자 컨텍스트로 수행됨
- 시스템은 여전히 original user가 관리자임을 알고 있음

---

### Current Authorization Boundary

- 관리자 권한 이상을 가진 내부 사용자만 가장을 시작할 수 있습니다.
- 가장 대상은 클라이언트 사용자여야 합니다.

### Requirement

모든 행동은 추적 가능해야 합니다.

---

### Stored Context

- `originalUser.username` (심사/보안 키)
- `impersonatedUser.username` (활성된 사용자 컨텍스트 키)
- `originalUser.id` and `impersonatedUser.id` (인증/계정 식별자)

---

### Example

```txt id="audit-example"
currentUser: employee123
originalUser: admin456
```

---

### Benefit

- 완전한 감사 추적 기록
- 컴플라이언스 대응에 유리함
- 디버깅과 조사에 유용함

---

## UI Strategy

### Indicators

impersonation이 활성화되면 UI는 다음을 보여줘야 합니다.

- 명확한 배너 또는 상태 표시
- impersonated user 이름
- 눈에 띄는 `Stop Impersonation` 액션

---

### Reason

- 사용자 혼란 방지
- 현재 컨텍스트에 대한 인지 강화
- 잘못된 identity에서의 의도치 않은 동작 감소

---

## Scope of Impersonation

### Applies To

- API 요청
- UI 렌더링
- current user 기준 데이터 접근

---

### Does Not Apply To

- 인증 소유권 자체
- 명시적으로 허용되지 않은 시스템 레벨 권한

---

## Security Considerations

### 1. Restricted Access

- 권한 있는 역할만 impersonation 가능

---

### 2. Explicit Activation

- 반드시 사용자가 직접 시작해야 함
- 자동 impersonation 금지

---

### 3. Clear Exit Mechanism

- 사용자가 쉽게 impersonation을 종료할 수 있어야 함

---

### 4. Session Isolation

- 탭, 세션, 다른 사용자 사이에 상태가 누수되지 않도록 해야 함

---

## Trade-offs

### Pros

- 강력한 디버깅 기능
- 향상된 지원 업무 흐름
- 현실적인 사용자 시뮬레이션
- 더 쉬운 이슈 재현

---

### Cons

- 세션 처리 복잡도 증가
- 엄격한 보안 제어 필요
- 권한 통제가 약하면 오용 가능

---

## Alternatives Considered

### 1. No Impersonation

- 시스템은 단순해짐
- 실제 사용자 문제를 디버깅하기 어려움

---

### 2. Separate Test Accounts

- 비교적 안전한 방식
- 실제 사용자 컨텍스트를 충분히 재현하기 어려움
- 실제 데이터와 권한 반영이 어려움

---

### 3. Backend-Only Simulation

- 더 통제된 환경
- 진짜 UI 흐름까지 검증하기 어려움

---

## Design Principles Alignment

이 전략은 다음 원칙과 맞닿아 있습니다.

- 보안 우선 설계
- 추적 가능성과 감사 가능성
- 실제 운영 지원 흐름
- identity와 context의 분리

---

## Summary

impersonation 전략은 **안전하고 추적 가능한 사용자 컨텍스트 전환**을 가능하게 하며, 관리자와 에이전트가 다른 사용자를 대신해 동작하더라도 original identity를 보존하고 시스템 전반의 감사 가능성을 유지하도록 설계됩니다.
