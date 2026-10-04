# 티켓 시스템 Overview

## 목표

이 문서는 현재 Service Desk 티켓 시스템의 전체 구조와 업무 흐름을 설명합니다.

핵심 모델을 요약하고 상세 규칙의 기준 문서로 연결합니다. 모든 업무 규칙을
반복해서 설명하지는 않습니다. 전체 구조를 이해한 뒤 실행 세부 사항은 링크된 문서에서 확인합니다.

---

## 현재 Ticket System

```txt
Tenant-scoped settings
-> category-driven ticket intake
-> approval or work routing
-> command-based ticket actions
-> event-based history
-> work-session evidence
```

Service Desk는 티켓의 업무 흐름을 관리합니다. 티켓에는 현재 상태와 담당자,
처리에 적용할 설정, 액션, 이력, 첨부 정보, 작업 시간 기록이 포함됩니다.

---

## Persisted Status Model

현재 `TicketStatus` union:

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
- Reopen은 현재 `Resolved`를 `Working`으로 되돌리는 액션입니다.

상세 조회는 상태를 변경하면 안 됩니다. 작업을 시작하려면 별도 명령을 실행해야 합니다.

관련 문서: [Ticket Lifecycle](./ticket-lifecycle.md)

---

## Draft

REMOTE 초안은 티켓 테이블에 `status = "Draft"`인 일반 행으로 저장합니다.

현재 초안 규칙:

- 요청자당 활성 초안은 하나입니다.
- 초안은 별도 초안 테이블 없이 티켓 테이블을 사용합니다.
- 초안 저장·수정은 초안 API를 사용합니다.
- 최종 제출은 초안 행을 재사용하고 `Approval` 또는 `Assigned`로 이동시킵니다.
- 업무용 목록과 분석 화면은 초안 티켓을 제외합니다.
- LOCAL 초안 복구는 현재 데모 사용자 범위의 브라우저 `localStorage` 상태이며
  기능 초안 저장소를 통해 접근합니다.
- LOCAL 초안 작업은 초안 Route Handler를 거치지 않으며 REMOTE PostgreSQL 초안
  모델과 저장 방식이 다릅니다.

관련 문서: [Ticket Form Design](../../../04-client-engineering/forms/ticket-form.md)

---

## Approval and Work Routing

승인 단계와 현재 담당자를 판단하는 기준은 데이터베이스의 다음 두 필드입니다.

```txt
tk_approval_step_id
tk_assignee_usernames
```

해석:

```txt
tk_approval_step_id != null
-> assignmentPhase = APPROVAL
-> tk_assignee_usernames = current approvers

tk_approval_step_id == null
-> assignmentPhase = WORK
-> tk_assignee_usernames = current workers
```

DTO는 이 두 필드에서 승인 단계와 작업 단계를 구분해 계산한 값을 UI에 제공합니다.

- `assignmentPhase`
- `approvalAssigneeUsernames`
- `workAssigneeUsernames`
- `assignedApprover`
- `assignedWorker`

이 값들은 mapper나 service가 계산한 응답 값이며, 데이터베이스에 별도로 저장한 판단 기준이 아닙니다.

관련 문서:

- [Approval System](./strategy/approval-system.md)
- [Assignment Policy](./strategy/assignment-policy.md)

---

## Initial Routing

티켓 제출 시 선택한 카테고리와 요청자를 기준으로 승인자 또는 작업자를 결정합니다.

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

승인 처리 시 다음 승인 단계가 있으면 그 단계로 이동합니다. 마지막 승인까지 완료하면
작업자를 결정하고 티켓을 `Assigned`로 이동시킵니다.

승인 거절은 승인자 결정 흐름을 종료합니다.

```txt
status = Declined
approvalStepId = null
assigneeUsernames = []
```

---

## Requester Update Routing

현재 구현에서는 요청자가 자신의 티켓을 `Approval` 또는 `Assigned` 상태일 때만 수정할 수 있습니다.

