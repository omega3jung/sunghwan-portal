// app/api/user-preference/route.ts
import { NextRequest, NextResponse } from "next/server";

import { checkAdminOrSelf, isRemoteRequest } from "@/app/api/_helpers";
import { portalApiJson } from "@/app/api/_helpers/portalApiJson";
import { UserIdRouteContext } from "@/app/api/_helpers/types";
import { Preference } from "@/domain/user/preference";

export async function GET(req: NextRequest, context: UserIdRouteContext) {
  const { userId } = context.params;
  const isRemote = await isRemoteRequest(req);

  // local demo mode.
  if (!isRemote) {
    // keep default user preference.
    return NextResponse.json({ data: null });
  }

  const authError = await getAdminOrSelfError(req, userId);
  if (authError) return authError;

  return portalApiJson(req, {
    path: `/users/${userId}/preference`,
    errorMessage: "Failed to fetch user preference",
  });
}

export async function POST<T>(req: NextRequest, context: UserIdRouteContext) {
  const { userId } = context.params;
  const isRemote = await isRemoteRequest(req);

  const body = (await req.json()) as Preference<T>;

  // demo mode
  if (!isRemote) {
    return NextResponse.json(body, { status: 201 }); // POST is 201.
  }

  const authError = await getAdminOrSelfError(req, userId);
  if (authError) return authError;

  return portalApiJson(req, {
    method: "POST",
    path: `/users/${userId}/preference`,
    body,
    errorMessage: "Failed to create user preference",
  });
}

export async function PUT<T>(req: NextRequest, context: UserIdRouteContext) {
  const { userId } = context.params;
  const isRemote = await isRemoteRequest(req);

  const body = (await req.json()) as Preference<T>;

  // demo mode

  if (!isRemote) {
    return NextResponse.json(body, { status: 200 }); // PUT is 200. (or 204).
  }

  const authError = await getAdminOrSelfError(req, userId);
  if (authError) return authError;

  return portalApiJson(req, {
    method: "PUT",
    path: `/users/${userId}/preference`,
    body,
    errorMessage: "Failed to update user preference",
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
