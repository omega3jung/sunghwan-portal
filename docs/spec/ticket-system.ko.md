# 티켓 시스템 명세

## 언어

- [English](./ticket-system.md)
- [Korean](./ticket-system.ko.md)

## 목표

이 문서는 현재 Service Desk 티켓 시스템의 전체 구조와 핵심 규칙을 정리한 기준 명세입니다.

티켓은 초안 작성, 승인, 작업자 배정, 작업 수행, 해결의 흐름을 따릅니다.
시스템은 티켓을 단순한 CRUD 대상으로 다루지 않고 업무 흐름을 함께 관리하며,
처리 과정은 이력과 작업 시간 기록으로 남깁니다.

상세 규칙은 링크된 설계 문서에서 다룹니다. 결정 기록은 과거 선택의 이유와 변화
과정을 보존하는 문서이며, 현재 설계 문서처럼 다시 쓰지 않습니다.

---

## 현재 범위

현재 프로젝트가 다루는 범위는 다음과 같습니다.

- 티켓 목록, 검색, 상세 조회, 생성, 요청자 수정, 명령 실행
- 티켓 테이블에 `status = Draft`인 행으로 저장하는 REMOTE 초안
- Tenant별 카테고리, 승인 단계, 배정 규칙 설정
- 카테고리에 따른 우선순위, 위험도, 기한, 승인자 및 작업자 결정
- 선택한 첨부를 정해진 데모 파일로 대체하는 첨부 준비 처리
- 명령으로 실행하는 티켓 액션
- 이벤트별로 기록하고 수정하지 않는 이력
- 작업 시간 기록 생성·조회와 기록된 시간의 합산
- LOCAL 데모 동작과 REMOTE의 PostgreSQL 데이터·DTO 변환 구조

이 프로젝트는 운영 환경을 고려한 구조를 사용하지만, 운영에 필요한 모든 기능을
구현한 것은 아닙니다. 실제 파일 저장소, 알림 발송, 전체 SLA 엔진, 실시간 갱신,
규제 준수 수준의 감사 인프라는 완료된 포트폴리오 기능 범위에서 제외했습니다.
이러한 미구현 항목은 현재의 제한 사항이며, 개발 예정 목록을 뜻하지 않습니다.

---

## 현재 Status Model

티켓에 저장하는 상태값의 전체 목록은 다음과 같습니다.

```txt id="ticket-status-union"
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

중요 규칙:

- `Open`, `Approved`, `Reopen`은 티켓에 저장하는 상태값이 아닙니다.
- 승인 완료는 `APPROVAL_APPROVED` 이력으로 기록합니다.
- Reopen은 티켓 액션이며 현재 결과는 `Resolved -> Working`입니다.
- 티켓과 하위 리소스 조회는 티켓 상태를 변경하면 안 됩니다. 보호된 유지보수
  엔드포인트는 자동 종료 명령을 호출하는 용도로 GET도 허용합니다. 이 요청은
  티켓 조회가 아니라 시스템 작업입니다.

관련 문서:

- [Ticket Lifecycle](../ko/03-domain/service-desk/ticket/ticket-lifecycle.md)
- [Ticket Operation Rules](../ko/03-domain/service-desk/ticket/reference/ticket-operation-rules.md)

---

## 핵심 도메인 모델

```txt id="core-domain-model"
Company
-> Service Desk Tenant
   -> Category
      -> Approval Step
      -> Assignment Rule

