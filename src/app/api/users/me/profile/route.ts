// app/api/me/route.ts
import { NextRequest, NextResponse } from "next/server";

import { getCurrentUserName, isRemoteRequest } from "@/app/api/_helpers";
import { portalApiJson } from "@/app/api/_helpers/portalApiJson";
import { clientProfiles, demoProfiles } from "@/mocks/domain/user";

export async function GET(req: NextRequest) {
  const currentUserName = await getCurrentUserName(req);

  if (!currentUserName) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const isRemote = await isRemoteRequest(req);

  if (!isRemote) {
    const demoUserProfiles = [...demoProfiles, ...clientProfiles];

    const targetProfile = demoUserProfiles.find(
      (profile) => profile.username === currentUserName,
    );

    if (!targetProfile) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json(targetProfile);
  }

  return portalApiJson(req, {
    method: "GET",
    path: `/users/${currentUserName}/profile`,
    errorMessage: "Failed to fetch current user profile",
  });
}
