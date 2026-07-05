import { NextRequest, NextResponse } from "next/server";

import {
  getCurrentEmployeeUserName,
  isInternalUser,
  isRemoteRequest,
} from "@/app/api/_helpers";
import { portalApiJson } from "@/app/api/_helpers/portalApiJson";
import { TicketIdRouteContext } from "@/app/api/_helpers/types";
import {
  toCurrentUsernameProxyHeaders,
  tServiceDeskApi,
} from "@/app/api/service-desk/_shared";
import {
  camelTicketHistoryMapper,
  mapTicketHistoryListPayload,
} from "@/feature/serviceDesk/ticketHistory/api";
import { getLocalDemoHistories } from "@/server/serviceDesk/ticket/state";

export async function GET(request: NextRequest, context: TicketIdRouteContext) {
  const { ticketId } = context.params;
  const isRemote = await isRemoteRequest(request);
  const currentUserName = await getCurrentEmployeeUserName(request);

  if (currentUserName === null) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

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

  return portalApiJson(request, {
    path: `/service-desk/tickets/${ticketId}/histories`,
    headers: toCurrentUsernameProxyHeaders(currentUserName),
    errorMessage: tServiceDeskApi("api.ticketHistories.fetchList"),
    mapData: mapTicketHistoryListPayload,
  });
}
