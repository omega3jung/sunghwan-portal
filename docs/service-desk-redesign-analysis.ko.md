# Help Desk에서 Service Desk로: 실무 경험 재설계 분석 자료

> 목적: 포트폴리오의 **"2. From Help Desk to Service Desk - 실무 경험의 재설계"** 섹션을 작성하기 위한 분석 자료다. 이 문서는 최종 포트폴리오 문안이 아니며, 확인 가능한 업무 모델과 설계 변화만 정리한다.

## 분석 범위와 판정 기준

### 시스템 명칭

- **CMS(Change Management System)**: Oracle JET/JavaScript 기반 레거시 시스템. 2020년 9월부터 실사용했다.
- **Service Hub**: Next.js 12/TypeScript 기반 개선판. CMS 기능을 온전히 구현하고 2025년 3월까지 기능을 추가했다.
- **Service Desk**: 현재 `sunghwan-portal`에 구현된 포트폴리오 시스템.

### 분석 원칙

- 현재 Service Desk는 구현과 확정된 current design이 일치하는 내용만 현재 설계로 판정했다.
- 과거 의사결정 기록은 변경 배경을 이해하는 용도로만 사용했으며 현재 설계의 기준으로 사용하지 않았다.
- 이전 시스템은 CMS 프런트엔드·ORDS·데이터베이스와 Service Hub 프런트엔드·Node API를 함께 확인했다.
- Service Hub가 호출하는 write-side ORDS module과 데이터베이스 package body는 제공 자료에 포함되지 않았다. 해당 영역은 확인 가능한 client contract까지만 분석했다.

문장 표기는 다음과 같다.

- **[사실]** 제공된 구현 또는 확정된 설계에서 직접 확인된다.
- **[사용자 제공 사실]** 저장소만으로 독립 검증하지 않았으나 이번 분석의 전제로 제공되었다.
- **[추론]** 확인된 구조에서 도출한 설계적 해석이다.
- **[미확인]** 제공 자료로 판단할 수 없다.

---

## A. 이전 시스템 요약

### A-1. 업무 목적과 주요 흐름

**[사용자 제공 사실]** CMS는 2020년 9월부터 실사용한 완전판이고, Service Hub는 CMS의 기존 기능을 보존하면서 2025년 3월까지 확장한 개선판이다.

**[사실]** 두 시스템은 다음 실무 흐름을 지원한다.

1. 사용자의 IT 요청을 티켓으로 접수한다.
2. 부서·카테고리와 요청 내용을 기준으로 승인 또는 처리 대상을 정한다.
3. 담당자가 상태, 우선순위, 카테고리, 담당자, 마감일을 관리한다.
4. 요청자와 공개 답변 또는 내부 메모를 주고받고 첨부파일을 관리한다.
5. 담당자별 투입 시간을 기록하고 변경 이력을 조회한다.
6. 승인 대기, 미해결, 종료, 기한 초과 티켓을 조회·필터링한다.

#### CMS의 구현 흐름

- 생성 UI는 `Category -> Project -> Customer -> Description -> Additional -> Submit` 단계다.
- 카테고리 설정의 project manager, approval, pre-assignee 값에 따라 일부 단계와 제출 경로가 달라진다.
- 클라이언트가 ticket ID를 먼저 확보하고 이미지·파일을 업로드한 뒤 최종 ticket 데이터를 전송한다.
- 서버는 subcategory 담당자를 먼저 찾고, 없으면 main category 담당자로 fallback한다.
- 담당 후보가 여러 명이면 이전 배정 기록을 이용해 다음 담당자를 선택한다.
- 담당자 선택에 실패하면 특정 사내 사용자에게 배정하는 fallback이 있다.
- 최종 생성 시 ticket status를 `Open`으로 저장하고 `Assignee` log를 만든다.
- 상세 조회는 ticket, note, history, track time을 각각 반환한다.
- private note는 요청 email이 agent인지에 따라 서버 조회 결과에서 필터링한다.
- ticket update는 status, category, due date, labor hours, priority, assignee, 담당자별 track time을 한 요청에서 갱신하고 `Updated` log를 추가한다.

#### Service Hub의 구현 흐름

- CMS의 list/detail/create, approval, assignment, reply, history, track time 기능을 React와 TypeScript로 재구성했다.
- 승인 대기, Open, Closed, Overdue 탭과 상세 drawer를 제공한다.
- Department가 IssueCategory, agent, ordered ApprovalStep을 포함하는 설정 모델을 도입했다.
- 읽기 API는 router, handler, DAO로 나뉜다.
- ticket 상세 handler가 ticket, reply, history, track time 조회 결과를 조합한다.
- 데이터베이스의 JSON 문자열은 handler에서 배열로 변환된다.
- 생성, 수정, 승인, reply, 첨부 mutation은 Node API가 아니라 별도 ORDS 경로를 사용한다.
- ORDS proxy는 Keycloak token을 검증하고 token의 organization을 이용해 대상 schema를 선택한다.

### A-2. 이전 업무 모델에서 확인되는 핵심 개념

