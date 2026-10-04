# Boolean 명명 규칙

## 목표

이 문서는 `sunghwan-portal`의 boolean 명명 규칙을 정의합니다.

Boolean 이름은 작업 가능 여부, 현재 상태, UI 표시 방식 중 무엇을 나타내는지
드러내야 합니다. 이 규칙은 다음 영역에 적용합니다.

* 기능·애플리케이션 컴포넌트 API
* 작업 가능 여부(capability)와 권한에서 계산한 값
* 훅·컨텍스트 반환값
* 도메인·실행 중 상태
* 폼·쿼리 상태
* HTML·UI 기본 컴포넌트의 prop

프로젝트는 계층별 역할에 따라 서로 다른 명명 방식을 사용합니다.

```txt
Feature/application capability
-> can*

Runtime 또는 domain state
-> is* / has*

HTML 및 UI presentation state
-> disabled / readOnly / hidden
```

모든 부정형 boolean을 없애는 것이 목표는 아닙니다.

코드 예시는 명명 방식을 설명하며 완전한 권한 검증 구현은 아닙니다. 실제 권한은
현재 도메인 정책과 서버 접근 검사를 따라야 합니다.

사용자가 무엇을 **할 수 있는지**, 시스템이 **현재 어떤 상태인지**, UI control이
**현재 어떻게 표시되어야 하는지**를 구분하는 것이 중요합니다.

---

## 핵심 원칙

```txt
Capability는 operation을 수행할 수 있는지를 설명한다.

State는 현재 참인 것을 설명한다.

Presentation은 UI element의 동작이나 표시 방식을 설명한다.
```

예:

```ts
const canSave =
  canManage &&
  isDirty &&
  isValid &&
  !isSaving;
```

이 표현식에서:

* `canSave`는 저장 작업이 가능한지를 나타냅니다.
* `canManage`는 권한이나 다른 조건에서 계산한 관리 가능 여부입니다.
* `isDirty`는 현재 폼에 미저장 변경이 있는지를 나타냅니다.
* `isValid`는 현재 입력이 검증을 통과했는지를 나타냅니다.
* `isSaving`은 현재 저장 요청을 처리 중인지를 나타냅니다.

기능 컴포넌트는 작업이 가능한지를 나타내는 긍정형 값을 받습니다.

```tsx
<ServiceDeskSettingsHeader canSave={canSave} />
```

컴포넌트는 버튼 같은 UI 기본 컴포넌트에 전달할 때 이 값을 표시·동작 상태로 변환합니다.

```tsx
<Button disabled={!canSave}>Save</Button>
```

---

## 명명 범주

Boolean 값은 이름을 정하기 전에 먼저 분류해야 합니다.

```txt
CAPABILITY
STATE
PRESENCE
PRESENTATION
DOMAIN_STATE
EXTERNAL_CONTRACT
```

| 범주 | 의미 | 권장 명명 |
| --- | --- | --- |
| Capability | 작업을 수행할 수 있음 | `can*` |
| State | 현재 조건이 참임 | `is*` |
| Presence | 값 또는 컬렉션이 존재함 | `has*` |
| Presentation | UI 요소의 비활성·숨김·읽기 전용 상태 | 표준 UI 이름 |
| Domain state | 업무상 의미가 있는 현재 상태 | 도메인 중심 `is*` 또는 필드 이름 |
| External contract | 라이브러리, DTO, DB 또는 API에서 정의한 형식 | 정의된 명명 보존 |

---

## Capability 명명

### 규칙

사용자, 수행자 또는 컴포넌트가 작업을 수행할 수 있는지를 나타내는 Boolean에는
긍정형 `can*` 이름을 사용합니다.

예:

```ts
canCreate;
canUpdate;
canDelete;
canSave;
canReset;
canSubmit;
canManage;
canConfigure;
canAccess;
canImpersonate;
```

Service Desk 예:

