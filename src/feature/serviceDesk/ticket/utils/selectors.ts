import type { TicketDetail, TicketSummary } from "@/domain/serviceDesk";

type TicketLike = Pick<
  TicketDetail | TicketSummary,
  "status" | "assigneeIds" | "mergedIntoTicketId"
>;

export function selectTicketAssigneeIds(ticket: TicketLike) {
  return ticket.assigneeIds;
}

export function selectTicketIsMerged(ticket: TicketLike) {
  return Boolean(ticket.mergedIntoTicketId);
}

export function selectTicketIsClosed(ticket: TicketLike) {
  return ticket.status === "Closed";
}
