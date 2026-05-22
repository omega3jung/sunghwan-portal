import { NextRequest, NextResponse } from "next/server";

import { handleNavigationPortalApi } from "./navigation/navigationPortalApiHandler";
import { PortalApiJsonOptions } from "./types";
import { handleUserPortalApi } from "./users/usersPortalApiHandler";
import { normalizePath } from "./utils";

export async function dispatchPortalApi(
  request: NextRequest,
  options: PortalApiJsonOptions,
) {
  const path = normalizePath(options.path);

  if (path.startsWith("/users/")) {
    return handleUserPortalApi(request, { ...options, path });
  }

  if (path.startsWith("/navigation/")) {
    return handleNavigationPortalApi(request, { ...options, path });
  }

  return NextResponse.json({ message: "Not found" }, { status: 404 });
}
