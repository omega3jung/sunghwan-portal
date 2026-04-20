# Ticket Lifecycle

## 목표

Ticket lifecycle은 티켓이 생성부터 완료까지 어떻게 진행되는지를 정의합니다.
여기에는 승인, 실행, 일시 중지, 거절, 재작업, 최종 종료가 포함됩니다.

이를 통해 다음을 보장합니다.

- 모든 티켓이 예측 가능한 workflow를 따릅니다
- 각 단계에서 책임이 명확하게 정의됩니다
- 상태 전이가 명시적이고 통제되며 추적 가능합니다
- lifecycle이 happy path뿐 아니라 실제 운영 시나리오를 반영합니다

---

## 핵심 개념

```txt
A ticket is a controlled, stateful workflow driven by actions, approvals, and system rules.
```

티켓은 다음 요소에 따라 정의된 상태를 거쳐 이동합니다.

- 사용자 action
- 승인 결정
- 할당 및 실행 진행 상황
- 명시적으로 정의된 운영 rule

모든 티켓이 모든 단계를 반드시 거치는 것은 아닙니다.
실제 경로는 category 설정, approval requirement, 생성 이후 수행된
operational action에 따라 달라집니다.

---

## 생명주기 흐름

상위 수준에서 lifecycle은 다음처럼 요약할 수 있습니다.

```txt
Draft -> Open -> Approved -> Working -> Resolved -> Closed
```

이것은 주요 성공 경로입니다.
실제로는 다음과 같은 대체 분기도 지원합니다.

```txt
Draft -> Open -> Working -> Resolved -> Closed
Open -> Declined -> Open
Working <-> Pending
Working / Pending -> Rejected -> Open or Reopen
Resolved -> Reopen -> Working -> Resolved -> Closed
Working / Pending / Resolved -> Closed (merge path)
```

따라서 이 lifecycle은 단순한 완료뿐 아니라,
거절, 일시 중지, 해결 이후 재처리까지 함께 모델링합니다.

---

## 상태 정의

### Draft

- 제출 전 임시 상태
- requester만 수정 가능
- assignee에게는 active work로 보이지 않음
- 제출 전 미완성 요청을 준비하기 위해 사용됨

### Open

- 티켓이 제출되어 active workflow에 들어간 상태
- approval, assignment, requester/manager 후속 처리를 기다리는 상태
- 생성 후 최초의 운영 상태

### Approved

- approval flow가 성공적으로 완료된 상태
- 티켓이 실행 가능한 요청으로 승인된 상태
- active work로 이동할 준비가 된 상태

### Declined

- 승인이 거절된 상태
- 티켓이 실행 대상으로 승인되지 않은 상태
- requester가 요청을 수정해 다시 제출할 수 있음

### Working

- 티켓이 할당되어 처리 중인 상태
- assignee가 실행 책임을 가짐
- 작업 세션은 track time으로 기록될 수 있음

### Pending

- 작업이 일시 중지된 상태
- 외부 dependency, 대기 조건, 작업 중단 때문에 자주 발생함
- ticket은 여전히 active하지만 현재는 진행되지 않음

### Rejected

- assignee 또는 manager 검토 결과 운영상 거절된 상태
- 현재 형태로는 요청을 진행할 수 없음을 의미함
- requester나 manager가 이후 다시 활성화할 수 있음

### Reopen

- 해결되었거나 거절된 ticket이 명시적으로 다시 활성화된 상태
- 재작업 또는 재처리를 위한 lifecycle 재진입을 의미함
- 재작업을 명확하게 추적하기 위해 `Open`과 분리됨

### Resolved

- 작업이 완료되고 해결안이 제공된 상태
- 후속 종료 결정 또는 requester review를 기다리는 상태
- 재작업이 요청되면 다시 active processing으로 돌아갈 수 있음

### Closed

- Closed 상태는 read-only입니다
- 일반 작업이 끝나 lifecycle이 종료된 상태입니다
- 일반적인 action은 더 이상 허용되지 않습니다
- update는 허용되지 않습니다
- 예외적인 administrative operation은 여전히 적용될 수 있습니다
- manager-level merge는 예외적인 경우 여전히 허용될 수 있습니다

---

## 상태 전이

Lifecycle은 명시적인 상태 전이에 의해 진행됩니다.

### 1. Draft -> Open

트리거:

- 사용자 제출

### 2. Open -> Approved

트리거:

- 필요한 approval step이 모두 완료됨

### 3. Open -> Declined

트리거:

- 승인 거절

### 4. Open -> Working

조건:

- 승인이 필요하지 않거나, assignment를 통해 바로 active work가 시작됨

### 5. Approved -> Working

트리거:

- assignment 및 실행 시작

### 6. Declined -> Open

트리거:

- requester가 수정 후 다시 제출함

