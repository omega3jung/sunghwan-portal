import { displayNameMapper } from "@/shared/utils/i18n/displayName";

import { AuthUserDto } from "./authAccountDto";
import { DbAuthLoginUserRow } from "./authAccountRow";

export function toAuthUser(row: DbAuthLoginUserRow): AuthUserDto {
  return {
    id: row.aa_id,
    username: row.e_username,
    role: row.aa_role,
    permission: row.aa_access_level,
    userScope: row.aa_user_scope,
    displayName: displayNameMapper(row.e_name),
    email: row.e_email,
    companyId: row.e_company_id,
    dataScope: "REMOTE",
    accessToken: buildSessionAccessToken(row.aa_id),
  };
}

function buildSessionAccessToken(authAccountId: string) {
  return `auth-${authAccountId}`;
}
