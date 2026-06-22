import { NextResponse, type NextResponse as NextResponseType } from "next/server";

import {
  getTicketDetail,
  getTicketListItems,
} from "@/server/data/serviceDesk/ticket";

import {
  createNotFoundResponse,
  ServiceDeskPortalApiContext,
} from "./serviceDeskPortalApiUtils";

const TICKET_LIST_PATH_PATTERN = /^\/service-desk\/tickets$/;
const TICKET_DETAIL_PATH_PATTERN = /^\/service-desk\/tickets\/([^/]+)$/;
const CURRENT_USERNAME_HEADER = "X-Current-Username";

export async function handleTicketPortalApi(
  context: ServiceDeskPortalApiContext,
): Promise<NextResponseType> {
  if (context.method !== "GET") {
    return createNotFoundResponse();
  }

  const currentUserName = getCurrentUserName(context);

  if (currentUserName === null) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (TICKET_LIST_PATH_PATTERN.test(context.path)) {
    const items = await getTicketListItems(currentUserName);

    return NextResponse.json({
      items,
      total: items.length,
    });
  }

  const detailMatch = TICKET_DETAIL_PATH_PATTERN.exec(context.path);

  if (detailMatch) {
    const ticketId = decodeURIComponent(detailMatch[1] ?? "");
    const ticket = await getTicketDetail(ticketId, currentUserName);

    return ticket ? NextResponse.json(ticket) : createNotFoundResponse();
  }

  return createNotFoundResponse();
}

function getCurrentUserName(context: ServiceDeskPortalApiContext) {
  const value = new Headers(context.options.headers).get(CURRENT_USERNAME_HEADER);
  const normalizedValue = value?.trim();

  return normalizedValue ? normalizedValue : null;
}
