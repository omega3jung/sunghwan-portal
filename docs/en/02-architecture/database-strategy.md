# Database Strategy

## Goal

The database strategy defines how `sunghwan-portal` accesses and organizes
application data in a secure, maintainable, and production-aligned way.

It aims to:

- Keep database access server-controlled
- Separate authentication data access from application data access
- Avoid exposing broad database privileges to normal application flows
- Support DTO-based server data boundaries
- Align Supabase usage with a realistic backend architecture
- Preserve a clear path for future backend extraction

---

## Background

The project uses Supabase PostgreSQL as the database foundation.

During early development, Supabase client and API-oriented access patterns were useful
for moving quickly. However, as the Service Desk module became more production-aligned,
the data access model needed stronger boundaries.

The project evolved from a convenient BaaS-style access pattern toward a more explicit
server-controlled database strategy.

```txt
Supabase client / Data API convenience
-> direct PostgreSQL access from server code
-> role-separated database access
-> DTO / repository / service boundary
```

This direction better matches the project goal as a credible portfolio demo:

- production-aligned server boundaries
- clear security model
- maintainable data layer

---

## Problems with API-Centric Database Access

### 1. Weak Server Boundary

If application data access depends too heavily on Supabase Data API or client-style access,
the server layer becomes less explicit.

Problems:

- database access rules are harder to reason about
- SQL and data mapping boundaries become unclear
- route handlers may become too coupled to storage details
- future backend extraction becomes harder

---

### 2. Broad Role Risk

Using a broad service-level key or role for normal application flows creates unnecessary risk.

Problems:

- too much privilege for routine app behavior
- unclear separation between login validation and application data access
- harder audit and permission reasoning
- greater impact if a secret is misused

---

### 3. Auth and Application Data Concerns Can Mix

Authentication data and portal application data serve different purposes.

Authentication access is used for:

- validating login credentials
- reading auth account state
- updating login-related metadata

Application data access is used for:

- reading user profile data
- reading and updating Service Desk data
- accessing settings and reference data
- executing workflow operations

Using one undifferentiated database access path makes these responsibilities less clear.

---

### 4. DTO Boundary Becomes Ambiguous

Database rows and API responses have different responsibilities.

Without a clear server data layer:

- database `snake_case` can leak into UI models
- SQL result shapes can become coupled to frontend components
- mapping logic may be duplicated
- route handlers can grow too large

---

## Core Concept

The project uses server-controlled direct PostgreSQL access with separated database roles.

```txt
Database access = server-only + role-separated + DTO-mapped
```

The current direction is:

```txt
Next.js route handler
-> server service
-> repository
-> query client
-> PostgreSQL
```

The UI does not access database tables directly.

The frontend calls feature API clients, and the server decides how data is retrieved,
mapped, filtered, and returned.

---

## Database Access Model

### Runtime Flow

```txt
UI
-> feature API client
-> Next.js route handler
-> service
-> repository
-> queryAuthApi / queryPortalApi
-> PostgreSQL
```

---

### Responsibilities

| Layer | Responsibility |
| --- | --- |
| UI / Feature Client | Calls application API |
| Route Handler | HTTP boundary, session check, runtime orchestration |
| Service | Use-case coordination |
| Repository | SQL execution and persistence logic |
| Query Client | Database connection wrapper |
| PostgreSQL | Source of persisted data |

---

## Role Separation

The database access model separates roles by responsibility.

```txt
auth_api     -> authentication-only database access
portal_api   -> application data access
service_role -> not used for normal application flows
```

### 1. `auth_api`

`auth_api` is used for login and authentication-related database access.

Responsibilities:

- validate account credentials
- read active auth account data
- read minimal employee/profile data required for login projection
- update login metadata such as `last_login_at`

Characteristics:

- narrow scope
- login-oriented
- server-only
- not used for general Service Desk operations

---

### 2. `portal_api`

`portal_api` is used after authentication for application data access.

Responsibilities:

- read current user profile data
- access Service Desk tickets
- access settings and reference data
- execute application workflows
- support DTO-based response construction

Characteristics:

- application-data oriented
- still limited by grants and RLS
- server-only
- used by repositories under `src/server/data`

---

### 3. `service_role`

`service_role` is treated as an administrative or platform-level capability,
not as the default application data access path.

Rule:

- Normal app flow should not depend on `service_role`.

Reason:

