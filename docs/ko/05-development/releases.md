# 프로덕션 릴리스

## 목적

이 문서는 포털 사용자와 검토자가 이용하는 프로덕션 브랜치인 `main`에 병합된
변경 사항을 기록합니다.

Pull Request가 `main`에 적용된 후에만 이 문서에 릴리스로 기록합니다. 각 항목에는
Pull Request의 구현 세부 사항, 배포 체크리스트 또는 스크린샷을 그대로 복사하지
않고 프로덕션에 반영된 결과를 이 문서만으로 이해할 수 있도록 요약합니다. 추적할 수 있도록 병합된 PR
제목은 유지하지만, 이 문서는 별도의 PR 설명 파일에 의존하지 않습니다.

---

## 릴리스 이력

### 2026-10-04 — v1.1.1 문서 명확화 및 standalone 빌드 유지보수

fix(build, docs): restore standalone output and publish v1.1.1

- 영어와 한국어 README, 명세, 설계 문서, 릴리스 기록과 과거 Decision Log의
  설명과 가독성을 개선했습니다. 기술적 의미, 코드 예제, 링크와 당시 맥락은
  보존했습니다.
- 아키텍처, 업무 흐름, 권한, LOCAL·REMOTE 저장 방식, 자동 종료 스케줄링과
  검증 한계를 명확히 설명했습니다. 현재 설계 문서와 과거 결정 기록의 구분은
  유지했습니다.
- 운영 환경을 고려한 설계이지만 실제 운영에 필요한 모든 기능을 구현한 상태는
  아니라는 포트폴리오 기준에 맞춰 표현을 조정했습니다. 전체 SLA 자동화는 향후
  개발 약속이 아니라 현재 구현 범위 밖의 기능으로 설명했습니다.
- 권한이나 impersonation 동작을 바꾸지 않고, 세션·요청 처리 정보에서 원래
  사용자와 현재 사용자의 식별 정보를 추적하는 범위를 명확히 설명했습니다.
- `next`와 `eslint-config-next`를 `^16.3.8`로 업데이트하고 lockfile을 갱신했습니다.
  Vercel 전용 우회를 제거해 `output: "standalone"` 설정을 복원했습니다.
- 더 이상 필요하지 않은 `docs/db`와 `docs/main-pr`의 ignore 항목을 제거했습니다.
- 기능 범위를 완료한 `v1.1.0`을 유지하는 유지보수 업데이트로 `v1.1.1`을
  릴리스했습니다. Service Desk 기능, 데이터 모델, API 형식·규칙, 업무 흐름,
  DB 동작과 애플리케이션 레이아웃·라우트는 그대로 유지했습니다.

### 2026-09-29 — v1.1.0 workflow contract 강화 및 문서 정리 완료

fix(auth, service-desk, docs): publish v1.1.0 workflow contract hardening

- 서버에서 확인한 현재 사용자 정보(canonical effective principal)로 REMOTE 초안의 카테고리 접근을 검증하고,
  작업 세션 생성 전에 해당 티켓의 조회 권한을 요구했습니다. Impersonation 중에도
  현재 사용자 정보를 권한 판단의 기준으로 유지했습니다.
- LOCAL과 REMOTE의 참여 관계 기반 NOTE 접근을 일치시켰습니다. 현재 사용자가 Admin이면
  요청자여도 NOTE에 접근할 수 있지만, Admin이 아닌 요청자는 계속 제외합니다.
  티켓 조회 권한은 필수이며, Admin이 아닌 사용자로 impersonation할 때 원래 Admin의
  권한을 합산하지 않습니다. 읽기, 생성, 관련 이력과 작성자만 가능한 논리 삭제에
  같은 정책을 적용했습니다.
- 접근 수준 대신 요청자의 Job Field 상위 계층으로 MANAGER 승인 수준을 결정하고,
  설정 검증을 조직과 회사 범위에 맞췄습니다.
- 실제 과거 작업자와 승인자를 구분하고, 과거 작업 참여를 확인할 담당자 결정 초기화
  근거를 보존했습니다. 승인 단계 강제 적용의 트랜잭션 처리, `ROUTING_RESET`,
  현재 완료 예정일 계산, 자동 담당자 결정과 수동 `ASSIGN`의 서로 다른 검증 범위에
  업무 흐름 문서를 맞췄습니다.
