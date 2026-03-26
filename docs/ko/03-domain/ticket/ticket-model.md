# 티켓 모델

## 목적

티켓 모델은 서비스 데스크 시스템에서 티켓을 워크플로 엔티티로 표현하는
핵심 도메인 구조를 정의한다.

이 모델의 목표는 다음과 같다.

- 티켓을 구조화되고 상태를 가진 엔티티로 표현한다.
- 단순 CRUD가 아니라 워크플로 중심 동작을 지원한다.
- API, UI, 도메인 로직 전반의 일관성을 유지한다.
- 데이터 처리와 렌더링을 위한 명확한 계약을 제공한다.

---

## 핵심 개념

```txt
A ticket is not just data; it is a workflow entity with state, ownership, and context.
```

티켓은 다음과 같은 대상을 나타낸다.

- 요청
- 이슈
- 작업

그리고 이 대상은 정의된 생명주기를 따라 이동하며, 할당된 사용자에 의해 처리된다.

단순한 데이터 모델과 달리, 티켓은 다음 특징을 가진다.

- 시간에 따라 변화한다.
- 여러 도메인 시스템과 상호작용한다.
- 이력과 감사 가능성을 유지한다.

---

## 도메인 형태

티켓 모델은 워크플로, 운영 UI, 관련 시스템이 필요로 하는 현재 상태를 노출한다.

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

  owner: boolean;
  assigned: boolean;
  active: boolean;

  files: Attach[];
  images: Attach[];
}
```

---

## 핵심 모델 영역

### 식별 정보

- `id`: 고유 식별자
- `ticketNumber`: 사람이 읽을 수 있는 참조 번호

### 타임스탬프

- `createdAt`: 티켓이 생성된 시점
- `updatedAt`: 마지막 수정 시점

### 요청 컨텍스트

- `requesterId`: 티켓을 생성한 사용자
- `subject`: 요청 요약
- `body`: 상세 설명

### 상태와 워크플로

- `status`: 현재 워크플로 상태
- `priority`: 긴급도 수준
- `approvalStepId`: 필요한 경우 현재 승인 컨텍스트

관련 문서: [Ticket Lifecycle](./ticket-lifecycle.md)

---

### 카테고리

- `categoryId`: 티켓을 카테고리 설정과 연결한다.

카테고리는 다음을 결정한다.

- 할당
- SLA 동작
- 승인 필요 여부
- 워크플로 동작

즉, 티켓은 이러한 규칙을 내부에 직접 담기보다 카테고리 설정에 의존한다.

관련 문서: [Category Strategy](./strategy/category-strategy.md)

---

### 할당

- `assigneeIds`: 현재 책임 사용자 목록

할당은 실행, 소유권, 운영 가시성에 직접 영향을 주기 때문에
핵심 모델의 일부로 취급된다.

관련 문서: [Assignment Policy](./strategy/assignment-policy.md)

---

### SLA

- `dueAt`: SLA 규칙에 따라 계산된 마감 시점

이 필드를 통해 긴급도와 시간 기대치를 티켓 수준에서 직접 드러낼 수 있다.

관련 문서: [SLA Strategy](./strategy/sla-strategy.md)

---

### 작업 추적

- `trackTimeMinutes`: 집계된 작업 시간

실제 작업 세션은 별도의 track-time 모델에서 관리된다.

관련 문서: [Ticket Track Time](./ticket-track-time.md)

---

### 활동 메타데이터

- `lastCommentAt`: 마지막 상호작용 시각
- `lastCommenterEmail`: 빠른 UI 렌더링을 위한 마지막 행위자 정보

이 필드들은 전체 이력을 모두 읽지 않고도 최근 활동을 UI에 노출할 수 있게 해 준다.

---

### 소유권 플래그

티켓은 파생된 소유권 플래그도 함께 제공한다.

```ts
type Ownership = {
  owner: boolean;
  assigned: boolean;
};
```

- `owner`: 현재 사용자가 요청자인 경우
- `assigned`: 현재 사용자가 담당자인 경우

이 플래그는 다음과 같은 용도로 유용하다.

- 권한 처리
- 조건부 UI 렌더링

---

### 첨부파일

- `files`: 일반 첨부파일
- `images`: 이미지 전용 첨부파일

첨부파일의 세부 동작은 별도 시스템이 처리할 수 있지만,
티켓 컨텍스트의 일부로 유지된다.

---

### 활성 상태

- `active`: soft-delete 플래그

일반적인 워크플로에서는 티켓을 물리적으로 삭제하지 않는다.
이 모델은 이력, 리포팅, 참조 무결성을 보존하기 위해 이를 유지한다.

관련 문서: [Ticket History](./ticket-history.md)

---

## 도메인 특성

### 1. 워크플로 중심

티켓은 정적인 데이터가 아니다.

- 시간에 따라 상태가 바뀐다.
- 도메인 이벤트를 발생시킨다.
- 여러 하위 시스템과 상호작용한다.

### 2. 카테고리 중심 동작

티켓 자체는 전체 비즈니스 규칙을 모두 포함하지 않는다.

대신:

```txt
Ticket -> Category -> Behavior
```

이 방식은 모델을 더 깔끔하게 유지하고,
동작을 더 구성 가능하게 만든다.

### 3. 티켓 외부의 불변 이력

티켓은 내부에 자체 이력을 저장하지 않는다.

대신:

- 모든 변경은 `TicketHistory` 에 기록된다.
- 티켓은 현재 상태만 표현한다.

### 4. 세션 기반 작업 추적

작업은 하나의 원본 수치로 표현되지 않는다.

대신:

- 작업은 세션들의 집합이다.
- `trackTimeMinutes` 는 파생값 또는 집계값이다.
- 상세 추적은 별도 모델에서 처리된다.

---

## 관계

티켓은 여러 도메인 모델과 상호작용한다.

```txt
Ticket
  -> Category
  -> Approval
  -> Assignment
  -> SLA
  -> TicketHistory
  -> TicketTrackTime
  -> Comment / Attachment
