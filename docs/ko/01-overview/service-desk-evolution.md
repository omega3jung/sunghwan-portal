# Service Desk 진화

## 목표

이 문서는 이전 Service Hub / IT Help Desk 운영 경험을 바탕으로 `sunghwan-portal`의
현재 Service Desk 도메인을 어떻게 설계했는지 설명합니다.

이 문서는 설계 진화를 다룹니다. 구현 경계는
[`service-desk-implementation-strategy.md`](../05-development/service-desk-implementation-strategy.md)에서
다루고, 당시의 의사결정 맥락은 Decision Log에 보존합니다.

---

## 역사적 맥락

이전 실무 시스템은 다음을 처리하는 IT Help Desk 스타일 모듈을 포함했습니다.

- 사용자 요청 접수
- 담당자 할당
- 상태 추적
- 요청자와의 커뮤니케이션
- 운영 진행 상황 확인

현재 프로젝트는 실제 운영에서 얻은 교훈을 바탕으로 Service Desk의 개념과 업무
규칙을 더 명확하게 재설계했습니다.

```txt
previous workplace experience
-> operational lessons
-> clearer domain boundaries
-> production-aligned portfolio design
```

---

## 정체성 전환

이름을 Service Hub에서 Service Desk로 바꾼 이유는 현재 모듈이 넓은 포털 기능이
아니라 요청 접수와 처리에 집중한 업무 영역이기 때문입니다.

현재 Service Desk가 의미하는 것:

- 요청 접수
- 티켓 생명주기
- 승인자 결정
- 작업자 배정
- 액션 명령
- 커뮤니케이션
- 이벤트 단위 이력
- 작업 세션
- 설정에 따른 동작

---

## Request Record에서 Workflow Entity로

이전 모델은 요청 내용을 기록하고 상태를 갱신하는 구조에 가까웠습니다.

현재 모델은 티켓을 업무 흐름의 단위로 다루고, 정해진 규칙에 따라 상태를 전환합니다.

```txt
Draft
Approval
Declined
Assigned
Working
Pending
Rejected
Resolved
Closed
```

일반적인 정상 처리 흐름:

```txt
Draft -> Approval -> Assigned -> Working -> Resolved -> Closed
Draft -> Assigned -> Working -> Resolved -> Closed
```

반려, 보류, 재개 등 다른 주요 처리 흐름:

```txt
Approval -> Declined
Assigned / Working / Pending -> Rejected
Working -> Pending -> Working
Resolved -> Working
Assigned / Working / Pending / Resolved -> Closed
```

`Open`, `Approved`, `Reopen`은 과거 문서나 이전 DB 행의 값 보정 설명에
나올 수 있지만 현재 티켓 상태값은 아닙니다.

---

## Text Update에서 Command로

이전 방식은 댓글 작성과 상태 수정에 많이 의존했습니다.

현재 설계는 작업 의도를 명확하게 나타내는 Ticket Action 명령을 사용합니다.

```txt
APPROVE
DECLINE
COMMENT
NOTE
ASSIGN
ASSIGN_SELF
REJECT
MERGE
ADJUST
REOPEN
RESUBMIT
CANCEL
```

흐름:

```txt
Action intent
-> server rule execution
-> status/routing/data effect
-> event-based history
```

댓글은 의사소통 수단입니다. 담당자 배정, 거절, 병합, 작업 재개, 계획 조정은
각각의 실행 규칙을 가진 명령입니다.

---

## Comment와 Note 분리

의사소통 기능은 다음 두 개념으로 분리했습니다.

| Type | 목적 |
| --- | --- |
| `COMMENT` | 요청자에게 공개하거나 함께 공유하는 의사소통 |
| `NOTE` | 내부 업무 메모 |

이 분리는 내부 팀 맥락과 요청자 대상 커뮤니케이션을 섞지 않게 합니다.

---

## Activity와 History 분리

```txt
Activity/Action = 누군가 무엇을 왜 하려 했는가
History = 실제로 무엇이 바뀌었는가에 대한 immutable event record
```

이력은 이벤트 단위로 다음을 기록합니다.

- 유형(`type`)
- 출처(`source`)
- 이벤트(`event`)
- 변경 전후 값
- 수행자
- 발생 시각

따라서 타임라인은 댓글 목록이나 자유 형식의 `metadata.event`에 의존하지 않습니다.

---

## Tenant-Scoped Settings

설정은 관리자가 값을 조회·추가·수정·삭제하는 기능에서 티켓의 동작을 결정하는
구성으로 발전했습니다.

현재 설정 범위:

```txt
Tenant
-> Category
-> Approval Step
-> Assignment Rule
```

중요 변화:

- `Tenant`는 Service Desk 설정을 구분하는 단위입니다.
- 카테고리 범위는 `"PORTAL"` 또는 `"INTERNAL"`입니다.
- 승인 단계는 카테고리별로 정해진 순서에 따라 진행합니다.
- 배정 규칙은 직무 필드와 직원 username으로 담당자 그룹을 구성합니다.
- 설정 변경은 이후 동작에 영향을 주며 과거 이력을 다시 쓰지 않습니다.

---

## Category-Driven Behavior

카테고리는 티켓의 기본값과 담당자 결정 방식을 정합니다.

```txt
Tenant-scoped category
-> defaults
-> approval resolution
-> work assignment resolution
-> requester update routing policy
```

카테고리는 기본 우선순위, 위험도, SLA 일수를 제공할 수 있으며 승인·배정 설정의
기준이 됩니다.

요청자가 카테고리를 바꾸면 담당자 결정에 영향을 주므로 담당자 결정을 초기화할 수 있습니다.

