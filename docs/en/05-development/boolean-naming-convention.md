# Boolean Naming Convention

## Goal

This document defines boolean naming rules for `sunghwan-portal`.

The goal is to make boolean values communicate their responsibility clearly
across:

* feature and application component APIs
* capability and permission projections
* hooks and context values
* domain and runtime state
* form and query state
* HTML and UI primitive props

The project uses different naming styles for different layers.

```txt
Feature/application capability
-> can*

Runtime or domain state
-> is* / has*

HTML and UI presentation state
-> disabled / readOnly / hidden
```

The goal is not to eliminate every negative boolean.

The goal is to distinguish what a user **can do** from what the system **currently
is** and how a UI control should **currently render**.

---

## Core Principle

```txt
Capability describes whether an operation can be performed.

State describes what is currently true.

Presentation describes how a UI element behaves or appears.
```

Example:

```ts
const canSave =
  canManage &&
  isDirty &&
  isValid &&
  !isSaving;
```

In this expression:

* `canSave` is an application capability.
* `canManage` is a permission or capability projection.
* `isDirty` is current form state.
* `isValid` is current validation state.
* `isSaving` is current mutation state.

A feature component receives the positive capability:

```tsx
<ServiceDeskSettingsHeader canSave={canSave} />
```

The component converts it into presentation state at the UI primitive boundary:

```tsx
<Button disabled={!canSave}>Save</Button>
```

---

## Naming Categories

Boolean values should be classified before they are named.

```txt
CAPABILITY
STATE
PRESENCE
PRESENTATION
DOMAIN_STATE
EXTERNAL_CONTRACT
```

| Category          | Meaning                                         | Preferred naming                    |
| ----------------- | ----------------------------------------------- | ----------------------------------- |
| Capability        | An operation may be performed                   | `can*`                              |
| State             | A condition is currently true                   | `is*`                               |
| Presence          | A value or collection exists                    | `has*`                              |
| Presentation      | A UI element is disabled, hidden, or read-only  | standard UI name                    |
| Domain state      | A meaningful business state is currently active | domain-oriented `is*` or field name |
| External contract | A library, DTO, database, or API contract       | preserve contract naming            |

---

## Capability Naming

### Rule

Use positive `can*` names when a boolean represents whether a user, actor, or
component can perform an operation.

Examples:

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

Service Desk examples:

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

Capability names should describe a concrete operation whenever possible.

Prefer:

```ts
canApprove;
canManageCategories;
canStartWork;
```

Avoid names that are too broad:

```ts
canDo;
canUse;
canChange;
canProcess;
canInteract;
```

A broader capability name is acceptable only when the domain already defines
that broader concept clearly.

---

## Positive Component APIs

Feature and application components should receive positive capability props.

Prefer:

```tsx
<TicketActions
  canApprove={capabilities.canApprove}
  canAssign={capabilities.canAssign}
  canReject={capabilities.canReject}
/>
```

Avoid exposing negative capability props:

```tsx
<TicketActions
  isApproveDisabled={!capabilities.canApprove}
  isAssignDisabled={!capabilities.canAssign}
  isRejectDisabled={!capabilities.canReject}
/>
```

Positive component APIs improve readability because callers do not need to
invert capability values before passing them.

```tsx
<ServiceDeskSettingsHeader
  canSave={canSave}
  canReset={canReset}
/>
```

The receiving feature component converts capabilities into presentation state:

```tsx
<Button disabled={!canSave}>Save</Button>
<Button disabled={!canReset}>Reset</Button>
```

---

## Capability vs Permission

A capability can combine several conditions.

```ts
const canReject =
  ticket.assignedWorker &&
  REJECTABLE_STATUSES.includes(ticket.status) &&
  !rejectMutation.isPending;
```

A capability may include:

* current user role
* access level
* ownership
* approval assignment
* work assignment
* ticket status
* tenant or company scope
* form validity
* current mutation state

However, a client-side capability is not the authorization source of truth.

```txt
UI capability
-> controls visibility and interaction

Server authorization
-> validates whether the command is actually allowed
```

The server must continue to validate:

* authentication
* authorization
* ownership
* current status
* tenant scope
* action-specific input
* workflow transition rules

Do not remove server validation because a client component already uses a
`can*` value.

---

## Runtime State Naming

### Rule

Use `is*` when a boolean describes a current condition or lifecycle state.

Examples:

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

These values should not be converted to `can*`.

Incorrect:

```ts
canLoading;
canPending;
canDirty;
canOpen;
```

Correct:

```ts
isLoading;
isPending;
isDirty;
isOpen;
```

### Operation and State Pairing

Use different names for the capability and the current operation state.

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

Use different names for capability and completed domain state.

