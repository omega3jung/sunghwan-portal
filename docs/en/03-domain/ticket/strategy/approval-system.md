# Approval System

## Goal

The approval system is designed to provide a **configurable and scalable validation pipeline**
for tickets that require additional verification before execution.

It ensures:

- Policy compliance
- Duplicate prevention
- Organizational validation
- Reduced operational risk

Scope note:

- LOCAL demo keeps approval behavior intentionally simplified for portfolio realism.
- Full organization-aware approval pipeline is treated as a REMOTE expansion path.

---

## Core Concept

Approval is **category-driven** and executed as a **sequential pipeline**.

Each tenant-scoped category can define its own approval workflow:

```txt
Tenant-scoped Category → approvalSteps[]
```

Each step is processed in order based on its `index`.

Approval steps belong to category configuration and are interpreted within the
tenant boundary that owns that category tree.

---

## Approval Flow

```
Pre → Open → Approved / Declined → Working
```

### Status Definitions

- **Pre**: Ticket created, approval not started
- **Open**: Approval process is in progress
- **Approved**: All approval steps completed successfully
- **Declined**: Approval rejected at any step

---

## Data Structure

### ApprovalSteps

```ts
type ApprovalStep = {
  index: number;
  assigneeType: "MANAGER" | "DEPARTMENT" | "JOB_FIELD" | "EMPLOYEE";
  payload: Record<string, unknown>;
  skipAccessLevel?: number;
};
```

---

## Assignee Types

Each approval step dynamically determines its approver.

### 1. MANAGER

Approval assigned to the requester's manager.

```ts
payload: {
  level: 1 | 2;
}
```

- `1`: Direct manager
- `2`: Upper manager

---

### 2. DEPARTMENT

Approval assigned to a specific department.

```ts
payload: {
  departmentId: string;
}
```

---

### 3. JOB_FIELD

Approval based on job specialization.

```ts
payload: {
  jobFieldId: string;
}
```

---

### 4. EMPLOYEE

Approval assigned to specific individuals.

```ts
payload: {
  employeeIds: string[];
}
```

---

## Execution Rules

### 1. Sequential Processing

- Steps are executed in ascending order of `index`
- Next step starts only after the current step is approved

---

### 2. Early Termination

- If any step is **declined**, the entire approval process stops
- Ticket status becomes `Declined`

---

### 3. Completion

- When all steps are approved:
  → Ticket status becomes `Approved`
  → Ticket moves to assignment phase

---

## Skip Policy

Approval steps can be automatically skipped based on requester authority.

### Rule

```
if requester.accessLevel >= skipAccessLevel
→ skip this step
```

### Purpose

- Reduce unnecessary approvals for high-level users
- Improve workflow efficiency
- Prevent bottlenecks in urgent cases

---

## Example Scenario

### Case: IT Request with Manager Approval

```ts
approvalSteps = [
  {
    index: 1,
    assigneeType: "MANAGER",
    payload: { level: 1 },
  },
  {
    index: 2,
    assigneeType: "DEPARTMENT",
    payload: { departmentId: "IT" },
  },
];
```

### Flow

1. Direct manager approves
2. IT department validates
3. Ticket becomes `Approved`

---

## UI Considerations

- Approval steps should be visible as a **progress timeline**
- Each step must display:
  - assignee
  - status (pending / approved / declined)
  - timestamp

- Skipped steps should be explicitly marked as **"skipped"**

---

## Audit & History

All approval activities must be recorded in the History model.

### Recorded Data

- approvalStep index
- assignee
- action (approved / declined / skipped)
- timestamp
- note (optional)

### Purpose

- Full traceability
- Compliance and auditing
- Debugging workflow issues

---

## Edge Cases

### 1. Missing Assignee

- If assignee cannot be resolved:
  → fallback or system alert required

---

### 2. Parallel Approval (Not Supported)

- Current design only supports sequential approval
- Parallel approval intentionally excluded for simplicity

---

### 3. Dynamic Organization Changes

- If org structure changes during approval:
  → approval should resolve based on current state

---

## Trade-offs

### Pros

- Highly flexible and configurable
- Supports complex organizational structures
- Clear audit trail

### Cons

- Increased complexity in configuration
- Sequential flow may introduce latency
- Requires accurate org data

---

## Alternatives Considered

### 1. No Approval System

- Simpler implementation
- ❌ Not suitable for enterprise workflows

---

### 2. Hardcoded Approval Logic

- Easier to implement
- ❌ Not scalable or maintainable

---

### 3. Parallel Approval

- Faster processing
- ❌ Increased complexity and ambiguity in results

---

## Design Principles Alignment

This system follows core project principles:

- Category-driven workflow
- Configurable pipelines
- Full audit trail
- Non-destructive operations

---

## Summary

The approval system provides a **flexible, auditable, and scalable validation mechanism**
that adapts to organizational requirements while maintaining consistency and control.