Ticket
-> Action
-> History
-> Work Session
-> Attachment metadata
```

Tenant는 설정을 구분하는 단위입니다. Category는 티켓의 처리 방식을 결정하는
핵심 설정입니다. 승인 단계는 선택한 하위 카테고리의 상위 카테고리를 기준으로
평가합니다. 배정 규칙은 선택한 하위 카테고리의 규칙을 먼저 적용하고,
규칙이 없을 때만 상위 카테고리의 규칙을 사용합니다.

카테고리를 업무 처리에 사용할 수 있는지는 다음 조건으로 판단합니다.

```txt
Category creation -> 비활성화
Assignment Rule -> 적어도 하나 이상의 할당된 직무 또는 직원 필요
Category activation -> 유효 규칙에 활성된 직무 또는 직원 필요
Ticket Create -> 유효하게 활성화된 main/sub category만
Ticket routing -> 실제 작업자 자격은 서버에서 재검증됨
```

업무 처리에 사용하려면 저장된 Tenant와 연결된 Company가 모두 활성 상태여야 합니다.
티켓 생성·수정 시 서버는 저장된 Category에서 Tenant를 결정하고, 해당 Category에
대한 접근 권한을 검사합니다. 요청에 담긴 Tenant ID로 판단하지 않습니다.
`PORTAL` 배정은 기본적으로 서비스 제공 회사의 직원을 대상으로 하며, 저장된
`includeTenantCompany` 설정이 있을 때만 카테고리의 Tenant 회사 직원을 추가합니다.

상위·하위 카테고리의 활성 여부는 각각 저장합니다. 하위 카테고리를 실제로 사용할 수
있는지는 `main.active && sub.active`로 계산합니다. 하위 카테고리에 자체 배정 규칙이
있으면 이를 사용하고, 없을 때만 상위 카테고리 규칙을 사용합니다.
배정 규칙이 없는 상태를 빈 규칙으로 저장하지 않습니다.

관련 문서:

- [Service Desk Settings](../ko/03-domain/service-desk/settings.md)
- [Category Strategy](../ko/03-domain/service-desk/ticket/strategy/category-strategy.md)

---

## Draft

REMOTE 초안은 브라우저에만 보관하지 않고, 별도 초안 테이블 없이 티켓 테이블에 저장합니다.

```txt id="remote-draft"
ticket row
+ status = Draft
```

규칙:

- 요청자당 활성 초안은 하나입니다.
- LOCAL과 REMOTE 모두 초안을 저장하려면 유효한 Category가 필요합니다. Category가
  없으면 변경 내용은 React Hook Form의 메모리 상태로만 남으며, API 호출이나
  localStorage 쓰기를 수행하지 않습니다.
- `tk_category_id`는 NOT NULL을 유지합니다. Category FK와 tenant trigger가
  Category와 Tenant의 관계를 판단하는 기준입니다.
- REMOTE 초안의 subject/content는 NULL일 수 있습니다. 빈 subject와 의미상 비어 있는
  서식 있는 본문은 NULL로 정규화하며, 폼에 전달할 때는 다시 빈 문자열로 변환합니다.
- 초안 저장·수정은 초안 API를 사용합니다.
- 최종 제출은 같은 행을 재사용합니다.
- 최종 제출에는 사용 가능한 Category, 비어 있지 않은 subject, 의미 있는 content가
  필요하며, 기존 기한·첨부·담당자 결정 검증도 적용합니다. 서버는 저장 전에 검증합니다.
- 제출 시 최초 승인자 또는 작업자를 결정합니다.
- 업무용 티켓 목록은 초안을 제외합니다.
- LOCAL 초안 복구 데이터는 현재 데모 사용자별 키로 브라우저 `localStorage`에 저장하고,
  기능별 초안 저장소를 통해 접근합니다. 초안 Route Handler를 호출하지 않으며,
  REMOTE의 PostgreSQL 초안과 저장 방식이 다릅니다.

Category를 선택하지 않은 상태에서 변경 내용이 있는 폼을 처음 닫으려 하면 경고를
표시하고 편집기를 열어 둡니다. 두 번째 시도에서는 해당 변경 내용을 저장하지 않고
닫습니다. Dialog를 다시 열면 이 경고 상태가 초기화됩니다. Category만 있는 초안도
저장할 수 있습니다. 본문에 삽입한 이미지는 저장 전에 Attachment Prepare를 거치며,
임시 data/blob 주소는 계속 거부합니다. Draft가 아닌 데이터베이스 행의 subject/content는
상태를 고려한 CHECK 제약 조건으로 NULL이나 공백을 금지해야 합니다.
HTML 본문에 의미 있는 내용이 있는지는 서버가 검증합니다.

관련 문서:

- [Ticket Form Design](../ko/04-client-engineering/forms/ticket-form.md)

---

## Approval and Work Routing

승인 단계와 현재 담당자를 판단하는 기준은 데이터베이스에 저장된 다음 두 필드입니다.

```txt id="routing-source-of-truth"
tk_approval_step_id
tk_assignee_usernames
```

해석:

```txt id="routing-phase"
approvalStepId != null
-> APPROVAL phase
-> assigneeUsernames = current approvers

