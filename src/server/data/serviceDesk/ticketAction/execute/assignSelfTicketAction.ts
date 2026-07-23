import {
  createServiceDeskStatusError as createStatusError,
  type ServiceDeskQueryExecutor,
} from "@/server/data/serviceDesk/shared";
import type { ServiceDeskTicketViewRow } from "@/server/data/serviceDesk/ticket/ticketRow";
import { updateTicketAssigneesById } from "@/server/data/serviceDesk/ticket/ticketUpdateRepository";

import { createHistoryOfAssignmentChange } from "../../ticketHistory/ticketHistoryEventService";
import {
  assertTicketUpdated,
  assertWorkAssignee,
  compactHistoryObject,
  normalizeAssigneeUsernames,
  type NormalizedTicketActionPayload,
  normalizeHistoryMetadataRecord,
} from "../ticketActionRules";

export async function executeAssignSelfTicketAction({
  ticket,
  ticketId,
  actionNo,
  currentUserName,
  isAdmin: _isAdmin,
  payload,
  query,
}: {
  ticket: ServiceDeskTicketViewRow;
  ticketId: string;
  actionNo: number;
  currentUserName: string;
  isAdmin: boolean;
  payload: NormalizedTicketActionPayload;
  query: ServiceDeskQueryExecutor;
}) {
  const currentAssigneeUsernames = normalizeAssigneeUsernames(
    ticket.tk_assignee_usernames,
  );

  assertWorkAssignee(ticket, currentUserName);

  if (currentAssigneeUsernames.length < 2) {
    throw createStatusError(
      "Assign self requires at least two current assignees.",
      409,
    );
  }

  const assigneeUsernames = [currentUserName];
  const updatedTicket = await updateTicketAssigneesById(
    ticketId,
    { assigneeUsernames, status: ticket.tk_status },
    { query },
  );

  assertTicketUpdated(
    updatedTicket,
    "Assign self action could not update the ticket.",
  );

  await createHistoryOfAssignmentChange(
    {
      ticketId,
      actionNo,
      actorUsername: currentUserName,
      fromAssigneeUsernames: currentAssigneeUsernames,
      toAssigneeUsernames: assigneeUsernames,
      metadata: compactHistoryObject({
        ...normalizeHistoryMetadataRecord(payload.historyMetadata),
        claimedByUsername: currentUserName,
      }),
    },
    { query },
  );
}
