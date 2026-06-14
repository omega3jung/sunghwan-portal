import type { TicketWorkSessionStatus } from "./types";

export const TICKET_WORK_SESSION_NOTE_MAX_LENGTH = 500;

export const TICKET_WORK_SESSION_STATUS_OPTIONS = [
  "Working",
  "Pending",
  "Resolved",
] as const satisfies readonly TicketWorkSessionStatus[];
