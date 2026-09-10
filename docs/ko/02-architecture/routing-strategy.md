# Routing 전략

## 목표

Routing 전략은 주요 workflow를 URL로 접근 가능하게 유지하고, runtime branching은
API route handler 뒤에 둡니다.

현재 Service Desk 설계:

- primary ticket workflow는 page route
- atomic action과 short form은 dialog
- LOCAL/REMOTE orchestration은 route handler
- ticket command, history, draft, settings, attachment preparation, work session은
  resource-oriented API path

---

## Page Routes

```txt
/service-desk
/service-desk/[ticketId]
/service-desk/insights
/settings/service-desk-settings
/settings/service-desk-settings/tenant
/settings/service-desk-settings/category
/settings/service-desk-settings/approval-step
/settings/service-desk-settings/assignment-rule
```

### `/service-desk`

List/search entry point입니다.

책임:

- searchable ticket list 표시
- create-ticket workflow open
- ticket detail navigation
- 유용한 list/filter state 보존

### `/service-desk/[ticketId]`

Ticket detail page입니다.

책임:

- current ticket DTO 표시
- phase-aware approval/work assignment 표시
- available actions 노출
- history와 work evidence 표시
- 허용되는 update/action dialog open

Ticket detail은 modal route가 아니라 page-level workflow입니다.

### `/service-desk/insights`

Service Desk 전용 분석 페이지입니다. 메인 ticket-list page를 밀도 높은 reporting
surface로 만들지 않으면서 ticket search criteria, analytical card, chart, supporting
ticket result를 결합합니다.

### `/settings/service-desk-settings/*`

Service Desk Settings는 landing page와 Tenant, Category, Approval Step, Assignment
Rule을 위한 독립적인 addressable page로 구성됩니다. Page-level guard는 navigation
UX를 개선하고, 대응하는 API route는 authorization boundary를 유지합니다.

---

## Page, Drawer, Dialog Policy

```txt
Page   -> primary workflow
Drawer -> secondary reading or side panel
Dialog -> atomic action or short form
```

복잡한 ticket detail을 nested modal stack 안에 숨기지 않습니다.

---

## API Route Handler Boundary

Route handler는 HTTP와 runtime orchestration을 결정합니다.

```txt
route.ts
-> parse request
-> resolve session/runtime
-> settings operation이면 getUserAccessLevel(request) >= ADMIN 확인
-> 해당 server authorization policy 적용
-> delegate to LOCAL handler or REMOTE service
-> return DTO response
```

Route handler는 domain rule이나 row mapping을 inline으로 구현하지 않습니다. 저장된
resource context를 해석하는 domain policy와 server service를 호출합니다.

### Service Desk Settings Authorization

Settings route는 LOCAL/REMOTE로 분기하기 전에 read와 mutation에 같은 policy를
적용합니다.

```txt
authenticated JWT access level >= ADMIN (9)
-> effective username
-> canonical AppUser permission / userScope / companyId
-> target Category -> Tenant -> Company context
-> manage / read / none
-> LOCAL or REMOTE operation
```

Route access-level gate와 effective-user resource resolution은 의도적으로 분리합니다.
Impersonation 중에는 JWT access-level gate가 Settings operation 진입을 보호하고,
effective canonical user가 tenant 및 resource capability를 결정합니다.

List/read route는 `none` resource를 제외합니다. Mutation route는 `manage`를 요구하고
저장된 category/tenant 관계를 다시 load하며, read-only 또는 boundary 밖의 principal에는
`403`을 반환합니다. Request의 `tenantId`, `companyId`, scope, admin type은 target
input일 뿐 authorization evidence가 아닙니다.

Settings UI는 사용자 경험을 위해 unauthorized direct page access를 Settings Home으로
redirect할 수 있습니다. API route는 authentication이 없으면 `401`, capability가 없는
authenticated principal에는 `403`을 반환하며 page redirect를 사용하지 않습니다.

Actor candidate lookup은 API surface에 존재하는 경우 category-centered,
purpose-aware해야 합니다. Settings capability와 approver/assignee company boundary를
모두 적용하며 global user directory를 반환하지 않습니다.

---

## 현재 Service Desk API Surface

