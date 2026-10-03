# Service Desk 시스템 문서

## 목표

이 문서는 `sunghwan-portal`의 Service Desk 시스템에 대한 설계, 아키텍처, 구현
관점을 설명합니다.

포트폴리오 범위의 기능 개발은 완료되었습니다. 현재 설계 문서는 최종 범위와 알려진
제한 사항을 설명합니다. 현재 구현에서 제외한 기능이나 향후 운영 환경을 위한 기능은
확장 가능성을 뜻하며, 예정된 작업이 아닙니다.

문서별 역할은 다음과 같이 구분합니다.

- **현재 설계 문서**는 실제 구현된 구조와 동작을 설명합니다.
- **Decision Log**는 특정 시점의 맥락, 대안, 이유를 보존합니다.
- **README/Overview**는 구조를 요약하고 정확한 규칙을 정의하는 문서로 연결합니다.

---

## 현재 Canonical Spec

현재 시스템을 간략히 정리한 명세:

- [정규 티켓 시스템 명세](../spec/ticket-system.ko.md)

상세 도메인 문서를 읽기 전에 이 명세를 먼저 확인하세요.

---

## 문서 영역

`docs/ko` 폴더 구성:

- `01-overview`: 프로젝트와 Service Desk의 발전 과정
- `02-architecture`: 애플리케이션 계층과 실행 환경별 역할
- `03-domain`: 현재 Service Desk 도메인 모델과 업무 흐름 규칙
- `04-client-engineering`: UI, 폼, 다국어 처리 구현 패턴
- `05-development`: 데이터 조회, 구현 및 테스트 전략, 작성 규칙, 문서 관리 방식,
  릴리스 기록
- `06-decisions`: 과거 설계 결정 기록

---

## Overview

프로젝트와 Service Desk의 발전 과정을 안내합니다.

주요 문서:

- [Service Desk Evolution](./01-overview/service-desk-evolution.md)

---

## Architecture

주요 문서:

- [Feature 기반 구조](./02-architecture/feature-based-structure.md)
- [Routing 전략](./02-architecture/routing-strategy.md)
- [State Management](./02-architecture/state-management.md)
- [Auth & Session Strategy](./02-architecture/auth-session-strategy.md)
- [Impersonation Strategy](./02-architecture/impersonation-strategy.md)
- [Database 전략](./02-architecture/database-strategy.md)

---

## Domain Design

현재 Service Desk의 동작을 정의하는 문서:

- [Service Desk Settings](./03-domain/service-desk/settings.md)
- [Ticket System Overview](./03-domain/service-desk/ticket/ticket-system-overview.md)
- [Ticket Lifecycle](./03-domain/service-desk/ticket/ticket-lifecycle.md)
- [Ticket Model](./03-domain/service-desk/ticket/ticket-model.md)
- [Ticket Action Model](./03-domain/service-desk/ticket/ticket-action.md)
- [Ticket History](./03-domain/service-desk/ticket/ticket-history.md)
- [Ticket Work Session](./03-domain/service-desk/ticket/ticket-work-session.md)
- [Action Strategy](./03-domain/service-desk/ticket/strategy/action-strategy.md)
- [Category Strategy](./03-domain/service-desk/ticket/strategy/category-strategy.md)
- [Approval System](./03-domain/service-desk/ticket/strategy/approval-system.md)
- [Assignment Policy](./03-domain/service-desk/ticket/strategy/assignment-policy.md)
- [SLA Strategy](./03-domain/service-desk/ticket/strategy/sla-strategy.md)
- [Ticket 운영 규칙](./03-domain/service-desk/ticket/reference/ticket-operation-rules.md)
- [Ticket Action Workflow Matrix](./03-domain/service-desk/ticket/reference/ticket-action-workflow-matrix.xlsx)
- [직원 참조 범위 매트릭스](./03-domain/service-desk/ticket/reference/restrict-employee-list.xlsx)

Excel 통합 문서는 Markdown 규칙을 보완합니다. Status 열의 `PROPOSED`와
`REVIEW_REQUIRED`는 구현이 보장된 동작이 아니라 제한 사항이나 미해결 정책을 뜻합니다.
`Legacy Input` 시트는 과거 참조 자료를 보존하며 현재 명세보다 우선하지 않습니다.

현재 도메인 핵심:

- 상태값은 `Draft`, `Approval`, `Declined`, `Assigned`, `Working`, `Pending`,
  `Rejected`, `Resolved`, `Closed`
- 승인 단계의 승인자 결정과 작업 단계의 작업자 배정을 구분
- 요청자 수정 시 담당자 결정을 유지하거나 초기화
- Ticket Action 명령으로 업무 흐름 실행
- 이벤트 단위로 티켓 이력 기록
- Tenant별 설정으로 동작 결정

---

## Client Engineering

UI, 폼, 다국어 처리에서 클라이언트가 담당하는 역할을 설명하는 문서:

### UI/UX

주요 문서:

- [Component Boundary](./04-client-engineering/ui/component-boundary.md)
- [Dialog Pattern](./04-client-engineering/ui/dialog-pattern.md)
- [Dashboard and Insight](./04-client-engineering/ui/dashboard-and-insight.md)

현재 정책:

```txt
Page   -> primary workflow
Dialog -> atomic action or short form
```

티켓 상세는 페이지로 제공합니다. 티켓 생성, 요청자 수정, 티켓 액션은 해당 작업에
집중할 수 있는 다이얼로그나 도구로 제공합니다.

