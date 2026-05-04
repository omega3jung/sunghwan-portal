import { AuthUser } from "@/domain/auth";

import { loginApi } from "./credentials";

// next-auth signIn will call this.
export const authorize = async (credentials?: {
  username: string;
  password: string;
}): Promise<AuthUser | null> => {
  if (!credentials) return null;

  try {
    const user = await loginApi(credentials);
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      employeeId: user.employeeId,
      username: user.username,
      displayName: user.displayName,
      email: user.email,
      accessToken: user.accessToken,
      dataScope: user.dataScope,
      userScope: user.userScope,
      companyId: user.companyId,
      permission: user.permission,
      role: user.role,
    };
  } catch (error) {
    // ❗ CredentialsProvider does not allow throwing errors.
    return null;
  }
};