- broad privilege should be avoided
- normal app behavior should use least-privilege roles
- auth and portal access should remain auditable and understandable

---

## Grants and RLS Policy

Database access is controlled through both grants and Row Level Security.

```txt
Effective database permission = role grants + RLS policies
```

### Grants

Grants define what a role can do at the object level.

Examples:

- connect to database
- use schema
- select from table or view
- insert/update specific tables
- execute functions

### RLS Policies

RLS policies define which rows can be accessed or changed.

A role may have table-level permission but still receive no rows if RLS does not allow access.

This matters because:

- direct SQL with an admin role may return data
- application role queries may return zero rows
- missing RLS policy can look like an application bug

Rule:

- Every app-facing table must be checked against both GRANT and RLS policy.

This keeps database access predictable and prevents accidental over-permission.

---

## Data Layer Structure

The project uses a DTO-oriented server data layer.

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

---

## Row / DTO / Mapper Boundary

### 1. Row

A Row type represents the database result shape.

Characteristics:

- close to SQL
- usually `snake_case`
- may include nullable database fields
- should not be treated as UI data

Example:

```ts
type UserProfileRow = {
  user_id: string;
  employee_name: unknown;
  email: string | null;
  department_id: string | null;
};
```

---

### 2. DTO

A DTO represents the server response contract.

Characteristics:

- application-facing
- usually `camelCase`
- stable for API consumers
- hides database-specific naming and shape

Example:

```ts
type UserProfileDto = {
  userId: string;
  displayName: LocalizedText;
  email: string | null;
  departmentId: string | null;
};
```

---

### 3. Mapper

A mapper converts Row data into DTO data.

Rule:

```txt
Row -> Mapper -> DTO
```

The mapper is responsible for:

- naming conversion
- null normalization
- JSON parsing or localization shaping
- response-safe field selection

---

### 4. Repository

A repository owns SQL execution.

Responsibilities:

- define parameterized SQL
- call `queryAuthApi` or `queryPortalApi`
- return Row data or mapped DTO data depending on local convention
- keep SQL out of route handlers and UI code

---

### 5. Service

A service coordinates use cases.

Responsibilities:

- combine repositories
- apply application-level rules
- resolve current user context
- prepare response DTOs
- keep route handlers thin

---

## Naming Strategy

The database and application models use different naming conventions.

```txt
Database row -> snake_case
DTO / app model -> camelCase
```

Reason:

- PostgreSQL naming stays conventional
- TypeScript models stay idiomatic
- database implementation details do not leak into UI components
- response contracts remain easier to read in frontend code

---

## Query Client Strategy

The project uses separate query clients for separate database responsibilities.

Example direction:

```txt
queryAuthApi   -> AUTH_DATABASE_URL
queryPortalApi -> PORTAL_DATABASE_URL
```

### `queryAuthApi`

Used by auth repositories and login validation flows.

### `queryPortalApi`

Used by application repositories after authentication.

Rule:

- Choose the query client by responsibility, not convenience.
- Authentication queries should not use the portal data role.
- Portal feature queries should not use the auth-only role.

---

## Environment Variables

Database environment variables are separated by responsibility.

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

## Auth Data Access

Authentication data access is intentionally narrow.

Login flow direction:

```txt
Credentials provider
-> auth service
-> auth repository
-> queryAuthApi
-> PostgreSQL
-> AuthUser
-> JWT
-> SessionUser
```

Auth data access should return only what is necessary to create the trusted authentication payload.

It should not become a general user profile or application data access path.

---

## Portal Data Access

Portal application data access starts after authentication.

Flow direction:

```txt
Route handler
-> get current session
-> resolve effective user context
-> portal service
-> portal repository
-> queryPortalApi
-> DTO response
```

This supports:

- role-aware data access
- RLS-aware query behavior
- DTO response boundaries
- later backend extraction

---

## Relationship with Auth / Session Strategy

The database strategy supports the auth/session boundary.

```txt
AuthUser    -> created by login/auth data access
SessionUser -> session-safe projection
AppUser     -> resolved through application data access
```

The session should not become the full user profile.

Instead:

```txt
Session identity
-> application user resolution
-> AppUser DTO
-> frontend runtime facade
```

This keeps authentication stable while allowing application user data to evolve.

---

## Relationship with Feature-Based Structure

The database strategy complements the feature-based architecture.

Feature modules own UI workflows and API clients.
Server data modules own database access and DTO mapping.

