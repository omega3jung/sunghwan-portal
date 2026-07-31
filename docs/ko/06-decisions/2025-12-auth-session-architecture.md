# 2025-12 인증/세션 아키텍처 결정

## 배경

이 프로젝트는 레거시 **Next.js v12 (Page Router)** 시스템을
**Next.js 14 (App Router)** 로 마이그레이션하는 것에서 시작되었다.

기존 시스템은 다음과 같은 특성을 가지고 있었다.

- 페이지 단위 상태 관리에 의존했다
- 인증 로직과 UI 로직이 섞여 있었다
- 세션 처리가 임시방편으로 구성되어 있었고 NextAuth 패턴과 완전히 맞지 않았다

마이그레이션 과정에서의 목표는 다음과 같았다.

- **프로덕션 수준의 인증 아키텍처**를 수립한다
- **NextAuth v4 (JWT 전략)** 와 정렬한다
- 인증, 세션, 클라이언트 상태의 책임을 분리한다
- **데모(local)** 와 **실제(remote)** 로그인 흐름을 모두 지원한다

---

## 문제

### 1. 세션 책임의 경계가 모호함

- 인증, 세션, UI 상태가 강하게 결합되어 있었다
- 다음 경계가 명확하지 않았다
  - 서버 신원(auth)
  - 클라이언트 런타임 상태(session)

---

### 2. `useSession()`의 활용 범위가 제한적임

NextAuth는 다음을 제공한다.

```ts
useSession();
```

하지만:

- React 컴포넌트 내부에서만 사용할 수 있다
- 서비스나 유틸리티에서는 접근할 수 없다
- 불필요한 리렌더링을 유발할 수 있다
- 전역 상태처럼 다루기 어렵다

---

### 3. 데이터 소스가 혼합되어 있음

시스템은 다음 두 흐름을 모두 지원해야 했다.

- LOCAL (demo/mock)
- REMOTE (real API)

이로 인해 다음 영역의 복잡성이 증가했다.

- 세션 일관성
- 권한 처리
- 데이터 소스 전환

---

## 검토한 선택지

### 선택지 1. NextAuth Session만 사용

- `useSession()`에 전적으로 의존한다

**장점**

- 단순하다
- 기본적인 NextAuth 패턴을 따른다

**단점**

- 전역적으로 접근하기 어렵다
- React 바깥 로직과 통합하기 어렵다
- 세션 생명주기를 세밀하게 제어하기 어렵다

---

### 선택지 2. 완전한 커스텀 세션 시스템

- NextAuth의 session 추상화를 사용하지 않는다
- 인증 + 세션 레이어를 직접 구축한다

**장점**

- 완전한 제어가 가능하다

**단점**

- 인증 시스템을 다시 만드는 셈이 된다
- 복잡도가 증가한다
- 보안 리스크가 커진다

---

### 선택지 3. 하이브리드 접근 방식 (채택)

```txt
NextAuth (JWT + Session)
+ Zustand (client session store)
```

---

## 결정

다음과 같은 **하이브리드 세션 아키텍처**를 채택한다.

### 1. NextAuth

- 인증을 담당한다
- JWT를 발급한다(상태 비저장 신원 정보)
- session 추상화를 제공한다

---

### 2. JWT

- 신원 정보의 source of truth다
- HTTP-only 쿠키에 저장된다
- 인가 처리를 위해 middleware에서 사용된다

---

### 3. Session (NextAuth)

- JWT에서 파생된다
- UI 소비를 위해 사용된다

---

### 4. authSessionStore (Zustand)

- 클라이언트 측 세션 캐시다
- 전역 접근 경로를 제공한다
- NextAuth session과 동기화된다

---

### 5. Facade Hook

```txt
useCurrentSession()
```

- NextAuth + Zustand를 결합한다
- UI를 위한 단일 인터페이스를 제공한다

---

## 아키텍처 개요

```txt
Login -> authorize()
-> JWT 발급
-> Cookie 저장

Request -> middleware -> JWT 검증

Client -> useSession()
-> sync -> authSessionStore

UI -> useCurrentSession()
```

---

## 근거

### 1. 관심사 분리

| 레이어   | 책임                   |
| -------- | ---------------------- |
| NextAuth | 인증                   |
| JWT      | 신원                   |
| Session  | 런타임 컨텍스트        |
| Zustand  | 클라이언트 접근 레이어 |

---

### 2. 유연성

- LOCAL과 REMOTE 흐름을 모두 지원할 수 있다
- 앞으로 다음 기능을 수용할 수 있다
  - impersonation
  - role-based access
  - multi-client logic

---

### 3. 실용성

- React hook 바깥에서도 접근이 가능해진다
- UI 소비 방식이 단순해진다
- 서버 측 검증 구조를 유지할 수 있다

---

## 트레이드오프

### 복잡도 증가

- 여러 레이어가 생긴다
  - JWT
  - Session
  - Zustand

---

### 동기화 비용

- NextAuth와 Zustand를 동기화해야 한다
- 주의 깊게 다루지 않으면 stale state가 생길 수 있다

---

### 중복 위험

- 동일한 데이터가 다음 위치에 존재한다
  - JWT
  - Session
  - Store

완화 방안:

- JWT = source of truth
- Store = cache only

---

## 핵심 설계 결정

### 1. JWT를 source of truth로 둔다

- 클라이언트 상태만 단독으로 신뢰하지 않는다
- 인증 판단은 항상 JWT를 기준으로 한다

---

### 2. Session은 projection이다

- Session이 원본은 아니다
- UI 사용을 위해 JWT에서 파생된 표현이다

---

### 3. Zustand는 접근 레이어이지 권한 주체가 아니다

```txt
Zustand는 캐시이지 source of truth가 아니다
```

---

### 4. Hook 안에 비즈니스 로직을 넣지 않는다

- `useCurrentSession`은 **facade**다
- 클라이언트 내부에서 권한 계산을 수행하지 않는다

---

### 5. 인가는 서버가 소유한다

- permission / role 로직은 서버 측에서 처리한다
- 클라이언트는 결과를 소비만 한다

---

## 기각한 패턴

### `localStorage`에 JWT 저장

- 보안 위험이 크다(XSS)

---

### 인증을 클라이언트 상태에만 의존

- 안전하지 않다
- 신뢰할 수 없다

---

### 인증 로직과 UI 로직 혼합

- 동작이 일관되지 않게 된다
- 유지보수가 어려워진다

---

## 향후 고려 사항

- refresh token 전략 추가
- role hierarchy 로직 도입
- impersonation 지원 확장
- 토큰 크기 최적화 검토

---

## 결과

최종 아키텍처는 다음을 만족한다.

- NextAuth 모범 사례와 정렬된다
- App Router + Edge Middleware를 지원한다
- 확장 가능하고 유연한 인증 시스템을 제공한다
- 서버와 클라이언트의 책임을 명확히 분리한다

---

## 요약

```txt
JWT -> 신원 정보 (서버 기준 truth)
Session -> UI 컨텍스트
Zustand -> 클라이언트 접근 레이어
```

이 결정은 다음 균형을 맞추는 **하이브리드 세션 아키텍처**를 확립한다.

- 정확성(server-driven auth)
- 사용성(client access)
- 확장성(stateless design)
