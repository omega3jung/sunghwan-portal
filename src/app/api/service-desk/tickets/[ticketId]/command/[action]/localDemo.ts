import { NextResponse } from "next/server";

import { DbTicketDetail } from "@/api/serviceDesk/ticket";
import {
  camelTicketActionMapper,
  DbTicketAction,
} from "@/api/serviceDesk/ticket/action";
import { DbTicketHistory } from "@/api/serviceDesk/ticket/history";
import { internalActionsMocks } from "@/app/_mocks/scenarios/serviceDesk/internalActionsMock";
import { internalHistoriesMocks } from "@/app/_mocks/scenarios/serviceDesk/internalHistoriesMock";
import { canMergeTicketInto } from "@/domain/serviceDesk/ticket/merge";
import { mapFileToAttach } from "@/feature/serviceDesk/ticket/utils/mapFileToAttach";

import {
  DbTicketActionLocalContext,
  ExecutedLocalAction,
  LocalActionEffect,
  LocalActionHandler,
  LocalActionRuntimeContext,
  LocalActionSpec,
  TicketActionApiType,
} from "./types";
import {
  createUpdatedTicket,
  getMaxHistoryNo,
  getNextActionNo,
  getTargetTickets,
  getTicketContext,
  requireAssigneeIds,
  requireTargetTicketId,
  resolvePriority,
  resolveRiskLevel,
  toHistoryMetadata,
} from "./utils";

type CreateTicketActionContext = Pick<
  LocalActionRuntimeContext,
  "ticketId" | "userId" | "content" | "actionNo" | "createdAt"
>;

type ExecuteLocalActionContext = LocalActionRuntimeContext & {
  action: TicketActionApiType;
};

const createTicketAction = ({
  ticketId,
  userId,
  content,
  actionNo,
  createdAt,
}: CreateTicketActionContext): DbTicketAction => ({
  ticket_id: ticketId,
  action_no: actionNo,

  action_type: content.actionType,
  content: content.content,
  owner_id: userId,

  created_at: createdAt,
  updated_at: null,
  active: true,

  files: mapFileToAttach(content.files, "file"),
  images: mapFileToAttach(content.images, "image"),
});

const buildHistoryBase = ({
  ticketId,
  userId,
  actionNo,
  createdAt,
}: LocalActionRuntimeContext): Pick<
  DbTicketHistory,
  "ticket_id" | "history_no" | "actor_id" | "action_no" | "created_at"
> => ({
  ticket_id: ticketId,
  history_no: getMaxHistoryNo(ticketId),
  actor_id: userId,
  action_no: actionNo.toString(),
  created_at: createdAt,
});

const buildHistory = (
  context: LocalActionRuntimeContext,
  history: LocalActionEffect["history"],
): DbTicketHistory => ({
  ...buildHistoryBase(context),
  ...history,
});

const requireTicket = ({
  ticket,
  ticketId,
}: LocalActionRuntimeContext): DbTicketDetail => {
  if (!ticket) {
    throw new Error(`Ticket ${ticketId} not found`);
  }

  return ticket;
};

const toMergeAwareTicket = (ticket: DbTicketDetail) => ({
  id: ticket.id,
  status: ticket.status,
  closeReason: ticket.close_reason ?? undefined,
  mergedIntoTicketId: ticket.merged_into_ticket_id ?? null,
});

const validateMergeTarget = (
  context: LocalActionRuntimeContext,
  targetTicketId: string,
) => {
  const sourceTicket = requireTicket(context);
  const tickets = getTargetTickets(context.isInternal);
  const targetTicket = tickets.find((ticket) => ticket.id === targetTicketId);

  if (!targetTicket) {
    throw new Error("Merge target not found");
  }

  if (sourceTicket.id === targetTicket.id) {
    throw new Error("Cannot merge into the same ticket");
  }

  if (sourceTicket.status === "Draft") {
    throw new Error("Draft tickets cannot be merged");
  }

  if (targetTicket.status === "Draft") {
    throw new Error("Cannot merge into a draft ticket");
  }

  if (sourceTicket.merged_into_ticket_id) {
    throw new Error("Ticket is already merged");
  }

  if (targetTicket.merged_into_ticket_id) {
    throw new Error("Merge target is already merged");
  }

  const canMerge = canMergeTicketInto(
    toMergeAwareTicket(sourceTicket),
    toMergeAwareTicket(targetTicket),
    (ticketId) => {
      const nextTicket = tickets.find((ticket) => ticket.id === ticketId);
      return nextTicket ? toMergeAwareTicket(nextTicket) : undefined;
    },
  );

  if (!canMerge) {
    throw new Error("Invalid merge target");
  }

  return {
    sourceTicket,
    targetTicket,
  };
};

