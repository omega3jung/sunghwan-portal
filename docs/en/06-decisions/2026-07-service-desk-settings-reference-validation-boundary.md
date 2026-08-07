# Service Desk Settings Reference Validation Boundary (2026-07)

## Context

Approval Step and Assignment Rule editors use company-filtered organization
reference APIs. The selected authorized Tenant supplies the company ID.

The REMOTE write routes repeated that work for every submitted reference. A
single tree save could therefore reload the same active employee set many times
before issuing row-level insert and update statements.

## Decision

The boundaries are:

```txt id="service-desk-settings-reference-validation-boundary"
Reference read API
-> select a company-filtered repository query
-> return employees by e_company_id
-> return departments by d_company_id
-> return job fields through department.d_company_id

Write route
-> authenticate
-> resolve the effective principal
-> authorize settings management for the stored tenant/category scope
-> validate request shape

PostgreSQL write transaction
-> derive category, tenant, and company context
-> validate all submitted organization references with a set-based query
-> apply the Approval Step or Assignment Rule tree mutation
-> roll back the complete mutation when validation or persistence fails
```

The tree-save request continues to carry `tenantId` as the target and
`categoryId` as the resource identity. Organization list requests carry only
the selected Tenant's company ID; category, purpose, data-scope, and
include-tenant flags are not organization lookup parameters.

Approval Step validation accepts only active main categories in the target
tenant. Department, job-field, employee, and manager references must resolve to
the category tenant company.

Assignment Rule validation accepts active main or subcategories in the target
tenant. Every explicit reference must belong to that Tenant company and the
final group must resolve at least one active employee.

LOCAL keeps demo-safe validation against local state because it does not have a
PostgreSQL write boundary. LOCAL and REMOTE keep the same feature API contract
and reject invalid references, although their validation implementations differ.

## Consequences

- REMOTE tree saves no longer call eligible employee lookup per category or
  assignee.
- Organization validation is set-based rather than N+1.
- Validation and all row mutations use one database transaction, preventing a
  partially saved settings tree.
- Read APIs filter in repository SQL instead of loading a global list and
  filtering it in the application layer.
- Ticket routing still revalidates current eligibility because organization
  state can change after settings are saved.
