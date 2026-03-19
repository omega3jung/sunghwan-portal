# Auth & Session Architecture (2025-12)

## Context

The Service Desk system needed an authentication and session model that could support:

- Secure login and route protection
- Clear separation between authentication, session, and client state
- Role-aware UI behavior
- Impersonation as a first-class feature
- Traceability and auditability

At this stage, the goal was not just to authenticate users, but to establish a stable foundation
for all user-context-dependent behavior across the application.

---

## 1. Core Principle

```txt
Authentication verifies identity
Session provides runtime context
Client state controls UI behavior
```

---

## 2. Key Concepts

### 1. JWT (Authentication Layer)

- Stateless token issued after login
- Stored in HTTP-only cookies
- Used for server-side validation

---

### 2. Session (Runtime Context)

- Derived from JWT
- Used across UI and application logic
- Extended to support impersonation

---

### 3. Client State (Control Layer)

- Managed using Zustand
- Used for:
  - session access outside React hooks
  - impersonation control
  - UI state

---

## 3. Architecture Overview

```txt
Login
-> JWT issued (cookie)
-> Middleware validates JWT
-> Session derived (NextAuth)
-> Synced to Zustand
-> UI consumes effective user
```

---

## 4. Why This Architecture Was Chosen

### 1. Separation of Concerns

| Layer | Responsibility |
| ----- | -------------- |
| JWT | Identity verification |
| Session | Runtime context |
| Zustand | UI + control layer |

---

### 2. Scalability

- Stateless JWT supports horizontal scaling
- No DB session dependency
- Works with Edge Middleware

---

### 3. Extensibility

- Supports impersonation
- Enables role-based UI behavior
- Leaves room for future audit extensions

---

## 5. Session Model

### Base Structure

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

### Integration with Impersonation

```ts
session = {
  user: effectiveUser,
  originalUser: originalUser,
  isImpersonating: boolean,
};
```

---

### Concepts

#### `effectiveUser`

- Used by UI and API
- Represents the current working identity

#### `originalUser`

- The actual authenticated user
- Used for audit and traceability

#### `isImpersonating`

- Indicates whether impersonation mode is active

---

### Why This Matters

This structure enables:

- Full audit trail
- Role-aware UI rendering
- Safe context switching

---

## 6. Client-Side Integration (Zustand)

### Impersonation State Model

```ts
type ImpersonationState = {
  actor: AppUser | null; // original user
  subject: AppUser | null; // impersonated user
  effective: AppUser | null; // current UI user
};
```

---

### Responsibilities

| Field | Meaning |
| ----- | ------- |
| actor | Original authenticated user |
| subject | Impersonated user |
| effective | Active user in UI |

---

### Data Flow

```txt
NextAuth Session -> Sync -> Zustand -> UI
```

---

### Integration Rules

- `actor` is set after login
- `subject` is set when impersonation starts
- `effective` is always used by the UI

---

### Design Principle

```txt
NextAuth = source of truth
Zustand = runtime control layer
```

---

## 7. Impersonation Lifecycle

```txt
Login -> setActor
-> Start Impersonation -> setSubject
-> effective user changes
-> UI re-renders
-> Stop Impersonation -> restore actor
```

---

### Important Distinction

| Action | Behavior |
| ------ | -------- |
| Stop Impersonation | Restore original user |
| Sign Out | Clear entire session |

---

## 8. UI Integration

Impersonation is explicitly reflected in the UI.

---

### UI Behavior

- Global impersonation indicator (e.g. banner / label)
- Visible `Stop Impersonation` action
- Layout-level awareness
- Immediate user context switch

---

### Example

- Sidebar menu changes based on the effective user
- Role-based rendering is applied instantly
- Demo mode UI can expose state such as a LOCAL border indicator

---

### Purpose

- Prevent user confusion
- Ensure transparency
- Enable safe testing and debugging

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

## 10. Middleware Strategy

### Behavior

- Runs before page rendering
- Validates JWT via `getToken()`
- Redirects if unauthenticated

---

### Benefits

- No client-side flicker
- Early access control
- Works with App Router

---

## 11. Security Considerations

### 1. Cookie Storage

- JWT stored in HTTP-only cookie
- Prevents XSS access

---

### 2. Token Validation

- Always validated in middleware
- Never trust client-only state

---

### 3. Impersonation Safety

- Original user is always preserved
- No privilege escalation is allowed

---

### 4. Explicit Activation

- Impersonation must be user-triggered
- No automatic switching

---

## 12. Anti-Patterns Avoided

### Storing JWT in `localStorage`

- Vulnerable to XSS

---

### Using Session as Auth Source

- JWT is the source of truth

---

### Mixing Auth with UI Logic

- Auth is handled in NextAuth + middleware

---

### Storing Server Data in Zustand

- Session is treated as runtime context only

---

## 13. Trade-offs

### Pros

- Scalable and stateless
- Clear separation of concerns
- Supports impersonation
- Enables role-aware UI
- Audit-friendly

---

### Cons

- More complexity (JWT + session + Zustand)
- Requires synchronization
- Adds more UI conditions for impersonation handling

---

## 14. Future Considerations

- Improve impersonation audit logging
- Enhance UI indicators for clarity
- Extend role-based permission checks
- Improve session expiration handling

---

## Summary

This architecture combines:

- NextAuth (authentication)
- JWT (identity)
- Session (runtime context)
- Zustand (client control layer)

to create a system that is:

- Secure
- Scalable
- Extensible
- Fully integrated with impersonation

It is not just an authentication system, but a foundation for all
user-context-dependent behavior, including impersonation, role-based UI,
and auditability.
