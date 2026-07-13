# Routing 전략

## 목표

Routing 전략은 주요 workflow를 URL로 접근 가능하게 유지하고, runtime branching은
API route handler 뒤에 둔다.

현재 Service Desk 설계:

- primary ticket workflow는 page route
- atomic action과 short form은 dialog
- LOCAL/REMOTE orchestration은 route handler
- ticket command, history, draft, settings, attachment preparation, work session은
  resource-oriented API path

---

## Page Routes

```txt id="service-desk-page-routes"
/service-desk
/service-desk/[ticketId]
```

### `/service-desk`

List/search entry point이다.

책임:

- searchable ticket list 표시
- create-ticket workflow open
- ticket detail navigation
- 유용한 list/filter state 보존

### `/service-desk/[ticketId]`

Ticket detail page이다.

책임:

- current ticket DTO 표시
- phase-aware approval/work assignment 표시
- available actions 노출
- history와 work evidence 표시
- 허용되는 update/action dialog open

Ticket detail은 modal route가 아니라 page-level workflow이다.

---

## Page, Drawer, Dialog Policy

```txt id="interaction-policy"
Page   -> primary workflow
Drawer -> secondary reading or side panel
Dialog -> atomic action or short form
```

복잡한 ticket detail을 nested modal stack 안에 숨기지 않는다.

---

## API Route Handler Boundary

Route handler는 HTTP와 runtime orchestration을 결정한다.

```txt id="route-handler-flow"
route.ts
-> parse request
-> resolve session/runtime
-> delegate to LOCAL handler or REMOTE service
-> return DTO response
```

Domain rule과 row mapping은 route handler가 소유하지 않는다.

---

## 현재 Service Desk API Surface

```txt id="service-desk-api-surface"
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
/api/service-desk/tickets/cron/close-expired-resolved
/api/service-desk/tenants
/api/service-desk/tenants/[id]
/api/service-desk/categories
/api/service-desk/approval-steps
/api/service-desk/assignment-rules
/api/service-desk/assignment-rules/recommendations
```

Work-session update/delete/timer route는 route handler가 생기기 전까지 completed API로
문서화하지 않는다.

---

## Command Routes

Ticket operational behavior는 command-style path로 노출된다.

```txt id="ticket-command-paths"
/api/service-desk/tickets/[ticketId]/command/start-work
/api/service-desk/tickets/[ticketId]/command/[action]
```

Dynamic action segment:

```txt id="ticket-action-paths"
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

Command route는 action rule과 execution service로 위임한다.

---

## Draft and Attachment Routes

Draft:

```txt id="draft-routes"
/api/service-desk/tickets/draft
/api/service-desk/tickets/draft/[ticketId]
```

Attachment preparation:

```txt id="attachment-prepare-route"
POST /api/service-desk/tickets/attachments/prepare
```

Create/update/supported action flow는 ticket command payload 제출 전 prepare route를
호출한다.

---

## Work Session Route

현재 구현된 route surface:

```txt id="work-session-route"
GET  /api/service-desk/tickets/[ticketId]/work-session
POST /api/service-desk/tickets/[ticketId]/work-session
```

List와 create를 지원한다. 추가 surface는 구현 후 문서화한다.

---

## Query Parameters

Query parameter는 공유/탐색에 유용한 list/search state에 사용한다.

예시:

- filters
- sorting
- pagination
- view tabs

복잡한 search criteria는 dedicated search endpoint로 제출할 수 있다.

---

## LOCAL/REMOTE Runtime

Page route와 feature component는 storage detail에 깊게 결합하지 않는다.

```txt id="routing-runtime"
page/component
-> feature hook/client
-> API route handler
-> LOCAL or REMOTE implementation
```

---

## 관련 문서

- [`database-strategy.md`](database-strategy.md)
- [`../03-domain/ticket/ticket-system-overview.md`](../03-domain/ticket/ticket-system-overview.md)
- [`../03-domain/ticket/ticket-lifecycle.md`](../03-domain/ticket/ticket-lifecycle.md)
- [`../04-ui-ux/dialog-pattern.md`](../04-ui-ux/dialog-pattern.md)
- [`../06-form-design/ticket-form.md`](../06-form-design/ticket-form.md)
- [`../08-dev-strategy/service-desk-implementation-strategy.md`](../08-dev-strategy/service-desk-implementation-strategy.md)

---

## 요약

현재 routing 전략은 Service Desk list/detail page를 안정적으로 유지하고, 집중
command는 dialog/API command로 처리하며, LOCAL/REMOTE runtime orchestration은 route
handler에 둔다. 문서화된 API surface는 실제 route file과 맞아야 한다.
