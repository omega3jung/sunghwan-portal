export type AuthApiQueryValue =
  | string
  | number
  | boolean
  | readonly (string | number | boolean)[]
  | (string | number | boolean)[]
  | null
  | undefined;

export type AuthApiJsonOptions = {
  path: string;
  errorMessage: string;
  method?: "GET" | "POST";
  query?: URLSearchParams | Record<string, AuthApiQueryValue>;
  body?: unknown;
  headers?: HeadersInit;
  mapData?: (payload: unknown) => unknown;
};
