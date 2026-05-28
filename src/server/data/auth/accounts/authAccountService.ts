import { comparePasswordHash } from "@/server/shared/security/password";

import { AuthUserDto } from "./authAccountDto";
import { toAuthUser } from "./authAccountMapper";
import {
  findActiveAuthLoginUserByUsername,
  updateAuthAccountLastLoginAt,
} from "./authAccountRepository";

export async function verifyLoginCredentials(
  username: string,
  password: string,
): Promise<AuthUserDto | null> {
  const account = await findActiveAuthLoginUserByUsername(username);

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
  const account = await findActiveAuthLoginUserByUsername(username);

  if (!account) {
    return null;
  }

  return toAuthUser(account);
}
