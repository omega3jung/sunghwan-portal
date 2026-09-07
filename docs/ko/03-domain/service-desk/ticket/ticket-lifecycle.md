# 티켓 Lifecycle

## 목표

Ticket lifecycle은 현재 persisted status와 티켓을 이동시키는 explicit command를
정의합니다.

이 문서는 status와 transition을 정리한 reference입니다. Operation-specific permission detail은
[Ticket Operation Rules](reference/ticket-operation-rules.md)에 문서화되어
있습니다.

---

## Persisted Statuses

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

`Open`, `Approved`, `Reopen`은 persisted status가 아닙니다.

- `Open`은 frontend grouping/search concept으로만 사용할 수 있습니다.
- Approval completion은 `APPROVAL_APPROVED` history로 기록됩니다.
- Reopen은 action입니다. 현재 결과는 `Resolved -> Working`입니다.

---

## Main Flow

```txt
Draft
-> Approval | Assigned
-> Working
<-> Pending
-> Resolved
-> Closed
```

Approval, rejection, resubmission, merge, cancel, auto-close는 이 main flow 주변에
controlled branch를 추가합니다.

---

## State Definitions

### Draft

- requester가 티켓을 준비 중입니다.
- REMOTE draft는 `status = Draft`인 일반 ticket row입니다.
- operational ticket list나 insight view에 포함되지 않습니다.
- final submit은 같은 row를 재사용하고 `Approval` 또는 `Assigned`로 route합니다.

### Approval

- 제출된 티켓이 approval을 기다립니다.
- `approvalStepId != null`
- `assigneeUsernames`는 current approver를 의미합니다.
- approve는 다음 approval step으로 진행하거나 work assignment로 이동할 수 있습니다.
- decline은 `Declined`로 이동합니다.

### Declined

- approval이 거절되었습니다.
- approval routing은 종료됩니다.
- `approvalStepId = null`
- `assigneeUsernames = []`
- requester는 initial routing으로 resubmit할 수 있습니다.

### Assigned

- work assignee가 resolve되었습니다.
- work는 아직 시작되지 않았습니다.
- `approvalStepId = null`
- `assigneeUsernames`는 current worker를 의미합니다.
- explicit `start-work` command가 `Working`으로 이동시킵니다.
- work-session submission도 지원되는 work-status transition을 적용할 수 있습니다.

### Working

- 티켓이 active work 상태입니다.
- current work assignee가 execution을 소유합니다.
- work session은 tracked minutes를 추가할 수 있습니다.
- work-session control은 `Pending` 또는 `Resolved`로 이동할 수 있습니다.

### Pending

- work가 일시 중단되었거나 대기 중입니다.
- current work assignee가 계속 티켓을 소유합니다.
- assignment는 이를 `Working`으로 재활성화할 수 있습니다.
- work-session control은 `Working` 또는 `Resolved`로 이동할 수 있습니다.

### Rejected

- work assignee 또는 Admin이 execution을 reject했습니다.
- requester는 initial routing으로 resubmit할 수 있습니다.
- 지원되는 경우 running work session이 종료됩니다.

### Resolved

- work result가 완료되었습니다.
- requester 또는 Admin은 `Working`으로 reopen할 수 있습니다.
- system auto-close는 resolved-history grace window 이후 `Closed`로 이동할 수 있습니다.

### Closed

- normal workflow의 terminal state입니다.
- merge, cancel, auto-close가 이 상태를 만듭니다.
- 문서화된 Admin exception을 제외하고 normal operational action은 차단됩니다.

---

## Transition Reference

| From | To | Trigger | Primary History |
| --- | --- | --- | --- |
| `Draft` | `Approval` | approval step이 있는 final submit | `TICKET_SUBMITTED`, `APPROVAL_REQUESTED` |
| `Draft` | `Assigned` | approval step이 없는 final submit | `TICKET_SUBMITTED`, `ASSIGNMENT_RESOLVED` |
| `Approval` | `Approval` | non-final step approve | `APPROVAL_APPROVED`, `APPROVAL_REQUESTED` |
| `Approval` | `Assigned` | final step approve | `APPROVAL_APPROVED`, `ASSIGNMENT_RESOLVED` |
| `Approval` | `Declined` | decline | `APPROVAL_DECLINED` |
| `Declined` | `Approval` or `Assigned` | requester resubmit | `TICKET_SUBMITTED` plus routing history |
| `Assigned` | `Working` | start-work command; work-session submission may also transition | `STATUS_UPDATED` |
| `Working` | `Pending` | next status가 있는 work session | `STATUS_UPDATED` |
| `Pending` | `Working` | next status가 있는 work session 또는 Pending에서 assign | `STATUS_UPDATED` or `ASSIGNMENT_UPDATED` |
| `Working`/`Pending` | `Resolved` | next status가 있는 work session | `STATUS_UPDATED` |
| `Assigned`/`Working`/`Pending` | `Rejected` | reject action | `TICKET_REJECTED` |
| `Rejected` | `Approval` or `Assigned` | requester resubmit | `TICKET_SUBMITTED` plus routing history |
| `Resolved` | `Working` | reopen action | `TICKET_REOPENED` |
| `Approval`/`Declined`/`Assigned`/`Working`/`Pending`/`Rejected` | `Closed` | requester cancel | `TICKET_CANCELED` |
| active work statuses or Admin-allowed statuses | `Closed` | 동일 Tenant merge. 같은 scope는 `Merged`, `INTERNAL -> PORTAL`은 `Escalated`로 종료 | `TICKET_MERGED` |
| `Resolved` | `Closed` | system auto-close | `RESOLUTION_CLOSE` |

