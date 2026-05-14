import { LocalizedName } from "@/domain/organization";

export type AuthAccountRole = "ADMIN" | "MANAGER" | "LEADER" | "USER" | "GUEST";

export type AuthAccountPermission =
  | "ADMIN"
  | "MANAGER"
  | "LEADER"
  | "USER"
  | "GUEST";

export type AuthAccountUserScope = "INTERNAL" | "EXTERNAL" | "SYSTEM";

export interface DbAuthLoginUserRow {
  aa_id: string;
  aa_username: string;
  aa_password_hash: string;
  aa_role: AuthAccountRole;
  aa_permission: AuthAccountPermission;
  aa_user_scope: AuthAccountUserScope;
  aa_active: boolean;
  aa_last_login_at: string | null;
  aa_created_at: string;
  aa_updated_at: string;

  e_id: number;
  e_name: LocalizedName;
  e_email: string;
  e_cid: number;
}
