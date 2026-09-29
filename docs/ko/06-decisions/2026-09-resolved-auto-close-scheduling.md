# Resolved 자동 종료 스케줄링 (2026-09)

## 배경

Service Desk는 이미 `Resolved -> Closed`를 시스템이 수행하는 lifecycle 전이로
정의하고 있습니다.

현재 lifecycle 계약은 다음과 같습니다.

```txt
latest resolution History timestamp
+ 7-day grace period
-> Closed
```

자동 종료는 Ticket Action이 아니며, full SLA breach 또는 escalation 모델에
포함되지 않습니다.

저장되는 결과는 다음과 같습니다.

```txt
status: Resolved -> Closed
close reason: Completed

History:
type = STATUS
event = RESOLUTION_CLOSE
source = SYSTEM_AUTO
actorUsername = null
actionNo = null
```

지원되는 경로에서는 실행 중인 Work Session도 종료합니다.

이 결정 이전에도 application에는 멱등성을 갖춘 cron 실행용 자동 종료 경로가
있었지만, 예약 실행을 어느 경계에서 수행할지는 확정되지 않았습니다.
따라서 다음 사항을 결정해야 했습니다.

- "해결 후 7일"의 정확한 의미
- 자동 종료 작업의 실행 주기
- Ticket마다 별도의 지연 실행 job이 필요한지 여부
- scheduler가 application server를 호출할지, database maintenance function을
  직접 실행할지 여부
- 재시도와 동시 workflow 변경을 처리하는 방식

---

## 문제

### 1. 일일 배치는 실제 종료 시점에 큰 차이를 만듭니다

처음 검토한 선택지는 매일 03:00과 같이 하루에 한 번 자동 종료를 실행하는 방식이었습니다.

정책을 경과 시간 기준으로 적용하면, 일일 배치에서는 Ticket의 해결 시각에 따라
실제 유예기간이 달라집니다.

```txt
02:00에 Resolved
-> 7일 뒤 02:00에 종료 조건 충족
-> 03:00 배치에서 약 7일 + 1시간 후 종료

04:00에 Resolved
-> 7일 뒤 04:00에 종료 조건 충족
-> 다음 03:00 배치에서 약 7일 + 23시간 후 종료
```

Timestamp를 비교하면 여전히 최소 7일을 보장하지만, 추가 지연이 거의 24시간에
이를 수 있습니다.

현재 prototype 범위에서는 이 간격을 줄이기 위해 시간별 polling을 선택했습니다.
이는 스케줄링의 trade-off이며, 측정된 query 성능에 대한 주장은 아닙니다.

---

### 2. 달력 날짜 비교는 유예기간의 의미를 바꿉니다

또 다른 선택지는 달력 날짜만 비교하는 방식이었습니다.

예를 들면 다음과 같습니다.

```txt
resolved date + 7 calendar days
```

이 방식은 168시간이 경과해야 하는 유예기간과 같지 않습니다.

늦은 시각에 해결된 Ticket은 일곱 번째 달력 날짜의 이른 시각에 종료 조건을
충족할 수 있으며, 이때는 24시간씩 일곱 번이 모두 경과하지 않았을 수 있습니다.

현재 설계는 일반적인 Ticket 수정 시각이 아니라 해결 History timestamp를
사용하므로, 스케줄링 규칙도 timestamp에 기반한 의미를 유지해야 합니다.

---

### 3. Ticket별 지연 실행 job은 lifecycle 조정 비용을 추가합니다

Ticket별 예약 job은 다음 시점에 정확히 실행되도록 구성할 수 있습니다.

```txt
resolvedAt + 7 days
```

하지만 Ticket은 다시 열리고 다시 해결될 수 있습니다.

따라서 Ticket별 job 모델에는 다음 동작이 추가로 필요합니다.

- 영속적인 job 생성
- 다시 열렸을 때 기존 job 취소
- 다시 해결되었을 때 job 교체
- 재시도 상태 관리
- 중복 job 방지
- 배포 또는 인프라 중단 이후 scheduler 복구