- **Ticket lifecycle**: Service Hub는 `Pre | Open | Approved | Declined | Working | Pending | Resolved | Closed`를 사용한다. 승인 대기는 `type=Approval + status=Open` 조합이다.
- **Category**: CMS는 main/sub category와 category별 assignee/agent를 사용한다. Service Hub는 이를 Department, IssueCategory, ApprovalStep으로 확장했다.
- **Approval**: Service Hub는 approval type, current step, ordered approval steps와 `Approved | Declined` 결과를 가진다.
- **Assignment**: CMS는 category 기반 자동 배정, 직접 배정, assign myself, IT/Developer handoff를 지원한다. Service Hub Ticket은 현재 담당자를 하나의 assignee 배열로 표현한다.
- **Communication**: 공개 reply, private note, 첨부파일, soft delete 개념이 있다. CMS note 삭제는 active flag를 비활성화하고 별도 `Deleted` log를 추가한다.
- **History**: 별도 timeline을 제공한다. CMS와 Service Hub 모두 `Assignee` log는 history 화면에서 제외하고 assignment 또는 track-time projection에 사용한다.
- **Work tracking**: 담당자별 누적 시간을 보유하며 현재 사용자가 자신의 값을 직접 수정할 수 있다. 누적 시간은 `Assignee` log의 note 값에 저장된다.
- **Settings**: CMS는 category routing 정보와 사용자 검색 필터를 저장한다. Service Hub는 Department, IssueCategory, ApprovalStep 설정 구조를 추가했다.

### A-3. 실제 운영 구조에서 드러난 한계

1. **상태 하나가 업무 단계 하나를 뜻하지 않는다.**
   - **[사실]** 승인 대기는 `type=Approval + status=Open`이고 일반 접수도 `status=Open`이다. 현재 단계를 판단하려면 step, checking step, assignee도 함께 봐야 한다.
   - **[추론]** 전이의 의미와 허용 조건이 여러 필드 조합에 흩어져 lifecycle을 설명하고 변경하기 어렵다.

2. **업무 명령과 일반 필드 수정의 경계가 약하다.**
   - **[사실]** ticket update는 status, category, priority, assignee 등을 한 번에 받는다. 승인·배정은 reply form 또는 URL type과 결합된다.
   - **[추론]** `APPROVE`, `ASSIGN`, `REOPEN` 같은 업무 의도와 그 결과인 필드 변경이 명시적 command contract로 분리되지 않았다.

3. **승인 소유권과 작업 소유권이 하나의 assignee 표현에 겹친다.**
   - **[사실]** Service Hub Ticket에는 하나의 assignee 배열만 있고 approval/work phase별 assignee 필드는 없다.
   - **[추론]** 현재 책임자가 승인자인지 실제 작업자인지를 type, status, step에서 복원해야 한다.

4. **하나의 log 저장소가 서로 다른 책임을 가진다.**
   - **[사실]** CMS log는 timeline event뿐 아니라 active assignee, 누적 track time, 사용자 filter setting 저장에 사용된다. assignee active flag, track-time note, filter JSON은 수정된다. Service Hub도 `Assignee` log를 track time으로 읽고 history에서는 제외한다.
   - **[추론]** event history, 현재 routing state, 사용자 설정의 수명주기와 불변성 요구가 한 구조에서 충돌한다.

5. **작업 시간은 작업 증거가 아니라 담당자별 누적값에 가깝다.**
   - **[사실]** 이전 TrackTime은 담당자와 숫자 값만 가지며 시작·종료, duration의 근거, 작업 메모가 없다.
   - **[추론]** 총량은 알 수 있지만 언제 어떤 작업으로 시간이 추가되었는지 재구성하기 어렵다.

6. **표시용 history는 원인과 결과를 구조적으로 분리하지 않는다.**
   - **[사실]** history는 주로 step, type, user, date, note 형태다. CMS의 일부 operational log는 append되지만 같은 log 저장소의 다른 row는 수정된다.
   - **[추론]** 문자열 note만으로는 source, authoritative event, from/to value, 관련 command를 안정적으로 질의하기 어렵다.

7. **API와 데이터베이스 표현이 UI까지 전파된다.**
   - **[사실]** Service Hub 프런트엔드와 Node API 타입이 `sht_*`, `shr_*`, `shl_*` 필드를 직접 공유한다. handler가 JSON database 문자열을 파싱하며 mutation은 별도 ORDS 경로로 분리된다.
   - **[추론]** 저장 표현 변경이 UI에 전파되기 쉽고, 읽기와 쓰기의 정책 위치가 서로 달라 전체 workflow boundary를 한 곳에서 설명하기 어렵다.

8. **회사 고유 절차가 core 흐름에 직접 들어 있다.**
   - **[사실]** Project Manager/Customer 단계, pre-assignee, repeated program/screen, IT/Developer handoff 질문, 특정 category ID, ClickUp 호출, 특정 사내 사용자 fallback이 존재한다.
   - **[추론]** 당시 조직 운영에는 유용하지만 다른 조직에 적용 가능한 Service Desk의 보편 개념과 회사별 정책의 경계는 약하다.

