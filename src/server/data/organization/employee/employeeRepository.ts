import { queryAuthApi } from "@/server/shared/supabase/authApiClient";

import { DbEmployeeRow } from "./employeeRow";

const EMPLOYEE_SELECT_COLUMNS = `
  e_id,
  e_user_name,
  e_name,
  e_phone,
  e_email,
  e_image_url,
  e_did,
  e_jfid,
  e_cid,
  e_start_date,
  e_end_date,
  e_wsid,
  e_active,
  e_engineer_id,
  e_rf_tag_id,
  e_hour_rate
`;

const FIND_EMPLOYEE_BY_ID_QUERY = `
  select
    ${EMPLOYEE_SELECT_COLUMNS}
  from public.employee
  where e_id = $1
  limit 1
`;

const FIND_ACTIVE_EMPLOYEE_BY_ID_QUERY = `
  select
    ${EMPLOYEE_SELECT_COLUMNS}
  from public.employee
  where e_id = $1
    and e_active = true
  limit 1
`;

const FIND_ACTIVE_EMPLOYEE_BY_USER_NAME_QUERY = `
  select
    ${EMPLOYEE_SELECT_COLUMNS}
  from public.employee
  where e_user_name = $1
    and e_active = true
  limit 1
`;

export async function findEmployeeById(
  employeeId: number,
): Promise<DbEmployeeRow | null> {
  return queryEmployeeWithTableFallback({
    query: FIND_EMPLOYEE_BY_ID_QUERY,
    params: [employeeId],
  });
}

export async function findActiveEmployeeById(
  employeeId: number,
): Promise<DbEmployeeRow | null> {
  return queryEmployeeWithTableFallback({
    query: FIND_ACTIVE_EMPLOYEE_BY_ID_QUERY,
    params: [employeeId],
  });
}

export async function findActiveEmployeeByUserName(
  userName: string,
): Promise<DbEmployeeRow | null> {
  return queryEmployeeWithTableFallback({
    query: FIND_ACTIVE_EMPLOYEE_BY_USER_NAME_QUERY,
    params: [userName],
  });
}

async function queryEmployeeWithTableFallback(options: {
  params: unknown[];
  query: string;
}): Promise<DbEmployeeRow | null> {
  const { params, query } = options;

  try {
    const rows = await queryAuthApi<DbEmployeeRow>(query, params);
    return rows[0] ?? null;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown database error";
    throw new Error(`Failed to fetch employee: ${message}`);
  }
}
