/* TicketHistory is defined by combination of HistoryType and TicketHistoryAction.
 * exception is defined to TicketHistoryAction.
 *
 * ex) ticket created = "TICKET", "CREATED"
 * ex) comment updated = "COMMENT", "UPDATED"
 * ex) approval declined = "APPROVAL", "APPROVAL_DECLINED"
 * ex) ticket resolved = "TICKET", "UPDATED", from_value = "Working", to_value = "Resolved"
 * ex) system closed = "SYSTEM", "UPDATED", to_value = "Closed"
 * ex) ticket reopened = "TICKET", "UPDATED", from_value = "Resolved", to_value = "Reopened"
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
  | "APPROVAL_REQUESTED"
  | "APPROVAL_APPROVED"
  | "APPROVAL_DECLINED";
