import fetcher from "@/services/fetcher";
import { Permission, Preference } from "@/types";
import axios from "axios";

export type LoginResponse = {
  id: string;
  name: string;
  email: string;
  permission: Permission;
  access_token: string;
  is_admin: boolean;
  preference?: Preference;
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
    if (username === "__demo__") {
      console.log(username);
      return {
        id: "demo",
        name: "Demo User",
        email: "demo@sunghwan.dev",
        permission: { scope: "LOCAL", role: "VISITOR" },
        access_token: "demo-token",
        is_admin: false,
      };
    }
    console.log("real login");

    // real login
    const res = await fetcher.api.post<LoginResponse>("/auth/login", {
      username,
      password,
    });
    return { ...res.data, is_admin: false };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error("INVALID_CREDENTIALS");
      }
    }
    throw error;
  }
};
