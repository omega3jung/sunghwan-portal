# Service Desk 시스템 문서

## 목표

이 문서는 `sunghwan-portal`의 Service Desk 시스템에 대한 설계, 아키텍처, 구현
관점을 설명한다.

문서 책임은 다음처럼 분리한다.

- **현재 설계 문서**는 최신 구현과 정렬된 모델을 설명한다.
- **Decision Log**는 특정 시점의 맥락, 대안, 이유를 보존한다.
- **README/Overview**는 구조를 요약하고 source-of-truth 문서로 연결한다.

---

## 현재 Canonical Spec

가장 짧은 현재 시스템 명세:

- [`../spec/ticket-system.ko.md`](../spec/ticket-system.ko.md)

상세 도메인 문서를 읽기 전에 이 문서를 먼저 확인한다.

---

## 문서 영역

`docs/ko` 폴더 구성:

- `01-project`: repository와 README documentation strategy
- `02-architecture`: app structure, routing, database, state, auth/session
- `03-domain`: Service Desk domain rules and workflow behavior
- `04-ui-ux`: UI interaction patterns
- `05-data-fetching`: React Query와 server-state ownership
- `06-form-design`: ticket form, draft, attachment behavior
- `07-i18n`: localization and validation-message strategy
- `08-dev-strategy`: implementation strategy, evolution, operation rules, decision logs

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

- [Service Desk Settings](./03-domain/service-desk-settings.md)
- [Ticket System Overview](./03-domain/ticket/ticket-system-overview.md)
- [Ticket Lifecycle](./03-domain/ticket/ticket-lifecycle.md)
- [Ticket Model](./03-domain/ticket/ticket-model.md)
- [Ticket Activity Model](./03-domain/ticket/ticket-activity.md)
- [Ticket Track Time](./03-domain/ticket/ticket-track-time.md)
- [Ticket History](./03-domain/ticket/ticket-history.md)
- [Action Strategy](./03-domain/ticket/strategy/action-strategy.md)
- [Category Strategy](./03-domain/ticket/strategy/category-strategy.md)
- [Approval System](./03-domain/ticket/strategy/approval-system.md)
- [Assignment Policy](./03-domain/ticket/strategy/assignment-policy.md)
- [SLA Strategy](./03-domain/ticket/strategy/sla-strategy.md)

현재 도메인 핵심:

- status는 `Draft`, `Approval`, `Declined`, `Assigned`, `Working`, `Pending`,
  `Rejected`, `Resolved`, `Closed`
- approval과 work assignment는 phase-aware
- requester update는 routing을 preserve 또는 reset할 수 있음
- Ticket Action command가 workflow를 실행
- ticket history는 event-based
- settings는 tenant-scoped behavior configuration

---

## UI/UX

주요 문서:

- [Component Boundary](./04-ui-ux/component-boundary.md)
- [Dialog Pattern](./04-ui-ux/dialog-pattern.md)
- [Form Pattern](./04-ui-ux/form-pattern.md)
- [Dashboard and Insight](./04-ui-ux/dashboard-and-insight.md)

현재 정책:

```txt
Page   -> primary workflow
Dialog -> atomic action or short form
```

Ticket detail은 page이다. Create, requester update, ticket action은 focused
dialog/tool workflow다.

---

## Data Fetching

React Query는 Service Desk server state를 소유한다.

주요 문서:

- [React Query Strategy](./05-data-fetching/react-query-strategy.md)

현재 query family에는 tickets, drafts, actions, histories, work sessions,
tenant-scoped settings가 포함된다.

---

## Form Design

주요 문서:

- [Ticket Form Design](./06-form-design/ticket-form.md)
- [Ticket Attachment Design](./06-form-design/ticket-attachment.md)

현재 form 핵심:

- `CreateTicketDialog`와 `UpdateTicketDialog`는 별도 workflow surface
- REMOTE draft는 requester당 하나의 active `Draft` ticket row
- raw browser file은 transient
- Attachment Prepare API가 ticket write 전 prepared metadata를 반환

---

## Localization

주요 문서:

