# React Query 전략

## 목표

React Query는 Service Desk server state를 관리합니다.

전략:

- fetched data를 global UI store에 복제하지 않습니다.
- deterministic query key를 사용합니다.
- mutation 후 필요한 query family만 invalidate합니다.

---

## 핵심 원칙

```txt
Server state는 React Query가 소유한다.
UI state는 component state 또는 작은 UI store가 소유한다.
```

Service Desk settings, tickets, REMOTE drafts, actions, histories, work sessions는
server state입니다. LOCAL 초안 복구는 예외이며, 동일한 query hook으로 노출되는
브라우저 로컬 저장소 상태입니다.

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
관련 query를 invalidate해야 합니다.

### Workflow Queries

사용자 action 이후 변경될 수 있는 데이터:

- ticket search/list
- ticket detail
- active draft
- ticket actions
- ticket histories
- work sessions

Workflow mutation 이후 invalidate해야 합니다.

---

## 현재 Service Desk Query Family

```txt
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

정확한 key builder는 feature/domain code에 둡니다. 문서는 family와 ownership을 설명합니다.

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

모든 Service Desk mutation에서 global invalidation을 기본값으로 사용하지 않습니다.

---

## Draft Query Policy

REMOTE 초안은 PostgreSQL 티켓 행을 기반으로 하며 초안 Route Handler를 통해
접근하는 server state입니다. 반면 LOCAL 초안 복구는 현재 데모 사용자 범위의 브라우저
`localStorage`에 저장되고, 해당 Route Handler를 호출하지 않고 기능 초안 저장소가
읽고 씁니다.

React Query는 두 data scope 모두에서 query와 mutation을 조정합니다. React Query
캐시는 REMOTE 영속 저장소도, LOCAL 복구 저장소도 아닙니다.

Create dialog는 draft query family로 active draft를 로드합니다. Final submit 또는
discard 후 active draft query를 invalidate/remove합니다.

Attachment input은 durable draft state가 아닙니다. Raw `File`은 React Query에 저장하지 않습니다.

---

## Ticket Action Query Policy

Action은 workflow record입니다.

Action query는 ticket의 action list, route가 노출하는 action detail, comment/note의
soft-delete state에 사용합니다.

Operational action execution 후에는 성공한 command가 history event를 만들기 때문에
action query와 history query를 함께 invalidate합니다.

---

## History Query Policy

History는 append-oriented server state입니다.

Command 성공 후에는 해당 ticket history를 invalidate합니다. Event contract를 완전히
통제할 수 없다면 UI에서 history event를 optimistic하게 만들지 않습니다.

Server는 `type`, `source`, `event`, previous/current value, actor/timestamp의
authority입니다.

---

## Work Session Query Policy

현재 work-session route:

```txt
GET  /api/service-desk/tickets/[ticketId]/work-session
POST /api/service-desk/tickets/[ticketId]/work-session
```

Work-session create 후 invalidate:

- work-session list
- ticket detail
- ticket history
- next status 변경 시 ticket list/search

Detail/update/delete/timer helper는 matching route가 구현되기 전까지 completed API로
문서화하지 않습니다.

---

## Settings Query Policy

Settings data를 Zustand에 중복 저장하지 않습니다.

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

Feature UI는 LOCAL/REMOTE storage detail을 깊게 분기하지 않습니다.

```txt
feature hook
-> feature API client
-> route handler
-> LOCAL handler or REMOTE service
```

Draft key처럼 runtime/user scope가 필요한 query key는 해당 scope를 포함합니다.

---

## 안티패턴

### API Data in Zustand

Ticket detail, settings, draft 또는 history를 parallel source of truth로 Zustand에
복제하지 않습니다.

### Raw Files in Cache

Browser `File` object를 React Query에 저장하지 않습니다.

### Fake History

Server에서 성공하지 않은 command에 대해 UI-only history row를 만들지 않습니다.

### Overbroad Invalidations

모든 Service Desk mutation 후 모든 query를 invalidate하지 않습니다.

---

## 관련 문서

- [서비스 데스크 설정](../03-domain/service-desk/settings.md)
- [티켓 모델](../03-domain/service-desk/ticket/ticket-model.md)
- [티켓 이력](../03-domain/service-desk/ticket/ticket-history.md)
- [티켓 작업 세션](../03-domain/service-desk/ticket/ticket-work-session.md)
- [티켓 폼 설계](../04-client-engineering/forms/ticket-form.md)
- [서비스 데스크 구현 전략](./service-desk-implementation-strategy.md)

---

## 요약

React Query는 Service Desk server state를 소유하면서 브라우저 로컬 LOCAL 초안
저장소에 대한 접근도 조정합니다. 현재 전략은 tickets, drafts, actions, histories,
work sessions, tenant-scoped settings의 구조화된 query family와 workflow mutation
이후의 정밀한 invalidation을 사용하며, UI state·server state·복구 저장소를
명확히 분리합니다.
