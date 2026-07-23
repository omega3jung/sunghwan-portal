import { NextRequest, NextResponse } from "next/server";

import {
  getCurrentEmployeeUserName,
  isRemoteRequest,
} from "@/app/api/_adapters";
import { portalApiJson } from "@/app/api/_adapters/backend";
import { TicketIdRouteContext } from "@/app/api/_adapters/http";
import { getCurrentLocalTicketAccessContext } from "@/app/api/_adapters/localDemo/auth";
import { localGetTicket } from "@/app/api/_adapters/localDemo/serviceDesk/ticket";
import { getLocalDemoHistories } from "@/app/api/_adapters/localDemo/serviceDesk/ticket/state";
import {
  resolveApiErrorMessage,
  toCurrentUsernameProxyHeaders,
} from "@/app/api/_adapters/serviceDesk";
import {
  camelTicketHistoryMapper,
  mapTicketHistoryListPayload,
} from "@/lib/application/contracts/serviceDesk";

export async function GET(request: NextRequest, context: TicketIdRouteContext) {
  const { ticketId } = context.params;
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

    const items = getLocalDemoHistories().filter(
      (item) => item.ticket_id === ticketId,
    );

    return NextResponse.json({
      items: camelTicketHistoryMapper(items),
      total: items.length,
    });
  }

  return portalApiJson(request, {
    path: `/service-desk/tickets/${ticketId}/histories`,
    headers: toCurrentUsernameProxyHeaders(currentUserName),
    errorMessage: resolveApiErrorMessage("serviceDesk.ticketHistories.fetchList"),
    mapData: mapTicketHistoryListPayload,
  });
}
