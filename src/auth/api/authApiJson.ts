import { requestEmbeddedAuthApi } from "./embeddedAuthApi";
import { requestExternalAuthApi } from "./externalAuthApi";
import type { AuthApiJsonOptions } from "./types";

/** Selects the configured external authentication service or the in-process server dispatcher. */
export function authApiJson(options: AuthApiJsonOptions) {
  return process.env.AUTH_API_BASE_URL?.trim()
    ? requestExternalAuthApi(options)
    : requestEmbeddedAuthApi(options);
}
