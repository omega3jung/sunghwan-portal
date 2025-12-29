import axios from "axios";
import { getSession } from "next-auth/react";

import { ENVIRONMENT } from "@/lib/environment";

const createClient = (baseURL?: string) => {
  const instance = axios.create({
    timeout: 15_000,
    baseURL,
  });

  instance.interceptors.request.use(async (config) => {
    config.headers["Accept"] ??= "application/json";
    config.headers["Content-Type"] ??= "application/json";

    const session = await getSession();

    if (session?.user?.accessToken) {
      config.headers.Authorization = `Bearer ${session.user.accessToken}`;
    }

    return config;
  });

  return instance;
};

const fetcher = {
  api: createClient(ENVIRONMENT.API.NODE),
  portal: createClient(ENVIRONMENT.API.PORTAL),
  files: createClient(ENVIRONMENT.API.PORTAL),
} as const;

export default fetcher;
