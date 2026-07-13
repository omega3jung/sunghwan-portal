# 티켓 Form 및 Draft Workflow (2026-06)

## 배경

Service Desk ticket form은 처음에 다음을 지원할 수 있는 shared form surface로 설계되었다.

- ticket creation
- ticket update
- read-only viewing
- multi-step input
- category-driven defaults
- attachments
- future draft behavior

이전 form 설계는 REMOTE ticket data path와 attachment boundary가 충분히 안정적이지 않았기 때문에 server-backed draft persistence를 의도적으로 미뤘다.

당시의 실용적인 방향은 다음과 같았다.

```txt
Create / update form first
-> validate the workflow
-> add persistent draft behavior when the server boundary is clear
```

2026년 6월에는 다음 기반이 준비되었다.

- Supabase PostgreSQL ticket persistence
- server-only DTO and repository layers
- Next.js Route Handler orchestration
- requester-aware ticket queries
- LOCAL / REMOTE runtime separation
- 최종 ticket write를 위한 attachment preparation
- category-driven approval and assignment routing

이로 인해 draft에 대한 trade-off가 달라졌다.

Draft behavior는 더 이상 frontend convenience만이 아니라 REMOTE mode에서 ticket workflow의 일부로 취급할 수 있게 되었다.

동시에 구현 과정에서 ticket creation과 ticket update는 일부 field를 공유하더라도 서로 다른 workflow라는 점이 드러났다.

---

## 문제

### 1. Shared form component가 서로 다른 workflow 책임을 숨김

초기 form 방향은 mode를 사용했다.

```ts
type Mode = "create" | "update" | "view";
```

이 방식은 API semantics를 구분했지만, workflow 차이는 mode flag보다 더 컸다.

Ticket creation의 책임:

- 완전한 새 request 수집
- requester를 multi-step form으로 안내
- draft load/save
- final attachment data 준비
- approval 또는 assignment routing으로 submit

Ticket update의 책임:

- 이미 submit된 request 수정
- 현재 editable field만 노출
- status 및 permission restriction 적용
- update policy에 따른 routing preserve 또는 recalculate
- 기존 operational ticket에 대한 change 기록

하나의 큰 workflow controller는 너무 많은 branch를 축적하게 된다.

```txt
if create
if update
if draft exists
if submitted
if field is editable
if routing must reset
```

이는 새 request를 준비하는 일과 active workflow entity를 수정하는 일을 흐리게 만든다.

---

### 2. Browser-only draft state는 REMOTE에 충분하지 않음

Draft는 의미 있는 request data를 담을 수 있다.

- category
- subject
- rich-text body
- requested due date
- email recipients
- attachment recovery metadata

이를 component state 또는 browser storage에만 두면 REMOTE behavior가 약해진다.

- draft가 하나의 browser에 묶인다
- storage가 지워지면 사라질 수 있다
- server authorization이 source of truth가 아니다
- validation이 ticket rule과 달라질 수 있다
- submission이 insert/delete coordination을 필요로 할 수 있다

REMOTE persistence가 존재하는 이상, REMOTE draft는 server data source가 소유해야 한다.

---

### 3. Draft를 새 ticket으로 submit하면 identity가 중복됨

가능한 접근은 다음과 같았다.

```txt
Save temporary draft
-> submit
-> insert a new ticket
-> delete temporary draft
```

이는 불필요한 문제를 만든다.

- draft와 submitted ticket이 서로 다른 ID를 가진다
- attachment 및 form state를 copy해야 한다
- delete와 insert가 부분 실패할 수 있다
- timestamp와 history를 설명하기 어려워진다
- duplicate submission이 여러 ticket을 만들 수 있다
- UI가 cleanup을 책임지게 된다

Draft는 이미 준비 중인 request 자체를 나타낸다.

Submission은 같은 row를 active workflow로 전진시켜야 한다.

---

### 4. Draft save에는 application-level upsert 정책이 필요했음

Draft는 한 번 생성된 뒤 반복 저장될 수 있다.

UI가 save attempt마다 새 draft를 만들면 duplicate row와 ambiguous submission behavior가 생길 수 있다.

따라서 application behavior는 다음이어야 했다.

```txt
No current Draft
-> insert a Draft ticket

Current Draft exists
-> update the existing Draft ticket
```

정확한 endpoint shape는 변할 수 있지만, product behavior는 upsert-like로 유지되어야 한다.

---

## 결정

New-ticket creation과 submitted-ticket update를 분리한다.

새 request workflow에는 `CreateTicketDialog`를 사용한다.

Submitted ticket의 requester edit에는 `UpdateTicketDialog` 같은 별도 update workflow를 사용한다.

REMOTE mode에서는 draft를 normal ticket row로 저장한다.

