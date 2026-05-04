import { NextRequest, NextResponse } from "next/server";

import {
  getCurrentEmployeeUserName,
  getUserRole,
  isInternalUser,
  isRemoteRequest,
  proxyJson,
} from "@/app/api/_helpers";
import { RouteContext } from "@/app/api/_helpers/types";
import { tServiceDeskApi } from "@/app/api/service-desk/_shared/messages";
import { TicketActionFormValues } from "@/feature/serviceDesk/ticketAction";
import { mapTicketActionPayload } from "@/feature/serviceDesk/ticketAction/api";
import { localPost } from "@/server/serviceDesk/ticket/command/localDemo";
import {
  ACTION_PATH_BY_TYPE,
  type TicketActionApiType,
} from "@/server/serviceDesk/ticket/command/types";

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
      { message: tServiceDeskApi("api.ticketCommand.mergeTargetRequired") },
      { status: 400 },
    );
  }

  if (targetTicketId === ticketId) {
    return NextResponse.json(
      { message: tServiceDeskApi("api.ticketCommand.mergeSameTicket") },
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
    const employeeUserName = await getCurrentEmployeeUserName(request);

    if (employeeUserName === null) {
      return NextResponse.json(
        { message: tServiceDeskApi("api.ticketCommand.employeeUnavailable") },
        { status: 401 },
      );
    }

    const isInternal = await isInternalUser(request);

    if (ACTION_PATH_BY_TYPE[content.actionType] !== action) {
      return NextResponse.json(
        { message: tServiceDeskApi("api.ticketCommand.actionMismatch") },
        { status: 400 },
      );
    }

    return localPost({
      ticketId,
      employeeUserName,
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
    errorMessage: tServiceDeskApi("api.ticketCommand.execute"),
    mapData: mapTicketActionPayload,
  });
}
