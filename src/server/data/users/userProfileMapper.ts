import { displayNameMapper } from "@/shared/utils/i18n/displayName";

import { UserProfileAuthContext, UserProfileDto } from "./userProfileDto";
import { UserProfileRow } from "./userProfileRow";

export function toUserProfileDto(
  row: UserProfileRow,
  authContext: UserProfileAuthContext,
): UserProfileDto {
  return {
    id: row.aa_id,
    username: row.e_user_name,
    displayName: displayNameMapper(row.ename),
    email: row.e_email,
    userScope: authContext.userScope,
    companyId: authContext.companyId,
    permission: authContext.permission,
    role: authContext.role,
    canUseSuperUser: authContext.role === "ADMIN",
    canUseImpersonation: authContext.role === "ADMIN",
  };
}