- 권한에 민감한 캐시를 실행 환경과 현재 사용자별로 분리하고, 액션 논리 삭제 성공 후
  티켓 이력 캐시를 무효화했습니다. 공유 활동 요약에서는 NOTE 정보를 제외하면서
  권한이 있는 액션·이력 접근은 유지했습니다.
- 검증된 REMOTE auto-close와 시간별 Supabase Cron 실행(`0 * * * *`)을 문서화했습니다.
  가장 최근 해결 이력의 발생 시각에서 168시간이 경과하면 종료 대상이 되며,
  `Resolved -> Closed`, `Completed`, `SYSTEM_AUTO`와 `actionNo = null`을 사용하는
  `RESOLUTION_CLOSE` 기록을 유지합니다.
- 12개 Ticket Action의 로딩·성공·오류 토스트를 타입 안전한 공통 처리로 모으고,
  액션별 결과 메시지와 영어·한국어 번역 일치를 검증하는 회귀 테스트를 추가했습니다.
  Impersonation 회사 선택 목록은 여는 버튼 아래에 배치했습니다.
- 영어와 한국어 README, 명세, 아키텍처·도메인·개발 가이드를 최종 정리했습니다.
  참조 통합 문서를 갱신하고 두 언어의 자동 종료 스케줄링 결정을 문서 목록에
  추가했습니다. 과거 결정과 릴리스 표현은 보존하고 로컬 DB 백업 파일은 버전 관리에서
  제외했습니다.
- 포트폴리오 기능 범위를 완료한 `v1.1.0`을 릴리스했습니다. 수동 배정과 요청자·수신자
  검증 한계 및 Storybook 검증 한계는 명시적으로 유지합니다. 알림 전달, 완전한 SLA
  위반·상위 담당자 이관 처리, 운영 환경용 스케줄러 모니터링과 기업용 백그라운드 작업 실행 기반은
  운영 환경을 고려한 포트폴리오 범위에 포함하지 않습니다.

### 2026-09-21 — v1.0.2 안정성 강화 및 내비게이션 피드백 개선

fix(auth, service-desk, ui): publish v1.0.2 stability hardening

- 서버의 impersonation 검증과 신뢰할 수 있는 사용자 정보 처리를 강화했습니다.
  REMOTE 명령, 병합 대상, 액션 상세 조회·논리 삭제에 티켓 조회 권한 검증을
  일관되게 적용했습니다.
- REMOTE 티켓 변경과 번호 할당을 직렬화하고 잠금 획득 후 업무 조건을 다시
  검증했습니다. 충돌하는 LOCAL 수정을 거부해 배정, 수신자, 액션 번호 규칙을
  보호했습니다.
- LOCAL·REMOTE 초안 저장 규칙을 완성했습니다. 유효한 카테고리는 필수이며, REMOTE의
  `subject`·`content`는 `Draft` 상태에서만 null을 허용합니다. 최종 제출에는 완전한
  제목과 의미 있는 본문을 요구하고, 기존 초안 행을 재사용한 뒤 남은 초안 식별 정보를
  정리합니다.
- 초안 폐기 시 요청자 소유권 확인과 저장 실패 시 입력 보존을 유지했습니다.
  저장 전에 본문 이미지를 준비하고 임시 data/blob 주소를 거부했습니다. 제출된
  티켓의 삭제는 계속 비활성화하고, 취소 및 COMMENT·NOTE 논리 삭제는 기존 업무
  흐름을 유지했습니다.
- 최초 승인자 결정과 작업자 배정을 통합하고 이전 담당자 정보를 변경 불가능한
  이력에 보존했습니다. LOCAL 제출·담당자 결정 이력을 REMOTE와 일치시켰습니다.
  카테고리 검증 정보를 재사용하고 Assignment Rule 검증을 쓰기 트랜잭션 안에서
  수행하도록 했습니다.
- 업무 변경 후 검색 캐시 갱신과 날짜 단위 검색 범위를 수정해 새 티켓이 재조회
  이후에도 표시되도록 하고, 중복된 상세 재조회를 제거했습니다.
- 초안 불러오기·폐기 알림, 자동으로 닫히는 경고, 카테고리 경고 후 저장 없이 닫는
  동작을 개선했습니다. 중복 제출과 충돌하는 다이얼로그 작업을 막고 변경 요청의
  토스트 오류를 처리하면서 사용자 입력을 보존했습니다.
