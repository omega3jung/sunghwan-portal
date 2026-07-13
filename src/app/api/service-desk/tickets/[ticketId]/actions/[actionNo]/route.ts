import { NextRequest, NextResponse } from "next/server";

import {
  getCurrentEmployeeUserName,
  isInternalUser,
  isRemoteRequest,
} from "@/app/api/_helpers";
import { portalApiJson } from "@/app/api/_helpers/portalApiJson";
import { RouteContext } from "@/app/api/_helpers/types";
import {
  ServiceDeskApiError,
  tServiceDeskApi,
} from "@/app/api/service-desk/_shared/messages";
import {
  camelTicketActionMapper,
  mapTicketActionPayload,
} from "@/feature/serviceDesk/ticketAction/api";
import {
  getMaxHistoryNo,
  getTicketContext,
} from "@/server/serviceDesk/ticket/command/utils";
import {
  getLocalDemoActions,
  getLocalDemoHistories,
} from "@/server/serviceDesk/ticket/state";

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
    try {
      const currentUserName = await getCurrentEmployeeUserName(request);

      if (currentUserName === null) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }

      if (body.active !== false) {
        throw new ServiceDeskApiError(
          "api.ticketActions.invalidPatch",
          400,
        );
      }

      const isInternal = await isInternalUser(request);
      const numericActionNo = Number(actionNo);
      const { ticket } = getTicketContext(ticketId, isInternal);

      if (ticket.status === "Draft" || ticket.status === "Closed") {
        throw new ServiceDeskApiError(
          "api.ticketActions.removeForbiddenByStatus",
          409,
          { ticketId, status: ticket.status },
        );
      }

      const actions = getLocalDemoActions(isInternal);
      const actionIndex = actions.findIndex(
        (candidate) =>
          candidate.ticket_id === ticketId &&
          candidate.action_no === numericActionNo &&
          candidate.active !== false,
      );
      const action = actionIndex >= 0 ? actions[actionIndex] : null;

      if (!action) {
        throw new ServiceDeskApiError("api.ticketActions.notFound", 404);
      }

      if (action.action_type !== "COMMENT" && action.action_type !== "NOTE") {
        throw new ServiceDeskApiError(
          "api.ticketActions.operationalRemoveForbidden",
          403,
        );
      }

      if (action.owner_username !== currentUserName) {
        throw new ServiceDeskApiError(
          "api.ticketActions.writerOnly",
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
      getLocalDemoHistories(isInternal).push({
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
      const status = error instanceof ServiceDeskApiError ? error.status : 500;
      const message =
        error instanceof ServiceDeskApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : tServiceDeskApi("api.ticketActions.remove");

      return NextResponse.json({ message }, { status });
    }
  }

  return portalApiJson(request, {
    method: "PATCH",
    path: `/service-desk/tickets/${ticketId}/actions/${actionNo}`,
    body,
    errorMessage: tServiceDeskApi("api.ticketActions.remove"),
  });
}
