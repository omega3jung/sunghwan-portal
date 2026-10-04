# Draft 저장의 최소 조건과 불완전한 내용 허용 (2026-09)

## 배경

Service Desk는 REMOTE 초안을 요청자가 소유한 `Draft` 상태의 티켓 행으로
저장합니다.

```txt
Draft 생성
-> Draft 수정
-> 동일한 row 제출
-> Approval 또는 Assigned 라우팅 진입
```

따라서 요청을 준비하는 단계부터 실제 업무 처리에 들어갈 때까지 같은 티켓 식별자를
유지합니다.

v1.0.x 안정화 과정에서 불완전한 Draft를 저장하려 하자 이 workflow 모델과
데이터베이스 제약 조건 사이의 불일치가 드러났습니다.

Ticket 테이블은 원래 다음 필드를 완성된 티켓의 값으로 취급했습니다.

```txt
category
subject
content
```

하지만 사용자는 요청 내용을 모두 작성하기 전에도 Draft를 저장할 수 있어야 합니다.

프로젝트에서는 다음 사항을 정의해야 했습니다.

- 저장하지 않은 폼 입력을 언제 초안으로 저장하는지
- 그 시점에 어떤 티켓 필드가 유효해야 하는지
- `status = Draft`일 때 불완전해도 되는 필드
- 데이터베이스에서 불완전한 초안과 유효하지 않은 운영 티켓을 구분하는 방식

---

## 문제

### 1. 모든 필드에 null을 허용하면 Ticket의 식별 기반이 약해짐

검토한 모델 중 하나는 다음과 같습니다.

```txt
Draft
-> category에 null 허용
-> subject에 null 허용
-> content에 null 허용
```

이 모델은 요청이 전혀 분류되지 않은 상태에서도 저장을 허용합니다.

Category는 단순한 표시용 필드가 아닙니다. 다음과 같은 중요한 Service Desk
맥락의 기준이 됩니다.

```txt
Category
-> Tenant 일관성
-> 요청 분류
-> 기본값
-> Approval 라우팅
-> Assignment 라우팅
```

현재 데이터베이스도 Category와 Tenant의 관계를 검증합니다.

`tk_category_id`에 null을 허용하면 요청이 아직 Draft인 동안에도 의미가 있는
불변 조건이 약해집니다.

---

### 2. 인위적인 Draft Category는 실제 업무를 나타내지 않는 도메인 데이터를 만듦

다른 대안은 다음과 같은 특별한 Category를 예약하는 것이었습니다.

```txt
category_id = 0
name = Draft
active = false
```

이 방식은 컬럼의 `NOT NULL`을 유지하면서도 사용자가 실제 Category를 선택하기
전에 Draft를 저장할 수 있게 합니다.

하지만 Category 모델은 Tenant에 속합니다.

전역으로 사용하는 인위적인 Category는 기존 Category/Tenant 관계와 충돌합니다.
Tenant별로 인위적인 Category를 만들면 다음 사항에 대한 추가 규칙이 필요합니다.

- 생성
- 식별
- 설정 화면 노출
- 활성화
- 삭제
- 라우팅 제외
- 분석 제외
- 최종 제출 시 교체

이 방식은 불완전한 폼 상태를 표현하기 위해서만 예외적인 도메인 데이터를 추가합니다.

---

### 3. 빈 문자열을 완전한 저장 값으로 취급하면 의도가 불명확해짐

`tk_subject`와 `tk_content`의 `NOT NULL`을 유지하고 Draft row에 빈 문자열을
저장하는 것도 가능했습니다.

```txt
Draft
subject = ""
content = ""
```

이 방식은 기술적으로 컬럼의 null 제약을 만족하지만 저장 모델의 의미를 덜
명확하게 만듭니다.

Draft row에서 `NULL`은 다음 상태를 더 정확하게 표현합니다.

```txt
아직 작성하지 않음
```