- 화면을 차단하던 라우트 로딩 오버레이를 지연 표시되는 비차단 상단 진행 표시로
  교체했습니다. Next.js Link가 수락한 이동의 추적과 타이머 정리를 개선했습니다.
  데이터 로딩은 계속 페이지·컴포넌트의 Skeleton에서 처리합니다.
- 회귀 테스트와 Storybook 검토 범위를 확장하고 번역과 설계 문서를 구현에 맞췄습니다.
  포트폴리오의 티켓 번호 한계를 문서화하고 데모 날짜를 갱신했습니다. 프로덕션
  기능 범위와 공개 DTO 형식을 유지하며 `v1.0.2`를 릴리스했습니다.

### 2026-09-12 — 안정성 보호 강화 및 Service Desk UX 개선

fix(service-desk, ui): strengthen stability and refine UX polish

- REMOTE에서 댓글과 내부 메모를 생성할 때 발생하던 티켓 조회 권한 검증 누락을
  해결하고, LOCAL 데모 초기화를 LOCAL 인증 모드의 인증된 요청으로
  제한했습니다.
- 변경된 작업 세션 상태도 초기화하도록 LOCAL 데모 초기화를 완성했습니다. 저장된
  서식 있는 본문에서 렌더링 전에 위험한 HTML을 제거하여 안전하지 않은 내용이 표시되지 않도록
  했습니다.
- 기존 애플리케이션과 업무 흐름 규칙을 유지하면서 호환 가능한 프로덕션 의존성
  보안 업데이트를 적용했습니다.
- 불필요한 마크업과 Tailwind 스타일 일부를 단순화하고, 동작 줄이기 설정을 고려한
  절제된 상호작용 전환 효과를 추가했습니다.
- 재조회 중 기존 데이터를 유지하면서 Service Desk 티켓 목록, 상세, 액션,
  이력, 수정 흐름의 최초 로딩 Skeleton 표시를 확장하고 개선했습니다.

### 2026-09-11 — 통합 Storybook 컴포넌트 coverage

feat(storybook): replace demo playground with integrated component coverage

- 애플리케이션 내부 컴포넌트 데모를 재사용 커스텀 컴포넌트와 공개 입력·동작을
  확인하는 프로젝트별 Storybook 예제로 교체했습니다.
- 대표 상태, Controls, controlled Canvas 예시, 선택적인 `play` interaction 및 전역
  언어와 라이트·다크 테마 전환을 추가했습니다.
- 인증이 필요한 `/storybook` 라우트와 Next.js·Storybook을 함께 실행하는 로컬 개발
  환경을 추가했습니다. 프로덕션 빌드와 내비게이션에 정적 Storybook 출력을 포함했습니다.
- 기존과 동등한 검토 범위를 확인한 후 불필요한 데모 라우트를 제거하고 관련 페이지
  이동, 테스트용 데이터, 다국어 문구, 메뉴 리소스를 재구성했습니다.
- 기존 InputGroup 기본 컴포넌트로 접근성을 갖춘 재사용 비밀번호 표시 입력을 추가하고
  로그인 폼에 통합했습니다.
- 비밀번호 표시 동작을 영어, 한국어, 프랑스어, 스페인어로 번역하고 Storybook 문구의
  담당 namespace를 새 구조에 맞췄습니다.
- 영어와 한국어 Storybook 검토 범위 결정 기록을 공개하고 테스트, 페이지 이동, 상태,
  인증, README, 개발 문서를 갱신했습니다.
- 업무 흐름과 애플리케이션 동작 테스트는 계속 Vitest가 담당하도록 유지했습니다.
  Testing Library `act`와 상대적인 완료 예정일을 사용해 티켓 수정 테스트를 안정화했습니다.

### 2026-09-07 — 포털 localization coverage 완성

fix(i18n): complete locale coverage across the portal

- 지원 언어의 문서 페이지, Service Desk 업무 흐름, API 오류, 공통 동작, 토스트
  메시지에 누락된 번역을 추가했습니다.
- 사용자 화면에 대체 문구나 번역되지 않은 키가 표시될 수 있던 번역 키 경로와
  namespace 불일치를 수정했습니다.
- 의도적으로 사용하는 영문 기술 용어는 유지하면서 현재 프로젝트 용어에 맞게
  한국어 document title과 description을 다듬었습니다.
- 긴 다국어 레이블이 불필요하게 잘리거나 줄 바꿈되지 않도록 문서 메뉴의 너비를
  확장했습니다.