담당자 결정에 영향을 주지 않는 필드:

- 기한
- 이메일 수신자

담당자를 다시 결정하는 필드:

- 카테고리
- 제목
- 본문
- 첨부파일
- 이미지

값을 정규화한 뒤 실제로 달라진 경우에만 담당자 유지·재결정 처리를 적용합니다.
기한이나 이메일 수신자만 변경되면 상태, 승인 단계, 담당자를 유지하고 이력에
`ROUTING_PRESERVED`를 기록합니다.

담당자 결정에 영향을 주는 값이 변경되면 승인자·작업자를 처음부터 다시 계산하고
이력에 `ROUTING_RESET`을 기록합니다.

카테고리가 변경되면 우선순위, 위험도, 최소 기한을 새 카테고리 기본값에서 다시
평가합니다. 다음 기한은 현재 기한, 제출한 기한, 새 카테고리의 최소 기한 중
가장 늦은 값입니다. 카테고리 변경으로 기한을 더 이른 날짜로 당기면 안 됩니다.

관련 문서:

- [Ticket Lifecycle](./ticket-lifecycle.md)
- [Ticket Operation Rules](reference/ticket-operation-rules.md)

---

## Attachment Boundary

티켓 명령이 첨부 정보를 저장하기 전에 첨부 준비 API로 입력을 처리합니다.

```txt
File[] / inline image
-> Attachment Prepare API
-> prepared body, files, images
-> ticket command payload
-> tk_content, tk_files, tk_images
```

현재 LOCAL과 REMOTE는 선택한 첨부를 정해진 데모 파일로 대체합니다.
실제 파일을 보관하는 운영용 저장소는 제공하지 않습니다.

원본 `File`, 바이너리 데이터, base64 data URL, blob URL, 로컬 파일 경로는 티켓 행,
DTO, 액션 메타데이터, 이력 메타데이터에 저장하면 안 됩니다.

관련 문서: [Ticket Attachment Design](../../../04-client-engineering/forms/ticket-attachment.md)

---

## Ticket Action Command Model

티켓 액션은 서버가 아래 순서로 검증하고 실행하는 명령입니다.

```txt
Action command
-> authenticate
-> authorize
-> validate status
-> validate input
-> insert action when applicable
-> mutate ticket when applicable
-> create history
```

현재 action type:

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

의사소통 액션은 타임라인에 기록을 만듭니다. 업무 처리 액션은 상태, 담당자,
계획 필드, 통합 상태, 종료 사유를 변경할 수 있습니다. 일반 업무 흐름에서는
이미 기록한 업무 처리 액션을 수정하지 않습니다.

종료 전에 생성된 댓글은 `Closed` 이후에도 계속 표시합니다.
기존 댓글이 보인다고 해서 종료 이후 새 댓글을 만들 수 있는 것은 아닙니다.

관련 문서:

- [Ticket Action Model](./ticket-action.md)
- [Action Strategy](./strategy/action-strategy.md)

---

## Event-Based History

이력은 발생한 이벤트와 변경 내용을 추적하는 데이터이며, 기록한 내용은 수정하지 않습니다.

```txt
type   -> changed domain area
source -> why or which rule produced it
event  -> what happened
actor  -> who initiated it
from/to value -> structured JSON change
metadata -> supplemental display/audit context
```

발생한 일을 판단하는 기준은 `event`이며, `metadata.event`로 판단하지 않습니다.
`SYSTEM_AUTO`는 이력 유형이 아니라 이력의 출처입니다.

하나의 액션은 여러 이력 레코드를 만들 수 있습니다. 일부 시스템 작업은 티켓 액션
행 없이 이력만 만들 수 있습니다.

관련 문서: [Ticket History](./ticket-history.md)

---

## Work Session

Work Session은 실제 작업 시간을 기록하며, Ticket Action과 별도로 관리합니다.

현재 제공하는 API 경로:

```txt
GET  /api/service-desk/tickets/:ticketId/work-session
POST /api/service-desk/tickets/:ticketId/work-session
```

