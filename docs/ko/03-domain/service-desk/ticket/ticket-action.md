# Ticket Action 모델

## 목표

Ticket Action은 사용자 타임라인에 표시하는 의사소통과 명령 실행 기록을 설명합니다.

수정하지 않는 이벤트 기록인 Ticket History와 관련이 있지만, 별도 모델입니다.

```txt
Action / Activity -> user-facing interaction and command record
History           -> immutable event/audit record
```

---

## 현재 Action Type

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

API 경로는 `approve`, `assignSelf`, `resubmit`처럼 첫 단어를 소문자로 시작하는
lower camel 액션 이름을 사용합니다. 저장된 액션과 액션 DTO의 타입은 대문자 union을 사용합니다.

---

## Communication Actions

### Comment

- 요청자와 공유하는 의사소통 기록
- 티켓이 `Closed`가 된 뒤에도 기존 댓글은 계속 표시합니다.
- 기존 댓글이 보인다고 해서 종료 이후 새 댓글을 만들 수 있는 것은 아닙니다.
- `COMMENT_CREATED`를 만듭니다.
- 현재 API는 `Closed` 전에 작성자가 논리 삭제할 수 있도록 지원합니다.
- 논리 삭제는 행을 지우지 않고 삭제 표시하며, `COMMENT_DELETED`를 만듭니다.

### Note

- 내부 업무 기록이며, 먼저 해당 티켓을 조회할 권한이 있어야 합니다.
- 현재 권한 판단 대상 사용자가 Admin이면 요청자여도 허용합니다. 그 외 요청자는
  담당자·참여자를 겸해도 제외합니다. 요청자가 아닌 현재·과거 담당자 또는
  현재 Category의 승인·배정 규칙에 따라 참여 자격을 갖춘 사용자는 허용합니다.
- impersonation 중 원래 사용자의 Admin 권한을 합산하거나 티켓 조회 권한을 우회하지 않습니다.
- 목록·상세 읽기 권한은 상태와 독립적이며, 생성은 `Draft`와 `Closed`에서 차단합니다.
- `NOTE_CREATED`를 만듭니다.
- 논리 삭제에는 작성자, 현재 NOTE 접근 권한, `Draft`도 `Closed`도 아닌 상태라는 조건이 모두 필요합니다.
- 논리 삭제는 `NOTE_DELETED`를 만듭니다.

History union에는 수정 이벤트가 예약되어 있지만, 현재 API는 댓글·노트 수정을 제공하지 않습니다.

---

## Operational Actions

업무 처리 액션은 티켓 상태나 담당자 결정 결과를 변경할 수 있는 명령입니다.

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

일반 업무 흐름에서는 기록한 업무 처리 액션을 수정하지 않습니다.
잘못된 처리를 바로잡으려면 기존 액션 행을 편집하지 않고 새로운 명령을 실행해야 합니다.

---

## Command Result

액션 명령은 다음 결과를 만들 수 있습니다.

- 액션 행
- 티켓 상태 변경
- 하나 이상의 이력 행
- 진행 중인 작업 시간 기록 종료 등의 관련 처리

예:

```txt
APPROVE action
-> insert action row
-> create APPROVAL_APPROVED history
-> maybe create APPROVAL_REQUESTED
-> or create ASSIGNMENT_RESOLVED and move to Assigned
```

---

## Action과 History의 관계

변경 과정을 추적할 때 기준으로 삼는 데이터는 Action이 아니라 History입니다.

`actionNo`는 해당하는 경우 이력을 원인이 된 액션과 연결합니다.

시스템 작업은 `actionNo = null`인 이력을 만들 수 있습니다. 작업 시간 기록으로
상태를 변경할 때도 티켓 액션 행 없이 상태 이력을 만들 수 있습니다.

---

## Timeline UI

티켓 타임라인은 두 목록을 모두 보여줄 수 있습니다.

- 의사소통 내용과 명령 실행 사유를 보여주는 액션 목록
- 수정하지 않는 변경 전후 이벤트를 보여주는 이력 목록

UI는 모든 이력 레코드에 대응하는 액션이 있는 것처럼 보여주면 안 됩니다.
모든 액션을 상태 변경으로 취급해서도 안 됩니다.

---

## Attachment Relationship

액션 폼은 해당 액션이 지원하는 경우 첨부를 포함할 수 있습니다.

승인 액션은 파일이나 본문에 삽입한 이미지를 허용하지 않습니다.

액션 첨부 요청은 준비를 마친 안전한 값을 사용해야 합니다. 액션 요청 검증은
blob URL과 data URL을 거부합니다.

관련 문서: [Ticket Attachment Design](../../../04-client-engineering/forms/ticket-attachment.md)

---

## 관련 문서

- [Action Strategy](./strategy/action-strategy.md)
- [Ticket History](./ticket-history.md)
- [Ticket Operation Rules](reference/ticket-operation-rules.md)
- [Ticket Lifecycle](./ticket-lifecycle.md)

---

## 요약

Ticket Action은 사용자 타임라인을 구성하는 독립된 모델로 명령과 의사소통을 기록합니다.
Ticket History는 수정하지 않는 감사 이벤트를 기록합니다. 둘을 분리하면 UI가 사용자의
행위를 설명하면서도 발생한 이벤트와 변경 내용을 정확하게 추적할 수 있습니다.
