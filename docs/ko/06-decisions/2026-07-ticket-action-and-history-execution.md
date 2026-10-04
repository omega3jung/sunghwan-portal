# 티켓 Action 및 History 실행 (2026-07)

## 배경

Service Desk는 댓글 중심 모델을 대체하기 위해 `TicketAction`을 도입했습니다.

핵심 아이디어는 다음과 같았습니다.

```txt
Comment is data.
Action is behavior.
```

이 모델로 다음 티켓 작업을 표현할 수 있게 되었습니다.

- `COMMENT`
- `NOTE`
- `ASSIGN`
- `ASSIGN_SELF`
- `ADJUST`
- `APPROVE`
- `DECLINE`
- `REJECT`
- `RESUBMIT`
- `REOPEN`
- `MERGE`
- `CANCEL`

이전 결정에서는 액션을 별도 도메인 엔티티로 표현해야 하는 이유를 설명했습니다.
2026년 7월에는 PostgreSQL에 저장된 티켓에 액션을 실제로 실행하는 방식을
정의해야 했습니다.

티켓 액션은 타임라인 기록 외에 티켓 상태와 담당자 등에도 영향을 줄 수 있습니다.

액션 유형에 따라 하나의 명령이 다음을 수행해야 할 수 있습니다.

- 현재 사용자 검증
- 티켓 조회 권한 검증
- 현재 상태 검증
- 액션별 입력 검증
- Ticket Action 기록 생성
- 티켓 필드 수정
- 승인자 결정 변경
- 작업자 배정 변경
- 티켓 상태 변경
- 수정하지 않는 History 기록 생성
- 수명주기 명령에서 요구하는 경우 관련 작업 세션 종료
- 향후 알림 기능을 연결할 지점 제공

이 과정에서 `ticket_action`에 행을 삽입하는 것만으로 Ticket Action을 구현할 수 없다는 점이 드러났습니다.

---

## 핵심 원칙

```txt
Ticket Action
= user intent + validated context + controlled effect
```

```txt
Ticket History
= immutable record of the effect that occurred
```

실행 관계는 다음과 같습니다.

```txt
Command
-> authenticate
-> authorize
-> validate current state
-> insert action when applicable
-> mutate ticket when applicable
-> create history
-> return stable DTOs
```

활동 행을 생성하는 것만으로 액션이 완료되지는 않습니다.
티켓 상태와 이력 모두 같은 명령이 성공한 결과를 반영해야 합니다.

---

## 문제

### 1. Action insert만으로는 operation을 표현하지 못함

다음의 단순 구현은 충분하지 않습니다.

```txt
POST action
-> INSERT ticket_action
```

일반 댓글에는 사용할 수 있지만, 운영 액션에는 실제 티켓 변경도 필요합니다.

예시:

- `ASSIGN`은 담당자와 상태를 변경할 수 있습니다.
- `APPROVE`는 승인을 진행하거나 작업자 배정을 결정할 수 있습니다.
- `ADJUST`는 우선순위, 위험도, 기한을 변경할 수 있습니다.
- `MERGE`는 원본 티켓을 종료하고 병합 참조를 저장할 수 있습니다.
- `CANCEL`은 티켓을 종료하고 종료 사유를 기록할 수 있습니다.

액션 행은 사용자가 요청한 작업 의도를 기록합니다.
명령은 그 요청에 따른 실제 도메인 변경도 적용해야 합니다.

---

### 2. Ticket, action, history write가 서로 어긋날 수 있음

관련 처리를 하나의 명령으로 묶지 않으면 일부 변경만 반영될 수 있습니다.

예시:

```txt
Insert ASSIGN action succeeds
-> ticket assignment update fails
```

타임라인에는 실제로 적용되지 않은 배정이 표시됩니다.

반대도 안전하지 않습니다.

```txt
Ticket update succeeds
-> action or history insert fails
```

티켓은 변경되었지만 감사 추적 기록은 완성되지 않습니다.

운영 명령은 트랜잭션으로 관련 저장을 함께 성공시키거나 모두 되돌려야 합니다.

---

### 3. History semantics에는 authoritative event field가 필요했음

이전 이력 모델은 "무엇이 일어났는가"를 여러 곳에 표현할 수 있었습니다.

