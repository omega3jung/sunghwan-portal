import { UserProfileAuthContext, UserProfileDto } from "./userProfileDto";
import { UserProfileRow } from "./userProfileRow";

export function toUserProfileDto(
  row: UserProfileRow,
  authContext: UserProfileAuthContext,
): UserProfileDto {
  return {
    id: String(row.id),
    username: row.username,
    displayName: row.display_name,
    email: row.email,
    userScope: authContext.userScope,
    companyId: authContext.companyId,
    permission: authContext.permission,
    role: authContext.role,
    canUseSuperUser: authContext.role === "ADMIN",
    canUseImpersonation: authContext.role === "ADMIN",
  };
}
