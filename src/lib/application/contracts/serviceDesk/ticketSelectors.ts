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

export function selectTicketAssigneeIds(ticket: TicketLike) {
  return ticket.assignmentPhase === "APPROVAL"
    ? ticket.approvalAssigneeUsernames
    : ticket.workAssigneeUsernames;
}

export function selectTicketIsAssigned(ticket: TicketLike) {
  return ticket.isCurrentApprover || ticket.isCurrentWorker;
}

export function selectTicketIsMerged(ticket: TicketLike) {
  return Boolean(ticket.mergedIntoTicketId);
}

export function selectTicketIsClosed(ticket: TicketLike) {
  return ticket.status === "Closed";
}
