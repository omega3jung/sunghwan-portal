# React Query 전략

## 목표

React Query는 Service Desk server state를 관리한다.

전략:

- fetched data를 global UI store에 복제하지 않는다.
- deterministic query key를 사용한다.
- mutation 후 필요한 query family만 invalidate한다.

---

## 핵심 원칙

```txt id="react-query-core"
Server state는 React Query가 소유한다.
UI state는 component state 또는 작은 UI store가 소유한다.
```

Service Desk settings, tickets, drafts, actions, histories, work sessions는
server state이다.

---

## Query 분류

### Reference/Settings-like Queries

자주 바뀌지 않지만 server state인 데이터:

- tenants
- categories
- approval steps
- assignment rules
- settings에서 사용하는 organization reference lists

Feature가 허용하면 더 긴 stale time을 사용할 수 있지만, settings mutation 후에는
관련 query를 invalidate해야 한다.

### Workflow Queries

사용자 action 이후 변경될 수 있는 데이터:

- ticket search/list
- ticket detail
- active draft
- ticket actions
- ticket histories
- work sessions

Workflow mutation 이후 invalidate해야 한다.

---

## 현재 Service Desk Query Family

```txt id="service-desk-query-families"
ticket list/search
ticket detail
ticket draft by dataScope/userId
ticket actions list/detail
ticket histories
ticket work sessions
settings tenants
settings categories
settings approval steps
settings assignment rules
```

정확한 key builder는 feature/domain code에 둔다. 문서는 family와 ownership을 설명한다.

---

## Mutation Invalidation

| Mutation | Invalidate |
| --- | --- |
| create ticket / submit draft | ticket list/search, ticket detail when known, active draft |
| save/discard draft | active draft |
| requester update | ticket detail, ticket list/search, histories |
| ticket action command | ticket detail, actions, histories, status 영향 시 list/search |
| work-session create | work sessions, ticket detail, histories, status 영향 시 list/search |
| settings mutation | affected settings family |

모든 Service Desk mutation에서 global invalidation을 기본값으로 사용하지 않는다.

---

## Draft Query Policy

REMOTE draft는 server state이다. LOCAL draft는 feature API boundary 뒤의
simplified demo-safe 구현을 사용한다. React Query cache나 browser recovery는 durable
ticket persistence boundary가 아니다.

Create dialog는 draft query family로 active draft를 로드한다. Final submit 또는
discard 후 active draft query를 invalidate/remove한다.

Attachment input은 durable draft state가 아니다. Raw `File`은 React Query에 저장하지 않는다.

---

## Action과 History Query Policy

Action은 workflow record이고 History는 append-oriented server state이다.

Operational action execution 후에는 action query와 history query를 함께 invalidate한다.
성공한 command가 아닌 UI intent만으로 history를 만들지 않는다.

---

## Work Session Query Policy

현재 work-session route:

```txt id="work-session-route"
GET  /api/service-desk/tickets/[ticketId]/work-session
POST /api/service-desk/tickets/[ticketId]/work-session
```

Work-session create 후 invalidate:

- work-session list
- ticket detail
- ticket history
- next status 변경 시 ticket list/search

Detail/update/delete/timer helper는 matching route가 구현되기 전까지 completed API로
문서화하지 않는다.

---

## Settings Query Policy

Settings data를 Zustand에 중복 저장하지 않는다.

React Query가 소유:

- tenant lists
- category trees
- approval-step settings
- assignment-rule settings

Local component state가 소유:

- selected tab
- focused tenant
- temporary form input
- expanded tree nodes
- language selector state

---

## LOCAL/REMOTE Runtime

Feature UI는 LOCAL/REMOTE storage detail을 깊게 분기하지 않는다.

```txt id="query-runtime"
feature hook
-> feature API client
-> route handler
-> LOCAL handler or REMOTE service
```

Draft key처럼 runtime/user scope가 필요한 query key는 해당 scope를 포함한다.

---

## 안티패턴

- API data를 Zustand에 복제
- raw `File`을 cache에 저장
- server 성공 전 fake history 생성
- 모든 mutation 후 overbroad invalidation

---

## 관련 문서

- [`../03-domain/service-desk-settings.md`](../03-domain/service-desk-settings.md)
- [`../03-domain/ticket/ticket-model.md`](../03-domain/ticket/ticket-model.md)
- [`../03-domain/ticket/ticket-history.md`](../03-domain/ticket/ticket-history.md)
- [`../03-domain/ticket/ticket-track-time.md`](../03-domain/ticket/ticket-track-time.md)
- [`../06-form-design/ticket-form.md`](../06-form-design/ticket-form.md)
- [`../08-dev-strategy/service-desk-implementation-strategy.md`](../08-dev-strategy/service-desk-implementation-strategy.md)

---

## 요약

React Query는 tickets, drafts, actions, histories, work sessions,
tenant-scoped settings의 server-state owner이다. Mutation은 필요한 query family만
정밀하게 invalidate하고, UI state와 server state를 분리한다.
