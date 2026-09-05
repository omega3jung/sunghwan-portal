// app/api/user-preference/route.ts
import { NextRequest, NextResponse } from "next/server";

import {
  getAdminOrSelfErrorResponse,
  isRemoteRequest,
} from "@/app/api/_adapters";
import { portalApiJson } from "@/app/api/_adapters/backend";
import { UserIdRouteContext } from "@/app/api/_adapters/http";
import { Preference } from "@/domain/user/preference";

/** Handles GET /api/users/[userId]/preference; authorization and runtime adapter selection remain at this HTTP boundary. */
export async function GET(req: NextRequest, context: UserIdRouteContext) {
  const { userId } = await context.params;
  const authError = await getAdminOrSelfErrorResponse(req, userId);
  if (authError) return authError;

  const isRemote = await isRemoteRequest(req);

  if (!isRemote) {
    return NextResponse.json({ data: null });
  }

  return portalApiJson(req, {
    path: `/users/${userId}/preference`,
    errorMessage: "Failed to fetch user preference",
  });
}

/** Handles POST /api/users/[userId]/preference; authorization and runtime adapter selection remain at this HTTP boundary. */
export async function POST<T>(req: NextRequest, context: UserIdRouteContext) {
  const { userId } = await context.params;
  const authError = await getAdminOrSelfErrorResponse(req, userId);
  if (authError) return authError;

  const body = (await req.json()) as Preference<T>;
  const isRemote = await isRemoteRequest(req);

  // demo mode
  if (!isRemote) {
    return NextResponse.json(body, { status: 201 }); // POST is 201.
  }

  return portalApiJson(req, {
    method: "POST",
    path: `/users/${userId}/preference`,
    body,
    errorMessage: "Failed to create user preference",
  });
}

/** Handles PUT /api/users/[userId]/preference; authorization and runtime adapter selection remain at this HTTP boundary. */
export async function PUT<T>(req: NextRequest, context: UserIdRouteContext) {
  const { userId } = await context.params;
  const authError = await getAdminOrSelfErrorResponse(req, userId);
  if (authError) return authError;

  const body = (await req.json()) as Preference<T>;
  const isRemote = await isRemoteRequest(req);

  // demo mode

  if (!isRemote) {
    return NextResponse.json(body, { status: 200 }); // PUT is 200. (or 204).
  }

  return portalApiJson(req, {
    method: "PUT",
    path: `/users/${userId}/preference`,
    body,
    errorMessage: "Failed to update user preference",
  });
}
