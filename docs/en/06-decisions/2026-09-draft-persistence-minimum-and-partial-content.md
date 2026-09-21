# Draft Persistence Minimum and Partial Content (2026-09)

## Context

The Service Desk already treats a REMOTE draft as a requester-owned Ticket row in
`Draft` status.

```txt
Create draft
-> update draft
-> submit the same row
-> enter Approval or Assigned routing
```

The same Ticket identity is therefore preserved from request preparation into the
operational workflow.

During the v1.0.x stabilization pass, partial Draft persistence exposed a mismatch
between that workflow model and the database constraints.

The Ticket table originally treated the following fields as complete-ticket values:

```txt
category
subject
content
```

However, a user can legitimately save a Draft before the request text is complete.

The project needed to define:

- when unsaved form state becomes a persisted Draft;
- which Ticket fields must already be valid at that boundary;
- which fields may remain incomplete while `status = Draft`;
- how the database should distinguish Draft incompleteness from an invalid
  operational Ticket.

---

## Problem

### 1. Allowing every field to be nullable weakens Ticket identity

One possible model was:

```txt
Draft
-> category may be null
-> subject may be null
-> content may be null
```

This would allow persistence before any request classification exists.

Category is not only a display field. It anchors important Service Desk context:

```txt
Category
-> Tenant consistency
-> request classification
-> defaults
-> Approval routing
-> Assignment routing
```

The current database also enforces the Category/Tenant relationship.

Making `tk_category_id` nullable would weaken an invariant that remains meaningful
even while the request is still a Draft.

---

### 2. A synthetic Draft Category would introduce fake domain data

Another option was to reserve a special Category such as:

```txt
category_id = 0
name = Draft
active = false
```

This would preserve the `NOT NULL` column while allowing a Draft before the user
selects a real Category.

The Category model is Tenant-scoped, however.

A global synthetic Category would conflict with the existing Category/Tenant
relationship, while a per-Tenant synthetic Category would require additional
rules for:

- creation;
- identification;
- settings visibility;
- activation;
- deletion;
- routing exclusion;
- analytics exclusion;
- replacement on final submission.

This would introduce special-case domain data only to represent an incomplete
form state.

---

### 3. Treating empty strings as complete persistence values obscures intent

Keeping `tk_subject` and `tk_content` as `NOT NULL` and storing empty strings for
Draft rows was also possible.

```txt
Draft
subject = ""
content = ""
```

This technically satisfies column nullability but makes the persistence model less
explicit.

For Draft rows, `NULL` more accurately represents:

```txt
not written yet
```

while an operational Ticket still requires meaningful request content.

The application therefore needed state-aware completeness rather than one
nullability rule for every Ticket status.

---

## Options Considered

### Option 1 — Make Category, Subject, and Content nullable for Drafts

```txt
Draft
-> category = null allowed
-> subject = null allowed
-> content = null allowed
```

#### Advantages

- supports persistence at any point in the form;
- minimal client-side restriction before Draft creation.

#### Disadvantages

- weakens Category/Tenant integrity;
- allows persisted rows without request classification;
- makes the minimum identity of a Draft unclear;
- pushes more invalid-state handling into later workflow steps.

This option was rejected.

---

### Option 2 — Use a global synthetic Draft Category

```txt
Draft
-> category = reserved Draft Category
```

#### Advantages

- keeps `tk_category_id NOT NULL`;
- allows persistence before a user selects a real Category.

#### Disadvantages

- a Category must belong to a Tenant;
- a global sentinel conflicts with Tenant-scoped Category integrity;
- inactive does not mean system-owned or immutable;
- settings, routing, search, and analytics would need special exclusions.

This option was rejected.

---

### Option 3 — Use one synthetic Draft Category per Tenant

```txt
Tenant
-> hidden Draft Category
-> user Draft rows point to it until classification
```

#### Advantages

- keeps Category/Tenant integrity;
- preserves `tk_category_id NOT NULL`.

#### Disadvantages

- introduces system-only Categories into the business model;
- requires lifecycle and visibility rules unrelated to real Service Desk
  configuration;
- increases implementation and maintenance cost;
- still represents missing user classification with fake domain data.

This option was rejected.

---

### Option 4 — Start persistence after Category selection and allow partial content

