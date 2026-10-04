# Auth & Session Strategy

## 목표

이 문서는 `sunghwan-portal`에서 사용하는 인증 및 세션 전략을 정의합니다.

목표는 다음과 같습니다.

- 인증을 **NextAuth JWT 전략**에 맞게 유지합니다
- **인증에 사용하는 사용자 정보**와 **애플리케이션 사용자 모델**을 분리합니다
- **LOCAL**과 **REMOTE** 런타임 모드를 모두 지원합니다
- 클라이언트가 인증된 사용자 정보에 일관된 방식으로 접근하게 합니다
- 세션에 전체 도메인 모델을 담지 않으면서 impersonation(다른 사용자로 동작하기)을 지원합니다

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
> Session은 인증 정보와 접근 범위를 전달하고, UI에 필요한 `AppUser`는 별도로 구성합니다.

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

`AuthUser`는 로그인 후 반환되어 JWT에 저장되는 사용자 인증 정보이며, 서버가 이를
기준으로 사용자를 확인합니다.

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
- 사용자 식별과 권한 판단에 필요한 필드를 포함합니다
- `accessToken`을 포함하며, 이 값은 JWT와 서버 측 인증 처리에만 남습니다

---

### 2. `SessionUser`

NextAuth session은 다음 형태를 노출합니다.

```ts
type SessionUser = Omit<AuthUser, "accessToken">;
```

세션에 제공하는 정보의 범위는 다음과 같습니다.

- 세션은 사용자 식별 정보와 접근 범위를 유지합니다
- 세션은 `accessToken`을 노출하지 않습니다
- 세션은 추가로 `impersonation` 정보를 담을 수 있습니다

세션에는 ID 외에도 인증과 접근에 필요한 정보가 있습니다. 다만 전체 애플리케이션
사용자 모델보다 작은 범위로 유지합니다.

---

### 3. `AppUser`

`AppUser`는 UI가 사용하는 애플리케이션 사용자 모델입니다.

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
- 서버의 프로필 데이터로 필요한 정보를 보완합니다
- 애플리케이션 관점의 요구에 맞춰 확장될 수 있습니다

---

## 왜 `AuthUser`와 `AppUser`를 분리하는가

두 모델은 서로 다른 책임을 가집니다.

| Model         | Responsibility                   |
| ------------- | -------------------------------- |
| `AuthUser`    | 인증과 서버가 신뢰하는 사용자 정보 |
| `SessionUser` | 세션에 노출할 수 있는 인증 정보 |
| `AppUser`     | UI 표시와 애플리케이션 동작 |

두 모델을 분리하면 다음과 같은 흔한 문제를 피할 수 있습니다.

- JWT와 세션에 도메인 필드가 과도하게 들어가는 문제
- UI에서 관리하는 상태와 인증 상태가 섞이는 문제
- 세션 변경 비용이 커지거나 변경에 취약해지는 문제

---

## 로그인과 JWT 흐름

### 1. Credentials Login

프로젝트는 `CredentialsProvider`를 사용합니다.

`authorize()`는 다음 경로 중 하나로 `AuthUser`를 구성합니다.

- 내부 및 클라이언트 데모 계정을 모두 검색하는 통합 LOCAL 데모 사용자 조회 함수
  (`resolveDemoAuth`)
- 또는 REMOTE 로그인 API (`/auth/login`)

---

### 2. JWT Callback

로그인 시 `jwt` 콜백은 다음 인증 필드를 토큰에 저장합니다.

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

세션이 유지되는 동안 인증 판단의 기준은 JWT에 저장된 정보입니다.

---

### 3. Session Callback

`session` 콜백은 JWT의 값으로 세션 객체를 구성합니다.

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

impersonation이 활성화되어 있으면 콜백은 추가로 다음 정보를 노출합니다.

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

JWT와 세션에 전달하는 정보에는 전체 애플리케이션 사용자 데이터를 포함하지 않습니다.

애플리케이션은 `AppUser`를 별도로 구성합니다.

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

- 인증 정보로 기본 `AppUser`를 구성합니다
- 서버의 보완 함수(enhancer)로 정보를 추가합니다
- 현재는 프로필을 추가하는 `withProfile`을 연결합니다

따라서 인증 정보의 형식을 유지하면서 애플리케이션 사용자 모델을 독립적으로 확장할 수 있습니다.

---

