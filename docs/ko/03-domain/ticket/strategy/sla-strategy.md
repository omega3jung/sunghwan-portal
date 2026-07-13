# SLA Strategy

## 목표

SLA strategy는 future automation을 과장하지 않고 현재 Service Desk ticket의
time-expectation model을 설명한다.

현재 구현에서 SLA는 주로 다음으로 표현된다.

- category default SLA days
- form due date default와 validation
- ticket `dueAt`
- planning context로 사용하는 priority/risk value
- ticket action을 통한 manual/operator adjustment

Full SLA breach, pause, escalation, calendar, notification engine은 future scope다.

---

## 핵심 원칙

```txt id="sla-core"
Current SLA = configured expectation + ticket due date.
Full SLA automation is deferred.
```

구현이 해당 service를 추가하기 전까지 breach detection, escalation, working calendar
calculation을 completed behavior처럼 설명하면 안 된다.

---

## 현재 Input

현재 Service Desk model은 다음 SLA-related input을 가진다.

| Input | Source | Current Use |
| --- | --- | --- |
| `defaultSlaDays` | main/subcategory settings | due date expectation seed 또는 guide |
| `priority` | category default, form, or adjust action | planning and display context |
| `riskLevel` | category default, form, or adjust action | planning and display context |
| `dueAt` | form/update/action payload | persisted ticket deadline |

Category default는 tenant-scoped다. Subcategory default가 있으면 main category
default를 override한다.

---

## Category Default Resolution

```txt id="sla-category-resolution"
selected subcategory defaultSlaDays
-> fallback main category defaultSlaDays
-> due date expectation
```

Requester가 category를 선택할 때 UI는 category default를 적용할 수 있다.

Server는 여전히 submitted ticket payload를 validate하고 final workflow transition을
소유한다.

---

## Due Date Behavior

Ticket form은 `dueAt`이 오늘보다 이후인지 validate한다.

Requester update는 ticket이 다음 상태일 때 due date를 변경할 수 있다.

```txt id="sla-update-statuses"
Approval
Assigned
```

현재 requester update policy에서 due date는 routing-neutral이다.

- due date와 email recipients만 바뀌면 routing을 preserve한다.
- category, subject, content, files, images가 바뀌면 routing을 reset한다.

Due date가 routing-sensitive field와 함께 변경되면 routing result는 routing-sensitive
update를 따른다.

Routing-sensitive field가 category일 때 requester update는 새 category default SLA
days에서 minimum due date도 다시 평가한다.

```txt id="category-update-min-due-date"
newCategoryMinimumDueAt = today + new category default SLA days
nextDueAt = later(currentDueAt, newCategoryMinimumDueAt)
```

이 규칙은 더 늦은 current due date를 유지하고, 더 이른 due date는 새 minimum으로
되돌리며, category change 때문에 due date를 더 이른 날짜로 당기지 않는다.

---

## Adjust Action

Planning value는 현재 action rule이 허용하는 곳에서 Ticket Action command model을 통해
변경될 수 있다.

`ADJUST`는 action rule implementation에 따라 priority, risk level, due date 같은
planning-oriented field를 업데이트할 수 있다.

이 변경은 조용한 field mutation이 아니라 event-based history로 기록되어야 한다.

---

## Work Session과의 관계

Work session은 operational work evidence를 기록한다. 현재 full SLA clock을 구현하지
않는다.

Work session은 future SLA reporting이 다음 질문에 답하는 데 도움을 줄 수 있다.

- work는 언제 시작되었는가?
- 얼마나 많은 work가 기록되었는가?
- 기록된 work 이후 ticket이 resolved 되었는가?

현재 SLA 문서는 이를 completed SLA timer engine이 아니라 future reporting evidence로
취급해야 한다.

---

## Auto Close와의 관계

현재 구현은 resolved ticket에 대해 grace period 이후 automatic close behavior를
포함한다.

이는 SLA breach handling과 같지 않다.

```txt id="auto-close-boundary"
Resolved ticket grace period close
!= SLA breach/escalation engine
```

Auto close는 resolved-history timestamp와 현재 7-day grace period를 사용한다. Ticket을
`Closed`로 이동하고 close reason `Completed`를 설정하며, 지원되는 경우 running work
session을 종료하고 `RESOLUTION_CLOSE`를 `SYSTEM_AUTO`, `actionNo = null`로 기록한다.

---

## Deferred SLA Engine

Future production SLA engine은 다음을 추가할 수 있다.

- response-time targets
- resolution-time targets
- business-hour calendars
- holiday calendars
- `Pending`의 pause/resume rules
- breach detection
- escalation thresholds
- notification delivery
- SLA compliance reporting
- per-tenant SLA policies

이 항목들은 현재 due date behavior에 암시하지 말고 explicit service, data field,
history event를 통해 도입해야 한다.

---

## 피하는 Anti-Patterns

### Matrix Engine이 존재한다고 주장하기

Priority/risk matrix는 유용한 future design tool이지만, 현재 구현을 complete matrix
engine을 실행하는 것으로 설명하면 안 된다.

### Pending을 구현된 SLA Pause로 취급하기

`Pending`은 workflow status다. 현재 fully implemented SLA pause clock이 아니다.

### Due Date Change 숨기기

Due date change는 operational planning change이며 traceable해야 한다.

### Auto Close와 SLA Breach 섞기

Resolved-ticket auto close는 lifecycle cleanup rule이지 service-level breach rule이
아니다.

---

## 관련 문서

- [`category-strategy.md`](category-strategy.md)
- [`action-strategy.md`](action-strategy.md)
- [`../ticket-track-time.md`](../ticket-track-time.md)
- [`../ticket-history.md`](../ticket-history.md)
- [`../../../06-form-design/ticket-form.md`](../../../06-form-design/ticket-form.md)

---

## 요약

현재 SLA model은 의도적으로 작고 구현과 정렬되어 있다. Category settings는 default
SLA days를 제공하고, form과 action은 due date 및 planning field를 관리하며, history는
의미 있는 변경을 기록한다.

Full SLA clocking, breach, escalation, calendars, notifications는 future production
scope로 남는다.