```txt
src/feature
-> frontend workflows and API calls

src/server/data
-> database access, repositories, DTO mapping
```

This keeps feature modules from importing database-specific code.

Rule:

```txt
Feature code calls APIs.
Server data code calls the database.
```

---

## Relationship with LOCAL / REMOTE Runtime

The Service Desk module supports LOCAL and REMOTE runtime behavior.

```txt
LOCAL  -> mock-backed demo behavior
REMOTE -> database-backed application behavior
```

The database strategy mainly applies to REMOTE behavior and server-side application data access.

LOCAL demo behavior may use server-side in-memory state modules instead of persistent database writes.

Important distinction:

- Local demo state is mutable for demo realism.
- Remote data is persisted through database access.

This allows the portfolio demo to feel realistic without implying that all production persistence concerns
are already fully implemented.

---

## Attachment and Demo Storage Policy

Attachments require special care because unrestricted file uploads can create security,
storage, and abuse risks.

For the current local demo, attachment behavior should remain constrained.

### Local Demo Direction

- use prepared demo image and file assets
- simulate upload behavior through controlled demo references
- store or return attachment metadata as part of ticket context
- avoid arbitrary untrusted file persistence

### Future Production Direction

Production-grade attachment handling should include:

- storage bucket policy
- file size limits
- MIME type and extension validation
- access control
- signed URLs when needed
- malware or content scanning where appropriate
- audit and cleanup policy

Rule:

- Demo attachment behavior should not imply production-grade file storage.

---

## Security Principles

### 1. Least Privilege

Use the narrowest database role that can complete the operation.

### 2. Server-Only Secrets

Database URLs and privileged credentials must never be exposed to the client.

### 3. Parameterized Queries

Repositories should use parameterized SQL.

No string interpolation for untrusted query values.

### 4. Explicit RLS Alignment

Every table accessed by application roles must have grants and RLS policies reviewed together.

### 5. No Broad Role in Normal App Flow

The normal application path should not depend on `service_role`.

---

## Deferred Scope

The current database strategy intentionally does not claim full production completeness.

Deferred or future work includes:

- full remote persistence for every Service Desk workflow
- complete database schema documentation for all tables
- full per-table RLS policy catalog
- migration/versioning strategy
- production-grade attachment storage
- full audit compliance infrastructure
- complete enterprise authorization rule engine
- database observability and query performance monitoring

These are not ignored.
They are intentionally separated from the current portfolio scope.

---

## Trade-offs

### Pros

- clear server-side database boundary
- better security through role separation
- stronger production alignment
- easier DTO and API response control
- reduced risk of broad service role usage
- better path for future backend extraction
- more credible portfolio architecture

### Cons

- more initial setup complexity
- requires grants and RLS policies to be maintained carefully
- SQL mapping requires additional Row / DTO / Mapper files
- more environment variables to manage
- direct PostgreSQL access requires stronger server-only discipline

---

## Alternatives Considered

### 1. Supabase Data API as Main Access Path

- fast to start
- convenient for simple CRUD
- less explicit server boundary
- harder to enforce application-specific access structure
- less aligned with backend extraction goal

---

### 2. Single Broad Service Role

- simple to implement
- avoids many permission issues early
- too much privilege for normal app flow
- weak least-privilege story
- higher security risk
- poor separation between auth and application data access

---

### 3. One Shared Database Role for All Server Queries

- easier than role separation
- auth and portal data responsibilities become mixed
- harder to audit
- less precise permission design

---

### 4. Separate Backend Repository Immediately

- clean long-term backend boundary
- easier to scale independently
- too much overhead for current portfolio scope
- slower iteration
- more deployment and maintenance cost

---

## Design Principles Alignment

This database strategy aligns with:

- least privilege
- server-controlled data access
- separation of concerns
- DTO-based response boundaries
- feature-based frontend architecture
- production-aligned portfolio design
- future backend extraction readiness

---

## Summary

The database strategy uses direct PostgreSQL access from server code with separated database roles.

```txt
auth_api     -> login and authentication data access
portal_api   -> application data access
service_role -> excluded from normal app flow
```

Database rows, DTOs, mappers, repositories, and services are separated
to keep the data layer explicit and maintainable.

This approach increases implementation discipline, but it makes the project more secure,
more production-aligned, and easier to explain as a serious Service Desk portfolio system.
