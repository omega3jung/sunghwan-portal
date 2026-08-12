import { ApiError } from "@/lib/application/api";
import {
  type PortalApiQueryExecutor,
  queryPortalApi,
} from "@/server/shared/supabase/portalApiClient";

type ApprovalReferenceInput = {
  categoryId: number;
  assignee: unknown;
};

type AssignmentReferenceInput = {
  categoryId: number;
  assignee: unknown;
};

type ValidationResultRow = {
  error_code: "CATEGORY_NOT_FOUND" | "INVALID_ORGANIZATION_REFERENCE" | null;
};

type CategoryActivationReadinessRow = {
  category_id: number;
  has_effective_valid_worker: boolean;
};

const FIND_CATEGORY_ACTIVATION_READINESS_QUERY = `
with submitted as (
  select value::bigint as category_id
  from jsonb_array_elements_text($2::jsonb)
), category_context as (
  select
    target.cat_id as category_id,
    main.cat_scope as category_scope,
    tenant.tn_company_id,
    owner_company.c_id as owner_company_id,
    case
      when own_rule.ar_id is not null then own_rule.ar_assignee
      else parent_rule.ar_assignee
    end as effective_assignee
  from submitted
  join service_desk.category target
    on target.cat_id = submitted.category_id
   and target.cat_tenant_id = $1
  left join service_desk.category parent
    on parent.cat_id = target.cat_parent_id
   and parent.cat_tenant_id = target.cat_tenant_id
  left join service_desk.assignment_rule own_rule
    on own_rule.ar_category_id = target.cat_id
  left join service_desk.assignment_rule parent_rule
    on parent_rule.ar_category_id = parent.cat_id
  join service_desk.category main
    on main.cat_id = coalesce(target.cat_parent_id, target.cat_id)
   and main.cat_tenant_id = target.cat_tenant_id
  join service_desk.tenant tenant
    on tenant.tn_id = target.cat_tenant_id
   and tenant.tn_active = true
  join public.company tenant_company
    on tenant_company.c_id = tenant.tn_company_id
   and tenant_company.c_active = true
  join public.company owner_company
    on owner_company.c_portal_owner = true
   and owner_company.c_active = true
)
select
  submitted.category_id,
  coalesce(
    exists (
      select 1
      from category_context context
      join public.job_field job_field
        on job_field.jf_active = true
       and job_field.jf_id in (
         select value::bigint
         from jsonb_array_elements_text(
           coalesce(context.effective_assignee -> 'job_field_id', '[]'::jsonb)
         ) field(value)
       )
       and (
         (context.category_scope = 'INTERNAL'
           and job_field.jf_company_id = context.tn_company_id)
         or (context.category_scope = 'PORTAL'
           and job_field.jf_company_id = context.owner_company_id)
         or (context.category_scope = 'PORTAL'
           and coalesce((context.effective_assignee ->> 'include_tenant_company')::boolean, false)
           and job_field.jf_company_id = context.tn_company_id)
       )
      where context.category_id = submitted.category_id
    )
    or exists (
      select 1
      from category_context context
      join public.vw_employee employee
        on employee.e_active = true
       and employee.e_username in (
         select value
         from jsonb_array_elements_text(
           coalesce(
             context.effective_assignee -> 'employee_username',
             '[]'::jsonb
           )
         ) username(value)
       )
       and (
         (context.category_scope = 'INTERNAL'
           and employee.e_company_id = context.tn_company_id)
         or (context.category_scope = 'PORTAL'
           and employee.e_company_id = context.owner_company_id)
         or (context.category_scope = 'PORTAL'
           and coalesce((context.effective_assignee ->> 'include_tenant_company')::boolean, false)
           and employee.e_company_id = context.tn_company_id)
       )
      where context.category_id = submitted.category_id
    ),
    false
  ) as has_effective_valid_worker
from submitted;
`;

