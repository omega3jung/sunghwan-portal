import { NextRequest, NextResponse } from "next/server";

import { mapAssignmentRuleItemPayload } from "@/api/serviceDesk/assignmentRule/mapper";
import {
  toAssignmentRuleWritePayload,
  UpdateAssignmentRuleInput,
} from "@/api/serviceDesk/assignmentRule/write";
import {
  isInternalUser,
  isRemoteRequest,
  proxyJson,
  toApiErrorResponse,
} from "@/app/api/_helpers";
import { IdRouteContext } from "@/app/api/_helpers/types";
import { tServiceDeskApi } from "@/app/api/service-desk/_shared/messages";
import { updateAssignmentRuleSchema } from "@/feature/serviceDesk/assignmentRule/request.schema";

import {
  localDeleteAssignmentRule,
  localGetAssignmentRule,
  localUpdateAssignmentRule,
} from "../localDemo";

export async function GET(request: NextRequest, context: IdRouteContext) {
  const { id } = context.params;
  const isRemote = await isRemoteRequest(request);

  if (!isRemote) {
    try {
      const isInternal = await isInternalUser(request);
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

  return proxyJson(request, {
    path: `/service-desk/assignment-rules/${id}`,
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
      { message: tServiceDeskApi("api.assignmentRules.localDemo.invalidPayload") },
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

  return proxyJson(request, {
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

  return proxyJson(request, {
    method: "DELETE",
    path: `/service-desk/assignment-rules/${id}`,
    errorMessage: tServiceDeskApi("api.assignmentRules.delete"),
  });
}
