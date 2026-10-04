# 티켓 모델

## 목표

이 문서는 현재 티켓 데이터 구조, DTO로 계산·변환해 제공하는 값, 계층별 데이터 처리 책임을 정의합니다.

필드 이름과 모델의 역할은 현재 도메인 타입, DTO, mapper의 실제 동작을 기준으로 설명합니다.

---

## 핵심 개념

```txt
Ticket row = 현재 workflow state
Ticket DTO = application-facing projection
History = state가 어떻게 바뀌었는지에 대한 immutable record
```

티켓 행은 현재 상태를 저장합니다. 액션, 이력, 작업 시간 기록은 관련 하위 리소스로 저장합니다.

---

## 저장 상태

현재 status union:

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

`Open`, `Approved`, `Reopen`은 현재 저장하는 상태값이 아닙니다. Ticket mapper는
과거 행을 읽을 수 있도록 오래된 상태값을 현재 값으로 정규화합니다.

- `Open`은 approval step 여부에 따라 `Approval` 또는 `Assigned`로 매핑됩니다.
- `Approved`는 `Assigned`로 매핑됩니다.
- `Reopen`은 `Working`으로 매핑됩니다.

새 설계 문서는 이러한 오래된 값을 현재 상태값으로 설명하면 안 됩니다.

---

## 도메인 인터페이스

현재 도메인의 조회 모델은 `TicketSummary`와 `TicketDetail`입니다.

### Shared Core

```ts
type TicketBase = {
  id: string;
  ticketNumber: string;
  createdAt: ISODateString;
  updatedAt?: ISODateString;
  requesterUsername: string;
};

type TicketWorkflowState = {
  status: TicketStatus;
  priority: Priority;
  riskLevel: RiskLevel;
  closeReason?: TicketResolutionReason;
};
```

`TicketResolutionReason`에는 같은 scope 티켓 통합을 위한 `Merged`와,
`INTERNAL` 원본 티켓을 기존 `PORTAL` 대상 티켓으로 통합할 때 사용하는
`Escalated`가 포함됩니다. 두 경우 모두 통합 대상과의 관계를 유지하며,
종료 사유로 보고서와 화면 표시 의미를 구분합니다.

### Assignment Projection

```ts
type TicketAssignmentPhase = "APPROVAL" | "WORK";

type TicketAssignmentState = {
  assignmentPhase: TicketAssignmentPhase;
  approvalAssigneeUsernames: string[];
  workAssigneeUsernames: string[];
  assignedApprover: boolean;
  assignedWorker: boolean;
};
```

승인 단계와 담당자 판단의 기준은 데이터베이스에 저장된 다음 필드입니다.

```txt
tk_approval_step_id
tk_assignee_usernames
```

승인·작업 단계를 구분하는 필드는 저장된 값을 바탕으로 계산해 DTO와 도메인 모델에 제공합니다.

### Metrics and View State

```ts
type TicketMetrics = {
  workMinutes: number;
  lastCommentAt?: ISODateString;
  lastCommenterEmail?: string;
  lastUserActivityAt?: ISODateString;
  lastUserActivityEmail?: string;
  closedAt?: ISODateString;
};

type TicketViewState = {
  dueAt: ISODateString;
  owner: boolean;
  active: boolean;
};
```

`owner`, `assignedApprover`, `assignedWorker`는 현재 인증된 사용자를 기준으로
계산합니다. 모든 사용자에게 공통으로 적용되는 저장된 플래그가 아닙니다.

### Detail Content

```ts
type TicketContent = {
  categoryId: string;
  approvalStepId: string | null;
  subject: string;
  content: string;
  email: {
    to: string[];
    cc: string[];
    bcc: string[];
  };
  files: TicketAttachmentMetadata[];
  images: TicketAttachmentMetadata[];
};
```

티켓 상세는 전체 본문, 이메일 수신자 설정, 첨부파일 및 이미지 정보를 포함합니다.
티켓 요약은 목록·검색에 필요한 정보를 제공하며, 전체 본문이나 첨부 데이터는 포함하지 않습니다.

---

## Database and DTO Boundary

REMOTE 조회에서 데이터를 변환하는 순서는 다음과 같습니다.

```txt
service_desk view/row
-> mapper
-> TicketListItemDto or TicketDetailDto
-> feature API mapper
-> domain model
```

데이터베이스 행은 `tk_*`, `cat_*` 등 저장용 필드 이름을 사용합니다.
UI 코드는 변환 전의 행 컬럼을 직접 사용하면 안 됩니다.

### DTO Assignment Fields

Ticket DTO는 다음 필드를 제공합니다.

- `assignment_phase`
- `approval_assignee_usernames`
- `work_assignee_usernames`
- `assigned_approver`
- `assigned_worker`
- `assignee_usernames`

`assignee_usernames`는 승인·작업 단계를 구분하지 않은 현재 담당자 목록을 제공합니다. 단계별 배열은
해당 사용자가 승인자인지 작업자인지 구분합니다.

---

## Draft Identity

REMOTE 초안은 티켓 테이블을 사용합니다.

규칙:

- `status = Draft`
- 요청자당 활성 초안은 하나입니다.
- Category는 저장에 필요한 최소 식별 정보입니다. `tk_category_id`는 기존 FK 및
  `enforce_ticket_category_tenant()` 트리거와 함께 NOT NULL을 유지합니다.
