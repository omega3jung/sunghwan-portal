import axios from "axios";

import { resolveDemoAuth, resolveTenantAuth } from "@/domain/user";
import fetcher from "@/services/fetcher";
import { AuthUser } from "@/types";

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
      console.log(demoAuth.name);
      return { ...demoAuth, dataScope: "LOCAL" };
    }

    // tenant demo login
    const tenantDemoAuth = resolveTenantAuth(username);

    if (tenantDemoAuth) {
      console.log(tenantDemoAuth.name);
      return { ...tenantDemoAuth, dataScope: "LOCAL" };
    }

    console.log("real login");

    // real login
    const res = await fetcher.api.post<LoginResponse>("/auth/login", {
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
