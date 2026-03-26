# Service Desk 시스템 문서

## 목표

이 문서는 **Next.js 14 App Router**로 구축한 **Service Desk 시스템**의
설계, 아키텍처, 그리고 구현 관점을 설명한다.

이 프로젝트는 단순한 UI 데모가 아니라, 다음 요소를 중심에 둔
**도메인 중심적이고 실제 운영 환경을 고려한 시스템**으로 문서화되어 있다.

- 카테고리 중심 티켓 워크플로
- 승인 및 할당 로직
- SLA 기반 운영
- 감사 가능성과 이력 관리
- 역할 인식형 UI/UX
- 실용적인 마이그레이션 및 개발 의사결정

---

## 대상 독자

이 문서는 다음 독자를 대상으로 한다.

- 프로젝트 구조를 검토하는 엔지니어
- 설계 의사결정을 평가하는 인터뷰어
- 실제 프런트엔드 아키텍처에 관심 있는 개발자

문서는 구현 내용뿐 아니라, 왜 그런 설계 결정을 내렸는지까지 설명하는 것을 목표로 한다.

---

## 이 문서가 다루는 내용

`docs/ko` 폴더는 프로젝트의 주요 설계 축을 기준으로 구성되어 있다.

현재 다음과 같은 섹션으로 나뉜다.

- `01-project`: 프로젝트 진입점 문서
- `02-architecture`: 애플리케이션 구조와 런타임 경계
- `03-domain`: Service Desk 도메인 규칙과 워크플로 설계
- `04-ui-ux`: UI 책임과 상호작용 패턴
- `05-data-fetching`: query 및 caching 전략
- `06-form-design`: ticket form 동작과 validation
- `07-i18n`: localization 구조와 validation message 설계
- `08-dev-strategy`: 개발 접근 방식과 의사결정 로그

---

### 1. Project

프로젝트 문서는 독자가 더 깊은 시스템 설계로 들어가기 전에,
리포지토리가 스스로를 어떻게 소개해야 하는지를 설명한다.

다음 내용을 다룬다.

- README 구조와 목적
- 언어 분리 전략
- 리포지토리 진입점에서 상세 문서로 이어지는 탐색 흐름

주요 문서:

- [README Strategy](./01-project/readme-strategy.md)

---

### 2. Architecture

아키텍처 문서는 시스템이 애플리케이션 수준에서 어떻게 구성되는지를 설명한다.

다음 내용을 다룬다.

- Feature 기반 프로젝트 구조
- Next.js App Router 라우팅 전략
- 상태 관리 경계
- 인증, 세션, impersonation 설계

주요 문서:

- [Feature-Based Structure](./02-architecture/feature-based-structure.md)
- [Routing Strategy](./02-architecture/routing-strategy.md)
- [State Management](./02-architecture/state-management.md)
- [Auth & Session Strategy](./02-architecture/auth-session-strategy.md)
- [Impersonation Strategy](./02-architecture/impersonation-strategy.md)

---

### 3. Domain Design

도메인 문서는 Service Desk가 워크플로 중심 시스템으로서 어떻게 동작하는지를 정의한다.

다음 내용을 다룬다.

- 티켓 개요와 시스템 범위
- 티켓 생명주기와 상태 전이
- 티켓 모델과 소유권
- 작업 세션 추적
- 티켓 이력과 감사 추적
- 승인, 할당, SLA를 위한 카테고리 중심 전략

주요 문서:

- [Ticket System Overview](./03-domain/ticket/ticket-system-overview.md)
- [Ticket Lifecycle](./03-domain/ticket/ticket-lifecycle.md)
- [Ticket Model](./03-domain/ticket/ticket-model.md)
- [Ticket Track Time](./03-domain/ticket/ticket-track-time.md)
- [Ticket History](./03-domain/ticket/ticket-history.md)
- [Category Strategy](./03-domain/ticket/strategy/category-strategy.md)
- [Approval System](./03-domain/ticket/strategy/approval-system.md)
- [Assignment Policy](./03-domain/ticket/strategy/assignment-policy.md)
- [SLA Strategy](./03-domain/ticket/strategy/sla-strategy.md)

---

### 4. UI/UX Principles

UI/UX 문서는 시스템 동작이 어떻게 사용 가능한 인터페이스로 번역되는지에 초점을 둔다.

다음 내용을 다룬다.

- Component 책임 경계
- Dialog와 form 상호작용 패턴
- Dashboard와 insight 분리
- 복잡한 워크플로를 위한 실용적인 UI 구조

주요 문서:

- [Component Boundary](./04-ui-ux/component-boundary.md)
- [Dialog Pattern](./04-ui-ux/dialog-pattern.md)
- [Form Pattern](./04-ui-ux/form-pattern.md)
- [Dashboard and Insight](./04-ui-ux/dashboard-and-insight.md)

---

### 5. Data Fetching Strategy

이 섹션은 프로젝트가 React Query를 어떻게 사용하며,
server/client 책임이 어디에서 분리되는지를 설명한다.

주요 문서:

- [React Query Strategy](./05-data-fetching/react-query-strategy.md)

---

### 6. Form Design

이 섹션은 시스템에서 가장 도메인 의존성이 높은 상호작용 중 하나인
ticket form에 초점을 둔다.

다음 내용을 다룬다.

- Multi-step form 흐름
- Category-driven behavior
- SLA, priority, risk 연동
- Validation과 submit 전략

주요 문서:

- [Ticket Form Design](./06-form-design/ticket-form.md)

---

### 7. Localization (i18n)

i18n 문서는 번역 파일이 어떻게 구성되는지,
그리고 validation feedback이 메시지 책임에 따라 어떻게 분리되는지를 설명한다.

