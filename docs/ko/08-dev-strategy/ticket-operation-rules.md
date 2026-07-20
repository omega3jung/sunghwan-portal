# 티켓 Operation Rules

## 목표

이 문서는 Service Desk ticket operation을 위한 implementation-facing rule matrix다.

누가 operation을 실행할 수 있는지, 언제 허용되는지, 어떤 input을 받는지, 어떤
ticket state를 변경하는지, 어떤 history event가 만들어지는지를 기록한다.

개념적 status 의미는 [Ticket Lifecycle](../03-domain/ticket/ticket-lifecycle.md)에
문서화되어 있다.

---

## 현재 Operation Surface

### Ticket Routes

```txt id="ticket-routes"
GET    /api/service-desk/tickets
POST   /api/service-desk/tickets
GET    /api/service-desk/tickets/search
GET    /api/service-desk/tickets/:ticketId
PUT    /api/service-desk/tickets/:ticketId
DELETE /api/service-desk/tickets/:ticketId
```

### Draft Routes

```txt id="draft-routes"
GET    /api/service-desk/tickets/draft
POST   /api/service-desk/tickets/draft
PUT    /api/service-desk/tickets/draft/:ticketId
DELETE /api/service-desk/tickets/draft/:ticketId
```

### Command Routes

```txt id="command-routes"
POST /api/service-desk/tickets/:ticketId/command/start-work
POST /api/service-desk/tickets/:ticketId/command/:action
```

`:action`은 다음 중 하나다.

```txt id="command-actions"
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

### Subresource Routes

```txt id="subresource-routes"
GET   /api/service-desk/tickets/:ticketId/actions
GET   /api/service-desk/tickets/:ticketId/actions/:actionNo
PATCH /api/service-desk/tickets/:ticketId/actions/:actionNo

GET   /api/service-desk/tickets/:ticketId/histories

