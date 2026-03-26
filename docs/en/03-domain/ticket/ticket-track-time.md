# Ticket Track Time

## Goal

The ticket track time model defines how work performed on a ticket is recorded.

It aims to:

- accurately represent real work behavior
- support interruption and task switching
- provide reliable data for analysis and reporting
- enable fast and intuitive user interactions

---

## Problem Statement

Traditional time tracking often stores only aggregated values:

```txt
ticket.workTime = 180 minutes
```

This approach fails to represent real-world behavior because:

- work is often interrupted
- users switch between multiple tickets
- tasks are resumed later
- parallel work is common

As a result:

- time tracking becomes inaccurate
- user behavior is not reflected
- auditability is limited

---

## Core Principle

```txt
Work is a collection of sessions, not a single accumulated value.
```

The track-time model treats real work as explicit session records rather than a
single derived total.

---

## Work Session Model

Each work session is represented as a `TicketTrackTime` entry.

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

### Key Characteristics

#### 1. Session-Based Tracking

- each entry represents a single continuous work session
- multiple sessions per ticket are allowed

Example:

```txt
09:00 - 10:00 -> session 1
15:00 - 17:00 -> session 2
```

#### 2. Running Session

- `endAt === null` means the session is currently running
- this indicates active work
- this is used to determine current work context

#### 3. Aggregated Time

- total work time is the sum of completed sessions
- `durationMinutes` is calculated on completion
- aggregation is derived, not stored as the source of truth

---

## Timer-Based Actions

The system provides quick actions for efficient time tracking.

### Start

```txt
POST /tickets/:ticketId/track-time/start
```

- creates a new session
- `startAt = server time`
- `endAt = null`

### Finish

```txt
POST /tickets/:ticketId/track-time/finish
```

- completes the current running session
- `endAt = server time`
- `durationMinutes` is calculated

### Switch

```txt
POST /tickets/:ticketId/track-time/switch
```

- finishes the current running session if one exists
- starts a new session for another ticket
- must be executed atomically

---

## Why Switch Exists

Without `switch`, users must:

- manually finish current work
- manually start new work

This leads to:

- inconsistent tracking
- missed actions
- poor user experience

`switch` ensures:

```txt
finish + start = single atomic action
```

---

## Manual Input Modes

In addition to timer actions, the system supports manual input.

### Time Range

- `startAt`
- `endAt`

### Duration

- `durationMinutes`

### Design Decision

Timer input and manual input are intentionally separated.

Reason:

- different user intentions
- simpler validation
- avoidance of conflicting inputs

---

## Constraints

### Single Active Session

At most one active session per `(ticketId, assigneeId)` is allowed.

Reason:

- prevents overlapping work sessions
- avoids ambiguity in finish actions
- ensures deterministic behavior

### Server-Controlled Time

All timestamps are generated on the server.

- prevents manipulation
- ensures consistency

---

## Work Context Integration

Track time is used to derive the current work context.

### Derived State

- current working ticket
- running session
- active user workload

### Example

```txt
if endAt is null -> user is working on this ticket
```

---

## UI Behavior

Track time directly influences UI behavior.

### When the User Is Working on This Ticket

- show `Finish`

### When the User Is Working on Another Ticket

- show `Finish current and start`

### When the User Is Not Working

- show `Start`

---

## Relationship with Other Domains

### Ticket

- track time belongs to a ticket

Related document: [Ticket Model](./ticket-model.md)

---

### Assignment

- only assignees can track time

Related document: [Assignment Policy](./strategy/assignment-policy.md)

---

### Ticket History

- start, finish, and switch actions are recorded
- time tracking remains auditable through history

Related document: [Ticket History](./ticket-history.md)

---

## Design Trade-Offs

### Pros

- accurate representation of real work
- supports interruptions and switching
- enables advanced UX

### Cons

- more complex than aggregated tracking
- requires additional constraints
- needs careful server-side handling

---

## Summary

The track time model:

- represents work as sessions
- supports real-world workflows
- enables fast user interactions
- integrates with work context and UI behavior

It is a key component for building a realistic and operationally useful service desk system.
