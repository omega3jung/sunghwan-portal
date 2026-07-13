# Form 패턴

## 목표

Form은 Service Desk workflow에서 type-safe하고 독립적인 입력 처리를 제공한다.

현재 패턴:

- React Hook Form이 미저장 입력을 소유한다.
- Zod가 schema validation을 담당한다.
- React Query가 server state를 소유한다.
- feature mutation이 제출을 담당한다.
- server service가 workflow effect를 결정한다.

---

## 핵심 원칙

```txt id="form-core"
Form state는 local input state이다.
Workflow state는 server state이다.
```

Form은 workflow engine이 아니다.

---

## Form Library

Form은 `react-hook-form`을 사용한다.

장점:

- TypeScript 연동
- 효율적인 field update
- schema resolver 지원
- 명확한 reset/submit behavior
- multi-step form과의 호환성

---

## Validation

Validation은 Zod 같은 schema 기반 규칙을 사용한다.

Ticket form 예시:

- subject length limit
- required category
- workflow가 요구하는 body/content
- 오늘 이후 due date
- prepare 전 attachment field는 browser `File[]`

Client validation은 feedback을 개선한다. Server validation은 최종 권위자다.

---

## Multi-Step Form

복잡한 workflow에서 단계적 노출이 유리하면 multi-step form을 사용한다.

현재 ticket form steps:

```txt id="current-ticket-form-steps"
issueDetails
attachments
review
```

구현 정책:

- 하나의 React Hook Form instance가 모든 step을 공유한다.
- step state는 local component/hook state로 관리한다.
- step 이동은 현재 step을 검증한다.
- 최종 submit은 전체 payload를 검증한다.

---

## Create vs Update

Create와 update는 field component를 공유할 수 있지만 workflow 차이를 숨기면 안 된다.

### Create

Create flow:

- active draft load
- save-on-close draft behavior
- attachment preparation
- new ticket 또는 existing draft ticket submit
- submit 후 draft cleanup

### Update

Requester update flow:

- open 시 latest ticket detail load
- existing attachment 보존
- new attachment preparation
- existing metadata와 prepared metadata 병합
- requester update mutation
- changed fields에 따른 routing reset/preservation

---

## Attachment Fields

Raw browser `File`은 열린 form 내부에만 존재한다.

```txt id="form-attachment-boundary"
React Hook Form File[]
-> Attachment Prepare API
-> prepared metadata
-> ticket command payload
```

Raw file을 다음에 저장하지 않는다.

- React Query
- Zustand
- ticket DTO
- draft DTO
- database row

---

## Draft Forms

Draft는 단순 미저장 component state와 다르다.

REMOTE mode에서 create-ticket draft는 draft API와 React Query를 통해 로드되는
server state이다. Form은 active draft에서 hydrate하고, form values를 draft
workflow로 저장할 수 있다.

Draft는 attachment recovery를 보장하지 않는다.

---

## Field Component Policy

Reusable field component는 UI 일관성을 담당하고 business workflow를 담당하지 않는다.

좋은 field 책임:

- label
- validation message
- input binding
- disabled/loading state
- localized display

Approval routing, assignment rule, history construction을 field component에 넣지 않는다.

---

## Submission Policy

Form은 feature mutation을 통해 제출한다.

```txt id="form-submit-policy"
form validation
-> optional preparation step
-> mutation
-> server workflow
-> targeted query invalidation
```

Ticket create/update에서는 attachment preparation이 ticket mutation 전 제출
pipeline에 포함된다.

---

## State Ownership

| 상태 | 소유자 |
| --- | --- |
| editing 중 field input | React Hook Form |
| current form step | local component/hook state |
| active draft | React Query/API |
| ticket detail | React Query/API |
| settings/category options | React Query/API |
| raw files | 열린 form의 React Hook Form |
| prepared attachment metadata | API payload와 persisted ticket data |
| global UI chrome | 필요한 경우 UI store |

---

## 안티패턴

### Server Data를 Form State에 계속 보관

Form은 server data에서 hydrate할 수 있지만 server state는 React Query가 소유한다.

### Workflow Rules in Field Components

Field가 approval, assignment, status, history를 결정하지 않는다.

### 너무 이른 Generic Stepper

여러 workflow가 실제로 같은 구조를 공유하기 전까지 step logic은 workflow 가까이에 둔다.

### Silent Routing Changes

Requester update가 routing을 reset한다면 server workflow로 실행되고 history에 기록되어야 한다.

---

## 관련 문서

- [`dialog-pattern.md`](dialog-pattern.md)
- [`../06-form-design/ticket-form.md`](../06-form-design/ticket-form.md)
- [`../06-form-design/ticket-attachment.md`](../06-form-design/ticket-attachment.md)
- [`../05-data-fetching/react-query-strategy.md`](../05-data-fetching/react-query-strategy.md)

---

## 요약

현재 form pattern은 사용자 입력은 local에, server data는 React Query에,
workflow effect는 server command에 둔다. 이 구조는 ticket create, requester update,
draft, attachment preparation을 하나의 과도한 abstraction 없이 일관되게 처리한다.
