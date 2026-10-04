# SLA Strategy

## 목표

이 문서는 현재 Service Desk 티켓의 처리 기한을 설정하고 관리하는 방식을 설명합니다.
향후 구현 가능한 자동화와 현재 동작을 구분합니다.

현재 구현에서 SLA는 주로 다음으로 표현됩니다.

- 카테고리의 기본 SLA 일수
- 폼의 기한 기본값과 검증
- 티켓의 `dueAt`
- 작업 계획에 사용하는 우선순위·위험도
- 티켓 액션으로 수행하는 수동·운영자 조정

전체 SLA 기한 위반·일시 중단·에스컬레이션·달력·알림 엔진은 현재 구현 범위에 포함되지 않습니다.

---

## 핵심 원칙

```txt
Current SLA = configured expectation + ticket due date.
Full SLA automation is deferred.
```

해당 서비스를 구현하기 전까지 기한 위반 감지, 에스컬레이션, 근무일 달력 계산을
완료된 동작으로 설명하면 안 됩니다.

---

## 현재 Input

현재 Service Desk 모델은 다음 SLA 관련 입력을 사용합니다.

| Input | Source | Current Use |
| --- | --- | --- |
| `defaultSlaDays` | 상위·하위 카테고리 설정 | 예상 기한의 초기값 또는 안내 기준 |
| `priority` | 카테고리 기본값, 폼 또는 조정 액션 | 계획·화면 표시 정보 |
| `riskLevel` | 카테고리 기본값, 폼 또는 조정 액션 | 계획·화면 표시 정보 |
| `dueAt` | 폼·수정·액션 요청 | 티켓에 저장된 기한 |

카테고리 기본값은 Tenant별로 구분합니다. 하위 카테고리에 기본값이 있으면 상위
카테고리 기본값보다 우선 적용합니다.

---

## Category Default Resolution

```txt
selected subcategory defaultSlaDays
-> fallback main category defaultSlaDays
-> due date expectation
```

요청자가 카테고리를 선택할 때 UI는 카테고리 기본값을 적용할 수 있습니다.

서버는 제출한 티켓 입력을 검증하고 최종 업무 상태 전이를 결정합니다.

---

## Due Date Behavior

티켓 폼은 `dueAt`이 오늘 이후 날짜인지 검증합니다.

요청자는 티켓이 다음 상태일 때 기한을 수정할 수 있습니다.

```txt
Approval
Assigned
```

현재 요청자 수정 정책에서는 기한만 바꾸어도 담당자를 다시 결정하지 않습니다.

- 기한과 이메일 수신자만 바뀌면 담당자 결정 결과를 유지합니다.
- 카테고리, 제목, 본문, 첨부파일, 이미지가 바뀌면 담당자를 처음부터 다시 결정합니다.

기한이 담당자 재결정을 유발하는 필드와 함께 변경되면 담당자 결정 결과는
해당 필드의 변경 규칙을 따릅니다.

변경한 필드가 카테고리이면 요청자 수정은 새 카테고리의 기본 SLA 일수에서
최소 기한도 다시 평가합니다.

```txt
newCategoryMinimumDueAt = today + new category default SLA days
nextDueAt = later(currentDueAt, submittedDueAt, newCategoryMinimumDueAt)
```

제출한 기한도 최댓값 계산에 포함하므로 전체 규칙은
`later(currentDueAt, submittedDueAt, newCategoryMinimumDueAt)`입니다.

이 규칙은 더 늦은 현재 기한을 유지하고, 더 이른 기한은 새 최소 기한으로 조정합니다.
카테고리 변경으로 기한을 더 이른 날짜로 당기지 않습니다.

---

## Adjust Action

계획 값은 현재 액션 규칙이 허용하는 경우 Ticket Action 명령으로 변경할 수 있습니다.

`ADJUST`는 구현된 액션 규칙에 따라 우선순위, 위험도, 기한 등의 계획 필드를 변경할 수 있습니다.

이 변경은 필드 값만 바꾸지 않고 이벤트 이력으로 기록해야 합니다.

---

## Work Session과의 관계

작업 시간 기록은 실제 업무 내역을 남깁니다. 현재 전체 SLA 시간 측정 기능을 구현하지 않습니다.

작업 시간 기록은 향후 SLA 보고서에서 다음 질문에 답하는 근거로 사용할 수 있습니다.

- 작업은 언제 시작되었는가?
- 작업 시간이 얼마나 기록되었는가?
- 기록된 작업 이후 티켓이 해결되었는가?

