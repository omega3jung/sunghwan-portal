# 티켓 Form 및 Draft Workflow (2026-06)

## 배경

Service Desk 티켓 폼은 처음에 다음 작업을 하나의 공통 폼으로 지원하도록 설계했습니다.

- 티켓 생성
- 티켓 수정
- 읽기 전용 조회
- 단계별 입력
- 카테고리에 따른 기본값
- 첨부파일
- 향후 초안 기능

이전 폼 설계에서는 REMOTE 티켓 데이터 처리와 첨부 준비·저장의 역할이 충분히
안정적이지 않아 서버에 초안을 저장하는 기능을 미뤘습니다.

당시의 실용적인 방향은 다음과 같았습니다.

```txt
Create / update form first
-> validate the workflow
-> add persistent draft behavior when the server boundary is clear
```

2026년 6월에는 다음 기반이 준비되었습니다.

- Supabase PostgreSQL 티켓 저장
- 서버 전용 DTO·Repository 계층
- Next.js Route Handler의 요청 조정
- 요청자를 고려한 티켓 조회
- LOCAL / REMOTE 실행 환경 분리
- 최종 티켓 저장 전 첨부 준비
- 카테고리에 따른 승인자 결정과 작업자 배정

이 기반이 마련되면서 초안 기능을 도입할 때의 장단점도 달라졌습니다.
REMOTE에서는 초안을 화면의 편의 기능에 그치지 않고 티켓 업무 흐름의 일부로
다룰 수 있게 되었습니다.

또한 생성과 수정은 일부 필드가 같아도 서로 다른 업무 흐름이라는 점이 드러났습니다.

---

## 문제

### 1. Shared form component가 서로 다른 workflow 책임을 숨김

초기 폼은 모드로 작업을 구분했습니다.

```ts
type Mode = "create" | "update" | "view";
```

모드로 API 처리 의미는 구분했지만, 생성과 수정의 역할 차이를 충분히 드러내지는 못했습니다.

티켓 생성의 역할은 다음과 같습니다.

- 새 요청에 필요한 전체 입력 수집
- 요청자의 단계별 입력 안내
- 초안 불러오기·저장
- 최종 첨부 데이터 준비
- 승인자 결정 또는 작업자 배정 단계로 제출

티켓 수정의 역할은 다음과 같습니다.

- 이미 제출한 요청 수정
- 현재 수정 가능한 필드만 표시
- 상태·권한 제한 적용
- 수정 정책에 따라 기존 승인·배정을 유지하거나 다시 계산
- 운영 중인 기존 티켓의 변경 기록

전체 흐름을 하나의 큰 컨트롤러에서 처리하면 분기가 지나치게 많아집니다.

```txt
if create
if update
if draft exists
if submitted
if field is editable
if routing must reset
```

그러면 새 요청 준비와 이미 진행 중인 티켓 수정의 차이를 파악하기 어렵습니다.

---

### 2. Browser-only draft state는 REMOTE에 충분하지 않음

초안에는 다음 요청 데이터를 담을 수 있습니다.

- 카테고리
- 제목
- 서식 있는 본문
- 요청 기한
- 이메일 수신자
- 첨부 복구용 메타데이터

이 데이터를 컴포넌트 상태나 브라우저 저장소에만 두면 REMOTE에서 다음 한계가 생깁니다.

- 초안이 한 브라우저에 묶입니다.
- 저장소를 지우면 초안이 사라질 수 있습니다.
- 서버 권한 검사가 초안 접근을 판단하는 기준이 되지 못합니다.
- 검증 방식이 티켓 규칙과 달라질 수 있습니다.
- 제출 시 새 티켓 생성과 초안 삭제를 조합해야 할 수 있습니다.

REMOTE 저장 기능이 마련된 이상, REMOTE 초안은 서버 데이터 저장소에서 관리해야 합니다.

---

### 3. Draft를 새 ticket으로 submit하면 identity가 중복됨

가능한 접근은 다음과 같았습니다.

```txt
Save temporary draft
-> submit
-> insert a new ticket
-> delete temporary draft
```

