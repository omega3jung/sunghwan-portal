import type { TicketWorkSessionStatus } from "./types";

/** Defines the ticket work session note max length policy shared by this feature's client workflows. */
export const TICKET_WORK_SESSION_NOTE_MAX_LENGTH = 500;

/** Defines the supported ticket work session status choices presented by the feature. */
export const TICKET_WORK_SESSION_STATUS_OPTIONS = [
  "Working",
  "Pending",
  "Resolved",
] as const satisfies readonly TicketWorkSessionStatus[];
