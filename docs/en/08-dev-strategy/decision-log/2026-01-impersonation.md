# Impersonation (Server Session Approach) (2026-01)

## Context

The initial impersonation implementation based on `sessionStorage` revealed critical limitations:

- Client-only state
- Inconsistent behavior between UI and API
- Lack of security and auditability
- No SSR support

---

### Goal

Evolve impersonation into a **production-aligned, secure, and consistent system**
by integrating it into a server-controlled session.

---

## 1. Key Decision

### Decision

Move impersonation from **client-side state** to a **server-controlled session model** using NextAuth.

---

### Direction

```txt id="server-session-decision"
Client state -> Server session (NextAuth)
```

---

## 2. Approach

### Strategy

- Extend the NextAuth session
- Inject impersonation context into the session object
- Use the session as the single source of truth

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

- The user currently acting in the system
- Used for UI rendering and API requests

---

### originalUser

- The authenticated user
- The user who initiated impersonation

---

## 4. Runtime Behavior

### Activation Flow

```txt id="activation-flow"
Admin selects user -> Update session -> Impersonation starts
```

---

### Deactivation Flow

```txt id="deactivation-flow"
Stop impersonation -> Restore originalUser -> Reset session
```

---

### Behavior

- All API requests use `effectiveUser`
- The UI reflects the impersonated identity
- The system still preserves `originalUser` for audit and security checks

---

## 5. Why Server Session Was Chosen

### 1. Consistency

- Keeps identity aligned across UI, API, and server
- Eliminates mismatch between frontend and backend behavior
- Ensures more predictable runtime behavior

---

### 2. Security

- Cannot be casually manipulated from the client
- Controlled through the authenticated session
- Allows role-based restrictions to be enforced centrally

---

### 3. SSR Compatibility

- Works with Next.js App Router
- Available in server components and route handlers

---

### 4. Auditability

- Preserves both original and effective user identity
- Enables full action tracing

---

## 6. Integration with NextAuth

### Strategy

Keep the default authentication flow and extend the session through callbacks.

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

- Minimal disruption to the existing auth system
- Centralized control of identity context
- Cleaner integration with the current authentication model

---

## 7. Authorization Strategy

### Rule

```id="authorization-rule"
Impersonation must not allow privilege escalation
```

---

### Behavior

- Actions are performed as `effectiveUser`
- The system still validates permissions with awareness of `originalUser`
- The original actor remains traceable throughout the flow

---

### Example

- Admin impersonates a user
- Actions are taken in the user context
- The system still knows the original actor is the admin

---

## 8. UI Strategy

### Requirements

When impersonation is active, the UI should:

- Display an impersonation banner
- Show the impersonated user identity clearly
- Provide an obvious `Stop Impersonation` action

---

### Reason

- Prevent confusion
- Improve transparency
- Reduce unintended actions under the wrong identity

---

## 9. API Strategy

### Behavior

- The server reads the session
- Data access uses `effectiveUser`
- Audit logging stores `originalUser`

---

## 10. Migration from the Local Approach

### Before

- `sessionStorage`
- UI-only override
- No backend awareness

---

### After

- Server session with NextAuth
- Full-stack consistency
- Secure and traceable behavior

---

## 11. Trade-offs

### Pros

- Secure and reliable
- Consistent across client and server
- Supports SSR
- Enables audit logging

---

### Cons

- Increased implementation complexity
- Requires session extension logic
- Demands more careful permission handling

---

## 12. Alternatives Considered

### 1. Keep Client-Side Approach

- Simple
- Inconsistent
- Not secure

---

### 2. Separate Impersonation Token

- Flexible
- Adds integration complexity
- Harder to align with the existing auth flow

---

### 3. Backend-Only Switching

- Secure
- Limited UI awareness
- Less usable for full workflow verification

---

## 13. Key Insight

```id="server-session-insight"
Impersonation is part of authentication context, not UI state
```

---

## Summary

The impersonation system evolved from a **client-side prototype** to a
**server-controlled session model**, enabling secure, consistent, and fully traceable
user context switching across the entire application.
