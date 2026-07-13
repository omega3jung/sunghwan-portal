# Database 전략

## 목표

Database 전략은 `sunghwan-portal`이 persisted application data를 server code에서
어떻게 접근하고, UI contract를 어떻게 안정적으로 유지하는지 정의한다.

현재 Service Desk 구현 방향:

```txt id="database-core"
server-only database access
+ role-separated connections
+ row / mapper / DTO boundaries
+ service-owned workflow rules
```

UI는 table에 직접 접근하지 않는다. Feature client가 application API를 호출하고,
server service가 row query, mapping, validation, write를 결정한다.

---

## Runtime Flow

```txt id="database-runtime-flow"
UI
-> feature API client
-> Next.js route handler
-> server service
-> repository
-> query client
-> PostgreSQL
```

Route handler는 HTTP orchestration boundary다. SQL이나 row mapping logic을
포함하지 않는다.

---

## Role Separation

Database access는 책임에 따라 분리한다.

```txt id="database-roles"
auth_api     -> authentication-only database access
portal_api   -> application data access
service_role -> normal application flow에서 사용하지 않음
```

### `auth_api`

Login/authentication 관련 data access에 사용한다.

예시:

- credential validation
- active auth account read
- login metadata update

### `portal_api`

인증 이후 application data access에 사용한다.

예시:

- user profile read
- Service Desk tickets read/mutate
- Service Desk settings read/mutate
- repository/service를 통한 workflow operation

### `service_role`

`service_role`은 routine app flow가 아니라 administrative/platform capability로
취급한다.

---

## Row / Mapper / DTO Boundary

Database row와 application DTO는 책임이 다르다.

```txt id="row-mapper-dto"
Database Row
-> Mapper
-> Application DTO
```

| Layer | 책임 |
| --- | --- |
| Row | SQL-facing shape, 보통 `snake_case` |
| Mapper | naming conversion, null normalization, legacy normalization, DTO shaping |
| DTO | feature code가 소비하는 application-facing API contract |
| Repository | parameterized SQL과 persistence logic |
| Service | workflow rule과 use-case coordination |

UI는 `snake_case` row name이나 database-only column에 의존하지 않는다.

---

## Service Desk Schema Boundary

Service Desk data는 `src/server/data/serviceDesk` 경계에 있다.

중요 영역:

- settings: tenants, categories, approval steps, assignment rules
- ticket: create/search/detail/update/workflow services
- ticket draft: active requester draft workflow
- ticket action: command rules and execution
- ticket history: event-based audit records
- work session: work evidence records

Application-facing domain type은 `src/domain/serviceDesk`에 둔다.

---

## Ticket Persistence

Ticket은 current workflow state와 routing facts를 persist한다.

현재 status:

```ts id="ticket-status"
type TicketStatus =
  | "Draft"
  | "Approval"
  | "Declined"
  | "Assigned"
  | "Working"
  | "Pending"
  | "Rejected"
  | "Resolved"
  | "Closed";
```

Mapper는 older row value를 compatibility 목적으로 normalize할 수 있지만 current
design과 DTO contract는 현재 status union을 사용한다.

중요 persistence boundary:

- REMOTE draft는 `Draft` status의 ticket row이다.
- submitted ticket은 `Approval` 또는 `Assigned`로 이동한다.
- current approval/work routing은 ticket assignment fields를 사용한다.
- `tk_approval_step_id`는 필요한 경우 current approval step을 나타낸다.
- `tk_assignee_usernames`는 current responsible usernames를 나타낸다.
- attachment fields는 raw file이 아니라 prepared metadata를 저장한다.

---

## Routing Persistence

Approval/work routing은 phase-aware이다.

```ts id="assignment-phase"
type TicketAssignmentPhase = "APPROVAL" | "WORK";
```

Database row는 최소 current routing facts를 저장하고 mapper/DTO가 readable
projection을 만든다.

- `assignmentPhase`
- `approvalAssigneeUsernames`
- `workAssigneeUsernames`
- `assignedApprover`
- `assignedWorker`

Approval-step과 assignment-rule settings는 workflow transition 시 ticket state로
resolve된다. Settings 변경이 기존 ticket routing/history를 silent rewrite하지 않는다.

REMOTE routing boundary는 repository가 사용하는 Service Desk database function에
approval/assignment resolution을 위임한다:
`service_desk.get_next_approval_step`,
`service_desk.get_approval_step_assignee_usernames`,
`service_desk.get_category_assignment_usernames`. Design contract는 approval step은
선택된 category의 parent/main category에서 resolve하고, assignment rule은 선택된
subcategory override와 parent/main fallback을 사용한다는 것이다.

---

## Draft Persistence

REMOTE draft는 별도 client-only model이 아니라 ticket persistence를 사용한다.

규칙:

