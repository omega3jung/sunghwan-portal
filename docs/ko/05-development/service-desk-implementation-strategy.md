# Service Desk 구현 전략

## 목표

이 문서는 `sunghwan-portal`의 현재 Service Desk 구현 방식을 설명합니다.

현재 코드가 처리하는 주요 기능과 각 기능의 담당 범위:

- Route Handler에서 LOCAL/REMOTE 실행 경로 선택
- 테넌트별 설정
- 브라우저 로컬 LOCAL 티켓 초안 복구와 REMOTE 티켓 초안 행
- 첨부파일 준비
- 승인자 결정과 작업자 배정
- Ticket Action 명령 실행
- 이벤트별 티켓 이력 기록
- 작업 세션 기록
- React Query를 통한 서버 상태 관리

개념적 진화는 [`service-desk-evolution.md`](../01-overview/service-desk-evolution.md)에서 다루고,
당시 의사결정 맥락은 `06-decisions`에 보존합니다.

---

## Runtime Strategy

Service Desk는 API와 서버에서 LOCAL/REMOTE 실행 경로를 선택합니다. 하위 UI
컴포넌트가 저장 방식에 따라 실행 경로를 선택하지 않습니다.

```txt
UI
-> feature API client
-> Next.js route handler
-> LOCAL handler or REMOTE data service
```

UI는 LOCAL 데모 상태와 REMOTE 데이터베이스 중 어느 쪽에서 데이터를 읽더라도
같은 DTO 응답 형식을 사용합니다. DTO는 화면에 필요한 데이터를 전달하는 객체입니다.

### LOCAL Runtime

LOCAL은 포트폴리오와 데모용 실행 경로입니다. 서버의 변경 가능한 데모 상태를
사용하고 정해진 방식으로 초기화할 수 있습니다.

### REMOTE Runtime

REMOTE는 `src/server/data`의 서버 데이터 서비스, 저장소, 데이터베이스 행 변환기와
DTO를 사용합니다.

현재 REMOTE 구현 범위:

- 테넌트·카테고리·승인 단계·배정 규칙 설정 조회와 변경
- 티켓 생성·조회·검색·요청자 수정·초안 처리
- 티켓 액션 실행
- 티켓 이력 조회와 기록
- 작업 세션 목록 조회와 생성
- 해결 후 종료 기한이 지난 티켓 자동 종료

REMOTE에서는 Supabase Cron(`0 * * * *`)이 매시간 정각에
`service_desk.close_expired_resolved_tickets()`를 직접 호출합니다. 함수는 가장 최근
해결 시각부터 168시간이 지났고 현재도 `Resolved`인 티켓을 종료합니다. 조건을
충족하는 시각과 다음 예약 실행 시각은 다를 수 있습니다. 함수 배포, 대상 티켓 종료,
Cron 등록과 매시간 예약 호출은 검증되었습니다. 근거는
[스케줄링 결정](../06-decisions/2026-09-resolved-auto-close-scheduling.md)에 기록합니다.

프로덕션 인프라 전체가 구현된 것은 아닙니다. 첨부파일의 실제 바이너리는 저장하지
않고, 정해진 데모 파일로 대체합니다.

---

## Route Handler Boundary

Next.js Route Handler는 HTTP 요청을 받아 실제 처리를 서비스 함수에 맡깁니다.

책임:

- HTTP 요청 파싱
- 세션과 LOCAL/REMOTE 실행 환경 확인
- 기능·도메인 핸들러에 처리 위임
- 화면에서 사용할 DTO 응답 반환

소유하지 않는 것:

- SQL 작성과 실행 세부 사항
- 데이터베이스 행을 DTO로 변환
- 업무 규칙에 따른 처리 분기
- 첨부파일 준비의 내부 처리
- 티켓 이력 생성의 내부 처리

주요 API 경로:

