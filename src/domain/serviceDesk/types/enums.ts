import { Period } from "@/domain/common/types";

export type TicketStatus =
  | "Pre"
  | "Open"
  | "Approved"
  | "Declined"
  | "Working"
  | "Pending"
  | "Resolved"
  | "Closed";

export type TicketPeriod = Exclude<Period, "today">;

export type TicketAttach = "file" | "image";
