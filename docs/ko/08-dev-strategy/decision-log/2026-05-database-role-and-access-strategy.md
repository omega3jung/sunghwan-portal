# 데이터베이스 역할 및 접근 전략 (2026-05)

## 배경

프로젝트는 초기에는 Supabase를 편리한 데이터베이스 기반으로 사용했다.
초기 구현 단계에서는 API 중심 접근 패턴과 Supabase client 스타일 사용이 빠른 개발에 유용했다.

Service Desk 모듈이 더 프로덕션 정렬된 방향으로 발전하면서,
데이터베이스 접근 방향은 더 명시적으로 정리될 필요가 있었다.

이 시점에서 다음 영역의 구현 방향이 더 명확해졌다.

- 서버 코드에서의 direct PostgreSQL access
- 인증 데이터와 애플리케이션 데이터를 위한 데이터베이스 역할 분리
- server-only 데이터베이스 연결 문자열
- Row / DTO / Mapper / Repository / Service 경계
- RLS-aware 애플리케이션 데이터 접근
- route-handler orchestration
- 광범위한 service-level 권한 의존 축소
- 향후 백엔드 분리 준비성

따라서 데이터베이스 전략은 편의 우선 접근에서,
더 통제된 서버 측 데이터 접근 모델로 이동해야 했다.

---

## 문제

### 1. API 중심 접근이 서버 경계를 약화시켰다

Supabase API 스타일 접근은 초기 개발에는 편리하지만,
애플리케이션 데이터 경계를 덜 명시적으로 만들 수 있다.

프로젝트가 client 유사 접근 패턴이나 Data API에 과도하게 의존하면 다음 문제가 발생한다.

- route handler가 저장소 세부사항과 과결합될 수 있다
- SQL과 DTO 매핑 경계가 불명확해진다
- 데이터베이스 접근 감사가 어려워진다
- 향후 백엔드 분리가 어려워진다
- 프로젝트가 프로덕션 정렬 시스템보다 단순 BaaS CRUD 데모에 가까워 보일 수 있다

이 포트폴리오 프로젝트의 목표는 단순 저장이 아니다.
현실적인 서버 주도 아키텍처를 보여주는 것이 목표다.

---

### 2. 광범위한 service role은 일반 앱 흐름에 과도한 권한이었다

일반 애플리케이션 동작에 광범위한 service-level role을 사용하면 단순할 수 있지만,
보안 관점의 설득력을 약화시킨다.

문제:

- 일반 앱 쿼리에 과도한 권한이 부여된다
- 인증 데이터 접근과 애플리케이션 데이터 접근이 혼합된다
- 최소 권한 설계가 불명확해진다
- 시크릿 오용 시 영향 범위가 커진다
- 리뷰어 관점에서 실질적인 권한 경계가 있는지 의문이 생길 수 있다

프로젝트는 더 명확한 역할 모델이 필요했다.

---

### 3. 인증 데이터와 포털 데이터는 책임이 달랐다

로그인 검증과 애플리케이션 데이터 접근은 동일한 관심사가 아니다.

인증 데이터 접근 책임:

- 자격 증명 검증
- 계정 상태 조회
- 활성 사용자 확인
- 로그인 메타데이터 갱신

포털 애플리케이션 데이터 접근 책임:

- 현재 사용자 프로필 데이터 조회
- Service Desk 데이터 조회/갱신
- settings 및 reference 데이터 접근
- workflow 관련 operation 실행

두 책임을 하나의 데이터베이스 role 또는 접근 경로로 처리하면,
아키텍처 해석이 어려워진다.

---

### 4. Grants와 RLS를 함께 다뤄야 했다

구현 과정에서 데이터베이스 권한은 단순 테이블 grants만으로 설명되지 않는다는 점이 분명해졌다.

role이 테이블 쿼리 권한을 가져도 RLS 정책이 허용하지 않으면 row를 받지 못할 수 있다.

유효한 DB 권한 모델은 다음과 같다.

```txt
Effective database permission = role grants + RLS policies
```

이는 아키텍처의 명시적 요소가 되어야 했다.

---

### 5. 유지보수 가능한 서버 데이터 접근을 위해 DTO 경계가 필요했다

프로젝트가 direct PostgreSQL query 방향으로 이동하면서,
데이터베이스 row와 API response의 차이가 더 중요해졌다.

명확한 데이터 계층이 없으면:

- database snake_case 필드가 프론트엔드 모델로 유출될 수 있다
- SQL 결과 shape가 UI 컴포넌트와 결합될 수 있다
- route handler가 비대해질 수 있다
- 매핑 로직이 중복될 수 있다
- 향후 백엔드 분리가 어려워질 수 있다

프로젝트는 명시적인 서버 데이터 계층이 필요했다.

---

## 결정

역할이 분리된 데이터베이스 접근과 DTO 지향 서버 데이터 계층을 기반으로,
서버 주도 direct PostgreSQL access를 사용한다.

핵심 결정은 다음과 같다.

```txt
Database access = server-only + role-separated + DTO-mapped
```

