# 티켓 라이프사이클

## 목표

티켓 라이프사이클은 티켓이 생성부터 완료까지 어떻게 진행되는지를
정의합니다. 여기에는 승인, 실행, 일시 중지, 반려, 재작업, 최종 종료가
포함됩니다.

이 라이프사이클은 다음을 보장합니다.

- 모든 티켓이 예측 가능한 workflow를 따른다
- 각 단계의 책임이 명확히 정의된다
- 전이는 명시적이고, 통제 가능하며, 추적 가능하다
- 라이프사이클이 happy path만이 아니라 실제 운영 시나리오를 반영한다

---

## 핵심 개념

```txt
A ticket is a controlled, stateful workflow driven by actions, approvals, and system rules.
```

티켓은 다음에 따라 정의된 상태를 이동합니다.

- 사용자 action
- approval decision
- assignment 및 execution progress
- 명시적으로 정의된 운영 rule

모든 티켓이 모든 단계를 거치는 것은 아닙니다. 실제 경로는 category 설정,
approval requirement, 티켓 생성 이후 수행된 운영 action에 따라 달라집니다.

---

## 라이프사이클 흐름

상위 수준에서 라이프사이클은 다음과 같이 요약할 수 있습니다.

```txt
Draft -> Approval -> Assigned -> Working -> Resolved -> Closed
```

이것이 주요 성공 경로입니다. 실제로는 라이프사이클이 다음과 같은 대체
분기도 지원합니다.

```txt
Draft -> Assigned -> Working -> Resolved -> Closed
Approval -> Declined -> Approval or Assigned
Assigned -> Working
Working <-> Pending
Assigned / Working / Pending -> Rejected -> Approval or Assigned
Resolved -> Working -> Resolved -> Closed
Assigned / Working / Pending / Resolved -> Closed (merge path)
```

따라서 라이프사이클은 단순한 완료뿐 아니라, 반려, 일시 중지, 해결 후
재처리까지 함께 모델링합니다.

---

## 상태 정의

### Draft

- 제출 전의 임시 상태
- requester만 수정 가능
- assignee에게 활성 작업으로 보이지 않음
- 제출 전 미완성 요청을 준비하는 데 사용됨

### Approval

- 티켓이 제출되어 approval decision을 기다리는 상태
- 현재 approver가 approval step의 책임을 가진다
- 승인되면 다음 approval step으로 이동하거나 work assignment가 확정된다

### Declined

- approval이 거절된 상태
- 티켓이 실행 대상으로 받아들여지지 않은 상태
- requester가 요청을 수정해서 다시 제출할 수 있음

### Assigned

- approval이 완료되었거나 필요 없는 상태
- work assignee가 정해진 상태
- 아직 작업은 시작되지 않았음
- 명시적인 start-work command가 `Working`으로 이동시킨다

### Working

- 티켓이 할당되어 처리 중인 상태
- assignee가 실행 책임을 가진 상태
- track time을 통해 작업 세션을 기록할 수 있음

### Pending

- 작업이 일시 중지된 상태
- 외부 의존성, 대기 조건, 작업 중단 등으로 자주 발생함
- 티켓은 여전히 active지만 현재 진행 중은 아님

### Rejected

- work assignee 또는 Admin 검토 후 운영적으로 반려된 상태
- 현재 형태로는 요청을 진행할 수 없음을 의미함
- requester가 수정 후 초기 routing으로 다시 제출할 수 있음

### Resolved

- 작업이 완료되고 해결책이 제공된 상태
- 후속 종료 결정 또는 requester 검토를 기다리는 상태
- `reopen` action이 수행되면 `Working`으로 돌아갈 수 있음

### Closed

- Closed 상태는 read-only이다.
- 일반 작업이 완료되어 라이프사이클이 종료된 상태
- 일반적으로 추가 action은 허용되지 않음
- update는 허용되지 않음
- 예외적인 administrative operation은 여전히 가능할 수 있음
- 예외적인 경우 Admin merge가 허용될 수 있음

---

## 상태 전이

라이프사이클은 명시적인 transition에 의해 구동됩니다.

### 1. Draft -> Approval

Trigger:

- approval이 필요한 사용자 제출

### 2. Draft -> Assigned

Trigger:

- approval이 필요 없는 사용자 제출

### 3. Approval -> Approval

Trigger:

- 마지막이 아닌 approval step 승인

### 4. Approval -> Assigned

Trigger:

- 마지막 approval step 승인 및 assignment resolution

### 5. Approval -> Declined

Trigger:

- approval rejection

### 6. Declined -> Approval / Assigned

Trigger:

- requester resubmission through initial routing

### 7. Assigned -> Working

Trigger:

- 현재 work assignee의 명시적인 start-work command

### 8. Working -> Pending

Trigger:

- dependency, interruption, workflow hold로 인한 일시 중지

