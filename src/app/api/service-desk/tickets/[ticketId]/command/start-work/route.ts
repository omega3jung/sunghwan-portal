import { NextRequest, NextResponse } from "next/server";

import {
  getCurrentEmployeeUserName,
  isRemoteRequest,
} from "@/app/api/_adapters";
import { portalApiJson } from "@/app/api/_adapters/backend";
import { TicketIdRouteContext } from "@/app/api/_adapters/http";
import { getCurrentLocalTicketAccessContext } from "@/app/api/_adapters/localDemo/auth";
import { localGetTicket } from "@/app/api/_adapters/localDemo/serviceDesk/ticket";
import {
  startTicketWorkLocal,
  toLocalStartWorkResponse,
} from "@/app/api/_adapters/localDemo/serviceDesk/ticket/command";
import {
  ApiError,
  resolveApiErrorMessage,
  toCurrentUsernameProxyHeaders,
} from "@/app/api/_adapters/serviceDesk";
import { mapTicketDetailPayload } from "@/lib/application/contracts/serviceDesk";

export async function POST(
  request: NextRequest,
  context: TicketIdRouteContext,
) {
  const { ticketId } = context.params;
  const isRemote = await isRemoteRequest(request);
  const currentUserName = await getCurrentEmployeeUserName(request);

  if (currentUserName === null) {
    return NextResponse.json(
      { message: resolveApiErrorMessage("serviceDesk.ticketCommand.employeeUnavailable") },
      { status: 401 },
    );
  }

  if (!isRemote) {
    try {
      const access = await getCurrentLocalTicketAccessContext(request);

      if (access === null) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }
      if (!localGetTicket({ access, id: ticketId })) {
        return NextResponse.json(
          { message: resolveApiErrorMessage("serviceDesk.tickets.notFound") },
          { status: 404 },
        );
      }
      const isInternal = access.userScope === "INTERNAL";
      const updatedTicket = startTicketWorkLocal({
        ticketId,
        employeeUserName: currentUserName,
        isInternal,
      });

      return NextResponse.json(
        toLocalStartWorkResponse(updatedTicket, currentUserName, isInternal),
      );
    } catch (error) {
      const message =
        error instanceof ApiError
          ? resolveApiErrorMessage(error.messageKey, error.options)
          : error instanceof Error
            ? error.message
            : resolveApiErrorMessage("serviceDesk.ticketCommand.startWork");
      const status = error instanceof ApiError ? error.status : 500;

      return NextResponse.json({ message }, { status });
    }
  }

  return portalApiJson(request, {
    method: "POST",
    path: `/service-desk/tickets/${ticketId}/command/start-work`,
    headers: toCurrentUsernameProxyHeaders(currentUserName),
    body: {},
    errorMessage: resolveApiErrorMessage("serviceDesk.ticketCommand.startWork"),
    mapData: mapTicketDetailPayload,
  });
}
