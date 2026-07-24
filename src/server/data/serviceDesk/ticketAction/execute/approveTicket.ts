import {
  createServiceDeskStatusError as createStatusError,
  type ServiceDeskQueryExecutor,
} from "@/server/data/serviceDesk/shared";
import type { ServiceDeskTicketViewRow } from "@/server/data/serviceDesk/ticket/ticketRow";
import { updateTicketApprovalRoutingById } from "@/server/data/serviceDesk/ticket/ticketUpdateRepository";

import {
  createHistoryOfApprovalApproved,
  createHistoryOfApprovalRequested,
  createHistoryOfAssignmentResolvedByRule,
} from "../../ticketHistory/ticketHistoryEventService";
import { resolveApprovedTicketRouting } from "../shared/ticketActionRouting";
import {
  normalizeAssigneeUsernames,
  requireCurrentApprovalStepId,
} from "../ticketActionRules";

export async function approveTicket({
  ticket,
  ticketId,
  currentUserName,
  isAdmin,
  actionNo,
  query,
}: {
  ticket: ServiceDeskTicketViewRow;
  ticketId: string;
  currentUserName: string;
  isAdmin: boolean;
  actionNo: number;
  query: ServiceDeskQueryExecutor;
}) {
  const currentApprovalStepId = requireCurrentApprovalStepId(ticket);
  const routing = await resolveApprovedTicketRouting(ticket, {
    query,
    currentApprovalStepId,
  });
  const updatedTicket = await updateTicketApprovalRoutingById(
    ticketId,
    {
      ...routing,
      currentApprovalStepId,
      currentApproverUsername: currentUserName,
      isAdmin,
    },
    { query },
  );

  if (!updatedTicket) {
    throw createStatusError(
      "Approval action could not update the ticket.",
      409,
    );
  }

  await createHistoryOfApprovalApproved(
    {
      ticketId,
      actionNo,
      actorUsername: currentUserName,
      approvalStepId: currentApprovalStepId,
      nextApprovalStepId: routing.approvalStepId,
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