이는 불필요한 문제를 만듭니다.

- 초안과 제출된 티켓의 ID가 달라집니다.
- 첨부와 폼 상태를 복사해야 합니다.
- 삭제와 삽입 중 일부만 성공할 수 있습니다.
- 타임스탬프와 이력을 설명하기 어렵습니다.
- 중복 제출로 여러 티켓이 생길 수 있습니다.
- UI가 초안 정리를 담당해야 합니다.

초안은 이미 준비 중인 요청 자체를 나타냅니다.

제출할 때는 같은 행을 운영 중인 업무 흐름으로 전환해야 합니다.

---

### 4. Draft save에는 application-level upsert 정책이 필요했음

초안은 생성 후 반복해서 저장할 수 있습니다.
UI가 저장할 때마다 새 초안을 만들면 행이 중복되고 어떤 초안을 제출하는지 모호해집니다.
따라서 애플리케이션은 다음과 같이 동작해야 했습니다.

```txt
No current Draft
-> insert a Draft ticket

Current Draft exists
-> update the existing Draft ticket
```

엔드포인트 형식은 바뀔 수 있지만, 초안이 없으면 생성하고 있으면 갱신하는
upsert와 같은 동작은 유지해야 합니다.

---

## 결정

새 티켓 생성과 제출된 티켓의 수정을 분리하기로 했습니다.
새 요청은 `CreateTicketDialog`에서 처리합니다. 제출된 티켓을 요청자가 수정할 때는
`UpdateTicketDialog` 같은 별도 수정 흐름을 사용합니다.

REMOTE에서는 초안을 일반 티켓 행으로 저장합니다.

```txt
tk_status = 'Draft'
```

요청자가 티켓을 제출하면 같은 행을 재사용합니다.

```txt
Create draft
-> update draft
-> submit same row
-> resolve approval or work assignment routing
```

LOCAL은 사용자가 보는 흐름을 가능한 한 유지하되, 안전하게 시연할 수 있도록
구현을 단순화합니다. UI는 저장 방식에 직접 의존하지 않고 같은 기능 단위의
초안 처리 흐름을 사용해야 합니다.

---

## 범위 규칙

### 1. Create와 update workflow를 분리함

`CreateTicketDialog`의 책임:

- 새 티켓 생성 흐름 열기
- 현재 요청자의 초안 불러오기
- 폼 초기화
- 단계별 폼 입력 안내
- 각 단계 검증
- 초안 데이터 저장
- 최종 제출 데이터 준비
- 요청 제출
- 성공 후 로컬 폼 상태 초기화

수정 흐름의 역할:

- 이미 제출된 티켓 불러오기
- 요청자 권한 확인
- 수정 가능한 상태인지 확인
- 허용된 필드만 표시
- 수정 전용 검증 적용
- 기존 승인·배정 유지 또는 재계산
- 수정 이력 기록

두 흐름은 작은 UI 요소를 공유할 수 있지만, 전체 흐름을 제어하는 하나의 큰
컨트롤러를 공유해서는 안 됩니다.

```txt
Create = prepare and submit a new request
Update = revise an existing workflow entity
```

---

### 2. Ticket viewing은 page responsibility로 유지함

티켓 조회는 페이지에서 처리합니다.

```txt
/service-desk/[ticketId]
```

실제 사용 사례가 없는 별도의 폼 `view` 모드는 유지하지 않습니다.
다음 화면 사용 규칙을 유지합니다.

```txt
Page   -> primary workflow
Drawer -> secondary interaction
Dialog -> atomic or focused action
```

---

### 3. REMOTE draft를 ticket table에 저장함

REMOTE 초안은 일반 티켓 테이블을 사용합니다.
초안을 처음 생성할 때 데이터베이스가 `tk_id`를 생성합니다.

초안 행은 다음 과정에서도 같은 ID를 유지합니다.

- 초안 수정
- 최종 제출
- 승인자 결정·작업자 배정
- 이후 티켓 조회
- 이력 생성

이 방식으로 별도 초안 테이블에서 제출된 티켓 테이블로 데이터를 복사할 필요가 없습니다.

