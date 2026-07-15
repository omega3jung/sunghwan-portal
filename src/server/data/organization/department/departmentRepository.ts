import { queryPortalApi } from "@/server/shared/supabase/portalApiClient";

import { DepartmentRow } from "./departmentRow";

const FIND_ACTIVE_DEPARTMENT_ROWS_QUERY = `
select
  d_id,
  d_name,
  d_code,
  d_description,
  d_company_id,
  d_parent_id,
  d_active
from department
where d_parent_id is not null
  and d_active = true
order by d_id;
`;

export async function findActiveDepartmentRows(): Promise<DepartmentRow[]> {
  return queryPortalApi<DepartmentRow>(FIND_ACTIVE_DEPARTMENT_ROWS_QUERY);
}
