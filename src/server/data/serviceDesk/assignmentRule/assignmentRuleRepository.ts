import { queryPortalApi } from "@/server/shared/supabase/portalApiClient";

import {
  AssignmentRuleRow,
  CreateAssignmentRuleRowInput,
  UpdateAssignmentRuleRowInput,
} from "./assignmentRuleRow";

const ACTIVE_ASSIGNMENT_RULE_COLUMNS = `
  ar_id,
  ar_category_id,
  ar_assignee,
  ar_active
`;

const FIND_ASSIGNMENT_RULE_ROWS_BY_TENANT_ID_QUERY = `
select
${ACTIVE_ASSIGNMENT_RULE_COLUMNS}
from service_desk.assignment_rule ar
join service_desk.category cat
  on cat.cat_id = ar.ar_category_id
where cat.cat_tenant_id = $1
  and ar.ar_active = true
order by
  cat.cat_index,
  cat.cat_id,
  ar.ar_id;
`;

const FIND_ASSIGNMENT_RULE_ROWS_BY_TENANT_ID_AND_CATEGORY_ID_QUERY = `
select
${ACTIVE_ASSIGNMENT_RULE_COLUMNS}
from service_desk.assignment_rule ar
join service_desk.category cat
  on cat.cat_id = ar.ar_category_id
where cat.cat_tenant_id = $1
  and ar.ar_category_id = $2
  and ar.ar_active = true
order by
  ar.ar_id;
`;

const FIND_ASSIGNMENT_RULE_ROW_BY_TENANT_ID_AND_ASSIGNMENT_RULE_ID_QUERY = `
select
${ACTIVE_ASSIGNMENT_RULE_COLUMNS}
from service_desk.assignment_rule ar
join service_desk.category cat
  on cat.cat_id = ar.ar_category_id
where cat.cat_tenant_id = $1
  and ar.ar_id = $2
order by
  ar.ar_id;
`;

const CREATE_ASSIGNMENT_RULE_ROW_QUERY = `
insert into service_desk.assignment_rule (
  ar_category_id,
  ar_assignee
)
values (
  $1,
  $2::jsonb
)
returning
${ACTIVE_ASSIGNMENT_RULE_COLUMNS};
`;

const UPDATE_ASSIGNMENT_RULE_ROW_BY_ID_QUERY = `
update service_desk.assignment_rule ar
set
  ar_category_id = $3,
  ar_assignee = $4::jsonb,
  ar_updated_at = now()
from service_desk.category cat
where
  cat.cat_id = ar.ar_category_id
  and cat.cat_tenant_id = $1
  and ar.ar_id = $2
  and ar.ar_active = true
returning
${ACTIVE_ASSIGNMENT_RULE_COLUMNS};
`;

const DEACTIVATE_ASSIGNMENT_RULE_ROW_BY_ID_QUERY = `
update service_desk.assignment_rule ar
set
  ar_active = false,
  ar_updated_at = now()
from service_desk.category cat
where
  cat.cat_id = ar.ar_category_id
  and cat.cat_tenant_id = $1
  and ar.ar_id = $2
  and ar.ar_active = true
returning
${ACTIVE_ASSIGNMENT_RULE_COLUMNS};
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

export async function findAssignmentRuleRowByTenantIdAndAssignmentRuleId(
  tenantId: string | number,
  assignmentRuleId: string | number,
): Promise<AssignmentRuleRow | null> {
  const rows = await queryPortalApi<AssignmentRuleRow>(
    FIND_ASSIGNMENT_RULE_ROW_BY_TENANT_ID_AND_ASSIGNMENT_RULE_ID_QUERY,
    [Number(tenantId), Number(assignmentRuleId)],
  );

  return rows[0] ?? null;
}

export async function createAssignmentRuleRow(
  input: CreateAssignmentRuleRowInput,
): Promise<AssignmentRuleRow | null> {
  const rows = await queryPortalApi<AssignmentRuleRow>(
    CREATE_ASSIGNMENT_RULE_ROW_QUERY,
    [input.ar_category_id, JSON.stringify(input.ar_assignee)],
  );

  return rows[0] ?? null;
}

export async function updateAssignmentRuleRowById(
  tenantId: string | number,
  assignmentRuleId: string | number,
  input: UpdateAssignmentRuleRowInput,
): Promise<AssignmentRuleRow | null> {
  const rows = await queryPortalApi<AssignmentRuleRow>(
    UPDATE_ASSIGNMENT_RULE_ROW_BY_ID_QUERY,
    [
      Number(tenantId),
      Number(assignmentRuleId),
      input.ar_category_id,
      JSON.stringify(input.ar_assignee),
    ],
  );

  return rows[0] ?? null;
}

export async function deactivateAssignmentRuleRowById(
  tenantId: string | number,
  assignmentRuleId: string | number,
): Promise<AssignmentRuleRow | null> {
  const rows = await queryPortalApi<AssignmentRuleRow>(
    DEACTIVATE_ASSIGNMENT_RULE_ROW_BY_ID_QUERY,
    [Number(tenantId), Number(assignmentRuleId)],
  );

  return rows[0] ?? null;
}
