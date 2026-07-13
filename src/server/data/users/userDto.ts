import { AccessLevel, Role, UserScope } from "@/domain/auth";
import { LocalizedText } from "@/shared/types";

export interface UserPreferenceDto {
  preferenceKey: string;
  preferenceMeta: unknown;
}

export interface GetUserPreferenceByKeyParams {
  username: string;
  preferenceKey: string;
}

export interface SaveUserPreferenceByKeyInput {
  username: string;
  moduleKey: string;
  preferenceKey: string;
  preferenceMeta: unknown;
}

export interface UserProfileDto {
  id: string;
  username: string;
  displayName: LocalizedText;
  email: string | null;
  userScope: UserScope;
  companyId: number;
  permission: AccessLevel;
  role: Role;
  canUseSuperUser: boolean | null;
  canUseImpersonation: boolean | null;
}
