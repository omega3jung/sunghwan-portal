import { createSupabaseAuthClient } from "@/server/shared/supabase/authAdminClient";

import { DbAuthAccountRow } from "./authAccountRow";

const AUTH_ACCOUNT_TABLE_NAME = "auth_account" as const;

const AUTH_ACCOUNT_SELECT_COLUMNS = [
  "auth_account_id",
  "employee_id",
  "account_username",
  "password_hash",
  "role",
  "permission",
  "user_scope",
  "account_active",
  "last_login_at",
  "created_at",
  "updated_at",
].join(", ");

export async function findActiveAuthAccountByUsername(
  username: string,
): Promise<DbAuthAccountRow | null> {
  const supabase = createSupabaseAuthClient();

  let lastMissingTableError: Error | null = null;

  const { data, error } = await supabase
    .from(AUTH_ACCOUNT_TABLE_NAME)
    .select(AUTH_ACCOUNT_SELECT_COLUMNS)
    .eq("account_username", username)
    .eq("account_active", true)
    .maybeSingle();

  if (!error) {
    return (data as DbAuthAccountRow | null) ?? null;
  }

  lastMissingTableError = new Error(error.message);

  if (lastMissingTableError) {
    throw new Error(
      `Failed to fetch active auth account by username: ${lastMissingTableError.message}`,
    );
  }

  return null;
}
