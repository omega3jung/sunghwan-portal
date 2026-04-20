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
  | "Reopen"
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
