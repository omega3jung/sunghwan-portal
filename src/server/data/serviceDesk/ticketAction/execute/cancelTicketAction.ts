import type { ServiceDeskQueryExecutor } from "@/server/data/serviceDesk/shared";
import type { ServiceDeskTicketViewRow } from "@/server/data/serviceDesk/ticket/ticketRow";
import { updateTicketCloseStateById } from "@/server/data/serviceDesk/ticket/ticketUpdateRepository";
import { finishRunningWorkSessionsByTicketId } from "@/server/data/serviceDesk/workSession";

import { createHistoryOfTicketCanceled } from "../../ticketHistory/ticketHistoryEventService";
import {
  assertRequesterActionAllowed,
  assertTicketUpdated,
  type NormalizedTicketActionPayload,
  requireNextTicketStatus,
  type TicketActionExecutionMode,
} from "../ticketActionRules";

export async function executeCancelTicketAction({
  ticket,
  ticketId,
  actionNo,
  currentUserName,
  payload,
  actionMode,
  query,
}: {
  ticket: ServiceDeskTicketViewRow;
  ticketId: string;
  actionNo: number;
  currentUserName: string;
  payload: NormalizedTicketActionPayload;
  actionMode: TicketActionExecutionMode;
  query: ServiceDeskQueryExecutor;
}) {
  assertRequesterActionAllowed(ticket, currentUserName);

  const status = requireNextTicketStatus(actionMode, ticket.tk_status);
  const updatedTicket = await updateTicketCloseStateById(ticketId, { query });

  assertTicketUpdated(
    updatedTicket,
    "Cancel action could not update the ticket.",
  );

  await finishRunningWorkSessionsByTicketId(
    ticketId,
    new Date().toISOString(),
    { query },
  );

  await createHistoryOfTicketCanceled(
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
