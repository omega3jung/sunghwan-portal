# Service Desk 구현 전략

이 문서는 현재 포트폴리오 프로젝트에서 재설계된 서비스 데스크 영역을 구축하기 위해 추가된 **새로운 구현** 전략에 중점을 둡니다.

## 1. 목적

이 문서는 `sunghwan-portal`에서 **Service Desk** 모듈을 구축할 때 사용한 구현 전략을 설명합니다.

짝이 되는 문서인 `service-desk-evolution.md`는 이전 Service Hub / IT Help Desk 경험이 어떻게 더 명확한 Service Desk 도메인으로 개선되었는지 설명합니다. 이 문서는 그 재설계된 도메인을 현재 포트폴리오 프로젝트에서 어떻게 구현했는지에 집중합니다.

목표는 도메인 모델을 처음부터 정의하는 것이 아니라, 실무적인 구현 의사결정을 설명하는 것입니다.

이 문서의 대상:

- 프런트엔드 아키텍처를 검토하는 엔지니어
- 실무 구현 판단력을 평가하는 면접관
- 로컬 데모 동작, 런타임 경계, 프로젝트 구조를 이해해야 하는 향후 유지보수 담당자

---

## 2. 권장 문서 위치

권장 경로:

```txt
docs/ko/08-dev-strategy/service-desk-implementation-strategy.md
```

이 문서의 용도:

- 구현 중심 전략
- 로컬 데모 및 로컬/리모트 런타임 설계
- 인증/세션/가장(impersonation) 경계
- 라우팅, 폼, 검색, 쿼리, 상태, i18n, 아키텍처 의사결정

개념/도메인 진화는 다음 문서에서 다룹니다.

```txt
docs/ko/08-dev-strategy/service-desk-evolution.md
```

---

## 3. 구현 목표와 범위

Service Desk 모듈은 프로덕션 정렬 포트폴리오 기능으로 구현됩니다.

구현 목표는 장난감 목 화면이 아닙니다. 실제 프런트엔드 아키텍처와 백엔드 유사 동작을 보여주는 동작 가능한 데모를, 포트폴리오에 맞는 범위로 유지하는 것입니다.

구현의 핵심 초점:

- 로컬/리모트 런타임 분리
- 현실적인 로컬 데모 변경 동작
- 세션 인지형 신원/접근 처리
- 페이지/드로어/다이얼로그 상호작용 경계
- 폼/검색/쿼리/API 책임 분리
- 기능 기반 프로젝트 구조
- 안전한 서버/클라이언트 모듈 경계
- 유지보수 가능한 문서/의사결정 이력

현재 구현은 영속 파일 저장, 실시간 알림 전달, WebSocket 업데이트, 완전한 엔터프라이즈 규칙 평가처럼 프로덕션 인프라가 필요한 영역을 의도적으로 과구축하지 않습니다.

가이드 원칙:

```txt
credible architecture
+ working local demo
+ clear implementation boundaries
+ room for future remote persistence
```

---

## 4. 런타임 전략

Service Desk 모듈은 데이터 범위에 따라 서로 다른 런타임 동작을 지원합니다.

로컬 런타임은 데모/포트폴리오 리뷰용이고, 리모트 런타임은 향후 API/DB 기반 실행을 위한 경로입니다.

### 4.1 로컬/리모트 런타임 분리

프로젝트는 Service Desk 동작을 두 런타임 경로로 분리합니다.

```txt
LOCAL  -> mock-backed demo behavior
REMOTE -> future API / database-backed behavior
```

이 분리는 다음에 영향을 줍니다.

- 티켓 조회
- 액션 실행
- 소유권 계산
- 데모 리셋 동작
- 쿼리 전략
- 변경(mutation) 동작

UI는 각 작업이 로컬 목 상태 기반인지 리모트 영속 기반인지 알 필요가 없습니다. 대신 route/API 계층이 런타임 경로를 결정합니다.

일반적인 흐름:

```txt
UI
-> feature API client
-> Next.js route handler
-> LOCAL handler or REMOTE proxy
```

이 구조는 실제 프로덕션 흐름과 유사한 프런트엔드 형태를 유지하면서도, 포트폴리오 데모를 DB 없이 실행할 수 있게 합니다.

