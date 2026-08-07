import { AccessLevel, Role, UserScope } from "@/domain/auth";
import { LocalizedText } from "@/shared/types";

/** Defines the user preference dto exchanged across the server API boundary. */
export interface UserPreferenceDto {
  preferenceKey: string;
  preferenceMeta: unknown;
}

/** Defines the get user preference by key params exchanged across the server API boundary. */
export interface GetUserPreferenceByKeyParams {
  username: string;
  preferenceKey: string;
}

/** Defines the save user preference by key input exchanged across the server API boundary. */
export interface SaveUserPreferenceByKeyInput {
  username: string;
  moduleKey: string;
  preferenceKey: string;
  preferenceMeta: unknown;
}

/** Defines the user profile dto exchanged across the server API boundary. */
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
