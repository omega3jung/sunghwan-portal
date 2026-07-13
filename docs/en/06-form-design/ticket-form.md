# Ticket Form Design

## Goal

Ticket forms collect the information needed to create or requester-update a
Service Desk ticket while keeping workflow decisions on the server boundary.

The current design is aligned with the implemented form flow:

- `CreateTicketDialog` handles new ticket submission and draft recovery.
- `UpdateTicketDialog` handles requester-owned updates before work starts.
- React Hook Form owns unsaved input while the dialog is open.
- the Attachment Prepare API converts browser files and inline images into
  prepared metadata before ticket persistence.
- the ticket service decides approval, assignment, and routing effects.

---

## Core Principle

```txt id="ticket-form-core"
The form collects intent.
The server executes ticket workflow.
```

The form may derive helpful defaults and validate input, but it does not decide
final approval routing, work assignment, or history semantics.

---

## Current Form Surfaces

### Create Ticket

`CreateTicketDialog` is the requester-facing creation workflow.

It supports:

- multi-step input
- category, subject, content, due date, priority, risk, email, and attachment
  fields
- draft loading and save-on-close behavior
- attachment preparation before final create
- final ticket creation through the ticket mutation API

### Update Ticket

`UpdateTicketDialog` is the requester-owned update workflow.

It supports:

- loading the latest ticket detail when the dialog opens
- preserving existing prepared `files` and `images`
- preparing only newly selected files and inline images
- merging existing and newly prepared attachment metadata
- submitting a requester update through the ticket update API

### Ticket Detail

Ticket detail is a page-level workflow, not part of the form dialog.

```txt id="ticket-detail-route"
/service-desk/[ticketId]
```

Detail pages may open action dialogs, history panels, or update dialogs, but the
detail view itself remains the primary ticket workflow surface.

---

## Step Design

The create and update flows use the current step identifiers:

```txt id="ticket-form-steps"
issueDetails
attachments
review
```

The UI labels may be localized, but the step responsibilities are stable:

| Step | Responsibility |
| --- | --- |
| `issueDetails` | category, subject, body, due date, priority, risk, email |
| `attachments` | selected files and rich-text image input |
| `review` | final review before mutation |

The current step set does not use a separate category-only step or a generic
global stepper abstraction.

---

## Schema and Validation

The form schema is implemented with Zod and React Hook Form.

Current ticket form fields include:

```ts id="ticket-form-fields"
type TicketFormValues = {
  id?: string;
  category: string;
  subject: string;
  body: string;
  dueAt: Date;
  priority: Priority;
  riskLevel: RiskLevel;
  email: string[];
  requester: string;
  attachment: File[];
};
```

Important validation rules:

- `subject` is limited to 200 characters.
- `dueAt` must be later than today.
- `attachment` remains browser `File[]` until preparation.
- final ticket mutation validates prepared attachment metadata again.

Step validation is used for navigation. Full validation is used before the
mutation.

---

## Category Defaults

Category selection can seed or update:

- priority
- risk level
- due date defaults based on category SLA days

The form may display and apply these defaults for usability. The server remains
the source of truth for category validity and routing behavior.

When a requester update changes category, the update service re-evaluates
routing-sensitive fields and records the correct routing history event.

---

## Attachment Preparation

Browser file input is transient.

```txt id="ticket-form-attachment-flow"
form body and File[]
-> POST /api/service-desk/tickets/attachments/prepare
-> prepared body, files, images
-> ticket create or update payload
```

The create and update forms must not send raw `File` objects to the ticket write
service. They send only prepared body content and prepared attachment metadata.

See [`ticket-attachment.md`](ticket-attachment.md) for the attachment boundary.

---

## Draft Workflow

The current draft model supports both LOCAL and REMOTE behavior.

### LOCAL Draft

LOCAL draft uses a simplified demo-safe implementation behind the feature API
boundary. It is not persistence-equivalent to the REMOTE PostgreSQL draft model.
The current LOCAL implementation may use limited client-side recovery for demo
convenience, but it is not the durable state boundary.

### REMOTE Draft

REMOTE draft behavior stores an active draft through the ticket draft route and
server DTO boundary. The current REMOTE design treats a draft as a ticket row in
`Draft` status, with one active draft per requester.