```txt
/api/service-desk/tickets
/api/service-desk/tickets/search
/api/service-desk/tickets/draft
/api/service-desk/tickets/draft/[ticketId]
/api/service-desk/tickets/[ticketId]
/api/service-desk/tickets/[ticketId]/actions
/api/service-desk/tickets/[ticketId]/actions/[actionNo]
/api/service-desk/tickets/[ticketId]/command/start-work
/api/service-desk/tickets/[ticketId]/command/[action]
/api/service-desk/tickets/[ticketId]/histories
/api/service-desk/tickets/[ticketId]/work-session
/api/service-desk/tickets/attachments/prepare
/api/service-desk/cron/tickets/close-expired-resolved
/api/service-desk/tenants
/api/service-desk/tenants/[id]
/api/service-desk/categories
/api/service-desk/categories/[categoryId]/context
/api/service-desk/approval-steps
/api/service-desk/assignment-rules
/api/service-desk/assignment-rules/recommendations
```

Work-session update/delete/timer route는 route handler가 생기기 전까지 completed API로
문서화하지 않습니다.

---

## Command Routes

Ticket operational behavior는 command-style path로 노출됩니다.

```txt
/api/service-desk/tickets/[ticketId]/command/start-work
/api/service-desk/tickets/[ticketId]/command/[action]
```

Dynamic action segment:

```txt
approve
decline
comment
note
assign
assignSelf
adjust
reject
merge
reopen
resubmit
cancel
```

Command route는 action rule과 execution service로 위임합니다.

---

## Draft Routes

Draft route는 create-ticket workflow를 지원합니다.

```txt
/api/service-desk/tickets/draft
/api/service-desk/tickets/draft/[ticketId]
```

이 경로들은 REMOTE 초안 동작을 소유합니다. 생성 다이얼로그는 REMOTE 초안을
컴포넌트 로컬 상태로 취급하지 않고 PostgreSQL 기반 초안 행에 이 API를 사용합니다.

LOCAL 초안 복구는 이 경로를 거치지 않습니다. 기능 초안 저장소가 현재 데모 사용자
범위의 브라우저 `localStorage`를 읽고 쓰며, React Query는 저장소 결과를 조정하고
캐시하는 역할만 합니다.

---

## Attachment Prepare Route

Attachment preparation은 별도 route입니다.

```txt
POST /api/service-desk/tickets/attachments/prepare
```

Create/update/supported action flow는 ticket command payload 제출 전 prepare route를
호출합니다.

---

## Work Session Route

현재 구현된 route surface:

```txt
GET  /api/service-desk/tickets/[ticketId]/work-session
POST /api/service-desk/tickets/[ticketId]/work-session
```

List와 create를 지원합니다. 추가 surface는 구현 후 문서화합니다.

---

## Query Parameters

Query parameter는 공유/탐색에 유용한 list/search state에 사용합니다.

예시:

- filters
- sorting
- pagination
- view tabs

복잡한 search criteria는 dedicated search endpoint로 제출할 수 있습니다.

현재 Service Desk 티켓 검색과 Insights 페이지는 필터, 정렬, 페이지네이션, view
state를 `sessionStorage`에 저장하며 query parameter와 동기화하지 않습니다.

---

## LOCAL/REMOTE Runtime

Page route와 feature component는 storage detail에 깊게 결합하지 않습니다.

```txt
page/component
-> feature hook/client
-> API route handler
-> LOCAL or REMOTE implementation
```

---

## 관련 문서

- [데이터베이스 전략](database-strategy.md)
- [티켓 시스템 개요](../03-domain/service-desk/ticket/ticket-system-overview.md)
- [티켓 생명주기](../03-domain/service-desk/ticket/ticket-lifecycle.md)
- [다이얼로그 패턴](../04-client-engineering/ui/dialog-pattern.md)
- [티켓 폼 설계](../04-client-engineering/forms/ticket-form.md)
- [서비스 데스크 구현 전략](../05-development/service-desk-implementation-strategy.md)

---

## 요약

현재 routing 전략은 Service Desk list, detail, Insights, settings surface를 안정적인
page route로 유지하고, 특정 작업에 집중하는 command는 dialog/API command로 처리하며,
LOCAL/REMOTE runtime orchestration은 route handler에 둡니다. 문서화된 API surface는
실제 route file과 맞아야 합니다. Service Desk Settings route는 추가로 JWT ADMIN
access gate를 적용한 다음 effective canonical principal과 category-scope capability를
해석하고 두 runtime 중 하나로 분기합니다.
