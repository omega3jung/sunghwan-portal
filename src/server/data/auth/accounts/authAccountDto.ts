import { AuthAccountRole, AuthAccountUserScope } from "./authAccountRow";

export interface AuthAccountResponseDto {
  authAccountId: number;
  employeeId: number;
  username: string;
  role: AuthAccountRole;
  permission: AuthAccountRole;
  userScope: AuthAccountUserScope;
  active: boolean;
  lastLoginAt: string | null;
}
