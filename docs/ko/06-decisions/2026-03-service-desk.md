# Service Desk Decision Log (2026-03)

## Context

이 문서는 2026년 3월 동안 Service Desk 모듈을 개발하면서 내린 핵심 아키텍처 및 구현 결정을 기록한다.

`docs/` 아래의 최종 설계 문서와 달리, 이 로그는 다음에 초점을 둔다.

- 구현 과정에서 실제로 마주한 실용적인 트레이드오프
- 실제 코드와 설계 원칙 사이의 정렬
- 시스템의 명확성, 확장성, 현실성을 높이기 위해 내린 결정

---

## 1. Query Strategy: Static vs Dynamic Data Separation

### Context

Service Desk 데이터는 자연스럽게 두 가지 범주로 나뉜다.

- **정적 데이터**
  - Category
  - Department
  - Job field
- **동적 데이터**
  - Ticket list
  - Ticket detail

---

### Problem

모든 데이터에 하나의 query 전략만 적용하면 다음 문제가 발생한다.

- 정적 데이터에 불필요한 refetch 발생
- 동적인 ticket 데이터에서 UI가 stale 상태가 됨

---

### Decision

query 전략을 분리한다.

```txt
Static Data  -> STATIC_QUERY_OPTIONS
Dynamic Data -> DYNAMIC_QUERY_OPTIONS
```

### Implementation

```ts
// Static
staleTime: Infinity;

// Dynamic
staleTime: 0;
refetchOnWindowFocus: true;
```

### Notes

- `keepPreviousData`는 선택 사항이며 주로 pagination UX에서 유용하다
- ticket에서는 UI 연속성보다 최신성이 더 중요하다

### Impact

- 정적 데이터는 효율적으로 캐시된다
- ticket 데이터는 stale 시간이 최소화된 상태로 최신성을 유지한다

---

## 2. Form Mode Design: `create` / `update` / `view`

### Context

ticket form은 create와 update 작업에서 동일한 입력 필드를 사용한다.

---

### Problem

다음과 같이 정의하면:

```ts
type?: "create" | "edit";
```

다음과 같은 모호성이 생긴다.

- 실제 lifecycle이 명확하지 않은데도 `edit`가 사용될 수 있다
- 이름이 실제 동작 차이를 반영하지 못한다

---

### Decision

명시적인 mode를 정의한다.

```ts
type FormMode = "create" | "update" | "view";
```

### Rationale

- `create`와 `update`는 API semantics (`POST` vs `PUT`)가 다르다
- `view`는 읽기 전용 UI 상태를 표현한다

### Insight

```txt
필드가 같더라도 mode는 구조가 아니라 동작을 반영해야 한다.
```

### Impact

- submit 로직이 더 명확해진다
- 읽기 전용 mode의 권한 처리가 쉬워진다
- 백엔드 semantics와 더 잘 맞는다

---

## 3. Component Boundary: Data Fetching Responsibility

### Context

이전 Page Router 시스템은 다음을 page module 내부에 함께 배치했다.

- UI
- data fetching
- business logic

새 구조는 feature-based architecture를 따른다.

---

### Problem

책임 경계가 불명확했다.

- component는 props로만 데이터를 받아야 하는가?
- 아니면 내부에서 직접 fetch해야 하는가?

---

### Decision

명확한 경계를 정의한다.

```txt
Feature-level components -> data fetching 담당
Child components         -> props를 받는 presentational component
Page layer               -> orchestration만 담당
```

### Example

```tsx
<TicketList>
  <TicketItem />
</TicketList>
```

- `TicketList`가 데이터를 fetch한다
- `TicketItem`은 presentational component로 유지한다

### Rationale

- data logic을 domain feature 가까이에 둘 수 있다
- child component의 재사용성이 좋아진다
- 불필요한 prop drilling을 막을 수 있다

### Impact

- 관심사 분리가 더 명확해진다
- component 구조가 확장 가능해진다
- data access pattern이 일관된다