```txt
historyAction = UPDATED
metadata.event = APPROVAL_APPROVED
type = APPROVAL
```

그러면 필터링, 화면 표시, 검증에서 어느 값을 기준으로 할지 모호해집니다.

무엇이 일어났는지 명확하게 나타내는 별도 이벤트 필드가 필요했습니다.

---

### 4. `SYSTEM`은 source와 domain area를 섞었음

History의 type은 변경된 도메인 영역을 나타내야 합니다.

- `TICKET`
- `STATUS`
- `ASSIGNMENT`
- `APPROVAL`
- `COMMENT`
- `NOTE`
- `PLANNING`

시스템이 생성했다는 정보는 변경 영역이 아니라 이벤트 출처(source)를 설명합니다.

```txt
type
-> what area changed

source
-> which behavior or rule produced it
```

시스템의 자동 종료도 상태 변경 이벤트입니다.

따라서 다음이어야 합니다.

```txt
type = STATUS
source = SYSTEM_AUTO
event = RESOLUTION_CLOSE
```

---

### 5. String-only before/after value는 약했음

단순 문자열로도 한 번의 상태 변경을 표현할 수 있습니다.

```txt
fromValue = "Open"
toValue = "Working"
```

하지만 다음과 같이 여러 정보가 필요한 변경을 표현하기는 어렵습니다.

- 이전 담당자와 이후 담당자
- 승인 단계 진행
- 계획 변경
- 병합 대상 정보
- 담당자 결정 초기화의 세부 정보

감사와 향후 리포트를 위해 구조화된 JSON 값이 필요합니다.

---

### 6. LOCAL과 REMOTE는 같은 command meaning이 필요했음

LOCAL은 변경 가능한 데모 상태를 사용합니다.
REMOTE는 PostgreSQL Repository와 트랜잭션을 사용합니다.

저장 방식은 다르지만 사용자가 확인하는 명령 결과는 같아야 합니다.

허용할 수 없는 동작 차이의 예:

```txt
LOCAL assign
-> update assignee only

REMOTE assign
-> update assignee and status
```

실행 환경의 차이는 Route Handler와 명령 처리 내부에서 다뤄야 합니다.

---

## 결정

서버가 권한과 상태를 확인한 뒤 Ticket Action 명령을 실행하도록 결정했습니다.

명령 처리는 다음 작업을 포함합니다.

- 권한 검사
- 현재 상태 검증
- 액션별 검증
- 액션 저장
- 티켓 변경
- 이력 생성
- 필요한 경우 작업 세션 후속 처리
- 향후 알림 요청·수신자 결정

운영 액션은 필요한 저장 작업을 트랜잭션 안에서 실행해 다음 결과를 일관되게 유지합니다.

```txt
Ticket Action
Ticket mutation
Ticket History
```

이력 이벤트 판단은 `tkh_event`를 기준으로 하기로 했습니다.
`metadata.event`를 기본 이벤트로 사용하지 않습니다.

이력의 각 구분 값을 분리합니다.

```txt
type
-> affected domain area

event
-> what happened

source
-> which action, rule, or system behavior produced it
```

`fromValue`와 `toValue`는 구조화된 JSON 값으로 저장합니다.

---

## 범위 규칙

### 1. Route Handler를 얇게 유지함

Route Handler의 책임:

- HTTP 입력 파싱
- 세션과 역할 정보 해석
- LOCAL 또는 REMOTE 실행 선택
- 명령 계층에 처리 위임
- 변환한 DTO 반환

티켓 변경이나 이력 규칙을 직접 담당해서는 안 됩니다.

---

### 2. Trusted server context로 command를 실행함

클라이언트는 수행하려는 작업과 액션별 입력을 보냅니다.

예시:

```ts
type AssignTicketActionInput = {
  actionType: "ASSIGN";
  content: string;
  assigneeUsernames: string[];
};
```

클라이언트는 서버가 검증 없이 신뢰해야 하는 다음 최종 변경 결과를 보내면 안 됩니다.

```ts
{
  status: "Working",
  approvalStepId: null,
  historyEvent: "ASSIGNMENT_UPDATED"
}
```

이 값들은 서버가 다음 정보를 기준으로 결정합니다.

