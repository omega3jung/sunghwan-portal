import { queryAuthApi } from "@/server/shared/supabase/authApiClient";

import { DbAuthLoginUserRow } from "./authAccountRow";

const FIND_ACTIVE_AUTH_ACCOUNT_BY_USERNAME_QUERY = `
  select
    aa_id,
    aa_password_hash,
    aa_role,
    aa_access_level,
    aa_user_scope,
    aa_last_login_at,

    e_username,
    e_name,
    e_email,
    e_company_id
  from auth_login_user_view
  where aa_username = $1
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

const UPDATE_AUTH_ACCOUNT_LAST_LOGIN_AT_QUERY = `
  update public.auth_account
  set
    aa_last_login_at = now(),
    aa_updated_at = now()
  where aa_id = $1
    and aa_active = true
`;

export async function updateAuthAccountLastLoginAt(
  authAccountId: string,
): Promise<void> {
  try {
    await queryAuthApi(UPDATE_AUTH_ACCOUNT_LAST_LOGIN_AT_QUERY, [
      authAccountId,
    ]);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown database error";

    throw new Error(`Failed to update auth account last login at: ${message}`);
  }
}
