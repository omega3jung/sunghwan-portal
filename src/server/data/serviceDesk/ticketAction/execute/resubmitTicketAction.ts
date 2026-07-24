import type { ServiceDeskQueryExecutor } from "@/server/data/serviceDesk/shared";
import type { ServiceDeskTicketViewRow } from "@/server/data/serviceDesk/ticket/ticketRow";
import { updateTicketInitialRoutingById } from "@/server/data/serviceDesk/ticket/ticketUpdateRepository";

import {
  createHistoryOfApprovalRequested,
  createHistoryOfAssignmentResolvedByRule,
} from "../../ticketHistory/ticketHistoryEventService";
import { createTicketHistory } from "../../ticketHistory/ticketHistoryService";
import { resolveInitialTicketRouting } from "../shared/ticketActionRouting";
import {
  assertRequesterActionAllowed,
  assertTicketUpdated,
  compactHistoryObject,
  normalizeAssigneeUsernames,
  type NormalizedTicketActionPayload,
  normalizeHistoryMetadataRecord,
} from "../ticketActionRules";

export async function executeResubmitTicketAction({
  ticket,
  ticketId,
  actionNo,
  currentUserName,
  payload,
  query,
}: {
  ticket: ServiceDeskTicketViewRow;
  ticketId: string;
  actionNo: number;
  currentUserName: string;
  payload: NormalizedTicketActionPayload;
  query: ServiceDeskQueryExecutor;
}) {
  assertRequesterActionAllowed(ticket, currentUserName);

  const routing = await resolveInitialTicketRouting(ticket, { query });
  const updatedTicket = await updateTicketInitialRoutingById(
    ticketId,
    {
      approvalStepId: routing.approvalStepId,
      assigneeUsernames: routing.assigneeUsernames,
      status: routing.status,
    },
    { query },
  );

  assertTicketUpdated(
    updatedTicket,
    "Resubmit action could not update the ticket.",
  );

  await createTicketHistory(
    {
      ticketId,
      actionNo,
      historyType: "TICKET",
      source: "USER_ACTION",
      event: "TICKET_SUBMITTED",
      actorUsername: currentUserName,
      fromValue: { status: ticket.tk_status },
      toValue: {
        status: routing.status,
        approvalStepId: routing.approvalStepId,
        assigneeUsernames: routing.assigneeUsernames,
      },
      metadata: compactHistoryObject({
        ...normalizeHistoryMetadataRecord(payload.historyMetadata),
        reason: payload.content,
        previousStatus: ticket.tk_status,
        nextStatus: routing.status,
      }),
    },
    { query },
  );

  if (routing.approvalStepId !== null) {
    await createHistoryOfApprovalRequested(
      {
        ticketId,
        actionNo,
        actorUsername: currentUserName,
        approvalStepId: routing.approvalStepId,
        assigneeUsernames: routing.assigneeUsernames,
      },
      { query },
    );
  } else {
    await createHistoryOfAssignmentResolvedByRule(
      {
        ticketId,
        actionNo,
        actorUsername: currentUserName,
        fromAssigneeUsernames: normalizeAssigneeUsernames(
          ticket.tk_assignee_usernames,
        ),
        toAssigneeUsernames: routing.assigneeUsernames,
        metadata: {
          previousStatus: ticket.tk_status,
          nextStatus: routing.status,
        },
      },
      { query },
    );
  }
}
