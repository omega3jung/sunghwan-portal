# SLA Strategy

## Goal

The SLA (Service Level Agreement) system defines **time-based expectations** for ticket handling
and ensures that service quality is measurable, enforceable, and continuously monitored.

It aims to:

- Guarantee response and resolution times
- Prioritize critical issues effectively
- Provide measurable performance metrics
- Enable proactive escalation

---

## Core Concept

SLA is determined by a combination of **risk level** and **priority**.

```id="1a2b3c"
SLA = f(Risk Level, Priority)
```

This creates a flexible and scalable model that adapts to different business contexts.

---

## SLA Dimensions

Each SLA consists of multiple time constraints.

### 1. Response Time

Time from ticket creation to first meaningful response.

---

### 2. Resolution Time

Time from ticket creation to completion.

---

### 3. Escalation Time (Optional)

Time threshold before escalation is triggered.

---

## SLA Matrix

SLA values are configured using a matrix.

### Example (4 x 4)

| Risk \ Priority | Low | Medium | High | Urgent |
| --------------- | --- | ------ | ---- | ------ |
| Low             | 48h | 24h    | 12h  | 6h     |
| Medium          | 24h | 12h    | 6h   | 3h     |
| High            | 12h | 6h     | 3h   | 1h     |
| Critical        | 6h  | 3h     | 1h   | 30m    |

---

## SLA Assignment

SLA is assigned at ticket creation.

### Flow

```id="flow-sla"
Ticket Created
→ Determine Risk Level
→ Determine Priority
→ Lookup SLA Matrix
→ Assign SLA
```

---

## SLA Lifecycle

SLA progresses through the ticket lifecycle.

### States

- **Active** → counting time
- **Paused** → temporarily stopped
- **Breached** → exceeded SLA
- **Completed** → resolved within SLA

---

## SLA Clock Behavior

### Start

- Starts at ticket creation

---

### Pause Conditions

SLA pauses when:

- Waiting for requester response
- Ticket is in `Pending`
- External dependency exists

---

### Resume

- Resumes when ticket returns to active work state

---

## Escalation Strategy

Escalation ensures SLA violations are handled proactively.

### Types

#### 1. Time-based Escalation

Triggered when SLA threshold is near or exceeded.

---

#### 2. Hierarchical Escalation

Escalates to:

- Team lead
- Manager
- Higher-level support

---

### Example

```ts id="esc1"
if (remainingTime < threshold) {
  notify(manager);
}
```

---

## SLA Breach Handling

When SLA is exceeded:

### Actions

- Mark as `Breached`
- Trigger alert/notification
- Record breach event
- Include in reporting metrics

---

## SLA Visibility

SLA must be transparent to users.

### UI Elements

- Remaining time
- Due date
- Breach indicator (e.g., red status)
- Escalation warnings

---

## SLA Calculation Strategy

### Static Calculation

- SLA determined once at creation
- Simple and predictable

---

### Dynamic Calculation (Optional)

- SLA recalculated if:
  - Priority changes
  - Risk level changes

---

### Trade-off

| Approach | Pros           | Cons                          |
| -------- | -------------- | ----------------------------- |
| Static   | Simple, stable | Less flexible                 |
| Dynamic  | Adaptive       | More complex, harder to track |

---

## Time Tracking Model

SLA is based on **effective working time**, not raw elapsed time.

### Considerations

- Business hours
- Holidays
- Time zones

---

### Example

```ts id="time1"
calculateWorkingTime(start, end, {
  businessHours: "09:00-18:00",
  holidays: [...]
});
```

---

## Metrics & Reporting

SLA provides measurable KPIs.

### Key Metrics

- SLA compliance rate
- Average response time
- Average resolution time
- Breach count
- Escalation count

---

## Integration with Assignment

SLA influences assignment behavior.

### Examples

- Urgent tickets assigned to senior staff
- Near-breach tickets prioritized in queue

---

## Edge Cases

### 1. Priority Change

- SLA may need recalculation

---

### 2. Long Pending State

- SLA paused indefinitely
  → risk of abuse → requires monitoring

---

### 3. Reopened Tickets

Options:

- Reset SLA
- Continue previous SLA

---

### 4. Missing SLA Configuration

- Fallback SLA required

---

## Fallback Strategy

When SLA cannot be determined:

- Apply default SLA
- Block ticket creation (optional)
- Log configuration error

---

## Trade-offs

### Pros

- Enforces service quality
- Enables performance measurement
- Supports escalation automation

---

### Cons

- Requires accurate configuration
- Complex time calculations
- Edge cases increase system complexity

---

## Alternatives Considered

### 1. Fixed SLA

- Same SLA for all tickets
- ❌ No prioritization

---

### 2. Priority-only SLA

- SLA based only on priority
- ❌ Ignores business impact

---

### 3. No SLA

- ❌ No measurable performance
- ❌ No accountability

---

## Design Principles Alignment

This strategy aligns with:

- Measurable service quality
- Configurable system design
- Operational transparency
- Scalable architecture

---

## Summary

The SLA system provides a **structured and measurable framework**
for managing service expectations, enabling proactive escalation,
and ensuring consistent service quality across the system.
