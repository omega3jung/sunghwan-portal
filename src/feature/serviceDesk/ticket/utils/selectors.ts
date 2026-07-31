import type { TicketDetail, TicketSummary } from "@/domain/serviceDesk";

type TicketLike = Pick<
  TicketDetail | TicketSummary,
  | "status"
  | "assignmentPhase"
  | "approvalAssignees"
  | "workAssignees"
  | "approvalAssigneeUsernames"
  | "workAssigneeUsernames"
  | "isCurrentApprover"
  | "isCurrentWorker"
  | "mergedIntoTicketId"
>;

/** Selects ticket assignee ids from compatible ticket representations without mutating source data. */
export function selectTicketAssigneeIds(ticket: TicketLike) {
  return ticket.assignmentPhase === "APPROVAL"
    ? ticket.approvalAssigneeUsernames
    : ticket.workAssigneeUsernames;
}

/** Selects ticket assignees from compatible ticket representations without mutating source data. */
export function selectTicketAssignees(ticket: TicketLike) {
  return ticket.assignmentPhase === "APPROVAL"
    ? ticket.approvalAssignees
    : ticket.workAssignees;
}

/** Selects ticket is assigned from compatible ticket representations without mutating source data. */
export function selectTicketIsAssigned(ticket: TicketLike) {
  return ticket.isCurrentApprover || ticket.isCurrentWorker;
}

/** Selects ticket is merged from compatible ticket representations without mutating source data. */
export function selectTicketIsMerged(ticket: TicketLike) {
  return Boolean(ticket.mergedIntoTicketId);
}

/** Selects ticket is closed from compatible ticket representations without mutating source data. */
export function selectTicketIsClosed(ticket: TicketLike) {
  return ticket.status === "Closed";
}
