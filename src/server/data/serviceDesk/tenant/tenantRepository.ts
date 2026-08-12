import {
  type PortalApiQueryExecutor,
  queryPortalApi,
} from "@/server/shared/supabase/portalApiClient";

import {
  CreateTenantRowInput,
  TenantRow,
  UpdateTenantRowInput,
} from "./tenantRow";

const TENANT_COLUMNS = `
  tn_id,
  tn_company_id,
  tn_name,
  tn_color,
  tn_active
`;

const FIND_TENANT_ROW_BY_ID_QUERY = `
select
${TENANT_COLUMNS}
from service_desk.tenant
where tn_id = $1;
`;

const FIND_TENANT_ROWS_QUERY = `
select
${TENANT_COLUMNS}
from service_desk.tenant
order by tn_id;
`;

const FIND_ACTIVE_TENANT_ROW_BY_ID_QUERY = `
select
${TENANT_COLUMNS}
from service_desk.tenant
where tn_id = $1
  and tn_active = true;
`;

const FIND_ACTIVE_TENANT_ROW_BY_COMPANY_ID_QUERY = `
select
${TENANT_COLUMNS}
from service_desk.tenant
where tn_company_id = $1
  and tn_active = true
order by tn_id
limit 1;
`;

const FIND_ACTIVE_TENANT_ROWS_QUERY = `
select
${TENANT_COLUMNS}
from service_desk.tenant
where tn_active = true
order by tn_id;
`;

const CREATE_TENANT_ROW_QUERY = `
insert into service_desk.tenant (
  tn_company_id,
  tn_name,
  tn_color,
  tn_active
)
values (
  $1,
  $2::jsonb,
  $3,
  $4
)
returning
${TENANT_COLUMNS};
`;

const UPDATE_TENANT_ROW_BY_ID_QUERY = `
update service_desk.tenant
set
  tn_name = $2::jsonb,
  tn_color = $3,
  tn_active = $4,
  tn_updated_at = now()
where
  tn_id = $1
returning
${TENANT_COLUMNS};
`;

const DEACTIVATE_TENANT_ROW_BY_ID_QUERY = `
update service_desk.tenant
set
  tn_active = false,
  tn_updated_at = now()
where
  tn_id = $1
  and tn_active = true
returning
${TENANT_COLUMNS};
`;

/** Queries PostgreSQL for tenant row by id without applying presentation concerns. */
export async function findTenantRowById(
  tenantId: string | number,
): Promise<TenantRow | null> {
  const rows = await queryPortalApi<TenantRow>(FIND_TENANT_ROW_BY_ID_QUERY, [
    Number(tenantId),
  ]);

  return rows[0] ?? null;
}

/** Queries PostgreSQL for tenant rows without applying presentation concerns. */
export async function findTenantRows(): Promise<TenantRow[]> {
  return queryPortalApi<TenantRow>(FIND_TENANT_ROWS_QUERY);
}

/** Queries PostgreSQL for active tenant row by id without applying presentation concerns. */
export async function findActiveTenantRowById(
  tenantId: string | number,
  query: PortalApiQueryExecutor = queryPortalApi,
): Promise<TenantRow | null> {
  const rows = await query<TenantRow>(FIND_ACTIVE_TENANT_ROW_BY_ID_QUERY, [
    Number(tenantId),
  ]);

  return rows[0] ?? null;
}

/** Queries PostgreSQL for active tenant row by company id without applying presentation concerns. */
export async function findActiveTenantRowByCompanyId(
  companyId: string | number,
): Promise<TenantRow | null> {
  const rows = await queryPortalApi<TenantRow>(
    FIND_ACTIVE_TENANT_ROW_BY_COMPANY_ID_QUERY,
    [Number(companyId)],
  );

  return rows[0] ?? null;
}

/** Queries PostgreSQL for active tenant rows without applying presentation concerns. */
export async function findActiveTenantRows(): Promise<TenantRow[]> {
  return queryPortalApi<TenantRow>(FIND_ACTIVE_TENANT_ROWS_QUERY);
}

/** Creates tenant row through the server persistence boundary. */
export async function createTenantRow(
  input: CreateTenantRowInput,
): Promise<TenantRow | null> {
  const rows = await queryPortalApi<TenantRow>(CREATE_TENANT_ROW_QUERY, [
    input.tn_company_id,
    JSON.stringify(input.tn_name),
    input.tn_color,
    input.tn_active,
  ]);

  return rows[0] ?? null;
}

/** Updates tenant row by id while preserving server-side validation and persistence rules. */
export async function updateTenantRowById(
  tenantId: string | number,
  input: UpdateTenantRowInput,
): Promise<TenantRow | null> {
  const rows = await queryPortalApi<TenantRow>(UPDATE_TENANT_ROW_BY_ID_QUERY, [
    Number(tenantId),
    JSON.stringify(input.tn_name),
    input.tn_color,
    input.tn_active,
  ]);

  return rows[0] ?? null;
}

/** Removes or deactivates tenant row by id through the server persistence boundary. */
export async function deactivateTenantRowById(
  tenantId: string | number,
): Promise<TenantRow | null> {
  const rows = await queryPortalApi<TenantRow>(
    DEACTIVATE_TENANT_ROW_BY_ID_QUERY,
    [Number(tenantId)],
  );

  return rows[0] ?? null;
}
