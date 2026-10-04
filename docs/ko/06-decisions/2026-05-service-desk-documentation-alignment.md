# Service Desk 문서 정합성 정렬 (2026-05)

## 배경

Service Desk 문서는 처음에 도메인과 아키텍처의 큰 구조를 설명하는 노트로 시작되었습니다.
구현이 구체화되면서 프로젝트는 프로덕션 설계에 더 가까운 포트폴리오 데모로 발전했습니다.

이 시점에서 다음과 같은 영역의 구현 방향이 더 명확해졌습니다.

- LOCAL / REMOTE 실행 환경 분리
- 서버 메모리에서 변경·관리하는 LOCAL 데모 상태
- Route Handler가 요청을 받아 실제 처리 함수에 맡기는 역할
- AuthUser / SessionUser / AppUser 분리
- 세션을 반영한 impersonation
- 현재 사용자와 티켓 데이터로 계산하는 ownership
- 액션을 기준으로 실행하는 업무 규칙
- 현재 구현에서 제외한 프로덕션 인프라 범위 명시

일반 문서와 구현 방향 사이에 점차 불일치가 생기기 시작했습니다.

---

## 문제

### 1. 일반 문서가 현재 구현을 따라오지 못함

일부 문서는 여전히 오래된 표현 또는 순수 개념 중심 표현을 사용하고 있었습니다.
이 때문에 실행 환경, 인증·세션의 역할, ownership 계산, 티켓 작업 동작을
오해할 수 있었습니다.

---

### 2. 히스토리 로그와 현재 문서는 책임이 다름

문서 집합에는 서로 다른 두 가지 산출물이 존재합니다.

```txt
Current docs  -> 현재 시스템을 설명
Decision logs -> 당시의 판단 근거를 보존
```

히스토리 decision log를 최신 설계에 맞춰 다시 작성하면,
역사적 맥락이 손실됩니다.

---

### 3. 포트폴리오 신뢰성을 위해 명시적 scope 경계가 필요함

이 프로젝트는 프로덕션 설계를 따르는 포트폴리오 데모이며, 프로덕션 기능을 모두 갖춘 상태는 아닙니다.
문서는 의도적으로 단순화했거나 구현을 미룬 영역을 과장하지 않아야 했습니다
(예: full enterprise rule engine, full remote persistence, real-time 인프라, full compliance stack).

---

### 4. 도메인 문서의 내부 정합성을 강화할 필요가 있었음

Service Desk 동작은 workflow-oriented 모델로 일관되게 설명되어야 했습니다.

- `Ticket`: 업무 흐름의 대상과 현재 상태
- `Activity`: 의미 있는 사용자 소통과 운영 작업
- `History`: 변경에 따라 생성되며 수정하지 않는 이벤트 기록
- `Rules`: 현재 실행할 수 있는 동작
- `Lifecycle`: 허용된 상태 전이 모델

---

## 결정

Decision log를 제외한 Markdown 문서를 당시 Service Desk 설계·구현 방향에 맞게
수정하기로 했습니다.

이를 통해 검토자에게 현재 문서의 유용성을 유지하면서, decision log는 히스토리 기록으로 보존합니다.

### Scope Rules

- 기존 historical decision log는 수정하지 않습니다.
- 현재 설계를 반영하도록 일반 설계/아키텍처/전략/README 문서를 업데이트합니다.
- 문서 변경은 최소 범위로 집중합니다.
- 정합성 확보에 필요한 경우를 제외하고 전면 재작성은 피합니다.
- 구현된 동작, 단순화된 데모 동작, deferred된 프로덕션 범위를 명확히 구분합니다.
- 현재 전략 문서와 operation rules 문서 간 정합성을 유지합니다.

---

## 정렬한 내용

### 1. Runtime 및 Demo 전략

- LOCAL / REMOTE runtime 분리를 명확히 함:

```txt
LOCAL  -> mock-backed demo behavior
REMOTE -> API / database-backed behavior
```

- orchestration 경계를 명확히 함:

```txt
UI
-> feature API client
-> Next.js route handler
-> LOCAL handler or REMOTE proxy
```

- LOCAL 데모 상태는 서버 메모리에서 변경·관리한다고 명확히 설명했습니다.
- `/api/demo/service-desk/reset`을 통한 초기화 동작을 명확히 설명했습니다.

---

### 2. Local Demo 권한 범위

- 단순화된 local rule을 문서화함:

```txt
ADMIN     -> broad permission
non-ADMIN -> must be related to the ticket
```

- full organization/department/job-field 인가 규칙은 REMOTE 확장 범위로 유지함.

---

### 3. Auth / Session / App User 경계

- 다음 경계를 기준으로 정렬함:

```txt
AuthUser    -> authentication identity
SessionUser -> session-safe projection
AppUser     -> application-facing user model
```

