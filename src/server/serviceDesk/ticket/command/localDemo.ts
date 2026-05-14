import { NextResponse } from "next/server";

import {
  ServiceDeskApiError,
  tServiceDeskApi,
} from "@/app/api/service-desk/_shared/messages";
import { canMergeTicketInto } from "@/domain/serviceDesk/ticket/merge";
import { mapFileToAttach } from "@/feature/serviceDesk/shared/utils/mapFileToAttach";
import { DbTicketDetail } from "@/feature/serviceDesk/ticket/api/types";
import {
  camelTicketActionMapper,
  DbTicketAction,
} from "@/feature/serviceDesk/ticketAction/api";
import { DbTicketHistory } from "@/feature/serviceDesk/ticketHistory/api";
import { createEmployeesMock } from "@/mocks/domain/organization/employee";

import {
  getLocalDemoActions,
  getLocalDemoHistories,
  getLocalDemoTickets,
} from "../state";
import {
  getLocalDemoNextStatus,
  isLocalDemoExecutionAllowed,
  resolveLocalDemoExecutionMode,
} from "./localDemoRules";
import {
  DbTicketActionLocalContext,
  ExecutedLocalAction,
  LocalActionEffect,
  LocalActionHandler,
  LocalActionRuntimeContext,
  LocalActionSpec,
  TicketActionApiType,
  TicketActionExecutionMode,
} from "./types";
import {
  createUpdatedTicket,
  getMaxHistoryNo,
  getNextActionNo,
  getTicketContext,
  requireAssigneeIds,
  requireTargetTicketId,
  resolvePriority,
  resolveRiskLevel,
  toHistoryMetadata,
} from "./utils";

type CreateTicketActionContext = Pick<
  LocalActionRuntimeContext,
  "ticketId" | "employeeUserName" | "content" | "actionNo" | "createdAt"
>;

const employeeEmailByUserName = new Map(
  createEmployeesMock().map((employee) => [
    employee.e_user_name,
    employee.e_email,
  ]),
);

const createTicketAction = ({
  ticketId,
  employeeUserName,
  content,
  actionNo,
  createdAt,
}: CreateTicketActionContext): DbTicketAction => ({
  ticket_id: ticketId,
  action_no: actionNo,

  action_type: content.actionType,
  content: content.content,
  owner_id: employeeUserName,

  created_at: createdAt,
  updated_at: null,
  active: true,

  files: mapFileToAttach(content.files, "file"),
  images: mapFileToAttach(content.images, "image"),
});

const buildHistoryBase = ({
  ticketId,
  employeeUserName,
  actionNo,
  createdAt,
  isInternal = false,
}: LocalActionRuntimeContext): Pick<
  DbTicketHistory,
  "ticket_id" | "history_no" | "actor_id" | "action_no" | "created_at"
> => ({
  ticket_id: ticketId,
  history_no: getMaxHistoryNo(ticketId, isInternal),
  actor_id: employeeUserName,
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
    throw new ServiceDeskApiError(
      "api.ticketCommand.localDemo.ticketNotFound",
      404,
      { ticketId },
    );
  }

  return ticket;
};

const resolveNextTicketStatus = (
  actionMode: TicketActionExecutionMode,
  ticket?: DbTicketDetail,
) => {
  if (!ticket) {
    return undefined;
  }

  return getLocalDemoNextStatus(actionMode, ticket.status);
};

const requireNextStatus = ({
  nextStatus,
}: Pick<LocalActionRuntimeContext, "nextStatus">) => {
  if (!nextStatus) {
    throw new ServiceDeskApiError(
      "api.ticketCommand.localDemo.nextStatusUnresolved",
      400,
    );
  }

  return nextStatus;
};

const buildTicketStatusPatch = (
  ticket?: DbTicketDetail,
  nextStatus?: DbTicketDetail["status"],
): Partial<DbTicketDetail> | undefined => {
  if (!ticket || !nextStatus || nextStatus === ticket.status) {
    return undefined;
  }

  return { status: nextStatus };
};

const mergeActionPatch = (
  ...patches: Array<Partial<DbTicketDetail> | undefined>
): Partial<DbTicketDetail> | undefined => {
  const mergedPatch = Object.assign(
    {},
    ...patches.filter(
      (patch): patch is Partial<DbTicketDetail> => patch !== undefined,
    ),
  );

  return Object.keys(mergedPatch).length > 0 ? mergedPatch : undefined;
};

const mergeAssigneeIds = (
  currentAssigneeIds: DbTicketDetail["assignee_id"],
  employeeUserName: string,
) => {
  return currentAssigneeIds.includes(employeeUserName)
    ? currentAssigneeIds
    : [...currentAssigneeIds, employeeUserName];
};