```ts
canApprove;
isApproved;

canReject;
isRejected;

canClose;
isClosed;
```

---

## Presence Naming

### Rule

Use `has*` when the boolean indicates whether a value, collection, condition, or
related object exists.

Examples:

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

Prefer `has*` when the question is naturally expressed as:

```txt
Does this object have something?
```

Example:

```ts
const hasAttachments =
  ticket.files.length > 0 ||
  ticket.images.length > 0;
```

Do not use `has*` for an operation capability.

Incorrect:

```ts
hasApprove;
hasUpdate;
hasDelete;
```

Correct:

```ts
canApprove;
canUpdate;
canDelete;
```

---

## Domain State Naming

A negative word is not automatically a naming problem.

Keep negative or terminal names when they represent an actual domain state.

Examples:

```ts
isBlocked;
isBanned;
isRejected;
isDeclined;
isClosed;
isArchived;
isUnavailable;
```

These names describe what the entity currently is.

They do not represent an inverted capability.

Example:

```ts
const isClosed = ticket.status === "Closed";
const canComment = !isClosed && actorCanComment;
```

Do not rename `isClosed` to an artificial positive name such as:

```ts
isOperational;
canRemainOpen;
```

Domain terminology should remain aligned with the actual domain model.

---

## Presentation State Naming

### Rule

Preserve standard HTML and UI component terminology at presentation boundaries.

Common presentation props include:

```ts
disabled;
readOnly;
hidden;
required;
checked;
open;
selected;
```

Examples:

```tsx
<Button disabled={isPending} />
<Input readOnly={mode === "view"} />
<Select disabled={!hasOptions} />
<Dialog open={open} />
```

Do not replace standard presentation props with artificial capability names.

Avoid:

```tsx
<Button canInteract={!isPending} />
<Input canEdit={mode !== "view"} />
<Select canSelect={hasOptions} />
```

The standard UI prop communicates how the rendered control behaves.

A positive capability should be converted into presentation state at this
boundary.

```tsx
function SaveButton({ canSave }: { canSave: boolean }) {
  return <Button disabled={!canSave}>Save</Button>;
}
```

---

## Feature Component vs UI Primitive

The correct name depends on the component's responsibility.

### Feature or Application Component

Feature components should expose business capabilities.

```tsx
<TicketApproveAction canApprove={canApprove} />
<ServiceDeskSettingsHeader canSave={canSave} />
<UserImpersonationMenu canImpersonate={canImpersonate} />
```

### Presentational Component

A purely presentational wrapper may expose UI state when that is its real
responsibility.

```tsx
<ActionButton disabled={disabled} />
<FormField readOnly={readOnly} />
```

### UI Primitive

UI primitives should preserve standard component and HTML semantics.

```tsx
<Button disabled />
<Input readOnly />
<Dialog open />
```

The boundary can be summarized as:

```txt
Application and feature API
-> positive capability

Presentational and primitive API
-> UI state
```

---

## Read-Only Naming

Use `readOnly` when the value directly controls form or input presentation.

```tsx
<Input readOnly={readOnly} />
```

Use `canEdit` when the value expresses whether a user may perform an edit
operation.

```tsx
<TicketUpdateForm canEdit={canEdit} />
```

The form may derive presentation state internally:

```tsx
<Input readOnly={!canEdit} />
```

Avoid exposing both values when one can be derived safely.

```tsx
<TicketUpdateForm
  canEdit={canEdit}
  readOnly={!canEdit}
/>
```

This creates two sources for the same decision and allows contradictory inputs.

---

## Visibility Naming

Visibility names should match their exact meaning.

Use:

```ts
visible;
hidden;
shouldRender;
canView;
canAccess;
```

Choose based on responsibility.

### Capability

```ts
canViewHistory;
canAccessSettings;
```

These indicate whether the current user may access a feature.

### Presentation

```ts
hidden;
visible;
shouldRender;
```

These indicate whether UI content should currently render.

Example:

```ts
const canViewInternalNotes = permissions.canViewInternalNotes;
const shouldRenderNotesPanel =
  canViewInternalNotes &&
  ticket.status !== "Draft";
```

Avoid ambiguous names such as:

```ts
show;
display;
available;
```

unless their context makes the meaning unambiguous.

---

## Enabled Naming

Use `isEnabled` when describing whether a feature, configuration, or option is
currently enabled.

```ts
isDraftRecoveryEnabled;
isImpersonationEnabled;
isNotificationEnabled;
```

Use `canUse*` when describing whether the current user may use the enabled
feature.

```ts
canUseImpersonation;
canUseSuperUser;
```

The two concepts may coexist:

```ts
const canUseImpersonation =
  isImpersonationEnabled &&
  user.canUseImpersonation;
```