- 인증된 사용자
- 역할
- 티켓 소유 관계
- 현재 상태
- 현재 승인 단계
- 현재 담당자
- 액션 규칙

---

### 3. Shared validation pipeline을 사용함

모든 명령은 다음 공통 검사를 거칩니다.

- 티켓 존재 여부
- 티켓 활성 여부
- 수행자의 티켓 조회 또는 작업 권한
- 액션 경로와 payload 일치 여부
- 내용이 필수인 액션에서 내용 존재 여부
- 현재 상태에서 액션 허용 여부
- 수행자가 요청자·승인자·작업자·관리자 규칙을 만족하는지 여부
- Draft 티켓의 일반 운영 액션 거절
- 명시적인 관리자 예외가 없으면 Closed 티켓의 일반 변경 거절

UI에서 액션을 보여주는 조건은 사용자 편의를 위한 것입니다.
서버의 권한 검사를 대신하지 않습니다.

```txt
Permission-aware UI
!= authorization boundary
```

---

### 4. Action-specific effect를 명시적으로 유지함

각 액션 핸들러는 유효한 명령이 적용할 변경 결과를 정의합니다.

개념적으로:

```ts
type TicketActionEffect = {
  action: TicketActionInsert;
  ticketPatch?: TicketPatch;
  histories: TicketHistoryInsert[];
  notification?: TicketNotificationIntent;
};
```

TypeScript 구조는 바뀔 수 있습니다.

변경 결과는 서버가 생성하고 명시적으로 표현해야 합니다.

---

### 5. Action intent를 persist함

Ticket Action은 사용자가 요청한 작업 의도와 활동을 저장합니다.

핵심 정보:

- 티켓 ID
- 티켓별 액션 번호
- 액션 유형
- 내용 또는 사유
- 액션별 메타데이터
- 지원하는 경우 파일 또는 이미지
- 작성자 username
- 활성 플래그
- 생성 시각

액션 번호는 티켓별로 부여합니다.

```txt
ticket A -> action 1, action 2, action 3
ticket B -> action 1
```

---

### 6. Communication과 operational mutability를 분리함

의사소통 액션:

- `COMMENT`
- `NOTE`

이 액션들은 정해진 규칙에 따라 수정하거나 소프트 삭제할 수 있습니다.

일반 제한:

- 작성자만 변경 가능
- 종료된 티켓의 일반 수정 차단
- 삭제 시 `active = false`로 소프트 삭제
- 변경 시 History 생성

운영 액션:

- `ASSIGN`
- `ASSIGN_SELF`
- `ADJUST`
- `APPROVE`
- `DECLINE`
- `REJECT`
- `RESUBMIT`
- `REOPEN`
- `MERGE`
- `CANCEL`

운영 액션은 실행 성공 후 수정하지 않습니다.
잘못된 운영 결정은 기존 액션을 다시 쓰지 않고 새 명령으로 바로잡아야 합니다.

---

### 7. History를 event-oriented로 유지함

서비스에서 사용하는 이력 type은 다음과 같습니다.

```ts
type TicketHistoryType =
  | "TICKET"
  | "STATUS"
  | "CATEGORY"
  | "ASSIGNMENT"
  | "APPROVAL"
  | "COMMENT"
  | "NOTE"
  | "PLANNING";
```

당시 source 값은 다음과 같습니다.

```ts
type TicketHistorySource =
  | "USER_ACTION"
  | "SYSTEM_AUTO"
  | "ROUTING_RULE"
  | "APPROVAL_RULE"
  | "ASSIGNMENT_RULE";
```

당시 event 값에는 다음이 포함됩니다.

```txt
TICKET_SUBMITTED
TICKET_UPDATED
TICKET_REOPENED
TICKET_REJECTED
TICKET_MERGED
TICKET_CANCELED
CATEGORY_UPDATED
STATUS_UPDATED
RESOLUTION_CLOSE
APPROVAL_REQUESTED
APPROVAL_APPROVED
APPROVAL_DECLINED
ASSIGNMENT_RESOLVED
ASSIGNMENT_UPDATED
COMMENT_CREATED
COMMENT_UPDATED
COMMENT_DELETED
NOTE_CREATED
NOTE_UPDATED
NOTE_DELETED
PLANNING_UPDATED
WORK_SESSION_STARTED
WORK_SESSION_STOPPED
WORK_SESSION_UPDATED
WORK_SESSION_DELETED
ROUTING_RESET
ROUTING_PRESERVED
```