### 7. Working -> Pending

트리거:

- dependency, interruption, workflow hold에 따른 일시 중지

### 8. Pending -> Working

트리거:

- 작업 재개

### 9. Working -> Resolved

트리거:

- assignee가 작업을 완료함

### 10. Working / Pending -> Rejected

트리거:

- assignee 또는 manager의 운영상 거절

### 11. Rejected -> Open

트리거:

- requester 검토 후 재제출

### 12. Rejected -> Reopen

트리거:

- manager 주도의 재할당 또는 재처리를 위한 명시적 재활성화

### 13. Resolved -> Reopen

트리거:

- requester의 review 요청 또는 재작업 요청

### 14. Resolved -> Closed

구현별 closure 경로:

- [`Ticket Operation Rules`](../../08-dev-strategy/ticket-operation-rules.md)에는
  아직 구체적인 trigger가 정의되어 있지 않습니다
- requester confirmation 또는 system close policy가 있을 수 있지만,
  현재 구현 rule로 간주되지는 않습니다

### 15. Working / Pending / Resolved -> Closed

예외 경로:

- assignee merge는 `Working`, `Pending`, `Resolved`에서 source ticket을 닫습니다
- manager merge는 예외적인 경우 `Open`, `Approved`, `Rejected`, 심지어
  `Closed`에서도 source ticket을 닫을 수 있습니다
- merged ticket은 `closeReason = Merged`를 사용합니다

---

## Action-Driven Lifecycle

Lifecycle은 시스템 설정에 의해서만 통제되지 않습니다.
명시적인 action에 의해서도 구동됩니다.

```txt
State Transition = Result of Action
```

예시:

| Action | From | To |
| ------ | ---- | -- |
| submit ticket | `Draft` | `Open` |
| approve | `Open` | `Approved` |
| update declined ticket | `Declined` | `Open` |
| assign / assign myself | `Open` or `Approved` | `Working` |
| pause or hold work | `Working` | `Pending` |
| resume work | `Pending` | `Working` |
| reject | `Working` or `Pending` | `Rejected` |
| reportResolved | `Resolved` | `Reopen` |
| reviewRejected | `Rejected` | `Open` |
| manager reassign | `Declined` or `Rejected` | `Reopen` |
| merge | `Working`, `Pending`, or `Resolved` | `Closed` |
| manager merge | `Open`, `Approved`, `Rejected`, `Resolved`, or `Closed` | `Closed` |

암묵적인 상태 변경은 없습니다.
모든 전이는 명확한 원인을 가져야 합니다.

---

## 조건부 Workflow

Lifecycle은 모든 티켓에 대해 고정되어 있지 않습니다.

카테고리 설정에 따라 달라집니다.

```txt
Category -> determines -> Workflow
```

예시:

- 단순 요청: `Draft -> Open -> Working -> Resolved -> Closed`
- 승인이 필요한 요청: `Draft -> Open -> Approved -> Working -> Resolved -> Closed`
- 승인 거절 후 재요청: `Draft -> Open -> Declined -> Open -> Approved -> Working`
- 작업 중단: `Working -> Pending -> Working -> Resolved -> Closed`
- 재작업 흐름: `Working -> Resolved -> Reopen -> Working -> Resolved -> Closed`

이렇게 하면 lifecycle은 유연해지면서도 임의적이지 않게 유지됩니다.

---

## 전이 규칙

### 1. 통제된 전이

상태 전이는 임의로 일어나지 않습니다.

반드시 다음을 따라야 합니다.

- 승인 결과
- assignment 및 work ownership
- 명시적인 user action
- 현재 구현에 정의된 명시적 rule

### 2. 직접 점프 금지

유효하지 않은 전이는 허용되지 않습니다.

예시:

- `Draft -> Working`
- `Open -> Resolved`
- 유효한 closing action 없이 `Pending -> Closed`
- 예외 개입 없이 `Closed -> Working`
- 문서화된 admin-level 예외를 제외한 `Closed -> any normal action`

### 3. 상태 무결성

각 상태는 명확한 책임을 표현해야 합니다.

- `Open`: approval, assignment, 후속 처리를 기다리는 상태
- `Approved`: 실행 준비가 된 상태
- `Working`: assignee가 소유하는 상태
- `Pending`: 일시 중지된 상태
- `Resolved`: 종료 또는 review를 기다리는 상태
- `Rejected`: 현재 형태로는 실행 불가한 상태
- `Declined`: 승인되지 않은 상태
- `Reopen`: 완료 또는 거절 이후 재처리 상태

### 4. Reopen 전략

Lifecycle은 `Reopen`을 `Open`과 명시적으로 구분합니다.

이를 통해:

- 재작업 빈도를 KPI로 추적할 수 있습니다
- 신규 접수와 재처리를 구분할 수 있습니다
- 이미 진행된 ticket 이후의 운영 명확성을 유지할 수 있습니다

