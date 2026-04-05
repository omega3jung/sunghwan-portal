import { NextRequest, NextResponse } from "next/server";

import { mapTicketDetailPayload } from "@/api/serviceDesk/ticket/mapper";
import {
  toTicketMockDetail,
  toTicketMockDetailResource,
} from "@/api/serviceDesk/ticket/mock";
import {
  toTicketWritePayload,
  UpdateTicketInput,
} from "@/api/serviceDesk/ticket/write";
import {
  clientTicketsMock,
  internalTicketsMock,
} from "@/app/_mocks/scenarios/serviceDesk/tickets";
import { isInternalUser, isRemoteRequest, proxyJson } from "@/app/api/_helpers";
import { TicketIdRouteContext } from "@/app/api/_helpers/types";

export async function GET(request: NextRequest, context: TicketIdRouteContext) {
  const { ticketId } = context.params;
  const isRemote = await isRemoteRequest(request);

  if (!isRemote) {
    const isInternal = await isInternalUser(request);
    const ticket = (isInternal ? internalTicketsMock : clientTicketsMock).find(
      (item) => item.id === ticketId,
    );

    if (!ticket) {
      return NextResponse.json(
        { message: "Ticket not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(toTicketMockDetailResource(ticket));
  }

  return proxyJson(request, {
    path: `/service-desk/tickets/${ticketId}`,
    errorMessage: "Failed to fetch ticket",
    mapData: mapTicketDetailPayload,
  });
}

export async function PUT(request: NextRequest, context: TicketIdRouteContext) {
  const { ticketId } = context.params;
  const isRemote = await isRemoteRequest(request);
  const body = (await request.json()) as UpdateTicketInput;

  if (!isRemote) {
    return NextResponse.json(toTicketMockDetail(body, ticketId), {
      status: 200,
    });
  }

  return proxyJson(request, {
    method: "PUT",
    path: `/service-desk/tickets/${ticketId}`,
    body: toTicketWritePayload({ ...body, id: ticketId }),
    errorMessage: "Failed to update ticket",
    mapData: mapTicketDetailPayload,
  });
}

export async function DELETE(
  request: NextRequest,
  context: TicketIdRouteContext,
) {
  const { ticketId } = context.params;
  const isRemote = await isRemoteRequest(request);

  if (!isRemote) {
    return new NextResponse(null, { status: 204 });
  }

  return proxyJson(request, {
    method: "DELETE",
    path: `/service-desk/tickets/${ticketId}`,
    errorMessage: "Failed to delete ticket",
  });
}