```txt id="remote-draft-flow"
open create dialog
-> load active draft
-> user edits form
-> close while dirty
-> save draft
-> reopen and recover draft values
-> final submit reuses the draft ticket row
```

Draft save is form-data oriented. It does not guarantee attachment recovery:

- browser `File` objects are not restorable after reload
- draft save intentionally clears transient attachment input
- final submit prepares the current attachment input
- production object storage remains future scope

---

## Create Submission

Current create submission flow:

```txt id="create-submission-flow"
validate form
-> prepare attachments
-> map form values to ticket mutate payload
-> create or submit existing draft
-> server resolves approval or work assignment
-> invalidate ticket and draft queries
```

The server decides whether the submitted ticket enters:

- `Approval`, when an approval step is required
- `Assigned`, when work assignment is resolved directly

Ticket creation records event-based history such as `TICKET_SUBMITTED`,
`APPROVAL_REQUESTED`, or `ASSIGNMENT_RESOLVED`.

---

## Requester Update Submission

Requester update is allowed only while the ticket is still before active work:

```txt id="requester-update-statuses"
Approval
Assigned
```

The requester must own the ticket.

Update flow:

```txt id="requester-update-flow"
load latest ticket detail
-> keep existing prepared attachments
-> prepare new body/files/images
-> merge prepared metadata
-> submit requester update
-> server decides routing reset or preservation
```

Routing-sensitive fields:

- category
- subject
- content/body
- files
- images

Routing-neutral fields:

- due date
- email recipients

If routing-sensitive content changes, the server records `ROUTING_RESET` and
re-evaluates approval or assignment. If only routing-neutral fields change, it
records `ROUTING_PRESERVED`.

When category changes, category defaults also re-evaluate priority, risk, and
the minimum due date. The due date remains unchanged when the current value is
later than the new category minimum; otherwise it moves back to that minimum.

---

## State Ownership

| State | Owner |
| --- | --- |
| unsaved field input | React Hook Form |
| current dialog step | component state |
| persisted ticket data | React Query |
| active draft data | React Query through draft API |
| raw browser files | React Hook Form while dialog is open |
| prepared attachment metadata | ticket API payload and persisted ticket data |

Zustand should not be used as the source of truth for form input, drafts, or
attachment metadata.

---

## Reset and Close Policy

On successful create or update:

- close the dialog
- reset form state
- invalidate affected ticket queries
- clear or remove the submitted draft where appropriate

On create-dialog close with dirty input:

- save draft when draft behavior is enabled
- warn or preserve unsaved intent according to current dialog behavior
- do not promise attachment recovery

---

## Anti-Patterns Avoided

### Generic `TicketFormDialog`

The current implementation does not rely on one generic create/update/view
`TicketFormDialog`. Create and update share field concepts but keep different
workflow hooks because draft, submit, reset, and routing behavior differ.

### Raw File Persistence

Raw browser files must not be stored in ticket rows, React Query cache, draft
DTOs, or global state.

### Client-Side Routing Decisions

The client can show warnings and defaults, but it must not be the authority for
approval reset, assignment resolution, or routing history.

### Silent Requester Updates

Requester updates that affect routing-sensitive fields must be traceable through
history events.

---

## Related Documents

- [`ticket-attachment.md`](ticket-attachment.md)
- [`../03-domain/ticket/ticket-model.md`](../03-domain/ticket/ticket-model.md)
- [`../03-domain/ticket/ticket-lifecycle.md`](../03-domain/ticket/ticket-lifecycle.md)
- [`../03-domain/ticket/ticket-history.md`](../03-domain/ticket/ticket-history.md)
- [`../08-dev-strategy/decision-log/2026-06-ticket-form-and-draft-workflow.md`](../08-dev-strategy/decision-log/2026-06-ticket-form-and-draft-workflow.md)
- [`../08-dev-strategy/decision-log/2026-07-ticket-routing-and-update-policy.md`](../08-dev-strategy/decision-log/2026-07-ticket-routing-and-update-policy.md)

---

## Summary

Ticket forms are workflow entry points, not workflow authorities.

The current design uses `CreateTicketDialog` and `UpdateTicketDialog`, a
three-step form flow, REMOTE draft recovery through ticket draft APIs,
attachment preparation before persistence, and server-owned requester update
routing. This keeps the UI usable while preserving the ticket service as the
source of truth for approval, assignment, status, and history.
