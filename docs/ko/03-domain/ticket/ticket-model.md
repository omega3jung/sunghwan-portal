# Ticket Model

## 목표

Ticket model은 Service Desk 시스템에서 workflow entity로서 티켓의
핵심 도메인 구조를 정의합니다.

이 모델의 목표는 다음과 같습니다.

- 티켓을 구조화되고 상태를 가진 entity로 표현한다.
- 단순 CRUD가 아니라 workflow 중심의 운영을 지원한다.
- API, UI, 도메인 로직 전반에서 일관성을 유지한다.
- 데이터 처리와 렌더링을 위한 명확한 계약을 제공한다.

---

## 핵심 개념

```txt
티켓은 단순한 데이터가 아니라, 상태와 소유권, 컨텍스트를 가진 workflow entity다.
```

티켓은 다음 중 하나를 나타냅니다.

- request
- issue
- task

이들은 정의된 라이프사이클을 따라 이동하며, 할당된 사용자에 의해 처리됩니다.

단순한 데이터 모델과 달리 티켓은:

- 시간에 따라 변화합니다.
- 여러 도메인 시스템과 상호작용합니다.
- 이력과 감사 가능성을 유지합니다.

---

## 도메인 구조

Ticket model은 workflow, 운영 UI, 관련 시스템에 필요한 현재 상태를 제공합니다.

```ts
export interface Ticket {
  id: string;
  ticketNumber: string;

  createdAt: ISODateString;
  updatedAt: ISODateString;

  requesterId: string;

  status: TicketStatus;
  priority: Priority;

  categoryId: string;

  subject: string;
  body: string;

  dueAt: ISODateString;

  assigneeIds: string[];

  trackTimeMinutes: number;

  lastCommentAt?: ISODateString;
  lastCommenterEmail?: string;

  approvalStepId?: string;
  active: boolean;

  files: Attach[];
  images: Attach[];
}
```

---

## 핵심 모델 영역

### Identity

- `id`: 고유 식별자
- `ticketNumber`: 사람이 읽을 수 있는 참조 번호

### Timestamps

- `createdAt`: 티켓 생성 시각
- `updatedAt`: 마지막 수정 시각

### Request Context

- `requesterId`: 티켓을 생성한 사용자
- `subject`: 요청의 짧은 요약
- `body`: 상세 설명

### Status and Workflow

- `status`: 현재 workflow 상태
- `priority`: 긴급도
- `approvalStepId`: 해당되는 경우 현재 승인 컨텍스트

관련 문서: [Ticket Lifecycle](./ticket-lifecycle.md)

---

### Category

- `categoryId`: 티켓을 category configuration과 연결합니다.

티켓은 category를 참조합니다. category는 tenant에 속하며, 해당 tenant는
category-driven behavior를 위한 Service Desk configuration boundary를 제공합니다.

Category는 다음을 결정합니다.

- assignment
- SLA behavior
- approval requirement
- workflow behavior

따라서 ticket은 이러한 business rule을 직접 내장하지 않고,
category configuration에 의존합니다.

현재 ticket model은 구현 contract에 `tenantId`가 추가되지 않는 한 이를 직접
노출할 필요가 없습니다. tenant scope는 참조된 category configuration을 통해
해석됩니다.

관련 문서: [Category Strategy](./strategy/category-strategy.md)

---

### Assignment

- `assigneeIds`: 현재 책임 사용자 목록

Assignment는 실행, 소유권, 운영 가시성에 직접 영향을 주므로
핵심 모델의 일부입니다.

관련 문서: [Assignment Policy](./strategy/assignment-policy.md)

---

### SLA

- `dueAt`: SLA rule에 따라 계산된 마감 시각

이를 통해 긴급도와 시간 기대치를 ticket 수준에서 드러낼 수 있습니다.

관련 문서: [SLA Strategy](./strategy/sla-strategy.md)

---

### Work Tracking

- `trackTimeMinutes`: 집계된 작업 시간

실제 작업 세션은 track-time model에서 별도로 관리됩니다.

관련 문서: [Ticket Track Time](./ticket-track-time.md)

---

### Activity Metadata

- `lastCommentAt`: 마지막 상호작용 시각
- `lastCommenterEmail`: 빠른 UI 렌더링을 위한 마지막 actor

이 필드들은 전체 history를 즉시 로드하지 않아도,
UI에서 최근 activity를 노출할 수 있게 도와줍니다.

관련 문서:

- [Ticket Activity Model](./ticket-activity.md)
- [Ticket History](./ticket-history.md)

---

### Ownership Flags

Ticket은 파생된 ownership flag도 제공합니다.

```ts
type Ownership = {};
```

