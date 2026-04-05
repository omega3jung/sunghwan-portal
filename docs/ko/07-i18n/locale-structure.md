# 로케일 구조

## 목표

로컬라이제이션(i18n) 구조는 **확장 가능하고, 유지보수 가능하며, 도메인 지향적인 번역 시스템**을 제공하도록 설계된다.

이 구조의 목적은 다음과 같다.

- 번역을 도메인과 책임 기준으로 구성한다
- 개발자와 리뷰어 모두의 가독성을 높인다
- 여러 기능에서 유연하게 사용할 수 있도록 한다
- 번역 키의 일관성을 유지한다

---

## 핵심 원칙

```id="i18n-principle"
Localization should follow domain boundaries, not technical layers
```

---

## Namespace 기반 구조

번역은 **namespace** 단위로 나뉘며, 각 namespace는 하나의 도메인 또는 관심사를 나타낸다.

---

### Namespace 목록

```txt id="namespaces"
auth
common
dashboard
demo
error
message
serviceDesk
settings
validation
```

---

### 근거

- **기능/도메인 경계**를 반영한다
- 하나의 거대한 번역 파일이 되는 것을 방지한다
- 유지보수성과 확장성을 높인다

---

## 디렉터리 구조

```bash id="locale-structure"
locales/
  en/
    common.json
    serviceDesk.json
    validation.json
  ko/
    common.json
    serviceDesk.json
    validation.json
```

---

### 전략

- 언어 기반 분리 (`en`, `ko`)
- namespace 기반 JSON 파일 구성
- 언어 간 동일한 구조 유지

---

## Namespace 책임

### common

- 공통 UI 라벨
- 재사용 가능한 필드 정의

---

### serviceDesk

- 기능 전용 번역
- 티켓 관련 라벨과 메시지

---

### validation

- 검증 메시지
- 폼 오류 피드백

---

### message

- 토스트 메시지
- 성공/실패 알림

---

### error

- 시스템 수준 오류 메시지

---

## 번역 접근 전략

### 기본 Namespace

각 feature는 **기본 namespace**를 정의한다.

---

### 예시

```ts id="default-ns"
const { t } = useTranslation(NS.serviceDesk);
```

---

### Namespace 간 접근

```ts id="cross-ns"
t("field.title.label", { ns: "common" });
```

---

### 근거

- 공통 필드를 중앙에서 관리할 수 있다
- 여러 feature에서 재사용할 수 있다

---

## 필드 구조

### 표준 형식

```json id="field-structure"
{
  "field": {
    "title": {
      "label": "Title",
      "placeholder": "Enter title"
    }
  }
}
```

---

### 장점

- 일관된 필드 정의
- 폼 간 재사용이 쉽다
- 비개발자에게도 구조가 명확하다

---

## 네이밍 규칙

### 규칙

```id="naming-rule"
Use structured and predictable keys
```

---

### 패턴

```txt id="naming-pattern"
field.<name>.label
field.<name>.placeholder
```

---

### 예시

```ts id="naming-example"
t("field.title.label", { ns: "common" });
```

---

## Helper Function (검토됨)

### 옵션

```ts id="helper"
function fieldLabel(name: string) {
  return t(`field.${name}.label`, { ns: "common" });
}
```

---

### 결정

- 채택하지 않았다

---

### 근거

- 가독성을 떨어뜨린다
- 번역 사용 위치가 덜 명시적이 된다
- 비개발자가 추적하기 더 어려워진다

---

## 명시성 vs 추상화

### 결정

```id="explicit-rule"
Prefer explicit translation keys over abstraction
```

---

### 이유

- 리뷰어(예: HR, 디자이너)가 이해하기 쉽다
- 코드의 명확성이 높아진다
- 숨겨진 로직을 줄일 수 있다

---

## 재사용성 전략

### 공통 필드

- `common`에 정의한다

---

### 기능 전용 필드

- 해당 feature namespace에 정의한다

---

### 예시

- `common.field.title`
- `serviceDesk.ticket.title`

---

## Validation 분리

검증 메시지는 전용 namespace로 분리한다.

---

### 이유

- UI 라벨과 오류 메시지가 섞이는 것을 방지한다
- 유지보수성을 높인다
- 여러 폼에서 재사용할 수 있다

---

## 확장성 전략

### 새 기능 추가

- 새 namespace를 만든다 (예: `inventory`)
- 기존 namespace는 불필요하게 수정하지 않는다

---

### 새 언어 추가

- namespace 구조를 그대로 복제한다
- 키의 일관성을 유지한다

---

## 피하려는 안티패턴

### 1. 하나의 전역 번역 파일

- 유지보수가 어렵다
- 확장성이 떨어진다

---

### 2. 과도한 추상화

- 번역 로직이 숨겨진다
- 가독성이 떨어진다

---

### 3. 책임 혼합

- UI + validation + message를 한 파일에 넣는 방식

---

### 4. 일관되지 않은 키 네이밍

- 유지보수가 어려워진다

---

## 트레이드오프

### 장점

- 명확한 도메인 분리
- 확장 가능한 구조
- 향상된 가독성
- 더 나은 협업

---

### 단점

- 관리해야 할 파일 수가 늘어난다
- 네이밍 규율이 필요하다
- 사용 코드가 약간 장황해질 수 있다

---

## 설계 원칙과의 정렬

이 구조는 다음 원칙과 정렬된다.

- 도메인 주도 설계
- 관심사 분리
- 확장성과 유지보수성
- 개발자와 리뷰어 경험

---

## 요약

로케일 구조는 **namespace 중심 구성**을 기반으로 하며,
번역을 도메인별로 묶어 확장 가능하고,
명시적이며, 애플리케이션 전반에서 유지보수하기 쉽게 만든다.