현재 동작:

- 현재·과거 작업 담당자는 작업 내역을 기록할 수 있습니다.
- 작업 시간 기록 제출로 상태를 변경할 수 있는 주체는 현재 작업 담당자뿐입니다.
- 현재 작업 담당자가 `Assigned`에서 제출할 때는 `Working`으로 이동해야 합니다.
- 현재 작업 담당자는 `Working`을 `Pending` 또는 `Resolved`로 이동할 수 있습니다.
- 현재 작업 담당자가 `Pending`에서 제출할 때는 `Working` 또는 `Resolved`로
  이동해야 합니다.
- 기록된 시간은 티켓의 작업 시간 합계에 반영합니다.
- GET은 상태를 변경하지 않습니다.
- 타이머 시작·종료·전환 API 경로는 현재 제공하지 않습니다.

관련 문서: [Ticket Work Session](./ticket-work-session.md)

---

## Settings Relationship

Service Desk 설정은 티켓 업무 흐름에 적용할 처리 규칙을 제공합니다.

```txt
Company
-> Service Desk Tenant
   -> Category
      -> Approval Step
      -> Assignment Rule
```

Tenant는 설정을 구분하는 단위입니다. Category는 처리 방식을 결정하는 핵심 설정입니다.
승인 단계는 상위 카테고리의 승인자 결정 흐름을 제어합니다. 배정 규칙은 하위 카테고리
규칙을 우선 적용하고, 없을 때 상위 규칙을 사용해 작업 담당자를 결정합니다.

관련 문서: [Service Desk Settings](../settings.md)

---

## Runtime Boundary

UI는 기능별 API 클라이언트를 사용합니다. Route Handler는 LOCAL 또는 REMOTE
처리를 선택합니다.

```txt
UI
-> feature API client
-> Next.js Route Handler
-> LOCAL handler or REMOTE portal API/service
-> DTO
```

REMOTE에서는 서버만 데이터에 접근하고, 데이터베이스 행을 mapper로 DTO에 변환하며,
repository와 service가 조회·처리를 담당합니다. 업무 흐름의 여러 변경을 모두 성공시키거나
모두 되돌려야 할 때는 트랜잭션을 사용합니다.

LOCAL은 안전한 포트폴리오 데모 동작을 제공합니다. 지원하는 업무 흐름에서는
DTO 응답 형식을 REMOTE와 맞춰 유지해야 합니다.

---

## Document Map

- Status and transitions: [Ticket Lifecycle](./ticket-lifecycle.md)
- Current executable rules: [Ticket Operation Rules](reference/ticket-operation-rules.md)
- Ticket entity and DTO boundary: [Ticket Model](./ticket-model.md)
- Action timeline: [Ticket Action Model](./ticket-action.md)
- Command execution: [Action Strategy](./strategy/action-strategy.md)
- Immutable audit model: [Ticket History](./ticket-history.md)
- Approval rules: [Approval System](./strategy/approval-system.md)
- Work assignment: [Assignment Policy](./strategy/assignment-policy.md)
- Work sessions: [Ticket Work Session](./ticket-work-session.md)
- Form workflow: [Ticket Form Design](../../../04-client-engineering/forms/ticket-form.md)
- Attachment boundary: [Ticket Attachment Design](../../../04-client-engineering/forms/ticket-attachment.md)
- Settings structure: [Service Desk Settings](../settings.md)

---

## 요약

현재 Service Desk 티켓 시스템은 저장된 상태값, 승인·작업 단계를 구분한 담당자 결정,
REMOTE 초안 행, 첨부 준비, 명령 기반 액션, 이벤트 이력, 작업 시간 기록,
Tenant별 설정을 중심으로 구성됩니다.

설계 목표는 업무 동작과 그 변경 과정을 명확하게 추적할 수 있도록 유지하는 것입니다.
설명은 과거의 `Open`/`Approved` 상태 용어 대신 현재 구현을 기준으로 합니다.
