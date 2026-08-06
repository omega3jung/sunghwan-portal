import type { TicketStatus } from "@/domain/serviceDesk";

/** Distinguishes timestamp-range tracking from direct duration entry. */
export type TicketWorkSessionEntryMode = "range" | "duration";
export type TicketWorkSessionInputMode = TicketWorkSessionEntryMode;

/** Ticket states a submitted work session may request as its next state. */
export type TicketWorkSessionStatus = Extract<
  TicketStatus,
  "Working" | "Pending" | "Resolved"
>;

export type TicketWorkSessionSubmitPayload = {
  ticketId: string;
  inputMode: TicketWorkSessionInputMode;
  durationMinutes?: number;
  startAt?: string;
  endAt?: string;
  nextStatus?: TicketWorkSessionStatus;
  note?: string;
};
