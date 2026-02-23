// src/app/api/(organization)/job-fields/route.ts
import { NextRequest, NextResponse } from "next/server";

import { internalApprovalStepSettingsMock } from "@/app/_mocks/pages/it-service-desk/approvalSteps";
import { isInternalUser, isRemoteRequest } from "@/app/api/_helpers";
import { camelCategoryApprovalSettingMapper } from "@/lib/mappers";
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
