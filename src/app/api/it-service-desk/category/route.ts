// app/api/user-preference/route.ts
import { NextRequest, NextResponse } from "next/server";

import { createCategorySettingsMock } from "@/app/_mocks/pages/settings/it-service-desk-settings/category";
import { isRemoteRequest } from "@/app/api/_helpers";
import { DbParams } from "@/feature/query/types";
import fetcher from "@/services/fetcher";
import { Preference } from "@/types";

export async function GET(request: NextRequest) {
  const isRemote = await isRemoteRequest(request);

  // demo mode
  if (!isRemote) {
    // Return mock user preference.
    return NextResponse.json(createCategorySettingsMock);
  }

  // real backend
  const params = Object.fromEntries(request.nextUrl.searchParams) as DbParams;

  try {
    const res = await fetcher.api.get("/it-service-desk/category", { params });

    return NextResponse.json(res.data);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch user preference" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const isRemote = await isRemoteRequest(request);

  const body = (await request.json()) as Preference;

  // demo mode
  if (!isRemote) {
    return NextResponse.json(body, { status: 201 }); // POST is 201.
  }

  // real backend
  const params = Object.fromEntries(request.nextUrl.searchParams) as DbParams;

  try {
    const res = await fetcher.api.post("/it-service-desk/category", { params });

    return NextResponse.json(res.data);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch user preference" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const isRemote = await isRemoteRequest(request);

  const body = (await request.json()) as Preference;

  // demo mode

  if (!isRemote) {
    return NextResponse.json(body, { status: 200 }); // PUT is 200.
  }

  // real backend
  const params = Object.fromEntries(request.nextUrl.searchParams) as DbParams;

  try {
    const res = await fetcher.api.put("/it-service-desk/category", { params });

    return NextResponse.json(res.data);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch user preference" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const isRemote = await isRemoteRequest(request);

  // demo mode

  if (!isRemote) {
    return NextResponse.json(null, { status: 204 }); // DELETE is 204.
  }

  // real backend
  const params = Object.fromEntries(request.nextUrl.searchParams) as DbParams;

  try {
    await fetcher.api.put("/it-service-desk/category", { params });

    return NextResponse.json(null);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch user preference" },
      { status: 500 }
    );
  }
}