반면 운영 Ticket에는 여전히 의미 있는 요청 내용이 필요합니다.

따라서 애플리케이션에는 모든 Ticket 상태에 동일하게 적용하는 null 허용 규칙보다
상태에 따른 완성도 규칙이 필요했습니다.

---

## 검토한 대안

### 대안 1 — Draft의 Category, Subject, Content에 null 허용

```txt
Draft
-> category = null 허용
-> subject = null 허용
-> content = null 허용
```

#### 장점

- form 작성 중 어느 시점에서든 저장할 수 있습니다.
- Draft 생성 전 클라이언트 측 제한이 최소화됩니다.

#### 단점

- Category/Tenant 무결성이 약해집니다.
- 요청이 분류되지 않은 row의 저장을 허용합니다.
- Draft를 식별하는 최소 조건이 불명확해집니다.
- 유효하지 않은 상태를 처리하는 책임이 이후 workflow 단계로 더 많이 넘어갑니다.

이 대안은 채택하지 않았습니다.

---

### 대안 2 — 전역으로 사용하는 인위적인 Draft Category 도입

```txt
Draft
-> category = 예약된 Draft Category
```

#### 장점

- `tk_category_id NOT NULL`을 유지합니다.
- 사용자가 실제 Category를 선택하기 전에 저장할 수 있습니다.

#### 단점

- Category는 반드시 Tenant에 속해야 합니다.
- 전역 대체 값은 Tenant 범위의 Category 무결성과 충돌합니다.
- 비활성 상태라고 해서 시스템 소유이거나 변경 불가능한 것은 아닙니다.
- 설정, 라우팅, 검색 및 분석에서 별도의 제외 처리가 필요합니다.

이 대안은 채택하지 않았습니다.

---

### 대안 3 — Tenant별로 인위적인 Draft Category 도입

```txt
Tenant
-> 숨겨진 Draft Category
-> 요청이 분류될 때까지 사용자 Draft row가 해당 Category를 참조
```

#### 장점

- Category/Tenant 무결성을 유지합니다.
- `tk_category_id NOT NULL`을 유지합니다.

#### 단점

- 업무 모델에 시스템 전용 Category를 도입합니다.
- 실제 Service Desk 설정과 관계없는 수명 주기 및 노출 규칙이 필요합니다.
- 구현 및 유지보수 비용이 증가합니다.
- 사용자가 아직 분류하지 않은 상태를 여전히 인위적인 도메인 데이터로 표현합니다.

이 대안은 채택하지 않았습니다.

---

### 대안 4 — Category 선택 후 저장을 시작하고 불완전한 내용 허용

```txt
Category 없음
-> 현재 변경 내용은 저장하지 않은 form 상태로만 유지
-> 이전에 저장한 Draft는 그대로 유지

유효한 Category 선택
-> Draft 저장 가능

REMOTE Draft
-> subject에 null 허용
-> content에 null 허용

최종 제출
-> category 필수
-> subject 필수이며 공백만으로 구성될 수 없음
-> content 필수이며 의미 있는 내용이 있어야 함
```

#### 장점

- 최초로 저장하는 Ticket row부터 Category/Tenant 무결성을 유지합니다.
- 인위적인 도메인 데이터가 필요하지 않습니다.
- Draft 저장의 최소 조건이 명확해집니다.
- 불완전한 요청 내용을 명시적으로 표현합니다.
- 최종 운영 Ticket의 불변 조건을 강하게 유지합니다.
- UI, 서버 및 데이터베이스 계층 전반에서 설명하기 쉽습니다.

#### 단점

- Category 선택 전에 입력한 내용은 영속적으로 저장되지 않습니다.
- 변경 사항이 있지만 Category가 없는 form을 닫을 때 명시적인 UX 안내가 필요합니다.
- 데이터베이스 검사가 Draft와 Draft가 아닌 Ticket의 완성도를 구분해야 합니다.

