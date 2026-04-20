import type { TicketStatus } from "@/domain/serviceDesk";

const ACTIVE_TICKET_STATUSES: TicketStatus[] = [
  "Open",
  "Working",
  "Pending",
  "Resolved",
];

export function isClosedTicketStatus(status: TicketStatus) {
  return status === "Closed";
}

export function isActiveTicketStatus(status: TicketStatus) {
  return ACTIVE_TICKET_STATUSES.includes(status);
}

export function isEditableTicketStatus(status: TicketStatus) {
  return ["Draft", "Open", "Working", "Pending"].includes(status);
}
