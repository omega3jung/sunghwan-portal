# Resolved Auto-Close Scheduling (2026-09)

## Context

In REMOTE, Supabase Cron directly calls the database auto-close function at the
start of every hour. The function closes tickets that are still `Resolved` and
whose latest resolution was at least 168 hours ago. Eligibility time and
scheduled execution time are distinct.

The Service Desk already defines `Resolved -> Closed` as a system-driven lifecycle
transition.

The current lifecycle contract is:

```txt
latest resolution History timestamp
+ 7-day grace period
-> Closed
```

Automatic close is not a Ticket Action and is not part of the full SLA breach or
escalation model.

Its persisted result is:

```txt
status: Resolved -> Closed
close reason: Completed

History:
type = STATUS
event = RESOLUTION_CLOSE
source = SYSTEM_AUTO
actorUsername = null
actionNo = null
```

Running Work Sessions are finished where supported.

Before this decision, the application already had an idempotent, cron-ready
auto-close path, but the scheduled execution boundary had not been finalized.
The project therefore needed to decide:

- what "7 days after resolution" means;
- how frequently the cleanup should run;
- whether each Ticket needs its own delayed job;
- whether scheduling should call the application server or execute a database
  maintenance function directly;
- how retries and concurrent workflow changes should behave.

---

## Problem

### 1. A daily batch introduces a large timing gap

An initial option was to run the cleanup once per day, for example at 03:00.

If the policy is based on elapsed time, a daily batch produces different actual
grace periods depending on when the Ticket was resolved.

```txt
Resolved at 02:00
-> eligible 7 days later at 02:00
-> 03:00 batch closes after about 7 days + 1 hour

Resolved at 04:00
-> eligible 7 days later at 04:00
-> next 03:00 batch closes after about 7 days + 23 hours
```

The batch would still guarantee at least 7 days when using timestamp comparison,
but the additional delay could approach 24 hours.

Hourly polling was selected to narrow this interval for the current prototype
scope; this is a scheduling trade-off, not a measured query-performance claim.

---

### 2. Calendar-date comparison changes the meaning of the grace period

Another option was to compare only calendar dates.

For example:

```txt
resolved date + 7 calendar days
```

This is not equivalent to an elapsed 168-hour grace period.

A Ticket resolved late in the day could become eligible early on the seventh
calendar date, before a full seven 24-hour periods have elapsed.

The current design already uses the resolution History timestamp rather than a
generic Ticket update timestamp, so the scheduling rule should preserve that
timestamp-based meaning.

---

### 3. Per-Ticket delayed jobs add lifecycle coordination cost

A per-Ticket scheduled job could execute exactly at:

```txt
resolvedAt + 7 days
```

However, Tickets can be reopened and resolved again.

A per-Ticket job model would therefore require additional behavior for:

- persistent job creation;
- cancellation after reopen;
- replacement after re-resolution;
- retry state;
- duplicate-job prevention;
- scheduler recovery after deployment or infrastructure interruption.

That operational machinery is disproportionate to the current requirement.

Resolved auto-close is a lifecycle cleanup rule, not a real-time SLA deadline.

---

### 4. The execution boundary should not duplicate workflow logic unnecessarily

Two scheduling boundaries were considered:

```txt
Supabase Cron
-> protected HTTP / Next.js endpoint
-> application service
```

and:

```txt
Supabase Cron
-> PostgreSQL maintenance function
```

The current auto-close operation is database-local:

- find eligible `Resolved` Tickets;
- lock and revalidate the Ticket;
- update the Ticket state;
- finish running Work Sessions;
- append immutable History.

It does not currently require browser state, user-session authorization,
notification delivery, or another external service.

An authenticated HTTP auto-close path already exists, including cron-secret
validation in the Route Handler and lifecycle execution in the application
service. This decision selects direct database execution for the scheduled
REMOTE job, avoiding a runtime dependency on the application server.

The existing HTTP path remains implemented. Direct database execution does not
remove it or consolidate the lifecycle logic into a single implementation; the
SQL function and application service must remain semantically aligned.

---

