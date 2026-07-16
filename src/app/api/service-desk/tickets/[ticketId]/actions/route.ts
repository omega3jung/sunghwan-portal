import { NextRequest, NextResponse } from "next/server";

import {
  getCurrentEmployeeUserName,
  isInternalUser,
  isRemoteRequest,
} from "@/app/api/_adapters";
import { portalApiJson } from "@/app/api/_adapters/backend";
import { TicketIdRouteContext } from "@/app/api/_adapters/http";
import { getLocalDemoActions } from "@/app/api/_adapters/localDemo/serviceDesk/ticket/state";
import {
  resolveApiErrorMessage,
  toCurrentUsernameProxyHeaders,
} from "@/app/api/_adapters/serviceDesk";
import {
  camelTicketActionMapper,
  mapTicketActionListPayload,
} from "@/lib/application/contracts/serviceDesk";

export async function GET(request: NextRequest, context: TicketIdRouteContext) {
  const { ticketId } = context.params;
  const isRemote = await isRemoteRequest(request);
  const currentUserName = await getCurrentEmployeeUserName(request);

  if (currentUserName === null) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!isRemote) {
    const isInternal = await isInternalUser(request);

    const items = getLocalDemoActions(isInternal).filter(
      (item) => item.ticket_id === ticketId && item.active !== false,
    );

    return NextResponse.json({
      items: camelTicketActionMapper(items),
      total: items.length,
    });
  }

  return portalApiJson(request, {
    path: `/service-desk/tickets/${ticketId}/actions`,
    headers: toCurrentUsernameProxyHeaders(currentUserName),
    errorMessage: resolveApiErrorMessage("serviceDesk.ticketActions.fetchList"),
    mapData: mapTicketActionListPayload,
  });
}
