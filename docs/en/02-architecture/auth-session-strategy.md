# Auth & Session Strategy

## Goal

This document defines the authentication and session strategy used in `sunghwan-portal`.

The goal is to:

- Keep authentication aligned with **NextAuth JWT strategy**
- Separate **authentication identity** from the **application user model**
- Support both **LOCAL** and **REMOTE** runtime modes
- Provide a consistent client access pattern for authenticated user context
- Support impersonation without turning session data into a full domain model

---

## Core Principle

```txt
JWT = authentication truth
Session = auth projection for app/runtime usage
AppUser = application user model
Zustand = frontend runtime cache and facade
```

The important boundary is:

> **Session is not the full user domain model.**
> It provides stable authentication context, while `AppUser` is resolved separately.

---

## Authentication Stack

The current stack is:

- **NextAuth v4**
- **JWT session strategy**
- **Credentials provider**
- **Zustand** for frontend runtime session access

`authOptions` configures:

- `session.strategy = "jwt"`
- `CredentialsProvider`
- custom `jwt` and `session` callbacks through `authSession`

---

## User Model Boundaries

### 1. `AuthUser`

`AuthUser` is the server-trusted identity payload returned by login and stored in JWT.

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

Characteristics:

- Authentication-oriented
- Stable across requests
- Contains authorization-related identity fields
- Includes `accessToken`, which stays in JWT and server-side auth flow

---

### 2. `SessionUser`

The NextAuth session exposes:

```ts
type SessionUser = Omit<AuthUser, "accessToken">;
```

This is an important implementation detail:

- The session keeps identity and access context
- The session does **not** expose `accessToken`
- The session may also contain `impersonation` metadata

So the session is not "id only", but it is still intentionally smaller than the full application user model.

---

### 3. `AppUser`

`AppUser` is the application-facing user model used by the UI.

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

Compared to `AuthUser`, `AppUser` is:

- UI-facing
- Enriched from server/profile data
- Allowed to evolve with application concerns

---

## Why `AuthUser` and `AppUser` Are Separate

There are two different responsibilities:

| Model         | Responsibility                      |
| ------------- | ----------------------------------- |
| `AuthUser`    | Authentication and trusted identity |
| `SessionUser` | Session-safe identity projection    |
| `AppUser`     | UI and application behavior         |

This separation avoids a common problem:

- bloating JWT/session with domain fields
- mixing runtime UI concerns into authentication state
- making session changes too expensive or fragile

---

## Login and JWT Flow

### 1. Credentials Login

The project uses `CredentialsProvider`.

`authorize()` resolves an `AuthUser` through:

- LOCAL demo resolvers (`resolveDemoAuth`, `resolveClientAuth`)
- or REMOTE API login (`/auth/login`)

---

### 2. JWT Callback

On sign-in, the `jwt` callback stores the trusted auth fields in the token:

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

The JWT is the durable authentication source during the session lifecycle.

---

### 3. Session Callback

The `session` callback derives a session object from JWT:

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

If impersonation is active, the callback also exposes:

```ts
session.impersonation = {
  originalUserId,
  impersonatedUserId,
  activatedAt,
};
```

---

## AppUser Resolution Strategy

Full application user data is **not** treated as part of the JWT/session contract.

Instead, the application resolves `AppUser` separately.

### Server-Side Resolution

`getCurrentAppUser()` performs this flow:

```txt
getServerSession()
-> SessionUser/AuthUser context
-> mapAuthUserToAppUser()
-> apply enhancers
-> return AppUser
```

Current implementation:

- maps auth identity into base `AppUser`
- enriches it through server enhancers
- currently wires `withProfile`

This keeps authentication stable while allowing the application user model to grow independently.

---

### API Surface

The UI accesses user profile data through:

```txt
GET /api/users/me
GET /api/users/[userId]/profile
```

These APIs resolve the current or target application user without turning the session into a profile container.

---

## Client Access Pattern

### Problem

Using only `useSession()` is not enough for the current frontend architecture because:

- it exposes only the NextAuth session projection
- it is limited to React hook consumers
- the UI needs enriched `AppUser` data
- impersonation introduces an additional runtime layer

---

### Decision

The frontend uses a layered access pattern:

```txt
NextAuth session
-> fetch current AppUser
-> sync into authSessionStore
-> consume via useCurrentSession()
```

---

### `useCurrentSession()`

`useCurrentSession()` acts as the main frontend session facade.

It combines:

- NextAuth session state (`useSession`)
- current user profile query (`useCurrentUserProfileQuery`)
- Zustand `authSessionStore`
- Zustand `impersonationStore`

Its purpose is to give pages and components a stable UI-oriented session object:

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

This is the object the protected UI actually consumes.

---

### `authSessionStore`

`authSessionStore` is a client-side runtime cache for `CurrentSession`.

It is used to:

- hold the current `AppUser`
- hydrate from `sessionStorage`
- provide a stable update path for UI-facing session data
- clear cached data on sign-out

Important limitation:

> `authSessionStore` is **not** the source of truth for authentication.
> It is a frontend runtime cache/facade.
> It does not replace server/session-driven impersonation control.

The trusted source remains the JWT-backed NextAuth auth flow.

---

### Why This Is Acceptable

