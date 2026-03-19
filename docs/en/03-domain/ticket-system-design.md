# Ticket System Design

## Goal

The ticket system is designed to provide a **structured, traceable, and scalable workflow**
for handling user requests across an organization.

It focuses on:

- Consistent request handling
- Clear ownership and responsibility
- Full auditability
- SLA-based operational tracking

---

## Core Principles

The system is built on the following principles:

1. **Category-driven workflow**
2. **Configurable approval pipeline**
3. **No destructive deletes**
4. **Complete audit trail**
5. **SLA-based prioritization**

These principles must remain consistent across both frontend and backend.

---

## System Overview

The ticket system consists of the following key components:

- Ticket
- Category (Main / Sub)
- Approval System
- Assignment System
- SLA Tracking
- History (Audit Trail)
- Time Tracking

---

## Ticket Lifecycle

Tickets follow a structured lifecycle:

```id="x8g1px"
Pre → Open → Approved / Declined → Working → Pending → Resolved → Closed
```

---

## Status Definitions

### Pre

- Ticket is created
- Approval process has not started

---

### Open

- Approval process is in progress

---

### Approved

- All approval steps completed successfully
- Ticket is ready for assignment

---

### Declined

- Approval failed at any step
- Ticket is rejected

---

### Working

- Assignee has started processing the ticket
- Ticket becomes **locked**

---

### Pending

- Waiting for requester input or additional data

---

### Resolved

- Work is completed
- Awaiting requester confirmation

---

### Closed

- Ticket lifecycle is complete

---

## Ticket Locking Policy

Once a ticket enters the **Working** state:

- Core information becomes immutable
- Edit operations are restricted

### UI Behavior

- InfoStep is hidden
- Only ReviewStep is available

### Purpose

- Prevent inconsistent changes during execution
- Maintain operational integrity

---

## Category Integration

All tickets must be associated with a category.

### Responsibilities of Category

- Defines default priority and risk level
- Determines SLA
- Defines approval requirements
- Drives assignment logic

👉 See: `category-strategy.md`

---

## Approval Integration

Some tickets require approval before execution.

### Behavior

- Approval is triggered after ticket creation
- Controlled by category configuration
- Sequential approval steps

👉 See: `approval-system.md`

---

## Assignment Policy

Tickets are primarily assigned based on category configuration.

### Flow

```id="g8a0p7"
Ticket Approved → Assignment Resolved → Assigned → Working
```

### Characteristics

- Automatic assignment by default
- Manual reassignment allowed

---

## Ownership Model

Each ticket exposes ownership flags:

```ts id="xv7zq4"
type Ownership = {
  owner: boolean;
  assigned: boolean;
};
```

### Definitions

- `owner`: current user is the requester
- `assigned`: current user is an assignee

### Purpose

- Simplify permission handling
- Improve UI conditional rendering

---

## SLA Tracking

SLA is calculated using category configuration.

### Rule

```id="5y5y0v"
dueDate = createdDate + defaultSlaDays
```

### Behavior

- SLA affects prioritization and urgency
- Used for monitoring and reporting

---

## Time Tracking

Work time is tracked per assignee.

### Structure

```ts id="1n9w3n"
type TrackTime = {
  ticketId: string;
  assigneeId: string;
  time: number;
};
```

### Purpose

- Measure workload
- Support SLA analysis
- Enable performance insights

---

## History (Audit Trail)

All changes are recorded in the History model.

### Tracked Events

- Approval actions
- Status changes
- Assignment changes
- Notes and comments

### Structure

```ts id="9x3kpf"
type History = {
  ticketId: string;
  type: string;
  userId: string;
  date: Date;
  note?: string;
  active: boolean;
};
```

### Purpose

- Full traceability
- Debugging and auditing
- Compliance requirements

---

## Deletion Policy

Tickets are never permanently deleted.

Instead:

```id="8b7txj"
active = false
```

### Purpose

- Preserve audit history
- Maintain reporting integrity
- Ensure traceability

---

## Attachments

Tickets support file and image attachments.

### Structure

```ts id="ttkq3n"
type Attachment = {
  index: number;
  type: "file" | "image";
  name: string;
  url: string;
  active: boolean;
};
```

### Behavior

- Inactive attachments are hidden, not removed

---

## Edge Cases

### 1. Ticket Without Approval

- Some categories skip approval
- Ticket moves directly to assignment

---

### 2. Reassignment

- Tickets can be reassigned during Working state
- Must be tracked in history

---

### 3. Pending State

- Ticket may move back and forth between Working and Pending
- Requires clear UI indication

---

### 4. SLA Breach

- If dueDate is exceeded:
  → ticket should be flagged (UI/monitoring)

---

## Trade-offs

### Pros

- Highly structured workflow
- Strong auditability
- Scalable across organizations
- Clear separation of concerns

---

### Cons

- Increased system complexity
- Requires strict data governance
- More upfront design effort

---

## Alternatives Considered

### 1. Simple CRUD Ticket System

- Easy to implement
- ❌ Lacks workflow control and traceability

---

### 2. Fully Flexible Workflow Per Ticket

- Highly customizable
- ❌ Inconsistent and hard to maintain

---

### 3. No Audit Trail

- Simpler storage model
- ❌ Not suitable for enterprise environments

---

## Design Philosophy

This system prioritizes:

- Predictability over flexibility
- Configuration over hardcoding
- Traceability over simplicity

---

## Summary

The ticket system provides a **robust, enterprise-ready workflow engine**
that ensures consistency, accountability, and scalability
through category-driven configuration and strict lifecycle management.
