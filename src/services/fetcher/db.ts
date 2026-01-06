import axios, { AxiosRequestConfig } from "axios";
import { formatQuery } from "react-querybuilder";

import { DbParams } from "@/types";

const mapDbParams = (params?: DbParams) => {
  if (!params) return undefined;

  const { filter, ...rest } = params;

  return {
    ...rest,
    whereSql: filter ? formatQuery(filter, "sql") : undefined,
  };
};

const client = axios.create({
  baseURL: process.env.API_DB_URL,
  timeout: 15_000,
});

/**
 * db 전용 fetcher
 * - filter → SQL 변환 책임을 가짐
 * - route.ts (server)에서만 사용
 */
export const dbFetcher = {
  get<T>(url: string, config?: AxiosRequestConfig & { params?: DbParams }) {
    return client.get<T>(url, {
      ...config,
      params: mapDbParams(config?.params),
    });
  },

  post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig & { params?: DbParams }
  ) {
    return client.post<T>(url, data, {
      ...config,
      params: mapDbParams(config?.params),
    });
  },

  put<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig & { params?: DbParams }
  ) {
    return client.put<T>(url, data, {
      ...config,
      params: mapDbParams(config?.params),
    });
  },

  delete<T>(url: string, config?: AxiosRequestConfig & { params?: DbParams }) {
    return client.delete<T>(url, {
      ...config,
      params: mapDbParams(config?.params),
    });
  },
};
