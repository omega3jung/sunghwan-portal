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
  clientApprovalStepSettingsMock,
  internalApprovalStepSettingsMock,
} from "@/app/_mocks/domain/serviceDesk/approvalSteps";
import { isInternalUser, isRemoteRequest, proxyJson } from "@/app/api/_helpers";
import { tServiceDesk } from "@/app/api/service-desk/messages";

import { filterItemsByQuery } from "../../_helpers/filter";

export async function GET(request: NextRequest) {
  const isRemote = await isRemoteRequest(request);

  // demo mode
  if (!isRemote) {
    const isInternal = await isInternalUser(request);
    const allItems = camelCategoryApprovalSettingMapper(
      isInternal
        ? internalApprovalStepSettingsMock
        : clientApprovalStepSettingsMock,
    );
    const items = filterItemsByQuery(request.nextUrl.searchParams, allItems);

    return NextResponse.json({
      items,
      total: items.length,
    });
  }

  // real backend
  return proxyJson(request, {
    path: "/service-desk/approval-steps",
    query: request.nextUrl.searchParams,
    errorMessage: tServiceDesk("api.approvalSteps.fetchList"),
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
    errorMessage: tServiceDesk("api.approvalSteps.create"),
    mapData: mapApprovalStepItemPayload,
  });
}
