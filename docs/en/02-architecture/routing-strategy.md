# Routing Strategy

## Goal

The routing strategy keeps primary workflows addressable while keeping runtime
branching behind API route handlers.

The current Service Desk design uses:

- page routes for primary ticket workflows
- dialogs for atomic actions and short forms
- route handlers for LOCAL/REMOTE orchestration
- resource-oriented API paths for ticket commands, history, draft, settings,
  attachment preparation, and work sessions

---

## Page Routes

```txt id="service-desk-page-routes"
/service-desk
/service-desk/[ticketId]
```

### `/service-desk`

The list/search entry point.

Responsibilities:

- display searchable ticket lists
- open create-ticket workflow
- navigate to ticket detail
- preserve useful list/filter state

### `/service-desk/[ticketId]`

The ticket detail page.

Responsibilities:

- display current ticket DTO
- show phase-aware approval/work assignment
- expose available actions
- show history and work evidence
- open update/action dialogs where allowed

Ticket detail is a page-level workflow, not a modal route.

---

## Page, Drawer, Dialog Policy

```txt id="interaction-policy"
Page   -> primary workflow
Drawer -> secondary reading or side panel
Dialog -> atomic action or short form
```

Examples:

| UI Surface | Use |
| --- | --- |
| page | ticket list and ticket detail |
| dialog | create ticket, requester update, action command forms |
| drawer/panel | history or secondary inspection where implemented |

Complex ticket detail should not be hidden inside a nested modal stack.

---

## API Route Handler Boundary

Route handlers decide HTTP and runtime orchestration.

```txt id="route-handler-flow"
route.ts
-> parse request
-> resolve session/runtime
-> delegate to LOCAL handler or REMOTE service
-> return DTO response
```

They should not own domain rules or row mapping.

---

## Current Service Desk API Surface

Important current API route groups:

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

Documentation should not describe additional work-session update/delete/timer
routes as completed until route handlers exist.

---

## Command Routes

Ticket operational behavior is exposed through command-style paths.

```txt id="ticket-command-paths"
/api/service-desk/tickets/[ticketId]/command/start-work
/api/service-desk/tickets/[ticketId]/command/[action]
```

The dynamic action segment uses lower/camel command names such as:

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

The command route delegates to action rules and execution services.

---

## Draft Routes

Draft routes support the create-ticket workflow.

```txt id="draft-routes"
/api/service-desk/tickets/draft
/api/service-desk/tickets/draft/[ticketId]
```

REMOTE draft behavior is server-owned. The create dialog should use these APIs
instead of treating draft as only a component-local state.

---

## Attachment Prepare Route

Attachment preparation is a separate route:

```txt id="attachment-prepare-route"
POST /api/service-desk/tickets/attachments/prepare
```

Ticket create, update, and supported action flows call this route before
submitting ticket command payloads with prepared metadata.

---

## Work Session Route

The current implemented route surface is:

```txt id="work-session-route"
GET  /api/service-desk/tickets/[ticketId]/work-session
POST /api/service-desk/tickets/[ticketId]/work-session
```

This supports listing and creating work-session records. Additional route
surfaces should be documented only when implemented.

---

## Query Parameters

Use query parameters for list/search state where it improves shareability and
navigation.

Examples:

- filters
- sorting
- pagination
- view tabs

Search itself may still be submitted to a dedicated search endpoint when the
criteria are too rich for simple query-string-only handling.

---

## LOCAL and REMOTE Runtime

Page routes and feature components should not branch deeply on storage details.

```txt id="routing-runtime"
page/component
-> feature hook/client
-> API route handler
-> LOCAL or REMOTE implementation
```

This keeps routing stable as persistence evolves.

---

## Related Documents

- [`database-strategy.md`](database-strategy.md)
- [`../03-domain/ticket/ticket-system-overview.md`](../03-domain/ticket/ticket-system-overview.md)
- [`../03-domain/ticket/ticket-lifecycle.md`](../03-domain/ticket/ticket-lifecycle.md)
- [`../04-ui-ux/dialog-pattern.md`](../04-ui-ux/dialog-pattern.md)
- [`../06-form-design/ticket-form.md`](../06-form-design/ticket-form.md)
- [`../08-dev-strategy/service-desk-implementation-strategy.md`](../08-dev-strategy/service-desk-implementation-strategy.md)

---

## Summary

The current routing strategy uses stable page routes for Service Desk list and
detail, dialogs for focused ticket commands, and API route handlers as the
LOCAL/REMOTE orchestration boundary. The documented API surface should match the
route files that actually exist.
