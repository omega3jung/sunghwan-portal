import { dispatchAuthApi } from "@/server/authApi";
import { AuthApiJsonOptions } from "@/server/authApi/types";

export async function authApiJson(options: AuthApiJsonOptions) {
  // TODO. switch to import/proxy in the part separated into external authentication APIs.
  return dispatchAuthApi(options);
}