9. **인증은 발전했지만 workflow authorization의 근거가 일관되게 server-derived는 아니다.**
   - **[사실]** CMS 서버는 request의 email/user level을 조회 조건과 actor 값으로 사용하는 경로가 있다. Service Hub ORDS proxy는 Keycloak token과 organization을 검증하지만 mutation body와 일부 상세 조회에는 client가 보낸 user email/name도 사용된다. Node Service Hub router 자체에는 공통 인증·tenant context middleware 적용이 보이지 않는다.
   - **[추론]** 인증된 포털 사용자라는 보장과 특정 ticket action을 실행할 권한·actor라는 보장이 module 내부에서 하나의 모델로 연결되지 않는다.
   - **[주의]** 외부 gateway, ORDS privilege 배포, 데이터베이스 package 내부 검증이 별도로 있었을 가능성은 배제할 수 없다.

---

## B. 현재 시스템 요약

### B-1. 업무 모델

현재 Service Desk는 Ticket을 수정 가능한 레코드보다 **통제된 상태 전이와 명령을 가진 workflow entity**로 정의한다. 시스템의 기준 설계도 이를 CRUD-driven이 아니라 workflow-driven system으로 규정한다.

```text
Draft
  -> Approval -> Declined -> RESUBMIT -> Approval/Assigned
  -> Assigned -> Working <-> Pending -> Resolved -> Closed
                                          ^           |
                                          +-- REOPEN --+
```

persisted status는 `Draft | Approval | Declined | Assigned | Working | Pending | Rejected | Resolved | Closed`다.

- `Approved`는 persisted status가 아니라 `APPROVAL_APPROVED` history event다.
- `REOPEN`은 `Resolved -> Working`을 수행하는 Ticket Action이다.
- `Assigned`, `Working`, `Pending`은 실제 작업 책임과 작업 진행 상태를 구분한다.
- `Rejected`는 운영자가 요청 자체를 거절한 상태이며 `Declined` 승인 거절과 구분된다.

### B-2. 새롭게 명시적으로 모델링한 개념

- **Tenant**: Category, Approval Step, Assignment Rule과 권한 범위의 소유 경계다.
- **Category as behavior configuration**: `PORTAL | INTERNAL` scope, 기본 priority/risk/SLA days, request template, main/sub hierarchy를 가진다. 분류값뿐 아니라 초기 approval/assignment와 requester update routing에 영향을 준다.
- **Approval Step**: sequence, assignee type(`MANAGER | DEPARTMENT | JOB_FIELD | EMPLOYEE`), assignee reference, skip access level을 가진다.
- **Assignment Rule**: job field와 explicit username을 조합하며 subcategory 우선, main category fallback 정책을 가진다.
- **Approval/Work phase**: approval step 존재 여부와 persisted assignee를 source of truth로 사용한다. 응답 모델은 assignment phase, approval/work assignees, current approver/current worker 여부를 계산해 제공한다.
- **Ticket Action**: `APPROVE`, `DECLINE`, `COMMENT`, `NOTE`, `ASSIGN`, `ASSIGN_SELF`, `REJECT`, `MERGE`, `ADJUST`, `REOPEN`, `RESUBMIT`, `CANCEL`을 의도가 있는 command로 모델링한다.
- **Immutable Ticket History**: broad type, producer source, authoritative event, actor, action link, from/to value, metadata를 분리한다.
- **Work Session**: worker, start/end 또는 duration, note를 가진 독립 작업 증거다. ticket의 누적 minutes는 session 결과를 집계한 projection이다.
- **Requester Update Routing Policy**: routing-sensitive field와 neutral field를 구분하고 결과를 `ROUTING_RESET | ROUTING_PRESERVED` event로 남긴다.

### B-3. 실행 구조와 경계

```text
UI
  -> feature API client / React Query
  -> Next.js Route Handler
  -> LOCAL adapter 또는 REMOTE portal API handler
  -> service
  -> repository / row mapper
  -> PostgreSQL
  -> DTO mapper
  -> application-facing domain shape
```

- Route Handler가 signed session을 해석하고 LOCAL/REMOTE를 선택하며 브라우저-facing contract를 유지한다.
- REMOTE는 database row, repository, mapper, DTO, service를 분리한다.
- Ticket Action은 normalization, authorization, action insert, ticket/routing effect, history를 한 transaction에서 수행한다.
- Work Session은 상태 변경, session row, history, resolution cleanup을 한 transaction으로 묶는다.
- LOCAL adapter는 영속 데이터베이스의 대체물이 아니라 demo runtime이다.
- LOCAL도 주요 workflow contract와 rule을 공유하고 staged commit으로 all-or-nothing 동작을 근사한다.

### B-4. 인증·권한·impersonation

- signed token/session에서 **original identity**와 **effective impersonated identity**를 분리한다.
- 권한 판단에는 브라우저가 보낸 role/company가 아니라 effective username으로 서버에서 다시 조회한 canonical user profile을 사용한다.
- Ticket Action의 actor/status guard와 Settings의 Owner Admin/Tenant Admin resource capability를 별도 정책으로 다룬다.
- tenant/company 관계와 category scope를 서버에서 검증한다.
- impersonation 중 실행 권한은 effective user를 기준으로 판단하고 server request context에는 original/effective identity를 함께 유지한다.

### B-5. 유지보수성·운영 안정성·설명 가능성