- `owner`: 현재 사용자가 requester인지 여부
- `assigned`: 현재 사용자가 assignee인지 여부

이 값들은 파생된 소유권 값이며, 고정된 티켓 필드가 아닙니다.
로컬 모드에서는 경로/로컬 핸들러에서 계산할 수 있으며, 원격 모드에서는 인증된 사용자 컨텍스트를 사용하여 서버에서 확인할 수 있습니다.

이 flag는 다음에 유용합니다.

- permission 처리
- UI 조건부 렌더링

---

### Attachments

- `files`: 일반 첨부파일
- `images`: 이미지 첨부파일

첨부파일 동작은 보조 시스템이 처리하더라도,
attachments는 ticket context의 일부로 남습니다.

---

### Active State

- `active`: soft-delete flag

일반적인 workflow 운영에서 ticket은 물리적으로 삭제되지 않습니다.
이 모델은 history, reporting, reference integrity를 위해 티켓을 보존합니다.

관련 문서: [Ticket History](./ticket-history.md)

---

## 도메인 특성

### 1. Workflow-Oriented

티켓은 정적인 데이터가 아닙니다.

- 시간에 따라 상태가 바뀝니다.
- domain event를 발생시킵니다.
- 여러 subsystem과 상호작용합니다.

### 2. Category-Driven Behavior

티켓 자체가 전체 business rule 집합을 담고 있지는 않습니다.

대신:

```txt
Ticket -> Category -> Tenant-scoped Behavior
```

이 구조는 모델을 더 깔끔하게 만들고, 동작을 더 잘 설정 가능하게 만듭니다.

### 3. 티켓 외부의 불변 이력

티켓은 자기 자신의 history를 내부에 저장하지 않습니다.

대신:

- 모든 변경은 `TicketHistory`에 기록됩니다.
- ticket은 현재 상태만 표현합니다.

### 4. 관련 상호작용 모델로서의 Activity

Ticket은 시스템의 현재 상태를 표현하고,
Activity와 History는 시스템이 어떻게 변화하는지를 표현합니다.

대신:

- 의미 있는 상호작용은 `TicketActivity`로 표현됩니다.
- 구조화된 커뮤니케이션과 운영 액션은 통합 모델을 공유합니다.
- 최근 activity metadata는 빠른 UI 접근을 위해 ticket read model에 노출됩니다.

### 5. Session-Based Work Tracking

작업은 하나의 단일 숫자 source-of-truth로 표현되지 않습니다.

대신:

- 작업은 여러 session의 집합입니다.
- `trackTimeMinutes`는 파생되거나 집계됩니다.
- 상세 추적은 별도 모델에서 처리됩니다.

---

## 관계

Ticket은 여러 도메인 모델과 상호작용합니다.

```txt
Ticket
  -> Category (tenant-scoped)
  -> Approval
  -> Assignment
  -> SLA
  -> TicketActivity
  -> TicketHistory
  -> TicketTrackTime
  -> Attachment
```

이 관계 구조는 ticket model이 명확하고 명시적으로 유지되어야 하는 이유 중 하나입니다.

관련 전략 문서: [Action Strategy](./strategy/action-strategy.md)

---

## Read Model vs Write Model

### Write Model

- 업데이트에 최적화됩니다.
- 정규화된 필드를 포함합니다.
- API와 backend logic에서 사용됩니다.

### Read Model

- UI에 최적화됩니다.
- 다음과 같은 파생 필드를 포함할 수 있습니다.
  - `owner`
  - `assigned`
  - 집계된 시간
  - display 중심 metadata

---

## Derived State

일부 값은 무조건 저장하기보다 파생해야 합니다.

```ts
const isOwner = ticket.requesterId === currentUser.id;
```

특히 사용자별 컨텍스트는 가능하면 파생 상태로 처리하는 것이 좋습니다.

---

## 설계 트레이드오프

### Pros

- 명확하고 예측 가능한 구조
- 복잡한 workflow 지원
- 도메인 복잡도에 따라 확장 가능
- 관심사 분리가 효과적

### Cons

- 기본 CRUD 모델보다 복잡함
- 관련 시스템에 대한 이해가 필요함
- 초기 설계 비용이 더 큼

---

## 요약

Ticket model은 Service Desk 시스템의 중심 도메인 entity입니다.

이 모델은 다음을 목표로 설계되었습니다.

- workflow 상태를 표현한다.
- category-driven configuration과 통합된다.
- activity/history model과 자연스럽게 연결된다.
- 감사 가능성과 SLA 추적을 지원한다.
- 세부 동작을 관련 시스템에 위임하여 모델 자체는 깔끔하게 유지한다.
