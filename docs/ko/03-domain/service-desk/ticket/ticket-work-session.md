# Ticket Work Session

## 목표

Ticket Work Session은 현재 작업 시간 기록 모델을 정의합니다.

작업 시간 기록은 Ticket Action과 별도로 관리합니다. 실제 작업 내역을 기록하며,
필요한 경우 티켓의 작업 상태를 변경할 수 있습니다.

---

## 현재 Route Surface

```txt
GET  /api/service-desk/tickets/:ticketId/work-session
POST /api/service-desk/tickets/:ticketId/work-session
```

현재 API는 다음 경로를 제공하지 않습니다.

- 작업 시간 기록 상세 조회
- 수정
- 삭제
- 타이머 시작
- 타이머 종료
- 타이머 전환

일부 기능별 클라이언트 헬퍼는 이 미구현 경로를 참조하지만, 현재 API 경로 파일은
목록 조회와 생성만 제공합니다.

---

## Work Session DTO

```ts
type WorkSessionDto = {
  ticket_id: string;
  work_session_no: number;
  assignee_username: string;
  start_at: ISODateString | null;
  end_at: ISODateString | null;
  duration_minutes: number | null;
  note: string | null;
  created_at: ISODateString;
  updated_at: ISODateString | null;
};
```

도메인·UI 변환은 같은 정보를 camelCase 필드로 제공합니다.

---

## Submit Payload

```ts
type TicketWorkSessionSubmitPayload = {
  ticketId: string;
  inputMode: "duration" | "range";
  durationMinutes?: number;
  startAt?: string;
  endAt?: string;
  nextStatus?: "Working" | "Pending" | "Resolved";
  note?: string;
};
```

서버는 duration 모드에서는 입력한 `durationMinutes`에서, range 모드에서는 시작·종료
시각인 `startAt`과 `endAt`에서 `trackedMinutes`를 계산합니다. 계산 결과는 양수여야 합니다.

---

## Actor Rule

과거 작업 담당자를 판단할 때는 승인자 배정과 작업자 배정을 구분합니다.
`ASSIGNMENT_RESOLVED`는 변경 후 담당자만, WORK 단계의 `ASSIGNMENT_UPDATED`는
변경 전후 담당자를 모두 인정합니다. `ROUTING_RESET`도 해당 측 승인 단계 필드가
명시적으로 null인 경우 작업 배정 근거로 인정합니다. 요청자 수정은 metadata를,
설정 변경에 따른 담당자 재결정은 from/to 스냅샷을 사용합니다. 단계 필드가 없으면 작업 배정 근거로
인정하지 않습니다. 이 기준은 실제 승인 배정도 포함하는 NOTE의 과거 담당자 관계와 별개입니다.

현재·과거 작업 담당자는 작업 시간 기록을 만들 수 있습니다.
따라서 재배정 이후에도 과거 담당자가 누락된 작업 내역을 추가할 수 있습니다.

두 경우 모두 티켓 조회 권한이 있고, 현재 상태가 `Assigned`, `Working`, `Pending` 중
하나여야 합니다. 과거 배정 관계만으로 조회 권한을 얻거나 해결·종료
이후에 작업 시간을 기록할 수는 없습니다.

`nextStatus`로 상태 변경을 요청할 수 있는 주체는 현재 작업 담당자뿐입니다.
과거 작업 담당자는 티켓의 현재 상태를 변경하지 않고 작업 내역만 제출해야 합니다.

승인 단계의 티켓에는 작업 시간을 기록할 수 없습니다. 현재 담당자가 작업자가 아니라
승인자이기 때문입니다. 승인자로 배정된 이력만으로는 현재·과거 작업 담당자 조건을 충족하지 않습니다.

---

## Start Work Command Boundary

Start Work는 Work Session 행이 아니라 별도 티켓 명령입니다. start-work 명령은
`Assigned -> Working`으로 상태를 변경하고 `STATUS_UPDATED` 이력을 기록합니다.
작업 시간 기록 제출은 실제 작업 내역을 기록하며 지원하는 작업 상태 전이도 적용할 수 있습니다.

---

## Status Effects

작업 시간 기록 생성은 티켓 상태를 변경할 수 있습니다.

