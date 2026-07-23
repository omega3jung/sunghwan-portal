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
  createLocalTicketWorkSession,
  listLocalTicketWorkSessions,
} from "@/app/api/_adapters/localDemo/serviceDesk/ticket/workSession";
import {
  ApiError,
  resolveApiErrorMessage,
  toCurrentUsernameProxyHeaders,
} from "@/app/api/_adapters/serviceDesk";
import {
  mapTicketWorkSessionListPayload,
  mapTicketWorkSessionPayload,
} from "@/feature/serviceDesk/ticketWorkSession/api";
import type { TicketWorkSessionSubmitPayload } from "@/feature/serviceDesk/ticketWorkSession/types";

export async function GET(request: NextRequest, context: TicketIdRouteContext) {
  const { ticketId } = await context.params;
  const isRemote = await isRemoteRequest(request);
  const currentUserName = await getCurrentEmployeeUserName(request);

  if (currentUserName === null) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!isRemote) {
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
    return NextResponse.json(listLocalTicketWorkSessions(ticketId));
  }

  return portalApiJson(request, {
    path: `/service-desk/tickets/${ticketId}/work-session`,
    headers: toCurrentUsernameProxyHeaders(currentUserName),
    errorMessage: resolveApiErrorMessage(
      "serviceDesk.ticketWorkSession.fetchList",
    ),
    mapData: mapTicketWorkSessionListPayload,
  });
}

export async function POST(
  request: NextRequest,
  context: TicketIdRouteContext,
) {
  const { ticketId } = await context.params;
  const isRemote = await isRemoteRequest(request);
  const currentUserName = await getCurrentEmployeeUserName(request);
  const payload = (await request.json()) as TicketWorkSessionSubmitPayload;

  if (isRemote) {
    return portalApiJson(request, {
      method: "POST",
      path: `/service-desk/tickets/${ticketId}/work-session`,
      headers: toCurrentUsernameProxyHeaders(currentUserName),
      body: payload,
      errorMessage: resolveApiErrorMessage(
        "serviceDesk.ticketWorkSession.create",
      ),
      mapData: mapTicketWorkSessionPayload,
    });
  }

  try {
    if (currentUserName === null) {
      return NextResponse.json(
        {
          message: resolveApiErrorMessage(
            "serviceDesk.ticketCommand.employeeUnavailable",
          ),
        },
        { status: 401 },
      );
    }

    const access = await getCurrentLocalTicketAccessContext(request);

    if (access === null) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    if (!localGetTicket({ access, id: ticketId })) {
      throw new ApiError("serviceDesk.common.notFound", 404);
    }
    const isInternal = access.userScope === "INTERNAL";

    const workSession = createLocalTicketWorkSession({
      ticketId,
      currentUserName,
      isInternal,
      payload,
    });

    return NextResponse.json(workSession, { status: 201 });
  } catch (error) {
    const message =
      error instanceof ApiError
        ? resolveApiErrorMessage(error.messageKey, error.options)
        : error instanceof Error
          ? error.message
          : resolveApiErrorMessage("serviceDesk.ticketWorkSession.create");
    const status = error instanceof ApiError ? error.status : 500;

    return NextResponse.json({ message }, { status });
  }
}
