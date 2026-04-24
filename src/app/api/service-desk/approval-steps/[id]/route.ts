import { NextRequest, NextResponse } from "next/server";

import {
  mapApprovalStepItemPayload,
} from "@/api/serviceDesk/approvalStep/mapper";
import {
  toApprovalStepWritePayload,
  UpdateApprovalStepInput,
} from "@/api/serviceDesk/approvalStep/write";
import {
  isInternalUser,
  isRemoteRequest,
  proxyJson,
  toApiErrorResponse,
} from "@/app/api/_helpers";
import { IdRouteContext } from "@/app/api/_helpers/types";
import { tServiceDeskApi } from "@/app/api/service-desk/_shared/messages";
import { updateApprovalStepSchema } from "@/feature/serviceDesk/approvalStep/request.schema";

import {
  localGetApprovalStep,
  localSoftDeleteApprovalStep,
  localUpdateApprovalStep,
} from "../localDemo";

export async function GET(request: NextRequest, context: IdRouteContext) {
  const { id } = context.params;
  const isRemote = await isRemoteRequest(request);

  if (!isRemote) {
    try {
      const isInternal = await isInternalUser(request);
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

  return proxyJson(request, {
    path: `/service-desk/approval-steps/${id}`,
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
      { message: tServiceDeskApi("api.approvalSteps.localDemo.invalidPayload") },
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

  return proxyJson(request, {
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
      return localSoftDeleteApprovalStep({
        isInternal,
        id,
      });
    } catch (error) {
      return toApiErrorResponse(error, {
        fallbackMessage: tServiceDeskApi("api.approvalSteps.delete"),
      });
    }
  }

  return proxyJson(request, {
    method: "DELETE",
    path: `/service-desk/approval-steps/${id}`,
    errorMessage: tServiceDeskApi("api.approvalSteps.delete"),
  });
}
