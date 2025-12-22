# sunghwan-portal
Portfolio of Sunghwan Jung

**Sunghwan Jung의 데모 포트폴리오 프로젝트**  
실무에서 바로 사용할 수 있는 **Next.js 14 기반 프론트엔드 템플릿**을 목표로 개발 중입니다.

> 단순 UI 데모가 아닌,  
> **인증 · 권한 · 세션 · 환경 분리**까지 고려한 실전형 구조를 지향합니다.

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

- 실무에서 재사용 가능한 **프론트엔드 기초 템플릿**
- 인증 / 인가 로직의 명확한 책임 분리
- 환경별 설정이 명확한 구조
- 이후 DB / API 확장이 쉬운 구조

---

## Authentication & Session Architecture

이 프로젝트는 **NextAuth를 중심으로 인증을 단순화**하면서도  
실무에서 자주 요구되는 확장성을 고려해 설계되었습니다.

### Authentication Flow

1. 사용자가 보호된 경로 접근
2. `middleware.ts`에서 인증 여부 확인
3. 미인증 시 `/login`으로 redirect
4. 로그인 성공 시 JWT 기반 세션 생성
5. 이후 요청은 session 기반으로 access_token 사용

### Key Points

- **JWT Strategy 사용**
- access_token은 NextAuth session에 저장
- API 요청 시 axios interceptor에서 자동으로 Authorization 헤더 주입
- layout은 인증 판단을 하지 않고 UI 역할만 담당

---

## Project Structure (Simplified)

```txt
app/
 ├─ (public)/
 │   └─ login/
 ├─ (protected)/
 │   ├─ home/
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

- 환경 변수는 env-cmd를 사용해 관리합니다.
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
- 브라우저에서 아래 주소로 확인할 수 있습니다.
```txt
http://localhost:3000
```

---

## Internationalization (i18n)

이 프로젝트는 애플리케이션 수준에서 다은과 같은 다국어를 지원합니다:

- 영어
- 스페인어
- 프랑스어
- 한국어

언어 설정은 시스템 수준에서 관리되며, 필요에 따라 쉽게 확장할 수 있습니다..

---

## Notes

- 본 프로젝트는 포트폴리오 목적의 데모 프로젝트입니다.
- 일부 API는 Mock / Demo API 기준으로 구성되어 있습니다.
- 인증 구조는 실무 기준으로 설계되어 있어 OAuth, Role 기반 권한, DB 인증 등으로 확장이 가능합니다.

---

## Author

**Sunghwan Jung**
Frontend Developer (React / Next.js)

- GitHub: https://github.com/omega3jung
- Repository: https://github.com/omega3jung/sunghwan-portal
- LinkedIn: https://www.linkedin.com/in/sunghwan4jung/