# 티켓 시스템 명세

## 언어

- [English](./ticket-system.md)
- [한국어](./ticket-system.ko.md)

## 목표

이 문서는 현재 Service Desk 티켓 시스템을 요약하는 명세입니다.

티켓 시스템은 CRUD 중심이 아니라 workflow 중심입니다. 티켓은 승인, 담당자
배정, SLA, 활동, 이력, 작업 세션 동작을 거치는 workflow entity입니다.

이 파일은 high-level spec이자 문서 허브입니다. 세부 규칙, 구현 전략, 의사결정
이력은 링크된 상세 문서에서 다룹니다.

## 현재 범위

현재 프로젝트는 다음 범위를 다룹니다.

- 티켓 목록, 상세, 생성, 수정 흐름
- tenant-scoped category configuration
- category-driven approval, assignment, SLA, priority, risk, request template behavior
- action-based activity 및 timeline behavior
- immutable history 및 audit record
- session-based work tracking 방향
- 안전한 server-side mock state를 사용하는 LOCAL demo behavior
- settings 및 reference data를 위한 REMOTE/Supabase 정렬 DTO/API boundary

이 프로젝트는 production-aligned이지만 production-complete는 아닙니다. 인프라
비용이 큰 영역은 의도적으로 deferred scope로 분리하면서도, 현실적인 Service Desk
workflow를 모델링합니다.

## 핵심 도메인 모델

현재 Service Desk 모델은 configuration과 ticket execution을 분리합니다.

```txt
Tenant
  -> Category
  -> Approval
  -> Assignment
  -> SLA

Ticket
  -> Activity / Action
  -> Track Time
  -> History
```

`Ticket`은 단순 database record가 아닙니다. 제어된 workflow의 현재 상태이며,
관련 모델들은 그 상태가 어떻게 설정되고, 변경되고, 감사되는지를 설명합니다.

## 테넌트 및 카테고리 구성

현재 configuration model은 다음과 같습니다.

```txt
Company = organization/reference entity
Tenant = Service Desk configuration boundary
Category = tenant-scoped behavior configuration
```

category hierarchy는 다음과 같습니다.

```txt
Tenant -> Main Category -> Sub Category
```

테넌트는 Service Desk configuration scope를 소유합니다. 카테고리는 테넌트에
속하며 티켓 동작을 결정합니다.

- Main Category는 default를 제공합니다.
- Sub Category는 default를 보완하거나 override합니다.
- approval, assignment, SLA, priority, risk, request template은 tenant scope 안에서 해석됩니다.
- ticket-level override는 명시적이고, 눈에 보이며, 추적 가능한 경우에만 허용됩니다.

관련 문서:

- [Category Strategy](../ko/03-domain/ticket/strategy/category-strategy.md)
- [2026-06 Service Desk Tenant Design](../ko/08-dev-strategy/decision-log/2026-06-service-desk-tenant-design.md)

## 티켓 수명 주기 및 상태

티켓 lifecycle은 정상 흐름뿐 아니라 운영상 발생하는 분기도 모델링합니다.

현재 status vocabulary에는 다음이 포함됩니다.

```txt
Draft
Open
Approved
Declined
Working
Pending
Rejected
Reopen
Resolved
Closed
```

주요 성공 흐름은 다음과 같습니다.

```txt
Draft -> Open -> Approved -> Working -> Resolved -> Closed
```

실제 workflow는 approval을 건너뛰거나, `Pending`에서 일시 정지되거나,
`Rejected`가 되거나, `Reopen`을 통해 다시 진행되거나, merge handling으로
종료될 수 있습니다. 이 spec은 모든 transition을 정의하지 않습니다. 실행 가능한
transition rule은 별도 rules 문서에서 관리합니다.

관련 문서:

- [Ticket Lifecycle](../ko/03-domain/ticket/ticket-lifecycle.md)
- [Ticket Operation Rules](../ko/08-dev-strategy/ticket-operation-rules.md)

## 액션/활동 모델

시스템은 comment-only가 아니라 action-oriented 모델입니다.

```txt
Activity = Action + Context + Reason + Execution Rules
```

커뮤니케이션과 운영 변경은 하나의 activity model을 공유합니다.

현재 또는 문서화된 action type에는 다음이 포함됩니다.

- `comment`
- `note`
- `assign`
- `adjust`
- `merge`
- `reject`
- `requestReview`
- `reopen`
- `resubmit`
- `assignSelf`

