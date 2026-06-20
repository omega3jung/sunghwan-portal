import { LocalizedName } from "@/domain/organization";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ACCESS_LEVEL = {
  ADMIN: 9,
  MANAGER: 7,
  LEADER: 5,
  USER: 3,
  GUEST: 1,
  NONE: 0, // no permission
  // 8, 6, 4, 2 reserved.
};

export type AuthAccountRole = keyof typeof ACCESS_LEVEL;
export type AuthAccountPermission = (typeof ACCESS_LEVEL)[AuthAccountRole];

export type AuthAccountDataScope = "LOCAL" | "REMOTE";
export type AuthAccountUserScope = "INTERNAL" | "CLIENT";

export interface DbAuthUserProjectionRow {
  aa_id: string;
  aa_role: AuthAccountRole;
  aa_access_level: AuthAccountPermission;
  aa_user_scope: AuthAccountUserScope;
  aa_last_login_at: string | null;

  e_username: string;
  e_name: LocalizedName;
  e_email: string;
  e_company_id: number;
}

export interface DbAuthLoginUserRow extends DbAuthUserProjectionRow {
  aa_password_hash: string;
}
