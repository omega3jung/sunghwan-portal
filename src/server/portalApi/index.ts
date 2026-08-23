// src/server/portalApi/index.ts
import { NextRequest, NextResponse } from "next/server";

import { handleNavigationPortalApi } from "./navigation/navigationPortalApiHandler";
import { handleOrganizationPortalApi } from "./organization/organizationPortalApiHandler";
import { handleServiceDeskPortalApi } from "./serviceDesk/serviceDeskPortalApiHandler";
import { PortalApiJsonOptions } from "./types";
import { handleUserPortalApi } from "./users/usersPortalApiHandler";
import { normalizePath } from "./utils";

/** Dispatches an in-process portal API request while preserving the same boundary as an HTTP route. */
export async function dispatchPortalApi(
  request: NextRequest,
  options: PortalApiJsonOptions,
) {
  const path = normalizePath(options.path);

  if (
    path.startsWith("/company") ||
    path.startsWith("/department") ||
    path.startsWith("/employees") ||
    path.startsWith("/job-field")
  ) {
    return handleOrganizationPortalApi(request, { ...options, path });
  }

  if (path.startsWith("/navigation/")) {
    return handleNavigationPortalApi(request, { ...options, path });
  }

  if (path.startsWith("/service-desk/")) {
    return handleServiceDeskPortalApi(request, { ...options, path });
  }

  if (path.startsWith("/users/")) {
    return handleUserPortalApi(request, { ...options, path });
  }

  return NextResponse.json({ message: "Not found" }, { status: 404 });
}
