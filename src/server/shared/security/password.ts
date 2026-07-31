import { compare } from "bcryptjs";

/** Compares a plaintext credential with its stored bcrypt hash on the server. */
export async function comparePasswordHash(
  plainTextPassword: string,
  passwordHash: string,
): Promise<boolean> {
  if (!plainTextPassword || !passwordHash) {
    return false;
  }

  return compare(plainTextPassword, passwordHash);
}
