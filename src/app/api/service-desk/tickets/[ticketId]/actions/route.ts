import { NextRequest, NextResponse } from "next/server";

import { isInternalUser, isRemoteRequest } from "@/app/api/_helpers";
import { portalApiJson } from "@/app/api/_helpers/portalApiJson";
import { TicketIdRouteContext } from "@/app/api/_helpers/types";
import { tServiceDeskApi } from "@/app/api/service-desk/_shared/messages";
import {
  camelTicketActionMapper,
  mapTicketActionListPayload,
} from "@/feature/serviceDesk/ticketAction/api";
import { getLocalDemoActions } from "@/server/serviceDesk/ticket/state";

export async function GET(request: NextRequest, context: TicketIdRouteContext) {
  const { ticketId } = context.params;
  const isRemote = await isRemoteRequest(request);

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
    errorMessage: tServiceDeskApi("api.ticketActions.fetchList"),
    mapData: mapTicketActionListPayload,
  });
}
