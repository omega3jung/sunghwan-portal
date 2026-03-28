import { NextRequest, NextResponse } from "next/server";

import {
  camelCategoryApprovalSettingMapper,
  mapApprovalStepItemPayload,
} from "@/api/serviceDesk/approvalStep/mapper";
import {
  toApprovalStepMockResource,
  toApprovalStepWritePayload,
  UpdateApprovalStepInput,
} from "@/api/serviceDesk/approvalStep/write";
import {
  internalApprovalStepSettingsMock,
  tenantApprovalStepSettingsMock,
} from "@/app/_mocks/domain/serviceDesk/approvalSteps";
import { isInternalUser, isRemoteRequest, proxyJson } from "@/app/api/_helpers";
import { IdRouteContext } from "@/app/api/_helpers/types";

export async function GET(request: NextRequest, context: IdRouteContext) {
  const { id } = context.params;
  const isRemote = await isRemoteRequest(request);

  if (!isRemote) {
    const isInternal = await isInternalUser(request);
    const approvalStep = camelCategoryApprovalSettingMapper(
      isInternal
        ? internalApprovalStepSettingsMock
        : tenantApprovalStepSettingsMock,
    )
      .flatMap((category) => category.approvalSteps)
      .find((item) => item.id === id);

    if (!approvalStep) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json(approvalStep);
  }

  return proxyJson(request, {
    path: `/service-desk/approval-steps/${id}`,
    errorMessage: "Failed to fetch approval step",
    mapData: mapApprovalStepItemPayload,
  });
}

export async function PUT(request: NextRequest, context: IdRouteContext) {
  const { id } = context.params;
  const isRemote = await isRemoteRequest(request);
  const body = (await request.json()) as UpdateApprovalStepInput;

  if (!isRemote) {
    return NextResponse.json(toApprovalStepMockResource(body, id), {
      status: 200,
    });
  }

  return proxyJson(request, {
    method: "PUT",
    path: `/service-desk/approval-steps/${id}`,
    body: toApprovalStepWritePayload({ ...body, id }),
    errorMessage: "Failed to update approval step",
    mapData: mapApprovalStepItemPayload,
  });
}

export async function DELETE(request: NextRequest, context: IdRouteContext) {
  const { id } = context.params;
  const isRemote = await isRemoteRequest(request);

  if (!isRemote) {
    return new NextResponse(null, { status: 204 });
  }

  return proxyJson(request, {
    method: "DELETE",
    path: `/service-desk/approval-steps/${id}`,
    errorMessage: "Failed to delete approval step",
  });
}
