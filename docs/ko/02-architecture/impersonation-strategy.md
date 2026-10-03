# Impersonation Strategy

## Goal

impersonation(다른 사용자로 동작하기)은 권한이 허용된 `INTERNAL` 관리자가
다른 사용자의 권한과 화면으로 작업할 수 있도록 설계했습니다. 전환은 서버가
검증하며, 실제 로그인한 사용자의 정보도 보존합니다.

주요 목적은 다음과 같습니다.

- 실제 서비스 데스크 업무 흐름 지원
- 사용자 이슈 재현과 디버깅 지원
- 엄격한 보안 경계 유지
- 모든 행동의 감사 추적 가능성 보존
- 클라이언트의 값 변경만으로 전환하지 않고 서버와 세션에서 impersonation 관리

---

## Core Principle

```txt
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
- 누가 대신 작업했는지 추적할 수 있도록 세션과 요청에 원래 사용자 및 현재 사용자 정보 보존

---

## Identity Model

### Dual Identity Concept

```txt
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
- impersonation 동안 UI 표시와 업무 권한 판단의 기준이 되는 사용자

---

### Example

```txt
관리자(originalUser) -> impersonates -> 직원(currentUser)
```

---

## Session Strategy

impersonation은 **세션 레벨**에서 처리됩니다.

---

### Session Structure

```ts
session = {
  user: originalUser,
  impersonation: {
    originalUser: {
      id, // authentication/account identity id
      username, // internal unique key
    },
    impersonatedUser: {
      username, // internal unique key
    },
    activatedAt,
  },
};
```

---

### Behavior

- `session.user`는 원래 인증된 사용자의 정보를 유지합니다
- `currentUser`는 UI와 업무 권한 판단 전반에 사용합니다
- `originalUser`는 세션·요청 추적과 보안 검증을 위해 유지합니다
- `isImpersonating`은 클라이언트 실행 중 impersonation 정보로 계산합니다

기존 `actor / subject / effective` 명칭은 코드와 문서에서 실행 중 역할이 명확하도록
`originalUser / impersonatedUser / currentUser`로 변경했습니다.

---

## Authentication Integration

### Strategy

**NextAuth** 를 기본 인증 계층으로 사용하고, 세션을 확장해 impersonation 메타데이터를 추가합니다.

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

```txt
관리자가 사용자 선택 -> impersonation 시작 -> 세션 업데이트
```

---

### Behavior

- 세션의 원래 사용자 정보 유지
- impersonation이 활성화되면 `impersonatedUser`로 `currentUser` 구성
- 원래 사용자 추적 정보 유지
- impersonation 정보에 따라 `isImpersonating = true`로 판단

---

## Deactivation Flow

### Flow

```txt
impersonation 종료 -> original user 복원
```

---

### Behavior

- impersonation 컨텍스트 제거
- 현재 사용자 컨텍스트를 원래 사용자로 복원
- impersonation 플래그 해제

---

## Authorization Strategy

### Rule

```txt
Impersonation은 original user의 권한 범위를 넘어서는 privilege escalation을 허용해서는 안 된다
```

---

### Implication

- 서버에서 권한을 검증해야 합니다
- 허용 범위를 넘어 권한이 높아지는 것을 막아야 합니다
- 현재 사용자가 바뀌어도 원래 사용자는 항상 식별할 수 있어야 합니다
- 권한 부여 규칙은 UI 구성 요소가 아닌 인증 계층에서 적용됩니다.

---

### Example

- 관리자가 일반 사용자로 전환합니다
- UI와 업무 동작은 일반 사용자의 권한으로 수행합니다
- 시스템은 전환을 시작한 원래 사용자가 관리자라는 정보를 유지합니다

---

### Current Authorization Boundary

- `INTERNAL` 관리자만 impersonation을 시작할 수 있습니다.
- 대상은 내부 데모 계정을 포함한 `INTERNAL` 또는 `CLIENT` 사용자일 수 있습니다.
- 대상은 원래 사용자와 달라야 하며 권한 수준이 더 낮아야 합니다.
- JWT 갱신 콜백도 API와 같은 서버 정책으로 대상을 다시 검증하고, 원래 사용자
  정보와 활성화 시각을 직접 구성합니다.

## Audit Strategy

### Requirement

세션과 요청에는 원래 사용자와 현재 사용자 정보를 함께 보존합니다. 업무 권한은
현재 사용자를 기준으로 판단하며, Ticket History에는 현재 이력 기록 규칙에 따라
현재 수행자를 기록합니다. 모든 업무 이력 행에 원래 사용자와 현재 사용자의 쌍을
저장하는 기능이나 규정 준수 수준의 감사 기반 기능은 현재 제공하지 않습니다.

---

### Stored Context

- `originalUser.username` (추적·보안 검증에 사용하는 키)
- `impersonatedUser.username` (현재 사용자 컨텍스트의 키)
- `originalUser.id` (원래 인증·계정 식별자)

---

### Example

```txt
currentUser: employee123
originalUser: admin456
```

---

### Benefit

- 세션·요청에서 원래 사용자와 현재 사용자 추적
- 현재 수행자 기준의 업무 이력
- 디버깅과 조사에 유용함

---

## UI Strategy

### Indicators

impersonation이 활성화되면 UI는 다음을 보여줘야 합니다.

- 명확한 배너 또는 상태 표시
- impersonation 대상 사용자 이름
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
- 현재 사용자의 권한에 따른 데이터 접근

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
- 로그인한 사용자 정보와 대신 작업하는 사용자 컨텍스트의 분리

---

## Summary

impersonation은 권한이 허용된 `INTERNAL` 관리자가 다른 사용자로 동작하게 합니다.
업무 권한은 현재 사용자를 기준으로 판단하고, 세션과 요청에는 원래 사용자와 현재
사용자 정보를 함께 보존하도록 설계했습니다.
