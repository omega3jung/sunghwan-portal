import { NextRequest, NextResponse } from "next/server";

import {
  camelTicketActionMapper,
  mapTicketActionListPayload,
} from "@/api/serviceDesk/ticket/action";
import { internalActionsMocks } from "@/app/_mocks/scenarios/serviceDesk/internalActionsMock";
import { isInternalUser, isRemoteRequest, proxyJson } from "@/app/api/_helpers";
import { TicketIdRouteContext } from "@/app/api/_helpers/types";
import { tServiceDeskApi } from "@/app/api/service-desk/_shared/messages";

export async function GET(request: NextRequest, context: TicketIdRouteContext) {
  const { ticketId } = context.params;
  const isRemote = await isRemoteRequest(request);

  if (!isRemote) {
    const isInternal = await isInternalUser(request);

    const items = (isInternal ? internalActionsMocks : []).filter(
      (item) => item.ticket_id === ticketId,
    );

    return NextResponse.json({
      items: camelTicketActionMapper(items),
      total: items.length,
    });
  }

  return proxyJson(request, {
    path: `/service-desk/tickets/${ticketId}/actions`,
    errorMessage: tServiceDeskApi("api.ticketActions.fetchList"),
    mapData: mapTicketActionListPayload,
  });
}