```ts
canApprove;
canDecline;
canAssign;
canAssignSelf;
canAdjust;
canReject;
canMerge;
canReopen;
canResubmit;
canCancel;
canStartWork;
canUpdateRequesterTicket;
canManageCategories;
canManageApprovalSteps;
canManageAssignmentRules;
```

작업 가능 여부의 이름은 가능하면 구체적인 작업을 설명해야 합니다.

권장:

```ts
canApprove;
canManageCategories;
canStartWork;
```

너무 포괄적인 이름은 피합니다.

```ts
canDo;
canUse;
canChange;
canProcess;
canInteract;
```

도메인에서 더 넓은 개념을 이미 명확히 정의한 경우에만 포괄적인 작업 가능 여부
이름을 사용할 수 있습니다.

---

## Positive Component API

기능·애플리케이션 컴포넌트는 작업 가능 여부를 긍정형 prop으로 받아야 합니다.

권장:

```tsx
<TicketActions
  canApprove={capabilities.canApprove}
  canAssign={capabilities.canAssign}
  canReject={capabilities.canReject}
/>
```

작업 불가능 여부를 나타내는 부정형 prop은 노출하지 않습니다.

```tsx
<TicketActions
  isApproveDisabled={!capabilities.canApprove}
  isAssignDisabled={!capabilities.canAssign}
  isRejectDisabled={!capabilities.canReject}
/>
```

긍정형 컴포넌트 API를 사용하면 호출부가 작업 가능 여부를 반전해 전달할 필요가
없어 읽기 쉽습니다.

```tsx
<ServiceDeskSettingsHeader
  canSave={canSave}
  canReset={canReset}
/>
```

값을 받는 기능 컴포넌트가 작업 가능 여부를 UI 표시·동작 상태로 변환합니다.

```tsx
<Button disabled={!canSave}>Save</Button>
<Button disabled={!canReset}>Reset</Button>
```

---

## Capability와 Permission

작업 가능 여부는 여러 조건을 결합하여 계산할 수 있습니다.

```ts
const canReject =
  ticket.assignedWorker &&
  REJECTABLE_STATUSES.includes(ticket.status) &&
  !rejectMutation.isPending;
```

Capability에는 다음 조건이 포함될 수 있습니다.

* 현재 사용자 역할
* 접근 수준
* 소유권
* 승인자 배정
* 작업자 배정
* 티켓 상태
* Tenant 또는 회사 범위
* 폼 유효성
* 현재 변경 요청 상태

클라이언트에서 계산한 작업 가능 여부는 최종 권한 판단의 기준이 아닙니다.

```txt
UI capability
-> visibility와 interaction을 제어

Server authorization
-> command가 실제로 허용되는지 검증
```

서버는 계속 다음을 검증해야 합니다.

* 인증
* 권한
* 소유권
* 현재 상태
* Tenant 범위
* 액션별 입력
* 업무 상태 전환 규칙

클라이언트 컴포넌트가 이미 `can*` 값을 사용한다는 이유로 서버 검증을 제거하면
안 됩니다.

---

## Runtime State 명명

### 규칙

현재 조건이나 처리 단계의 상태를 나타내는 Boolean에는 `is*`를 사용합니다.

예:

```ts
isLoading;
isFetching;
isPending;
isSubmitting;
isSaving;
isDirty;
isValid;
isOpen;
isClosed;
isActive;
isSelected;
isExpanded;
isImpersonating;
```

이 값을 `can*`으로 바꾸면 안 됩니다.

잘못된 예:

```ts
canLoading;
canPending;
canDirty;
canOpen;
```

올바른 예:

```ts
isLoading;
isPending;
isDirty;
isOpen;
```

### Operation과 State 짝짓기

Capability와 현재 operation state에는 서로 다른 이름을 사용합니다.

```ts
canUpdate;
isUpdating;

canSave;
isSaving;

canApprove;
isApproving;

canSubmit;
isSubmitting;
```

Capability와 완료된 domain state에도 서로 다른 이름을 사용합니다.

