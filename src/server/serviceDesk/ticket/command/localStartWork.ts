import { ServiceDeskApiError } from "@/app/api/service-desk/_shared/messages";
import { DbTicketDetail } from "@/feature/serviceDesk/ticket/api";
import { toTicketMockDetailResource } from "@/feature/serviceDesk/ticketAction/mock";
import { DbTicketHistory } from "@/feature/serviceDesk/ticketHistory";

import { getLocalDemoHistories } from "../state";
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

  if (ticket.status !== "Approved") {
    return ticket;
  }

  const createdAt = new Date().toISOString();
  const updatedTicket = createUpdatedTicket(
    ticket,
    { status: "Working" },
    createdAt,
  );

  targetMock.splice(index, 1, updatedTicket);

  const histories = getLocalDemoHistories(isInternal);
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
) {
  const detail = toTicketMockDetailResource(ticket);

  return {
    ...detail,
    owner: detail.requesterId === currentUserName,
    assigned: detail.assigneeIds.includes(currentUserName),
  };
}

function validateAssignee(ticket: DbTicketDetail, employeeUserName: string) {
  if (ticket.assignee_id.includes(employeeUserName)) {
    return;
  }

  throw new ServiceDeskApiError(
    "api.ticketCommand.localDemo.assigneeForbidden",
    403,
    {
      ticketId: ticket.id,
      userName: employeeUserName,
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
    action: "UPDATED",
    actor_id: employeeUserName,
    action_no: null,
    from_value: ticket.status,
    to_value: nextStatus,
    metadata: {
      source: "auto-start-on-view",
    },
    created_at: createdAt,
  };
}
