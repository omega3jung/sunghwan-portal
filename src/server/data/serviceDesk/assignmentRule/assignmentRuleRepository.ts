import { queryPortalApi } from "@/server/shared/supabase/portalApiClient";

import { AssignmentRuleRow } from "./assignmentRuleRow";

const FIND_ASSIGNMENT_RULE_ROWS_BY_TENANT_ID_QUERY = `
select
  ar.ar_id,
  ar.ar_category_id,
  ar.ar_assignee,
  ar.ar_active,
  ar.ar_created_at,
  ar.ar_updated_at
from service_desk.assignment_rule ar
join service_desk.category cat
  on cat.cat_id = ar.ar_category_id
where cat.cat_tenant_id = $1
order by
  cat.cat_index,
  cat.cat_id,
  ar.ar_id;
`;

const FIND_ASSIGNMENT_RULE_ROWS_BY_TENANT_ID_AND_CATEGORY_ID_QUERY = `
select
  ar.ar_id,
  ar.ar_category_id,
  ar.ar_assignee,
  ar.ar_active,
  ar.ar_created_at,
  ar.ar_updated_at
from service_desk.assignment_rule ar
join service_desk.category cat
  on cat.cat_id = ar.ar_category_id
where cat.cat_tenant_id = $1
  and ar.ar_category_id = $2
order by
  ar.ar_id;
`;

export async function findAssignmentRuleRowsByTenantId(
  tenantId: string | number,
): Promise<AssignmentRuleRow[]> {
  return queryPortalApi<AssignmentRuleRow>(
    FIND_ASSIGNMENT_RULE_ROWS_BY_TENANT_ID_QUERY,
    [Number(tenantId)],
  );
}

export async function findAssignmentRuleRowsByTenantIdAndCategoryId(
  tenantId: string | number,
  categoryId: string | number,
): Promise<AssignmentRuleRow[]> {
  return queryPortalApi<AssignmentRuleRow>(
    FIND_ASSIGNMENT_RULE_ROWS_BY_TENANT_ID_AND_CATEGORY_ID_QUERY,
    [Number(tenantId), Number(categoryId)],
  );
}
