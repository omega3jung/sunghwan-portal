# Ticket Form and Draft Workflow (2026-06)

## Context

The Service Desk ticket form was initially designed as a shared form surface that could support:

- ticket creation
- ticket update
- read-only viewing
- multi-step input
- category-driven defaults
- attachments
- future draft behavior

The earlier form design intentionally deferred server-backed draft persistence because the REMOTE ticket data path and attachment boundary were not yet stable enough.

At that stage, the practical direction was:

```txt
Create / update form first
-> validate the workflow
-> add persistent draft behavior when the server boundary is clear
```

By June 2026, the following foundations were available:

- Supabase PostgreSQL ticket persistence
- server-only DTO and repository layers
- Next.js Route Handler orchestration
- requester-aware ticket queries
- LOCAL / REMOTE runtime separation
- attachment preparation for final ticket writes
- category-driven approval and assignment routing

This changed the draft trade-off.

Draft behavior could now be treated as part of the ticket workflow for REMOTE mode instead of only as a frontend convenience.

At the same time, implementation showed that ticket creation and ticket update were different workflows even when they shared fields.

---

## Problem

### 1. A shared form component hid different workflow responsibilities

The original form direction used a mode:

```ts
type Mode = "create" | "update" | "view";
```

This distinguished API semantics, but the workflows were more different than a mode flag suggested.

Ticket creation is responsible for:

- collecting a complete new request
- guiding the requester through multiple steps
- loading and saving a draft
- preparing final attachment data
- submitting into approval or assignment routing

Ticket update is responsible for:

- revising an already submitted request
- exposing only currently editable fields
- applying status and permission restrictions
- preserving or recalculating routing according to update policy
- recording changes against an existing operational ticket

One large workflow controller would accumulate too many branches.

```txt
if create
if update
if draft exists
if submitted
if field is editable
if routing must reset
```

That would blur the difference between preparing a new request and modifying an active workflow entity.

---

### 2. Browser-only draft state is not enough for REMOTE

A draft can contain meaningful request data:

- category
- subject
- rich-text body
- requested due date
- email recipients
- attachment recovery metadata

Keeping this only in component state or browser storage makes REMOTE behavior weak:

- the draft is tied to one browser
- it can be lost when storage is cleared
- server authorization is not the source of truth
- validation can diverge from ticket rules
- submission may need insert/delete coordination

Once REMOTE persistence existed, the server data source needed to own REMOTE drafts.

---

### 3. Submitting a draft as a new ticket would duplicate identity

One possible approach was:

```txt
Save temporary draft
-> submit
-> insert a new ticket
-> delete temporary draft
```

This creates avoidable problems:

- draft and submitted ticket have different IDs
- attachment and form state must be copied
- delete and insert can partially fail
- timestamps and history are harder to explain
- duplicate submissions can create multiple tickets
- the UI becomes responsible for cleanup

The draft already represents the request being prepared.

Submission should advance the same row into the active workflow.

---

### 4. Draft save behavior needed an application-level upsert policy

A draft can be created once and then saved repeatedly.

If the UI creates a new draft for every save attempt, duplicate rows and ambiguous submission behavior can appear.

The application behavior therefore needed to be:

```txt
No current Draft
-> insert a Draft ticket

Current Draft exists
-> update the existing Draft ticket
```

The exact endpoint shape can evolve, but the product behavior should remain upsert-like.

---

## Decision

Separate new-ticket creation from submitted-ticket update.

Use `CreateTicketDialog` for the new request workflow.

Use a separate update workflow, such as `UpdateTicketDialog`, for requester edits to submitted tickets.

For REMOTE mode, persist a draft as a normal ticket row with:

```txt
tk_status = 'Draft'
```

The same row is reused when the requester submits the ticket.

```txt
Create draft
-> update draft
-> submit same row
-> resolve approval or work assignment routing
```

For LOCAL mode, keep a simplified demo-safe implementation while preserving the same visible workflow where practical.

The UI should continue to consume the same feature-level draft workflow instead of knowing the storage mechanism directly.

---

## Scope Rules

### 1. Separate create and update workflows

`CreateTicketDialog` owns:

- opening the new-ticket workflow
- loading the current requester draft
- initializing the form
- guiding the multi-step form
- validating each step
- saving draft data
- preparing final submission data
- submitting the request
- resetting local form state after success

The update workflow owns:

- loading an existing submitted ticket
- checking requester permission
- checking editable status
- exposing only allowed fields
- applying update-specific validation
- applying routing preservation or recalculation
- recording update history

The workflows may share low-level UI parts, but they should not share one large workflow controller.

```txt
Create = prepare and submit a new request
Update = revise an existing workflow entity
```

---

### 2. Keep ticket viewing as page responsibility

Ticket viewing remains a page-level workflow.

```txt
/service-desk/[ticketId]
```

A separate form `view` mode is not maintained without a concrete use case.

This preserves the interaction policy:

```txt
Page   -> primary workflow
Drawer -> secondary interaction
Dialog -> atomic or focused action
```

---

### 3. Persist REMOTE drafts in the ticket table

A REMOTE draft uses the normal ticket table.

The database generates `tk_id` when the draft is first created.

The draft row keeps that ID through:

- draft updates
- final submission
- routing
- later ticket reads
- history generation

This avoids copying data from a separate draft table into a submitted ticket table.

---

### 4. Use a temporary draft ticket number

Before the normal submitted ticket number is assigned or finalized, the draft uses a requester-specific temporary ticket number.

```txt
<requesterUsername>_draft
```

Example:

```txt
sunghwan_draft
```

This value is an internal persistence identifier for the draft state.