- **유지보수성 [추론]**: lifecycle, action, routing, history, work session, settings를 별도 타입과 모듈로 나눠 정책 변경의 영향 범위를 좁힌다.
- **유지보수성 [추론]**: row/DTO/domain mapping은 데이터베이스 naming 변경이 UI까지 전파되는 것을 줄인다.
- **운영 안정성 [사실+추론]**: 서버가 current status, actor, tenant/category 관계를 다시 검증한다.
- **운영 안정성 [사실+추론]**: action, effect, routing, history를 transaction으로 묶어 부분 성공과 불일치 가능성을 줄인다.
- **설명 가능성 [사실+추론]**: phase-aware assignee와 `source + event + from/to + actor + actionNo` history로 누가 어떤 명령 또는 규칙으로 무엇을 바꿨는지 구조적으로 표현한다.
- **환경 일관성 [사실+추론]**: UI가 LOCAL/REMOTE 저장 방식을 직접 분기하지 않고 같은 application contract를 사용하므로 demo와 REMOTE의 업무 언어 차이를 줄인다.

### B-6. 현재 구현의 한계

현재 구조를 완성된 엔터프라이즈 제품으로 과장해서는 안 된다. 다음은 명시적으로 deferred 또는 제한 구현이다.

- production object storage, malware scanning, signed download URL
- 실제 notification delivery
- business calendar, pause/resume, breach, escalation을 포함한 full SLA engine
- real-time update
- work-session timer/update/delete의 전체 route surface
- compliance-grade audit infrastructure
- advanced assignment load balancing

---

## C. Before / After 비교표

