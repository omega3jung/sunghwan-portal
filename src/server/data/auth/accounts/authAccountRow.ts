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

/** Defines the PostgreSQL auth account role used only within the repository boundary. */
export type AuthAccountRole = keyof typeof ACCESS_LEVEL;
/** Defines the PostgreSQL auth account permission used only within the repository boundary. */
export type AuthAccountPermission = (typeof ACCESS_LEVEL)[AuthAccountRole];

/** Defines the PostgreSQL auth account data scope used only within the repository boundary. */
export type AuthAccountDataScope = "LOCAL" | "REMOTE";
/** Defines the PostgreSQL auth account user scope used only within the repository boundary. */
export type AuthAccountUserScope = "INTERNAL" | "CLIENT";

/** Defines the PostgreSQL db auth user projection row used only within the repository boundary. */
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

/** Defines the PostgreSQL db auth login user row used only within the repository boundary. */
export interface DbAuthLoginUserRow extends DbAuthUserProjectionRow {
  aa_password_hash: string;
}
