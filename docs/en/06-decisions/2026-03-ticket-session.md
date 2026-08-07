# Ticket Session & Time Tracking Decisions (2026-03)

## Context

While implementing the Service Desk ticket module, a need emerged to support
time tracking per ticket in a way that matched real operational workflows.

The system needed to handle:

- quick start and finish actions from the ticket view
- manual time entry using either a time range or a duration
- task switching between tickets
- ticket prioritization based on the current user's work context

This document captures the design decisions around `TicketTrackTime`,
timer behavior, and work-context-driven UX.

---

## 1. Track Time as Work Sessions

### Decision

Model `TicketTrackTime` as a single work session entry,
not as an aggregated time value.

### Rationale

- Real work often happens across multiple sessions on the same ticket
- The model must support interruption, reassignment, and resuming work
- This aligns better with enterprise tools such as Jira worklogs

### Model

```ts
export interface TicketTrackTime {
  ticketId: string;
  trackTimeNo: string;

  assigneeId: string;

  startAt: ISODateString;
  endAt: ISODateString | null;

  durationMinutes: number | null;

  note?: string;

  createdAt: ISODateString;
  updatedAt: ISODateString;
}
```

### Rules

- `startAt` is always present
- `endAt === null` means the session is currently running
- `durationMinutes` is determined when the session is finished
- Multiple sessions can exist for the same ticket

---

## 2. Do Not Introduce a Separate Track Log Table

### Decision

Do not add a separate `TicketTrackLog` table.

### Rationale

- It would duplicate information already represented by `TicketTrackTime`
- It would increase consistency risks between tables
- It adds complexity without adding enough value

### Alternative

Use:

- `TicketTrackTime` as the source of truth for session data
- `TicketHistory` as the audit trail for events such as start and finish

---

## 3. Use Timer Actions Instead of a Form for Quick Tracking

### Decision

Implement start and finish as direct API actions, not as form-based input.

### Rationale

- The server should control actual time values
- Single-action behavior is faster in the UI
- It avoids client-side manipulation of timing data

### API

```txt
POST /tickets/:ticketId/track-time/start
POST /tickets/:ticketId/track-time/finish
```

### Behavior

- `start` creates a new session with `startAt = now`
- `finish` closes the active session with `endAt = now`
- `durationMinutes` is calculated when finishing

---

## 4. Introduce a `switch` Action for Task Switching

### Decision

Add a dedicated `switch` API to support seamless movement between tickets.

### API

```txt
POST /tickets/:ticketId/track-time/switch
```

### Behavior

1. Finish the current running session if one exists
2. Start a new session for the target ticket
3. Return the new session

### Rationale

- Supports a natural "finish current and start new" workflow
- Prevents multi-step logic from leaking into the client
- Keeps the operation atomic on the server

---

## 5. Keep Manual Time Entry Separate from Timer Actions

### Decision

Separate manual time entry into two form modes:

1. Time range input: `startAt`, `endAt`
2. Duration input: `durationMinutes`

### Rationale

- Users think about time entry in different ways
- Validation is simpler when the modes are separated
- This avoids overly complex conditional schemas

### Rules

- Only one input mode is used per form
- When range input is used, the server calculates `durationMinutes`

---

## 6. Enforce a Single Active Session

### Decision

For a given `(ticketId, assigneeId)`, only one session with `endAt IS NULL`
may exist at a time.

### Rationale

- Prevents multiple concurrent active sessions
- Makes `finish(ticketId)` deterministic
- Simplifies server-side rules

### Impact

- The active session is always unambiguous
- Timer behavior becomes easier to reason about

---

## 7. Prioritize the Ticket List by Work Context

### Decision

Sort tickets according to the current user's work state.

### Priority Order

1. Assigned to me and currently running
2. Assigned to me and not running
3. In an assignable category or approval stage
4. In the same department
5. Others

### Rationale

- The ticket list should behave like a work-focused inbox
- Actionable items should appear first
- This better supports day-to-day operational flow

---

## 8. Introduce a Derived `MyWorkContext`

### Decision

Represent the current user's work state as a lightweight derived context.

### Example

```ts
type MyWorkContext = {
  currentWorkingTicketId: string | null;
  currentTrackTimeNo: string | null;
  hasRunningTimer: boolean;
};
```

### Rationale

- Supports conditional UI such as Finish vs Switch actions
- Avoids duplicating timer state in a separate global store
- Keeps the UI derived from query or server data

---

## 9. Avoid Count-Based Timer Logic

### Rejected Approach

```sql
SELECT COUNT(*)
FROM ticket_track_time
WHERE ticketId = :ticketId
  AND assigneeId = :assigneeId
  AND endAt IS NULL;
```

### Reason for Rejection

- It creates implicit behavior based on state inference
- It increases race-condition risk
- Error handling becomes more ambiguous

### Preferred Approach

- Use explicit API actions such as `start`, `finish`, and `switch`
- Resolve the active session by selecting the actual row, not by counting

---

## Summary

This design establishes a session-based time tracking model with:

- a clear distinction between quick timer actions and manual input
- server-controlled timing behavior
- atomic task switching
- ticket prioritization driven by active work context

The result is a system that is:

- aligned with real service desk workflows
- intuitive for users
- scalable for future extension
