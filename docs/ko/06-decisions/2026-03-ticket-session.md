# 티켓 세션 및 시간 추적 결정사항 (2026-03)

## 배경

Service Desk 티켓 모듈을 구현하는 과정에서,
실제 운영 워크플로에 맞는 방식으로 티켓별 시간 추적을 지원할 필요가 생겼다.

시스템은 다음을 처리할 수 있어야 했다.

- 티켓 화면에서 바로 시작 및 종료하는 빠른 액션
- 시간 구간 또는 기간 기반의 수동 시간 입력
- 티켓 간 작업 전환
- 현재 사용자의 작업 컨텍스트에 따른 티켓 우선순위화

이 문서는 `TicketTrackTime`, 타이머 동작,
그리고 작업 컨텍스트 기반 UX와 관련된 설계 결정을 정리한다.

---

## 1. 시간을 작업 세션 단위로 추적한다

### 결정

`TicketTrackTime`은 집계된 시간 값이 아니라,
하나의 작업 세션 엔트리로 모델링한다.

### 이유

- 실제 작업은 하나의 티켓에서도 여러 세션에 걸쳐 발생하는 경우가 많다
- 모델이 중단, 재할당, 작업 재개를 지원할 수 있어야 한다
- Jira worklog 같은 엔터프라이즈 도구와 더 잘 맞는다

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

### 규칙

- `startAt`은 항상 존재한다
- `endAt === null`이면 현재 실행 중인 세션을 의미한다
- `durationMinutes`는 세션 종료 시점에 결정된다
- 하나의 티켓에 여러 세션이 존재할 수 있다

---

## 2. 별도의 Track Log 테이블은 도입하지 않는다

### 결정

별도의 `TicketTrackLog` 테이블은 추가하지 않는다.

### 이유

- 이미 `TicketTrackTime`이 표현하는 정보를 중복하게 된다
- 테이블 간 정합성 위험이 커진다
- 얻는 가치에 비해 복잡도만 증가한다

### 대안

다음과 같이 사용한다.

- `TicketTrackTime`: 세션 데이터의 source of truth
- `TicketHistory`: 시작, 종료 같은 이벤트의 audit trail

---

## 3. 빠른 시간 추적은 폼이 아닌 타이머 액션으로 처리한다

### 결정

시작과 종료는 폼 입력이 아니라 직접적인 API 액션으로 구현한다.

### 이유

- 실제 시간 값은 서버가 제어해야 한다
- 단일 액션 방식이 UI에서 더 빠르다
- 클라이언트 측 시간 조작을 피할 수 있다

### API

```txt
POST /tickets/:ticketId/track-time/start
POST /tickets/:ticketId/track-time/finish
```

### 동작

- `start`는 `startAt = now`인 새 세션을 만든다
- `finish`는 `endAt = now`로 현재 활성 세션을 종료한다
- `durationMinutes`는 종료 시 계산된다

---

## 4. 작업 전환을 위한 `switch` 액션을 도입한다

### 결정

티켓 간 자연스러운 이동을 지원하기 위해 전용 `switch` API를 추가한다.

### API

```txt
POST /tickets/:ticketId/track-time/switch
```

### 동작

1. 실행 중인 세션이 있으면 먼저 종료한다
2. 대상 티켓에 대한 새 세션을 시작한다
3. 새로 생성된 세션을 반환한다

### 이유

- "현재 작업 종료 후 새 작업 시작"이라는 자연스러운 흐름을 지원한다
- 여러 단계의 로직이 클라이언트로 새어 나가는 것을 막는다
- 서버에서 원자적으로 처리할 수 있다

---

## 5. 수동 시간 입력은 타이머 액션과 분리한다

### 결정

수동 시간 입력은 두 가지 폼 모드로 분리한다.

1. 시간 구간 입력: `startAt`, `endAt`
2. 기간 입력: `durationMinutes`

### 이유

- 사용자는 시간을 서로 다른 방식으로 인식한다
- 모드를 나누면 검증이 더 단순해진다
- 지나치게 복잡한 조건부 스키마를 피할 수 있다

### 규칙

- 하나의 폼에서는 하나의 입력 모드만 사용한다
- 시간 구간 입력을 사용할 때 `durationMinutes`는 서버가 계산한다

---

## 6. 활성 세션은 하나만 허용한다

### 결정

주어진 `(ticketId, assigneeId)`에 대해
`endAt IS NULL`인 세션은 하나만 존재할 수 있다.

### 이유

- 동시에 여러 활성 세션이 생기는 것을 막는다
- `finish(ticketId)` 동작을 결정적으로 만든다
- 서버 규칙을 단순화할 수 있다

### 영향

- 어떤 세션이 활성 상태인지 항상 명확하다
- 타이머 동작을 더 쉽게 추론할 수 있다

---

## 7. 작업 컨텍스트를 기준으로 티켓 목록 우선순위를 정한다

### 결정

현재 사용자의 작업 상태에 따라 티켓을 정렬한다.

### 우선순위 순서

1. 나에게 할당되어 있고 현재 실행 중인 티켓
2. 나에게 할당되어 있지만 실행 중은 아닌 티켓
3. 할당 가능한 카테고리 또는 승인 단계에 있는 티켓
4. 같은 부서의 티켓
5. 그 외의 티켓

### 이유

- 티켓 목록이 작업 중심 inbox처럼 동작해야 한다
- 바로 처리할 수 있는 항목이 먼저 보여야 한다
- 일상적인 운영 흐름을 더 잘 지원할 수 있다

---

## 8. 파생된 `MyWorkContext`를 도입한다

### 결정

현재 사용자의 작업 상태를 경량의 파생 컨텍스트로 표현한다.

### 예시

```ts
type MyWorkContext = {
  currentWorkingTicketId: string | null;
  currentTrackTimeNo: string | null;
  hasRunningTimer: boolean;
};
```

### 이유

- Finish와 Switch 같은 조건부 UI를 지원할 수 있다
- 타이머 상태를 별도의 전역 스토어에 중복 저장하지 않아도 된다
- UI를 쿼리나 서버 데이터에서 파생된 상태로 유지할 수 있다

---

## 9. Count 기반 타이머 로직은 피한다

### 기각한 접근

```sql
SELECT COUNT(*)
FROM ticket_track_time
WHERE ticketId = :ticketId
  AND assigneeId = :assigneeId
  AND endAt IS NULL;
```

### 기각 이유

- 상태 추론에 의존하는 암묵적 동작이 생긴다
- race condition 위험이 커진다
- 에러 처리가 더 모호해진다

### 선호하는 접근

- `start`, `finish`, `switch` 같은 명시적 API 액션을 사용한다
- 개수를 세는 대신 실제 활성 세션 row를 조회해 해결한다

---

## 요약

이 설계는 다음 요소를 가진 세션 기반 시간 추적 모델을 확립한다.

- 빠른 타이머 액션과 수동 입력의 명확한 분리
- 서버가 제어하는 시간 처리 동작
- 원자적인 작업 전환
- 활성 작업 컨텍스트 기반의 티켓 우선순위화

그 결과, 이 시스템은 다음과 같은 성격을 갖게 된다.

- 실제 Service Desk 워크플로에 부합함
- 사용자에게 직관적임
- 향후 확장에 유리함