The state-management rule says:

```txt
Prefer server state over client state whenever possible
```

This strategy still follows that rule because:

- authentication truth stays in JWT/session
- `AppUser` still comes from server/API resolution
- Zustand only caches the runtime shape needed by the frontend shell

In other words, this is a **runtime user-context cache**, not an alternative auth source.

---

## Bootstrap Flow in the Protected App

The protected shell depends on `useCurrentSession()` and waits until an `AppUser` is available.

The runtime flow is:

```txt
User authenticated
-> useSession() resolves
-> useCurrentUserProfileQuery() fetches current AppUser
-> authSessionStore.setSession({ user })
-> ProtectedShell renders
-> AppUserBootstrap syncs originalUser into impersonation store
```

This gives the protected app a stable layout-level user context before feature pages render.

---

## Impersonation Integration

Impersonation is supported as part of the auth/session architecture.

### Session-Level Shape

The NextAuth session carries only minimal impersonation metadata:

```ts
type ImpersonationInfo = {
  originalUserId: string;
  impersonatedUserId: string;
  activatedAt: number;
};
```

This keeps session mutation small and auditable.

---

### Client Runtime Model

The client store expands that into a richer UI model:

```ts
type ImpersonationState = {
  originalUser: AppUser | null;
  impersonatedUser: AppUser | null;
  currentUser: AppUser | null;
};
```

Meaning:

- `originalUser`: the real logged-in user
- `impersonatedUser`: the impersonation target
- `currentUser`: the user the UI and authz should act as

---

### Runtime Flow

```txt
startImpersonation(impersonatedUserId)
-> POST /api/auth/impersonation
-> session.update({ impersonation })
-> useImpersonation() fetches impersonated user profile
-> impersonationStore.syncFromSession()
-> currentUser switches in UI
```

Stopping impersonation performs the reverse flow and clears session impersonation metadata.

---

### Current Authorization Rule

Based on the current implementation:

- only `INTERNAL` users with at least `ADMIN` access can start impersonation
- the impersonation target must be a `TENANT` user

This rule lives in the auth layer, not in the UI.

---

## Route Protection Strategy

The project currently uses two complementary layers:

### 1. Middleware

`middleware.ts`:

- ignores public/static/API traffic
- reads JWT using `getToken()`
- redirects unauthenticated access to the login page

Current caveat:

- middleware is conservative and mainly guards the protected root HTML navigation path
- it is not presented as the only protection mechanism for every client-side transition

---

### 2. Protected Shell

`ProtectedShell` adds runtime protection in the app layer:

- waits for session loading
- redirects unauthenticated users to `/login`
- blocks rendering until `CurrentSession.user` is ready

This means the UI is protected both by auth state and by the presence of the resolved `AppUser`.

---

## LOCAL vs REMOTE Support

The auth model supports two runtime modes:

### LOCAL

- demo/mock auth resolution
- mock profile resolution
- demo overlay behavior in the protected shell

### REMOTE

- backend login via API
- profile resolution from backend endpoints

The same auth/session architecture supports both modes through the shared `AuthUser` contract.

---

## What Belongs Where

### JWT / Session

Belongs here:

- identity
- access context
- client scope
- impersonation metadata

Does not belong here:

- full profile payload
- UI-specific flags unrelated to auth identity
- large domain objects

---

### `AppUser`

Belongs here:

- UI-facing user fields
- profile-driven rendering data
- application-specific user capabilities

---

### Separate Preference Runtime

Preferences are intentionally handled in a separate bootstrap/store flow
through `useCurrentPreference()` and `PreferenceBootstrap`.

That means:

- preferences are not authentication state
- preferences are not part of the session contract
- preference hydration is parallel to, not embedded in, auth/session

---

## Security Considerations

### 1. JWT Is the Trust Boundary

- JWT is the trusted authentication payload
- Session is derived from JWT
- Zustand is not authoritative

---

### 2. No `localStorage` JWT Pattern

- JWT is not stored in `localStorage`
- auth relies on NextAuth JWT cookie handling

---

### 3. Client Stores Are Runtime Helpers Only

- `authSessionStore` and `impersonationStore` improve runtime ergonomics
- server validation must still use JWT/session-derived auth context

---

### 4. Impersonation Is Server-Gated

- the server decides whether impersonation can start
- the UI only triggers and reflects the result

---

## Trade-offs

### Pros

- Clear separation between auth identity and application user model
- Stable JWT/session contract
- UI can work with enriched `AppUser`
- Supports LOCAL/REMOTE parity
- Supports impersonation without overloading session

---

### Cons

- More moving parts than plain `useSession()`
- Requires synchronization between query results and client stores
- Needs discipline to keep session minimal and AppUser enrichment explicit

---

## Summary

The auth/session architecture in `sunghwan-portal` is built around four layers:

```txt
NextAuth JWT
-> SessionUser projection
-> AppUser resolution
-> useCurrentSession() + Zustand facade
```

This gives the project:

- a stable authentication core
- a separate application user model
- predictable protected-shell behavior
- a practical client runtime model for impersonation and user-aware UI

In short:

> **AuthUser proves who the user is.**
> **SessionUser carries stable auth context.**
> **AppUser powers the actual application UI.**
