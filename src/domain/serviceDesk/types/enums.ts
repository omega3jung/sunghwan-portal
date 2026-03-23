import { TicketSearchPeriod } from "@/domain/common";

export type TicketStatus =
  | "Draft" // creating ticket.
  | "Open"
  | "Approved"
  | "Declined"
  | "Working"
  | "Pending"
  | "Resolved"
  | "Closed";

export type TicketPeriod = Exclude<TicketSearchPeriod, "today">;

export type TicketAttach = "file" | "image";

export type CommentVisibility = "public" | "internal";
