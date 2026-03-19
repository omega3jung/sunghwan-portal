# History Model

## Goal

The history model is designed to **track all meaningful changes and events**
that occur throughout the lifecycle of a ticket.

It ensures:

- Full traceability of actions
- Accountability of users
- Auditability for compliance
- Transparency in operations

---

## Core Concept

Every significant change in the system generates a **history event**.

```id="core-history"
Action → Event → Stored History Record
```

The system is **event-driven in terms of tracking**, not state-driven.

---

## What is Tracked

The system records all critical changes.

### 1. Status Changes

- Created
- Approved
- Assigned
- Working
- Pending
- Resolved
- Closed

---

### 2. Field Changes

- Priority
- Risk level
- Category
- Assignee
- Description (optional)

---

### 3. Assignment Events

- Assigned
- Reassigned
- Unassigned

---

### 4. SLA Events

- SLA started
- SLA paused
- SLA resumed
- SLA breached

---

### 5. Approval Events

- Approval requested
- Approved
- Rejected

---

### 6. System Events

- Auto-assignment triggered
- Escalation triggered
- Fallback assignment applied

---

## History Record Structure

Each history entry follows a consistent structure.

```ts id="history-structure"
type History = {
  id: string;
  ticketId: string;

  type: HistoryType;
  action: string;

  actorId: string | null; // null for system actions

  fromValue?: unknown;
  toValue?: unknown;

  metadata?: Record<string, unknown>;

  createdAt: Date;
};
```

---

## History Types

### Example Enum

```ts id="history-types"
type HistoryType =
  | "STATUS"
  | "FIELD"
  | "ASSIGNMENT"
  | "SLA"
  | "APPROVAL"
  | "SYSTEM";
```

---

## Actor Model

Each history record identifies **who performed the action**.

### Actor Types

- User (employee)
- Requester
- System (automated process)

---

## Event Granularity

### Fine-Grained Tracking (Recommended)

Each change is recorded as an individual event.

#### Example

```id="granular-example"
Priority: Medium → High
Status: Open → Working
```

→ creates **two separate history records**

---

### Trade-off

| Approach     | Pros               | Cons            |
| ------------ | ------------------ | --------------- |
| Fine-grained | Precise, auditable | More records    |
| Aggregated   | Less storage       | Harder to trace |

---

## Read Model vs Write Model

### Write Model

- Optimized for storing events
- Append-only structure

---

### Read Model

- Optimized for UI display
- May aggregate or format history entries

---

## Immutability

History records are **immutable**.

### Rules

- Cannot be updated
- Cannot be deleted (except for compliance cases)
- Corrections are recorded as new events

---

## Ordering & Consistency

History must be **chronologically ordered**.

### Considerations

- Use server timestamps
- Avoid client-side ordering
- Handle concurrent updates carefully

---

## UI Representation

### Timeline View

- Chronological list of events
- Most recent first (or toggle)

---

### Example

```id="timeline-example"
[10:32] Assigned to John
[10:30] Status changed to Working
[10:20] Ticket Created
```

---

### Key UX Elements

- Clear action description
- Actor visibility
- Timestamp
- Highlight important changes

---

## Metadata Usage

Metadata provides additional context.

### Examples

```ts id="metadata-example"
metadata: {
  reason: "Manual reassignment",
  previousAssignee: "user_1",
}
```

---

## System vs User Actions

System-generated events must be distinguishable.

### Example

- "Auto-assigned by system"
- "Escalated due to SLA breach"

---

## Performance Considerations

### Challenges

- High volume of history records
- Frequent writes

---

### Solutions

- Indexed queries (ticketId, createdAt)
- Pagination for UI
- Archiving old records

---

## Integration with Other Domains

### SLA

- Logs SLA lifecycle events

---

### Assignment

- Tracks ownership changes

---

### Approval

- Records approval decisions

---

## Edge Cases

### 1. Rapid Consecutive Updates

- Multiple events within milliseconds
  → ensure correct ordering

---

### 2. Bulk Updates

- Multiple fields changed at once
  → either split or aggregate

---

### 3. System Failures

- Partial history writes
  → require transactional handling

---

### 4. Sensitive Data Changes

- Avoid storing sensitive values directly
  → mask or omit when necessary

---

## Alternatives Considered

### 1. No History Tracking

- ❌ No traceability
- ❌ No accountability

---

### 2. Change Log Only (Diff-based)

- Stores only before/after snapshots
- ❌ Hard to interpret context

---

### 3. Full Event Sourcing

- Entire system based on events
- ✔ Maximum traceability
- ❌ High complexity for this use case

---

## Why Not Full Event Sourcing?

This system adopts a **hybrid approach**:

- State-based main model
- Event-based history tracking

### Reason

- Simpler implementation
- Sufficient audit capability
- Better performance balance

---

## Design Principles Alignment

This model aligns with:

- Auditability
- Transparency
- System observability
- Scalable data architecture

---

## Summary

The history model provides a **comprehensive, immutable, and structured record**
of all significant events in the system, enabling full traceability,
accountability, and operational insight.
