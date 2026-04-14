import { NextRequest, NextResponse } from "next/server";

import {
  mapTicketActionPayload,
  toTicketActionWritePayload,
} from "@/api/serviceDesk/ticket/action";
import {
  getEffectiveUserId,
  isRemoteRequest,
  proxyJson,
} from "@/app/api/_helpers";
import { RouteContext } from "@/app/api/_helpers/types";
import { TicketActionFormValues } from "@/feature/serviceDesk/ticket/forms/action";

import { localPost } from "./localDemo";
import { ACTION_PATH_BY_TYPE, TicketActionApiType } from "./types";

type TicketActionRouteContext = RouteContext<{
  ticketId: string;
  action: TicketActionApiType;
}>;

export async function POST(
  request: NextRequest,
  context: TicketActionRouteContext,
) {
  const { ticketId, action } = context.params;
  const isRemote = await isRemoteRequest(request);
  const content = (await request.json()) as TicketActionFormValues;

  if (ACTION_PATH_BY_TYPE[content.actionType] !== action) {
    return NextResponse.json(
      { message: "Action path and payload do not match." },
      { status: 400 },
    );
  }

  if (!isRemote) {
    const userId = await getEffectiveUserId(request);

    if (!userId) {
      return NextResponse.json({ message: "No user data" }, { status: 503 });
    }

    return localPost({ ticketId, userId, action, content });
  }

  return proxyJson(request, {
    method: "POST",
    path: `/service-desk/tickets/${ticketId}/command/${action}`,
    body: toTicketActionWritePayload(content),
    errorMessage: "Failed to execute ticket command",
    mapData: mapTicketActionPayload,
  });
}