approvalStepId == null
-> WORK phase
-> assigneeUsernames = current workers
```

애플리케이션 DTO(데이터 전달 객체)는 이 두 필드에서 승인 단계와 작업 단계를
구분해 계산한 값을 제공합니다. 해당 필드는 `assignmentPhase`,
`approvalAssigneeUsernames`, `workAssigneeUsernames`, `assignedApprover`,
`assignedWorker`입니다.

관련 문서:

- [Approval System](../ko/03-domain/service-desk/ticket/strategy/approval-system.md)
- [Assignment Policy](../ko/03-domain/service-desk/ticket/strategy/assignment-policy.md)

---

## Requester Update

요청자 수정 시 서버는 이전 값과 새 값을 정규화한 뒤 비교합니다.

다음 항목만 변경하면 상태, 승인 단계, 담당자를 유지합니다.

- 기한
- 이메일 수신자

다음 항목을 변경하면 카테고리에 따른 승인자·작업자 결정을 처음부터 다시 수행합니다.

- 카테고리
- 제목
- 본문
- 첨부파일
- 이미지

카테고리가 변경되면 기본 우선순위, 기본 위험도, 최소 기한을 새 카테고리 기준으로
다시 평가합니다. 결과 기한은 현재 기한과 새 카테고리의 최소 기한 중 더 늦은 값입니다.

이력에는 결과를 `ROUTING_PRESERVED` 또는 `ROUTING_RESET`으로 기록합니다.

---

## Attachment Boundary

첨부는 다음 순서로 준비한 뒤 저장합니다.

```txt id="attachment-flow"
File[] / inline image
-> Attachment Prepare API
-> prepared body, files, images
-> Draft / Create / Update / Action command where applicable
-> metadata persistence
```

LOCAL과 REMOTE 모두 선택한 첨부를 정해진 데모 파일로 대체합니다.
현재 구현에는 실제 파일을 보관하는 운영용 저장소가 없습니다.

시스템은 원본 `File`, 바이너리 데이터, base64 data URL, blob URL, 로컬 파일 경로를
티켓 행, DTO, 액션 메타데이터, 이력 메타데이터에 저장하면 안 됩니다.

관련 문서:

- [Ticket Attachment Design](../ko/04-client-engineering/forms/ticket-attachment.md)

---

## Action Command Model

현재 action union은 다음과 같습니다.

```txt id="action-union"
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

티켓 액션은 서버가 인증·권한·현재 상태·입력값을 검증한 뒤 실행하는 명령입니다.

```txt id="action-command-pipeline"
Action command
-> authenticate
-> authorize
-> validate current status
-> validate action input
-> insert action when applicable
-> mutate ticket when applicable
-> create history
```

작업 시작을 요청하는 start-work 명령은 Ticket Action union과 별도로 구현합니다.
이 명령은 `Assigned -> Working`으로 상태를 변경하고 `STATUS_UPDATED` 이력을
만들며, Ticket Action 행은 만들지 않습니다.

