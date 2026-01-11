// app/api/user-preference/route.ts
import { NextRequest, NextResponse } from "next/server";

import { getEffectiveUserId, isRemoteRequest } from "@/app/api/_helpers";
import { defaultPreference } from "@/domain/user";
import fetcher from "@/services/fetcher";
import { Preference } from "@/types";

export async function GET(req: NextRequest) {
  const isRemote = await isRemoteRequest(req);

  const userId = await getEffectiveUserId(req);

  // local demo mode.
  if (!isRemote || !userId) {
    // Return mock user preference.
    return NextResponse.json(defaultPreference);
  }

  // real backend
  try {
    const res = await fetcher.db.get(`/user-profile/${userId}`);
    return NextResponse.json(res.data);
  } catch {
    return NextResponse.json(
      { message: "Failed to fetch user preference" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const isRemote = await isRemoteRequest(req);

  const body = (await req.json()) as Preference;

  // demo mode
  if (!isRemote) {
    return NextResponse.json(body, { status: 201 }); // POST is 201.
  }

  const res = await fetch(`${process.env.API_BASE_URL}/user-preference`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest) {
  const isRemote = await isRemoteRequest(req);

  const body = (await req.json()) as Preference;

  // demo mode

  if (!isRemote) {
    return NextResponse.json(body, { status: 200 }); // PUT is 200. (or 204).
  }

  const res = await fetch(`${process.env.API_BASE_URL}/user-preference`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return NextResponse.json(data);
}
