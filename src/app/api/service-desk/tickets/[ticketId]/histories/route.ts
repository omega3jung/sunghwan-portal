import { NextRequest, NextResponse } from "next/server";

import { isInternalUser, isRemoteRequest, proxyJson } from "@/app/api/_helpers";
import { TicketIdRouteContext } from "@/app/api/_helpers/types";
import { tServiceDeskApi } from "@/app/api/service-desk/_shared/messages";
import {
  camelTicketHistoryMapper,
  mapTicketHistoryListPayload,
} from "@/feature/serviceDesk/ticketHistory/api";
import { getLocalDemoHistories } from "@/server/serviceDesk/ticket/state";

export async function GET(request: NextRequest, context: TicketIdRouteContext) {
  const { ticketId } = context.params;
  const isRemote = await isRemoteRequest(request);

  if (!isRemote) {
    const isInternal = await isInternalUser(request);

    const items = getLocalDemoHistories(isInternal).filter(
      (item) => item.ticket_id === ticketId,
    );

    return NextResponse.json({
      items: camelTicketHistoryMapper(items),
      total: items.length,
    });
  }

  return proxyJson(request, {
    path: `/service-desk/tickets/${ticketId}/history`,
    errorMessage: tServiceDeskApi("api.ticketHistories.fetchList"),
    mapData: mapTicketHistoryListPayload,
  });
}
