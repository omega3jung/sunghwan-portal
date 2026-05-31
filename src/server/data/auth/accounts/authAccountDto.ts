import { LocalizedText } from "@/shared/types";

import {
  AuthAccountDataScope,
  AuthAccountPermission,
  AuthAccountRole,
  AuthAccountUserScope,
} from "./authAccountRow";

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
