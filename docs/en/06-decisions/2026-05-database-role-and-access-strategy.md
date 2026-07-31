# Database Role and Access Strategy (2026-05)

## Context

The project initially used Supabase as a convenient database foundation.
During early implementation, API-oriented access patterns and Supabase client-style usage were useful for moving quickly.

As the Service Desk module became more production-aligned, the database access direction needed to become more explicit.

By this point, the implementation direction was clearer in areas such as:

- direct PostgreSQL access from server code
- separated database roles for authentication and application data
- server-only database connection strings
- Row / DTO / Mapper / Repository / Service boundaries
- RLS-aware application data access
- route-handler orchestration
- reduced dependency on broad service-level privileges
- future backend extraction readiness

The database strategy therefore needed to move from convenience-first access toward a more controlled server-side data access model.

---

## Problem

### 1. API-centric access weakened the server boundary

Supabase API-style access is convenient for early development, but it can make the application data boundary less explicit.

If the project depends too heavily on client-like or Data API access patterns, several problems appear:

- route handlers can become too coupled to storage details
- SQL and DTO mapping boundaries become unclear
- database access can be harder to audit
- future backend extraction becomes harder
- the project looks closer to a simple BaaS CRUD demo than a production-aligned system

For this portfolio project, the goal was not only to store data.
The goal was to show a realistic server-controlled architecture.

---

### 2. A broad service role was too powerful for normal app flow

Using a broad service-level role for normal application behavior would be simple,
but it would weaken the security story.

Problems:

- routine app queries would have too much privilege
- authentication and application data access would be mixed
- least-privilege design would be unclear
- accidental misuse of a secret would have higher impact
- reviewers could reasonably question whether the app has a real permission boundary

The project needed a clearer role model.

---

### 3. Authentication data and portal data had different responsibilities

Login validation and application data access are not the same concern.

Authentication data access is responsible for:

- validating credentials
- reading account state
- checking active users
- updating login metadata

Portal application data access is responsible for:

- reading current user profile data
- reading and updating Service Desk data
- accessing settings and reference data
- executing workflow-related operations

Using one database role or access path for both concerns would make the architecture harder to reason about.

---

### 4. Grants and RLS needed to be treated together

During implementation, it became clear that database permissions are not only about table grants.

A role may have permission to query a table but still receive no rows if RLS policies do not allow access.

The effective database permission model is:

```txt
Effective database permission = role grants + RLS policies
```

This needed to become an explicit part of the architecture.

---

### 5. DTO boundaries were needed for maintainable server data access

As the project moved toward direct PostgreSQL queries, the difference between database rows and API responses became more important.

Without a clear data layer:

- database snake_case fields could leak into frontend models
- SQL result shapes could become coupled to UI components
- route handlers could grow too large
- mapping logic could be duplicated
- backend extraction would become harder later

The project needed an explicit server data layer.

---

## Decision

Use server-controlled direct PostgreSQL access with separated database roles and a DTO-oriented server data layer.

The core decision is:

```txt
Database access = server-only + role-separated + DTO-mapped
```

The application data flow should follow this direction:

```txt
Next.js Route Handler
-> Server Service
-> Repository
-> Query Client
-> PostgreSQL
```

### Scope Rules

- Do not use `service_role` for normal application flows.
- Use `auth_api` for authentication-only database access.
- Use `portal_api` for application data access after login.
- Keep database URLs and privileged credentials server-only.
- Keep SQL inside repositories, not UI components or page components.
- Keep route handlers thin and focused on HTTP/session/runtime orchestration.
- Separate database Row types from response DTOs.
- Use mappers to convert database rows into application-facing DTOs.
- Treat grants and RLS policies as a pair.
- Keep Supabase as the PostgreSQL platform, but avoid depending on Data API for core server flows where direct database access is more appropriate.

---

## What Was Aligned

### 1. Direct PostgreSQL Access

The database access direction was aligned around direct PostgreSQL connections from server code.

Current direction:

```txt
Route Handler
-> Service
-> Repository
-> queryAuthApi / queryPortalApi
-> PostgreSQL
```

This keeps the frontend away from direct database access and gives the server layer explicit control over SQL, mapping, and response contracts.

---

### 2. Database Role Separation

The role model was aligned around responsibility-based database access.

```txt
auth_api     -> authentication-only database access
portal_api   -> application data access
service_role -> excluded from normal app flow
```

#### `auth_api`

Used for login and authentication-related access.

Responsibilities:

- validate credentials
- read auth account state
- read minimal employee/profile data required for login projection
- update login metadata such as `last_login_at`

#### `portal_api`

Used for application data access after authentication.

Responsibilities:

- resolve current user profile data
- read and update Service Desk data
- access settings and reference data
- support workflow operations
- return DTO-based responses

#### `service_role`

Kept out of normal application flow.

It remains a broad administrative/platform capability, not the default role for app behavior.

---

### 3. Least-Privilege Access Direction

The database strategy was aligned with least privilege.

Rule:

```txt
Use the narrowest database role that can complete the operation.
```

This avoids using a broad service role for routine application queries and makes the security boundary easier to explain.

---

### 4. Grants and RLS Alignment

The permission model was clarified as:

```txt
Effective database permission = role grants + RLS policies
```

This means:

- grants define object-level permission
- RLS policies define row-level access
- both must be reviewed for every app-facing table
- missing RLS policy can cause empty results even when grants exist

This rule helps prevent confusing application behavior and accidental over-permission.

