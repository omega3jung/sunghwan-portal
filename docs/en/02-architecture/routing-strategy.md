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

```txt
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

```txt
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

```txt
route.ts
-> parse request
-> resolve session/runtime
-> require getUserAccessLevel(request) >= ADMIN for settings operations
-> invoke the applicable server authorization policy
-> delegate to LOCAL handler or REMOTE service
-> return DTO response
```

They should not implement domain rules or row mapping inline. Route handlers
invoke the applicable domain policy and server services that resolve stored
resource context.

### Service Desk Settings Authorization

Settings routes apply the same policy to reads and mutations before branching
to LOCAL or REMOTE behavior.

```txt
authenticated JWT access level >= ADMIN (9)
-> effective username
-> canonical AppUser permission / userScope / companyId
-> target Category -> Tenant -> Company context
-> manage / read / none
-> LOCAL or REMOTE operation
```

The route-level access check is deliberately separate from effective-user
resource resolution. During impersonation, the JWT access-level gate protects
entry into Settings operations, while the effective canonical user determines
the tenant and resource capability.

List/read routes filter out `none` resources. Mutation routes require `manage`,
reload the stored category/tenant relationship, and return `403` for read-only
or out-of-bound principals. Request `tenantId`, `companyId`, scope, or admin
type is target input, not authorization evidence.

The Settings UI may redirect unauthorized direct page access to Settings Home
for a better user experience. API routes return `401` for missing
authentication and `403` for authenticated principals without capability; they
do not use page redirects.

Actor-candidate lookup, wherever exposed by the current API surface, is
category-centered and purpose-aware. It applies both the settings capability
and the approver/assignee company boundary rather than returning a global user
directory.

---

## Current Service Desk API Surface

Important current API route groups:

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
/api/service-desk/approval-steps
/api/service-desk/assignment-rules
/api/service-desk/assignment-rules/recommendations
```

Documentation should not describe additional work-session update/delete/timer
routes as completed until route handlers exist.

---

## Command Routes

Ticket operational behavior is exposed through command-style paths.

```txt
/api/service-desk/tickets/[ticketId]/command/start-work
/api/service-desk/tickets/[ticketId]/command/[action]
```

The dynamic action segment uses lower/camel command names such as:

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

The command route delegates to action rules and execution services.

---

## Draft Routes

Draft routes support the create-ticket workflow.

```txt
/api/service-desk/tickets/draft
/api/service-desk/tickets/draft/[ticketId]
```

These routes own REMOTE draft behavior. The create dialog uses them for the
PostgreSQL-backed draft row rather than treating REMOTE draft as component-local
state.

LOCAL draft recovery does not traverse these routes. The feature draft
repository reads and writes browser `localStorage`, scoped to the current demo
user; React Query only orchestrates and caches that repository result.

---

## Attachment Prepare Route

Attachment preparation is a separate route:

```txt
POST /api/service-desk/tickets/attachments/prepare
```

Ticket create, update, and supported action flows call this route before
submitting ticket command payloads with prepared metadata.

---

## Work Session Route

The current implemented route surface is:

```txt
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

```txt
page/component
-> feature hook/client
-> API route handler
-> LOCAL or REMOTE implementation
```

This keeps routing stable as persistence evolves.

---

## Related Documents

- [Database Strategy](database-strategy.md)
- [Ticket System Overview](../03-domain/service-desk/ticket/ticket-system-overview.md)
- [Ticket Lifecycle](../03-domain/service-desk/ticket/ticket-lifecycle.md)
- [Dialog Pattern](../04-client-engineering/ui/dialog-pattern.md)
- [Ticket Form Design](../04-client-engineering/forms/ticket-form.md)
- [Service Desk Implementation Strategy](../05-development/service-desk-implementation-strategy.md)

---

## Summary

The current routing strategy uses stable page routes for Service Desk list and
detail, dialogs for focused ticket commands, and API route handlers as the
LOCAL/REMOTE orchestration boundary. The documented API surface should match the
route files that actually exist. Service Desk Settings routes additionally
apply the JWT ADMIN access gate, then resolve the effective canonical principal
and shared category-scope capability before either runtime path.
