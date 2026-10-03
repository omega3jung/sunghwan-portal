# Auth & Session Architecture (2025-12)

## 맥락

Service Desk 시스템에는 다음을 지원하는 인증 및 세션 모델이 필요했습니다.

- 안전한 로그인과 보호된 경로 접근 제어
- 인증, 세션, 클라이언트 상태의 역할 분리
- 사용자 역할에 따른 UI 동작
- 주요 기능으로 지원하는 impersonation(다른 사용자로 전환)
- 추적 가능성과 감사 가능성

이 단계에서는 사용자 인증과 함께, 애플리케이션 전반에서 현재 사용자에 따라
달라지는 동작을 처리할 기반을 만들고자 했습니다.

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

- 로그인 후 발급되는 상태 비저장 토큰(stateless token)
- HTTP-only 쿠키에 저장
- 서버에서 인증 정보 검증에 사용

---

### 2. Session (Runtime Context)

- JWT에서 도출
- UI와 애플리케이션 로직 전반에서 사용
- impersonation을 지원하도록 확장

---

### 3. Client State (Control Layer)

- Zustand로 관리
- 다음 용도로 사용:
  - React 훅 밖에서 세션 접근
  - impersonation 제어
  - UI 상태

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

- UI와 API에서 사용하는 사용자
- 현재 작업을 수행하는 사용자 신원

#### `originalUser`

- 실제 로그인한 사용자
- 감사와 작업 추적에 사용

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
| originalUser | 원래 로그인한 사용자 |
| impersonatedUser | 전환 대상 사용자 |
| currentUser | UI가 현재 표시하는 사용자 |

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

- 전역 impersonation 표시(예: 배너/라벨)
- 화면에 표시되는 `Stop Impersonation` 작업
- 레이아웃에서도 전환 상태 반영
- 사용자 전환 즉시 UI 반영

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

- 페이지 렌더링 전에 실행
- `getToken()`으로 JWT 검증
- 인증되지 않은 사용자를 다른 페이지로 이동

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

- impersonation 감사 로그 개선
- 전환 상태를 더 명확히 표시
- 사용자 역할에 따른 권한 검사 확장
- 세션 만료 처리 개선

---

## 요약

이 architecture는 다음을 결합합니다.

- NextAuth(authentication)
- JWT(identity)
- Session(runtime context)
- Zustand(client control layer)

이 구성으로 보안과 확장성을 확보하고 impersonation을 인증·세션 흐름에 통합합니다.
Impersonation, 역할에 따른 UI, 감사 추적처럼 사용자 정보에 따라 달라지는 동작의
기반으로 사용합니다.
