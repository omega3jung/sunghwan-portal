# 티켓 규칙

## 목표

티켓 규칙 문서는 티켓 수정, action 실행, 상태에 영향을 주는 작업에 대한
**현재 구현 지향 규칙**을 정의합니다.

이 문서는 다음을 보장하기 위해 존재합니다.

- business rule이 직접 구현 가능한 형태로 표현된다
- permission, status guard, side effect가 명시적으로 유지된다
- domain 문서와 UI 동작이 현재 실행 규칙과 일치한다
- 향후 변경을 명확한 source of truth 기준으로 검토할 수 있다

---

## 핵심 원칙

```id="ticket-rules-principle"
Every ticket operation must have an explicit actor, valid state, predictable effect, and clear restriction.
```

---

## 문서 세트 안에서의 목적

이 문서는 lifecycle이나 activity model 같은 상위 도메인 문서와 의도적으로
다르게 구성되어 있습니다.

### Domain Documents

- 개념적 구조를 설명한다
- 상태와 action의 의미를 설명한다
- 왜 이 모델이 존재하는지 명확히 한다

### This Rules Document

- 현재 무엇이 허용되는지 정의한다
- 구현 관점의 제약을 담는다
- 실행 동작의 현재 source of truth 역할을 한다

요약하면 다음과 같습니다.

```txt
Domain doc = conceptual model
Rules doc = current executable behavior
```

---

## Rule 형식

각 rule은 일관된 구현 지향 구조를 사용해 설명됩니다.

### Rule 필드

- `who`: 누가 작업을 수행할 수 있는가
- `when`: 어떤 상태에서 작업이 허용되는가
- `effect`: 결과로 어떤 변경이 일어나는가
- `purpose`: 왜 이 작업이 존재하는가
- `restriction`: 추가 제약이나 guardrail은 무엇인가

이 형식은 다음과 자연스럽게 매핑되도록 설계되었습니다.

- permission check
- status validation
- command handler
- audit 및 history 생성

---

## Rule 영역

현재 rule set은 두 영역으로 구성됩니다.

### 1. Ticket Update Rules

- 티켓 자체를 변경하는 규칙
- requester 주도 수정 동작

### 2. Ticket Action Rules

- 커뮤니케이션 및 운영 action에 대한 규칙
- reject, merge, `reopen`, `resubmit`, `cancel` 같은 lifecycle 영향 동작

---

## Ticket Update Rules

### Update Ticket

- who: requester
- when: status = `Draft`
- effect: ticket field 수정
- purpose: 제출 전 요청을 다듬거나 완성한다
- restriction:
  - ticket update는 `resubmit` command와 다르다
  - 변경은 history에 기록되어야 한다

---

### Update Declined Ticket

- who: requester
- when: status = `Declined`
- effect:
  - ticket field 수정
  - ticket 생성과 동일한 routing으로 다시 제출한다
  - approval이 필요하면 status -> `Approval`
  - approval이 필요 없으면 status -> `Assigned`
- purpose: 거절된 요청을 수정하고 다시 제출한다
- restriction:
  - approval progress는 reset되어야 한다
  - 변경은 history에 기록되어야 한다

---

## Action 실행 전략

모든 ticket action은 action-specific rule이 적용되기 전에 공통 실행 규칙의
적용을 받습니다.

### 공통 규칙

- who: ticket view permission이 있는 모든 사용자
- when: action별 status rule이 허용하는 경우
- effect:
  - action 생성
  - history 기록
- purpose: ticket 운영과 커뮤니케이션 지원
- restriction:
  - `comment`, `note`만 수정 또는 삭제할 수 있다
  - `assign`, `adjust`, `merge`, `reject`, `reopen`, `resubmit`, `cancel` 같은 운영 action은 immutable이다
  - 모든 action은 content가 필수다
  - `Closed`에서는 어떤 action도 수정 또는 삭제할 수 없다
  - delete는 `active = false`를 사용하는 soft delete다

---

## 커뮤니케이션 액션

### Comment

- who: ticket 접근 권한이 있는 모든 사용자
- when: `Draft`를 제외한 모든 상태, `Closed` 포함
- effect:
  - comment 생성
  - 이메일 알림 발송
- purpose: 외부 또는 공유 커뮤니케이션
- restriction:
  - content 필수
  - ticket이 `Closed`가 아닐 때 작성자만 수정 또는 삭제할 수 있다

