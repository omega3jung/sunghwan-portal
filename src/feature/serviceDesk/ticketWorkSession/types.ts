import type { TicketStatus } from "@/domain/serviceDesk";

export type TicketWorkSessionEntryMode = "range" | "duration";
export type TicketWorkSessionInputMode = TicketWorkSessionEntryMode;

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
  trackedMinutes: number;
  nextStatus?: TicketWorkSessionStatus;
  note?: string;
};
