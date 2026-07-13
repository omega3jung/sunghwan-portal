# Ticket Attachment Design

## Goal

Ticket attachments let requesters and operators add supporting files and
rich-text images to ticket workflows without pretending that the current demo
stores raw binary files in production-grade object storage.

The attachment design aims to:

- keep raw browser `File` objects transient
- prepare attachments before ticket writes
- persist only normalized metadata and controlled demo URLs
- keep LOCAL and REMOTE behavior contract-compatible
- make future object-storage integration possible without changing ticket UI
  contracts

---

## Core Concept

```txt id="ticket-attachment-core"
Browser file input is transient.
Ticket persistence stores prepared metadata only.
```

The attachment layer is a preparation boundary. It is separate from ticket
commands such as create, requester update, comment, or reject.

---

## Current Flow

```txt id="ticket-attachment-flow"
Browser input
-> Attachment Prepare API
-> prepared body, files, and images
-> ticket command payload
-> ticket persistence
```

The Prepare API returns safe metadata for selected files and inline rich-text
images. Ticket write commands then consume that prepared result.

---

## Input Types

### Selected Files

Selected files come from browser file inputs.

```ts id="selected-file-input"
type TicketAttachmentPrepareInput = {
  body: string;
  files: File[];
};
```

Selected files may include images or non-image files. The server classifies the
prepared result into `files` and `images`.

### Rich-Text Images

Rich-text images are found inside the submitted body. Inline `data:image/*`
sources are replaced with controlled demo image URLs during preparation.

Unsupported image sources such as arbitrary remote URLs, blob URLs that escaped
the editor boundary, or file paths are rejected by the preparation service.

---

## Prepare API

### Endpoint

```txt id="ticket-attachment-prepare-endpoint"
POST /api/service-desk/tickets/attachments/prepare
```

The feature API client sends `FormData` containing:

- `body`: current rich-text body
- `files`: selected browser files

### Response

```ts id="ticket-attachment-prepare-response"
type PrepareTicketAttachmentsResponseDto = {
  body: string;
  files: TicketPreparedAttachmentDto[];
  images: TicketPreparedInlineImageDto[];
};
```

The response is the only attachment shape that ticket write commands should
trust for new attachment input.

### Boundary Rules

The Prepare API owns:

- validating file names
- validating extensions
- validating file and total size limits
- replacing selected files with demo assets
- replacing inline rich-text data images with demo assets
- rejecting unsupported image sources
- returning normalized metadata

Ticket create, update, and action commands own workflow behavior. They should
not duplicate attachment preparation logic.

---

## Metadata Contract

The current persisted metadata shape is:

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

### Field Meaning

- `originalName`: file name supplied by the browser input or inline image label
- `replacedName`: controlled demo file name exposed by the app
- `extension`: normalized file extension
- `size`: original input size in bytes
- `type`: MIME type where available
- `demoUrl`: controlled `/files/demo-*` URL
- `replaced`: always `true` in the current demo replacement model
- `reason`: fixed replacement reason for auditability and UI explanation

The metadata intentionally does not contain raw bytes, local filesystem paths,
or trusted storage object keys.

---

## Supported Types and Limits

The current demo boundary supports:

```txt id="ticket-attachment-supported-types"
jpg, jpeg, png, gif, webp,
txt, log, csv, json,
xlsx, docx, pptx, pdf,
zip, 7z
```

Current limits are:

- maximum selected file count: 10
- maximum selected file size: 10 MB
- maximum selected file total size: 50 MB
- maximum inline image count: 20
- maximum inline image size: 5 MB
- maximum inline image total size: 20 MB
- maximum file name length: 200 characters

These limits are currently demo constants. Tenant-level attachment policy is
future scope.

---

## Selected File Preparation

Selected file preparation follows this process:

```txt id="selected-file-preparation"
File
-> validate name, extension, and size
-> choose controlled demo URL by extension
-> return TicketAttachmentMetadata
```

Image selected files are returned in the prepared `images` array. Other
selected files are returned in the prepared `files` array.

No raw `File` object crosses the ticket persistence boundary.

---

## Rich-Text Image Preparation

Rich-text body preparation follows this process:

