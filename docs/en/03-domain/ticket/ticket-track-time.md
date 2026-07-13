# Ticket Track Time

## Goal

Ticket Track Time defines the current Work Session model.

Work tracking is separate from Ticket Action. It records work-time evidence and
can optionally move a ticket through work statuses.

---

## Current Route Surface

```txt id="work-session-routes"
GET  /api/service-desk/tickets/:ticketId/work-session
POST /api/service-desk/tickets/:ticketId/work-session
```

The current route surface does not include:

- work-session detail route
- update route
- delete route
- timer start route
- timer finish route
- timer switch route

Some feature-client helpers still reference those future/detail routes, but the
current API route files expose list/create only.

---

## Work Session DTO

```ts id="work-session-dto"
type WorkSessionDto = {
  ticket_id: string;
  work_session_no: number;
  assignee_username: string;
  start_at: ISODateString | null;
  end_at: ISODateString | null;
  duration_minutes: number | null;
  note: string | null;
  created_at: ISODateString;
  updated_at: ISODateString | null;
};
```

Domain/UI mapping exposes the same concept in camelCase.

---

## Submit Payload

```ts id="work-session-submit-payload"
type TicketWorkSessionSubmitPayload = {
  ticketId: string;
  inputMode: "duration" | "range";
  durationMinutes?: number;
  startAt?: string;
  endAt?: string;
  trackedMinutes: number;
  nextStatus?: "Working" | "Pending" | "Resolved";
  note?: string;
};
```

`trackedMinutes` must be positive. Range and duration modes are normalized
server-side.

---

## Actor Rule

Only a current work assignee can create a work session.

Approval-phase tickets are not eligible because their current assignees are
approvers, not workers.

---

## Start Work Command Boundary

Start Work is a separate ticket command, not a Work Session row. The explicit
start-work command moves `Assigned -> Working` and records `STATUS_UPDATED`
history. Work-session submission records work-time evidence and may also apply
the supported work-status transitions.

---

## Status Effects

Work-session creation can update ticket status.

Allowed transitions:

```txt id="work-session-status-transitions"
Assigned -> Working
Working -> Pending
Working -> Resolved
Pending -> Working
Pending -> Resolved
```

Rules:

- `Assigned` requires a transition to `Working`
- `Pending` requires a transition to `Working` or `Resolved`
- `Working` may stay `Working` when recording additional time
- GET never mutates status
- timer stop does not implicitly resolve a ticket

---

## Work Minutes Aggregate

Creating a work session adds `trackedMinutes` to the ticket aggregate
`workMinutes`.

The aggregate is useful for ticket list/detail display. Individual work-session
rows remain the evidence.

---

## History

When work-session creation changes ticket status, it creates `STATUS_UPDATED`
history.

The history union contains work-session-specific events, but those are not the
current route behavior for list/create work sessions.

System or ticket commands may finish running sessions when rejecting, merging,
canceling, resolving, or auto-closing tickets.

---

## Due Date Separation

Ticket due date is a planning/SLA field. It is not a Work Session field.

Work sessions record actual work evidence:

- who worked
- when or for how long
- note
- resulting work status transition when provided

---

## Active Session Invariant

The current REMOTE create/list implementation records submitted work sessions.
It includes repository support for finishing running sessions by ticket, but it
does not expose a full timer route surface or enforce a documented global
"one active timer per user" route contract.

Do not describe timer-style invariants as current implemented behavior.

---

## Auto Close Relationship

Resolved auto-close is not a work-session timer operation.

It is a system command:

- finds resolved tickets whose resolved-history timestamp is older than the
  current 7-day grace window
- moves them to `Closed`
- sets close reason `Completed`
- finishes running work sessions where supported
- creates `RESOLUTION_CLOSE` history with source `SYSTEM_AUTO` and
  `actionNo = null`

---

## Related Documents

- [Ticket Lifecycle](./ticket-lifecycle.md)
- [Ticket Operation Rules](../../08-dev-strategy/ticket-operation-rules.md)
- [Ticket History](./ticket-history.md)
- [Action Strategy](./strategy/action-strategy.md)

---

## Summary

Work Session is the current work-time evidence model. It supports list/create,
duration/range input, tracked-minute aggregation, and explicit work-status
transitions. It is separate from Ticket Action and must not be described as a
hidden GET-side-effect or timer-stop resolution mechanism.