```

이 관계 구조 때문에 티켓 모델은 특히 명확하고 분명해야 한다.

---

## 읽기 모델과 쓰기 모델

### Write Model

- 업데이트에 최적화되어 있다.
- 정규화된 필드를 포함한다.
- API 및 백엔드 로직에서 사용된다.

### Read Model

- UI에 최적화되어 있다.
- 다음과 같은 파생 필드를 포함할 수 있다.
  - `owner`
  - `assigned`
  - 집계된 시간
  - 표시용 메타데이터

---

## 파생 상태

어떤 값들은 무조건 저장하기보다 파생해서 계산하는 편이 더 적절하다.

```ts
const isOwner = ticket.requesterId === currentUser.id;
```

특히 사용자별 컨텍스트는 가능한 한 파생 상태로 계산하는 것이 바람직하다.

---

## 설계 트레이드오프

### 장점

- 구조가 명확하고 예측 가능하다.
- 복잡한 워크플로를 지원할 수 있다.
- 도메인 복잡도 증가에 맞춰 확장 가능하다.
- 관심사를 효과적으로 분리한다.

### 단점

- 기본 CRUD 모델보다 더 복잡하다.
- 관련 시스템에 대한 이해가 필요하다.
- 초기 설계 비용이 더 높다.

---

## 요약

티켓 모델은 서비스 데스크 시스템의 중심 도메인 엔티티이다.

이 모델은 다음을 목표로 설계되었다.

- 워크플로 상태를 표현한다.
- 카테고리 중심 설정과 통합된다.
- 감사 가능성과 SLA 추적을 지원한다.
- 상세 동작은 관련 시스템에 위임함으로써 모델 자체는 깔끔하게 유지한다.