```txt id="rich-text-image-preparation"
HTML body
-> find inline data images
-> validate image type and size
-> replace source with controlled demo URL
-> return prepared body and image metadata
```

The prepared body is the value persisted on the ticket. It should not contain
inline base64 image payloads.

---

## Ticket Persistence

Tickets persist prepared attachment metadata in separate file and image fields.

```txt id="ticket-attachment-persistence"
tk_content -> prepared body
tk_files   -> TicketAttachmentMetadata[]
tk_images  -> TicketAttachmentMetadata[]
```

Ticket DTOs expose the same application-facing separation:

```ts id="ticket-attachment-ticket-dto"
type TicketAttachmentFields = {
  files: TicketAttachmentMetadata[];
  images: TicketAttachmentMetadata[];
};
```

This keeps file attachment display and inline image display explicit while
sharing the same metadata contract.

---

## Create and Update Integration

Ticket create and requester-owned update flows call the Prepare API before the
final ticket mutation.

```txt id="ticket-create-attachment-flow"
form values
-> prepare attachments
-> toTicketMutateRequestPayloadFromFormValues(...)
-> POST or PUT ticket endpoint
```

The final ticket mutation payload contains:

- prepared body
- prepared `files`
- prepared `images`
- normal ticket fields such as category, due date, priority, risk, and email

The ticket mutation schema validates the prepared metadata shape again before
the server workflow writes the ticket.

---

## Requester Update Integration

Requester updates may add new files or rich-text images while preserving
existing prepared attachments.

```txt id="requester-update-attachment-flow"
existing attachments
+ newly prepared attachments
-> requester update payload
-> ticket update service
-> history comparison
```

The requester update layer is responsible for merging existing metadata with
the newly prepared result. The server remains responsible for validating the
final payload.

---

## Ticket Action Integration

Ticket action forms may include content and attachments for communication or
operator workflow actions.

When an action supports attachment input, the action tool prepares the body and
files before building the action payload. Approval-only actions do not need
attachment preparation.

Attachment preparation is still not an action event by itself. History is
created only when a ticket command succeeds.

---

## Draft Integration

The current draft implementation does not persist attachment binaries or
prepared attachment metadata as a recovery guarantee.

The create-ticket draft helper intentionally saves form content without carrying
raw browser files forward:

```txt id="ticket-draft-attachment-policy"
draft save
-> keep request fields
-> clear transient attachment input
-> final submit prepares current attachment input
```

LOCAL draft uses a simplified demo-safe implementation behind the feature API
boundary. It is not persistence-equivalent to the REMOTE PostgreSQL draft model.
REMOTE draft behavior goes through the draft route and server DTO boundary. In
both cases, current draft recovery is form-data oriented and does not promise
attachment restoration.

This is intentional for the current scope because browser `File` objects cannot
be safely restored after reload and production-grade attachment storage is not
implemented yet.

---

## LOCAL and REMOTE Runtime

LOCAL and REMOTE use the same visible attachment contract.

```txt id="ticket-attachment-runtime"
LOCAL  -> controlled demo replacement
REMOTE -> controlled demo replacement plus ticket row persistence
```

REMOTE PostgreSQL persistence does not mean binary file persistence. The
persisted value is still metadata pointing to controlled demo assets.

The UI should describe this as demo replacement, not as production file upload.

---

## UI Behavior

The attachment UI should show:

- selected file names
- file count and total size feedback
- validation messages
- prepared attachment display on ticket detail
- a clear notice when REMOTE mode still uses demo replacement

Ticket detail renders prepared metadata through shared attachment display
components. Display components should use `originalName` for user-facing labels
and `demoUrl` for the controlled link target.

---

## Validation

### Client Validation

Client validation improves feedback before the prepare request.

It may check:

- file count
- file size
- accepted extension
- required content

### Server Validation

The Prepare API is the trusted attachment validation boundary.

It validates:

- file name presence and length
- extension allow-list
- single-file size
- total selected-file size
- inline image count
- inline image size
- total inline image size
- unsafe image sources

### Ticket Write Validation

Ticket write schemas validate that persisted attachment metadata matches the
expected prepared shape.

---

## State Management

React Hook Form owns unsaved file input while the form is open.

React Query owns persisted ticket and draft server state.

