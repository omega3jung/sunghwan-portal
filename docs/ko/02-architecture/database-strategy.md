# 데이터베이스 전략

## 목표

이 데이터베이스 전략은 `sunghwan-portal`이 애플리케이션 데이터를
보안성, 유지보수성, 프로덕션 정렬 관점에서 어떻게 접근하고 구성하는지를 정의한다.

목표는 다음과 같다.

- 데이터베이스 접근을 서버 주도로 유지한다
- 인증 데이터 접근과 애플리케이션 데이터 접근을 분리한다
- 일반 애플리케이션 흐름에 과도한 데이터베이스 권한이 노출되지 않도록 한다
- DTO 기반 서버 데이터 경계를 지원한다
- Supabase 활용 방식을 현실적인 백엔드 아키텍처와 정렬한다
- 향후 백엔드 분리(extraction)를 위한 명확한 경로를 유지한다

---

## 배경

프로젝트는 Supabase PostgreSQL을 데이터베이스 기반으로 사용한다.

초기 개발 단계에서는 Supabase client 및 API 중심 접근 패턴이 빠른 개발에 유용했다.
하지만 Service Desk 모듈이 더 프로덕션 정렬된 방향으로 발전하면서,
데이터 접근 모델에는 더 강한 경계가 필요해졌다.

프로젝트는 편의 중심 BaaS 스타일 접근에서,
더 명시적인 서버 주도 데이터베이스 전략으로 진화했다.

```txt
Supabase client / Data API 중심 편의 접근
-> 서버 코드의 direct PostgreSQL access
-> 역할 분리(role-separated) 데이터베이스 접근
-> DTO / repository / service 경계
```

이 방향은 신뢰 가능한 포트폴리오 데모라는 프로젝트 목표와 더 잘 맞는다.

- 프로덕션 정렬 서버 경계
- 명확한 보안 모델
- 유지보수 가능한 데이터 계층

---

## API 중심 데이터베이스 접근의 문제

### 1. 약한 서버 경계

애플리케이션 데이터 접근이 Supabase Data API 또는 client 스타일 접근에 과도하게 의존하면,
서버 계층의 경계가 불명확해진다.

문제:

- 데이터베이스 접근 규칙을 추론하기 어렵다
- SQL과 데이터 매핑 경계가 불명확해진다
- route handler가 저장소 세부 구현과 과결합될 수 있다
- 향후 백엔드 분리가 어려워진다

---

### 2. 과도한 역할 권한 위험

일반 애플리케이션 흐름에서 광범위한 service-level key/role을 사용하면 불필요한 위험이 생긴다.

문제:

- 일상적인 앱 동작에 과도한 권한이 부여된다
- 로그인 검증과 애플리케이션 데이터 접근의 분리가 불명확해진다
- 감사(audit)와 권한 추적이 어려워진다
- 시크릿 오용 시 영향 범위가 커진다

---

### 3. 인증 데이터와 애플리케이션 데이터 관심사의 혼합

인증 데이터와 포털 애플리케이션 데이터는 목적이 다르다.

인증 데이터 접근은 다음에 사용된다.

- 로그인 자격 증명 검증
- 인증 계정 상태 조회
- 로그인 관련 메타데이터 업데이트

애플리케이션 데이터 접근은 다음에 사용된다.

- 사용자 프로필 데이터 조회
- Service Desk 데이터 조회/갱신
- settings 및 reference 데이터 접근
- workflow operation 실행

이 둘을 하나의 구분 없는 접근 경로로 처리하면 책임 경계가 흐려진다.

---

### 4. DTO 경계의 모호화

데이터베이스 row와 API response는 서로 다른 책임을 가진다.

명확한 서버 데이터 계층이 없으면:

- 데이터베이스 `snake_case`가 UI 모델로 유출될 수 있다
- SQL 결과 shape가 프론트엔드 컴포넌트와 결합될 수 있다
- 매핑 로직이 중복될 수 있다
- route handler가 비대해질 수 있다

---

## 핵심 개념

프로젝트는 역할이 분리된 서버 주도 direct PostgreSQL access를 사용한다.

```txt
Database access = server-only + role-separated + DTO-mapped
```