이러한 운영 장치는 현재 요구사항에 비해 복잡합니다.

Resolved 자동 종료는 lifecycle 정리 규칙이며, 실시간 SLA 마감 처리가 아닙니다.

---

### 4. 실행 경계에서 workflow 로직을 불필요하게 중복하지 않아야 합니다

두 가지 스케줄링 경계를 검토했습니다.

```txt
Supabase Cron
-> protected HTTP / Next.js endpoint
-> application service
```

그리고:

```txt
Supabase Cron
-> PostgreSQL maintenance function
```

현재 자동 종료 작업의 효과는 database 내부에 한정됩니다.

- 종료 조건을 충족하는 `Resolved` Ticket 조회
- Ticket 잠금 및 재검증
- Ticket 상태 변경
- 실행 중인 Work Session 종료
- 변경 불가능한 History 추가

현재 이 작업에는 browser state, 사용자 session authorization, notification delivery,
외부 service가 필요하지 않습니다.

인증된 HTTP 자동 종료 경로는 이미 존재합니다. Route Handler에서 cron secret을
검증하고, application service에서 lifecycle 동작을 실행합니다. 이번 결정은 예약된
REMOTE job에 database 직접 실행을 선택하여, 실행 시 application server에 대한
의존성을 피합니다.

기존 HTTP 경로는 구현된 상태로 남습니다. Database 직접 실행이 이 경로를 제거하거나
lifecycle 로직을 하나의 구현으로 통합하지는 않습니다. SQL function과 application
service의 동작 의미를 계속 일치시켜야 합니다.

---

## 결정 기준

이번 결정은 다음 사항을 우선합니다.

1. 달력 날짜로 근사하지 않고 실제 7일의 유예기간을 유지합니다.
2. 스케줄링을 단순하게 유지하고, 실행을 놓친 뒤에도 복구할 수 있게 합니다.
3. Ticket별 영속 scheduler state를 만들지 않습니다.
4. 재시도와 동시 실행에서도 멱등성을 유지합니다.
5. Ticket, Work Session, History의 정합성을 유지합니다.
6. 종료 시각의 기준을 추가하지 않고 기존 database workflow 사실을 재사용합니다.
7. 현재 포트폴리오 요구사항에 도움이 되지 않는 인프라 복잡성을 피합니다.
8. Production-aligned 설계를 유지하되, Free Plan 배포를 production-complete
   인프라로 표현하지 않습니다.

---

## 결정

### 1. 유예기간을 경과 시간으로 정의합니다

종료 조건의 경계는 다음과 같습니다.

```txt
resolvedAt = latest History timestamp that moved the Ticket to Resolved

closeEligibleAt = resolvedAt + 7 days

eligible when:
current status = Resolved
AND closeEligibleAt <= now
```

이 프로젝트에서 7일의 유예기간은 24시간씩 일곱 번이 경과한 시간을 의미합니다.
Maintenance SQL function은 timezone을 UTC로 설정하여 `interval '7 days'` 비교가
168시간의 의미를 유지하도록 합니다.

다음 값이나:

```txt
Ticket.updatedAt
```

다음 방식은:

```txt
calendar date difference
```

자동 종료 시점의 기준으로 사용하지 않습니다.

---

### 2. 가장 최근 해결 History timestamp를 사용합니다

Ticket은 다시 열린 뒤 다음 전이를 거칠 수 있습니다.

```txt
Resolved
-> Working
-> Resolved
```

가장 최근에 `Resolved`로 전이한 시점부터 새로운 유예기간이 시작됩니다.

개념적으로는 다음과 같습니다.

```txt
first resolution
-> reopen
-> second resolution
-> second resolution timestamp + 7 days
```

이전 해결 시점 때문에 다시 해결된 Ticket이 즉시 종료 조건을 충족해서는 안 됩니다.

