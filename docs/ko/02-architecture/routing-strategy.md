# Routing 전략

## 목표

페이지 이동 전략은 주요 업무 화면에 URL로 접근할 수 있게 합니다. LOCAL·REMOTE
실행 환경 선택은 API Route Handler에서 처리합니다.

현재 Service Desk 설계:

- 주요 티켓 업무는 페이지 라우트
- 하나의 작업과 짧은 폼은 다이얼로그
- LOCAL·REMOTE 선택과 처리 위임은 Route Handler
- 티켓 명령, 이력, 초안, 설정, 첨부 준비, 작업 세션은 리소스별 API 경로

---

## Page Routes

```txt
/service-desk
/service-desk/[ticketId]
/service-desk/insights
/settings/service-desk-settings
/settings/service-desk-settings/tenant
/settings/service-desk-settings/category
/settings/service-desk-settings/approval-step
/settings/service-desk-settings/assignment-rule
```

### `/service-desk`

티켓 목록과 검색의 시작 화면입니다.

책임:

- 검색 가능한 티켓 목록 표시
- 티켓 생성 화면 열기
- 티켓 상세로 이동
- 목록과 필터 상태 보존

### `/service-desk/[ticketId]`

티켓 상세 페이지입니다.

책임:

- 현재 티켓 DTO 표시
- 승인 단계의 승인자와 작업 단계의 작업자를 구분해 표시
- 실행 가능한 액션 제공
- 이력과 작업 기록 표시
- 허용되는 수정·액션 다이얼로그 열기

티켓 상세 업무는 페이지에서 처리하며 모달 라우트로 제공하지 않습니다.

### `/service-desk/insights`

Service Desk 전용 분석 페이지입니다. 티켓 검색 조건, 분석 카드, 차트와 분석 근거가
되는 티켓 결과를 함께 제공합니다. 상세 보고 기능을 이 페이지로 분리해 메인 티켓
목록의 정보 밀도를 낮춥니다.

### `/settings/service-desk-settings/*`

Service Desk 설정은 시작 페이지와 Tenant, Category, Approval Step, Assignment
Rule별 페이지로 구성하며, 각 페이지에 URL로 직접 접근할 수 있습니다. 페이지의
접근 검사는 이동 경험을 개선하고, 대응하는 API 라우트는 서버에서 권한을 확인합니다.

---

## Page, Drawer, Dialog Policy

```txt
Page   -> primary workflow
Drawer -> secondary reading or side panel
Dialog -> atomic action or short form
```

복잡한 티켓 상세 내용을 여러 겹의 모달 안에 숨기지 않습니다.

---

## API Route Handler Boundary

Route Handler는 요청을 파싱하고 세션과 실행 환경을 확인한 뒤 실제 처리를 위임합니다.

```txt
route.ts
-> parse request
-> resolve session/runtime
-> settings operation이면 getUserAccessLevel(request) >= ADMIN 확인
-> 해당 server authorization policy 적용
-> delegate to LOCAL handler or REMOTE service
-> return DTO response
```

Route Handler는 도메인 규칙이나 DB 행 변환을 직접 구현하지 않습니다. 저장된
리소스의 관계와 범위를 확인하는 도메인 정책 및 서버 서비스를 호출합니다.

### Service Desk Settings Authorization

설정 라우트는 LOCAL·REMOTE로 분기하기 전에 조회와 변경에 같은 권한 정책을 적용합니다.

```txt
authenticated JWT access level >= ADMIN (9)
-> effective username
-> canonical AppUser permission / userScope / companyId
-> target Category -> Tenant -> Company context
-> manage / read / none
-> LOCAL or REMOTE operation
```

라우트 진입 권한과 현재 사용자의 리소스별 권한은 별도로 확인합니다. Impersonation
중에도 JWT의 접근 수준으로 설정 작업 진입을 검사하고, 서버에서 확인한 현재 사용자의
정보로 Tenant와 리소스별 권한을 결정합니다.

목록·조회 라우트는 권한이 `none`인 리소스를 제외합니다. 변경 라우트는 `manage`를
요구하고 저장된 카테고리·Tenant 관계를 다시 조회합니다. 읽기 전용 사용자나 허용
범위 밖의 사용자에게는 `403`을 반환합니다. 요청의 `tenantId`, `companyId`, scope,
관리자 유형은 처리 대상을 지정하는 입력이며 권한을 입증하는 정보가 아닙니다.

설정 UI는 권한 없이 페이지에 직접 접근한 사용자를 Settings Home으로 이동시킬 수
있습니다. API 라우트는 인증 정보가 없으면 `401`, 인증됐지만 필요한 권한이 없으면
`403`을 반환합니다. API에서는 페이지 이동을 사용하지 않습니다.

수행자 후보 조회 API를 제공하는 경우 카테고리와 조회 목적을 기준으로 후보를 제한해야
합니다. 설정 권한과 승인자·작업자의 회사 범위를 함께 적용하며 전체 사용자 목록을
반환하지 않습니다.

---

## 현재 Service Desk API Surface

