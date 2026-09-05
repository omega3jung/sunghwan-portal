// app/api/me/route.ts
import { NextRequest, NextResponse } from "next/server";

import {
  isRemoteRequest,
  requireCurrentUserName,
  toAuthErrorResponse,
} from "@/app/api/_adapters";
import { portalApiJson } from "@/app/api/_adapters/backend";
import { getLocalUserProfile } from "@/app/api/_adapters/localDemo/user";

/** Handles GET /api/users/me/profile; authorization and runtime adapter selection remain at this HTTP boundary. */
export async function GET(req: NextRequest) {
  const auth = await requireCurrentUserName(req);

  if (!auth.ok) {
    return toAuthErrorResponse(auth);
  }

  const currentUserName = auth.username;
  const isRemote = await isRemoteRequest(req);

  if (!isRemote) {
    const targetProfile = getLocalUserProfile(currentUserName);

    if (!targetProfile) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ data: targetProfile });
  }

  return portalApiJson(req, {
    method: "GET",
    path: `/users/${encodeURIComponent(currentUserName)}/profile`,
    errorMessage: "Failed to fetch current user profile",
  });
}
