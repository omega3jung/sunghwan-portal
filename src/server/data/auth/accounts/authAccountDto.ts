import { LocalizedName } from "@/domain/organization";

import { AuthAccountRole, AuthAccountUserScope } from "./authAccountRow";

export interface AuthAccountResponseDto {
  authAccountId: string;
  username: string;
  role: AuthAccountRole;
  permission: AuthAccountRole;
  userScope: AuthAccountUserScope;
  active: boolean;
  lastLoginAt: string | null;
  employeeId: number;
  employeeName: LocalizedName;
  employeeEmail: string;
  companyId: number;
}
