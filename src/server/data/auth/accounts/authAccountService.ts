import { comparePasswordHash } from "@/server/shared/security/password";

import { AuthUserDto } from "./authAccountDto";
import { toAuthUser } from "./authAccountMapper";
import {
  findImpersonationTarget,
  findLoginAuthUser,
  updateAuthAccountLastLoginAt,
} from "./authAccountRepository";

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

export async function getImpersonationTargetAuthUser(
  username: string,
): Promise<AuthUserDto | null> {
  const account = await findImpersonationTarget(username);

  if (!account) {
    return null;
  }

  return toAuthUser(account);
}