애플리케이션 데이터 흐름은 다음 방향을 따른다.

```txt
Next.js Route Handler
-> Server Service
-> Repository
-> Query Client
-> PostgreSQL
```

### 범위 규칙

- 일반 앱 흐름에서 `service_role`을 사용하지 않는다.
- 인증 전용 데이터베이스 접근에는 `auth_api`를 사용한다.
- 로그인 이후 애플리케이션 데이터 접근에는 `portal_api`를 사용한다.
- 데이터베이스 URL과 privileged credential은 server-only로 유지한다.
- SQL은 UI 컴포넌트/페이지 컴포넌트가 아닌 repository에 둔다.
- route handler는 HTTP/session/runtime orchestration에 집중해 얇게 유지한다.
- 데이터베이스 Row 타입과 응답 DTO를 분리한다.
- mapper를 사용해 DB row를 애플리케이션 지향 DTO로 변환한다.
- grants와 RLS 정책을 한 쌍으로 다룬다.
- Supabase를 PostgreSQL 플랫폼으로 유지하되, 핵심 서버 흐름에서 direct DB 접근이 더 적절한 경우 Data API 의존을 줄인다.

---

## 정렬한 내용

### 1. Direct PostgreSQL Access

데이터베이스 접근 방향을 서버 코드의 direct PostgreSQL connection 중심으로 정렬했다.

현재 방향:

```txt
Route Handler
-> Service
-> Repository
-> queryAuthApi / queryPortalApi
-> PostgreSQL
```

이 구조는 프론트엔드를 direct DB 접근에서 분리하고,
서버 계층이 SQL/매핑/응답 contract를 명시적으로 통제하게 해준다.

---

### 2. 데이터베이스 역할 분리

역할 모델은 책임 기반 데이터베이스 접근으로 정렬했다.

```txt
auth_api     -> authentication-only database access
portal_api   -> application data access
service_role -> excluded from normal app flow
```

#### `auth_api`

로그인 및 인증 관련 접근에 사용한다.

책임:

- 자격 증명 검증
- 인증 계정 상태 조회
- 로그인 projection에 필요한 최소 employee/profile 데이터 조회
- `last_login_at` 같은 로그인 메타데이터 갱신

#### `portal_api`

인증 이후 애플리케이션 데이터 접근에 사용한다.

책임:

- 현재 사용자 프로필 데이터 해석
- Service Desk 데이터 조회/갱신
- settings 및 reference 데이터 접근
- workflow operation 지원
- DTO 기반 response 반환

#### `service_role`

일반 애플리케이션 흐름에서는 제외한다.

이는 기본 앱 동작 role이 아니라,
광범위한 관리/플랫폼 capability로 유지한다.

---

### 3. 최소 권한 접근 방향

데이터베이스 전략을 least privilege 원칙에 맞게 정렬했다.

규칙:

```txt
Use the narrowest database role that can complete the operation.
```

이 원칙은 일반 애플리케이션 쿼리에서 광범위 service role 사용을 피하고,
보안 경계를 더 명확히 설명할 수 있게 해준다.

---

### 4. Grants와 RLS 정렬

권한 모델을 다음과 같이 명확히 했다.

```txt
Effective database permission = role grants + RLS policies
```

의미:

- grants는 객체 수준 권한을 정의한다
- RLS 정책은 row 수준 접근을 정의한다
- 앱 노출 테이블은 둘 다 함께 검토해야 한다
- grants가 있어도 RLS 정책 누락 시 빈 결과가 나올 수 있다

이 규칙은 혼란스러운 앱 동작과 우발적 과권한을 예방한다.

---

### 5. 서버 데이터 계층 경계

프로젝트는 데이터베이스 접근을 서버 데이터 계층 중심으로 정렬했다.

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

이 경계는 feature UI 모듈이 아닌 서버 모듈에 DB 특화 코드를 위치시킨다.

---

### 6. Row / DTO / Mapper 분리

데이터 모델을 책임 분리 원칙으로 정렬했다.

```txt
Database Row -> Mapper -> DTO
```

#### Row

DB 결과 shape를 표현한다.

- SQL에 가깝다
- 보통 `snake_case`
- nullable DB 필드를 포함할 수 있다
- UI 데이터 용도가 아니다

#### DTO

애플리케이션 응답 shape를 표현한다.

- 보통 `camelCase`
- API 소비자에게 안정적이다
- DB 특화 naming을 숨긴다
- 프론트엔드 사용에 안전하다

#### Mapper

Row 데이터를 DTO 데이터로 변환한다.

책임:

- naming 변환
- null 정규화
- JSON 파싱/shape 구성
- response-safe 필드 선택

---

### 7. Repository와 Service 책임

Repository는 SQL 실행을 소유한다.

책임:

- parameterized SQL 정의
- `queryAuthApi` 또는 `queryPortalApi` 호출
- route handler에서 DB 접근 분리
- 로컬 컨벤션에 따라 row 또는 DTO-ready 데이터 반환

Service는 유스케이스를 조정한다.

책임:

