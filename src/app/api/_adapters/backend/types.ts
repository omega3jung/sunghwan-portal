export type BackendMethod =
  "GET" | "HEAD" | "POST" | "PUT" | "PATCH" | "DELETE";

type QueryPrimitive = string | number | boolean;

export type BackendQueryValue =
  | QueryPrimitive
  | readonly QueryPrimitive[]
  | QueryPrimitive[]
  | null
  | undefined;

export type BackendQuery = URLSearchParams | Record<string, BackendQueryValue>;

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