허용하는 상태 전이:

```txt
Assigned -> Working
Working -> Pending
Working -> Resolved
Pending -> Working
Pending -> Resolved
```

규칙:

- 현재 작업 담당자가 `Assigned`에서 제출할 때는 `Working`으로 이동해야 합니다.
- 현재 작업 담당자가 `Pending`에서 제출할 때는 `Working` 또는 `Resolved`로
  이동해야 합니다.
- 현재 작업 담당자가 `Working`에서 추가 시간을 기록할 때는 `Working`으로 남을
  수 있습니다.
- 과거 작업 담당자는 상태를 변경하지 않고 작업 내역을 기록합니다.
- GET은 상태를 변경하지 않습니다.
- 타이머 정지는 티켓을 자동으로 해결 상태로 변경하지 않습니다.

---

## Work Minutes Aggregate

작업 시간 기록을 만들면 서버가 계산한 시간이 티켓 합계인 `workMinutes`에 추가됩니다.

합계는 티켓 목록·상세 화면에 표시하며, 개별 작업 시간 행은 실제 작업 내역으로 남습니다.

---

## History

작업 시간 기록 생성이 티켓 상태를 변경하면 `STATUS_UPDATED` 이력을 만듭니다.

History union에는 작업 시간 기록 전용 이벤트가 포함되어 있지만,
현재 작업 시간 기록 목록·생성 API에서는 사용하지 않습니다.

시스템 또는 티켓 명령은 작업 거부, 통합, 취소, 해결, 자동 종료 시 진행 중인
작업 시간 기록을 종료할 수 있습니다.

---

## Due Date Separation

티켓 기한은 계획·SLA 필드이며, Work Session 필드가 아닙니다.

작업 시간 기록은 다음 실제 작업 내역을 남깁니다.

- 누가 작업했는가
- 언제 또는 얼마나 오래 작업했는가
- 메모
- 요청한 경우 적용한 작업 상태 전이

---

## Active Session Invariant

현재 REMOTE 생성·목록 구현은 제출한 작업 시간 기록을 처리합니다. 티켓별로 진행 중인
기록을 종료하는 repository 기능은 포함합니다. 다만 전체 타이머 API를 제공하거나,
사용자당 활성 타이머가 하나여야 한다는 전역 규칙("one active timer per user")을 강제하지 않습니다.

타이머에 관한 불변 조건을 현재 구현된 동작으로 설명하면 안 됩니다.

---

## Auto Close Relationship

해결된 티켓의 자동 종료는 작업 시간 타이머와 별도의 시스템 명령입니다.

- 가장 최근 해결 이력 시각부터 168시간 이상 지났고 여전히 `Resolved`인 티켓을 찾습니다.
- `Closed`로 이동합니다.
- 종료 사유 `Completed`를 설정합니다.
- 지원되는 경우 진행 중인 작업 시간 기록을 종료합니다.
- 출처 `SYSTEM_AUTO`, `actionNo = null`로 `RESOLUTION_CLOSE` 이력을 만듭니다.

검증된 REMOTE 스케줄러는 Supabase Cron으로 매시간 검사하며, 실제 종료는 조건을
충족한 시각보다 늦을 수 있습니다. 함수, Work Session 정리, 예약 호출의 검증 근거는
[스케줄링 결정](../../../06-decisions/2026-09-resolved-auto-close-scheduling.md)에 기록합니다.

---

## 관련 문서

- [Ticket Lifecycle](./ticket-lifecycle.md)
- [Ticket Operation Rules](reference/ticket-operation-rules.md)
- [Ticket History](./ticket-history.md)
- [Action Strategy](./strategy/action-strategy.md)

---

## 요약

Work Session은 현재 작업 시간 기록 모델입니다. 목록·생성, 소요 시간·시작과 종료 시각
입력, 서버의 시간 합산, 명시적인 작업 상태 전이를 지원합니다. 현재·과거 작업 담당자는
작업 내역을 기록할 수 있지만, 상태는 현재 작업 담당자만 변경할 수 있습니다.
Ticket Action과 별도로 관리하며, GET 조회나 타이머 정지가 티켓 상태를 자동으로
변경하는 것으로 설명하면 안 됩니다.
