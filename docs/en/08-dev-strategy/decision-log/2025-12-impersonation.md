# Impersonation (Local Session Storage Approach) (2025-12)

## Context

Impersonation was introduced to support Service Desk workflows such as:

- Reproducing user issues
- Verifying user experience
- Acting on behalf of users

---

### Initial Goal

Implement impersonation **quickly** to validate the concept
before introducing complex authentication or session changes.

---

## 1. Initial Approach

### Decision

Use **local session storage (`sessionStorage`)** to manage impersonation state on the client.

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

- Store impersonated user info in `sessionStorage`
- Override UI context using the stored value
- Reset impersonation by clearing `sessionStorage`

---

## 2. Why This Approach Was Chosen

### 1. Fast Implementation

- No backend changes required
- No modification to the authentication system
- Easy to prototype

---

### 2. Low Complexity

- Simple state management
- No need for session synchronization
- No dependency on NextAuth changes

---

### 3. Immediate Validation

- Quickly verify impersonation UX and workflow
- Test the concept directly in the UI

---

## 3. Limitations Identified

### 1. Client-Side Only

Impersonation state exists only in the browser.

---

### Impact

- Not reflected in API requests
- Backend still sees the original user
- Causes inconsistent behavior between UI and server

---

### 2. Security Issues

- Easily manipulable through browser developer tools
- No permission validation
- No audit trail

---

### 3. SSR Incompatibility

- Not available during server-side rendering
- Breaks consistency in Next.js App Router

---

### 4. No Persistence Across Contexts

- Lost when the tab closes
- Not shared across devices
- Not reliable for real operational usage

---

### 5. No Auditability

- Cannot track who initiated impersonation
- No logging of the original user

---

## 4. Key Insight

```id="impersonation-insight"
Impersonation cannot be treated as UI state alone; it must be part of authentication or session design
```

---

## 5. Evaluation

### Decision

The local session storage approach is:

- Useful for prototyping
- Not suitable for production or realistic simulation

---

## 6. Next Step

### Direction

Move impersonation to a **server-controlled session model**.

---

### Planned Changes

- Integrate impersonation with the NextAuth session
- Introduce a dual identity model
- Preserve both original user and effective user in session context

---

### Identity Concept

- `originalUser`
- `effectiveUser`

---

## 7. Trade-offs

### Pros

- Fast to implement
- Easy to test
- No backend dependency during early validation

---

### Cons

- Not secure
- Not consistent across client and server
- Not scalable
- Not aligned with real system behavior

---

## 8. Alternatives Considered

### 1. Direct NextAuth Modification (Skipped Initially)

- More correct long-term approach
- Higher complexity
- Slower to implement initially

---

### 2. Backend-Driven Impersonation

- Secure
- Requires API design
- Adds overhead in the early stage

---

## Summary

The local session storage approach enabled **rapid validation of impersonation UX**,
but it exposed critical limitations in security, consistency, and server integration.

This led to the decision to evolve impersonation into a **server-controlled session model**,
forming the foundation for a more robust and production-ready implementation.