현재 방향은 다음과 같다.

```txt
Next.js route handler
-> server service
-> repository
-> query client
-> PostgreSQL
```

UI는 데이터베이스 테이블에 직접 접근하지 않는다.

프론트엔드는 feature API client를 호출하고,
서버가 데이터를 조회/매핑/필터링/반환하는 방식을 결정한다.

---

## 데이터베이스 접근 모델

### 런타임 흐름

```txt
UI
-> feature API client
-> Next.js route handler
-> service
-> repository
-> queryAuthApi / queryPortalApi
-> PostgreSQL
```

---

### 책임

| Layer | Responsibility |
| --- | --- |
| UI / Feature Client | 애플리케이션 API 호출 |
| Route Handler | HTTP 경계, 세션 검증, 런타임 오케스트레이션 |
| Service | 유스케이스 조정 |
| Repository | SQL 실행 및 영속성 로직 |
| Query Client | 데이터베이스 연결 래퍼 |
| PostgreSQL | 영속 데이터의 원천 |

---

## 역할 분리

데이터베이스 접근 모델은 책임 기반으로 role을 분리한다.

```txt
auth_api     -> 인증 전용 데이터베이스 접근
portal_api   -> 애플리케이션 데이터 접근
service_role -> 일반 애플리케이션 흐름에서는 사용하지 않음
```

### 1. `auth_api`

`auth_api`는 로그인 및 인증 관련 데이터 접근에 사용된다.

책임:

- 계정 자격 증명 검증
- 활성 인증 계정 데이터 조회
- 로그인 projection에 필요한 최소 employee/profile 데이터 조회
- `last_login_at` 같은 로그인 메타데이터 갱신

특징:

- 범위가 좁다
- 로그인 지향
- server-only
- 일반 Service Desk operation에는 사용하지 않음

---

### 2. `portal_api`

`portal_api`는 인증 이후 애플리케이션 데이터 접근에 사용된다.

책임:

- 현재 사용자 프로필 데이터 조회
- Service Desk ticket 접근
- settings 및 reference 데이터 접근
- 애플리케이션 workflow 실행
- DTO 기반 response 구성 지원

특징:

- 애플리케이션 데이터 지향
- grants 및 RLS 제약을 함께 받음
- server-only
- `src/server/data` 하위 repository에서 사용

---

### 3. `service_role`

`service_role`은 관리/플랫폼 수준 capability로 취급하며,
기본 애플리케이션 데이터 접근 경로로 사용하지 않는다.

규칙:

- 일반 앱 흐름은 `service_role`에 의존하면 안 된다.

이유:

- 광범위한 권한은 피해야 한다
- 일반 앱 동작은 최소 권한 role을 사용해야 한다
- auth/portal 접근은 감사 가능하고 이해 가능한 상태를 유지해야 한다

---

## Grants 및 RLS 정책

데이터베이스 접근은 grants와 Row Level Security를 함께 통해 제어된다.

```txt
Effective database permission = role grants + RLS policies
```

### Grants

Grants는 객체 수준(object-level)에서 role이 수행할 수 있는 동작을 정의한다.

예시:

- 데이터베이스 연결
- 스키마 사용
- 테이블/뷰 select
- 특정 테이블 insert/update
- 함수 실행

### RLS 정책

RLS 정책은 어떤 row를 조회/변경할 수 있는지 정의한다.

role에 테이블 수준 권한이 있어도 RLS가 허용하지 않으면 row를 전혀 받지 못할 수 있다.

중요한 이유:

- admin role의 direct SQL은 데이터를 반환할 수 있음
- application role 쿼리는 0 row를 반환할 수 있음
- RLS 정책 누락이 애플리케이션 버그처럼 보일 수 있음

규칙:

- 앱 노출 테이블은 반드시 GRANT와 RLS 정책을 함께 점검해야 한다.

이 원칙은 데이터 접근 예측 가능성을 높이고, 우발적 과권한 부여를 방지한다.

---

## 데이터 계층 구조

프로젝트는 DTO 지향 서버 데이터 계층을 사용한다.

권장 구조:

