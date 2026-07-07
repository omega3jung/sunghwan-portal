# Service Desk Evolution

This document focuses on the **design improvements** made while evolving the previous Service Hub / IT Help Desk experience into the current Service Desk domain.

## 1. Purpose

This document explains how the previous **Service Hub / IT Help Desk** experience was refined into the current **Service Desk** domain in `sunghwan-portal`.

The goal is not to reproduce the previous workplace system directly. Instead, this document focuses on the conceptual and domain-level improvements made while rebuilding the idea as a portfolio-ready Service Desk module.

This document focuses on:

- how the domain identity changed
- how ticket handling evolved into workflow management
- how operational behavior became more explicit
- how communication, history, assignment, approval, SLA, and work tracking became clearer
- what design lessons were learned from the previous experience

Implementation-specific topics such as local demo state, runtime separation, routing, React Query, i18n, and project architecture are intentionally handled in a separate implementation strategy document.

---

## 2. Recommended Documentation Location

Recommended path:

```txt
docs/en/08-dev-strategy/service-desk-evolution.md
```

Use this document for:

- conceptual/domain evolution from Service Hub to Service Desk
- renamed or refined operational behavior
- workflow and modeling improvements

Implementation-specific topics should be handled in:

```txt
docs/en/08-dev-strategy/service-desk-implementation-strategy.md
```

---

## 3. Historical Context

The previous workplace system was an internal portal / ERP environment that included an IT Help Desk-style module. It supported practical operational needs such as receiving user requests, assigning responsible staff, tracking issue status, and helping internal users communicate with the IT team.

That experience provided several important lessons:

- users need a simple and reliable way to submit issues
- IT staff need clear ownership and assignment visibility
- managers need operational summaries and progress tracking
- status changes need to remain understandable during maintenance
- communication history should help explain why decisions were made
- UI usability matters because tickets are handled during real work

However, the current project has a different purpose.

The goal is not to clone the original system. The goal is to extract the operational problems behind it and redesign them as a clearer, more explicit Service Desk domain.

```txt
Previous workplace experience
-> extract real operational problems
-> redesign with clearer domain boundaries
-> document as a production-aligned portfolio system
```

---

## 4. Identity Shift: From Service Hub to Service Desk

The name changed from **Service Hub** to **Service Desk** because the current module is no longer a broad internal portal feature.

`Service Hub` suggests a wide platform that can contain many unrelated services.

`Service Desk` more clearly communicates a focused operational domain:

- request intake
- ticket workflow
- assignment
- approval
- SLA
- work tracking
- communication
- operational history

This naming change is more than cosmetic. It clarifies the system boundary.

The current module is not just a portal screen. It is a workflow-centered Service Desk domain.

---

## 5. Core Domain Evolution

The major improvement can be summarized as:

```txt
Simple request handling
-> workflow-oriented Service Desk system
```

The redesigned Service Desk focuses on:

- ticket lifecycle integrity
- category-driven behavior
- controlled operational overrides
- explicit actions instead of text-only updates
- communication separation
- activity and history separation
- traceable domain events
- work tracking as operational evidence
- settings as behavior-defining configuration

---

## 6. From Request Records to Workflow Entities

The previous system direction can be understood as request records with status updates.

That is useful for basic tracking, but it is not enough for a Service Desk domain. Real tickets move through meaningful operational states.

The improved model treats a ticket as a **workflow entity**.

A typical lifecycle can be represented as:

```txt
Draft -> Open -> Approved -> Working -> Resolved -> Closed
```

The improved lifecycle also supports non-happy paths:

```txt
Open -> Declined -> Open
Working -> Pending -> Working
Working / Pending -> Rejected
Rejected -> Open or Reopen
Resolved -> Reopen -> Working
```

This matters because real operational work includes:

- approval rejection
- temporary pauses
- rework after resolution
- rejected requests
- duplicated or merged tickets
- review requests and explicit reopen flows

The improved Service Desk model defines ticket status as a controlled workflow state.

Each meaningful transition should have a valid cause:

```txt
Action -> State Transition -> History
```

This makes the system easier to reason about, easier to test, and easier to explain during review.

---

## 7. Category-Driven Behavior

The previous operational experience showed that request type strongly affects how work should be handled.

The improved system makes category a central behavior driver:

```txt
Ticket -> Category -> Behavior
```

Category can influence:

- default priority
- default risk level
- SLA
- approval requirements
- assignment rule
- responsible team

The category structure follows a hierarchical model:

```txt
Client -> Main Category -> Sub Category
```

The default behavior resolution order is:

```txt
Sub Category > Main Category
```

