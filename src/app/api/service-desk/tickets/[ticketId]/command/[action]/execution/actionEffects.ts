import type { TicketStatus } from "@/domain/serviceDesk";

import type { TicketActionExecutionMode } from "../types";

/**
 * Context required to determine action effects.
 */
export type ActionEffectContext = {
  currentStatus: TicketStatus;
};

/**
 * Action effect definition.
 *
 * - getNextStatus: returns next status or undefined if no change
 */
export type TicketActionEffect = {
  getNextStatus?: (ctx: ActionEffectContext) => TicketStatus | undefined;
};

const reopenOnAssignManagerStatuses = new Set<TicketStatus>([
  "Declined",
  "Rejected",
]);
const startWorkingStatuses = new Set<TicketStatus>(["Open", "Approved"]);

export const ACTION_EFFECTS: Record<
  TicketActionExecutionMode,
  TicketActionEffect
> = {
  comment: {},

  note: {},

  assign: {},

  assignManager: {
    getNextStatus: ({ currentStatus }) => {
      if (reopenOnAssignManagerStatuses.has(currentStatus)) {
        return "Reopen";
      }
      return undefined;
    },
  },

  adjust: {},

  adjustManager: {},

  merge: {
    getNextStatus: () => "Closed",
  },

  mergeManager: {
    getNextStatus: () => "Closed",
  },

  reject: {
    getNextStatus: () => "Rejected",
  },

  rejectManager: {
    getNextStatus: () => "Rejected",
  },

  reportResolved: {
    getNextStatus: () => "Reopen",
  },

  reviewRejected: {
    getNextStatus: () => "Open",
  },

  assignMyself: {
    getNextStatus: ({ currentStatus }) => {
      if (startWorkingStatuses.has(currentStatus)) {
        return "Working";
      }
      return undefined;
    },
  },
};

export function getNextStatus(
  action: TicketActionExecutionMode,
  ctx: ActionEffectContext,
): TicketStatus | undefined {
  return ACTION_EFFECTS[action].getNextStatus?.(ctx);
}
