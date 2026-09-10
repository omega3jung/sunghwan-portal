# Auth & Session Strategy

## 목표

이 문서는 `sunghwan-portal`에서 사용하는 인증 및 세션 전략을 정의합니다.

목표는 다음과 같습니다.

- 인증을 **NextAuth JWT 전략**에 맞게 유지합니다
- **인증 정체성**과 **애플리케이션 사용자 모델**을 분리합니다
- **LOCAL**과 **REMOTE** 런타임 모드를 모두 지원합니다
- 인증된 사용자 컨텍스트에 대해 일관된 클라이언트 접근 패턴을 제공합니다
- 세션 데이터를 전체 도메인 모델로 비대하게 만들지 않으면서 impersonation을 지원합니다

---

## 핵심 원칙

```txt
JWT = authentication truth
Session = auth projection for app/runtime usage
AppUser = application user model
Zustand = frontend runtime cache and facade
```

중요한 경계는 다음과 같습니다.

> **Session은 전체 사용자 도메인 모델이 아닙니다.**
> Session은 안정적인 인증 컨텍스트를 제공하고, `AppUser`는 별도로 해석됩니다.

---

## 인증 스택

현재 스택은 다음과 같습니다.

- **NextAuth v4**
- **JWT session strategy**
- **Credentials provider**
- 프론트엔드 런타임 세션 접근을 위한 **Zustand**

`authOptions`는 다음을 구성합니다.

- `session.strategy = "jwt"`
- `CredentialsProvider`
- `authSession`을 통한 custom `jwt`, `session` callback

---

## 사용자 모델 경계

### 1. `AuthUser`

`AuthUser`는 로그인 후 반환되어 JWT에 저장되는, 서버가 신뢰하는 identity payload입니다.

```ts
type AuthUser = {
  id: string;
  username: string;
  displayName: LocalizedText;
  email: string;
  accessToken: string;

  dataScope: "LOCAL" | "REMOTE";
  userScope: "INTERNAL" | "CLIENT";
  companyId: number;
  permission: AccessLevel;
  role: Role;
};
```

특징:

- 인증 중심 모델입니다
- 요청 간 안정적으로 유지됩니다
- 권한 관련 identity field를 포함합니다
- `accessToken`을 포함하며, 이 값은 JWT와 서버 측 auth flow에만 남습니다

---

### 2. `SessionUser`

NextAuth session은 다음 형태를 노출합니다.

```ts
type SessionUser = Omit<AuthUser, "accessToken">;
```

이 점은 중요한 구현 세부사항입니다.

- session은 identity와 access context를 유지합니다
- session은 `accessToken`을 노출하지 않습니다
- session은 추가로 `impersonation` metadata를 담을 수 있습니다

즉 session은 단순히 "id만 있는 구조"는 아니지만, 여전히 전체 application user model보다 의도적으로 더 작게 유지됩니다.

---

### 3. `AppUser`

`AppUser`는 UI가 사용하는 application-facing 사용자 모델입니다.

```ts
type AppUser = {
  id: string;
  username: string;
  displayName: LocalizedText;
  email: string | null;
  image?: string;

  userScope: UserScope;
  companyId: number;

  permission: AccessLevel;

  canUseSuperUser: boolean | null;
  canUseImpersonation: boolean | null;
};
```

`AuthUser`와 비교하면 `AppUser`는 다음 성격을 가집니다.

- UI 중심 모델입니다
- 서버/profile 데이터를 통해 enrichment됩니다
- 애플리케이션 관점의 요구에 맞춰 확장될 수 있습니다

---

## 왜 `AuthUser`와 `AppUser`를 분리하는가

두 모델은 서로 다른 책임을 가집니다.

| Model         | Responsibility                   |
| ------------- | -------------------------------- |
| `AuthUser`    | 인증과 신뢰 가능한 identity      |
| `SessionUser` | session-safe identity projection |
| `AppUser`     | UI와 application behavior        |