| 영역 | 이전 시스템 | 현재 시스템 | 개선 이유 | 확인된 근거 요약 |
| --- | --- | --- | --- | --- |
| 업무 목적 | CMS와 Service Hub 모두 IT 요청 접수, 승인, 배정, 답변, 처리 시간과 이력 관리가 목적이다. 구현은 ticket row와 관련 note/log를 조회·수정하는 구조에 가깝다. | Ticket을 draft, approval, assignment, execution, resolution, audit, work session을 거치는 workflow entity로 정의한다. | 기존 업무 목적은 유지하면서 변경 단위를 필드가 아니라 전이·명령·책임으로 재정의한다. | 이전 데이터 모델은 ticket/note/log 중심이고, 현재 모델에는 action/history/work session/settings가 독립 영역으로 존재한다. |
| Ticket lifecycle | `Pre/Open/Approved/Declined/Working/Pending/Resolved/Closed`; 승인 대기는 `type=Approval + status=Open`; UI에서 status를 일반 필드처럼 편집한다. | `Draft/Approval/Declined/Assigned/Working/Pending/Rejected/Resolved/Closed`; `Approved`는 event, `REOPEN`은 action이고 전이 규칙을 명시한다. | 하나의 status가 하나의 운영 의미를 갖게 하고 허용 전이와 actor를 검증할 수 있다. | 이전 status union과 update form, 현재 status enum과 lifecycle rule에서 확인된다. |
| 생성/Draft | client가 ID 선점 -> 첨부 업로드 -> final write를 순서대로 수행한다. CMS ticket은 최종 생성 시 `Open`; Service Hub `Pre`의 정확한 DB 의미는 미확인이다. | REMOTE는 `Draft` row, requester당 active draft 1개, final submit 시 같은 row 재사용을 명시한다. LOCAL browser draft는 별도 demo boundary다. | 임시 작성과 workflow 진입을 구분하고 draft identity/ownership을 관리한다. | 이전 create hook의 호출 순서와 현재 draft contract에서 확인된다. |
| Category | CMS main/sub category는 note 특수 행의 JSON에서 파생되고 assignee/agent를 포함한다. Service Hub는 Department 안에 IssueCategory/ApprovalStep/agent를 둔다. | Tenant-scoped main/sub Category가 scope/default/template/hierarchy를 갖고 Approval Step·Assignment Rule과 연결된다. | 분류, 승인 설정, 배정 정책을 독립된 수명주기와 검증 경계를 가진 resource로 다룬다. | 이전 category view와 Service Hub 설정 타입, 현재 category/settings 모델에서 확인된다. |
| Approval | Service Hub의 type/status/step/assignee 조합과 ordered step 배열이 승인 상태를 표현하고 `Approved/Declined` 값을 전송한다. write-side 전체 전이 검증은 미제공이다. | typed Approval Step, skip rule, current approver projection, `APPROVE/DECLINE` command와 approval event를 분리한다. | 승인 설정, 현재 승인 소유권, 사용자 명령, 결과 이력을 각각 설명할 수 있다. | 이전 approval form/type과 현재 Approval Step, Ticket Action, history event에서 확인된다. |
| Assignment | CMS는 category 후보와 이전 log로 자동 배정하고 직접 배정/자기 배정도 지원한다. 현재 담당자와 track time이 같은 `Assignee` log row에 결합된다. Service Hub Ticket은 단일 assignee 배열을 사용한다. | approval/work phase-aware assignee, Category Assignment Rule, `ASSIGN/ASSIGN_SELF`, rule resolution event와 manual update event를 구분한다. | 승인자와 작업자를 구분하고 자동 routing과 사용자 명령의 근거를 분리한다. | 이전 자동 배정 PL/SQL과 log projection, 현재 assignment policy와 phase projection에서 확인된다. |
| Ticket Action | status/category/assignee 직접 update와 reply URL type이 업무 의도를 간접 표현한다. | 12개 action union과 command별 input/actor/status/effect rule을 둔다. start-work는 action row 없는 별도 command다. | 필드 변경과 업무 명령을 분리해 validation, authorization, history를 한 단위로 연결한다. | 이전 update/reply endpoint와 현재 command type·execution rule에서 확인된다. |
| 공개 답변/내부 메모 | Note/Reply의 private flag로 구분하며 soft delete한다. | `COMMENT`와 `NOTE` action을 분리하고 note visibility를 private/shared로 표현한다. | 사용자-facing 대화와 내부 운영 맥락을 타입과 command 수준에서 명시한다. | 이전 private flag와 현재 action/visibility enum에서 확인된다. |
| Immutable Ticket History | 별도 timeline은 있지만 log는 assignee와 track time도 저장한다. CMS는 같은 log 저장소의 active flag, note, filter setting을 수정한다. | append-only event model로 type/source/event/actor/actionNo/from/to/metadata를 저장한다. operational action은 immutable하고 communication soft delete도 deletion event를 남긴다. | 현재 상태 저장과 과거 사실 기록의 책임을 분리하고 원인·결과를 재구성한다. | 이전 log update와 history query, 현재 history type과 event service에서 확인된다. |
| Work Session | 담당자별 누적 `track_time`을 `Assignee` log note에 저장하고 숫자를 직접 수정한다. | worker, start/end 또는 duration, note가 있는 독립 session을 기록하고 누적 minutes를 집계한다. | 총량뿐 아니라 작업 단위의 시간 근거와 workflow effect를 남긴다. | 이전 track-time query/edit UI와 현재 Work Session model/service에서 확인된다. |
| Settings | CMS는 category 설정을 note/JSON에, 개인 filter를 log에 저장한다. Service Hub는 Department/IssueCategory/ApprovalStep 구조를 추가했지만 agent 배열이 설정에 포함된다. | Tenant, Category, Approval Step, Assignment Rule을 first-class resource로 분리하고 capability와 reference validation을 적용한다. | 사용자 선호, 분류, 승인, 배정 정책의 서로 다른 책임과 변경 주기를 분리한다. | 이전 category/filter 저장 구조와 현재 settings resource/service에서 확인된다. |
| Requester update | requester의 subject/body 수정과 담당자의 전체 ticket update는 있으나 어떤 필드가 approval/assignment를 reset하는지는 명시적 client contract에 없다. | sensitive/neutral field를 비교해 routing reset/preserve를 결정하고 결과 event를 기록한다. | 요청 내용 변경이 기존 승인·배정 소유권에 주는 영향을 일관되게 처리한다. | 이전 update form과 현재 requester update policy/service에서 확인된다. |
| Authentication | CMS는 request identity를 사용한다. Service Hub는 NextAuth/Keycloak Bearer token을 도입했고 ORDS proxy가 token과 organization을 검증한다. | signed token/session에서 original/effective identity와 data scope를 해석하고 canonical server profile을 재조회한다. | 인증된 사용자, 실제 실행 actor, tenant scope를 같은 trusted server boundary에서 연결한다. | 이전 proxy 인증과 현재 server auth context에서 확인된다. |
| Authorization | CMS는 owner/assignee/agent와 private-note filtering을 서버 SQL에도 사용하지만 identity/user level이 request 값인 경로가 있다. Service Hub 일부 request도 user email/name을 전달한다. 외부 gateway/DB package 검증은 미확인이다. | action별 actor/status guard, settings resource capability, tenant/company eligibility를 서버에서 canonical principal 기준으로 검증한다. | UI disable과 실제 실행 권한을 분리하고 authorization의 근거와 위치를 설명할 수 있다. | 이전 request parameter/SQL filter와 현재 action/settings guard에서 확인된다. |
| Impersonation | Service Hub 포털은 Keycloak token exchange로 group account 세션을 추가한다. application-layer permission pre-check는 주석 처리되어 있고 history에 original/effective actor pair는 없다. CMS 지원 여부는 미확인이다. | original identity와 effective identity를 명시적으로 분리한다. 실행 권한은 effective user를 사용하고 server request context는 두 identity를 유지한다. | 대리 사용자 관점 재현과 실제 행위자 추적을 혼동하지 않는다. | 이전 token exchange/session 처리와 현재 auth context에서 확인된다. |
| LOCAL/REMOTE runtime | CMS는 ORDS remote를 사용한다. Service Hub는 Node API와 ORDS proxy라는 두 remote 경로를 사용하지만 동일 UI contract의 local workflow adapter는 없다. | Route Handler가 LOCAL demo adapter와 REMOTE service를 선택하고 같은 application-facing contract를 제공한다. | 포트폴리오 demo와 실제 persistence가 같은 도메인 언어와 주요 workflow rule을 공유한다. | 이전 fetch client와 현재 route/adapter 경계에서 확인된다. |
| Frontend/server/DTO/database boundary | CMS는 UI -> ORDS PL/SQL -> table/view이며 handler가 routing, persistence, email을 함께 수행한다. Service Hub read는 계층화했지만 DB-shaped 타입이 UI/API에 노출되고 write는 별도 ORDS 경로다. | feature client -> route -> handler/service -> repository/row -> mapper/DTO -> domain shape를 분리하고 UI의 DB 직접 접근을 금지한다. | 저장 구조, transport contract, 업무 모델의 변경 이유와 영향 범위를 분리한다. | 이전 PL/SQL/row-shaped type과 현재 repository/mapper/DTO 구조에서 확인된다. |
| 원자성/일관성 | CMS 단일 PL/SQL handler 안에서는 여러 DML을 함께 수행하지만 생성·첨부·최종 저장은 여러 HTTP 호출이며 명시적 보상 흐름은 확인되지 않는다. Service Hub write-side 소스는 미제공이다. | REMOTE action/work-session의 상태·subresource·history를 명시적 transaction으로 묶고 LOCAL도 validation 후 staged commit한다. | workflow 명령의 성공 여부와 상태·routing·history의 일치를 하나의 경계에서 보장한다. | 이전 client 호출 순서와 현재 transaction service에서 확인된다. |
| 회사 특화 요소 | Project Manager/Customer 단계, pre-assignee, repeated screen/program, IT/Dev handoff questionnaire, ClickUp, 특정 category ID와 사용자 fallback이 core code에 있다. | Tenant, category scope/default/template, typed approval, group assignment, generic command로 일반화하고 이전 특화 필드는 Ticket core에서 제거한다. | 특정 회사 절차를 복제하지 않고 재사용 가능한 운영 개념만 보존한다. | 이전 조건문·form·fallback과 현재 generic domain model을 비교해 확인된다. |