---

### Form Design

주요 문서:

- [Form Pattern](./04-client-engineering/forms/form-pattern.md)
- [Ticket Form Design](./04-client-engineering/forms/ticket-form.md)
- [Ticket Attachment Design](./04-client-engineering/forms/ticket-attachment.md)

현재 폼의 핵심:

- `CreateTicketDialog`와 `UpdateTicketDialog`는 각각 생성과 수정을 담당하는 별도 화면
- LOCAL 초안 복구는 현재 데모 사용자 범위의 브라우저 `localStorage` 상태이며
  기능 초안 저장소를 통해 접근
- REMOTE 초안은 요청자당 하나의 활성 `Draft` 티켓 행
- 브라우저에서 선택한 원본 파일은 임시 보관
- Attachment Prepare API가 티켓 저장 전에 준비된 첨부 정보를 반환

---

### Localization

주요 문서:

- [Locale Structure](./04-client-engineering/i18n/locale-structure.md)
- [Validation Messages](./04-client-engineering/i18n/validation-messages.md)

---

## Development

서버 상태 관리, 구현 및 테스트 전략, 프로젝트 공통 작성 규칙, 문서 관리 방식과
릴리스 기록을 설명합니다.

### Data Fetching

React Query는 Service Desk의 서버 상태를 관리합니다.

주요 문서:

- [React Query Strategy](./05-development/react-query-strategy.md)

현재 쿼리 그룹에는 티켓, 초안, 액션, 이력, 작업 세션, Tenant별 설정이 포함됩니다.
REMOTE 초안 쿼리는 서버 상태를 조회하고, LOCAL 초안 훅은 브라우저 로컬 저장소의
상태를 관리합니다.

---

### Development Strategy

주요 문서:

- [Development Approach](./05-development/development-approach.md)
- [Service Desk Implementation Strategy](./05-development/service-desk-implementation-strategy.md)

---

### Testing Strategy

Vitest는 도메인 규칙, 업무 흐름, 실행 환경과 결과가 일정하게 재현되는 UI 동작을
검증합니다. Storybook은 정해진 범위에서 재사용 UI를 독립적으로 살펴보는 데 사용합니다.

주요 문서:

- [Testing Strategy](./05-development/testing-strategy.md)

---

### Convention과 Documentation Practice

프로젝트 공통 작성 규칙과 문서 관리 방식은 기능, 애플리케이션, 도메인 및 UI 계층에
동일하게 적용됩니다.

주요 문서:

- [Boolean Naming Convention](./05-development/boolean-naming-convention.md)
- [README Strategy](./05-development/readme-strategy.md)

---

### Releases

버전별 주요 변경 사항, 마이그레이션 내용, 아키텍처에 미친 영향, 검증 결과와
관련 PR 및 설계 결정 문서를 기록합니다.

- [Release 문서](./05-development/releases.md)

---

## Decisions

Decision Log는 과거 기록입니다. 당시 사용하던 용어가 남아 있을 수 있습니다.
현재 설계에 맞춰 다시 쓰지 않습니다. 단, 당시 결정 자체에 대한 사실 오류가 있으면
수정합니다.

- [Decision 문서](./06-decisions/README.md)

---

## 권장 읽기 순서

1. [정규 티켓 시스템 명세](../spec/ticket-system.ko.md)
2. [Ticket System Overview](./03-domain/service-desk/ticket/ticket-system-overview.md)
3. [Service Desk Settings](./03-domain/service-desk/settings.md)
4. [Ticket Lifecycle](./03-domain/service-desk/ticket/ticket-lifecycle.md)
5. [Ticket Model](./03-domain/service-desk/ticket/ticket-model.md)
6. [Ticket Action Model](./03-domain/service-desk/ticket/ticket-action.md)
7. [Ticket History](./03-domain/service-desk/ticket/ticket-history.md)
8. [Ticket Work Session](./03-domain/service-desk/ticket/ticket-work-session.md)
9. [Action Strategy](./03-domain/service-desk/ticket/strategy/action-strategy.md)
10. [Approval System](./03-domain/service-desk/ticket/strategy/approval-system.md)
11. [Assignment Policy](./03-domain/service-desk/ticket/strategy/assignment-policy.md)
12. [Category Strategy](./03-domain/service-desk/ticket/strategy/category-strategy.md)
13. [SLA Strategy](./03-domain/service-desk/ticket/strategy/sla-strategy.md)
14. [Ticket Form Design](./04-client-engineering/forms/ticket-form.md)
15. [Ticket Attachment Design](./04-client-engineering/forms/ticket-attachment.md)
16. [React Query Strategy](./05-development/react-query-strategy.md)
17. [Routing Strategy](./02-architecture/routing-strategy.md)
18. [Database Strategy](./02-architecture/database-strategy.md)
19. [Service Desk Implementation Strategy](./05-development/service-desk-implementation-strategy.md)
20. [Testing Strategy](./05-development/testing-strategy.md)
21. [Ticket Operation Rules](./03-domain/service-desk/ticket/reference/ticket-operation-rules.md)
22. [Decision 문서](./06-decisions/README.md)

---

## 요약

`docs/ko`는 실제 구현된 Service Desk의 업무 흐름과 변경 이력을 설명합니다.
현재 설계 문서는 현재 구조와 동작을 설명하고, Decision Log는 모델이 바뀐 이유를
당시의 맥락과 함께 보존합니다.