---

### Note

- who: ticket 접근 권한이 있는 모든 사용자
- when: `Draft`, `Closed`를 제외한 모든 상태
- effect:
  - note 생성
  - 이메일 알림 없음
- purpose: 내부 커뮤니케이션
- restriction:
  - content 필수
  - ticket이 `Closed`가 아닐 때 작성자만 수정 또는 삭제할 수 있다

### Visibility

- `private`: 작성자만 볼 수 있다
- `shared`: 내부 운영자와 작성자만 볼 수 있다

---

## 운영 액션

운영 action은 일반 workflow에서는 immutable이며, ticket state, ownership,
planning data에 영향을 줄 수 있습니다.

### Assign (Standard)

- who: 현재 work assignee
- when: status in `Assigned`, `Working`, `Pending`
- effect:
  - work assignee 갱신
  - `Pending` -> `Working`
  - `Assigned`, `Working`은 현재 status 유지
- purpose: 진행 중인 작업을 위임하거나 재할당한다
- restriction:
  - content 필수

---

### Assign (Admin)

- who: Admin
- when:
  - approval assign: status = `Approval`
  - work assign: status in `Assigned`, `Working`, `Pending`
- effect:
  - approval assign은 현재 approval step을 유지하고 approver만 변경한다
  - work assign은 assignee를 갱신한다
  - `Pending` -> `Working`
- purpose: admin 주도의 approval/work assignment 조정
- restriction:
  - content 필수

---

### Adjust (Standard)

- who: 현재 work assignee
- when: status in `Assigned`, `Working`, `Pending`
- effect:
  - `priority` 갱신
  - `riskLevel` 갱신
  - `dueDate` 갱신
- purpose: 진행 중인 작업의 실행 계획을 조정한다
- restriction:
  - content 필수
  - 변경 필드가 없는 no-op adjust는 거절된다

---

### Adjust (Admin)

- who: Admin
- when:
  - status in `Assigned`, `Working`, `Pending`
  - status in `Resolved`, `Closed`에서는 correction만 허용
- effect:
  - `priority` 갱신
  - `riskLevel` 갱신
  - `Resolved`, `Closed` 전까지만 `dueDate` 갱신
- purpose: admin 주도의 계획 조정 또는 correction
- restriction:
  - content 필수
  - resolved/closed correction에서는 due date를 변경할 수 없다
  - 변경 필드가 없는 no-op adjust는 거절된다

---

### Merge (Standard)

- who: 현재 work assignee
- when: status in `Assigned`, `Working`, `Pending`, `Resolved`
- effect:
  - source ticket -> `Closed`
  - `closeReason = Merged`
  - `mergedIntoTicketId`과 `mergedIntoTicketNo` 설정
  - 가능한 경우 running work session을 종료한다
- purpose: 중복 또는 관련 티켓을 통합한다
- restriction:
  - self merge는 금지된다
  - merged child merge는 금지된다
  - target은 active 상태여야 한다
  - target은 같은 tenant와 scope 안에 있어야 한다

---

### Merge (Admin)

- who: Admin
- when: `Draft`를 제외한 모든 상태, `Closed` 포함
- effect:
  - merge 처리 수행
  - 가능한 경우 running work session을 종료한다
- purpose: admin 수준의 ticket 통합
- restriction:
  - tenant와 scope는 계속 일치해야 한다

---

### Reject

- who: 현재 work assignee 또는 Admin
- when: status in `Assigned`, `Working`, `Pending`
- effect:
  - status -> `Rejected`
  - 가능한 경우 running work session을 종료한다
- purpose: 더 이상 진행할 수 없는 작업을 종료 처리한다
- restriction:
  - content 필수

---

### Reopen

- who: requester 또는 Admin
- when: status = `Resolved`
- effect:
  - status -> `Working`
  - history event = `TICKET_REOPENED`
- purpose: 해결 결과의 재검토를 요청한다
- restriction:
  - content 필수
  - 기존 work assignee가 있어야 한다

---

### Resubmit

- who: requester
- when: status in `Declined`, `Rejected`
- effect:
  - 초기 approval/assignment routing을 다시 실행한다
  - approval이 필요하면 status -> `Approval`
  - approval이 필요 없으면 status -> `Assigned`