- [Locale Structure](./07-i18n/locale-structure.md)
- [Validation Messages](./07-i18n/validation-messages.md)

---

## Development Strategy

주요 문서:

- [Development Approach](./08-dev-strategy/development-approach.md)
- [Service Desk Evolution](./08-dev-strategy/service-desk-evolution.md)
- [Service Desk Implementation Strategy](./08-dev-strategy/service-desk-implementation-strategy.md)
- [Ticket Operation Rules](./08-dev-strategy/ticket-operation-rules.md)

---

## Decision Logs

Decision log는 historical record이다. 당시 맥락에서 오래된 용어가 들어갈 수 있다.
현재 설계 문서처럼 rewrite하지 않는다. 단, 당시 결정 자체에 대한 사실 오류가 있으면
수정한다.

현재 decision log topics:

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
- [2026-03 Ticket Session](./08-dev-strategy/decision-log/2026-03-ticket-session.md)
- [2026-04 Entity Status Naming](./08-dev-strategy/decision-log/2026-04-entity-status-naming.md)
- [2026-04 Ticket Action](./08-dev-strategy/decision-log/2026-04-ticket-action.md)
- [2026-05 Barrel Export Boundary](./08-dev-strategy/decision-log/2026-05-barrel-export-boundary.md)
- [2026-06 Service Desk Tenant Design](./08-dev-strategy/decision-log/2026-06-service-desk-tenant-design.md)
- [2026-06 Service Desk Settings DTO/API Boundary](./08-dev-strategy/decision-log/2026-06-service-desk-settings-dto-api-boundary.md)
- [2026-06 Ticket Attachment Boundary](./08-dev-strategy/decision-log/2026-06-ticket-attachment-boundary.md)
- [2026-06 Ticket Form and Draft Workflow](./08-dev-strategy/decision-log/2026-06-ticket-form-and-draft-workflow.md)
- [2026-07 Ticket Action and History Execution](./08-dev-strategy/decision-log/2026-07-ticket-action-and-history-execution.md)
- [2026-07 Ticket Routing and Update Policy](./08-dev-strategy/decision-log/2026-07-ticket-routing-and-update-policy.md)

---

## 권장 읽기 순서

1. [`../spec/ticket-system.ko.md`](../spec/ticket-system.ko.md)
2. [Service Desk Settings](./03-domain/service-desk-settings.md)
3. [Ticket System Overview](./03-domain/ticket/ticket-system-overview.md)
4. [Ticket Lifecycle](./03-domain/ticket/ticket-lifecycle.md)
5. [Ticket Model](./03-domain/ticket/ticket-model.md)
6. [Ticket Activity Model](./03-domain/ticket/ticket-activity.md)
7. [Ticket History](./03-domain/ticket/ticket-history.md)
8. [Ticket Track Time](./03-domain/ticket/ticket-track-time.md)
9. [Action Strategy](./03-domain/ticket/strategy/action-strategy.md)
10. [Approval System](./03-domain/ticket/strategy/approval-system.md)
11. [Assignment Policy](./03-domain/ticket/strategy/assignment-policy.md)
12. [Category Strategy](./03-domain/ticket/strategy/category-strategy.md)
13. [SLA Strategy](./03-domain/ticket/strategy/sla-strategy.md)
14. [Ticket Form Design](./06-form-design/ticket-form.md)
15. [Ticket Attachment Design](./06-form-design/ticket-attachment.md)
16. [React Query Strategy](./05-data-fetching/react-query-strategy.md)
17. [Routing Strategy](./02-architecture/routing-strategy.md)
18. [Database Strategy](./02-architecture/database-strategy.md)
19. [Service Desk Implementation Strategy](./08-dev-strategy/service-desk-implementation-strategy.md)
20. [Ticket Operation Rules](./08-dev-strategy/ticket-operation-rules.md)

---

## 요약

`docs/ko`는 Service Desk를 최신 구현과 정렬된, 추적 가능한 workflow domain으로
설명한다. 현재 설계 문서는 최신 모델을 설명하고, decision log는 모델이 왜 변했는지
그 시점의 이유를 보존한다.
