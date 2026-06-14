import { queryPortalApi } from "@/server/shared/supabase/portalApiClient";

import { CompanyRow } from "./companyRow";

const FIND_ACTIVE_COMPANY_ROWS_QUERY = `
select
  c_id,
  c_name,
  c_code,
  c_portal_owner,
  c_active
from company
where c_active = true
order by c_portal_owner, c_name, c_code, c_id
`;

export async function findActiveCompanyRows(): Promise<CompanyRow[]> {
  return queryPortalApi<CompanyRow>(FIND_ACTIVE_COMPANY_ROWS_QUERY);
}
