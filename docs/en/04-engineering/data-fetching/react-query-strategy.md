# React Query Strategy

## Goal

React Query manages Service Desk server state.

The strategy is to keep fetched data out of global UI stores, use deterministic
query keys, and invalidate the smallest useful query family after mutations.

---

## Core Principle

```txt
Server state belongs to React Query.
UI state belongs to component state or small UI stores.
```

Service Desk settings, tickets, REMOTE drafts, actions, histories, and work
sessions are server state. LOCAL draft recovery is the exception: it is
browser-local repository state exposed through the same query hooks.

---

## Query Classification

### Reference or Settings-Like Queries

These change less frequently but are still server state:

- tenants
- categories
- approval steps
- assignment rules
- organization reference lists used by settings

They may use longer stale times where the feature allows it, but they should
still be invalidated after settings mutations.

### Workflow Queries

These can change after user actions:

- ticket search/list
- ticket detail
- active draft
- ticket actions
- ticket histories
- work sessions

They should be invalidated after workflow mutations that can affect them.

---

## Current Service Desk Query Families

Current query key families include:

```txt
ticket list/search
ticket detail
ticket draft by dataScope/userId
ticket actions list/detail
ticket histories
ticket work sessions
settings tenants
settings categories
settings approval steps
settings assignment rules
```

The exact key builder lives in feature/domain code. Documentation should
describe the family and ownership, not invent unrelated key names.

---

## Mutation Invalidation

Invalidate the affected server state after a mutation.

Examples:

| Mutation | Invalidate |
| --- | --- |
| create ticket / submit draft | ticket list/search, ticket detail when known, active draft |
| save/discard draft | active draft |
| requester update | ticket detail, ticket list/search, histories |
| ticket action command | ticket detail, actions, histories, list/search where status can change |
| work-session create | work sessions, ticket detail, histories, list/search when status changes |
| settings mutation | affected settings family and workflows that depend on refetched settings |

Avoid global invalidation unless the operation truly changes broad application
state.

---

## Draft Query Policy

REMOTE draft is server state backed by a PostgreSQL ticket row and accessed
through the draft Route Handlers. LOCAL draft recovery is instead stored in
browser `localStorage`, scoped by the current demo user, and read or written by
the feature draft repository without calling those Route Handlers.

React Query provides query and mutation orchestration for both data scopes. Its
cache is not the durable REMOTE store or the LOCAL recovery store.

The create dialog should load the active draft through the draft query family.
After final submit or discard, invalidate or remove the active draft query.

Attachment input is not a durable draft state. Raw `File` objects should not be
stored in React Query.

---

## Ticket Action Query Policy

Actions are workflow records.

Use action queries for:

- action list on a ticket
- action detail where a route exposes it
- soft-delete state for comment/note entries

Operational action execution should invalidate both action and history queries
because successful commands produce history events.

---

## History Query Policy

History is append-oriented server state.

After a successful command, invalidate ticket history for the ticket. Do not
optimistically invent history events in the UI unless the event contract is
fully controlled.

The server is the authority for:

- `type`
- `source`
- `event`
- previous/current values
- actor/timestamp

---

## Work Session Query Policy

The current work-session route supports list and create:

```txt
GET  /api/service-desk/tickets/[ticketId]/work-session
POST /api/service-desk/tickets/[ticketId]/work-session
```

After work-session creation, invalidate:

- work-session list
- ticket detail
- ticket history
- ticket list/search if the submitted next status changes list results

Feature-client helpers for detail/update/delete/timer flows should not be
documented as completed API behavior until matching routes exist.

---

## Settings Query Policy

Settings data must not be duplicated into Zustand as a second source of truth.

React Query owns:

- tenant lists and active tenant projections
- category trees
- approval-step settings
- assignment-rule settings

Local component state may own:

- selected tab
- focused tenant
- temporary form input
- expanded tree nodes
- language selector state

---

## LOCAL and REMOTE Runtime

The same feature UI should work against LOCAL or REMOTE data where both are
implemented.

```txt
feature hook
-> feature API client
-> route handler
-> LOCAL handler or REMOTE service
```

React Query keys should include runtime-relevant scope where the implementation
requires it. Draft keys, for example, are scoped by data scope and user.

---

## Anti-Patterns Avoided

### API Data in Zustand

Do not copy ticket detail, settings, drafts, or histories into Zustand as a
parallel source of truth.

### Raw Files in Cache

Do not store browser `File` objects in React Query.

### Fake History

Do not create UI-only history rows for commands that have not succeeded on the
server.

### Overbroad Invalidations

Do not invalidate every query after every Service Desk mutation.

---

## Related Documents

- [Service Desk Settings](../../03-domain/service-desk/settings.md)
- [Ticket Model](../../03-domain/service-desk/ticket/ticket-model.md)
- [Ticket History](../../03-domain/service-desk/ticket/ticket-history.md)
- [Ticket Work Session](../../03-domain/service-desk/ticket/ticket-work-session.md)
- [Ticket Form Design](../forms/ticket-form.md)
- [Service Desk Implementation Strategy](../service-desk-implementation-strategy.md)

---

## Summary

React Query is the Service Desk server-state owner and also orchestrates the
browser-local LOCAL draft repository. The current strategy uses structured
query families for tickets, drafts, actions, histories, work sessions, and
tenant-scoped settings; targeted invalidation after workflow mutations; and
clear separation from local UI state and recovery storage.
