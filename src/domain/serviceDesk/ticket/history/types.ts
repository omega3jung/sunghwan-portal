/* TicketHistory is defined by combination of HistoryType and TicketHistoryAction.
 * exception is defined to TicketHistoryAction.
 *
 * ex) ticket created = "TICKET", "CREATED"
 * ex) comment updated = "COMMENT", "UPDATED"
 * ex) approval declined = "APPROVAL", "APPROVAL_DECLINED"
 */
export type HistoryType =
  | "TICKET"
  | "STATUS"
  | "CATEGORY"
  | "ASSIGNMENT"
  | "APPROVAL"
  | "COMMENT"
  | "NOTE"
  | "WORK_SESSION"
  | "PLANNING"
  | "SYSTEM";

export type TicketHistoryAction =
  | "CREATED"
  | "UPDATED"
  | "DELETED"
  | "TICKET_REJECTED"
  | "TICKET_MERGED"
  | "APPROVAL_REQUESTED"
  | "APPROVAL_APPROVED";
