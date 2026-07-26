# Ticket Action Model Introduction (2026-04)

## Context

Service Desk 시스템은 원래 티켓 안의 사용자 커뮤니케이션과 activity를 표현하기 위해
`TicketComment` 기반 구조를 사용했습니다.

이 접근은 단순한 메시지 교환에는 충분했지만,
시스템이 발전하면서 추가 요구사항이 드러났습니다.

- assignment, priority 변경, ticket merge 같은 운영 액션 표현
- ticket 관련 activity를 구조적이고 추적 가능하게 기록
- 각 변경의 의도와 책임을 더 분명히 하여 감사 가능성 강화
- 실제 service desk workflow에 맞도록 UI 동작 정렬

이 시점에서 comment-only 모델의 한계가 분명해졌습니다.

---

## Problem

### 1. Lack of Semantic Meaning

- Comment는 단순 텍스트 entry였습니다.
- 서로 다른 action type을 구분할 수 없었습니다.
- 시스템 수준 변경과 사람 간 커뮤니케이션이 뒤섞여 있었습니다.

---

### 2. Poor Representation of Operational Actions

다음과 같은 핵심 액션은:

- 사용자 할당
- priority, risk level, due date 조정
- ticket 병합
- 요청 거절

first-class entity로 표현할 수 없었습니다.

대신 이런 액션들은:

- 텍스트 안에 암묵적으로 설명되거나
- comment timeline과 분리된 방식으로 처리되어야 했습니다.

그 결과 로직이 분절되고 history도 불명확해졌습니다.

---

### 3. Weak Traceability and Auditability

- 누가 무엇을 했는지 구조적으로 추적할 방법이 없었습니다.
- intent(reason)와 effect(change)를 구분하기 어려웠습니다.
- 신뢰할 수 있는 audit log를 만들기 어려웠습니다.

---

### 4. UI and Timeline Inconsistency

- Timeline은 서로 다른 유형의 이벤트를 분명한 구분 없이 섞어 보여줬습니다.
- UI는 구조화된 데이터가 아니라 텍스트에서 의미를 추론해야 했습니다.
- Activity summary와 filtering 기능도 제한적이었습니다.

---

## Options Considered

### 1. Extend the `TicketComment` Model

기존 comment model을 다음 방식으로 확장하는 안입니다.

- `"assignment"` 또는 `"update"` 같은 type field 추가
- 추가 metadata 도입

#### Pros

- 리팩터링 범위가 작음
- 기존 구조를 재사용할 수 있음

#### Cons

- `comment` 개념이 과도하게 확장됨
- 커뮤니케이션과 시스템 액션의 경계가 흐려짐
- 복잡한 조건 분기 로직으로 이어짐
- action type이 늘어날수록 확장성이 떨어짐

---

### 2. Introduce a Separate `TicketAction` Model (Chosen)

티켓에서 발생하는 모든 의미 있는 작업을 표현하는 새로운 `TicketAction`
도메인 모델을 도입하는 안입니다.

#### Key Idea

```txt
Comment is data
Action is behavior
```

#### Structure

각 action은 다음을 포함합니다.

- `type` (`assign`, `adjust`, `merge`, `reject`, `comment`, `note`)
- `content` (rich text reason 또는 message)
- `metadata` (action에 필요한 필드)
- `createdBy`
- `createdAt`

---

## Decision

우리는 `TicketComment` 중심 접근을 대체하기 위해
`TicketAction` 기반 모델을 도입했습니다.

### Core Changes

- 주요 activity 단위를 `TicketComment`에서 `TicketAction`으로 교체
- 모든 의미 있는 상호작용을 action으로 표현
- 다음을 분리:
  - 무엇이 일어났는가 (`action type`과 metadata)
  - 왜 일어났는가 (reason 또는 content)

---

### Action Types

이제 시스템은 다음 action type을 지원합니다.

- `comment`: 공개 커뮤니케이션
- `note`: 내부 팀 커뮤니케이션
- `assign`: assignment 및 category 업데이트
- `adjust`: priority, risk, due date 변경
- `merge`: ticket 병합
- `reject`: reason을 포함한 거절

---

### UI Alignment

- Timeline은 이제 comment 기반이 아니라 action 기반입니다.
- 각 action은 다음을 렌더링합니다.
  - 구조화된 metadata
  - shared rich text editor에서 작성한 optional reason content
- Form은 다음 구조를 따릅니다.
  - action-specific fields
  - shared reason editor

---

## Consequences

### 1. Clearer Domain Model

- Action이 실제 운영 작업을 표현합니다.
- 모델이 실제 service desk workflow에 더 가깝게 정렬됩니다.

---

### 2. Improved Traceability

각 action은 다음을 명시적으로 담습니다.

- actor
- intent (reason)
- effect (metadata)

이를 통해 더 신뢰할 수 있는 audit log를 만들 수 있습니다.

---

### 3. More Consistent UI and Timeline Behavior

- 통합된 timeline 구조
- 더 나은 가독성과 filtering
- 커뮤니케이션과 운영 activity의 명확한 구분

---

### 4. Better Extensibility

향후 새로운 action type도 전체 모델을 깨지 않고 추가할 수 있습니다.

- `resolve`
- `close`
- `reopen`
- `escalate`

---

### 5. Cleaner Frontend Architecture

- Form 구조가 action-specific fields + shared editor로 통일됩니다.
- 중복이 줄어듭니다.
- component boundary를 더 쉽게 이해할 수 있습니다.

---

## Trade-offs

### Pros

- 더 강한 도메인 명확성
- 구조화된 workflow 지원 향상
- 감사 가능성 향상
- 향후 기능을 위한 더 나은 확장성
- 더 일관된 timeline 및 UI 동작

---

### Cons

- 더 큰 리팩터링 범위
- comment API, component, mock, type 교체가 필요함
- 초기 모델링 복잡도를 높이는 새 도메인 개념이 추가됨

---

## Summary

`TicketComment`에서 `TicketAction`으로의 전환은
텍스트 중심 모델에서 행동 중심 모델로의 전환이었습니다.

이 변화는:

- 도메인 명확성을 높였고
- 구조화된 workflow를 가능하게 했으며
- 감사 가능성을 강화했고
- 미래 Service Desk 기능을 위한 확장 가능한 기반을 제공했습니다.
