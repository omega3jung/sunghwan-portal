// app/api/it-service-desk/category/route.ts
import { NextRequest, NextResponse } from "next/server";

import {
  internalCategorySettingsMock,
  tenantCategorySettingsMock,
} from "@/app/_mocks/pages/it-service-desk/categories";
import { isInternalUser, isRemoteRequest } from "@/app/api/_helpers";
import { DbParams } from "@/feature/query/types";
import { camelClientCategoryTreeMapper } from "@/lib/mappers/itServiceDesk/category";
import { Preference } from "@/types";

export async function GET(request: NextRequest) {
  const isRemote = await isRemoteRequest(request);

  // demo mode
  if (!isRemote) {
    // Return mock categories of it service deck.

    const isInternal = await isInternalUser(request);

    // internal demo.
    if (isInternal) {
      const internalCategories = camelClientCategoryTreeMapper(
        internalCategorySettingsMock,
      );

      return NextResponse.json({
        items: internalCategories,
        total: internalCategories.length,
      });
    }

    const tenantCategories = camelClientCategoryTreeMapper(
      tenantCategorySettingsMock,
    );

    // tenant demo.
    return NextResponse.json({
      items: tenantCategories,
      total: tenantCategories.length,
    });
  }

  // real backend
  const params = Object.fromEntries(request.nextUrl.searchParams) as DbParams;

  const query = new URLSearchParams(params as any).toString();

  const res = await fetch(
    `${process.env.API_BASE_URL}/it-service-desk/category?${query}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer TOKEN`,
      },
      cache: "no-store",
    },
  );

  if (!res.ok) {
    return NextResponse.json(
      { message: "Failed to fetch category" },
      { status: res.status },
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

  const res = await fetch(
    `${process.env.API_BASE_URL}/it-service-desk/category`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer TOKEN`,
      },
      body: JSON.stringify(body),
    },
  );

  const data = await res.json();
  return NextResponse.json(data);
}

export async function PUT(request: NextRequest) {
  const isRemote = await isRemoteRequest(request);

  const body = (await request.json()) as Preference;

  // demo mode
  if (!isRemote) {
    return NextResponse.json(body, { status: 200 }); // PUT is 200.
  }

  // real backend
  const res = await fetch(
    `${process.env.API_BASE_URL}/it-service-desk/category`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer TOKEN`,
      },
      body: JSON.stringify(body),
    },
  );

  const data = await res.json();
  return NextResponse.json(data);
}

export async function DELETE(request: NextRequest) {
  const isRemote = await isRemoteRequest(request);

  const body = (await request.json()) as Preference;

  // demo mode

  if (!isRemote) {
    return NextResponse.json(null, { status: 204 }); // DELETE is 204.
  }

  // real backend
  const res = await fetch(
    `${process.env.API_BASE_URL}/it-service-desk/category`,
    {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );

  if (res.status !== 204) {
    await res.json();
  }

  return NextResponse.json(null, { status: 204 });
}