현재 범위에서는 Ticket에 별도의 `closeEligibleAt` column을 추가하지 않습니다.

변경 불가능한 workflow History에 이미 해결 시점을 판단할 수 있는 근거가 있습니다.

---

### 3. Scheduler를 한 시간마다 실행합니다

선택한 스케줄은 매시간 정각에 maintenance function을 호출합니다.

Cron 표현식:

```txt
0 * * * *
```

시간별 실행이 중단 없이 이루어질 때 의도한 시간 관계는 다음과 같습니다.

```txt
minimum grace period
= 168 hours

time from eligibility to the next scheduled check
= approximately 0 to 1 hour
```

이는 검사 간격이며, 종료 완료 시간의 보장이 아닙니다. 실행 시간, 잠금 경합,
누락되거나 실패한 실행으로 인해 종료까지 한 시간을 넘길 수 있습니다.

Scheduler 실행 주기와 업무상 종료 조건은 의도적으로 분리합니다.

시간별 job은 Ticket이 매시간 새롭게 종료 자격을 얻는다는 뜻이 아닙니다.
정확한 timestamp 기반 유예기간이 이미 경과했는지 확인할 뿐입니다.

---

### 4. Supabase Cron을 스케줄링 trigger로 사용합니다

REMOTE에서 선택한 스케줄링 전략은 Supabase Cron / `pg_cron`으로 maintenance
작업을 호출하는 것입니다. 배포 및 예약 실행 검증은 이 결정의 채택 여부와 별도로
관리합니다.

예약할 명령은 다음과 같습니다.

```sql
select service_desk.close_expired_resolved_tickets();
```

Cron 계층은 다음 책임만 가집니다.

```txt
when the maintenance operation is invoked
```

Ticket lifecycle 규칙을 다시 정의하지 않습니다.

---

### 5. 현재 예약 작업은 maintenance database function으로 실행합니다

현재 범위에서 선택한 실행 경로는 Supabase Cron이 PostgreSQL function을 직접
호출하는 방식입니다.

```txt
Supabase Cron
-> service_desk.close_expired_resolved_tickets()
-> Ticket / Work Session / Ticket History
```

이 함수는 maintenance 전용 진입점입니다.

`SECURITY INVOKER`를 사용하며, browser-facing role에는 실행 권한을 부여하지
않아야 합니다.

따라서 scheduler는 함수를 통해 임의 호출자의 권한을 높이는 대신, 명시적으로
권한을 부여받은 database role로 실행합니다.

이 선택은 현재 database 내부에서 끝나는 lifecycle 작업에 한정됩니다.
이후 모든 예약 workflow가 PostgreSQL 안에서 실행되어야 한다는 규칙은 아닙니다.

향후 예약 workflow에 외부 연동, notification delivery, application 전용 정책 또는
다른 runtime 의존성이 필요해지면 실행 경계를 다시 검토해야 합니다.

---

### 6. Ticket 잠금을 획득한 뒤 다시 검증합니다

후보 조회만으로 Ticket 종료를 확정할 수는 없습니다.

Scheduler가 실행되는 동안 Ticket이 다시 열리거나 다른 변경이 발생할 수 있습니다.

따라서 maintenance 경로는 다음 순서를 따릅니다.

```txt
find candidate
-> acquire Ticket row lock
-> re-read current resolution evidence
-> revalidate current Resolved status and grace period
-> apply close
```

잠긴 row는 건너뛰고 다음 시간별 실행에서 다시 확인할 수 있습니다.

이는 다른 workflow가 보유한 Ticket row lock을 기다리지 않도록 합니다.
배치의 다른 모든 database 작업까지 non-blocking임을 보장하지는 않습니다.

---

### 7. Lifecycle 변경을 원자적으로 처리합니다

자동 종료 호출이 성공하면 필요한 효과는 하나의 일관된 시스템 작업으로 반영됩니다.

```txt
Resolved -> Closed
+ close reason Completed
+ finish running Work Sessions where supported
+ append RESOLUTION_CLOSE History
```

