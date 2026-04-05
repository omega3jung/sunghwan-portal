// app/api/user-profile/[userId]/route.ts
import { NextRequest, NextResponse } from "next/server";

import { clientProfiles, demoProfiles } from "@/app/_mocks/domain/user";
import {
  checkAdminOrSelf,
  isRemoteRequest,
  proxyJson,
} from "@/app/api/_helpers";
import { UserIdRouteContext } from "@/app/api/_helpers/types";
import { AppUser } from "@/domain/user";

export async function GET(req: NextRequest, context: UserIdRouteContext) {
  const { userId } = context.params;
  const isRemote = await isRemoteRequest(req);

  // demo mode
  if (!isRemote) {
    // Return mock user preference.
    const demoUserProfiles = [...demoProfiles, ...clientProfiles];

    const targetProfile = demoUserProfiles.find(
      (profile) => profile.id === userId,
    );

    if (!targetProfile) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json(targetProfile);
  }

  const authError = await getAdminOrSelfError(req, userId);
  if (authError) return authError;

  return proxyJson(req, {
    path: `/user/${userId}/profile`,
    errorMessage: "Failed to fetch user profile",
  });
}

export async function POST(req: NextRequest, context: UserIdRouteContext) {
  const { userId } = context.params;
  const isRemote = await isRemoteRequest(req);

  const body = (await req.json()) as AppUser;

  // demo mode
  if (!isRemote) {
    return NextResponse.json(body, { status: 201 }); // POST is 201.
  }

  const authError = await getAdminOrSelfError(req, userId);
  if (authError) return authError;

  return proxyJson(req, {
    method: "POST",
    path: `/user/${userId}/profile`,
    body,
    errorMessage: "Failed to create user profile",
  });
}

export async function PUT(req: NextRequest, context: UserIdRouteContext) {
  const { userId } = context.params;
  const isRemote = await isRemoteRequest(req);

  const body = (await req.json()) as AppUser;

  // demo mode

  if (!isRemote) {
    return NextResponse.json(body, { status: 200 }); // PUT is 200. (or 204).
  }

  const authError = await getAdminOrSelfError(req, userId);
  if (authError) return authError;

  return proxyJson(req, {
    method: "PUT",
    path: `/user/${userId}/profile`,
    body,
    errorMessage: "Failed to update user profile",
  });
}

async function getAdminOrSelfError(req: NextRequest, userId: string) {
  const auth = await checkAdminOrSelf(req, userId);

  if (auth.ok) {
    return null;
  }

  return NextResponse.json(
    { message: auth.status === 401 ? "Unauthorized" : "Forbidden" },
    { status: auth.status },
  );
}
