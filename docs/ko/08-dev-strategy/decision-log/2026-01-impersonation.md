# Impersonation (서버 세션 접근 방식) (2026-01)

## Context

`sessionStorage` 기반의 초기 impersonation 구현은 다음과 같은 치명적인 한계를 드러냈다.

- 클라이언트 전용 상태
- UI와 API 사이의 불일치한 동작
- 보안성과 감사 가능성 부족
- SSR 미지원

---

### Goal

Impersonation을 서버가 제어하는 세션에 통합함으로써,
**프로덕션에 맞는 안전하고 일관된 시스템**으로 발전시키는 것이 목표였다.

---

## 1. Key Decision

### Decision

Impersonation을 **클라이언트 상태**에서 **NextAuth 기반 서버 제어 세션 모델**로 옮긴다.

---

### Direction

```txt id="server-session-decision"
클라이언트 상태 -> 서버 세션 (NextAuth)
```

---

## 2. Approach

### Strategy

- NextAuth 세션을 확장한다
- 세션 객체에 impersonation 컨텍스트를 주입한다
- 세션을 단일 source of truth로 사용한다

---

## 3. Session Model

### Dual Identity Structure

```ts id="dual-identity-session"
session = {
  user: effectiveUser,
  originalUser: originalUser,
  isImpersonating: boolean,
};
```

---

### effectiveUser

- 현재 시스템에서 실제로 행동하는 사용자
- UI 렌더링과 API 요청에 사용된다

---

### originalUser

- 실제로 인증된 사용자
- impersonation을 시작한 사용자

---

## 4. Runtime Behavior

### Activation Flow

```txt id="activation-flow"
관리자가 사용자 선택 -> 세션 업데이트 -> Impersonation 시작
```

---

### Deactivation Flow

```txt id="deactivation-flow"
Impersonation 중지 -> originalUser 복원 -> 세션 초기화
```

---

### Behavior

- 모든 API 요청은 `effectiveUser`를 사용한다
- UI는 가장 중인 사용자 신원을 반영한다
- 시스템은 감사와 보안 검사를 위해 `originalUser`를 계속 보존한다

---

## 5. Why Server Session Was Chosen

### 1. Consistency

- UI, API, 서버 전반에서 신원 정보를 일관되게 유지할 수 있다
- 프런트엔드와 백엔드 사이의 불일치를 제거한다
- 런타임 동작을 더 예측 가능하게 만든다

---

### 2. Security

- 클라이언트에서 쉽게 조작할 수 없다
- 인증된 세션을 통해 통제된다
- 역할 기반 제한을 중앙에서 강제할 수 있다

---

### 3. SSR Compatibility

- Next.js App Router와 함께 동작한다
- 서버 컴포넌트와 route handler에서 사용할 수 있다

---

### 4. Auditability

- 원래 사용자와 실효 사용자 신원을 모두 보존한다
- 전체 액션 추적이 가능해진다

---

## 6. Integration with NextAuth

### Strategy

기본 인증 흐름은 유지하면서 callback을 통해 세션을 확장한다.

---

### Conceptual Example

```ts id="nextauth-session-example"
callbacks: {
  async session({ session, token }) {
    session.user = token.effectiveUser;
    session.originalUser = token.originalUser;
    session.isImpersonating = token.isImpersonating;
    return session;
  }
}
```

---

### Benefit

- 기존 인증 시스템에 대한 영향이 최소화된다
- 신원 컨텍스트를 중앙에서 제어할 수 있다
- 현재 인증 모델과 더 깔끔하게 통합된다

---

## 7. Authorization Strategy

### Rule

```id="authorization-rule"
Impersonation은 권한 상승을 허용해서는 안 된다
```

---

### Behavior

- 액션은 `effectiveUser` 기준으로 수행된다
- 시스템은 여전히 `originalUser`를 고려하여 권한을 검증한다
- 원래 행위자는 흐름 전체에서 추적 가능하게 남는다

---

### Example

- 관리자가 사용자를 impersonation한다
- 액션은 그 사용자 컨텍스트에서 수행된다
- 시스템은 원래 행위자가 관리자라는 사실을 여전히 알고 있다

---

## 8. UI Strategy

### Requirements

Impersonation이 활성화되면 UI는 다음을 만족해야 한다.

- impersonation 배너를 표시한다
- 가장 중인 사용자 신원을 명확하게 보여준다
- 눈에 잘 띄는 `Stop Impersonation` 액션을 제공한다

---

### Reason

- 혼란을 방지한다
- 투명성을 높인다
- 잘못된 신원 아래에서 의도하지 않은 작업이 일어나는 것을 줄인다

---

## 9. API Strategy

### Behavior

- 서버는 세션을 읽는다
- 데이터 접근은 `effectiveUser`를 사용한다
- 감사 로그에는 `originalUser`를 저장한다

---

## 10. Migration from the Local Approach

### Before

- `sessionStorage`
- UI 전용 override
- 백엔드 인식 없음

---

### After

- NextAuth 기반 서버 세션
- 풀스택 일관성
- 안전하고 추적 가능한 동작

---

## 11. Trade-offs

### Pros

- 안전하고 신뢰할 수 있다
- 클라이언트와 서버 전반에서 일관된다
- SSR을 지원한다
- 감사 로그를 가능하게 한다

---

### Cons

- 구현 복잡도가 증가한다
- 세션 확장 로직이 필요하다
- 권한 처리를 더 신중하게 다뤄야 한다

---

## 12. Alternatives Considered

### 1. 클라이언트 사이드 접근 유지

- 단순하다
- 일관되지 않다
- 안전하지 않다

---

### 2. 별도의 Impersonation Token

- 유연하다
- 통합 복잡도를 높인다
- 기존 인증 흐름과 맞추기 어렵다

---

### 3. Backend-Only Switching

- 안전하다
- UI 인식 범위가 제한된다
- 전체 워크플로 검증에는 덜 유용하다

---

## 13. Key Insight

```id="server-session-insight"
Impersonation은 UI 상태가 아니라 인증 컨텍스트의 일부다
```

---

## Summary

Impersonation 시스템은 **클라이언트 사이드 프로토타입**에서
**서버가 제어하는 세션 모델**로 발전했다.

이를 통해 애플리케이션 전반에서 안전하고 일관되며,
완전히 추적 가능한 사용자 컨텍스트 전환이 가능해졌다.
