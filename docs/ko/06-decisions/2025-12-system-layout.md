# 2025-12 Dialog vs Page vs Drawer Decision

## Context

Service Desk 시스템에서 **티켓 상세, 생성, 수정 UI를 어떤 형태로 제공할 것인지**에 대한 고민이 있었다.

특히 다음과 같은 선택지가 존재했다:

1. 모든 것을 Dialog/Drawer 기반으로 처리
2. Detail을 Modal(Route Modal / Drawer)로 구성
3. Detail을 Page로 구성하고, 일부 interaction만 Dialog/Drawer로 처리

초기에는 기존 시스템(Oracle JET + Next.js v12 기반)에서 사용하던 방식처럼
**overlay 중심 UI (drawer/dialog)**를 적극적으로 활용하는 방향도 고려되었다.

---

## Problem

다음과 같은 문제가 명확하게 드러났다:

### 1. Nested Overlay Complexity

- Drawer 위에 Drawer
- Dialog 안에서 또 Dialog

이런 구조는 다음 문제를 발생시킴:

- 상태 관리 복잡도 증가
- focus 관리 어려움
- UX 혼란 (현재 위치 인지 어려움)
- ESC / close 동작 예측 어려움

👉 특히 **ticket detail 위에 추가 drawer를 띄우는 구조는 빠르게 복잡도가 폭발**함

---

### 2. Ticket Detail의 성격

Ticket detail은 단순 조회 UI가 아니라:

- 상태 변경
- assignment
- approval
- history 확인
- comment 작성

등이 포함된 **“핵심 workflow”**임

👉 즉, transient UI가 아니라 **primary workflow**

---

### 3. Navigation & Deep Linking 문제

Modal/Drawer 기반일 경우:

- URL로 직접 접근 어려움
- 상태 복원 어려움
- 브라우저 히스토리와 자연스럽게 연결되지 않음

---

## Options Considered

### Option 1. Full Modal/Drawer Based UI

- 모든 interaction을 overlay로 처리

#### Pros

- 빠른 interaction
- 페이지 전환 없음

#### Cons

- 복잡도 급증
- deep linking 불가능
- 유지보수 어려움

👉 **장기적으로 유지 불가능**

---

### Option 2. Modal Route (Next.js Intercepting Route)

- detail을 modal route로 처리

#### Pros

- URL 유지 가능
- modal UX 유지

#### Cons

- 구현 복잡도 높음
- overlay 구조 유지됨
- nested overlay 문제 여전히 존재

👉 **문제 해결이 아니라 우회**

---

### Option 3. Page + Drawer Hybrid (Final)

- Detail = Page
- Sub interaction = Drawer / Dialog

---

## Decision

```txt
Ticket Detail은 Page로 구성한다.
Drawer/Dialog는 보조 interaction에만 사용한다.
```

---

## Rationale

### 1. Complexity Control

```txt
Primary workflow는 Page에서 처리하고,
Overlay는 보조 수단으로 제한한다.
```

- nested overlay 제거
- 상태 흐름 단순화
- 유지보수 용이

---

### 2. Clear Navigation

- `/service-desk/[ticketId]` 형태의 명확한 URL
- 브라우저 히스토리 자연스럽게 동작
- 직접 접근 가능 (deep link)

👉 이는 실제 운영 시스템에서 매우 중요

---

### 3. UX Consistency

- “이건 페이지인가? 모달인가?” 혼란 제거
- 사용자가 현재 위치를 명확히 인지 가능

---

### 4. Workflow Alignment

Ticket Detail은:

- 단순 조회가 아니라
- 작업 수행의 중심

👉 Page가 더 적절한 abstraction

---

## Drawer Usage Rule

Drawer는 다음 조건에서만 사용한다:

### ✅ 사용

- Comment 작성
- History 조회
- 간단한 수정 (partial edit)
- 보조 정보 표시

---

### ❌ 사용하지 않음

- Ticket 전체 수정
- Approval flow 전체
- 주요 workflow

---

## Key Insight

```txt
Overlay는 빠른 interaction을 위한 도구이지,
복잡한 workflow를 담는 컨테이너가 아니다.
```

---

## Additional Consideration

### Drawer as “Last UI Layer”

- Drawer는 항상 **가장 마지막 UI 레이어**로 사용
- Drawer 위에 Drawer를 쌓지 않는다

👉 이 규칙 하나로 UI 복잡도 크게 감소

---

## Impact

### Architecture

- Routing 전략이 Page 중심으로 명확해짐
- 와 일관성 확보

---

### UI Pattern

- 에서 정의한 dialog 역할이 명확해짐

---

### Developer Experience

- 상태 관리 단순화
- 디버깅 쉬움
- 컴포넌트 구조 명확

---

## Trade-offs

### Pros

- 명확한 UX 구조
- deep linking 가능
- 유지보수성 향상
- 복잡도 감소

---

### Cons

- 일부 interaction에서 페이지 전환 발생
- modal 기반 UX보다 느리게 느껴질 수 있음

---

## Final Summary

```txt
Primary workflow는 Page,
보조 interaction은 Drawer/Dialog로 분리한다.
```

이 결정은 단순 UI 선택이 아니라
**시스템 복잡도를 통제하기 위한 구조적 결정**이다.