```txt
src/server/data/
  auth/
    accounts/
      authAccountRow.ts
      authAccountDto.ts
      authAccountMapper.ts
      authAccountRepository.ts
      authAccountService.ts
      index.ts

  users/
    userProfileRow.ts
    userProfileDto.ts
    userProfileMapper.ts
    userProfileRepository.ts
    userProfileService.ts
    index.ts

  serviceDesk/
    tickets/
      ticketRow.ts
      ticketDto.ts
      ticketMapper.ts
      ticketRepository.ts
      ticketService.ts
      index.ts
```

---

## Row / DTO / Mapper 경계

### 1. Row

Row 타입은 데이터베이스 결과 shape를 표현한다.

특징:

- SQL에 가깝다
- 보통 `snake_case`
- nullable DB 필드를 포함할 수 있다
- UI 데이터로 직접 취급하면 안 된다

예시:

```ts
type UserProfileRow = {
  user_id: string;
  employee_name: unknown;
  email: string | null;
  department_id: string | null;
};
```

---

### 2. DTO

DTO는 서버 response contract를 표현한다.

특징:

- 애플리케이션 지향
- 보통 `camelCase`
- API 소비자에게 안정적
- 데이터베이스 특화 naming/shape를 숨긴다

예시:

```ts
type UserProfileDto = {
  userId: string;
  displayName: LocalizedText;
  email: string | null;
  departmentId: string | null;
};
```

---

### 3. Mapper

Mapper는 Row 데이터를 DTO 데이터로 변환한다.

규칙:

```txt
Row -> Mapper -> DTO
```

Mapper 책임:

- naming 변환
- null 정규화
- JSON 파싱 또는 로컬라이징 shape 구성
- 응답 안전(response-safe) 필드 선택

---

### 4. Repository

Repository는 SQL 실행을 소유한다.

책임:

- parameterized SQL 정의
- `queryAuthApi` 또는 `queryPortalApi` 호출
- 로컬 컨벤션에 따라 Row 또는 매핑된 DTO 데이터 반환
- route handler 및 UI 코드에서 SQL 분리

---

### 5. Service

Service는 유스케이스를 조정한다.

책임:

- repository 조합 호출
- 애플리케이션 수준 규칙 적용
- 현재 사용자 컨텍스트 해석
- 응답 DTO 준비
- route handler를 얇게 유지

---

## 네이밍 전략

데이터베이스 모델과 애플리케이션 모델은 서로 다른 네이밍 규칙을 사용한다.

```txt
Database row -> snake_case
DTO / app model -> camelCase
```

이유:

- PostgreSQL 네이밍 관례를 유지한다
- TypeScript 모델의 관용성을 유지한다
- DB 구현 세부사항이 UI 컴포넌트로 유출되지 않게 한다
- 프론트엔드 코드에서 응답 contract 가독성을 높인다

---

## Query Client 전략

프로젝트는 데이터베이스 책임별로 query client를 분리해 사용한다.

예시 방향:

```txt
queryAuthApi   -> AUTH_DATABASE_URL
queryPortalApi -> PORTAL_DATABASE_URL
```

### `queryAuthApi`

auth repository 및 로그인 검증 흐름에서 사용한다.

### `queryPortalApi`

인증 이후 애플리케이션 repository에서 사용한다.

규칙:

- 편의가 아니라 책임을 기준으로 query client를 선택한다.
- 인증 쿼리는 portal data role을 사용하면 안 된다.
- portal feature 쿼리는 auth-only role을 사용하면 안 된다.

---

## 환경 변수

데이터베이스 관련 환경 변수는 책임 기준으로 분리한다.

| Variable | Purpose | Exposure |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | public |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase public client key | public |
| `AUTH_DATABASE_URL` | `auth_api`용 direct PostgreSQL connection | server-only |
| `PORTAL_DATABASE_URL` | `portal_api`용 direct PostgreSQL connection | server-only |
| `NEXTAUTH_URL` | NextAuth runtime URL | environment |
| `NEXTAUTH_SECRET` | NextAuth signing secret | secret |

규칙:

- public env 값은 public 인프라 정보를 나타낼 수 있다.
- DB URL과 secret은 반드시 server-only여야 한다.

---

## Auth 데이터 접근

인증 데이터 접근은 의도적으로 좁은 범위로 유지한다.

