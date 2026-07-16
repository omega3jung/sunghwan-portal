import { NextRequest, NextResponse } from "next/server";

import { getLocalDemoHistories, getLocalDemoTickets } from "@/app/api/_adapters/localDemo/serviceDesk/ticket/state";
import { resolveApiErrorMessage } from "@/app/api/_adapters/serviceDesk";
import { isRemoteRequest } from "@/app/api/_adapters";
import { portalApiJson } from "@/app/api/_adapters/backend";
import { DbTicketDetail } from "@/lib/application/contracts/serviceDesk";

const RESOLVED_AUTO_CLOSE_GRACE_DAYS = 7;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

type AutoCloseResult = {
  closedCount: number;
  ticketIds: string[];
};

export async function POST(request: NextRequest) {
  const unauthorized = validateCronSecret(request);

  if (unauthorized) {
    return unauthorized;
  }

  const isRemote = await isRemoteRequest(request);

  if (isRemote) {
    return portalApiJson(request, {
      method: "POST",
      path: "/service-desk/tickets/cron/close-expired-resolved",
      body: {},
      errorMessage: resolveApiErrorMessage("serviceDesk.ticketCommand.autoClose"),
    });
  }

  return NextResponse.json(closeExpiredResolvedTicketsLocal(new Date()));
}

export async function GET(request: NextRequest) {
  return POST(request);
}

function validateCronSecret(request: NextRequest) {
  const secret = process.env.SERVICE_DESK_CRON_SECRET ?? process.env.CRON_SECRET;

  if (!secret) {
    return NextResponse.json(
      { message: "Cron secret is not configured." },
      { status: 500 },
    );
  }

  const authorization = request.headers.get("authorization") ?? "";
  const bearerToken = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : "";
  const headerSecret = request.headers.get("x-cron-secret")?.trim() ?? "";

  if (bearerToken === secret || headerSecret === secret) {
    return null;
  }

  return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
}

function closeExpiredResolvedTicketsLocal(now: Date): AutoCloseResult {
  const ticketIds: string[] = [];
  const cutoffTime =
    now.getTime() - RESOLVED_AUTO_CLOSE_GRACE_DAYS * MS_PER_DAY;

  for (const isInternal of [false, true]) {
    const tickets = getLocalDemoTickets(isInternal);
    const histories = getLocalDemoHistories(isInternal);

    tickets.forEach((ticket, index) => {
      if (ticket.status !== "Resolved") {
        return;
      }

      const resolvedAt = resolveLocalResolvedAt(ticket, histories);

      if (!resolvedAt || resolvedAt.getTime() > cutoffTime) {
        return;
      }

      const updatedTicket: DbTicketDetail = {
        ...ticket,
        status: "Closed",
        close_reason: "Completed",
        updated_at: now.toISOString(),
      };

      tickets.splice(index, 1, updatedTicket);
      histories.push({
        ticket_id: ticket.id,
        history_no:
          Math.max(
            0,
            ...histories
              .filter((history) => history.ticket_id === ticket.id)
              .map((history) => history.history_no),
          ) + 1,
        type: "STATUS",
        event: "RESOLUTION_CLOSE",
        source: "SYSTEM_AUTO",
        actor_username: null,
        action_no: null,
        from_value: { status: "Resolved" },
        to_value: { status: "Closed", closeReason: "Completed" },
        metadata: {
          closeReason: "Completed",
          resolvedGraceDays: RESOLVED_AUTO_CLOSE_GRACE_DAYS,
        },
        created_at: now.toISOString(),
      });
      ticketIds.push(ticket.id);
    });
  }

  return {
    closedCount: ticketIds.length,
    ticketIds,
  };
}

function resolveLocalResolvedAt(
  ticket: DbTicketDetail,
  histories: ReturnType<typeof getLocalDemoHistories>,
) {
  const resolvedHistory = histories
    .filter((history) => history.ticket_id === ticket.id)
    .filter((history) => resolveHistoryToStatus(history.to_value) === "Resolved")
    .sort((left, right) => right.created_at.localeCompare(left.created_at))[0];

  return resolvedHistory ? new Date(resolvedHistory.created_at) : null;
}

function resolveHistoryToStatus(value: unknown) {
  if (typeof value === "string") {
    return value;
  }

  if (value && typeof value === "object" && !Array.isArray(value)) {
    const status = (value as { status?: unknown }).status;
    return typeof status === "string" ? status : null;
  }

  return null;
}
