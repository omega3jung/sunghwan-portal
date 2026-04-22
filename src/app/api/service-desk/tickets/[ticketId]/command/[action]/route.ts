import { NextRequest, NextResponse } from "next/server";

import { mapTicketActionPayload } from "@/api/serviceDesk/ticket/action";
import {
  getCurrentEmployeeId,
  getUserRole,
  isInternalUser,
  isRemoteRequest,
  proxyJson,
} from "@/app/api/_helpers";
import { RouteContext } from "@/app/api/_helpers/types";
import { tServiceDesk } from "@/app/api/service-desk/messages";
import { TicketActionFormValues } from "@/feature/serviceDesk/ticket/action/forms";

import { localPost } from "./localDemo";
import { ACTION_PATH_BY_TYPE, TicketActionApiType } from "./types";

type TicketActionRouteContext = RouteContext<{
  ticketId: string;
  action: TicketActionApiType;
}>;

const validateMergeRequest = (
  ticketId: string,
  action: TicketActionApiType,
  content: TicketActionFormValues,
) => {
  if (action !== "merge") {
    return null;
  }

  const targetTicketId = content.targetTicketId?.trim();

  if (!targetTicketId) {
    return NextResponse.json(
      { message: tServiceDesk("api.ticketCommand.mergeTargetRequired") },
      { status: 400 },
    );
  }

  if (targetTicketId === ticketId) {
    return NextResponse.json(
      { message: tServiceDesk("api.ticketCommand.mergeSameTicket") },
      { status: 400 },
    );
  }

  return null;
};

export async function POST(
  request: NextRequest,
  context: TicketActionRouteContext,
) {
  const { ticketId, action } = context.params;
  const isRemote = await isRemoteRequest(request);
  const content = (await request.json()) as TicketActionFormValues;
  const role = await getUserRole(request);

  const mergeValidationResponse = validateMergeRequest(
    ticketId,
    action,
    content,
  );

  if (mergeValidationResponse) {
    return mergeValidationResponse;
  }

  if (!isRemote) {
    const employeeId = await getCurrentEmployeeId(request);

    if (employeeId === null) {
      return NextResponse.json(
        { message: tServiceDesk("api.ticketCommand.employeeUnavailable") },
        { status: 401 },
      );
    }

    const isInternal = await isInternalUser(request);

    if (ACTION_PATH_BY_TYPE[content.actionType] !== action) {
      return NextResponse.json(
        { message: tServiceDesk("api.ticketCommand.actionMismatch") },
        { status: 400 },
      );
    }

    return localPost({
      ticketId,
      employeeId: employeeId.toString(),
      action,
      isAdmin: role === "ADMIN",
      content,
      isInternal,
    });
  }

  return proxyJson(request, {
    method: "POST",
    path: `/service-desk/tickets/${ticketId}/command/${action}`,
    body: content,
    errorMessage: tServiceDesk("api.ticketCommand.execute"),
    mapData: mapTicketActionPayload,
  });
}
