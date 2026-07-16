import { requestEmbeddedAuthApi } from "./embeddedAuthApi";
import { requestExternalAuthApi } from "./externalAuthApi";
import type { AuthApiJsonOptions } from "./types";

export function authApiJson(options: AuthApiJsonOptions) {
  return process.env.AUTH_API_BASE_URL?.trim()
    ? requestExternalAuthApi(options)
    : requestEmbeddedAuthApi(options);
}
