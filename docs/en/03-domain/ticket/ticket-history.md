# Ticket History

## Goal

Ticket History records immutable audit events for ticket workflow changes.

It answers:

- what happened
- why it happened
- who initiated it
- what changed
- which ticket action or system rule produced it

---

## Core Concept

```txt id="ticket-history-core"
Action is user-facing timeline intent.
History is immutable event evidence.
```

An action may produce one history record, multiple history records, or no status
change. A system operation can produce history without a ticket action row.

---

## Current History Shape

```ts id="ticket-history-shape"
type TicketHistory = {
  ticketId: string;
  historyNo: number;
  type: HistoryType;
  source: TicketHistorySource;
  event: TicketHistoryEvent;
  actorUsername: string | null;
  actionNo: number | null;
  fromValue?: TicketHistoryJsonValue;
  toValue?: TicketHistoryJsonValue;
  metadata: TicketHistoryDisplayMetadata | null;
  createdAt: ISODateString;
};
```

`event` is the authoritative event field. Do not use `metadata.event` as the
primary event source.

---

## Type

`type` identifies the affected domain area.

```txt id="history-types"
TICKET
STATUS
CATEGORY
ASSIGNMENT
APPROVAL
COMMENT
NOTE
PLANNING
```

There is no `SYSTEM` history type. System automation is represented through the
`source` field.

---

## Source

`source` identifies why or which rule produced the history.

```txt id="history-sources"
USER_ACTION
SYSTEM_AUTO
ROUTING_RULE
APPROVAL_RULE
ASSIGNMENT_RULE
```

Examples:

- `USER_ACTION`: user command such as approve, assign, reject, comment
- `SYSTEM_AUTO`: cron/system operation such as resolved auto-close
- `ROUTING_RULE`: requester update routing preservation/reset
- `APPROVAL_RULE`: approval step resolution
- `ASSIGNMENT_RULE`: work assignment resolution

---

## Event

Current event union:

```txt id="history-events"
TICKET_SUBMITTED
TICKET_UPDATED
TICKET_REOPENED
TICKET_REJECTED
TICKET_MERGED
TICKET_CANCELED
CATEGORY_UPDATED
STATUS_UPDATED
RESOLUTION_CLOSE
APPROVAL_REQUESTED
APPROVAL_APPROVED
APPROVAL_DECLINED
ASSIGNMENT_RESOLVED
ASSIGNMENT_UPDATED
COMMENT_CREATED
COMMENT_UPDATED
COMMENT_DELETED
NOTE_CREATED
NOTE_UPDATED
NOTE_DELETED
PLANNING_UPDATED
WORK_SESSION_STARTED
WORK_SESSION_STOPPED
WORK_SESSION_UPDATED
WORK_SESSION_DELETED
ROUTING_RESET
ROUTING_PRESERVED
```

Use the actual union names. Do not introduce aliases such as
`ASSIGNMENT_CHANGED`.

Some events are reserved by the model even when the current route surface only
uses part of the union. For example, comment/note soft delete is currently
routed, while comment/note update routes are not present.

---

## Actor

`actorUsername` is the user who initiated the operation.

- user commands use the current employee username
- system automation uses `null`
- history can still be associated with a ticket action through `actionNo`

---

## Action Link

`actionNo` links a history record to a ticket action when the event was caused
by an action row.

Examples:

- comment action -> `COMMENT_CREATED`
- approve action -> `APPROVAL_APPROVED`, then possibly `APPROVAL_REQUESTED` or
  `ASSIGNMENT_RESOLVED`
- resubmit action -> `TICKET_SUBMITTED`, then routing history

System events such as `RESOLUTION_CLOSE` have `actionNo = null`.

---

## From and To Values

`fromValue` and `toValue` are structured JSON values.

They should describe the before/after change in a stable, displayable shape.

Examples:

```json id="history-from-to-example"
{
  "fromValue": { "status": "Resolved" },
  "toValue": { "status": "Working" }
}
```

Attachment comparisons should store summaries such as counts and names, not raw
file data, blob URLs, or base64 payloads.

---

## Metadata

`metadata` is supplemental display/audit context.

It may include:

- changed fields
- previous/next status
- previous/next approval step
- previous/next assignee usernames
- close reason
- resolved grace days
- action-specific display context

Persistence metadata and client-visible display metadata must remain distinct.
The client DTO should expose only allowlisted display metadata.

---

## Event Creation Examples

### Ticket Submit

```txt id="history-ticket-submit"
TICKET_SUBMITTED
-> APPROVAL_REQUESTED or ASSIGNMENT_RESOLVED
```

### Approval

```txt id="history-approval"
APPROVAL_APPROVED
-> APPROVAL_REQUESTED when another step exists
-> ASSIGNMENT_RESOLVED when final approval completes
```

### Requester Update

```txt id="history-requester-update"
ROUTING_PRESERVED
or
ROUTING_RESET
```

### Reopen

```txt id="history-reopen"
type = STATUS
source = USER_ACTION
event = TICKET_REOPENED
fromValue = { status: "Resolved" }
toValue = { status: "Working" }
```

`TICKET_REOPENED` is the authoritative event for this status transition.

### Auto Close

```txt id="history-auto-close"
type = STATUS
source = SYSTEM_AUTO
event = RESOLUTION_CLOSE
actionNo = null
fromValue = { status: "Resolved" }
toValue = { status: "Closed", closeReason: "Completed" }
metadata.resolvedGraceDays = 7
```

Resolved auto-close is based on the resolved-history timestamp plus the current
7-day grace period, not a generic ticket `updatedAt` rule.

---

## History and Ticket Actions

Ticket Action and Ticket History are intentionally separate.

| Area | Purpose |
| --- | --- |
| Action | user-facing timeline command or communication |
| History | immutable event/audit record |

Operational actions are immutable. Communication actions currently support soft
delete for `COMMENT` and `NOTE`, producing `COMMENT_DELETED` or `NOTE_DELETED`.

---

## History and Work Sessions

Current work-session create can produce `STATUS_UPDATED` when it changes ticket
status.

The history union includes work-session-specific events, but the current route
surface does not expose separate timer start/stop/switch routes. Do not describe
timer stop as resolving a ticket in the current design.

---

## Forbidden Patterns

Do not model current history as:

- `tkh_history_action` as the authoritative event
- `metadata.event` as the authoritative event
- `SYSTEM` as a history type
- unstructured before/after strings when JSON can represent the change
- raw file/blob/base64 data in history metadata

---

## Related Documents

- [Ticket System Overview](./ticket-system-overview.md)
- [Ticket Lifecycle](./ticket-lifecycle.md)
- [Ticket Activity Model](./ticket-activity.md)
- [Action Strategy](./strategy/action-strategy.md)
- [Ticket Operation Rules](../../08-dev-strategy/ticket-operation-rules.md)

---

## Summary

Ticket History is an immutable event model built from `type`, `source`, and
`event`. It preserves the audit trail of ticket commands, routing decisions,
system automation, and work progress without overloading ticket actions or
client metadata.
