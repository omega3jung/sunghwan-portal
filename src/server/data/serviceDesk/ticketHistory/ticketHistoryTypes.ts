export type TicketHistoryType =
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
  | "DRAFT_CREATED"
  | "DRAFT_UPDATED"
  | "SUBMITTED"
  | "STATUS_CHANGED"
  | "CATEGORY_CHANGED"
  | "ASSIGNED"
  | "REASSIGNED"
  | "APPROVAL_REQUESTED"
  | "APPROVAL_APPROVED"
  | "APPROVAL_DECLINED"
  | "COMMENT_CREATED"
  | "NOTE_CREATED"
  | "ADJUSTED"
  | "MERGED"
  | "REJECTED"
  | "REOPENED"
  | "RESUBMITTED"
  | "SYSTEM_UPDATED"
  | "TICKET_REJECTED"
  | "TICKET_MERGED";

export type TicketHistoryJsonValue =
  | string
  | number
  | boolean
  | null
  | TicketHistoryJsonValue[]
  | { [key: string]: TicketHistoryJsonValue };