---

### 5. Server Data Layer Boundary

The project aligned database access around a server data layer.

Recommended structure:

```txt
src/server/data/
  auth/
    accounts/
      authAccountRow.ts
      authAccountDto.ts
      authAccountMapper.ts
      authAccountRepository.ts
      authAccountService.ts
      index.ts

  users/
    userProfileRow.ts
    userProfileDto.ts
    userProfileMapper.ts
    userProfileRepository.ts
    userProfileService.ts
    index.ts

  serviceDesk/
    tickets/
      ticketRow.ts
      ticketDto.ts
      ticketMapper.ts
      ticketRepository.ts
      ticketService.ts
      index.ts
```

This keeps database-specific code in server modules instead of feature UI modules.

---

### 6. Row / DTO / Mapper Separation

The data model was aligned around separate responsibilities.

```txt
Database Row -> Mapper -> DTO
```

#### Row

Represents database result shape.

- close to SQL
- usually `snake_case`
- may include nullable database fields
- not intended as UI data

#### DTO

Represents application-facing response shape.

- usually `camelCase`
- stable for API consumers
- hides database-specific naming
- safe for frontend use

#### Mapper

Converts Row data into DTO data.

Responsibilities:

- naming conversion
- null normalization
- JSON parsing or shaping
- response-safe field selection

---

### 7. Repository and Service Responsibilities

Repositories own SQL execution.

Responsibilities:

- define parameterized SQL
- call `queryAuthApi` or `queryPortalApi`
- keep database access out of route handlers
- return rows or DTO-ready data based on local convention

Services coordinate use cases.

Responsibilities:

- combine repository calls
- apply application-level rules
- resolve current user context
- prepare response DTOs
- keep route handlers thin

---

### 8. Environment Variable Boundary

Environment variables were aligned by responsibility.

| Variable | Purpose | Exposure |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | public |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase public client key | public |
| `AUTH_DATABASE_URL` | direct PostgreSQL connection for `auth_api` | server-only |
| `PORTAL_DATABASE_URL` | direct PostgreSQL connection for `portal_api` | server-only |
| `NEXTAUTH_URL` | NextAuth runtime URL | environment |
| `NEXTAUTH_SECRET` | NextAuth signing secret | secret |

Rule:

- Public env values may describe public infrastructure.
- Database URLs and secrets must remain server-only.

---

### 9. Auth / Session Relationship

The database strategy was aligned with the auth/session model.

```txt
AuthUser    -> created by login/auth data access
SessionUser -> session-safe projection
AppUser     -> resolved through application data access
```

Login uses the auth data path.

Application user/profile resolution uses the portal data path.

This prevents the session from becoming a full user profile container and keeps authentication concerns separate from application data concerns.

---

### 10. Local / Remote Runtime Relationship

The database strategy was aligned with the runtime model.

```txt
LOCAL  -> mock-backed demo behavior
REMOTE -> database-backed application behavior
```

The direct PostgreSQL strategy mainly applies to REMOTE behavior and server-side application data access.

LOCAL demo behavior can still use server-side in-memory state modules for safe, resettable demo behavior.

Important distinction:

- Local demo state is mutable for demo realism.
- Remote data is persisted through database access.

---

### 11. Attachment and Demo Storage Boundary

Attachment behavior was clarified as a scoped design area.

For the current local demo:

- use prepared demo file/image assets
- simulate upload behavior through controlled references
- avoid arbitrary untrusted file persistence
- attach metadata to ticket context only within the demo boundary

For future production:

- storage bucket policies
- file size limits
- MIME/type validation
- access control
- signed URLs
- malware/content scanning where appropriate
- cleanup and audit policy

Rule:

- Demo attachment behavior should not imply production-grade file storage.

---

## Consequences

### Positive

- Database access is more production-aligned.
- Normal app flow avoids broad service-role dependency.
- Authentication and application data access are easier to reason about.
- DTO boundaries make API responses cleaner and more stable.
- Route handlers can stay thin and focused.
- RLS and grants are treated as part of the actual permission model.
- Future backend extraction becomes easier.
- The portfolio demonstrates stronger security and architecture judgment.

---

### Negative / Trade-offs

- Initial setup is more complex than using a single Supabase client access path.
- Database grants and RLS policies require careful maintenance.
- Row / DTO / Mapper / Repository / Service files increase implementation overhead.
- More environment variables must be managed.
- Direct PostgreSQL access requires strict server-only discipline.
- Debugging permission issues can be more involved because grants and RLS both affect results.

---

## Follow-up Policy

- Keep `auth_api` limited to authentication-related access.
- Keep `portal_api` responsible for application data access after login.
- Do not introduce `service_role` into normal app flow for convenience.
- Review grants and RLS policies together when adding new tables.
- Keep route handlers free from raw SQL.
- Keep Row, DTO, Mapper, Repository, and Service boundaries explicit.
- Keep database URLs and secrets server-only.
- Treat production-grade attachment storage as future scope unless implemented with proper guardrails.
- Add table-specific RLS documentation later if the database surface grows enough to justify it.

---

## Summary

We aligned the database strategy around direct PostgreSQL access, separated database roles,
and DTO-oriented server data boundaries.

The key model is:

```txt
auth_api     -> login and authentication data access
portal_api   -> application data access
service_role -> excluded from normal app flow
```

This decision adds implementation discipline, but it makes the project more secure,
more maintainable, and more credible as a production-aligned Service Desk portfolio system.
