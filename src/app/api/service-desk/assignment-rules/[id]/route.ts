import { NextRequest, NextResponse } from "next/server";

import {
  camelAssignmentRuleMapper,
  mapAssignmentRuleItemPayload,
} from "@/api/serviceDesk/assignmentRule/mapper";
import {
  toAssignmentRuleMockResource,
  toAssignmentRuleWritePayload,
  UpdateAssignmentRuleInput,
} from "@/api/serviceDesk/assignmentRule/write";
import {
  internalAssignmentRuleSettingsMock,
  clientAssignmentRuleSettingsMock,
} from "@/app/_mocks/domain/serviceDesk/assignmentRules";
import { isInternalUser, isRemoteRequest, proxyJson } from "@/app/api/_helpers";
import { IdRouteContext } from "@/app/api/_helpers/types";

export async function GET(request: NextRequest, context: IdRouteContext) {
  const { id } = context.params;
  const isRemote = await isRemoteRequest(request);

  if (!isRemote) {
    const isInternal = await isInternalUser(request);
    const assignmentRule = camelAssignmentRuleMapper(
      isInternal
        ? internalAssignmentRuleSettingsMock
        : clientAssignmentRuleSettingsMock,
    ).find((item) => item.categoryId === id);

    if (!assignmentRule) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json(assignmentRule);
  }

  return proxyJson(request, {
    path: `/service-desk/assignment-rules/${id}`,
    errorMessage: "Failed to fetch assignment rule",
    mapData: mapAssignmentRuleItemPayload,
  });
}

export async function PUT(request: NextRequest, context: IdRouteContext) {
  const { id } = context.params;
  const isRemote = await isRemoteRequest(request);
  const body = (await request.json()) as UpdateAssignmentRuleInput;

  if (!isRemote) {
    return NextResponse.json(toAssignmentRuleMockResource(body), {
      status: 200,
    });
  }

  return proxyJson(request, {
    method: "PUT",
    path: `/service-desk/assignment-rules/${id}`,
    body: toAssignmentRuleWritePayload(body),
    errorMessage: "Failed to update assignment rule",
    mapData: mapAssignmentRuleItemPayload,
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
    path: `/service-desk/assignment-rules/${id}`,
    errorMessage: "Failed to delete assignment rule",
  });
}