- 다음을 명확히 설명했습니다.
  - 인증 판단은 `JWT`를 기준으로 합니다.
  - 세션은 인증 정보를 필요한 형식으로 변환해 제공합니다.
  - `SessionUser`에는 `accessToken`을 포함하지 않습니다.
  - Zustand store는 실행 중 사용할 값을 제공·캐시하며 인증 판단의 기준은 아닙니다.

---

### 4. Session-Aware Impersonation

- impersonation을 server/session-aware 동작(클라이언트 단독 override 아님)으로 정렬함.
- 인가 경계를 명확히 함:
  - 최소 `ADMIN` 권한의 `INTERNAL` 사용자만 impersonation 시작 가능
  - impersonation 대상은 `CLIENT` 사용자여야 함
  - 규칙은 UI가 아닌 auth layer에 존재

---

### 5. Derived Ownership

- ownership은 저장된 고정 필드가 아니라 현재 사용자와 티켓 값으로 계산한다고 설명했습니다.

```ts
type Ownership = {
  owner: boolean;
  assigned: boolean;
};
```

```txt
owner    = currentUser.username === ticket.requesterId
assigned = ticket.assigneeIds.includes(currentUser.username)
```

---

### 6. Activity / History / Lifecycle / Rules 정합성

- CRUD 중심 표현보다 workflow 중심 모델을 강화함.
- ticket operation rules를 실행 가능한 현재 동작의 implementation-facing source of truth로 정렬함.
- action model 용어와 mutability 규칙을 정렬함.
- 커뮤니케이션 액션(`comment`, `note`)은 규칙 하에서 수정/삭제 가능하고, 운영 액션은 immutable임을 명확히 함.
- Closed 상태의 edit/delete 제한 및 soft delete(`active = false`)를 명확히 함.

---

### 7. Merge Semantics

- merge 동작을 표준화함:

```txt
source ticket -> Closed
closeReason = Merged
mergedIntoTicketId = target ticket id
mergedIntoTicketNo = target ticket number
```

- 별도의 `Merged` status는 사용하지 않음.

---

### 8. UI Interaction 정책

- 정책을 정렬함:

```txt
Page   -> primary workflow
Drawer -> secondary interaction
Dialog -> atomic action
```

- `ticket detail`은 page (`/service-desk/[ticketId]`)
- `ticket creation`은 dialog
- history/comment/action side panel은 secondary interaction

---

### 9. Data Fetching 및 API 경계

- React Query 분리를 명확히 함:
  - static/reference 데이터
  - dynamic/mutable Service Desk 데이터
- Route Handler가 LOCAL/REMOTE를 선택해 해당 처리 함수에 요청을 맡긴다고 설명했습니다.

---

### 10. Feature 및 Module 경계

- barrel export 정책을 명확히 함:
  - barrel 파일은 외부에 공개하는 API를 정의합니다.
  - 서버용·클라이언트 전용 모듈을 섞어 한꺼번에 export하지 않습니다.
- client-only shared utility 경계를 명확히 함 (예: `src/shared/client/`).

---

### 11. 링크 및 내비게이션 정합성

- 오래된 README/docs 링크를 현재 파일 구조에 맞게 업데이트함.
- 현재 workflow-oriented, runtime-separated 설계를 일관되게 표현하도록 문구를 정리함.

---

## 결과 영향

### 긍정적 영향

- 현재 문서가 실제 구현 방향을 더 잘 반영하게 됨.
- 도메인/아키텍처 용어 정합성이 높아짐.
- runtime 및 auth/session 경계가 검토자에게 더 명확해짐.
- 구현 범위와 deferred 범위를 구분하는 포트폴리오 문서 신뢰성이 높아짐.

---

### 부정적 영향 / 트레이드오프

- 지속적인 문서 유지보수에 더 엄격한 규율이 필요함.
- 용어 정밀도가 높아지면서 편집 비용이 증가함.
- 현재 문서와 decision log를 서로 다른 목적에 맞춰 계속 유지해야 함.

---

## 후속 운영 정책

- 일반 문서는 현재 시스템을 설명해야 합니다.
- decision log는 주요 변경의 맥락과 근거를 보존해야 합니다.
- 문서 정렬 작업이 새로운 아키텍처 의미를 만들었다면 decision log로 기록해야 합니다.
- deferred된 프로덕션 이슈는 future scope로 명시적으로 유지해야 합니다.
- Service Desk 문서는 domain model, implementation strategy, executable rules를 계속 구분해야 합니다.

---

## 요약

Decision log를 제외한 Service Desk 문서를 당시 아키텍처·구현 전략에 맞게 수정했고,
과거 decision log는 원본 그대로 보존했습니다.

이를 통해 히스토리 기록을 훼손하지 않으면서 포트폴리오 문서의 명확성, 정합성, 신뢰성을 개선했습니다.