COMMENT는 요청자와 공유하는 의사소통 기록이고, NOTE는 내부 업무 기록입니다.
NOTE에 접근하려면 먼저 해당 티켓을 조회할 권한이 있어야 합니다. 현재 권한 판단
대상 사용자(effective user)가 Admin이면 요청자여도 NOTE에 접근할 수 있습니다.
그 외 요청자는 담당자나 참여자를 겸하더라도 제외합니다. 요청자가 아닌 현재·과거
담당자 또는 현재 Category의 승인·배정 규칙에 따라 참여 자격을 갖춘 사용자는 접근할 수 있습니다.
Admin이 아닌 사용자를 impersonation하는 동안에는 원래 사용자의 Admin 권한을
합산하지 않습니다. Admin도 티켓 조회 권한을 우회하지 않습니다.
액션 목록·상세와 이력에 같은 NOTE 정책을 적용합니다. 생성·삭제는 티켓이 Draft나
Closed가 아니어야 한다는 기존 조건을 유지하며, 삭제하려면 작성자여야 합니다.
참여자라는 이유만으로 티켓 조회 권한을 부여하지 않습니다. Category 비활성화만으로
현재 설정상 참여 관계를 제거하지 않습니다. 설정이나 Category가 바뀌면 참여 관계를
다시 계산하고, 실제 배정 이력은 과거 관계의 근거로 유지합니다.

업무 처리 액션은 수정하지 않습니다. 의사소통 액션인 `COMMENT`와 `NOTE`는 종료 전에
논리 삭제(행을 지우지 않고 삭제 표시)를 지원합니다. 기존 댓글은 `Closed` 이후에도
표시하지만, 종료된 티켓의 업무 규칙은 새 댓글 생성을 차단합니다.
수정 이벤트는 이력 모델에 예약되어 있으며, 현재 API 경로에서는 제공하지 않습니다.

관련 문서:

- [Ticket Action Model](../ko/03-domain/service-desk/ticket/ticket-action.md)
- [Action Strategy](../ko/03-domain/service-desk/ticket/strategy/action-strategy.md)

---

## History

이력은 발생한 이벤트를 기록하며, 기록한 내용은 수정하지 않습니다.

```txt id="history-model"
type   -> affected domain area
source -> why or which rule produced it
event  -> what happened
actor  -> who initiated it
from/to value -> structured JSON before/after
metadata -> supplemental display/audit context
```

발생한 일을 판단하는 기준 필드는 `event`입니다. `SYSTEM_AUTO`는 이력 유형이
아니라 출처(source)입니다.

재개 이력은 `Resolved -> Working` 전이에 대해 `type = STATUS`,
`source = USER_ACTION`, `event = TICKET_REOPENED`를 사용합니다.

REMOTE에서는 DB의 Supabase Cron(`0 * * * *`)이 매시간 정각에
`service_desk.close_expired_resolved_tickets()`를 직접 호출합니다.
자동 종료 대상은 가장 최근 해결 이력 시각부터 168시간이 지난 Resolved 티켓입니다.
함수는 `status = Closed`, `closeReason = Completed`를 설정하고, 필요한 경우
진행 중인 작업 시간 기록을 종료합니다. `RESOLUTION_CLOSE` 이력의 출처는
`SYSTEM_AUTO`이며 `actionNo = null`로 기록합니다.

티켓을 재개한 뒤 다시 해결하면 새로운 유예 기간이 시작됩니다. 대상 여부는 정확한
경과 시간으로 판단하며, 정상 실행 시 다음 검사까지의 대기 시간은 대략 한 시간 미만입니다.
실제 종료에는 함수 실행이 성공해야 하며, 누락된 실행이나 잠긴 티켓은 이후 시간별
실행에서 처리할 수 있습니다. 기존 HTTP 유지보수 경로도 유지합니다.
[스케줄링 결정](../ko/06-decisions/2026-09-resolved-auto-close-scheduling.md)을
참고하세요.

관련 문서:

- [Ticket History](../ko/03-domain/service-desk/ticket/ticket-history.md)

---

## Work Session

작업 시간 기록(Work Session)은 Ticket Action과 별도로 관리합니다.

현재 제공하는 API 경로:

```txt id="work-session-routes"
GET  /api/service-desk/tickets/:ticketId/work-session
POST /api/service-desk/tickets/:ticketId/work-session
```

