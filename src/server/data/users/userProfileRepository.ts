import { queryPortalApi } from "@/server/shared/supabase/portalApiClient";

import { UserProfileRow } from "./userProfileRow";

const FIND_USER_PROFILE_BY_ID_QUERY = `
select aa_id,
       e_id,
       e_user_name,
       ename,
       e_email,
       e_cid
  from auth_account
  join employee
    on aa_eid = e_id
   and aa_id = $1;
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