```txt
/api/service-desk/tickets
/api/service-desk/tickets/search
/api/service-desk/tickets/draft
/api/service-desk/tickets/[ticketId]
/api/service-desk/tickets/[ticketId]/actions
/api/service-desk/tickets/[ticketId]/actions/[actionNo]
/api/service-desk/tickets/[ticketId]/command/start-work
/api/service-desk/tickets/[ticketId]/command/[action]
/api/service-desk/tickets/[ticketId]/histories
/api/service-desk/tickets/[ticketId]/work-session
/api/service-desk/tickets/attachments/prepare
/api/service-desk/tenants
/api/service-desk/categories
/api/service-desk/approval-steps
/api/service-desk/assignment-rules
```

---

## Settings 구현

Service Desk 설정은 테넌트별로 티켓 처리 방식을 정합니다.

```txt
Company reference data
-> Service Desk Tenant
-> Category / Approval Step / Assignment Rule
-> Ticket workflow
```

현재 설정 구현:

- `Tenant`: `companyId`, 언어별 `name`, `color`, `active`
- 카테고리 범위: `"PORTAL"` / `"INTERNAL"`
- 상위·하위 카테고리 구조
- 담당자 유형과 순서가 있는 승인 단계
- 직무 분야 ID와 직원 사용자명에 기반한 그룹 배정 규칙
- React Query를 통한 설정 서버 상태 관리

설정 변경은 이후 승인자 결정과 작업자 배정에 영향을 줍니다. 이미 기록된 티켓
이력의 의미를 바꾸지는 않습니다.

---

## Draft 구현

REMOTE 초안은 데이터베이스에 `Draft` 상태의 티켓 행으로 저장합니다.

핵심 동작:

- 요청자당 활성 초안 하나 유지
- 생성 대화상자에서 활성 초안 불러오기
- 입력을 변경한 생성 폼을 닫을 때 초안 저장 가능
- 최종 생성 시 기존 초안 행 재사용 가능
- 초안 폐기 시 활성 초안 제거

LOCAL 초안은 REMOTE와 저장 위치가 다릅니다. 기능 초안 저장소는 현재 데모
사용자 범위의 브라우저 `localStorage` 레코드 하나를 저장하고, 소유자가 다르면
제거합니다. Query hook은 해당 저장소에 대한 접근을 조정하지만 React Query 캐시는
복구 저장소가 아닙니다. LOCAL 초안 작업은 초안 Route Handler를 호출하거나
서버의 변경 가능한 LOCAL 상태를 사용하지 않습니다.

초안에 저장한 정보만으로 첨부파일을 복구할 수는 없습니다. 브라우저의 `File` 객체는
임시 상태이며, 실제 파일을 보관하는 프로덕션 객체 저장소는 구현 범위에서 제외했습니다.

---

## Attachment 구현

첨부파일은 티켓 저장 전에 준비 API에서 검증하고 응답용 파일 정보를 만듭니다.

```txt
browser File[] and rich-text body
-> POST /api/service-desk/tickets/attachments/prepare
-> prepared body, files, images
-> ticket command payload
```

준비 API의 역할:

- 파일명·확장자·크기 검증
- 선택한 파일을 정해진 데모 파일 URL로 대체
- 본문에 삽입된 데이터 이미지를 정해진 데모 이미지 URL로 대체
- 지원하지 않는 이미지 출처 거부
- 형식을 정리한 파일 정보 반환

티켓 저장 명령은 준비 API가 반환한 파일 정보만 저장합니다. 실제 파일 바이너리는
저장하지 않습니다.

---

## Ticket Workflow 구현

현재 ticket status:

```ts
type TicketStatus =
  | "Draft"
  | "Approval"
  | "Declined"
  | "Assigned"
  | "Working"
  | "Pending"
  | "Rejected"
  | "Resolved"
  | "Closed";
```