현재 동작:

- 현재·과거 작업 담당자는 작업 내역을 기록할 수 있습니다.
- 작업 시간 기록 제출로 상태를 변경할 수 있는 주체는 현재 작업 담당자뿐입니다.
- 기록된 시간은 티켓의 합계에 반영합니다.
- 작업 시간 기록 제출은 `Assigned -> Working` 전이를 적용할 수 있습니다.
- `Working -> Pending | Resolved`
- `Pending -> Working | Resolved`
- GET은 상태 변경 등의 부수 효과가 없습니다.
- 타이머 시작·종료·전환 경로는 현재 제공하지 않습니다.

관련 문서:

- [Ticket Work Session](../ko/03-domain/service-desk/ticket/ticket-work-session.md)

---

## Runtime and Data Boundary

```txt id="runtime-boundary"
UI
-> feature API client
-> Next.js Route Handler
-> LOCAL handler or REMOTE portal API/service
-> DTO
```

REMOTE에서 데이터를 조회하고 응답하는 순서는 다음과 같습니다.

```txt id="data-boundary"
DB Row
-> Mapper
-> DTO
-> Service
-> Route Handler
-> Feature API client
-> UI
```

UI 코드는 Supabase나 데이터베이스 행에 직접 접근하면 안 됩니다. LOCAL의 변경 가능한
상태와 REMOTE 서비스는 지원하는 업무 흐름에서 호환되는 DTO 응답 형식을 유지해야 합니다.

관련 문서:

- [Database Strategy](../ko/02-architecture/database-strategy.md)
- [React Query Strategy](../ko/05-development/react-query-strategy.md)
- [Service Desk Implementation Strategy](../ko/05-development/service-desk-implementation-strategy.md)

---

## Deferred Scope

명령 처리에도 알려진 구현상의 제한이 있습니다. 수동 `ASSIGN`은 실행자·상태와 비어
있지 않은 username 목록을 검증하지만, Category 및 승인·작업 단계에 따른 후보 자격은
다시 확인하지 않습니다. 수신자 주소 배열도 직원·회사 자격 검증 없이 받습니다.
카테고리에 따른 최초 담당자 결정과 설정 검증에서는 별도로 자격을 검증합니다.
[Assignment Policy](../ko/03-domain/service-desk/ticket/strategy/assignment-policy.md)를 참고하세요.

현재 구현 범위에서 제외한 운영 기능은 다음과 같습니다.

- 실제 파일 저장소, 파일 검사, 서명된 다운로드 URL
- 실제 알림 발송
- 전체 SLA 달력, 시간 측정 일시 중단·재개, 기한 위반 및 에스컬레이션 엔진
- 실시간 갱신
- 작업 시간 기록 수정·삭제·타이머 API 전체
- 규제 준수 수준의 감사 인프라
- 고급 작업 배정 부하 분산

범위에서 제외한 항목을 현재 구현된 기능으로 설명하면 안 됩니다.

---

## 관련 문서

### Current Design

- [Service Desk Documentation Index](../ko/README.md)
- [Ticket System Overview](../ko/03-domain/service-desk/ticket/ticket-system-overview.md)
- [Ticket Lifecycle](../ko/03-domain/service-desk/ticket/ticket-lifecycle.md)
- [Ticket Model](../ko/03-domain/service-desk/ticket/ticket-model.md)
- [Ticket Action Model](../ko/03-domain/service-desk/ticket/ticket-action.md)
- [Ticket History](../ko/03-domain/service-desk/ticket/ticket-history.md)
- [Ticket Work Session](../ko/03-domain/service-desk/ticket/ticket-work-session.md)
- [Ticket Form Design](../ko/04-client-engineering/forms/ticket-form.md)
- [Ticket Attachment Design](../ko/04-client-engineering/forms/ticket-attachment.md)
- [Service Desk Settings](../ko/03-domain/service-desk/settings.md)

### Strategies

