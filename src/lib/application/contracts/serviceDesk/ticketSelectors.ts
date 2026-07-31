import type { TicketDetail, TicketSummary } from "@/domain/serviceDesk";

type TicketLike = Pick<
  TicketDetail | TicketSummary,
  | "status"
  | "assignmentPhase"
  | "approvalAssigneeUsernames"
  | "workAssigneeUsernames"
  | "isCurrentApprover"
  | "isCurrentWorker"
  | "mergedIntoTicketId"
>;

/**
 * Selects the usernames responsible for the ticket's current workflow phase.
 * Approval and work assignees are separate projections even though persistence
 * stores the current responsible usernames in one field.
 */
export function selectTicketAssigneeIds(ticket: TicketLike) {
  return ticket.assignmentPhase === "APPROVAL"
    ? ticket.approvalAssigneeUsernames
    : ticket.workAssigneeUsernames;
}

/** Returns the viewer-relative assignment flag projected onto a ticket. */
export function selectTicketIsAssigned(ticket: TicketLike) {
  return ticket.isCurrentApprover || ticket.isCurrentWorker;
}

/** Returns whether the ticket has been merged into another ticket. */
export function selectTicketIsMerged(ticket: TicketLike) {
  return Boolean(ticket.mergedIntoTicketId);
}

/** Returns whether the ticket is in its terminal Closed status. */
export function selectTicketIsClosed(ticket: TicketLike) {
  return ticket.status === "Closed";
}
