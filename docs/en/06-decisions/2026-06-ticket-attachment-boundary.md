# Ticket Attachment Boundary (2026-06)

## Context

The Service Desk ticket form accepts two kinds of attachment input:

- files selected through browser file inputs
- images inserted into rich-text content

While a user edits the form, the browser may temporarily hold values such as:

- `File`
- `File[]`
- base64 data URLs
- blob URLs
- rich-text HTML containing embedded base64 images

These values are useful for editing and previewing, but they are not safe ticket persistence values.

As REMOTE ticket creation, requester update, and draft behavior moved toward a PostgreSQL-backed flow, the project needed a clear boundary between:

```txt
browser attachment input
and
persisted ticket attachment metadata
```

The project does not currently implement production object storage.

It intentionally does not provide:

- permanent binary object storage
- storage bucket lifecycle management
- signed file delivery
- malware scanning
- upload-session recovery
- orphaned-file cleanup

The implementation still needs to demonstrate a realistic attachment workflow without pretending that demo references are production-grade storage.

---

## Problem

### 1. Browser file objects cannot become ticket data

The form naturally works with browser objects:

```ts
type TicketFormValues = {
  attachment: File[];
};
```

A `File` object is browser-runtime state.

It is not:

- a stable DTO
- a JSON database value
- a server-side attachment reference
- a safe value for durable ticket state

Passing `File` objects through ticket DTOs would mix form input, file transfer, storage, and ticket persistence.

---

### 2. Base64 and blob URLs are transient representations

The rich-text editor may temporarily contain:

```html
<img src="data:image/png;base64,..." />
```

or:

```txt
blob:https://example.com/...
```

Base64 content would turn the ticket row into an implicit binary store.

Blob URLs are local to the current browser runtime and can break after reload, tab close, revocation, or server rendering.

Neither value should be persisted in PostgreSQL, LOCAL mutable state, action metadata, or history metadata.

---

### 3. Ticket commands should not own file-processing infrastructure

Without a separate preparation boundary, ticket create and update commands would need to handle:

- multipart parsing
- selected-file validation
- rich-text image source detection
- demo or storage URL replacement
- ticket validation
- approval and assignment routing
- ticket row persistence
- history creation

That would make a ticket command responsible for both attachment infrastructure and workflow behavior.

```txt
Ticket command
!= file-processing pipeline
```

Ticket commands should receive persistence-safe ticket input.

---

### 4. LOCAL and REMOTE could drift

LOCAL can use static demo references, while a future REMOTE implementation may use object storage.

If those runtimes expose different attachment shapes, feature components would need branching such as:

```ts
if (dataScope === "LOCAL") {
  // render demo attachment
} else {
  // render remote attachment
}
```

The UI needs one stable application-facing attachment shape.

---

### 5. Draft behavior needs the same persistence boundary

Draft persistence must not store raw files, base64 images, or blob URLs.

If draft and submitted tickets use different attachment shapes, the system needs another conversion step at submission time.

That would make draft behavior harder to explain and easier to break.

The intended design is that draft persistence and submitted ticket persistence share the same normalized attachment contract.

---

## Decision

Introduce a server-controlled attachment preparation step before final ticket create or requester update persistence.

The core decision is:

```txt
Raw attachment input is transient.

Only normalized attachment metadata may cross the final ticket persistence boundary.
```

The final write flow is:

```txt
Form input
-> Attachment Prepare API
-> prepared body, files, and images
-> Ticket Create / Update API
-> ticket persistence
```

The current prepare implementation uses controlled demo replacement for both LOCAL and REMOTE.

It does not upload to Supabase Storage or any production file store.

---

## Scope Rules

### 1. Keep raw browser input transient

The form may temporarily hold:

- `File[]`
- base64 image sources
- blob URLs
- editor previews

Ticket persistence must not store:

- raw `File`
- file binary
- base64 data URLs
- blob URLs
- browser object references

---

### 2. Use a stable Prepare API contract

The feature client sends attachment input to the preparation boundary before final ticket write.

The route shape may evolve, but the current intended boundary is:

```txt
POST /api/service-desk/tickets/attachments/prepare
```

Conceptually:

```ts
type PrepareTicketAttachmentsInput = {
  body: string;
  files: File[];
};

type PrepareTicketAttachmentsResponse = {
  body: string;
  files: TicketAttachmentMetadata[];
  images: TicketAttachmentMetadata[];
};
```

`body` represents the rich-text content after image-source normalization.

Ticket create, draft submit, and requester update use the prepared content and metadata when crossing the ticket persistence boundary.

---

### 3. Store metadata, not storage-client values

The current metadata shape is:

```ts
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

This shape is:

- JSON serializable
- browser-runtime independent
- safe for the current ticket DTO
- shared by LOCAL and REMOTE
- explicit that the value is a demo replacement

The ticket model must not expose storage SDK objects or provider-specific upload responses.

---

### 4. Normalize rich-text images before persistence

The Prepare API inspects image sources in rich-text HTML.

Supported current behavior:

- preserve controlled demo file URLs
- replace supported inline base64 images with controlled demo URLs
- reject blob image URLs
- reject remote image URLs
- reject local file paths
- reject unsupported image MIME types

After preparation, the body must not contain raw embedded base64 image data.

```txt
Before prepare
<img src="data:image/png;base64,...">