두 모델을 분리하면 다음과 같은 흔한 문제를 피할 수 있습니다.

- JWT/session에 domain field가 과도하게 들어가는 문제
- 런타임 UI 관심사를 authentication state와 뒤섞는 문제
- session 변경이 지나치게 비싸거나 취약해지는 문제

---

## 로그인과 JWT 흐름

### 1. Credentials Login

프로젝트는 `CredentialsProvider`를 사용합니다.

`authorize()`는 다음 경로 중 하나로 `AuthUser`를 해석합니다.

- internal 및 client demo identity를 모두 검색하는 통합 LOCAL demo resolver
  (`resolveDemoAuth`)
- 또는 REMOTE API login (`/auth/login`)

---

### 2. JWT Callback

sign-in 시 `jwt` callback은 다음 신뢰 가능한 auth field를 token에 저장합니다.

- `id`
- `username`
- `displayName`
- `email`
- `accessToken`
- `dataScope`
- `userScope`
- `companyId`
- `permission`
- `role`

JWT는 session lifecycle 동안 지속되는 인증의 기준 소스입니다.

---

### 3. Session Callback

`session` callback은 JWT로부터 session object를 파생합니다.

```ts
session.user = {
  id,
  username,
  displayName,
  email,
  dataScope,
  userScope,
  companyId,
  permission,
  role,
};
```

impersonation이 활성화되어 있다면 callback은 추가로 다음을 노출합니다.

```ts
session.impersonation = {
  originalUser: {
    id,
    username,
  },
  impersonatedUser: {
    username,
  },
  activatedAt,
};
```

---

## AppUser 해석 전략

전체 application user data는 JWT/session contract의 일부로 취급하지 않습니다.

대신 애플리케이션은 `AppUser`를 별도로 해석합니다.

### Server-Side Resolution

`getCurrentAppUser()`는 다음 흐름으로 동작합니다.

```txt
getServerSession()
-> SessionUser/AuthUser context
-> mapAuthUserToAppUser()
-> apply enhancers
-> return AppUser
```

현재 구현은 다음과 같습니다.

- auth identity를 base `AppUser`로 매핑합니다
- 서버 enhancer를 통해 enrichment합니다
- 현재는 `withProfile`을 연결하고 있습니다

이 방식은 authentication을 안정적으로 유지하면서도 application user model이 독립적으로 확장되게 해줍니다.

---

### API Surface

UI는 다음 API를 통해 user profile data에 접근합니다.

```txt
GET /api/users/me/profile
GET /api/users/[userId]/profile
```

이 API들은 session을 profile container로 만들지 않으면서 현재 사용자 혹은 대상 application user를 해석합니다.

---

## 클라이언트 접근 패턴

### Problem

현재 프론트엔드 아키텍처에서는 `useSession()`만으로는 충분하지 않습니다. 이유는 다음과 같습니다.

- NextAuth session projection만 노출합니다
- React hook consumer에서만 사용할 수 있습니다
- UI는 enrichment된 `AppUser` data를 필요로 합니다
- impersonation은 추가적인 런타임 레이어를 도입합니다

---

### Decision

프론트엔드는 계층형 접근 패턴을 사용합니다.

```txt
NextAuth session
-> fetch current AppUser
-> sync into authSessionStore
-> consume via useCurrentSession()
```

---

### `useCurrentSession()`

`useCurrentSession()`은 프론트엔드의 주요 session facade 역할을 합니다.

이 훅은 다음을 결합합니다.

- NextAuth session state (`useSession`)
- current user profile query (`useCurrentUserProfileQuery`)
- Zustand `authSessionStore`
- Zustand `impersonationStore`

목적은 page와 component에 안정적인 UI 지향 session object를 제공하는 것입니다.

```ts
type CurrentSession = {
  user: AppUser | null;
  isDemoUser: boolean;
  isSuperUser: boolean;
  isClient: boolean;
  superUserActivated: Date | null;
  security: {
    loginLockedUntil: number | null;
    failedAttempts: number;
    requiresCaptcha: boolean;
  };
};
```

