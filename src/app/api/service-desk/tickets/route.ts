import { NextRequest, NextResponse } from "next/server";

import {
  getCurrentEmployeeUserName,
  isInternalUser,
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
  createTicketSchema,
  TicketWriteRequestInput,
  toTicketWriteInput,
  toTicketWritePayload,
} from "@/feature/serviceDesk/ticket";
import {
  mapTicketDetailPayload,
  mapTicketSummaryListPayload,
} from "@/feature/serviceDesk/ticket/api";
import { toTicketMockSummaryResource } from "@/feature/serviceDesk/ticketAction/mock";
import {
  localCreateTicket,
  localListTickets,
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

      const isInternal = await isInternalUser(request);
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
  const parsedBody = createTicketSchema.safeParse(
    (await request.json()) as TicketWriteRequestInput,
  );

  if (!parsedBody.success) {
    return NextResponse.json(
      { message: tServiceDeskApi("api.tickets.localDemo.invalidPayload") },
      { status: 400 },
    );
  }

  const body = toTicketWriteInput(parsedBody.data);

  if (!isRemote) {
    try {
      if (currentUserName === null) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }

      const isInternal = await isInternalUser(request);

      return NextResponse.json(
        withDerivedTicketOwnership(
          localCreateTicket({
            isInternal,
            requesterUsername: currentUserName,
            input: body,
          }),
          currentUserName,
        ),
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
    body: toTicketWritePayload(body),
    errorMessage: tServiceDeskApi("api.tickets.create"),
    mapData: mapTicketDetailPayload,
  });
}
