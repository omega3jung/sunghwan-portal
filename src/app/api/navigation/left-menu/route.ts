// src/app/api/navigation/left-menu/route.ts
import { NextRequest, NextResponse } from "next/server";

import {
  isRemoteRequest,
  requireCurrentUserName,
  toAuthErrorResponse,
} from "@/app/api/_adapters";
import { portalApiJson } from "@/app/api/_adapters/backend";
import { getLocalLeftMenu } from "@/app/api/_adapters/localDemo/user";

/** Handles GET /api/navigation/left-menu; authorization and runtime adapter selection remain at this HTTP boundary. */
export async function GET(req: NextRequest) {
  const auth = await requireCurrentUserName(req);

  if (!auth.ok) {
    return toAuthErrorResponse(auth);
  }

  const currentUserName = auth.username;
  const isRemote = await isRemoteRequest(req);

  if (!isRemote) {
    const leftMenu = getLocalLeftMenu(currentUserName);

    if (!leftMenu) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ data: leftMenu });
  }

  return portalApiJson(req, {
    method: "GET",
    path: `/navigation/left-menu/${encodeURIComponent(currentUserName)}`,
    errorMessage: "Failed to fetch left menu items",
  });
}