- Service Desk 업무 동작, 권한 정책, API 형식을 유지하면서 다국어 처리 긴급 수정을
  완료했습니다.

### 2026-09-07 — 위험 기반 회귀 테스트 범위와 workflow 보호 강화

test(vitest): strengthen regression coverage and workflow safeguards

- Vitest 테스트 모음을 복구하고 현대화했습니다. 도메인 규칙, 인증, 권한,
  Service Desk 업무 흐름, 서버 서비스, Route Handler, 클라이언트 상태, 보호된
  페이지 전반으로 위험 기반 회귀 테스트 범위를 확장했습니다.
- LOCAL·REMOTE 처리를 선택하기 전에 신뢰할 수 있는 세션 사용자 정보, Tenant·범위
  권한, impersonation 보호를 강화했습니다. 검증이 실패하면 접근을 거부하도록 했습니다.
- 트랜잭션 실패와 변경 불가능한 감사 기록을 포함해 티켓 생명주기, 액션, 승인,
  배정, 병합, 초안, 이력, 작업 세션, 설정 처리의 기대 동작을 보호했습니다.
- LOCAL·REMOTE의 공통 동작과 독립적으로 구현된 App·서버 실행 환경의 담당 범위를
  확인하는 공통 규칙 테스트를 추가했습니다.
- 담당자 값 보정, 설정 검증 정보, 세션 저장소의 상태 유지, 환경 설정 동기화,
  로그아웃 이동, 비동기 정리에서 발견한 회귀 문제를 수정했습니다.
- 영문 및 한국어 테스트 전략과 Vitest coverage 결정 기록을 공개하고, 다국어
  Documents Hub 내비게이션을 업데이트했으며 한국어 기술 문서의 문체를
  다듬었습니다.
- 불필요해진 REMOTE 라우트 접근 검사와 사용 중단된 호환 API를 제거하고,
  ESLint의 사용 중단 API 검사를 활성화했으며 애플리케이션 버전을 `0.9.9`로
  릴리스했습니다.

### 2026-08-23 — Workflow 무결성과 impersonation 보호 강화

fix(service-desk, auth): strengthen workflow integrity and impersonation

- 인증된 세션의 범위를 유지하면서 CLIENT 로그인, impersonation 중 현재 사용자
  확인, 회사 범위의 직원 선택을 강화했습니다.
- 티켓 목록, 검색, 상세, 액션, 이력, 작업 세션, Service Desk 설정 전반에 Tenant,
  범위, 수행자, 개별 객체의 권한 검증을 일관되게 적용했습니다.
- 새 업무 흐름에는 카테고리 활성화 요건을 요구하고 상위 카테고리의 실제 사용 가능
  여부를 유지했습니다. 유효한 진행 중 업무를 중단하지 않으면서 설정 변경의 영향을
  받은 승인 담당자를 안전하게 다시 결정했습니다.
- PORTAL 작업자 자격, Assignment Rule의 대체 규칙 선택 동작, 카테고리 SLA 검증,
  LOCAL·REMOTE 설정의 의미를 일치시켰습니다. REMOTE 카테고리 트리 저장은 원자적으로
  처리했습니다.
- 티켓 이력 저장과 작업 세션 상태 처리를 수정하고 자동 종료를 Service Desk Cron
  처리 지점으로 옮겼습니다. 데모 날짜와 인증 테스트용 데이터를 갱신했습니다.
- Impersonation 선택, 반응형 티켓 내비게이션, 다국어 UI 결과 메시지, 테스트,
  스크립트와 구현에 맞는 문서를 개선했습니다.

### 2026-08-07 — 프런트엔드 현대화와 명확한 클라이언트 경계

refactor(frontend): complete Base UI migration and strengthen frontend boundaries

- 공유 UI 기본 컴포넌트를 Radix 기반 shadcn에서 현재의 Base UI 기반 구성으로
  마이그레이션했습니다.
- 새 컴포넌트의 입력과 동작에 맞춰 인증, 내비게이션, 환경 설정, Service Desk,
  설정, 티켓, Insights 및 데모 인터페이스를 업데이트했습니다.
- 로그인 경험, 반응형 포털 레이아웃, 설정 편집기, 계층형 선택기, 정렬 가능한 트리,
  첨부파일 화면 및 공유 데모를 개선했습니다.
- App Router 페이지의 책임을 단순화하고 라우트 조합, 데이터 처리 순서 조정,
  뷰 모델, 화면 표시, 서버 데이터 형식과 규칙의 역할을 명확히 했습니다.