```ts
canApprove;
isApproved;

canReject;
isRejected;

canClose;
isClosed;
```

---

## Presence 명명

### 규칙

값, 컬렉션, 조건 또는 관련 객체의 존재 여부를 나타내는 Boolean에는 `has*`를 사용합니다.

예:

```ts
hasError;
hasChildren;
hasChanges;
hasSelection;
hasActiveDraft;
hasAttachments;
hasPermission;
hasAssignees;
```

질문을 다음처럼 자연스럽게 표현할 수 있으면 `has*`를 선호합니다.

```txt
이 object가 무언가를 가지고 있는가?
```

예:

```ts
const hasAttachments =
  ticket.files.length > 0 ||
  ticket.images.length > 0;
```

Operation capability에는 `has*`를 사용하지 않습니다.

잘못된 예:

```ts
hasApprove;
hasUpdate;
hasDelete;
```

올바른 예:

```ts
canApprove;
canUpdate;
canDelete;
```

---

## Domain State 명명

부정적인 단어라고 해서 자동으로 명명 문제가 되는 것은 아닙니다.

실제 도메인 상태를 나타내는 부정적 표현이나 종료 상태의 이름은 유지합니다.

예:

```ts
isBlocked;
isBanned;
isRejected;
isDeclined;
isClosed;
isArchived;
isUnavailable;
```

이 이름은 entity가 현재 어떤 상태인지를 설명합니다.

반전된 capability를 뜻하지 않습니다.

예:

```ts
const isClosed = ticket.status === "Closed";
const canComment = !isClosed && actorCanComment;
```

`isClosed`를 다음과 같은 인위적인 positive 이름으로 바꾸지 않습니다.

```ts
isOperational;
canRemainOpen;
```

도메인 용어는 실제 도메인 모델과 일치해야 합니다.

---

## Presentation State 명명

### 규칙

UI 표시·동작 상태를 전달할 때는 표준 HTML·UI 컴포넌트 용어를 보존합니다.

일반적인 presentation prop:

```ts
disabled;
readOnly;
hidden;
required;
checked;
open;
selected;
```

예:

```tsx
<Button disabled={isPending} />
<Input readOnly={mode === "view"} />
<Select disabled={!hasOptions} />
<Dialog open={open} />
```

표준 presentation prop을 인위적인 capability 이름으로 바꾸지 않습니다.

피해야 할 예:

```tsx
<Button canInteract={!isPending} />
<Input canEdit={mode !== "view"} />
<Select canSelect={hasOptions} />
```

표준 UI prop은 화면에 표시된 컨트롤이 어떻게 동작하는지를 전달합니다.

긍정형 작업 가능 여부는 이 지점에서 UI 표시·동작 상태로 변환해야 합니다.

```tsx
function SaveButton({ canSave }: { canSave: boolean }) {
  return <Button disabled={!canSave}>Save</Button>;
}
```

---

## Feature Component와 UI Primitive

올바른 이름은 component의 책임에 따라 달라집니다.

### Feature 또는 Application Component

Feature component는 business capability를 노출해야 합니다.

```tsx
<TicketApproveAction canApprove={canApprove} />
<ServiceDeskSettingsHeader canSave={canSave} />
<UserImpersonationMenu canImpersonate={canImpersonate} />
```

### Presentational Component

순수 presentational wrapper의 실제 책임이 UI state라면 이를 노출할 수 있습니다.

```tsx
<ActionButton disabled={disabled} />
<FormField readOnly={readOnly} />
```

### UI Primitive

UI primitive는 표준 component 및 HTML semantic을 보존해야 합니다.

```tsx
<Button disabled />
<Input readOnly />
<Dialog open />
```

Boundary를 다음처럼 요약할 수 있습니다.

```txt
Application 및 feature API
-> positive capability

Presentational 및 primitive API
-> UI state
```

---

## Read-Only 명명

값이 form 또는 input presentation을 직접 제어하면 `readOnly`를 사용합니다.

```tsx
<Input readOnly={readOnly} />
```

