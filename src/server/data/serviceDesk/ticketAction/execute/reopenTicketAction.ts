import {
  createServiceDeskStatusError as createStatusError,
  type ServiceDeskQueryExecutor,
} from "@/server/data/serviceDesk/shared";
import type { ServiceDeskTicketViewRow } from "@/server/data/serviceDesk/ticket/ticketRow";
import { updateTicketStatusById } from "@/server/data/serviceDesk/ticket/ticketUpdateRepository";

import { createHistoryOfStatusChange } from "../../ticketHistory/ticketHistoryEventService";
import {
  assertRequesterOrAdmin,
  assertTicketUpdated,
  compactHistoryObject,
  normalizeAssigneeUsernames,
  type NormalizedTicketActionPayload,
  normalizeHistoryMetadataRecord,
  requireNextTicketStatus,
  type TicketActionExecutionMode,
} from "../ticketActionRules";

export async function executeReopenTicketAction({
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
  assertRequesterOrAdmin(ticket, currentUserName, isAdmin);

  if (normalizeAssigneeUsernames(ticket.tk_assignee_usernames).length === 0) {
    throw createStatusError("Resolved ticket has no assignee to reopen.", 409);
  }

  const status = requireNextTicketStatus(actionMode, ticket.tk_status);
  const updatedTicket = await updateTicketStatusById(
    ticketId,
    { status },
    { query },
  );

  assertTicketUpdated(
    updatedTicket,
    "Status action could not update the ticket.",
  );

  await createHistoryOfStatusChange(
    {
      ticketId,
      actionNo,
      actorUsername: currentUserName,
      fromStatus: ticket.tk_status,
      toStatus: status,
      reason: payload.content,
      metadata: compactHistoryObject({
        ...normalizeHistoryMetadataRecord(payload.historyMetadata),
        event: "TICKET_REOPENED",
        previousStatus: ticket.tk_status,
        nextStatus: status,
        previousAssigneeUsernames: normalizeAssigneeUsernames(
          ticket.tk_assignee_usernames,
        ),
        nextAssigneeUsernames: normalizeAssigneeUsernames(
          ticket.tk_assignee_usernames,
        ),
      }),
    },
    { query },
  );
}
