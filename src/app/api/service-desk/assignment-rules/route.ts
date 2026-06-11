import { NextRequest, NextResponse } from "next/server";

import {
  getAuthToken,
  isInternalUser,
  isRemoteRequest,
  toApiErrorResponse,
} from "@/app/api/_helpers";
import { tServiceDeskApi } from "@/app/api/service-desk/_shared/messages";
import {
  mapAssignmentRuleListPayload,
  mapAssignmentRuleTreePayload,
} from "@/feature/serviceDesk/assignmentRule/mapper";
import {
  saveAssignmentRuleTreeSchema,
} from "@/feature/serviceDesk/assignmentRule/request.schema";
import type { SaveServiceDeskAssignmentRuleTreePayload } from "@/feature/serviceDesk/assignmentRule/types";
import {
  localListAssignmentRules,
  localSaveAssignmentRuleTree,
} from "@/server/serviceDesk/settings/assignmentRule/localDemo";

import { portalApiJson } from "../../_helpers/portalApiJson";

export async function GET(request: NextRequest) {
  const token = await getAuthToken(request);
  const isRemote = token?.dataScope === "REMOTE";
  const isInternal = token?.userScope === "INTERNAL";

  if (!isRemote) {
    try {
      return NextResponse.json(
        localListAssignmentRules({
          isInternal,
          searchParams: request.nextUrl.searchParams,
        }),
      );
    } catch (error) {
      return toApiErrorResponse(error, {
        fallbackMessage: tServiceDeskApi("api.assignmentRules.fetchList"),
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
    path: "/service-desk/assignment-rules",
    query: proxyQuery,
    errorMessage: tServiceDeskApi("api.assignmentRules.fetchList"),
    mapData: mapAssignmentRuleListPayload,
  });
}

export async function PUT(request: NextRequest) {
  const isRemote = await isRemoteRequest(request);
  const parsedBody = saveAssignmentRuleTreeSchema.safeParse(
    (await request.json()) as SaveServiceDeskAssignmentRuleTreePayload,
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
        localSaveAssignmentRuleTree({
          isInternal,
          payload: body,
        }),
      );
    } catch (error) {
      return toApiErrorResponse(error, {
        fallbackMessage: tServiceDeskApi("api.assignmentRules.save"),
      });
    }
  }

  return portalApiJson(request, {
    method: "PUT",
    path: "/service-desk/assignment-rules",
    body,
    errorMessage: tServiceDeskApi("api.assignmentRules.save"),
    mapData: mapAssignmentRuleTreePayload,
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
