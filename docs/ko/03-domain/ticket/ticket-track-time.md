# 티켓 Track Time

## 목표

Ticket Track Time은 현재 Work Session model을 정의한다.

Work tracking은 Ticket Action과 분리된다. Work-time evidence를 기록하고 선택적으로
ticket을 work status 사이에서 이동시킬 수 있다.

---

## 현재 Route Surface

```txt id="work-session-routes"
GET  /api/service-desk/tickets/:ticketId/work-session
POST /api/service-desk/tickets/:ticketId/work-session
```

현재 route surface는 다음을 포함하지 않는다.

- work-session detail route
- update route
- delete route
- timer start route
- timer finish route
- timer switch route

일부 feature-client helper는 여전히 이러한 future/detail route를 참조하지만, 현재 API
route file은 list/create만 노출한다.

---

## Work Session DTO

```ts id="work-session-dto"
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

Domain/UI mapping은 같은 concept을 camelCase로 노출한다.

---

## Submit Payload

```ts id="work-session-submit-payload"
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

`trackedMinutes`는 positive여야 한다. Range와 duration mode는 server-side에서
normalize된다.

---

## Actor Rule

Current work assignee만 work session을 만들 수 있다.

Approval-phase ticket은 eligible하지 않다. 해당 current assignee는 worker가 아니라
approver이기 때문이다.

---

## Start Work Command Boundary

Start Work는 Work Session row가 아니라 별도 ticket command다. 명시적 start-work
command는 `Assigned -> Working`으로 이동시키고 `STATUS_UPDATED` history를 기록한다.
Work-session submission은 work-time evidence를 기록하며 지원되는 work-status
transition도 적용할 수 있다.

---

## Status Effects

Work-session creation은 ticket status를 업데이트할 수 있다.

허용 transition:

```txt id="work-session-status-transitions"
Assigned -> Working
Working -> Pending
Working -> Resolved
Pending -> Working
Pending -> Resolved
```

규칙:

- `Assigned`는 `Working`으로의 transition이 필요하다.
- `Pending`은 `Working` 또는 `Resolved`로의 transition이 필요하다.
- `Working`은 추가 시간을 기록할 때 `Working`으로 남을 수 있다.
- GET은 status를 변경하지 않는다.
- timer stop은 ticket을 암묵적으로 resolve하지 않는다.

---

## Work Minutes Aggregate

Work session을 만들면 `trackedMinutes`가 ticket aggregate `workMinutes`에 추가된다.

Aggregate는 ticket list/detail display에 유용하다. 개별 work-session row가 evidence로
남는다.

---

## History

Work-session creation이 ticket status를 변경하면 `STATUS_UPDATED` history를 만든다.

History union은 work-session-specific event를 포함하지만, list/create work session의
현재 route behavior는 아니다.

System 또는 ticket command는 reject, merge, cancel, resolve, auto-close 시 running
session을 종료할 수 있다.

---

## Due Date Separation

Ticket due date는 planning/SLA field다. Work Session field가 아니다.

Work session은 실제 work evidence를 기록한다.

- 누가 작업했는가
- 언제 또는 얼마나 오래 작업했는가
- note
- 제공된 경우 resulting work status transition

---

## Active Session Invariant

현재 REMOTE create/list implementation은 submitted work session을 기록한다. Ticket별
running session을 종료하는 repository support는 포함하지만, full timer route surface를
노출하거나 문서화된 global "one active timer per user" route contract를 enforce하지
않는다.

Timer-style invariant를 current implemented behavior로 설명하면 안 된다.

---

## Auto Close Relationship

Resolved auto-close는 work-session timer operation이 아니다.

System command다.

- current 7-day grace window보다 오래된 resolved-history timestamp를 가진 resolved
  ticket을 찾는다.
- `Closed`로 이동한다.
- close reason `Completed`를 설정한다.
- 지원되는 경우 running work session을 종료한다.
- `SYSTEM_AUTO` source와 `actionNo = null`로 `RESOLUTION_CLOSE` history를 만든다.

---

## 관련 문서

- [Ticket Lifecycle](./ticket-lifecycle.md)
- [Ticket Operation Rules](../../08-dev-strategy/ticket-operation-rules.md)
- [Ticket History](./ticket-history.md)
- [Action Strategy](./strategy/action-strategy.md)

---

## 요약

Work Session은 현재 work-time evidence model이다. List/create, duration/range input,
tracked-minute aggregation, explicit work-status transition을 지원한다. Ticket Action과
분리되어 있으며 hidden GET-side-effect나 timer-stop resolution mechanism으로 설명하면
안 된다.
