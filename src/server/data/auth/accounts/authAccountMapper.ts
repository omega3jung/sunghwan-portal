import { AuthAccountResponseDto } from "./authAccountDto";
import { DbAuthAccountRow } from "./authAccountRow";

export function toAuthAccountResponseDto(
  row: DbAuthAccountRow,
): AuthAccountResponseDto {
  return {
    authAccountId: row.auth_account_id,
    employeeId: row.employee_id,
    username: row.account_username,
    role: row.role,
    permission: row.permission,
    userScope: row.user_scope,
    active: row.account_active,
    lastLoginAt: row.last_login_at,
  };
}
