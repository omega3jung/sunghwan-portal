import { queryPortalApi } from "@/server/shared/supabase/portalApiClient";

import { JobFieldRow } from "./jobFieldRow";

const FIND_ACTIVE_JOB_FIELD_ROWS_QUERY = `
select
  jf.jf_id,
  jf.jf_name,
  jf.jf_description,
  jf.jf_department_id,
  d.d_company_id as jf_company_id,
  jf.jf_parent_id,
  jf.jf_active
from job_field jf
join department d on d.d_id = jf.jf_department_id
where jf.jf_parent_id is not null
  and jf.jf_active = true
order by jf.jf_id;
`;

const FIND_ACTIVE_JOB_FIELD_ROWS_BY_COMPANY_ID_QUERY = `
select
  jf.jf_id,
  jf.jf_name,
  jf.jf_description,
  jf.jf_department_id,
  d.d_company_id as jf_company_id,
  jf.jf_parent_id,
  jf.jf_active
from job_field jf
join department d on d.d_id = jf.jf_department_id
where jf.jf_parent_id is not null
  and jf.jf_active = true
  and d.d_company_id = $1
order by jf.jf_id;
`;

export async function findActiveJobFieldRows(): Promise<JobFieldRow[]> {
  return queryPortalApi<JobFieldRow>(FIND_ACTIVE_JOB_FIELD_ROWS_QUERY);
}

export async function findActiveJobFieldRowsByCompanyId(
  companyId: number,
): Promise<JobFieldRow[]> {
  return queryPortalApi<JobFieldRow>(
    FIND_ACTIVE_JOB_FIELD_ROWS_BY_COMPANY_ID_QUERY,
    [companyId],
  );
}