- requester당 하나의 active draft
- create가 active draft row를 재사용 가능
- discard는 active draft workflow 제거
- draft data는 form-oriented
- raw file/durable attachment recovery는 보장하지 않음

---

## Attachment Persistence

현재 database strategy는 attachment binary를 persist하지 않는다.

```txt id="attachment-persistence-flow"
browser File[] / inline data images
-> Attachment Prepare API
-> prepared metadata
-> ticket row files/images fields
```

Prepared metadata 예시:

- `originalName`
- `replacedName`
- `extension`
- `size`
- `type`
- `demoUrl`
- `replaced`
- `reason`

미래 object storage는 object key나 signed URL을 도입할 수 있지만 현재는 controlled
demo metadata만 저장한다.

---

## History Persistence

Ticket history는 event-based이다.

현재 모델:

- history `type`
- history `source`
- history `event`
- previous/current values
- actor/timestamp

`event`가 authoritative classification이다. `tkh_history_action`이나
`metadata.event`를 primary event model로 설명하지 않는다.

History row는 successful command/service가 작성한다.

- ticket submit
- requester update
- approval/assignment routing
- ticket action execution
- work-session creation
- expired resolved ticket auto close

---

## Settings Persistence

Service Desk Settings도 row/mapper/DTO rule을 따른다.

현재 settings:

- `Tenant`
- `MainCategory`
- `SubCategory`
- `ApprovalStep`
- `AssignmentRule`

Tenant가 Service Desk configuration boundary이다. Category, approval step,
assignment rule은 tenant scope에서 평가된다.

Settings 변경은 future workflow resolution에 영향을 준다. Existing ticket은 explicit
ticket command가 없으면 stored state/routing/activity/history를 유지한다.

---

## Query Clients and Environment

Database URL과 privileged credential은 server-only이다.

| Variable | Purpose | Exposure |
| --- | --- | --- |
| `AUTH_DATABASE_URL` | auth data direct PostgreSQL connection | server-only |
| `PORTAL_DATABASE_URL` | portal data direct PostgreSQL connection | server-only |
| `NEXTAUTH_URL` | auth runtime URL | environment |
| `NEXTAUTH_SECRET` | auth signing secret | secret |
| public Supabase values | public infrastructure reference | public |

규칙:

```txt id="database-env-rule"
편의가 아니라 책임을 기준으로 query client를 선택한다.
```

---

## RLS and Grants

Effective permission은 grants와 row-level security 조합이다.

```txt id="rls-grants"
effective permission = object grants + RLS policies
```

App-facing table/view는 다음을 점검해야 한다.

- schema usage grants
- table/view/function grants
- RLS policy coverage
- least-privilege role behavior

---

## Transaction Policy

여러 record를 함께 변경하는 workflow command는 transaction-aware여야 한다.

예시:

- submit ticket and write history
- reset routing and write routing history
- execute action and write action/history/status changes
- close/cancel/reject/merge 시 running work session finish

Service layer가 use-case boundary를 소유하고 repository가 개별 SQL operation을 소유한다.

---

## LOCAL and REMOTE Relationship

LOCAL runtime은 server-side mutable demo state를 사용할 수 있다. REMOTE runtime은
database data layer를 사용한다.

둘 모두 compatible application-facing contract를 노출해야 한다.

```txt id="local-remote-dto-contract"
LOCAL state shape or REMOTE row shape
-> mapper/handler
-> application DTO
-> feature UI
```

---

## Deferred Scope

현재 database strategy는 다음을 완료된 것으로 주장하지 않는다.

- durable binary attachment storage
- complete per-table RLS policy catalog
- migration/versioning guide for every schema change
- full settings version publishing
- full audit export/compliance infrastructure
- production notification persistence
- complete SLA breach/escalation persistence

---

## 관련 문서

- [`../03-domain/service-desk-settings.md`](../03-domain/service-desk-settings.md)
- [`../03-domain/ticket/ticket-model.md`](../03-domain/ticket/ticket-model.md)
- [`../03-domain/ticket/ticket-history.md`](../03-domain/ticket/ticket-history.md)
- [`../03-domain/ticket/ticket-track-time.md`](../03-domain/ticket/ticket-track-time.md)
- [`../06-form-design/ticket-attachment.md`](../06-form-design/ticket-attachment.md)
- [`../08-dev-strategy/service-desk-implementation-strategy.md`](../08-dev-strategy/service-desk-implementation-strategy.md)

---

## 요약

Database strategy는 persisted data를 server-only, role-separated access와 stable DTO
contract 뒤에 둔다. Service Desk의 현재 핵심 경계는 ticket persistence, `Draft`
ticket으로서의 REMOTE draft, prepared attachment metadata, event-based history,
phase-aware routing fields, tenant-scoped settings, transaction-aware workflow service이다.
