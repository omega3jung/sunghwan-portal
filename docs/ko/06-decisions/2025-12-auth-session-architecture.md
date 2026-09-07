# Auth & Session Architecture (2025-12)

## 맥락

Service Desk 시스템에는 다음을 지원하는 인증 및 세션 모델이 필요했습니다.

- 안전한 로그인과 route 보호
- authentication, session, client state 사이의 명확한 분리
- role-aware UI 동작
- first-class feature로서의 impersonation
- 추적 가능성과 감사 가능성

이 단계의 목표는 사용자 인증에 그치지 않고 application 전반에서 사용자 맥락에
의존하는 모든 동작을 위한 안정적인 기반을 만드는 것이었습니다.

---

## 1. 핵심 원칙

```txt
Authentication은 identity를 검증한다.
Session은 runtime context를 제공한다.
Client state는 UI 동작을 제어한다.
```

---

## 2. 핵심 Concept

### 1. JWT (Authentication Layer)

- 로그인 후 발급되는 stateless token
- HTTP-only cookie에 저장
- server-side validation에 사용

---

### 2. Session (Runtime Context)

- JWT에서 도출
- UI와 application logic 전반에서 사용
- impersonation을 지원하도록 확장

---

### 3. Client State (Control Layer)

- Zustand로 관리
- 다음 용도로 사용:
  - React hook 밖에서 session 접근
  - impersonation 제어
  - UI state

---

## 3. Architecture 개요

```txt
Login
-> JWT issued (cookie)
-> Middleware validates JWT
-> Session derived (NextAuth)
-> Synced to Zustand
-> UI consumes currentUser
```

---

## 4. 이 Architecture를 선택한 이유

### 1. 관심사 분리

| Layer | 책임 |
| --- | --- |
| JWT | Identity 검증 |
| Session | Runtime context |
| Zustand | UI + control layer |

---

### 2. 확장성

- Stateless JWT는 horizontal scaling을 지원
- DB session 의존성 없음
- Edge Middleware와 함께 동작

---

### 3. 확장 가능성

- impersonation 지원
- role-based UI 동작 지원
- 향후 audit 확장 여지 확보

---

## 5. Session Model

### 기본 구조

```ts
type AppSession = {
  user: {
    id: string;
    role: string;
  };

  accessToken?: string;
};
```

---

### Impersonation 통합

```ts
session = {
  user: originalUser,
  impersonation: {
    originalUserId,
    impersonatedUserId,
  },
};
```

---

### Concept

#### `currentUser`

- UI와 API가 사용
- 현재 작업 identity를 나타냄

#### `originalUser`

- 실제 authenticated user
- audit과 traceability에 사용

#### `isImpersonating` (Derived)

- impersonation mode 활성 여부를 나타냄

---

### 이 구성이 중요한 이유

다음을 가능하게 합니다.

- 전체 audit trail
- role-aware UI rendering
- 안전한 context switching

---

## 6. Client-Side 통합 (Zustand)

### Impersonation State Model

```ts
type ImpersonationState = {
  originalUser: AppUser | null; // original user
  impersonatedUser: AppUser | null; // impersonated user
  currentUser: AppUser | null; // current UI user
};
```

---

### 책임

| Field | 의미 |
| --- | --- |
| originalUser | 원래 authenticated user |
| impersonatedUser | impersonated user |
| currentUser | UI의 active user |

---

### Data Flow

```txt
NextAuth Session -> Sync -> Zustand -> UI
```

---

### 통합 규칙

- 로그인 후 `originalUser` 설정
- impersonation 시작 시 `impersonatedUser` 설정
- UI는 항상 `currentUser` 사용

---

### 설계 원칙

```txt
NextAuth = source of truth
Zustand = runtime control layer
```

---

## 7. Impersonation Lifecycle

```txt
Login -> setOriginalUser
-> Start Impersonation -> setImpersonatedUser
-> currentUser changes
-> UI re-renders
-> Stop Impersonation -> restore originalUser
```

---

### 중요한 구분

| Action | 동작 |
| --- | --- |
| Stop Impersonation | original user 복원 |
| Sign Out | 전체 session 제거 |

---

## 8. UI 통합

Impersonation은 UI에 명시적으로 반영됩니다.

---

### UI 동작

- global impersonation indicator(예: banner/label)
- 표시되는 `Stop Impersonation` action
- layout-level awareness
- 즉시 적용되는 user context switch

---

### 예

- 현재 사용자에 따라 sidebar menu 변경
- role-based rendering 즉시 적용
- demo mode UI에서 LOCAL border indicator 같은 state 노출 가능

---

### 목적

- 사용자 혼동 방지
- 투명성 보장
- 안전한 testing과 debugging 지원

---

## 9. Authentication Flow

```txt
User Login
-> authorize()
-> JWT issued
-> stored in cookie
-> middleware validates
-> session created
-> Zustand sync
-> UI rendered
```

---

## 10. Middleware 전략

### 동작

- page rendering 전에 실행
- `getToken()`으로 JWT 검증
- unauthenticated 상태이면 redirect

---

### 장점

- client-side flicker 없음
- 이른 access control
- App Router와 함께 동작

---

## 11. 보안 고려 사항

### 1. Cookie Storage

- JWT를 HTTP-only cookie에 저장
- XSS 접근 방지

---

### 2. Token Validation

- middleware에서 항상 검증
- client-only state를 신뢰하지 않음

---

### 3. Impersonation Safety

- original user를 항상 보존
- privilege escalation을 허용하지 않음

---

### 4. Explicit Activation

- 사용자가 impersonation을 직접 시작해야 함
- 자동 전환 없음

---

## 12. 피한 Anti-Pattern

### JWT를 `localStorage`에 저장

- XSS에 취약

---

### Session을 Auth Source로 사용

- JWT가 source of truth

---

### Auth와 UI Logic 혼합

- Auth는 NextAuth + middleware에서 처리

---

### Server Data를 Zustand에 저장

- Session은 runtime context로만 취급

---

## 13. Trade-off

### 장점

- scalable하고 stateless함
- 명확한 관심사 분리
- impersonation 지원
- role-aware UI 지원
- audit-friendly

---

### 단점

- 더 높은 복잡도(JWT + session + Zustand)
- synchronization 필요
- impersonation 처리를 위한 UI condition 증가

---

## 14. 향후 고려 사항

- impersonation audit logging 개선
- 더 명확한 UI indicator
- role-based permission check 확장
- session expiration 처리 개선

---

## 요약

이 architecture는 다음을 결합합니다.

- NextAuth(authentication)
- JWT(identity)
- Session(runtime context)
- Zustand(client control layer)

이를 통해 secure, scalable, extensible한 특성을 갖추고 impersonation과 완전히 통합된
시스템을 만듭니다.

단순한 authentication system이 아니라 impersonation, role-based UI, auditability를
포함한 모든 user-context-dependent behavior의 기반입니다.