- UI 기본 컴포넌트에는 표시·동작 상태를 유지하면서 `canEdit`, `canSubmit`,
  `canNavigate` 같은 긍정형 작업 가능 여부 API를 표준화했습니다.
- 프로덕션 구현, 업무 흐름 참조, 아키텍처 가이드가 같은 현재 시스템을 설명하도록
  다국어 처리와 문서 구조를 재구성했습니다.

### 2026-07-24 — Tenant 범위 workflow와 Next.js 16 플랫폼 기준선

feat(service-desk): enforce tenant-scoped workflows and migrate platform to Next.js 16

- Service Desk 설정, 티켓, Insights, 조직 참조, 액션, 병합, 이관 흐름 전반에
  Tenant, 회사, 운영 범위에 따른 접근 제한을 적용했습니다.
- 내부에서 포털로의 이관과 Tenant 기반 Insights 필터링을 포함해 `INTERNAL`·`PORTAL`
  범위를 구분하는 검색과 내비게이션을 추가했습니다.
- 설정, 승인자·작업자 선택, 직원 참조, impersonation, 티켓 작업의 서버 권한 검증을
  강화했습니다.
- 다국어 Tenant 기반 데모 시나리오를 확장하고 LOCAL·REMOTE가 같은 도메인 규칙과
  API 형식·기대 동작을 따르도록 맞췄습니다.
- Async Request API, proxy convention, Flat Config 및 Turbopack build를 포함해
  프로덕션 기준선을 Next.js 16, React 19, Node.js 24, npm 11 및 ESLint 9로
  업그레이드했습니다.
- 설치, 타입 검사, lint와 아키텍처 의존성 규칙, 프로덕션 빌드, 인증, 설정,
  핵심 티켓 조회 경로를 검증했습니다.

### 2026-07-14 — Ticket Action workflow와 audit control 완성

feat(service-desk): complete ticket action workflow and strengthen history and permission controls

- 배정, 자기 배정, 조정, 거절, 병합, 작업 재개, 재제출, 취소, 승인, 반려 액션의
  LOCAL·REMOTE 실행 경로를 완성했습니다.
- 두 실행 모드에서 액션 권한, 상태 전환, 작업자 결정, 쿼리 캐시 무효화,
  변경 불가능한 이력 생성을 일치시켰습니다.
- 이력의 event와 source를 명시적인 감사 필드로 분리하고, 화면 표시와 액션별 맥락은
  metadata에 유지했습니다.
- 현재 작업자와 이전 작업자 모두 작업 시간을 기록할 수 있게 했습니다. 상태 변경
  권한은 현재 작업자에게만 부여했습니다.
- 해결 후 기한이 지난 티켓을 반복 실행해도 같은 결과로 종료하는 멱등 자동 종료
  경로를 추가했습니다. Cron에서 호출할 수 있게 준비하고 작업 세션 정리와 생명주기를
  일관되게 처리했습니다.
- 현재 사용자 기준으로 프로덕션 동작을 수행하도록 impersonation 기반 내비게이션,
  프로필, 설정 접근 검사, 계산된 권한 값을 수정했습니다.

### 2026-07-08 — REMOTE 티켓 workflow와 action-history 통합

feat(service-desk): connect remote ticket workflow and refine action history model

- REMOTE 티켓 목록, 상세, 초안, 생성, 요청자 수정, 승인, 이력, 액션, 작업 세션의
  데이터 흐름을 연결했습니다.
- 서버에서 요청자·수행자·소유권을 검사하고 카테고리로 승인자와 작업자를 결정하는
  로직을 추가했습니다.
- 생성·수정 다이얼로그를 분리하고 계층형 카테고리 선택, 담당자 재결정 결과 메시지,
  초안에 맞는 폼 검증을 도입했습니다.
- 브라우저 원본 파일, blob URL, base64 본문, 클라이언트가 제어하는 바이너리를 저장하지
  않고 첨부 정보만 보존하는 준비 절차를 추가했습니다.
- 티켓 상세를 Tickets 메뉴 아래에 유지하면서 기존 내비게이션 바를 포털 메뉴 기반
  경로 표시(breadcrumb)로 교체했습니다.
- 서버 실행 경로가 완성될 때까지 지원하지 않는 REMOTE 액션을 비활성화했습니다.

### 2026-06-28 — 데모에서 최근 티켓 표시 복구

