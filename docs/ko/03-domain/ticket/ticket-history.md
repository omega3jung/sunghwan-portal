# 티켓 History

## 목표

Ticket History는 ticket workflow change에 대한 immutable audit event를 기록한다.

이 문서는 다음 질문에 답한다.

- 무엇이 일어났는가
- 왜 일어났는가
- 누가 시작했는가
- 무엇이 바뀌었는가
- 어떤 ticket action 또는 system rule이 만들었는가

---

## 핵심 개념

```txt id="ticket-history-core"
Action is user-facing timeline intent.
History is immutable event evidence.
```

Action은 하나의 history record, 여러 history record, 또는 status change 없는 결과를
만들 수 있다. System operation은 ticket action row 없이 history를 만들 수 있다.

---

## 현재 History Shape

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

`event`는 authoritative event field다. `metadata.event`를 primary event source로
사용하면 안 된다.

---

## Type

`type`은 영향을 받은 domain area를 식별한다.

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

`SYSTEM` history type은 없다. System automation은 `source` field로 표현한다.

---

## Source

`source`는 history가 왜 또는 어떤 rule에 의해 만들어졌는지를 식별한다.

```txt id="history-sources"
USER_ACTION
SYSTEM_AUTO
ROUTING_RULE
APPROVAL_RULE
ASSIGNMENT_RULE
```

예:

- `USER_ACTION`: approve, assign, reject, comment 같은 user command
- `SYSTEM_AUTO`: resolved auto-close 같은 cron/system operation
- `ROUTING_RULE`: requester update routing preservation/reset
- `APPROVAL_RULE`: approval step resolution
- `ASSIGNMENT_RULE`: work assignment resolution

---

## Event

현재 event union:

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

실제 union name을 사용한다. `ASSIGNMENT_CHANGED` 같은 alias를 만들면 안 된다.

일부 event는 현재 route surface가 union 일부만 사용하더라도 model에 예약되어 있다.
예를 들어 comment/note soft delete는 현재 route가 있지만 comment/note update route는
없다.

---

## Actor

`actorUsername`은 operation을 시작한 사용자다.

- user command는 current employee username을 사용한다.
- system automation은 `null`을 사용한다.
- history는 여전히 `actionNo`를 통해 ticket action과 연결될 수 있다.

---

## Action Link

`actionNo`는 event가 action row에 의해 만들어진 경우 history record를 ticket action에
연결한다.

예:

- comment action -> `COMMENT_CREATED`
- approve action -> `APPROVAL_APPROVED`, 이후 `APPROVAL_REQUESTED` 또는
  `ASSIGNMENT_RESOLVED`
- resubmit action -> `TICKET_SUBMITTED`, 이후 routing history

`RESOLUTION_CLOSE` 같은 system event는 `actionNo = null`이다.

---

## From and To Values

`fromValue`와 `toValue`는 structured JSON value다.

안정적으로 표시할 수 있는 before/after change를 설명해야 한다.

예:

```json id="history-from-to-example"
{
  "fromValue": { "status": "Resolved" },
  "toValue": { "status": "Working" }
}
```

Attachment 비교는 raw file data, blob URL, base64 payload가 아니라 count와 name
같은 summary를 저장해야 한다.

---

## Metadata

`metadata`는 보조 display/audit context다.

포함할 수 있는 값:

- changed fields
- previous/next status
- previous/next approval step
- previous/next assignee usernames
- close reason
- resolved grace days
- action-specific display context

Persistence metadata와 client-visible display metadata는 분리되어야 한다. Client DTO는
allowlist된 display metadata만 노출해야 한다.

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

`TICKET_REOPENED`는 이 status transition의 authoritative event다.

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

Resolved auto-close는 generic ticket `updatedAt` rule이 아니라 resolved-history
timestamp와 현재 7-day grace period를 기준으로 한다.

---

## History and Ticket Actions

Ticket Action과 Ticket History는 의도적으로 분리되어 있다.

| Area | Purpose |
| --- | --- |
| Action | user-facing timeline command or communication |
| History | immutable event/audit record |

Operational action은 immutable하다. Communication action은 현재 `COMMENT`와 `NOTE`에
대해 soft delete를 지원하며, `COMMENT_DELETED` 또는 `NOTE_DELETED`를 만든다.

---

## History and Work Sessions

현재 work-session create는 ticket status를 변경할 때 `STATUS_UPDATED`를 만들 수
있다.

History union은 work-session-specific event를 포함하지만, 현재 route surface는 별도
timer start/stop/switch route를 노출하지 않는다. 현재 설계에서 timer stop이 ticket을
resolve한다고 설명하면 안 된다.

---

## Forbidden Patterns

현재 history를 다음처럼 모델링하면 안 된다.

- authoritative event로서의 `tkh_history_action`
- authoritative event로서의 `metadata.event`
- history type으로서의 `SYSTEM`
- JSON으로 표현할 수 있는데도 unstructured before/after string 사용
- history metadata에 raw file/blob/base64 data 저장

---

## 관련 문서

- [Ticket System Overview](./ticket-system-overview.md)
- [Ticket Lifecycle](./ticket-lifecycle.md)
- [Ticket Activity Model](./ticket-activity.md)
- [Action Strategy](./strategy/action-strategy.md)
- [Ticket Operation Rules](../../08-dev-strategy/ticket-operation-rules.md)

---

## 요약

Ticket History는 `type`, `source`, `event`로 구성된 immutable event model이다.
Ticket command, routing decision, system automation, work progress의 audit trail을
보존하면서 ticket action이나 client metadata에 과부하를 주지 않는다.
