# 설계 결정

이 폴더는 프로젝트의 주요 설계 결정과 논의 기록을 보관합니다. 파일명의
`YYYY-MM`은 해당 결정이 논의되거나 기록된 시점을 나타냅니다.

현재 적용 중인 설계는 아키텍처와 도메인 문서에서 확인할 수 있습니다.
Decision 문서는 현재 설계를 선택한 배경과 검토한 대안을 추적하기 위한 기록입니다.

과거 기록에는 이후 바뀐 이름, 채택하지 않은 대안, 당시 구현을 미룬 기능이 포함될 수 있습니다.
최종 포트폴리오 범위는 [정규 명세](../../spec/ticket-system.ko.md)와
[현재 문서 인덱스](../README.md)를 기준으로 확인하세요.
결정의 채택만으로 배포가 검증되는 것은 아닙니다.

## 결정 인덱스

### 2026-09

- [Vitest Coverage Strategy (2026-09)](./2026-09-vitest-coverage-strategy.md)
- [Storybook Coverage 전략 (2026-09)](./2026-09-storybook-coverage-strategy.md)
- [Resolved 자동 종료 스케줄링 (2026-09)](./2026-09-resolved-auto-close-scheduling.md)
- [Draft 저장의 최소 조건과 불완전한 내용 허용 (2026-09)](./2026-09-draft-persistence-minimum-and-partial-content.md)

### 2026-08

- [Settings 변경 및 진행 중 Ticket 정책 (2026-08)](./2026-08-settings-change-and-in-flight-ticket-policy.md)
- [Category 활성화 및 Routing 준비 상태 (2026-08)](./2026-08-category-activation-and-routing-readiness.md)
- [Boolean Capability API 명명 (2026-08)](./2026-08-boolean-capability-api-naming.md)

### 2026-07

- [티켓 Routing 및 Update 정책 (2026-07)](./2026-07-ticket-routing-and-update-policy.md)
- [Ticket Merge 및 Escalation 정책 (2026-07)](./2026-07-ticket-merge-and-escalation-policy.md)
- [티켓 Action 및 History 실행 (2026-07)](./2026-07-ticket-action-and-history-execution.md)
- [서비스 데스크 설정 기준 데이터 검증 경계 (2026-07)](./2026-07-service-desk-settings-reference-validation-boundary.md)
- [Next.js 16 마이그레이션 전략 (2026-07)](./2026-07-nextjs-16-migration-strategy.md)

### 2026-06

- [티켓 Form 및 Draft Workflow (2026-06)](./2026-06-ticket-form-and-draft-workflow.md)
- [티켓 첨부파일 경계 (2026-06)](./2026-06-ticket-attachment-boundary.md)
- [Service Desk Tenant 설계 (2026-06)](./2026-06-service-desk-tenant-design.md)
- [Service Desk Settings DTO/API Boundary (2026-06)](./2026-06-service-desk-settings-dto-api-boundary.md)

### 2026-05

- [Service Desk 문서 정합성 정렬 (2026-05)](./2026-05-service-desk-documentation-alignment.md)
- [데이터베이스 역할 및 접근 전략 (2026-05)](./2026-05-database-role-and-access-strategy.md)
- [Barrel Export Boundary Policy (2026-05)](./2026-05-barrel-export-boundary.md)

### 2026-04

- [Ticket Action Model Introduction (2026-04)](./2026-04-ticket-action.md)
- [엔티티 상태 네이밍 결정 (2026-04)](./2026-04-entity-status-naming.md)

### 2026-03

- [티켓 세션 및 시간 추적 결정사항 (2026-03)](./2026-03-ticket-session.md)
- [Ticket Form Dialog Decisions (2026-03)](./2026-03-ticket-form-dialog.md)
- [Service Desk Decision Log (2026-03)](./2026-03-service-desk.md)

### 2026-02

- [Service Desk Settings (2026-02)](./2026-02-service-desk-settings.md)

### 2026-01

- [Session User 경계 (2026-01)](./2026-01-session-user-boundary.md)
- [Impersonation (서버 세션 접근 방식) (2026-01)](./2026-01-impersonation.md)
- [Category 설계 결정 (2026-01)](./2026-01-category-design.md)

### 2025-12

- [System Layout (2025-12)](./2025-12-system-layout.md)
- [2025-12 Naming Decision](./2025-12-naming.md)
- [Impersonation (로컬 세션 스토리지 접근 방식) (2025-12)](./2025-12-impersonation.md)
- [Auth & Session Architecture (2025-12)](./2025-12-auth-session-architecture.md)
