# System Layout (2025-12)

## 맥락

Service Desk 시스템이 발전하면서 다음 이유로 UI 복잡도가 증가했습니다.

- 여러 interaction pattern(dialog, drawer, full page)
- 커지는 feature scope(ticket detail, form, comment, history)
- 일관된 navigation 및 layout structure의 필요

또한 시스템에는 다음이 필요했습니다.

- **primary workflow**와 **secondary interaction**의 명확한 분리
- 모든 feature를 위한 안정적인 **home layout 기반**
- 예측 가능하고 확장 가능한 UI 동작

---

## 문제

### 1. Interaction 복잡도

- 복잡한 flow에 dialog를 사용하면 state management가 어렵고 navigation 경험이 나빠짐
- 중첩 overlay(drawer 위 drawer, dialog 위 dialog)가 복잡도를 높임

---

### 2. Layout 불일치

- 다음 항목의 명확한 정의가 없었음:
  - global layout(sidebar, navbar, footer)
  - feature-level rendering boundary

---

### 3. Navigation과 Interaction의 모호성

- 일부 view는 오래 유지되고 탐색할 수 있어 page처럼 동작함
- 하지만 dialog 또는 drawer로 구현됨

그 결과 UX가 일관되지 않았습니다.

---

## 결정

### 1. System-Level Layout 정의

Application은 다음 **home layout structure**를 채택했습니다.

```txt
App Layout
-> Sidebar (navigation)
-> Navbar (context / actions)
-> Main Content (page)
-> Footer (optional)
```

#### 특성

- protected route level에 layout 적용
- 모든 feature를 이 구조 안에서 rendering
- sidebar에 role-based rendering 반영
- layout이 impersonation을 인식

#### 이유

- 일관된 navigation 경험 제공
- 안정적인 UI 기반 확립
- role-aware UI 지원
- 확장 가능한 feature 추가 지원

---

### 2. Interaction 전략: Page vs Drawer vs Dialog

#### 핵심 원칙

```txt
Page -> primary workflow
Drawer -> secondary interaction
Dialog -> atomic action
```

#### Page

사용 대상:

- core workflow
- 복잡한 form
- 오래 지속되는 interaction

예:

```txt
/service-desk/[ticketId]
```

#### Drawer

사용 대상:

- supporting interaction
- contextual operation

예:

- comment panel
- history view
- detail page 안의 sub-action

#### Dialog

사용 대상:

- 짧은 action
- confirmation flow
- 단순 form

예:

- ticket 생성
- action 확인
- 작은 input form

---

### 3. 핵심 결정: Ticket Detail = Page

#### 결정

Ticket detail은 dialog나 drawer가 아닌 full page로 구현하기로 했습니다.

#### 이유

##### 1. 복잡도 제어

- nested overlay 방지
- state management 단순화

##### 2. 명확한 Navigation

- 각 ticket이 고유 URL을 가짐
- deep linking 지원

##### 3. 일관된 UX

- primary workflow로 취급
- 임시 interaction으로 취급하지 않음

---

### 4. Layout + Interaction 통합

#### 결합 모델

```txt
Home Layout (persistent)
-> Page (primary workflow)
-> Drawer (secondary interaction)
-> Dialog (atomic action)
```

#### Flow 예

```txt
Ticket List Page
-> Navigate to Ticket Detail Page
-> Open Comment Drawer
-> Open Confirm Dialog
```

#### 결과

- 명확한 interaction hierarchy
- navigation과 UI state 사이의 모호성 제거
- 예측 가능한 사용자 경험

---

### 5. Role-Aware Layout 동작

Layout은 user context에 따라 동적으로 바뀝니다.

#### 예

- role에 따른 sidebar menu 변경
- permission에 따른 visible feature 변경
- impersonation에 따른 current-user UI context 변경

#### 통합

- session + impersonation context 사용
- UI는 항상 current user를 반영

---

### 6. Impersonation 인식

Layout은 impersonation을 지원하도록 설계합니다.

#### 동작

- UI에 current user를 즉시 반영
- sidebar와 navigation을 동적으로 갱신
- global indicator에 impersonation state 표시

#### 목적

- 혼동 방지
- 안전한 testing 지원
- 투명성 유지

---

## Trade-off

### 장점

- 명확한 UI hierarchy
- 확장 가능한 interaction model
- 일관된 navigation
- nested overlay 복잡도 감소
- domain workflow와 강하게 정렬

---

### 단점

- UI pattern 선택에 discipline 필요
- page-based approach에 더 많은 routing setup 필요
- modal-first UX보다 navigation이 약간 무거움

---

## 검토한 대안

### 1. Dialog-Driven UI

- 빠른 interaction
- 확장하기 어려움
- navigation 명확성이 낮음

---

### 2. Drawer-Only Detail View

- 가벼운 UI
- 복잡한 workflow에 부적합
- state management가 어려움

---

### 3. Modal Routing

- advanced UX pattern
- 높은 복잡도
- 유지보수 어려움

---

## 영향

이 결정은 다음을 정의합니다.

- 향후 UI 구조
- navigation pattern
- feature integration approach

다음 영역에 영향을 줍니다.

- routing strategy
- component boundary decision
- state management
- UX consistency

---

## 요약

System layout은 다음으로 정의됩니다.

- persistent home layout(sidebar + navbar)
- page-based primary workflow
- drawer-based secondary interaction model
- dialog-based atomic action model

이를 통해 predictable, scalable, role-aware하며 domain workflow와 정렬된 UI
architecture를 만듭니다.

시스템이 screen 모음이 아니라 일관되고 구조화된 application interface로 동작하게
합니다.
