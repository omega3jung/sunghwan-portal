import type { ServiceDeskQueryExecutor } from "@/server/data/serviceDesk/shared";
import type { ServiceDeskTicketViewRow } from "@/server/data/serviceDesk/ticket/ticketRow";
import { updateTicketStatusById } from "@/server/data/serviceDesk/ticket/ticketUpdateRepository";
import { finishRunningWorkSessionsByTicketId } from "@/server/data/serviceDesk/workSession";

import { createHistoryOfTicketRejected } from "../../ticketHistory/ticketHistoryEventService";
import {
  assertTicketUpdated,
  assertWorkAssigneeOrAdmin,
  type NormalizedTicketActionPayload,
  requireNextTicketStatus,
  type TicketActionExecutionMode,
} from "../ticketActionRules";

export async function executeRejectTicketAction({
  ticket,
  ticketId,
  actionNo,
  currentUserName,
  isAdmin,
  payload,
  actionMode,
  query,
}: {
  ticket: ServiceDeskTicketViewRow;
  ticketId: string;
  actionNo: number;
  currentUserName: string;
  isAdmin: boolean;
  payload: NormalizedTicketActionPayload;
  actionMode: TicketActionExecutionMode;
  query: ServiceDeskQueryExecutor;
}) {
  assertWorkAssigneeOrAdmin(ticket, currentUserName, isAdmin);

  const status = requireNextTicketStatus(actionMode, ticket.tk_status);
  const updatedTicket = await updateTicketStatusById(
    ticketId,
    { status },
    { query },
  );

  assertTicketUpdated(
    updatedTicket,
    "Reject action could not update the ticket.",
  );

  await finishRunningWorkSessionsByTicketId(
    ticketId,
    new Date().toISOString(),
    { query },
  );

  await createHistoryOfTicketRejected(
    {
      ticketId,
      actionNo,
      actorUsername: currentUserName,
      fromStatus: ticket.tk_status,
      toStatus: status,
      reason: payload.content,
      metadata: payload.historyMetadata,
    },
    { query },
  );
}
