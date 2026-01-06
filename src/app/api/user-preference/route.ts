// app/api/user-preference/route.ts
import { NextRequest, NextResponse } from "next/server";

import { isRemoteRequest } from "@/app/api/_helpers";
import { defaultPreference } from "@/domain/user";
import { Preference } from "@/types";

export async function GET(request: NextRequest) {
  const isRemote = await isRemoteRequest(request);

  // demo mode
  if (!isRemote) {
    // Return mock user preference.
    return NextResponse.json(defaultPreference);
  }

  // real backend
  const res = await fetch(`${process.env.API_BASE_URL}/user-preference`, {
    headers: {
      Authorization: `Bearer TOKEN`, // 필요 시
    },
    cache: "no-store",
  });

  if (!res.ok) {
    return NextResponse.json(
      { message: "Failed to fetch user preference" },
      { status: 500 }
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const isRemote = await isRemoteRequest(request);

  const body = (await request.json()) as Preference;

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

export async function PUT(request: NextRequest) {
  const isRemote = await isRemoteRequest(request);

  const body = (await request.json()) as Preference;

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
