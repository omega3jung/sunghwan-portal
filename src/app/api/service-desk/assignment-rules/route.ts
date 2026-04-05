import { NextRequest, NextResponse } from "next/server";

import {
  camelAssignmentRuleMapper,
  mapAssignmentRuleItemPayload,
  mapAssignmentRuleListPayload,
} from "@/api/serviceDesk/assignmentRule/mapper";
import {
  CreateAssignmentRuleInput,
  toAssignmentRuleMockResource,
  toAssignmentRuleWritePayload,
} from "@/api/serviceDesk/assignmentRule/write";
import {
  internalAssignmentRuleSettingsMock,
  clientAssignmentRuleSettingsMock,
} from "@/app/_mocks/domain/serviceDesk/assignmentRules";
import { isInternalUser, isRemoteRequest, proxyJson } from "@/app/api/_helpers";

export async function GET(request: NextRequest) {
  const isRemote = await isRemoteRequest(request);

  // demo mode
  if (!isRemote) {
    const isInternal = await isInternalUser(request);
    const items = camelAssignmentRuleMapper(
      isInternal
        ? internalAssignmentRuleSettingsMock
        : clientAssignmentRuleSettingsMock,
    );

    return NextResponse.json({
      items,
      total: items.length,
    });
  }

  // real backend
  return proxyJson(request, {
    path: "/service-desk/assignment-rules",
    query: request.nextUrl.searchParams,
    errorMessage: "Failed to fetch assignment rules",
    mapData: mapAssignmentRuleListPayload,
  });
}

export async function POST(request: NextRequest) {
  const isRemote = await isRemoteRequest(request);
  const body = (await request.json()) as CreateAssignmentRuleInput;

  if (!isRemote) {
    return NextResponse.json(toAssignmentRuleMockResource(body), {
      status: 201,
    });
  }

  return proxyJson(request, {
    method: "POST",
    path: "/service-desk/assignment-rules",
    body: toAssignmentRuleWritePayload(body),
    errorMessage: "Failed to create assignment rule",
    mapData: mapAssignmentRuleItemPayload,
  });
}
