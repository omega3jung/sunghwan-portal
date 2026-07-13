# Service Desk Evolution

## Goal

This document explains how the previous Service Hub / IT Help Desk experience
was refined into the current Service Desk domain in `sunghwan-portal`.

It describes the design evolution, not every implementation detail. Current
implementation boundaries are documented in
[`service-desk-implementation-strategy.md`](service-desk-implementation-strategy.md).
Historical point-in-time decisions are preserved in the decision logs.

---

## Historical Context

The previous workplace system included an IT Help Desk-style module for:

- receiving user requests
- assigning responsible staff
- tracking status
- communicating with requesters
- reviewing operational progress

The current project does not clone that system. It extracts the operational
lessons and redesigns them into a clearer, portfolio-ready Service Desk domain.

```txt id="evolution-flow"
previous workplace experience
-> operational lessons
-> clearer domain boundaries
-> production-aligned portfolio design
```

---

## Identity Shift

The name changed from Service Hub to Service Desk because the current module is
a focused workflow domain, not a broad internal portal bucket.

Service Desk now means:

- request intake
- ticket lifecycle
- approval routing
- work assignment
- action commands
- communication
- event-based history
- work sessions
- settings-driven behavior

---

## From Request Records to Workflow Entities

The earlier model can be understood as request records with status updates.

The current model treats a ticket as a workflow entity with controlled states:

```txt id="current-ticket-statuses"
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

Typical happy paths:

```txt id="happy-paths"
Draft -> Approval -> Assigned -> Working -> Resolved -> Closed
Draft -> Assigned -> Working -> Resolved -> Closed
```

Important non-happy paths:

```txt id="non-happy-paths"
Approval -> Declined
Assigned / Working / Pending -> Rejected
Working -> Pending -> Working
Resolved -> Working
Assigned / Working / Pending / Resolved -> Closed
```

Legacy names such as `Open`, `Approved`, and `Reopen` may appear in older
historical notes or row normalization code, but they are not current ticket
statuses.

---

## From Text Updates to Commands

The previous style relied heavily on comments and status edits.

The current design uses explicit Ticket Action commands:

```txt id="ticket-actions"
APPROVE
DECLINE
COMMENT
NOTE
ASSIGN
ASSIGN_SELF
REJECT
MERGE
ADJUST
REOPEN
RESUBMIT
CANCEL
```

This makes intent and effect clearer:

```txt id="action-effect-history"
Action intent
-> server rule execution
-> status/routing/data effect
-> event-based history
```

A comment is communication. Assignment, rejection, merge, reopen, and planning
adjustment are commands with rules.

---

## Comment and Note Separation

Communication evolved into two distinct concepts.

| Type | Purpose |
| --- | --- |
| `COMMENT` | requester-visible or shared communication |
| `NOTE` | internal operational note |

This avoids mixing internal team context with requester-facing communication.

---

## Activity and History Separation

The design separates action/activity from history.

```txt id="activity-history"
Activity/Action = what someone tried to do and why
History = immutable event record of what changed
```

History is now event-based and records:

- type
- source
- event
- previous/current values
- actor
- timestamp

This is more precise than treating a timeline as plain comments or relying on a
free-form `metadata.event`.

---

## Tenant-Scoped Settings

Settings evolved from admin CRUD into behavior-defining configuration.

Current settings scope:

```txt id="settings-scope"
Tenant
-> Category
-> Approval Step
-> Assignment Rule
```

Important changes:

- `Tenant` is the Service Desk configuration boundary.
- category scope is `"PORTAL"` or `"INTERNAL"`.
- approval steps are ordered and category-based.
- assignment rules are group-based through job fields and employee usernames.
- settings changes affect future behavior, not past history.

---

## Category-Driven Behavior

Category is the primary behavior driver.

```txt id="category-behavior"
Tenant-scoped category
-> defaults
-> approval resolution
-> work assignment resolution
-> requester update routing policy
```

Categories can provide default priority, risk level, and SLA days. They also
anchor approval and assignment settings.

Requester category changes are routing-sensitive and can trigger routing reset.

---

## Approval and Work Routing

Routing became phase-aware.

```ts id="assignment-phase"
type TicketAssignmentPhase = "APPROVAL" | "WORK";
```

The ticket DTO can expose:

- approval assignees
- work assignees
- assigned approver projection
- assigned worker projection

This avoids treating every assignee as the same kind of ownership.

---

## Requester Update Policy

The newer design gives requesters limited update ability before active work.

Requester update is allowed in:

```txt id="requester-update-statuses"
Approval
Assigned
```

Routing-sensitive fields:

- category
- subject
- content
- files
- images

Routing-neutral fields:

- due date
- email recipients

The server records either `ROUTING_RESET` or `ROUTING_PRESERVED`.

---

## Draft and Attachment Boundary

The create workflow evolved from a one-shot form into a draft-aware workflow.

REMOTE draft is implemented as a ticket row in `Draft` status with one active
draft per requester.

Attachment handling evolved into a preparation boundary:

```txt id="attachment-boundary"
browser file input
-> prepare API
-> prepared metadata
-> ticket command
```

This keeps the current demo honest: it can persist metadata and controlled demo
URLs without claiming production object storage.

---

## Work Sessions

Work tracking evolved from a single accumulated time field into work sessions.

Current work-session design records:

- ticket ID
- worker
- start/end or duration input
- tracked minutes
- note
- optional next status

The implemented route surface currently supports list and create. Additional
timer/update/delete APIs are future extension points until matching route
handlers exist.

---

## SLA Evolution

The design now treats SLA carefully.

Current implementation uses:

- category `defaultSlaDays`
- due date expectations
- priority and risk planning context
- adjustment through action commands where allowed

Full SLA breach detection, pause/resume clocks, business calendars,
notifications, and escalation are future production scope.

---

## Key Lessons

### Preserve Operational Intent

The new design keeps the real operational problems from the previous system
while making the domain more explicit.

### Do Not Hide Workflow in Text

Comments are not enough for assignment, rejection, merge, or planning changes.
Meaningful operations should be commands.

### Settings Define Behavior

Tenant, category, approval, and assignment settings shape future ticket
execution.

### History Explains Change

History should answer what changed, why, who caused it, and when it happened.

### Current Docs and Decision Logs Have Different Jobs

Current design documents describe the implementation-aligned model. Decision
logs preserve the context and reasoning of choices made at a point in time.

---

## Outcome

The current Service Desk module demonstrates:

- controlled ticket lifecycle
- REMOTE draft workflow
- attachment preparation boundary
- tenant-scoped settings
- approval/work routing separation
- command-based actions
- event-based history
- requester update routing policy
- work-session evidence
- realistic deferred production scope

The evolution can be summarized as:

```txt
request tracking screen
-> workflow-oriented Service Desk domain
-> implementation-aligned, traceable portfolio system
```

---

## Related Documents

- [`service-desk-implementation-strategy.md`](service-desk-implementation-strategy.md)
- [`ticket-operation-rules.md`](ticket-operation-rules.md)
- [`../03-domain/service-desk-settings.md`](../03-domain/service-desk-settings.md)
- [`../03-domain/ticket/ticket-system-overview.md`](../03-domain/ticket/ticket-system-overview.md)
- [`../03-domain/ticket/ticket-lifecycle.md`](../03-domain/ticket/ticket-lifecycle.md)
- [`../03-domain/ticket/ticket-activity.md`](../03-domain/ticket/ticket-activity.md)
- [`../03-domain/ticket/ticket-history.md`](../03-domain/ticket/ticket-history.md)
- [`../03-domain/ticket/ticket-track-time.md`](../03-domain/ticket/ticket-track-time.md)

---

## Summary

Service Desk evolved from basic request tracking into a workflow-centered
domain. The current model makes lifecycle, routing, commands, history, settings,
drafts, attachments, and work evidence explicit while keeping future production
infrastructure separate from implemented behavior.