사용자가 edit operation을 수행할 수 있는지를 나타내면 `canEdit`를 사용합니다.

```tsx
<TicketUpdateForm canEdit={canEdit} />
```

Form은 내부에서 presentation state를 도출할 수 있습니다.

```tsx
<Input readOnly={!canEdit} />
```

한 값에서 다른 값을 안전하게 도출할 수 있으면 둘을 함께 노출하지 않습니다.

```tsx
<TicketUpdateForm
  canEdit={canEdit}
  readOnly={!canEdit}
/>
```

둘을 함께 노출하면 같은 판단에 두 입력값을 사용하게 되어 서로 모순된 값을 전달할 수 있습니다.

---

## Visibility 명명

Visibility 이름은 정확한 의미와 일치해야 합니다.

사용 가능한 이름:

```ts
visible;
hidden;
shouldRender;
canView;
canAccess;
```

책임에 따라 선택합니다.

### Capability

```ts
canViewHistory;
canAccessSettings;
```

현재 사용자가 feature에 접근할 수 있는지를 나타냅니다.

### Presentation

```ts
hidden;
visible;
shouldRender;
```

UI content를 현재 렌더링해야 하는지를 나타냅니다.

예:

```ts
const canViewInternalNotes = permissions.canViewInternalNotes;
const shouldRenderNotesPanel =
  canViewInternalNotes &&
  ticket.status !== "Draft";
```

Context가 의미를 명확히 하지 않는 한 다음과 같은 모호한 이름은 피합니다.

```ts
show;
display;
available;
```

---

## Enabled 명명

Feature, configuration 또는 option이 현재 활성화되어 있는지를 설명할 때는
`isEnabled`를 사용합니다.

```ts
isDraftRecoveryEnabled;
isImpersonationEnabled;
isNotificationEnabled;
```

현재 사용자가 활성화된 feature를 사용할 수 있는지를 설명할 때는 `canUse*`를
사용합니다.

```ts
canUseImpersonation;
canUseSuperUser;
```

두 concept은 함께 존재할 수 있습니다.

```ts
const canUseImpersonation =
  isImpersonationEnabled &&
  user.canUseImpersonation;
```

설정의 활성 상태와 사용자의 이용 가능 여부를 하나의 모호한 Boolean으로 합치지 않습니다.

---

## Selection 명명

Entity의 현재 selection state에는 `isSelected`를 사용합니다.

```ts
isSelected;
isTenantSelected;
isCategorySelected;
```

선택된 value 또는 collection에는 `selected*`를 사용합니다.

```ts
selectedTenantId;
selectedTenantIds;
selectedCategory;
```

예:

```ts
const selectedTenantIds: string[] = [];
const isTenantSelected = selectedTenantIds.includes(tenant.id);
```

---

## 권장 Prefix

| 의미 | 권장 형식 | 예 |
| --- | --- | --- |
| Operation capability | `can*` | `canEdit`, `canApprove` |
| Current state | `is*` | `isPending`, `isClosed` |
| Presence | `has*` | `hasError`, `hasChildren` |
| Feature configuration | `is*Enabled` | `isDraftEnabled` |
| Feature usage capability | `canUse*` | `canUseImpersonation` |
| Render decision | `should*` | `shouldRenderActions` |
| HTML/UI disabled state | `disabled` | `ButtonProps.disabled` |
| HTML/UI read-only state | `readOnly` | `InputProps.readOnly` |
| Selected entity state | `isSelected` | `isTenantSelected` |
| Selected value | `selected*` | `selectedTenantId` |

---

## Refactor 대상 Pattern

### Negative Capability Prop

변경 전:

```tsx
<ServiceDeskSettingsHeader
  isSaveDisabled={!canSave}
  isResetDisabled={!canReset}
/>
```

변경 후:

```tsx
<ServiceDeskSettingsHeader
  canSave={canSave}
  canReset={canReset}
/>
```

Component 내부:

