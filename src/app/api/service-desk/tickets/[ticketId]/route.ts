import { NextRequest, NextResponse } from "next/server";

import {
  getCurrentEmployeeUserName,
  isInternalUser,
  isRemoteRequest,
  proxyJson,
  toApiErrorResponse,
} from "@/app/api/_helpers";
import { TicketIdRouteContext } from "@/app/api/_helpers/types";
import {
  toCurrentUsernameProxyHeaders,
  tServiceDeskApi,
  withDerivedTicketOwnership,
} from "@/app/api/service-desk/_shared";
import { mapTicketDetailPayload } from "@/feature/serviceDesk/ticket/api";
import {
  TicketWriteRequestInput,
  toTicketWriteInput,
  toTicketWritePayload,
  updateTicketSchema,
} from "@/feature/serviceDesk/ticket/write";
import {
  localDeleteTicket,
  localGetTicket,
  localUpdateTicket,
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
      withDerivedTicketOwnership(ticket, currentUserName),
    );
  }

  return proxyJson(request, {
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
  const parsedBody = updateTicketSchema.safeParse(
    (await request.json()) as TicketWriteRequestInput,
  );

  if (!parsedBody.success) {
    return NextResponse.json(
      { message: tServiceDeskApi("api.tickets.localDemo.invalidPayload") },
      { status: 400 },
    );
  }

  const body = toTicketWriteInput(parsedBody.data, ticketId);

  if (!isRemote) {
    try {
      if (currentUserName === null) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }

      const isInternal = await isInternalUser(request);

      return NextResponse.json(
        withDerivedTicketOwnership(
          localUpdateTicket({
            isInternal,
            ticketId,
            input: body,
          }),
          currentUserName,
        ),
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

  return proxyJson(request, {
    method: "PUT",
    path: `/service-desk/tickets/${ticketId}`,
    headers: toCurrentUsernameProxyHeaders(currentUserName),
    body: toTicketWritePayload(body),
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

  return proxyJson(request, {
    method: "DELETE",
    path: `/service-desk/tickets/${ticketId}`,
    headers: toCurrentUsernameProxyHeaders(currentUserName),
    errorMessage: tServiceDeskApi("api.tickets.delete"),
  });
}
