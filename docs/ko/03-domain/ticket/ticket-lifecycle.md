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
Draft -> Open -> Approved -> Working -> Resolved -> Closed
```

이것이 주요 성공 경로입니다. 실제로는 라이프사이클이 다음과 같은 대체
분기도 지원합니다.

```txt
Draft -> Open -> Working -> Resolved -> Closed
Open -> Declined -> Open
Working <-> Pending
Working / Pending -> Rejected -> Open or Reopen
Resolved -> Reopen -> Working -> Resolved -> Closed
Working / Pending / Resolved -> Closed (merge path)
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

### Open

- 티켓이 제출되어 활성 workflow에 진입한 상태
- approval, assignment, requester/manager 후속 조치를 기다리는 상태
- 생성 후의 초기 운영 상태

### Approved

- approval flow가 성공적으로 완료된 상태
- 티켓이 실행 대상으로 승인된 상태
- 활성 작업으로 이동할 준비가 된 상태

### Declined

- approval이 거절된 상태
- 티켓이 실행 대상으로 받아들여지지 않은 상태
- requester가 요청을 수정해서 다시 제출할 수 있음

### Working

- 티켓이 할당되어 처리 중인 상태
- assignee가 실행 책임을 가진 상태
- track time을 통해 작업 세션을 기록할 수 있음

### Pending

- 작업이 일시 중지된 상태
- 외부 의존성, 대기 조건, 작업 중단 등으로 자주 발생함
- 티켓은 여전히 active지만 현재 진행 중은 아님

### Rejected

- assignee 또는 manager 검토 후 운영적으로 반려된 상태
- 현재 형태로는 요청을 진행할 수 없음을 의미함
- requester 또는 manager가 나중에 다시 활성화할 수 있음

### Reopen

- 해결되었거나 반려된 뒤 명시적으로 다시 활성화된 상태
- 재작업 또는 재처리를 위해 lifecycle에 다시 진입했음을 의미함
- 재작업을 명확히 추적하기 위해 `Open`과 분리됨

### Resolved

- 작업이 완료되고 해결책이 제공된 상태
- 후속 종료 결정 또는 requester 검토를 기다리는 상태
- 재작업이 요청되면 다시 active processing으로 돌아갈 수 있음

### Closed

- Closed 상태는 read-only이다.
- 일반 작업이 완료되어 라이프사이클이 종료된 상태
- 일반적으로 추가 action은 허용되지 않음
- update는 허용되지 않음
- 예외적인 administrative operation은 여전히 가능할 수 있음
- 예외적인 경우 manager-level merge가 허용될 수 있음

---

## 상태 전이

라이프사이클은 명시적인 transition에 의해 구동됩니다.

### 1. Draft -> Open

Trigger:

- 사용자 제출

### 2. Open -> Approved

Trigger:

- 필요한 모든 approval step 완료

### 3. Open -> Declined

Trigger:

- approval rejection

### 4. Open -> Working

조건:

- approval이 필요 없거나, assignment를 통해 즉시 active work가 시작되는 경우

### 5. Approved -> Working

Trigger:

- assignment 및 작업 시작

### 6. Declined -> Open

Trigger:

- requester 수정 후 재제출

### 7. Working -> Pending

Trigger:

- dependency, interruption, workflow hold로 인한 일시 중지

### 8. Pending -> Working

Trigger:

- 작업 재개

### 9. Working -> Resolved

Trigger:

- assignee가 작업을 완료함

### 10. Working / Pending -> Rejected

Trigger:

- assignee 또는 manager에 의한 운영 반려

### 11. Rejected -> Open

Trigger:

- requester 검토 및 재제출

### 12. Rejected -> Reopen

Trigger:

- manager 주도의 재할당 또는 처리를 위한 명시적 재활성화

### 13. Resolved -> Reopen

Trigger:

- requester 검토 요청 또는 재작업 요청

### 14. Resolved -> Closed

구현별 closure path:

- [`Ticket Operation Rules`](../../08-dev-strategy/ticket-operation-rules.md)는
  현재 구체적인 trigger를 정의하지 않는다
