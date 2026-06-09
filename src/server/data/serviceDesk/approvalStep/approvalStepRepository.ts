import { queryPortalApi } from "@/server/shared/supabase/portalApiClient";

import {
  ApprovalStepRow,
  CreateApprovalStepRowInput,
  UpdateApprovalStepRowInput,
} from "./approvalStepRow";

const ACTIVE_APPROVAL_STEP_COLUMNS = `
  aps_id,
  aps_category_id,
  aps_name,
  aps_description,
  aps_index,
  aps_assignee,
  aps_skip_access_level,
  aps_active
`;

const FIND_APPROVAL_STEP_ROWS_BY_TENANT_ID_QUERY = `
select
${ACTIVE_APPROVAL_STEP_COLUMNS}
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
${ACTIVE_APPROVAL_STEP_COLUMNS}
from service_desk.approval_step aps
join service_desk.category cat
  on cat.cat_id = aps.aps_category_id
where cat.cat_tenant_id = $1
  and aps.aps_id = $2
order by
  aps.aps_id;
`;

const CREATE_APPROVAL_STEP_ROW_QUERY = `
insert into service_desk.approval_step (
  aps_category_id,
  aps_name,
  aps_description,
  aps_index,
  aps_assignee,
  aps_skip_access_level
)
values (
  $1,
  $2::jsonb,
  $3::jsonb,
  $4,
  $5::jsonb,
  $6
)
returning
${ACTIVE_APPROVAL_STEP_COLUMNS};
`;

const UPDATE_APPROVAL_STEP_ROW_BY_ID_QUERY = `
update service_desk.approval_step aps
set
  aps_category_id = $3,
  aps_name = $4::jsonb,
  aps_description = $5::jsonb,
  aps_index = $6,
  aps_assignee = $7::jsonb,
  aps_skip_access_level = $8,
  aps_updated_at = now()
from service_desk.category cat
where
  cat.cat_id = aps.aps_category_id
  and cat.cat_tenant_id = $1
  and aps.aps_id = $2
  and aps.aps_active = true
returning
${ACTIVE_APPROVAL_STEP_COLUMNS};
`;

const DEACTIVATE_APPROVAL_STEP_ROW_BY_ID_QUERY = `
update service_desk.approval_step aps
set
  aps_active = false,
  aps_updated_at = now()
from service_desk.category cat
where
  cat.cat_id = aps.aps_category_id
  and cat.cat_tenant_id = $1
  and aps.aps_id = $2
  and aps.aps_active = true
returning
${ACTIVE_APPROVAL_STEP_COLUMNS};
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

export async function createApprovalStepRow(
  input: CreateApprovalStepRowInput,
): Promise<ApprovalStepRow | null> {
  const rows = await queryPortalApi<ApprovalStepRow>(
    CREATE_APPROVAL_STEP_ROW_QUERY,
    [
      input.aps_category_id,
      JSON.stringify(input.aps_name),
      JSON.stringify(input.aps_description),
      input.aps_index,
      JSON.stringify(input.aps_assignee),
      input.aps_skip_access_level,
    ],
  );

  return rows[0] ?? null;
}

export async function updateApprovalStepRowById(
  tenantId: string | number,
  approvalStepId: string | number,
  input: UpdateApprovalStepRowInput,
): Promise<ApprovalStepRow | null> {
  const rows = await queryPortalApi<ApprovalStepRow>(
    UPDATE_APPROVAL_STEP_ROW_BY_ID_QUERY,
    [
      Number(tenantId),
      Number(approvalStepId),
      input.aps_category_id,
      JSON.stringify(input.aps_name),
      JSON.stringify(input.aps_description),
      input.aps_index,
      JSON.stringify(input.aps_assignee),
      input.aps_skip_access_level,
    ],
  );

  return rows[0] ?? null;
}

export async function deactivateApprovalStepRowById(
  tenantId: string | number,
  approvalStepId: string | number,
): Promise<ApprovalStepRow | null> {
  const rows = await queryPortalApi<ApprovalStepRow>(
    DEACTIVATE_APPROVAL_STEP_ROW_BY_ID_QUERY,
    [Number(tenantId), Number(approvalStepId)],
  );

  return rows[0] ?? null;
}
