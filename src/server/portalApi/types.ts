/** Enumerates the HTTP methods supported by the embedded portal API dispatcher. */
export type PortalApiMethod =
  | "GET"
  | "HEAD"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE";

type QueryPrimitive = string | number | boolean;

/** Represents one scalar or repeated query-string value accepted by the portal API. */
export type PortalApiQueryValue =
  | QueryPrimitive
  | readonly QueryPrimitive[]
  | QueryPrimitive[]
  | null
  | undefined;

/** Models normalized query parameters passed to a portal API handler. */
export type PortalApiQuery =
  | URLSearchParams
  | Record<string, PortalApiQueryValue>;

/** Carries the optional status code and headers for a portal API JSON response. */
export type PortalApiJsonOptions = {
  path: string;
  errorMessage: string;
  method?: PortalApiMethod;
  query?: PortalApiQuery;
  body?: unknown;
  headers?: HeadersInit;
  requireAuth?: boolean;
  mapData?: (payload: unknown) => unknown;
};