### 4.2 로컬 데모 권한 단순화

로컬 데모는 모든 엔터프라이즈 권한 규칙을 그대로 재현하지 않습니다.

대신 더 단순한 역할 인지 모델을 사용합니다.

```txt
ADMIN     -> broad permission
non-ADMIN -> must be related to the ticket
```

추가 로컬 동작:

- `ADMIN`은 주요 Service Desk 작업 수행 가능
- Non-admin은 소유권/할당/기타 관련 관계 필요
- `LEADER` 이상은 더 넓은 티켓 목록 조회 가능
- `USER`는 본인이 생성했거나 관련된 티켓 중심
- 일부 생성 플로우는 `ADMIN`/`MANAGER`가 승인 우회 가능

이는 데모를 이해 가능하게 유지하면서도 권한 인지 동작을 보여줍니다.

향후 리모트 구현에서는 조직/부서/직무/관계 기반 전체 규칙을 적용할 수 있습니다.

### 4.3 로컬 데모 상태와 리셋

로컬 데모에서는 React Query 캐시 리셋만으로 충분하지 않습니다.

로컬 데모는 서버 측 인메모리 목 상태를 변경하므로, 가변 데모 데이터를 서버 측 로컬 상태 모듈로 중앙화합니다.

예시 방향:

```txt
server/serviceDesk/ticket/state.ts
server/serviceDesk/settings/state.ts
```

리셋 엔드포인트는 데모를 알려진 상태로 복원합니다.

```txt
/api/demo/service-desk/reset
```

이 방식은 반복 테스트와 리크루터 리뷰에 더 안전합니다.

사용자는 티켓 액션, 상태 변경, 설정 변경, 목록 필터링을 시도한 뒤에도 샘플 데이터를 원상 복귀할 수 있습니다.

### 4.4 시나리오 기반 목 데이터

목 데이터는 정적 테이블 행이 아니라 워크플로 시나리오로 설계합니다.

예시 방향:

```txt
scenarios/serviceDesk/SP-2026-0001
  ticket.ts
  actions.ts
  histories.ts
```

시나리오 기반 목 데이터는 다음을 시연할 수 있습니다.

- 승인
- 할당
- 반려
- 병합
- 코멘트
- 노트
- 이력
- 시간 추적
- 다국어 예시

이는 단순 샘플 목록이 아니라 현실적인 운영/이력 흐름을 보여주므로 데모 설득력을 높입니다.

### 4.5 의도적으로 보류한 범위

현재 구현은 복잡도를 크게 높이지만 포트폴리오 데모 가치는 낮은 기능을 의도적으로 보류합니다.

보류/단순화 항목:

- 완전한 리모트 DB 영속화
- 프로덕션급 첨부 파일 저장
- 로컬 모드의 완전한 엔터프라이즈 규칙 엔진
- 실시간 WebSocket 업데이트
- 완전한 SLA 달력/공휴일 엔진
- 완전한 알림 전달
- 완전한 감사 컴플라이언스 인프라

이는 무시가 아니라 향후 확장 지점으로 남긴 것입니다.

현재 목표는 시스템을 신뢰 가능하고 유지보수 가능하며 리뷰 가능한 상태로 유지하는 것입니다.

---

## 5. 신원과 접근 전략

Service Desk 동작은 사용자 맥락에 크게 의존합니다.

구현은 인증 정체성, 세션 안전 사용자 데이터, 애플리케이션 노출 사용자 데이터를 분리합니다.

### 5.1 Auth/Session/App User 경계

프로젝트는 신원 개념을 분리합니다.

```txt
AuthUser    -> authentication identity
SessionUser -> session-safe projection
AppUser     -> application-facing user model
```

세션을 전체 사용자 프로필로 취급하지 않습니다.

대신:

```txt
JWT / Session -> trusted identity and access context
AppUser       -> fetched or resolved application user
Zustand       -> frontend runtime facade, not auth truth
```

이로써 세션이 과도하게 커지거나 UI 요구에 강하게 결합되는 것을 방지합니다.

또한 인증, 권한 검사, UI 편의 데이터를 섞지 않도록 합니다.

### 5.2 세션 인지형 가장(impersonation)