- [Action Strategy](../ko/03-domain/service-desk/ticket/strategy/action-strategy.md)
- [Approval System](../ko/03-domain/service-desk/ticket/strategy/approval-system.md)
- [Assignment Policy](../ko/03-domain/service-desk/ticket/strategy/assignment-policy.md)
- [Category Strategy](../ko/03-domain/service-desk/ticket/strategy/category-strategy.md)
- [SLA Strategy](../ko/03-domain/service-desk/ticket/strategy/sla-strategy.md)
- [Ticket Operation Rules](../ko/03-domain/service-desk/ticket/reference/ticket-operation-rules.md)
- [Service Desk Implementation Strategy](../ko/05-development/service-desk-implementation-strategy.md)

### Decision Logs

- [2026-06 Ticket Form and Draft Workflow](../ko/06-decisions/2026-06-ticket-form-and-draft-workflow.md)
- [2026-06 Ticket Attachment Boundary](../ko/06-decisions/2026-06-ticket-attachment-boundary.md)
- [2026-07 Ticket Routing and Update Policy](../ko/06-decisions/2026-07-ticket-routing-and-update-policy.md)
- [2026-07 Ticket Action and History Execution](../ko/06-decisions/2026-07-ticket-action-and-history-execution.md)

---

## 현재 Authorization 및 Workflow 영향 불변 조건

REMOTE 티켓 조회는 `vw_ticket` 쿼리에서 저장된 티켓 Tenant, `cat_scope`, 요청자,
현재 승인·작업 담당자, 현재 권한 판단 대상 사용자의 회사·scope를 함께 평가합니다.
목록, 검색, 상세, 액션 목록, 이력, 작업 시간 기록 조회는 같은 접근 조건을 사용합니다.
목록에서 볼 수 없는 티켓을 ID나 하위 리소스 경로로 조회할 수 없습니다.
LOCAL도 같은 의미의 조건으로 판단합니다.

Category 비활성화는 새 업무 흐름에서 해당 카테고리를 사용할 수 있는지만 변경합니다.
진행 중인 티켓이 상위·하위 카테고리를 사용하면 영향을 확인해야 합니다. 강제 적용을
확인하더라도 기존 티켓의 담당자 결정 결과와 이력은 변경하지 않습니다. 진행 중인
승인은 비활성 Category를 참조해 계속 진행할 수 있지만, 새로 시작하거나 재시작하는
담당자 결정에는 업무 처리에 사용 가능한 Category가 필요합니다.

`Approval` 티켓에 영향을 주는 승인 단계 트리 변경은 강제 적용이 필요합니다.
서버는 유효한 설정 저장, 영향받는 모든 티켓의 최초 담당자 결정 재실행,
reason이 `APPROVAL_CONFIGURATION_CHANGED`인 `ROUTING_RESET` 이력 기록을
하나의 트랜잭션으로 처리합니다. 중간에 실패하면 전체를 되돌립니다. 고객 Tenant에
`Draft`, `Closed`가 아닌 티켓이 있으면 강제 적용 없이 비활성화·삭제할 수 없습니다.

티켓 생성은 명시적으로 입력한 유효한 priority/risk를 보존합니다. 누락된 값만
하위 카테고리, 상위 카테고리의 기본값 순서로 결정합니다. 서버는 Category SLA 최소값보다
이른 기한을 거부합니다. Category 변경 시 기한은
`later(currentDueAt, submittedDueAt, newCategoryMinimumDueAt)`이며 priority/risk는
새 Category의 기본값을 사용합니다.

## 요약

현재 티켓 시스템은 저장된 상태값, REMOTE 초안 행, 승인 단계와 작업 단계를 구분한
담당자 결정, 첨부 준비, 서버가 실행하는 티켓 액션, 수정하지 않는 이벤트 이력,
작업 시간 기록을 사용합니다. 이 명세는 현재 구현과 범위에서 제외한 운영 인프라를
구분하고, 상세 규칙을 설명하는 현재 설계 문서로 연결합니다.