## Decision Drivers

The decision prioritizes:

1. Preserve a real 7-day grace period rather than a calendar-date approximation.
2. Keep scheduling simple and recoverable after missed runs.
3. Avoid creating persistent per-Ticket scheduler state.
4. Keep the operation idempotent under retries and concurrent execution.
5. Preserve Ticket, Work Session, and History consistency.
6. Reuse the existing database workflow facts instead of introducing a second
   close timestamp source.
7. Avoid infrastructure complexity that does not improve the current portfolio
   requirement.
8. Keep the design production-aligned without presenting the Free Plan deployment
   as production-complete infrastructure.

---

## Decision

### 1. Define the grace period as elapsed time

A Ticket becomes eligible under these conditions:

```txt
resolvedAt = latest History timestamp that moved the Ticket to Resolved

closeEligibleAt = resolvedAt + 7 days

eligible when:
current status = Resolved
AND closeEligibleAt <= now
```

The project treats the 7-day grace period as seven elapsed 24-hour periods.
The maintenance SQL function sets its timezone to UTC so its `interval '7 days'`
comparison preserves that 168-hour meaning.

It does not use:

```txt
Ticket.updatedAt
```

or:

```txt
calendar date difference
```

as the authoritative auto-close clock.

---

### 2. Use the latest resolution History timestamp

A Ticket can move through:

```txt
Resolved
-> Working
-> Resolved
```

after a reopen.

The most recent transition to `Resolved` starts a new grace period.

Conceptually:

```txt
first resolution
-> reopen
-> second resolution
-> second resolution timestamp + 7 days
```

The earlier resolution must not make the re-resolved Ticket immediately eligible
for closure.

No separate `closeEligibleAt` Ticket column is introduced for the current scope.

The immutable workflow History already records when the Ticket was resolved.

---

### 3. Run the scheduler once per hour

The selected schedule invokes the maintenance function at the start of each hour.

Cron expression:

```txt
0 * * * *
```

The intended timing under uninterrupted hourly execution is:

```txt
minimum grace period
= 168 hours

time from eligibility to the next scheduled check
= approximately 0 to 1 hour
```

This is a check interval, not a closure-completion guarantee. Execution time,
lock contention, and missed or failed runs can delay closure beyond one hour.

The scheduler frequency and the business eligibility rule are intentionally
separate.

The hourly job does not mean that a Ticket becomes eligible every hour. It only
checks whether the exact timestamp-based grace boundary has already elapsed.

---

### 4. Use Supabase Cron as the scheduling trigger

The selected scheduling strategy for REMOTE is to use Supabase Cron / `pg_cron`
to invoke the maintenance operation. Deployment and scheduled execution
verification are tracked separately from acceptance of this decision.

The scheduled command is conceptually:

```sql
select service_desk.close_expired_resolved_tickets();
```

The Cron layer owns only:

```txt
when the maintenance operation is invoked
```

It does not redefine the Ticket lifecycle rule.

---

### 5. Execute the current scheduled operation through a maintenance database function

For the current scope, the selected execution path is a direct call from Supabase
Cron to the PostgreSQL function.

```txt
Supabase Cron
-> service_desk.close_expired_resolved_tickets()
-> Ticket / Work Session / Ticket History
```

The function is a maintenance-only entry point.

It uses `SECURITY INVOKER`, and browser-facing roles must not receive permission
to invoke it.

The scheduler therefore runs with an explicitly authorized database role rather
than elevating arbitrary callers through the function.

This choice is specific to the current database-local lifecycle operation. It
does not establish a rule that all future scheduled workflows must run inside
PostgreSQL.

If a future scheduled workflow requires external integrations, notification
delivery, application-only policy, or another runtime dependency, the execution
boundary should be reconsidered.

---

### 6. Revalidate after acquiring the Ticket lock

Selecting a candidate alone does not justify closing it; the function must
validate the current state after locking the Ticket.

A Ticket may be reopened or otherwise changed while the scheduler is running.

The maintenance path therefore:

