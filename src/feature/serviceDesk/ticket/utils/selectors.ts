import type { TicketDetail, TicketSummary } from "@/domain/serviceDesk";

type TicketLike = Pick<
  TicketDetail | TicketSummary,
  | "status"
  | "assignmentPhase"
  | "approvalAssigneeUsernames"
  | "workAssigneeUsernames"
  | "assignedApprover"
  | "assignedWorker"
  | "mergedIntoTicketId"
>;

export function selectTicketAssigneeIds(ticket: TicketLike) {
  return ticket.assignmentPhase === "APPROVAL"
    ? ticket.approvalAssigneeUsernames
    : ticket.workAssigneeUsernames;
}

export function selectTicketIsAssigned(ticket: TicketLike) {
  return ticket.assignedApprover || ticket.assignedWorker;
}

export function selectTicketIsMerged(ticket: TicketLike) {
  return Boolean(ticket.mergedIntoTicketId);
}

export function selectTicketIsClosed(ticket: TicketLike) {
  return ticket.status === "Closed";
}