const mergeTicketToEmails = (
  ticket: DbTicketDetail,
  assigneeIds: string[],
): DbTicketDetail["email"] => {
  const assigneeEmails = assigneeIds
    .map((assigneeId) => employeeEmailByUserName.get(assigneeId))
    .filter((email): email is string => Boolean(email));

  if (assigneeEmails.length === 0) {
    return ticket.email;
  }

  return {
    ...ticket.email,
    to: [...new Set([...ticket.email.to, ...assigneeEmails])],
  };
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
  const tickets = getLocalDemoTickets(context.isInternal ?? false);
  const targetTicket = tickets.find((ticket) => ticket.id === targetTicketId);

  if (!targetTicket) {
    throw new ServiceDeskApiError(
      "api.ticketCommand.localDemo.mergeTargetNotFound",
      404,
    );
  }

  if (sourceTicket.status === "Draft") {
    throw new ServiceDeskApiError(
      "api.ticketCommand.localDemo.draftCannotBeMerged",
      400,
    );
  }

  if (targetTicket.status === "Draft") {
    throw new ServiceDeskApiError(
      "api.ticketCommand.localDemo.cannotMergeIntoDraft",
      400,
    );
  }

  if (sourceTicket.merged_into_ticket_id) {
    throw new ServiceDeskApiError(
      "api.ticketCommand.localDemo.ticketAlreadyMerged",
      400,
    );
  }

  if (targetTicket.merged_into_ticket_id) {
    throw new ServiceDeskApiError(
      "api.ticketCommand.localDemo.mergeTargetAlreadyMerged",
      400,
    );
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
    throw new ServiceDeskApiError(
      "api.ticketCommand.localDemo.invalidMergeTarget",
      400,
    );
  }

  return {
    sourceTicket,
    targetTicket,
  };
};

const createStatusHistory: LocalActionHandler = (context) => {
  const ticket = requireTicket(context);
  const nextStatus = requireNextStatus(context);

  return {
    history: {
      type: "STATUS",
      action: "UPDATED",
      from_value: ticket.status,
      to_value: nextStatus,
      metadata: toHistoryMetadata(context.content),
    },
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
    ticketPatch: {
      assignee_id: assigneeIds,
      email: mergeTicketToEmails(ticket, assigneeIds),
      assigned: assigneeIds.includes(context.employeeUserName),
    },
  };
};

const assignSelfTicket: LocalActionHandler = (context) => {
  const ticket = requireTicket(context);
  const assigneeIds =
    ticket.status === "Working"
      ? mergeAssigneeIds(ticket.assignee_id, context.employeeUserName)
      : [context.employeeUserName];

  return {
    history: {
      type: "ASSIGNMENT",
      action: "UPDATED",
      from_value: ticket.assignee_id,
      to_value: assigneeIds,
      metadata: toHistoryMetadata(context.content),
    },
    ticketPatch: {
      assignee_id: assigneeIds,
      email: mergeTicketToEmails(ticket, assigneeIds),
      assigned: true,
    },
  };
};

const rejectTicket: LocalActionHandler = (context) => {
  const ticket = requireTicket(context);
  const nextStatus = requireNextStatus(context);

  return {
    history: {
      type: "TICKET",
      action: "TICKET_REJECTED",
      from_value: ticket.status,
      to_value: nextStatus,
      metadata: toHistoryMetadata(context.content),
    },
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
  assignSelf: { handler: assignSelfTicket, needsTicket: true },
  reject: { handler: rejectTicket, needsTicket: true },
  merge: { handler: mergeTicket, needsTicket: true },
  adjust: { handler: adjustTicket, needsTicket: true },
  reopen: { handler: createStatusHistory, needsTicket: true },
  resubmit: { handler: createStatusHistory, needsTicket: true },
};

const executeLocalAction = ({
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
      400,
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

  return {
    history: buildHistory(runtimeContext, effect.history),
    updatedTicket:
      ticket && ticketPatch
        ? createUpdatedTicket(ticket, ticketPatch, context.createdAt)
        : undefined,
  };
};

export function localPost({
  ticketId,
  employeeUserName,
  content,
  action,
  isAdmin = false,
  isInternal = false,
}: DbTicketActionLocalContext) {
  try {
    const actionNo = getNextActionNo(ticketId, isInternal);
    const createdAt = new Date().toISOString();
    const ticketAction = createTicketAction({
      ticketId,
      employeeUserName,
      content,
      actionNo,
      createdAt,
    });
    const { history: createdHistory, updatedTicket } = executeLocalAction({
      ticketId,
      employeeUserName,
      content,
      actionNo,
      createdAt,
      isInternal,
      isAdmin,
      action,
    });

    const actions = getLocalDemoActions(isInternal);
    const histories = getLocalDemoHistories(isInternal);

    actions.push(ticketAction);
    histories.push(createdHistory);

    if (updatedTicket) {
      const { targetMock, index } = getTicketContext(ticketId, isInternal);
      targetMock.splice(index, 1, updatedTicket);
    }

    return NextResponse.json(camelTicketActionMapper([ticketAction])[0], {
      status: 201,
    });
  } catch (error) {
    const message =
      error instanceof ServiceDeskApiError
        ? error.message
        : error instanceof Error
          ? error.message
          : tServiceDeskApi("api.ticketCommand.localDemo.createFailed");
    const status = error instanceof ServiceDeskApiError ? error.status : 500;

    return NextResponse.json({ message }, { status });
  }
}
