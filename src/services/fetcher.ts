import axios from "axios";
import { UseQueryOptions } from "@tanstack/react-query";
import { ENVIRONMENT } from "@/lib/publicRuntimeConfig";

export type FetcherOptions = Omit<
  UseQueryOptions<string, unknown, string, string[]>,
  "queryKey" | "queryFn"
>;

const DefaultClient = (baseURL?: string) => {
  const instance = axios.create({
    timeout: 15_000,
    baseURL,
  });

  instance.interceptors.request.use((config) => {
    config.headers["Accept"] ??= "application/json, text/plain";
    config.headers["Content-Type"] ??= "application/json";

    return config;
  });

  return instance;
};

const fetcher = {
  portal: DefaultClient(ENVIRONMENT.PORTAL_API_URL),
  api: DefaultClient(ENVIRONMENT.NODE_API_URL),
  files: DefaultClient(ENVIRONMENT.PORTAL_API_URL),
} as const;

export function setFetcherToken(token?: string) {
  if (!token) {
    fetcher.api.defaults.headers.common["Authorization"] = "";
    return;
  }

  fetcher.api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

export default fetcher;
