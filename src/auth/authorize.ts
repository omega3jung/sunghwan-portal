import { AuthUser } from "@/types";

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
      name: user.name,
      email: user.email,
      accessToken: user.accessToken,
      dataScope: user.dataScope,
      userScope: user.userScope,
      tenantId: user.tenantId,
      permission: user.permission,
      role: user.role,
    };
  } catch (error) {
    // ❗ CredentialsProvider does not allow throwing errors.
    return null;
  }
};
