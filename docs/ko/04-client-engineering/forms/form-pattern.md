# Form 패턴

## 목표

폼은 Service Desk 업무 흐름에서 사용자 입력을 독립적으로 관리하고 타입을 검증합니다.

현재 패턴:

- React Hook Form이 미저장 입력을 관리합니다.
- Zod가 스키마 검증을 담당합니다.
- React Query가 서버 상태를 관리합니다.
- 기능별 변경 요청(mutation)이 제출을 담당합니다.
- 서버 서비스가 업무 규칙을 적용하고 변경 결과를 결정합니다.

---

## 핵심 원칙

```txt
Form state는 local input state이다.
Workflow state는 server state이다.
```

폼은 입력을 수집하며 업무 규칙의 실행은 서버에 맡깁니다.

---

## Form Library

폼은 `react-hook-form`을 사용합니다.

장점:

- TypeScript 연동
- 효율적인 필드 갱신
- 스키마 검증 함수(resolver) 연결 지원
- 명확한 초기화·제출 동작
- 다단계 폼과의 호환성

---

## Validation

검증에는 Zod 같은 스키마 기반 규칙을 사용합니다.

티켓 폼의 검증 예시:

- 제목 길이 제한
- 필수 카테고리
- 업무 흐름에 따라 필요한 본문
- 오늘 이후인 완료 예정일
- 준비 전 첨부 필드는 브라우저 `File[]` 타입

클라이언트 검증은 사용자에게 오류를 빠르게 알려줍니다. 최종 유효성 판단은 서버가
수행합니다.

---

## Multi-Step Form

복잡한 업무에서 입력 항목을 단계별로 보여주는 것이 도움이 되면 다단계 폼을 사용합니다.

현재 티켓 폼 단계:

```txt
issueDetails
attachments
review
```

구현 정책:

- 모든 단계가 하나의 React Hook Form 인스턴스를 공유합니다.
- 단계 상태는 컴포넌트·훅의 로컬 상태로 관리합니다.
- 단계를 이동하기 전에 현재 단계의 입력을 검증합니다.
- 최종 제출 시 전체 데이터를 검증합니다.

---

## Create vs Update

생성과 수정은 필드 컴포넌트를 공유할 수 있지만 서로 다른 처리 흐름을 유지해야 합니다.

### Create

생성 흐름:

- 활성 초안 조회
- 닫기 시 초안 저장
- 첨부 정보 준비
- 새 티켓 또는 기존 초안 티켓 제출
- 제출 후 초안 정리

### Update

요청자 수정 흐름:

- 열릴 때 최신 티켓 상세 조회
- 기존 첨부 정보 보존
- 새 첨부 정보 준비
- 기존 첨부 정보와 새로 준비한 정보 병합
- 요청자 수정 요청
- 변경 필드에 따라 담당자 결정 초기화·유지

---

## Attachment Fields

브라우저 원본 `File`은 열린 폼 안에서만 임시로 보관합니다.

```txt
React Hook Form File[]
-> Attachment Prepare API
-> prepared metadata
-> ticket command payload
```

Raw file을 다음에 저장하지 않습니다.

- React Query
- Zustand
- ticket DTO
- draft DTO
- database row

---

## Draft Forms

초안은 컴포넌트의 미저장 입력과 별도로 저장하고 복구하는 데이터입니다.

REMOTE의 티켓 생성 초안은 초안 API와 React Query로 조회하는 서버 상태입니다.
폼은 활성 초안의 값으로 초기화하고, 입력값을 초안 저장 흐름으로 저장할 수 있습니다.

LOCAL mode에서는 동일한 기능 수준 초안 hook이 기능 초안 저장소를 통해 브라우저
`localStorage` 레코드를 읽고 씁니다. React Query가 저장소 결과를 캐시할 수 있지만
그 캐시는 복구 저장소가 아니며, 초안 Route Handler도 호출하지 않습니다.

초안은 첨부파일 복구를 보장하지 않습니다.

---

## Field Component Policy

재사용 필드 컴포넌트는 UI 일관성을 담당합니다. 업무 흐름은 담당하지 않습니다.

좋은 field 책임:

- label
- validation message
- input binding
- disabled/loading state
- localized display

승인자 결정, 작업자 배정 규칙, 이력 구성 로직은 필드 컴포넌트에 넣지 않습니다.

---

## Submission Policy

폼은 기능별 변경 요청을 통해 제출합니다.

```txt
form validation
-> optional preparation step
-> mutation
-> server workflow
-> targeted query invalidation
```

티켓 생성·수정은 제출 과정에서 첨부 정보를 먼저 준비한 뒤 티켓 변경 요청을 보냅니다.

---

## Reset Policy

다음 경우 폼 상태를 초기화합니다.

- 제출 성공 후
- 초안으로 입력을 보존할 필요 없이 다이얼로그가 닫힐 때
- 수정 다이얼로그에 최신 티켓 상세를 불러올 때

변경 요청의 기대 동작에 낙관적 갱신이 명시되지 않았다면 React Query 데이터를
직접 편집하여 서버 상태를 초기화하지 않습니다.

---

## Error Handling

다음을 사용합니다.

- 입력 검증 오류는 해당 필드의 메시지
- API 오류는 폼 전체 메시지 또는 토스트
- 변경 요청 처리 중에는 비활성화한 입력·버튼
- 가능한 경우 서버 오류 메시지

담당자 결정 초기화, 첨부 거부, 권한 오류는 일반 입력 검증 메시지로 뭉뚱그리지
않고 업무 처리 결과로 구체적으로 표시해야 합니다.

---

## State Ownership

| 상태 | 소유자 |
| --- | --- |
| 편집 중 필드 입력 | React Hook Form |
| 현재 폼 단계 | 컴포넌트·훅의 로컬 상태 |
| REMOTE active draft | React Query/API 및 PostgreSQL 티켓 행 |
| LOCAL draft recovery | 기능 초안 저장소 및 브라우저 `localStorage` |
| 티켓 상세 | React Query/API |
| 설정·카테고리 선택 항목 | React Query/API |
| 원본 파일 | 열린 폼의 React Hook Form |
| 준비된 첨부 정보 | API 요청 데이터와 저장된 티켓 데이터 |
| 전역 UI 표시 상태 | 필요한 경우 UI 저장소 |

---

## 안티패턴

### Server Data를 Form State에 계속 보관

폼은 서버 데이터로 초기화할 수 있지만 서버 상태 자체는 React Query가 관리합니다.

### Workflow Rules in Field Components

필드 컴포넌트가 승인, 배정, 상태, 이력을 결정하지 않습니다.

### 너무 이른 Generic Stepper

여러 업무 흐름이 실제로 같은 구조를 공유하기 전까지 단계 처리 로직은 해당 흐름 안에 둡니다.

### Silent Routing Changes

요청자 수정으로 담당자 결정을 초기화한다면 서버에서 실행하고 이력에 기록해야 합니다.

---

## 관련 문서

- [다이얼로그 패턴](../ui/dialog-pattern.md)
- [티켓 폼 설계](ticket-form.md)
- [티켓 첨부파일 설계](ticket-attachment.md)
- [React Query 전략](../../05-development/react-query-strategy.md)

---

## 요약

사용자 입력은 로컬 상태에서, 서버 데이터는 React Query에서 관리하고 업무 변경은
서버 명령이 실행합니다. 이 역할 구분으로 티켓 생성, 요청자 수정, 초안, 첨부 준비를
일관되게 처리하면서 각 흐름의 차이를 유지합니다.
