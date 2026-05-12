import axios from "axios";

import { ACCESS_LEVEL, AuthUser } from "@/domain/auth";
import { resolveClientAuth, resolveDemoAuth } from "@/mocks/domain/user";
import { verifyAuthAccountCredentials } from "@/server/data/auth/accounts";
import { getActiveEmployeeById } from "@/server/data/user";
import { toEnglishDisplayName } from "@/server/shared/user/displayName";

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
    const verifiedAccount = await verifyAuthAccountCredentials(
      username,
      password,
    );

    if (!verifiedAccount || verifiedAccount.userScope !== "INTERNAL") {
      throw new Error("INVALID_CREDENTIALS");
    }

    const employee = await getActiveEmployeeById(verifiedAccount.employeeId);

    if (!employee) {
      throw new Error("INVALID_CREDENTIALS");
    }

    return {
      id: String(verifiedAccount.authAccountId),
      employeeId: employee.employeeId,
      username: verifiedAccount.username,
      displayName: toEnglishDisplayName(employee.name) || employee.username,
      email: employee.email,
      accessToken: buildDemoSafeAccessToken(
        verifiedAccount.authAccountId,
        employee.employeeId,
      ),
      dataScope: "REMOTE",
      userScope: verifiedAccount.userScope,
      companyId: String(employee.companyId),
      permission: ACCESS_LEVEL[verifiedAccount.permission],
      role: verifiedAccount.role,
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

function buildDemoSafeAccessToken(authAccountId: number, employeeId: number) {
  return `auth-${authAccountId}-employee-${employeeId}`;
}
