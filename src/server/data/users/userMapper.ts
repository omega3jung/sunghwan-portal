import { displayNameMapper } from "@/shared/utils/i18n/displayName";

import { UserPreferenceDto, UserProfileDto } from "./userDto";
import { UserPreferenceRow, UserProfileRow } from "./userRow";

export function toUserPreferenceDto(row: UserPreferenceRow): UserPreferenceDto {
  return {
    preferenceKey: row.ump_preference_key,
    preferenceMeta: row.ump_preference_meta,
  };
}

export function toUserProfileDto(row: UserProfileRow): UserProfileDto {
  return {
    id: row.aa_id,
    username: row.e_username,
    displayName: displayNameMapper(row.e_name),
    email: row.e_email,
    userScope: row.aa_user_scope,
    companyId: row.e_company_id,
    permission: row.aa_access_level,
    role: row.aa_role,
    canUseSuperUser: row.aa_role === "ADMIN",
    canUseImpersonation: row.aa_role === "ADMIN",
  };
}
