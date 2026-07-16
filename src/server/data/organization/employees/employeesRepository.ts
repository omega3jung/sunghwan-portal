import { queryPortalApi } from "@/server/shared/supabase/portalApiClient";

import { DbEmployeeRow } from "./employeesRow";

const FIND_ACTIVE_EMPLOYEE_BY_ID_QUERY = `
  select
    e_id,
    e_username,
    e_name,
    e_phone,
    e_email,
    e_image_url,
    e_department_id,
    e_job_field_id,
    e_company_id,
    e_start_date,
    e_end_date,
    e_work_shift_id,
    e_active,
    e_engineer_id,
    e_rf_tag_id,
    e_hour_rate
  from public.employee
  where e_active = $1
`;

const FIND_EMPLOYEES_BY_COMPANY_ID_QUERY = `
  select
    e_id,
    e_username,
    e_name,
    e_phone,
    e_email,
    e_image_url,
    e_department_id,
    e_job_field_id,
    e_company_id,
    e_start_date,
    e_end_date,
    e_work_shift_id,
    e_active,
    e_engineer_id,
    e_rf_tag_id,
    e_hour_rate
  from public.employee
  where e_active = $1
    and e_company_id = $2
`;

export async function findEmployees(active: boolean): Promise<DbEmployeeRow[]> {
  const rows = await queryPortalApi<DbEmployeeRow>(
    FIND_ACTIVE_EMPLOYEE_BY_ID_QUERY,
    [active],
  );
  return rows ?? [];
}

export async function findEmployeesByCompanyId(
  active: boolean,
  companyId: number,
): Promise<DbEmployeeRow[]> {
  return queryPortalApi<DbEmployeeRow>(FIND_EMPLOYEES_BY_COMPANY_ID_QUERY, [
    active,
    companyId,
  ]);
}
