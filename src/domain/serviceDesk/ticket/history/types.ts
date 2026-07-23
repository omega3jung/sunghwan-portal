/* TicketHistory is defined by changed target, source, and event.
 *
 * ex) ticket submitted = type "TICKET", source "USER_ACTION", event "TICKET_SUBMITTED"
 * ex) comment created = type "COMMENT", source "USER_ACTION", event "COMMENT_CREATED"
 * ex) approval requested = type "APPROVAL", source "APPROVAL_RULE", event "APPROVAL_REQUESTED"
 * ex) approval declined = type "APPROVAL", source "USER_ACTION", event "APPROVAL_DECLINED"
 * ex) ticket resolved = type "STATUS", source "USER_ACTION", event "STATUS_UPDATED"
 * ex) system close = type "STATUS", source "SYSTEM_AUTO", event "RESOLUTION_CLOSE"
 */
export type HistoryType =
  | "TICKET"
  | "STATUS"
  | "CATEGORY"
  | "ASSIGNMENT"
  | "APPROVAL"
  | "COMMENT"
  | "NOTE"
  | "PLANNING";

export type TicketHistorySource =
  | "USER_ACTION"
  | "SYSTEM_AUTO"
  | "ROUTING_RULE"
  | "APPROVAL_RULE"
  | "ASSIGNMENT_RULE";

export type TicketHistoryEvent =
  | "TICKET_SUBMITTED"
  | "TICKET_UPDATED"
  | "TICKET_REOPENED"
  | "TICKET_REJECTED"
  | "TICKET_MERGED"
  | "TICKET_CANCELED"
  | "CATEGORY_UPDATED"
  | "STATUS_UPDATED"
  | "RESOLUTION_CLOSE"
  | "APPROVAL_REQUESTED"
  | "APPROVAL_APPROVED"
  | "APPROVAL_DECLINED"
  | "ASSIGNMENT_RESOLVED"
  | "ASSIGNMENT_UPDATED"
  | "COMMENT_CREATED"
  | "COMMENT_UPDATED"
  | "COMMENT_DELETED"
  | "NOTE_CREATED"
  | "NOTE_UPDATED"
  | "NOTE_DELETED"
  | "PLANNING_UPDATED"
  | "WORK_SESSION_STARTED"
  | "WORK_SESSION_STOPPED"
  | "WORK_SESSION_UPDATED"
  | "WORK_SESSION_DELETED"
  | "ROUTING_RESET"
  | "ROUTING_PRESERVED";

export type TicketCloseReason =
  | "Completed"
  | "Rejected"
  | "Merged"
  | "Escalated"
  | "Canceled";
