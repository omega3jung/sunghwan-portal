import { ApiError } from "@/lib/application/api";
import {
  canExecuteTicketAction,
  resolveTicketActionExecutionMode,
} from "@/lib/application/contracts/serviceDesk";

import { actionSpecMap } from "./handlers";
import { buildHistory } from "./history";
import { resolveNextTicketStatus } from "./ticketContext";
import { buildTicketStatusPatch, mergeActionPatch } from "./ticketPatch";
import { ExecutedLocalAction, LocalActionRuntimeContext } from "./types";
import { createUpdatedTicket, getTicketContext } from "./utils";

/**
 * Validates and stages the complete effect of one LOCAL ticket action.
 *
 * This function does not mutate shared demo arrays. It resolves status policy,
 * runs action-specific authorization/validation, and returns the action's
 * histories and replacement ticket. `localPost` commits those staged values
 * only after all expected failures have been evaluated, approximating the
 * all-or-nothing behavior of the REMOTE database transaction.
 */
export const executeLocalAction = async ({
  ...context
}: LocalActionRuntimeContext): Promise<ExecutedLocalAction> => {
  const spec = actionSpecMap[context.action];
  const ticket = spec.needsTicket
    ? getTicketContext(context.ticketId, context.isInternal).ticket
    : undefined;

  const actionMode = resolveTicketActionExecutionMode(
    context.action,
    context.isAdmin,
  );
  const nextStatus = resolveNextTicketStatus(actionMode, ticket);
  const runtimeContext = {
    ...context,
    ticket,
    nextStatus,
  };

  if (
    ticket &&
    !canExecuteTicketAction(actionMode, ticket.status)
  ) {
    throw new ApiError(
      "serviceDesk.ticketCommand.localDemo.actionNotAllowed",
      409,
      {
        action: actionMode,
        status: ticket.status,
      },
    );
  }

  const effect = await spec.handler(runtimeContext);
  const ticketPatch = mergeActionPatch(
    buildTicketStatusPatch(ticket, nextStatus),
    effect.ticketPatch,
  );

  const histories = Array.isArray(effect.history)
    ? effect.history
    : [effect.history];

  return {
    histories: histories.map((history, index) =>
      buildHistory(
        {
          ...runtimeContext,
          historyNoOffset: index,
        },
        history,
      ),
    ),
    updatedTicket:
      ticket && ticketPatch
        ? createUpdatedTicket(ticket, ticketPatch, context.createdAt)
        : undefined,
  };
};
