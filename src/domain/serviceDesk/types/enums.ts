import { TicketSearchPeriod } from "@/domain/common";

export type TicketStatus =
  | "Draft" // creating ticket.
  | "Open"
  | "Approved"
  | "Declined"
  | "Working"
  | "Pending"
  | "Rejected"
  | "Resolved"
  | "Closed";

export type TicketPeriod = Exclude<TicketSearchPeriod, "today">;

export type TicketAttach = "file" | "image";

export type CommentVisibility = "public" | "internal";

export type HistoryType =
  | "STATUS"
  | "FIELD"
  | "ASSIGNMENT"
  | "APPROVAL"
  | "COMMENT"
  | "TRACK_TIME"
  | "SLA"
  | "SYSTEM";

export type TicketHistoryAction =
  | "CREATED"
  | "UPDATED"
  | "DELETED"
  | "STATUS_CHANGED"
  | "ASSIGNEE_CHANGED"
  | "APPROVAL_REQUESTED"
  | "APPROVAL_APPROVED"
  | "APPROVAL_DECLINED"
  | "COMMENT_CREATED"
  | "COMMENT_UPDATED"
  | "COMMENT_DELETED"
  | "TRACK_TIME_UPDATED";
