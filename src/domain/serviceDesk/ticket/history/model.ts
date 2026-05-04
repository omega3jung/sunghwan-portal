import { ISODateString } from "@/shared/types/date";

import { HistoryType, TicketHistoryAction } from "./types";

/**
 * Ticket history domain model.
 *
 * historyNo is ticket-scoped, not globally unique.
 * Recommended identity: (ticketId, historyNo)
 *
 * actionNo:
 * - null   => ticket-level history
 * - string => action-level history
 */
export interface TicketHistory {
  ticketId: string;
  historyNo: number;

  type: HistoryType;
  action: TicketHistoryAction;

  actorId: string | null;
  actionNo: string | null;

  fromValue?: unknown;
  toValue?: unknown;
  metadata?: Record<string, unknown>;

  createdAt: ISODateString;
}