Do not collapse configuration state and user capability into one ambiguous
boolean.

---

## Selection Naming

Use `isSelected` for an entity's current selection state.

```ts
isSelected;
isTenantSelected;
isCategorySelected;
```

Use `selected*` for a selected value or collection.

```ts
selectedTenantId;
selectedTenantIds;
selectedCategory;
```

Example:

```ts
const selectedTenantIds: string[] = [];
const isTenantSelected = selectedTenantIds.includes(tenant.id);
```

---

## Recommended Prefixes

| Meaning                  | Preferred form | Examples                  |
| ------------------------ | -------------- | ------------------------- |
| Operation capability     | `can*`         | `canEdit`, `canApprove`   |
| Current state            | `is*`          | `isPending`, `isClosed`   |
| Presence                 | `has*`         | `hasError`, `hasChildren` |
| Feature configuration    | `is*Enabled`   | `isDraftEnabled`          |
| Feature usage capability | `canUse*`      | `canUseImpersonation`     |
| Render decision          | `should*`      | `shouldRenderActions`     |
| HTML/UI disabled state   | `disabled`     | `ButtonProps.disabled`    |
| HTML/UI read-only state  | `readOnly`     | `InputProps.readOnly`     |
| Selected entity state    | `isSelected`   | `isTenantSelected`        |
| Selected value           | `selected*`    | `selectedTenantId`        |

---

## Patterns to Refactor

### Negative Capability Props

Before:

```tsx
<ServiceDeskSettingsHeader
  isSaveDisabled={!canSave}
  isResetDisabled={!canReset}
/>
```

After:

```tsx
<ServiceDeskSettingsHeader
  canSave={canSave}
  canReset={canReset}
/>
```

Inside the component:

```tsx
<Button disabled={!canSave}>Save</Button>
<Button disabled={!canReset}>Reset</Button>
```

---

### Double Negatives

Avoid:

```ts
isNotEditable;
isNotAllowed;
isNotAuthorized;
cannotSave;
disableWhenInactive;
hideIfUnauthorized;
```

Prefer a positive capability when the value represents permission or ability:

```ts
canEdit;
canAccess;
isAuthorized;
canSave;
isActive;
canView;
```

Do not mechanically invert the name when the original value represents a real
domain state.

---

### Incorrect Prefixes

Avoid:

```ts
isManage;
isEdit;
isDelete;
hasApprove;
hasUpdate;
canLoading;
canPending;
```

Prefer:

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

### Exposed Business Conditions

Avoid exposing a large permission expression through a feature component's
presentation prop.

```tsx
<TicketRejectAction
  disabled={
    !ticket.assignedWorker ||
    ticket.status === "Closed" ||
    rejectMutation.isPending
  }
/>
```

Prefer calculating a named capability first:

```ts
const canReject =
  ticket.assignedWorker &&
  ticket.status !== "Closed" &&
  !rejectMutation.isPending;
```

```tsx
<TicketRejectAction canReject={canReject} />
```

When the conditions represent reusable domain or application policy, prefer an
existing rule, policy, or capability projection rather than duplicating the
expression across JSX callers.

---

## Names That Should Usually Be Preserved

Do not rename these solely because they are not positive `can*` names.

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

### UI and HTML Props

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

### External Contracts

Preserve naming defined by:

* third-party libraries
* database rows
* DTO contracts
* HTTP request and response payloads
* persisted metadata
* external APIs
* generated types

External contracts should not be renamed only to satisfy internal component
naming preferences.

Map them into application-facing capability names where appropriate.

---

## DTO and Database Boundary

Database rows and DTOs may contain boolean fields that describe persisted or
external state.

Examples:

```ts
ticket_active;
tenant_active;
assigned_worker;
assigned_approver;
```

Do not automatically rename these fields to `can*`.

Persisted and DTO fields describe data.

Application capabilities describe what the current actor may do.

Example:

```ts
const canStartWork =
  ticket.assignedWorker &&
  ticket.status === "Assigned";
```

Here:

* `assignedWorker` is a DTO projection describing current assignment.
* `canStartWork` is an application capability derived from assignment and status.

---

## Capability Objects

Related capabilities may be grouped when the group already represents a stable
application contract.

```ts
type TicketCapabilities = {
  canUpdate: boolean;
  canApprove: boolean;
  canDecline: boolean;
  canAssign: boolean;
  canReject: boolean;
};
```

Use a capability object when:

* the same capability set is consumed by several components
* the values share one calculation boundary
* grouping makes ownership clearer
* an existing policy or hook already returns the group

Do not introduce a capability object solely to reduce the number of props.

Individual props remain appropriate when:

* only a few capabilities are needed
* they are independent
* the component should not depend on a broader permission object

---

## Hook Return Values

