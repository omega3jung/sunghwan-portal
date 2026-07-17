import { NextRequest, NextResponse } from "next/server";

import {
  getCurrentEmployeeUserName,
  isRemoteRequest,
  toApiErrorResponse,
} from "@/app/api/_adapters";
import { portalApiJson } from "@/app/api/_adapters/backend";
import { TicketIdRouteContext } from "@/app/api/_adapters/http";
import { getCurrentLocalUserScope } from "@/app/api/_adapters/localDemo/auth";
import {
  localDeleteTicket,
  localGetTicket,
  localRequesterUpdateTicket,
  withLocalTicketWorkerHistory,
} from "@/app/api/_adapters/localDemo/serviceDesk/ticket";
import {
  resolveApiErrorMessage,
  toCurrentUsernameProxyHeaders,
  withDerivedTicketOwnership,
} from "@/app/api/_adapters/serviceDesk";
import { mapTicketDetailPayload } from "@/lib/application/contracts/serviceDesk";
import { requesterUpdateTicketRequestSchema } from "@/lib/application/contracts/serviceDesk";

export async function GET(request: NextRequest, context: TicketIdRouteContext) {
  const { ticketId } = context.params;
  const isRemote = await isRemoteRequest(request);
  const currentUserName = await getCurrentEmployeeUserName(request);

  if (!isRemote) {
    if (currentUserName === null) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const currentUserScope = await getCurrentLocalUserScope(request);

    if (currentUserScope === null) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const isInternal = currentUserScope === "INTERNAL";
    const ticket = localGetTicket({ isInternal, id: ticketId });

    if (!ticket) {
      return NextResponse.json(
        { message: resolveApiErrorMessage("serviceDesk.tickets.notFound") },
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
    errorMessage: resolveApiErrorMessage("serviceDesk.tickets.fetch"),
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
      { message: resolveApiErrorMessage("serviceDesk.tickets.localDemo.invalidPayload") },
      { status: 400 },
    );
  }

  const body = parsedBody.data;

  if (!isRemote) {
    try {
      if (currentUserName === null) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }

      const currentUserScope = await getCurrentLocalUserScope(request);

      if (currentUserScope === null) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }

      const isInternal = currentUserScope === "INTERNAL";

      const ticket = withDerivedTicketOwnership(
        await localRequesterUpdateTicket({
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
        fallbackMessage: resolveApiErrorMessage("serviceDesk.tickets.update"),
      });
    }
  }

  return portalApiJson(request, {
    method: "PUT",
    path: `/service-desk/tickets/${ticketId}`,
    headers: toCurrentUsernameProxyHeaders(currentUserName),
    body,
    errorMessage: resolveApiErrorMessage("serviceDesk.tickets.update"),
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

      const currentUserScope = await getCurrentLocalUserScope(request);

      if (currentUserScope === null) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }

      const isInternal = currentUserScope === "INTERNAL";
      localDeleteTicket({
        isInternal,
        ticketId,
      });

      return new NextResponse(null, { status: 204 });
    } catch (error) {
      return toApiErrorResponse(error, {
        fallbackMessage: resolveApiErrorMessage("serviceDesk.tickets.delete"),
      });
    }
  }

  return portalApiJson(request, {
    method: "DELETE",
    path: `/service-desk/tickets/${ticketId}`,
    headers: toCurrentUsernameProxyHeaders(currentUserName),
    errorMessage: resolveApiErrorMessage("serviceDesk.tickets.delete"),
  });
}
