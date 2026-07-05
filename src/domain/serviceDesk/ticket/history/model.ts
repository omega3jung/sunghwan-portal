import { ISODateString } from "@/shared/types/date";

import { HistoryType, TicketHistoryAction } from "./types";

export type TicketHistoryDisplayMetadata = {
  source?: string;
  reason?: string;
  note?: string;
  targetTicketId?: string;
  targetTicketNumber?: string;
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
 * - string => action-level history
 */
export interface TicketHistory {
  ticketId: string;
  historyNo: number;

  type: HistoryType;
  action: TicketHistoryAction;

  actorUsername: string | null;
  actionNo: string | null;

  fromValue?: unknown;
  toValue?: unknown;
  metadata: TicketHistoryDisplayMetadata | null;

  createdAt: ISODateString;
}
