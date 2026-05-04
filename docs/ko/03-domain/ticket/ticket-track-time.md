# 티켓 작업 시간 추적

## 목적

티켓 작업 시간 추적 모델은 티켓에서 수행된 작업을 어떻게 기록할지 정의한다.

이 모델의 목표는 다음과 같다.

- 실제 작업 형태를 정확하게 표현한다.
- 작업 중단과 작업 전환을 지원한다.
- 분석과 리포팅을 위한 신뢰할 수 있는 데이터를 제공한다.
- 빠르고 직관적인 사용자 상호작용을 가능하게 한다.

---

## 문제 정의

전통적인 시간 추적 시스템은 종종 집계된 값만 저장한다.

```txt
ticket.workTime = 180 minutes
```

하지만 이 방식은 실제 작업 흐름을 제대로 표현하지 못한다.

- 작업은 자주 중단된다.
- 사용자는 여러 티켓 사이를 전환한다.
- 작업은 나중에 다시 이어질 수 있다.
- 병렬 작업이 흔하게 발생한다.

그 결과:

- 시간 추적이 부정확해지고
- 사용자 행동이 제대로 반영되지 않으며
- 감사 가능성이 제한된다.

---

## 핵심 원칙

```txt
Work is a collection of sessions, not a single accumulated value.
```

작업 시간 모델은 하나의 파생 총합 값이 아니라,
실제 작업을 명시적인 세션 레코드로 다룬다.

---

## 작업 세션 모델

각 작업 세션은 `TicketTrackTime` 항목으로 표현된다.

### 모델

```ts
export interface TicketTrackTime {
  ticketId: string;
  trackTimeNo: string;

  assigneeId: string;

  startAt: ISODateString;
  endAt: ISODateString | null;

  durationMinutes: number | null;

  note?: string;

  createdAt: ISODateString;
  updatedAt: ISODateString;
}
```

### 핵심 특성

#### 1. 세션 기반 추적

- 각 항목은 하나의 연속적인 작업 세션을 나타낸다.
- 하나의 티켓에 여러 세션이 존재할 수 있다.

예시:

```txt
09:00 - 10:00 -> session 1
15:00 - 17:00 -> session 2
```

#### 2. 실행 중 세션

- `endAt === null` 이면 현재 세션이 진행 중이라는 뜻이다.
- 이는 활성 작업 상태를 나타낸다.
- 현재 작업 컨텍스트를 계산하는 데 사용된다.

#### 3. 집계 시간

- 총 작업 시간은 완료된 세션들의 합으로 계산된다.
- `durationMinutes` 는 세션 완료 시 계산된다.
- 집계 값은 원본 데이터가 아니라 파생 값이다.

---

## 타이머 기반 액션

시스템은 효율적인 시간 추적을 위해 빠른 액션을 제공한다.

### Start

```txt
POST /tickets/:ticketId/track-time/start
```

- 새 세션을 생성한다.
- `startAt = server time`
- `endAt = null`

### Finish

```txt
POST /tickets/:ticketId/track-time/finish
```

- 현재 실행 중인 세션을 종료한다.
- `endAt = server time`
- `durationMinutes` 를 계산한다.

### Switch

```txt
POST /tickets/:ticketId/track-time/switch
```

- 실행 중인 세션이 있으면 먼저 종료한다.
- 다른 티켓에 대한 새 세션을 시작한다.
- 반드시 원자적으로 처리되어야 한다.

---

## 왜 Switch가 필요한가?

`switch` 가 없다면 사용자는 다음을 각각 수동으로 해야 한다.

- 현재 작업 종료
- 새 작업 시작

이 경우 다음 문제가 생긴다.

- 불일치한 시간 추적
- 누락된 액션
- 나쁜 사용자 경험

`switch` 는 다음을 보장한다.

```txt
finish + start = single atomic action
```

---

## 수동 입력 방식

타이머 액션 외에도 시스템은 수동 입력을 지원한다.

### Time Range

- `startAt`
- `endAt`

### Duration

- `durationMinutes`

### 설계 결정

타이머 입력과 수동 입력은 의도적으로 분리되어 있다.

이유:

- 사용자 의도가 서로 다르다.
- 검증 로직이 단순해진다.
- 충돌하는 입력을 피할 수 있다.

---

## 제약 조건

### 단일 활성 세션

하나의 `(ticketId, assigneeId)` 조합에는 최대 하나의 활성 세션만 허용된다.

이유:

- 중복 작업 세션을 방지한다.
- 종료 액션의 모호성을 줄인다.
- 결정 가능한 동작을 보장한다.

### 서버 제어 시간

모든 타임스탬프는 서버에서 생성된다.

- 조작을 방지한다.
- 일관성을 보장한다.

---

## 작업 컨텍스트 연계

작업 시간 정보는 현재 작업 컨텍스트를 계산하는 데 사용된다.

### 파생 상태

- 현재 작업 중인 티켓
- 실행 중인 세션
- 현재 사용자 작업 부하

### 예시

```txt
if endAt is null -> user is working on this ticket
```

---

## UI 동작

작업 시간 정보는 UI 동작에 직접적인 영향을 준다.

### 사용자가 이 티켓에서 작업 중인 경우

- `Finish` 를 표시한다.

### 사용자가 다른 티켓에서 작업 중인 경우

- `Finish current and start` 를 표시한다.

### 사용자가 현재 작업 중이 아닌 경우

- `Start` 를 표시한다.

---

## 다른 도메인과의 관계

### Ticket

- 작업 시간은 특정 티켓에 속한다.

관련 문서: [Ticket Model](./ticket-model.md)

---

### Assignment

- 담당자만 작업 시간을 기록할 수 있다.

관련 문서: [Assignment Policy](./strategy/assignment-policy.md)

---

### Ticket History

- 시작, 종료, 전환 액션은 기록된다.
- 작업 시간 추적은 이력을 통해 감사 가능하게 유지된다.

관련 문서: [Ticket History](./ticket-history.md)

---

## 설계 트레이드오프

### 장점

- 실제 작업을 정확하게 표현한다.
- 작업 중단과 전환을 지원한다.
- 고급 UX를 가능하게 한다.

### 단점

- 집계형 추적보다 더 복잡하다.
- 추가 제약이 필요하다.
- 서버 측 처리를 신중하게 설계해야 한다.

---

## 요약

작업 시간 모델은 작업을 하나의 누적 값이 아닌 세션들의 집합으로 표현한다.

이 모델은 실제 업무 흐름을 지원하고, 빠른 사용자 상호작용을 가능하게 하며,
작업 컨텍스트 및 UI 동작과 직접 연결되는 현실적인 서비스 데스크 구현의 핵심 요소이다.
