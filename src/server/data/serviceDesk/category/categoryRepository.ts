import {
  type PortalApiQueryExecutor,
  queryPortalApi,
} from "@/server/shared/supabase/portalApiClient";

import {
  CategoryContextRow,
  CategoryRow,
  CreateCategoryRowInput,
  UpdateCategoryRowInput,
} from "./categoryRow";

const ACTIVE_CATEGORY_COLUMNS = `
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
  cat_default_sla_days
`;

const FIND_CATEGORY_ROWS_BY_TENANT_ID_QUERY = `
select
${ACTIVE_CATEGORY_COLUMNS}
from service_desk.category
where cat_tenant_id = $1
order by
  cat_parent_id nulls first,
  cat_index,
  cat_id;
`;

const FIND_CATEGORY_ROWS_BY_TENANT_ID_AND_CATEGORY_ID_QUERY = `
select
${ACTIVE_CATEGORY_COLUMNS}
from service_desk.category
where cat_tenant_id = $1
  and (cat_id = $2 or cat_parent_id = $2)
order by
  cat_parent_id nulls first,
  cat_index,
  cat_id;
`;

const FIND_CATEGORY_ROWS_BY_COMPANY_ID_QUERY = `
select
  cat.cat_id,
  cat.cat_tenant_id,
  cat.cat_parent_id,
  cat.cat_scope,
  cat.cat_name,
  cat.cat_description,
  cat.cat_request_template,
  cat.cat_index,
  cat.cat_active,
  cat.cat_default_priority,
  cat.cat_default_risk_level,
  cat.cat_default_sla_days
from service_desk.category cat
join service_desk.tenant tn on tn.tn_id = cat.cat_tenant_id
where tn.tn_company_id = $1
order by
  cat.cat_parent_id nulls first,
  cat.cat_index,
  cat.cat_id;
`;

const FIND_CATEGORY_CONTEXT_ROW_BY_ID_QUERY = `
select
  target.cat_id as category_id,
  main.cat_id as main_category_id,
  main.cat_scope as category_scope,
  tn.tn_id as tenant_id,
  tn.tn_company_id as tenant_company_id,
  tn.tn_active as tenant_active
from service_desk.category target
join service_desk.category main
  on main.cat_id = coalesce(target.cat_parent_id, target.cat_id)
join service_desk.tenant tn
  on tn.tn_id = main.cat_tenant_id
where target.cat_id = $1
  and target.cat_tenant_id = main.cat_tenant_id
limit 1;
`;

const CREATE_CATEGORY_ROW_QUERY = `
insert into service_desk.category (
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
  cat_default_sla_days
)
values (
  $1,
  $2,
  $3,
  $4::jsonb,
  $5::jsonb,
  $6::jsonb,
  $7,
  $8,
  $9,
  $10,
  $11
)
returning
${ACTIVE_CATEGORY_COLUMNS};
`;

const UPDATE_CATEGORY_ROW_BY_ID_QUERY = `
update service_desk.category
set
  cat_parent_id = $3,
  cat_scope = $4,
  cat_name = $5::jsonb,
  cat_description = $6::jsonb,
  cat_request_template = $7::jsonb,
  cat_index = $8,
  cat_active = $9,
  cat_default_priority = $10,
  cat_default_risk_level = $11,
  cat_default_sla_days = $12,
  cat_updated_at = now()
where
  cat_tenant_id = $1
  and cat_id = $2
returning
${ACTIVE_CATEGORY_COLUMNS};
`;

export async function findCategoryRowsByTenantId(
  tenantId: string | number,
  query: PortalApiQueryExecutor = queryPortalApi,
): Promise<CategoryRow[]> {
  return query<CategoryRow>(FIND_CATEGORY_ROWS_BY_TENANT_ID_QUERY, [
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

export async function findCategoryRowsByCompanyId(
  companyId: string | number,
): Promise<CategoryRow[]> {
  return queryPortalApi<CategoryRow>(FIND_CATEGORY_ROWS_BY_COMPANY_ID_QUERY, [
    Number(companyId),
  ]);
}

export async function findCategoryContextRowById(
  categoryId: string | number,
): Promise<CategoryContextRow | null> {
  const rows = await queryPortalApi<CategoryContextRow>(
    FIND_CATEGORY_CONTEXT_ROW_BY_ID_QUERY,
    [Number(categoryId)],
  );

  return rows[0] ?? null;
}

export async function createCategoryRow(
  input: CreateCategoryRowInput,
): Promise<CategoryRow | null> {
  const rows = await queryPortalApi<CategoryRow>(CREATE_CATEGORY_ROW_QUERY, [
    input.cat_tenant_id,
    input.cat_parent_id,
    input.cat_scope,
    JSON.stringify(input.cat_name),
    JSON.stringify(input.cat_description),
    JSON.stringify(input.cat_request_template),
    input.cat_index,
    input.cat_active,
    input.cat_default_priority,
    input.cat_default_risk_level,
    input.cat_default_sla_days,
  ]);

  return rows[0] ?? null;
}

export async function updateCategoryRowById(
  tenantId: string | number,
  categoryId: string | number,
  input: UpdateCategoryRowInput,
): Promise<CategoryRow | null> {
  const rows = await queryPortalApi<CategoryRow>(
    UPDATE_CATEGORY_ROW_BY_ID_QUERY,
    [
      Number(tenantId),
      Number(categoryId),
      input.cat_parent_id,
      input.cat_scope,
      JSON.stringify(input.cat_name),
      JSON.stringify(input.cat_description),
      JSON.stringify(input.cat_request_template),
      input.cat_index,
      input.cat_active,
      input.cat_default_priority,
      input.cat_default_risk_level,
      input.cat_default_sla_days,
    ],
  );

  return rows[0] ?? null;
}
