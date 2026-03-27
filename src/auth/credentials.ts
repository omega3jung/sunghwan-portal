import axios from "axios";

import client from "@/api/client";
import { resolveDemoAuth, resolveTenantAuth } from "@/app/_mocks/domain/user";
import { AuthUser } from "@/domain/auth";

export type LoginResponse = AuthUser;

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
      return { ...demoAuth, dataScope: "LOCAL" };
    }

    // tenant demo login
    const tenantDemoAuth = resolveTenantAuth(username);

    if (tenantDemoAuth) {
      console.log(tenantDemoAuth.displayName);
      return { ...tenantDemoAuth, dataScope: "LOCAL" };
    }

    console.log("real login");

    // real login
    const res = await client.api.post<LoginResponse>("/auth/login", {
      username,
      password,
    });
    return { ...res.data, dataScope: "REMOTE" };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error("INVALID_CREDENTIALS");
      }
    }
    throw error;
  }
};
