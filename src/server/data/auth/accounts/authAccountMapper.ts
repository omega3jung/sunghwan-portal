import { AuthAccountResponseDto } from "./authAccountDto";
import { DbAuthLoginUserRow } from "./authAccountRow";

export function toAuthAccountResponseDto(
  row: DbAuthLoginUserRow,
): AuthAccountResponseDto {
  return {
    authAccountId: row.aa_id,
    username: row.aa_username,
    role: row.aa_role,
    permission: row.aa_permission,
    userScope: row.aa_user_scope,
    active: row.aa_active,
    lastLoginAt: row.aa_last_login_at,
    employeeId: row.e_id,
    employeeName: row.e_name,
    employeeEmail: row.e_email,
    companyId: row.e_cid,
  };
}