### 9. Pending -> Working

Trigger:

- 작업 재개

### 10. Working / Pending -> Resolved

Trigger:

- work assignee가 work-session control을 통해 작업을 완료함

### 11. Assigned / Working / Pending -> Rejected

Trigger:

- work assignee 또는 Admin에 의한 운영 반려

### 12. Rejected -> Approval / Assigned

Trigger:

- requester resubmission through initial routing

### 13. Resolved -> Working

Trigger:

- requester 또는 Admin의 `reopen` action

### 14. Resolved -> Closed

Trigger:

- resolved history가 7일 이상 지난 system auto-close

### 15. Assigned / Working / Pending / Resolved -> Closed

Closing actions:

- requester cancel은 `Approval`, `Declined`, `Assigned`, `Working`,
  `Pending`, `Rejected`에서 닫을 수 있다
- work assignee merge는 `Assigned`, `Working`, `Pending`, `Resolved`에서 source ticket을 닫는다
- Admin merge는 `Closed`를 포함한 모든 non-`Draft` 상태에서 source ticket을 닫을 수 있다
- merged ticket은 `closeReason = Merged`를 사용한다

---

## Action-Driven Lifecycle

라이프사이클은 시스템 설정만으로 통제되지 않습니다. 명시적인 action에
의해서도 함께 구동됩니다.

```txt
State Transition = Result of Action
```

예시:

| Action        | From                                                                   | To                       |
| ------------- | ---------------------------------------------------------------------- | ------------------------ |
| submit ticket | `Draft`                                                                | `Approval` or `Assigned` |
| approve       | `Approval`                                                             | `Approval` or `Assigned` |
| decline       | `Approval`                                                             | `Declined`               |
| resubmit      | `Declined` or `Rejected`                                               | `Approval` or `Assigned` |
| start work    | `Assigned`                                                             | `Working`                |
| assign        | `Pending`                                                              | `Working`                |
| assignSelf    | `Assigned`, `Working`, or `Pending`                                    | unchanged                |
| pause work    | `Working`                                                              | `Pending`                |
| resume work   | `Pending`                                                              | `Working`                |
| resolve work  | `Working` or `Pending`                                                 | `Resolved`               |
| reject        | `Assigned`, `Working`, or `Pending`                                    | `Rejected`               |
| reopen        | `Resolved`                                                             | `Working`                |
| merge         | `Assigned`, `Working`, `Pending`, or `Resolved`                        | `Closed`                 |
| cancel        | `Approval`, `Declined`, `Assigned`, `Working`, `Pending`, or `Rejected` | `Closed`                 |
| auto close    | `Resolved`                                                             | `Closed`                 |
| admin merge   | any non-`Draft` status                                                 | `Closed`                 |

암묵적인 상태 변경은 없습니다. 모든 transition에는 명확한 원인이 있어야
합니다.

---

## 조건부 Workflow

라이프사이클은 모든 티켓에 대해 고정되어 있지 않습니다.

이는 category 설정에 따라 달라집니다.

```txt
Category -> determines -> Workflow
```

예시:

- 단순 요청: `Draft -> Assigned -> Working -> Resolved -> Closed`
- approval 필요: `Draft -> Approval -> Assigned -> Working -> Resolved -> Closed`
- approval 거절: `Draft -> Approval -> Declined -> Approval -> Assigned -> Working`
- 작업 차단: `Working -> Pending -> Working -> Resolved -> Closed`
- 재작업 흐름: `Working -> Resolved -> Working -> Resolved -> Closed`

이렇게 하면 라이프사이클은 유연해지지만 임의적이지는 않게 됩니다.

---

## 전이 규칙

### 1. 통제된 전이

상태 전이는 임의적이지 않습니다.

반드시 다음을 따라야 합니다.

- approval result
- assignment 및 work ownership
- 명시적인 사용자 action
- 현재 구현에 정의된 명시적인 rule

### 2. 직접 점프 금지

잘못된 transition은 허용되지 않습니다.

예시:

- `Draft -> Working`
- `Approval -> Resolved`
- 유효한 closing action 없는 `Pending -> Closed`
- 예외 개입 없는 `Closed -> Working`
- 문서화된 admin-level 예외를 제외한 `Closed -> any normal action`

### 3. 상태 일관성

각 상태는 명확한 책임을 반영해야 합니다.

- `Approval`: approval을 기다리는 상태
- `Assigned`: 작업 시작 준비 완료
- `Working`: assignee가 책임지는 상태
- `Pending`: 일시 중지된 상태
- `Resolved`: 종료 또는 검토를 기다리는 상태
- `Rejected`: 현재 형태로는 실행 불가
- `Declined`: 승인되지 않음

### 4. Reopen 전략

현재 라이프사이클은 별도의 `Reopen` status를 사용하지 않습니다.

