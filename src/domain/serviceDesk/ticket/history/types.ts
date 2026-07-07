/* TicketHistory is defined by combination of HistoryType and TicketHistoryAction.
 * exception is defined to TicketHistoryAction.
 *
 * ex) ticket created = "TICKET", "CREATED"
 * ex) comment updated = "COMMENT", "UPDATED"
 * ex) approval declined = "APPROVAL", "APPROVAL_DECLINED"
 * ex) ticket resolved = "STATUS", "UPDATED", from_value = { status: "Working" }, to_value = { status: "Resolved" }
 * ex) system closed = "SYSTEM", "UPDATED", to_value = { status: "Closed" }
 * ex) ticket reopened = "STATUS", "UPDATED", from_value = { status: "Resolved" }, to_value = { status: "Reopened" }
 */
export type HistoryType =
  | "TICKET"
  | "STATUS"
  | "CATEGORY"
  | "ASSIGNMENT"
  | "APPROVAL"
  | "COMMENT"
  | "NOTE"
  | "PLANNING"
  | "SYSTEM";

export type TicketHistoryAction =
  | "CREATED"
  | "UPDATED"
  | "DELETED"
  | "TICKET_REJECTED"
  | "TICKET_MERGED"
  | "TICKET_CANCELED"
  | "APPROVAL_REQUESTED"
  | "APPROVAL_APPROVED"
  | "APPROVAL_DECLINED";
