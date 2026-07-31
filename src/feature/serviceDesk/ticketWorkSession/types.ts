import type { TicketStatus } from "@/domain/serviceDesk";

/** Distinguishes range-based tracking from duration-based entry. */
export type TicketWorkSessionEntryMode = "range" | "duration";
/** Defines the ticket work session input mode accepted at this feature boundary. */
export type TicketWorkSessionInputMode = TicketWorkSessionEntryMode;

/** Enumerates the ticket statuses a submitted work session may request. */
export type TicketWorkSessionStatus = Extract<
  TicketStatus,
  "Working" | "Pending" | "Resolved"
>;

/** Defines the ticket work session submit payload accepted at this feature boundary. */
export type TicketWorkSessionSubmitPayload = {
  ticketId: string;
  inputMode: TicketWorkSessionInputMode;
  durationMinutes?: number;
  startAt?: string;
  endAt?: string;
  nextStatus?: TicketWorkSessionStatus;
  note?: string;
};
