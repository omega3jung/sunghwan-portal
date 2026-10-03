# 티켓 Operation Rules

## 목표

이 문서는 Service Desk 티켓 작업을 구현할 때 확인하는 규칙 표입니다.

실행 가능한 사용자와 상태, 입력값, 티켓 변경 결과, 생성할 이력 이벤트를 기록합니다.

상태의 개념적 의미는 [Ticket Lifecycle](../ticket-lifecycle.md)에
문서화되어 있습니다.

---

## 현재 Operation Surface

### Ticket Routes

```txt
GET    /api/service-desk/tickets
POST   /api/service-desk/tickets
GET    /api/service-desk/tickets/search
GET    /api/service-desk/tickets/:ticketId
PUT    /api/service-desk/tickets/:ticketId
```

제출된 티켓은 `POST /api/service-desk/tickets/:ticketId/command/cancel`로
취소합니다. 일반 티켓 삭제는 LOCAL과 REMOTE 모두 지원하지 않습니다.
관리자, 담당자, 승인자가 기존 조회 권한 안에서 티켓과 이력을 계속 추적할 수
있도록 초기의 작성자 삭제 설계를 `CANCEL`로 대체했습니다. 취소 시에는
`tk_active = false`로 숨기지 않고 티켓을 활성 상태로 보존합니다.

### Draft Routes

```txt
GET    /api/service-desk/tickets/draft
POST   /api/service-desk/tickets/draft
PUT    /api/service-desk/tickets/draft/:ticketId
DELETE /api/service-desk/tickets/draft/:ticketId
```

초안 폐기는 아직 제출하지 않은 작업을 버리는 별도 동작입니다. REMOTE는
초안 API를, LOCAL 초안 복구는 기능별 브라우저 저장소 repository를 사용합니다.
이 동작은 제출된 티켓의 삭제를 허용하지 않으며, 기존 `COMMENT`와 `NOTE`의
논리 삭제 규칙에도 영향을 주지 않습니다.

### Command Routes

```txt
POST /api/service-desk/tickets/:ticketId/command/start-work
POST /api/service-desk/tickets/:ticketId/command/:action
```

`:action`은 다음 중 하나입니다.

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

### Subresource Routes

```txt
GET   /api/service-desk/tickets/:ticketId/actions
GET   /api/service-desk/tickets/:ticketId/actions/:actionNo
PATCH /api/service-desk/tickets/:ticketId/actions/:actionNo

GET   /api/service-desk/tickets/:ticketId/histories

GET   /api/service-desk/tickets/:ticketId/work-session
POST  /api/service-desk/tickets/:ticketId/work-session
```

---

## 공통 Command Pipeline

