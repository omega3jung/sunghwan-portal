# Service Desk 시스템 문서

## 목표

이 문서는 `sunghwan-portal`의 Service Desk 시스템에 대한 설계, 아키텍처, 구현
관점을 설명합니다.

문서별 역할은 다음과 같이 구분합니다.

- **현재 설계 문서**는 최신 구현과 정렬된 모델을 설명합니다.
- **Decision Log**는 특정 시점의 맥락, 대안, 이유를 보존합니다.
- **README/Overview**는 구조를 요약하고 source-of-truth 문서로 연결합니다.

---

## 현재 Canonical Spec

현재 시스템을 간략히 정리한 명세:

- [정규 티켓 시스템 명세](../spec/ticket-system.ko.md)

상세 도메인 문서를 읽기 전에 이 명세를 먼저 확인하세요.

---

## 문서 영역

`docs/ko` 폴더 구성:

- `01-overview`: 프로젝트와 Service Desk의 발전 과정
- `02-architecture`: application 및 runtime boundary
- `03-domain`: 현재 Service Desk domain model과 workflow rule
- `04-client-engineering`: UI, form, localization 구현 pattern
- `05-development`: data fetching, 구현 및 테스트 전략, convention, documentation
  practice, release 기록
- `06-decisions`: historical decision log

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

현재 Service Desk behavior를 정의하는 문서:

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

현재 도메인 핵심:

- status는 `Draft`, `Approval`, `Declined`, `Assigned`, `Working`, `Pending`,
  `Rejected`, `Resolved`, `Closed`
- approval과 work assignment는 phase-aware
- requester update는 routing을 preserve 또는 reset할 수 있음
- Ticket Action command가 workflow를 실행
- ticket history는 event-based
- settings는 tenant-scoped behavior configuration

---

## Client Engineering

UI, form, localization의 client-side 책임 경계를 설명하는 문서:

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

Ticket detail은 page입니다. Create, requester update, ticket action은 focused
dialog/tool workflow입니다.

---

### Form Design

주요 문서:

- [Form Pattern](./04-client-engineering/forms/form-pattern.md)
- [Ticket Form Design](./04-client-engineering/forms/ticket-form.md)
- [Ticket Attachment Design](./04-client-engineering/forms/ticket-attachment.md)

현재 form 핵심:

- `CreateTicketDialog`와 `UpdateTicketDialog`는 별도 workflow surface
- LOCAL 초안 복구는 현재 데모 사용자 범위의 브라우저 `localStorage` 상태이며
  기능 초안 저장소를 통해 접근
- REMOTE draft는 requester당 하나의 active `Draft` ticket row
- raw browser file은 transient
- Attachment Prepare API가 ticket write 전 prepared metadata를 반환

---

### Localization

주요 문서:

- [Locale Structure](./04-client-engineering/i18n/locale-structure.md)
- [Validation Messages](./04-client-engineering/i18n/validation-messages.md)

---

## Development

Server-state ownership, 구현 및 테스트 전략, 프로젝트 전반의 convention,
documentation practice와 release 기록을 설명합니다.

### Data Fetching

React Query는 Service Desk server state를 소유합니다.

주요 문서:

- [React Query Strategy](./05-development/react-query-strategy.md)

현재 query family에는 tickets, drafts, actions, histories, work sessions,
tenant-scoped settings가 포함됩니다. REMOTE 초안 query는 server state를 조회하고,
LOCAL 초안 hook은 브라우저 로컬 저장소 상태를 조정합니다.

---

### Development Strategy

주요 문서:

- [Development Approach](./05-development/development-approach.md)
- [Service Desk Implementation Strategy](./05-development/service-desk-implementation-strategy.md)

---

### Testing Strategy

테스트 전략은 domain, workflow, runtime, deterministic UI behavior를 Vitest에
배정하고, 격리된 reusable UI 검토는 프로젝트의 제한된 Storybook boundary에 둡니다.

주요 문서:

- [Testing Strategy](./05-development/testing-strategy.md)

---

### Convention과 Documentation Practice

프로젝트 전반의 convention과 documentation practice는 feature, application,
domain 및 UI boundary에 공통으로 적용됩니다.

주요 문서:

- [Boolean Naming Convention](./05-development/boolean-naming-convention.md)
- [README Strategy](./05-development/readme-strategy.md)

---

### Releases

버전별 주요 변경 사항, migration 내용, architecture 영향, 검증 결과와
관련 PR 및 decision 문서를 기록합니다.

- [Release 문서](./05-development/releases.md)

---

## Decisions

Decision log는 historical record입니다. 당시 사용하던 용어가 남아 있을 수 있습니다.
현재 설계 문서처럼 rewrite하지 않습니다. 단, 당시 결정 자체에 대한 사실 오류가 있으면
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

`docs/ko`는 Service Desk를 최신 구현과 정렬된, 추적 가능한 workflow domain으로
설명합니다. 현재 설계 문서는 최신 모델을 설명하고, decision log는 모델이 왜 변했는지
그 시점의 이유를 보존합니다.