실제로 protected UI가 소비하는 것은 이 객체입니다.

impersonation 중 `CurrentSession.user`는 항상 effective user를 나타냅니다.

```txt
impersonated AppUser ?? original logged-in AppUser
```

`useCurrentSession()`은 auth/session 작업을 위해 기반 NextAuth 결과도 함께
노출합니다. 두 사용자 projection의 의미는 의도적으로 다릅니다.

```ts
const session = useCurrentSession();

session.data?.user; // original authenticated SessionUser
session.current.user; // UI가 사용하는 effective AppUser
```

---

### `authSessionStore`

`authSessionStore`는 `CurrentSession`을 위한 client-side runtime cache입니다.

용도는 다음과 같습니다.

- 현재 `AppUser`를 보관합니다
- `sessionStorage`에서 hydrate합니다
- UI 중심 session data에 대해 안정적인 update 경로를 제공합니다
- sign-out 시 캐시된 데이터를 정리합니다

중요한 제한:

> 또한 server/session 기반 impersonation 제어를 대체하지 않습니다.

신뢰 가능한 기준 소스는 여전히 JWT 기반 NextAuth auth flow입니다.

---

### Why This Is Acceptable

state-management 원칙은 다음과 같습니다.

```txt
Prefer server state over client state whenever possible
```

이 전략은 여전히 그 원칙을 따릅니다. 이유는 다음과 같습니다.

- authentication truth는 JWT/session에 남습니다
- `AppUser`는 여전히 서버/API 해석 결과에서 옵니다
- Zustand는 프론트엔드 shell에 필요한 runtime shape만 캐시합니다

즉 이것은 대체 auth source가 아니라, **runtime user-context cache**입니다.

---

## 보호 영역의 부트스트랩 흐름

protected shell은 `useCurrentSession()`에 의존하며, `AppUser`가 준비될 때까지 기다립니다.

런타임 흐름은 다음과 같습니다.

```txt
User authenticated
-> useSession() resolves
-> useCurrentUserProfileQuery() fetches current AppUser
-> authSessionStore.setSession({ user })
-> ProtectedShell renders
-> AppUserBootstrap syncs originalUser into impersonation store
```

이 흐름을 통해 feature page가 렌더링되기 전에 protected app의 layout-level user context를 안정적으로 준비합니다.

---

## Impersonation 통합

impersonation은 auth/session architecture의 일부로 지원됩니다.

### Session-Level Shape

NextAuth session은 최소한의 impersonation metadata만 담습니다.

```ts
type OriginalUserInfo = {
  id: string; // authentication/account identity id
  username: string; // internal unique key
};

type ImpersonatedUserInfo = {
  username: string; // effective identity key
};

type ImpersonationInfo = {
  originalUser: OriginalUserInfo;
  impersonatedUser: ImpersonatedUserInfo;
  activatedAt: number;
};
```

이렇게 하면 session mutation을 작고 audit 가능하게 유지할 수 있습니다.

---

### Client Runtime Model

클라이언트 store는 이를 더 풍부한 UI 모델로 확장합니다.

```ts
type ImpersonationState = {
  originalUser: AppUser | null;
  impersonatedUser: AppUser | null;
  currentUser: AppUser | null;
};
```

의미는 다음과 같습니다.

- `originalUser`: 실제 로그인한 사용자
- `impersonatedUser`: impersonation 대상 사용자
- `currentUser`: UI와 권한 판단이 기준으로 삼는 사용자

---

### Runtime Flow

```txt
startImpersonation(impersonatedUsername)
-> POST /api/auth/impersonation
-> session.update({ impersonation })
-> useCurrentUserProfileQuery() fetches the effective user profile
-> impersonationStore.syncFromSession()
-> currentUser switches in UI
```

impersonation을 종료하면 반대 흐름을 수행하며 session의 impersonation metadata를 정리합니다.

---

### Current Authorization Rule