It is not the final user-facing operational ticket number.

---

### 5. Enforce one active draft per requester

A requester can have at most one active draft.

```txt
Requester -> zero or one Draft
```

This is enforced at the database boundary, with the application also loading the current draft before save.

The current product does not include a general draft list.

Multiple drafts would require a separate product capability:

- draft titles
- draft list UI
- explicit deletion
- expiration policy
- concurrent request preparation

---

### 6. Save drafts with upsert-like application behavior

Saving from `CreateTicketDialog` follows this application behavior:

```txt
No current Draft
-> insert a Draft ticket

Current Draft exists
-> update the existing Draft ticket
```

The server boundary must protect the invariant even if the client has stale state.

The server validates:

- authenticated requester
- draft ownership
- `status = Draft`
- active row state

The client does not get to write another requester's draft merely by passing an ID.

---

### 7. Submit by reusing the draft row

Submitting a persisted draft updates the existing ticket row instead of inserting another ticket and deleting the draft.

```txt
Draft row
-> submission
-> same row leaves Draft
```

The client must not call a REMOTE draft deletion operation after successful submission.

Once the row no longer has `status = Draft`, it naturally disappears from the requester draft query.

---

### 8. Support direct submission without a prior draft save

The server supports these submission cases:

```txt
draft ID provided
-> validate ownership
-> verify status = Draft
-> submit same row
```

```txt
no draft ID, but requester draft exists
-> resolve current requester draft
-> submit same row
```

```txt
no draft ID and no requester draft
-> insert a new submitted ticket
```

This protects the workflow from stale UI state while still allowing direct submission.

---

### 9. Delegate final routing to the ticket service

The form does not decide the final operational status.

Submission means:

```txt
Draft preparation completed
-> request enters active workflow
```

The server routing layer determines whether the submitted request becomes:

```txt
Draft -> Approval
```

or:

```txt
Draft -> Assigned
```

Approval and assignment rules live in the ticket routing domain, not the form component.

---

### 10. Exclude drafts from operational queries

Drafts are not active Service Desk work.

Normal ticket list and work queries exclude:

```txt
status = Draft
```

Requester draft queries explicitly search for:

```txt
requester = current requester
status = Draft
active = true
```

A Draft:

- is not assigned work
- is not waiting for approval
- is not included in operational insights
- is editable only through the creation workflow

---

### 11. Keep LOCAL and REMOTE runtime boundaries clear

REMOTE mode persists draft through the server data layer.

LOCAL mode may use a simplified demo-safe implementation.

The UI should not depend on whether the draft is backed by LOCAL demo behavior or REMOTE PostgreSQL.

Runtime-specific persistence remains behind the feature API/repository boundary.

---

### 12. Keep attachment persistence boundaries explicit

Draft persistence must not store raw binary data, base64 image data, or blob URLs.

Draft and submitted ticket persistence should share the same normalized attachment contract when crossing the durable ticket boundary.

Attachment preparation and storage behavior are defined by the attachment boundary decision.

---

### 13. Use React Query for server state

Draft is server state in REMOTE mode.

React Query provides client synchronization.

It is not the persistence source of truth.

Recommended behavior:

```txt
Save draft
-> update or invalidate current requester draft query

Submit draft
-> invalidate current requester draft
-> invalidate ticket list
-> invalidate submitted ticket detail
-> invalidate affected insight/count queries
```

Global query reset is not required.

---

## What Was Aligned

### 1. Component responsibility

`CreateTicketDialog` is a new-request composition workflow.

Submitted-ticket update rules are handled in a separate update workflow.

---

### 2. REMOTE draft model

REMOTE draft is a requester-owned ticket row in `Draft` status.

It is not a separate table and not browser-only state.

---

### 3. Submission identity

Submission reuses the draft row when one exists.

This keeps ticket identity stable from draft through active workflow.

---

### 4. Runtime boundary

LOCAL and REMOTE may use different persistence mechanisms, but the feature workflow remains stable.

The UI should not contain database-specific draft logic.

---

## Consequences

### Positive

- Ticket creation has a clearer component boundary.
- REMOTE drafts are protected by server authorization.
- The same ticket ID can continue from draft to submitted ticket.
- Submission avoids insert/delete coordination.
- Operational ticket queries can exclude `Draft` explicitly.
- LOCAL can remain lightweight without weakening the REMOTE draft model.

---

### Negative / Trade-offs

- Draft rows exist in the main ticket table.
- The current product supports only one active draft per requester.
- Draft save requires clear create/update or upsert-like orchestration.
- LOCAL draft behavior may be simpler than REMOTE persistence.
- Full production draft upload recovery remains a future storage concern.

---

## Follow-up Policy

- Keep `CreateTicketDialog` focused on new request composition.
- Keep submitted-ticket update behavior in a separate workflow.
- Keep REMOTE draft ownership and status checks on the server.
- Do not add multiple drafts without a product-level draft list design.
- Do not delete a REMOTE draft row after submission; submit the same row.
- Keep draft attachment behavior honest until production storage exists.
- If server-side draft upsert is introduced later, keep the one-active-draft invariant.

---

## Summary

The ticket creation workflow now treats REMOTE Draft as a real ticket workflow state.

The core model is:

```txt
CreateTicketDialog
= new request preparation + draft save + final submission

REMOTE Draft
= requester-owned ticket row with status Draft

Draft submission
= same row leaves Draft and enters Approval or Assigned routing

Update workflow
= separate revision flow for submitted tickets
```

This keeps ticket creation understandable in the UI while giving REMOTE mode a stable server-controlled persistence model.
