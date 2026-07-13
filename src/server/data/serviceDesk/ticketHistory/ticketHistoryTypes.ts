import type {
  TicketHistoryEvent as DomainTicketHistoryEvent,
  TicketHistorySource as DomainTicketHistorySource,
} from "@/domain/serviceDesk";

export type TicketHistoryType =
  | "TICKET"
  | "STATUS"
  | "CATEGORY"
  | "ASSIGNMENT"
  | "APPROVAL"
  | "COMMENT"
  | "NOTE"
  | "PLANNING";

export type TicketHistorySource = DomainTicketHistorySource;

export type TicketHistoryEvent = DomainTicketHistoryEvent;

export type TicketHistoryJsonValue =
  | string
  | number
  | boolean
  | null
  | TicketHistoryJsonValue[]
  | { [key: string]: TicketHistoryJsonValue };
