import { ServiceDeskApiError } from "@/app/api/service-desk/_shared/messages";
import { canMergeTicketInto } from "@/domain/serviceDesk/ticket/merge";
import { DbTicketDetail } from "@/feature/serviceDesk/ticket/api/types";

import { getLocalDemoTickets } from "../../state";
import { LocalActionRuntimeContext } from "../types";
import { requireTicket } from "./ticketContext";

const toMergeAwareTicket = (ticket: DbTicketDetail) => ({
  id: ticket.id,
  status: ticket.status,
  closeReason: ticket.close_reason ?? undefined,
  mergedIntoTicketId: ticket.merged_into_ticket_id ?? null,
});

export const validateMergeTarget = (
  context: LocalActionRuntimeContext,
  targetTicketId: string,
) => {
  const sourceTicket = requireTicket(context);
  const tickets = getLocalDemoTickets(context.isInternal ?? false);
  const targetTicket = tickets.find((ticket) => ticket.id === targetTicketId);

  if (!targetTicket) {
    throw new ServiceDeskApiError(
      "api.ticketCommand.localDemo.mergeTargetNotFound",
      404,
    );
  }

  if (sourceTicket.status === "Draft") {
    throw new ServiceDeskApiError(
      "api.ticketCommand.localDemo.draftCannotBeMerged",
      400,
    );
  }

  if (targetTicket.status === "Draft") {
    throw new ServiceDeskApiError(
      "api.ticketCommand.localDemo.cannotMergeIntoDraft",
      400,
    );
  }

  if (sourceTicket.merged_into_ticket_id) {
    throw new ServiceDeskApiError(
      "api.ticketCommand.localDemo.ticketAlreadyMerged",
      400,
    );
  }

  if (targetTicket.merged_into_ticket_id) {
    throw new ServiceDeskApiError(
      "api.ticketCommand.localDemo.mergeTargetAlreadyMerged",
      400,
    );
  }

  const canMerge = canMergeTicketInto(
    toMergeAwareTicket(sourceTicket),
    toMergeAwareTicket(targetTicket),
    (ticketId) => {
      const nextTicket = tickets.find((ticket) => ticket.id === ticketId);
      return nextTicket ? toMergeAwareTicket(nextTicket) : undefined;
    },
  );

  if (!canMerge) {
    throw new ServiceDeskApiError(
      "api.ticketCommand.localDemo.invalidMergeTarget",
      400,
    );
  }

  return {
    sourceTicket,
    targetTicket,
  };
};
