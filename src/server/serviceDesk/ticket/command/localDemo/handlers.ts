import { ServiceDeskApiError } from "@/app/api/service-desk/_shared/messages";
import type { DbTicketDetail } from "@/feature/serviceDesk/ticket/api/types";
import { resolveApprovedTicketRouting } from "@/server/serviceDesk/ticket/localDemo/createRouting";

import {
  LocalActionHandler,
  LocalActionSpec,
  TicketActionApiType,
} from "../types";
import {
  requireAssigneeIds,
  requireTargetTicketId,
  resolvePriority,
  resolveRiskLevel,
  toHistoryMetadata,
} from "../utils";
import { mergeTicketToEmails } from "./email";
import { createMessageHistory, createStatusHistory } from "./history";
import { validateMergeTarget } from "./merge";
import { requireNextStatus, requireTicket } from "./ticketContext";
import { mergeAssigneeIds } from "./ticketPatch";

type ApprovedTicketRouting = ReturnType<typeof resolveApprovedTicketRouting>;

const normalizeApprovalStepId = (approvalStepId: string | null) => {
  if (approvalStepId === null) {
    return null;
  }

  const numericApprovalStepId = Number(approvalStepId);

  return Number.isFinite(numericApprovalStepId)
    ? numericApprovalStepId
    : approvalStepId;
};

const requireApprovalStepId = (ticket: DbTicketDetail) => {
  if (ticket.approval_step_id !== null) {
    return ticket.approval_step_id;
  }

  throw new ServiceDeskApiError(
    "api.ticketCommand.localDemo.approvalForbidden",
    403,
    { ticketId: ticket.id },
  );
};

const requireApprovalTicket = (
  context: Parameters<LocalActionHandler>[0],
): DbTicketDetail => {
  const ticket = requireTicket(context);
  const isApprovalPhase =
    ticket.assignment_phase === "APPROVAL" || ticket.approval_step_id !== null;

  if (
    ticket.active &&
    ticket.status === "Approval" &&
    isApprovalPhase &&
    ticket.approval_step_id !== null &&
    ticket.assignee_usernames.includes(context.employeeUserName)
  ) {
    return ticket;
  }

  throw new ServiceDeskApiError(
    "api.ticketCommand.localDemo.approvalForbidden",
    403,
    {
      ticketId: ticket.id,
      username: context.employeeUserName,
    },
  );
};

const buildApprovalRoutingPatch = (
  routing: ApprovedTicketRouting,
  employeeUserName: string,
): Partial<DbTicketDetail> => {
  const isApprovalPhase = routing.approvalStepId !== null;
  const assigned = routing.assigneeUsernames.includes(employeeUserName);

  return {
    status: routing.status,
    approval_step_id: routing.approvalStepId,
    assignment_phase: isApprovalPhase ? "APPROVAL" : "WORK",
    approval_assignee_usernames: isApprovalPhase
      ? routing.assigneeUsernames
      : [],
    work_assignee_usernames: isApprovalPhase ? [] : routing.assigneeUsernames,
    assignee_usernames: routing.assigneeUsernames,
    assigned_approver: isApprovalPhase ? assigned : false,
    assigned_worker: isApprovalPhase ? false : assigned,
    assigned,
  };
};

const approveTicket: LocalActionHandler = (context) => {
  const ticket = requireApprovalTicket(context);
  const currentApprovalStepId = requireApprovalStepId(ticket);
  const routing = resolveApprovedTicketRouting({
    isInternal: context.isInternal ?? false,
    categoryId: ticket.category_id,
    parentCategoryId: ticket.category_parent_id ?? ticket.category_id,
    requesterUsername: ticket.requester_username,
    currentApprovalStepId,
  });

  return {
    history: {
      type: "APPROVAL",
      action: "APPROVAL_APPROVED",
      from_value: {
        approvalStepId: normalizeApprovalStepId(currentApprovalStepId),
      },
      to_value: {
        nextApprovalStepId: normalizeApprovalStepId(routing.approvalStepId),
      },
      metadata: {
        ...toHistoryMetadata(context.content),
        note: context.content.content.trim(),
      },
    },
    ticketPatch: buildApprovalRoutingPatch(routing, context.employeeUserName),
  };
};

const declineTicket: LocalActionHandler = (context) => {
  const ticket = requireApprovalTicket(context);
  const nextStatus = requireNextStatus(context);

  return {
    history: {
      type: "APPROVAL",
      action: "APPROVAL_DECLINED",
      from_value: {
        approvalStepId: normalizeApprovalStepId(requireApprovalStepId(ticket)),
      },
      to_value: null,
      metadata: {
        ...toHistoryMetadata(context.content),
        reason: context.content.content.trim(),
      },
    },
    ticketPatch: {
      status: nextStatus,
    },
  };
};

const assignTicket: LocalActionHandler = (context) => {
  const ticket = requireTicket(context);
  const assigneeUsernames = requireAssigneeIds(context.content);

  return {
    history: {
      type: "ASSIGNMENT",
      action: "UPDATED",
      from_value: ticket.assignee_usernames,
      to_value: assigneeUsernames,
      metadata: toHistoryMetadata(context.content),
    },
    ticketPatch: {
      assignee_usernames: assigneeUsernames,
      email: mergeTicketToEmails(ticket, assigneeUsernames),
      assigned: assigneeUsernames.includes(context.employeeUserName),
    },
  };
};

const assignSelfTicket: LocalActionHandler = (context) => {
  const ticket = requireTicket(context);
  const assigneeUsernames =
    ticket.status === "Working"
      ? mergeAssigneeIds(ticket.assignee_usernames, context.employeeUserName)
      : [context.employeeUserName];

  return {
    history: {
      type: "ASSIGNMENT",
      action: "UPDATED",
      from_value: ticket.assignee_usernames,
      to_value: assigneeUsernames,
      metadata: toHistoryMetadata(context.content),
    },
    ticketPatch: {
      assignee_usernames: assigneeUsernames,
      email: mergeTicketToEmails(ticket, assigneeUsernames),
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

export const actionSpecMap: Record<TicketActionApiType, LocalActionSpec> = {
  approve: { handler: approveTicket, needsTicket: true },
  decline: { handler: declineTicket, needsTicket: true },
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
