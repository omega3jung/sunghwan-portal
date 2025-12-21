import fetcher from "@/services/fetcher";
import axios from "axios";

export type LoginResponse = {
  id: string;
  name: string;
  email: string;
  roles: string[];
  access_token: string;
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
        roles: ["DEMO"],
        access_token: "demo-token",
      };
    }
    console.log("real login");

    // real login
    const res = await fetcher.api.post<LoginResponse>("/auth/login", {
      username,
      password,
    });
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error("INVALID_CREDENTIALS");
      }
    }
    throw error;
  }
};