### API Surface

UI는 다음 API로 사용자 프로필 데이터를 조회합니다.

```txt
GET /api/users/me/profile
GET /api/users/[userId]/profile
```

이 API들은 현재 사용자 또는 대상 사용자의 프로필을 구성해 반환합니다. 세션에
전체 프로필을 담을 필요가 없습니다.

---

## 클라이언트 접근 패턴

### Problem

현재 프론트엔드 아키텍처에서는 `useSession()`만으로는 충분하지 않습니다. 이유는 다음과 같습니다.

- NextAuth 세션에 포함된 정보만 노출합니다
- React 훅을 사용할 수 있는 곳에서만 접근할 수 있습니다
- UI에는 프로필 정보가 보완된 `AppUser`가 필요합니다
- impersonation에서는 원래 사용자와 현재 사용자를 추가로 관리해야 합니다

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

`useCurrentSession()`은 프론트엔드가 세션 정보에 접근하는 공통 창구입니다.

이 훅은 다음을 결합합니다.

- NextAuth session state (`useSession`)
- current user profile query (`useCurrentUserProfileQuery`)
- Zustand `authSessionStore`
- Zustand `impersonationStore`

페이지와 컴포넌트에는 UI에 필요한 정보를 모은 세션 객체를 제공합니다.

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

인증이 필요한 UI는 이 객체를 사용합니다.

impersonation 중 `CurrentSession.user`는 항상 대신 동작할 대상인 현재 사용자를 나타냅니다.

```txt
impersonated AppUser ?? original logged-in AppUser
```

`useCurrentSession()`은 auth/session 작업을 위해 기반 NextAuth 결과도 함께
노출합니다. 원래 인증된 사용자와 UI에서 사용하는 현재 사용자는 아래처럼 구분합니다.

```ts
const session = useCurrentSession();

session.data?.user; // original authenticated SessionUser
session.current.user; // UI가 사용하는 effective AppUser
```

---

### `authSessionStore`

`authSessionStore`는 클라이언트에서 `CurrentSession`을 보관하는 실행 중 캐시입니다.

용도는 다음과 같습니다.

- 현재 `AppUser`를 보관합니다
- `sessionStorage`에서 저장된 값을 복원합니다
- UI가 사용하는 세션 데이터를 공통 경로로 갱신합니다
- 로그아웃 시 캐시된 데이터를 정리합니다

중요한 제한:

> `authSessionStore`는 인증 판단의 기준이 아니라 프론트엔드 캐시입니다.
> 서버와 세션에서 수행하는 impersonation 제어를 대체하지 않습니다.

인증 판단의 기준은 여전히 JWT를 사용하는 NextAuth 인증 처리입니다.

---

### Why This Is Acceptable

state-management 원칙은 다음과 같습니다.

```txt
Prefer server state over client state whenever possible
```

이 전략은 여전히 그 원칙을 따릅니다. 이유는 다음과 같습니다.

- 인증 판단에 필요한 정보는 JWT와 세션에 남습니다
- `AppUser`는 서버와 API가 구성한 결과를 사용합니다
- Zustand는 프론트엔드 셸에 필요한 실행 중 상태만 캐시합니다

Zustand의 역할은 **실행 중 사용자 정보를 보관하는 캐시**입니다.

---

## 보호 영역의 부트스트랩 흐름

인증이 필요한 화면의 셸은 `useCurrentSession()`을 사용하며, `AppUser`가 준비될
때까지 기다립니다.

런타임 흐름은 다음과 같습니다.

```txt
User authenticated
-> useSession() resolves
-> useCurrentUserProfileQuery() fetches current AppUser
-> authSessionStore.setSession({ user })
-> ProtectedShell renders
-> AppUserBootstrap syncs originalUser into impersonation store
```

이 흐름으로 기능 페이지를 렌더링하기 전에 레이아웃에서 사용할 사용자 정보를 준비합니다.

---

## Impersonation 통합

impersonation은 인증·세션 구조에 통합되어 있습니다.

### Session-Level Shape

NextAuth 세션에는 impersonation에 필요한 최소한의 정보만 담습니다.

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

세션에서 변경하는 값을 줄이고, 누가 언제 impersonation을 시작했는지 추적할 수 있습니다.

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

impersonation을 종료하면 반대 순서로 처리하며 세션의 impersonation 정보를 정리합니다.

---

