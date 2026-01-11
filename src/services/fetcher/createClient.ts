// src/services/fetcher/createClient.ts
import axios from "axios";

export const createClient = (baseURL?: string) => {
  const instance = axios.create({
    timeout: 15_000,
    baseURL,
  });

  instance.interceptors.request.use(async (config) => {
    config.headers.Accept ??= "application/json";
    config.headers["Content-Type"] ??= "application/json";

    // const session = await getSession();

    //if (session?.user?.accessToken) {
    //  config.headers.Authorization = `Bearer ${session.user.accessToken}`;
    //}

    return config;
  });

  return instance;
};
