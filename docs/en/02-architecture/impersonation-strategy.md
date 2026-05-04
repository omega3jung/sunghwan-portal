# Impersonation Strategy

## Goal

The impersonation strategy is designed to enable **secure and controlled user context switching**,
allowing privileged users such as admins or agents to act on behalf of another user.

It aims to:

- Support realistic Service Desk workflows
- Enable debugging and issue reproduction
- Maintain strict security boundaries
- Preserve auditability of actions

---

## Core Principle

```id="impersonation-principle"
Impersonation is a temporary identity override with a traceable origin
```

---

## Background

In a Service Desk system, support roles may need to see or reproduce the exact experience of another user.

---

### Typical Needs

- Agents may need to reproduce user issues
- Admins may need to act on behalf of users
- Support teams may need to verify user experience directly

---

### Problem

Standard authentication alone does not fully support:

- Acting as another user
- Debugging user-specific issues
- Simulating real user flows with the correct context

---

## Key Requirement

The system must:

- Allow controlled impersonation
- Preserve original user identity
- Ensure all actions remain traceable

---

## Identity Model

### Dual Identity Concept

```txt id="identity-model"
Current User
Original User
```

---

### Original User

- The authenticated user
- The one who initiated impersonation

---

### Impersonated User

- The user being acted as
- The current identity used by the system during impersonation

---

### Example

```txt id="identity-example"
Admin (originalUser) -> impersonates -> Employee (currentUser)
```

---

## Session Strategy

Impersonation is handled at the **session level**.

---

### Session Structure

```ts id="session-structure"
session = {
  user: originalUser,
  impersonation: {
    originalUserId,
    impersonatedUserId,
  },
};
```

---

### Behavior

- `session.user` stays as the original authenticated projection
- `currentUser` is used across the UI and authorization flow
- `originalUser` is used for audit and security checks
- `isImpersonating` is derived from impersonation metadata in the client/runtime layer

The earlier `actor / subject / effective` labels were renamed to
`originalUser / impersonatedUser / currentUser` so the runtime meaning is obvious in both code and docs.

---

## Authentication Integration

### Strategy

Use **NextAuth** as the base authentication layer and extend the session with impersonation metadata.

---

### Approach

- Keep NextAuth as the foundation
- Inject impersonation context into the session object
- Reuse the same authentication flow on server and client

---

### Benefit

- Avoids duplicating authentication logic
- Keeps auth behavior consistent across the application
- Makes impersonation an extension rather than a separate auth system

---

## Activation Flow

### Flow

```txt id="activation-flow"
Admin selects user -> Start impersonation -> Session updated
```

---

### Behavior

- Preserve the original user projection in session
- Resolve `currentUser` from the impersonated user while impersonation is active
- Derive `isImpersonating = true` from impersonation metadata

---

## Deactivation Flow

### Flow

```txt id="deactivation-flow"
Stop impersonation -> Restore original user
```

---

### Behavior

- Remove impersonation context
- Reset the session to the original user
- Clear the impersonation flag

---

## Authorization Strategy

### Rule

```id="authorization-rule"
Impersonation must not elevate privileges beyond what the original user is allowed to do
```

---

### Implication

- Permissions must be evaluated carefully
- The system must prevent privilege escalation
- The original user must remain known even when the current user changes

---

### Example

- Admin impersonates a user and acts within that user context
- The system still knows the original user is the admin

---

## Audit Strategy

### Requirement

All actions must remain traceable.

---

### Stored Context

- `originalUserId`
- `currentUserId`

---

### Example

```txt id="audit-example"
currentUser: employee123
originalUser: admin456
```

---

### Benefit

- Full audit trail
- Compliance-friendly behavior
- Easier debugging and investigation

---

## UI Strategy

### Indicators

When impersonation is active, the UI should:

- Show a clear banner or status indicator
- Display the impersonated user name
- Provide a visible `Stop Impersonation` action

---

### Reason

- Prevents confusion
- Ensures user awareness
- Reduces unintended actions under the wrong context

---

## Scope of Impersonation

### Applies To

- API requests
- UI rendering
- Data access checks based on current user context

---

### Does Not Apply To

- Authentication ownership
- System-level privileges unless explicitly designed to do so

---

## Security Considerations

### 1. Restricted Access

- Only authorized roles can impersonate

---

### 2. Explicit Activation

- Must be user-initiated
- No automatic impersonation

---

### 3. Clear Exit Mechanism

- Users need an easy and visible way to stop impersonation

---

### 4. Session Isolation

- Avoid leaking impersonation state across tabs, sessions, or unrelated users

---

## Trade-offs

### Pros

- Powerful debugging capability
- Improved support workflow
- Realistic user simulation
- Better issue reproduction

---

### Cons

- Increased complexity in session handling
- Requires strict security controls
- Can be misused if access is not properly restricted

---

## Alternatives Considered

### 1. No Impersonation

- Simpler system
- Hard to debug real user issues

---

### 2. Separate Test Accounts

- Safe approach
- Not realistic enough for live user context
- Hard to replicate real data and permissions

---

### 3. Backend-Only Simulation

- More controlled environment
- Does not support true end-to-end UI verification

---

## Design Principles Alignment

This strategy aligns with:

- Security-first design
- Traceability and auditability
- Real-world operational support
- Separation of identity and context

---

## Summary

The impersonation strategy enables **secure and traceable user context switching**,
allowing administrators and agents to act on behalf of users while preserving
original identity and maintaining full auditability across the system.