---

## Approval과 Work Routing

담당자 결정은 승인 단계와 작업 단계를 구분하도록 바뀌었습니다.

```ts
type TicketAssignmentPhase = "APPROVAL" | "WORK";
```

티켓 DTO(API로 전달하는 데이터)는 현재 단계와 담당자 정보를 바탕으로 다음 값을
계산해 제공할 수 있습니다.

- 승인 담당자 목록
- 작업 담당자 목록
- 현재 사용자의 승인자 배정 여부
- 현재 사용자의 작업자 배정 여부

승인자와 작업자의 역할을 구분한 것이 핵심 개선입니다.

---

## Requester Update Policy

요청자는 작업이 시작되기 전 단계에서 제한적으로 티켓을 수정할 수 있습니다.

수정이 허용되는 상태:

```txt
Approval
Assigned
```

담당자 결정을 바꿀 수 있는 필드:

- 카테고리
- 제목
- 본문
- 첨부파일
- 이미지

담당자 결정을 유지하는 필드:

- 완료 예정일
- 이메일 수신자

서버는 `ROUTING_RESET` 또는 `ROUTING_PRESERVED`를 기록합니다.

---

## Draft와 Attachment Boundary

티켓 생성은 한 번에 제출하는 폼에서 초안을 저장하고 복구할 수 있는 흐름으로 발전했습니다.

REMOTE 초안은 DB의 `Draft` 티켓 행으로 구현하며, 요청자당 활성 초안을 하나만 유지합니다.

첨부파일은 준비 API를 거친 뒤 티켓에 첨부 정보를 저장하도록 바뀌었습니다.

```txt
browser file input
-> prepare API
-> prepared metadata
-> ticket command
```

현재 데모는 첨부 정보와 지정된 데모 URL을 저장할 수 있습니다. 운영 환경용
객체 저장소에 실제 파일을 저장하는 기능은 제공하지 않습니다.

---

## Work Session

작업 시간은 누적 시간 하나로 관리하던 방식에서 작업 세션별 기록으로 발전했습니다.

현재 작업 세션에 기록하는 내용:

- 티켓 ID
- 작업자
- 시작·종료 시각 또는 입력한 소요 시간
- 기록된 작업 시간(분)
- 메모
- 다음 상태(선택)

현재 API는 목록 조회와 생성을 중심으로 제공합니다. 타이머·수정·삭제 API는 대응하는
Route Handler가 구현될 때까지 확장 지점으로만 남겨 둡니다.

---

## SLA 진화

현재 SLA 구현 범위는 다음으로 제한합니다.

현재 구현:

- 카테고리의 `defaultSlaDays`
- 완료 예정일
- 계획 수립에 사용하는 우선순위와 위험도
- 허용되는 액션 명령을 통한 조정

완전한 SLA 위반 감지, 시간 측정의 일시 정지·재개, 업무일 달력, 알림,
상위 담당자로의 이관은 향후 운영 환경용 기능이며 현재 구현 범위에 포함하지 않습니다.

---

## 핵심 교훈

### 운영 의도 보존

새 설계는 이전 시스템이 다루던 실제 운영 문제에 초점을 유지하면서 도메인을 더 명확하게 만듭니다.

### Workflow를 Text에 숨기지 않기

담당자 배정, 거절, 병합, 계획 변경은 각각의 실행 규칙을 가진 명령으로 표현합니다.

### Settings는 Behavior를 정의

Tenant, 카테고리, 승인, 배정 설정은 이후 티켓의 처리 방식을 결정합니다.

### History는 Change를 설명

이력은 무엇을, 왜, 누가, 언제 바꿨는지 설명해야 합니다.

### Current Docs와 Decision Logs의 역할 분리

현재 설계 문서는 실제 구현된 모델을 설명합니다. Decision Log는 결정 당시의
맥락과 이유를 보존합니다.

---

## 결과

현재 Service Desk 모듈이 보여주는 내용:

- 규칙에 따른 티켓 상태 전환
- REMOTE 초안 저장과 복구
- 첨부 정보 준비 절차
- Tenant별 설정
- 승인자 결정과 작업자 배정의 분리
- 명령 기반 액션
- 이벤트 단위 이력
- 요청자 수정 시 담당자 결정 정책
- 작업 세션 기록
- 현재 구현에서 제외한 운영 환경용 기능의 명확한 범위

요약:

```txt
request tracking screen
-> workflow-oriented Service Desk domain
-> implementation-aligned, traceable portfolio system
```

---

## 관련 문서

- [서비스 데스크 구현 전략](../05-development/service-desk-implementation-strategy.md)
- [티켓 운영 규칙](../03-domain/service-desk/ticket/reference/ticket-operation-rules.md)
- [서비스 데스크 설정](../03-domain/service-desk/settings.md)
- [티켓 시스템 개요](../03-domain/service-desk/ticket/ticket-system-overview.md)
- [티켓 생명주기](../03-domain/service-desk/ticket/ticket-lifecycle.md)
- [티켓 액션 모델](../03-domain/service-desk/ticket/ticket-action.md)
- [티켓 이력](../03-domain/service-desk/ticket/ticket-history.md)
- [티켓 작업 세션](../03-domain/service-desk/ticket/ticket-work-session.md)

---

## 요약

Service Desk는 요청 추적 화면에서 업무 흐름 중심의 도메인으로 발전했습니다.
현재 모델은 생명주기, 담당자 결정, 명령, 이력, 설정, 초안, 첨부파일, 작업 기록을
명시하고, 향후 운영 환경용 기반 기능과 현재 구현을 구분합니다.
