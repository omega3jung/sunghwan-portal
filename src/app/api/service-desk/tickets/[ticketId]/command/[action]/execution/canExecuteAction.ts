import type { Role } from "@/domain/auth";
import type { TicketDetail } from "@/domain/serviceDesk";

import { isManagerLevelTicketActionAllowed } from "../authz/rules";
import type { TicketActionExecutionMode } from "../types";
import { EXECUTABLE_ACTION_KEYS, getActionConstraint } from "./actionConstraints";

/**
 * Runtime context required to determine whether an action can be executed.
 *
 * This is intentionally broader than the raw ticket model because
 * execution rules depend on:
 * - current ticket state
 * - current user's role
 * - requester / assignee ownership
 * - lock state
 * - feature-specific derived conditions
 */
export type TicketActionExecutionContext = {
  ticket: Pick<
    TicketDetail,
    "status" | "owner" | "assigned" | "active" | "mergedIntoTicketId"
  >;

  userId?: string;
  role?: Role | null;
  companyId?: string | null;
  departmentId?: string | null;

  /**
   * Derived runtime flags
   */
  isLocked?: boolean;

  /**
   * Optional fine-grained guards
   */
  canAssignMyself?: boolean;
  isMergeTargetValid?: boolean;
};

/**
 * Basic immutable runtime guards that apply before action-specific constraints.
 */
function passesCommonGuards(
  action: TicketActionExecutionMode,
  context: TicketActionExecutionContext,
): boolean {
  const { ticket } = context;

  /**
   * Inactive ticket is never executable in normal UI flow.
   */
  if (!ticket.active) {
    return false;
  }

  /**
   * Closed ticket is read-only by default.
   * Only manager-level merge exception is allowed by rule.
   */
  if (ticket.status === "Closed" && action !== "mergeManager") {
    return false;
  }

  /**
   * Merged child ticket is effectively closed/read-only for operational actions.
   * No further execution should be allowed in normal workflow.
   */
  if (ticket.mergedIntoTicketId) {
    return false;
  }

  return true;
}

function passesStatusConstraint(
  action: TicketActionExecutionMode,
  context: TicketActionExecutionContext,
): boolean {
  const constraint = getActionConstraint(action);

  if (!constraint.allowedStatus?.length) {
    return true;
  }

  return constraint.allowedStatus.includes(context.ticket.status);
}

function passesRoleConstraint(
  action: TicketActionExecutionMode,
  context: TicketActionExecutionContext,
): boolean {
  const constraint = getActionConstraint(action);

  if (!constraint.allowedRoles?.length) {
    return true;
  }

  if (!context.role) {
    return false;
  }

  return constraint.allowedRoles.includes(context.role);
}

function passesManagerLevelAuthorization(
  action: TicketActionExecutionMode,
  context: TicketActionExecutionContext,
): boolean {
  if (
    action !== "assignManager" &&
    action !== "adjustManager" &&
    action !== "mergeManager" &&
    action !== "rejectManager"
  ) {
    return true;
  }

  return isManagerLevelTicketActionAllowed({
    userId: context.userId ?? "",
    role: context.role ?? null,
    companyId: context.companyId ?? null,
    departmentId: context.departmentId ?? null,
  });
}

function passesOwnershipConstraint(
  action: TicketActionExecutionMode,
  context: TicketActionExecutionContext,
): boolean {
  const constraint = getActionConstraint(action);

  if (!constraint.requiresOwnership) {
    return true;
  }

  if (constraint.requiresOwnership === "requester") {
    return context.ticket.owner;
  }

  if (constraint.requiresOwnership === "assignee") {
    return context.ticket.assigned;
  }

  return true;
}

function passesLockConstraint(
  action: TicketActionExecutionMode,
  context: TicketActionExecutionContext,
): boolean {
  const constraint = getActionConstraint(action);

  if (!constraint.blockedWhenLocked) {
    return true;
  }

  return !context.isLocked;
}

/**
 * Fine-grained runtime checks that are difficult to express only with
 * status/role/ownership/lock.
 *
 * Keep this section small and explicit.
 */
function passesActionSpecificGuards(
  action: TicketActionExecutionMode,
  context: TicketActionExecutionContext,
): boolean {
  switch (action) {
    case "assignMyself": {
      return Boolean(context.canAssignMyself);
    }

    case "merge":
    case "mergeManager": {
      /**
       * This is optional because merge target may not yet be selected
       * when simply deciding whether to show the action launcher.
       *
       * - undefined => not enough info yet, allow launcher
       * - false     => explicit invalid target, block execution
       * - true      => valid
       */
      if (typeof context.isMergeTargetValid === "boolean") {
        return context.isMergeTargetValid;
      }

      return true;
    }

    default:
      return true;
  }
}

/**
 * Main action execution guard.
 *
 * This function is appropriate for:
 * - showing / hiding action launcher buttons
 * - enabling / disabling action tabs
 * - coarse submit guards before mutation
 *
 * More detailed payload validation should still happen in:
 * - form schema
 * - action-specific submit handlers
 * - server mutation layer
 */
export function canExecuteAction(
  action: TicketActionExecutionMode,
  context: TicketActionExecutionContext,
): boolean {
  return (
    passesCommonGuards(action, context) &&
    passesStatusConstraint(action, context) &&
    passesRoleConstraint(action, context) &&
    passesManagerLevelAuthorization(action, context) &&
    passesOwnershipConstraint(action, context) &&
    passesLockConstraint(action, context) &&
    passesActionSpecificGuards(action, context)
  );
}

/**
 * Return all executable actions for current runtime context.
 */
export function getExecutableActions(
  context: TicketActionExecutionContext,
): TicketActionExecutionMode[] {
  return EXECUTABLE_ACTION_KEYS.filter(
    (action) => canExecuteAction(action, context),
  );
}

export function getExecutableTicketActionModes(
  ticket: TicketDetail,
): TicketActionExecutionMode[] {
  return getExecutableActions({
    ticket: {
      status: ticket.status,
      owner: ticket.owner,
      assigned: ticket.assigned,
      active: ticket.active,
      mergedIntoTicketId: ticket.mergedIntoTicketId,
    },
  });
}
