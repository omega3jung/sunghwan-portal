# Ticket Rules

## 목표

Ticket rules 문서는 티켓 수정, action 실행, 상태에 영향을 주는 작업에 대한
**현재 구현 기준 rule**을 정의합니다.

이 문서는 다음을 보장하기 위해 존재합니다.

- business rule이 바로 구현 가능한 형태로 표현됩니다
- permission, status guard, side effect가 명시적으로 유지됩니다
- domain 문서와 UI 동작이 현재 execution rule과 일치하게 유지됩니다
- 이후 변경 사항을 명확한 source of truth 기준으로 검토할 수 있습니다

---

## 핵심 원칙

```id="ticket-rules-principle"
Every ticket operation must have an explicit actor, valid state, predictable effect, and clear restriction.
```

---

## 문서 세트 안에서의 역할

이 문서는 lifecycle이나 activity model 같은 상위 수준 domain 문서와
의도적으로 다른 역할을 가집니다.

### Domain Documents

- 개념 구조를 설명합니다
- 상태와 action의 의미를 설명합니다
- 모델이 왜 존재하는지 설명합니다

### This Rules Document

- 현재 무엇이 허용되는지를 정의합니다
- 구현 지향 제약을 정리합니다
- 실행 동작에 대한 현재 source of truth 역할을 합니다

요약하면:

```txt
Domain doc = conceptual model
Rules doc = current executable behavior
```

---

## Rule Format

각 rule은 일관된 implementation-oriented 구조로 설명됩니다.

### Rule Fields

- `who`: 누가 이 작업을 수행할 수 있는가
- `when`: 어떤 상태에서 허용되는가
- `effect`: 결과로 어떤 변경이 발생하는가
- `purpose`: 왜 이 작업이 존재하는가
- `restriction`: 추가 제약이나 guardrail

이 형식은 다음과 자연스럽게 연결되도록 설계되었습니다.

- permission check
- status validation
- command handler
- audit 및 history 생성

---

## Rule Areas

현재 rule set은 두 영역으로 구성됩니다.

### 1. Ticket Update Rules

- 티켓 자체를 변경하는 rule
- requester 중심 수정/재요청 동작

### 2. Ticket Action Rules

- 커뮤니케이션 및 운영 action에 대한 rule
- reject, merge, `reportResolved`, `reviewRejected` 같은 lifecycle 영향 동작

---

## Ticket Update Rules

### Update Ticket

- who: requester
- when: status가 `Draft`, `Open`
- effect: ticket field를 수정함
- purpose: 초기 요청을 보완하거나 완성함
- restriction:
  - `Approved` 이후에는 수정 불가
  - 변경 사항은 history에 기록되어야 함

---

### Update Declined Ticket

- who: requester
- when: status = `Declined`
- effect:
  - ticket field를 수정함
  - status -> `Open`
  - approval flow를 처음부터 다시 진입시킴
- purpose: 거절된 요청을 수정해 다시 제출함
- restriction:
  - approval progress를 초기화해야 함
  - 변경 사항은 history에 기록되어야 함

---

## Action Execution Strategy

모든 ticket action은 action-specific rule 이전에
공통 실행 규칙의 적용을 받습니다.

### Common Rule

- who: ticket view permission이 있는 모든 사용자
- when: status != `Closed`
- effect:
  - action 생성
  - history 기록
- purpose: ticket 운영과 커뮤니케이션 지원
- restriction:
  - `comment`, `note`만 수정/삭제 가능
  - `assign`, `adjust`, `merge`, `reject`, `reportResolved`, `reviewRejected` 같은 운영 action은 immutable
  - 모든 action에 content 필수
  - `Closed`에서는 어떤 action도 수정/삭제 불가
  - delete는 `active = false` 기반 soft delete

---

## Communication Actions

### Comment

- who: ticket access가 있는 모든 사용자
- when: status != `Closed`
- effect:
  - comment 생성
  - email notification 전송
- purpose: 외부 또는 공유 커뮤니케이션
- restriction:
  - content 필수
  - 작성자만 수정/삭제 가능

---

### Note

- who: ticket access가 있는 모든 사용자
- when: status != `Closed`
- effect:
  - note 생성
  - email notification 없음
- purpose: 내부 커뮤니케이션
- restriction:
  - content 필수
  - 작성자만 수정/삭제 가능

### Visibility

- `private`: 작성자만 볼 수 있음
- `shared`: 내부 처리 권한자와 작성자가 볼 수 있음

---

## Operational Actions

Operational action은 일반 workflow에서는 immutable하며,
ticket state, ownership, planning data에 영향을 줄 수 있습니다.

### Assign (Standard)

- who: assignee
- when: status = `Working`
- effect:
  - assignee 변경
  - email notification 전송
- purpose: active work를 위임하거나 재할당함
- restriction:
  - content 필수

---

### Assign (IT Manager)

- who: IT + (`Manager` | `Admin`)
- when: status가 `Open`, `Approved`, `Declined`, `Working`, `Pending`, `Rejected`
- effect:
  - assignee 변경
  - status가 `Declined`, `Rejected`이면 -> status = `Reopen`
  - email notification 전송
- purpose: manager 주도의 재할당 또는 재활성화
- restriction:
  - content 필수

---

### Adjust (Standard)