가장 기능은 단순 클라이언트 오버라이드가 아니라 세션 인지 동작으로 다룹니다.

중요한 신원 개념:

```txt
original user  = authenticated actor
effective user = user currently being represented
```

이렇게 하면 UI/API 계층은 effective user로 동작하면서도 감사/책임 추적을 위해 original actor를 보존할 수 있습니다.

Service Desk에서 지원 담당자가 특정 사용자 관점 동작을 재현/점검해야 하므로 중요합니다.

현재 권한 경계:

- 최소 관리자(ADMIN) 권한을 가진 내부 사용자(INTERNAL)만 가장을 시작할 수 있습니다.
- 가장 대상은 클라이언트(CLIENT) 사용자여야 합니다.
- 이 규칙은 UI 구성 요소가 아닌 인증 계층에서 적용됩니다.

### 5.3 파생 소유권

티켓 소유권은 고정 저장 필드가 아니라 현재 세션 + 티켓 데이터에서 계산합니다.

예시 방향:

```ts
type Ownership = {
  owner: boolean;
  assigned: boolean;
};
```

예시 로직:

```txt
owner    = currentUser.username === ticket.requesterId
assigned = ticket.assigneeIds.includes(currentUser.username)
```

파생 소유권이 지원하는 항목:

- 권한 판단
- 목록 강조
- 액션 가능 여부
- 상세 페이지 동작
- 로컬/리모트 동작

로컬 모드에서는 route/local handler가 계산하고, 리모트 모드에서는 인증 사용자 맥락으로 서버가 계산할 수 있습니다.

---

## 6. UI/상호작용 전략

Service Desk UI는 1차 워크플로, 2차 패널, 원자적 액션을 분리합니다.

목표는 모든 상호작용을 모달에 몰아넣지 않으면서도 사용성을 유지하는 것입니다.

### 6.1 페이지/드로어/다이얼로그 정책

프로젝트 상호작용 정책:

```txt
Page   -> primary workflow
Drawer -> secondary interaction
Dialog -> atomic action
```

티켓 상세는 페이지로 구성합니다.

```txt
/service-desk/[ticketId]
```

이 방식은 티켓별 안정 URL을 제공하고 중첩 모달 복잡성을 줄입니다.

드로어는 이력/사이드 패널 같은 2차 뷰에 적합하고, 다이얼로그는 짧은 폼/확인/집중 액션에 적합합니다.

### 6.2 티켓 폼 아키텍처

티켓 폼은 안내형 멀티스텝으로 구현합니다.

예시 흐름:

```txt
Step 1 -> Category
Step 2 -> Basic information
Step 3 -> Details / attachments
Step 4 -> Review and submit
```

폼 구성:

- `react-hook-form`
- `zod`
- 단계별 검증
- 최종 검증
- 카테고리 기반 기본값

폼 모드는 명시적으로 정의합니다.

```ts
type Mode = "create" | "update" | "view";
```

이를 통해 동일한 폼 UI가 서로 다른 라이프사이클 동작을 가리지 않게 합니다.

### 6.3 Draft 전략

Draft 동작은 현재 데모에 맞게 실용적으로 유지합니다.

리치 본문/첨부는 영속 저장 보장이 필요하므로 완전한 프로덕션 Draft 시스템은 비용이 큽니다.

현재 방향:

- 데모 가치가 있을 때만 Draft 유사 동작 지원
- 첨부가 안전 저장된 것처럼 가장하지 않기
- 로컬 Draft 동작 단순화
- 리모트 저장이 준비되기 전까지 전체 서버 Draft 영속화 보류

이로써 데모를 정직하게 유지하고 불필요한 복잡성을 줄입니다.

### 6.4 리치 텍스트 에디터 통합

액션 폼과 티켓 커뮤니케이션 영역은 공용 리치 텍스트 에디터로 통합합니다.

에디터 전략:

- HTML 문자열 저장
- 공용 툴바 사용
- 중복 에디터 로직 감소
- comment/note/reason 입력 일관성 확보

이 방식은 액션 중심 모델을 유지하면서 액션 폼별 에디터 중복을 줄입니다.

### 6.5 UI 실행 세부 개선

여러 UI 개선을 통해 모듈을 현실적인 Service Desk처럼 느끼게 합니다.

예시:

- 모달 전용 상세 대신 티켓 상세 페이지
- 안정적인 2차 상호작용으로서의 이력 드로어
- 과도한 아이콘 대신 assigned-to-me 배지
- 선택 상태처럼 보이지 않도록 행 강조를 신중히 사용
- 보호 페이지 역할 인지 요약 텍스트
- 대시보드와 인사이트 책임 분리
- 일관된 상태 배지 패턴
- 실사용 필터/작업 추적에 맞춘 date/date-time picker 동작 조정

UI는 장식이 아니라 도메인 상태, 소유권, 워크플로 진행을 전달합니다.

---

## 7. 데이터와 API 전략

Service Desk 데이터 계층은 페이지 관심사와 서버 필터링/런타임 분기/변경 동작 책임을 분리합니다.

### 7.1 검색 엔드포인트 전략

티켓 목록 검색은 복잡한 쿼리 문자열 중심 방식에서 분리합니다.

개선 방향은 전용 검색 엔드포인트 사용입니다.

```txt
POST /api/service-desk/tickets/search
```

페이지는 단순 검색 기준을 제출하고, 서버가 이를 풍부한 필터 규칙으로 매핑합니다.

이로써 URL/클라이언트 로직 복잡도를 관리 가능하게 유지하면서 고급 필터 확장을 준비할 수 있습니다.

### 7.2 날짜 범위 정규화

날짜 범위 필터는 사용자 기대와 일치해야 합니다.

날짜 전용 필터는 경계를 정규화합니다.

```txt
start date -> startOfDay
end date   -> endOfDay
```

이렇게 하면 현재 시각 기반 필터 때문에 같은 날짜의 티켓이 누락되는 버그를 줄일 수 있습니다.

예를 들어 `Today`는 사용자가 피커를 연 시점 이후가 아니라 하루 전체를 의미해야 합니다.

### 7.3 React Query 분리 전략

서버 데이터는 갱신 빈도 기준으로 분리합니다.

정적/참조 성격 데이터:

```txt
category
department
employee
job field
reference settings
```

동적/가변 Service Desk 데이터:

```txt
ticket list
ticket detail
draft
actions
histories
track time
local demo mutable state
```

이로써 데이터 특성에 맞는 쿼리 옵션을 적용할 수 있습니다.

정적 데이터는 더 오래 안정적으로 유지하고, 가변 데이터는 액션/상태 변경 후 리패치할 수 있습니다.

### 7.4 API 라우트 오케스트레이션

Next.js route handler를 오케스트레이션 경계로 사용합니다.

일반 방향:

```txt
route.ts
-> authenticate / check session
-> decide LOCAL or REMOTE
-> call local handler or remote proxy
```

로컬 데모 로직은 UI 컴포넌트가 아니라 서버 측 로컬 모듈에 둡니다.

이렇게 하면 프런트엔드를 재설계하지 않고도 향후 리모트 API 경로를 유지할 수 있습니다.

---

## 8. 아키텍처와 경계 전략

프로젝트는 기능 기반 아키텍처와 명시적 모듈 경계를 통해 Service Desk 유지보수성을 확보합니다.

### 8.1 기능 기반 구조

라우팅, 기능 워크플로, 도메인 모델, 서버 로직, 공유 유틸리티를 분리합니다.

예시 방향:

```txt
src/app      -> routing layer
src/feature  -> feature workflows and UI
src/domain   -> domain models and rules
src/server   -> server-side local/demo logic
src/shared   -> reusable utilities and components
```

이는 UI/페칭/비즈니스 로직/도메인 동작이 페이지 파일에 얽히는 문제를 줄입니다.

또한 Next.js App Router에서 서버/클라이언트 경계를 더 쉽게 다룰 수 있습니다.

### 8.2 배럴 익스포트 정책

과도하게 넓은 `index.ts` 배럴 익스포트는 의도치 않은 의존성 누수를 만들 수 있습니다.

개선 정책:

```txt
index.ts should export only safe and intentional public API
```

기능 모듈 예시:

```txt
feature/serviceDesk/ticket/index.ts
-> constants, mapper, mock, types

feature/serviceDesk/ticket/components/index.ts
-> UI components

feature/serviceDesk/ticket/api/index.ts
-> server-safe API helpers

feature/serviceDesk/ticket/api/client.ts
-> client-only API exports
```

