# Approval System

## Goal

This document defines the current approval routing model for Service Desk
tickets.

Approval is category-driven, sequential, and represented through the current
ticket routing fields:

```txt id="approval-routing-fields"
tk_approval_step_id
tk_assignee_usernames
```

---

## Current Approval Status

Approval uses the persisted ticket status `Approval`.

There is no persisted `Approved` status. Approval completion is recorded as the
history event `APPROVAL_APPROVED`. After final approval, the ticket resolves
work assignment and moves to `Assigned`.

---

## Approval Phase

A ticket is in approval phase when:

```txt id="approval-phase"
approvalStepId != null
assignmentPhase = APPROVAL
assigneeUsernames = current approvers
```

Application DTOs project this into:

- `assignmentPhase = "APPROVAL"`
- `approvalAssigneeUsernames`
- `assignedApprover`

These are projections. They are not separate persisted routing sources.

---

## Approval Step Settings

Approval steps are configured under a main category.

Approval resolution always uses the selected subcategory's parent/main
category. The selected subcategory remains ticket classification, but it does
not define a separate approval pipeline.

```ts id="approval-step-shape"
type ApprovalStep = {
  id: string;
  name: LocalizedText;
  description?: LocalizedText;
  index: number;
  categoryId: string;
  stepAssignee: ApprovalAssigneeType;
  skipAccessLevel?: AccessLevel;
};
```

Assignee types:

```txt id="approval-assignee-types"
MANAGER
DEPARTMENT
JOB_FIELD
EMPLOYEE
```

REMOTE DTOs use `approval_step_assignee` and `skip_access_level`. LOCAL and
REMOTE settings must resolve to the same application-facing behavior.

Related document: [Service Desk Settings](../../service-desk-settings.md)

---

## Initial Approval Routing

Ticket submit and resubmit both start routing from the first applicable
approval step.

```txt id="initial-approval-routing"
selected category
-> parent/main category approval steps
next approval step exists
-> status = Approval
-> approvalStepId = next step
-> assigneeUsernames = approvers

no approval step
-> status = Assigned
-> approvalStepId = null
-> assigneeUsernames = workers
```

When approval assignees cannot be resolved, the command fails rather than
creating an unowned approval ticket.

---

## Approve

Approve is a ticket action command.

- action type: `APPROVE`
- allowed status: `Approval`
- actor: current approver, or Admin
- payload: content only
- rejects files and inline images
- action row is inserted
- history records `APPROVAL_APPROVED`

After approve:

```txt id="approve-routing"
next approval step exists
-> status = Approval
-> approvalStepId = next step
-> assigneeUsernames = next approvers
-> history = APPROVAL_REQUESTED

no next approval step
-> status = Assigned
-> approvalStepId = null
-> assigneeUsernames = workers
-> history = ASSIGNMENT_RESOLVED
```

---

## Decline

Decline is a ticket action command.

- action type: `DECLINE`
- allowed status: `Approval`
- actor: current approver, or Admin
- payload: content only
- rejects files and inline images
- action row is inserted
- history records `APPROVAL_DECLINED`

Decline terminates approval routing:

```txt id="decline-routing"
status = Declined
approvalStepId = null
assigneeUsernames = []
```

The requester may later resubmit through initial routing.

---

## Skip Rule

`skipAccessLevel` allows an approval step to be skipped when the requester's
access level satisfies the configured threshold.

Skip behavior belongs to approval routing/resolution. If all approval is
skipped, assignment rules resolve work owners and the ticket moves to
`Assigned`.

---

## History

Approval-related events:

```txt id="approval-history-events"
APPROVAL_REQUESTED
APPROVAL_APPROVED
APPROVAL_DECLINED
ASSIGNMENT_RESOLVED
```

An approve action can create more than one history record:

```txt id="approval-history-flow"
APPROVAL_APPROVED
-> APPROVAL_REQUESTED
or
APPROVAL_APPROVED
-> ASSIGNMENT_RESOLVED
```

---

## Relationship With Requester Update

Requester update can reset approval routing when routing-sensitive fields
actually change:

- category
- subject
- content
- files
- images

Routing reset starts approval resolution from the beginning and records
`ROUTING_RESET`. Routing-neutral changes record `ROUTING_PRESERVED`.

---

## Deferred Scope

The current approval model does not implement:

- parallel approval voting
- quorum approval
- delegation calendars
- approval SLA timers
- approval notification delivery guarantees

These are future production extensions.

---

## Related Documents

- [Ticket Lifecycle](../ticket-lifecycle.md)
- [Ticket Operation Rules](../../../08-dev-strategy/ticket-operation-rules.md)
- [Assignment Policy](./assignment-policy.md)
- [Ticket History](../ticket-history.md)
- [Service Desk Settings](../../service-desk-settings.md)

---

## Summary

Approval is a sequential category-driven routing phase. Current approvers are
stored in the same current assignee field used by work routing, with
`approvalStepId` distinguishing approval phase from work phase. Final approval
does not create an `Approved` status; it resolves workers and moves the ticket
to `Assigned`.