communication action은 작성자 기준 규칙 아래에서 수정 가능할 수 있습니다.
operational action은 의사결정을 나타내며 일반적으로 immutable입니다.

관련 문서:

- [Ticket Activity Model](../ko/03-domain/ticket/ticket-activity.md)
- [Action Strategy](../ko/03-domain/ticket/strategy/action-strategy.md)
- [2026-04 Ticket Action](../ko/08-dev-strategy/decision-log/2026-04-ticket-action.md)

## 이력 및 감사 모델

Activity와 History는 서로 다른 책임을 가집니다.

```txt
Activity = user-facing meaningful interaction
History = immutable event/audit record
```

History record는 의미 있는 변경에서 생성되며, 일반 workflow operation에서 수정하거나
삭제하지 않습니다. 정정이 필요하면 새로운 event로 기록해야 합니다.

관련 문서:

- [Ticket History](../ko/03-domain/ticket/ticket-history.md)

## 승인 전략

승인은 category-driven이며 순차적으로 처리됩니다.

```txt
Tenant-scoped Category -> approvalSteps[]
```

approval step은 category configuration에 속하고 tenant boundary 안에서 해석됩니다.
category configuration이 skip threshold를 정의하면 requester 권한에 따라 approval
step을 건너뛸 수 있습니다.

관련 문서:

- [Approval System](../ko/03-domain/ticket/strategy/approval-system.md)

## 담당자 배정 전략

담당자 배정은 tenant-scoped category configuration에서 해석됩니다.

```txt
Ticket -> Category -> Assignment Rule -> Assignee
```

assignment rule은 routing, assignee, fallback behavior를 결정합니다. reassignment는
명시적 action을 통해서만 허용되어야 하며 activity와 history에 남아야 합니다.

관련 문서:

- [Assignment Policy](../ko/03-domain/ticket/strategy/assignment-policy.md)

## SLA 전략

SLA behavior는 category, risk, priority를 함께 고려합니다.

category configuration은 기본 risk, priority, SLA 값을 제공할 수 있습니다. SLA
matrix는 due date와 service expectation을 해석하는 모델로 유지됩니다.

SLA breach handling, escalation automation, business calendar, holiday engine은
명시적으로 구현되기 전까지 production extension point로 남습니다.

관련 문서:

- [SLA Strategy](../ko/03-domain/ticket/strategy/sla-strategy.md)

## 작업 세션/트랙 시간

작업 시간은 단일 누적 필드가 아니라 session으로 모델링합니다.

```txt
Work = collection of sessions
```

track-time model은 다음을 지원합니다.

- start
- finish
- switch
- 별도 mode로서의 manual time entry
- 파생된 aggregate duration

이 방식은 실제 운영에서 발생하는 interruption, resumption, task switching을 더 잘
반영합니다.

관련 문서:

- [Ticket Track Time](../ko/03-domain/ticket/ticket-track-time.md)
- [2026-03 Ticket Session](../ko/08-dev-strategy/decision-log/2026-03-ticket-session.md)

## 소유권 및 권한 컨텍스트

ownership은 고정 저장 상태가 아니라 파생 값입니다.

일반적인 ownership context에는 다음이 포함됩니다.

- requester relationship
- assignee relationship
- current session user
- impersonation 중 original/effective user

requester, assignee, permission, current user context는 어떤 action이 보이고
실행 가능한지에 영향을 줍니다.

authentication identity, session-safe user projection, `AppUser`는 분리되어야 합니다.
impersonation은 session-aware behavior이며 auditability를 위해 original user와
current user context를 보존해야 합니다.

관련 문서:

- [Auth & Session Strategy](../ko/02-architecture/auth-session-strategy.md)
- [Impersonation Strategy](../ko/02-architecture/impersonation-strategy.md)

## 첨부 파일

티켓은 file 및 image attachment 개념을 지원합니다.

현재 portfolio scope에서 attachment behavior는 보수적으로 다룹니다. local/demo
behavior는 제어된 attachment reference나 준비된 asset을 사용할 수 있습니다.
production-grade upload, storage, scanning, access control, cleanup policy는
명시적으로 구현되기 전까지 deferred scope입니다.

## 로컬/원격 런타임 경계

Service Desk는 두 runtime path를 지원합니다.

