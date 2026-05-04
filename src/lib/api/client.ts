import axios, { AxiosRequestConfig } from "axios";

/**
 * Axios instance for API communication.
 * - baseURL is resolved from environment variables
 * - timeout is set to prevent hanging requests
 */
const client = axios.create({
  baseURL: process.env.API_DB_URL,
  timeout: 15_000,
});

/**
 * Extended request config with typed query params.
 * @template P - Query parameter type
 */
type RequestConfig<P = unknown> = AxiosRequestConfig & {
  params?: P;
};

/**
 * Public API client
 *
 * Responsibilities:
 * - Handles HTTP transport only (no business logic)
 * - Provides typed wrappers around axios methods
 *
 * Principles:
 * - No domain-specific logic (e.g. filtering, mapping)
 * - No data transformation
 * - Used by feature-scoped API modules
 */
export const api = {
  /**
   * Perform HTTP GET request
   *
   * Use for:
   * - Fetching resources
   * - Query-based retrieval (with params)
   *
   * @template T - Response data type
   * @template P - Query parameter type
   */
  get<T, P = Record<string, unknown>>(url: string, config?: RequestConfig<P>) {
    return client.get<T>(url, config);
  },

  /**
   * Perform HTTP POST request
   *
   * Use for:
   * - Creating new resources
   * - Triggering non-idempotent actions
   *
   * @template T - Response data type
   * @template D - Request body type
   * @template P - Query parameter type
   */
  post<T, D = unknown, P = Record<string, unknown>>(
    url: string,
    data?: D,
    config?: RequestConfig<P>,
  ) {
    return client.post<T>(url, data, config);
  },

  /**
   * Perform HTTP PUT request
   *
   * Use for:
   * - Full resource updates (replace entire entity)
   *
   * Note:
   * - Prefer PATCH for partial updates
   *
   * @template T - Response data type
   * @template D - Request body type
   * @template P - Query parameter type
   */
  put<T, D = unknown, P = Record<string, unknown>>(
    url: string,
    data?: D,
    config?: RequestConfig<P>,
  ) {
    return client.put<T>(url, data, config);
  },

  /**
   * Perform HTTP PATCH request
   *
   * Use for:
   * - Partial updates (e.g. status change, soft delete)
   * - Updating specific fields without replacing the entire resource
   *
   * @template T - Response data type
   * @template D - Request body type
   * @template P - Query parameter type
   */
  patch<T, D = unknown, P = Record<string, unknown>>(
    url: string,
    data?: D,
    config?: RequestConfig<P>,
  ) {
    return client.patch<T>(url, data, config);
  },

  /**
   * Perform HTTP DELETE request
   *
   * Use for:
   * - Hard deletion of resources
   *
   * Note:
   * - For soft delete, prefer PATCH with `{ active: false }`
   *
   * @template T - Response data type
   * @template P - Query parameter type
   */
  delete<T, P = Record<string, unknown>>(
    url: string,
    config?: RequestConfig<P>,
  ) {
    return client.delete<T>(url, config);
  },
};
