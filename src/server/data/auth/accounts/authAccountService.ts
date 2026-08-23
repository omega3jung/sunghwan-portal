import { comparePasswordHash } from "@/server/shared/security/password";

import {
  AuthImpersonationEmployeeDto,
  AuthImpersonationTargetDto,
  AuthUserDto,
} from "./authAccountDto";
import {
  toAuthImpersonationEmployees,
  toAuthImpersonationTarget,
  toAuthUser,
} from "./authAccountMapper";
import {
  findEligibleImpersonationEmployeesByCompanyId,
  findImpersonationTarget,
  findLoginAuthUser,
  updateAuthAccountLastLoginAt,
} from "./authAccountRepository";

/** Verifies credentials and returns the authenticated user projection without exposing the password hash. */
export async function verifyLoginCredentials(
  username: string,
  password: string,
): Promise<AuthUserDto | null> {
  const account = await findLoginAuthUser(username);

  if (!account) {
    return null;
  }

  const isPasswordMatched = await comparePasswordHash(
    password,
    account.aa_password_hash,
  );

  if (!isPasswordMatched) {
    return null;
  }

  await updateAuthAccountLastLoginAt(account.aa_id);

  return toAuthUser(account);
}

/** Loads impersonation target auth user through the server data boundary. */
export async function getImpersonationTargetAuthUser(
  username: string,
): Promise<AuthImpersonationTargetDto | null> {
  const account = await findImpersonationTarget(username);

  if (!account) {
    return null;
  }

  return toAuthImpersonationTarget(account);
}

/** Loads active portal-login employees available to the impersonation UI. */
export async function getEligibleImpersonationEmployeesByCompanyId(
  companyId: number,
): Promise<AuthImpersonationEmployeeDto[]> {
  const employees =
    await findEligibleImpersonationEmployeesByCompanyId(companyId);

  return toAuthImpersonationEmployees(employees);
}