### C-1. 현재 시스템에서도 유지한 실무 개념

- 요청 접수와 main/sub category 분류
- category에 따른 승인 필요 여부와 순차 승인
- 자동 배정, 수동 배정, 자기 배정
- requester-facing comment와 internal note
- priority, due date, 작업 상태 관리
- 변경 history와 담당자별 작업 시간
- 검색·필터, list/detail 중심 운영 화면
- 요청자·담당자·관리자의 서로 다른 operation surface

### C-2. 제거하거나 일반화한 회사 특화 요소

| 이전 요소 | 현재 처리 | 판정 |
| --- | --- | --- |
| Project Manager 단계 | typed Approval Step의 `MANAGER` 등으로 일반화 | 일반화 |
| Customer/pre-assignee 단계 | Category, Approval Step, Assignment Rule, company eligibility로 분리 | 일반화·분리 |
| IT 담당자 -> Developer 전달 dialog | generic `ASSIGN`, `NOTE`, category rule로 분리 | 일반화 |
| repeated issue/screen/program 필드 | current Ticket core model에서 제거 | 제거 |
| 특정 category ID 조건문 | category metadata와 policy로 대체 | 제거 방향. 모든 예외 제거 여부는 현재 전체 코드 검색 범위에 한정 |
| ClickUp 직접 호출 | current Service Desk core workflow에서 확인되지 않음 | core에서 제거. 별도 integration 존재 여부는 범위 밖 |
| 특정 사내 사용자 fallback | generic assignment resolution과 무배정 상태 처리로 대체 | 제거 |
| Department가 category/approval/agent를 함께 소유 | Tenant, Category, Approval Step, Assignment Rule로 분리 | 일반화·분리 |

### C-3. 단순 기술 마이그레이션과 도메인 재설계의 구분

| 구분 | 변화 | 판정 근거 |
| --- | --- | --- |
| CMS -> Service Hub | Oracle JET/Knockout에서 Next.js 12/React/TypeScript로 이전, React Query와 typed form 도입, Node read API 계층 추가 | 기존 status/assignee/reply/history/track-time와 DB-shaped 필드를 대부분 유지했다. **기능 보존형 기술 마이그레이션과 점진 개선**의 성격이 강하다. |
| Service Hub -> Service Desk 도메인 | lifecycle 재정의, Ticket Action command, approval/work phase 분리, routing reset policy, immutable event history, Work Session, tenant-scoped settings | 업무 상태, 책임, 명령, 증거의 의미와 관계를 다시 정의했다. **도메인 재설계**다. |
| Service Hub -> Service Desk 실행 경계 | LOCAL/REMOTE runtime, trusted server principal, service/repository/row/mapper/DTO, explicit transaction | 도메인 규칙을 일관되게 실행·보호하기 위한 **아키텍처 재설계**다. |

---

## D. 포트폴리오에서 강조할 핵심 변화 Top 7

아래는 최종 포트폴리오 문장이 아니라 강조 가치와 근거다.

### 1. 상태 필드 중심 티켓을 명시적 workflow entity로 재정의

- 이전에는 status, type, step, assignee 조합으로 업무 단계를 해석했다.
- 현재는 persisted lifecycle과 허용 action을 명시한다.
- **강조 가치**: 업무 흐름의 설명 가능성, 불가능한 전이 차단, 상태별 UI·권한 기준의 일관성.

### 2. 일반 수정과 업무 명령을 분리하고 서버 transaction에서 실행

- 이전에는 ticket update, reply type, endpoint suffix가 승인·배정·상태 변경 의도를 함께 표현했다.
- 현재는 Ticket Action command가 authenticate -> authorize -> validate -> effect -> history를 연결한다.
- **강조 가치**: command 성공과 상태·routing·history의 일치, 부분 성공 위험 감소.

