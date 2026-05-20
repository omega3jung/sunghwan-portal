import { NextRequest } from "next/server";

import { proxyJson } from "@/app/api/_helpers";
import { dispatchPortalApi } from "@/server/portalApi";
import { PortalApiJsonOptions } from "@/server/portalApi/types";

export async function portalApiJson(
  request: NextRequest,
  options: PortalApiJsonOptions,
) {
  if (hasExternalPortalApiBaseUrl()) {
    return proxyJson(request, options);
  }

  return dispatchPortalApi(request, options);
}

function hasExternalPortalApiBaseUrl() {
  const baseUrl = process.env.API_BASE_URL;
  return typeof baseUrl === "string" && baseUrl.trim().length > 0;
}
