import { queryAuthApi } from "@/server/shared/supabase/authApiClient";

import { DbAuthLoginUserRow } from "./authAccountRow";

const FIND_ACTIVE_AUTH_ACCOUNT_BY_USERNAME_QUERY = `
  select
    aa_id,
    aa_username,
    aa_password_hash,
    aa_role,
    aa_permission,
    aa_user_scope,
    aa_last_login_at,

    e_id,
    e_name,
    e_email,
    e_cid
  from public.auth_login_user_view
  where aa_username = $1
    and aa_active = true
  limit 1
`;

export async function findActiveAuthLoginUserByUsername(
  username: string,
): Promise<DbAuthLoginUserRow | null> {
  try {
    const rows = await queryAuthApi<DbAuthLoginUserRow>(
      FIND_ACTIVE_AUTH_ACCOUNT_BY_USERNAME_QUERY,
      [username],
    );
    return rows[0] ?? null;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown database error";
    throw new Error(
      `Failed to fetch active auth account by username: ${message}`,
    );
  }
}