chore(service-desk): refresh ticket mock dates for demo visibility

- 대표 티켓이 기본 최근 3개월 필터에 표시되도록 티켓 시나리오 날짜를 앞으로
  이동했습니다.
- 티켓 식별자, 관계, 업무 시나리오, 필터 동작, DTO 형식, REMOTE 저장 방식의 가정은
  그대로 유지했습니다.

### 2026-06-20 — Impersonation 복구와 runtime indicator 명확화

fix(auth, ui): restore impersonation flow and clarify runtime state indicators

- 로그인 자격 증명 조회와 impersonation 대상 조회를 분리해 로그인 계정과 직원의
  username이 달라도 impersonation이 동작하도록 복구했습니다.
- 비밀번호 해시와 인증 username은 로그인 흐름 내부에서만 사용하도록 유지했습니다.
- 인증이 필요한 레이아웃에 데모, impersonation, 두 기능을 함께 사용하는 상태를
  나타내는 다국어 표시를 추가했습니다.

### 2026-06-18 — Service Desk 한국어 scenario 텍스트 복구

fix(service-desk): restore Korean mock scenario text

- Service Desk 데모 시나리오에 표시되던 손상된 한국어 문자열을 복구했습니다.
- 기존 시나리오 구조, 업무 의미, 라우트, UI, 저장 동작은 유지했습니다.

### 2026-06-17 — Vercel 프로덕션의 Documents Hub rendering 수정

fix(documents): include markdown docs in Vercel server bundle

- Documents 라우트가 사용하는 Vercel 서버 번들에 저장소의 Markdown 문서와 루트
  README를 포함했습니다.
- 서버의 Markdown 로딩, 문서 식별자, 경로, 페이지 구조는 유지하면서
  프로덕션 `ENOENT` 오류를 수정했습니다.

### 2026-06-16 — Service Desk 문서와 Hub navigation 정렬

docs(service-desk): publish documentation alignment and docs hub navigation

- Service Desk 문서를 Tenant별 설정, DTO·API 역할, LOCAL·REMOTE 담당 범위,
  현재 티켓 시스템 명세에 맞췄습니다.
- 빠르게 검토할 수 있도록 다국어 Documents Hub 메뉴를 추가하고 설계 결정 기록을
  연월별로 묶었습니다.
- 영어와 한국어 명세의 시작 문서를 갱신하고 REMOTE 데모에서 이용할 수 있는 페이지를
  명확히 했습니다.

### 2026-06-14 — Service Desk 설정 데이터 통합

feat(service-desk): publish settings data integration

- DB 기반 Tenant, Category, Approval Step, Assignment Rule 조회 모델을 연결하고
  각 설정 흐름을 완성했습니다.
- Tenant를 Service Desk 설정의 구분 단위로 도입하고 Tenant 설정, 회사 데이터,
  조직 참조, Tenant 재활성화를 추가했습니다.
- 저장, React Query 재조회, 페이지 새로고침, 데모 초기화 전반에서 LOCAL 설정의
  상태 유지를 안정화했습니다.
- LOCAL·REMOTE 처리 함수, 응답 형식, CRUD 동작, 식별자 명명, 작업 세션 용어를
  일치시켰습니다.
- 설정 작업 화면을 표준화하고 Tenant 설정에 재사용할 수 있는 색상 선택기를 추가했습니다.

### 2026-05-31 — 데이터베이스 기반 REMOTE 데모 foundation

feat(database): publish DB-backed remote demo and Service Desk polish

- LOCAL 데모를 유지하면서 Supabase 기반 인증, 사용자 프로필, 환경 설정,
  내비게이션, impersonation을 추가했습니다.
- LOCAL·REMOTE 실행 환경의 역할을 명확히 정하고 아직 연결되지 않은 REMOTE 페이지에
  임시 라우트 접근 검사를 도입했습니다.
- DB 기반 메뉴와 다국어 사용자 식별 정보를 추가했습니다.
- LOCAL 티켓의 승인자·작업자 결정, 설정 상태 유지, 병합 보호, 날짜 표시,
  차트 레이블, 변경 요청 결과 메시지를 개선했습니다.
- 화면 이동 진행 상황을 표시하기 위해 인증이 필요한 라우트에 로딩 오버레이를 추가했습니다.

### 2026-05-12 — 프로덕션 트래픽 분석

chore(vercel): add Vercel Web Analytics