```tsx
<Button disabled={!canSave}>Save</Button>
<Button disabled={!canReset}>Reset</Button>
```

---

### 이중 부정

피해야 할 예:

```ts
isNotEditable;
isNotAllowed;
isNotAuthorized;
cannotSave;
disableWhenInactive;
hideIfUnauthorized;
```

값이 permission 또는 ability를 나타내면 positive capability를 선호합니다.

```ts
canEdit;
canAccess;
isAuthorized;
canSave;
isActive;
canView;
```

원래 값이 실제 domain state를 나타낸다면 이름을 기계적으로 반전하지 않습니다.

---

### 잘못된 Prefix

피해야 할 예:

```ts
isManage;
isEdit;
isDelete;
hasApprove;
hasUpdate;
canLoading;
canPending;
```

권장:

```ts
canManage;
canEdit;
canDelete;
canApprove;
canUpdate;
isLoading;
isPending;
```

---

### 노출된 Business Condition

Feature component의 presentation prop을 통해 큰 permission 표현식을 노출하지 않습니다.

```tsx
<TicketRejectAction
  disabled={
    !ticket.assignedWorker ||
    ticket.status === "Closed" ||
    rejectMutation.isPending
  }
/>
```

먼저 이름이 있는 capability를 계산하는 방식을 선호합니다.

```ts
const canReject =
  ticket.assignedWorker &&
  REJECTABLE_STATUSES.includes(ticket.status) &&
  !rejectMutation.isPending;
```

```tsx
<TicketRejectAction canReject={canReject} />
```

조건이 재사용 가능한 도메인·애플리케이션 정책이라면 JSX 호출부마다 표현식을
복제하지 않습니다. 기존 규칙, 정책 또는 계산된 작업 가능 여부를 사용합니다.

---

## 일반적으로 보존해야 하는 이름

다음 이름은 positive `can*` 형식이 아니라는 이유만으로 변경하지 않습니다.

### React Query State

```ts
isPending;
isFetching;
isLoading;
isError;
isSuccess;
enabled;
```

### React Hook Form State

```ts
isDirty;
isValid;
isSubmitting;
isSubmitted;
isSubmitSuccessful;
disabled;
```

### UI 및 HTML Prop

```ts
disabled;
readOnly;
hidden;
open;
checked;
required;
ariaDisabled;
```

### Domain State

```ts
active;
isClosed;
isRejected;
isDeclined;
isBlocked;
status;
```

### External Contract

다음에서 정의한 명명은 보존합니다.

* third-party library
* database row
* DTO contract
* HTTP request 및 response payload
* persisted metadata
* external API
* generated type

내부 component의 명명 방식을 맞추기 위해 external contract를 변경하면 안 됩니다.

필요한 경우 application-facing capability 이름으로 mapping합니다.

---

## DTO 및 Database Boundary

DB 행과 DTO에는 저장된 상태나 외부 상태를 설명하는 Boolean 필드가 있을 수 있습니다.

예:

```ts
ticket_active;
tenant_active;
assigned_worker;
assigned_approver;
```

이 field를 자동으로 `can*`으로 바꾸지 않습니다.

DB에 저장된 필드와 DTO 필드는 데이터를 설명합니다.

애플리케이션의 작업 가능 여부는 현재 수행자가 무엇을 할 수 있는지를 설명합니다.

예:

```ts
const canStartWork =
  ticket.assignedWorker &&
  ticket.status === "Assigned";
```

여기에서:

* `assignedWorker`는 현재 배정 정보를 바탕으로 계산한 DTO 값입니다.
* `canStartWork`는 배정과 상태를 바탕으로 계산한 작업 시작 가능 여부입니다.

---

## Capability Object

이미 일관된 입력·반환 형식으로 사용하는 그룹이 있다면 관련 작업 가능 여부를 묶을
수 있습니다.

```ts
type TicketCapabilities = {
  canUpdate: boolean;
  canApprove: boolean;
  canDecline: boolean;
  canAssign: boolean;
  canReject: boolean;
};
```