```txt
No Category
-> current edits remain unsaved form state only
-> any previously saved Draft remains unchanged

Valid Category selected
-> Draft may be persisted

REMOTE Draft
-> subject may be null
-> content may be null

Final submit
-> category required
-> subject required and non-blank
-> content required and semantically meaningful
```

#### Advantages

- preserves Category/Tenant integrity from the first persisted Ticket row;
- avoids synthetic domain data;
- gives Draft persistence a clear minimum boundary;
- represents incomplete request text explicitly;
- keeps final operational Ticket invariants strong;
- is straightforward to explain across UI, server, and database layers.

#### Disadvantages

- input entered before Category selection is not durably persisted;
- closing a dirty category-less form requires explicit UX feedback;
- database checks must distinguish Draft from non-Draft Ticket completeness.

This option was selected.

---

## Decision

Use Category selection as the minimum persistence boundary for a Draft.

The core model is:

```txt
Category not selected
-> current edits stay in React Hook Form / component state only
-> no Draft creation or update in LOCAL or REMOTE
-> any previously saved Draft remains unchanged

Valid Category selected
-> persistent Draft may exist
-> Category/Tenant relationship is valid
-> Subject and Content may still be incomplete

Final submit
-> complete Ticket validation
-> REMOTE: existing Draft row enters Approval or Assigned
-> LOCAL: create a Ticket, then remove the browser-local Draft
```

The REMOTE database field contract is:

```txt
tk_category_id
-> NOT NULL for Draft and non-Draft Ticket rows

tk_subject
-> nullable while status = Draft
-> required and non-blank outside Draft

tk_content
-> nullable while status = Draft
-> required and non-blank outside Draft
```

Category remains the minimum persisted identity of a request.

Subject and Content represent request completeness, not Draft identity.

---

## Database Contract

The database keeps `tk_category_id NOT NULL` and the existing Category foreign key
and Category/Tenant trigger behavior.

`tk_subject` and `tk_content` are nullable columns, with Draft-aware CHECK
constraints.

Conceptually:

```sql
CHECK (
  tk_status = 'Draft'
  OR (
    tk_subject IS NOT NULL
    AND btrim(tk_subject) <> ''
  )
)
```

```sql
CHECK (
  tk_status = 'Draft'
  OR (
    tk_content IS NOT NULL
    AND btrim(tk_content) <> ''
  )
)
```

The database protects the minimum persistence invariant.

Semantic rich-text validation remains a server responsibility. The database does
not attempt to determine whether HTML such as an empty paragraph contains
meaningful request content.

---

## Application Rules

### 1. Keep category-less input local

A dirty create form without a valid Category is not a persistent Draft.

The first close attempt shows a category warning and keeps the dialog open. A
subsequent close attempt closes without saving the current edits. The warning
resets whenever the dialog opens. If a valid Category is selected after the
warning, closing follows the normal Draft save path.

Neither close attempt creates or updates a Draft without a valid Category, and
any previously saved Draft remains unchanged. The UI must not invent a Category
or persist an invalid Ticket row.

---

### 2. Normalize incomplete REMOTE Draft content at the database boundary

The REMOTE server Draft mapper normalizes incomplete values before database
persistence:

```txt
empty / whitespace-only subject
-> null

semantically empty Draft content
-> null
```

When a REMOTE Draft is loaded back into the form:

```txt
database null
-> form-facing empty string
```

This keeps database meaning explicit without widening the normal form contract
unnecessarily.

LOCAL Draft persistence stores form values in browser localStorage and may retain
empty strings. The shared workflow rule is that incomplete request text is
allowed; representing missing content as NULL is specific to REMOTE database
persistence.

---

### 3. Keep final submission strict

Draft persistence and final Ticket submission have different completeness rules.

```txt
Draft save
-> partial content allowed

Final submit
-> valid Category required
-> non-empty Subject required
-> meaningful Content required
-> existing SLA / attachment / routing validation applies
```

The server remains authoritative for final submission.

A Draft row with incomplete content must not become an operational Ticket.

---

### 4. Preserve same-row submission in REMOTE

This decision does not change REMOTE Draft identity.

```txt
Persisted REMOTE Draft
-> final submit
-> same Ticket row
-> Approval or Assigned
```

