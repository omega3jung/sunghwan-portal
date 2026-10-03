# Ticket Merge 및 Escalation 정책 (2026-07)

## Context

Service Desk Ticket Action 모델은 이미 `MERGE`를 운영 명령으로 지원했습니다.

기존 병합은 주로 같은 처리 범위 안의 중복되거나 관련된 티켓을 연결하기 위해
설계했습니다.

```txt
source ticket
-> Closed
-> target ticket에 연결
-> closeReason = Merged
```

티켓 모델에 테넌트 범위를 명시하고 카테고리 범위를 `INTERNAL`과 `PORTAL`로
분리하면서 실제 처리 흐름에서 문제가 생겼습니다.

내부에서 생성한 티켓을 나중에 기존 고객용 PORTAL 티켓과 연결해야 할 수 있습니다.

예:

```txt
INTERNAL ticket
-> 조사 결과 customer-facing incident로 확인됨
-> 기존 PORTAL ticket이 이미 공식 external workflow를 나타냄
```

시스템은 이를 다음 중 어떤 방식으로 처리할지 결정해야 했습니다.

- scope가 다르므로 금지
- 일반 merge로 처리
- 새로운 escalation command로 즉시 구현
- explicit escalation semantic을 적용하여 기존 merge execution으로 표현

이 결정은 일반적인 Ticket Action transaction 설계와 구분됩니다.

액션 실행 결정은 명령·티켓 변경·이력을 일관되게 유지하는 방법을 설명합니다.
이 결정은 허용할 범위 간 연결과 그 의미를 설명합니다.

---

## Problem

### 1. 모든 cross-scope merge를 허용하면 scope boundary가 약화됨

다음과 같은 광범위한 rule은 여러 위험을 만듭니다.

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

두 티켓을 조회할 수 있다는 사실만으로 병합을 허용할 수는 없습니다.

---

### 2. 모든 INTERNAL-to-PORTAL 관계를 금지하면 실제 workflow를 무시함

INTERNAL 티켓을 고객 서비스 처리 과정에 연결해야 하는 정당한 상황이 있을 수 있습니다.

이 관계를 완전히 차단하면 다음과 같은 문제가 생깁니다.

- operational work 중복
- 분리된 audit trail
- free-text comment를 통한 수동 reference
- 공식 customer-facing ticket의 ownership 불명확
- INTERNAL source가 종료된 이유를 설명하기 어려움

모델에는 정해진 조건에 따라 고객용 티켓으로 넘기는 경로가 필요했습니다.

---

### 3. Escalation을 일반적인 same-scope merge로 처리하면 의미가 손실됨

같은 범위의 병합과 INTERNAL에서 PORTAL로 넘기는 처리는 목적이 다릅니다.

```txt
same-scope merge
-> duplicate consolidation

INTERNAL -> PORTAL
-> operational escalation 또는 공식 external handoff
```

두 경우에 모두 다음만 사용하면 reporting과 UI 설명이 약해집니다.

```txt
closeReason = Merged
```

---

### 4. 완전한 ESCALATE command를 즉시 도입하면 workflow surface가 확장됨

전용 명령을 만들면 장기적으로 처리 목적을 가장 명확하게 표현할 수 있습니다.

```txt
ESCALATE_TO_PORTAL
```

하지만 이를 즉시 도입하려면 다음 영역을 함께 변경해야 합니다.

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

당시 요구사항은 기존 티켓 간에 정해진 조건으로 연결 관계를 표현하는 것이었습니다.
고객용 티켓으로 넘기는 전체 하위 시스템을 구축할 필요는 없었습니다.

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

이 선택지는 채택하지 않았습니다.

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

이 선택지만으로는 요구사항을 충족하지 못했습니다.

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

이 선택지는 향후 검토할 수 있는 방향으로 남겼습니다.

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

이 선택지를 채택했습니다.

---

## Decision

하나의 Service Desk Tenant 안에서 다음 방향의 merge만 허용합니다.

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

다음은 거부합니다.

```txt
PORTAL -> INTERNAL
cross-Tenant merge
Draft source 또는 target
```

상세 status 및 actor rule은 현재 Ticket Operation Rules를 따릅니다.

Admin에게 더 많은 UI 작업이 허용되어도 병합 범위 정책은 같게 적용합니다.
서버는 저장된 테넌트와 범위를 계속 검증합니다.

---

## Execution Semantics

### 1. MERGE Action 재사용

현재 execution은 다음과 같이 유지합니다.

```txt
actionType = MERGE
historyEvent = TICKET_MERGED
```

종료 사유로 보고서에서 두 처리를 구분합니다.

```txt
Merged
Escalated
```

이렇게 하면 고객용 티켓으로 넘길 때만 필요한 동작이 구체화되기 전에 별도 명령
처리 흐름을 추가하지 않아도 됩니다.

---

### 2. Source ticket 종료

병합하거나 고객용 티켓으로 넘기는 처리가 성공하면 원본 티켓을 종료합니다.

원본 티켓에는 대상 티켓과의 연결을 저장합니다.

```txt
mergedIntoTicketId
mergedIntoTicketNo
```

Close reason은 다음 중 하나입니다.

```txt
Merged
또는
Escalated
```

티켓 상태에 `Merged`나 `Escalated`를 별도로 저장하지 않습니다.

