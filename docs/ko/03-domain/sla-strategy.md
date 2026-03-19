# SLA Strategy

## Goal

SLA(Service Level Agreement) 시스템은 티켓 처리에 대한
**시간 기반 기대치(time-based expectations)** 를 정의하고,
서비스 품질이 측정 가능하고, 강제 가능하며, 지속적으로 모니터링되도록 보장한다.

구체적인 목표는 다음과 같다.

- 응답 시간과 해결 시간을 보장한다.
- 중요한 이슈를 효과적으로 우선순위화한다.
- 측정 가능한 성과 지표를 제공한다.
- 선제적 escalation을 가능하게 한다.

---

## Core Concept

SLA는 **risk level**과 **priority**의 조합으로 결정된다.

```id="1a2b3c"
SLA = f(Risk Level, Priority)
```

이 방식은 서로 다른 비즈니스 맥락에 유연하게 대응할 수 있는
확장 가능한 모델을 만든다.

---

## SLA Dimensions

각 SLA는 여러 시간 제약으로 구성된다.

### 1. Response Time

티켓 생성부터 최초의 의미 있는 응답까지 걸리는 시간이다.

---

### 2. Resolution Time

티켓 생성부터 최종 해결까지 걸리는 시간이다.

---

### 3. Escalation Time (Optional)

escalation이 발생하기 전까지의 임계 시간이다.

---

## SLA Matrix

SLA 값은 매트릭스를 통해 설정한다.

### Example (4 x 4)

| Risk \ Priority | Low | Medium | High | Urgent |
| --------------- | --- | ------ | ---- | ------ |
| Low             | 48h | 24h    | 12h  | 6h     |
| Medium          | 24h | 12h    | 6h   | 3h     |
| High            | 12h | 6h     | 3h   | 1h     |
| Critical        | 6h  | 3h     | 1h   | 30m    |

---

## SLA Assignment

SLA는 티켓 생성 시점에 할당된다.

### Flow

```id="flow-sla"
Ticket Created
-> Determine Risk Level
-> Determine Priority
-> Lookup SLA Matrix
-> Assign SLA
```

---

## SLA Lifecycle

SLA는 티켓 생애주기를 따라 진행된다.

### States

- **Active**: 시간을 계산 중인 상태
- **Paused**: 일시적으로 정지된 상태
- **Breached**: SLA를 초과한 상태
- **Completed**: SLA 내에서 해결된 상태

---

## SLA Clock Behavior

### Start

- 티켓 생성 시점에 시작한다.

---

### Pause Conditions

다음 상황에서는 SLA가 일시 정지된다.

- 요청자 응답을 기다리는 경우
- 티켓이 `Pending` 상태인 경우
- 외부 의존성이 존재하는 경우

---

### Resume

- 티켓이 다시 active work 상태로 돌아오면 재개된다.

---

## Escalation Strategy

escalation은 SLA 위반을 선제적으로 처리하기 위해 필요하다.

### Types

#### 1. Time-based Escalation

SLA 임계치가 임박했거나 이미 초과한 경우 트리거된다.

---

#### 2. Hierarchical Escalation

다음과 같은 상위 책임자에게 escalation한다.

- Team lead
- Manager
- Higher-level support

---

### Example

```ts id="esc1"
if (remainingTime < threshold) {
  notify(manager);
}
```

---

## SLA Breach Handling

SLA를 초과하면 다음 작업이 필요하다.

### Actions

- `Breached` 상태로 표시한다.
- 알림/notification을 발생시킨다.
- breach event를 기록한다.
- 리포팅 지표에 포함한다.

---

## SLA Visibility

SLA는 사용자에게 투명하게 드러나야 한다.

### UI Elements

- 남은 시간
- due date
- breach indicator (예: 빨간 상태 표시)
- escalation warning

---

## SLA Calculation Strategy

### Static Calculation

- SLA를 생성 시점에 한 번만 결정한다.
- 단순하고 예측 가능하다.

---

### Dynamic Calculation (Optional)

다음 값이 바뀌면 SLA를 다시 계산할 수 있다.

- Priority 변경
- Risk level 변경

---

### Trade-off

| Approach | Pros | Cons |
| --- | --- | --- |
| Static | 단순하고 안정적임 | 유연성이 낮음 |
| Dynamic | 상황에 더 잘 적응함 | 더 복잡하고 추적이 어려움 |

---

## Time Tracking Model

SLA는 단순 경과 시간이 아니라
**실제 유효 근무 시간(effective working time)** 을 기준으로 계산한다.

### Considerations

- Business hours
- Holidays
- Time zones

---

### Example

```ts id="time1"
calculateWorkingTime(start, end, {
  businessHours: "09:00-18:00",
  holidays: [...]
});
```

---

## Metrics & Reporting

SLA는 측정 가능한 KPI를 제공한다.

### Key Metrics

- SLA compliance rate
- Average response time
- Average resolution time
- Breach count
- Escalation count

---

## Integration with Assignment

SLA는 할당 정책에도 영향을 준다.

### Examples

- 긴급 티켓은 숙련된 담당자에게 우선 할당한다.
- breach 임박 티켓은 큐에서 우선순위를 높인다.

---

## Edge Cases

### 1. Priority Change

- SLA 재계산이 필요할 수 있다.

---

### 2. Long Pending State

- SLA가 무기한 정지될 수 있다.
- 남용 위험이 있으므로 별도 모니터링이 필요하다.

---

### 3. Reopened Tickets

가능한 선택지는 다음과 같다.

- SLA를 초기화한다.
- 이전 SLA를 이어서 사용한다.

---

### 4. Missing SLA Configuration

- fallback SLA가 필요하다.

---

## Fallback Strategy

SLA를 결정할 수 없는 경우에는 다음 전략을 사용한다.

- 기본 SLA를 적용한다.
- 티켓 생성을 차단한다(optional).
- 설정 오류를 로그로 남긴다.

---

## Trade-offs

### Pros

- 서비스 품질을 강제할 수 있다.
- 성능 측정을 가능하게 한다.
- escalation 자동화를 지원한다.

---

### Cons

- 정확한 설정이 필요하다.
- 시간 계산 로직이 복잡하다.
- edge case가 시스템 복잡도를 높인다.

---

## Alternatives Considered

### 1. Fixed SLA

- 모든 티켓에 동일한 SLA를 적용한다.
- 우선순위화를 지원하지 못한다.

---

### 2. Priority-only SLA

- priority만으로 SLA를 결정한다.
- 비즈니스 영향도를 충분히 반영하지 못한다.

---

### 3. No SLA

- 측정 가능한 성능 기준이 없다.
- 책임성을 확보하기 어렵다.

---

## Design Principles Alignment

이 전략은 다음 원칙과 정렬된다.

- 측정 가능한 서비스 품질
- 설정 가능한 시스템 설계
- 운영 투명성
- 확장 가능한 아키텍처

---

## Summary

SLA 시스템은 서비스 기대치를 관리하기 위한
**구조화되고 측정 가능한 프레임워크**를 제공하며,
선제적 escalation을 가능하게 하고,
시스템 전반에서 일관된 서비스 품질을 유지하도록 돕는다.