이 대안을 채택했습니다.

---

## 결정

Category 선택을 Draft 저장의 최소 조건으로 사용합니다.

핵심 모델은 다음과 같습니다.

```txt
Category 미선택
-> 현재 변경 내용은 React Hook Form / component 상태로만 유지
-> LOCAL과 REMOTE 모두 Draft를 생성하거나 수정하지 않음
-> 이전에 저장한 Draft는 그대로 유지

유효한 Category 선택
-> 영속적인 Draft 저장 가능
-> Category/Tenant 관계가 유효함
-> Subject와 Content는 아직 불완전해도 됨

최종 제출
-> 완전한 Ticket 검증
-> REMOTE: 기존 Draft row가 Approval 또는 Assigned 상태로 진입
-> LOCAL: Ticket을 생성한 뒤 브라우저의 Draft 제거
```

REMOTE 데이터베이스 필드에 적용하는 규칙은 다음과 같습니다.

```txt
tk_category_id
-> Draft와 Draft가 아닌 Ticket row 모두 NOT NULL

tk_subject
-> status = Draft일 때 null 허용
-> Draft가 아니면 필수이며 공백만으로 구성될 수 없음

tk_content
-> status = Draft일 때 null 허용
-> Draft가 아니면 필수이며 공백만으로 구성될 수 없음
```

Category는 저장된 요청을 식별하는 최소 기반으로 유지합니다.

Subject와 Content는 Draft의 식별 기반이 아니라 요청의 완성도를 나타냅니다.

---

## 데이터베이스 계약

데이터베이스는 `tk_category_id NOT NULL`, 기존 Category 외래 키 및
Category/Tenant 트리거 동작을 유지합니다.

`tk_subject`와 `tk_content`는 null을 허용하는 컬럼이며, Draft 상태를 고려하는
CHECK 제약 조건을 적용합니다.

개념적으로 다음과 같습니다.

```sql
CHECK (
  tk_status = 'Draft'
  OR (
    tk_subject IS NOT NULL
    AND btrim(tk_subject) <> ''
  )
)
```

```sql
CHECK (
  tk_status = 'Draft'
  OR (
    tk_content IS NOT NULL
    AND btrim(tk_content) <> ''
  )
)
```

데이터베이스는 저장 시 필요한 최소 불변 조건을 보호합니다.

서식 있는 본문에 의미 있는 내용이 있는지는 서버가 검증합니다.
데이터베이스는 빈 문단과 같은 HTML에 의미 있는 요청 내용이 포함되어 있는지
판단하지 않습니다.

---

## 애플리케이션 규칙

### 1. Category가 없는 입력은 로컬 form 상태로 유지

입력을 변경했더라도 유효한 Category가 없는 생성 폼은 저장된 초안으로 취급하지
않습니다.

처음 닫으려 할 때는 Category 경고를 표시하고 대화상자를 열어 둡니다. 다시
닫으려 하면 현재 변경 내용을 저장하지 않고 닫습니다. 경고 상태는 대화상자를
열 때마다 초기화합니다. 경고 후 유효한 Category를 선택했다면 닫을 때 일반적인
초안 저장 절차를 따릅니다.

유효한 Category가 없는 동안에는 어느 닫기 시도에서도 Draft를 생성하거나
수정하지 않으며, 이전에 저장한 Draft는 그대로 유지합니다. UI는 인위적인
Category를 만들거나 유효하지 않은 Ticket row를 저장해서는 안 됩니다.

---

### 2. REMOTE의 불완전한 Draft 내용은 데이터베이스 경계에서 정규화

REMOTE 서버의 Draft mapper는 데이터베이스에 저장하기 전에 불완전한 값을
정규화합니다.

```txt
비어 있거나 공백만 있는 subject
-> null

의미 있는 내용이 없는 Draft content
-> null
```

REMOTE Draft를 form으로 다시 불러올 때는 다음과 같이 처리합니다.

