import type { ServiceDeskQueryExecutor } from "@/server/data/serviceDesk/shared";
import type { ServiceDeskTicketViewRow } from "@/server/data/serviceDesk/ticket/ticketRow";
import { updateTicketAssigneesById } from "@/server/data/serviceDesk/ticket/ticketUpdateRepository";

import { createHistoryOfAssignmentChange } from "../../ticketHistory/ticketHistoryEventService";
import {
  assertAdminActionAllowed,
  assertTicketUpdated,
  assertWorkAssigneeOrAdmin,
  compactHistoryObject,
  normalizeAssigneeUsernames,
  type NormalizedTicketActionPayload,
  normalizeHistoryMetadataRecord,
  resolveNextTicketStatus,
  type TicketActionExecutionMode,
} from "../ticketActionRules";

export async function executeAssignTicketAction({
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
  const assignmentPhase = ticket.tk_status === "Approval" ? "APPROVAL" : "WORK";

  if (assignmentPhase === "APPROVAL") {
    assertAdminActionAllowed(isAdmin, "Only an admin can reassign approvers.");
  } else {
    assertWorkAssigneeOrAdmin(ticket, currentUserName, isAdmin);
  }

  const assigneeUsernames = payload.assigneeUsernames;
  const status =
    resolveNextTicketStatus(actionMode, ticket.tk_status) ?? ticket.tk_status;
  // TODO(notification): Resolve assignee emails through a trusted server-side
  // employee email resolver at send time. Do not persist derived emails in tk_email.
  const updatedTicket = await updateTicketAssigneesById(
    ticketId,
    { assigneeUsernames, status },
    { query },
  );

  assertTicketUpdated(
    updatedTicket,
    "Assignment action could not update the ticket.",
  );

  await createHistoryOfAssignmentChange(
    {
      ticketId,
      actionNo,
      actorUsername: currentUserName,
      fromAssigneeUsernames: normalizeAssigneeUsernames(
        ticket.tk_assignee_usernames,
      ),
      toAssigneeUsernames: assigneeUsernames,
      metadata: compactHistoryObject({
        ...normalizeHistoryMetadataRecord(payload.historyMetadata),
        assignmentPhase,
        approvalStepId:
          assignmentPhase === "APPROVAL"
            ? ticket.tk_approval_step_id
            : undefined,
        previousStatus: ticket.tk_status,
        nextStatus: status,
      }),
    },
    { query },
  );
}
