import { LocalizedName } from "@/domain/organization";
import { LocalizedText } from "@/shared/types";

import {
  AuthAccountDataScope,
  AuthAccountPermission,
  AuthAccountRole,
  AuthAccountUserScope,
} from "./authAccountRow";

/** Defines the auth user dto exchanged across the server API boundary. */
export interface AuthUserDto {
  id: string;
  username: string;
  displayName: LocalizedText;
  email: string;
  accessToken: string;

  dataScope: AuthAccountDataScope;
  userScope: AuthAccountUserScope;
  companyId: number;
  permission: AuthAccountPermission;
  role: AuthAccountRole;
}

/** Defines the minimal auth projection required to validate impersonation. */
export interface AuthImpersonationTargetDto {
  username: string;
  userScope: AuthAccountUserScope;
  permission: AuthAccountPermission;
}

/** Defines a portal-login employee exposed as an impersonation candidate. */
export interface AuthImpersonationEmployeeDto {
  username: string;
  name: LocalizedName;
  email: string;
  imageUrl: string | null;
}
