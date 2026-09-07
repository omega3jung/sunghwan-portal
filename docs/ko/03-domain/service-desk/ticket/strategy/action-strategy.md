# Action Strategy

## 목표

이 문서는 현재 Ticket Action command execution strategy를 정의합니다.

Ticket Action은 generic CRUD가 아닙니다. Status, permission, input, ticket effect,
history를 validate하는 server-controlled command pipeline입니다.

---

## 현재 Action Union

```txt
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

Route path는 다음을 사용합니다.

```txt
approve
decline
comment
note
assign
assignSelf
adjust
reject
merge
reopen
resubmit
cancel
```

명시적 start-work command는 Ticket Action union member가 아니라 별도 command route로
구현됩니다.

```txt
POST /api/service-desk/tickets/:ticketId/command/start-work
```

---

## Command Pipeline

```txt
POST /api/service-desk/tickets/:ticketId/command/:action
-> authenticate current employee
-> resolve user role
-> normalize payload
-> validate action/status/permission
-> insert action row
-> apply ticket effect
-> create history rows
-> return action DTO
```

Approval command는 같은 command route를 사용하지만 더 엄격한 payload를 validate합니다.
Content only이며 file이나 inline image는 허용하지 않습니다.

---

## Permission and Status Guards

각 action은 status guard와 ownership rule을 가집니다.

예:

- approver 또는 Admin은 `Approval`에서 `APPROVE`/`DECLINE`할 수 있습니다.
- current work assignee 또는 Admin은 status가 허용하는 곳에서 `ASSIGN`, `ADJUST`,
  `REJECT`, `MERGE`할 수 있습니다.
- requester는 status가 허용하는 곳에서 `RESUBMIT`, `REOPEN`, `CANCEL`할 수 있습니다.
- Admin은 일부 assignment, adjustment, merge, rejection path를 override할 수 있습니다.

상세 matrix는 [Ticket Operation Rules](../reference/ticket-operation-rules.md)에
있습니다.

---

## Transaction Boundary

REMOTE command execution은 action row, ticket mutation, history row를 하나의 use
case로 묶습니다.

Operational action result가 부분적으로 commit되는 것을 막기 위한 경계입니다.

```txt
action row
+ ticket mutation
+ history rows
= one command result
```

LOCAL command execution은 demo-safe mutable state로 같은 contract를 mirror합니다.

---

## Action-Specific Inputs

Common input:

- `content`
- 지원되는 non-approval action의 optional prepared files/images

Action-specific input:

- `ASSIGN`: `assigneeUsernames`
- `ADJUST`: `priority`, `riskLevel`, `dueAt`
- `MERGE`: `targetTicketId`
- `APPROVE`/`DECLINE`: content only

모든 action에는 content가 필요합니다. 다만 UI가 `ASSIGN_SELF`용 content를 생성할 수 있습니다.

`MERGE`는 기존 `INTERNAL` 티켓을 기존 `PORTAL` 티켓으로 제어된 방식으로
인계하는 경우도 포함합니다. 이 동작은 target 티켓을 새로 생성하지 않습니다. 서버는
동일 Tenant 안에서 같은 scope 간 merge와 단방향 `INTERNAL -> PORTAL` 전환을
허용합니다. 후자의 경우에도 `MERGE` action과 `TICKET_MERGED` event를 유지하지만,
source 티켓은 `closeReason = Escalated`로 닫습니다. 반대 방향의 scope 전환과
cross-Tenant merge는 거부합니다.

---

## Mutability Policy

### Communication Actions

`COMMENT`와 `NOTE`는 user-facing communication entry입니다.

기존 comment는 ticket이 `Closed`된 뒤에도 계속 표시됩니다. Existing row visibility는
closure 이후 새 row를 만들 수 있는 권한과 다릅니다. 새 communication row는 closed-ticket
operation rule을 따릅니다.

현재 route behavior는 ticket이 `Draft` 또는 `Closed`가 아닐 때 original writer의 soft
delete를 지원합니다.

### Operational Actions

Operational action은 immutable합니다.

예:

- `ASSIGN`
- `ADJUST`
- `REJECT`
- `MERGE`
- `REOPEN`
- `RESUBMIT`
- `CANCEL`
- approval actions

Operational decision을 수정해야 하면 새 corrective command를 만듭니다.

---

## Action Without Ticket Mutation

`COMMENT`와 `NOTE`는 status 변경 없이 action row와 history를 insert합니다.

Start-work command는 Ticket Action row를 insert하지 않고 ticket status를 변경합니다:
`Assigned -> Working`, `STATUS_UPDATED` history.

일부 system operation은 action row 없이 history를 만들 수 있습니다. 예를 들어 resolved
auto-close는 `SYSTEM_AUTO` source와 `actionNo = null`로 `RESOLUTION_CLOSE`를 만듭니다.

---

## Notification Boundary

Action command는 notification이 trigger될 지점을 제공할 수 있지만, persisted ticket
field를 파생 notification recipient로 오염시키면 안 됩니다.

특히 assignment command는 resolved assignee email을 `tk_email`에 덧붙이면 안 됩니다.
Assignee email은 notification-send time에 resolve해야 합니다.

Production notification delivery는 명시적으로 구현되기 전까지 deferred입니다.

---

## LOCAL and REMOTE Parity

두 runtime path는 같은 action command surface와 DTO shape를 노출해야 합니다.

```txt
LOCAL command handler
REMOTE portal API/service
-> TicketActionDto
```

Storage implementation의 차이는 route handler 뒤에 남아야 합니다.

---

## 관련 문서

- [Ticket Action Model](../ticket-action.md)
- [Ticket History](../ticket-history.md)
- [Ticket Operation Rules](../reference/ticket-operation-rules.md)
- [Ticket Lifecycle](../ticket-lifecycle.md)

---

## 요약

Ticket Action은 Service Desk operation의 command layer입니다. Status와 actor rule을
validate하고, action record를 만들며, ticket effect를 적용하고 immutable history를
만듭니다. Communication timeline entry와 event/audit history를 분리합니다.
