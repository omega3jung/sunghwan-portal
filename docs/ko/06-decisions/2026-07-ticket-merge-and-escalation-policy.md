# Ticket Merge 및 Escalation 정책 (2026-07)

## Context

Service Desk Ticket Action model은 이미 `MERGE`를 operational command로 지원했다.

기존 merge 개념은 주로 동일한 operational scope 안의 중복 또는 관련 ticket을 위해
설계되었다.

```txt
source ticket
-> Closed
-> target ticket에 연결
-> closeReason = Merged
```

Ticket model에 Tenant scope가 명시되고 category scope가 `INTERNAL`과 `PORTAL`로
분리되면서 실질적인 workflow 문제가 생겼다.

내부에서 생성한 ticket을 나중에 기존 customer-facing PORTAL ticket과 연결해야 할 수
있다.

예:

```txt
INTERNAL ticket
-> 조사 결과 customer-facing incident로 확인됨
-> 기존 PORTAL ticket이 이미 공식 external workflow를 나타냄
```

시스템은 이를 다음 중 어떤 방식으로 처리할지 결정해야 했다.

- scope가 다르므로 금지
- 일반 merge로 처리
- 새로운 escalation command로 즉시 구현
- explicit escalation semantic을 적용하여 기존 merge execution으로 표현

이 결정은 일반적인 Ticket Action transaction 설계와 구분된다.

Action execution 결정은 command, ticket mutation, History의 consistency 유지 방법을
설명한다. 이 결정은 허용되는 scope transition과 그 의미를 설명한다.

---

## Problem

### 1. 모든 cross-scope merge를 허용하면 scope boundary가 약화됨

다음과 같은 광범위한 rule은 여러 위험을 만든다.

```txt
읽을 수 있는 모든 ticket
-> 읽을 수 있는 다른 모든 ticket으로 merge 가능
```

- cross-Tenant data relationship
- 우발적인 INTERNAL-to-customer information exposure
- 불명확한 reporting semantic
- PORTAL에서 INTERNAL workflow로의 역방향 이동
- 저장된 Tenant와 scope가 아닌 UI visibility에 기반한 authorization
- merge가 deduplication인지 escalation인지 설명하기 어려움

Ticket visibility만으로는 두 ticket을 merge할 수 있다는 충분한 근거가 되지 않는다.

---

### 2. 모든 INTERNAL-to-PORTAL 관계를 금지하면 실제 workflow를 무시함

INTERNAL ticket이 external service process의 일부가 되는 것은 정당한 상황일 수 있다.

이 관계를 완전히 차단하면 다음과 같은 문제가 생긴다.

- operational work 중복
- 분리된 audit trail
- free-text comment를 통한 수동 reference
- 공식 customer-facing ticket의 ownership 불명확
- INTERNAL source가 종료된 이유를 설명하기 어려움

Model에는 통제된 handoff path가 필요했다.

---

### 3. Escalation을 일반적인 same-scope merge로 처리하면 의미가 손실됨

Same-scope merge와 INTERNAL-to-PORTAL handoff는 관련되어 있지만 동일하지 않다.

```txt
same-scope merge
-> duplicate consolidation

INTERNAL -> PORTAL
-> operational escalation 또는 공식 external handoff
```

두 경우에 모두 다음만 사용하면 reporting과 UI 설명이 약해진다.

```txt
closeReason = Merged
```

---

### 4. 완전한 ESCALATE command를 즉시 도입하면 workflow surface가 확장됨

전용 command는 장기적으로 가장 명확한 semantic을 제공할 수 있다.

```txt
ESCALATE_TO_PORTAL
```

하지만 이를 즉시 도입하려면 다음 영역을 함께 변경해야 한다.

- Ticket Action union
- command route validation
- command payload
- permission 및 status rule
- UI action availability
- Action form 및 label
- History event semantic
- notification policy
- reporting
- test 및 documentation

당장의 requirement는 완전한 escalation subsystem을 구축하는 것이 아니라 기존 ticket
간의 통제된 관계를 표현하는 것이었다.

---

## Options Considered

### Option 1 — Actor가 두 ticket을 읽을 수 있으면 Tenant와 scope를 넘어 merge 허용

#### Advantages

- 유연함
- 단순한 UI rule
- special-case logic 최소화

#### Disadvantages

- visibility가 안전하지 않은 authorization shortcut이 됨
- Tenant isolation이 약화됨
- INTERNAL과 PORTAL의 의미가 불안정해짐
- 역방향 merge와 무관한 customer merge가 가능해짐
- reporting에서 consolidation과 escalation을 구분할 수 없음

이 option은 기각했다.

---

### Option 2 — 두 ticket의 scope가 동일한 경우에만 merge 허용