Zustand should not be used as an attachment source of truth. It may be used for
unrelated cross-feature UI state, but not for raw files or persisted attachment
metadata.

---

## History and Notifications

Attachment preparation alone does not create ticket history and does not send a
notification.

History and notifications belong to successful ticket commands:

- ticket create with prepared attachments
- requester update that changes attachments
- ticket action with prepared attachments

History should compare prepared metadata using deterministic fields such as
`replacedName`, `demoUrl`, `originalName`, and `size`.

---

## Security Boundary

The current security posture is conservative:

- do not persist raw browser `File` objects
- do not persist base64 image payloads
- do not accept arbitrary remote image URLs
- do not store local filesystem paths
- do not let the client invent trusted metadata
- do not describe demo replacement as durable storage

This protects the demo from misleading storage behavior and keeps the future
object-storage boundary explicit.

---

## Future Object Storage Extension

A production attachment implementation may replace the internal preparation
mechanism with object storage.

Future requirements include:

- authenticated upload session
- server-issued object key
- virus and content scanning
- per-tenant limits
- authorization checks for download
- deletion and retention policy
- signed URL or proxy download behavior
- migration from demo metadata to storage metadata

The UI contract can remain close to the current shape if future metadata adds a
storage-backed URL or object key behind the same display model.

---

## Anti-Patterns Avoided

### Persisting Raw Files

`File[]` must not be stored in ticket DTOs, React Query cache, Zustand, or
server rows.

### Persisting Base64 Images

Inline data images can be large and unsafe as persisted content. They must be
prepared and replaced.

### Trusting Client Metadata

The client may send input, but the server must produce trusted prepared
metadata.

### Mixing Attachment Infrastructure into Ticket Commands

Ticket commands should consume prepared values. They should not implement file
replacement, extension validation, or inline image parsing.

### Claiming Production Upload Support

The current system uses controlled demo replacement. It does not provide
production object storage.

---

## Testing Strategy

Attachment tests should cover:

- allowed and rejected extensions
- selected file limits
- inline image replacement
- unsafe rich-text image rejection
- ticket create payload mapping
- requester update merge behavior
- ticket action attachment preparation
- draft behavior that clears transient attachment input
- LOCAL/REMOTE contract parity

---

## Responsibility Matrix

| Area | Responsibility |
| --- | --- |
| React Hook Form | Own transient browser input |
| Feature API client | Send prepare requests and ticket mutations |
| Prepare API | Validate and produce prepared metadata |
| Ticket command | Consume prepared values and apply workflow behavior |
| Ticket repository | Persist prepared metadata fields |
| Ticket detail UI | Display prepared metadata |
| Draft flow | Save form values without attachment recovery guarantee |
| Future storage service | Own durable binary storage when implemented |

---

## Related Documents

- [`ticket-form.md`](ticket-form.md)
- [`../03-domain/ticket/ticket-model.md`](../03-domain/ticket/ticket-model.md)
- [`../03-domain/ticket/ticket-activity.md`](../03-domain/ticket/ticket-activity.md)
- [`../03-domain/ticket/ticket-history.md`](../03-domain/ticket/ticket-history.md)
- [`../02-architecture/database-strategy.md`](../02-architecture/database-strategy.md)
- [`../08-dev-strategy/decision-log/2026-06-ticket-attachment-boundary.md`](../08-dev-strategy/decision-log/2026-06-ticket-attachment-boundary.md)
- [`../08-dev-strategy/decision-log/2026-06-ticket-form-and-draft-workflow.md`](../08-dev-strategy/decision-log/2026-06-ticket-form-and-draft-workflow.md)
- [`../08-dev-strategy/decision-log/2026-07-ticket-routing-and-update-policy.md`](../08-dev-strategy/decision-log/2026-07-ticket-routing-and-update-policy.md)

---

## Summary

Ticket attachments are handled through an explicit preparation boundary.

Raw browser input stays transient. The Prepare API validates selected files and
rich-text images, replaces them with controlled demo assets, and returns
prepared metadata. Ticket create, requester update, and supported action flows
persist only the prepared body, `files`, and `images`.

Drafts currently do not guarantee attachment recovery. Production object
storage remains future scope, and the current UI should present attachment
behavior as demo replacement rather than durable upload support.