로그인 흐름:

```txt
Credentials provider
-> auth service
-> auth repository
-> queryAuthApi
-> PostgreSQL
-> AuthUser
-> JWT
-> SessionUser
```

auth 데이터 접근은 신뢰 가능한 authentication payload 생성에 필요한 데이터만 반환해야 한다.

일반 사용자 프로필/애플리케이션 데이터 접근 경로로 확장되면 안 된다.

---

## Portal 데이터 접근

portal 애플리케이션 데이터 접근은 인증 이후에 시작된다.

흐름:

```txt
Route handler
-> get current session
-> resolve effective user context
-> portal service
-> portal repository
-> queryPortalApi
-> DTO response
```

지원 효과:

- role-aware 데이터 접근
- RLS-aware 쿼리 동작
- DTO 응답 경계
- 향후 백엔드 분리

---

## Auth / Session 전략과의 관계

이 데이터베이스 전략은 auth/session 경계를 지원한다.

```txt
AuthUser    -> login/auth 데이터 접근으로 생성
SessionUser -> session-safe projection
AppUser     -> application 데이터 접근으로 해석
```

session은 전체 사용자 프로필이 되어서는 안 된다.

대신:

```txt
Session identity
-> application user resolution
-> AppUser DTO
-> frontend runtime facade
```

이렇게 하면 authentication은 안정적으로 유지하면서,
application user 데이터는 독립적으로 진화할 수 있다.

---

## Feature-Based 구조와의 관계

데이터베이스 전략은 feature-based 아키텍처를 보완한다.

feature 모듈은 UI workflow와 API client를 소유한다.
서버 데이터 모듈은 DB 접근과 DTO 매핑을 소유한다.

```txt
src/feature
-> frontend workflows and API calls

src/server/data
-> database access, repositories, DTO mapping
```

이 경계는 feature 모듈이 DB 특화 코드를 가져오지 않도록 한다.

규칙:

```txt
Feature code calls APIs.
Server data code calls the database.
```

---

## LOCAL / REMOTE 런타임과의 관계

Service Desk 모듈은 LOCAL과 REMOTE 런타임 동작을 모두 지원한다.

```txt
LOCAL  -> mock-backed demo behavior
REMOTE -> database-backed application behavior
```

데이터베이스 전략은 주로 REMOTE 동작과 서버 측 애플리케이션 데이터 접근에 적용된다.

LOCAL demo 동작은 persistent database write 대신
server-side in-memory state module을 사용할 수 있다.

중요한 구분:

- local demo state는 데모 현실성을 위해 mutable하다.
- remote 데이터는 database access를 통해 영속화된다.

이는 포트폴리오 데모가 현실적으로 보이도록 하면서,
모든 프로덕션 영속성 이슈가 이미 완성된 것처럼 과장하지 않게 해준다.

---

## 첨부파일 및 데모 저장 정책

첨부파일은 무제한 업로드가 보안/저장소/오남용 위험을 만들 수 있어 특별한 주의가 필요하다.

현재 local demo에서는 첨부파일 동작 범위를 제한해야 한다.

### Local Demo 방향

- 준비된 demo 이미지/파일 자산을 사용한다
- 제어된 demo reference로 업로드 동작을 시뮬레이션한다
- 첨부 메타데이터를 ticket context의 일부로 저장/반환한다
- 임의의 비신뢰 파일 영속 저장을 피한다

### Future Production 방향

프로덕션 수준 첨부파일 처리는 다음을 포함해야 한다.

- storage bucket 정책
- 파일 크기 제한
- MIME type/확장자 검증
- 접근 제어
- 필요한 경우 signed URL
- 적절한 malware/content scanning
- audit 및 정리(cleanup) 정책

규칙:

- 데모 첨부파일 동작은 프로덕션 수준 파일 저장을 암시하면 안 된다.

---

## 보안 원칙

### 1. 최소 권한

작업을 완료할 수 있는 가장 좁은 데이터베이스 role을 사용한다.

### 2. Server-Only Secret

DB URL과 privileged credential은 클라이언트에 절대 노출되면 안 된다.

### 3. Parameterized Query

Repository는 parameterized SQL을 사용해야 한다.

