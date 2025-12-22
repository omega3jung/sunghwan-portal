# sunghwan-portal
Portfolio of Sunghwan Jung

🌐 **Languages**
- [English](README.md)
- [한국어](README.ko.md)

**Sunghwan Jung's Demo Portfolio Project**

I'm developing a **Next.js 14-based front-end template** designed for immediate use in real-world applications.

> Beyond a simple UI demo,  
> this project aims for a production-oriented structure that considers **authentication, authorization, sessions, and environment separation**.

---

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Auth**: NextAuth (Credentials Provider, JWT Strategy)
- **State**: Zustand
- **Data Fetching**: Axios + TanStack Query
- **UI**: Tailwind CSS, shadcn/ui
- **Icons**: lucide-react

---

## Project Goals

- A reusable **front-end base template**
- A clear separation of responsibilities for authentication/authorization logic
- A structure with clear configuration for each environment
- A structure that facilitates future DB/API expansion

---

## Authentication & Session Architecture

This project was designed to **simplify authentication with NextAuth at its core**,
while also considering the scalability often required in practice.

### Authentication Flow

1. The user accesses a protected path.
2. Authentication is checked in `middleware.ts`.
3. If not authenticated, redirect to `/login`.
4. Upon successful login, create a JWT-based session.
5. Subsequent requests use the session-based access_token.

### Key Points

- **Using JWT Strategy**
- The access_token is stored in the NextAuth session
- An Axios interceptor automatically injects the Authorization header into API requests
- The layout does not perform authentication decisions and only serves as the UI.

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

lib/
 ├─ environment.ts
 ├─ authOptions.ts
 └─ sessionStore.ts

services/
 ├─ fetcher.ts
 └─ credentials.service.ts

hooks/
 ├─ useCurrentSession.ts
 └─ useDatabaseUser.ts

types/
 ├─ auth.ts
 └─ user.ts
```

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

```npm
npm install
npm run dev
```
- Open the application in your browser at:
```txt
http://localhost:3000
```

---

## Internationalization (i18n)

This project supports multiple languages at the application level:

- English
- Spanish
- French
- Korean

Language preferences are managed at the system level and can be extended easily.

---

## Notes

- This project is a demo project for portfolio purposes.
- Some APIs are based on mock/demo APIs.
- The authentication structure is designed for practical use and can be expanded with OAuth, role-based authorization, and database authentication.

---

## Author

**Sunghwan Jung**
Frontend Developer (React / Next.js)

- GitHub: https://github.com/omega3jung
- Repository: https://github.com/omega3jung/sunghwan-portal
- LinkedIn: https://www.linkedin.com/in/sunghwan4jung/