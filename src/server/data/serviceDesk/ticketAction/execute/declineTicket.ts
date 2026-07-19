import type { TicketStatus } from "@/domain/serviceDesk";
import {
  createServiceDeskStatusError as createStatusError,
  type ServiceDeskQueryExecutor,
} from "@/server/data/serviceDesk/shared";
import type { ServiceDeskTicketViewRow } from "@/server/data/serviceDesk/ticket/ticketRow";
import { updateTicketApprovalRoutingById } from "@/server/data/serviceDesk/ticket/ticketUpdateRepository";

import { createHistoryOfApprovalDeclined } from "../../ticketHistory/ticketHistoryEventService";
import { requireCurrentApprovalStepId } from "../ticketActionRules";

export async function declineTicket({
  ticket,
  ticketId,
  currentUserName,
  isAdmin,
  actionNo,
  reason,
  fromStatus,
  toStatus,
  query,
}: {
  ticket: ServiceDeskTicketViewRow;
  ticketId: string;
  currentUserName: string;
  isAdmin: boolean;
  actionNo: number;
  reason: string;
  fromStatus: TicketStatus;
  toStatus: TicketStatus;
  query: ServiceDeskQueryExecutor;
}) {
  const currentApprovalStepId = requireCurrentApprovalStepId(ticket);
  const updatedTicket = await updateTicketApprovalRoutingById(
    ticketId,
    {
      approvalStepId: null,
      assigneeUsernames: [],
      status: "Declined",
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

  await createHistoryOfApprovalDeclined(
    {
      ticketId,
      actionNo,
      actorUsername: currentUserName,
      approvalStepId: currentApprovalStepId,
      fromStatus,
      toStatus,
      reason,
    },
    { query },
  );
}
