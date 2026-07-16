import { canMergeTicketInto } from "@/domain/serviceDesk/ticket/merge";
import { ApiError } from "@/lib/application/api";
import { DbTicketDetail } from "@/lib/application/contracts/serviceDesk";

import { getLocalDemoTickets } from "../state";
import { requireTicket } from "./ticketContext";
import { LocalActionRuntimeContext } from "./types";

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
    throw new ApiError(
      "serviceDesk.ticketCommand.localDemo.mergeTargetNotFound",
      404,
    );
  }

  if (sourceTicket.status === "Draft") {
    throw new ApiError(
      "serviceDesk.ticketCommand.localDemo.draftCannotBeMerged",
      400,
    );
  }

  if (targetTicket.status === "Draft") {
    throw new ApiError(
      "serviceDesk.ticketCommand.localDemo.cannotMergeIntoDraft",
      400,
    );
  }

  if (sourceTicket.merged_into_ticket_id) {
    throw new ApiError(
      "serviceDesk.ticketCommand.localDemo.ticketAlreadyMerged",
      400,
    );
  }

  if (targetTicket.merged_into_ticket_id) {
    throw new ApiError(
      "serviceDesk.ticketCommand.localDemo.mergeTargetAlreadyMerged",
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
    throw new ApiError(
      "serviceDesk.ticketCommand.localDemo.invalidMergeTarget",
      400,
    );
  }

  return {
    sourceTicket,
    targetTicket,
  };
};