const VALIDATE_APPROVAL_REFERENCES_QUERY = `
with submitted as (
  select "categoryId" as category_id, assignee
  from jsonb_to_recordset($2::jsonb) as item("categoryId" bigint, assignee jsonb)
), category_context as (
  select
    submitted.category_id,
    submitted.assignee,
    tn.tn_company_id,
    main.cat_scope as category_scope,
    owner_company.c_id as owner_company_id
  from submitted
  join service_desk.category cat
    on cat.cat_id = submitted.category_id
   and cat.cat_parent_id is null
   and cat.cat_active = true
   and cat.cat_tenant_id = $1
  join service_desk.tenant tn
    on tn.tn_id = cat.cat_tenant_id
   and tn.tn_active = true
  join public.company tenant_company
    on tenant_company.c_id = tn.tn_company_id
   and tenant_company.c_active = true
  join public.company owner_company
    on owner_company.c_portal_owner = true
   and owner_company.c_active = true
), invalid_category as (
  select 1
  from submitted
  left join category_context using (category_id)
  where category_context.category_id is null
  limit 1
), invalid_reference as (
  select 1
  from category_context context
  where case context.assignee->>'type'
    when 'EMPLOYEE' then
      jsonb_array_length(context.assignee->'employee_username') = 0
      or exists (
        select 1
        from jsonb_array_elements_text(context.assignee->'employee_username') username(value)
        where not exists (
          select 1
          from public.vw_employee employee
          where employee.e_username = username.value
            and employee.e_company_id = context.tn_company_id
            and employee.e_active = true
        )
      )
    when 'DEPARTMENT' then not exists (
      select 1
      from public.department department
      join public.vw_employee employee
        on employee.e_department_id = department.d_id
       and employee.e_company_id = context.tn_company_id
       and employee.e_active = true
      where department.d_id = (context.assignee->>'department_id')::bigint
        and department.d_company_id = context.tn_company_id
        and department.d_active = true
    )
    when 'JOB_FIELD' then not exists (
      select 1
      from public.job_field job_field
      join public.department department
        on department.d_id = job_field.jf_department_id
       and department.d_company_id = context.tn_company_id
       and department.d_active = true
      join public.vw_employee employee
        on employee.e_job_field_id = job_field.jf_id
       and employee.e_company_id = context.tn_company_id
       and employee.e_active = true
      where job_field.jf_id = (context.assignee->>'field_id')::bigint
        and job_field.jf_active = true
    )
    when 'MANAGER' then not exists (
      select 1
      from public.vw_employee employee
      join public.vw_auth_login_user profile
        on profile.e_username = employee.e_username
      where employee.e_company_id = context.tn_company_id
        and employee.e_active = true
        and profile.aa_access_level >= case context.assignee->>'level'
          when '1' then 7
          when '2' then 9
          else 10
        end
    )
    else true
  end
  limit 1
)
select case
  when exists (select 1 from invalid_category) then 'CATEGORY_NOT_FOUND'
  when exists (select 1 from invalid_reference) then 'INVALID_ORGANIZATION_REFERENCE'
  else null
end as error_code;
`;

const VALIDATE_ASSIGNMENT_REFERENCES_QUERY = `
with submitted as (
  select "categoryId" as category_id, assignee
  from jsonb_to_recordset($2::jsonb) as item("categoryId" bigint, assignee jsonb)
), category_context as (
  select
    submitted.category_id,
    submitted.assignee,
    tn.tn_company_id
  from submitted
  join service_desk.category target
    on target.cat_id = submitted.category_id
   and target.cat_tenant_id = $1
  join service_desk.category main
    on main.cat_id = coalesce(target.cat_parent_id, target.cat_id)
   and main.cat_tenant_id = target.cat_tenant_id
  join service_desk.tenant tn
    on tn.tn_id = target.cat_tenant_id
   and tn.tn_active = true
), invalid_category as (
  select 1
  from submitted
  left join category_context using (category_id)
  where category_context.category_id is null
  limit 1
), invalid_reference as (
  select 1
  from category_context context
  where
    (context.category_scope <> 'PORTAL'
      and coalesce((context.assignee->>'include_tenant_company')::boolean, false))
    or exists (
      select 1
      from jsonb_array_elements_text(context.assignee->'employee_username') username(value)
      where not exists (
        select 1
        from public.vw_employee employee
        where employee.e_active = true
          and employee.e_username = username.value
          and (
            (context.category_scope = 'INTERNAL'
              and employee.e_company_id = context.tn_company_id)
            or (context.category_scope = 'PORTAL'
              and employee.e_company_id = context.owner_company_id)
            or (context.category_scope = 'PORTAL'
              and coalesce((context.assignee->>'include_tenant_company')::boolean, false)
              and employee.e_company_id = context.tn_company_id)
          )
      )
    )
    or exists (
      select 1
      from jsonb_array_elements_text(context.assignee->'job_field_id') field(value)
      where not exists (
        select 1
        from public.job_field job_field
        join public.department department
          on department.d_id = job_field.jf_department_id
         and department.d_active = true
        where job_field.jf_id = field.value::bigint
          and job_field.jf_active = true
          and (
            (context.category_scope = 'INTERNAL'
              and job_field.jf_company_id = context.tn_company_id)
            or (context.category_scope = 'PORTAL'
              and job_field.jf_company_id = context.owner_company_id)
            or (context.category_scope = 'PORTAL'
              and coalesce((context.assignee->>'include_tenant_company')::boolean, false)
              and job_field.jf_company_id = context.tn_company_id)
          )
      )
    )
  limit 1
)
select case
  when exists (select 1 from invalid_category) then 'CATEGORY_NOT_FOUND'
  when exists (select 1 from invalid_reference) then 'INVALID_ORGANIZATION_REFERENCE'
  else null
end as error_code;
`;

