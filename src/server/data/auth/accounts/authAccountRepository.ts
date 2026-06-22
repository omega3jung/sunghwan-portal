import { queryAuthApi } from "@/server/shared/supabase/authApiClient";

import { DbAuthLoginUserRow, DbAuthUserProjectionRow } from "./authAccountRow";

const FIND_LOGIN_AUTH_USER_QUERY = `
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
  from vw_auth_login_user
  where aa_username = $1
  limit 1
`;

export async function findLoginAuthUser(
  loginUsername: string,
): Promise<DbAuthLoginUserRow | null> {
  try {
    const rows = await queryAuthApi<DbAuthLoginUserRow>(
      FIND_LOGIN_AUTH_USER_QUERY,
      [loginUsername],
    );

    return rows[0] ?? null;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown database error";

    throw new Error(`Failed to fetch login auth user: ${message}`);
  }
}

const FIND_IMPERSONATION_TARGET_QUERY = `
  select
    aa_id,
    aa_role,
    aa_access_level,
    aa_user_scope,
    aa_last_login_at,

    e_username,
    e_name,
    e_email,
    e_company_id
  from vw_auth_login_user
  where e_username = $1
  limit 1
`;

export async function findImpersonationTarget(
  employeeUsername: string,
): Promise<DbAuthUserProjectionRow | null> {
  try {
    const rows = await queryAuthApi<DbAuthUserProjectionRow>(
      FIND_IMPERSONATION_TARGET_QUERY,
      [employeeUsername],
    );

    return rows[0] ?? null;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown database error";

    throw new Error(`Failed to fetch impersonation target: ${message}`);
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