Ticket Action row는 생성하지 않습니다.

History record는 다음 형태를 유지합니다.

```txt
type = STATUS
event = RESOLUTION_CLOSE
source = SYSTEM_AUTO
actorUsername = null
actionNo = null
```

예상하지 못한 실패를 부분 성공으로 처리하지 않습니다.

여전히 종료 조건을 충족하는 Ticket은 다음 scheduler 실행에서 재시도할 기회를
얻습니다.

---

## 검토한 대안

### 대안 1 — 매일 03:00 배치

```txt
0 3 * * *
```

#### 장점

- 스케줄이 매우 단순합니다.
- Scheduler 호출 횟수가 적습니다.

#### 단점

- 정확한 7일의 종료 조건을 충족한 뒤 거의 0시간에서 거의 24시간까지 지연될 수 있습니다.
- "해결 후 7일"이라는 표현보다 실제 종료 시점의 편차가 커집니다.

#### 결론

선택하지 않았습니다.

현재 prototype에서는 Ticket별 job을 도입하지 않으면서 종료 조건 검사 간격을
줄이기 위해 시간별 polling을 선택했습니다. Query 비용에 대한 benchmark나
production 부하 검증 결과를 주장하지 않습니다.

---

### 대안 2 — 달력 날짜 기준 종료

개념적인 예시는 다음과 같습니다.

```txt
resolved_date <= current_date - 7
```

#### 장점

- 일일 배치 규칙으로 설명하기 쉽습니다.
- 날짜 비교가 단순합니다.

#### 단점

- 168시간의 경과를 보장하지 않습니다.
- 기존 timestamp 기반 유예기간의 의미를 바꿉니다.

#### 결론

채택하지 않았습니다.

현재 domain 규칙은 해결 근거 시점부터의 경과 시간을 기준으로 합니다.

---

### 대안 3 — 해결된 Ticket마다 지연 실행 job 생성

#### 장점

- 종료 조건을 충족하는 정확한 시점에 매우 가깝게 실행할 수 있습니다.
- 주기적인 조회를 피할 수 있습니다.

#### 단점

- Ticket마다 영속 scheduler state가 필요합니다.
- 다시 열리면 기존 job을 취소하거나 무효화해야 합니다.
- 다시 해결되면 job을 만들거나 교체해야 합니다.
- 재시도와 중복 job 처리가 별도의 인프라 관심사가 됩니다.
- 현재 lifecycle 정리에 필요하지 않은 정밀도를 위해 복잡성을 추가합니다.

#### 결론

현재 범위에서는 채택하지 않았습니다.

시간별 polling은 운영 복잡성을 줄이면서 현재 요구사항에 충분한 정밀도를 제공합니다.

---

### 대안 4 — Supabase Cron에서 보호된 Next.js endpoint 호출

```txt
Supabase Cron
-> authenticated HTTP request
-> Next.js Route Handler
-> server service
-> PostgreSQL
```

#### 장점

- Application workflow 실행을 server/application 경계에 유지합니다.
- 기존의 인증된 Route Handler와 application service를 재사용합니다.
- 향후 database 외부 연동을 자연스럽게 조정할 수 있습니다.

#### 단점

- 예약 호출자를 위해 기존 scheduler 전용 HTTP 인증 경계를 설정하고 유지해야 합니다.
- Database 가용성 외에 application 배포 환경의 가용성에도 의존합니다.
- 현재 효과가 모두 database 내부에 한정된 작업에 network hop을 추가합니다.
- 현재 작업이 database 내부에서 끝나더라도 예약 실행이 HTTP/application 경로에
  의존하게 됩니다.

#### 결론

예약된 REMOTE 실행 경로로 선택하지 않았습니다. HTTP 구현은 이미 존재하며
codebase에 남아 있습니다. 이번 결정은 이를 제거하지 않습니다.

