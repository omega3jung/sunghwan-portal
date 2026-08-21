import { displayNameMapper } from "@/lib/application/organization";

import {
  AuthImpersonationEmployeeDto,
  AuthImpersonationTargetDto,
  AuthUserDto,
} from "./authAccountDto";
import {
  DbAuthImpersonationEmployeeRow,
  DbAuthImpersonationTargetRow,
  DbAuthUserProjectionRow,
} from "./authAccountRow";

/** Maps auth user across the database and API boundary. */
export function toAuthUser(row: DbAuthUserProjectionRow): AuthUserDto {
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

/** Maps only the claims required to authorize an impersonation target. */
export function toAuthImpersonationTarget(
  row: DbAuthImpersonationTargetRow,
): AuthImpersonationTargetDto {
  return {
    username: row.e_username,
    permission: row.aa_access_level,
    userScope: row.aa_user_scope,
  };
}

/** Maps portal-login employees to the impersonation candidate response. */
export function toAuthImpersonationEmployees(
  rows: DbAuthImpersonationEmployeeRow[],
): AuthImpersonationEmployeeDto[] {
  return rows.map((row) => ({
    username: row.e_username,
    name: row.e_name,
    email: row.e_email,
    imageUrl: row.e_image_url,
  }));
}

function buildSessionAccessToken(authAccountId: string) {
  return `auth-${authAccountId}`;
}
