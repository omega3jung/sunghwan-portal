import type { Role } from "@/domain/auth";
import type { ActionConstraint } from "@/domain/serviceDesk/ticket/action";
import type { TicketStatus } from "@/domain/serviceDesk/types";

import {
  EXECUTABLE_TICKET_ACTION_MODES,
  type TicketActionExecutionMode,
} from "../types";

const MANAGER_LEVEL_ROLES = ["ADMIN", "MANAGER"] satisfies Role[];

const OPEN_LIKE_STATUSES = ["Open", "Approved"] satisfies TicketStatus[];
const ACTIVE_WORK_STATUSES = ["Working", "Pending"] satisfies TicketStatus[];
const MERGEABLE_STATUSES = [
  "Working",
  "Pending",
  "Resolved",
] satisfies TicketStatus[];
const MANAGER_MERGEABLE_STATUSES = [
  "Open",
  "Approved",
  "Working",
  "Pending",
  "Rejected",
  "Resolved",
  "Closed",
] satisfies TicketStatus[];

/**
 * Shared execution constraints for ticket actions.
 *
 * blockedWhenLocked:
 * - true  => do not allow when ticket info is locked
 * - false => allowed even if ticket info is locked
 *
 * IMPORTANT:
 * - This map defines coarse feature-level constraints only.
 * - Fine-grained runtime guards such as:
 *   - merged child restriction
 *   - same tenant/scope validation
 *   - duplicate assignee prevention
 *   - eligible category/job-field checks
 *   should remain in `canExecuteAction.ts`.
 */
export const ACTION_CONSTRAINTS = {
  comment: {
    blockedWhenLocked: false,
  },

  note: {
    blockedWhenLocked: false,
  },

  assign: {
    allowedStatus: ["Working"],
    requiresOwnership: "assignee",
    blockedWhenLocked: true,
  },

  assignManager: {
    allowedStatus: [
      "Open",
      "Approved",
      "Declined",
      "Working",
      "Pending",
      "Rejected",
    ],
    allowedRoles: MANAGER_LEVEL_ROLES,
    blockedWhenLocked: false,
  },

  adjust: {
    allowedStatus: ["Working"],
    requiresOwnership: "assignee",
    blockedWhenLocked: true,
  },

  adjustManager: {
    allowedStatus: ["Open", "Approved", "Working", "Pending", "Rejected"],
    allowedRoles: MANAGER_LEVEL_ROLES,
    blockedWhenLocked: false,
  },

  merge: {
    allowedStatus: MERGEABLE_STATUSES,
    requiresOwnership: "assignee",
    blockedWhenLocked: false,
  },

  mergeManager: {
    allowedStatus: MANAGER_MERGEABLE_STATUSES,
    allowedRoles: MANAGER_LEVEL_ROLES,
    blockedWhenLocked: false,
  },

  reject: {
    allowedStatus: ACTIVE_WORK_STATUSES,
    requiresOwnership: "assignee",
    blockedWhenLocked: false,
  },

  rejectManager: {
    allowedStatus: ["Open", "Approved", "Working", "Pending"],
    allowedRoles: MANAGER_LEVEL_ROLES,
    blockedWhenLocked: false,
  },

  reportResolved: {
    allowedStatus: ["Resolved"],
    requiresOwnership: "requester",
    blockedWhenLocked: false,
  },

  reviewRejected: {
    allowedStatus: ["Rejected"],
    requiresOwnership: "requester",
    blockedWhenLocked: false,
  },

  assignMyself: {
    allowedStatus: [...OPEN_LIKE_STATUSES, "Working"],
    blockedWhenLocked: false,
  },
} satisfies Record<TicketActionExecutionMode, ActionConstraint>;

export const MUTABLE_ACTION_KEYS = [
  "comment",
  "note",
] as const satisfies readonly TicketActionExecutionMode[];

export const IMMUTABLE_ACTION_KEYS = [
  "assign",
  "assignManager",
  "adjust",
  "adjustManager",
  "merge",
  "mergeManager",
  "reject",
  "rejectManager",
  "reportResolved",
  "reviewRejected",
  "assignMyself",
] as const satisfies readonly TicketActionExecutionMode[];

export const EXECUTABLE_ACTION_KEYS = EXECUTABLE_TICKET_ACTION_MODES;

export function getActionConstraint(
  actionKey: TicketActionExecutionMode,
): ActionConstraint {
  return ACTION_CONSTRAINTS[actionKey];
}