```txt
/api/service-desk/tickets
/api/service-desk/tickets/search
/api/service-desk/tickets/draft
/api/service-desk/tickets/draft/[ticketId]
/api/service-desk/tickets/[ticketId]
/api/service-desk/tickets/[ticketId]/actions
/api/service-desk/tickets/[ticketId]/actions/[actionNo]
/api/service-desk/tickets/[ticketId]/command/start-work
/api/service-desk/tickets/[ticketId]/command/[action]
/api/service-desk/tickets/[ticketId]/histories
/api/service-desk/tickets/[ticketId]/work-session
/api/service-desk/tickets/attachments/prepare
/api/service-desk/cron/tickets/close-expired-resolved
/api/service-desk/tenants
/api/service-desk/tenants/[id]
/api/service-desk/categories
/api/service-desk/categories/[categoryId]/context
/api/service-desk/approval-steps
/api/service-desk/assignment-rules
/api/service-desk/assignment-rules/recommendations
```

작업 세션 수정·삭제·타이머 라우트는 Route Handler가 구현되기 전까지 완료된 API로
문서화하지 않습니다.

자동 종료 유지보수 라우트는 POST와 GET 별칭을 허용하며, 둘 다
`SERVICE_DESK_CRON_SECRET` 또는 `CRON_SECRET`으로 보호합니다. 이 GET Handler는
시스템 명령을 실행하지만 일반 티켓·하위 리소스 GET은 읽기 전용입니다.
REMOTE에서는 DB의 Supabase Cron(`0 * * * *`)이
`service_desk.close_expired_resolved_tickets()`를 매시간 정각에 직접 호출합니다. 배포와 예약 호출은
검증되었습니다. 실행 경계와 검증 근거는
[스케줄링 결정](../06-decisions/2026-09-resolved-auto-close-scheduling.md)을 참고하세요.

---

## Command Routes

티켓 업무 처리는 명령 형태의 API 경로로 제공합니다.

```txt
/api/service-desk/tickets/[ticketId]/command/start-work
/api/service-desk/tickets/[ticketId]/command/[action]
```

Dynamic action segment:

```txt
approve
decline
comment
note
assign
assignSelf
adjust
reject
merge
reopen
resubmit
cancel
```

명령 라우트는 액션 규칙과 실행 서비스에 처리를 맡깁니다.

---

## Draft Routes

초안 라우트는 티켓 생성 흐름을 지원합니다.

```txt
/api/service-desk/tickets/draft
/api/service-desk/tickets/draft/[ticketId]
```

이 경로들은 REMOTE 초안 동작을 소유합니다. 생성 다이얼로그는 REMOTE 초안을
컴포넌트 로컬 상태로 취급하지 않고 PostgreSQL 기반 초안 행에 이 API를 사용합니다.

LOCAL 초안 복구는 이 경로를 거치지 않습니다. 기능 초안 저장소가 현재 데모 사용자
범위의 브라우저 `localStorage`를 읽고 쓰며, React Query는 저장소 결과를 조정하고
캐시하는 역할만 합니다.

---

## Attachment Prepare Route

첨부 준비는 별도 라우트로 제공합니다.

```txt
POST /api/service-desk/tickets/attachments/prepare
```

티켓 생성·수정과 첨부를 지원하는 액션에서는 티켓 명령 데이터를 제출하기 전에
준비 라우트를 호출합니다.

---

## Work Session Route

현재 구현된 라우트:

```txt
GET  /api/service-desk/tickets/[ticketId]/work-session
POST /api/service-desk/tickets/[ticketId]/work-session
```

목록 조회와 생성을 지원합니다. 추가 라우트는 구현 후 문서화합니다.

---

## Query Parameters

쿼리 매개변수는 공유와 탐색에 도움이 되는 목록·검색 상태에 사용합니다.

예시:

- 필터
- 정렬
- 페이지네이션
- 보기 탭

복잡한 검색 조건은 전용 검색 API로 제출할 수 있습니다.

현재 Service Desk 티켓 검색과 Insights 페이지는 필터, 정렬, 페이지네이션, 보기
상태를 `sessionStorage`에 저장하며 쿼리 매개변수와 동기화하지 않습니다.

---

## LOCAL/REMOTE Runtime

페이지 라우트와 기능 컴포넌트는 저장 방식의 세부 사항에 직접 의존하지 않습니다.

```txt
page/component
-> feature hook/client
-> API route handler
-> LOCAL or REMOTE implementation
```

---

## 관련 문서

- [데이터베이스 전략](database-strategy.md)
- [티켓 시스템 개요](../03-domain/service-desk/ticket/ticket-system-overview.md)
- [티켓 생명주기](../03-domain/service-desk/ticket/ticket-lifecycle.md)
- [다이얼로그 패턴](../04-client-engineering/ui/dialog-pattern.md)
- [티켓 폼 설계](../04-client-engineering/forms/ticket-form.md)
- [서비스 데스크 구현 전략](../05-development/service-desk-implementation-strategy.md)

---

## 요약

Service Desk 목록, 상세, Insights, 설정 화면은 페이지 라우트로 제공합니다.
개별 작업은 다이얼로그와 명령 API로 처리하고, LOCAL·REMOTE 선택과 처리 위임은
Route Handler가 담당합니다. 문서의 API 목록은 실제 라우트 파일과 일치해야 합니다.
설정 라우트는 먼저 JWT의 ADMIN 진입 권한을 확인하고, 서버에서 확인한 현재 사용자와
카테고리 범위에 따른 권한을 판단한 뒤 실행 환경을 선택합니다.
