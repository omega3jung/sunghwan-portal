# 티켓 Activity 모델

## 목표

Ticket Activity는 사용자에게 보이는 action timeline을 설명한다.

이는 immutable Ticket History와 관련은 있지만 서로 다르다.

```txt id="activity-vs-history"
Action / Activity -> user-facing interaction and command record
History           -> immutable event/audit record
```

---

## 현재 Action Type

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

Route path는 `approve`, `assignSelf`, `resubmit` 같은 lower camel action name을
사용하지만, persisted/action DTO type은 uppercase union을 사용한다.

---

## Communication Actions

### Comment

- shared communication
- 티켓이 `Closed` 된 뒤에도 기존 comment는 계속 표시된다.
- 이 visibility가 closure 이후 새 comment를 만들 수 있다는 뜻은 아니다.
- `COMMENT_CREATED`를 만든다.
- 현재 route는 `Closed` 전 author soft delete를 지원한다.
- soft delete는 `COMMENT_DELETED`를 만든다.

### Note

- internal communication
- `Closed`에서는 허용되지 않는다.
- `NOTE_CREATED`를 만든다.
- 현재 route는 `Closed` 전 author soft delete를 지원한다.
- soft delete는 `NOTE_DELETED`를 만든다.

History union은 update event를 예약해두지만, 현재 route surface는 comment/note
update behavior를 노출하지 않는다.

---

## Operational Actions

Operational action은 ticket state나 routing을 변경할 수 있는 command다.

| Action | Main Effect | Primary History |
| --- | --- | --- |
| `APPROVE` | approval 진행 또는 work assignment resolve | `APPROVAL_APPROVED` |
| `DECLINE` | approval rejection | `APPROVAL_DECLINED` |
| `ASSIGN` | current approver/worker 교체 | `ASSIGNMENT_UPDATED` |
| `ASSIGN_SELF` | current worker가 multi-assignee work를 claim | `ASSIGNMENT_UPDATED` |
| `ADJUST` | planning field 변경 | `PLANNING_UPDATED` |
| `REJECT` | work를 `Rejected`로 이동 | `TICKET_REJECTED` |
| `MERGE` | source를 동일 Tenant의 target으로 닫음. `INTERNAL -> PORTAL`은 `Escalated`로 기록 | `TICKET_MERGED` |
| `REOPEN` | `Resolved -> Working` | `TICKET_REOPENED` |
| `RESUBMIT` | initial routing 재실행 | `TICKET_SUBMITTED` plus routing history |
| `CANCEL` | requester-owned ticket 닫기 | `TICKET_CANCELED` |

Operational action은 normal workflow에서 immutable하다. 수정은 기존 operational
action row를 편집하는 대신 새 corrective command로 표현해야 한다.

---

## Command Result

Action command는 다음을 만들 수 있다.

- action row
- ticket state mutation
- 하나 이상의 history row
- running work session 종료 같은 관련 side effect

예:

```txt id="approve-action-result"
APPROVE action
-> insert action row
-> create APPROVAL_APPROVED history
-> maybe create APPROVAL_REQUESTED
-> or create ASSIGNMENT_RESOLVED and move to Assigned
```

---

## Action과 History의 관계

Action은 audit source of truth가 아니다. History가 source of truth다.

`actionNo`는 적용 가능한 경우 history를 원인 action과 연결한다.

System operation은 `actionNo = null`인 history를 만들 수 있다. Work-session status
change도 ticket action row 없이 status history를 만들 수 있다.

---

## Timeline UI

Ticket timeline은 두 가지를 모두 보여줄 수 있다.

- 사람이 읽기 쉬운 communication 및 command reason을 위한 action list
- immutable before/after event를 위한 history list

UI는 모든 history record에 대응 action이 있는 것처럼 보여주면 안 된다. 또한 모든
action을 status change처럼 취급해서도 안 된다.

---

## Attachment Relationship

Action form은 해당 action이 지원하는 경우 attachment를 포함할 수 있다.

Approval action은 file이나 inline image를 허용하지 않는다.

Action attachment payload는 prepared/safe value를 사용해야 한다. Blob URL과 data
URL은 action payload validator에서 거부된다.

관련 문서: [Ticket Attachment Design](../../06-form-design/ticket-attachment.md)

---

## 관련 문서

- [Action Strategy](./strategy/action-strategy.md)
- [Ticket History](./ticket-history.md)
- [Ticket Operation Rules](../../08-dev-strategy/ticket-operation-rules.md)
- [Ticket Lifecycle](./ticket-lifecycle.md)

---

## 요약

Ticket Activity는 사용자에게 보이는 action timeline이다. Command와 communication을
기록하고, Ticket History는 immutable audit event를 기록한다. 둘을 분리하면 UI가
사용자의 행위를 설명하면서도 정확한 event traceability를 잃지 않는다.