다음과 같은 경우 capability object를 사용합니다.

* 여러 component가 동일한 capability set을 사용함
* 값들이 하나의 calculation boundary를 공유함
* grouping이 ownership을 더 명확하게 함
* 기존 policy 또는 hook이 이미 group을 반환함

Prop 수를 줄이기 위한 목적으로만 capability object를 도입하지 않습니다.

다음과 같은 경우 individual prop도 적절합니다.

* 필요한 capability가 몇 개뿐임
* capability들이 서로 독립적임
* component가 더 넓은 permission object에 의존하면 안 됨

---

## Hook Return Value

Hook에도 같은 명명 규칙을 적용해야 합니다.

예:

```ts
type UseSettingsEditorResult = {
  isDirty: boolean;
  isSaving: boolean;
  hasValidationError: boolean;
  canSave: boolean;
  canReset: boolean;
};
```

Application hook에서 반전된 presentation value를 반환하지 않습니다.

```ts
type UseSettingsEditorResult = {
  isSaveDisabled: boolean;
  isResetDisabled: boolean;
};
```

Hook은 application capability를 표현해야 합니다. Component가 자신의 UI primitive
state를 도출해야 합니다.

---

## Context Value

Feature capability를 노출하는 context value에는 positive 이름을 사용해야 합니다.

```ts
type ServiceDeskSettingsContextValue = {
  canManageTenants: boolean;
  canManageCategories: boolean;
  canManageApprovalSteps: boolean;
  canManageAssignmentRules: boolean;
};
```

State value는 state 중심 이름을 유지해야 합니다.

```ts
type ServiceDeskSettingsContextValue = {
  isLoading: boolean;
  isSaving: boolean;
  hasError: boolean;
  selectedTenantId: string | null;
};
```

Capability와 state를 오해하기 쉬운 prefix 아래 섞지 않습니다.

---

## Default Value

선택적인 작업 가능 여부 prop은 일반적으로 기본값을 `false`로 설정해야 합니다.

```ts
type ActionProps = {
  canApprove?: boolean;
};

function TicketApproveAction({
  canApprove = false,
}: ActionProps) {
  // ...
}
```

Caller가 명시적으로 decision을 내려야 한다면 required capability prop을 선호합니다.

```ts
type ActionProps = {
  canApprove: boolean;
};
```

작업을 암묵적으로 허용하는 기본값을 선택하지 않습니다.

---

## 명명 Migration 규칙

부정형 작업 가능 여부를 긍정형으로 바꿀 때는 Boolean 논리도 함께 반전해야 합니다.

변경 전:

```ts
const isSaveDisabled = true;
```

변경 후:

```ts
const canSave = false;
```

영향을 받는 모든 위치를 확인해야 합니다.

* prop type
* hook result type
* destructuring
* default value
* caller
* conditional rendering
* event guard
* Storybook args
* test data
* mock value
* comment

Boolean의 의미를 검증하지 않고 텍스트만 기계적으로 치환하지 않습니다.

예:

변경 전:

```tsx
<ServiceDeskSettingsHeader
  isSaveDisabled={!canSave}
/>
```

변경 후:

```tsx
<ServiceDeskSettingsHeader
  canSave={canSave}
/>
```

변경 전 component 구현:

```tsx
<Button disabled={isSaveDisabled} />
```

변경 후 component 구현:

```tsx
<Button disabled={!canSave} />
```

---

## Review Checklist

Boolean을 도입하거나 이름을 변경하기 전에 다음을 확인합니다.

1. 값이 operation capability를 설명하는가?

   * `can*`을 사용합니다.

2. 현재 state를 설명하는가?

   * `is*`를 사용합니다.

3. 무언가가 존재하는지를 설명하는가?

   * `has*`를 사용합니다.

4. HTML 또는 UI primitive를 직접 제어하는가?

   * 표준 presentation prop을 사용합니다.

5. 실제 negative domain state인가?

   * Domain 용어를 보존합니다.

