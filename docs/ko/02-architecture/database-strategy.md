# Database 전략

## 목표

데이터베이스 전략은 `sunghwan-portal`의 서버 코드가 DB에 저장된 데이터에 접근하는
방식과 UI에 제공하는 응답 형식을 정의합니다.

현재 Service Desk 구현 방향:

```txt
server-only database access
+ role-separated connections
+ row / mapper / DTO boundaries
+ service-owned workflow rules
```

UI는 테이블에 직접 접근하지 않습니다. 기능별 클라이언트가 애플리케이션 API를
호출하고, 서버 서비스가 행 조회, 데이터 변환, 검증, 저장을 처리합니다.

---

## Runtime Flow

```txt
UI
-> feature API client
-> Next.js route handler
-> server service
-> repository
-> query client
-> PostgreSQL
```

Route Handler는 HTTP 요청을 받아 실제 처리를 서버 서비스에 맡깁니다.
SQL 실행과 DB 행을 응답 데이터로 변환하는 로직은 포함하지 않습니다.

---

## Role Separation

데이터베이스 접근 권한은 담당 역할에 따라 분리합니다.

```txt
auth_api     -> authentication-only database access
portal_api   -> application data access
service_role -> normal application flow에서 사용하지 않음
```

### `auth_api`

로그인과 인증에 필요한 데이터 접근에 사용합니다.

예시:

- 로그인 자격 증명 검증
- 활성 인증 계정 조회
- 로그인 관련 정보 갱신

### `portal_api`

인증 후 애플리케이션 데이터 접근에 사용합니다.

예시:

- 사용자 프로필 조회
- Service Desk 티켓 조회·변경
- Service Desk 설정 조회·변경
- 저장소 함수와 서비스를 통한 업무 처리

### `service_role`

`service_role`은 일반 애플리케이션 처리에 사용하지 않으며 관리·플랫폼 작업을
위한 권한으로 취급합니다.

---

## Row / Mapper / DTO Boundary

DB 행과 애플리케이션 DTO(API로 전달하는 데이터)는 역할이 다릅니다.

```txt
Database Row
-> Mapper
-> Application DTO
```

| Layer | 책임 |
| --- | --- |
| Row | SQL에서 사용하는 행 형식. 보통 `snake_case` 사용 |
| Mapper | 이름 변환, null 값과 과거 값 보정, DTO 구성 |
| DTO | 기능 코드가 사용하는 API 응답 형식 |
| Repository | 매개변수화한 SQL 실행과 저장 처리 |
| Service | 업무 규칙 적용과 처리 순서 조정 |

UI는 `snake_case` 행 필드명이나 DB에서만 사용하는 열에 의존하지 않습니다.

---

## Service Desk Schema Boundary

Service Desk 데이터 접근 코드는 `src/server/data/serviceDesk`에 있습니다.

중요 영역:

- settings: Tenant, 카테고리, 승인 단계, 배정 규칙
- ticket: 생성·검색·상세·수정·업무 처리 서비스
- ticket draft: 요청자의 활성 초안 처리
- ticket action: 명령 규칙과 실행
- ticket history: 이벤트 단위 변경 이력
- work session: 작업 기록

애플리케이션에서 사용하는 도메인 타입은 `src/domain/serviceDesk`에 둡니다.

---

## Ticket Persistence

티켓 행에는 현재 업무 상태와 담당자 결정에 필요한 정보를 저장합니다.

현재 status:

```ts
type TicketStatus =
  | "Draft"
  | "Approval"
  | "Declined"
  | "Assigned"
  | "Working"
  | "Pending"
  | "Rejected"
  | "Resolved"
  | "Closed";
```

Mapper는 호환성을 위해 과거 행의 값을 보정할 수 있지만, 현재 설계와 DTO는
위에 정의한 상태값만 사용합니다.

주요 저장 규칙:

- REMOTE 초안은 `Draft` 상태의 티켓 행입니다.
- 제출된 티켓은 `Approval` 또는 `Assigned`로 이동합니다.
- 현재 승인자·작업자 결정에는 티켓의 배정 필드를 사용합니다.
- `tk_approval_step_id`는 해당하는 경우 현재 승인 단계를 나타냅니다.
- `tk_assignee_usernames`는 현재 담당자들의 username을 나타냅니다.
- 첨부 필드에는 원본 파일 대신 준비 API가 반환한 첨부 정보를 저장합니다.

---

## Routing Persistence

승인자 결정과 작업자 배정은 현재 단계를 구분해 처리합니다.

```ts
type TicketAssignmentPhase = "APPROVAL" | "WORK";
```

DB 행에는 현재 담당자 결정에 필요한 최소 정보를 저장합니다. Mapper는 이 정보와
현재 단계를 바탕으로 다음 DTO 필드를 계산해 제공합니다.

- `assignmentPhase`
- `approvalAssigneeUsernames`
- `workAssigneeUsernames`
- `assignedApprover`
- `assignedWorker`

