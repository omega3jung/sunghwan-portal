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
import { clientTicketsMocks } from "@/app/_mocks/scenarios/serviceDesk/clientTicketsMock";
import { internalTicketsMocks } from "@/app/_mocks/scenarios/serviceDesk/internalTicketsMock";
import { isInternalUser, isRemoteRequest, proxyJson } from "@/app/api/_helpers";
import { TicketIdRouteContext } from "@/app/api/_helpers/types";
import { tServiceDesk } from "@/app/api/service-desk/messages";

export async function GET(request: NextRequest, context: TicketIdRouteContext) {
  const { ticketId } = context.params;
  const isRemote = await isRemoteRequest(request);

  if (!isRemote) {
    const isInternal = await isInternalUser(request);
    const ticket = (
      isInternal ? internalTicketsMocks : clientTicketsMocks
    ).find((item) => item.id === ticketId);

    if (!ticket) {
      return NextResponse.json(
        { message: tServiceDesk("api.tickets.notFound") },
        { status: 404 },
      );
    }

    return NextResponse.json(toTicketMockDetailResource(ticket));
  }

  return proxyJson(request, {
    path: `/service-desk/tickets/${ticketId}`,
    errorMessage: tServiceDesk("api.tickets.fetch"),
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
    errorMessage: tServiceDesk("api.tickets.update"),
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
    errorMessage: tServiceDesk("api.tickets.delete"),
  });
}