이벤트 이름은 도메인 유니언 타입과 일치해야 합니다.
배정 변경 이벤트로 `ASSIGNMENT_UPDATED`를 지원한다면 별도의 임의 이벤트 이름을 추가하지 않습니다.

---

### 8. Metadata는 supplemental로 유지함

이력 메타데이터에는 화면 표시와 감사에 필요한 정보를 포함할 수 있습니다.

- 변경된 필드
- 이전 상태와 이후 상태의 라벨
- 담당자 username
- 승인 단계 ID
- 병합 대상 ID
- 담당자 결정 초기화의 세부 정보
- 액션별 사유 정보

메타데이터를 별도의 이벤트 판단 기준으로 사용하면 안 됩니다.
행의 `tkh_event`가 필수 이벤트 필드로 남습니다.

---

### 9. Structured before/after value를 사용함

변경 내용이 단일 기본형 값보다 복잡하면 `fromValue`와 `toValue`를 구조화된 JSON으로 저장해야 합니다.

예시:

```json
{
  "assigneeUsernames": ["worker-a"]
}
```

```json
{
  "priority": "high",
  "riskLevel": "medium",
  "dueAt": "2026-07-20T00:00:00.000Z"
}
```

이력은 DB 열 개수가 아니라 의미 있는 도메인 변경 단위로 기록해야 합니다.

---

### 10. Notification recipient를 ticket email settings에 넣지 않음

티켓 이메일 메타데이터는 요청자가 설정한 수신자를 저장합니다.
승인·배정에 따라 결정되는 알림 수신자는 별도로 다룹니다.

- 현재 승인자
- 현재 작업자
- 액션별 수신자

배정 또는 승인 액션에서 계산한 담당자 이메일을 `tk_email`에 영구 추가하면 안 됩니다.
알림을 보낼 때 서버가 신뢰할 수 있는 직원 이메일 주소를 결정해야 합니다.
전송 기능이 미구현이거나 시뮬레이션이어도 티켓 이메일 설정을 훼손해서는 안 됩니다.

---

### 11. Work session을 Ticket Action과 분리함

작업 시간 추적은 티켓 실행과 관련되지만 일반 Ticket Action은 아닙니다.
작업 세션 명령은 다음을 포함합니다.

- 시작
- 종료
- 전환
- 수동 수정

이 명령들은 작업 세션 기록에 적용합니다.

```txt
Ticket Action
-> meaningful timeline interaction or operational decision

Work Session
-> evidence of actual working time
```

티켓을 열거나 읽을 때 상태를 변경하면 안 됩니다.
타이머를 멈추는 것만으로 티켓을 자동 해결 처리해서도 안 됩니다.

---

### 12. Automatic close는 system command로 취급함

Resolved 티켓은 설정된 유예 기간 후 자동 종료될 수 있습니다.
시간 기준은 일반 수정 시각 `updatedAt`이 아니라 해결 이력 이벤트의 시각입니다.

현재 방향:

```txt
resolution event + 7 days
-> Closed
```

자동 종료는 Ticket Action 없이 History를 생성합니다.

예시:

```txt
type = STATUS
event = RESOLUTION_CLOSE
source = SYSTEM_AUTO
actorUsername = null
actionNo = null
```

조회 요청으로 상태를 변경해서는 안 됩니다.

---

## 정렬한 내용

### 1. Command execution

액션 실행은 활동 행 저장과 함께 업무 규칙을 적용하는 서버 작업입니다.
REMOTE 명령은 트랜잭션 안에서 PostgreSQL Repository를 사용합니다.
LOCAL 명령은 데모 상태를 사용해도 같은 의미와 결과를 갖도록 처리합니다.

---

### 2. Transaction boundary

운영 액션에 필요한 저장 작업은 하나로 묶어 처리합니다.

```txt
BEGIN
1. load current ticket
2. validate latest status and permission
3. insert Ticket Action
4. mutate Ticket
5. insert Ticket History
6. apply related work-session side effects where required
COMMIT
```