```txt
find candidate
-> acquire Ticket row lock
-> re-read current resolution evidence
-> revalidate current Resolved status and grace period
-> apply close
```

Locked rows may be skipped and retried by the next hourly run.

This avoids waiting for Ticket row locks held by another workflow. It does not
guarantee that every other database operation in the batch is non-blocking.

---

### 7. Keep the lifecycle mutation atomic

For each successful auto-close invocation, the required effects remain one
consistent system operation:

```txt
Resolved -> Closed
+ close reason Completed
+ finish running Work Sessions where supported
+ append RESOLUTION_CLOSE History
```

No Ticket Action row is created.

The History record remains:

```txt
type = STATUS
event = RESOLUTION_CLOSE
source = SYSTEM_AUTO
actorUsername = null
actionNo = null
```

An unexpected failure is not converted into a partial success.

The next scheduler execution provides the retry opportunity for Tickets that
remain eligible.

---

## Alternatives Considered

### Option 1 — Daily 03:00 batch

```txt
0 3 * * *
```

#### Advantages

- Very simple schedule.
- Fewer scheduler invocations.

#### Disadvantages

- Adds between almost 0 and almost 24 hours after the exact 7-day eligibility
  boundary.
- Makes "7 days after resolution" less precise than necessary.

#### Conclusion

Not selected.

Hourly polling was selected for the current prototype to reduce the interval
between eligibility checks without introducing per-Ticket jobs. No benchmark or
production-load claim is made for the query cost.

---

### Option 2 — Calendar-date based close

Example concept:

```txt
resolved_date <= current_date - 7
```

#### Advantages

- Easy to explain as a daily batch rule.
- Simple date comparison.

#### Disadvantages

- Does not guarantee 168 elapsed hours.
- Changes the meaning of the existing timestamp-based grace period.

#### Conclusion

Rejected.

The current domain rule is elapsed time from resolution evidence.

---

### Option 3 — One delayed job per resolved Ticket

#### Advantages

- Can execute very close to the exact eligibility timestamp.
- Avoids periodic scanning.

#### Disadvantages

- Requires persistent scheduler state per Ticket.
- Reopen must cancel or invalidate the existing job.
- Re-resolution must create or replace the job.
- Retry and duplicate-job handling become separate infrastructure concerns.
- Adds complexity for precision the current lifecycle cleanup does not require.

#### Conclusion

Rejected for the current scope.

Hourly polling provides sufficient precision with much lower operational
complexity.

---

### Option 4 — Supabase Cron calls a protected Next.js endpoint

```txt
Supabase Cron
-> authenticated HTTP request
-> Next.js Route Handler
-> server service
-> PostgreSQL
```

#### Advantages

- Keeps application workflow execution in the server/application boundary.
- Reuses the existing authenticated Route Handler and application service.
- Can naturally coordinate future non-database integrations.

#### Disadvantages

- Requires configuring and maintaining the existing scheduler-specific HTTP
  authentication boundary for the scheduled caller.
- Depends on application deployment availability in addition to database
  availability.
- Adds a network hop for an operation whose current effects are entirely
  database-local.
- Makes the scheduled operation depend on the HTTP/application path despite its
  current effects being database-local.

#### Conclusion

Not selected as the scheduled REMOTE execution path. The HTTP implementation
already exists and remains in the codebase; this decision does not remove it.

This remains a valid future boundary if auto-close later depends on application
or external-service behavior.

---

## Consequences

### Positive

- Every automatically closed Ticket receives at least the intended 168-hour
  `Resolved` grace period.
- Under uninterrupted hourly execution, eligibility is normally detected within
  approximately one hour; this is not a bound on closure completion time.
- Reopen and re-resolution naturally restart the grace period through the latest
  resolution History timestamp.
- A missed scheduler run does not lose the operation; the next run can catch up
  because eligibility is state-based rather than event-delivery based.
- No per-Ticket scheduler records or cancellation workflow are required.
- Ticket state, Work Session cleanup, and History remain one consistent
  maintenance operation.
- Scheduler retries and concurrent runs remain compatible with an idempotent
  `Resolved`-only transition.