향후 자동 종료가 application 또는 외부 service 동작에 의존하게 되면 이 경계는
유효한 선택지가 될 수 있습니다.

---

## 결과

### 긍정적 효과

- 자동 종료되는 모든 Ticket에 의도한 최소 168시간의 `Resolved` 유예기간을 적용합니다.
- 시간별 실행이 중단 없이 이루어지면 보통 약 한 시간 이내에 종료 조건 충족을
  감지합니다. 이는 종료 완료 시간의 상한이 아닙니다.
- 다시 열기와 재해결은 최신 해결 History timestamp를 통해 자연스럽게 유예기간을
  다시 시작합니다.
- 실행을 한 번 놓쳐도 작업 자체가 유실되지 않습니다. 종료 조건은 event 전달이
  아니라 상태에 기반하므로 다음 실행에서 처리할 수 있습니다.
- Ticket별 scheduler record나 취소 workflow가 필요하지 않습니다.
- Ticket 상태, Work Session 정리, History가 하나의 일관된 maintenance 작업으로
  유지됩니다.
- Scheduler 재시도와 동시 실행은 `Resolved` 상태에만 적용하는 멱등적 전이와
  양립합니다.
- 업무상 시간 규칙과 배치 실행 시각을 분리한 설계로 설명할 수 있습니다.

### 부정적 효과 / Trade-off

- 자동 종료가 정확히 `resolvedAt + 7 days` 시점에 실행되지는 않습니다. 다음 예약
  검사까지 거의 한 시간이 걸릴 수 있으며, 실행 시간, 잠금 경합, 누락되거나 실패한
  실행으로 인해 지연이 더 길어질 수 있습니다.
- 종료 조건을 충족하는 Ticket이 없어도 시간별 query가 실행됩니다.
- SQL function과 기존 application service가 모두 자동 종료를 구현합니다.
  두 구현의 lifecycle 의미를 현재 Ticket 설계와 계속 일치시켜야 합니다.
  예약 진입점을 하나로 선택해도 이 유지보수 비용이 없어지지는 않습니다.
- 현재 hosted database는 Supabase Free Plan을 사용하므로, project 일시 중단이나
  인프라 비가용 상태로 인해 예약 실행이 이루어지지 않을 수 있습니다. 이후 실행에서
  여전히 종료 조건을 충족하는 Ticket을 처리할 수 있지만, 이 배포를 상시 가동되는
  production scheduler로 표현해서는 안 됩니다.
- 현재 접근은 enterprise scheduler monitoring, alerting, retry 보장을 제공하지
  않습니다.

---

## 구현 참고 사항

Maintenance function은 다음 계약을 유지해야 합니다.

```txt
candidate:
  active Ticket
  current status = Resolved
  latest resolution History + 7 days <= now

execution:
  lock Ticket
  revalidate current eligibility
  close Ticket
  finish running Work Sessions where supported
  append system History
```

동시성 동작:

```txt
locked Ticket
-> skip current run
-> retry eligibility on a later hourly run
```

Authorization 경계:

```txt
maintenance database role
-> may execute function

PUBLIC / anon / authenticated
-> must not execute function
```

이 maintenance 작업에 대한 활성 scheduler 등록은 하나만 유지해야 합니다.

이후 별도의 결정으로 실행 경계를 명시적으로 변경하지 않는 한, 같은 규칙에 대해
독립적인 HTTP scheduler 경로를 동시에 활성화하지 않습니다.

구현 근거:

- `docs/db/function/close_expired_resolved_tickets.sql`: maintenance function이며,
  주석에 시간별 Cron 등록 예시가 포함되어 있습니다.
- `src/app/api/service-desk/cron/tickets/close-expired-resolved/route.ts`: 기존 HTTP
  인증 경계와 LOCAL / REMOTE 분기입니다.
- `src/server/data/serviceDesk/ticket/ticketService.ts`:
  `closeExpiredResolvedTickets`는 기존 application maintenance workflow입니다.

