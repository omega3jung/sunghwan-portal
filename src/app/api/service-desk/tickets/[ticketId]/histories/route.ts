import { NextRequest, NextResponse } from "next/server";

import {
  camelTicketHistoryMapper,
  mapTicketHistoryListPayload,
} from "@/api/serviceDesk/ticket/history";
import { internalHistoriesMocks } from "@/app/_mocks/scenarios/serviceDesk/histories/internalHistoriesMock";
import {
  clientTicketsMocks,
  internalTicketsMocks,
} from "@/app/_mocks/scenarios/serviceDesk/tickets";
import { isInternalUser, isRemoteRequest, proxyJson } from "@/app/api/_helpers";
import { TicketIdRouteContext } from "@/app/api/_helpers/types";

export async function GET(request: NextRequest, context: TicketIdRouteContext) {
  const { ticketId } = context.params;
  const isRemote = await isRemoteRequest(request);

  if (!isRemote) {
    const isInternal = await isInternalUser(request);
    const tickets = isInternal ? internalTicketsMocks : clientTicketsMocks;
    const ticket = tickets.find((item) => item.id === ticketId);

    if (!ticket) {
      return NextResponse.json(
        { message: "Ticket not found" },
        { status: 404 },
      );
    }

    const items = (isInternal ? internalHistoriesMocks : []).filter(
      (item) => item.ticket_id === ticketId,
    );

    return NextResponse.json({
      items: camelTicketHistoryMapper(items),
      total: items.length,
    });
  }

  return proxyJson(request, {
    path: `/service-desk/tickets/${ticketId}/history`,
    errorMessage: "Failed to fetch ticket histories",
    mapData: mapTicketHistoryListPayload,
  });
}