- The design is easy to explain as a separation between business time and batch
  execution time.

### Negative / Trade-offs

- Automatic close is not executed at the exact `resolvedAt + 7 days` instant.
  The next scheduled check may be nearly one hour later, and execution time,
  lock contention, or missed or failed runs can extend the delay.
- The hourly query executes even when there are no eligible Tickets.
- The SQL function and existing application service both implement auto-close.
  Their lifecycle semantics must remain aligned with the current Ticket design;
  choosing one scheduled entry point does not eliminate this maintenance cost.
- Because the current hosted database uses a Supabase Free Plan, project pause or
  infrastructure unavailability can prevent scheduled runs. A later run can
  catch up on still-eligible Tickets, but this deployment should not be described
  as an always-on production scheduler.
- The current approach does not provide enterprise scheduler monitoring,
  alerting, or retry guarantees.

---

## Implementation Notes

The maintenance function should preserve the following contract:

```txt
candidate:
  active Ticket
  current status = Resolved
  latest resolution History + 7 days <= now

execution:
  lock Ticket
  revalidate current eligibility
  close Ticket
  finish running Work Sessions where supported
  append system History
```

Concurrency behavior:

```txt
locked Ticket
-> skip current run
-> retry eligibility on a later hourly run
```

Authorization boundary:

```txt
maintenance database role
-> may execute function

PUBLIC / anon / authenticated
-> must not execute function
```

The scheduler should have only one active registration for this maintenance
operation.

Do not simultaneously activate an independent HTTP scheduler path for the same
rule unless a later decision explicitly changes the execution boundary.

Implementation references:

- `docs/db/function/close_expired_resolved_tickets.sql`: maintenance function,
  including the hourly Cron registration example in comments.
- `src/app/api/service-desk/cron/tickets/close-expired-resolved/route.ts`: existing
  HTTP authentication boundary and LOCAL / REMOTE dispatch.
- `src/server/data/serviceDesk/ticket/ticketService.ts`:
  `closeExpiredResolvedTickets`, the existing application maintenance workflow.

The SQL file is available in the local workspace, but `/docs/db` is excluded by
`.gitignore`. External repository readers cannot inspect that implementation from
the tracked repository alone. Supabase deployment and Cron execution have been
verified separately, as recorded in Status below.

---

## Verification Policy

Cron registration alone does not prove the complete lifecycle behavior.

Verification should distinguish:

```txt
1. function verification
2. scheduler invocation verification
3. end-to-end scheduled lifecycle verification
```

Minimum evidence includes:

- the database function can be invoked with the intended maintenance role;
- an ineligible `Resolved` Ticket remains unchanged;
- an eligible `Resolved` Ticket becomes `Closed`;
- the close reason is projected as `Completed`;
- running Work Sessions are finished where supported;
- `RESOLUTION_CLOSE` is appended with `SYSTEM_AUTO`;
- no Ticket Action row is created;
- repeated execution does not close the same Ticket again;
- Cron execution history shows the hourly job running successfully.

A registered Cron job should not be described as fully verified scheduled
auto-close until the scheduled execution path itself has been observed.

Cron registration and invocation evidence can be checked separately through
`cron.job` and `cron.job_run_details`; a successful invocation must still be
correlated with the expected lifecycle effects.

---

## Scope Boundary

This decision completes the scheduling strategy for resolved-ticket lifecycle
cleanup.

It does not introduce:

- a full SLA clock;
- business-hour or holiday calendars;
- SLA breach detection;
- escalation thresholds;
- notification delivery guarantees;
- a general-purpose application job queue;
- per-Tenant scheduler configuration;
- production-grade scheduler monitoring or alerting.

Those remain separate production concerns.

---

## Follow-up Policy

- Keep `Resolved` auto-close based on the latest resolution History timestamp.
- Keep the grace period at 7 elapsed days unless a new product requirement
  explicitly changes it.
- Keep the hourly scheduler independent from the business eligibility rule.
- Do not replace History timing with generic `Ticket.updatedAt`.
- Do not introduce per-Ticket delayed jobs only to remove the nominal wait of up
  to one hour between eligibility and the next scheduled check.
