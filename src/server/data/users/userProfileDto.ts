import { AccessLevel, Role, UserScope } from "@/domain/auth";
import { LocalizedText } from "@/shared/types";

export interface UserProfileDto {
  id: string;
  username: string;
  displayName: LocalizedText;
  email: string | null;
  userScope: UserScope;
  companyId: string;
  permission: AccessLevel;
  role: Role | null;
  canUseSuperUser: boolean | null;
  canUseImpersonation: boolean | null;
}

export interface UserProfileAuthContext {
  userScope: UserScope;
  companyId: string;
  permission: AccessLevel;
  role: Role | null;
}