필수 단계가 실패하면 명령의 변경을 모두 되돌립니다.

---

### 3. History model

이력은 다음 값을 중심으로 모델링합니다.

```txt
type + event + source + actor + fromValue + toValue + metadata
```

이 구조로 이력을 감사, 필터링, 화면 표시, 리포트에 사용할 수 있습니다.

---

### 4. Action examples

Comment:

```txt
validate ticket access
-> insert COMMENT action
-> create COMMENT_CREATED history
```

Assign:

```txt
validate assignment permission
-> insert ASSIGN action
-> update assignees
-> create ASSIGNMENT_UPDATED history
```

Approve:

```txt
validate current approver
-> insert APPROVE action
-> create APPROVAL_APPROVED history
-> resolve next approval step or work assignment
-> create APPROVAL_REQUESTED or ASSIGNMENT_RESOLVED history
```

Merge:

```txt
source 및 target 티켓 검증
-> 저장된 category Tenant가 동일한지 확인
-> 같은 scope 또는 단방향 INTERNAL -> PORTAL만 허용
-> MERGE action 생성
-> 파생된 scope 관계에 따라 source를 Merged 또는 Escalated로 종료
-> TICKET_MERGED history 생성
```

---

## 결과 영향

### 긍정적 영향

- 액션, 티켓 변경 결과, 이력을 일관되게 유지합니다.
- 서버 권한 검사로 실제 명령 실행을 제한합니다.
- 이력이 별도 `type`, `event`, `source` 필드를 사용합니다.
- 운영 액션을 감사할 수 있고 실행 후 수정하지 않습니다.
- LOCAL과 REMOTE가 같은 의미의 액션 동작을 제공합니다.
- 작업 시간 추적과 티켓 액션을 분리합니다.
- 티켓 이메일 설정을 바꾸지 않고 알림 설계를 추가할 수 있습니다.
- 포트폴리오에서 명령 처리와 감사 중심 모델링을 보여줍니다.

---

### 부정적 영향 / 트레이드오프

- 운영 액션은 일반 CRUD보다 많은 구조가 필요합니다.
- 이벤트 이름을 신중하게 유지해야 합니다.
- 복잡한 명령은 여러 이력 기록을 만들 수 있습니다.
- 트랜잭션에서 Repository 작업을 조정해야 합니다.
- 알림 전달의 신뢰성은 별도 과제로 남습니다.
- LOCAL에서는 DB 기반 기능 대신 시뮬레이션으로 관련 변경을 함께 반영합니다.

---

## 후속 정책

- 운영 액션을 액션 행 삽입만으로 구현하지 않습니다.
- Route Handler는 요청 확인과 위임에 집중하고 명령 서비스가 실제 변경을 담당합니다.
- 이벤트 판단은 `tkh_event`를 기준으로 합니다.
- `metadata`는 보충 정보로 유지합니다.
- 도메인 유니언 타입에서 지원하는 이벤트 이름을 사용합니다.
- GET·조회 흐름에서 티켓 상태를 변경하지 않습니다.
- 타이머 종료를 티켓 해결로 취급하지 않습니다.
- 계산된 알림 수신자를 `tk_email`에 넣지 않습니다.
- 새 액션 유형을 추가할 때 허용 상태, 권한 규칙, 티켓 변경 결과, 이력 이벤트, 쿼리 무효화 대상을 정의합니다.

---

## 요약

Ticket Action은 서버가 검증하고 실행하는 Service Desk 명령으로 다룹니다.

모델은 다음과 같습니다.

```txt
Ticket Action
= user-facing intent and command input

Ticket
= current workflow state

Ticket History
= immutable event record of what actually changed
```

실행 모델은 다음과 같습니다.

```txt
User submits action
-> server resolves trusted context
-> shared guards validate access and state
-> action-specific logic applies effect
-> transaction persists action, ticket changes, and history
-> affected client queries refresh
```

이 설계로 타임라인에 실제 작업 의미를 유지하고, LOCAL과 REMOTE 모두에서
티켓 상태를 정확하고 안전하게 변경하며 변경 결과를 추적할 수 있습니다.
