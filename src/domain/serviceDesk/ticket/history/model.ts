import { ISODateString } from "@/shared/types/date";

import { HistoryType, TicketHistoryAction } from "./types";

export type TicketHistoryDisplayMetadata = {
  source?: string;
  reason?: string;
  note?: string;
  mergedIntoTicketId?: string;
  mergedIntoTicketNo?: string;
  previousStatus?: string;
  changedFields?: string[];
  routingSensitiveChanged?: boolean;
  routingReset?: boolean;
  preservedRouting?: boolean;
  previousApprovalStepId?: string | null;
  nextApprovalStepId?: string | null;
  previousAssigneeUsernames?: string[];
  nextAssigneeUsernames?: string[];
  assigneeUsernames?: string[];
};

/**
 * Ticket history domain model.
 *
 * historyNo is ticket-scoped, not globally unique.
 * Recommended identity: (ticketId, historyNo)
 *
 * actionNo:
 * - null   => ticket-level history
 * - number => action-level history
 */
export interface TicketHistory {
  ticketId: string;
  historyNo: number;

  type: HistoryType;
  action: TicketHistoryAction;

  actorUsername: string | null;
  actionNo: number | null;

  fromValue?: unknown;
  toValue?: unknown;
  metadata: TicketHistoryDisplayMetadata | null;

  createdAt: ISODateString;
}
