import { NextRequest, NextResponse } from "next/server";

import {
  getCurrentEmployeeUserName,
  isInternalUser,
  isRemoteRequest,
  proxyJson,
} from "@/app/api/_helpers";
import { TicketIdRouteContext } from "@/app/api/_helpers/types";
import {
  ServiceDeskApiError,
  toCurrentUsernameProxyHeaders,
  tServiceDeskApi,
} from "@/app/api/service-desk/_shared";
import { mapTicketDetailPayload } from "@/feature/serviceDesk/ticket/api/mapper";
import {
  startTicketWorkLocal,
  toLocalStartWorkResponse,
} from "@/server/serviceDesk/ticket/command/localStartWork";

export async function POST(
  request: NextRequest,
  context: TicketIdRouteContext,
) {
  const { ticketId } = context.params;
  const isRemote = await isRemoteRequest(request);
  const currentUserName = await getCurrentEmployeeUserName(request);

  if (currentUserName === null) {
    return NextResponse.json(
      { message: tServiceDeskApi("api.ticketCommand.employeeUnavailable") },
      { status: 401 },
    );
  }

  if (!isRemote) {
    try {
      const isInternal = await isInternalUser(request);
      const updatedTicket = startTicketWorkLocal({
        ticketId,
        employeeUserName: currentUserName,
        isInternal,
      });

      return NextResponse.json(
        toLocalStartWorkResponse(updatedTicket, currentUserName),
      );
    } catch (error) {
      const message =
        error instanceof ServiceDeskApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : tServiceDeskApi("api.ticketCommand.startWork");
      const status = error instanceof ServiceDeskApiError ? error.status : 500;

      return NextResponse.json({ message }, { status });
    }
  }

  return proxyJson(request, {
    method: "POST",
    path: `/service-desk/tickets/${ticketId}/command/start-work`,
    headers: toCurrentUsernameProxyHeaders(currentUserName),
    body: {},
    errorMessage: tServiceDeskApi("api.ticketCommand.startWork"),
    mapData: mapTicketDetailPayload,
  });
}
