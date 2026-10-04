# 서비스 데스크 설정 기준 데이터 검증 경계 (2026-07)

## 배경

Approval Step과 Assignment Rule 편집기는 회사별 조직 참조 API를 사용합니다.
선택한 Tenant에 대한 권한을 확인한 뒤, 해당 Tenant의 회사 ID를 사용합니다.

REMOTE 저장 경로에서 제출된 참조마다 이 작업을 반복하면, 설정 트리를 한 번
저장할 때도 같은 활성 직원 목록을 여러 번 불러온 뒤 행별 생성·수정을 실행하게 됩니다.

## 결정

검증 경계를 다음과 같이 정했습니다.

```txt id="service-desk-settings-reference-validation-boundary"
Reference read API
-> company-filtered repository query 선택
-> e_company_id 기준 employee 반환
-> d_company_id 기준 department 반환
-> department.d_company_id를 통해 job field 반환

Write route
-> 인증
-> effective principal 결정
-> 저장된 tenant/category scope의 settings manage 권한 확인
-> request shape 검증

PostgreSQL write transaction
-> category, tenant, company context 파생
-> 제출된 organization reference 전체를 set-based query로 검증
-> Approval Step 또는 Assignment Rule tree mutation 적용
-> validation 또는 persistence 실패 시 전체 mutation rollback
```

설정 트리 저장 요청은 대상 테넌트인 `tenantId`와 리소스 식별자인 `categoryId`를
계속 전달합니다. 조직 목록 요청은 선택한 Tenant의 회사 ID만 전달합니다.
Category, purpose, data-scope, include-tenant 플래그는 조직 조회 매개변수가 아닙니다.

Approval Step 검증은 대상 테넌트의 활성 메인 카테고리만 허용합니다.
부서, 직무, 직원, 관리자 참조는 카테고리 테넌트의 회사에서 결정해야 합니다.

Assignment Rule 검증은 대상 테넌트의 활성 메인·서브카테고리를 허용합니다.
명시적으로 지정한 모든 참조는 해당 Tenant의 회사에 속해야 하며,
최종 그룹에서 활성 직원을 최소 한 명 결정할 수 있어야 합니다.

LOCAL은 PostgreSQL 저장 경로가 없으므로 LOCAL 상태를 기준으로 데모용 검증을
수행합니다. 검증 구현은 다르지만 LOCAL과 REMOTE는 기능 API의 응답 형식과
동작 규칙을 동일하게 유지하며 잘못된 참조를 거부합니다.

## 결과

- REMOTE 설정 트리 저장에서는 카테고리나 담당자마다 자격을 갖춘 직원 조회를 호출하지 않습니다.
- 조직 참조를 각각 조회하는 N+1 방식 대신 한 집합으로 묶어 검증합니다.
- 검증과 모든 행 변경을 한 DB 트랜잭션에서 실행해 일부 설정만 저장되는 일을 막습니다.
- 조회 API는 전체 목록을 애플리케이션에서 필터링하지 않고 Repository SQL에서 필터링합니다.
- 설정 저장 후 조직 상태가 바뀔 수 있으므로, 티켓의 담당자를 결정할 때 현재 자격을 다시 검증합니다.
