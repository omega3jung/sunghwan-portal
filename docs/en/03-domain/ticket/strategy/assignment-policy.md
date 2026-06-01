# Assignment Policy

## Goal

The assignment system is designed to **automatically route tickets to the appropriate owners**
based on predefined rules, minimizing manual intervention and improving operational efficiency.

It ensures:

- Fast initial response
- Clear ownership
- Reduced coordination overhead
- Scalable workload distribution

Scope note:

- LOCAL demo uses simplified role-aware permission checks and relation-based access.
- Full organizational/department/job-field resolution is the REMOTE extension path.

---

## Core Concept

Assignment is primarily **category-driven**.

```id="r9h3zc"
Ticket → Category → Assignment Rule → Assignee
```

The category acts as the **source of truth** for determining responsibility.

---

## Assignment Flow

```id="qz6t7a"
Ticket Created
→ Category Selected
→ (Optional) Approval Completed
→ Assignment Resolved
→ Assigned
→ Working
```

---

## Assignment Types

The system supports multiple assignment strategies.

### 1. Auto Assignment (Default)

Tickets are automatically assigned based on category configuration.

#### Example

```ts
assignmentRule = {
  type: "DEPARTMENT",
  departmentId: "IT_SUPPORT",
};
```

---

### 2. Direct Assignment

A specific user is assigned directly.

```ts
assignmentRule = {
  type: "EMPLOYEE",
  employeeUsername: "user_123",
};
```

---

### 3. Role-Based Assignment

Assignment based on job role or specialization.

```ts
assignmentRule = {
  type: "JOB_FIELD",
  jobFieldId: "NETWORK_ENGINEER",
};
```

---

## Assignment Resolution

The system resolves assignees dynamically based on rule type.

### Resolution Logic

```ts
switch (assignmentRule.type) {
  case "EMPLOYEE":
    return employeeUsername;

  case "DEPARTMENT":
    return findAvailableUserInDepartment(departmentId);

  case "JOB_FIELD":
    return findQualifiedUser(jobFieldId);
}
```

---

## Assignment Timing

Assignment occurs after approval (if required).

### Rules

- If approval exists:
  → assign after `Approved`
- If no approval:
  → assign immediately after creation

---

## Reassignment Policy

Tickets can be reassigned under certain conditions.

### Allowed Cases

- Workload balancing
- Incorrect initial assignment
- Escalation scenarios

### Restrictions

- Reassignment must be tracked in History
- Ownership must remain clear

---

## Assignment During Working State

Reassignment is allowed even after the ticket enters `Working`.

### Requirements

- Must be explicitly triggered
- Must be logged
- UI must reflect change immediately

---

## Fallback Strategy

When assignment cannot be resolved:

### Options

1. Assign to default fallback user
2. Assign to team queue
3. Trigger system alert

### Example

```ts
if (!assignee) {
  assignTo("DEFAULT_SUPPORT_QUEUE");
}
```

---

## Load Distribution Strategy

To prevent uneven workload, assignment may include distribution logic.

### Strategies

- Round-robin
- Least-loaded user
- Skill-based selection

### Example

```ts
findAvailableUserInDepartment(departmentId, {
  strategy: "least_loaded",
});
```

---

## Manual Override

Users with sufficient permissions can override assignment.

### Use Cases

- Urgent handling
- Special cases
- VIP requests

---

## UI Considerations

### Assignment Visibility

- Assignee must be clearly displayed
- Assignment history must be accessible

---

### Assignment Actions

- Assign
- Reassign
- Unassign (optional)

---

### Feedback

- Users should see assignment updates in real time

---

## Edge Cases

### 1. No Available Assignee

- All users unavailable or filtered out
  → fallback strategy required

---

### 2. Multiple Eligible Assignees

- System must apply distribution strategy

---

### 3. Invalid Category Configuration

- Missing assignment rule
  → system fallback or validation error

---

### 4. Reassignment Conflicts

- Multiple reassignment attempts
  → last-write wins or controlled via locking

---

## Trade-offs

### Pros

- Reduces manual workload
- Ensures consistent routing
- Scales with organization size
- Enables automation

---

### Cons

- Requires accurate configuration
- Complex resolution logic
- Potential misassignment if rules are incorrect

---

## Alternatives Considered

### 1. Manual Assignment Only

- Simple to implement
- ❌ High operational overhead
- ❌ Slower response time

---

### 2. First-Responder Assignment

- Whoever picks the ticket becomes assignee
- ❌ Unpredictable workload distribution

---

### 3. Fixed Assignment per Category

- Always assign to same user
- ❌ Not scalable
- ❌ Causes bottlenecks

---

## Design Principles Alignment

This policy aligns with system principles:

- Category-driven workflow
- Configurable behavior
- Operational efficiency
- Clear ownership

---

## Summary

The assignment system provides a **flexible and automated routing mechanism**
that ensures tickets are handled by the right people at the right time,
while maintaining scalability, consistency, and operational clarity.
