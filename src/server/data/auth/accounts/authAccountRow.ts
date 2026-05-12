export type AuthAccountRole = "ADMIN" | "MANAGER" | "LEADER" | "USER" | "GUEST";

export type AuthAccountPermission =
  | "ADMIN"
  | "MANAGER"
  | "LEADER"
  | "USER"
  | "GUEST";

export type AuthAccountUserScope = "INTERNAL" | "EXTERNAL" | "SYSTEM";

export interface DbAuthAccountRow {
  auth_account_id: number;
  employee_id: number;
  account_username: string;
  password_hash: string;
  role: AuthAccountRole;
  permission: AuthAccountPermission;
  user_scope: AuthAccountUserScope;
  account_active: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}
