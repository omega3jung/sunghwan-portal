/** Represents one scalar or repeated query value accepted by the authentication adapter. */
export type AuthApiQueryValue =
  | string
  | number
  | boolean
  | readonly (string | number | boolean)[]
  | (string | number | boolean)[]
  | null
  | undefined;

/** Configures an embedded or external authentication request through one shared contract. */
export type AuthApiJsonOptions = {
  path: string;
  errorMessage: string;
  method?: "GET" | "POST";
  query?: URLSearchParams | Record<string, AuthApiQueryValue>;
  body?: unknown;
  headers?: HeadersInit;
  mapData?: (payload: unknown) => unknown;
};