```txt
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

업무 처리 액션 생성, 티켓 변경, 이력 생성은 하나의 처리 단위로 취급해야 합니다.
REMOTE는 서버 서비스와 트랜잭션을 사용합니다. LOCAL은 같은 DTO 응답 형식을
유지하는 데모용 로컬 핸들러를 사용합니다.

---

## Requester Update

- who: 요청자
- allowed status: `Approval`, `Assigned`
- input: 카테고리, 제목, 본문, 기한, 이메일 수신자, 준비된 첨부파일·이미지
- validation:
  - 실행자가 해당 티켓의 요청자입니다.
  - 카테고리가 활성 상태이고 사용할 수 있습니다.
  - 첨부 정보는 이미 준비를 마쳤습니다.
  - 이전 값과 새 값을 정규화한 뒤 비교합니다.
- ticket effect:
  - 담당자 결정에 영향을 주지 않는 변경은 상태, 승인 단계, 담당자를 유지합니다.
  - 담당자 결정에 영향을 주는 변경은 첫 승인 단계부터 담당자를 다시 결정합니다.
  - 카테고리 변경은 새 카테고리 기본값에서 우선순위와 위험도를 다시 계산할 수 있습니다.
  - 카테고리 변경은 새 기본 SLA에서 최소 기한을 다시 평가하고,
    현재 기한, 제출한 기한, 새 최소 기한 중 가장 늦은 값을 유지합니다.
- action persistence: ticket action row 없음
- history event: `ROUTING_PRESERVED` or `ROUTING_RESET`
- notification boundary: 현재 문서에서는 별도 알림 발생 원인으로 취급하지 않습니다.
- query invalidation: ticket detail, ticket list/search, history

담당자 결정에 영향을 주지 않는 필드:

- 기한
- 이메일 수신자

담당자를 다시 결정하는 필드:

- 카테고리
- 제목
- 본문
- 첨부파일
- 이미지

---

## Submit Ticket

- who: requester
- allowed status:
  - 초안 없는 신규 생성
  - 기존 `Draft`
- input: 준비된 본문·첨부파일·이미지를 포함한 티켓 폼 값
- validation:
  - 카테고리가 유효합니다.
  - 첨부 정보가 준비되어 있습니다.
  - 승인자 또는 작업 담당자를 최소 한 명 결정할 수 있습니다.
- ticket effect:
  - 다음 승인 단계가 있으면 `Approval`
  - 없으면 `Assigned`
  - 기존 초안 행이 있으면 재사용합니다.
- action persistence: ticket action row 없음
- history event:
  - `TICKET_SUBMITTED`
  - `APPROVAL_REQUESTED` or `ASSIGNMENT_RESOLVED`
- query invalidation: draft, ticket list/search/detail, history

---

## Start Work

- who: 현재 작업 담당자
- allowed status: `Assigned`
- input: 요청 본문 없음
- validation:
  - `approvalStepId = null`
  - 실행자가 현재 작업 담당자 목록에 포함됩니다.
- ticket effect: `Assigned -> Working`
- action persistence: ticket action row 없음
- history event: `STATUS_UPDATED`
- query invalidation: ticket detail/list/search, history

GET·조회 요청은 작업을 시작하면 안 됩니다.

---

## Comment

- who: 티켓 접근 권한이 있는 사용자
- allowed status: 모든 진행 중인 상태(`Draft`, `Closed` 제외)
- input: content, 지원하는 경우 준비된 액션 첨부
- validation:
  - content 필수
  - 액션 경로와 요청 타입이 일치해야 합니다.
  - 첨부 요청은 `blob:` 또는 `data:` URL을 포함할 수 없습니다.
- ticket effect: 없음
- action persistence: `COMMENT`
- history event: `COMMENT_CREATED`
- notification boundary: 공유 의사소통은 명령 처리 밖에서 알림을 보낼 수 있습니다.
- query invalidation: action list, history, ticket recent activity

Soft delete:

- who: action writer
- disallowed status: `Draft`, `Closed`
- action type: `COMMENT` only
- history event: `COMMENT_DELETED`

현재 API는 댓글 수정 경로를 제공하지 않지만 History union은
`COMMENT_UPDATED`를 예약합니다.

종료 전에 생성된 댓글은 `Closed` 이후에도 계속 표시합니다. 기존 타임라인을 볼 수
있다는 뜻이며, 종료된 티켓에 새 댓글을 만들 권한을 부여하지 않습니다.

---

## Note

- who: 티켓 조회 권한이 있고 현재 권한 판단 대상 사용자가 Admin이면 요청자여도 허용합니다.
  그 외에는 요청자가 아닌 현재·과거 담당자 또는 현재 Category의 승인·배정 규칙에 따라 참여 자격을 갖춘 사용자입니다.
- allowed status: 모든 진행 중인 상태(`Draft`, `Closed` 제외)
- input: content, 지원하는 경우 준비된 액션 첨부
- validation: content 필수
- ticket effect: 없음
- action persistence: `NOTE`
- history event: `NOTE_CREATED`
- notification boundary: 내부 노트이며 기본적으로 외부 알림 없음
- query invalidation: action list, history, ticket recent activity

Soft delete:

- who: 현재 NOTE 접근 권한을 유지한 액션 작성자
- disallowed status: `Draft`, `Closed`
- action type: `NOTE` only
- history event: `NOTE_DELETED`

현재 API는 노트 수정 경로를 제공하지 않지만 History union은
`NOTE_UPDATED`를 예약합니다.

목록·상세와 NOTE 관련 이력에도 같은 정책을 적용하며, 논리 삭제된 NOTE의 연결 이력도
포함합니다. Closed라는 이유만으로 기존 NOTE 읽기를 차단하지 않습니다.
참여 관계는 `Requester > CurrentAssignee > PreviousAssignee > null` 우선순위와
독립적인 승인·배정 플래그로 표현합니다. 관계의 우선순위는 변경하지 않습니다.
NOTE 권한은 현재 사용자 Admin 예외, 요청자 제외, 업무 참여 관계 순으로 판단합니다.
Admin이 아닌 요청자는 담당자·참여자를 겸해도 제외합니다. Admin도 티켓 조회 권한을
우회하지 않으며, impersonation 중 원래 사용자의 Admin 권한을 합산하지 않습니다.
과거 관계는 이력의 실행자가 아니라 저장된 담당자 스냅샷으로 판단합니다. 승인은
건너뛴 단계를 포함한 상위 Category의 모든 단계를 확인합니다. 배정은 현재 규칙을
사용하며 자체 규칙이 없을 때만 상위 규칙을 사용합니다. Category 비활성화만으로
참여 관계를 제거하지 않지만 현재 설정 변경은 반영합니다. Tenant·Company·Employee
자격 조건은 유지합니다. REMOTE는 `service_desk.get_ticket_participation`을 사용합니다.
LOCAL은 MANAGER의 요청자 Job Field 계층 해석을 포함한 기존 후보 결정 함수를 사용합니다.
UI 권한 표시는 계산한 응답 값이며, 서버 권한 검사의 근거로 받지 않습니다.

애플리케이션의 참여 정보에서 `isAdmin`은 SQL이나 브라우저 입력 대신 현재 권한 판단
대상 사용자의 기준 역할 값에서 결합합니다. Action·History와 티켓 상세 캐시는
실행 모드와 현재 사용자 username별로 구분합니다. Action·History 쿼리는 impersonation
전환 중 이전 사용자의 응답을 유지하지 않습니다. 공유 티켓 요약의 마지막 댓글은
COMMENT에서, 마지막 사용자 활동은 NOTE가 아닌 액션에서 계산해 NOTE 작성 시각과
작성자 이메일을 제외합니다. 권한이 확인된 NOTE 활동은 필터링한 Action·History API에서 제공합니다.

---

## Approve

- who: 현재 승인자 또는 Admin
- allowed status: `Approval`
- input: 본문만; 승인 액션은 파일과 본문에 삽입한 이미지를 거부합니다.
- validation:
  - `approvalStepId != null`
  - Admin이 아니면 실행자가 현재 승인자여야 합니다.
  - content 필수
  - Category 비활성화만으로 진행 중인 승인을 무효화하지 않습니다. 다만 참조한
    승인·배정 설정으로 담당자를 계속 결정할 수 있어야 합니다.
- ticket effect:
  - 다음 승인 단계가 있으면 `Approval` 유지, 다음 승인자로 이동
  - 다음 승인 단계가 없으면 `Assigned`로 이동하고 작업자 결정
- action persistence: `APPROVE`
- history event:
  - `APPROVAL_APPROVED`
  - `APPROVAL_REQUESTED` or `ASSIGNMENT_RESOLVED`
- query invalidation: ticket detail/list/search, actions, history

---

## Decline

- who: 현재 승인자 또는 Admin
- allowed status: `Approval`
- input: 본문만; 승인 액션은 파일과 본문에 삽입한 이미지를 거부합니다.
- validation:
  - `approvalStepId != null`
  - Admin이 아니면 실행자가 현재 승인자여야 합니다.
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
  - 작업자 배정의 현재 작업 담당자
  - 승인자 또는 작업자 배정 예외를 적용하는 Admin
- allowed status:
  - standard: `Assigned`, `Working`, `Pending`
  - Admin approval override: `Approval`
- input: content, 담당자 username 목록
- validation:
  - content 필수
  - 담당자 목록 필수
  - Admin이 아닌 실행자는 현재 작업 담당자여야 합니다.
- ticket effect:
  - 현재 담당자 username 목록 교체
  - `Pending -> Working`
  - mode가 상태 변경을 결정하지 않는 한 `Assigned`, `Working`, `Approval`은 상태 유지
- action persistence: `ASSIGN`
- history event: `ASSIGNMENT_UPDATED`
- query invalidation: ticket detail/list/search, actions, history

담당자 정보에서 구한 이메일은 저장된 `tk_email`에 쓰면 안 됩니다.

현재 제한: 수동 `ASSIGN`은 제출한 username을 Category·단계별 후보 자격이나 저장된
배정 규칙으로 다시 검증하지 않습니다. 실행자·상태 검사와 비어 있지 않은 목록
검증만으로 후보 자격까지 보장하지 않습니다. 카테고리 기반 담당자 결정 검증과 별개입니다.

---

## Assign Self

- who: 현재 작업 담당자
- allowed status: `Assigned`, `Working`, `Pending`
- input: 자동 생성한 content
- validation:
  - 실행자가 이미 현재 작업자 중 하나입니다.
  - 현재 작업 담당자 목록이 최소 두 명입니다.
- ticket effect:
  - 현재 담당자를 실행자 한 명으로 교체
  - 상태 유지
- action persistence: `ASSIGN_SELF`
- history event: `ASSIGNMENT_UPDATED`
- query invalidation: ticket detail/list/search, actions, history

---

## Adjust

- who:
  - 현재 작업 담당자
  - Admin
- allowed status:
  - standard: `Assigned`, `Working`, `Pending`
  - Admin correction: `Approval`, `Assigned`, `Working`, `Pending`,
    `Resolved`, `Closed`
- input: content, 우선순위, 위험도, 기한
- validation:
  - content 필수
  - 최소 하나의 계획 필드가 변경되어야 합니다.
  - 해결·종료 상태에서 Admin이 정정할 때는 기한을 변경할 수 없습니다.
- ticket effect:
  - 허용되는 경우 우선순위, 위험도, 기한 갱신
- action persistence: `ADJUST`
- history event: `PLANNING_UPDATED`
- query invalidation: ticket detail/list/search, actions, history

---

## Reject

- who: 현재 작업 담당자 또는 Admin
- allowed status: `Assigned`, `Working`, `Pending`
- input: content
- validation:
  - content 필수
  - Admin이 아니면 실행자가 작업 담당자여야 합니다.
- ticket effect:
  - status -> `Rejected`
  - 지원되는 경우 진행 중인 작업 시간 기록 종료
- action persistence: `REJECT`
- history event: `TICKET_REJECTED`
- query invalidation: ticket detail/list/search, actions, history, work sessions

---

## Resubmit

- who: 요청자
- allowed status: `Declined`, `Rejected`
- input: content
- validation:
  - 실행자가 요청자입니다.
  - 최초 담당자 결정에서 승인자 또는 작업자를 결정할 수 있습니다.
- ticket effect:
  - 최초 담당자 결정 재실행
  - 다음 승인 단계가 있으면 `Approval`
  - 승인 단계가 없으면 `Assigned`
- action persistence: `RESUBMIT`
- history event:
  - `TICKET_SUBMITTED`
  - `APPROVAL_REQUESTED` or `ASSIGNMENT_RESOLVED`
- query invalidation: ticket detail/list/search, actions, history

---

## Reopen

- who: 요청자 또는 Admin
- allowed status: `Resolved`
- input: content
- validation:
  - content 필수
  - 기존 작업 담당자 필수
- ticket effect:
  - `Resolved -> Working`
  - 담당자 유지
- action persistence: `REOPEN`
- history type: `STATUS`
- history source: `USER_ACTION`
- history event: `TICKET_REOPENED`
- history from/to: `{ status: "Resolved" } -> { status: "Working" }`
- query invalidation: ticket detail/list/search, actions, history

---

## Merge

- who:
  - 일반 통합의 현재 작업 담당자
  - 예외를 적용하는 Admin
- allowed status:
  - standard: `Assigned`, `Working`, `Pending`, `Resolved`
  - Admin override: `Approval`, `Declined`, `Assigned`, `Working`, `Pending`,
    `Rejected`, `Resolved`, `Closed`
- input: content, 대상 티켓 ID
- validation:
  - 대상 티켓 필수
  - 자기 자신과의 통합 금지
  - 원본 또는 대상이 초안이면 금지
  - 원본 또는 대상이 이미 통합되었으면 금지
  - 원본과 대상은 저장된 카테고리 기준으로 동일 Tenant에 속해야 합니다.
  - 같은 scope 간 통합은 허용합니다.
  - 다른 scope 간 통합은 `INTERNAL -> PORTAL`만 허용합니다.
  - `PORTAL -> INTERNAL` 및 다른 Tenant 간 통합은 금지합니다.
  - 서버는 저장된 티켓·카테고리 정보에서 Tenant와 scope를 결정합니다.
    요청 필드는 권한 판단의 근거로 사용하지 않습니다.
  - 도메인 통합 규칙이 원본·대상의 상태 조합을 허용해야 합니다.
- ticket effect:
  - 원본 티켓 -> `Closed`
  - 같은 scope 통합: `closeReason = Merged`
  - `INTERNAL -> PORTAL`: `closeReason = Escalated`
  - 통합 대상 ID·번호 설정
  - 지원되는 경우 진행 중인 작업 시간 기록 종료
- action persistence: `MERGE`
- history event: `TICKET_MERGED`
- history metadata: close reason, source/target Tenant, source/target scope,
  merged target id/number, operator reason
- content policy: 통합은 티켓 관계만 연결하며, INTERNAL 액션·이력·첨부·본문을
  PORTAL 대상 티켓에 복사하지 않습니다.
- query invalidation: ticket detail/list/search, actions, history, work sessions

---

## Cancel

- route: `POST /api/service-desk/tickets/:ticketId/command/cancel`
- who: 요청자
- allowed status: `Approval`, `Declined`, `Assigned`, `Working`, `Pending`,
  `Rejected`
- input: content
- validation:
  - 실행자가 요청자입니다.
  - content 필수
- ticket effect:
  - status -> `Closed`
  - `closeReason = Canceled`
  - 티켓의 활성 상태와 기존 액션·이력을 보존하여 계속 추적할 수 있게 합니다.
    취소가 추가 조회 권한을 부여하지는 않습니다.
  - 지원되는 경우 진행 중인 작업 시간 기록 종료
- action persistence: `CANCEL`
- history event: `TICKET_CANCELED`
- query invalidation: ticket detail/list/search, actions, history, work sessions

---

## Work Session Submit

별도 start-work 명령 경로는 작업 시간 기록 행을 만들지 않고 `Assigned -> Working`으로
이동할 수 있습니다. 작업 시간 기록 제출은 실제 작업 내역을 기록하고 아래 상태 전이를
적용할 수 있습니다.

- who: 티켓 조회 권한이 있는 현재·과거 작업 담당자
- allowed status: `Assigned`, `Working`, `Pending`
- input:
  - `inputMode = duration | range`
  - `durationMinutes`, 또는 range 모드의 `startAt`과 `endAt`
  - `nextStatus = Working | Pending | Resolved`(선택)
  - 메모
- validation:
  - 실행자는 현재 작업자이거나 저장된 작업자 배정 이력이 있어야 합니다.
  - 서버가 계산한 작업 시간은 양수여야 합니다.
  - 현재 작업 담당자만 상태를 변경할 수 있으며, 과거 작업자는 상태 변경 없이
    작업 내역을 추가할 수 있습니다.
  - 현재 작업 담당자가 `Assigned` 또는 `Pending`에서 제출할 때는 명시적인 상태 전이가 필요합니다.
  - allowed transitions:
    - `Assigned -> Working`
    - `Working -> Pending | Resolved`
    - `Pending -> Working | Resolved`
- ticket effect:
  - 티켓 합계에 기록된 작업 시간 추가
  - `nextStatus`가 바뀌면 상태 갱신
  - 해결 시 지원되는 경우 진행 중인 작업 시간 기록을 종료합니다.
- action persistence: ticket action row 없음
- history event: 상태가 바뀌면 `STATUS_UPDATED`
- query invalidation: ticket detail/list/search, work-session list, history

현재 API는 목록·생성을 지원합니다. 작업 시간 기록 상세·수정·삭제, 타이머 시작·종료·전환용
기능별 클라이언트 메서드는 있지만, 대응하는 API 경로 파일은 현재 없습니다.

---

## Resolved Auto Close

REMOTE에서는 DB의 Supabase Cron(`0 * * * *`)이 매시간 정각에
`service_desk.close_expired_resolved_tickets()`를 직접 호출합니다.

- who: system
- allowed status: `Resolved`
- input: 유지보수 호출; HTTP 엔드포인트는 설정된 cron secret으로 POST와 GET을 허용
- validation:
  - 해결 이력 기준의 유예 기간이 지났습니다.
  - 유예 기간은 일반 티켓 수정 시각인 `updatedAt` 대신 티켓을 해결 상태로 만든 최신 이력에서 측정합니다.
  - 현재 grace 값은 경과 시간 168시간이며, 정확히 도달한 시점부터 대상입니다.
- ticket effect:
  - `Resolved -> Closed`
  - `closeReason = Completed`
  - 지원되는 경우 진행 중인 작업 시간 기록 종료
- action persistence: ticket action row 없음
- history event: `RESOLUTION_CLOSE`
- history source: `SYSTEM_AUTO`
- history action link: `actionNo = null`
- query invalidation: 사용자가 실행한 UI 변경이 아니라 시스템 처리 결과

정상 실행 시 다음 검사까지의 대기 시간은 대략 한 시간 미만입니다. 누락된 실행이나
잠긴 티켓은 여전히 대상 조건을 만족하면 이후 실행에서 처리할 수 있습니다. 이 정책은
조건을 충족한 시각에 정확히 종료됨을 보장하지 않습니다. 함수 배포, 대상 티켓 종료와 예약 호출은 검증되었으며,
근거는 [스케줄링 결정](../../../../06-decisions/2026-09-resolved-auto-close-scheduling.md)에 기록합니다.

---

## 관련 문서

- [Ticket System Overview](../ticket-system-overview.md)
- [Ticket Lifecycle](../ticket-lifecycle.md)
- [Ticket Action Model](../ticket-action.md)
- [Action Strategy](../strategy/action-strategy.md)
- [Ticket History](../ticket-history.md)
- [Ticket Work Session](../ticket-work-session.md)
- [티켓 액션 워크플로 매트릭스](./ticket-action-workflow-matrix.xlsx)
- [직원 참조 범위 매트릭스](./restrict-employee-list.xlsx)

---

## 요약

티켓 작업은 명령으로 실행합니다. 각 작업은 실행자, 허용 상태, 입력 규칙, 티켓 변경
결과, 액션 저장 규칙, 이력 이벤트를 정의합니다. 암묵적인 상태 변경은 허용하지 않습니다.
