import { NextRequest, NextResponse } from "next/server";

import { isInternalUser, isRemoteRequest, proxyJson } from "@/app/api/_helpers";
import { TicketIdRouteContext } from "@/app/api/_helpers/types";
import { tServiceDeskApi } from "@/app/api/service-desk/_shared/messages";
import { mapTicketDetailPayload } from "@/feature/serviceDesk/ticket/api/mapper";
import {
  toTicketMockDetail,
  toTicketMockDetailResource,
} from "@/feature/serviceDesk/ticketAction/mock";
import {
  toTicketWritePayload,
  UpdateTicketInput,
} from "@/feature/serviceDesk/ticketAction/write";
import { clientTicketsMocks } from "@/mocks/scenarios/serviceDesk/clientTicketsMock";
import { internalTicketsMocks } from "@/mocks/scenarios/serviceDesk/internalTicketsMock";

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
        { message: tServiceDeskApi("api.tickets.notFound") },
        { status: 404 },
      );
    }

    return NextResponse.json(toTicketMockDetailResource(ticket));
  }

  return proxyJson(request, {
    path: `/service-desk/tickets/${ticketId}`,
    errorMessage: tServiceDeskApi("api.tickets.fetch"),
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

  if (!isRemote) {
    return new NextResponse(null, { status: 204 });
  }

  return proxyJson(request, {
    method: "DELETE",
    path: `/service-desk/tickets/${ticketId}`,
    errorMessage: tServiceDeskApi("api.tickets.delete"),
  });
}