---

### 4. Temporary draft ticket number를 사용함

제출된 티켓의 일반 번호를 부여하거나 확정하기 전에는 요청자별 임시 초안 번호를 사용합니다.

```txt
<requesterUsername>_draft
```

예시:

```txt
sunghwan_draft
```

이 값은 초안 저장에 사용하는 내부 식별자입니다.
사용자에게 제공하는 최종 운영 티켓 번호는 아닙니다.

---

### 5. Requester당 active draft 하나만 허용함

요청자는 활성 초안을 최대 하나만 가질 수 있습니다.

```txt
Requester -> zero or one Draft
```

데이터베이스에서 이 제한을 강제하고, 애플리케이션도 저장 전에 현재 초안을 조회합니다.
당시 제품에는 여러 초안을 보여주는 일반 초안 목록이 없습니다.

여러 초안을 지원하려면 다음 기능이 별도로 필요합니다.

- 초안 제목
- 초안 목록 UI
- 명시적 삭제
- 만료 정책
- 여러 요청의 동시 준비

---

### 6. Upsert-like application behavior로 draft를 저장함

`CreateTicketDialog`에서 저장할 때 애플리케이션은 다음과 같이 동작합니다.

```txt
No current Draft
-> insert a Draft ticket

Current Draft exists
-> update the existing Draft ticket
```

클라이언트 상태가 오래되어도 서버는 요청자당 활성 초안 하나라는 규칙을 지켜야 합니다.
서버는 다음을 검증합니다.

- 인증된 요청자
- 초안 소유권
- `status = Draft`
- 행의 활성 상태

클라이언트는 ID를 전달했다는 이유만으로 다른 요청자의 초안을 수정할 수 없습니다.

---

### 7. Draft row를 재사용해 submit함

저장된 초안을 제출하면 기존 티켓 행을 갱신합니다.
새 티켓을 만든 뒤 초안을 삭제하는 방식은 사용하지 않습니다.

```txt
Draft row
-> submission
-> same row leaves Draft
```

클라이언트는 제출 성공 후 REMOTE 초안 삭제 작업을 호출하면 안 됩니다.

행이 더 이상 `status = Draft`가 아니면 요청자의 초안 조회 결과에 포함되지 않습니다.

---

### 8. Prior draft save 없이 direct submission도 지원함

서버는 다음 제출 경우를 지원합니다.

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

이렇게 하면 오래된 UI 상태로 인한 잘못된 제출을 막으면서 직접 제출도 허용할 수 있습니다.

---

### 9. Final routing은 ticket service에 위임함

폼은 제출 후 티켓의 최종 운영 상태를 결정하지 않습니다.

제출의 의미는 다음과 같습니다.

```txt
Draft preparation completed
-> request enters active workflow
```

서버의 담당자 결정 로직이 제출된 요청의 다음 단계를 결정합니다.

```txt
Draft -> Approval
```

또는:

```txt
Draft -> Assigned
```

승인과 배정 규칙은 폼 컴포넌트가 아니라 티켓의 담당자 결정 도메인에서 처리합니다.

---

### 10. Operational query에서 draft를 제외함

초안은 진행 중인 Service Desk 작업이 아닙니다.
일반 티켓 목록과 작업 조회는 다음 상태를 제외합니다.

```txt
status = Draft
```

요청자 초안 조회는 다음 조건에 맞는 행을 명시적으로 찾습니다.

```txt
requester = current requester
status = Draft
active = true
```

초안은 다음에 해당하지 않습니다.

- 배정된 작업
- 승인 대기
- 운영 분석 포함 대상
- 생성 흐름 밖에서 수정할 수 있는 티켓

---

### 11. LOCAL과 REMOTE runtime boundary를 명확히 함

REMOTE는 서버 데이터 계층을 통해 초안을 저장합니다.
LOCAL은 안전하게 시연할 수 있는 단순한 구현을 사용할 수 있습니다.
UI는 초안이 LOCAL 데모 상태에 있는지 REMOTE PostgreSQL에 있는지에 따라 분기하면 안 됩니다.
실행 환경별 저장 방식은 기능 API·Repository 내부에서 처리합니다.

