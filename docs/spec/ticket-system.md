# Ticket System Project Guidelines

This document defines the architectural and data model rules for the Ticket System.
These rules represent design decisions finalized during the February design discussions
and should be treated as authoritative guidance for development.

---

## 0. Service Desk Workflow Rules

### 1. Ticket Lifecycle

```txt
create
-> approval (optional)
-> assigned
-> working (when assignee reads ticket)
-> resolved
-> closed
```

### 2. Assignment

- Tickets are auto-assigned based on category.

### 3. Approval

- Some categories require approval steps:
- Upper manager check (duplicate prevention)
- IT / HR manager validation

### 4. Edit Permission

- Ticket can be edited until the assignee reads it.
- After status becomes `working`, ticket info is locked.

### 5. UI Behavior

- If ticket is locked, `InfoStep` is hidden.
- Only `ReviewStep` is shown.

---

## 1. Category Structure

Tickets are categorized using a hierarchical category tree.

### Structure

```txt
Client -> MainCategory -> SubCategory
```

### Rules

1. Client represents a client.
2. Each `MainCategory` must define default operational values:

- `defaultPriority`
- `defaultRiskLevel`
- `defaultSlaDays`

3. `SubCategory` values may override `MainCategory` defaults.

### Override Precedence

```txt
SubCategory > MainCategory
```

If a `SubCategory` does not define a value, the value from the `MainCategory` is used.

---

## 2. Category ID Rules

All category IDs are stored as string representations of numbers.

### Example

```txt
"2", "203"
```

These values may be parsed using `parseInt` when numeric operations are required.

---

## 3. Category Active Policy

Categories are never deleted.

If a category becomes unavailable for new tickets:

```txt
active = false
```

### Behavior

- Cannot be selected for new ticket creation
- Existing tickets referencing the category remain valid for history and reporting

---

## 4. Ticket Assignment Policy

Ticket assignment is primarily category-based auto assignment.

Category configuration determines:

- Default priority
- Default risk level
- SLA
- Approval requirements
- Responsible teams

Some categories include approval workflows for additional validation.

Approval workflows exist for two main purposes:

1. Issue validity check
2. Duplicate / policy validation

### Examples

- IT manager verification
- HR manager verification
- Upper manager approval

---

## 5. Approval System Design

Approval settings are configured per category.

### Structure

```txt
Category -> approvalSteps[]
```

Each step executes sequentially using the step index.

`approvalSteps` are processed in ascending order based on:

```txt
index
```

---

## 6. Approval Assignee Types

Approval steps support the following assignee types:

```txt
MANAGER
DEPARTMENT
JOB_FIELD
EMPLOYEE
```

### MANAGER

Manager of the requester.

#### Payload

```txt
level: 1 | 2
```

#### Meaning

- `1` = Direct manager
- `2` = Upper manager

### DEPARTMENT

Approval assigned to a specific department.

#### Payload

```txt
departmentId
```

### JOB_FIELD

Approval assigned by job specialization.

#### Payload

```txt
jobFieldId
```

### EMPLOYEE

Approval assigned to specific employees.

#### Payload

```txt
employeeIds[]
```

---

## 7. Approval Skip Policy

Approval steps can be skipped depending on requester access level.

### Rule

If:

```txt
requester.accessLevel >= skipAccessLevel
```

Then the approval step is automatically skipped.

### Purpose

- Prevent unnecessary approvals for high-level users
- Reduce workflow friction for managers or administrators

---

## 8. Ticket Status Workflow

Tickets follow the lifecycle below.

```txt
Pre -> Open -> Approved / Declined -> Working -> Pending -> Resolved -> Closed
```

### Status Definitions

#### Pre

Ticket created but approval not started.

#### Open

Approval process is ongoing.

#### Approved

All approval steps completed successfully.

#### Declined

Approval process rejected the request.

#### Working

Assigned staff is actively working on the ticket.

#### Pending

Waiting for requester response or information.

#### Resolved

Work is completed and awaiting requester confirmation.

#### Closed

Ticket lifecycle is finished.

---

## 9. Ticket Ownership Rules

Tickets expose the following flags:

```txt
owner
assigned
```

### owner

The currently logged-in user is the requester.

### assigned

The currently logged-in user is an assignee of the ticket.

---

## 10. Ticket Deletion Policy

Tickets are never permanently deleted.

Instead:

```txt
active = false
```

is used for soft deletion.

### Purpose

- Preserve audit history
- Maintain reporting integrity
- Maintain workflow traceability

---

## 11. Attachments

### Attachment Types

```txt
file
image
```

### Attachment Structure

```txt
index
type
name
url
active
```

Inactive attachments remain stored but hidden from the UI.

---

## 12. Time Tracking

Ticket working time is recorded per assignee.

### Structure

```txt
TrackTime
```

### Fields

```txt
ticketId
assignee
time
```

This enables workload measurement and SLA tracking.

---

## 13. Ticket History

All workflow changes are recorded in the `History` model.

History entries may include:

```txt
approvalStep
type
user
date
note
active
```

### Purpose

- Approval traceability
- Status change tracking
- Audit history

---

## 14. Priority and Risk Level

### Priority Levels

```txt
urgent
high
medium
low
```

### Numeric Weights

```txt
urgent = 4
high = 3
medium = 2
low = 1
```

### Risk Levels

```txt
critical
high
medium
low
```

These values are used for sorting and operational prioritization.

---

## 15. SLA Calculation

Due date calculation is category-based.

### Rule

```txt
dueDate = createdDate + defaultSlaDays
```

If the `SubCategory` defines its own SLA value, it overrides the `MainCategory` value.

---

## 16. Important Type Correction

A correction was identified in the `TicketProcessState` type.

### Incorrect

```ts
priority: TicketPeriod;
```

### Correct

```ts
priority: Priority;
```

`TicketPeriod` represents time filters, not operational priority.

All implementations should use:

```ts
priority: Priority;
```

---

## 17. Design Principles

The ticket system follows these core principles:

1. Category-driven workflow
2. Configurable approval pipelines
3. No destructive deletes
4. Complete audit trail
5. SLA-based operational tracking

These principles must remain consistent across frontend and backend implementations.
