// app/api/user-profile/[userId]/route.ts
import { NextRequest, NextResponse } from "next/server";

import { demoProfiles, tenantProfiles } from "@/domain/user";
import fetcher from "@/services/fetcher";

import { checkAdminOrSelf, isRemoteRequest } from "../../_helpers";

export async function GET(
  req: NextRequest,
  context: { params: { userId: string } }
) {
  const { userId } = context.params;
  const isRemote = await isRemoteRequest(req);

  // demo mode
  if (!isRemote) {
    // Return mock user preference.
    const demoUserProfiles = [...demoProfiles, ...tenantProfiles];

    const targetProfile = demoUserProfiles.find(
      (profile) => profile.id === userId
    );

    if (!targetProfile) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json(targetProfile);
  }

  // real backend
  try {
    const auth = await checkAdminOrSelf(req, userId);
    if (!auth.ok) {
      return NextResponse.json(
        { error: auth.status === 401 ? "Unauthorized" : "Forbidden" },
        { status: auth.status }
      );
    }

    // connect to db directly (current)
    const res = await fetcher.db.get(`/user-profile/${userId}`);

    // connect to api (later)
    //const res = await fetcher.api.get(`/user-profile/${userId}`);

    return NextResponse.json(res.data);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch user preference" },
      { status: 500 }
    );
  }
}