- purpose: declined/rejected 요청을 수정해 다시 제출한다
- restriction:
  - content 필수

---

### Assign Myself (`assignSelf`)

- who: 현재 work assignee
- when: status in `Assigned`, `Working`, `Pending`
- effect:
  - 현재 assignee 목록을 actor 1명으로 교체한다
  - status는 변경하지 않는다
- purpose: 빠른 self-assignment
- restriction:
  - 현재 assignee가 2명 이상이어야 한다
  - actor가 이미 현재 work assignee에 포함되어 있어야 한다
  - content는 자동 생성된다

---

### Cancel

- who: requester
- when: status in `Approval`, `Declined`, `Assigned`, `Working`, `Pending`, `Rejected`
- effect:
  - status -> `Closed`
  - `closeReason = Canceled`
  - 가능한 경우 running work session을 종료한다
- purpose: 완료 전 requester 주도의 철회
- restriction:
  - content 필수

---

### Work Session Control

- who: 현재 work assignee
- when:
  - start work: `Assigned` -> `Working`
  - track work: `Working` -> `Pending` 또는 `Resolved`
  - resume/finish work: `Pending` -> `Working` 또는 `Resolved`
- effect:
  - tracked minutes를 기록한다
  - 명시적인 work-session command에서만 status를 변경한다
- restriction:
  - ticket detail read는 status를 변경하지 않는다
  - work를 `Resolved`로 끝내면 가능한 경우 running session을 종료한다

---

### Resolved Auto Close

- who: system
- when: latest resolved history가 7일 이상 지난 경우
- effect:
  - `Resolved` -> `Closed`
  - `closeReason = Completed`
  - history event = `RESOLUTION_CLOSE`
  - history source = `SYSTEM_AUTO`
- restriction:
  - 기준 시각은 `updatedAt`이 아니라 resolved history time이다
  - 가능한 경우 running work session을 종료한다

---

## 구현 메모

이 규칙들은 구현에 충분히 안정적이어야 하지만, 장기적인 개념 설계와
동일한 것은 아닙니다.

### 실무적 함의

- 이 문서가 바뀌면 command handler와 validation logic을 함께 검토해야 한다
- lifecycle 및 activity 문서는 이 파일과 일관되게 유지되어야 한다
- 추정성 동작은 실제 rule이 되기 전까지 이 파일 밖에 두어야 한다

---

## 트레이드오프

### 장점

- 현재 동작을 명시적으로 만든다
- frontend, API, documentation 사이의 일관성을 높인다
- permission과 status handling의 모호성을 줄인다
- 구현 검토와 regression checking을 지원한다

---

### 단점

- rule이 바뀔수록 꾸준한 유지보수가 필요하다
- 업데이트가 함께 이루어지지 않으면 개념 문서와 어긋날 수 있다
- 서술형 도메인 문서에 비해 장황하게 느껴질 수 있다

---

## 고려했던 대안

### 1. Rule을 Domain Doc 안에만 포함하기

- 처음에는 읽기 쉽다
- 구현용 source of truth로 사용하기는 더 어렵다

---

### 2. Rule을 Code 안에만 두기

- 중복 문서를 줄일 수 있다
- 설계 및 제품 논의에서 정책 검토가 더 어려워진다

---

### 3. Rule을 느슨한 메모 형태로 작성하기

- 초기 작성은 빠르다
- 일관된 실행 동작을 정의하기에는 너무 모호하다

---

## 설계 원칙과의 정렬

이 문서는 다음과 정렬됩니다.

- 명시적인 business rule modeling
- 구현 지향 문서화
- audit-friendly workflow 설계
- 개념 설계와 실행 가능한 constraint의 분리

---

## 관련 문서

- [개발 접근 방식](./development-approach.md)
- [티켓 라이프사이클](../03-domain/ticket/ticket-lifecycle.md)
- [티켓 활동 모델](../03-domain/ticket/ticket-activity.md)
- [티켓 이력](../03-domain/ticket/ticket-history.md)

---

## 요약

티켓 규칙 문서는 ticket update 동작과 ticket action 실행에 대한
**현재 구현 source of truth**를 정의합니다.

이 문서는 business intent를 명시적인 운영 규칙으로 번역하여,
permission, status transition, side effect, restriction이 예측 가능하고,
검토 가능하며, 구현 가능하도록 유지합니다.