- requester confirmation이나 system close policy가 존재할 수는 있지만,
  여기서는 현재 구현 rule로 간주하지 않는다

### 15. Working / Pending / Resolved -> Closed

예외 케이스:

- assignee merge는 `Working`, `Pending`, `Resolved`에서 source ticket을 닫는다
- manager merge는 예외적으로 `Open`, `Approved`, `Rejected`, 심지어
  `Closed`에서도 source ticket을 닫을 수 있다
- merged ticket은 `closeReason = Merged`를 사용한다

---

## Action-Driven Lifecycle

라이프사이클은 시스템 설정만으로 통제되지 않습니다. 명시적인 action에
의해서도 함께 구동됩니다.

```txt
State Transition = Result of Action
```

예시:

| Action                 | From                                                    | To         |
| ---------------------- | ------------------------------------------------------- | ---------- |
| submit ticket          | `Draft`                                                 | `Open`     |
| approve                | `Open`                                                  | `Approved` |
| update declined ticket | `Declined`                                              | `Open`     |
| assign / assignSelf    | `Open` or `Approved`                                    | `Working`  |
| pause or hold work     | `Working`                                               | `Pending`  |
| resume work            | `Pending`                                               | `Working`  |
| reject                 | `Working` or `Pending`                                  | `Rejected` |
| requestReview / reopen | `Resolved`                                              | `Reopen`   |
| resubmit               | `Rejected`                                              | `Open`     |
| manager reassign       | `Declined` or `Rejected`                                | `Reopen`   |
| merge                  | `Working`, `Pending`, or `Resolved`                     | `Closed`   |
| manager merge          | `Open`, `Approved`, `Rejected`, `Resolved`, or `Closed` | `Closed`   |

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

- 단순 요청: `Draft -> Open -> Working -> Resolved -> Closed`
- approval 필요: `Draft -> Open -> Approved -> Working -> Resolved -> Closed`
- approval 거절: `Draft -> Open -> Declined -> Open -> Approved -> Working`
- 작업 차단: `Working -> Pending -> Working -> Resolved -> Closed`
- 재작업 흐름: `Working -> Resolved -> Reopen -> Working -> Resolved -> Closed`

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
- `Open -> Resolved`
- 유효한 closing action 없는 `Pending -> Closed`
- 예외 개입 없는 `Closed -> Working`
- 문서화된 admin-level 예외를 제외한 `Closed -> any normal action`

### 3. 상태 일관성

각 상태는 명확한 책임을 반영해야 합니다.

- `Open`: approval, assignment, 후속 조치를 기다리는 상태
- `Approved`: 실행 준비 완료
- `Working`: assignee가 책임지는 상태
- `Pending`: 일시 중지된 상태
- `Resolved`: 종료 또는 검토를 기다리는 상태
- `Rejected`: 현재 형태로는 실행 불가
- `Declined`: 승인되지 않음
- `Reopen`: 이전 완료 또는 반려 이후의 재처리

### 4. Reopen 전략

라이프사이클은 `Reopen`을 `Open`과 명시적으로 분리합니다.

이는 다음을 가능하게 합니다.

- 재작업 빈도를 KPI로 추적할 수 있다
- 신규 유입과 재처리를 구분할 수 있다
- 티켓이 이미 진행된 이후에도 운영상 명확성을 유지할 수 있다

### 5. Closure 정책

현재 구현 rule은 merge 기반 closure를 명시적으로 정의합니다.

requester confirmation이나 auto-close review window 같은 다른 closure 정책은
나중에 추가될 수 있지만, 현재
[`Ticket Operation Rules`](../../08-dev-strategy/ticket-operation-rules.md)에는
정의되어 있지 않습니다.

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
- `reopen`은 ticket을 `Reopen`으로 이동시킬 수 있다
- `resubmit`은 ticket을 `Open`으로 이동시킬 수 있다

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
- ticket이 `Approved`가 될지 `Declined`가 될지 결정한다

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

`Declined`, `Rejected`, `Pending`, `Reopen` 같은 상태는 ownership, 의미,
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
