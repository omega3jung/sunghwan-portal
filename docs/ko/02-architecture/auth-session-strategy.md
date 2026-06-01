# Auth & Session Strategy

## 목표

이 문서는 `sunghwan-portal`에서 사용하는 인증 및 세션 전략을 정의한다.

목표는 다음과 같다.

- 인증을 **NextAuth JWT 전략**에 맞게 유지한다
- **인증 정체성**과 **애플리케이션 사용자 모델**을 분리한다
- **LOCAL**과 **REMOTE** 런타임 모드를 모두 지원한다
- 인증된 사용자 컨텍스트에 대해 일관된 클라이언트 접근 패턴을 제공한다
- 세션 데이터를 전체 도메인 모델로 비대하게 만들지 않으면서 impersonation을 지원한다

---

## 핵심 원칙

```txt
JWT = authentication truth
Session = auth projection for app/runtime usage
AppUser = application user model
Zustand = frontend runtime cache and facade
```

중요한 경계는 다음과 같다.

> **Session은 전체 사용자 도메인 모델이 아니다.**
> Session은 안정적인 인증 컨텍스트를 제공하고, `AppUser`는 별도로 해석된다.

---

## 인증 스택

현재 스택은 다음과 같다.

- **NextAuth v4**
- **JWT session strategy**
- **Credentials provider**
- 프론트엔드 런타임 세션 접근을 위한 **Zustand**

`authOptions`는 다음을 구성한다.

- `session.strategy = "jwt"`
- `CredentialsProvider`
- `authSession`을 통한 custom `jwt`, `session` callback

---

## 사용자 모델 경계

### 1. `AuthUser`

`AuthUser`는 로그인 후 반환되어 JWT에 저장되는, 서버가 신뢰하는 identity payload다.

```ts
type AuthUser = {
  id: string;
  username: string;
  displayName: string;
  email: string;
  accessToken: string;

  dataScope: "LOCAL" | "REMOTE";
  userScope: "INTERNAL" | "CLIENT";
  clientId: string | null;
  permission: AccessLevel;
  role: Role;
};
```

특징:

- 인증 중심 모델이다
- 요청 간 안정적으로 유지된다
- 권한 관련 identity field를 포함한다
- `accessToken`을 포함하며, 이 값은 JWT와 서버 측 auth flow에만 남는다

---

### 2. `SessionUser`

NextAuth session은 다음 형태를 노출한다.

```ts
type SessionUser = Omit<AuthUser, "accessToken">;
```

이 점은 중요한 구현 세부사항이다.

- session은 identity와 access context를 유지한다
- session은 `accessToken`을 노출하지 않는다
- session은 추가로 `impersonation` metadata를 담을 수 있다

즉 session은 단순히 "id만 있는 구조"는 아니지만, 여전히 전체 application user model보다 의도적으로 더 작게 유지된다.

---

### 3. `AppUser`

`AppUser`는 UI가 사용하는 application-facing 사용자 모델이다.

```ts
type AppUser = {
  id: string;
  username: string;
  displayName: string;
  email: string | null;
  image?: string;

  userScope: UserScope;
  clientId: string | null;

  permission: AccessLevel;
  role: Role | null;

  canUseSuperUser: boolean | null;
  canUseImpersonation: boolean | null;
};
```

`AuthUser`와 비교하면 `AppUser`는 다음 성격을 가진다.

- UI 중심 모델이다
- 서버/profile 데이터를 통해 enrichment된다
- 애플리케이션 관점의 요구에 맞춰 확장될 수 있다

---

## 왜 `AuthUser`와 `AppUser`를 분리하는가

두 모델은 서로 다른 책임을 가진다.

| Model         | Responsibility                   |
| ------------- | -------------------------------- |
| `AuthUser`    | 인증과 신뢰 가능한 identity      |
| `SessionUser` | session-safe identity projection |
| `AppUser`     | UI와 application behavior        |

