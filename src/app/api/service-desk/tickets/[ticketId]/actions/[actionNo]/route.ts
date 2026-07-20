import { NextRequest, NextResponse } from "next/server";

import {
  getCurrentEmployeeUserName,
  isRemoteRequest,
} from "@/app/api/_adapters";
import { portalApiJson } from "@/app/api/_adapters/backend";
import { RouteContext } from "@/app/api/_adapters/http";
import { getCurrentLocalTicketAccessContext } from "@/app/api/_adapters/localDemo/auth";
import { localGetTicket } from "@/app/api/_adapters/localDemo/serviceDesk/ticket";
import {
  getMaxHistoryNo,
  getTicketContext,
} from "@/app/api/_adapters/localDemo/serviceDesk/ticket/command/utils";
import {
  getLocalDemoActions,
  getLocalDemoHistories,
} from "@/app/api/_adapters/localDemo/serviceDesk/ticket/state";
import {
  ApiError,
  resolveApiErrorMessage,
} from "@/lib/application/api";
import {
  camelTicketActionMapper,
  mapTicketActionPayload,
} from "@/lib/application/contracts/serviceDesk";

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
    const access = await getCurrentLocalTicketAccessContext(request);

    if (access === null) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    if (!localGetTicket({ access, id: ticketId })) {
      return NextResponse.json(
        { message: resolveApiErrorMessage("serviceDesk.tickets.notFound") },
        { status: 404 },
      );
    }
    const item = getLocalDemoActions().find(
      (candidate) =>
        candidate.ticket_id === ticketId &&
        candidate.action_no === Number(actionNo) &&
        candidate.active !== false,
    );

    if (!item) {
      return NextResponse.json(
        { message: resolveApiErrorMessage("serviceDesk.ticketActions.notFound") },
        { status: 404 },
      );
    }

    return NextResponse.json(camelTicketActionMapper([item])[0]);
  }

  return portalApiJson(request, {
    path: `/service-desk/tickets/${ticketId}/actions/${actionNo}`,
    errorMessage: resolveApiErrorMessage("serviceDesk.ticketActions.fetch"),
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
    try {
      const currentUserName = await getCurrentEmployeeUserName(request);

      if (currentUserName === null) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }

      if (body.active !== false) {
        throw new ApiError(
          "serviceDesk.ticketActions.invalidPatch",
          400,
        );
      }

      const access = await getCurrentLocalTicketAccessContext(request);

      if (access === null) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }
      if (!localGetTicket({ access, id: ticketId })) {
        throw new ApiError("serviceDesk.common.notFound", 404);
      }
      const isInternal = access.userScope === "INTERNAL";
      const numericActionNo = Number(actionNo);
      const { ticket } = getTicketContext(ticketId, isInternal);

      if (ticket.status === "Draft" || ticket.status === "Closed") {
        throw new ApiError(
          "serviceDesk.ticketActions.removeForbiddenByStatus",
          409,
          { ticketId, status: ticket.status },
        );
      }

      const actions = getLocalDemoActions();
      const actionIndex = actions.findIndex(
        (candidate) =>
          candidate.ticket_id === ticketId &&
          candidate.action_no === numericActionNo &&
          candidate.active !== false,
      );
      const action = actionIndex >= 0 ? actions[actionIndex] : null;

      if (!action) {
        throw new ApiError("serviceDesk.ticketActions.notFound", 404);
      }

      if (action.action_type !== "COMMENT" && action.action_type !== "NOTE") {
        throw new ApiError(
          "serviceDesk.ticketActions.operationalRemoveForbidden",
          403,
        );
      }

      if (action.owner_username !== currentUserName) {
        throw new ApiError(
          "serviceDesk.ticketActions.writerOnly",
          403,
        );
      }

      const updatedAt = new Date().toISOString();
      const updatedAction = {
        ...action,
        active: false,
        updated_at: updatedAt,
      };

      actions.splice(actionIndex, 1, updatedAction);
      getLocalDemoHistories().push({
        ticket_id: ticketId,
        history_no: getMaxHistoryNo(ticketId, isInternal),
        type: action.action_type === "COMMENT" ? "COMMENT" : "NOTE",
        event:
          action.action_type === "COMMENT"
            ? "COMMENT_DELETED"
            : "NOTE_DELETED",
        source: "USER_ACTION",
        actor_username: currentUserName,
        action_no: numericActionNo,
        from_value: { active: true },
        to_value: { active: false },
        metadata: {
          actionType: action.action_type,
          previousActive: true,
          nextActive: false,
        },
        created_at: updatedAt,
      });

      return NextResponse.json(camelTicketActionMapper([updatedAction])[0]);
    } catch (error) {
      const status = error instanceof ApiError ? error.status : 500;
      const message =
        error instanceof ApiError
          ? resolveApiErrorMessage(error.messageKey, error.options)
          : error instanceof Error
            ? error.message
            : resolveApiErrorMessage("serviceDesk.ticketActions.remove");

      return NextResponse.json({ message }, { status });
    }
  }

  return portalApiJson(request, {
    method: "PATCH",
    path: `/service-desk/tickets/${ticketId}/actions/${actionNo}`,
    body,
    errorMessage: resolveApiErrorMessage("serviceDesk.ticketActions.remove"),
  });
}
