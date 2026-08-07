/**
 * A history record is classified by the changed target, the producer, and the
 * immutable event. No single dimension fully describes the recorded change.
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

/** Authority that produced an immutable ticket history event. */
export type TicketHistorySource =
  | "USER_ACTION"
  | "SYSTEM_AUTO"
  | "ROUTING_RULE"
  | "APPROVAL_RULE"
  | "ASSIGNMENT_RULE";

/** Immutable event kinds represented in the ticket activity history. */
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