이 분리는 다음과 같은 흔한 문제를 피하게 해준다.

- JWT/session에 domain field가 과도하게 들어가는 문제
- 런타임 UI 관심사를 authentication state와 뒤섞는 문제
- session 변경이 지나치게 비싸거나 취약해지는 문제

---

## 로그인과 JWT 흐름

### 1. Credentials Login

프로젝트는 `CredentialsProvider`를 사용한다.

`authorize()`는 다음 경로 중 하나로 `AuthUser`를 해석한다.

- LOCAL demo resolver (`resolveDemoAuth`, `resolveClientAuth`)
- 또는 REMOTE API login (`/auth/login`)

---

### 2. JWT Callback

sign-in 시 `jwt` callback은 다음 신뢰 가능한 auth field를 token에 저장한다.

- `id`
- `username`
- `displayName`
- `email`
- `accessToken`
- `dataScope`
- `userScope`
- `clientId`
- `permission`
- `role`

JWT는 session lifecycle 동안 지속되는 인증의 기준 소스다.

---

### 3. Session Callback

`session` callback은 JWT로부터 session object를 파생한다.

```ts
session.user = {
  id,
  username,
  displayName,
  email,
  dataScope,
  userScope,
  clientId,
  permission,
  role,
};
```

impersonation이 활성화되어 있다면 callback은 추가로 다음을 노출한다.

```ts
session.impersonation = {
  originalUser: {
    id,
    username,
  },
  impersonatedUser: {
    id,
    username,
  },
  activatedAt,
};
```

---

## AppUser 해석 전략

전체 application user data는 JWT/session contract의 일부로 취급하지 않는다.

대신 애플리케이션은 `AppUser`를 별도로 해석한다.

### Server-Side Resolution

`getCurrentAppUser()`는 다음 흐름으로 동작한다.

```txt
getServerSession()
-> SessionUser/AuthUser context
-> mapAuthUserToAppUser()
-> apply enhancers
-> return AppUser
```

현재 구현은 다음과 같다.

- auth identity를 base `AppUser`로 매핑한다
- 서버 enhancer를 통해 enrichment한다
- 현재는 `withProfile`을 연결하고 있다

이 방식은 authentication을 안정적으로 유지하면서도 application user model이 독립적으로 확장되게 해준다.

---

### API Surface

UI는 다음 API를 통해 user profile data에 접근한다.

```txt
GET /api/users/me/profile
GET /api/users/[userId]/profile
```

이 API들은 session을 profile container로 만들지 않으면서 현재 사용자 혹은 대상 application user를 해석한다.

---

## 클라이언트 접근 패턴

### Problem

현재 프론트엔드 아키텍처에서는 `useSession()`만으로는 충분하지 않다. 이유는 다음과 같다.

- NextAuth session projection만 노출한다
- React hook consumer에서만 사용할 수 있다
- UI는 enrichment된 `AppUser` data를 필요로 한다
- impersonation은 추가적인 런타임 레이어를 도입한다

---

### Decision

프론트엔드는 계층형 접근 패턴을 사용한다.

```txt
NextAuth session
-> fetch current AppUser
-> sync into authSessionStore
-> consume via useCurrentSession()
```

---

### `useCurrentSession()`

`useCurrentSession()`은 프론트엔드의 주요 session facade 역할을 한다.

이 훅은 다음을 결합한다.

- NextAuth session state (`useSession`)
- current user profile query (`useCurrentUserProfileQuery`)
- Zustand `authSessionStore`
- Zustand `impersonationStore`

목적은 page와 component에 안정적인 UI 지향 session object를 제공하는 것이다.

```ts
type CurrentSession = {
  user: AppUser | null;
  isDemoUser: boolean;
  isSuperUser: boolean;
  superUserActivated: Date | null;
  security: {
    loginLockedUntil: number | null;
    failedAttempts: number;
    requiresCaptcha: boolean;
  };
};
```