6. External contract가 정의한 값인가?

   * Contract를 보존하고 application boundary에서 mapping합니다.

7. Public component API를 사용하기 위해 caller가 값을 반전해야 하는가?

   * Positive capability 노출을 고려합니다.

8. Capability를 server authorization으로 오해하고 있는가?

   * 독립적인 server validation을 유지합니다.

9. 이름이 구체적인 business operation을 전달하는가?

   * 포괄적인 `canUse` 또는 `canDo`보다 구체적인 verb를 선호합니다.

10. 이름 변경에 boolean 반전이 필요한가?

    * 모든 assignment와 caller를 검증합니다.

---

## 예제

### Settings 저장

```ts
const canSave =
  canManageSettings &&
  isDirty &&
  isValid &&
  !saveMutation.isPending;
```

```tsx
<ServiceDeskSettingsHeader canSave={canSave} />
```

```tsx
<Button disabled={!canSave}>Save</Button>
```

### Ticket Approval

```ts
const canApprove =
  ticket.assignedApprover &&
  ticket.status === "Approval" &&
  !approveMutation.isPending;
```

```tsx
<TicketApproveAction canApprove={canApprove} />
```

### Impersonation

```ts
const canUseImpersonation =
  sessionUser.userScope === "INTERNAL" &&
  appUser.canUseImpersonation === true;

const isImpersonating =
  session.impersonation != null;
```

여기에서:

* `canUseImpersonation`은 feature capability입니다.
* `isImpersonating`은 현재 runtime state입니다.

### Attachment 존재 여부

```ts
const hasAttachments =
  ticket.files.length > 0 ||
  ticket.images.length > 0;
```

### Read-Only Form

```tsx
<TicketUpdateForm canEdit={canUpdateTicket} />
```

```tsx
<Input readOnly={!canEdit} />
```

---

## Anti-Pattern

### Disabled State로 노출한 Capability

```tsx
<TicketAction isDisabled={!canExecuteAction} />
```

권장:

```tsx
<TicketAction canExecute={canExecuteAction} />
```

### 인위적인 Capability로 노출한 UI Primitive

```tsx
<Button canInteract={!isPending} />
```

권장:

```tsx
<Button disabled={isPending} />
```

### Capability처럼 이름을 붙인 Runtime State

```ts
canSaving;
canLoading;
canPending;
```

권장:

```ts
isSaving;
isLoading;
isPending;
```

### Capability로 다시 쓴 Domain State

```ts
canRemainActive;
```

실제 값의 의미가 다음과 같다면:

```ts
isArchived;
```

실제 domain state를 사용합니다.

### Authorization Truth로 사용한 Client Capability

```ts
if (payload.canApprove) {
  await approveTicket();
}
```

서버의 승인 처리는 인증된 사용자, 티켓 상태, 배정 정보, 도메인 규칙을 기준으로
결정해야 합니다. 클라이언트가 보낸 작업 가능 여부를 기준으로 결정하지 않습니다.

---

## 요약

프로젝트는 역할별로 다음 명명 규칙을 따릅니다.

```txt
Feature 및 application boundary
-> positive can* capability

Runtime 및 domain state
-> is* / has*

HTML 및 UI presentation boundary
-> disabled / readOnly / hidden
```

이 규칙은 다음을 개선합니다.

* 컴포넌트 API 가독성
* 작업 가능 여부와 현재 상태의 구분
* JSX 명확성
* 훅·컨텍스트 값의 일관성
* Storybook·테스트 가독성
* UI에서 계산한 값과 서버 권한 판단의 구분

규칙은 다음을 의미하지 않습니다.

```txt
모든 negative boolean을 can*으로 변환한다.
```

실제 규칙은 다음과 같습니다.

```txt
Application boundary가 actor가 할 수 있는 일을 설명할 때는
positive capability 이름을 사용한다.

State와 presentation이 실제 책임인 곳에서는 해당 용어를 보존한다.
```
