# Impersonation (로컬 세션 스토리지 접근 방식) (2025-12)

## Context

Impersonation은 다음과 같은 서비스 데스크 워크플로를 지원하기 위해 도입되었다.

- 사용자 이슈 재현
- 사용자 경험 검증
- 사용자를 대신한 작업 수행

---

### Initial Goal

복잡한 인증 또는 세션 변경을 도입하기 전에,
개념을 검증할 수 있도록 impersonation을 **빠르게 구현**하는 것이 초기 목표였다.

---

## 1. Initial Approach

### Decision

클라이언트에서 impersonation 상태를 관리하기 위해
**로컬 세션 스토리지(`sessionStorage`)** 를 사용한다.

---

### Conceptual Structure

```ts id="impersonation-session-storage"
sessionStorage = {
  impersonationUser: {
    id: string,
    name: string,
  },
};
```

---

### Behavior

- 가장 중인 사용자 정보를 `sessionStorage`에 저장한다
- 저장된 값을 사용해 UI 컨텍스트를 덮어쓴다
- `sessionStorage`를 비워 impersonation을 해제한다

---

## 2. Why This Approach Was Chosen

### 1. Fast Implementation

- 백엔드 변경이 필요 없다
- 인증 시스템 수정이 필요 없다
- 빠르게 프로토타입을 만들 수 있다

---

### 2. Low Complexity

- 상태 관리가 단순하다
- 세션 동기화가 필요 없다
- NextAuth 변경에 의존하지 않는다

---

### 3. Immediate Validation

- impersonation UX와 워크플로를 빠르게 검증할 수 있다
- 개념을 UI에서 바로 테스트할 수 있다

---

## 3. Limitations Identified

### 1. Client-Side Only

Impersonation 상태는 브라우저 안에만 존재한다.

---

### Impact

- API 요청에는 반영되지 않는다
- 백엔드는 여전히 원래 사용자를 인식한다
- UI와 서버 사이에 불일치가 발생한다

---

### 2. Security Issues

- 브라우저 개발자 도구로 쉽게 조작할 수 있다
- 권한 검증이 없다
- 감사 추적(audit trail)이 없다

---

### 3. SSR Incompatibility

- 서버 사이드 렌더링 시 사용할 수 없다
- Next.js App Router 환경에서 일관성을 깨뜨린다

---

### 4. No Persistence Across Contexts

- 탭을 닫으면 사라진다
- 디바이스 간 공유되지 않는다
- 실제 운영 환경에서 신뢰하기 어렵다

---

### 5. No Auditability

- 누가 impersonation을 시작했는지 추적할 수 없다
- 원래 사용자에 대한 로그가 남지 않는다

---

## 4. Key Insight

```id="impersonation-insight"
Impersonation은 단순한 UI 상태로 다룰 수 없으며, 인증 또는 세션 설계의 일부여야 한다
```

---

## 5. Evaluation

### Decision

로컬 세션 스토리지 접근 방식은:

- 프로토타이핑에는 유용하다
- 프로덕션 또는 현실적인 시뮬레이션에는 적합하지 않다

---

## 6. Next Step

### Direction

Impersonation을 **서버가 제어하는 세션 모델**로 옮긴다.

---

### Planned Changes

- NextAuth 세션에 impersonation을 통합한다
- 이중 신원(dual identity) 모델을 도입한다
- 세션 컨텍스트 안에 원래 사용자와 실효 사용자를 모두 보존한다

---

### Identity Concept

- `originalUser`
- `currentUser`

---

## 7. Trade-offs

### Pros

- 구현이 빠르다
- 테스트가 쉽다
- 초기 검증 단계에서는 백엔드 의존성이 없다

---

### Cons

- 안전하지 않다
- 클라이언트와 서버 사이에서 일관되지 않다
- 확장 가능하지 않다
- 실제 시스템 동작과 맞지 않는다

---

## 8. Alternatives Considered

### 1. Direct NextAuth Modification (초기에는 보류)

- 장기적으로는 더 올바른 접근 방식이다
- 복잡도가 더 높다
- 초기 구현 속도가 느려진다

---

### 2. Backend-Driven Impersonation

- 안전하다
- API 설계가 필요하다
- 초기 단계에서는 오버헤드가 크다

---

## Summary

로컬 세션 스토리지 접근 방식은 **impersonation UX를 빠르게 검증**할 수 있게 해주었지만,
보안, 일관성, 서버 통합 측면에서 치명적인 한계를 드러냈다.

이로 인해 impersonation을 **서버가 제어하는 세션 모델**로 발전시키기로 결정했으며,
이는 더 견고하고 프로덕션에 가까운 구현의 기반이 되었다.
