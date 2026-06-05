import { queryPortalApi } from "@/server/shared/supabase/portalApiClient";

import { ApprovalStepRow } from "./approvalStepRow";

const FIND_APPROVAL_STEP_ROWS_BY_TENANT_ID_QUERY = `
select
  aps.aps_id,
  aps.aps_category_id,
  aps.aps_name,
  aps.aps_description,
  aps.aps_index,
  aps.aps_assignee,
  aps.aps_skip_access_level,
  aps.aps_active,
  aps.aps_created_at,
  aps.aps_updated_at
from service_desk.approval_step aps
join service_desk.category cat
  on cat.cat_id = aps.aps_category_id
where cat.cat_tenant_id = $1
order by
  cat.cat_index,
  cat.cat_id,
  aps.aps_index,
  aps.aps_id;
`;

const FIND_APPROVAL_STEP_ROWS_BY_TENANT_ID_AND_APPROVAL_STEP_ID_QUERY = `
select
  aps.aps_id,
  aps.aps_category_id,
  aps.aps_name,
  aps.aps_description,
  aps.aps_index,
  aps.aps_assignee,
  aps.aps_skip_access_level,
  aps.aps_active,
  aps.aps_created_at,
  aps.aps_updated_at
from service_desk.approval_step aps
join service_desk.category cat
  on cat.cat_id = aps.aps_category_id
where cat.cat_tenant_id = $1
  and aps.aps_id = $2
order by
  aps.aps_id;
`;

export async function findApprovalStepRowsByTenantId(
  tenantId: string | number,
): Promise<ApprovalStepRow[]> {
  return queryPortalApi<ApprovalStepRow>(
    FIND_APPROVAL_STEP_ROWS_BY_TENANT_ID_QUERY,
    [Number(tenantId)],
  );
}

export async function findApprovalStepRowsByTenantIdAndApprovalStepId(
  tenantId: string | number,
  approvalStepId: string | number,
): Promise<ApprovalStepRow[]> {
  return queryPortalApi<ApprovalStepRow>(
    FIND_APPROVAL_STEP_ROWS_BY_TENANT_ID_AND_APPROVAL_STEP_ID_QUERY,
    [Number(tenantId), Number(approvalStepId)],
  );
}
