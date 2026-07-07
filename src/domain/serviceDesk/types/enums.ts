import { TicketSearchPeriod } from "@/domain/common";

export type TicketStatus =
  | "Draft" // creating ticket.
  | "Approval" // created. waiting for approval.
  | "Declined"
  | "Assigned" // 1-created without approval. 2-approved.
  | "Working"
  | "Pending"
  | "Rejected"
  | "Resolved"
  | "Reopened"
  | "Closed";

export type TicketPeriod = Exclude<TicketSearchPeriod, "today">;

export type TicketAttach = "file" | "image";

export type NoteVisibility =
  | "private" // visible only to the author.
  | "shared"; // visible to internal operators (assignees, managers) and the author.

export type TicketResolutionReason =
  | "Completed"
  | "Merged"
  | "Rejected"
  | "Canceled";