GET   /api/service-desk/tickets/:ticketId/work-session
POST  /api/service-desk/tickets/:ticketId/work-session
```

---

## 공통 Command Pipeline

```txt id="ticket-command-pipeline"
command request
-> authenticate
-> authorize
-> validate current status
-> validate payload
-> create action row when applicable
-> mutate ticket when applicable
-> create history rows
-> return DTO
```

Operational action 생성, ticket mutation, history 생성은 하나의 use case로
취급해야 한다. REMOTE는 server-side service와 transaction을 사용한다. LOCAL은 같은
DTO 방향을 유지하는 demo-safe local handler를 사용한다.

---

## Requester Update

- who: requester
- allowed status: `Approval`, `Assigned`
- input: category, subject, content, due date, email, prepared files/images
- validation:
  - requester가 ticket을 소유한다.
  - category가 active이고 available하다.
  - attachment metadata는 이미 prepare되어 있다.
  - normalized previous/next value를 비교한다.
- ticket effect:
  - routing-neutral change는 status, approval step, assignee를 유지한다.
  - routing-sensitive change는 첫 approval step부터 routing을 다시 실행한다.
  - category change는 category default에서 priority와 risk를 다시 파생할 수 있다.
  - category change는 새 category SLA default에서 minimum due date를 다시 평가하고
    current due date와 새 minimum 중 더 늦은 값을 유지한다.
- action persistence: ticket action row 없음
- history event: `ROUTING_PRESERVED` or `ROUTING_RESET`
- notification boundary: 현재 문서에서는 별도 notification source가 아니다.
- query invalidation: ticket detail, ticket list/search, history

Routing-neutral fields:

- due date
- email recipients

Routing-sensitive fields:

- category
- subject
- content
- files
- images

---

## Submit Ticket

- who: requester
- allowed status:
  - draft 없는 신규 create
  - 기존 `Draft`
- input: prepared body/files/images가 포함된 ticket form value
- validation:
  - category가 valid하다.
  - attachment metadata가 prepare되어 있다.
  - approval 또는 assignment가 최소 한 명의 assignee를 resolve할 수 있다.
- ticket effect:
  - next approval step이 있으면 `Approval`
  - 없으면 `Assigned`
  - 기존 draft row가 있으면 재사용한다.
- action persistence: ticket action row 없음
- history event:
  - `TICKET_SUBMITTED`
  - `APPROVAL_REQUESTED` or `ASSIGNMENT_RESOLVED`
- query invalidation: draft, ticket list/search/detail, history

---

## Start Work

- who: current work assignee
- allowed status: `Assigned`
- input: body 없음
- validation:
  - `approvalStepId = null`
  - actor가 current work assignees에 포함된다.
- ticket effect: `Assigned -> Working`
- action persistence: ticket action row 없음
- history event: `STATUS_UPDATED`
- query invalidation: ticket detail/list/search, history

GET/read request는 work를 시작하면 안 된다.

---

## Comment

- who: ticket 접근 권한이 있는 user
- allowed status: 모든 live non-`Draft`, non-`Closed` status
- input: content, 지원되는 경우 prepared action attachment
- validation:
  - content 필수
  - action path와 payload type이 일치해야 한다.
  - attachment payload는 `blob:` 또는 `data:` URL을 포함할 수 없다.
- ticket effect: 없음
- action persistence: `COMMENT`
- history event: `COMMENT_CREATED`
- notification boundary: shared communication은 command boundary 밖에서 알림을
  보낼 수 있다.
- query invalidation: action list, history, ticket recent activity

Soft delete:

- who: action writer
- disallowed status: `Draft`, `Closed`
- action type: `COMMENT` only
- history event: `COMMENT_DELETED`

현재 route surface는 comment update route를 노출하지 않지만 history union은
`COMMENT_UPDATED`를 예약한다.

Closure 전에 생성된 comment는 `Closed` 이후에도 계속 표시된다. 이는 timeline
visibility이지 closed ticket에 새 comment를 만들 수 있다는 권한이 아니다.

---

## Note

- who: ticket 접근 권한이 있는 user
- allowed status: 모든 live non-`Draft`, non-`Closed` status
- input: content, 지원되는 경우 prepared action attachment
- validation: content 필수
- ticket effect: 없음
- action persistence: `NOTE`
- history event: `NOTE_CREATED`
- notification boundary: internal note이며 기본적으로 external notification 없음
- query invalidation: action list, history, ticket recent activity

Soft delete:

- who: action writer
- disallowed status: `Draft`, `Closed`
- action type: `NOTE` only
- history event: `NOTE_DELETED`

현재 route surface는 note update route를 노출하지 않지만 history union은
`NOTE_UPDATED`를 예약한다.

---

## Approve

- who: current approver 또는 Admin
- allowed status: `Approval`
- input: content only; approval action은 file과 inline image를 거부한다.
- validation:
  - `approvalStepId != null`
  - Admin이 아니면 actor가 current approver다.
  - content 필수
- ticket effect:
  - next approval step이 있으면 `Approval` 유지, 다음 approver로 이동
  - next approval step이 없으면 `Assigned`로 이동하고 worker resolve
- action persistence: `APPROVE`
- history event:
  - `APPROVAL_APPROVED`
  - `APPROVAL_REQUESTED` or `ASSIGNMENT_RESOLVED`
- query invalidation: ticket detail/list/search, actions, history

---

## Decline

- who: current approver 또는 Admin
- allowed status: `Approval`
- input: content only; approval action은 file과 inline image를 거부한다.
- validation:
  - `approvalStepId != null`
  - Admin이 아니면 actor가 current approver다.
  - content 필수
- ticket effect:
  - `Approval -> Declined`
  - `approvalStepId = null`
  - `assigneeUsernames = []`
- action persistence: `DECLINE`
- history event: `APPROVAL_DECLINED`
- query invalidation: ticket detail/list/search, actions, history

---

## Assign

- who:
  - work assignment의 current work assignee
  - approval 또는 work assignment override의 Admin
- allowed status:
  - standard: `Assigned`, `Working`, `Pending`
  - Admin approval override: `Approval`
- input: content, assignee usernames
- validation:
  - content 필수
  - assignee list 필수
  - non-Admin actor는 current work assignee여야 한다.
- ticket effect:
  - current assignee usernames 교체
  - `Pending -> Working`
  - mode가 status change를 resolve하지 않는 한 `Assigned`, `Working`, `Approval`은
    status 유지
- action persistence: `ASSIGN`
- history event: `ASSIGNMENT_UPDATED`
- query invalidation: ticket detail/list/search, actions, history

파생된 assignee email은 persisted `tk_email`에 쓰면 안 된다.

---

## Assign Self

- who: current work assignee
- allowed status: `Assigned`, `Working`, `Pending`
- input: auto-generated content
- validation:
  - actor가 이미 current worker 중 하나다.
  - current work assignee list가 최소 두 명이다.
- ticket effect:
  - current assignee를 actor 한 명으로 교체
  - status unchanged
- action persistence: `ASSIGN_SELF`
- history event: `ASSIGNMENT_UPDATED`
- query invalidation: ticket detail/list/search, actions, history

---

## Adjust

- who:
  - current work assignee
  - Admin
- allowed status:
  - standard: `Assigned`, `Working`, `Pending`
  - Admin correction: `Approval`, `Assigned`, `Working`, `Pending`,
    `Resolved`, `Closed`
- input: content, priority, risk level, due date
- validation:
  - content 필수
  - 최소 하나의 planning field가 변경되어야 한다.
  - resolved/closed Admin correction은 due date를 변경할 수 없다.
- ticket effect:
  - 허용되는 경우 priority, risk, due date 갱신
- action persistence: `ADJUST`
- history event: `PLANNING_UPDATED`
- query invalidation: ticket detail/list/search, actions, history

---

## Reject

- who: current work assignee 또는 Admin
- allowed status: `Assigned`, `Working`, `Pending`
- input: content
- validation:
  - content 필수
  - Admin이 아니면 actor가 work assignee다.
- ticket effect:
  - status -> `Rejected`
  - 지원되는 경우 running work session 종료
- action persistence: `REJECT`
- history event: `TICKET_REJECTED`
- query invalidation: ticket detail/list/search, actions, history, work sessions

---

## Resubmit

- who: requester
- allowed status: `Declined`, `Rejected`
- input: content
- validation:
  - actor가 requester다.
  - initial routing이 approval 또는 worker를 resolve할 수 있다.
- ticket effect:
  - initial routing 재실행
  - next approval step: `Approval`
  - approval step 없음: `Assigned`
- action persistence: `RESUBMIT`
- history event:
  - `TICKET_SUBMITTED`
  - `APPROVAL_REQUESTED` or `ASSIGNMENT_RESOLVED`
- query invalidation: ticket detail/list/search, actions, history

---

## Reopen

- who: requester 또는 Admin
- allowed status: `Resolved`
- input: content
- validation:
  - content 필수
  - existing work assignee 필수
- ticket effect:
  - `Resolved -> Working`
  - assignees preserved
- action persistence: `REOPEN`
- history type: `STATUS`
- history source: `USER_ACTION`
- history event: `TICKET_REOPENED`
- history from/to: `{ status: "Resolved" } -> { status: "Working" }`
- query invalidation: ticket detail/list/search, actions, history

---

## Merge

- who:
  - standard merge의 current work assignee
  - override의 Admin
- allowed status:
  - standard: `Assigned`, `Working`, `Pending`, `Resolved`
  - Admin override: `Approval`, `Declined`, `Assigned`, `Working`, `Pending`,
    `Rejected`, `Resolved`, `Closed`
- input: content, target ticket id
- validation:
  - target ticket 필수
  - self-merge 금지
  - draft source 또는 target 금지
  - 이미 merged된 source 또는 target 금지
  - source와 target은 저장된 category 기준으로 동일 Tenant에 속해야 한다.
  - 같은 scope 간 merge는 허용한다.
  - cross-scope merge는 `INTERNAL -> PORTAL`만 허용한다.
  - `PORTAL -> INTERNAL` 및 cross-Tenant merge는 금지한다.
  - 서버는 저장된 ticket/category context에서 Tenant와 scope를 파생한다.
    request field는 authorization 사실로 사용하지 않는다.
  - domain merge rule이 source/target status pair를 허용해야 한다.
- ticket effect:
  - source ticket -> `Closed`
  - 같은 scope merge: `closeReason = Merged`
  - `INTERNAL -> PORTAL`: `closeReason = Escalated`
  - merged target id/number 설정
  - 지원되는 경우 running work session 종료
- action persistence: `MERGE`
- history event: `TICKET_MERGED`
- history metadata: close reason, source/target Tenant, source/target scope,
  merged target id/number, operator reason
- content policy: merge는 티켓 관계만 연결하며 INTERNAL action, history,
  attachment 또는 content를 PORTAL target에 복사하지 않는다.
- query invalidation: ticket detail/list/search, actions, history, work sessions

---

## Cancel

- who: requester
- allowed status: `Approval`, `Declined`, `Assigned`, `Working`, `Pending`,
  `Rejected`
- input: content
- validation:
  - actor가 requester다.
  - content 필수
- ticket effect:
  - status -> `Closed`
  - `closeReason = Canceled`
  - 지원되는 경우 running work session 종료
- action persistence: `CANCEL`
- history event: `TICKET_CANCELED`
- query invalidation: ticket detail/list/search, actions, history, work sessions

---

## Work Session Submit

명시적 start-work command route는 work-session row를 만들지 않고
`Assigned -> Working`으로 이동할 수 있다. Work-session submission은 work-time
evidence를 기록하고 아래 지원 status transition을 적용할 수 있다.

- who: current work assignee
- allowed status: `Assigned`, `Working`, `Pending`
- input:
  - `inputMode = duration | range`
  - tracked minutes
  - optional `nextStatus = Working | Pending | Resolved`
  - note
- validation:
  - actor가 current work assignee다.
  - tracked minutes는 positive여야 한다.
  - `Assigned`와 `Pending`에는 explicit status transition이 필요하다.
  - allowed transitions:
    - `Assigned -> Working`
    - `Working -> Pending | Resolved`
    - `Pending -> Working | Resolved`
- ticket effect:
  - ticket aggregate에 tracked minutes 추가
  - `nextStatus`가 바뀌면 status 갱신
  - resolving은 지원되는 경우 running session을 종료한다.
- action persistence: ticket action row 없음
- history event: status가 바뀌면 `STATUS_UPDATED`
- query invalidation: ticket detail/list/search, work-session list, history

현재 route surface는 list/create를 지원한다. Work-session detail, update, delete,
timer start/finish/switch용 feature-client method는 존재하지만 대응 route file은
현재 없다.

---

## Resolved Auto Close

- who: system
- allowed status: `Resolved`
- input: cron/system request
- validation:
  - resolved-history grace window가 지났다.
  - grace window는 generic ticket `updatedAt`이 아니라 티켓을 resolved로 만든 최신
    history entry를 기준으로 측정한다.
  - 현재 grace 값은 7일이다.
- ticket effect:
  - `Resolved -> Closed`
  - `closeReason = Completed`
  - 지원되는 경우 running work session 종료
- action persistence: ticket action row 없음
- history event: `RESOLUTION_CLOSE`
- history source: `SYSTEM_AUTO`
- history action link: `actionNo = null`
- query invalidation: user-triggered UI mutation이 아닌 system side effect

---

## 관련 문서

- [Ticket System Overview](../03-domain/ticket/ticket-system-overview.md)
- [Ticket Lifecycle](../03-domain/ticket/ticket-lifecycle.md)
- [Ticket Activity Model](../03-domain/ticket/ticket-activity.md)
- [Action Strategy](../03-domain/ticket/strategy/action-strategy.md)
- [Ticket History](../03-domain/ticket/ticket-history.md)
- [Ticket Track Time](../03-domain/ticket/ticket-track-time.md)

---

## 요약

Ticket operation은 command-driven이다. 모든 operation은 actor, status guard,
payload contract, ticket effect, action persistence rule, history event를 가진다.
숨은 status mutation은 허용되지 않는다.
