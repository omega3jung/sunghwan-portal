# 티켓 Lifecycle

## 목표

티켓 생명주기는 저장된 상태값과 상태를 변경하는 명령을 정의합니다.

이 문서는 상태와 상태 전이를 정리한 참조 문서입니다. 작업별 권한의 상세 조건은
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

`Open`, `Approved`, `Reopen`은 티켓에 저장하는 상태값이 아닙니다.

- `Open`은 화면의 묶음 표시나 검색 개념으로만 사용할 수 있습니다.
- 승인 완료는 `APPROVAL_APPROVED` 이력으로 기록합니다.
- Reopen은 액션입니다. 현재 결과는 `Resolved -> Working`입니다.

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

승인, 작업 거부, 재제출, 통합, 취소, 자동 종료는 이 기본 흐름에 조건별 분기를 추가합니다.

---

## State Definitions

### Draft

- 요청자가 티켓을 준비 중입니다.
- REMOTE 초안은 티켓 테이블의 `status = Draft`인 일반 행입니다.
- 업무용 티켓 목록이나 분석 화면에 포함되지 않습니다.
- 최종 제출은 같은 행을 재사용하고 `Approval` 또는 `Assigned`로 이동시킵니다.

### Approval

- 제출된 티켓이 승인을 기다립니다.
- `approvalStepId != null`
- `assigneeUsernames`는 현재 승인자를 의미합니다.
- 승인하면 다음 승인 단계로 진행하거나 작업자 배정으로 이동할 수 있습니다.
- 승인 거절은 `Declined`로 이동시킵니다.

### Declined

- 승인이 거절되었습니다.
- 승인자 결정 흐름은 종료됩니다.
- `approvalStepId = null`
- `assigneeUsernames = []`
- 요청자는 최초 승인자·작업자 결정을 거쳐 재제출할 수 있습니다.

### Assigned

- 작업 담당자가 결정되었습니다.
- 작업은 아직 시작되지 않았습니다.
- `approvalStepId = null`
- `assigneeUsernames`는 현재 작업자를 의미합니다.
- 별도의 `start-work` 명령이 `Working`으로 이동시킵니다.
- 작업 시간 기록 제출도 지원하는 작업 상태 전이를 적용할 수 있습니다.

### Working

- 티켓의 작업이 진행 중입니다.
- 현재 작업 담당자가 작업 수행을 맡습니다.
- 작업 시간 기록은 기록된 시간을 추가할 수 있습니다.
- 작업 시간 기록 처리로 `Pending` 또는 `Resolved`로 이동할 수 있습니다.

### Pending

- 작업이 일시 중단되었거나 대기 중입니다.
- 현재 작업 담당자가 계속 티켓을 맡습니다.
- 담당자 배정으로 `Working` 상태의 작업을 재개할 수 있습니다.
- 작업 시간 기록 처리로 `Working` 또는 `Resolved`로 이동할 수 있습니다.

### Rejected

- 작업 담당자 또는 Admin이 작업 수행을 거부했습니다.
- 요청자는 최초 승인자·작업자 결정을 거쳐 재제출할 수 있습니다.
- 지원되는 경우 진행 중인 작업 시간 기록을 종료합니다.

### Resolved

- 작업 결과가 완료되었습니다.
- 요청자 또는 Admin은 티켓을 재개해 `Working`으로 이동시킬 수 있습니다.
- 해결 이력 시각을 기준으로 유예 기간이 지나면 시스템 자동 종료로 `Closed`로 이동할 수 있습니다.

### Closed

- 일반 업무 흐름의 최종 상태입니다.
- 통합, 취소, 자동 종료가 이 상태를 만듭니다.
- 문서화된 Admin 예외를 제외하고 일반 업무 처리 액션은 차단합니다.

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

최초 제출과 재제출은 같은 승인자·작업자 결정 흐름을 사용합니다.

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

승인 처리에서는 먼저 다음 승인 단계를 확인합니다. 다음 단계가 없으면 배정 규칙으로
작업 담당자를 결정하고 티켓을 `Assigned`로 이동시킵니다.

승인 거절은 승인자 결정 흐름을 종료합니다.

```txt
status = Declined
approvalStepId = null
assigneeUsernames = []
```

