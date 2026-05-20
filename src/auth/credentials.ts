import axios from "axios";

import { ACCESS_LEVEL, AuthUser } from "@/domain/auth";
import { resolveClientAuth, resolveDemoAuth } from "@/mocks/domain/user";
import { verifyLoginCredentials } from "@/server/data/auth/accounts";
import { displayNameMapper } from "@/shared/utils/i18n/displayName";

export type LoginResponse = AuthUser;

// process login.
export const loginApi = async ({
  username,
  password,
  mode = "login",
}: {
  username: string;
  password: string;
  mode?: "login" | "demo";
}): Promise<LoginResponse> => {
  try {
    if (mode === "demo") {
      // demo login
      const demoAuth = resolveDemoAuth(username);

      if (demoAuth) {
        return { ...demoAuth, dataScope: "LOCAL" };
      }

      // client demo login
      const clientDemoAuth = resolveClientAuth(username);

      if (clientDemoAuth) {
        return { ...clientDemoAuth, dataScope: "LOCAL" };
      }

      throw new Error("INVALID_CREDENTIALS");
    }

    // real login
    const verifiedUser = await verifyLoginCredentials(username, password);

    if (!verifiedUser || verifiedUser.userScope !== "INTERNAL") {
      throw new Error("INVALID_CREDENTIALS");
    }

    return {
      id: verifiedUser.authAccountId,
      employeeId: verifiedUser.employeeId,
      username: verifiedUser.username,
      displayName: displayNameMapper(verifiedUser.employeeName),
      email: verifiedUser.employeeEmail,
      accessToken: buildDemoSafeAccessToken(
        verifiedUser.authAccountId,
        verifiedUser.employeeId,
      ),
      dataScope: "REMOTE",
      userScope: verifiedUser.userScope,
      companyId: verifiedUser.companyId,
      permission: ACCESS_LEVEL[verifiedUser.permission],
      role: verifiedUser.role,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error("INVALID_CREDENTIALS");
      }
    }
    throw error;
  }
};

function buildDemoSafeAccessToken(authAccountId: string, employeeId: number) {
  return `auth-${authAccountId}-employee-${employeeId}`;
}