After prepare
<img src="/files/demo-*.png">
```

This is a controlled simulation, not production image storage.

---

### 5. Generate controlled file metadata

Selected files are represented as `File[]` only inside the client form workflow.

The Prepare API converts accepted files into metadata containing:

- original display name
- replacement demo name
- extension
- file size
- MIME type
- controlled demo URL
- replacement reason

The original filename is display metadata only.

It must not be treated as:

- a trusted storage key
- proof of MIME type
- a safe filesystem path
- a unique identifier

A future storage implementation should generate a server-controlled object key.

---

### 6. Persist only normalized ticket values

Ticket create and requester update persistence receive prepared values.

The ticket row may persist:

```txt
tk_content
tk_files
tk_images
```

Where:

- `tk_content` stores the prepared rich-text body
- `tk_files` stores JSON file metadata
- `tk_images` stores JSON image metadata

Repositories must not persist raw browser attachment values.

---

### 7. Keep draft and submitted attachment contracts aligned

Draft persistence must not store raw binary data, base64 content, or blob URLs.

Draft tickets should use the same normalized attachment contract as submitted tickets.

Therefore:

```txt
Draft attachment shape
=
Submitted ticket attachment shape
```

This avoids a conversion step when the draft is submitted.

Saving a draft that contains new attachments therefore also belongs behind the same preparation boundary before durable persistence.

---

### 8. Keep LOCAL and REMOTE output compatible

The UI should not know how an attachment URL was produced.

```txt
LOCAL
-> controlled static demo reference

REMOTE current scope
-> controlled replacement or future storage-backed reference behind the same DTO

REMOTE future implementation
-> object-storage-backed reference behind the same boundary
```

Rendering uses the stable component contract:

```tsx
<TicketAttachmentList files={ticket.files} images={ticket.images} />
```

Feature components do not branch on:

- data scope
- storage provider
- upload strategy
- demo implementation

---

### 9. Treat preparation as the trusted validation boundary

Client-side validation may improve user experience, but it is not the trusted boundary.

Server preparation validates and normalizes:

- file count
- file size
- total size
- extension
- MIME type where applicable
- inline image count
- inline image size
- unsupported source schemes
- controlled demo URL generation

The ticket write endpoint may also validate that attachment metadata matches the expected DTO schema.

---

### 10. Keep history and notifications tied to ticket commands

Preparing attachments is not a ticket workflow event by itself.

Attachment preparation alone does not create:

- Ticket Action
- Ticket History
- status transition
- notification

History and notifications occur only when a successful ticket command uses the prepared result.

---

## What Was Aligned

### 1. Prepare API boundary

The attachment pipeline is separated from ticket workflow commands.

```txt
Feature client
-> Attachment Prepare Route Handler
-> attachment preparation service
-> prepared DTO
-> Ticket Create / Update Route Handler
```

This keeps ticket services focused on ticket lifecycle behavior.

---

### 2. Ticket metadata shape

The final ticket DTO uses `TicketAttachmentMetadata[]` for files and images.

Both prepared selected files and prepared inline images use the same metadata family.

---

### 3. Demo storage language

Documentation and UI copy should describe the current behavior as a controlled demo replacement.

It should not imply:

- permanent upload
- private object storage
- signed download delivery
- malware scanning
- production retention policy

---

## Consequences

### Positive

- Ticket APIs receive JSON-safe attachment metadata.
- Raw binary, base64, and blob values stay out of PostgreSQL ticket data.
- Attachment processing can be tested separately from ticket routing.
- LOCAL and REMOTE expose the same current DTO shape.
- Future object storage can be introduced behind the preparation boundary.
- The portfolio stays credible by naming the storage limitation clearly.

---

### Negative / Trade-offs

- Ticket submission requires an additional prepare step.
- Feature workflow must coordinate prepare failure and ticket write failure.
- Current draft attachment recovery is intentionally limited.
- Demo URLs are not production file storage.
- Future real storage will need upload tokens, cleanup, retention, and access policy.

---

## Follow-up Policy

- Keep raw `File`, base64, and blob values out of persisted ticket state.
- Keep the Prepare API as the only trusted attachment normalization boundary.
- Keep `TicketAttachmentMetadata` stable for UI consumers.
- Do not describe demo replacement URLs as production storage.
- If object storage is added, keep the same application-facing prepare response shape where possible.
- If draft upload recovery becomes a product requirement, add explicit draft upload/session cleanup policy.

---

## Summary

The attachment boundary keeps browser-only attachment input out of ticket persistence.

The current model is:

```txt
File[] / inline base64 / blob URL
-> Prepare API
-> prepared body + TicketAttachmentMetadata
-> Ticket create or requester update
-> tk_content / tk_files / tk_images
```

LOCAL and REMOTE share one application-facing attachment metadata contract.

That is deliberate: it preserves a realistic form experience while avoiding false claims about production file storage.
