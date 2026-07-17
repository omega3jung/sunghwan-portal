import { NextRequest, NextResponse } from "next/server";

import {
  getCurrentEmployeeUserName,
  isRemoteRequest,
  toApiErrorResponse,
} from "@/app/api/_adapters";
import { portalApiJson } from "@/app/api/_adapters/backend";
import { getCurrentLocalUserScope } from "@/app/api/_adapters/localDemo/auth";
import {
  localCreateTicket,
  localListTickets,
  withLocalTicketWorkerHistory,
} from "@/app/api/_adapters/localDemo/serviceDesk/ticket";
import { toTicketMockSummaryResource } from "@/app/api/_adapters/localDemo/serviceDesk/ticket/ticketResourceMapper";
import {
  resolveApiErrorMessage,
  toCurrentUsernameProxyHeaders,
  withDerivedTicketOwnership,
  withDerivedTicketOwnershipList,
} from "@/app/api/_adapters/serviceDesk";
import { ticketMutateRequestPayloadSchema } from "@/feature/serviceDesk/ticket";
import {
  mapTicketDetailPayload,
  mapTicketSummaryListPayload,
  type TicketMutateRequestPayload,
} from "@/lib/application/contracts/serviceDesk";

export async function GET(request: NextRequest) {
  const isRemote = await isRemoteRequest(request);
  const currentUserName = await getCurrentEmployeeUserName(request);

  // demo mode
  if (!isRemote) {
    try {
      if (currentUserName === null) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }

      const currentUserScope = await getCurrentLocalUserScope(request);

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
        fallbackMessage: resolveApiErrorMessage("serviceDesk.tickets.fetchList"),
      });
    }
  }

  // real backend
  return portalApiJson(request, {
    path: "/service-desk/tickets",
    query: request.nextUrl.searchParams,
    headers: toCurrentUsernameProxyHeaders(currentUserName),
    errorMessage: resolveApiErrorMessage("serviceDesk.tickets.fetchList"),
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
      { message: resolveApiErrorMessage("serviceDesk.tickets.localDemo.invalidPayload") },
      { status: 400 },
    );
  }

  const body = parsedBody.data;

  if (!isRemote) {
    try {
      if (currentUserName === null) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }

      const currentUserScope = await getCurrentLocalUserScope(request);

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
        fallbackMessage: resolveApiErrorMessage("serviceDesk.tickets.create"),
      });
    }
  }

  return portalApiJson(request, {
    method: "POST",
    path: "/service-desk/tickets",
    headers: toCurrentUsernameProxyHeaders(currentUserName),
    body,
    errorMessage: resolveApiErrorMessage("serviceDesk.tickets.create"),
    mapData: mapTicketDetailPayload,
  });
}
