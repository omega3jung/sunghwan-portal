# Ticket Work Session

## 목표

Ticket Work Session은 현재 work-time evidence model을 정의합니다.

Work tracking은 Ticket Action과 분리됩니다. Work-time evidence를 기록하고 선택적으로
ticket을 work status 사이에서 이동시킬 수 있습니다.

---

## 현재 Route Surface

```txt
GET  /api/service-desk/tickets/:ticketId/work-session
POST /api/service-desk/tickets/:ticketId/work-session
```

현재 route surface는 다음을 포함하지 않습니다.

- work-session detail route
- update route
- delete route
- timer start route
- timer finish route
- timer switch route

일부 feature-client helper는 여전히 이러한 future/detail route를 참조하지만, 현재 API
route file은 list/create만 노출합니다.

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

Domain/UI mapping은 같은 concept을 camelCase로 노출합니다.

---

## Submit Payload

```ts
type TicketWorkSessionSubmitPayload = {
  ticketId: string;
  inputMode: "duration" | "range";
  durationMinutes?: number;
  startAt?: string;
  endAt?: string;
  trackedMinutes: number;
  nextStatus?: "Working" | "Pending" | "Resolved";
  note?: string;
};
```

`trackedMinutes`는 positive여야 합니다. Range와 duration mode는 server-side에서
normalize됩니다.

---

## Actor Rule

Current work assignee만 work session을 만들 수 있습니다.

Approval-phase ticket은 eligible하지 않습니다. 해당 current assignee는 worker가 아니라
approver이기 때문입니다.

---

## Start Work Command Boundary

Start Work는 Work Session row가 아니라 별도 ticket command입니다. 명시적 start-work
command는 `Assigned -> Working`으로 이동시키고 `STATUS_UPDATED` history를 기록합니다.
Work-session submission은 work-time evidence를 기록하며 지원되는 work-status
transition도 적용할 수 있습니다.

---

## Status Effects

Work-session creation은 ticket status를 업데이트할 수 있습니다.

허용 transition:

```txt
Assigned -> Working
Working -> Pending
Working -> Resolved
Pending -> Working
Pending -> Resolved
```

규칙:

- `Assigned`는 `Working`으로의 transition이 필요합니다.
- `Pending`은 `Working` 또는 `Resolved`로의 transition이 필요합니다.
- `Working`은 추가 시간을 기록할 때 `Working`으로 남을 수 있습니다.
- GET은 status를 변경하지 않습니다.
- timer stop은 ticket을 암묵적으로 resolve하지 않습니다.

---

## Work Minutes Aggregate

Work session을 만들면 `trackedMinutes`가 ticket aggregate `workMinutes`에 추가됩니다.

Aggregate는 ticket list/detail display에 유용합니다. 개별 work-session row가 evidence로
남습니다.

---

## History

Work-session creation이 ticket status를 변경하면 `STATUS_UPDATED` history를 만듭니다.

History union에는 work-session-specific event가 포함되어 있지만, 현재 list/create work session
route behavior에 사용되는 것은 아닙니다.

System 또는 ticket command는 reject, merge, cancel, resolve, auto-close 시 running
session을 종료할 수 있습니다.

---

## Due Date Separation

Ticket due date는 planning/SLA field입니다. Work Session field가 아닙니다.

Work session은 실제 work evidence를 기록합니다.

- 누가 작업했는가
- 언제 또는 얼마나 오래 작업했는가
- note
- 제공된 경우 resulting work status transition

---

## Active Session Invariant

현재 REMOTE create/list implementation은 submitted work session을 기록합니다. Ticket별
running session을 종료하는 repository support는 포함하지만, full timer route surface를
노출하거나 문서화된 global "one active timer per user" route contract를 enforce하지
않습니다.

Timer-style invariant를 current implemented behavior로 설명하면 안 됩니다.

---

## Auto Close Relationship

Resolved auto-close는 work-session timer operation이 아닙니다.

System command입니다.

- current 7-day grace window보다 오래된 resolved-history timestamp를 가진 resolved
  ticket을 찾습니다.
- `Closed`로 이동합니다.
- close reason `Completed`를 설정합니다.
- 지원되는 경우 running work session을 종료합니다.
- `SYSTEM_AUTO` source와 `actionNo = null`로 `RESOLUTION_CLOSE` history를 만듭니다.

---

## 관련 문서

- [Ticket Lifecycle](./ticket-lifecycle.md)
- [Ticket Operation Rules](reference/ticket-operation-rules.md)
- [Ticket History](./ticket-history.md)
- [Action Strategy](./strategy/action-strategy.md)

---

## 요약

Work Session은 현재 work-time evidence model입니다. List/create, duration/range input,
tracked-minute aggregation, explicit work-status transition을 지원합니다. Ticket Action과
분리되어 있으며 hidden GET-side-effect나 timer-stop resolution mechanism으로 설명하면
안 됩니다.