### 3. 승인 소유권과 작업 소유권을 phase-aware routing으로 분리

- 이전 단일 assignee 배열과 주변 필드에서 현재 책임을 추론했다.
- 현재는 ordered Approval Step과 Category Assignment Rule을 별도 policy로 두고 phase별 assignee를 projection한다.
- **강조 가치**: 승인자/작업자 혼동 감소, routing 근거의 명시화와 확장성.

### 4. 다목적 log와 누적 시간을 immutable event history와 Work Session으로 재설계

- 이전 log는 timeline, assignee, track time, 사용자 filter까지 함께 저장했다.
- 현재 history는 event evidence, Work Session은 work evidence, settings는 behavior configuration으로 책임을 분리한다.
- **강조 가치**: 누가 무엇을 왜 바꿨는지와 언제 어떤 작업을 했는지 재구성 가능.
- **주의**: compliance-grade audit 완성으로 표현해서는 안 된다.

### 5. 회사 전용 조건문을 tenant/category 기반 behavior settings로 일반화

- Project Manager/Customer, IT/Developer handoff, 특정 category/user fallback을 core workflow에서 제거했다.
- Tenant -> Category -> Approval Step/Assignment Rule이 future workflow behavior를 결정한다.
- **강조 가치**: 특정 회사 절차의 복제가 아니라 실무에서 검증된 개념의 재사용 가능한 모델화.

### 6. 인증된 세션과 workflow actor를 trusted server boundary에서 연결

- Service Hub도 Keycloak 인증과 impersonation을 지원했지만 ticket payload의 actor와 workflow authorization은 여러 경로에 흩어졌다.
- 현재는 original/effective identity, canonical user profile, action guard, tenant eligibility를 서버 정책으로 연결한다.
- **강조 가치**: 화면 제어와 실제 권한의 분리, impersonation 상황의 설명 가능성.

### 7. DB-shaped 통합과 분산된 remote 경로를 application contract 중심 구조로 전환

- 이전 Service Hub는 read API와 ORDS write를 나누고 `sht_*` row shape를 UI까지 노출했다.
- 현재는 row/DTO/domain/UI 경계를 두고 LOCAL/REMOTE가 같은 application-facing contract를 사용한다.
- **강조 가치**: 저장 기술과 UI 업무 모델의 결합 감소, demo와 remote 구현의 도메인 일관성.

---

## E. 확실한 사실과 추론 구분

### E-1. 확실한 사실

- CMS와 Service Hub는 ticket list/detail/create, approval, assignment, reply/private note, history, track time을 구현한다.
- CMS는 Ticket, Note, Log의 세 구조를 핵심 저장 모델로 사용한다.
- CMS category는 Note의 특수 행과 JSON을 해석해 구성된다.
- CMS Log는 assignment, track time, filter setting, history에 함께 쓰인다.
- CMS는 category와 이전 배정 log를 이용한 자동 배정과 main-category fallback을 구현한다.
- Service Hub는 `Pre/Open/Approved/Declined/Working/Pending/Resolved/Closed` status union을 사용한다.
- Service Hub는 Department, IssueCategory, ApprovalStep 설정 구조를 가진다.
- Service Hub Node API의 read path는 router, handler, DAO로 나뉜다.
- Service Hub의 UI/API 타입은 DB-shaped `sht_*`, `shr_*`, `shl_*` 필드를 노출한다.
- Service Hub mutation은 ORDS proxy를 경유하고 proxy는 Keycloak token과 organization schema를 검증한다.
- Service Hub 포털은 Keycloak token exchange 기반 impersonation과 복수 사용자 session을 구현한다.
- 현재 Service Desk의 Ticket Action, Ticket History, Work Session은 별도 domain model이다.
- 현재 approval/work assignment projection, tenant-scoped settings, category defaults/scope, typed approval assignee, group assignment rule이 구현되어 있다.
- 현재 REMOTE Ticket Action과 Work Session은 explicit transaction boundary를 가진다.
- 현재 Route Handler는 LOCAL/REMOTE를 분기하고 application-facing response mapping을 적용한다.
- 현재 auth는 original/effective identity를 분리하고 canonical server profile을 조회한다.
- 현재 production object storage, real notification, full SLA, real-time, compliance-grade audit 등은 완료 범위가 아니다.

### E-2. 근거 있는 추론

- CMS/Service Hub의 상태 모델은 여러 필드 조합 해석이 필요해 현재 모델보다 전이 규칙을 설명하고 변경하기 어렵다.
- log에 event, current assignment, track time, filter setting을 함께 저장하면 각 데이터의 수명주기와 불변성 요구가 충돌한다.
- 이전 누적 track time보다 Work Session이 작업 증거와 상태 전이를 더 잘 설명한다.
- `source/event/from/to/actionNo`를 가진 현재 history가 이전 문자열 note 중심 history보다 원인과 결과를 재구성하기 쉽다.
- 명시적 command와 transaction은 상태만 변경되거나 history만 남는 불일치 가능성을 줄인다.
- settings와 command를 분리한 현재 구조는 회사별 조건문을 줄이고 새 category/workflow 추가 시 변경 범위를 좁힌다.
- canonical principal과 server-side action guard는 client가 보낸 actor field에 의존하는 구조보다 권한 근거를 일관되게 만든다.
- DTO/mapper와 application contract는 UI-DB 결합을 낮추고 테스트 가능한 경계를 늘린다.

