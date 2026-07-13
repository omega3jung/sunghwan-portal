# Service Desk 진화

## 목표

이 문서는 이전 Service Hub / IT Help Desk 경험이 `sunghwan-portal`의 현재
Service Desk 도메인으로 어떻게 정제되었는지 설명한다.

이 문서는 설계 진화를 다룬다. 구현 경계는
[`service-desk-implementation-strategy.md`](service-desk-implementation-strategy.md)에서
다루고, 당시의 의사결정 맥락은 decision log에 보존한다.

---

## 역사적 맥락

이전 실무 시스템은 다음을 처리하는 IT Help Desk 스타일 모듈을 포함했다.

- 사용자 요청 접수
- 담당자 할당
- 상태 추적
- 요청자와의 커뮤니케이션
- 운영 진행 상황 확인

현재 프로젝트는 그 시스템을 복제하지 않는다. 실제 운영 교훈을 추출하고, 더 명확한
Service Desk 도메인으로 재설계한다.

```txt id="evolution-flow"
previous workplace experience
-> operational lessons
-> clearer domain boundaries
-> production-aligned portfolio design
```

---

## 정체성 전환

이름을 Service Hub에서 Service Desk로 바꾼 이유는 현재 모듈이 넓은 포털 기능이
아니라 집중된 workflow domain이기 때문이다.

현재 Service Desk가 의미하는 것:

- request intake
- ticket lifecycle
- approval routing
- work assignment
- action commands
- communication
- event-based history
- work sessions
- settings-driven behavior

---

## Request Record에서 Workflow Entity로

이전 모델은 상태 업데이트가 있는 request record에 가까웠다.

현재 모델은 ticket을 controlled state를 가진 workflow entity로 다룬다.

```txt id="current-ticket-statuses"
Draft
Approval
Declined
Assigned
Working
Pending
Rejected
Resolved
Closed
```

일반 happy path:

```txt id="happy-paths"
Draft -> Approval -> Assigned -> Working -> Resolved -> Closed
Draft -> Assigned -> Working -> Resolved -> Closed
```

주요 non-happy path:

```txt id="non-happy-paths"
Approval -> Declined
Assigned / Working / Pending -> Rejected
Working -> Pending -> Working
Resolved -> Working
Assigned / Working / Pending / Resolved -> Closed
```

`Open`, `Approved`, `Reopen`은 오래된 역사적 문서나 row normalization 맥락에
나올 수 있지만 현재 ticket status가 아니다.

---

## Text Update에서 Command로

이전 방식은 comment와 status edit에 많이 의존했다.

현재 설계는 명시적인 Ticket Action command를 사용한다.

```txt id="ticket-actions"
APPROVE
DECLINE
COMMENT
NOTE
ASSIGN
ASSIGN_SELF
REJECT
MERGE
ADJUST
REOPEN
RESUBMIT
CANCEL
```

흐름:

```txt id="action-effect-history"
Action intent
-> server rule execution
-> status/routing/data effect
-> event-based history
```

Comment는 communication이다. Assignment, rejection, merge, reopen, planning
adjustment는 rule을 가진 command이다.

---

## Comment와 Note 분리

Communication은 두 개념으로 분리되었다.

| Type | 목적 |
| --- | --- |
| `COMMENT` | requester-visible 또는 shared communication |
| `NOTE` | internal operational note |

이 분리는 내부 팀 맥락과 요청자 대상 커뮤니케이션을 섞지 않게 한다.

---

## Activity와 History 분리

```txt id="activity-history"
Activity/Action = 누군가 무엇을 왜 하려 했는가
History = 실제로 무엇이 바뀌었는가에 대한 immutable event record
```

History는 event-based이며 다음을 기록한다.

- type
- source
- event
- previous/current values
- actor
- timestamp

이는 timeline을 단순 comment list나 free-form `metadata.event`에 의존하지 않게 한다.

---

## Tenant-Scoped Settings

Settings는 admin CRUD에서 behavior-defining configuration으로 진화했다.

현재 settings scope:

```txt id="settings-scope"
Tenant
-> Category
-> Approval Step
-> Assignment Rule
```

중요 변화:

- `Tenant`는 Service Desk configuration boundary이다.
- Category scope는 `"PORTAL"` 또는 `"INTERNAL"`이다.
- Approval step은 ordered, category-based이다.
- Assignment rule은 job field와 employee username 기반 group model이다.
- Settings 변경은 미래 behavior에 영향을 주며 과거 history를 rewrite하지 않는다.

---

## Category-Driven Behavior

Category는 주요 behavior driver이다.

