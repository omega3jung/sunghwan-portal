export type PortalApiMethod =
  | "GET"
  | "HEAD"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE";

type QueryPrimitive = string | number | boolean;

export type PortalApiQueryValue =
  | QueryPrimitive
  | readonly QueryPrimitive[]
  | QueryPrimitive[]
  | null
  | undefined;

export type PortalApiQuery = URLSearchParams | Record<string, PortalApiQueryValue>;

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