이 추론들은 설계 비교로는 타당하지만 장애율 감소, 개발 시간 단축, 처리 속도 향상 같은 **정량 효과**를 증명하지 않는다. 별도 운영 지표 없이 수치화하면 안 된다.

### E-3. 표현 시 피해야 할 과장

- “완전한 ITSM/ITIL 시스템”
- “엔터프라이즈급 SLA 엔진 완성”
- “감사 규정을 충족하는 audit system”
- “LOCAL과 production이 완전히 동일”
- “CMS/Service Hub에는 인증이나 서버 로직이 없었다”
- “Service Hub는 단순 프런트엔드 교체뿐이었다”
- “재설계로 장애 또는 처리 시간이 특정 비율 감소했다”

---

## F. 이전 시스템 자료가 부족해서 확인할 수 없는 항목

1. **Service Hub write-side ORDS와 데이터베이스 package의 전체 구현**
   - 프런트엔드가 mutation endpoint를 호출하고 Node DAO가 Service Hub package를 호출하지만 해당 ORDS module, package body, Service Hub table DDL은 제공 자료에서 확인되지 않았다.

2. **Service Hub lifecycle의 서버 전이표**
   - client status와 endpoint는 확인되지만 어떤 status/actor 조합을 데이터베이스 package가 거부했는지는 알 수 없다.

3. **Service Hub approval pipeline의 전체 서버 규칙**
   - ordered step과 approval UI는 확인되지만 skip, 대리 승인, approver eligibility, 다단계 종료의 write-side 구현은 미제공이다.

4. **CMS operational history row 자체의 강제 불변성**
   - assignment/filter/track-time row가 수정되는 것은 확인했다. timeline용 `Updated/Replied/Deleted` row에 대한 DB trigger, UPDATE/DELETE 차단 정책은 제공 DDL에 없다.

5. **배포 환경의 최종 authorization 경계**
   - repository 안의 proxy, middleware, ORDS 정의는 확인했지만 외부 API gateway, ORDS privilege mapping, network ACL, 데이터베이스 package 내부 권한 검증의 실제 배포 구성은 알 수 없다.

6. **CMS impersonation 지원 여부**
   - 지정된 CMS module에서 관련 구현을 찾지 못했다. 포털 전체나 외부 인증 시스템에 별도 기능이 있었는지는 판단할 수 없다.

7. **이전 시스템의 LOCAL/demo runtime 전략**
   - CMS와 Service Hub는 remote endpoint 호출을 사용한다. 별도 mock/demo deployment가 저장소 밖에 있었는지는 알 수 없다.

8. **이전 생성·첨부 다단계 처리의 보상 로직**
   - client 호출 순서는 확인되지만 중간 실패 시 예약 ID나 업로드 파일을 정리하는 외부 job 또는 운영 절차가 있었는지는 알 수 없다.

9. **SLA, notification, auto-close, escalation의 실제 운영 보장**
   - due date, overdue, email 전송, ClickUp 호출은 보이지만 SLA clock, retry/delivery guarantee, 자동 종료·에스컬레이션 정책의 전체 범위는 확인되지 않는다.

10. **운영 성과의 정량 비교**
    - 티켓 건수, 평균 처리 시간, 장애 빈도, 배포 주기, 사용자 수, 응답 성능 자료가 없어 개선 효과를 수치화할 수 없다.

11. **CMS와 Service Hub의 기능 동등성에 대한 독립 검증**
    - 기능 동등성은 **[사용자 제공 사실]**이다. 두 운영 배포본의 endpoint 목록, 테스트 결과, 운영 화면을 통한 독립 검증은 이번 범위에 없다.

---

## 분석 결론

1. 이전 시스템의 핵심 가치는 실제 IT 요청을 접수하고 승인·배정·소통·이력·작업 시간을 운영한 경험이다.
2. CMS에서 Service Hub로의 변화는 기존 업무 기능을 보존하면서 프런트엔드 타입 안정성, read API 계층, Keycloak 인증, 설정 구조를 개선한 **기술 마이그레이션과 점진적 개선**으로 분류할 수 있다.
3. Service Hub에서 현재 Service Desk로의 변화는 같은 화면을 다시 만든 것이 아니라 이전의 status/type/step/assignee/log에 분산된 업무 의미를 lifecycle, command, phase-aware routing, immutable history, Work Session, behavior settings로 재구성한 **도메인 재설계**다.
4. 현재 구조의 가장 큰 차이는 기능 수가 아니라 **업무 규칙이 어디에 있고, 누가 실행할 수 있으며, 어떤 상태와 기록을 남기는지 설명 가능한 경계**를 만든 데 있다.
5. 포트폴리오에서는 production-complete나 정량 성과를 주장하기보다 운영 경험에서 발견한 구조 문제를 어떤 명시적 업무 모델과 실행 경계로 바꾸었는지에 초점을 맞추는 것이 근거에 가장 충실하다.