---

## Routing Rules

Initial submit과 resubmit은 같은 routing shape를 사용합니다.

```txt
next approval step exists
-> status = Approval
-> approvalStepId = next step
-> assigneeUsernames = approvers

no approval step
-> status = Assigned
-> approvalStepId = null
-> assigneeUsernames = workers
```

Final approval은 먼저 next approval step을 resolve합니다. 다음 step이 없으면 assignment
rule이 work assignee를 resolve하고 티켓은 `Assigned`로 이동합니다.

Decline은 approval routing을 종료합니다.

```txt
status = Declined
approvalStepId = null
assigneeUsernames = []
```

---

## Requester Update

Requester update는 현재 ticket requester에 대해 `Approval`과 `Assigned`에서 허용됩니다.

Routing-neutral change는 status, approval step, assignee를 유지합니다.

- due date
- email recipients

Routing-sensitive change는 routing을 처음부터 다시 실행합니다.

- category
- subject
- content
- files
- images

History는 결과를 `ROUTING_PRESERVED` 또는 `ROUTING_RESET`으로 기록합니다.

Category가 변경되면 default priority, default risk level, minimum due date를 새
category 기준으로 다시 평가합니다. 다음 due date는 현재 due date와 새 category
minimum 중 더 늦은 값이므로, category 변경으로 due date를 더 이른 날짜로 당기지
않습니다.

---

## Work Session and Status

Start Work와 Work Session은 책임이 다릅니다. Start-work command는 ticket workflow
execution을 시작하며 `Assigned -> Working`으로 이동합니다. Work Session은 Ticket
Action이 아니며 work-time evidence를 기록하고 지원되는 work-status transition을
적용할 수 있습니다.

현재 work-session status transition:

```txt
Assigned -> Working
Working -> Pending | Resolved
Pending -> Working | Resolved
```

Timer stop은 현재 route surface의 별도 route가 아니며 티켓을 암묵적으로 resolve하지
않습니다. GET request는 work를 시작하거나 status를 변경하면 안 됩니다.

---

## Auto Close

Resolved auto-close는 system operation입니다.

- source: `SYSTEM_AUTO`
- event: `RESOLUTION_CLOSE`
- from: `Resolved`
- to: `Closed`
- close reason: `Completed`
- grace window: 7 days
- action link: `actionNo = null`
- 지원되는 경우 running work session을 종료합니다.

구현은 generic `updatedAt` rule이 아니라 resolved-history timing을 사용합니다.

---

## Forbidden Shortcuts

현재 lifecycle에서는 implicit 또는 hidden transition을 허용하지 않습니다.

예:

- ticket detail을 읽는 것만으로 work를 시작하면 안 됩니다.
- `Draft`는 바로 `Working`으로 점프하면 안 됩니다.
- approval completion은 `Approved` status를 만들면 안 됩니다.
- reopen은 `Reopen` status를 만들면 안 됩니다.
- work-session GET은 status를 변경하면 안 됩니다.
- attachment preparation만으로 history를 만들면 안 됩니다.

---

## 관련 문서

- [Ticket System Overview](./ticket-system-overview.md)
- [Ticket Operation Rules](reference/ticket-operation-rules.md)
- [Approval System](./strategy/approval-system.md)
- [Assignment Policy](./strategy/assignment-policy.md)
- [Ticket Work Session](./ticket-work-session.md)
- [Ticket History](./ticket-history.md)

---

## 요약

현재 lifecycle은 precise하고 action-driven입니다. Persisted status name은 현재 책임을
나타냅니다. Approval/work ownership은 `approvalStepId`와 `assigneeUsernames`에서
파생되며, 모든 status transition은 explicit command, workflow rule, 또는 system
operation에서 나와야 합니다.
