import { toTicketMockDetailResource } from "@/app/api/_adapters/localDemo/serviceDesk/ticket/ticketResourceMapper";
import { ApiError } from "@/lib/application/api";
import { DbTicketDetail } from "@/lib/application/contracts/serviceDesk";
import { DbTicketHistory } from "@/lib/application/contracts/serviceDesk";

import { getLocalDemoHistories } from "../state";
import { withLocalTicketWorkerHistory } from "../workerHistory";
import {
  createUpdatedTicket,
  getMaxHistoryNo,
  getTicketContext,
} from "./utils";

type StartTicketWorkLocalContext = {
  ticketId: string;
  employeeUserName: string;
  isInternal?: boolean;
};

export function startTicketWorkLocal({
  ticketId,
  employeeUserName,
  isInternal = false,
}: StartTicketWorkLocalContext): DbTicketDetail {
  const { ticket, targetMock, index } = getTicketContext(ticketId, isInternal);

  validateAssignee(ticket, employeeUserName);

  if (ticket.status !== "Assigned") {
    return ticket;
  }

  const createdAt = new Date().toISOString();
  const updatedTicket = createUpdatedTicket(
    ticket,
    { status: "Working" },
    createdAt,
  );

  targetMock.splice(index, 1, updatedTicket);

  const histories = getLocalDemoHistories();
  histories.push(
    createStatusUpdatedHistory(
      ticket,
      updatedTicket.status,
      employeeUserName,
      createdAt,
      isInternal,
    ),
  );

  return updatedTicket;
}

export function toLocalStartWorkResponse(
  ticket: DbTicketDetail,
  currentUserName: string,
  isInternal = false,
) {
  const detail = toTicketMockDetailResource(ticket);

  return withLocalTicketWorkerHistory(
    {
      ...detail,
      owner: detail.requesterUsername === currentUserName,
      isCurrentApprover:
        detail.assignmentPhase === "APPROVAL" &&
        detail.approvalAssigneeUsernames.includes(currentUserName),
      isCurrentWorker:
        detail.assignmentPhase === "WORK" &&
        detail.workAssigneeUsernames.includes(currentUserName),
    },
    { isInternal, currentUserName },
  );
}

function validateAssignee(ticket: DbTicketDetail, employeeUserName: string) {
  if (ticket.approval_step_id !== null) {
    throw new ApiError(
      "serviceDesk.ticketCommand.localDemo.assigneeForbidden",
      403,
      {
        ticketId: ticket.id,
        username: employeeUserName,
      },
    );
  }

  if (ticket.assignee_usernames.includes(employeeUserName)) {
    return;
  }

  throw new ApiError(
    "serviceDesk.ticketCommand.localDemo.assigneeForbidden",
    403,
    {
      ticketId: ticket.id,
      username: employeeUserName,
    },
  );
}

function createStatusUpdatedHistory(
  ticket: DbTicketDetail,
  nextStatus: DbTicketDetail["status"],
  employeeUserName: string,
  createdAt: string,
  isInternal: boolean,
): DbTicketHistory {
  return {
    ticket_id: ticket.id,
    history_no: getMaxHistoryNo(ticket.id, isInternal),
    type: "STATUS",
    event: "STATUS_UPDATED",
    source: "USER_ACTION",
    actor_username: employeeUserName,
    action_no: null,
    from_value: { status: ticket.status },
    to_value: { status: nextStatus },
    metadata: {
      previousStatus: ticket.status,
      nextStatus,
    },
    created_at: createdAt,
  };
}