- repository 호출 조합
- 애플리케이션 수준 규칙 적용
- 현재 사용자 컨텍스트 해석
- 응답 DTO 준비
- route handler를 얇게 유지

---

### 8. 환경 변수 경계

환경 변수는 책임 기준으로 정렬했다.

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
- DB URL과 secret은 server-only여야 한다.

---

### 9. Auth / Session 관계

데이터베이스 전략을 auth/session 모델과 정렬했다.

```txt
AuthUser    -> login/auth 데이터 접근으로 생성
SessionUser -> session-safe projection
AppUser     -> application 데이터 접근으로 해석
```

로그인은 auth 데이터 경로를 사용한다.

애플리케이션 사용자/프로필 해석은 portal 데이터 경로를 사용한다.

이 분리는 session이 전체 사용자 프로필 컨테이너가 되는 것을 방지하고,
인증 관심사와 애플리케이션 데이터 관심사를 분리한다.

---

### 10. Local / Remote 런타임 관계

데이터베이스 전략을 런타임 모델과 정렬했다.

```txt
LOCAL  -> mock-backed demo behavior
REMOTE -> database-backed application behavior
```

direct PostgreSQL 전략은 주로 REMOTE 동작과 서버 측 애플리케이션 데이터 접근에 적용된다.

LOCAL demo 동작은 안전하고 reset 가능한 데모를 위해
server-side in-memory state module을 계속 사용할 수 있다.

중요한 구분:

- local demo state는 데모 현실성을 위해 mutable하다.
- remote 데이터는 database access를 통해 영속화된다.

---

### 11. 첨부파일 및 데모 저장 경계

첨부파일 동작은 범위가 제한된 설계 영역으로 명확히 했다.

현재 local demo에서는:

- 준비된 demo 파일/이미지 자산 사용
- 제어된 reference를 통한 업로드 동작 시뮬레이션
- 임의의 비신뢰 파일 영속 저장 회피
- 데모 경계 내에서만 ticket context에 메타데이터 연결

향후 production에서는:

- storage bucket 정책
- 파일 크기 제한
- MIME/type 검증
- 접근 제어
- signed URL
- 적절한 malware/content scanning
- 정리(cleanup) 및 audit 정책

규칙:

- 데모 첨부파일 동작은 프로덕션 수준 파일 저장을 암시하면 안 된다.

---

## 결과 영향

### 긍정적 영향

- 데이터베이스 접근이 더 프로덕션 정렬됐다.
- 일반 앱 흐름에서 광범위 service-role 의존을 피한다.
- 인증 데이터 접근과 애플리케이션 데이터 접근을 더 쉽게 설명할 수 있다.
- DTO 경계가 API 응답을 더 깔끔하고 안정적으로 만든다.
- route handler를 얇고 집중된 형태로 유지할 수 있다.
- RLS와 grants를 실제 권한 모델의 일부로 함께 다룬다.
- 향후 백엔드 분리가 쉬워진다.
- 포트폴리오가 더 강한 보안/아키텍처 판단력을 보여준다.

---

### 부정적 영향 / 트레이드오프

- 단일 Supabase client 접근 경로보다 초기 설정이 복잡하다.
- 데이터베이스 grants/RLS 정책을 더 신중하게 유지해야 한다.
- Row / DTO / Mapper / Repository / Service 파일로 인한 구현 오버헤드가 증가한다.
- 관리해야 할 환경 변수가 늘어난다.
- direct PostgreSQL access에는 엄격한 server-only 규율이 필요하다.
- 권한 이슈 디버깅 시 grants와 RLS를 함께 고려해야 하므로 복잡할 수 있다.

---

## 후속 정책

- `auth_api`는 인증 관련 접근으로 제한한다.
- `portal_api`는 로그인 이후 애플리케이션 데이터 접근을 담당한다.
- 편의를 이유로 일반 앱 흐름에 `service_role`을 도입하지 않는다.
- 새 테이블 추가 시 grants와 RLS 정책을 함께 검토한다.
- route handler에 raw SQL을 두지 않는다.
- Row, DTO, Mapper, Repository, Service 경계를 명시적으로 유지한다.
- DB URL과 secret은 server-only로 유지한다.
- 적절한 guardrail 없이 프로덕션 수준 첨부파일 저장을 현재 범위로 취급하지 않는다.
- 데이터베이스 표면적이 충분히 커지면 테이블별 RLS 문서화를 추가한다.

---

## 요약

데이터베이스 전략을 direct PostgreSQL access, 역할 분리, DTO 지향 서버 데이터 경계 중심으로 정렬했다.

핵심 모델은 다음과 같다.

```txt
auth_api     -> 로그인 및 인증 데이터 접근
portal_api   -> 애플리케이션 데이터 접근
service_role -> 일반 앱 흐름에서 제외
```

이 결정은 구현 규율을 높이지만,
프로젝트를 더 안전하고 유지보수 가능하며,
프로덕션 정렬 Service Desk 포트폴리오 시스템으로서 더 신뢰 가능하게 만든다.