---

### 12. Attachment persistence boundary를 명시함

초안에는 원본 바이너리 데이터, base64 이미지 데이터, blob URL을 저장하면 안 됩니다.
초안과 제출된 티켓을 지속적으로 보관할 때는 같은 방식으로 정리한 첨부 형식을 사용해야 합니다.
첨부 준비·저장 방식은 첨부 처리 역할을 구분한 결정 기록에서 정의합니다.

---

### 13. Server state에는 React Query를 사용함

REMOTE에서 초안은 서버 상태입니다. React Query는 서버 값과 클라이언트 화면을
동기화합니다. 저장된 초안의 기준 데이터는 서버 저장소에 있습니다.

권장 동작:

```txt
Save draft
-> update or invalidate current requester draft query

Submit draft
-> invalidate current requester draft
-> invalidate ticket list
-> invalidate submitted ticket detail
-> invalidate affected insight/count queries
```

전체 쿼리를 초기화할 필요는 없습니다.

---

## 정렬한 내용

### 1. Component responsibility

`CreateTicketDialog`는 새 요청을 작성하는 흐름입니다.
제출된 티켓의 수정 규칙은 별도 수정 흐름에서 처리합니다.

---

### 2. REMOTE draft model

REMOTE 초안은 요청자가 소유하는 `Draft` 상태의 티켓 행입니다.
별도 테이블이나 브라우저에만 있는 상태가 아닙니다.

---

### 3. Submission identity

초안이 있으면 제출 시 해당 행을 재사용합니다.
이렇게 하면 초안 작성부터 업무 진행까지 같은 티켓 ID를 유지합니다.

---

### 4. Runtime boundary

LOCAL과 REMOTE는 저장 방식이 달라도 같은 기능 흐름을 유지합니다.
UI에 DB 전용 초안 처리 로직을 넣으면 안 됩니다.

---

## 결과 영향

### 긍정적 영향

- 티켓 생성 컴포넌트의 역할이 명확해집니다.
- REMOTE 초안을 서버 권한 검사로 보호합니다.
- 초안부터 제출된 티켓까지 같은 티켓 ID를 유지할 수 있습니다.
- 제출 시 삽입·삭제 작업을 조정할 필요가 없습니다.
- 운영 티켓 조회에서 `Draft`를 명시적으로 제외할 수 있습니다.
- LOCAL은 단순하게 유지하면서 REMOTE 초안 모델을 보존합니다.

---

### 부정적 영향 / 트레이드오프

- 초안 행이 일반 티켓 테이블에 존재합니다.
- 당시 제품은 요청자당 활성 초안 하나만 지원합니다.
- 초안 저장 시 생성·수정 또는 upsert와 유사한 처리를 명확히 조정해야 합니다.
- LOCAL 초안 동작은 REMOTE 저장보다 단순할 수 있습니다.
- 프로덕션 수준의 초안 업로드 복구는 향후 저장소 과제로 남습니다.

---

## 후속 정책

- `CreateTicketDialog`는 새 요청 작성에 집중시킵니다.
- 제출된 티켓의 수정은 별도 흐름에서 처리합니다.
- REMOTE 초안의 소유권·상태 검사는 서버에서 수행합니다.
- 제품의 초안 목록을 설계하기 전에 여러 초안을 지원하지 않습니다.
- REMOTE 초안은 제출 후 삭제하지 않고 같은 행을 제출된 티켓으로 전환합니다.
- 프로덕션 저장소가 생기기 전까지 초안 첨부 동작을 과장하지 않습니다.
- 향후 서버 측 초안 upsert를 도입해도 요청자당 활성 초안 하나라는 규칙을 유지합니다.

---

## 요약

티켓 생성 흐름은 REMOTE 초안을 실제 티켓 업무 상태로 다룹니다.

핵심 모델은 다음과 같습니다.

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

이 설계로 UI의 티켓 생성 흐름을 이해하기 쉽게 유지하고,
REMOTE에서는 서버가 초안 접근과 저장을 안정적으로 관리합니다.