- `tk_subject`와 `tk_content`는 Draft 상태에서만 NULL일 수 있습니다. 불완전한 값은
  초안 저장 처리에서 NULL로 정규화하고, 폼에 전달하는 DTO에서는 빈 문자열로
  변환합니다.
- 초안은 요청자의 username으로 조회합니다.
- 제출 시 초안 행을 재사용하고 `Approval` 또는 `Assigned`로 변경합니다.
- 업무용 티켓 목록에서는 초안 행을 제외합니다.

LOCAL 초안 복구는 기능 초안 저장소가 소유하고 현재 데모 사용자 범위로 관리되는
브라우저 로컬 `localStorage` 상태입니다. 저장된 소유자가 현재 권한 판단 대상 사용자와 다르면
제거되고, 초안 Route Handler를 거치지 않으며, REMOTE PostgreSQL 초안 모델과
저장 방식이 다릅니다.

LOCAL과 REMOTE 모두 저장 전에 Category를 선택해야 하며, Category만 있는 초안도
허용합니다. Category가 없으면 폼의 내용은 저장되지 않은 클라이언트 상태로 남습니다.

업무용 Ticket DTO의 subject/content는 문자열 필드를 유지합니다. 상태를 고려한
데이터베이스 CHECK 제약 조건은 Draft가 아닌 행의 subject/content가 NULL이나
공백인 것을 금지합니다. 서버는 제출 시 의미상 비어 있는 서식 있는 본문도 거부합니다.
목록·검색 쿼리는 초안을 제외하며, 제출 이력은 전체 검증과 `Approval` 또는
`Assigned`로의 전환이 완료된 뒤에만 생성합니다.

---

## Email Ownership

티켓의 `email`은 요청자가 입력한 알림 수신자 설정입니다.

담당자 정보에서 구한 이메일을 저장된 `tk_email` 필드에 덧붙이면 안 됩니다.
알림 발송을 구현할 때는 전송 시점에 담당자 이메일을 결정해야 합니다.

---

## Attachment Metadata

티켓 첨부 필드에는 첨부 준비 API가 반환한 파일 정보만 저장합니다.

```ts
type TicketAttachmentMetadata = {
  originalName: string;
  replacedName: string;
  extension: string;
  size: number;
  type: string;
  demoUrl: string;
  replaced: true;
  reason: "SECURITY_DEMO_REPLACEMENT";
};
```

티켓의 저장 필드는 다음과 같습니다.

```txt
tk_content -> prepared body
tk_files   -> TicketAttachmentMetadata[]
tk_images  -> TicketAttachmentMetadata[]
```

원본 `File`, 바이너리 데이터, base64 data URL, blob URL, 로컬 경로는 티켓 행이나
DTO에 포함하지 않습니다.

관련 문서: [Ticket Attachment Design](../../../04-client-engineering/forms/ticket-attachment.md)

---

## 관련 Subresource

### Ticket Action

Ticket Action은 명령 실행으로 생성하는 타임라인 기록이며, 이력과는 별도 모델입니다.
일부 액션은 티켓 상태를 변경하고 여러 이력 레코드를 만듭니다.

관련 문서: [Ticket Action Model](./ticket-action.md)

### Ticket History

이력은 type, source, event, actor, JSON 형식의 변경 전후 값, 표시용 메타데이터를
포함합니다. 발생한 이벤트를 추적하는 기록이며, 저장한 뒤 수정하지 않습니다.

관련 문서: [Ticket History](./ticket-history.md)

### Work Session

Work Session은 실제 작업 시간을 기록합니다. 티켓에는 합산한 `workMinutes`를
제공하고, 개별 기록은 별도 하위 리소스로 유지합니다.

관련 문서: [Ticket Work Session](./ticket-work-session.md)

---

## List vs Detail

### List Item

목록·검색 DTO는 다음을 포함합니다.

- 식별 정보와 상태
- 계산한 승인·작업 담당자 정보
- 우선순위, 위험도, 기한
- 카테고리 표시 정보
- 요청자 본인 여부와 담당자 여부
- 작업 시간과 최근 활동 시각
- 종료·통합 필드
- 경과 시간

### Detail

상세 DTO는 다음을 추가합니다.

- 전체 본문
- 이메일 수신자 설정
- 준비된 첨부파일 정보
- 준비된 이미지 정보

---

## Write Model

생성·수정 요청에는 다음 값을 사용합니다.

- 카테고리 ID
- 제목·본문
- 기한
- 우선순위·위험도
- 이메일 수신자 설정
- 준비된 첨부파일·이미지 정보
- 기존 초안 ID(선택)

저장 처리에서는 첨부 정보를 검증하고 저장 전에 행의 값을 정규화합니다.

요청자 수정은 변경한 필드에 따라 승인자·작업자를 다시 결정할 수 있습니다.
[Ticket Lifecycle](./ticket-lifecycle.md)과
[Ticket Operation Rules](reference/ticket-operation-rules.md)를 참고합니다.

---

## 요약

현재 티켓 모델은 행에 저장된 상태, DTO로 계산해 제공하는 값, 수정하지 않는 이력을
분리합니다. 담당 단계, 요청자·담당자 여부, 작업 시간, 최근 활동은 조회를 위해 제공하는
값입니다. 업무 흐름의 판단 기준으로 저장하는 값은 상태, 승인 단계, 담당자, 카테고리,
본문, 계획 필드, 준비된 첨부 정보입니다.