### 5. Closure 정책

현재 구현 rule은 merge 기반 closure를 명시적으로 정의합니다.

requester confirmation이나 auto-close review window 같은 다른 closure 정책은
추후 추가될 수 있지만, 현재는
[`Ticket Operation Rules`](../../08-dev-strategy/ticket-operation-rules.md)에
정의되어 있지 않습니다.

---

## Lifecycle과 Status의 차이

Lifecycle은 전체 프로세스를 설명하고, status는 현재 시점을 나타냅니다.

```txt
Lifecycle = process
Status = snapshot
```

이 구분은 중요합니다.
Ticket domain은 현재 상태만 저장하는 것이 아니라,
현재 상태에 어떻게 도달했는지와 다음에 어떤 전이가 유효한지도 함께 모델링하기 때문입니다.

---

## Lifecycle과 Activity의 차이

Lifecycle은 state machine을 정의하고,
activity는 변화를 일으키는 trigger 또는 operation을 나타냅니다.

```txt
Lifecycle = allowed states and transitions
Activity = explicit operation that triggers change
```

예시:

- `assign`은 ticket을 `Working`으로 이동시킬 수 있습니다
- `reject`는 ticket을 `Rejected`로 이동시킬 수 있습니다
- `reportResolved`는 ticket을 `Reopen`으로 이동시킬 수 있습니다
- `reviewRejected`는 ticket을 `Open`으로 이동시킬 수 있습니다

이 구분은 operational action의 표현력을 유지하면서도
lifecycle 자체를 엄격하게 유지하게 해 줍니다.

---

## 다른 도메인과의 관계

### Category

- 승인이 필요한지 결정합니다
- assignment rule을 정의합니다
- 어떤 workflow path가 적용되는지 결정합니다

관련 문서: [Category Strategy](./strategy/category-strategy.md)

---

### Approval

- approval outcome 관련 전이를 제어합니다
- ticket이 `Approved`가 될지 `Declined`가 될지를 결정합니다

관련 문서: [Approval System](./strategy/approval-system.md)

---

### Assignment

- `Working` 상태에서 누가 ticket을 처리하는지 결정합니다
- 재할당 및 재활성화 흐름을 지원합니다
- intake state의 ticket을 active execution으로 이동시킬 수 있습니다

관련 문서: [Assignment Policy](./strategy/assignment-policy.md)

---

### SLA

- 긴급도와 마감 시간에 영향을 줍니다
- `Pending` 중에는 pause될 수 있습니다
- escalation 및 closure monitoring에 영향을 줄 수 있습니다

관련 문서: [SLA Strategy](./strategy/sla-strategy.md)

---

### Ticket Activity

- 많은 전이를 drive하는 명시적 user-facing action을 제공합니다
- 왜 전이가 일어났는지 설명합니다

관련 문서: [Ticket Activity Model](./ticket-activity.md)

---

### Ticket Track Time

- `Working` 중의 work session을 기록합니다
- `Pending` 전후 전이를 설명하는 데 도움을 줄 수 있습니다

관련 문서: [Ticket Track Time](./ticket-track-time.md)

---

### Ticket History

- 모든 상태 전이를 기록합니다
- lifecycle 변경 사항을 감사 가능하고 명시적으로 만듭니다

상태 변화는 암묵적으로 일어나지 않습니다.
모든 전이는 workflow event로 기록됩니다.

관련 문서: [Ticket History](./ticket-history.md)

---

## 설계 고려사항

### 1. Category를 통한 유연성

Lifecycle은 ticket type별로 하드코딩되지 않고,
의도적으로 구성 가능하게 설계되었습니다.

### 2. 현실적인 운영 흐름 정렬

Lifecycle은 실제 운영 흐름을 반영합니다.

- 실행 전 검증
- 진행 중인 작업의 pause와 resume
- 거절과 수정 loop
- 완료 확인과 재작업 처리

### 3. 추적 가능성

모든 전이는 기록되며, 이를 통해 감사 가능성과 디버깅 가능성을 확보합니다.

### 4. 운영 명확성

`Declined`, `Rejected`, `Pending`, `Reopen` 같은 상태는
서로 다른 ownership, 의미, reporting value를 가지므로 분리되어 유지됩니다.

---

## 요약

Ticket lifecycle은 다음을 보장합니다.

- ticket이 통제된 workflow를 따라 이동합니다
- 각 단계에서 책임이 명확합니다
- 거절, 일시 중지, 재작업이 명시적으로 모델링됩니다
- 전이는 예측 가능하고 감사 가능하며 운영적으로 의미 있게 유지됩니다

이 lifecycle은 신뢰할 수 있고 확장 가능한 서비스 데스크 시스템을 만드는 핵심 기반입니다.
