import { queryPortalApi } from "@/server/shared/supabase/portalApiClient";

import { UserProfileRow } from "./userProfileRow";

const FIND_USER_PROFILE_BY_ID_QUERY = `
select aa_id,
       aa_username,
       e_username,
       e_name,
       e_email,
       e_company_id
  from vw_auth_login_user
 where e_username = $1;
`;

export async function findUserProfileByUsername(
  userId: string,
): Promise<UserProfileRow | null> {
  const rows = await queryPortalApi<UserProfileRow>(
    FIND_USER_PROFILE_BY_ID_QUERY,
    [userId],
  );
  return rows[0] ?? null;
}
