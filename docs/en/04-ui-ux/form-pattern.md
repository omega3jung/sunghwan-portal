# Form Pattern

## Goal

Forms provide type-safe, isolated input handling for Service Desk workflows.

The current pattern is:

- React Hook Form owns unsaved form input.
- Zod owns schema validation.
- React Query owns server state.
- feature mutations own submission.
- server services own workflow effects.

---

## Core Principle

```txt id="form-core"
Form state is local input state.
Workflow state is server state.
```

The form should not become a workflow engine.

---

## Form Library

Forms use `react-hook-form`.

Benefits:

- strong TypeScript integration
- efficient field updates
- schema resolver support
- clear reset and submit behavior
- compatibility with multi-step forms

---

## Validation

Validation uses schema-based rules such as Zod.

Ticket form examples:

- subject length limit
- required category
- required body/content where the workflow needs it
- due date later than today
- attachment field typed as browser `File[]` before preparation

Client validation improves feedback. Server validation remains authoritative.

---

## Multi-Step Form Policy

Use multi-step forms for complex workflows where progressive disclosure improves
completion.

Current ticket form steps:

```txt id="current-ticket-form-steps"
issueDetails
attachments
review
```

Implementation policy:

- one React Hook Form instance spans all steps
- step state is local component/hook state
- step navigation validates the current step
- final submit validates the full payload

---

## Create vs Update

Create and update can share field components, but they should not hide their
workflow differences.

### Create

Create flow includes:

- active draft load
- save-on-close draft behavior
- attachment preparation
- submit new or existing draft ticket
- post-submit draft cleanup

### Update

Requester update flow includes:

- latest ticket detail load on open
- existing attachment preservation
- new attachment preparation
- merge of existing and prepared metadata
- requester update mutation
- routing reset or preservation based on changed fields

---

## Attachment Fields

Raw browser `File` objects belong only to the open form.

```txt id="form-attachment-boundary"
React Hook Form File[]
-> Attachment Prepare API
-> prepared metadata
-> ticket command payload
```

Do not store raw files in:

- React Query
- Zustand
- ticket DTOs
- draft DTOs
- database rows

---

## Draft Forms

Draft is not the same as unsaved component state.

In REMOTE mode, create-ticket draft is server state loaded through the draft API
and React Query. The form hydrates from the active draft and can save form values
back to the draft workflow.

Drafts do not guarantee attachment recovery.

---

## Field Component Policy

Reusable field components should handle UI consistency, not business workflow.

Good field responsibilities:

- label
- validation message
- input binding
- disabled/loading state
- localized display

Avoid putting approval routing, assignment rules, or history construction inside
field components.

---

## Submission Policy

Forms submit through feature mutations.

```txt id="form-submit-policy"
form validation
-> optional preparation step
-> mutation
-> server workflow
-> targeted query invalidation
```

For ticket create/update, attachment preparation is part of the submission
pipeline before the ticket mutation.

---

## Reset Policy

Reset form state:

- after successful submit
- when the dialog closes and no draft behavior should preserve input
- when fresh ticket detail is loaded into an update dialog

Do not reset server state by manually editing React Query data unless the
mutation contract explicitly supports optimistic updates.

---

## Error Handling

Use:

- inline field messages for validation
- form-level messages or toast for API errors
- disabled controls while mutation is pending
- server error messages where available

Routing reset, attachment rejection, and permission failures should be visible
as workflow feedback rather than swallowed by generic validation.

---

## State Ownership

| State | Owner |
| --- | --- |
| field input while editing | React Hook Form |
| current form step | local component/hook state |
| active draft | React Query/API |
| ticket detail | React Query/API |
| settings/category options | React Query/API |
| raw files | React Hook Form while open |
| prepared attachment metadata | API payload and persisted ticket data |
| global UI chrome | UI store where needed |

---

## Anti-Patterns Avoided

### Server Data in Form State Forever

Forms may hydrate from server data, but server state remains owned by React
Query.

### Workflow Rules in Field Components

Fields should not decide approval, assignment, status, or history.

### Generic Stepper Too Early

Keep step logic close to the workflow until multiple workflows genuinely share
the same structure.

### Silent Routing Changes

Requester updates that reset routing should be executed through the server
workflow and recorded in history.

---

## Related Documents

- [`dialog-pattern.md`](dialog-pattern.md)
- [`../06-form-design/ticket-form.md`](../06-form-design/ticket-form.md)
- [`../06-form-design/ticket-attachment.md`](../06-form-design/ticket-attachment.md)
- [`../05-data-fetching/react-query-strategy.md`](../05-data-fetching/react-query-strategy.md)

---

## Summary

The current form pattern keeps user input local, server data in React Query, and
workflow effects in server commands. This lets ticket create, requester update,
draft, and attachment preparation share form discipline without collapsing into
one oversized abstraction.
