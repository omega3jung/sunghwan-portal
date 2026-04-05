import axios from "axios";

import client from "@/api/client";
import { resolveClientAuth, resolveDemoAuth } from "@/app/_mocks/domain/user";
import { AuthUser } from "@/domain/auth";

export type LoginResponse = AuthUser;
type RawLoginResponse = Omit<AuthUser, "companyId"> & {
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
  const { companyId, clientId, ...rest } = user;

  return {
    ...rest,
    companyId: companyId ?? clientId ?? "",
  };
}
