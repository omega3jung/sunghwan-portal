import { ServiceDeskApiError } from "@/app/api/service-desk/_shared/messages";
import { DbTicketDetail } from "@/feature/serviceDesk/ticket/api/types";

import { LocalActionRuntimeContext, TicketActionExecutionMode } from "../types";
import { getLocalDemoNextStatus } from "./rules";

export const requireTicket = ({
  ticket,
  ticketId,
}: LocalActionRuntimeContext): DbTicketDetail => {
  if (!ticket) {
    throw new ServiceDeskApiError(
      "api.ticketCommand.localDemo.ticketNotFound",
      404,
      { ticketId },
    );
  }

  return ticket;
};

export const resolveNextTicketStatus = (
  actionMode: TicketActionExecutionMode,
  ticket?: DbTicketDetail,
) => {
  if (!ticket) {
    return undefined;
  }

  return getLocalDemoNextStatus(actionMode, ticket.status);
};

export const requireNextStatus = ({
  nextStatus,
}: Pick<LocalActionRuntimeContext, "nextStatus">) => {
  if (!nextStatus) {
    throw new ServiceDeskApiError(
      "api.ticketCommand.localDemo.nextStatusUnresolved",
      400,
    );
  }

  return nextStatus;
};
