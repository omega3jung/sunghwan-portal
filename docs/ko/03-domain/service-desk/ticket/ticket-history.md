# 티켓 History

## 목표

Ticket History는 티켓 업무 흐름의 변경을 감사 이벤트로 기록하며, 저장한 기록은 수정하지 않습니다.

이 문서는 다음 질문에 답합니다.

- 무엇이 일어났는가
- 왜 일어났는가
- 누가 시작했는가
- 무엇이 바뀌었는가
- 어떤 티켓 액션 또는 시스템 규칙에 따라 발생했는가

---

## 핵심 개념

```txt
Action is user-facing timeline intent.
History is immutable event evidence.
```

액션은 하나 이상의 이력 레코드를 만들 수 있으며, 상태를 변경하지 않을 수도 있습니다.
시스템 작업은 티켓 액션 행 없이 이력을 만들 수 있습니다.

---

## 현재 History Shape

```ts
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

발생한 일을 판단하는 기준 필드는 `event`입니다. `metadata.event`를 기준으로 사용하면 안 됩니다.

---

## Type

`type`은 변경의 영향을 받은 도메인 영역을 구분합니다.

```txt
TICKET
STATUS
CATEGORY
ASSIGNMENT
APPROVAL
COMMENT
NOTE
PLANNING
```

`SYSTEM`이라는 이력 유형은 없습니다. 시스템 자동 처리는 `source` 필드로 구분합니다.

---

## Source

`source`는 이력이 어떤 이유나 규칙으로 만들어졌는지 구분합니다.

```txt
USER_ACTION
SYSTEM_AUTO
ROUTING_RULE
APPROVAL_RULE
ASSIGNMENT_RULE
```

예:

- `USER_ACTION`: 승인, 배정, 작업 거부, 댓글 작성 등의 사용자 명령
- `SYSTEM_AUTO`: 해결된 티켓 자동 종료 등의 Cron·시스템 작업
- `ROUTING_RULE`: 요청자 수정 시 담당자 결정 결과 유지·초기화
- `APPROVAL_RULE`: 승인 단계 결정
- `ASSIGNMENT_RULE`: 작업 담당자 결정

---

## Event

현재 event union:

```txt
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

실제 union 이름을 사용합니다. `ASSIGNMENT_CHANGED` 같은 별칭을 만들면 안 됩니다.

현재 API에서는 union의 일부만 사용하며, 나머지 이벤트는 모델에 예약되어 있습니다.
예를 들어 댓글·노트 논리 삭제 경로는 있지만 수정 경로는 없습니다.

---

## Actor

`actorUsername`은 작업을 시작한 사용자입니다.

- 사용자 명령은 현재 직원의 username을 사용합니다.
- 시스템 자동 처리는 `null`을 사용합니다.
- 이력은 `actionNo`를 통해 티켓 액션과 연결될 수 있습니다.

---

## Action Link

액션 행에서 이벤트가 발생한 경우 `actionNo`는 이력 레코드를 원인이 된 티켓 액션과 연결합니다.

예:

- comment action -> `COMMENT_CREATED`
- approve action -> `APPROVAL_APPROVED`, 이후 `APPROVAL_REQUESTED` 또는
  `ASSIGNMENT_RESOLVED`
- resubmit action -> `TICKET_SUBMITTED`, 이후 routing history

`RESOLUTION_CLOSE` 같은 시스템 이벤트는 `actionNo = null`입니다.

---

## From and To Values

`fromValue`와 `toValue`는 구조화된 JSON 값입니다.

일관된 형식으로 표시할 수 있도록 변경 전후 값을 기록해야 합니다.

예:

```json
{
  "fromValue": { "status": "Resolved" },
  "toValue": { "status": "Working" }
}
```

첨부 비교에는 원본 파일 데이터, blob URL, base64 데이터 대신 개수와 이름 등의 요약 정보를 저장해야 합니다.

---

## Metadata

`metadata`는 화면 표시와 변경 추적을 돕는 보조 정보입니다.

포함할 수 있는 값:

- 변경한 필드
- 변경 전후 상태
- 변경 전후 승인 단계
- 변경 전후 담당자 username
- 종료 사유
- 해결 후 유예 일수
- 액션별 표시 정보

저장용 메타데이터와 클라이언트 표시용 메타데이터는 분리해야 합니다.
클라이언트 DTO에는 허용 목록에 있는 표시용 메타데이터만 제공해야 합니다.

