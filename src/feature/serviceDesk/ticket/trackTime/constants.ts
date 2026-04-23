import type { TicketTrackTimeStatus } from "./types";

export const TICKET_TRACK_TIME_NOTE_MAX_LENGTH = 500;

export const TICKET_TRACK_TIME_STATUS_OPTIONS = [
  "Working",
  "Pending",
  "Resolved",
] as const satisfies readonly TicketTrackTimeStatus[];