Hooks should apply the same naming rules.

Example:

```ts
type UseSettingsEditorResult = {
  isDirty: boolean;
  isSaving: boolean;
  hasValidationError: boolean;
  canSave: boolean;
  canReset: boolean;
};
```

Avoid returning inverted presentation values from application hooks:

```ts
type UseSettingsEditorResult = {
  isSaveDisabled: boolean;
  isResetDisabled: boolean;
};
```

The hook should express application capability. The component should derive its
own UI primitive state.

---

## Context Values

Context values that expose feature capabilities should use positive names.

```ts
type ServiceDeskSettingsContextValue = {
  canManageTenants: boolean;
  canManageCategories: boolean;
  canManageApprovalSteps: boolean;
  canManageAssignmentRules: boolean;
};
```

State values should remain state-oriented:

```ts
type ServiceDeskSettingsContextValue = {
  isLoading: boolean;
  isSaving: boolean;
  hasError: boolean;
  selectedTenantId: string | null;
};
```

Do not mix capability and state under misleading prefixes.

---

## Default Values

Capability props should normally default to `false` when optional.

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

However, prefer required capability props when the caller should make an
explicit decision.

```ts
type ActionProps = {
  canApprove: boolean;
};
```

Do not choose a default that silently grants an operation.

---

## Naming Migration Rules

When renaming a negative capability to a positive capability, the boolean logic
must also be inverted.

Before:

```ts
const isSaveDisabled = true;
```

After:

```ts
const canSave = false;
```

Every affected location must be checked:

* prop type
* hook result type
* destructuring
* default value
* caller
* conditional rendering
* event guard
* Storybook args
* test data
* mock values
* comments

Avoid mechanical text replacement without validating the boolean meaning.

Example:

Before:

```tsx
<ServiceDeskSettingsHeader
  isSaveDisabled={!canSave}
/>
```

After:

```tsx
<ServiceDeskSettingsHeader
  canSave={canSave}
/>
```

Component implementation before:

```tsx
<Button disabled={isSaveDisabled} />
```

Component implementation after:

```tsx
<Button disabled={!canSave} />
```

---

## Review Checklist

Before introducing or renaming a boolean, confirm:

1. Does the value describe an operation capability?

   * Use `can*`.

2. Does it describe a current state?

   * Use `is*`.

3. Does it describe whether something exists?

   * Use `has*`.

4. Does it directly control an HTML or UI primitive?

   * Use the standard presentation prop.

5. Is it a real negative domain state?

   * Preserve the domain term.

6. Is it defined by an external contract?

   * Preserve the contract and map it at the application boundary.

7. Does a caller need to invert the value to use the public component API?

   * Consider exposing a positive capability instead.

8. Is the capability being mistaken for server authorization?

   * Keep independent server validation.

9. Does the name communicate a concrete business operation?

   * Prefer a specific verb over a generic `canUse` or `canDo`.

10. Does renaming require boolean inversion?

    * Verify every assignment and caller.

---

## Examples

### Settings Save

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
  session.impersonation !== null;
```

Here:

* `canUseImpersonation` is a feature capability.
* `isImpersonating` is current runtime state.

### Attachment Presence

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

## Anti-Patterns

### Capability Exposed as Disabled State

```tsx
<TicketAction isDisabled={!canExecuteAction} />
```

Prefer:

```tsx
<TicketAction canExecute={canExecuteAction} />
```

### UI Primitive Exposed as Artificial Capability

```tsx
<Button canInteract={!isPending} />
```

Prefer:

```tsx
<Button disabled={isPending} />
```

### Runtime State Named as Capability

```ts
canSaving;
canLoading;
canPending;
```

Prefer:

```ts
isSaving;
isLoading;
isPending;
```

### Domain State Rewritten as Capability

```ts
canRemainActive;
```

when the value actually means:

```ts
isArchived;
```

Use the real domain state.

### Client Capability Used as Authorization Truth

```ts
if (payload.canApprove) {
  await approveTicket();
}
```

Server-side approval must be determined from authenticated identity, ticket
state, assignment, and domain rules—not from a client-supplied capability.

---

## Summary

The project follows this naming boundary:

```txt
Feature and application boundary
-> positive can* capability

Runtime and domain state
-> is* / has*

HTML and UI presentation boundary
-> disabled / readOnly / hidden
```

The convention improves:

* component API readability
* capability and state separation
* JSX clarity
* consistency across hooks and context values
* Storybook and test readability
* distinction between UI projection and server authorization

The rule is not:

```txt
Convert every negative boolean into can*.
```

The rule is:

```txt
Use positive capability names where an application boundary describes
what an actor can do.

Preserve state and presentation terminology where those concepts are the
actual responsibility.
```
