# Service Desk Settings (2026-02)

## Context

핵심 티켓 기능을 구현한 뒤, 다음 주요 단계는 **Service Desk Settings** 모듈을 구축하는 것이었다.

이 모듈은 다음과 같은 시스템의 기초 설정을 정의한다.

- Category 구조
- Department
- Job field
- 기타 참조 데이터

---

## Goal

다음을 지원하는 **중앙 집중형 설정 시스템**을 제공한다.

- 티켓 분류
- SLA 정의
- 조직 구조
- 애플리케이션 전반의 일관된 데이터

---

## 1. Key Decision

### Decision

Service Desk Settings를 단순한 UI 데이터가 아니라 **시스템 설정(system configuration)** 으로 다룬다.

---

### Principle

```id="settings-principle"
Settings는 단순히 수정 가능한 표시 값이 아니라, 시스템 동작과 도메인 규칙을 정의한다
```

---

## 2. Why This Decision Was Important

### Reason

이 설정들은 서비스 데스크 전체가 어떻게 동작하는지를 결정한다.

---

### Effects

- Category는 티켓 구조를 결정한다
- Settings는 SLA 동작에 영향을 준다
- 조직 데이터는 소유권과 라우팅에 영향을 준다
- 공유 참조 데이터는 여러 기능에서 일관되게 유지되어야 한다

---

## 3. Role of the Settings Module

### Responsibility

Settings 모듈은 서비스 데스크 동작을 형성하는 설정의 source of truth 역할을 한다.

---

### Examples

- Category 계층 구조
- Department 참조 데이터
- Job field 참조 데이터
- 티켓 흐름에서 사용하는 보조 메타데이터

---

## 4. Architectural Implication

### Decision

Settings 모듈은 시스템의 **도메인 기반(foundation)** 일부로 취급해야 한다.

---

### Reason

- Settings는 여러 기능에서 재사용된다
- 잘못된 Settings는 하위 워크플로를 망가뜨릴 수 있다
- 일반적인 UI 폼보다 더 구조적인 설계가 필요하다

---

## 5. Data Modeling Strategy

### Decision

Settings 데이터는 임의의 폼 입력처럼 다루지 말고, 도메인 의도를 반영해 신중하게 모델링한다.

---

### Reason

- Settings는 종종 비즈니스 규칙을 담고 있다
- Settings 사이의 관계 자체가 중요하다
- 구조는 향후 확장과 검증을 지원할 수 있어야 한다

---

## 6. UI Strategy

### Decision

Settings UI는 가벼운 콘텐츠 편집 화면이 아니라, 관리용 설정 인터페이스로 설계한다.

---

### Implication

- 속도만큼이나 명확성이 중요하다
- 엔터티 간 관계가 드러나야 한다
- 편집 흐름은 구조적이고 신중하게 느껴져야 한다

---

## 7. Reusability Consideration

### Decision

Settings 화면을 너무 이르게 과도하게 추상화하지 않는다.

---

### Reason

- 각 설정 영역은 서로 다른 도메인 규칙을 가질 수 있다
- 공통 패턴은 반복 사용을 통해 자연스럽게 드러나야 한다
- 성급한 추상화는 중요한 비즈니스 차이를 가릴 수 있다

---

## 8. Integration Impact

### Affected Areas

- 티켓 생성
- 티켓 분류
- SLA 동작
- 조직 기반 할당 로직
- 리포팅 일관성

---

### Reason

Settings 변경은 다른 모듈의 동작 방식에 영향을 주므로,
Settings 모듈은 시스템 수준의 중요도를 가진 것으로 다뤄져야 한다.

---

## 9. Trade-offs

### Pros

- 더 강한 도메인 일관성
- 더 명확한 시스템 경계
- 더 나은 장기 유지보수성
- 더 신뢰할 수 있는 하위 동작

---

### Cons

- 더 신중한 모델링이 필요하다
- 단순한 CRUD 화면보다 구현 복잡도가 증가한다
- 더 강한 검증과 관리자 운영 규율이 필요하다

---

## 10. Alternatives Considered

### 1. Settings를 단순한 Admin CRUD로 취급

- 빠르게 만들 수 있다
- 도메인 핵심 설정을 다루기에는 너무 약하다

---

### 2. 참조 데이터를 앱 안에 하드코딩

- 단기적으로는 단순하다
- 유지보수와 확장이 어렵다

---

### 3. 처음부터 완전히 범용적인 Settings 프레임워크 구축

- 처음에는 확장 가능해 보인다
- 성급한 추상화와 약한 도메인 명확성으로 이어질 수 있다

---

## 11. Key Insight

```id="settings-insight"
설정 데이터는 비즈니스 동작을 형성하므로, Settings는 부수적인 UI 데이터가 아니라 도메인의 일부로 설계되어야 한다
```

---

## Summary

Service Desk Settings 모듈은 단순한 관리자 폼 모음이 아니라,
시스템을 위한 **중앙 설정 계층**으로 위치 지워졌다.

이 결정은 티켓, SLA, 조직 워크플로 전반에서 더 강한 도메인 일관성,
더 나은 확장성, 더 신뢰할 수 있는 동작을 지원한다.