---

## Requester Update

현재 티켓의 요청자는 `Approval`과 `Assigned` 상태에서 티켓을 수정할 수 있습니다.

다음 항목만 변경하면 상태, 승인 단계, 담당자를 유지합니다.

- 기한
- 이메일 수신자

다음 항목을 변경하면 승인자·작업자 결정을 처음부터 다시 실행합니다.

- 카테고리
- 제목
- 본문
- 첨부파일
- 이미지

이력에는 결과를 `ROUTING_PRESERVED` 또는 `ROUTING_RESET`으로 기록합니다.

카테고리가 변경되면 기본 우선순위, 기본 위험도, 최소 기한을 새 카테고리 기준으로
다시 평가합니다. 다음 기한은 현재 기한, 제출한 기한, 새 카테고리의 최소 기한 중
가장 늦은 값이므로, 카테고리 변경으로 기한을 더 이른
날짜로 당기지 않습니다.

---

## Work Session and Status

Start Work와 Work Session은 책임이 다릅니다. 작업 시작 명령은 `Assigned -> Working`으로
상태를 변경해 작업 수행을 시작합니다. Work Session은 Ticket Action과 별도로 작업 시간을
기록하며, 지원하는 작업 상태 전이를 적용할 수 있습니다.

현재 작업 시간 기록이 지원하는 상태 전이:

```txt
Assigned -> Working
Working -> Pending | Resolved
Pending -> Working | Resolved
```

타이머 정지는 현재 별도 API 경로로 제공하지 않으며, 티켓을 자동으로 해결 상태로
변경하지 않습니다. GET 요청은 작업을 시작하거나 상태를 변경하면 안 됩니다.

---

## Auto Close

REMOTE에서는 DB의 Supabase Cron(`0 * * * *`)이 매시간 정각에
`service_desk.close_expired_resolved_tickets()`를 직접 호출합니다. 함수는 가장 최근
해결 이력 시각부터 168시간이 지났고 현재도 `Resolved`인 티켓을 종료합니다.
자동 종료는 다음 값으로 기록하는 시스템 작업입니다.

- source: `SYSTEM_AUTO`
- event: `RESOLUTION_CLOSE`
- from: `Resolved`
- to: `Closed`
- close reason: `Completed`
- grace window: 가장 최근 해결 이력 시각부터 경과한 168시간
- action link: `actionNo = null`
- 지원되는 경우 진행 중인 작업 시간 기록을 종료합니다.

일반 수정 시각인 `updatedAt`이나 달력 날짜 차이 대신 가장 최근 해결 이력을
사용합니다. 티켓을 재개한 뒤 다시 해결하면 새로운 유예 기간이 시작됩니다.

정상 실행 시 다음 검사까지의 대기 시간은 대략 한 시간 미만입니다. 조건을 충족해도
즉시 종료되는 것은 아닙니다. 실행 시 필요한 잠금을 획득하고 티켓을 재검증해야 합니다.
누락된 실행이나 잠긴 티켓은 이후 시간별 실행에서 처리할 수 있습니다. REMOTE 종료와 예약 호출은
검증되었으며, 근거는
[스케줄링 결정](../../../06-decisions/2026-09-resolved-auto-close-scheduling.md)에 기록합니다.

---

## Forbidden Shortcuts

현재 생명주기에서는 명령 없이 암묵적으로 상태를 변경하지 않습니다.

예:

- 티켓 상세 조회만으로 작업을 시작하면 안 됩니다.
- `Draft`는 바로 `Working`으로 이동하면 안 됩니다.
- 승인 완료는 `Approved` 상태를 만들면 안 됩니다.
- 티켓 재개는 `Reopen` 상태를 만들면 안 됩니다.
- 작업 시간 기록 GET은 상태를 변경하면 안 됩니다.
- 첨부 준비만으로 이력을 만들면 안 됩니다.

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

현재 생명주기는 명령에 따라 상태를 변경하며, 저장된 상태값은 현재 처리 단계를
나타냅니다. 승인·작업 담당자는 `approvalStepId`와 `assigneeUsernames`에서
결정합니다. 모든 상태 전이는 명시적인 명령, 업무 규칙 또는 시스템 작업에 따라야 합니다.
