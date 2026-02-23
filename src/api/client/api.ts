import axios, { AxiosRequestConfig } from "axios";

const client = axios.create({
  baseURL: process.env.API_DB_URL,
  timeout: 15_000,
});

type RequestConfig<P = unknown> = AxiosRequestConfig & {
  params?: P;
};

/**
 * Public API client
 * - Transport layer only
 * - No domain/filter/SQL concepts
 */
export const api = {
  get<T, P = Record<string, unknown>>(url: string, config?: RequestConfig<P>) {
    return client.get<T>(url, config);
  },

  post<T, D = unknown, P = Record<string, unknown>>(
    url: string,
    data?: D,
    config?: RequestConfig<P>
  ) {
    return client.post<T>(url, data, config);
  },

  put<T, D = unknown, P = Record<string, unknown>>(
    url: string,
    data?: D,
    config?: RequestConfig<P>
  ) {
    return client.put<T>(url, data, config);
  },

  delete<T, P = Record<string, unknown>>(
    url: string,
    config?: RequestConfig<P>
  ) {
    return client.delete<T>(url, config);
  },
};