신뢰할 수 없는 입력값에 문자열 보간을 사용하지 않는다.

### 4. 명시적 RLS 정렬

애플리케이션 role이 접근하는 모든 테이블은 grants와 RLS 정책을 함께 검토해야 한다.

### 5. 일반 앱 흐름에서 광범위 role 금지

일반 애플리케이션 경로는 `service_role`에 의존하면 안 된다.

---

## Deferred Scope

현재 데이터베이스 전략은 의도적으로 full production completeness를 주장하지 않는다.

deferred 또는 future 작업에는 다음이 포함된다.

- 모든 Service Desk workflow에 대한 full remote persistence
- 전체 테이블에 대한 완전한 스키마 문서화
- 테이블별 RLS 정책 카탈로그 완성
- migration/versioning 전략
- 프로덕션 수준 첨부파일 저장
- full audit compliance 인프라
- 완전한 enterprise authorization rule engine
- 데이터베이스 observability 및 쿼리 성능 모니터링

이 항목들은 무시된 것이 아니다.
현재 포트폴리오 범위와 의도적으로 분리해 둔 것이다.

---

## 트레이드오프

### Pros

- 명확한 서버 측 데이터베이스 경계
- role 분리를 통한 보안 강화
- 더 강한 프로덕션 정렬
- DTO 및 API 응답 제어 용이성
- 광범위 service role 사용 위험 감소
- 향후 백엔드 분리 경로 개선
- 더 신뢰 가능한 포트폴리오 아키텍처

### Cons

- 초기 설정 복잡도가 더 높다
- grants/RLS 정책을 더 세심하게 유지해야 한다
- SQL 매핑을 위한 Row / DTO / Mapper 파일이 추가된다
- 관리해야 할 환경 변수가 늘어난다
- direct PostgreSQL access는 더 엄격한 server-only 규율이 필요하다

---

## 검토한 대안

### 1. Supabase Data API를 주 접근 경로로 사용

- 시작이 빠르다
- 단순 CRUD에 편리하다
- 서버 경계가 덜 명시적이다
- 애플리케이션 특화 접근 구조를 강제하기 어렵다
- 백엔드 분리 목표와 정렬이 약하다

---

### 2. 단일 광범위 Service Role 사용

- 구현이 단순하다
- 초기 권한 이슈를 많이 피할 수 있다
- 일반 앱 흐름에 과도한 권한을 부여한다
- 최소 권한 원칙 설명이 약해진다
- 보안 리스크가 커진다
- 인증/애플리케이션 데이터 분리가 나빠진다

---

### 3. 모든 서버 쿼리에 단일 공유 DB Role 사용

- role 분리보다 단순하다
- auth와 portal 데이터 책임이 혼합된다
- 감사가 어려워진다
- 정밀한 권한 설계가 어려워진다

---

### 4. 즉시 별도 백엔드 리포지토리 분리

- 장기적으로 깔끔한 백엔드 경계
- 독립 확장에 유리
- 현재 포트폴리오 범위에는 오버헤드가 크다
- 반복 개발 속도가 느려진다
- 배포/유지 비용이 증가한다

---

## 설계 원칙 정렬

이 데이터베이스 전략은 다음 원칙과 정렬된다.

- 최소 권한
- 서버 제어 데이터 접근
- 관심사 분리
- DTO 기반 응답 경계
- feature-based 프론트엔드 아키텍처
- 프로덕션 정렬 포트폴리오 설계
- 향후 백엔드 분리 준비성

---

## 요약

이 데이터베이스 전략은 server code의 direct PostgreSQL access와
역할 분리된 데이터베이스 접근 모델을 사용한다.

```txt
auth_api     -> 로그인 및 인증 데이터 접근
portal_api   -> 애플리케이션 데이터 접근
service_role -> 일반 앱 흐름에서 제외
```

데이터 계층을 명시적이고 유지보수 가능하게 유지하기 위해,
Database row, DTO, mapper, repository, service를 분리한다.

이 접근은 구현 규율을 높이지만,
프로젝트를 더 안전하고, 더 프로덕션 정렬되게 만들며,
진지한 Service Desk 포트폴리오 시스템으로 설명하기 쉽게 해준다.