SQL 파일은 로컬 workspace에 있지만, `/docs/db`는 `.gitignore`에 의해 제외됩니다.
외부 repository 독자는 Git에서 추적되는 자료만으로 이 구현을 확인할 수 없습니다.
Supabase 배포와 Cron 실행은 별도로 검증되었으며, 아래 상태 항목에 기록합니다.

---

## 검증 정책

Cron 등록만으로 전체 lifecycle 동작이 입증되지는 않습니다.

검증에서는 다음을 구분해야 합니다.

```txt
1. function verification
2. scheduler invocation verification
3. end-to-end scheduled lifecycle verification
```

최소한 다음 근거가 필요합니다.

- 의도한 maintenance role로 database function을 호출할 수 있습니다.
- 종료 조건을 충족하지 않은 `Resolved` Ticket은 변경되지 않습니다.
- 종료 조건을 충족한 `Resolved` Ticket은 `Closed`로 변경됩니다.
- 종료 사유가 `Completed`로 projection됩니다.
- 지원되는 경로에서는 실행 중인 Work Session이 종료됩니다.
- `SYSTEM_AUTO`를 source로 하는 `RESOLUTION_CLOSE`가 추가됩니다.
- Ticket Action row는 생성되지 않습니다.
- 반복 실행해도 같은 Ticket이 다시 종료되지 않습니다.
- Cron 실행 이력에 시간별 job이 성공적으로 실행된 기록이 있습니다.

예약 실행 경로 자체를 관찰하기 전에는 Cron job을 등록했다는 이유만으로 예약된
자동 종료가 완전히 검증되었다고 설명해서는 안 됩니다.

Cron 등록과 호출 근거는 각각 `cron.job`과 `cron.job_run_details`에서 확인할 수
있습니다. 호출 성공 기록은 여전히 기대한 lifecycle 효과와 연결하여 확인해야 합니다.

---

## 범위 경계

이 결정은 해결된 Ticket의 lifecycle 정리를 위한 스케줄링 전략을 확정합니다.

다음 기능을 도입하지 않습니다.

- full SLA clock
- 업무시간 또는 휴일 calendar
- SLA breach detection
- escalation threshold
- notification delivery 보장
- 범용 application job queue
- Tenant별 scheduler 설정
- production-grade scheduler monitoring 또는 alerting

이 항목들은 별도의 production 관심사로 남습니다.

---

## 후속 정책

- `Resolved` 자동 종료는 최신 해결 History timestamp를 기준으로 유지합니다.
- 새로운 제품 요구사항이 명시적으로 변경하지 않는 한 유예기간은 경과 시간 기준
  7일로 유지합니다.
- 시간별 scheduler와 업무상 종료 조건을 독립적으로 유지합니다.
- History 시점을 일반적인 `Ticket.updatedAt`으로 대체하지 않습니다.
- 종료 조건 충족부터 다음 예약 검사까지 최대 한 시간인 명목상 대기 시간을 없애기
  위해서만 Ticket별 지연 실행 job을 도입하지 않습니다.
- 예약 실행용 함수에 browser/API role이 접근할 수 없도록 유지합니다.
- 향후 자동 종료에 외부 notification 또는 다른 application/runtime 동작이 필요해지면,
  scheduler가 database function을 직접 실행하는 대신 application endpoint를
  호출해야 하는지 다시 검토합니다.
- Supabase Free Plan의 일시 중단 동작은 domain lifecycle 계약이 아니라 배포의
  한계로 다룹니다.

---

## 관련 문서