- 애플리케이션 전체의 페이지 및 방문자 측정을 위해 root layout에 Vercel Web
  Analytics를 활성화했습니다.
- 인증, 도메인 동작, 애플리케이션 라우트, 다국어 처리, 사용자 업무 흐름을 유지하면서
  프로덕션 트래픽 확인 기능을 추가했습니다.

### 2026-05-10 — Service Desk Insights와 반응형 티켓 workflow

feat(service-desk): publish insights view and responsive ticket flow

- 날짜 범위와 차트로 티켓을 필터링하며 상태, 카테고리, 부서, 담당자, SLA를
  요약하는 Service Desk Insights를 추가했습니다.
- Full·compact·hidden 차트 모드와 Portal·Internal·Insights 보기 선택을 추가했습니다.
- 정보 밀도가 높은 데스크톱 업무 화면을 유지하면서 티켓 목록, 상세, 생성 다이얼로그에
  전용 모바일 레이아웃을 도입했습니다.
- 폼 단계 이동 시 티켓 본문이 지워질 수 있던 서식 편집기의 재마운트 동작을 수정했습니다.
- 영어, 한국어, 프랑스어, 스페인어에 Insights, 차트, 필터, SLA, 빈 결과 레이블을 추가했습니다.

### 2026-05-04 — 포털과 LOCAL Service Desk 프로덕션 milestone

#### Service Desk 데모, protected home 및 Documents Hub

feat(portal): deliver service desk demo, home, and docs foundation

- 티켓 생성부터 상세, 액션, 변경 불가능한 이력, 작업 추적, 데모 초기화까지의 LOCAL
  Service Desk 업무 흐름을 제공했습니다.
- 티켓 검색, 필터링, 정렬, 페이지네이션, 역할별 제어, 생성부터 종료·작업 재개까지의
  생명주기 시나리오를 추가했습니다.
- 인증이 필요한 포털 홈 대시보드를 추가하고 로그인, 세션, 페이지 이동, 언어 환경
  설정, App Router 역할 구분을 개선했습니다.
- 다국어 문서 선택, 영어 대체 문구, 내비게이션, 저장소 문서의 시작점을 제공하는
  서버 렌더링 Documents Hub를 공개했습니다.

#### Vercel 프로덕션 build 수정

fix(vercel): resolve Vercel build error from font casing

- 대소문자를 구분하는 Vercel Linux 프로덕션 환경에 맞게 Pretendard font import의
  대소문자를 수정했습니다.
- 애플리케이션 동작을 변경하지 않고 프로덕션 build 오류를 해결했습니다.

#### 라이브 애플리케이션 링크

feat(vercel): add Vercel app link

- 사용자와 검토자가 프로덕션 데모에 직접 접근할 수 있도록 프로젝트 overview에
  배포된 Vercel 애플리케이션 링크를 추가했습니다.

### 2026-02-28 — Service Desk 설정 foundation

feat(service-desk): deliver IT service desk settings foundation

- 데모용 모의 API와 데이터를 갖춘 Category, Approval Step, Assignment Rule 설정
  인터페이스를 추가했습니다.
- Impersonation을 지원하고 인증이 필요한 내부·Tenant 설정 라우트를 정립했습니다.
- 이후 티켓 업무 흐름 개발을 위해 모델, 뷰 모델, API, feature, domain, shared의
  역할 구분을 개선했습니다.
- 레이아웃과 기능 모듈 전반에서 다국어 처리 초기화, 언어 상태, 서버 렌더링과
  클라이언트 초기 상태를 맞추는 hydration을 안정화했습니다.

### 2025-12-30 — 포털 프로덕션 foundation

feat(portal): establish authentication, layout, and permission-driven portal foundation

- NextAuth 자격 증명 인증, JWT 세션, 보호된 페이지 이동, 공통 Provider,
  초기 impersonation 모델을 정립했습니다.
- 권한 기반 내비게이션과 impersonation 중 실시간 메뉴 변경을 지원하는 역할·접근 수준
  권한 검증을 추가했습니다.
- 보호된 레이아웃과 공개 레이아웃의 기본 구조, 홈 화면, 내비게이션, 페이지 이동,
  사용자 환경 설정을 공개했습니다.
- 테마·언어 갱신, 로그인·홈 다국어 문구, 브랜드 리소스, 지원하지 않는 브라우저의
  페이지 이동, 프로젝트 기본 표준을 추가했습니다.
