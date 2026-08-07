import type { LocalizedName } from "@/domain/organization";
import { ISODateString } from "@/shared/types/date";

import { CategoryScope } from "../../category";
import {
  HistoryType,
  TicketCloseReason,
  TicketHistoryEvent,
  TicketHistorySource,
} from "./types";

/** Normalized optional metadata used to render ticket history without reinterpreting raw JSON. */
export type TicketHistoryDisplayMetadata = {
  source?: TicketHistorySource;
  event?: TicketHistoryEvent;

  reason?: string;
  note?: string;

  closeReason?: TicketCloseReason;
  resolvedGraceDays?: number;

  mergedIntoTicketId?: string;
  mergedIntoTicketNo?: string;
  sourceTenantId?: string;
  targetTenantId?: string;
  sourceScope?: CategoryScope;
  targetScope?: CategoryScope;

  previousStatus?: string;
  nextStatus?: string;

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
 * `historyNo` is ticket-scoped, so records are identified by ticket and history
 * number together. A null `actionNo` denotes ticket-level history; a number
 * links the record to an action on that ticket.
 */
export interface TicketHistory {
  ticketId: string;
  historyNo: number;

  type: HistoryType;
  source: TicketHistorySource;
  event: TicketHistoryEvent;

  actorUsername: string | null;
  actorName: LocalizedName | null;
  actionNo: number | null;

  fromValue?: unknown;
  toValue?: unknown;
  metadata: TicketHistoryDisplayMetadata | null;

  createdAt: ISODateString;
}