변환기는 과거 데이터베이스 행의 값을 현재 형식으로 정리할 수 있습니다. 다만 현재
설계 문서에서는 `Open`, `Approved`, `Reopen`을 현재 사용하는 상태로 설명하지 않습니다.

Create/submit:

- 승인 단계가 필요하면 `Approval`로 전환
- 바로 작업자를 배정하면 `Assigned`로 전환
- 제출 시 발생한 이벤트를 이력에 기록

Requester update:

- 요청자만 수정 가능
- `Approval`, `Assigned`에서만 수정 가능
- 요청 내용이나 분류가 달라지는 변경은 승인자 결정과 작업자 배정을 처음부터 다시 실행
- 담당자 결정에 영향을 주지 않는 변경은 현재 승인자·작업자 배정 유지

Explicit work start:

- 현재 작업 담당자가 `start-work`를 실행하면 `Assigned`에서 `Working`으로 전환합니다.
- 상태 변경은 이력에 기록합니다.

---

## Approval and Work Routing

담당자는 승인 단계와 작업 단계를 구분해서 결정합니다.

```ts
type TicketAssignmentPhase = "APPROVAL" | "WORK";
```

티켓 행에는 현재 담당자 결정에 필요한 값을 저장합니다.

- 현재 승인 단계 ID
- 현재 담당자 사용자명

DTO는 저장된 값과 현재 단계를 바탕으로 다음 값을 계산해 제공합니다.

- `assignmentPhase`
- `approvalAssigneeUsernames`
- `workAssigneeUsernames`
- `assignedApprover`
- `assignedWorker`

승인 단계와 배정 규칙은 설정입니다. 티켓 처리 단계를 전환할 때 필요한 설정을
적용해 티켓 상태와 담당자를 결정합니다. 이후 설정이 바뀌더라도 기존 티켓을
자동으로 변경하지 않습니다.

승인자 결정과 작업자 배정은 카테고리 규칙을 적용하는 방식이 다릅니다. 승인자는
선택한 카테고리의 상위·주 카테고리 승인 단계에서 결정합니다. 작업자는 선택한
하위 카테고리 규칙을 먼저 확인하고, 필요한 경우에만 상위·주 카테고리 규칙을 사용합니다.

---

## Ticket Action 구현

티켓 액션은 승인·배정·병합 등의 명령을 실행합니다.

현재 action type:

```ts
type TicketActionType =
  | "APPROVE"
  | "DECLINE"
  | "COMMENT"
  | "NOTE"
  | "ASSIGN"
  | "ASSIGN_SELF"
  | "REJECT"
  | "MERGE"
  | "ADJUST"
  | "REOPEN"
  | "RESUBMIT"
  | "CANCEL";
```

현재 command path name:

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

액션 규칙은 실행 가능한 사용자와 상태, 내용·사유·첨부파일 입력 여부, 실행 후
상태·담당자·이력에 생기는 변화를 정합니다.

운영 액션은 실행 후 변경할 수 없습니다. 댓글·노트 항목은 현재 액션 상세 API에서
소프트 삭제할 수 있습니다.

---

## Event-Based History 구현

이력은 발생한 이벤트별로 기록합니다.

현재 모델은 다음을 분리합니다.

- `type`
- `source`
- `event`
- 변경 전·후 값
- 실행자·시각

이벤트를 분류하는 기준은 `event` 열거형입니다. `metadata.event`나 과거 액션 이름에
의존하는 설명은 현재 모델을 나타내지 않습니다.

성공한 명령만 이력을 만듭니다.

예시:

- create submit -> `TICKET_SUBMITTED`
- approval request -> `APPROVAL_REQUESTED`
- assignment resolution -> `ASSIGNMENT_RESOLVED`
- requester update with routing reset -> `ROUTING_RESET`
- requester update with routing preserved -> `ROUTING_PRESERVED`
- work-session create -> submission이 ticket status를 실제 변경할 때만 `STATUS_UPDATED`;
  work-session 전용 event 이름은 model에 예약되어 있음