```txt
데이터베이스의 null
-> form에 전달하는 빈 문자열
```

이 방식은 기존 폼이 받는 값의 범위를 불필요하게 넓히지 않으면서 데이터베이스에
저장한 값의 의미를 분명히 합니다.

LOCAL 초안은 폼 값을 브라우저 `localStorage`에 저장하므로 빈 문자열이 유지될
수 있습니다. 두 실행 환경은 불완전한 요청 내용을 허용한다는 업무 규칙을 공유합니다.
작성하지 않은 내용을 NULL로 표현하는 것은 REMOTE 데이터베이스 저장에만 적용합니다.

---

### 3. 최종 제출 검증은 엄격하게 유지

Draft 저장과 최종 Ticket 제출에는 서로 다른 완성도 규칙을 적용합니다.

```txt
Draft 저장
-> 불완전한 내용 허용

최종 제출
-> 유효한 Category 필수
-> 비어 있지 않은 Subject 필수
-> 의미 있는 Content 필수
-> 기존 SLA / 첨부파일 / 라우팅 검증 적용
```

최종 제출 가능 여부는 서버가 검증합니다.

내용이 불완전한 Draft row가 운영 Ticket으로 전환되어서는 안 됩니다.

---

### 4. REMOTE에서는 동일한 row로 제출하는 방식 유지

이 결정은 REMOTE Draft의 식별자를 변경하지 않습니다.

```txt
저장된 REMOTE Draft
-> 최종 제출
-> 동일한 Ticket row
-> Approval 또는 Assigned
```

REMOTE 제출에서는 두 번째 Ticket을 삽입한 뒤 기존 Draft를 삭제하지 않습니다.

LOCAL에는 재사용할 초안 티켓 행이 없습니다. 새 티켓을 생성하고 제출이 성공한
뒤 브라우저 초안을 제거합니다. 따라서 초안부터 같은 티켓 식별자를 유지하는 규칙은
REMOTE에 적용하며 LOCAL의 복구용 상태에는 적용하지 않습니다.

---

### 5. Workflow 경계에서 LOCAL과 REMOTE 동작 정렬

저장 방식은 서로 다르게 유지합니다.

```txt
LOCAL
-> 브라우저 localStorage Draft repository

REMOTE
-> PostgreSQL Ticket row
```

사용자에게 보이는 workflow 규칙은 공통으로 적용합니다.

```txt
Category 없음
-> 현재 입력으로 Draft를 생성하거나 수정하지 않음
-> 이전에 저장한 Draft는 그대로 유지

유효한 Category 선택
-> Draft 저장 허용
```

UI는 내부 저장 방식에 의존하지 않습니다.

---

### 6. 첨부파일 저장 규칙 유지

불완전한 Draft 내용을 허용하더라도 첨부파일 경계는 완화하지 않습니다.

브라우저에서만 유효한 값은 일시적인 상태로 유지합니다.

```txt
File
base64 image
blob URL
```

초안 저장도 제출한 티켓과 같은 첨부파일 준비 API를 통해 형식이 정리된 파일
정보를 사용합니다.

불완전한 Draft에 `tk_content = NULL`을 허용한다는 이유로 원본 base64나 blob을
다시 저장해서는 안 됩니다.

---

## 결과

### 긍정적 효과

- 최초로 저장하는 Draft row부터 Category/Tenant 무결성을 유지합니다.
- 인위적이거나 숨겨진 Category가 필요하지 않습니다.
- 저장 모델에서 작성하지 않은 Draft 내용과 완성된 Ticket 내용을 구분합니다.
- 서버 검증과 데이터베이스 제약 조건이 모두 최종 Ticket의 불변 조건을 보호합니다.
- LOCAL과 REMOTE는 애플리케이션 관점에서 이해하기 쉬운 하나의 Draft workflow를
  유지합니다.
