// app/api/user-preference/route.ts
import { NextRequest, NextResponse } from "next/server";

import { isRemoteRequest } from "@/app/api/_helpers";
import { defaultPreference } from "@/domain/user";
import { Preference } from "@/types";

export async function GET(
  req: NextRequest,
  context: { params: { userId: string } }
) {
  const { userId } = context.params;
  const isRemote = await isRemoteRequest(req);

  // local demo mode.
  if (!isRemote) {
    // Return mock user preference.
    return NextResponse.json(defaultPreference);
  }

  // real backend
  const res = await fetch(
    `${process.env.API_BASE_URL}/user/${userId}/preference`,
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

  const body = (await req.json()) as Preference;

  // demo mode
  if (!isRemote) {
    return NextResponse.json(body, { status: 201 }); // POST is 201.
  }

  const res = await fetch(
    `${process.env.API_BASE_URL}/user/${userId}/preference`,
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

  const body = (await req.json()) as Preference;

  // demo mode

  if (!isRemote) {
    return NextResponse.json(body, { status: 200 }); // PUT is 200. (or 204).
  }

  const res = await fetch(
    `${process.env.API_BASE_URL}/user/${userId}/preference`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  const data = await res.json();
  return NextResponse.json(data);
}
