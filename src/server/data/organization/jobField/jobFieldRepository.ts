import { queryPortalApi } from "@/server/shared/supabase/portalApiClient";

import { JobFieldRow } from "./jobFieldRow";

const FIND_ACTIVE_JOB_FIELD_ROWS_QUERY = `
select
  jf_id,
  jf_name,
  jf_description,
  jf_department_id,
  jf_company_id,
  jf_parent_id,
  jf_active
from job_field
where jf_parent_id is not null
  and jf_active = true
order by jf_id;
`;

export async function findActiveJobFieldRows(): Promise<JobFieldRow[]> {
  return queryPortalApi<JobFieldRow>(FIND_ACTIVE_JOB_FIELD_ROWS_QUERY);
}
