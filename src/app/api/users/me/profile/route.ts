// app/api/me/route.ts
import { NextRequest, NextResponse } from "next/server";

import { getCurrentUserName, isRemoteRequest } from "@/app/api/_adapters";
import { portalApiJson } from "@/app/api/_adapters/backend";
import { getLocalUserProfile } from "@/app/api/_adapters/localDemo/user";

export async function GET(req: NextRequest) {
  const currentUserName = await getCurrentUserName(req);

  if (!currentUserName) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

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