- Keep the scheduled function inaccessible to browser/API roles.
- If auto-close later requires external notification or other application/runtime
  behavior, reconsider whether the scheduler should call an application endpoint
  instead of executing the database function directly.
- Treat Supabase Free Plan pause behavior as a deployment limitation, not as part
  of the domain lifecycle contract.

---

## Related Documents

- `docs/spec/ticket-system.md`
- `docs/en/03-domain/service-desk/ticket/ticket-lifecycle.md`
- `docs/en/03-domain/service-desk/ticket/ticket-history.md`
- `docs/en/03-domain/service-desk/ticket/ticket-work-session.md`
- `docs/en/03-domain/service-desk/ticket/reference/ticket-operation-rules.md`
- `docs/en/03-domain/service-desk/ticket/strategy/sla-strategy.md`
- `docs/en/05-development/releases.md`
- `docs/en/06-decisions/2026-07-ticket-action-and-history-execution.md`
- `docs/db/function/close_expired_resolved_tickets.sql` (local, Git-ignored SQL)
- `src/app/api/service-desk/cron/tickets/close-expired-resolved/route.ts`
- `src/server/data/serviceDesk/ticket/ticketService.ts`
- [Supabase Cron](https://supabase.com/docs/guides/cron)
- [Supabase production checklist — availability](https://supabase.com/docs/guides/deployment/going-into-prod#availability)

---

## Summary

Resolved auto-close separates the exact business eligibility boundary from the
scheduler's execution interval.

```txt
latest resolution History
+ 168 hours
-> eligible

hourly Supabase Cron
-> maintenance database function
-> lock and revalidate
-> Closed / Completed
-> Work Session cleanup
-> RESOLUTION_CLOSE / SYSTEM_AUTO
```

The selected rule preserves the full grace period without introducing persistent
per-Ticket scheduler state. Under uninterrupted hourly execution, eligibility is
normally detected within approximately one hour. Closure may take longer because
of execution time, lock contention, or missed or failed runs.

This is a lifecycle cleanup mechanism, not a full SLA or production job-processing
platform.

---

## Status

Accepted as a scheduling decision.

Implementation and verification status, including REMOTE evidence confirmed on
2026-09-28:

- Database maintenance function: `service_desk.close_expired_resolved_tickets()`
  is implemented, deployed to Supabase, and verified.
- Eligible Resolved Ticket closure: verified in REMOTE. Tickets beyond the
  168-hour grace period became `Closed` with close reason `Completed`.
- Work Session cleanup and `RESOLUTION_CLOSE` History: verified. Local function
  checks covered Work Session cleanup where supported; REMOTE History records
  confirm `RESOLUTION_CLOSE` with `SYSTEM_AUTO`, `actionNo = null`, and no Ticket
  Action row.
- Supabase Cron schedule: configured and verified. The registered job is
  `service-desk-close-expired-resolved-tickets`, with schedule `0 * * * *`.
- Scheduled hourly invocation: verified through five consecutive successful
  executions in `cron.job_run_details`:

  | Execution time (UTC) | Status |
  | --- | --- |
  | 2026-09-28 11:00 | `succeeded` |
  | 2026-09-28 12:00 | `succeeded` |
  | 2026-09-28 13:00 | `succeeded` |
  | 2026-09-28 14:00 | `succeeded` |
  | 2026-09-28 15:00 | `succeeded` |

  `return_message = '1 row'` means the SQL invocation returned one result row;
  it does not mean one Ticket was closed. Ticket closure and History were
  verified separately from the scheduler return message.
- The maintenance SQL function has been written and locally checked with PGlite
  using the backed-up DDL and triggers. Checks covered eligibility, re-resolution,
  repeated execution, History, Work Sessions, and rollback on failure.
- These checks establish the implemented lifecycle behavior and observed hourly
  execution. They do not establish hosted concurrency behavior, production-grade
  monitoring, or guaranteed always-on infrastructure. The Supabase Free Plan
  availability limitation and the other scope boundaries above remain unchanged.
