# Service Desk Cron API

이 디렉터리는 사용자 요청이 아닌 Service Desk 시스템 자동 작업용 API를 관리합니다.

- 예약 실행되는 작업은 영향받는 모듈 아래에 배치한다.
- 모든 작업은 cron secret 등 시스템 호출 전용 인증을 요구해야 한다.
- 반복 호출되어도 안전하도록 가능한 한 멱등성을 보장해야 한다.
- Route Handler는 인증과 runtime 선택만 담당하고 실제 업무 처리는 server data service에 위임한다.
- 사용자 또는 관리자가 직접 실행하는 API는 이 디렉터리에 배치하지 않는다.

현재 작업:

```text
GET|POST /api/service-desk/cron/tickets/close-expired-resolved
```