- `docs/spec/ticket-system.md`
- `docs/en/03-domain/service-desk/ticket/ticket-lifecycle.md`
- `docs/en/03-domain/service-desk/ticket/ticket-history.md`
- `docs/en/03-domain/service-desk/ticket/ticket-work-session.md`
- `docs/en/03-domain/service-desk/ticket/reference/ticket-operation-rules.md`
- `docs/en/03-domain/service-desk/ticket/strategy/sla-strategy.md`
- `docs/en/05-development/releases.md`
- `docs/en/06-decisions/2026-07-ticket-action-and-history-execution.md`
- `docs/db/function/close_expired_resolved_tickets.sql` (로컬에 있으며 Git에서 제외된 SQL)
- `src/app/api/service-desk/cron/tickets/close-expired-resolved/route.ts`
- `src/server/data/serviceDesk/ticket/ticketService.ts`
- [Supabase Cron](https://supabase.com/docs/guides/cron)
- [Supabase production checklist — availability](https://supabase.com/docs/guides/deployment/going-into-prod#availability)

---

## 요약

Resolved 자동 종료는 정확한 업무상 종료 조건의 시점과 scheduler의 실행 간격을
분리합니다.

```txt
latest resolution History
+ 168 hours
-> eligible

hourly Supabase Cron
-> maintenance database function
-> lock and revalidate
-> Closed / Completed
-> Work Session cleanup
-> RESOLUTION_CLOSE / SYSTEM_AUTO
```

선택한 규칙은 Ticket별 영속 scheduler state를 도입하지 않으면서 전체 유예기간을
유지합니다. 시간별 실행이 중단 없이 이루어지면 보통 약 한 시간 이내에 종료 조건
충족을 감지합니다. 실행 시간, 잠금 경합, 누락되거나 실패한 실행으로 인해 실제
종료까지는 더 오래 걸릴 수 있습니다.

이는 lifecycle 정리 장치이며, full SLA 또는 production job-processing platform이
아닙니다.

---

## 상태

스케줄링 결정으로 채택됨(Accepted).

2026-09-28에 확인한 REMOTE 근거를 포함한 구현 및 검증 상태:

- Database maintenance function: `service_desk.close_expired_resolved_tickets()`의
  구현, Supabase 배포, 검증이 완료되었습니다.
- 대상 Resolved Ticket 종료: REMOTE에서 검증되었습니다. 168시간의 grace period가
  지난 Ticket이 close reason `Completed`와 함께 `Closed`로 전환되었습니다.
- Work Session 정리와 `RESOLUTION_CLOSE` History: 검증되었습니다. 로컬 함수
  검증은 지원되는 Work Session 정리를 확인했으며, REMOTE History에서는
  `RESOLUTION_CLOSE`, `SYSTEM_AUTO`, `actionNo = null`과 Ticket Action row가
  생성되지 않음을 확인했습니다.
- Supabase Cron schedule: 설정 및 검증이 완료되었습니다. 등록된 job은
  `service-desk-close-expired-resolved-tickets`이며 schedule은 `0 * * * *`입니다.
- 시간별 예약 호출: `cron.job_run_details`에서 5회 연속 성공을 확인했습니다.

  | 실행 시각 (UTC) | 상태 |
  | --- | --- |
  | 2026-09-28 11:00 | `succeeded` |
  | 2026-09-28 12:00 | `succeeded` |
  | 2026-09-28 13:00 | `succeeded` |
  | 2026-09-28 14:00 | `succeeded` |
  | 2026-09-28 15:00 | `succeeded` |

  `return_message = '1 row'`는 SQL 호출이 결과 row 하나를 반환했다는 의미이며,
  Ticket 한 건이 종료되었다는 뜻이 아닙니다. Ticket 종료와 History는 scheduler의
  반환 메시지와 별도로 검증했습니다.
- Maintenance SQL function을 작성했으며, 백업 DDL과 trigger를 사용해 로컬
  PGlite에서 확인했습니다. 종료 조건, 재해결, 반복 실행, History, Work Session,
  실패 시 rollback을 검증했습니다.
- 이 검증은 구현된 lifecycle 동작과 관찰된 시간별 실행을 확인합니다. Hosted 환경의
  동시성 동작, production-grade monitoring, 상시 가동 infrastructure까지 입증하지는
  않습니다. Supabase Free Plan의 가용성 제한과 위의 나머지 범위 경계는 유지합니다.
