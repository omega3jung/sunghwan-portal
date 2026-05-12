import { queryPortalApi } from "@/server/shared/supabase/portalApiClient";

import { UserProfileRow } from "./userProfileRow";

const FIND_USER_PROFILE_BY_ID_QUERY = `
select auth_account_id as id,
       employee.employee_id,
       employee_user_name as username,
       employee_name as display_name,
       employee_email as email,
       employee_company_id as company_id
  from auth_account
  join employee
    on auth_account.employee_id = employee.employee_id
   and auth_account_id = $1;
`;

export async function findUserProfileById(
  userId: string,
): Promise<UserProfileRow | null> {
  const rows = await queryPortalApi<UserProfileRow>(
    FIND_USER_PROFILE_BY_ID_QUERY,
    [userId],
  );

  return rows[0] ?? null;
}
