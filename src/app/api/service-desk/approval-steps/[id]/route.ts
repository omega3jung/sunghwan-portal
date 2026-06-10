import { NextRequest, NextResponse } from "next/server";

import {
  getAuthToken,
  isInternalUser,
  isRemoteRequest,
  toApiErrorResponse,
} from "@/app/api/_helpers";
import { portalApiJson } from "@/app/api/_helpers/portalApiJson";
import { IdRouteContext } from "@/app/api/_helpers/types";
import { tServiceDeskApi } from "@/app/api/service-desk/_shared/messages";
import { mapApprovalStepItemPayload } from "@/feature/serviceDesk/approvalStep/mapper";
import { updateApprovalStepSchema } from "@/feature/serviceDesk/approvalStep/request.schema";
import {
  toApprovalStepWritePayload,
  UpdateApprovalStepInput,
} from "@/feature/serviceDesk/approvalStep/write";
import {
  localGetApprovalStep,
  localDeleteApprovalStep,
  localUpdateApprovalStep,
} from "@/server/serviceDesk/settings/approvalStep/localDemo";

export async function GET(request: NextRequest, context: IdRouteContext) {
  const { id } = context.params;
  const token = await getAuthToken(request);
  const isRemote = token?.dataScope === "REMOTE";
  const isInternal = token?.userScope === "INTERNAL";

  if (!isRemote) {
    try {
      const approvalStep = localGetApprovalStep({
        isInternal,
        id,
      });

      if (!approvalStep) {
        return NextResponse.json(
          { message: tServiceDeskApi("api.common.notFound") },
          { status: 404 },
        );
      }

      return NextResponse.json(approvalStep);
    } catch (error) {
      return toApiErrorResponse(error, {
        fallbackMessage: tServiceDeskApi("api.approvalSteps.fetch"),
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
    path: `/service-desk/approval-steps/${id}`,
    query: proxyQuery,
    errorMessage: tServiceDeskApi("api.approvalSteps.fetch"),
    mapData: mapApprovalStepItemPayload,
  });
}

export async function PUT(request: NextRequest, context: IdRouteContext) {
  const { id } = context.params;
  const isRemote = await isRemoteRequest(request);
  const parsedBody = updateApprovalStepSchema.safeParse(
    (await request.json()) as UpdateApprovalStepInput,
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
        localUpdateApprovalStep({
          isInternal,
          id,
          input: {
            ...body,
            id,
          },
        }),
        { status: 200 },
      );
    } catch (error) {
      return toApiErrorResponse(error, {
        fallbackMessage: tServiceDeskApi("api.approvalSteps.update"),
      });
    }
  }

  return portalApiJson(request, {
    method: "PUT",
    path: `/service-desk/approval-steps/${id}`,
    body: toApprovalStepWritePayload({ ...body, id }),
    errorMessage: tServiceDeskApi("api.approvalSteps.update"),
    mapData: mapApprovalStepItemPayload,
  });
}

export async function DELETE(request: NextRequest, context: IdRouteContext) {
  const { id } = context.params;
  const isRemote = await isRemoteRequest(request);

  if (!isRemote) {
    try {
      const isInternal = await isInternalUser(request);
      return localDeleteApprovalStep({
        isInternal,
        id,
      });
    } catch (error) {
      return toApiErrorResponse(error, {
        fallbackMessage: tServiceDeskApi("api.approvalSteps.delete"),
      });
    }
  }

  return portalApiJson(request, {
    method: "DELETE",
    path: `/service-desk/approval-steps/${id}`,
    errorMessage: tServiceDeskApi("api.approvalSteps.delete"),
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