---

## 4. Routing Strategy: Ticket Detail as a Page

### Context

ticket detail에는 두 가지 주요 접근이 있었다.

- drawer 또는 modal 기반 UI
- 전체 page route

---

### Problem

drawer 기반 접근은 다음 문제를 만든다.

- 중첩된 UI 복잡성
- 더 어려운 state 관리
- deep linking 부재

---

### Decision

```txt
/service-desk/[ticketId] -> page 기반 detail view
Drawer                   -> secondary interaction 전용
```

### Rationale

- ticket detail은 primary workflow다
- 다음을 위해 안정적인 URL이 필요하다
  - direct access
  - bookmarking
  - debugging

### Impact

- UI 구조가 단순해진다
- navigation 일관성이 좋아진다
- 복잡한 상호작용으로 확장하기 쉬워진다

---

## 5. i18n Strategy: Explicit Key Usage

### Context

다음과 같은 helper abstraction을 고려했다.

```ts
fieldLabel(name);
```

---

### Problem

- 불필요한 abstraction이 추가된다
- reviewer 입장에서 가독성이 떨어진다
- 실제 translation key가 가려진다

---

### Decision

명시적인 key를 직접 사용한다.

```ts
t(`field.${name}.label`, { ns: "common" });
```

### Rationale

- portfolio 맥락에서 더 읽기 쉽다
- reviewer가 이해하기 쉽다
- premature abstraction을 피할 수 있다

### Insight

```txt
포트폴리오에서는 추상화보다 명확성이 더 중요하다.
```

### Impact

- 가독성이 좋아진다
- 리뷰와 인터뷰 맥락에 더 잘 맞는다

---

## 6. Ticket Data Freshness as a Priority

### Context

ticket 데이터는 다음의 영향을 받는다.

- SLA
- assignment
- status changes
- approval state

---

### Decision

ticket query는 항상 dynamic data로 취급한다.

```ts
useQuery({
  ...DYNAMIC_QUERY_OPTIONS,
});
```

### Rationale

- stale한 ticket 데이터는 잘못된 UI 상태로 이어진다
- Service Desk 시스템은 준실시간 수준의 정확성이 필요하다

### Impact

- UI 상태의 일관성과 신뢰성이 높아진다
- SLA 중심 워크플로우와 더 잘 맞는다

---

## 7. UI Responsibility: Page vs Drawer

### Context

시스템에는 언제 page를 쓰고 언제 drawer를 써야 하는지에 대한 명확한 규칙이 필요했다.

---

### Decision

```txt
Page   -> primary workflow
Drawer -> secondary interaction
```

### Examples

#### Page

- Ticket detail
- Main workflows

#### Drawer

- Comments
- History
- Quick actions

### Insight

```txt
drawer는 workflow container가 아니라 interaction surface다.
```

### Impact

- UI 계층이 명확해진다
- 복잡성이 줄어든다
- 더 예측 가능한 사용자 경험을 제공한다

---

## Summary

3월의 결정들은 하나의 원칙으로 수렴한다.

```txt
구현을 실제 시스템의 동작 방식에 맞춘다.
```

### Key Themes

- 정적 데이터와 동적 데이터를 명확히 분리한다
- 책임 기준으로 component boundary를 정의한다
- routing을 domain design의 일부로 다룬다
- portfolio 맥락에서는 abstraction보다 clarity를 우선한다
- ticket 데이터는 항상 최신성과 신뢰성을 유지한다
- 주요 워크플로우와 보조 상호작용을 구분한다

---

## Final Note

이 결정들은 이론적인 논의에서 나온 것이 아니다.
다음과 같은 실제 작업 과정에서 도출되었다.

- 실제 시스템 마이그레이션
- legacy pattern 재구성
- 문서화된 architecture와 구현 정렬

따라서 이 결정들은 이상화된 설계가 아니라,
실제 운영 환경에 맞춘 실용적인 트레이드오프를 반영한다.
