import { NextRequest, NextResponse } from "next/server";

import {
  getCurrentEmployeeUserName,
  getCurrentUserScope,
  isRemoteRequest,
  toApiErrorResponse,
} from "@/app/api/_helpers";
import {
  toCurrentUsernameProxyHeaders,
  tServiceDeskApi,
  withDerivedTicketOwnership,
  withDerivedTicketOwnershipList,
} from "@/app/api/service-desk/_shared";
import {
  type TicketMutateRequestPayload,
  ticketMutateRequestPayloadSchema,
} from "@/feature/serviceDesk/ticket";
import {
  mapTicketDetailPayload,
  mapTicketSummaryListPayload,
} from "@/feature/serviceDesk/ticket/api";
import { toTicketMockSummaryResource } from "@/feature/serviceDesk/ticketAction/mock";
import {
  localCreateTicket,
  localListTickets,
  withLocalTicketWorkerHistory,
} from "@/server/serviceDesk/ticket/localDemo";

import { portalApiJson } from "../../_helpers/portalApiJson";

export async function GET(request: NextRequest) {
  const isRemote = await isRemoteRequest(request);
  const currentUserName = await getCurrentEmployeeUserName(request);

  // demo mode
  if (!isRemote) {
    try {
      if (currentUserName === null) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }

      const currentUserScope = await getCurrentUserScope(request);

      if (currentUserScope === null) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }

      const isInternal = currentUserScope === "INTERNAL";
      const filtered = localListTickets({
        isInternal,
        searchParams: request.nextUrl.searchParams,
      });

      const items = withDerivedTicketOwnershipList(
        filtered.items.map(toTicketMockSummaryResource),
        currentUserName,
      );

      return NextResponse.json({
        items,
        total: filtered.total,
      });
    } catch (error) {
      return toApiErrorResponse(error, {
        fallbackMessage: tServiceDeskApi("api.tickets.fetchList"),
      });
    }
  }

  // real backend
  return portalApiJson(request, {
    path: "/service-desk/tickets",
    query: request.nextUrl.searchParams,
    headers: toCurrentUsernameProxyHeaders(currentUserName),
    errorMessage: tServiceDeskApi("api.tickets.fetchList"),
    mapData: mapTicketSummaryListPayload,
  });
}

export async function POST(request: NextRequest) {
  const isRemote = await isRemoteRequest(request);
  const currentUserName = await getCurrentEmployeeUserName(request);
  const parsedBody = ticketMutateRequestPayloadSchema.safeParse(
    (await request.json()) as TicketMutateRequestPayload,
  );

  if (!parsedBody.success) {
    return NextResponse.json(
      { message: tServiceDeskApi("api.tickets.localDemo.invalidPayload") },
      { status: 400 },
    );
  }

  const body = parsedBody.data;

  if (!isRemote) {
    try {
      if (currentUserName === null) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }

      const currentUserScope = await getCurrentUserScope(request);

      if (currentUserScope === null) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }

      const isInternal = currentUserScope === "INTERNAL";

      const ticket = withDerivedTicketOwnership(
        await localCreateTicket({
          isInternal,
          requesterUsername: currentUserName,
          input: body,
        }),
        currentUserName,
      );

      return NextResponse.json(
        withLocalTicketWorkerHistory(ticket, { isInternal, currentUserName }),
        { status: 201 },
      );
    } catch (error) {
      return toApiErrorResponse(error, {
        fallbackMessage: tServiceDeskApi("api.tickets.create"),
      });
    }
  }

  return portalApiJson(request, {
    method: "POST",
    path: "/service-desk/tickets",
    headers: toCurrentUsernameProxyHeaders(currentUserName),
    body,
    errorMessage: tServiceDeskApi("api.tickets.create"),
    mapData: mapTicketDetailPayload,
  });
}
