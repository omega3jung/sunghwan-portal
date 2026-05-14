import axios from "axios";

import { ACCESS_LEVEL, AuthUser } from "@/domain/auth";
import { resolveClientAuth, resolveDemoAuth } from "@/mocks/domain/user";
import { verifyLoginCredentials } from "@/server/data/auth/accounts";
import { displayNameMapper } from "@/shared/utils/i18n/displayName";

export type LoginResponse = AuthUser;
type RawLoginResponse = Omit<AuthUser, "companyId" | "employeeId"> & {
  employeeId?: number | string | null;
  companyId?: string | null;
  clientId?: string | null;
};

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
        console.log(demoAuth.displayName);
        return normalizeAuthUser({ ...demoAuth, dataScope: "LOCAL" });
      }

      // client demo login
      const clientDemoAuth = resolveClientAuth(username);

      if (clientDemoAuth) {
        console.log(clientDemoAuth.displayName);
        return normalizeAuthUser({ ...clientDemoAuth, dataScope: "LOCAL" });
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
      companyId: String(verifiedUser.companyId),
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

function normalizeAuthUser(user: RawLoginResponse): AuthUser {
  const { companyId, clientId, employeeId, ...rest } = user;

  return {
    ...rest,
    employeeId: resolveEmployeeId(employeeId),
    companyId: companyId ?? clientId ?? "",
  };
}

function resolveEmployeeId(value: number | string | null | undefined) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}

function buildDemoSafeAccessToken(authAccountId: string, employeeId: number) {
  return `auth-${authAccountId}-employee-${employeeId}`;
}
