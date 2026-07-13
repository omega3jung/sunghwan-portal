# Dialog Pattern

## Goal

Dialogs are used for focused, temporary interactions. They should not replace
page-level Service Desk workflows.

The current Service Desk UI uses dialogs for:

- ticket creation
- requester-owned ticket update
- ticket action command forms
- confirmations where needed

Ticket detail remains a page.

---

## Core Principle

```txt id="dialog-core"
Use dialogs for focused actions.
Use pages for primary workflows.
```

---

## Page vs Dialog

| Use Dialog | Use Page |
| --- | --- |
| short form | long-lived workflow |
| command execution | ticket detail |
| confirmation | list/search workflow |
| temporary interaction | shareable resource view |

Examples:

- create ticket -> dialog
- requester update -> dialog
- approve/reject/comment/note/assign action -> dialog/tool surface
- ticket detail -> page

---

## Current Ticket Dialogs

### Create Ticket Dialog

`CreateTicketDialog` owns the new ticket workflow.

Responsibilities:

- manage the create form steps
- load active draft where available
- save draft on close when dirty
- prepare attachments before submit
- call the create-ticket mutation
- reset and close after success

### Update Ticket Dialog

`UpdateTicketDialog` owns requester-owned update before active work starts.

Responsibilities:

- load latest ticket detail when opened
- preserve existing prepared attachments
- prepare newly added files/images
- submit requester update
- surface routing reset/preservation impact

### Action Dialogs

Ticket action dialogs are command inputs, not generic edit forms.

Examples:

- approve
- decline
- comment
- note
- assign
- adjust
- reject
- merge
- reopen
- resubmit
- cancel

Each action should follow the server-provided action rule and should only expose
fields the command accepts.

---

## No Generic `TicketFormDialog`

The current implementation should not be described as a single generic
`TicketFormDialog`.

Create and update share form fields, but they have different workflow behavior:

- create has draft loading/save/submit behavior
- update loads latest ticket detail on open
- update merges existing and newly prepared attachments
- update can reset or preserve routing

Separate hooks/components keep those differences visible.

---

## Controlled Open State

Dialog open state should be controlled by the owning component.

```tsx id="dialog-open-state"
const [open, setOpen] = useState(false);
```

This allows:

- closing after mutation success
- resetting form state on close
- saving draft on create close
- loading detail data when update opens

---

## Trigger Policy

Dialog triggers may be provided by the caller.

This keeps list rows, toolbar buttons, and detail-page commands from duplicating
dialog internals.

---

## Data Loading Policy

Dialogs should fetch only when the dialog itself owns the entry point.

Examples:

- `CreateTicketDialog` may load active draft on open.
- `UpdateTicketDialog` loads latest ticket detail on open to avoid stale edits.
- action dialogs should rely on ticket detail/action availability already
  resolved by the page unless they need action-specific data.

---

## Attachment Policy

Dialogs that accept attachments keep raw `File` input local to the open form.

Before submitting a ticket create, requester update, or supported action, the
dialog calls the Attachment Prepare API and sends prepared metadata to the
workflow command.

Raw files must not be stored in global state or React Query.

---

## Close Policy

On success:

- close the dialog
- reset local form state
- invalidate related React Query data

On create cancel/close with dirty input:

- save draft when the draft workflow is enabled
- do not promise attachment recovery

On update/action cancel:

- discard unsaved local form state unless the specific workflow defines a draft
  behavior

---

## Accessibility and UX

Dialogs should preserve:

- focus entry and return behavior
- keyboard navigation
- clear submit/cancel actions
- loading and disabled states during mutation
- scroll handling for long content
- localized validation messages

Action dialogs should avoid showing unsupported fields for the selected command.

---

## Anti-Patterns Avoided

### Detail in a Dialog

Ticket detail is too important and shareable to be a nested modal workflow.

### Nested Dialog Stacks

Avoid dialog-on-dialog flows for ticket actions. Prefer returning to the detail
page or using a single focused surface.

### Hidden Workflow Mutation

Dialogs should call explicit mutations/commands. They should not mutate ticket
workflow state indirectly through field editing.

### Generic Dialog Abstraction Too Early

Do not force create, update, and action commands into one abstraction when their
workflow rules differ.

---

## Related Documents

- [`form-pattern.md`](form-pattern.md)
- [`../02-architecture/routing-strategy.md`](../02-architecture/routing-strategy.md)
- [`../06-form-design/ticket-form.md`](../06-form-design/ticket-form.md)
- [`../06-form-design/ticket-attachment.md`](../06-form-design/ticket-attachment.md)

---

## Summary

Dialogs are focused workflow surfaces. The current Service Desk implementation
uses separate create, update, and action dialog flows while keeping ticket detail
as a page-level resource.
