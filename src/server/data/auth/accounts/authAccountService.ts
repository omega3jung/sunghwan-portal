import { comparePasswordHash } from "@/server/shared/security/password";

import { AuthAccountResponseDto } from "./authAccountDto";
import { toAuthAccountResponseDto } from "./authAccountMapper";
import { findActiveAuthAccountByUsername } from "./authAccountRepository";
import { AuthAccountRole, AuthAccountUserScope } from "./authAccountRow";

export interface VerifiedAuthAccount {
  authAccountId: number;
  employeeId: number;
  username: string;
  role: AuthAccountRole;
  permission: AuthAccountRole;
  userScope: AuthAccountUserScope;
}

export async function getActiveAuthAccountByUsername(
  username: string,
): Promise<AuthAccountResponseDto | null> {
  const account = await findActiveAuthAccountByUsername(username);

  if (!account) {
    return null;
  }

  return toAuthAccountResponseDto(account);
}

export async function verifyAuthAccountCredentials(
  username: string,
  password: string,
): Promise<VerifiedAuthAccount | null> {
  const account = await findActiveAuthAccountByUsername(username);

  if (!account) {
    return null;
  }

  const isPasswordMatched = await comparePasswordHash(
    password,
    account.password_hash,
  );

  if (!isPasswordMatched) {
    return null;
  }

  return {
    authAccountId: account.auth_account_id,
    employeeId: account.employee_id,
    username: account.account_username,
    role: account.role,
    permission: account.permission,
    userScope: account.user_scope,
  };
}
