# Action Strategy

## 목표

이 문서는 현재 Ticket Action 명령을 검증하고 실행하는 방식을 정의합니다.

서버는 티켓 액션을 실행할 때 상태, 권한, 입력값, 티켓 변경 결과와 이력을 검증합니다.
각 액션을 단순 데이터 저장 요청 대신 업무 명령으로 처리합니다.

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

API 경로에서 사용하는 액션 이름은 다음과 같습니다.

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

start-work 명령은 Ticket Action union에 포함하지 않고 별도 명령 경로로 구현합니다.

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

승인 명령은 같은 명령 경로를 사용하지만 더 엄격하게 입력을 검증합니다.
본문만 허용하며, 파일이나 본문에 삽입한 이미지는 허용하지 않습니다.

---

## Permission and Status Guards

각 액션은 실행 가능한 상태와 담당자·요청자 조건을 검사합니다.

예:

- 승인자 또는 Admin은 `Approval`에서 `APPROVE`/`DECLINE`할 수 있습니다.
- 현재 작업 담당자 또는 Admin은 상태가 허용하는 곳에서 `ASSIGN`, `ADJUST`,
  `REJECT`, `MERGE`할 수 있습니다.
- 요청자는 상태가 허용하는 곳에서 `RESUBMIT`, `REOPEN`, `CANCEL`할 수 있습니다.
- Admin은 일부 배정·계획 조정·통합·작업 거부 경로에서 일반 사용자 제한을 우회할 수 있습니다.

상세 조건 표는 [Ticket Operation Rules](../reference/ticket-operation-rules.md)에
있습니다.

---

## Transaction Boundary

REMOTE 명령 실행은 액션 행 저장, 티켓 변경, 이력 행 저장을 하나의 처리 단위로 묶습니다.

업무 처리 액션의 결과 중 일부만 저장되는 것을 막기 위한 구조입니다.

```txt
action row
+ ticket mutation
+ history rows
= one command result
```

LOCAL 명령 실행은 데모용 상태를 변경해 같은 기대 동작을 재현합니다.

---

## Action-Specific Inputs

공통 입력:

- `content`
- 지원하는 승인 외 액션의 준비된 첨부파일·이미지(선택)

액션별 입력:

- `ASSIGN`: `assigneeUsernames`
- `ADJUST`: `priority`, `riskLevel`, `dueAt`
- `MERGE`: `targetTicketId`
- `APPROVE`/`DECLINE`: 본문만

모든 액션에는 content가 필요합니다. 다만 UI가 `ASSIGN_SELF`용 content를 생성할 수 있습니다.

`MERGE`는 기존 `INTERNAL` 티켓을 기존 `PORTAL` 티켓으로 제어된 방식으로
인계하는 경우도 포함합니다. 이 동작은 target 티켓을 새로 생성하지 않습니다. 서버는
동일 Tenant 안에서 같은 scope 간 merge와 단방향 `INTERNAL -> PORTAL` 전환을
허용합니다. 후자의 경우에도 `MERGE` action과 `TICKET_MERGED` event를 유지하지만,
source 티켓은 `closeReason = Escalated`로 닫습니다. 반대 방향의 scope 전환과
cross-Tenant merge는 거부합니다.

---

## Mutability Policy

### Communication Actions

`COMMENT`는 요청자와 공유하는 기록이고 `NOTE`는 내부 업무 기록입니다.
NOTE에 접근하려면 먼저 티켓 조회 권한이 있어야 합니다. 현재 권한 판단 대상 사용자가
Admin이면 요청자여도 허용합니다. 그 외 요청자는 담당자·참여자를 겸해도 제외하고,
요청자가 아닌 업무 참여자는 허용합니다. Impersonation 중 원래 사용자의 Admin 권한을
합산하지 않습니다. 조회와 작성자만 가능한 논리 삭제에도 같은 접근 정책을 적용하며,
COMMENT 권한 조건은 변경하지 않습니다.

기존 댓글은 티켓이 `Closed`가 된 뒤에도 계속 표시합니다. 기존 기록을 볼 권한과
종료 이후 새 기록을 만들 권한은 다릅니다. 새 의사소통 기록은 종료된 티켓의 업무 규칙을 따릅니다.

현재 API는 티켓이 `Draft`나 `Closed`가 아닐 때 원래 작성자의 논리 삭제를 지원합니다.

### Operational Actions

기록한 업무 처리 액션은 수정하지 않습니다.

예:

- `ASSIGN`
- `ADJUST`
- `REJECT`
- `MERGE`
- `REOPEN`
- `RESUBMIT`
- `CANCEL`
- 승인 액션

업무 처리 결정을 바로잡아야 하면 새로운 명령을 실행합니다.

---

## Action Without Ticket Mutation

`COMMENT`와 `NOTE`는 상태 변경 없이 액션 행과 이력을 저장합니다.

start-work 명령은 Ticket Action 행을 저장하지 않고 `Assigned -> Working`으로
티켓 상태를 변경하며, `STATUS_UPDATED` 이력을 기록합니다.

일부 시스템 작업은 액션 행 없이 이력을 만들 수 있습니다. 예를 들어 해결된 티켓의
자동 종료는 출처 `SYSTEM_AUTO`, `actionNo = null`로 `RESOLUTION_CLOSE`를 만듭니다.

---

## Notification Boundary

액션 명령은 알림을 발생시킬 지점을 제공할 수 있습니다. 다만 계산한 알림 수신자를
티켓에 저장된 수신자 필드에 덧붙이면 안 됩니다.

특히 배정 명령은 담당자 이메일을 `tk_email`에 덧붙이면 안 됩니다.
담당자 이메일은 알림을 전송하는 시점에 결정해야 합니다.

실제 운영용 알림 발송은 명시적으로 구현하기 전까지 현재 범위에서 제외합니다.

---

## LOCAL and REMOTE Parity

LOCAL과 REMOTE는 같은 액션 명령과 DTO 응답 형식을 제공해야 합니다.

```txt
LOCAL command handler
REMOTE portal API/service
-> TicketActionDto
```

저장 방식의 차이는 Route Handler가 위임한 처리 내부에서 관리해야 합니다.

---

## 관련 문서

- [Ticket Action Model](../ticket-action.md)
- [Ticket History](../ticket-history.md)
- [Ticket Operation Rules](../reference/ticket-operation-rules.md)
- [Ticket Lifecycle](../ticket-lifecycle.md)

---

## 요약

Ticket Action은 Service Desk 업무 명령을 처리합니다. 상태와 실행자 조건을 검증하고,
액션을 기록하며, 티켓을 변경하고 수정하지 않는 이력을 만듭니다.
의사소통 타임라인과 이벤트·감사 이력은 별도로 관리합니다.
