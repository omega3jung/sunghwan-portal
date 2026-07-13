# SLA Strategy

## Goal

The SLA strategy describes the current time-expectation model for Service Desk
tickets without overstating future automation.

In the current implementation, SLA is represented mainly through:

- category default SLA days
- form due date defaults and validation
- ticket `dueAt`
- priority and risk values used for planning context
- manual/operator adjustment through ticket actions

A full SLA breach, pause, escalation, calendar, and notification engine is
future scope.

---

## Core Principle

```txt id="sla-core"
Current SLA = configured expectation + ticket due date.
Full SLA automation is deferred.
```

The documentation should not describe breach detection, escalation, or working
calendar calculation as completed behavior unless the implementation adds those
services.

---

## Current Inputs

The current Service Desk model has these SLA-related inputs:

| Input | Source | Current Use |
| --- | --- | --- |
| `defaultSlaDays` | main/subcategory settings | seed or guide due date expectations |
| `priority` | category default, form, or adjust action | planning and display context |
| `riskLevel` | category default, form, or adjust action | planning and display context |
| `dueAt` | form/update/action payload | persisted ticket deadline |

Category defaults are tenant-scoped. Subcategory defaults override main category
defaults where provided.

---

## Category Default Resolution

```txt id="sla-category-resolution"
selected subcategory defaultSlaDays
-> fallback main category defaultSlaDays
-> due date expectation
```

The UI may apply category defaults when the requester selects a category.

The server still validates the submitted ticket payload and owns the final
workflow transition.

---

## Due Date Behavior

The ticket form validates that `dueAt` is later than today.

Requester update can change due date while the ticket is in:

```txt id="sla-update-statuses"
Approval
Assigned
```

Due date is routing-neutral in the current requester update policy:

- changing only due date and email recipients preserves routing
- changing category, subject, content, files, or images resets routing

If due date is changed together with routing-sensitive fields, the routing result
follows the routing-sensitive update.

When the routing-sensitive field is category, the requester update also
re-evaluates the minimum due date from the new category default SLA days:

```txt id="category-update-min-due-date"
newCategoryMinimumDueAt = today + new category default SLA days
nextDueAt = later(currentDueAt, newCategoryMinimumDueAt)
```

This keeps a later current due date, moves an earlier due date back to the new
minimum, and never pulls a due date earlier because of category change.

---

## Adjust Action

Planning values can be changed through the Ticket Action command model where the
current action rules allow it.

`ADJUST` can update planning-oriented fields such as priority, risk level, and
due date according to the action rule implementation.

Those changes should be recorded through event-based history, not hidden as
silent field mutation.

---

## Relationship with Work Sessions

Work sessions record operational work evidence. They do not currently implement
a full SLA clock.

Work sessions can help future SLA reporting answer questions such as:

- when did work begin?
- how much work was recorded?
- was the ticket resolved after recorded work?

Current SLA documentation should treat this as evidence for future reporting,
not as a completed SLA timer engine.

---

## Relationship with Auto Close

The current implementation includes automatic close behavior for resolved
tickets after a grace period.

This is not the same as SLA breach handling.

```txt id="auto-close-boundary"
Resolved ticket grace period close
!= SLA breach/escalation engine
```

Auto close uses the resolved-history timestamp plus the current 7-day grace
period. It moves the ticket to `Closed`, sets close reason `Completed`,
finishes running work sessions where supported, and records `RESOLUTION_CLOSE`
with `SYSTEM_AUTO` and `actionNo = null`.

---

## Deferred SLA Engine

A future production SLA engine may add:

- response-time targets
- resolution-time targets
- business-hour calendars
- holiday calendars
- pause/resume rules for `Pending`
- breach detection
- escalation thresholds
- notification delivery
- SLA compliance reporting
- per-tenant SLA policies

These should be introduced through explicit services, data fields, and history
events rather than implied by current due date behavior.

---

## Anti-Patterns Avoided

### Claiming a Matrix Engine Exists

Priority/risk matrices are useful future design tools, but the current
implementation should not be described as executing a complete matrix engine.

### Treating Pending as Implemented SLA Pause

`Pending` is a workflow status. It is not currently a fully implemented SLA
pause clock.

### Hiding Due Date Changes

Due date changes are operational planning changes and should be traceable.

### Mixing Auto Close and SLA Breach

Resolved-ticket auto close is a lifecycle cleanup rule, not a service-level
breach rule.

---

## Related Documents

- [`category-strategy.md`](category-strategy.md)
- [`action-strategy.md`](action-strategy.md)
- [`../ticket-track-time.md`](../ticket-track-time.md)
- [`../ticket-history.md`](../ticket-history.md)
- [`../../../06-form-design/ticket-form.md`](../../../06-form-design/ticket-form.md)

---

## Summary

The current SLA model is intentionally modest and implementation-aligned:
category settings provide default SLA days, forms and actions manage due dates
and planning fields, and history records meaningful changes.

Full SLA clocking, breach, escalation, calendars, and notifications remain
future production scope.