- reopen action -> authoritative status event `TICKET_REOPENED`
- auto close -> `SYSTEM_AUTO` source와 `actionNo = null`인 `RESOLUTION_CLOSE`

---

## Work Session 구현

작업 세션은 실제 수행한 작업을 기록합니다.

현재 API 경로:

```txt
GET  /api/service-desk/tickets/[ticketId]/work-session
POST /api/service-desk/tickets/[ticketId]/work-session
```

현재 동작:

- 티켓의 작업 세션 목록 조회
- 작업 시간이나 시간 구간을 직접 입력해 세션 생성
- 작업 시작 시 `Assigned`에서 `Working`으로 전환
- `Working`/`Pending`에서 허용된 다음 상태로 전환
- 현재와 과거 작업 담당자의 작업 기록 작성 허용
- 상태 변경은 현재 작업 담당자에게만 허용
- 작업 세션 제출이 티켓 상태를 바꿀 때만 `STATUS_UPDATED` 이력 기록

기능 API 클라이언트에는 상세 조회·수정·삭제·타이머용 헬퍼가 있습니다. 대응하는
Route Handler는 없으므로 해당 API를 구현하기 전까지 확장용 코드로 취급합니다.

---

## React Query 구현

React Query는 서버 상태를 관리합니다.

현재 Service Desk query family:

- ticket list/search/detail
- data scope/user별 active draft(REMOTE API 상태 또는 LOCAL 브라우저 저장소 상태)
- ticket actions list/detail
- ticket histories
- work sessions
- settings tenants/categories/approval steps/assignment rules

데이터를 변경한 뒤에는 영향을 받은 쿼리 그룹의 캐시를 무효화합니다. 서버 상태를
Zustand에 중복 저장하지 않습니다.

---

## Deferred Production Scope

완료된 포트폴리오 기능 범위에서 제외한 프로덕션 확장 항목:

- 실제 첨부파일을 지속적으로 보관하는 객체 저장소
- 프로덕션 알림 전달
- 작업 세션 타이머·수정·삭제 API 전체
- SLA 위반 감지와 상위 담당자 전달 엔진 전체
- 설정 버전 관리와 승인 절차
- 감사·규정 준수 자료 내보내기 전체
- WebSocket·구독을 통한 실시간 갱신
- 기업용 작업 배정 부하 분산

현재 설계 문서는 이 항목을 완료된 기능으로 설명하지 않습니다.

---

## 관련 문서

- [서비스 데스크 설정](../03-domain/service-desk/settings.md)
- [티켓 시스템 개요](../03-domain/service-desk/ticket/ticket-system-overview.md)
- [티켓 생명주기](../03-domain/service-desk/ticket/ticket-lifecycle.md)
- [티켓 액션 모델](../03-domain/service-desk/ticket/ticket-action.md)
- [티켓 이력](../03-domain/service-desk/ticket/ticket-history.md)
- [티켓 작업 세션](../03-domain/service-desk/ticket/ticket-work-session.md)
- [티켓 폼 설계](../04-client-engineering/forms/ticket-form.md)
- [티켓 첨부파일 설계](../04-client-engineering/forms/ticket-attachment.md)
- [티켓 운영 규칙](../03-domain/service-desk/ticket/reference/ticket-operation-rules.md)

---

## 요약

현재 Service Desk에는 REMOTE 초안, 첨부파일 준비, 테넌트별 설정, 승인자 결정과
작업자 배정, 명령 기반 티켓 액션, 이벤트별 이력, 작업 세션 기록이 구현되어 있습니다.

UI가 사용하는 응답 형식을 유지하고, Route Handler는 요청 처리와 위임에 집중합니다.
업무 규칙은 서버 서비스에서 판단하며, 구현 범위에서 제외한 프로덕션 인프라는
완료된 기능과 구분합니다.
