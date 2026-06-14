import { NextRequest, NextResponse } from "next/server";

import { isInternalUser, isRemoteRequest } from "@/app/api/_helpers";
import { portalApiJson } from "@/app/api/_helpers/portalApiJson";
import { RouteContext } from "@/app/api/_helpers/types";
import { tServiceDeskApi } from "@/app/api/service-desk/_shared/messages";
import {
  camelTicketActionMapper,
  mapTicketActionPayload,
} from "@/feature/serviceDesk/ticketAction/api";
import { getLocalDemoActions } from "@/server/serviceDesk/ticket/state";

type TicketActionRouteContext = RouteContext<{
  ticketId: string;
  actionNo: string;
}>;

export async function GET(
  request: NextRequest,
  context: TicketActionRouteContext,
) {
  const { ticketId, actionNo } = context.params;
  const isRemote = await isRemoteRequest(request);

  if (!isRemote) {
    const isInternal = await isInternalUser(request);
    const item = getLocalDemoActions(isInternal).find(
      (candidate) =>
        candidate.ticket_id === ticketId &&
        candidate.action_no === Number(actionNo) &&
        candidate.active !== false,
    );

    if (!item) {
      return NextResponse.json(
        { message: tServiceDeskApi("api.ticketActions.notFound") },
        { status: 404 },
      );
    }

    return NextResponse.json(camelTicketActionMapper([item])[0]);
  }

  return portalApiJson(request, {
    path: `/service-desk/tickets/${ticketId}/actions/${actionNo}`,
    errorMessage: tServiceDeskApi("api.ticketActions.fetch"),
    mapData: mapTicketActionPayload,
  });
}

// soft delete.
export async function PATCH(
  request: NextRequest,
  context: TicketActionRouteContext,
) {
  const { ticketId, actionNo } = context.params;
  const isRemote = await isRemoteRequest(request);
  const body = (await request.json()) as { active?: boolean };

  if (!isRemote) {
    return NextResponse.json(
      {
        ticketId,
        actionNo: Number(actionNo),
        active: body.active ?? false,
      },
      { status: 200 },
    );
  }

  return portalApiJson(request, {
    method: "PATCH",
    path: `/service-desk/tickets/${ticketId}/actions/${actionNo}`,
    body,
    errorMessage: tServiceDeskApi("api.ticketActions.remove"),
  });
}
