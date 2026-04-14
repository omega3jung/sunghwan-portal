import { NextRequest, NextResponse } from "next/server";

import {
  camelTicketActionMapper,
  mapTicketActionListPayload,
} from "@/api/serviceDesk/ticket/action";
import { internalActionsMocks } from "@/app/_mocks/scenarios/serviceDesk/internalActionsMock";
import { isInternalUser, isRemoteRequest, proxyJson } from "@/app/api/_helpers";
import { TicketIdRouteContext } from "@/app/api/_helpers/types";

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
    errorMessage: "Failed to fetch ticket actions",
    mapData: mapTicketActionListPayload,
  });
}
