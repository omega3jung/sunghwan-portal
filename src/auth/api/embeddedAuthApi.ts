import { dispatchAuthApi } from "@/server/authApi";

import type { AuthApiJsonOptions } from "./types";

/** Temporary in-process bridge removed when authApi is extracted. */
export function requestEmbeddedAuthApi(options: AuthApiJsonOptions) {
  return dispatchAuthApi(options);
}
