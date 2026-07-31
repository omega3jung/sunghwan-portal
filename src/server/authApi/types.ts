/** Enumerates the HTTP methods supported by the embedded authentication API dispatcher. */
export type AuthApiMethod = "GET" | "POST";

type QueryPrimitive = string | number | boolean;

/** Represents one scalar or repeated query-string value accepted by the authentication API. */
export type AuthApiQueryValue =
  | QueryPrimitive
  | readonly QueryPrimitive[]
  | QueryPrimitive[]
  | null
  | undefined;

/** Models normalized query parameters passed to an authentication API handler. */
export type AuthApiQuery = URLSearchParams | Record<string, AuthApiQueryValue>;

/** Carries the optional status code and headers for an authentication API JSON response. */
export type AuthApiJsonOptions = {
  path: string;
  errorMessage: string;
  method?: AuthApiMethod;
  query?: AuthApiQuery;
  body?: unknown;
  headers?: HeadersInit;
  requireAuth?: boolean;
  mapData?: (payload: unknown) => unknown;
};