When ticket-level overrides are allowed, the complete resolution order becomes:

```txt
Ticket override > Sub Category > Main Category
```

This improves the previous approach by moving hidden or scattered operational assumptions into explicit configuration.

The Service Desk can support different request types without hardcoding every branch into UI components or one-off handlers.

---

## 8. Controlled Overrides

Real operations always have exceptions.

For example:

- priority may need to be raised
- risk level may be higher than the category default
- due date may need to change
- assignee may need to change because of workload
- SLA may need to be adjusted after review

A strictly category-driven system is predictable but too rigid. A fully dynamic system is flexible but difficult to audit.

The improved model uses a controlled hybrid approach:

```txt
Category = default behavior
Ticket action = controlled override
```

Overrides should be:

- explicit
- visible to relevant users
- recorded in history
- performed through a valid action
- supported by permission and status rules
- explained with a reason when needed

This balances operational flexibility with traceability.

The system can handle real exceptions without hiding them as silent field updates.

---

## 9. From Comments to Actions

One of the largest domain improvements was moving from a comment-centered model to an action-driven model.

A comment-only model is convenient at first, but it becomes weak as the workflow grows.

Problems with comment-only behavior include:

- assignment changes are hidden in text
- priority changes are not strongly typed
- rejection reasons are mixed with normal messages
- merge decisions are difficult to audit
- status changes become hard to explain
- UI must infer meaning from plain text

The improved model treats every meaningful interaction as an action:

```txt
Activity = Action + Context + Reason + Execution Rules
```

Examples:

```txt
comment  -> public communication
note     -> internal communication
assign   -> ownership change
adjust   -> priority / risk / due date change
merge    -> duplicate or related ticket consolidation
reject   -> operational rejection
reopen   -> return to active processing
resubmit -> requester revision after rejection or decline
```

The system separates intent from effect:

```txt
Intent = reason or explanation
Effect = structured metadata and state change
```

This makes the ticket timeline clearer and makes audit behavior more reliable.

---

## 10. Comment and Note Separation

The communication model was refined by separating `comment` and `note`.

| Type      | Purpose                            | Visibility                | Notification             |
| --------- | ---------------------------------- | ------------------------- | ------------------------ |
| `comment` | public or shared communication     | visible to relevant users | may notify               |
| `note`    | internal operational communication | internal team or author   | no external notification |

This distinction improves the previous communication model by separating external communication from internal team context.

A requester-facing comment and an internal operational note have different purposes.

This avoids exposing sensitive team discussion to requesters while still keeping internal context inside the ticket timeline.

---

## 11. Activity and History Separation

The improved system separates **Activity** and **History**.

```txt
Activity = meaningful user or operational interaction
History  = immutable event record generated by a change
```

Activity answers:

- what did the user try to do?
- why did they do it?
- what action type was executed?
- what context was provided?

History answers:

- what field changed?
- what was the previous value?
- what is the new value?
- who caused the change?
- when did it happen?

This prevents the timeline from becoming either too technical or too vague.

The UI can show meaningful activity, while the system can still maintain precise audit records.

---

## 12. Expanded Action Taxonomy

The Service Desk action set was refined to better match operational language.

Important action concepts include:

- `comment` for shared communication
- `note` for internal communication
- `assign` for ownership changes
- `assign myself` as a user-friendly label for self-assignment
- `adjust` / `Adjust Plan` for changing priority, risk level, SLA, or due date
- `merge` for duplicate or related ticket consolidation
- `reject` for operational rejection
- `request review` / `reopen` for returning to active processing
- `resubmit` for requester revision after rejection or decline

### 12.1 Merge Semantics

The improved merge behavior avoids introducing a separate `Merged` status.

Instead:

```txt
source ticket -> Closed
closeReason   -> Merged
mergedIntoTicketId -> target ticket id
mergedIntoTicketNo -> target ticket number
```

This preserves status consistency while still representing the relationship between tickets.

The action system now models real service desk operations instead of forcing everything into status fields or free-form comments.

---

## 13. Rule Formalization

The system now defines ticket rules using an implementation-oriented but domain-readable format:

```txt
who
when
effect
purpose
restriction
```

This format is useful because it connects business behavior to implementable rules.

Example:

```txt
Action: Adjust Plan
who: assignee or manager/admin
when: valid operational states
effect: update priority, risk level, SLA, or due date
purpose: adjust execution planning
restriction: reason required; history must be recorded
```

This is an improvement over vague policy descriptions.

Rules are no longer only conceptual. They can guide:

- permission checks
- status guards
- action availability
- history generation
- UI behavior
- future API validation

