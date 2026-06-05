import { NextRequest, NextResponse } from "next/server";

import {
  getAuthToken,
  isInternalUser,
  isRemoteRequest,
  toApiErrorResponse,
} from "@/app/api/_helpers";
import { tServiceDeskApi } from "@/app/api/service-desk/_shared/messages";
import {
  mapApprovalSettingsListPayload,
  mapApprovalSettingsTreePayload,
  mapApprovalStepItemPayload,
} from "@/feature/serviceDesk/approvalStep/mapper";
import {
  createApprovalStepSchema,
  saveApprovalStepTreeSchema,
} from "@/feature/serviceDesk/approvalStep/request.schema";
import type { SaveServiceDeskApprovalStepTreePayload } from "@/feature/serviceDesk/approvalStep/types";
import {
  CreateApprovalStepInput,
  toApprovalStepWritePayload,
} from "@/feature/serviceDesk/approvalStep/write";
import {
  localCreateApprovalStep,
  localListApprovalSteps,
  localSaveApprovalStepTree,
} from "@/server/serviceDesk/settings/approvalStep/localDemo";

import { portalApiJson } from "../../_helpers/portalApiJson";

export async function GET(request: NextRequest) {
  const token = await getAuthToken(request);
  const isRemote = token?.dataScope === "REMOTE";
  const isInternal = token?.userScope === "INTERNAL";

  if (!isRemote) {
    try {
      return NextResponse.json(
        localListApprovalSteps({
          isInternal,
          searchParams: request.nextUrl.searchParams,
        }),
      );
    } catch (error) {
      return toApiErrorResponse(error, {
        fallbackMessage: tServiceDeskApi("api.approvalSteps.fetchList"),
      });
    }
  }

  const proxyQuery = new URLSearchParams(request.nextUrl.searchParams);

  if (!proxyQuery.has("isInternal")) {
    proxyQuery.set("isInternal", String(isInternal));
  }

  const defaultTenantId = resolveDefaultTenantId(token);

  if (!proxyQuery.has("tenantId") && !isInternal && defaultTenantId) {
    proxyQuery.set("tenantId", defaultTenantId);
  }

  return portalApiJson(request, {
    path: "/service-desk/approval-steps",
    query: proxyQuery,
    errorMessage: tServiceDeskApi("api.approvalSteps.fetchList"),
    mapData: mapApprovalSettingsListPayload,
  });
}

export async function POST(request: NextRequest) {
  const isRemote = await isRemoteRequest(request);
  const parsedBody = createApprovalStepSchema.safeParse(
    (await request.json()) as CreateApprovalStepInput,
  );

  if (!parsedBody.success) {
    return NextResponse.json(
      {
        message: tServiceDeskApi("api.approvalSteps.localDemo.invalidPayload"),
      },
      { status: 400 },
    );
  }

  const body = parsedBody.data;

  if (!isRemote) {
    try {
      const isInternal = await isInternalUser(request);
      return NextResponse.json(
        localCreateApprovalStep({
          isInternal,
          input: body,
        }),
        { status: 201 },
      );
    } catch (error) {
      return toApiErrorResponse(error, {
        fallbackMessage: tServiceDeskApi("api.approvalSteps.create"),
      });
    }
  }

  return portalApiJson(request, {
    method: "POST",
    path: "/service-desk/approval-steps",
    body: toApprovalStepWritePayload(body),
    errorMessage: tServiceDeskApi("api.approvalSteps.create"),
    mapData: mapApprovalStepItemPayload,
  });
}

export async function PUT(request: NextRequest) {
  const isRemote = await isRemoteRequest(request);
  const parsedBody = saveApprovalStepTreeSchema.safeParse(
    (await request.json()) as SaveServiceDeskApprovalStepTreePayload,
  );

  if (!parsedBody.success) {
    return NextResponse.json(
      {
        message: tServiceDeskApi("api.approvalSteps.localDemo.invalidPayload"),
      },
      { status: 400 },
    );
  }

  const body = parsedBody.data;

  if (!isRemote) {
    try {
      const isInternal = await isInternalUser(request);
      return NextResponse.json(
        localSaveApprovalStepTree({
          isInternal,
          payload: body,
        }),
      );
    } catch (error) {
      return toApiErrorResponse(error, {
        fallbackMessage: tServiceDeskApi("api.approvalSteps.save"),
      });
    }
  }

  return portalApiJson(request, {
    method: "PUT",
    path: "/service-desk/approval-steps",
    body,
    errorMessage: tServiceDeskApi("api.approvalSteps.save"),
    mapData: mapApprovalSettingsTreePayload,
  });
}

function resolveDefaultTenantId(
  token: Awaited<ReturnType<typeof getAuthToken>>,
) {
  if (typeof token?.companyId === "number") {
    return String(token.companyId);
  }

  return null;
}
