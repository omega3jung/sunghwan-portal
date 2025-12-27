# sunghwan-portal

Portfolio of Sunghwan Jung

🌐 **Languages**

- [English](README.md)
- [한국어](README.ko.md)

**Sunghwan Jung's Demo Portfolio Project**
I'm developing a **Next.js 14-based front-end architecture template**
focused on **authentication, session design, and real-world scalability**.

> Beyond a simple UI demo,  
> this project aims for a production-oriented structure that considers **authentication, authorization, sessions, and environment separation**.

---

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Auth**: NextAuth v4 (Credentials Provider, JWT Strategy)
- **State**: Zustand
- **Data Fetching**: Axios + TanStack Query
- **UI**: Tailwind CSS, shadcn/ui
- **Icons**: lucide-react-
- **State Management**: Zustand (client state)
- **Data Fetching**: Axios + TanStack Query

---

## Project Goals

- A reusable **front-end base template**
- A clear separation of responsibilities for authentication/authorization logic
- A structure with clear configuration for each environment
- A structure that facilitates future DB/API expansion

---

## What This Project Demonstrates

This project focuses on architectural concerns often overlooked
in front-end demo applications:

- Authentication enforcement at the Edge layer
- Clear separation between authentication, session, and UI concerns
- Domain-driven session modeling for scalable UI consumption
- Environment-aware configuration
- Practical collaboration conventions (PRs, labels, ownership)

The goal is not feature completeness, but structural clarity and extensibility.

---

## Collaboration & Workflow

Although this is a personal demo project, it is structured to reflect
real-world team workflows.

- Conventional branch prefixes (`feat/`, `fix/`, `refactor/`, `docs/`, `chore/`, `test/`)
- PR title conventions enforced by documentation
- Automatic PR labeling based on branch prefixes
- CODEOWNERS defined to clarify review boundaries
- Separate CONTRIBUTING guides (EN / KO)

These conventions are intentionally minimal and designed to scale
without adding unnecessary complexity.

---

## Authentication & Session Architecture

This project uses **NextAuth v4 with a JWT-based session strategy**,
designed for use with the **Next.js 14 App Router** and Edge Middleware.

The authentication layer is intentionally separated into
**configuration**, **domain logic**, and **runtime enforcement**.

### Authentication Flow

This flow is designed to minimize runtime coupling
while keeping authentication enforcement centralized.

1. User accesses a protected route.
2. Edge Middleware validates authentication using a JWT
   (no database or server session lookup).
3. If unauthenticated, the request is redirected to `/login`.
4. On successful login:
   - Credentials are validated via `authorize`
   - JWT is issued and stored as an HTTP-only cookie
5. JWT becomes the single source of truth for authentication.
6. Client-side session is derived from the JWT for UI consumption.

---

### Key Design Decisions

- **JWT Strategy (No Database Session)**
- Authentication is enforced at the **middleware level**
- `getToken()` is used for Edge-safe authentication checks
- `access_token` and permission data are stored inside the JWT
- UI layouts remain authentication-agnostic
- The structure is compatible with future OAuth or role-based authorization

### Why JWT + Session Facade?

This project intentionally separates authentication concerns into
**three layers**, instead of relying solely on NextAuth defaults.

- **JWT (source of truth)**  
  Used for stateless authentication and edge-safe authorization checks.

- **NextAuth Session (UI projection)**  
  A client-friendly abstraction derived from JWT, optimized for React usage.

- **Session Facade (useCurrentSession + Zustand)**  
  A domain-specific session layer that:
  - normalizes session shape for UI
  - supports LOCAL / REMOTE data scopes
  - isolates session logic from pages and components

---

## Project Structure (Simplified)

```txt
app/
 ├─ (public)/
 │   └─ login/
 ├─ (protected)/
 │   ├─ demo/
 │   ├─ it-help-desk/
 │   └─ layout.tsx
 ├─ api/
 │   └─ auth/
 │       └─ [...nextauth]/route.ts

auth/
 ├─ authorize.ts      # Credential validation & user normalization
 ├─ credentials.ts    # Login API abstraction
 ├─ session.ts        # JWT ↔ Session projection logic
 └─ index.ts

lib/
 ├─ environment.ts
 ├─ routes.ts
 └─ sessionStore.ts   # Client-side session cache (Zustand)

services/
 ├─ fetcher.ts
 ├─ credentials.ts
 └─ sessionStore.ts

types/
 ├─ next-auth.d.ts
 ├─ session.ts
 └─ user.ts

middleware.ts
auth.config.ts
```

- Authentication logic is grouped under the `auth/` domain
- JWT is treated as the authentication source of truth
- Client session is intentionally derived and reshaped for UI usage
- Middleware relies solely on JWT for Edge compatibility

---

## Environment & Configuration

- Environment variables are managed using env-cmd.
- .env-cmdrc Example

```json
{
  "sandbox": {
    "NEXTAUTH_URL": "http://localhost:3000",
    "NEXTAUTH_SECRET": "local-secret",
    "NEXT_PUBLIC_CONTEXT": "development"
  },
  "production": {
    "NEXTAUTH_URL": "https://example.vercel.app",
    "NEXTAUTH_SECRET": "prod-secret",
    "NEXT_PUBLIC_CONTEXT": "production"
  }
}
```

---

## Getting Started

This project includes a demo authentication flow.
Some user data and permissions are mocked for demonstration purposes.

```npm
npm install
npm run dev
```

- Open the application in your browser at:

```txt
http://localhost:3000
```

_Optional_:

> Demo credentials and impersonation flows are documented in the codebase.

---

## Internationalization (i18n)

This project supports multiple languages at the application level,
enabling a global-ready UI without coupling language logic to pages.

- English
- Spanish
- French
- Korean

Language preferences are managed at the system level and can be extended easily.

---

## Notes

- This project is a demo project for portfolio purposes.
- Some APIs are based on mock/demo APIs.
- The authentication structure is designed for practical use and supports future expansion to OAuth providers, role-based authorization, and database-backed sessions.

---

## Author

**Sunghwan Jung**
Frontend Developer (React / Next.js)

- GitHub: https://github.com/omega3jung
- Repository: https://github.com/omega3jung/sunghwan-portal
- LinkedIn: https://www.linkedin.com/in/sunghwan4jung/