상태 전환에 필요한 경우 승인 단계와 배정 규칙 설정으로 티켓의 담당자를 결정합니다.
설정을 바꿨다고 기존 티켓의 담당자 정보나 이력을 자동으로 다시 쓰지는 않습니다.

REMOTE에서는 저장소 함수가 사용하는 다음 Service Desk DB 함수에 승인자와
작업자 결정을 맡깁니다:
`service_desk.get_next_approval_step`,
`service_desk.get_approval_step_assignee_usernames`,
`service_desk.get_category_assignment_usernames`. 설계 규칙에 따라 승인 단계는
선택한 카테고리의 상위·메인 카테고리에서 결정합니다. 배정 규칙은 선택한 서브카테고리의
설정을 우선 적용하고, 없으면 상위·메인 카테고리의 설정을 사용합니다.

---

## Draft Persistence

REMOTE 초안은 DB의 티켓 행에 저장합니다.

규칙:

- 요청자당 활성 초안 하나
- 티켓 생성 시 활성 초안 행 재사용 가능
- 초안 버리기 시 활성 초안 제거
- 초안에는 폼 복구에 필요한 데이터 저장
- 원본 파일과 영구 저장된 첨부파일의 복구는 보장하지 않음

---

## Attachment Persistence

현재 DB에는 첨부파일의 바이너리 데이터를 저장하지 않습니다.

```txt
browser File[] / inline data images
-> Attachment Prepare API
-> prepared metadata
-> ticket row files/images fields
```

Prepared metadata 예시:

- `originalName`
- `replacedName`
- `extension`
- `size`
- `type`
- `demoUrl`
- `replaced`
- `reason`

향후 객체 저장소를 도입하면 객체 키나 서명된 URL을 사용할 수 있습니다. 현재는
지정된 데모 파일의 첨부 정보만 저장합니다.

---

## History Persistence

티켓 이력은 이벤트 단위로 기록합니다.

현재 모델:

- history `type`
- history `source`
- history `event`
- 변경 전후 값
- 수행자와 발생 시각

무엇이 일어났는지를 분류하는 기준은 `event`입니다. `tkh_history_action`이나
`metadata.event`를 현재 이벤트 모델의 기준으로 사용하지 않습니다.

명령이나 서비스 처리가 성공하면 다음 작업의 이력 행을 작성합니다.

- 티켓 제출
- 요청자 수정
- 승인자 결정과 작업자 배정
- 티켓 액션 실행
- 작업 세션 생성
- 해결 후 기한이 지난 티켓 자동 종료

---

## Settings Persistence

Service Desk Settings도 row/mapper/DTO rule을 따릅니다.

현재 settings:

- `Tenant`
- `MainCategory`
- `SubCategory`
- `ApprovalStep`
- `AssignmentRule`

Tenant는 Service Desk의 조직과 업무 설정을 구분하는 단위이며, 하나의 관리 권한을
뜻하지 않습니다. 카테고리, 승인 단계, 배정 규칙은 Tenant 범위에서 평가하지만,
실제 `manage`, `read`, `none` 권한은 애플리케이션의 권한 정책이 결정합니다.
이 정책은 Owner Tenant·고객 Tenant, 카테고리의 `INTERNAL`·`PORTAL` 범위,
대상 리소스를 함께 확인합니다.

Approval Step과 Assignment Rule은 별도의 권한 판단 데이터를 중복 저장하지
않고, 저장된 관계로 Tenant와 회사 정보를 확인합니다.

```txt
Approval Step / Assignment Rule
-> Category
-> Tenant
-> Company
```

DTO는 업무 처리에 필요한 Tenant 정보를 계산해 제공할 수 있습니다. 다만 클라이언트에
표시된 값을 권한 판단의 기준으로 삼지는 않습니다. 저장소의 조회·변경 함수는 권한
확인 전에 저장된 관계를 조인하거나 다시 조회합니다.

카테고리의 Tenant와 메인 카테고리의 범위는 생성 후 변경할 수 없습니다. 서브카테고리도
Tenant나 범위가 다른 상위 카테고리로 옮길 수 없습니다. 가능한 경우 서비스 검증과
함께 저장소와 DB 제약 조건으로도 이 규칙을 강제해야 합니다. 카테고리는 비활성화하는
방식으로 제거하여 기존 티켓과 이력의 참조를 보존합니다.

일반 설정 변경은 이후 담당자 결정에 영향을 주며 기존 티켓의 상태와 담당자 정보는
유지합니다. 관리자가 확인한 승인 단계 강제 적용은 예외입니다. 설정 검증·저장,
영향받는 `Approval` 티켓의 최초 담당자 결정 재시작,
`APPROVAL_CONFIGURATION_CHANGED`를 reason으로 하는 `ROUTING_RESET` 추가를
하나의 원자적 작업으로 처리합니다. 기존 이력은 다시 쓰지 않습니다.

---

## Query Clients and Environment

Database URL과 privileged credential은 server-only입니다.

