# Ticket Routing and Update Policy (2026-07)

## Context

As REMOTE ticket creation, approval, assignment, and requester update flows were connected to PostgreSQL, the ticket model needed a clearer way to represent:

- who currently owns the next workflow action
- whether the ticket is in approval or work assignment
- how approval completion moves into work assignment
- which requester updates preserve current routing
- which requester updates invalidate existing approval or assignment

The earlier ticket model used broad workflow statuses such as:

```txt
Open
Approved
Working
```

Those values were understandable conceptually, but they became ambiguous during implementation.

`Open` could mean:

- waiting for approval
- waiting for assignment
- submitted but not yet processed
- generally active and not closed

`Approved` described a completed approval result, but did not describe who currently owned the ticket afterward.

The implementation also exposed a requester update problem.

Not every submitted-ticket edit should restart approval and assignment.

For example:

- changing a notification recipient does not change the request itself
- changing the requested due date does not necessarily invalidate approval
- changing the category, subject, body, files, or images can change the meaning of the request

The system therefore needed:

1. an explicit approval/work routing model
2. statuses aligned with current responsibility
3. a field-impact policy for requester updates
4. server-controlled routing preservation and recalculation
5. history records that explain routing effects

---

## Core Principle

```txt
Ticket routing represents current workflow responsibility.
```

```txt
Requester updates affect routing only when they change the meaning or classification of the request.
```

The routing model is:

```txt
Ticket
-> Category configuration
-> Approval phase, when required
-> Work assignment phase
-> Active work
```

The update policy is:

```txt
Routing-neutral field change
-> preserve current routing

Routing-sensitive field change
-> recalculate approval and assignment from the beginning
```

---

## Problem

### 1. `Open` did not express current responsibility

A ticket in `Open` could be waiting for an approver, a worker, or another workflow operation.

The status did not answer:

```txt
Who is responsible for the next action?
```

That pushed the UI and server toward inference:

```ts
if (ticket.status === "Open" && ticket.approvalStepId) {
  // approval phase
}

if (ticket.status === "Open" && !ticket.approvalStepId) {
  // work phase
}
```

A status should communicate current workflow meaning without unrelated inference.

---

### 2. `Approved` was an event, not a durable state

Approval completion is important, but it does not need to remain as a long-lived ticket state.

After final approval:

- the approval phase is finished
- workers are resolved
- responsibility moves to work assignment

Therefore approval completion is better represented as History:

```txt
APPROVAL_APPROVED
-> ASSIGNMENT_RESOLVED
-> status = Assigned
```

---

### 3. Separate approval and work assignee columns would duplicate ownership

One possible model was:

```txt
approvalAssignees
workAssignees
```

This exposes both groups, but only one group owns the current workflow phase.

Keeping both as persisted current-state columns can create stale or contradictory data.

Previous approval ownership belongs in action and history records.

The ticket row should represent current responsibility.

---

### 4. Resetting routing on every update was too aggressive

This simple rule is safe but noisy:

```txt
Any requester update
-> reset approval
-> resolve routing again
```

It would create unnecessary approval loops for harmless edits such as:

- due date changes
- email recipient changes

That would interrupt operators, create noisy history, and increase notification volume.

---

### 5. Preserving routing on every update was too permissive

The opposite rule is also unsafe:

```txt
Any requester update
-> preserve current routing
```

If a requester changes category, subject, body, files, or images, the workflow may no longer match the request.

An approval decision for an older request version should not silently apply to a materially changed request.

---

## Decision

Use an explicit approval/work routing model based on:

```txt
tk_approval_step_id
tk_assignee_usernames
```

The ticket row stores the users responsible for the current workflow phase only.

Use statuses that describe current responsibility:

```txt
Draft
Approval
Declined
Assigned
Working
Pending
Rejected
Resolved
Closed
```

Remove `Open` and `Approved` from the persisted `TicketStatus` union.

Use `Open` only as a frontend grouping or search concept when needed.

Treat approval completion as History, not as a long-lived status.

Classify requester-editable fields into:

- routing-neutral
- routing-sensitive

Routing-neutral updates preserve current approval or work assignment.

Routing-sensitive updates restart category-driven routing from the beginning.

---

## Scope Rules

### 1. Determine phase from approval step

The current phase is determined by `tk_approval_step_id`.

```txt
tk_approval_step_id is not null
-> APPROVAL phase

tk_approval_step_id is null
-> WORK phase
```

`tk_assignee_usernames` always represents the current responsible users.

```txt
APPROVAL phase
-> current approver usernames

WORK phase
-> current worker usernames
```

The database does not persist separate current approval and work assignee arrays.

---

### 2. Project phase-specific arrays in DTOs

The server mapper exposes clearer application-facing assignment fields.

Conceptually:

```ts
type TicketAssignmentPhase = "APPROVAL" | "WORK";

type TicketRoutingDto = {
  assignmentPhase: TicketAssignmentPhase;
  approvalAssigneeUsernames: string[];
  workAssigneeUsernames: string[];
  assignedApprover: boolean;
  assignedWorker: boolean;
};
```