REMOTE submission does not insert a second Ticket and delete the existing Draft.

LOCAL has no persisted Draft Ticket row to reuse. It creates a new Ticket and
then removes the browser-local Draft after successful submission. Ticket identity
continuity therefore applies to REMOTE, not to LOCAL recovery state.

---

### 5. Keep LOCAL and REMOTE behavior aligned at the workflow boundary

Persistence mechanisms remain different:

```txt
LOCAL
-> browser localStorage Draft repository

REMOTE
-> PostgreSQL Ticket row
```

The visible workflow rule is shared:

```txt
Category absent
-> do not create or update a Draft from the current input
-> keep any previously saved Draft unchanged

Valid Category selected
-> Draft persistence allowed
```

The UI does not depend on the underlying persistence mechanism.

---

### 6. Keep attachment persistence rules unchanged

Partial Draft content does not relax the attachment boundary.

Browser-only values remain transient:

```txt
File
base64 image
blob URL
```

Draft persistence uses the same normalized attachment preparation boundary as
submitted Ticket persistence.

Allowing `tk_content = NULL` for an incomplete Draft must not reintroduce raw
base64 or blob persistence.

---

## Consequences

### Positive

- Category/Tenant integrity is preserved from the first persisted Draft row.
- No fake or hidden Category is required.
- The persistence model distinguishes missing Draft content from completed Ticket
  content.
- Final Ticket invariants remain protected by both server validation and database
  constraints.
- LOCAL and REMOTE keep one understandable application-facing Draft workflow.
- In REMOTE, the same Ticket identity continues from Draft into the operational
  workflow; LOCAL creates a Ticket from browser-local recovery state.
- The design remains compatible with the existing attachment preparation
  boundary.

### Negative / Trade-offs

- A user must select a Category before Draft persistence can begin.
- Input entered before Category selection is only unsaved form state.
- The create dialog must clearly handle attempts to close a dirty category-less
  form.
- REMOTE Ticket subject/content types are nullable at the database layer even
  though operational Ticket consumers normally expect complete values. LOCAL
  Draft storage retains the form-oriented representation.
- Database constraints must remain status-aware.

---

## Rejected Simplifications

The project does not use these shortcuts:

```txt
Make tk_category_id nullable because Draft is incomplete
```

```txt
Use category_id = 0 as a global Draft sentinel
```

```txt
Create hidden per-Tenant Draft Categories
```

```txt
Store empty strings in REMOTE Draft rows only to preserve NOT NULL
```

```txt
Allow incomplete subject/content after the Ticket leaves Draft
```

These approaches either weaken domain integrity or introduce special-case data
that is harder to maintain than the problem requires.

---

## Follow-up Policy

- Keep Category as the minimum persisted Draft identity.
- Do not make `tk_category_id` nullable without a new product-level requirement.
- Do not introduce a synthetic Draft Category only to support form persistence.
- Keep Subject and Content incomplete only while `status = Draft`.
- Keep final submission validation authoritative on the server.
- Keep Draft and submitted Ticket attachment persistence behind the same
  preparation boundary.
- Preserve same-row Draft submission in REMOTE; LOCAL creates a Ticket and clears
  its browser-local Draft after successful submission.
- Do not create or update a Draft from category-less input, and preserve any
  previously saved Draft when closing without saving those edits.
- If the product later requires durable recovery before Category selection,
  reconsider whether unsaved composition needs a separate persistence model
  rather than weakening the Ticket domain model.

---

## Related Documents

- `docs/spec/ticket-system.md`
- `docs/en/03-domain/service-desk/ticket/ticket-model.md`
- `docs/en/04-client-engineering/forms/ticket-form.md`
- `docs/en/04-client-engineering/forms/ticket-attachment.md`
- `docs/en/06-decisions/2026-06-ticket-form-and-draft-workflow.md`
- `docs/en/06-decisions/2026-06-ticket-attachment-boundary.md`

---

## Summary

The project distinguishes Draft identity from request completeness.

```txt
Category
= minimum persisted request identity

Subject / Content
= may remain incomplete while Draft

Final submission
= complete operational Ticket invariant
```

This keeps the Draft workflow flexible without weakening Category/Tenant
integrity or introducing fake domain data.
