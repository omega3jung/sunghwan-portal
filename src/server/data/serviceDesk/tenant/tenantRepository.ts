import { queryPortalApi } from "@/server/shared/supabase/portalApiClient";

import { TenantRow } from "./tenantRow";

const ACTIVE_TENANT_COLUMNS = `
  tn_id,
  tn_company_id,
  tn_name,
  tn_color,
  tn_active,
  tn_created_at,
  tn_updated_at
`;

const FIND_ACTIVE_TENANT_ROW_BY_ID_QUERY = `
select
${ACTIVE_TENANT_COLUMNS}
from service_desk.tenant
where tn_id = $1
  and tn_active = true;
`;

const FIND_ACTIVE_TENANT_ROWS_QUERY = `
select
${ACTIVE_TENANT_COLUMNS}
from service_desk.tenant
where tn_active = true
order by tn_id;
`;

export async function findActiveTenantRowById(
  tenantId: string | number,
): Promise<TenantRow | null> {
  const rows = await queryPortalApi<TenantRow>(FIND_ACTIVE_TENANT_ROW_BY_ID_QUERY, [
    Number(tenantId),
  ]);

  return rows[0] ?? null;
}

export async function findActiveTenantRows(): Promise<TenantRow[]> {
  return queryPortalApi<TenantRow>(FIND_ACTIVE_TENANT_ROWS_QUERY);
}