교훈:

```txt
A barrel file is a public contract, not a dumping ground.
```

이 정책은 서버/클라이언트 경계 누수를 줄입니다.

### 8.3 Shared Client 유틸리티

toast helper, 브라우저 저장소 helper처럼 클라이언트 전용 동작이 필요한 공유 유틸리티가 있습니다.

개선 방향은 클라이언트 전용 공유 유틸리티 분리입니다.

```txt
src/shared/client/
```

서버 안전 유틸리티와 클라이언트 전용 모듈을 분리하여, App Router 환경에서 우발적 import 문제를 줄입니다.

### 8.4 i18n 네임스페이스 전략

번역은 네임스페이스와 책임 기준으로 구성합니다.

예시 네임스페이스:

```txt
common
serviceDesk
validation
message
error
settings
demo
```

검증 메시지, 사용자 기대 메시지, 시스템 에러를 분리합니다.

포트폴리오 문서/코드 가독성을 위해 숨은 헬퍼 추상화보다 명시적 번역 키를 선호합니다.

리뷰어가 여러 계층을 추적하지 않고도 메시지 의미를 이해할 수 있어야 합니다.

---

## 9. 문서화와 유지보수 전략

문서화는 프로젝트 산출물의 일부로 취급합니다.

Service Desk 모듈은 다음으로 뒷받침됩니다.

- 도메인 문서
- 전략 문서
- 아키텍처 문서
- 의사결정 로그
- 구현 노트

이는 무엇을 만들었는지뿐 아니라 왜 그렇게 만들었는지도 설명합니다.

포트폴리오 프로젝트에서는 UI 동작 여부뿐 아니라 설계 판단, 유지보수성, 트레이드오프 설명 능력도 평가 대상입니다.

문서화 전략:

```txt
domain docs      -> what the system means
architecture docs -> how the system is structured
strategy docs     -> why the implementation direction was chosen
decision logs     -> what changed and why
```

---

## 10. 권장 교차 참조

이 문서는 다음에서 링크할 수 있습니다.

- `docs/ko/README.md` (Development Strategy 섹션)

관련 참조:

- `docs/ko/08-dev-strategy/service-desk-evolution.md`
- `docs/ko/02-architecture/feature-based-structure.md`
- `docs/ko/02-architecture/auth-session-strategy.md`
- `docs/ko/02-architecture/state-management.md`
- `docs/ko/05-data-fetching/react-query-strategy.md`

---

## 11. README 요약 제안

### Service Desk 구현 전략

이 문서는 현재 포트폴리오 프로젝트에서 Service Desk 도메인을 어떻게 구현했는지 설명합니다. 로컬/리모트 런타임 분리, 로컬 데모 상태 전략, 인증/세션 경계, API 오케스트레이션, 기능 기반 아키텍처 의사결정을 포함합니다.

---

## 12. 요약

Service Desk 구현 전략은 불필요한 과구축 없이 현실적인 실행에 집중합니다.

가장 중요한 구현 결정:

- 로컬/리모트 런타임 분리
- 변경 가능하고 리셋 가능한 로컬 데모 동작 유지
- 역할 인지 동작을 유지하면서 로컬 권한 단순화
- auth/session/app user/impersonation/derived ownership 관심사 분리
- 1차 워크플로는 페이지, 2차 뷰는 드로어, 원자 액션은 다이얼로그 사용
- 티켓 워크플로 요구에 맞춘 폼/Draft/리치 텍스트/UI 동작 정렬
- 고급 검색/필터 책임을 서버 경계로 이동
- 데이터 가변성 기준 React Query 전략 분리
- route handler를 오케스트레이션 경계로 유지
- 기능 기반 구조와 안전한 배럴 익스포트 사용
- 클라이언트 전용 shared 유틸리티와 서버 안전 유틸리티 분리
- i18n과 문서화를 유지보수 기능으로 취급

이 전략은 UI 구현뿐 아니라 실무적 프런트엔드 아키텍처, 런타임 경계 설계, 유지보수 가능한 프로젝트 구성을 함께 보여준다는 점에서 포트폴리오 완성도를 높입니다.
