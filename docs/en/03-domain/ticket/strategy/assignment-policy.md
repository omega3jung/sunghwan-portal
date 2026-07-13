# Assignment Policy

## Goal

This document defines how current work ownership is resolved and changed.

Assignment is not a generic owner field. It is phase-aware routing state whose
meaning depends on `approvalStepId`.

---

## Source of Truth

```txt id="assignment-source"
tk_approval_step_id
tk_assignee_usernames
```

When `approvalStepId == null`, the ticket is in work phase and
`assigneeUsernames` means current workers.

DTO projections:

- `assignmentPhase = "WORK"`
- `workAssigneeUsernames`
- `assignedWorker`

---

## Assignment Rule Settings

Assignment rules are configured under category settings.

Work assignment resolution checks the selected subcategory first. When no
subcategory assignment rule exists, it falls back to the parent/main category
rule.

```ts id="assignment-rule-shape"
type AssigneeGroup = {
  jobFieldIds: string[];
  assigneeUsernames: string[];
};

type AssignmentRule = {
  categoryId: string;
  assignee: AssigneeGroup;
};
```

The current model is group-based. It does not use a separate `ruleType` field.

Related document: [Service Desk Settings](../../service-desk-settings.md)

---

## Initial Work Assignment

Work assignees are resolved when a ticket does not require approval or when
final approval completes.

```txt id="initial-work-assignment"
no approval step
or final approval complete
-> resolve selected subcategory assignment rule if present
-> otherwise resolve parent/main category assignment rule
-> status = Assigned
-> approvalStepId = null
-> assigneeUsernames = workers
-> history = ASSIGNMENT_RESOLVED
```

If assignment cannot resolve at least one worker, ticket creation or routing
fails instead of creating unowned work.

---

## Assigned vs Working

`Assigned` and `Working` are different states.

- `Assigned`: workers are known, but work has not started.
- `Working`: current worker has explicitly started or recorded work.

`Assigned -> Working` can occur through the explicit start-work command.
Work-session submission may also apply supported work-status transitions, but
Work Session remains a separate work-evidence model. GET/detail reads must not
start work.

---

## Assign Action

`ASSIGN` changes current assignees.

Standard work assignment:

- actor: current work assignee
- status: `Assigned`, `Working`, `Pending`
- effect: replace work assignees
- `Pending -> Working`
- history: `ASSIGNMENT_UPDATED`

Admin override:

- actor: Admin
- approval assignment: status `Approval`
- work assignment: `Assigned`, `Working`, `Pending`
- effect: replace current approvers or workers
- history: `ASSIGNMENT_UPDATED`

Assignee notification must resolve emails outside the persisted `tk_email`
field. Derived assignee emails are not stored in requester email configuration.

---

## Assign Self

`ASSIGN_SELF` lets a current worker claim multi-assignee work.

Rules:

- actor must already be a current work assignee
- current work assignee list must contain at least two users
- result is `[actor]`
- status is unchanged
- history: `ASSIGNMENT_UPDATED`

---

## Resubmission and Reassignment

Requester `RESUBMIT` after `Declined` or `Rejected` reruns initial routing.

Settings changes do not retroactively rewrite existing tickets. Existing
tickets keep their current assignees until a ticket command changes them.

---

## History

Assignment events:

```txt id="assignment-history-events"
ASSIGNMENT_RESOLVED
ASSIGNMENT_UPDATED
```

Use `ASSIGNMENT_UPDATED`, not `ASSIGNMENT_CHANGED`.

`ASSIGNMENT_RESOLVED` is produced by routing/assignment rules.
`ASSIGNMENT_UPDATED` is produced by user/Admin assignment commands.

---

## Deferred Scope

Do not describe these as current behavior:

- round-robin assignment
- least-loaded assignment
- calendar-aware assignment
- capacity balancing
- automatic reassignment after settings mutation
- notification delivery guarantees

They are future extensions.

---

## Related Documents

- [Ticket Lifecycle](../ticket-lifecycle.md)
- [Ticket Operation Rules](../../../08-dev-strategy/ticket-operation-rules.md)
- [Approval System](./approval-system.md)
- [Ticket History](../ticket-history.md)
- [Service Desk Settings](../../service-desk-settings.md)

---

## Summary

Assignment is category-driven current work ownership. The database stores one
current assignee array, and `approvalStepId` determines whether that array means
approvers or workers. Assignment rules resolve future work ownership; ticket
actions update current ownership.
