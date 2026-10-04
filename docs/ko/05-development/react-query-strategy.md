# React Query 전략

## 목표

React Query는 Service Desk의 서버 상태를 관리합니다.

전략:

- 조회한 데이터를 전역 UI 저장소에 복제하지 않습니다.
- 같은 조회 조건에는 같은 쿼리 키를 사용합니다.
- 데이터 변경 후 영향을 받은 쿼리 그룹의 캐시만 무효화합니다.

---

## 핵심 원칙

```txt
Server state는 React Query가 소유한다.
UI state는 component state 또는 작은 UI store가 소유한다.
```

Service Desk 설정, 티켓, REMOTE 초안, 액션, 이력, 작업 세션은 서버 상태입니다.
LOCAL 초안 복구는 예외이며, 같은 쿼리 훅으로 제공하는
브라우저 로컬 저장소 상태입니다.

---

## Query 분류

### Reference/Settings-like Queries

자주 바뀌지 않지만 서버에서 관리하는 데이터:

- tenants
- categories
- approval steps
- assignment rules
- settings에서 사용하는 organization reference lists

기능에서 허용하면 데이터를 최신으로 취급하는 시간(`staleTime`)을 늘릴 수 있습니다.
다만 설정 변경 후에는 관련 쿼리의 캐시를 무효화해야 합니다.

### Workflow Queries

사용자 작업 후 변경될 수 있는 데이터:

- ticket search/list
- ticket detail
- active draft
- ticket actions
- ticket histories
- work sessions

업무 데이터를 변경한 후에는 관련 캐시를 무효화해야 합니다.

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

정확한 쿼리 키 생성기는 기능·도메인 코드에 둡니다. 이 문서는 쿼리 그룹과 관리
책임을 설명합니다.

### Effective User Cache Isolation

권한에 따라 조회 결과가 달라지면 쿼리 키에도 해당 실행 환경에서 권한 판단에 쓰는
현재 사용자 정보를 포함해야 합니다. 현재 티켓 상세, 액션 목록·상세, 이력 응답에는
권한에 따라 걸러진 데이터, NOTE 조회 가능 여부, 실행 가능한 작업 정보가 포함될 수
있습니다. 따라서 LOCAL/REMOTE 실행 환경과 현재 사용자별로 캐시를 구분합니다.

Impersonation을 포함해 현재 사용자가 바뀌면 이전 사용자의 보호된 업무 응답을
새 사용자의 캐시나 임시 표시 데이터로 재사용하지 않습니다. 전환 전에 시작한
요청이 늦게 완료되어도 다른 사용자의 캐시에 응답을 저장하지 않습니다. 데이터 변경
응답을 캐시에 직접 기록할 때도 같은 원칙을 적용합니다. Ticket Action 변경은
시작 시점의 사용자 범위를 보존하고 그 범위의 캐시에 기록합니다.

이 규칙은 실행 환경에서 필요한 범위를 쿼리 키에 포함한다는 원칙을 구체화합니다.
모든 쿼리 키에 사용자명을 넣어야 한다는 뜻은 아닙니다. 사용자에 따라 결과가
달라지지 않는 참조·설정 데이터는 impersonation을 지원한다는 이유만으로 사용자별
키를 만들 필요가 없습니다. 데이터 변경 후에는 영향을 받은 쿼리 그룹만 무효화합니다.
사용자별 캐시 분리가 전체 캐시 무효화를 요구하지는 않습니다.

캐시 분리는 클라이언트에서 사용자별 정보를 구분하고 화면을 일관되게 표시하는
보조 수단입니다. 접근 권한은 서버가 신뢰할 수 있는 현재 사용자 정보로 검증합니다.
사용자별 캐시와 서버 권한 검증은 서로 보완합니다.

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

Service Desk 데이터를 변경할 때 전체 캐시 무효화를 기본으로 사용하지 않습니다.

---

## Draft Query Policy

REMOTE 초안은 PostgreSQL 티켓 행을 기반으로 하며 초안 Route Handler를 통해
접근하는 서버 상태입니다. LOCAL 초안 복구는 현재 데모 사용자 범위의 브라우저
`localStorage`에 저장되고, 해당 Route Handler를 호출하지 않고 기능 초안 저장소가
읽고 씁니다.

React Query는 두 데이터 범위 모두에서 조회와 변경을 조정합니다. REMOTE 초안은
데이터베이스에, LOCAL 복구 초안은 `localStorage`에 저장하며 React Query 캐시는
어느 쪽의 저장소도 대신하지 않습니다.

생성 대화상자는 초안 쿼리 그룹을 통해 활성 초안을 불러옵니다. 최종 제출 또는
폐기 후에는 활성 초안 쿼리의 캐시를 무효화하거나 제거합니다.

첨부파일 입력은 지속적으로 보관하는 초안 상태가 아닙니다. 원본 `File` 객체는
React Query에 저장하지 않습니다.

---

## Ticket Action Query Policy

액션은 티켓 처리 중 실행한 작업을 기록합니다.

액션 쿼리는 티켓의 액션 목록, API가 제공하는 액션 상세, 댓글·노트의 소프트 삭제
상태를 조회합니다.

운영 액션을 성공적으로 실행하면 이력 이벤트가 생성되므로 액션 쿼리와 이력 쿼리의
캐시를 함께 무효화합니다.

---

## History Query Policy

이력은 주로 새 기록을 추가하는 서버 상태입니다.

명령 실행 후에는 해당 티켓 이력의 캐시를 무효화합니다. 이벤트 생성 규칙을 완전히
통제할 수 없다면 서버 응답 전에 UI에서 이력 이벤트를 미리 만들지 않습니다.

`type`, `source`, `event`, 변경 전·후 값, 실행자·시각은 서버가 결정합니다.

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

상세 조회·수정·삭제·타이머 헬퍼는 대응하는 API 경로를 구현하기 전까지 완료된
API 기능으로 문서화하지 않습니다.

---

## Settings Query Policy

설정 데이터를 Zustand에 중복 저장하지 않습니다.

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

기능 UI는 LOCAL/REMOTE 저장 방식에 따라 내부 로직을 여러 갈래로 나누지 않습니다.

```txt
feature hook
-> feature API client
-> route handler
-> LOCAL handler or REMOTE service
```

초안 키처럼 실행 환경과 사용자 범위가 필요한 쿼리 키는 해당 범위를 포함합니다.

---

## 안티패턴

### API Data in Zustand

티켓 상세, 설정, 초안, 이력을 Zustand에 복제해 두 저장소가 각각 판단 기준이 되게
하지 않습니다.

### Raw Files in Cache

브라우저의 `File` 객체를 React Query에 저장하지 않습니다.

### Fake History

서버에서 성공하지 않은 명령에 대해 UI에서만 존재하는 이력 행을 만들지 않습니다.

### Overbroad Invalidations

Service Desk 데이터를 변경할 때마다 모든 쿼리를 무효화하지 않습니다.

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

React Query는 Service Desk 서버 상태를 관리하고, 브라우저의 LOCAL 초안 저장소에
대한 접근도 조정합니다. 티켓·초안·액션·이력·작업 세션·테넌트별 설정을 쿼리 그룹으로
구분하고, 데이터 변경 후에는 영향을 받은 그룹만 무효화합니다. UI 상태, 서버 상태,
초안 복구 저장소는 각각 구분합니다.