```txt
tk_status = 'Draft'
```

Requester가 ticket을 submit하면 같은 row를 재사용한다.

```txt
Create draft
-> update draft
-> submit same row
-> resolve approval or work assignment routing
```

LOCAL mode는 같은 visible workflow를 가능한 한 유지하되 simplified demo-safe implementation을 사용한다.

UI는 storage mechanism을 직접 아는 대신 같은 feature-level draft workflow를 소비해야 한다.

---

## 범위 규칙

### 1. Create와 update workflow를 분리함

`CreateTicketDialog`의 책임:

- new-ticket workflow 열기
- current requester draft load
- form initialize
- multi-step form 안내
- 각 step validation
- draft data save
- final submission data 준비
- request submit
- success 이후 local form state reset

Update workflow의 책임:

- existing submitted ticket load
- requester permission 확인
- editable status 확인
- allowed field만 노출
- update-specific validation 적용
- routing preservation 또는 recalculation 적용
- update history 기록

두 workflow는 low-level UI part를 공유할 수 있지만 하나의 큰 workflow controller를 공유해서는 안 된다.

```txt
Create = prepare and submit a new request
Update = revise an existing workflow entity
```

---

### 2. Ticket viewing은 page responsibility로 유지함

Ticket viewing은 page-level workflow로 남는다.

```txt
/service-desk/[ticketId]
```

실제 use case가 없는 별도 form `view` mode는 유지하지 않는다.

이는 interaction policy를 보존한다.

```txt
Page   -> primary workflow
Drawer -> secondary interaction
Dialog -> atomic or focused action
```

---

### 3. REMOTE draft를 ticket table에 저장함

REMOTE draft는 normal ticket table을 사용한다.

Draft가 처음 생성될 때 database가 `tk_id`를 생성한다.

Draft row는 다음 동안 이 ID를 유지한다.

- draft update
- final submission
- routing
- later ticket read
- history generation

이 방식은 별도 draft table에서 submitted ticket table로 data를 copy하는 일을 피한다.

---

### 4. Temporary draft ticket number를 사용함

Normal submitted ticket number가 assign 또는 finalize되기 전 draft는 requester-specific temporary ticket number를 사용한다.

```txt
<requesterUsername>_draft
```

예시:

```txt
sunghwan_draft
```

이 값은 draft state를 위한 internal persistence identifier다.

최종 user-facing operational ticket number가 아니다.

---

### 5. Requester당 active draft 하나만 허용함

Requester는 active draft를 최대 하나만 가질 수 있다.

```txt
Requester -> zero or one Draft
```

이는 database boundary에서 강제하고, application도 save 전에 current draft를 load한다.

현재 product에는 general draft list가 없다.

Multiple draft는 별도 product capability가 필요하다.

- draft title
- draft list UI
- explicit deletion
- expiration policy
- concurrent request preparation

---

### 6. Upsert-like application behavior로 draft를 저장함

`CreateTicketDialog`에서 save할 때 application behavior는 다음과 같다.

```txt
No current Draft
-> insert a Draft ticket

Current Draft exists
-> update the existing Draft ticket
```

Client state가 stale하더라도 server boundary는 invariant를 보호해야 한다.

Server는 다음을 validate한다.

- authenticated requester
- draft ownership
- `status = Draft`
- active row state

Client는 ID를 전달했다는 이유만으로 다른 requester의 draft를 쓸 수 없다.

---

### 7. Draft row를 재사용해 submit함

Persisted draft를 submit하면 existing ticket row를 update한다.

새 ticket을 insert하고 draft를 delete하지 않는다.

```txt
Draft row
-> submission
-> same row leaves Draft
```

Client는 성공적인 submission 이후 REMOTE draft deletion operation을 호출하면 안 된다.

Row가 더 이상 `status = Draft`가 아니게 되면 requester draft query에서 자연스럽게 사라진다.

---

### 8. Prior draft save 없이 direct submission도 지원함

Server는 다음 submission case를 지원한다.

```txt
draft ID provided
-> validate ownership
-> verify status = Draft
-> submit same row
```

```txt
no draft ID, but requester draft exists
-> resolve current requester draft
-> submit same row
```

```txt
no draft ID and no requester draft
-> insert a new submitted ticket
```

이는 stale UI state로부터 workflow를 보호하면서 direct submission도 허용한다.

---

### 9. Final routing은 ticket service에 위임함

Form은 최종 operational status를 결정하지 않는다.

Submission의 의미는 다음과 같다.

```txt
Draft preparation completed
-> request enters active workflow
```

Server routing layer가 submitted request가 다음 중 어디로 갈지 결정한다.

```txt
Draft -> Approval
```

또는:

```txt
Draft -> Assigned
```