- who: assignee
- when: status = `Working`
- effect:
  - `priority` 변경
  - `riskLevel` 변경
  - `dueDate` 변경
- purpose: active work 중 실행 계획 조정
- restriction:
  - content 필수

---

### Adjust (IT Manager)

- who: IT + (`Manager` | `Admin`)
- when: status가 `Open`, `Approved`, `Working`, `Pending`, `Rejected`
- effect:
  - `priority` 변경
  - `riskLevel` 변경
  - `dueDate` 변경
- purpose: manager 주도의 계획 조정
- restriction:
  - content 필수

---

### Merge (Standard)

- who: assignee
- when: status가 `Working`, `Pending`, `Resolved`
- effect:
  - source ticket -> `Closed`
  - `closeReason = Merged`
  - `mergedIntoTicketId` 설정
- purpose: 중복 또는 관련 ticket을 정리함
- restriction:
  - self merge 금지
  - merged child merge 금지
  - target은 active여야 함
  - 같은 tenant, scope 안에 있어야 함

---

### Merge (IT Manager)

- who: IT + (`Manager` | `Admin`)
- when: status가 `Open`, `Approved`, `Working`, `Pending`, `Rejected`, `Resolved`, `Closed`
- effect:
  - merge 처리 수행
- purpose: manager-level ticket 정리
- restriction:
  - `Closed`에서의 merge는 예외적 상황에서만 허용
  - tenant와 scope는 유지되어야 함

---

### Reject (Standard)

- who: assignee
- when: status가 `Working`, `Pending`
- effect:
  - status -> `Rejected`
- purpose: 더 이상 진행할 수 없는 작업을 정리함
- restriction:
  - content 필수

---

### Reject (IT Manager)

- who: IT + (`Manager` | `Admin`)
- when: status가 `Open`, `Approved`, `Working`, `Pending`
- effect:
  - status -> `Rejected`
- purpose: manager-level rejection 처리
- restriction:
  - content 필수

---

### Report Resolved

- who: requester
- when: status = `Resolved`
- effect:
  - status -> `Reopen`
- purpose: 해결 결과 재검토 요청
- restriction:
  - content 필수

---

### Review Rejected

- who: requester
- when: status = `Rejected`
- effect:
  - status -> `Open`
- purpose: 거절된 요청을 수정해 다시 제출함
- restriction:
  - content 필수

---

### Assign Myself

- who: category assignee 또는 job-field rule에 부합하는 사용자
- when: status가 `Open`, `Approved`, `Working`
- effect:
  - status가 `Open`, `Approved`이면:
    - `assigneeIds = [me]`
    - status -> `Working`
  - status가 `Working`이면:
    - `me`를 `assigneeIds`에 추가
    - 기존 assignee에게 알림
- purpose: 빠른 self-assignment
- restriction:
  - 중복 assignee 추가를 방지해야 함
  - content는 자동 생성됨

---

## Implementation Notes

이 rule들은 구현에 사용할 만큼 충분히 안정적이어야 하지만,
장기적인 conceptual design과 동일한 것은 아닙니다.

### Practical Implications

- 이 문서가 바뀌면 command handler와 validation logic을 함께 검토해야 합니다
- lifecycle과 activity 문서는 이 파일과 일치해야 합니다
- speculative behavior는 실제 rule이 되기 전까지 이 문서 밖에 두어야 합니다

---

## 트레이드오프

### 장점

- 현재 동작을 명시적으로 드러냅니다
- frontend, API, documentation 간 일관성을 높입니다
- permission과 status handling의 모호함을 줄입니다
- implementation review와 regression checking을 지원합니다

---

### 단점

- rule이 진화할수록 지속적인 유지보수가 필요합니다
- 업데이트를 함께 하지 않으면 conceptual doc과 어긋날 수 있습니다
- 순수 서술형 domain 문서보다 장황하게 느껴질 수 있습니다

---

## 고려한 대안

### 1. Rule을 Domain Doc 안에만 유지

- 처음에는 읽기 쉽습니다
- implementation source of truth로 쓰기 어렵습니다

---

### 2. Rule을 Code 안에만 유지

- 중복 문서를 줄일 수 있습니다
- 설계/정책 검토에는 더 불리합니다

---

### 3. Loose Note 형태로 기록

- 처음에는 빠릅니다
- 일관된 실행 동작을 정의하기에는 너무 모호합니다

---

## 설계 원칙과의 정렬

이 문서는 다음 원칙과 정렬됩니다.

- 명시적 business rule 모델링
- implementation-oriented documentation
- audit-friendly workflow design
- conceptual design과 executable constraint의 분리

---

## 관련 문서

- [Development Approach](./development-approach.md)
- [Ticket Lifecycle](../03-domain/ticket/ticket-lifecycle.md)
- [Ticket Activity Model](../03-domain/ticket/ticket-activity.md)
- [Ticket History](../03-domain/ticket/ticket-history.md)

---

## 요약

Ticket rules 문서는 ticket update 동작과 ticket action 실행에 대한
**현재 구현 source of truth**를 정의합니다.

이 문서는 business intent를 명시적인 운영 rule로 바꿔,
permission, status transition, side effect, restriction이
예측 가능하고 검토 가능하며 구현 가능한 상태로 유지되게 합니다.
