import { NextRequest, NextResponse } from "next/server";

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

  return NextResponse.json({ message: "Not found" }, { status: 404 });
}
