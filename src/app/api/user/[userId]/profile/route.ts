// app/api/user-profile/[userId]/route.ts
import { NextRequest, NextResponse } from "next/server";

import { checkAdminOrSelf, isRemoteRequest } from "@/app/api/_helpers";
import { demoProfiles, tenantProfiles } from "@/domain/user";
import { AppUser } from "@/types";

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
  const auth = await checkAdminOrSelf(req, userId);
  if (!auth.ok) {
    return NextResponse.json(
      { error: auth.status === 401 ? "Unauthorized" : "Forbidden" },
      { status: auth.status }
    );
  }

  const res = await fetch(
    `${process.env.API_BASE_URL}/user/${userId}/profile`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer TOKEN`,
      },
      cache: "no-store",
      body: JSON.stringify(userId),
    }
  );

  if (!res.ok) {
    return NextResponse.json(
      { message: "Failed to fetch user preference" },
      { status: 500 }
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}

export async function POST(
  req: NextRequest,
  context: { params: { userId: string } }
) {
  const { userId } = context.params;
  const isRemote = await isRemoteRequest(req);

  const body = (await req.json()) as AppUser;

  // demo mode
  if (!isRemote) {
    return NextResponse.json(body, { status: 201 }); // POST is 201.
  }

  const res = await fetch(
    `${process.env.API_BASE_URL}/user/${userId}/profile`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  const data = await res.json();
  return NextResponse.json(data);
}

export async function PUT(
  req: NextRequest,
  context: { params: { userId: string } }
) {
  const { userId } = context.params;
  const isRemote = await isRemoteRequest(req);

  const body = (await req.json()) as AppUser;

  // demo mode

  if (!isRemote) {
    return NextResponse.json(body, { status: 200 }); // PUT is 200. (or 204).
  }

  const res = await fetch(
    `${process.env.API_BASE_URL}/user/${userId}/profile`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  const data = await res.json();
  return NextResponse.json(data);
}
