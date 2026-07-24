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

## Assignment Settings Authorization

Assignment Rule authority is resolved from the stored category through
`Category -> Tenant -> Company`; the persisted rule does not duplicate
`tenantId` as an independent authority, and a request company value is not an
authorization source.

| Category target             | Owner Admin | Same-company Tenant Admin | Other Tenant Admin |
| --------------------------- | ----------- | ------------------------- | ------------------ |
| Owner Tenant, either scope  | manage      | none                      | none               |
| Customer Tenant, `INTERNAL` | none        | manage                    | none               |
| Customer Tenant, `PORTAL`   | manage      | read                      | none               |

Customer `PORTAL` work routing is managed by the owner/service provider. A
Tenant Admin's read-only view may include display data for currently referenced
provider assignees; it does not grant candidate search across the owner-company
employee directory.

Both read and mutation paths load the category relationship and invoke the
shared settings policy. An unauthorized API request returns `403`; query
responses do not include rules whose access is `none`.

---

## Assignee Eligibility

Allowed workers are derived from category context:

| Category context                  | Allowed employee company                                   |
| --------------------------------- | ---------------------------------------------------------- |
| `INTERNAL` in Owner Tenant        | owner/service-provider company                             |
| `INTERNAL` in customer Tenant     | that customer Tenant company                               |
| `PORTAL`, default                 | owner/service-provider company                             |
| `PORTAL`, explicit joint handling | owner/service-provider company and category Tenant company |

Both explicit `assigneeUsernames` and employees resolved from `jobFieldIds`
must pass the company filter. The server must not use a global employee search,
another customer company's employees, a job field without tenant/company
filtering, or a client-supplied company ID. Joint handling across the provider
and category Tenant company is enabled only by the persisted PORTAL Assignment
Rule option `includeTenantCompany`; it defaults to `false` and is never inferred
from selected employees or client-supplied company context.

Candidate lookup is category-centered and checks both the caller's Assignment
Rule capability and the purpose-specific company boundary. Eligibility is
validated when a rule is saved and again during submit, resubmit, or another
explicit routing recalculation. If employees become inactive or move company,
they are rejected at routing time. Zero valid workers is a routing failure; the
system does not create an unowned `Assigned` ticket.

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

This ticket action override is not derived from the Service Desk Settings admin
classification. Owner Admin or Tenant Admin status alone does not make an actor
a current approver/worker and the settings authorization helper must not be
used to authorize `ASSIGN`.

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

The current generic Admin ticket-action override requires a separate
cross-tenant audit and, if retained, an explicit break-glass/platform policy.
That follow-up is distinct from the category-scope settings policy; the
existing ticket action matrix is not otherwise changed here.

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
