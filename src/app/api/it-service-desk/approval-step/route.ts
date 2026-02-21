// app/api/user-preference/route.ts
import { NextRequest, NextResponse } from "next/server";

import { internalApprovalStepSettingsMock } from "@/app/_mocks/pages/it-service-desk/approvalSteps";
import { isInternalUser, isRemoteRequest } from "@/app/api/_helpers";
import { Preference } from "@/domain/config";
import { camelCategoryApprovalSettingMapper } from "@/lib/mappers";
import fetcher from "@/services/fetcher";
import { DbParams } from "@/shared/types/api";

export async function GET(request: NextRequest) {
  const isRemote = await isRemoteRequest(request);

  // demo mode
  if (!isRemote) {
    // Return mock categories of it service deck.

    const isInternal = await isInternalUser(request);

    // internal demo.
    if (isInternal) {
      const internalCategories = camelCategoryApprovalSettingMapper(
        internalApprovalStepSettingsMock,
      );

      return NextResponse.json({
        items: internalCategories,
        total: internalCategories.length,
      });
    }

    const tenantCategories = camelCategoryApprovalSettingMapper(
      internalApprovalStepSettingsMock,
    );

    // tenant demo.
    return NextResponse.json({
      items: tenantCategories,
      total: tenantCategories.length,
    });
  }

  // real backend
  const params = Object.fromEntries(request.nextUrl.searchParams) as DbParams;

  const res = await fetch(
    `${process.env.API_BASE_URL}/it-service-desk/approval-step`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer TOKEN`,
      },
      cache: "no-store",
      body: JSON.stringify(params),
    },
  );

  if (!res.ok) {
    return NextResponse.json(
      { message: "Failed to fetch approval step" },
      { status: 500 },
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

  // real backend
  const params = Object.fromEntries(request.nextUrl.searchParams) as DbParams;

  const res = await fetch(
    `${process.env.API_BASE_URL}/it-service-desk/approval-step`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    },
  );

  if (!res.ok) {
    return NextResponse.json(
      { message: "Failed to fetch approval step" },
      { status: 500 },
    );
  }

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
  const params = Object.fromEntries(request.nextUrl.searchParams) as DbParams;

  try {
    const res = await fetcher.api.put("/it-service-desk/category", { params });

    return NextResponse.json(res.data);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch user preference" },
      { status: 500 },
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
      { status: 500 },
    );
  }
}
