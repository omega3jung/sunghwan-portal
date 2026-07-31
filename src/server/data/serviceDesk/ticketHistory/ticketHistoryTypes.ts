import type {
  TicketHistoryEvent as DomainTicketHistoryEvent,
  TicketHistorySource as DomainTicketHistorySource,
} from "@/domain/serviceDesk";

/** Enumerates the durable kinds of change recorded in the ticket audit timeline. */
export type TicketHistoryType =
  | "TICKET"
  | "STATUS"
  | "CATEGORY"
  | "ASSIGNMENT"
  | "APPROVAL"
  | "COMMENT"
  | "NOTE"
  | "PLANNING";

/** Identifies whether a history entry originated from a user, administrator, or system process. */
export type TicketHistorySource = DomainTicketHistorySource;

/** Identifies the domain event represented by a ticket history record. */
export type TicketHistoryEvent = DomainTicketHistoryEvent;

/** Restricts history snapshots to JSON-safe values that can be stored in PostgreSQL. */
export type TicketHistoryJsonValue =
  | string
  | number
  | boolean
  | null
  | TicketHistoryJsonValue[]
  | { [key: string]: TicketHistoryJsonValue };
