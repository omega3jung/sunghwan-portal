# app/api/\*\*/route.ts

## General

- use fetch only.
- do not use api.fetch in route handlers.
- prefer direct backend proxying with `fetch`.
- use shared helpers from `@/app/api/_helpers` for auth-aware backend proxying when possible.
- keep `@/app/api/_helpers` limited to cross-resource helpers such as auth, proxy, and route context types.

---

## Route Structure

- collection routes handle:
  - `GET` (list)
  - `POST` (create)

- item routes handle:
  - `GET` (detail)
  - `PUT` (update)
  - `DELETE` (delete)

### Examples

- `/api/service-desk/tickets`
- `/api/service-desk/tickets/[ticketId]`

---

## Route Param Naming

- use `[id]` by default when the resource context is clear.
- use semantic names such as `[userId]`, `[ticketId]` when:
  - the resource name is too general (e.g. user, ticket),
  - the route is nested,
  - or plain `id` reduces readability.

### Current Convention

- domain/config-like resources:
  - `[id]`
  - e.g. `departments/[id]`, `categories/[id]`, `approval-steps/[id]`

- user or workflow-facing resources:
  - `[userId]`, `[ticketId]`
  - e.g. `users/[userId]`, `tickets/[ticketId]`

---

## Types

- use shared route context types from `@/app/api/_helpers/types`.

### Examples

- `IdRouteContext`
- `UserIdRouteContext`
- `TicketIdRouteContext`

---

## Delete Policy

- `DELETE` represents a delete action at the API boundary.
- internal implementation may use soft delete (`active = false`).
- do not expose soft delete as `PUT` externally.

---

## Response Handling

- return `404` when resource is not found.
- use `204` for successful delete with no response body.
- always check `!res.ok` for backend errors.
- preserve backend status codes when proxying remote responses.
- handle `204` responses without returning a JSON body.

---

## Request Shaping

- `GET` and `HEAD` requests must not include a request body.
- pass list filters through query params.
- pass item identity through route params.
- use JSON request bodies for `POST`, `PUT`, and `PATCH`.
- avoid placeholder body types such as `Preference` for unrelated resources.
- use dedicated write input types for create/update paths instead of reusing full read models when the payload shape is narrower.
- keep read mapping in each resource `mapper.ts` and write shaping in each resource `write.ts`.

### Examples

```ts
if (!res.ok) {
  return NextResponse.json(
    { message: "Request failed" },
    { status: res.status },
  );
}
```

---

## Notes

- keep route handlers thin (BFF-style).
- do not include business logic in route handlers.
- delegate logic to feature/domain layer when needed.
- default remote JSON proxying to `proxyJson`.
- keep mock and remote responses on the same contract whenever practical:
  - list: `{ items, total }`
  - item: single resource or `404`
  - delete: `204` with no body