/**
 * Validates approval references against the database state used by the write.
 *
 * Submitted IDs are not authority: the category must be an active main category
 * in the target tenant, and each assignee must resolve to an active organization
 * member allowed by that tenant. The caller supplies its transaction executor so
 * validation and mutation observe one consistent boundary.
 */
export async function assertApprovalReferencesValidForWrite(
  query: PortalApiQueryExecutor,
  tenantId: string | number,
  references: ApprovalReferenceInput[],
) {
  const rows = await query<ValidationResultRow>(
    VALIDATE_APPROVAL_REFERENCES_QUERY,
    [Number(tenantId), JSON.stringify(references)],
  );

  assertValidationResult(rows[0]?.error_code, "approvalSteps");
}

/**
 * Applies the same database-backed boundary to assignment-rule references.
 * Subcategories and inactive categories may be configured before activation,
 * but every employee/job-field reference must be active and belong to the
 * tenant. Expanding Job Fields to actual employees remains a routing-time rule.
 */
export async function assertAssignmentReferencesValidForWrite(
  query: PortalApiQueryExecutor,
  tenantId: string | number,
  references: AssignmentReferenceInput[],
) {
  const rows = await query<ValidationResultRow>(
    VALIDATE_ASSIGNMENT_REFERENCES_QUERY,
    [Number(tenantId), JSON.stringify(references)],
  );

  assertValidationResult(rows[0]?.error_code, "assignmentRules");
}

/**
 * Validates only the readiness gate for inactive -> active transitions.
 * Runtime ticket routing deliberately retains its stronger employee, company,
 * tenant, and category eligibility checks.
 */
export async function assertCategoriesReadyForActivation(
  tenantId: string | number,
  categoryIds: readonly (string | number)[],
  query?: PortalApiQueryExecutor,
) {
  if (categoryIds.length === 0) {
    return;
  }

  const execute = query ?? queryPortalApi;
  const rows = await execute<CategoryActivationReadinessRow>(
    FIND_CATEGORY_ACTIVATION_READINESS_QUERY,
    [Number(tenantId), JSON.stringify(categoryIds.map(String))],
  );
  const readinessByCategoryId = new Map(
    rows.map((row) => [
      String(row.category_id),
      row.has_effective_valid_worker,
    ]),
  );
  const invalidCategoryId = categoryIds.find(
    (categoryId) => readinessByCategoryId.get(String(categoryId)) !== true,
  );

  if (invalidCategoryId !== undefined) {
    throw new ApiError("serviceDesk.categories.activationNotReady", 400, {
      categoryId: invalidCategoryId,
    });
  }
}

function assertValidationResult(
  errorCode: ValidationResultRow["error_code"] | undefined,
  resource: "approvalSteps" | "assignmentRules",
) {
  if (!errorCode) {
    return;
  }

  if (errorCode === "CATEGORY_NOT_FOUND") {
    throw new ApiError(`serviceDesk.${resource}.categoryNotFound`, 400);
  }

  throw Object.assign(
    new Error(
      "An organization reference is inactive or outside the category policy.",
    ),
    { code: errorCode, status: 400 },
  );
}