| Variable | Purpose | Exposure |
| --- | --- | --- |
| `AUTH_DATABASE_URL` | auth data direct PostgreSQL connection | server-only |
| `PORTAL_DATABASE_URL` | portal data direct PostgreSQL connection | server-only |
| `NEXTAUTH_URL` | auth runtime URL | environment |
| `NEXTAUTH_SECRET` | auth signing secret | secret |
| public Supabase values | public infrastructure reference | public |

규칙:

```txt
편의가 아니라 책임을 기준으로 query client를 선택한다.
```

Auth repository는 auth 접근 권한을, portal feature repository는 portal application
접근 권한을 사용합니다.

---

## RLS and Grants

실제 DB 접근 권한은 객체별 권한 부여(grant)와 행 단위 보안(RLS) 정책의 조합으로
결정합니다. RLS는 접근할 수 있는 행을 제한합니다.

```txt
effective permission = object grants + RLS policies
```

App-facing table/view는 다음을 점검해야 합니다.

- schema usage grants
- table/view/function grants
- RLS policy coverage
- least-privilege role behavior

RLS 정책이 없으면 애플리케이션 역할로 실행한 쿼리가 정상이어도 행을 반환하지 않을
수 있어 애플리케이션 오류처럼 보일 수 있습니다.

REMOTE draft discard는 active `Draft` row를 물리적으로 삭제합니다. `portal_api`
role에는 DELETE 권한과 DELETE RLS policy가 모두 필요하며, SELECT/INSERT/UPDATE
권한만으로는 충분하지 않습니다. Database를 구성할 때 table owner로 다음을 한 번
적용합니다.

```sql
BEGIN;
GRANT DELETE ON TABLE service_desk.ticket TO portal_api;
CREATE POLICY "portal_api can delete active draft"
ON service_desk.ticket
FOR DELETE TO portal_api
USING (tk_status = 'Draft' AND tk_active = true);
COMMIT;
```

저장소는 인증된 요청자와 티켓 ID도 함께 확인합니다. 이 정책은 제출된 티켓의
삭제를 허용하지 않습니다. 일반적인 티켓 취소는 기존 업무 흐름을 사용합니다.

Service Desk 설정의 RLS·grant와 DB 함수는 Tenant 관계를 추가로 보호합니다.
특히 고객 `PORTAL`에서는 카테고리, 승인, 배정의 관리 주체가 서로 다릅니다.
따라서 이 DB 보호 장치로 리소스별 Owner Admin·Tenant Admin 권한 매트릭스를
대체해서는 안 됩니다.

---

## Transaction Policy

여러 레코드를 함께 변경하는 업무 명령은 트랜잭션을 고려해야 합니다. 관련 변경을
묶어 처리하여 일부만 저장되는 일을 막아야 합니다.

예시:

- submit ticket and write history
- reset routing and write routing history
- execute action and write action/history/status changes
- close/cancel/reject/merge 시 running work session finish

서비스 계층은 하나의 업무 처리 범위를 정하고, 저장소는 개별 SQL 작업을 담당합니다.

---

## LOCAL and REMOTE Relationship

LOCAL은 서버에서 변경 가능한 데모 상태를 사용할 수 있습니다. REMOTE는 DB 접근
계층을 사용합니다.

저장 방식이 달라도 두 모드는 UI에서 같은 방식으로 사용할 수 있는 응답 형식을
제공해야 합니다.

```txt
LOCAL state shape or REMOTE row shape
-> mapper/handler
-> application DTO
-> feature UI
```

---

## Deferred Scope

다음 항목은 현재 DB 구현이나 문서에서 모두 완성된 상태로 제공하지 않습니다.

- 첨부 바이너리의 영구 저장
- 모든 테이블의 RLS 정책 목록
- 모든 스키마 변경에 대한 마이그레이션·버전 관리 가이드
- 전체 설정 버전 발행
- 완전한 감사 내보내기·규정 준수 기반 기능
- 운영 환경용 알림 데이터 저장
- 완전한 SLA 위반·상위 담당자 이관 데이터 저장

---

## 관련 문서

- [서비스 데스크 설정](../03-domain/service-desk/settings.md)
- [티켓 모델](../03-domain/service-desk/ticket/ticket-model.md)
- [티켓 이력](../03-domain/service-desk/ticket/ticket-history.md)
- [티켓 작업 세션](../03-domain/service-desk/ticket/ticket-work-session.md)
- [티켓 첨부파일 설계](../04-client-engineering/forms/ticket-attachment.md)
- [서비스 데스크 구현 전략](../05-development/service-desk-implementation-strategy.md)

---

## 요약

DB 데이터에는 서버에서만 역할별 권한으로 접근하며 UI에는 일정한 DTO 형식으로
전달합니다. Service Desk의 주요 저장·처리 범위는 티켓 행, `Draft` 티켓으로 저장하는
REMOTE 초안, 준비된 첨부 정보, 이벤트 단위 이력, 승인·작업 단계를 구분하는 배정
필드, Tenant별 설정, 트랜잭션을 고려한 업무 서비스입니다.