```txt
INTERNAL -> INTERNAL
PORTAL -> PORTAL
```

#### Advantages

- 가장 단순한 scope rule
- 엄격한 분리 보존
- merge가 하나의 의미를 유지함

#### Disadvantages

- 정당한 INTERNAL-to-PORTAL handoff를 표현할 수 없음
- 수동 cross-reference 동작을 강제함
- 통제된 closure reason 없이 operational record가 중복됨

이 option만으로는 충분하지 않았다.

---

### Option 3 — 전용 escalation command를 즉시 도입

```txt
INTERNAL ticket
-> ESCALATE_TO_PORTAL
-> 기존 또는 신규 PORTAL ticket
```

#### Advantages

- semantic이 가장 명확함
- 독립적인 authorization 및 History rule
- notification 및 customer communication behavior를 확장할 여지가 있음
- merge를 duplicate consolidation으로 제한할 수 있음

#### Disadvantages

- 현재 command surface를 크게 확장함
- 새로운 UI 및 payload 설계가 필요함
- escalation-specific requirement가 안정화되기 전에 성급한 abstraction이 될 수 있음
- 기존 merge transaction behavior의 상당 부분을 중복할 수 있음

이 option은 가능한 향후 방향으로 연기했다.

---

### Option 4 — MERGE execution을 재사용하고 close reason으로 escalation 구분

```txt
same-scope
-> MERGE
-> closeReason = Merged

same-Tenant INTERNAL -> PORTAL
-> MERGE
-> closeReason = Escalated
```

#### Advantages

- 기존의 검증된 command 및 transaction boundary를 재사용함
- target linking 구현을 하나로 유지함
- Action 및 History traceability를 보존함
- reporting 의미를 구분함
- scope 확장을 제한함
- 향후 전용 command를 도입할 여지를 남김

#### Disadvantages

- Action type만으로는 escalation을 완전히 전달하지 못함
- UI와 report가 `closeReason`을 확인해야 함
- 향후 escalation-specific behavior에는 별도 command가 필요할 수 있음

이 option을 선택했다.

---

## Decision

하나의 Service Desk Tenant 안에서 다음 방향의 merge만 허용한다.

```txt
same-Tenant INTERNAL -> INTERNAL
-> 허용
-> closeReason = Merged

same-Tenant PORTAL -> PORTAL
-> 허용
-> closeReason = Merged

same-Tenant INTERNAL -> PORTAL
-> 허용
-> closeReason = Escalated
```

다음은 거부한다.

```txt
PORTAL -> INTERNAL
cross-Tenant merge
Draft source 또는 target
```

상세 status 및 actor rule은 현재 Ticket Operation Rules를 따른다.

Admin에게 더 많은 UI capability가 있다는 이유만으로 scope policy가 넓어지지 않는다.
저장된 Tenant와 scope는 계속 server에서 검증하는 constraint다.

---

## Execution Semantics

### 1. MERGE Action 재사용

현재 execution은 다음과 같이 유지한다.

```txt
actionType = MERGE
historyEvent = TICKET_MERGED
```

Close reason이 reporting의 차이를 나타낸다.

```txt
Merged
Escalated
```

이를 통해 escalation-specific behavior가 성숙하기 전에 두 번째 command pipeline을
도입하지 않는다.

---

### 2. Source ticket 종료

Merge 또는 escalation이 성공하면 source ticket을 종료한다.

Source는 target relationship을 저장한다.

```txt
mergedIntoTicketId
mergedIntoTicketNo
```

Close reason은 다음 중 하나다.

```txt
Merged
또는
Escalated
```

별도로 persisted된 `Merged` 또는 `Escalated` ticket status는 없다.

---

### 3. 기존 target ticket 사용

현재 action은 source를 기존 target ticket에 연결한다.

다음 작업은 수행하지 않는다.

- 새로운 target ticket 생성
- source를 새로운 PORTAL ticket으로 clone
- target approval 또는 assignment 자동 재실행
- source와 target을 하나의 database row로 처리

향후 target 생성이 필요하면 별도의 workflow로 다룬다.

---

### 4. Source timeline을 target에 복사하지 않음

Relationship은 다음을 복사하지 않는다.

- source Ticket Action
- source Ticket History
- source attachment
- source rich-text content
- source Work Session

해당 record는 원래의 Ticket identity와 audit 의미를 유지한다.

UI 또는 DTO가 지원하는 경우 target에서 source와의 relationship을 노출할 수 있지만,
historical record를 다시 작성하지는 않는다.

---

### 5. Server를 authority로 유지

Client는 target ticket ID를 제출할 수 있지만 이것이 다음을 입증하지는 않는다.

