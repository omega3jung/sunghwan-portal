import { NextRequest, NextResponse } from "next/server";

import {
  mapAssignmentRuleItemPayload,
  mapAssignmentRuleListPayload,
  mapAssignmentRuleTreePayload,
} from "@/api/serviceDesk/assignmentRule/mapper";
import {
  CreateAssignmentRuleInput,
  toAssignmentRuleWritePayload,
} from "@/api/serviceDesk/assignmentRule/write";
import {
  isInternalUser,
  isRemoteRequest,
  proxyJson,
  toApiErrorResponse,
} from "@/app/api/_helpers";
import { tServiceDeskApi } from "@/app/api/service-desk/_shared/messages";
import {
  createAssignmentRuleSchema,
  saveAssignmentRuleTreeSchema,
} from "@/feature/serviceDesk/assignmentRule/request.schema";
import type { SaveServiceDeskAssignmentRuleTreePayload } from "@/feature/serviceDesk/assignmentRule/types";

import {
  localCreateAssignmentRule,
  localListAssignmentRules,
  localSaveAssignmentRuleTree,
} from "./localDemo";

export async function GET(request: NextRequest) {
  const isRemote = await isRemoteRequest(request);

  if (!isRemote) {
    try {
      const isInternal = await isInternalUser(request);
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

  return proxyJson(request, {
    path: "/service-desk/assignment-rules",
    query: request.nextUrl.searchParams,
    errorMessage: tServiceDeskApi("api.assignmentRules.fetchList"),
    mapData: mapAssignmentRuleListPayload,
  });
}

export async function POST(request: NextRequest) {
  const isRemote = await isRemoteRequest(request);
  const parsedBody = createAssignmentRuleSchema.safeParse(
    (await request.json()) as CreateAssignmentRuleInput,
  );

  if (!parsedBody.success) {
    return NextResponse.json(
      { message: tServiceDeskApi("api.assignmentRules.localDemo.invalidPayload") },
      { status: 400 },
    );
  }

  const body = parsedBody.data;

  if (!isRemote) {
    try {
      const isInternal = await isInternalUser(request);
      return NextResponse.json(
        localCreateAssignmentRule({
          isInternal,
          input: body,
        }),
        { status: 201 },
      );
    } catch (error) {
      return toApiErrorResponse(error, {
        fallbackMessage: tServiceDeskApi("api.assignmentRules.create"),
      });
    }
  }

  return proxyJson(request, {
    method: "POST",
    path: "/service-desk/assignment-rules",
    body: toAssignmentRuleWritePayload(body),
    errorMessage: tServiceDeskApi("api.assignmentRules.create"),
    mapData: mapAssignmentRuleItemPayload,
  });
}

export async function PUT(request: NextRequest) {
  const isRemote = await isRemoteRequest(request);
  const parsedBody = saveAssignmentRuleTreeSchema.safeParse(
    (await request.json()) as SaveServiceDeskAssignmentRuleTreePayload,
  );

  if (!parsedBody.success) {
    return NextResponse.json(
      { message: tServiceDeskApi("api.assignmentRules.localDemo.invalidPayload") },
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

  return proxyJson(request, {
    method: "PUT",
    path: "/service-desk/assignment-rules",
    body,
    errorMessage: tServiceDeskApi("api.assignmentRules.save"),
    mapData: mapAssignmentRuleTreePayload,
  });
}
