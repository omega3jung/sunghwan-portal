import { Period } from "@/domain/common/types";

export type TicketStatus =
  | "Draft" // creating ticket.
  | "Open"
  | "Approved"
  | "Declined"
  | "Working"
  | "Pending"
  | "Resolved"
  | "Closed";

export type TicketPeriod = Exclude<Period, "today">;

export type TicketAttach = "file" | "image";

export type CommentVisibility = "public" | "internal";
