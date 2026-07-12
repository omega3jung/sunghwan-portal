import { ServiceDeskApiError } from "@/app/api/service-desk/_shared/messages";

import { ExecutedLocalAction, LocalActionRuntimeContext } from "../types";
import { createUpdatedTicket, getTicketContext } from "../utils";
import { actionSpecMap } from "./handlers";
import { buildHistory } from "./history";
import {
  isLocalDemoExecutionAllowed,
  resolveLocalDemoExecutionMode,
} from "./rules";
import { resolveNextTicketStatus } from "./ticketContext";
import { buildTicketStatusPatch, mergeActionPatch } from "./ticketPatch";

export const executeLocalAction = ({
  ...context
}: LocalActionRuntimeContext): ExecutedLocalAction => {
  const spec = actionSpecMap[context.action];
  const ticket = spec.needsTicket
    ? getTicketContext(context.ticketId, context.isInternal).ticket
    : undefined;

  const actionMode = resolveLocalDemoExecutionMode(
    context.action,
    context.isAdmin,
  );
  const nextStatus = resolveNextTicketStatus(actionMode, ticket);
  const runtimeContext = {
    ...context,
    ticket,
    nextStatus,
  };

  if (ticket && !isLocalDemoExecutionAllowed(actionMode, ticket.status)) {
    throw new ServiceDeskApiError(
      "api.ticketCommand.localDemo.actionNotAllowed",
      409,
      {
        action: actionMode,
        status: ticket.status,
      },
    );
  }

  const effect = spec.handler(runtimeContext);
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