The key improvement is that domain policy becomes easier to implement and easier to review.

---

## 14. Behavioral Capability Evolution

The Service Desk redesign also improved the meaning of operational behavior beyond basic ticket status.

The most important behavioral improvements are:

- work time is represented as sessions
- status changes are tied to work evidence
- settings are treated as behavior-defining configuration

---

## 15. Track Time as Work Sessions

The improved system does not treat work time as a single accumulated number.

Instead:

```txt
Work = collection of sessions
```

Each work session can have:

- start time
- end time
- duration
- assignee
- note

Timer actions and manual time input are conceptually separated:

```txt
start
finish
switch
manual range
manual duration
```

This better reflects real operational work.

People pause, resume, switch tickets, and sometimes enter time manually after the fact.

The session-based model makes work history more explainable than a single aggregate value.

---

## 16. Status Transitions Tied to Work Evidence

Status transitions related to active work should not be decorative.

Moving to states such as `Working`, `Pending`, or `Resolved` should be connected to meaningful work context.

For example, a ticket marked as resolved should be able to answer:

```txt
Was actual work recorded before this ticket was marked resolved?
```

This improves the meaning of status changes.

A status value is not only a label. It represents operational progress.

Connecting status transitions with work evidence makes the Service Desk more reliable as a workflow system.

---

## 17. Settings as Domain Foundation

The settings module was improved from simple admin CRUD into domain configuration.

Service Desk settings include:

- categories
- approval steps
- assignment rules
- departments
- job fields

These are not just editable lists. They shape system behavior.

The improved relationship can be summarized as:

```txt
Settings define how tickets behave.
Tickets execute that behavior.
History records what happened.
```

This is an important domain improvement.

Settings are not treated as secondary admin screens. They are the foundation for workflow behavior.

---

## 18. Key Lessons Learned

### 18.1 Preserve Real Operational Intent

The previous Service Hub experience contained real operational lessons.

The new Service Desk preserves that intent while improving the structure and making the domain more explicit.

### 18.2 Do Not Hide Workflow in Text

Operational decisions should be modeled explicitly.

A plain `comment` is not enough for assignment, rejection, merge, or plan adjustment.

Meaningful workflow decisions should be represented as actions.

### 18.3 Configuration Should Shape Behavior

Settings are not only data management screens.

They define how tickets behave.

Category, assignment, approval, and SLA rules should be visible as domain configuration, not scattered across hidden conditions.

### 18.4 History Should Explain Change

A workflow system needs more than current state.

It should be possible to understand:

- what changed
- why it changed
- who changed it
- when it changed
- which action caused it

This is why activity and history are separated.

### 18.5 Domain Design Should Stay Reviewable

A portfolio system should not only work. It should also be explainable.

The Service Desk redesign makes the domain easier to explain to reviewers, future maintainers, and interviewers.

---

## 19. Evolution Outcome

The current Service Desk module is no longer just a rewritten version of a previous IT Help Desk screen.

It is an improved domain model that demonstrates:

- practical migration thinking
- workflow-oriented ticket modeling
- category-driven behavior
- controlled operational overrides
- action-driven activity
- comment and note separation
- activity and history separation
- session-based work tracking
- status changes tied to work evidence
- settings as behavior-defining configuration
- maintainable domain documentation

The evolution can be summarized as:

```txt
Previous workplace Service Hub experience
-> extracted operational problems
-> redesigned into a clearer Service Desk domain
-> documented as a production-aligned portfolio system
```

The most important improvement is that the project does not simply copy a previous system.

It uses previous real-world experience as input, then rebuilds the concept with clearer domain boundaries, stronger workflow semantics, and more explainable operational behavior.

---

## 20. Suggested Cross References

This document can be linked from:

- `docs/en/README.md` (Development Strategy section)

Related references:

- `docs/en/08-dev-strategy/service-desk-implementation-strategy.md`
- `docs/en/03-domain/ticket/ticket-system-overview.md`
- `docs/en/03-domain/ticket/ticket-lifecycle.md`
- `docs/en/03-domain/ticket/ticket-activity.md`
- `docs/en/03-domain/ticket/ticket-history.md`
- `docs/en/03-domain/ticket/ticket-track-time.md`
- `docs/en/08-dev-strategy/decision-log/2026-05-service-desk-documentation-alignment.md`

---

## 21. Suggested README Summary

### Service Desk Evolution

This document explains how real operational experience from a previous Service Hub / IT Help Desk module was redesigned into a clearer Service Desk domain. It focuses on conceptual improvements such as workflow lifecycle integrity, action-driven activity, category-based behavior, controlled overrides, and activity/history separation.
