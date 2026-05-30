export type AuthApiMethod = "GET" | "POST";

type QueryPrimitive = string | number | boolean;

export type AuthApiQueryValue =
  | QueryPrimitive
  | readonly QueryPrimitive[]
  | QueryPrimitive[]
  | null
  | undefined;

export type AuthApiQuery = URLSearchParams | Record<string, AuthApiQueryValue>;

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
