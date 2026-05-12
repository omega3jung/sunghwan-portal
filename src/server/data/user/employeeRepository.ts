import { createSupabaseAuthClient } from "@/server/shared/supabase/authAdminClient";

import { DbEmployeeRow } from "./employeeRow";

const EMPLOYEE_TABLE_NAME = "employee" as const;

const EMPLOYEE_SELECT_COLUMNS = [
  "employee_id",
  "employee_user_name",
  "employee_name",
  "employee_phone",
  "employee_email",
  "employee_image_url",
  "employee_department_id",
  "employee_job_field_id",
  "employee_company_id",
  "employee_start_date",
  "employee_end_date",
  "employee_shift_id",
  "employee_active",
  "employee_engineer_id",
  "employee_rf_tag_id",
  "employee_hour_rate",
].join(", ");

export async function findEmployeeById(
  employeeId: number,
): Promise<DbEmployeeRow | null> {
  const supabase = createSupabaseAuthClient();

  return queryEmployeeWithTableFallback({
    employeeId,
    supabase,
  });
}

export async function findActiveEmployeeById(
  employeeId: number,
): Promise<DbEmployeeRow | null> {
  const supabase = createSupabaseAuthClient();

  return queryEmployeeWithTableFallback({
    employeeId,
    onlyActive: true,
    supabase,
  });
}

export async function findActiveEmployeeByUserName(
  userName: string,
): Promise<DbEmployeeRow | null> {
  const supabase = createSupabaseAuthClient();

  return queryEmployeeWithTableFallback({
    userName,
    onlyActive: true,
    supabase,
  });
}

async function queryEmployeeWithTableFallback(options: {
  employeeId?: number;
  onlyActive?: boolean;
  supabase: ReturnType<typeof createSupabaseAuthClient>;
  userName?: string;
}): Promise<DbEmployeeRow | null> {
  const { employeeId, onlyActive, supabase, userName } = options;
  let lastMissingTableError: Error | null = null;

  let query = supabase
    .from(EMPLOYEE_TABLE_NAME)
    .select(EMPLOYEE_SELECT_COLUMNS);

  if (employeeId != null) {
    query = query.eq("employee_id", employeeId);
  }

  if (userName != null) {
    query = query.eq("employee_user_name", userName);
  }

  if (onlyActive) {
    query = query.eq("employee_active", true);
  }

  const { data, error } = await query.maybeSingle();

  if (!error) {
    return (data as DbEmployeeRow | null) ?? null;
  }

  lastMissingTableError = new Error(error.message);

  if (lastMissingTableError) {
    throw new Error(
      `Failed to fetch employee: ${lastMissingTableError.message}`,
    );
  }

  return null;
}
