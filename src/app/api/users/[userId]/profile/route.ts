// app/api/user-profile/[userId]/route.ts
import { NextRequest, NextResponse } from "next/server";

import {
  getAdminOrSelfErrorResponse,
  isRemoteRequest,
} from "@/app/api/_adapters";
import { portalApiJson } from "@/app/api/_adapters/backend";
import { UserIdRouteContext } from "@/app/api/_adapters/http";
import { getLocalUserProfile } from "@/app/api/_adapters/localDemo/user";
import { AppUser } from "@/domain/user";

/** Handles GET /api/users/[userId]/profile; authorization and runtime adapter selection remain at this HTTP boundary. */
export async function GET(req: NextRequest, context: UserIdRouteContext) {
  const { userId } = await context.params;

  if (!userId?.trim()) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const authError = await getAdminOrSelfErrorResponse(req, userId);
  if (authError) return authError;

  const isRemote = await isRemoteRequest(req);

  if (!isRemote) {
    const targetProfile = getLocalUserProfile(userId);

    if (!targetProfile) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ data: targetProfile });
  }

  return portalApiJson(req, {
    method: "GET",
    path: `/users/${encodeURIComponent(userId)}/profile`,
    errorMessage: "Failed to fetch user profile",
  });
}

/** Handles POST /api/users/[userId]/profile; authorization and runtime adapter selection remain at this HTTP boundary. */
export async function POST(req: NextRequest, context: UserIdRouteContext) {
  const { userId } = await context.params;
  const authError = await getAdminOrSelfErrorResponse(req, userId);
  if (authError) return authError;

  const body = (await req.json()) as AppUser;
  const isRemote = await isRemoteRequest(req);

  // demo mode
  if (!isRemote) {
    return NextResponse.json(body, { status: 201 }); // POST is 201.
  }

  return portalApiJson(req, {
    method: "POST",
    path: `/users/${encodeURIComponent(userId)}/profile`,
    body,
    errorMessage: "Failed to create user profile",
  });
}

/** Handles PUT /api/users/[userId]/profile; authorization and runtime adapter selection remain at this HTTP boundary. */
export async function PUT(req: NextRequest, context: UserIdRouteContext) {
  const { userId } = await context.params;
  const authError = await getAdminOrSelfErrorResponse(req, userId);
  if (authError) return authError;

  const body = (await req.json()) as AppUser;
  const isRemote = await isRemoteRequest(req);

  // demo mode

  if (!isRemote) {
    return NextResponse.json(body, { status: 200 }); // PUT is 200. (or 204).
  }

  return portalApiJson(req, {
    method: "PUT",
    path: `/users/${encodeURIComponent(userId)}/profile`,
    body,
    errorMessage: "Failed to update user profile",
  });
}
