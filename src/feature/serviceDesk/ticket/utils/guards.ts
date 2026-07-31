import type { TicketStatus } from "@/domain/serviceDesk";

const ACTIVE_TICKET_STATUSES: TicketStatus[] = [
  "Approval",
  "Assigned",
  "Working",
  "Pending",
  "Resolved",
];

/** Reports whether closed ticket status satisfies the feature policy. */
export function isClosedTicketStatus(status: TicketStatus) {
  return status === "Closed";
}

/** Reports whether active ticket status satisfies the feature policy. */
export function isActiveTicketStatus(status: TicketStatus) {
  return ACTIVE_TICKET_STATUSES.includes(status);
}

/** Reports whether editable ticket status satisfies the feature policy. */
export function isEditableTicketStatus(status: TicketStatus) {
  return ["Draft", "Approval", "Assigned", "Working", "Pending"].includes(
    status,
  );
}