---

## Event Creation Examples

### Ticket Submit

```txt
TICKET_SUBMITTED
-> APPROVAL_REQUESTED or ASSIGNMENT_RESOLVED
```

### Approval

```txt
APPROVAL_APPROVED
-> APPROVAL_REQUESTED when another step exists
-> ASSIGNMENT_RESOLVED when final approval completes
```

### Requester Update

```txt
ROUTING_PRESERVED
or
ROUTING_RESET
```

### Reopen

```txt
type = STATUS
source = USER_ACTION
event = TICKET_REOPENED
fromValue = { status: "Resolved" }
toValue = { status: "Working" }
```

이 상태 전이를 나타내는 기준 이벤트는 `TICKET_REOPENED`입니다.

### Auto Close

```txt
type = STATUS
source = SYSTEM_AUTO
event = RESOLUTION_CLOSE
actionNo = null
fromValue = { status: "Resolved" }
toValue = { status: "Closed", closeReason: "Completed" }
metadata.resolvedGraceDays = 7
```

해결된 티켓은 일반 수정 시각인 `updatedAt` 대신 가장 최근 해결 이력 시각부터
168시간이 지나면 자동 종료 대상이 됩니다. 다시 해결하면 유예 기간도 다시 시작합니다.
`RESOLUTION_CLOSE`는 대상 시각에 도달한 사실이 아니라 실제 종료 성공을 기록합니다.
검증된 REMOTE의 시간별 예약 실행과 `RESOLUTION_CLOSE` / `SYSTEM_AUTO` 이력의 근거는
[스케줄링 결정](../../../06-decisions/2026-09-resolved-auto-close-scheduling.md)을 참고하세요.

---

## History and Ticket Actions

Ticket Action과 Ticket History는 의도적으로 분리되어 있습니다.

| Area | Purpose |
| --- | --- |
| Action | user-facing timeline command or communication |
| History | immutable event/audit record |

업무 처리 액션은 수정하지 않습니다. 의사소통 액션인 `COMMENT`와 `NOTE`는 현재
논리 삭제를 지원하며, `COMMENT_DELETED` 또는 `NOTE_DELETED`를 만듭니다.

---

NOTE 이력은 티켓 조회 권한을 검사한 뒤 NOTE 액션과 같은 접근 정책을 적용합니다.
권한이 없는 조회자에게는 NOTE 이벤트·유형과 NOTE 액션에 연결된 이력을 제공하지
않습니다. 논리 삭제된 액션에 연결된 이력도 제외합니다. 조회 응답을 계산할 때 필터링하며,
저장된 이력과 COMMENT 이력은 변경하지 않습니다.

---

## History and Work Sessions

현재 작업 시간 기록 생성은 티켓 상태를 변경할 때 `STATUS_UPDATED`를 만들 수 있습니다.

History union은 작업 시간 기록 전용 이벤트를 포함하지만, 현재 API는 별도의
타이머 시작·정지·전환 경로를 제공하지 않습니다. 타이머 정지가 티켓을 해결 상태로
변경한다고 설명하면 안 됩니다.

---

## Forbidden Patterns

현재 이력을 다음처럼 모델링하면 안 됩니다.

- 이벤트 판단 기준으로 `tkh_history_action` 사용
- 이벤트 판단 기준으로 `metadata.event` 사용
- 이력 유형으로 `SYSTEM` 사용
- JSON으로 표현할 수 있는데도 구조 없는 변경 전후 문자열 사용
- 이력 메타데이터에 원본 파일·blob·base64 데이터 저장

---

## 관련 문서

- [Ticket System Overview](./ticket-system-overview.md)
- [Ticket Lifecycle](./ticket-lifecycle.md)
- [Ticket Action Model](./ticket-action.md)
- [Action Strategy](./strategy/action-strategy.md)
- [Ticket Operation Rules](reference/ticket-operation-rules.md)

---

## 요약

Ticket History는 `type`, `source`, `event`로 구성하며, 기록한 이벤트는 수정하지 않습니다.
티켓 명령, 담당자 결정, 시스템 자동 처리, 작업 진행의 변경 이력을 보존합니다.
이를 별도로 관리해 티켓 액션이나 클라이언트 메타데이터에 모든 추적 정보를 담지 않습니다.