- REMOTE에서는 Draft부터 운영 workflow까지 동일한 Ticket 식별자가 유지됩니다.
  LOCAL은 브라우저에 저장된 복구용 상태를 바탕으로 Ticket을 생성합니다.
- 기존 첨부파일 준비 경계와 호환되는 설계를 유지합니다.

### 부정적 효과 및 절충점

- Draft 저장을 시작하기 전에 사용자가 Category를 선택해야 합니다.
- Category 선택 전에 입력한 내용은 저장하지 않은 form 상태로만 남습니다.
- 생성 dialog는 변경 사항이 있지만 Category가 없는 form을 닫으려는 시도를
  명확하게 처리해야 합니다.
- 운영 Ticket을 사용하는 코드는 일반적으로 완전한 값을 기대하지만, REMOTE
  Ticket의 subject/content 타입은 데이터베이스 계층에서 null을 허용합니다.
  LOCAL Draft 저장은 form 중심의 표현을 유지합니다.
- 데이터베이스 제약 조건은 계속 상태를 고려해야 합니다.

---

## 채택하지 않은 단순화

프로젝트는 다음과 같은 지름길을 사용하지 않습니다.

```txt
Draft가 불완전하다는 이유로 tk_category_id에 null 허용
```

```txt
category_id = 0을 전역 Draft 대체 값으로 사용
```

```txt
Tenant별로 숨겨진 Draft Category 생성
```

```txt
NOT NULL을 유지하기 위해서만 REMOTE Draft row에 빈 문자열 저장
```

```txt
Ticket이 Draft 상태를 벗어난 후에도 불완전한 subject/content 허용
```

이러한 접근은 도메인 무결성을 약화하거나 문제 해결에 필요한 수준보다 유지보수가
어려운 예외 데이터를 도입합니다.

---

## 후속 정책

- Category를 저장된 Draft를 식별하는 최소 기반으로 유지합니다.
- 새로운 제품 요구사항 없이 `tk_category_id`에 null을 허용하지 않습니다.
- Form 저장만을 위해 인위적인 Draft Category를 도입하지 않습니다.
- `status = Draft`인 동안에만 불완전한 Subject와 Content를 허용합니다.
- 최종 제출 검증 권한을 서버에 유지합니다.
- Draft와 제출된 Ticket의 첨부파일 저장에 동일한 준비 경계를 적용합니다.
- REMOTE에서는 동일한 row로 Draft를 제출하는 방식을 유지합니다. LOCAL에서는
  Ticket을 생성하고 제출이 성공한 뒤 브라우저의 Draft를 정리합니다.
- Category가 없는 입력으로 Draft를 생성하거나 수정하지 않으며, 해당 변경 내용을
  저장하지 않고 닫을 때 이전에 저장한 Draft를 보존합니다.
- 이후 Category 선택 전에도 입력 복구가 필요해지면 티켓 도메인 모델의 조건을
  완화하기 전에 작성 중인 입력을 별도로 저장해야 하는지 검토합니다.

---

## 관련 문서

- `docs/spec/ticket-system.md`
- `docs/ko/03-domain/service-desk/ticket/ticket-model.md`
- `docs/ko/04-client-engineering/forms/ticket-form.md`
- `docs/ko/04-client-engineering/forms/ticket-attachment.md`
- `docs/ko/06-decisions/2026-06-ticket-form-and-draft-workflow.md`
- `docs/ko/06-decisions/2026-06-ticket-attachment-boundary.md`

---

## 요약

프로젝트는 Draft의 식별 기반과 요청의 완성도를 구분합니다.

```txt
Category
= 저장된 요청을 식별하는 최소 기반

Subject / Content
= Draft인 동안 불완전한 상태 허용

최종 제출
= 완전한 운영 Ticket의 불변 조건
```

이 방식은 Category/Tenant 무결성을 유지하고 인위적인 도메인 데이터를 추가하지
않으면서 불완전한 초안을 저장할 수 있게 합니다.
