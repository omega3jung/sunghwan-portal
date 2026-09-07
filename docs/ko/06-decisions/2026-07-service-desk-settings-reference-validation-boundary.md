# 서비스 데스크 설정 기준 데이터 검증 경계 (2026-07)

## 배경

Approval Step과 Assignment Rule editor는 company-filtered organization reference
API를 사용합니다. 선택되고 권한이 확인된 Tenant가 company ID를 제공합니다.

REMOTE write route가 제출된 모든 reference에 대해 이 작업을 반복하면 한 번의 tree
save에서도 같은 active employee 집합을 여러 번 로드한 뒤 row 단위 insert/update를
실행하게 됩니다.

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

Tree-save request는 target인 `tenantId`와 resource identity인 `categoryId`를 계속
전달합니다. Organization list request는 선택한 Tenant의 company ID만 전달합니다.
Category, purpose, data-scope, include-tenant flag는 organization lookup parameter가
아닙니다.

Approval Step validation은 target tenant의 active main category만 허용합니다.
Department, job-field, employee, manager reference는 category tenant company에서
결정되어야 합니다.

Assignment Rule validation은 target tenant의 active main category와 subcategory를
허용합니다. 모든 명시적 reference는 해당 Tenant company에 속해야 하며 최종 group은
active employee를 최소 한 명 결정해야 합니다.

LOCAL에는 PostgreSQL write boundary가 없으므로 local state를 기준으로 demo-safe
validation을 유지합니다. Validation 구현은 다르지만 LOCAL과 REMOTE는 같은 feature API
contract를 유지하고 잘못된 reference를 거부합니다.

## 결과

- REMOTE tree save에서는 category 또는 assignee마다 eligible employee lookup을 호출하지 않습니다.
- Organization validation은 N+1 대신 set-based로 수행합니다.
- Validation과 모든 row mutation이 하나의 database transaction에서 실행되어 부분 저장을 막습니다.
- Read API는 전체 목록을 application layer에서 filter하지 않고 repository SQL에서 filter합니다.
- 설정 저장 뒤 organization state가 바뀔 수 있으므로 ticket routing은 현재 eligibility를 다시 검증합니다.
