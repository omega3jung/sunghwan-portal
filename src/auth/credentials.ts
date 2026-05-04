import axios from "axios";

import { AuthUser } from "@/domain/auth";
import client from "@/lib/api";
import { resolveClientAuth, resolveDemoAuth } from "@/mocks/domain/user";

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
}: {
  username: string;
  password: string;
}): Promise<LoginResponse> => {
  try {
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

    console.log("real login");

    // real login
    const res = await client.api.post<RawLoginResponse>("/auth/login", {
      username,
      password,
    });
    return normalizeAuthUser({ ...res.data, dataScope: "REMOTE" });
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
