import { queryPortalApi } from "@/server/shared/supabase/portalApiClient";

import { CategoryRow } from "./categoryRow";

const CATEGORY_SELECT_COLUMNS = `
  cat_id,
  cat_tenant_id,
  cat_parent_id,
  cat_scope,
  cat_name,
  cat_description,
  cat_request_template,
  cat_index,
  cat_active,
  cat_default_priority,
  cat_default_risk_level,
  cat_default_sla_days,
  cat_created_at,
  cat_updated_at
`;

const FIND_CATEGORY_ROWS_BY_TENANT_ID_QUERY = `
select
${CATEGORY_SELECT_COLUMNS}
from service_desk.category
where cat_tenant_id = $1
order by
  coalesce(cat_parent_id, cat_id),
  cat_parent_id nulls first,
  cat_index,
  cat_id;
`;

const FIND_CATEGORY_ROWS_BY_TENANT_ID_AND_CATEGORY_ID_QUERY = `
select
${CATEGORY_SELECT_COLUMNS}
from service_desk.category
where cat_tenant_id = $1
  and (cat_id = $2 or cat_parent_id = $2)
order by
  cat_parent_id nulls first,
  cat_index,
  cat_id;
`;

export async function findCategoryRowsByTenantId(
  tenantId: string | number,
): Promise<CategoryRow[]> {
  return queryPortalApi<CategoryRow>(FIND_CATEGORY_ROWS_BY_TENANT_ID_QUERY, [
    Number(tenantId),
  ]);
}

export async function findCategoryRowsByTenantIdAndCategoryId(
  tenantId: string | number,
  categoryId: string | number,
): Promise<CategoryRow[]> {
  return queryPortalApi<CategoryRow>(
    FIND_CATEGORY_ROWS_BY_TENANT_ID_AND_CATEGORY_ID_QUERY,
    [Number(tenantId), Number(categoryId)],
  );
}