이는 다음을 가능하게 합니다.

- 재작업은 `Resolved`에서 `Working`으로 직접 돌아간다
- 재작업 여부는 `TICKET_REOPENED` history event로 추적한다
- status enum은 실행 가능한 상태 중심으로 유지된다

### 5. Closure 정책

현재 구현 rule은 merge, cancel, resolved auto-close를 명시적으로 정의합니다.
resolved auto-close는 `updatedAt`이 아니라 resolved history timestamp와
7일 grace window를 기준으로 합니다.

---

## Lifecycle vs Status

lifecycle은 전체 process를 설명하고, status는 현재 상태의 snapshot을
나타냅니다.

```txt
Lifecycle = process
Status = snapshot
```

이 구분은 중요합니다. ticket domain은 현재 상태만 저장하는 것이 아니라,
티켓이 어떻게 그 상태에 도달했는지와 다음에 어떤 transition이 유효한지도
함께 모델링하기 때문입니다.

---

## Lifecycle vs Activity

lifecycle은 state machine을 정의하고, activity는 변경을 일으키는 trigger
또는 operation을 나타냅니다.

```txt
Lifecycle = allowed states and transitions
Activity = explicit operation that triggers change
```

예시:

- `assign`은 ticket을 `Working`으로 이동시킬 수 있다
- `reject`는 ticket을 `Rejected`로 이동시킬 수 있다
- `reopen`은 ticket을 `Resolved`에서 `Working`으로 이동시킬 수 있다
- `resubmit`은 ticket을 `Approval` 또는 `Assigned`로 이동시킬 수 있다

이 구분은 operational action의 표현력을 유지하면서도 lifecycle을 엄격하게
관리할 수 있게 합니다.

---

## 다른 도메인과의 관계

### Category

- approval 필요 여부를 정의한다
- assignment rule을 정의한다
- 어떤 workflow path가 적용되는지 결정한다

관련 문서: [카테고리 전략](./strategy/category-strategy.md)

---

### Approval

- approval outcome과 관련된 transition을 통제한다
- ticket이 `Approval`에 남을지, `Assigned`가 될지, `Declined`가 될지 결정한다

관련 문서: [승인 시스템](./strategy/approval-system.md)

---

### Assignment

- `Working` 상태에서 누가 ticket을 처리하는지 결정한다
- 재할당 및 재활성화 흐름을 지원한다
- intake state의 ticket을 active execution으로 이동시킬 수 있다

관련 문서: [할당 정책](./strategy/assignment-policy.md)

---

### SLA

- 긴급도와 기한에 영향을 준다
- `Pending` 동안 일시 정지될 수 있다
- escalation 및 closure monitoring에 영향을 줄 수 있다

관련 문서: [SLA 전략](./strategy/sla-strategy.md)

---

### Ticket Activity

- 많은 transition을 유도하는 명시적인 사용자 액션을 제공한다
- 왜 transition이 발생했는지 설명한다

관련 문서: [티켓 활동 모델](./ticket-activity.md)

---

### Ticket Track Time

- `Working` 동안 작업 세션을 기록한다
- `Pending`으로 들어가거나 빠져나오는 transition을 설명하는 데 도움이 될 수 있다

관련 문서: [티켓 작업 시간 추적](./ticket-track-time.md)

---

### Ticket History

- 모든 상태 전이를 기록한다
- lifecycle 변경을 감사 가능하고 명시적으로 만든다

상태 변경은 절대 암묵적이지 않습니다. 모두 workflow event로 기록됩니다.

관련 문서: [티켓 이력](./ticket-history.md)

---

## 설계 고려사항

### 1. Category를 통한 유연성

라이프사이클은 ticket type별로 하드코딩되는 대신 의도적으로 설정 가능하게
설계되어 있습니다.

### 2. 실제 운영 흐름과의 정렬

라이프사이클은 실제 운영 흐름을 반영합니다.

- 실행 전 validation
- 작업 진행 중 pause와 resume
- 반려와 수정 loop
- 완료 확인과 재작업 처리

### 3. Traceability

모든 transition은 기록되므로 auditability와 debuggability를 보장합니다.

### 4. 운영 명확성

`Declined`, `Rejected`, `Pending`, `Resolved` 같은 상태는 ownership, 의미,
reporting value가 서로 다르므로 분리해서 유지합니다.

---

## 요약

티켓 라이프사이클은 다음을 보장합니다.

- 티켓이 통제된 workflow를 따라 이동한다
- 각 단계의 책임이 명확하다
- 반려, 일시 중지, 재작업이 명시적으로 모델링된다
- transition이 예측 가능하고, 감사 가능하며, 운영적으로 의미 있게 유지된다

이 라이프사이클은 신뢰할 수 있고 확장 가능한 service desk 시스템을
구축하기 위한 핵심 기반입니다.
