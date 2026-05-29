import axios from "axios";

import { authApiJson } from "@/app/api/_helpers/authApiJson";
import { AuthUser } from "@/domain/auth";
import { resolveDemoAuth } from "@/mocks/domain/user";

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
        return demoAuth;
      }

      throw new Error("INVALID_CREDENTIALS");
    }

    // real login
    const response = await authApiJson({
      method: "POST",
      path: "/auth/login",
      body: { username, password },
      errorMessage: "Failed to verify login credentials",
    });

    if (!response.ok) {
      throw new Error("INVALID_CREDENTIALS");
    }

    const payload = (await response.json()) as {
      data?: AuthUser | null;
    };

    const verifiedUser = payload.data ?? null;

    if (!verifiedUser || verifiedUser.userScope !== "INTERNAL") {
      throw new Error("INVALID_CREDENTIALS");
    }

    return verifiedUser;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error("INVALID_CREDENTIALS");
      }
    }
    throw error;
  }
};