```txt id="category-behavior"
Tenant-scoped category
-> defaults
-> approval resolution
-> work assignment resolution
-> requester update routing policy
```

Category는 default priority, risk level, SLA days를 제공할 수 있고 approval/assignment
settings의 anchor 역할을 한다.

Requester category change는 routing-sensitive이며 routing reset을 유발할 수 있다.

---

## Approval과 Work Routing

Routing은 phase-aware가 되었다.

```ts id="assignment-phase"
type TicketAssignmentPhase = "APPROVAL" | "WORK";
```

Ticket DTO는 다음 projection을 노출할 수 있다.

- approval assignees
- work assignees
- assigned approver
- assigned worker

모든 assignee를 같은 ownership으로 취급하지 않는 것이 핵심 개선이다.

---

## Requester Update Policy

요청자는 active work 전 단계에서 제한적으로 수정할 수 있다.

허용 status:

```txt id="requester-update-statuses"
Approval
Assigned
```

Routing-sensitive fields:

- category
- subject
- content
- files
- images

Routing-neutral fields:

- due date
- email recipients

서버는 `ROUTING_RESET` 또는 `ROUTING_PRESERVED`를 기록한다.

---

## Draft와 Attachment Boundary

Create workflow는 one-shot form에서 draft-aware workflow로 발전했다.

REMOTE draft는 requester당 하나의 active draft를 가진 `Draft` ticket row로 구현된다.

Attachment는 prepare boundary로 발전했다.

```txt id="attachment-boundary"
browser file input
-> prepare API
-> prepared metadata
-> ticket command
```

현재 demo는 metadata와 controlled demo URL을 persist할 수 있지만 production object
storage를 제공한다고 주장하지 않는다.

---

## Work Session

Work tracking은 단일 누적 시간에서 work session으로 발전했다.

현재 work session이 기록하는 것:

- ticket ID
- worker
- start/end 또는 duration input
- tracked minutes
- note
- optional next status

현재 route surface는 list/create 중심이다. Timer/update/delete API는 matching route
handler가 생길 때까지 extension point이다.

---

## SLA 진화

현재 SLA는 신중하게 범위를 제한한다.

현재 구현:

- category `defaultSlaDays`
- due date expectation
- priority/risk planning context
- 허용되는 action command를 통한 adjustment

Full SLA breach detection, pause/resume clock, business calendar, notification,
escalation은 future production scope이다.

---

## 핵심 교훈

### 운영 의도 보존

새 설계는 이전 시스템의 실제 운영 문제를 유지하면서 도메인을 더 명확하게 만든다.

### Workflow를 Text에 숨기지 않기

Assignment, rejection, merge, planning change는 comment가 아니라 command로 표현한다.

### Settings는 Behavior를 정의

Tenant, category, approval, assignment settings는 future ticket execution을 형성한다.

### History는 Change를 설명

History는 무엇이, 왜, 누가, 언제 바꿨는지 설명해야 한다.

### Current Docs와 Decision Logs의 역할 분리

Current design docs는 최신 구현 정렬 모델을 설명한다. Decision logs는 특정 시점의
맥락과 이유를 보존한다.

---

## 결과

현재 Service Desk module이 보여주는 것:

- controlled ticket lifecycle
- REMOTE draft workflow
- attachment preparation boundary
- tenant-scoped settings
- approval/work routing separation
- command-based actions
- event-based history
- requester update routing policy
- work-session evidence
- realistic deferred production scope

요약:

```txt
request tracking screen
-> workflow-oriented Service Desk domain
-> implementation-aligned, traceable portfolio system
```

---

## 관련 문서

- [`service-desk-implementation-strategy.md`](service-desk-implementation-strategy.md)
- [`ticket-operation-rules.md`](ticket-operation-rules.md)
- [`../03-domain/service-desk-settings.md`](../03-domain/service-desk-settings.md)
- [`../03-domain/ticket/ticket-system-overview.md`](../03-domain/ticket/ticket-system-overview.md)
- [`../03-domain/ticket/ticket-lifecycle.md`](../03-domain/ticket/ticket-lifecycle.md)
- [`../03-domain/ticket/ticket-activity.md`](../03-domain/ticket/ticket-activity.md)
- [`../03-domain/ticket/ticket-history.md`](../03-domain/ticket/ticket-history.md)
- [`../03-domain/ticket/ticket-track-time.md`](../03-domain/ticket/ticket-track-time.md)

---

## 요약

Service Desk는 기본 request tracking에서 workflow-centered domain으로 진화했다.
현재 모델은 lifecycle, routing, command, history, settings, draft, attachment,
work evidence를 명시하고, future production infrastructure와 현재 구현을 분리한다.
