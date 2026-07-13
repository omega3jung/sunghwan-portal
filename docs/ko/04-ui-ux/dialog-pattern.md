# Dialog 패턴

## 목표

Dialog는 집중된 임시 상호작용에 사용한다. Service Desk의 주요 워크플로를
page 대신 dialog 안에 숨기지 않는다.

현재 Service Desk UI에서 dialog를 사용하는 영역:

- 티켓 생성
- 요청자 소유 티켓 수정
- 티켓 액션 command form
- 필요한 경우 확인/취소 dialog

티켓 상세는 page로 유지한다.

---

## 핵심 원칙

```txt id="dialog-core"
집중 액션에는 dialog를 사용한다.
주요 workflow에는 page를 사용한다.
```

---

## Page vs Dialog

| Dialog 사용 | Page 사용 |
| --- | --- |
| 짧은 form | 오래 머무르는 workflow |
| command 실행 | 티켓 상세 |
| 확인/취소 | 목록/검색 workflow |
| 임시 상호작용 | 공유 가능한 resource view |

예시:

- 티켓 생성 -> dialog
- 요청자 수정 -> dialog
- approve/reject/comment/note/assign action -> dialog 또는 도구 surface
- 티켓 상세 -> page

---

## 현재 티켓 Dialog

### Create Ticket Dialog

`CreateTicketDialog`는 신규 티켓 워크플로를 담당한다.

책임:

- 생성 form 단계 관리
- active draft 로드
- dirty 상태로 닫을 때 draft 저장
- 제출 전 첨부 prepare
- create-ticket mutation 호출
- 성공 후 reset과 close

### Update Ticket Dialog

`UpdateTicketDialog`는 작업 시작 전 요청자 수정을 담당한다.

책임:

- 열릴 때 최신 ticket detail 로드
- 기존 prepared attachment 보존
- 새 파일/이미지 prepare
- requester update 제출
- routing reset/preservation 영향을 표시

### Action Dialog

Ticket action dialog는 generic edit form이 아니라 command input이다.

예시:

- approve
- decline
- comment
- note
- assign
- adjust
- reject
- merge
- reopen
- resubmit
- cancel

각 action은 서버 action rule이 허용하는 필드만 보여야 한다.

---

## Generic `TicketFormDialog`를 사용하지 않음

현재 구현을 하나의 generic `TicketFormDialog`로 설명하지 않는다.

생성과 수정은 필드를 공유하지만 workflow가 다르다.

- create는 draft load/save/submit 동작을 가진다.
- update는 open 시 최신 ticket detail을 로드한다.
- update는 기존 attachment와 신규 prepared attachment를 병합한다.
- update는 routing reset 또는 preservation을 유발할 수 있다.

분리된 hook/component가 이 차이를 명확하게 유지한다.

---

## Controlled Open State

Dialog open 상태는 소유 component가 제어한다.

```tsx id="dialog-open-state"
const [open, setOpen] = useState(false);
```

이를 통해 다음이 가능해진다.

- mutation 성공 후 닫기
- 닫을 때 form reset
- create close 시 draft 저장
- update open 시 detail data 로드

---

## 데이터 로드 정책

Dialog는 자신이 entry point인 경우에만 데이터를 fetch한다.

예시:

- `CreateTicketDialog`는 open 시 active draft를 로드할 수 있다.
- `UpdateTicketDialog`는 stale edit를 피하기 위해 open 시 최신 detail을 로드한다.
- action dialog는 특별한 데이터가 필요하지 않다면 page가 이미 해석한 ticket/action availability를 사용한다.

---

## 첨부 정책

Attachment 입력을 받는 dialog는 raw `File`을 열린 form 내부에만 둔다.

티켓 생성, 요청자 수정, attachment 지원 action을 제출하기 전 Attachment Prepare
API를 호출하고 준비된 metadata를 command payload로 보낸다.

Raw file은 global state나 React Query에 저장하지 않는다.

---

## 닫기 정책

성공 시:

- dialog를 닫는다.
- local form state를 reset한다.
- 관련 React Query data를 invalidate한다.

Create cancel/close에서 dirty input이 있으면:

- draft workflow가 활성화된 경우 draft를 저장한다.
- 첨부 복구는 보장하지 않는다.

Update/action cancel은 별도 draft 규칙이 없는 한 미저장 local input을 버린다.

---

## 안티패턴

### 티켓 상세를 Dialog에 넣기

티켓 상세는 중요하고 공유 가능한 resource이므로 page로 유지한다.

### 중첩 Dialog Stack

티켓 action에서 dialog 위에 dialog를 쌓지 않는다.

### 숨은 Workflow Mutation

Dialog는 명시적 mutation/command를 호출해야 하며 필드 편집으로 workflow state를
간접 변경하지 않는다.

### 이른 Generic Abstraction

create, update, action command의 workflow 규칙이 다른데 하나의 abstraction에
억지로 넣지 않는다.

---

## 관련 문서

- [`form-pattern.md`](form-pattern.md)
- [`../02-architecture/routing-strategy.md`](../02-architecture/routing-strategy.md)
- [`../06-form-design/ticket-form.md`](../06-form-design/ticket-form.md)
- [`../06-form-design/ticket-attachment.md`](../06-form-design/ticket-attachment.md)

---

## 요약

Dialog는 집중된 workflow surface이다. 현재 Service Desk 구현은 create, update,
action dialog 흐름을 분리하고, 티켓 상세는 page-level resource로 유지한다.
