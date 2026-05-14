import { comparePasswordHash } from "@/server/shared/security/password";

import { AuthAccountResponseDto } from "./authAccountDto";
import { toAuthAccountResponseDto } from "./authAccountMapper";
import { findActiveAuthLoginUserByUsername } from "./authAccountRepository";

export async function verifyLoginCredentials(
  username: string,
  password: string,
): Promise<AuthAccountResponseDto | null> {
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

  return toAuthAccountResponseDto(account);
}