- Tenant equality
- scope direction
- target eligibility
- merge permission
- source status validity

Command service는 trusted data에서 두 ticket을 다시 load하고 검증해야 한다.

---

## INTERNAL에서 PORTAL로만 허용하는 이유

허용 방향은 workflow 의미를 반영한다.

```txt
INTERNAL
-> internal investigation 또는 provider-side handling

PORTAL
-> 공식 customer-facing workflow
```

External ticket이 공식 workflow record가 될 수 있으므로 INTERNAL source를 기존
PORTAL target으로 escalate할 수 있다.

역방향은 동등하지 않다.

```txt
PORTAL -> INTERNAL
```

이는 customer-facing request를 internal-only workflow로 숨기거나 격하시킬 수 있고,
visibility expectation을 약화하며 audit 해석을 불명확하게 만들 수 있다.

따라서 역방향은 계속 거부한다.

---

## Action 및 History 의미

Command는 계속 Ticket Action execution boundary를 따른다.

```txt
MERGE Action
-> source 및 target 검증
-> source 종료
-> target relationship 저장
-> TICKET_MERGED History 추가
```

Action은 actor의 intent와 reason을 기록한다.

History는 발생한 effect를 immutable하게 기록한다.

Close reason은 다음을 구분한다.

```txt
duplicate consolidation
과
cross-scope escalation
```

---

## Consequences

### Positive

- Tenant isolation이 명시적으로 유지된다.
- Same-scope duplicate consolidation을 계속 지원한다.
- 현실적인 INTERNAL-to-PORTAL handoff를 표현할 수 있다.
- Reporting에서 `Merged`와 `Escalated`를 구분할 수 있다.
- 기존 Action, transaction, History infrastructure를 재사용한다.
- Source record가 원래의 audit identity를 유지한다.
- 대규모 escalation subsystem을 성급하게 추가하지 않는다.

---

### Negative / Trade-offs

- `MERGE`가 두 가지 business meaning을 가지게 된다.
- Consumer는 merge와 escalation을 구분하기 위해 `closeReason`을 확인해야 한다.
- 두 outcome이 `TICKET_MERGED`를 공유한다.
- Escalation-specific notification 및 approval behavior는 표현하지 않는다.
- 향후 explicit escalation command에는 migration 또는 compatibility 처리가 필요할 수
  있다.

---

## Future Direction

Escalation이 merge와 실질적으로 다른 behavior를 가지게 되면 다음과 같은 explicit
command를 도입한다.

```txt
ESCALATE_TO_PORTAL
```

이 변경을 촉발할 수 있는 requirement는 다음과 같다.

- command의 일부로 PORTAL target 생성
- customer notification 전달
- 필수 escalation reason category
- 다른 approval requirement
- source context 복사 또는 요약
- 별도의 History event
- 별도의 reporting 및 SLA behavior
- explicit accept/reject handoff workflow

그 시점에는 다음과 같이 구분한다.

```txt
MERGE
-> same-scope duplicate consolidation

ESCALATE_TO_PORTAL
-> 통제된 INTERNAL-to-PORTAL workflow
```

이러한 requirement가 생기기 전까지 현재의 `MERGE + Escalated closeReason` 설계를 더
작고 설명하기 쉬운 구현으로 유지한다.

---

## Related Documents

- [Ticket 운영 규칙](../03-domain/service-desk/ticket/reference/ticket-operation-rules.md)
- [Ticket Action 모델](../03-domain/service-desk/ticket/ticket-action.md)
- [Ticket History](../03-domain/service-desk/ticket/ticket-history.md)
- [Ticket 생명주기](../03-domain/service-desk/ticket/ticket-lifecycle.md)
- [Action 전략](../03-domain/service-desk/ticket/strategy/action-strategy.md)
- [Ticket Action 및 History 실행](./2026-07-ticket-action-and-history-execution.md)
- [Ticket Routing 및 Update 정책](./2026-07-ticket-routing-and-update-policy.md)

---

## Summary

Ticket merge는 trusted Tenant 및 scope relationship에 따라 제한된다.

하나의 Tenant 안에 있는 same-scope ticket은 `closeReason = Merged`로 통합할 수 있다.

INTERNAL ticket은 기존 `MERGE` Action과 `TICKET_MERGED` History를 사용하고
`closeReason = Escalated`를 설정하여 동일 Tenant 안의 기존 PORTAL ticket에 통제된
escalation으로 연결할 수 있다.

PORTAL-to-INTERNAL 및 cross-Tenant merge는 계속 거부한다. Escalation에 현재 merge
transaction 이상의 behavior가 필요해질 때까지 전용 escalation command 도입은 연기한다.

---

## Status

승인 및 구현 완료.
