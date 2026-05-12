import { AccessLevel, Role, UserScope } from "@/domain/auth";
import { LocalizedName } from "@/domain/organization";

export interface UserProfileDto {
  id: string;
  username: string;
  displayName: LocalizedName;
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
