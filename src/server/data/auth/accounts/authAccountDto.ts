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