---

### 3. 기존 target ticket 사용

현재 액션은 원본 티켓을 기존 대상 티켓에 연결합니다.

다음 작업은 수행하지 않습니다.

- 새로운 target ticket 생성
- source를 새로운 PORTAL ticket으로 clone
- target approval 또는 assignment 자동 재실행
- source와 target을 하나의 database row로 처리

향후 target 생성이 필요해지면 별도의 workflow로 다룹니다.

---

### 4. Source timeline을 target에 복사하지 않음

Relationship은 다음을 복사하지 않습니다.

- source Ticket Action
- source Ticket History
- source attachment
- source rich-text content
- source Work Session

각 기록은 원래 티켓 식별자와 추적 의미를 유지합니다.

UI나 DTO가 지원하면 대상 티켓에서 원본 티켓과의 연결을 표시할 수 있습니다.
과거 기록을 다시 작성하지는 않습니다.

---

### 5. Server를 authority로 유지

Client는 target ticket ID를 제출할 수 있지만 이것이 다음을 입증하지는 않습니다.

- Tenant equality
- scope direction
- target eligibility
- merge permission
- source status validity

명령 서비스는 신뢰할 수 있는 데이터에서 두 티켓을 다시 조회하고 검증해야 합니다.

---

## INTERNAL에서 PORTAL로만 허용하는 이유

허용 방향은 workflow 의미를 반영합니다.

```txt
INTERNAL
-> internal investigation 또는 provider-side handling

PORTAL
-> 공식 customer-facing workflow
```

고객용 티켓이 공식 처리 기록이 될 수 있으므로 INTERNAL 원본을 기존 PORTAL
대상으로 넘길 수 있습니다.

역방향은 동등하지 않습니다.

```txt
PORTAL -> INTERNAL
```

역방향 연결은 고객 요청을 내부 전용 절차로 숨기거나 격하시킬 수 있습니다. 고객이
예상한 조회 범위를 줄이고 추적 기록의 해석도 모호하게 만들 수 있습니다.

따라서 역방향은 계속 거부합니다.

---

## Action 및 History 의미

Command는 계속 Ticket Action execution boundary를 따릅니다.

```txt
MERGE Action
-> source 및 target 검증
-> source 종료
-> target relationship 저장
-> TICKET_MERGED History 추가
```

액션은 실행자의 의도와 사유를 기록합니다.

이력은 실제 처리 결과를 변경할 수 없는 기록으로 남깁니다.

Close reason은 다음을 구분합니다.

```txt
duplicate consolidation
과
cross-scope escalation
```

---

## Consequences

### Positive

- Tenant isolation이 명시적으로 유지됩니다.
- Same-scope duplicate consolidation을 계속 지원합니다.
- 현실적인 INTERNAL-to-PORTAL handoff를 표현할 수 있습니다.
- Reporting에서 `Merged`와 `Escalated`를 구분할 수 있습니다.
- 기존 Action, transaction, History infrastructure를 재사용합니다.
- Source record가 원래의 audit identity를 유지합니다.
- 대규모 escalation subsystem을 성급하게 추가하지 않습니다.

---

### Negative / Trade-offs

- `MERGE`가 두 가지 business meaning을 가지게 됩니다.
- Consumer는 merge와 escalation을 구분하기 위해 `closeReason`을 확인해야 합니다.
- 두 outcome이 `TICKET_MERGED`를 공유합니다.
- Escalation-specific notification 및 approval behavior는 표현하지 않습니다.
- 향후 explicit escalation command에는 migration 또는 compatibility 처리가 필요할 수
  있습니다.

---

## Future Direction

고객용 티켓으로 넘기는 동작이 병합과 실질적으로 달라지면 다음과 같은 전용
명령을 도입합니다.

```txt
ESCALATE_TO_PORTAL
```

이 변경을 촉발할 수 있는 requirement는 다음과 같습니다.

- command의 일부로 PORTAL target 생성
- customer notification 전달
- 필수 escalation reason category
- 다른 approval requirement
- source context 복사 또는 요약
- 별도의 History event
- 별도의 reporting 및 SLA behavior
- explicit accept/reject handoff workflow

그 시점에는 다음과 같이 구분합니다.

```txt
MERGE
-> same-scope duplicate consolidation

ESCALATE_TO_PORTAL
-> 통제된 INTERNAL-to-PORTAL workflow
```

이 요구사항이 생기기 전까지는 구현 범위가 작고 설명하기 쉬운 현재의
`MERGE + Escalated closeReason` 설계를 유지합니다.

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

티켓 병합은 신뢰할 수 있는 테넌트와 범위 관계에 따라 제한합니다.

같은 테넌트와 같은 범위의 티켓은 `closeReason = Merged`로 병합할 수 있습니다.

INTERNAL 티켓은 기존 `MERGE` 액션과 `TICKET_MERGED` 이력을 사용하고
`closeReason = Escalated`를 설정해 같은 테넌트의 기존 PORTAL 티켓으로 넘길 수 있습니다.

PORTAL에서 INTERNAL로의 병합과 테넌트 간 병합은 계속 거부합니다. 현재 병합
트랜잭션으로 표현할 수 없는 동작이 필요해질 때까지 전용 전달 명령 도입은 보류합니다.

---

## Status

승인 및 구현 완료.
