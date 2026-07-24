// app/api/me/route.ts
import { NextRequest, NextResponse } from "next/server";

import { getCurrentUserName, isRemoteRequest } from "@/app/api/_adapters";
import { portalApiJson } from "@/app/api/_adapters/backend";
import { Preference } from "@/domain/user/preference";

export async function GET(req: NextRequest) {
  const currentUserName = await getCurrentUserName(req);

  if (!currentUserName) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const isRemote = await isRemoteRequest(req);

  if (!isRemote) {
    // keep default user preference.
    return NextResponse.json({ data: null });
  }

  return portalApiJson(req, {
    method: "GET",
    path: `/users/${currentUserName}/preference`,
    errorMessage: "Failed to fetch current user profile",
  });
}

export async function POST<T>(req: NextRequest) {
  const currentUserName = await getCurrentUserName(req);

  if (!currentUserName) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const isRemote = await isRemoteRequest(req);

  const body = (await req.json()) as Preference<T>;

  // demo mode
  if (!isRemote) {
    return NextResponse.json(body, { status: 201 }); // POST is 201.
  }

  return portalApiJson(req, {
    method: "POST",
    path: `/users/${currentUserName}/preference`,
    body,
    errorMessage: "Failed to create user preference",
  });
}

export async function PUT<T>(req: NextRequest) {
  const currentUserName = await getCurrentUserName(req);

  if (!currentUserName) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const isRemote = await isRemoteRequest(req);

  const body = (await req.json()) as Preference<T>;

  // demo mode

  if (!isRemote) {
    return NextResponse.json(body, { status: 200 }); // PUT is 200. (or 204).
  }

  return portalApiJson(req, {
    method: "PUT",
    path: `/users/${currentUserName}/preference`,
    body,
    errorMessage: "Failed to update user preference",
  });
}
