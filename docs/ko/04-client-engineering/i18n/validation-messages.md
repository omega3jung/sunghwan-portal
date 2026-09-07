# 검증 메시지 구조

## 목표

검증 및 피드백 메시지 구조는 사용자에게 보여주는 메시지 유형별로
**책임을 명확하게 분리**하도록 설계되어 있습니다.

이 구조의 목적은 다음과 같습니다.

- 폼 전반에서 검증 규칙의 일관성을 유지합니다
- 인라인 폼 피드백과 시스템/액션 피드백을 분리합니다
- 로컬라이제이션 파일의 유지보수성을 높입니다
- 메시지의 의도를 명시적이고 예측 가능하게 만듭니다

---

## 핵심 원칙

```txt
Different message types should be separated by purpose, not grouped only by UI location
```

---

## 메시지 분류

시스템은 피드백 메시지를 **세 개의 namespace**로 분리하며, 각 namespace는 고유한 역할을 가집니다.

---

### Namespace 목록

```txt
validation
message
error
```

---

### 근거

- 메시지 소유권을 명확하게 유지할 수 있습니다
- 하나의 파일에 책임이 섞이는 것을 방지합니다
- 기능과 폼 전반에서 재사용성을 높입니다

---

## Namespace 책임

### validation

- 폼 검증 메시지
- 입력 규칙 피드백
- 인라인 필드 오류

---

### message

- 액션 피드백 메시지
- 성공 및 예상 가능한 실패 알림
- 토스트 및 배너 콘텐츠

---

### error

- 시스템 수준 실패
- API 및 네트워크 오류
- 예외적이거나 예상치 못한 상태

---

## Validation Namespace

### 목적

**입력 검증 규칙**과 직접 연결되는 메시지를 담습니다.

---

### 대표 사용 사례

- 필수 입력
- 최소 길이
- 최대 길이
- 잘못된 형식

---

### 예시 구조

```json
{
  "required": "This field is required.",
  "requiredWithField": "{{field}} is required.",
  "minLength": "Must be at least {{count}} characters.",
  "maxLength": "Must be less than {{count}} characters."
}
```

---

### 특징

- 보통 필드 근처에 인라인으로 표시됩니다
- 스키마 검증과 밀접하게 연결됩니다
- 여러 폼과 기능에서 재사용됩니다

---

## Message Namespace

### 목적

**예상 가능한 사용자 액션 이후** 표시되는 일반 애플리케이션 피드백을 담습니다.

---

### 대표 사용 사례

- 생성 성공
- 수정 성공
- 삭제 성공
- 저장 완료

---

### 예시 구조

```json
{
  "create": {
    "success": "Created successfully."
  },
  "update": {
    "success": "Updated successfully."
  },
  "delete": {
    "success": "Deleted successfully."
  }
}
```

---

### 특징

- 사용자 액션 이후에 트리거됩니다
- 토스트, 배너, 상태 UI에서 자주 사용됩니다
- 필드 검증이 아니라 애플리케이션 수준 피드백을 나타냅니다

---

## Error Namespace

### 목적

**시스템 수준 또는 예외 상황**의 오류 메시지를 담습니다.

---

### 대표 사용 사례

- 네트워크 오류
- 권한 없음
- 예상치 못한 서버 실패
- 데이터 없음

---

### 예시 구조

```json
{
  "network": "A network error occurred.",
  "unauthorized": "You are not authorized.",
  "forbidden": "You do not have permission.",
  "notFound": "The requested data was not found.",
  "unknown": "An unexpected error occurred."
}
```

---

### 특징

- 비정상적이거나 예외적인 상태를 나타냅니다
- 백엔드, 인증, 인프라 이슈와 자주 연결됩니다
- alert, dialog, 페이지 수준 fallback UI 등에 표시될 수 있습니다

---

## 책임 경계

### validation.json

- 입력 규칙 피드백에 사용합니다

---

### message.json

- 예상 가능한 애플리케이션 피드백에 사용합니다

---

### error.json

- 예상치 못한 실패 또는 시스템 수준 오류에 사용합니다

---

## UI 매핑

### validation

- 인라인 필드 오류
- 폼 도움말 텍스트

---

### message

- Toast
- 성공 배너
- 액션 상태

---

### error

- Alert
- 오류 페이지
- 전역 fallback
- API 실패 메시지

---

## 네이밍 전략

### validation.json

```txt
required
requiredWithField
minLength
maxLength
invalidEmail
```

---

### message.json

```txt
create.success
update.success
delete.success
save.success
```

---

### error.json

```txt
network
unauthorized
forbidden
notFound
unknown
```

---

## Interpolation 전략

메시지에 동적인 맥락을 담아야 할 때는 interpolation을 사용할 수 있습니다.

---

### 예시

```json
{
  "requiredWithField": "{{field}} is required."
}
```

---

### 장점

- 재사용성을 높입니다
- 중복을 줄입니다
- 동적 맥락을 지원합니다

---

## 왜 하나의 파일을 쓰지 않는가?

하나의 메시지 파일은 처음에는 단순해 보일 수 있지만, 장기적으로 문제를 만듭니다.

---

### 위험

- 책임 혼합
- 낮은 가독성
- 어려운 유지보수
- 불명확한 메시지 소유권

---

### 예시

```txt
validation.required
message.create.success
error.network
```

이들은 모두 메시지이지만, 본질적으로 서로 다른 역할을 가집니다.

---

## 재사용성 전략

### validation.json

- 여러 폼에서 폭넓게 재사용할 수 있습니다

---

### message.json

- 공통 액션을 기준으로 여러 도메인에서 재사용할 수 있습니다

---

### error.json

- 공통 시스템 오류를 위해 여러 기능에서 재사용할 수 있습니다

---

## 트레이드오프

### 장점

- 명확한 관심사 분리
- 더 나은 유지보수성
- 더 쉬운 협업
- 더 예측 가능한 메시지 소유권

---

### 단점

- 관리해야 할 파일 수가 늘어납니다
- 네이밍 규율이 필요합니다
- 초기 설정 비용이 약간 더 듭니다

---

## 고려한 대안

### 1. 단일 messages.json

- 초기 설정이 단순합니다
- 확장성이 떨어집니다
- 책임이 섞입니다

---

### 2. 기능 전용 메시지 파일만 사용하는 방식

- 도메인 그룹화는 강합니다
- 공통 검증 및 오류 패턴을 재사용하기 어렵습니다

---

### 3. 완전 중앙화된 전역 메시지 파일

- 조회 위치는 하나입니다
- 파일이 커지고 탐색이 어려워집니다

---

## 설계 원칙과의 정렬

이 구조는 다음 원칙과 정렬됩니다.

- 관심사 분리
- 확장 가능한 로컬라이제이션
- 예측 가능한 피드백 설계
- 더 나은 개발자 경험

---

## 요약

검증 메시지 전략은 **validation**, **일반 애플리케이션 피드백**, **시스템 수준 오류**를
각각 별도의 namespace로 분리합니다. 이렇게 하면 메시지 유형별 목적이 분명해지고,
맥락에 맞게 재사용할 수 있으며, 애플리케이션이 커져도 유지보수하기 쉽습니다.