const createMessageHistory =
  (
    type: Extract<DbTicketHistory["type"], "COMMENT" | "NOTE">,
  ): LocalActionHandler =>
  ({ content }) => ({
    history: {
      type,
      action: "CREATED",
      metadata: toHistoryMetadata(content),
    },
  });

const assignTicket: LocalActionHandler = (context) => {
  const ticket = requireTicket(context);
  const assigneeIds = requireAssigneeIds(context.content);

  return {
    history: {
      type: "ASSIGNMENT",
      action: "UPDATED",
      from_value: ticket.assignee_id,
      to_value: assigneeIds,
      metadata: toHistoryMetadata(context.content),
    },
    ticketPatch: { assignee_id: assigneeIds },
  };
};

const rejectTicket: LocalActionHandler = (context) => {
  const ticket = requireTicket(context);

  return {
    history: {
      type: "TICKET",
      action: "TICKET_REJECTED",
      from_value: ticket.status,
      to_value: "Rejected",
      metadata: toHistoryMetadata(context.content),
    },
    ticketPatch: { status: "Rejected" },
  };
};

const mergeTicket: LocalActionHandler = (context) => {
  const targetTicketId = requireTargetTicketId(context.content);
  const { sourceTicket } = validateMergeTarget(context, targetTicketId);

  return {
    history: {
      type: "TICKET",
      action: "TICKET_MERGED",
      from_value: sourceTicket.merged_into_ticket_id ?? null,
      to_value: targetTicketId,
      metadata: toHistoryMetadata(context.content),
    },
    ticketPatch: {
      status: "Closed",
      close_reason: "Merged",
      merged_into_ticket_id: targetTicketId,
    },
  };
};

const adjustTicket: LocalActionHandler = (context) => {
  const ticket = requireTicket(context);
  const priority = resolvePriority(context.content.priority, ticket.priority);
  const riskLevel = resolveRiskLevel(
    context.content.riskLevel,
    ticket.risk_level,
  );
  const dueAt = context.content.dueAt ?? ticket.due_at;

  return {
    history: {
      type: "PLANNING",
      action: "UPDATED",
      from_value: {
        priority: ticket.priority,
        risk_level: ticket.risk_level,
        due_at: ticket.due_at,
      },
      to_value: {
        priority,
        risk_level: riskLevel,
        due_at: dueAt,
      },
      metadata: toHistoryMetadata(context.content),
    },
    ticketPatch: {
      priority,
      risk_level: riskLevel,
      due_at: dueAt,
    },
  };
};

const actionSpecMap: Record<TicketActionApiType, LocalActionSpec> = {
  comment: { handler: createMessageHistory("COMMENT") },
  note: { handler: createMessageHistory("NOTE") },
  assign: { handler: assignTicket, needsTicket: true },
  reject: { handler: rejectTicket, needsTicket: true },
  merge: { handler: mergeTicket, needsTicket: true },
  adjust: { handler: adjustTicket, needsTicket: true },
};

const executeLocalAction = ({
  action,
  ...context
}: ExecuteLocalActionContext): ExecutedLocalAction => {
  const spec = actionSpecMap[action];
  const ticket = spec.needsTicket
    ? getTicketContext(context.ticketId, context.isInternal).ticket
    : undefined;
  const runtimeContext = { ...context, ticket };
  const effect = spec.handler(runtimeContext);

  return {
    history: buildHistory(runtimeContext, effect.history),
    updatedTicket:
      ticket && effect.ticketPatch
        ? createUpdatedTicket(ticket, effect.ticketPatch, context.createdAt)
        : undefined,
  };
};

export function localPost({
  ticketId,
  userId,
  content,
  action,
  isInternal = false,
}: DbTicketActionLocalContext) {
  try {
    const actionNo = getNextActionNo(ticketId);
    const createdAt = new Date().toISOString();
    const ticketAction = createTicketAction({
      ticketId,
      userId,
      content,
      actionNo,
      createdAt,
    });
    const { history: createdHistory, updatedTicket } = executeLocalAction({
      ticketId,
      userId,
      content,
      actionNo,
      createdAt,
      isInternal,
      action,
    });

    internalActionsMocks.push(ticketAction);
    internalHistoriesMocks.push(createdHistory);

    if (updatedTicket) {
      const { targetMock, index } = getTicketContext(ticketId, isInternal);
      targetMock.splice(index, 1, updatedTicket);
    }

    return NextResponse.json(camelTicketActionMapper([ticketAction])[0], {
      status: 201,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create action";
    const status = message.includes("not found")
      ? 404
      : message.includes("merge") ||
          message.includes("merged") ||
          message.includes("Draft")
        ? 400
        : 500;

    return NextResponse.json({ message }, { status });
  }
}