### Current Authorization Rule

현재 구현 기준 규칙은 다음과 같습니다.

- `INTERNAL` 관리자만 impersonation을 시작할 수 있습니다
- 대상은 내부 데모 계정을 포함한 `INTERNAL` 또는 `CLIENT` 사용자일 수 있습니다
- 대상은 원래 사용자와 달라야 하며 권한 수준이 더 낮아야 합니다

API와 JWT 갱신 콜백은 같은 서버 정책을 사용합니다. 콜백은 토큰을 갱신하기
직전에 대상을 다시 조회하고 검증하며, 클라이언트가 전달한 원래 사용자 정보와
활성화 시각 대신 서버에서 구성한 값을 저장합니다.

---

## 라우트 보호 전략

프로젝트는 현재 두 개의 보완적인 보호 레이어를 사용합니다.

### 1. Next.js Proxy

`src/proxy.ts`는 다음을 수행합니다.

- 공개 페이지, 정적 파일, API 요청은 건너뜁니다
- `getToken()`으로 JWT를 읽습니다
- 인증되지 않은 접근은 로그인 페이지로 이동시킵니다

현재 제한:

- Proxy는 중첩 라우트를 포함해 인증이 필요한 HTML 문서로의 이동을 보호합니다
- 클라이언트의 모든 화면 이동을 Proxy 하나로 보호한다고 보장하지는 않습니다

API 라우트는 각 서버 처리 지점에서 요청 권한을 확인합니다. Next.js 16으로
마이그레이션한 뒤 Proxy가 기존 `middleware.ts` 진입점을 대체합니다.

---

### 2. Protected Shell

`ProtectedShell`은 애플리케이션 계층에서 실행 중 접근을 추가로 보호합니다.

- 세션 로딩을 기다립니다
- 인증되지 않은 사용자를 `/login`으로 이동시킵니다
- `CurrentSession.user`가 준비될 때까지 렌더링을 막습니다

UI는 인증 상태와 구성된 `AppUser`가 있는지를 함께 확인합니다.

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

두 모드는 같은 `AuthUser` 형식과 인증·세션 구조를 사용합니다.

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

사용자 환경 설정은 `useCurrentPreference()`와 `PreferenceBootstrap`을 통해
인증과 별도로 초기화하고 저장소에 반영합니다.

즉 다음을 의미합니다.

- 사용자 환경 설정은 인증 상태가 아닙니다
- 사용자 환경 설정은 세션 데이터에 포함하지 않습니다
- 환경 설정 복원은 인증·세션 처리와 별도로 병렬 수행합니다

---

## 보안 고려사항

### 1. JWT Is the Trust Boundary

- JWT는 서버가 신뢰하는 인증 정보입니다
- 세션은 JWT의 값으로 구성합니다
- Zustand의 값은 인증 판단의 기준이 아닙니다

---

### 2. No `localStorage` JWT Pattern

- JWT는 `localStorage`에 저장하지 않습니다
- 인증은 NextAuth의 JWT 쿠키 처리를 사용합니다

---

### 3. Client Stores Are Runtime Helpers Only

- `authSessionStore`와 `impersonationStore`는 런타임 사용성을 개선합니다
- 서버는 JWT와 세션에서 확인한 인증 정보로 검증해야 합니다

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

- `useSession()`만 사용하는 방식보다 구성 요소가 많습니다
- 쿼리 결과와 클라이언트 저장소 사이의 동기화가 필요합니다
- 세션의 범위를 작게 유지하고 `AppUser` 보완은 별도로 처리해야 합니다

---

## 요약

`sunghwan-portal`의 인증·세션 구조는 다음 네 계층으로 구성합니다.

```txt
NextAuth JWT
-> SessionUser projection
-> AppUser resolution
-> useCurrentSession() + Zustand facade
```

이 구조는 프로젝트에 다음을 제공합니다.

- 안정적인 인증 처리
- 별도로 구성하는 애플리케이션 사용자 모델
- 인증이 필요한 화면의 예측 가능한 셸 동작
- impersonation과 사용자별 UI를 지원하는 클라이언트 실행 중 상태

요약하면:

> **AuthUser는 사용자가 누구인지 증명합니다.**
> **SessionUser는 안정적인 인증 컨텍스트를 전달합니다.**
> **AppUser는 실제 애플리케이션 UI를 구동합니다.**
