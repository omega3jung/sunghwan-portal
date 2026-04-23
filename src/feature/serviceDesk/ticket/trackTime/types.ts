import type { TicketStatus } from "@/domain/serviceDesk";

export type TicketTrackTimeEntryMode = "range" | "duration";
export type TicketTrackTimeInputMode = TicketTrackTimeEntryMode;

export type TicketTrackTimeStatus = Extract<
  TicketStatus,
  "Working" | "Pending" | "Resolved"
>;

export type TicketTrackTimeSubmitPayload = {
  ticketId: string;
  inputMode: TicketTrackTimeInputMode;
  durationMinutes?: number;
  startAt?: string;
  endAt?: string;
  trackedMinutes: number;
  nextStatus?: TicketTrackTimeStatus;
  note?: string;
};