현재 문서는 이 기록을 향후 보고서의 근거로 설명해야 하며, 완료된 SLA 타이머 엔진으로 취급하면 안 됩니다.

---

## Auto Close와의 관계

현재 구현에는 해결된 티켓을 유예 기간 이후 자동으로 종료하는 동작이 포함됩니다.

이는 SLA 기한 위반 처리와 별개입니다.

```txt
Resolved ticket grace period close
!= SLA breach/escalation engine
```

가장 최근 해결 이력 시각부터 168시간이 지나면 자동 종료 대상이 됩니다. 티켓을
`Closed`로 이동시키고 종료 사유 `Completed`를 설정합니다. 지원되는 경우 진행 중인
작업 시간 기록을 종료하고, `RESOLUTION_CLOSE`를 `SYSTEM_AUTO`, `actionNo = null`로 기록합니다.

REMOTE 예약 실행은 Supabase Cron(`0 * * * *`)으로 매시간 검사합니다. 검사 주기는
대상 조건 충족 시점과 별개이며 종료 시각을 보장하지 않습니다. REMOTE 함수 실행과 예약 호출은
검증되었습니다.
[스케줄링 결정](../../../../06-decisions/2026-09-resolved-auto-close-scheduling.md)을 참고하세요.

---

## Deferred SLA Engine

향후 운영용 SLA 엔진에 다음을 추가할 수 있습니다.

- 응답 시간 목표
- 해결 시간 목표
- 업무 시간 달력
- 휴일 달력
- `Pending`의 시간 측정 일시 중단·재개 규칙
- 기한 위반 감지
- 에스컬레이션 기준
- 알림 발송
- SLA 준수 보고서
- Tenant별 SLA 정책

이 항목을 도입하려면 별도 서비스, 데이터 필드, 이력 이벤트가 필요합니다.
현재 기한 관리 동작에 포함된 것으로 설명하면 안 됩니다.

---

## 피하는 Anti-Patterns

### Matrix Engine이 존재한다고 주장하기

우선순위·위험도 매트릭스는 향후 설계 도구로 사용할 수 있지만,
현재 구현이 완전한 매트릭스 엔진을 실행하는 것으로 설명하면 안 됩니다.

### Pending을 구현된 SLA Pause로 취급하기

`Pending`은 업무 상태이며, 현재 구현된 SLA 시간 측정 일시 중단 기능이 아닙니다.

### Due Date Change 숨기기

기한 변경은 업무 계획 변경이므로 이력에서 추적할 수 있어야 합니다.

### Auto Close와 SLA Breach 섞기

해결된 티켓의 자동 종료는 생명주기를 정리하는 규칙이며, 서비스 수준 기한 위반 규칙과는 별개입니다.

---

## 관련 문서

- [카테고리 전략](category-strategy.md)
- [액션 전략](action-strategy.md)
- [티켓 작업 세션](../ticket-work-session.md)
- [티켓 이력](../ticket-history.md)
- [티켓 폼 설계](../../../../04-client-engineering/forms/ticket-form.md)

---

## 현재 Default 및 최소 마감일 규칙

티켓 생성 시 명시적으로 입력한 유효한 priority/risk 값은 그대로 보존합니다. 값이 없으면
선택한 하위 카테고리의 기본값을 사용하고, 없을 때 상위 카테고리 기본값을 사용합니다.
서버는 제출한 기한이
`today + effective defaultSlaDays`보다 이르면 거부합니다.

요청자가 Category를 변경하면 priority/risk는 새 Category 기본값으로 다시
결정합니다. 기한은 다음 세 값 중 가장 늦은 값이며 Category 변경으로 기존
마감일을 앞당기지 않습니다.

```txt
nextDueAt = later(currentDueAt, submittedDueAt, newCategoryMinimumDueAt)
```

LOCAL과 REMOTE 모두 하위 값이 없을 때 상위 기본값을 사용하며, 서버가 최종 검증·결정을 맡습니다.

## 요약

현재 SLA 모델은 구현된 기한 관리 범위에 집중합니다. 카테고리 설정은 기본 SLA 일수를
제공하고, 폼과 액션은 기한 및 계획 필드를 관리하며, 이력은 의미 있는 변경을 기록합니다.

전체 SLA 시간 측정, 기한 위반, 에스컬레이션, 달력, 알림은 향후 운영 환경의 확장 범위로 남습니다.
