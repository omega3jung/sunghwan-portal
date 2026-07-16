import { ApiError } from "@/lib/application/api";
import type { PortalApiQueryExecutor } from "@/server/shared/supabase/portalApiClient";

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

const VALIDATE_APPROVAL_REFERENCES_QUERY = `
with submitted as (
  select "categoryId" as category_id, assignee
  from jsonb_to_recordset($2::jsonb) as item("categoryId" bigint, assignee jsonb)
), category_context as (
  select
    submitted.category_id,
    submitted.assignee,
    tn.tn_company_id
  from submitted
  join service_desk.category cat
    on cat.cat_id = submitted.category_id
   and cat.cat_parent_id is null
   and cat.cat_active = true
   and cat.cat_tenant_id = $1
  join service_desk.tenant tn
    on tn.tn_id = cat.cat_tenant_id
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
  where case context.assignee->>'type'
    when 'EMPLOYEE' then
      jsonb_array_length(context.assignee->'employee_username') = 0
      or exists (
        select 1
        from jsonb_array_elements_text(context.assignee->'employee_username') username(value)
        where not exists (
          select 1
          from public.employee employee
          where employee.e_username = username.value
            and employee.e_company_id = context.tn_company_id
            and employee.e_active = true
        )
      )
    when 'DEPARTMENT' then not exists (
      select 1
      from public.department department
      join public.employee employee
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
      join public.employee employee
        on employee.e_job_field_id = job_field.jf_id
       and employee.e_company_id = context.tn_company_id
       and employee.e_active = true
      where job_field.jf_id = (context.assignee->>'field_id')::bigint
        and job_field.jf_active = true
    )
    when 'MANAGER' then not exists (
      select 1
      from public.employee employee
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
   and target.cat_active = true
   and target.cat_tenant_id = $1
  join service_desk.category main
    on main.cat_id = coalesce(target.cat_parent_id, target.cat_id)
   and main.cat_tenant_id = target.cat_tenant_id
   and main.cat_active = true
  join service_desk.tenant tn
    on tn.tn_id = target.cat_tenant_id
   and tn.tn_active = true
), invalid_category as (
  select 1
  from submitted
  left join category_context using (category_id)
  where category_context.category_id is null
  limit 1
), resolved_employee as (
  select distinct context.category_id, employee.e_username
  from category_context context
  join public.employee employee
    on employee.e_company_id = context.tn_company_id
   and employee.e_active = true
  where employee.e_username in (
    select value
    from jsonb_array_elements_text(context.assignee->'employee_username') username(value)
  )
     or employee.e_job_field_id in (
       select value::bigint
       from jsonb_array_elements_text(context.assignee->'job_field_id') field(value)
     )
), invalid_reference as (
  select 1
  from category_context context
  where
    exists (
      select 1
      from jsonb_array_elements_text(context.assignee->'employee_username') username(value)
      where not exists (
        select 1
        from public.employee employee
        where employee.e_company_id = context.tn_company_id
          and employee.e_active = true
          and employee.e_username = username.value
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
         and department.d_company_id = context.tn_company_id
         and department.d_active = true
        join public.employee employee
          on job_field.jf_id = field.value::bigint
         and job_field.jf_active = true
         and employee.e_job_field_id = job_field.jf_id
         and employee.e_company_id = context.tn_company_id
         and employee.e_active = true
      )
    )
    or not exists (
      select 1
      from resolved_employee employee
      where employee.category_id = context.category_id
    )
  limit 1
)
select case
  when exists (select 1 from invalid_category) then 'CATEGORY_NOT_FOUND'
  when exists (select 1 from invalid_reference) then 'INVALID_ORGANIZATION_REFERENCE'
  else null
end as error_code;
`;

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
    new Error("An organization reference is inactive or outside the category policy."),
    { code: errorCode, status: 400 },
  );
}