현재 구현 기준 규칙은 다음과 같습니다.

- `INTERNAL` 사용자이면서 최소 `ADMIN` 권한 이상인 경우만 impersonation을 시작할 수 있습니다
- impersonation 대상은 `CLIENT` 사용자여야 합니다

이 규칙은 UI가 아니라 auth layer에 위치합니다.

---

## 라우트 보호 전략

프로젝트는 현재 두 개의 보완적인 보호 레이어를 사용합니다.

### 1. Middleware

`middleware.ts`는 다음을 수행합니다.

- public/static/API 트래픽은 무시합니다
- `getToken()`으로 JWT를 읽습니다
- 인증되지 않은 접근을 login page로 redirect합니다

현재 caveat:

- middleware는 보수적으로 동작하며 주로 보호된 루트 HTML navigation path를 가드합니다
- 모든 client-side transition의 유일한 보호 메커니즘으로 설명되지는 않습니다

---

### 2. Protected Shell

`ProtectedShell`은 app layer에서 런타임 보호를 추가합니다.

- session loading을 기다립니다
- 인증되지 않은 사용자를 `/login`으로 redirect합니다
- `CurrentSession.user`가 준비될 때까지 렌더링을 막습니다

즉 UI는 auth state와 해석된 `AppUser`의 존재를 기준으로 함께 보호됩니다.

---

## LOCAL vs REMOTE 지원

auth model은 두 런타임 모드를 지원합니다.

### LOCAL

- demo/mock auth resolution
- mock profile resolution
- protected shell의 demo overlay 동작

### REMOTE

- API를 통한 backend login
- backend endpoint에서 profile resolution

같은 auth/session architecture가 공통 `AuthUser` contract를 통해 두 모드를 모두 지원합니다.

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

preference는 `useCurrentPreference()`와 `PreferenceBootstrap`을 통한 별도 bootstrap/store 흐름으로 의도적으로 분리됩니다.

즉 다음을 의미합니다.

- preference는 authentication state가 아닙니다
- preference는 session contract의 일부가 아닙니다
- preference hydration은 auth/session에 내장되지 않고 병렬로 수행됩니다

---

## 보안 고려사항

### 1. JWT Is the Trust Boundary

- JWT는 신뢰 가능한 authentication payload입니다
- Session은 JWT로부터 파생됩니다
- Zustand는 authoritative source가 아닙니다

---

### 2. No `localStorage` JWT Pattern

- JWT는 `localStorage`에 저장하지 않습니다
- auth는 NextAuth의 JWT cookie handling에 의존합니다

---

### 3. Client Stores Are Runtime Helpers Only

- `authSessionStore`와 `impersonationStore`는 런타임 사용성을 개선합니다
- 서버 검증은 여전히 JWT/session 기반 auth context를 사용해야 합니다

---

### 4. Impersonation Is Server-Gated

- impersonation 시작 가능 여부는 서버가 결정합니다
- UI는 그 결과를 트리거하고 반영만 합니다

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

- 단순한 `useSession()`보다 moving part가 많습니다
- query 결과와 client store 사이의 synchronization이 필요합니다
- session은 작게 유지하고 AppUser enrichment는 명시적으로 하려는 규율이 필요합니다

---

## 요약

`sunghwan-portal`의 auth/session architecture는 네 개의 레이어를 중심으로 구성됩니다.

```txt
NextAuth JWT
-> SessionUser projection
-> AppUser resolution
-> useCurrentSession() + Zustand facade
```

이 구조는 프로젝트에 다음을 제공합니다.

- 안정적인 인증 코어
- 분리된 application user model
- 예측 가능한 protected-shell 동작
- impersonation과 user-aware UI를 위한 실용적인 클라이언트 런타임 모델

요약하면:

> **AuthUser는 사용자가 누구인지 증명합니다.**
> **SessionUser는 안정적인 인증 컨텍스트를 전달합니다.**
> **AppUser는 실제 애플리케이션 UI를 구동합니다.**
