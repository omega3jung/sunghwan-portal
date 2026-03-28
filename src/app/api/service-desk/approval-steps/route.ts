import { NextRequest, NextResponse } from "next/server";

import {
  camelCategoryApprovalSettingMapper,
  mapApprovalSettingsListPayload,
  mapApprovalStepItemPayload,
} from "@/api/serviceDesk/approvalStep/mapper";
import {
  CreateApprovalStepInput,
  toApprovalStepMockResource,
  toApprovalStepWritePayload,
} from "@/api/serviceDesk/approvalStep/write";
import {
  internalApprovalStepSettingsMock,
  tenantApprovalStepSettingsMock,
} from "@/app/_mocks/domain/serviceDesk/approvalSteps";
import { isInternalUser, isRemoteRequest, proxyJson } from "@/app/api/_helpers";

export async function GET(request: NextRequest) {
  const isRemote = await isRemoteRequest(request);

  if (!isRemote) {
    const isInternal = await isInternalUser(request);
    const items = camelCategoryApprovalSettingMapper(
      isInternal
        ? internalApprovalStepSettingsMock
        : tenantApprovalStepSettingsMock,
    );

    return NextResponse.json({
      items,
      total: items.length,
    });
  }

  return proxyJson(request, {
    path: "/service-desk/approval-steps",
    query: request.nextUrl.searchParams,
    errorMessage: "Failed to fetch approval steps",
    mapData: mapApprovalSettingsListPayload,
  });
}

export async function POST(request: NextRequest) {
  const isRemote = await isRemoteRequest(request);
  const body = (await request.json()) as CreateApprovalStepInput;

  if (!isRemote) {
    return NextResponse.json(toApprovalStepMockResource(body), { status: 201 });
  }

  return proxyJson(request, {
    method: "POST",
    path: "/service-desk/approval-steps",
    body: toApprovalStepWritePayload(body),
    errorMessage: "Failed to create approval step",
    mapData: mapApprovalStepItemPayload,
  });
}
