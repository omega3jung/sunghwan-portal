# Session User Boundary (2026-01)

## Context

The project uses **NextAuth (JWT strategy)** for authentication.

Initially, the session user (`session.user`) was considered as a candidate to carry full user information for UI usage.

At the same time, the application introduced a richer domain model (`AppUser`) that includes:

- profile data (image)
- preference
- feature flags (impersonation, super user)
- extended permission context

This led to a key question:

> Should `session.user` be expanded to match `AppUser`?

---

## Problem

There was a mismatch between:

- `session.user` (AuthUser, minimal)
- `AppUser` (domain user, enriched)

Attempting to unify them caused several issues:

### 1. Session becomes bloated

- JWT size increases
- unnecessary data is stored in cookies
- frequent invalidation risk

---

### 2. Domain leakage into authentication layer

- Session starts depending on UI needs
- Authentication loses its single responsibility

---

### 3. Type instability on client

- `session.user` appears as `AppUser`
- but actual values are incomplete (`null`)
- leads to unsafe assumptions

---

### 4. Data freshness issues

- Profile / preference changes require session refresh
- breaks real-time UX expectations

---

## Options Considered

### Option 1 — Expand session.user to full AppUser

```txt
session.user = AppUser
```

**Pros**

- Easy access in UI
- fewer API calls

**Cons**

- breaks separation of concerns
- heavy session payload
- stale data risk
- tight coupling between auth and domain

---

### Option 2 — Keep session minimal, fetch AppUser separately

```txt
session.user = AuthUser (minimal)
AppUser = fetched via API
```

**Pros**

- clean separation of concerns
- smaller and stable session
- real-time data updates
- scalable architecture

**Cons**

- additional fetch required
- bootstrap complexity

---

### Option 3 — Hybrid (partial expansion)

```txt
session.user = partial AppUser
```

**Pros**

- some convenience

**Cons**

- unclear boundary
- inconsistent data model
- hardest to maintain

---

## Decision

**Option 2 is selected.**

> Session remains minimal (`AuthUser`)
> Full user data (`AppUser`) is fetched separately.

---

## Implementation

### 1. Session structure

```ts
session.user = AuthUser;
```

- contains identity + access control only

---

### 2. AppUser bootstrap

```tsx
<AppUserBootstrap userId={session.user.id}>{children}</AppUserBootstrap>
```

```txt
session.user.id
      ↓
fetch AppUser
      ↓
hydrate client state
```

---

### 3. Strict boundary

- Session NEVER contains:
  - profile (image)
  - preference
  - feature flags

- AppUser ALWAYS comes from server/API

---

## Consequences

### Positive

- Clear separation between auth and domain
- Stable session behavior
- Improved scalability
- Better data freshness
- Easier reasoning about data flow

---

### Negative

- Requires bootstrap layer
- Slight increase in initial data fetching

---

## Follow-up Decisions

This decision directly influenced:

- introduction of `AppUserBootstrap`
- separation of `AuthUser` and `AppUser`
- API design (`/api/user-profile`)
- impersonation handling strategy

---

## Key Insight

> **Session provides identity.
> Domain provides behavior.**

Mixing them leads to architectural instability.

---

## Status

Accepted