```txt
LOCAL  = mock-backed demo behavior
REMOTE = Supabase PostgreSQL / API-backed behavior
```

의도한 request flow는 다음과 같습니다.

```txt
UI
-> feature API client
-> Next.js Route Handler
-> LOCAL handler or REMOTE DTO/service
```

UI는 LOCAL/REMOTE 내부 구현에 따라 분기해서는 안 됩니다. runtime-specific behavior는
route handler, server handler, local state module, service, repository, DTO mapper
뒤에 있어야 합니다.

관련 문서:

- [Service Desk Implementation Strategy](../ko/08-dev-strategy/service-desk-implementation-strategy.md)
- [React Query Strategy](../ko/05-data-fetching/react-query-strategy.md)

## DTO/API 경계

REMOTE data access는 다음 흐름을 따라야 합니다.

```txt
Database Row -> Mapper -> DTO
```

DTO는 database row shape를 숨기고 application-facing contract를 제공합니다.
LOCAL과 REMOTE path는 compatible DTO를 반환해야 하며, UI code는 mock shape와
database shape 차이에 의존해서는 안 됩니다.

Service Desk settings domain에는 다음이 포함됩니다.

- Tenant
- Category
- Approval Step
- Assignment Rule

Route handler는 orchestration boundary로 유지해야 합니다. speculative CRUD route는
실제 workflow를 지원하고 명확한 LOCAL/REMOTE behavior가 있을 때만 유지해야 합니다.

관련 문서:

- [Database Strategy](../ko/02-architecture/database-strategy.md)
- [2026-06 Service Desk Settings DTO/API Boundary](../ko/08-dev-strategy/decision-log/2026-06-service-desk-settings-dto-api-boundary.md)

## 향후 범위

deferred 또는 future expansion 영역은 다음과 같습니다.

- 모든 Service Desk workflow에 대한 full remote persistence
- production-grade file upload, storage, security
- complete enterprise authorization and rule engine
- real-time updates
- full notification delivery
- full SLA calendar and holiday engine
- full audit/compliance infrastructure

이 항목들은 이 spec이 약속하는 구현 범위가 아닙니다. 현재 production-aligned
portfolio scope와 의도적으로 분리된 future scope입니다.

## 관련 문서

### Overview

- [Service Desk Documentation Index](../ko/README.md)
- [Ticket System Overview](../ko/03-domain/ticket/ticket-system-overview.md)
- [Ticket Model](../ko/03-domain/ticket/ticket-model.md)

### Domain

- [Ticket Lifecycle](../ko/03-domain/ticket/ticket-lifecycle.md)
- [Ticket Activity Model](../ko/03-domain/ticket/ticket-activity.md)
- [Ticket History](../ko/03-domain/ticket/ticket-history.md)
- [Ticket Track Time](../ko/03-domain/ticket/ticket-track-time.md)

### Strategy

- [Category Strategy](../ko/03-domain/ticket/strategy/category-strategy.md)
- [Approval System](../ko/03-domain/ticket/strategy/approval-system.md)
- [Assignment Policy](../ko/03-domain/ticket/strategy/assignment-policy.md)
- [SLA Strategy](../ko/03-domain/ticket/strategy/sla-strategy.md)
- [Action Strategy](../ko/03-domain/ticket/strategy/action-strategy.md)
- [Ticket Operation Rules](../ko/08-dev-strategy/ticket-operation-rules.md)
- [Service Desk Implementation Strategy](../ko/08-dev-strategy/service-desk-implementation-strategy.md)

### Architecture

- [Database Strategy](../ko/02-architecture/database-strategy.md)
- [Auth & Session Strategy](../ko/02-architecture/auth-session-strategy.md)
- [Impersonation Strategy](../ko/02-architecture/impersonation-strategy.md)

### Data Fetching

- [React Query Strategy](../ko/05-data-fetching/react-query-strategy.md)

### Decision Logs

- [2026-03 Ticket Session](../ko/08-dev-strategy/decision-log/2026-03-ticket-session.md)
- [2026-04 Ticket Action](../ko/08-dev-strategy/decision-log/2026-04-ticket-action.md)
- [2026-06 Service Desk Tenant Design](../ko/08-dev-strategy/decision-log/2026-06-service-desk-tenant-design.md)
- [2026-06 Service Desk Settings DTO/API Boundary](../ko/08-dev-strategy/decision-log/2026-06-service-desk-settings-dto-api-boundary.md)
