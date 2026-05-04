# sunghwan-portal

정성환의 포트폴리오 프로젝트입니다.

## Languages

- [English](README.md)
- [Korean](README.ko.md)

이 저장소는 **Next.js 14 App Router** 기반으로 만든 **Service Desk 시스템 프로토타입**입니다.
단순한 UI 데모가 아니라, 실제 운영 환경을 고려한 프론트엔드 시스템을 목표로 하며
도메인 구조, 운영 워크플로우, 그리고 문서화된 설계 의사결정에 큰 비중을 두고 있습니다.

## 개요

**라이브 데모**: [sunghwan-portal.vercel.app](https://sunghwan-portal.vercel.app/)

이 프로젝트는 다음 요소를 중심으로 Service Desk 도메인을 구성합니다.

- 카테고리 기반 티켓 워크플로우
- 승인 및 배정 로직
- SLA 기반 동작
- 감사 및 이력 추적
- 역할 인식형 대시보드 및 설정 UX
- 인증 및 사용자 전환(impersonation) 전략

또한 이 프로젝트는 문서 중심의 포트폴리오 프로젝트이기도 합니다.
설계 의도, 트레이드오프, 구현 방향은 [`docs/ko`](./docs/ko/README.md)에 정리되어 있습니다.

## 현재 방향

이 저장소는 초기의 인증 템플릿 성격 프로젝트에서,
보다 구체적인 **Service Desk 애플리케이션**으로 발전한 상태를 반영합니다.

현재는 다음 방향을 중심으로 구성되어 있습니다.

- 범용 CRUD보다 **도메인 우선 설계**
- Feature 기반 프론트엔드 아키텍처
- JWT 세션 전략 기반의 NextAuth 인증
- React Query 중심의 서버 상태 관리
- Service Desk Settings 같은 관리자/설정 워크플로우
- 프로젝트가 어떻게 진화했는지 설명하는 의사결정 로그

## 기술 스택

- 프레임워크: `next@14`
- 언어: `typescript`
- UI: `tailwindcss`, `shadcn/ui`, `radix-ui`, `lucide-react`
- 인증: Credentials Provider + JWT 세션 전략 기반 `next-auth@4`
- 데이터 패칭: `axios`, `@tanstack/react-query`
- 폼: `react-hook-form`, `zod`
- 상태 관리: `zustand`
- 차트 / 테이블 / 에디터: `recharts`, `@tanstack/react-table`, `@tiptap/react`
- 스토리북: `storybook@10`
- 테스트: `vitest`, `jest`, `@testing-library/*`, `playwright`

## 프로젝트 구조

프로젝트는 [`src`](./src) 아래에서 계층적으로 구성되어 있습니다.

```txt
src/
  app/         # Next.js 라우트, 레이아웃, public/protected 페이지
  auth/        # NextAuth 연동, authorize/session 로직
  components/  # 공통 및 커스텀 UI 컴포넌트
  domain/      # Service Desk 도메인 모델과 규칙
  feature/     # 기능 단위 화면과 워크플로우
  lib/         # 앱 전역 설정 및 인프라 헬퍼
  server/      # 서버 전용 로직
  shared/      # 재사용 가능한 공용 유틸리티와 UI
  types/       # 범용 TypeScript 타입
```

중요한 상위 경로는 다음과 같습니다.

- [`src/app`](./src/app): demo, settings, protected page를 포함한 라우트 구조
- [`src/feature`](./src/feature): Service Desk 기능 단위 흐름
- [`src/auth.config.ts`](./src/auth.config.ts): NextAuth 설정
- [`src/middleware.ts`](./src/middleware.ts): 미들웨어 기반 라우트 보호
- [`docs/ko`](./docs/ko/README.md): 설계 및 의사결정 문서

## Service Desk 설계 주제

이 시스템은 전반적으로 다음과 같은 설계 방향을 강조합니다.

- 티켓을 단순한 레코드가 아닌 구조화된 워크플로우로 다룸
- 카테고리와 설정을 도메인 구성 요소로 다룸
- 승인, 배정, SLA를 핵심 시스템 동작으로 다룸
- 개요, 분석, 편집 흐름 사이의 UI 경계를 명확히 유지
- 이력 및 impersonation-aware 세션 설계를 통한 추적 가능성 확보

프로젝트 설계를 먼저 빠르게 보고 싶다면 다음 순서를 추천합니다.

1. [`docs/ko/README.md`](./docs/ko/README.md)
2. [`docs/ko/02-architecture/feature-based-structure.md`](./docs/ko/02-architecture/feature-based-structure.md)
3. [`docs/ko/03-domain/ticket-system-design.md`](./docs/ko/03-domain/ticket-system-design.md)
4. [`docs/ko/08-dev-strategy/development-approach.md`](./docs/ko/08-dev-strategy/development-approach.md)

## 인증과 세션

현재 인증은 **NextAuth v4**를 기반으로 하며, 다음 구성을 따릅니다.

- Credentials Provider
- JWT 세션 전략
- 미들웨어 기반 보호 라우트 처리
- 아키텍처 문서와 의사결정 로그에 기록된 세션 중심 impersonation 설계

이 프로젝트는 인증과 세션을 단순한 로그인 기능으로 보지 않고,
보호 라우트, 역할 인식형 UI, impersonation을 포함한 **전체 시스템 동작의 일부**로 다룹니다.

관련 문서:

- [`docs/ko/02-architecture/auth-session-strategy.md`](./docs/ko/02-architecture/auth-session-strategy.md)
- [`docs/ko/02-architecture/impersonation-strategy.md`](./docs/ko/02-architecture/impersonation-strategy.md)
- [`docs/ko/08-dev-strategy/decision-log/2025-12-impersonation.md`](./docs/ko/08-dev-strategy/decision-log/2025-12-impersonation.md)
- [`docs/ko/08-dev-strategy/decision-log/2026-01-impersonation.md`](./docs/ko/08-dev-strategy/decision-log/2026-01-impersonation.md)

## 로컬 개발

의존성을 설치하고 앱을 실행하려면:

```bash
npm install
npm run dev
```

주요 스크립트:

```bash
npm run dev
npm run dev:clean
npm run build
npm run start
npm run lint
npm run storybook
npm run build-storybook
```

기본 로컬 주소:

```txt
http://localhost:3000
```

## 환경 변수

이 저장소에는 [`.env.local`](./.env.local)과 [`.env-cmdrc`](./.env-cmdrc)가 함께 포함되어 있습니다.

현재 주요 환경 변수는 다음과 같습니다.

- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `NEXT_PUBLIC_BASE_PATH`
- DB / portal / node 서비스용 API endpoint 변수
- `NEXT_PUBLIC_CONTEXT`

## 문서

[`docs/ko`](./docs/ko/README.md)의 설계 문서는 이 프로젝트의 핵심 산출물 중 하나입니다.

문서에는 다음이 포함됩니다.

- 아키텍처
- 도메인 설계
- UI/UX 패턴
- 데이터 패칭 전략
- 폼 설계
- i18n 구조
- 개발 철학과 의사결정 로그

즉, 이 저장소는 코드뿐 아니라 시스템이 어떤 방식으로 설계되고 발전했는지를 설명하는 기록으로도 볼 수 있습니다.

## 참고

- 이 프로젝트는 포트폴리오/데모 프로젝트이지만, 실제 애플리케이션처럼 구조화하는 것을 목표로 합니다.
- 일부 영역은 아직 mock 데이터나 부분 구현을 포함하고 있습니다.
- 코드베이스는 Next.js 14, 재사용 가능한 UI 패턴, 더 명확한 도메인 경계를 중심으로 계속 정리되고 있습니다.

## 작성자

**정성환**  
프론트엔드 개발자 (React / Next.js)

- GitHub: <https://github.com/omega3jung>
- Repository: <https://github.com/omega3jung/sunghwan-portal>
- LinkedIn: <https://www.linkedin.com/in/sunghwan4jung/>
