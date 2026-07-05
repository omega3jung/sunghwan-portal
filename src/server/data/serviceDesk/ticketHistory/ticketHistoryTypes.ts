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
  | "TICKET_REJECTED"
  | "TICKET_MERGED"
  | "APPROVAL_REQUESTED"
  | "APPROVAL_APPROVED"
  | "APPROVAL_DECLINED";

export type TicketHistoryJsonValue =
  | string
  | number
  | boolean
  | null
  | TicketHistoryJsonValue[]
  | { [key: string]: TicketHistoryJsonValue };
