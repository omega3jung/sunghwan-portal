# Ticket Activity Model

## Goal

Ticket Activity describes the user-facing action timeline.

It is related to, but different from, immutable Ticket History.

```txt id="activity-vs-history"
Action / Activity -> user-facing interaction and command record
History           -> immutable event/audit record
```

---

## Current Action Types

```txt id="ticket-action-types"
APPROVE
DECLINE
COMMENT
NOTE
ASSIGN
ASSIGN_SELF
REJECT
MERGE
ADJUST
REOPEN
RESUBMIT
CANCEL
```

The route path uses lower camel action names such as `approve`, `assignSelf`,
and `resubmit`, but the persisted/action DTO type uses the uppercase union.

---

## Communication Actions

### Comment

- shared communication
- existing comments remain visible after the ticket is `Closed`
- this visibility does not imply that new comments can be created after closure
- creates `COMMENT_CREATED`
- current route supports soft delete by author before `Closed`
- soft delete creates `COMMENT_DELETED`

### Note

- internal communication
- not allowed in `Closed`
- creates `NOTE_CREATED`
- current route supports soft delete by author before `Closed`
- soft delete creates `NOTE_DELETED`

The history union reserves update events, but the current route surface does
not expose comment/note update behavior.

---

## Operational Actions

Operational actions are commands that may mutate ticket state or routing.

| Action | Main Effect | Primary History |
| --- | --- | --- |
| `APPROVE` | advance approval or resolve work assignment | `APPROVAL_APPROVED` |
| `DECLINE` | approval rejection | `APPROVAL_DECLINED` |
| `ASSIGN` | replace current approvers/workers | `ASSIGNMENT_UPDATED` |
| `ASSIGN_SELF` | current worker claims multi-assignee work | `ASSIGNMENT_UPDATED` |
| `ADJUST` | change planning fields | `PLANNING_UPDATED` |
| `REJECT` | move work to `Rejected` | `TICKET_REJECTED` |
| `MERGE` | close source into a same-Tenant target; `INTERNAL -> PORTAL` is recorded as `Escalated` | `TICKET_MERGED` |
| `REOPEN` | `Resolved -> Working` | `TICKET_REOPENED` |
| `RESUBMIT` | rerun initial routing | `TICKET_SUBMITTED` plus routing history |
| `CANCEL` | close requester-owned ticket | `TICKET_CANCELED` |

Operational actions are immutable in normal workflow. Corrections should be
represented by a new corrective command, not by editing old operational action
rows.

---

## Command Result

An action command can produce:

- an action row
- ticket state mutation
- one or more history rows
- related side effects such as finishing running work sessions

Example:

```txt id="approve-action-result"
APPROVE action
-> insert action row
-> create APPROVAL_APPROVED history
-> maybe create APPROVAL_REQUESTED
-> or create ASSIGNMENT_RESOLVED and move to Assigned
```

---

## Action and History Relationship

Action is not the audit source of truth. History is.

`actionNo` links history to the action that caused it where applicable.

System operations may create history with `actionNo = null`. Work-session
status changes may also create status history without a ticket action row.

---

## Timeline UI

The ticket timeline can show both:

- action list for human-readable communication and command reasons
- history list for immutable before/after events

The UI should not pretend that every history record has a corresponding action.
It should also not treat every action as a status change.

---

## Attachment Relationship

Action forms can include attachments where the action supports them.

Approval actions do not accept files or inline images.

Action attachment payloads must use prepared/safe values. Blob URLs and data
URLs are rejected by the action payload validator.

Related document: [Ticket Attachment Design](../../06-form-design/ticket-attachment.md)

---

## Related Documents

- [Action Strategy](./strategy/action-strategy.md)
- [Ticket History](./ticket-history.md)
- [Ticket Operation Rules](../../08-dev-strategy/ticket-operation-rules.md)
- [Ticket Lifecycle](./ticket-lifecycle.md)

---

## Summary

Ticket Activity is the user-facing action timeline. It records commands and
communication, while Ticket History records immutable audit events. Keeping the
two separate lets the UI explain what users did without losing exact event
traceability.
