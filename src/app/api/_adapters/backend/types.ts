/** Enumerates the HTTP methods supported by the backend route adapter. */
export type BackendMethod =
  "GET" | "HEAD" | "POST" | "PUT" | "PATCH" | "DELETE";

type QueryPrimitive = string | number | boolean;

/** Represents one scalar or repeated query value forwarded to the configured backend. */
export type BackendQueryValue =
  | QueryPrimitive
  | readonly QueryPrimitive[]
  | QueryPrimitive[]
  | null
  | undefined;

/** Models query parameters forwarded through the backend adapter. */
export type BackendQuery = URLSearchParams | Record<string, BackendQueryValue>;

/** Carries request body, query, headers, and response mapping options for a backend call. */
export type BackendJsonOptions = {
  path: string;
  errorMessage: string;
  method?: BackendMethod;
  query?: BackendQuery;
  body?: unknown;
  headers?: HeadersInit;
  requireAuth?: boolean;
  mapData?: (payload: unknown) => unknown;
};
