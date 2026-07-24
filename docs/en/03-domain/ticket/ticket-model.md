# Ticket Model

## Goal

This document defines the current ticket entity, DTO projection, and data
boundary responsibilities.

It is not a conceptual sketch. Field names and model responsibilities are
aligned with the current domain types, DTOs, and mapper behavior.

---

## Core Concept

```txt id="ticket-model-core"
Ticket row = current workflow state
Ticket DTO = application-facing projection
History = immutable record of how state changed
```

The ticket row stores current state. Related subresources store actions,
history, and work-session evidence.

---

## Persisted Status

Current status union:

```txt id="ticket-status-union"
Draft
Approval
Declined
Assigned
Working
Pending
Rejected
Resolved
Closed
```

`Open`, `Approved`, and `Reopen` are not persisted statuses. The ticket mapper
contains compatibility normalization for older row values:

- `Open` maps to `Approval` or `Assigned` depending on approval step
- `Approved` maps to `Assigned`
- `Reopen` maps to `Working`

New design documents must not describe those old values as current statuses.

---

## Domain Interfaces

The current domain read models are `TicketSummary` and `TicketDetail`.

### Shared Core

```ts id="ticket-core-fields"
type TicketBase = {
  id: string;
  ticketNumber: string;
  createdAt: ISODateString;
  updatedAt?: ISODateString;
  requesterUsername: string;
};

type TicketWorkflowState = {
  status: TicketStatus;
  priority: Priority;
  riskLevel: RiskLevel;
  closeReason?: TicketResolutionReason;
};
```

`TicketResolutionReason` includes `Merged` for same-scope consolidation and
`Escalated` when an `INTERNAL` source is merged into an existing `PORTAL`
target. Both retain the merged-target relation; the close reason distinguishes
reporting and display semantics.

### Assignment Projection

```ts id="ticket-assignment-projection"
type TicketAssignmentPhase = "APPROVAL" | "WORK";

type TicketAssignmentState = {
  assignmentPhase: TicketAssignmentPhase;
  approvalAssigneeUsernames: string[];
  workAssigneeUsernames: string[];
  assignedApprover: boolean;
  assignedWorker: boolean;
};
```

The persisted source of truth is still:

```txt id="assignment-source"
tk_approval_step_id
tk_assignee_usernames
```

The phase-aware fields are DTO/domain projections for UI clarity.

### Metrics and View State

```ts id="ticket-metric-fields"
type TicketMetrics = {
  workMinutes: number;
  lastCommentAt?: ISODateString;
  lastCommenterEmail?: string;
  lastUserActivityAt?: ISODateString;
  lastUserActivityEmail?: string;
  closedAt?: ISODateString;
};

type TicketViewState = {
  dueAt: ISODateString;
  owner: boolean;
  active: boolean;
};
```

`owner`, `assignedApprover`, and `assignedWorker` are derived for the current
authenticated user. They are not global persisted flags.

### Detail Content

```ts id="ticket-detail-content"
type TicketContent = {
  categoryId: string;
  approvalStepId: string | null;
  subject: string;
  content: string;
  email: {
    to: string[];
    cc: string[];
    bcc: string[];
  };
  files: TicketAttachmentMetadata[];
  images: TicketAttachmentMetadata[];
};
```

Ticket detail includes full content, email, files, and images. Ticket summary is
optimized for list/search and does not include full content or attachment
payloads.

---

## Database and DTO Boundary

The REMOTE read path is:

```txt id="ticket-read-boundary"
service_desk view/row
-> mapper
-> TicketListItemDto or TicketDetailDto
-> feature API mapper
-> domain model
```

Database rows use `tk_*`, `cat_*`, and other database-shaped fields. UI code
must not consume raw row columns directly.

### DTO Assignment Fields

Ticket DTOs expose:

- `assignment_phase`
- `approval_assignee_usernames`
- `work_assignee_usernames`
- `assigned_approver`
- `assigned_worker`
- `assignee_usernames`

`assignee_usernames` is the raw current assignee projection. The phase-specific
arrays clarify whether those users are approvers or workers.

---

## Draft Identity

REMOTE draft uses the ticket table.

Rules:

- `status = Draft`
- one active draft per requester
- draft is fetched by requester username
- submit reuses the draft row and changes it to `Approval` or `Assigned`
- draft rows are excluded from operational ticket lists

LOCAL draft uses a simplified demo-safe implementation behind the feature API
boundary. It is not persistence-equivalent to the REMOTE PostgreSQL draft model.

---

## Email Ownership

`email` on the ticket is requester-provided notification configuration.

Derived assignee emails must not be appended into the persisted `tk_email`
field. Notification delivery should resolve assignee emails at send time.

---

## Attachment Metadata

Ticket attachment fields store prepared metadata only.

```ts id="ticket-attachment-metadata"
type TicketAttachmentMetadata = {
  originalName: string;
  replacedName: string;
  extension: string;
  size: number;
  type: string;
  demoUrl: string;
  replaced: true;
  reason: "SECURITY_DEMO_REPLACEMENT";
};
```

Ticket persistence uses:

```txt id="ticket-attachment-columns"
tk_content -> prepared body
tk_files   -> TicketAttachmentMetadata[]
tk_images  -> TicketAttachmentMetadata[]
```

Raw `File`, binary data, base64 data URLs, blob URLs, and local paths are not
part of the ticket row or DTO.

Related document: [Ticket Attachment Design](../../06-form-design/ticket-attachment.md)

---

## Related Subresources

### Ticket Action

Ticket actions are command-created timeline entries. They are not the same as
history. Some actions mutate ticket state and create multiple history records.

Related document: [Ticket Activity Model](./ticket-activity.md)

### Ticket History

History is immutable event/audit data with type, source, event, actor, JSON
from/to values, and display metadata.

Related document: [Ticket History](./ticket-history.md)

### Work Session

Work Session records actual tracked work. The ticket exposes aggregated
`workMinutes`, while individual sessions remain a separate subresource.

Related document: [Ticket Track Time](./ticket-track-time.md)

---

## List vs Detail

### List Item

List/search DTOs include:

- identity and status
- assignment projection
- priority, risk, due date
- category display data
- owner/assigned flags
- work minutes and recent activity timestamps
- close/merge fields
- age

### Detail

Detail DTO adds:

- full content
- email configuration
- prepared files
- prepared images

---

## Write Model

Create/update request payloads use:

- category id
- subject/body
- due date
- priority/risk
- email
- prepared files/images
- optional existing draft id

Writes validate attachment metadata and normalize rows before persistence.

Requester update has separate routing-sensitive behavior. See
[Ticket Lifecycle](./ticket-lifecycle.md) and
[Ticket Operation Rules](../../08-dev-strategy/ticket-operation-rules.md).

---

## Summary

The current ticket model separates current row state from derived DTO
projection and immutable history. Routing phase, owner flags, assignee flags,
work minutes, and recent activity are read-model conveniences. The persisted
workflow source remains precise: status, approval step, assignees, category,
content, planning fields, and prepared attachment metadata.
