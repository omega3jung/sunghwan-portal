import { compare } from "bcryptjs";

export async function comparePasswordHash(
  plainTextPassword: string,
  passwordHash: string,
): Promise<boolean> {
  if (!plainTextPassword || !passwordHash) {
    return false;
  }

  return compare(plainTextPassword, passwordHash);
}