실제로 protected UI가 소비하는 것은 이 객체다.

---

### `authSessionStore`

`authSessionStore`는 `CurrentSession`을 위한 client-side runtime cache다.

용도는 다음과 같다.

- 현재 `AppUser`를 보관한다
- `sessionStorage`에서 hydrate한다
- UI 중심 session data에 대해 안정적인 update 경로를 제공한다
- sign-out 시 캐시된 데이터를 정리한다

중요한 제한:

> 또한 server/session 기반 impersonation 제어를 대체하지 않는다.

신뢰 가능한 기준 소스는 여전히 JWT 기반 NextAuth auth flow다.

---

### Why This Is Acceptable

state-management 원칙은 다음과 같다.

```txt
Prefer server state over client state whenever possible
```

이 전략은 여전히 그 원칙을 따른다. 이유는 다음과 같다.

- authentication truth는 JWT/session에 남는다
- `AppUser`는 여전히 서버/API 해석 결과에서 온다
- Zustand는 프론트엔드 shell에 필요한 runtime shape만 캐시한다

즉 이것은 대체 auth source가 아니라, **runtime user-context cache**다.

---

## 보호 영역의 부트스트랩 흐름

protected shell은 `useCurrentSession()`에 의존하며, `AppUser`가 준비될 때까지 기다린다.

런타임 흐름은 다음과 같다.

```txt
User authenticated
-> useSession() resolves
-> useCurrentUserProfileQuery() fetches current AppUser
-> authSessionStore.setSession({ user })
-> ProtectedShell renders
-> AppUserBootstrap syncs originalUser into impersonation store
```

이 흐름은 feature page가 렌더링되기 전에 protected app이 안정적인 layout-level user context를 가지게 한다.

---

## Impersonation 통합

impersonation은 auth/session architecture의 일부로 지원된다.

### Session-Level Shape

NextAuth session은 최소한의 impersonation metadata만 담는다.

```ts
type UserInfo = {
  id: string; // authentication/account identity id
  username: string; // internal unique key
};

type ImpersonationInfo = {
  originalUser: UserInfo;
  impersonatedUser: UserInfo;
  activatedAt: number;
};
```

이렇게 하면 session mutation을 작고 audit 가능하게 유지할 수 있다.

---

### Client Runtime Model

클라이언트 store는 이를 더 풍부한 UI 모델로 확장한다.

```ts
type ImpersonationState = {
  originalUser: AppUser | null;
  impersonatedUser: AppUser | null;
  currentUser: AppUser | null;
};
```

의미는 다음과 같다.

- `originalUser`: 실제 로그인한 사용자
- `impersonatedUser`: impersonation 대상 사용자
- `currentUser`: UI와 권한 판단이 기준으로 삼는 사용자

---

### Runtime Flow

```txt
startImpersonation(impersonatedUsername)
-> POST /api/auth/impersonation
-> session.update({ impersonation })
-> useImpersonation() fetches impersonated user profile
-> impersonationStore.syncFromSession()
-> currentUser switches in UI
```

impersonation을 종료하면 반대 흐름을 수행하며 session의 impersonation metadata를 정리한다.

---

### Current Authorization Rule

현재 구현 기준 규칙은 다음과 같다.

- `INTERNAL` 사용자이면서 최소 `ADMIN` 권한 이상인 경우만 impersonation을 시작할 수 있다
- impersonation 대상은 `TENANT` 사용자여야 한다

이 규칙은 UI가 아니라 auth layer에 위치한다.

---

## 라우트 보호 전략

프로젝트는 현재 두 개의 보완적인 보호 레이어를 사용한다.

### 1. Middleware

`middleware.ts`는 다음을 수행한다.

- public/static/API 트래픽은 무시한다
- `getToken()`으로 JWT를 읽는다
- 인증되지 않은 접근을 login page로 redirect한다

현재 caveat:

- middleware는 보수적으로 동작하며 주로 보호된 루트 HTML navigation path를 가드한다
- 모든 client-side transition의 유일한 보호 메커니즘으로 설명되지는 않는다

---

### 2. Protected Shell

`ProtectedShell`은 app layer에서 런타임 보호를 추가한다.

- session loading을 기다린다
- 인증되지 않은 사용자를 `/login`으로 redirect한다
- `CurrentSession.user`가 준비될 때까지 렌더링을 막는다

즉 UI는 auth state와 해석된 `AppUser`의 존재를 기준으로 함께 보호된다.

---

## LOCAL vs REMOTE 지원

auth model은 두 런타임 모드를 지원한다.

### LOCAL

- demo/mock auth resolution
- mock profile resolution
- protected shell의 demo overlay 동작

### REMOTE

- API를 통한 backend login
- backend endpoint에서 profile resolution

같은 auth/session architecture가 공통 `AuthUser` contract를 통해 두 모드를 모두 지원한다.

---

## 무엇이 어디에 속하는가

### JWT / Session

여기에 속하는 것:

- identity
- access context
- client scope
- impersonation metadata

여기에 속하지 않는 것:

- 전체 profile payload
- auth identity와 무관한 UI 전용 flag
- 큰 domain object

---

### `AppUser`

여기에 속하는 것:

- UI 중심 user field
- profile 기반 rendering data
- application-specific user capability

---

### Separate Preference Runtime

preference는 `useCurrentPreference()`와 `PreferenceBootstrap`을 통한 별도 bootstrap/store 흐름으로 의도적으로 분리된다.

즉 다음을 의미한다.

- preference는 authentication state가 아니다
- preference는 session contract의 일부가 아니다
- preference hydration은 auth/session에 내장되지 않고 병렬로 수행된다

---

## 보안 고려사항

### 1. JWT Is the Trust Boundary

- JWT는 신뢰 가능한 authentication payload다
- Session은 JWT로부터 파생된다
- Zustand는 authoritative source가 아니다

---

### 2. No `localStorage` JWT Pattern

- JWT는 `localStorage`에 저장하지 않는다
- auth는 NextAuth의 JWT cookie handling에 의존한다

---

### 3. Client Stores Are Runtime Helpers Only

- `authSessionStore`와 `impersonationStore`는 런타임 사용성을 개선한다
- 서버 검증은 여전히 JWT/session 기반 auth context를 사용해야 한다

---

### 4. Impersonation Is Server-Gated

- impersonation 시작 가능 여부는 서버가 결정한다
- UI는 그 결과를 트리거하고 반영만 한다

---

## 트레이드오프

### Pros

- auth identity와 application user model 사이의 명확한 분리
- 안정적인 JWT/session contract
- UI가 enrichment된 `AppUser`를 사용할 수 있음
- LOCAL/REMOTE parity 지원
- session을 과도하게 키우지 않으면서 impersonation 지원

---

### Cons

- 단순한 `useSession()`보다 moving part가 많다
- query 결과와 client store 사이의 synchronization이 필요하다
- session은 작게 유지하고 AppUser enrichment는 명시적으로 하려는 규율이 필요하다

---

## 요약

`sunghwan-portal`의 auth/session architecture는 네 개의 레이어를 중심으로 구성된다.

```txt
NextAuth JWT
-> SessionUser projection
-> AppUser resolution
-> useCurrentSession() + Zustand facade
```

이 구조는 프로젝트에 다음을 제공한다.

- 안정적인 인증 코어
- 분리된 application user model
- 예측 가능한 protected-shell 동작
- impersonation과 user-aware UI를 위한 실용적인 클라이언트 런타임 모델

요약하면:

> **AuthUser는 사용자가 누구인지 증명한다.**
> **SessionUser는 안정적인 인증 컨텍스트를 전달한다.**
> **AppUser는 실제 애플리케이션 UI를 구동한다.**
