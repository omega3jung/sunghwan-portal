import { NextRequest, NextResponse } from "next/server";

import {
  camelTicketActionMapper,
  mapTicketActionPayload,
} from "@/api/serviceDesk/ticket/action";
import { internalActionsMocks } from "@/app/_mocks/scenarios/serviceDesk/internalActionsMock";
import { isInternalUser, isRemoteRequest, proxyJson } from "@/app/api/_helpers";
import { RouteContext } from "@/app/api/_helpers/types";
import { tServiceDeskApi } from "@/app/api/service-desk/_shared/messages";

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
    const item = (isInternal ? internalActionsMocks : []).find(
      (candidate) =>
        candidate.ticket_id === ticketId &&
        candidate.action_no === Number(actionNo),
    );

    if (!item) {
      return NextResponse.json(
        { message: tServiceDeskApi("api.ticketActions.notFound") },
        { status: 404 },
      );
    }

    return NextResponse.json(camelTicketActionMapper([item])[0]);
  }

  return proxyJson(request, {
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

  return proxyJson(request, {
    method: "PATCH",
    path: `/service-desk/tickets/${ticketId}/actions/${actionNo}`,
    body,
    errorMessage: tServiceDeskApi("api.ticketActions.remove"),
  });
}
