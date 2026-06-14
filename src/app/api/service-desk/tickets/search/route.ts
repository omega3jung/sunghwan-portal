import { NextRequest, NextResponse } from "next/server";

import {
  getCurrentEmployeeUserName,
  isInternalUser,
  isRemoteRequest,
  toApiErrorResponse,
} from "@/app/api/_helpers";
import { portalApiJson } from "@/app/api/_helpers/portalApiJson";
import {
  toCurrentUsernameProxyHeaders,
  tServiceDeskApi,
  withDerivedTicketOwnershipList,
} from "@/app/api/service-desk/_shared";
import type { TicketSearchRequest } from "@/feature/serviceDesk/ticket/api";
import { mapTicketSummaryListPayload } from "@/feature/serviceDesk/ticket/api/mapper";
import { toTicketMockSummaryResource } from "@/feature/serviceDesk/ticketAction/mock";
import { localSearchTickets } from "@/server/serviceDesk/ticket/localDemo";

export async function POST(request: NextRequest) {
  const isRemote = await isRemoteRequest(request);
  const currentUserName = await getCurrentEmployeeUserName(request);

  let body: TicketSearchRequest;

  try {
    body = (await request.json()) as TicketSearchRequest;
  } catch {
    return NextResponse.json(
      { message: "Invalid request body" },
      { status: 400 },
    );
  }

  if (!isRemote) {
    try {
      if (currentUserName === null) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }

      const isInternal = await isInternalUser(request);

      const result = localSearchTickets({
        isInternal,
        request: body,
      });

      const items = withDerivedTicketOwnershipList(
        result.items.map(toTicketMockSummaryResource),
        currentUserName,
      );

      return NextResponse.json({
        items,
        totalCount: result.totalCount,
        page: result.page,
        pageSize: result.pageSize,
      });
    } catch (error) {
      return toApiErrorResponse(error, {
        fallbackMessage: tServiceDeskApi("api.tickets.fetchList"),
      });
    }
  }

  return portalApiJson(request, {
    method: "POST",
    path: "/service-desk/tickets/search",
    headers: toCurrentUsernameProxyHeaders(currentUserName),
    body,
    errorMessage: tServiceDeskApi("api.tickets.fetchList"),
    mapData: mapTicketSummaryListPayload,
  });
}
