# Ticket Form Dialog Decisions (2026-03)

## Context

Ticket Form Dialog는 Service Desk 시스템에서 가장 중요한 컴포넌트 중 하나다.

이 컴포넌트는 다음을 담당한다.

- ticket 생성
- ticket 수정
- 구조화된 사용자 입력 처리
- domain logic 통합 (category, SLA, priority 등)

---

## 1. Dialog vs Page

### Decision

ticket 생성에는 **Dialog**를 사용하고, ticket 상세/수정에는 **Page**를 사용한다.

---

### Reason

- ticket 생성은 짧게 끝나는 상호작용이다
- ticket 상세/수정은 오래 지속되는 workflow다
- drawer/dialog가 중첩되는 복잡성을 피할 수 있다

---

### Trade-off

- Dialog는 입력 시작이 더 빠르다
- Page는 복잡한 상호작용으로 확장하기 더 좋다

---

## 2. Controlled Dialog State

### Decision

**controlled open state** (`open`, `setOpen`)를 사용한다.

---

### Reason

- submit 성공 후 dialog를 닫을 수 있다
- programmatic control이 가능하다
- mutation flow와의 연동이 더 좋아진다

---

### Example

- Submit 성공 후 `setOpen(false)` 호출

---

## 3. Trigger Strategy

### Decision

dialog trigger는 **props로 커스터마이즈 가능**하게 둔다.

---

### Pattern

- `trigger`가 전달되면 그것을 사용한다
- 그렇지 않으면 기본 button으로 fallback한다

---

### Reason

- 재사용성이 좋아진다
- 다양한 UI 위치에 유연하게 통합할 수 있다

---

## 4. Multi-Step Form (Stepper)

### Decision

dialog 내부에 **multi-step form**을 사용한다.

---

### Reason

- ticket form은 복잡하다
- 단일 페이지 form은 부담이 크다
- step 기반 입력이 UX를 개선한다

---

### Structure

1. Category selection
2. Basic information
3. Details / attachments
4. Review & submit

---

## 5. Stepper Abstraction

### Decision

stepper를 아직 재사용 가능한 공통 컴포넌트로 추상화하지 않는다.

---

### Reason

- 현재 use case가 하나뿐이다
- step마다 content 구조가 다르다
- 추상화하려면 props가 과도하게 많아진다
- premature abstraction 위험이 있다

---

### Future Consideration

- step 기반 dialog가 여러 개 생기면 다시 검토한다

---

## 6. Single Form Instance Across Steps

### Decision

모든 step에서 **하나의 react-hook-form instance**를 사용한다.

---

### Reason

- single source of truth를 유지할 수 있다
- 데이터 분산을 피할 수 있다
- validation과 submit 처리가 단순해진다

---

## 7. Validation Strategy

### Decision

**step-level validation + final validation** 전략을 사용한다.

---

### Reason

- 잘못된 데이터 상태로 다음 step으로 진행하는 것을 막는다
- submit 단계에서 오류가 한꺼번에 쌓이는 문제를 줄인다
- UX가 더 명확해진다

---

## 8. Category-Driven Behavior

### Decision

form 동작은 선택한 category에 따라 달라지도록 설계한다.

---

### Effects

- 기본 priority
- 기본 risk level
- SLA 계산
- subcategory 사용 가능 여부

---

### Reason

- 입력을 domain rule에 맞출 수 있다
- 잘못된 설정을 줄일 수 있다
- 사용성이 좋아진다

---

## 9. SLA / Priority / Risk Handling

### Decision

- category의 기본값을 적용한다
- 필요할 때 override를 허용한다
- SLA는 동적으로 계산한다

---

### Reason

- 실제 Service Desk 동작 방식을 반영할 수 있다
- 유연한 business rule을 지원할 수 있다

---

## 10. useWatch Usage for File Handling

### Decision

파일 입력을 관찰하기 위해 `useWatch`를 사용한다.

---

### Issue Encountered

- `defaultValue`와의 type mismatch가 있었다

---

### Solution

- 잘못된 `defaultValue`를 제거한다
- 필요할 때 type assertion을 사용한다

---

### Outcome

- 타입이 안정적으로 유지된다
- react-hook-form과의 통합이 깔끔해진다

---

## 11. Draft Feature (Considered)

### Options

1. Local draft (client storage)
2. Server draft
3. No draft

---

### Decision

구현하지 않는다.

---

### Reason

- 추가 API와 state 복잡성이 필요하다
- MVP에 필수 기능은 아니다
- 이후 iteration으로 미룬다

---

## 12. Dialog Data Fetching

### Decision

필요한 경우가 아니면 dialog 내부에서 data fetching을 하지 않는다.

---

### Strategy

- 필요한 데이터는 props로 전달한다
- fetch는 feature/container level에서 수행한다

---

### Reason

- 중복 요청을 막을 수 있다
- component boundary를 깔끔하게 유지할 수 있다

---

## 13. Integration with Dashboard

### Decision

dashboard는 **form 구현 이후에** 개발한다.

---

### Reason

- dashboard는 ticket 데이터에 의존한다
- 현실적인 dataset이 필요하다
- 더 의미 있는 visualization이 가능해진다

---

## 14. Development Order

### Sequence

1. Ticket Form
2. Ticket List
3. Dashboard

---

### Reason

- form이 domain structure를 정의한다
- list가 data flow를 검증한다
- dashboard는 이미 존재하는 데이터를 시각화한다

---

## Summary

Ticket Form Dialog는 다음에 초점을 두고 개발되었다.

- 가이드된 사용자 입력 (multi-step form)
- 명확한 관심사 분리 (dialog vs page)
- premature abstraction 회피
- domain logic과의 강한 정렬
- 실용적이고 반복적인 의사결정

이 접근 덕분에 초기 개발 단계에서 불필요한 복잡성을 피하면서도,
시스템을 **사용 가능하고, 유연하며, 확장 가능하게** 유지할 수 있었다.
