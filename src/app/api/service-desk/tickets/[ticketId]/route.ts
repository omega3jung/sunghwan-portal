import { NextRequest, NextResponse } from "next/server";

import {
  getCurrentEmployeeUserName,
  isInternalUser,
  isRemoteRequest,
  toApiErrorResponse,
} from "@/app/api/_helpers";
import { portalApiJson } from "@/app/api/_helpers/portalApiJson";
import { TicketIdRouteContext } from "@/app/api/_helpers/types";
import {
  toCurrentUsernameProxyHeaders,
  tServiceDeskApi,
  withDerivedTicketOwnership,
} from "@/app/api/service-desk/_shared";
import { mapTicketDetailPayload } from "@/feature/serviceDesk/ticket/api";
import { requesterUpdateTicketRequestSchema } from "@/server/data/serviceDesk/ticket";
import {
  localDeleteTicket,
  localGetTicket,
  localRequesterUpdateTicket,
  withLocalTicketWorkerHistory,
} from "@/server/serviceDesk/ticket/localDemo";

export async function GET(request: NextRequest, context: TicketIdRouteContext) {
  const { ticketId } = context.params;
  const isRemote = await isRemoteRequest(request);
  const currentUserName = await getCurrentEmployeeUserName(request);

  if (!isRemote) {
    if (currentUserName === null) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const isInternal = await isInternalUser(request);
    const ticket = localGetTicket({ isInternal, id: ticketId });

    if (!ticket) {
      return NextResponse.json(
        { message: tServiceDeskApi("api.tickets.notFound") },
        { status: 404 },
      );
    }

    return NextResponse.json(
      withLocalTicketWorkerHistory(
        withDerivedTicketOwnership(ticket, currentUserName),
        { isInternal, currentUserName },
      ),
    );
  }

  return portalApiJson(request, {
    path: `/service-desk/tickets/${ticketId}`,
    headers: toCurrentUsernameProxyHeaders(currentUserName),
    errorMessage: tServiceDeskApi("api.tickets.fetch"),
    mapData: mapTicketDetailPayload,
  });
}

export async function PUT(request: NextRequest, context: TicketIdRouteContext) {
  const { ticketId } = context.params;
  const isRemote = await isRemoteRequest(request);
  const currentUserName = await getCurrentEmployeeUserName(request);
  const parsedBody = requesterUpdateTicketRequestSchema.safeParse(
    await request.json(),
  );

  if (!parsedBody.success) {
    return NextResponse.json(
      { message: tServiceDeskApi("api.tickets.localDemo.invalidPayload") },
      { status: 400 },
    );
  }

  const body = parsedBody.data;

  if (!isRemote) {
    try {
      if (currentUserName === null) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }

      const isInternal = await isInternalUser(request);

      const ticket = withDerivedTicketOwnership(
        localRequesterUpdateTicket({
          isInternal,
          ticketId,
          requesterUsername: currentUserName,
          input: body,
        }),
        currentUserName,
      );

      return NextResponse.json(
        withLocalTicketWorkerHistory(ticket, { isInternal, currentUserName }),
        {
          status: 200,
        },
      );
    } catch (error) {
      return toApiErrorResponse(error, {
        fallbackMessage: tServiceDeskApi("api.tickets.update"),
      });
    }
  }

  return portalApiJson(request, {
    method: "PUT",
    path: `/service-desk/tickets/${ticketId}`,
    headers: toCurrentUsernameProxyHeaders(currentUserName),
    body,
    errorMessage: tServiceDeskApi("api.tickets.update"),
    mapData: mapTicketDetailPayload,
  });
}

export async function DELETE(
  request: NextRequest,
  context: TicketIdRouteContext,
) {
  const { ticketId } = context.params;
  const isRemote = await isRemoteRequest(request);
  const currentUserName = await getCurrentEmployeeUserName(request);

  if (!isRemote) {
    try {
      if (currentUserName === null) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }

      const isInternal = await isInternalUser(request);
      localDeleteTicket({
        isInternal,
        ticketId,
      });

      return new NextResponse(null, { status: 204 });
    } catch (error) {
      return toApiErrorResponse(error, {
        fallbackMessage: tServiceDeskApi("api.tickets.delete"),
      });
    }
  }

  return portalApiJson(request, {
    method: "DELETE",
    path: `/service-desk/tickets/${ticketId}`,
    headers: toCurrentUsernameProxyHeaders(currentUserName),
    errorMessage: tServiceDeskApi("api.tickets.delete"),
  });
}