Derived behavior:

```ts
const assignmentPhase =
  ticket.approvalStepId !== null ? "APPROVAL" : "WORK";

const approvalAssigneeUsernames =
  assignmentPhase === "APPROVAL" ? ticket.assigneeUsernames : [];

const workAssigneeUsernames =
  assignmentPhase === "WORK" ? ticket.assigneeUsernames : [];
```

These arrays are projections, not separately persisted sources of truth.

---

### 3. Use precise statuses

#### Draft

The requester is still preparing the ticket.

Routing has not started.

#### Approval

The ticket is waiting for the current approval step.

```txt
status = Approval
approvalStepId != null
assigneeUsernames = current approvers
```

#### Declined

An approver declined the request.

Routing stops until an allowed requester revision or resubmission occurs.

#### Assigned

Approval is not required or has completed, and workers have been resolved.

```txt
status = Assigned
approvalStepId = null
assigneeUsernames = current workers
```

#### Working

An assigned worker explicitly started work.

Reading a ticket does not move it to `Working`.

#### Pending

Work is temporarily paused or waiting.

#### Rejected

The ticket was rejected as not executable in its current form.

#### Resolved

Work is complete and the ticket is waiting for close/review policy.

#### Closed

The lifecycle is closed and normal mutations are blocked.

---

### 4. Resolve initial routing on submission

When a Draft or new request is submitted, the server resolves the next workflow phase.

```txt
Submit ticket
-> resolve next approval step
-> if step exists:
     status = Approval
     approvalStepId = next step
     assigneeUsernames = approvers
   else:
     status = Assigned
     approvalStepId = null
     assigneeUsernames = workers
```

The REMOTE implementation can keep details such as database functions or repositories behind the server routing boundary:

```txt
get_next_approval_step(...)
get_approval_step_assignee_usernames(...)
get_category_assignment_usernames(...)
```

The UI does not call those functions directly.

---

### 5. Advance approval into work assignment

When an approver approves the current step:

```txt
Approve action
-> create approval action
-> record APPROVAL_APPROVED history
-> resolve next approval step
```

If another approval step exists:

```txt
status = Approval
approvalStepId = next approval step
assigneeUsernames = next approvers
```

If no approval step remains:

```txt
status = Assigned
approvalStepId = null
assigneeUsernames = resolved workers
```

The final approval remains in immutable history.

---

### 6. Stop routing on decline

When the current approver declines:

```txt
status = Declined
approvalStepId = null
assigneeUsernames = []
```

The system records:

- approver
- approval step
- reason
- previous routing context
- decline event
- timestamp

The ticket does not automatically proceed to work assignment.

---

### 7. Keep requester update permission separate from routing effect

This policy defines requester update effects after authorization succeeds.

The routing policy does not grant update permission by itself.

Permission checks remain part of ticket operation rules.

The server must validate:

- authenticated identity
- effective requester identity
- ticket ownership
- current status
- editable field scope
- impersonation restrictions where relevant

Only after authorization succeeds does the routing policy execute.

---

### 8. Treat due date and email as routing-neutral

The following fields preserve current routing when changed alone:

```txt
dueAt
email recipients
```

A due-date-only update does not change:

- request classification
- approval requirement
- responsible department
- assigned workers
- request content

Email metadata represents requester-configured additional recipients.

It does not determine approvers or workers.

Therefore, these changes preserve:

```txt
status
approvalStepId
assigneeUsernames
```

---

### 9. Treat request meaning fields as routing-sensitive

The following fields restart routing when their normalized persisted value changes:

```txt
category
subject
content/body
files
images
```

Category can change:

- approval steps
- approval assignee rules
- work assignment rules
- default priority
- default risk level
- responsible organization

Subject, body, files, and images can materially change what is being requested.

Approval and assignment must therefore be recalculated.

---

### 10. Recalculate only on actual changes

Routing-sensitive recalculation requires a persisted value change.

The mere presence of a field in an update payload is not enough.

Conceptually:

```ts
const routingChanged =
  previous.categoryId !== next.categoryId ||
  previous.subject !== next.subject ||
  previous.content !== next.content ||
  !isEqual(previous.files, next.files) ||
  !isEqual(previous.images, next.images);
```

The comparison must use normalized values:

- prepared attachment metadata
- normalized rich-text body
- normalized nullable values
- deterministic attachment comparison keys

---

### 11. Preserve routing for neutral changes

When only routing-neutral fields change:

```txt
Update ticket fields
-> preserve status
-> preserve approvalStepId
-> preserve assigneeUsernames
-> record history
```

Examples:

```txt
Approval + due date update
-> remains Approval
-> current approvers remain assigned
```

```txt
Assigned + email update
-> remains Assigned
-> current workers remain assigned
```

---

### 12. Restart routing for sensitive changes

When any routing-sensitive field changes:

```txt
Update request content
-> invalidate existing routing result
-> restart category-driven routing
```

The server:

1. validates update permission
2. prepares and validates next values
3. detects routing-sensitive changes
4. resets current approval context
5. resolves approval from the beginning
6. resolves work assignment if approval is unnecessary
7. persists ticket and routing state
8. creates history explaining the reset

Previous approval progress is preserved in history and is not reused.

---

### 13. Apply category defaults on category change

When category changes, category-driven default values are reevaluated.

- default priority
- default risk level
- minimum SLA-based due date

from the new category snapshot when available.

This prevents values inherited from the old category from being mistaken for new-category defaults.

For the requester-facing due date, the policy is:

```txt
nextDueAt = later of:
- existing requested due date
- new category minimum due date
```

This prevents the updated ticket from violating the new category's minimum SLA expectation while avoiding an unnecessary earlier deadline.

A future SLA model may separate:

- requester requested date
- SLA target
- operational due date
- override reason

That would be a separate documented extension.

---

### 14. Keep the server as the routing authority

The UI may display a predicted warning, but it cannot decide:

- whether routing-sensitive values changed
- which approval step applies
- who the approvers are
- who the workers are
- whether approval can be skipped
- which status should be persisted

The flow is:

```txt
UpdateTicketDialog
-> normalized update payload
-> Route Handler
-> ticket update service
-> compare persisted and next values
-> preserve or recalculate routing
-> repository transaction
-> response DTO
```

The client must not send trusted routing results such as:

```ts
{
  status: "Assigned",
  approvalStepId: null,
  assigneeUsernames: ["worker-a"]
}
```

as requester-controlled decisions.

---

### 15. Record routing effects in history

Every requester update creates history appropriate to its effect.

Routing-neutral update:

```txt
event = ROUTING_PRESERVED
```

Routing-sensitive update:

```txt
event = ROUTING_RESET
```

History metadata may include:

- changed fields
- previous approval step
- next approval step
- previous assignees
- next assignees
- whether routing was reset or preserved

Generated assignment or approval effects may create additional history where needed.

---

### 16. Keep notifications separate from ticket email settings

Routing-neutral updates should not create new approval or assignment notifications merely because the ticket was edited.

Routing-sensitive updates may trigger new approval or assignment notifications when notification delivery is implemented.

Ticket email recipients remain requester-configured metadata.

Approver and worker email addresses must be resolved by the server at notification time.

---

### 17. Keep LOCAL and REMOTE behavior aligned

LOCAL and REMOTE must expose the same conceptual routing behavior:

```txt
Routing-neutral update
-> preserve phase and assignees

Routing-sensitive update
-> recalculate from category rules
```

LOCAL may use simplified demo resolvers.

REMOTE uses database-backed category, approval, and assignment resolution.

The DTO shape remains the same for the UI.

---

## What Was Aligned

### 1. Status vocabulary

Persisted statuses now describe current workflow responsibility.

`Open` and `Approved` are not persisted statuses.

---

### 2. Assignment representation

The ticket row uses one current assignee field.

DTO mapping projects approval-specific and work-specific arrays for readability.

---

### 3. Requester update impact

Requester update behavior is field-aware.

Neutral changes preserve routing.

Meaning-changing request edits reset routing.

---

### 4. History explanation

Routing effects are auditable through `ROUTING_PRESERVED` and `ROUTING_RESET` history events.

---

## Consequences

### Positive

- Status and assignee data identify current ownership.
- Approval completion is represented as an event, not a vague state.
- The database model avoids duplicate current assignee columns.
- Harmless updates avoid unnecessary workflow noise.
- Material changes re-enter approval and assignment correctly.
- History explains why routing changed or remained the same.
- The UI can use phase-aware assignment fields.

---

### Negative / Trade-offs

- The update service must compare previous and next normalized values.
- Every new requester-editable field must be classified.
- Routing-sensitive updates can create multiple history records.
- DTO mapping is more explicit.
- Requester update permissions still need to be maintained separately.
- The simplified due-date model does not fully separate requester date and SLA target.

---

## Follow-up Policy

- Do not reintroduce `Open` or `Approved` as persisted statuses.
- Keep `Open` as a UI grouping only when needed.
- Keep `tk_approval_step_id` and `tk_assignee_usernames` as the current routing source of truth.
- Classify every new requester-editable field as routing-neutral or routing-sensitive.
- Keep category, subject, body, files, and images routing-sensitive unless a narrower rule is documented.
- Keep due date and email routing-neutral unless product policy changes.
- Do not let the client choose trusted routing results.
- Document any more advanced SLA due-date model before introducing additional due-date fields.

---

## Summary

The routing model is:

```txt
approvalStepId != null
-> APPROVAL phase
-> assigneeUsernames = approvers

approvalStepId == null
-> WORK phase
-> assigneeUsernames = workers
```

The status model is:

```txt
Draft
Approval
Declined
Assigned
Working
Pending
Rejected
Resolved
Closed
```

Requester update behavior is:

```txt
dueAt or email only
-> preserve routing

category, subject, body, files, or images changed
-> reset routing from category rules
```

This keeps category-driven workflow strict when request meaning changes, while avoiding unnecessary approval and assignment resets for operationally harmless edits.