다음 내용을 다룬다.

- Namespace 기반 locale 구조
- Validation / message / error 분리
- 번역 key의 명시성과 유지보수성

주요 문서:

- [Locale Structure](./07-i18n/locale-structure.md)
- [Validation Messages](./07-i18n/validation-messages.md)

---

### 8. Development Strategy

개발 전략 문서는 프로젝트가 실제로 어떻게 만들어지고 발전했는지를 설명한다.

다음 내용을 다룬다.

- 마이그레이션을 고려한 개발 철학
- 실용적인 의사결정
- 주요 설계 선택에 대한 의사결정 로그

주요 문서:

- [Development Approach](./08-dev-strategy/development-approach.md)

#### Decision Log

`decision-log` 디렉터리는 개발 과정에서 내려진 핵심 설계 결정을 기록한다.

각 문서는 다음에 초점을 둔다.

- 문제의 맥락
- 고려한 선택지
- 최종 결정과 그 이유

이 구조는 완전한 사전 설계 시스템이 아니라,
**반복적이고 현실적인 개발 과정**을 반영한다.

현재 의사결정 로그 주제는 다음과 같다.

- [2025-12 Auth Session Architecture](./08-dev-strategy/decision-log/2025-12-auth-session-architecture.md)
- [2025-12 Impersonation](./08-dev-strategy/decision-log/2025-12-impersonation.md)
- [2025-12 Naming](./08-dev-strategy/decision-log/2025-12-naming.md)
- [2025-12 System Layout](./08-dev-strategy/decision-log/2025-12-system-layout.md)
- [2026-01 Category Design](./08-dev-strategy/decision-log/2026-01-category-design.md)
- [2026-01 Impersonation](./08-dev-strategy/decision-log/2026-01-impersonation.md)
- [2026-01 Session User Boundary](./08-dev-strategy/decision-log/2026-01-session-user-boundary.md)
- [2026-02 Service Desk Settings](./08-dev-strategy/decision-log/2026-02-service-desk-settings.md)
- [2026-03 Service Desk](./08-dev-strategy/decision-log/2026-03-service-desk.md)
- [2026-03 Ticket Form Dialog](./08-dev-strategy/decision-log/2026-03-ticket-form-dialog.md)

---

## 핵심 설계 주제

모든 섹션에서 이 문서는 다음 주제를 일관되게 반영한다.

- 범용 CRUD 사고보다 **도메인 우선 설계**
- 시스템의 핵심 동작으로서의 **추적 가능성과 감사 가능성**
- 일괄적인 화면 대신 **역할 인식형 UX**
- 과도한 추상화보다 **실용적인 반복 개선**
- 실제 사용 패턴에 기반한 **확장 가능한 구조**

---

## 권장 읽기 순서

프로젝트를 처음 보는 경우, 다음 순서가 가장 명확한 개요를 제공한다.

1. [README Strategy](./01-project/readme-strategy.md)
2. [Feature-Based Structure](./02-architecture/feature-based-structure.md)
3. [Ticket System Overview](./03-domain/ticket/ticket-system-overview.md)
4. [Ticket Lifecycle](./03-domain/ticket/ticket-lifecycle.md)
5. [Ticket Model](./03-domain/ticket/ticket-model.md)
6. [Category Strategy](./03-domain/ticket/strategy/category-strategy.md)
7. [Approval System](./03-domain/ticket/strategy/approval-system.md)
8. [Assignment Policy](./03-domain/ticket/strategy/assignment-policy.md)
9. [SLA Strategy](./03-domain/ticket/strategy/sla-strategy.md)
10. [Ticket Track Time](./03-domain/ticket/ticket-track-time.md)
11. [Ticket History](./03-domain/ticket/ticket-history.md)
12. [Component Boundary](./04-ui-ux/component-boundary.md)
13. [React Query Strategy](./05-data-fetching/react-query-strategy.md)
14. [Ticket Form Design](./06-form-design/ticket-form.md)
15. [Locale Structure](./07-i18n/locale-structure.md)
16. [Development Approach](./08-dev-strategy/development-approach.md)

---

## 왜 중요한가

이 문서는 단지 **무엇을 만들었는지**만이 아니라,
**왜 그런 설계 결정을 내렸는지**까지 보여주기 위해 작성되었다.

이 프로젝트는 다음 특성을 가진 시스템으로 제시된다.

- 명확한 아키텍처 경계
- 명시적인 도메인 규칙
- 일관된 UI 패턴
- 문서화된 구현 트레이드오프

독자는 이 문서를 통해 빠르게 다음 질문에 답할 수 있어야 한다.

- 이 프로젝트는 어떤 종류의 시스템인가?
- 각 주제는 어디에 문서화되어 있는가?
- 어떤 문서는 안정적인 설계를 설명하고, 어떤 문서는 반복적 구현 과정의 결정을 설명하는가?

---

## 요약

`docs/ko`는 **프로젝트 문서 전략부터 아키텍처, 도메인 동작, UI/UX, 데이터 전략, 폼, 로컬라이제이션, 개발 의사결정**까지 아우르는 Service Desk 시스템 개요이다.

이 문서들을 함께 보면, 이 프로젝트가 단순히 시각적으로 완성된 결과물이 아니라,
**실용적이고, 추적 가능하며, 확장 가능하고, 실제 Service Desk 워크플로에 기반한 시스템**임을 보여준다.

가장 짧은 경로로 문서를 읽고 싶다면 이 파일부터 시작한 뒤
[README Strategy](./01-project/readme-strategy.md)로 이동하고,
위의 권장 읽기 순서를 따르면 된다.