Approval과 assignment rule은 form component가 아니라 ticket routing domain에 속한다.

---

### 10. Operational query에서 draft를 제외함

Draft는 active Service Desk work가 아니다.

일반 ticket list와 work query는 다음을 제외한다.

```txt
status = Draft
```

Requester draft query는 명시적으로 다음을 찾는다.

```txt
requester = current requester
status = Draft
active = true
```

Draft는 다음이 아니다.

- assigned work
- approval 대기
- operational insights 포함 대상
- creation workflow 밖에서 수정할 수 있는 ticket

---

### 11. LOCAL과 REMOTE runtime boundary를 명확히 함

REMOTE mode는 server data layer를 통해 draft를 persist한다.

LOCAL mode는 simplified demo-safe implementation을 사용할 수 있다.

UI는 draft가 LOCAL demo behavior 기반인지 REMOTE PostgreSQL 기반인지에 의존해서는 안 된다.

Runtime-specific persistence는 feature API/repository boundary 뒤에 남는다.

---

### 12. Attachment persistence boundary를 명시함

Draft persistence는 raw binary data, base64 image data, blob URL을 저장하면 안 된다.

Draft와 submitted ticket persistence는 durable ticket boundary를 넘을 때 같은 normalized attachment contract를 공유해야 한다.

Attachment preparation과 storage behavior는 attachment boundary decision에서 정의한다.

---

### 13. Server state에는 React Query를 사용함

REMOTE mode에서 Draft는 server state다.

React Query는 client synchronization을 제공한다.

Persistence source of truth가 아니다.

권장 behavior:

```txt
Save draft
-> update or invalidate current requester draft query

Submit draft
-> invalidate current requester draft
-> invalidate ticket list
-> invalidate submitted ticket detail
-> invalidate affected insight/count queries
```

Global query reset은 필요하지 않다.

---

## 정렬한 내용

### 1. Component responsibility

`CreateTicketDialog`는 new-request composition workflow다.

Submitted-ticket update rule은 별도 update workflow에서 처리한다.

---

### 2. REMOTE draft model

REMOTE draft는 `Draft` status를 가진 requester-owned ticket row다.

별도 table도 아니고 browser-only state도 아니다.

---

### 3. Submission identity

Draft가 있으면 submission은 draft row를 재사용한다.

이는 draft부터 active workflow까지 ticket identity를 안정적으로 유지한다.

---

### 4. Runtime boundary

LOCAL과 REMOTE는 서로 다른 persistence mechanism을 사용할 수 있지만 feature workflow는 안정적으로 유지된다.

UI는 database-specific draft logic을 포함하면 안 된다.

---

## 결과 영향

### 긍정적 영향

- Ticket creation의 component boundary가 더 명확해진다.
- REMOTE draft가 server authorization으로 보호된다.
- 같은 ticket ID가 draft부터 submitted ticket까지 이어질 수 있다.
- Submission이 insert/delete coordination을 피한다.
- Operational ticket query가 `Draft`를 명시적으로 제외할 수 있다.
- LOCAL은 lightweight하게 유지하면서 REMOTE draft model을 약화시키지 않는다.

---

### 부정적 영향 / 트레이드오프

- Draft row가 main ticket table에 존재한다.
- 현재 product는 requester당 active draft 하나만 지원한다.
- Draft save에는 명확한 create/update 또는 upsert-like orchestration이 필요하다.
- LOCAL draft behavior는 REMOTE persistence보다 단순할 수 있다.
- Full production draft upload recovery는 future storage concern으로 남는다.

---

## 후속 정책

- `CreateTicketDialog`는 new request composition에 집중시킨다.
- Submitted-ticket update behavior는 별도 workflow에 둔다.
- REMOTE draft ownership과 status check는 server에서 유지한다.
- Product-level draft list design 없이 multiple draft를 추가하지 않는다.
- REMOTE draft row는 submission 이후 delete하지 않고 같은 row를 submit한다.
- Production storage가 생기기 전까지 draft attachment behavior를 과장하지 않는다.
- Server-side draft upsert가 나중에 도입되더라도 one-active-draft invariant를 유지한다.

---

## 요약

Ticket creation workflow는 REMOTE Draft를 실제 ticket workflow state로 취급한다.

핵심 모델은 다음과 같다.

```txt
CreateTicketDialog
= new request preparation + draft save + final submission

REMOTE Draft
= requester-owned ticket row with status Draft

Draft submission
= same row leaves Draft and enters Approval or Assigned routing

Update workflow
= separate revision flow for submitted tickets
```

이 설계는 UI 수준에서 ticket creation을 이해하기 쉽게 유지하면서, REMOTE mode에는 안정적인 server-controlled persistence model을 제공한다.
