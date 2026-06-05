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
import { mapAssignmentRuleItemPayload } from "@/feature/serviceDesk/assignmentRule/mapper";
import { updateAssignmentRuleSchema } from "@/feature/serviceDesk/assignmentRule/request.schema";
import {
  toAssignmentRuleWritePayload,
  UpdateAssignmentRuleInput,
} from "@/feature/serviceDesk/assignmentRule/write";
import {
  localDeleteAssignmentRule,
  localGetAssignmentRule,
  localUpdateAssignmentRule,
} from "@/server/serviceDesk/settings/assignmentRule/localDemo";

export async function GET(request: NextRequest, context: IdRouteContext) {
  const { id } = context.params;
  const token = await getAuthToken(request);
  const isRemote = token?.dataScope === "REMOTE";
  const isInternal = token?.userScope === "INTERNAL";

  if (!isRemote) {
    try {
      const assignmentRule = localGetAssignmentRule({
        isInternal,
        id,
      });

      if (!assignmentRule) {
        return NextResponse.json(
          { message: tServiceDeskApi("api.common.notFound") },
          { status: 404 },
        );
      }

      return NextResponse.json(assignmentRule);
    } catch (error) {
      return toApiErrorResponse(error, {
        fallbackMessage: tServiceDeskApi("api.assignmentRules.fetch"),
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
    path: `/service-desk/assignment-rules/${id}`,
    query: proxyQuery,
    errorMessage: tServiceDeskApi("api.assignmentRules.fetch"),
    mapData: mapAssignmentRuleItemPayload,
  });
}

export async function PUT(request: NextRequest, context: IdRouteContext) {
  const { id } = context.params;
  const isRemote = await isRemoteRequest(request);
  const parsedBody = updateAssignmentRuleSchema.safeParse(
    (await request.json()) as UpdateAssignmentRuleInput,
  );

  if (!parsedBody.success) {
    return NextResponse.json(
      {
        message: tServiceDeskApi(
          "api.assignmentRules.localDemo.invalidPayload",
        ),
      },
      { status: 400 },
    );
  }

  const body = parsedBody.data;

  if (!isRemote) {
    try {
      const isInternal = await isInternalUser(request);
      return NextResponse.json(
        localUpdateAssignmentRule({
          isInternal,
          id,
          input: {
            ...body,
            id,
          },
        }),
      );
    } catch (error) {
      return toApiErrorResponse(error, {
        fallbackMessage: tServiceDeskApi("api.assignmentRules.update"),
      });
    }
  }

  return portalApiJson(request, {
    method: "PUT",
    path: `/service-desk/assignment-rules/${id}`,
    body: toAssignmentRuleWritePayload(body),
    errorMessage: tServiceDeskApi("api.assignmentRules.update"),
    mapData: mapAssignmentRuleItemPayload,
  });
}

export async function DELETE(request: NextRequest, context: IdRouteContext) {
  const { id } = context.params;
  const isRemote = await isRemoteRequest(request);

  if (!isRemote) {
    try {
      const isInternal = await isInternalUser(request);
      return localDeleteAssignmentRule({
        isInternal,
        id,
      });
    } catch (error) {
      return toApiErrorResponse(error, {
        fallbackMessage: tServiceDeskApi("api.assignmentRules.delete"),
      });
    }
  }

  return portalApiJson(request, {
    method: "DELETE",
    path: `/service-desk/assignment-rules/${id}`,
    errorMessage: tServiceDeskApi("api.assignmentRules.delete"),
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
