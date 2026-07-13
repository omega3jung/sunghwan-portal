import { ServiceDeskApiError } from "@/app/api/service-desk/_shared/messages";
import {
  resolveApprovedTicketRouting,
  resolveCreateTicketRouting,
} from "@/server/serviceDesk/ticket/localDemo/createRouting";

import type {
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
import {
  createMessageHistory,
  createRoutingHistory,
  normalizeApprovalStepId,
} from "./history";
import { validateMergeTarget } from "./merge";
import {
  assertCurrentWorkAssignee,
  assertRequester,
  assertRequesterOrAdmin,
  assertWorkAssigneeOrAdmin,
  requireApprovalStepId,
  requireApprovalTicket,
  requireNextStatus,
  requireTicket,
} from "./ticketContext";
import {
  buildApprovalRoutingPatch,
  buildAssigneePatch,
} from "./ticketPatch";

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
    history: [
      {
        type: "APPROVAL",
        event: "APPROVAL_APPROVED",
        from_value: {
          approvalStepId: normalizeApprovalStepId(currentApprovalStepId),
        },
        to_value: {
          nextApprovalStepId: normalizeApprovalStepId(routing.approvalStepId),
        },
        metadata: {
          ...toHistoryMetadata(context.content),
          previousApprovalStepId: normalizeApprovalStepId(currentApprovalStepId),
          nextApprovalStepId: normalizeApprovalStepId(routing.approvalStepId),
          note: context.content.content.trim(),
        },
      },
      createRoutingHistory(ticket, routing),
    ],
    ticketPatch: buildApprovalRoutingPatch(routing, context.employeeUserName),
  };
};

const declineTicket: LocalActionHandler = (context) => {
  const ticket = requireApprovalTicket(context);
  const nextStatus = requireNextStatus(context);
  const currentApprovalStepId = requireApprovalStepId(ticket);

  return {
    history: {
      type: "APPROVAL",
      event: "APPROVAL_DECLINED",
      from_value: {
        approvalStepId: normalizeApprovalStepId(currentApprovalStepId),
        status: ticket.status,
      },
      to_value: {
        approvalStepId: normalizeApprovalStepId(currentApprovalStepId),
        status: nextStatus,
        closeReason: "Rejected",
      },
      metadata: {
        ...toHistoryMetadata(context.content),
        reason: context.content.content.trim(),
        closeReason: "Rejected",
      },
    },
    ticketPatch: {
      status: nextStatus,
      approval_step_id: null,
      assignment_phase: "WORK",
      approval_assignee_usernames: [],
      work_assignee_usernames: [],
      assignee_usernames: [],
      assigned_approver: false,
      assigned_worker: false,
      assigned: false,
    },
  };
};

const assignTicket: LocalActionHandler = (context) => {
  const ticket =
    context.ticket?.status === "Approval"
      ? requireTicket(context)
      : assertWorkAssigneeOrAdmin(context);
  const assigneeUsernames = requireAssigneeIds(context.content);
  const assignmentPhase = ticket.status === "Approval" ? "APPROVAL" : "WORK";
  const nextStatus = context.nextStatus ?? ticket.status;

  if (assignmentPhase === "APPROVAL" && !context.isAdmin) {
    throw new ServiceDeskApiError(
      "api.ticketCommand.localDemo.approvalAssignForbidden",
      403,
      {
        ticketId: ticket.id,
        username: context.employeeUserName,
      },
    );
  }

  return {
    history: {
      type: "ASSIGNMENT",
      event: "ASSIGNMENT_UPDATED",
      from_value: {
        status: ticket.status,
        assigneeUsernames: ticket.assignee_usernames,
      },
      to_value: { status: nextStatus, assigneeUsernames },
      metadata: {
        ...toHistoryMetadata(context.content),
        assignmentPhase,
        approvalStepId:
          assignmentPhase === "APPROVAL"
            ? normalizeApprovalStepId(ticket.approval_step_id)
            : undefined,
        previousStatus: ticket.status,
        nextStatus,
        previousAssigneeUsernames: ticket.assignee_usernames,
        nextAssigneeUsernames: assigneeUsernames,
      },
    },
    ticketPatch: buildAssigneePatch(
      ticket,
      assigneeUsernames,
      context.employeeUserName,
      assignmentPhase,
    ),
  };
};

const assignSelfTicket: LocalActionHandler = (context) => {
  const ticket = assertCurrentWorkAssignee(context);
  const previousAssigneeUsernames = ticket.assignee_usernames;

  if (previousAssigneeUsernames.length < 2) {
    throw new ServiceDeskApiError(
      "api.ticketCommand.localDemo.assignSelfRequiresMultipleAssignees",
      409,
      {
        ticketId: ticket.id,
        username: context.employeeUserName,
      },
    );
  }

  const assigneeUsernames = [context.employeeUserName];

  return {
    history: {
      type: "ASSIGNMENT",
      event: "ASSIGNMENT_UPDATED",
      from_value: { assigneeUsernames: previousAssigneeUsernames },
      to_value: { assigneeUsernames },
      metadata: {
        ...toHistoryMetadata(context.content),
        previousAssigneeUsernames,
        nextAssigneeUsernames: assigneeUsernames,
        claimedByUsername: context.employeeUserName,
      },
    },
    ticketPatch: buildAssigneePatch(
      ticket,
      assigneeUsernames,
      context.employeeUserName,
      "WORK",
    ),
  };
};

const rejectTicket: LocalActionHandler = (context) => {
  const ticket = assertWorkAssigneeOrAdmin(context);
  const nextStatus = requireNextStatus(context);

  return {
    history: {
      type: "STATUS",
      event: "TICKET_REJECTED",
      from_value: { status: ticket.status },
      to_value: {
        status: nextStatus,
        closeReason: "Rejected",
      },
      metadata: {
        ...toHistoryMetadata(context.content),
        reason: context.content.content.trim(),
        closeReason: "Rejected",
      },
    },
  };
};

const mergeTicket: LocalActionHandler = (context) => {
  assertWorkAssigneeOrAdmin(context);
  const targetTicketId = requireTargetTicketId(context.content);
  const { sourceTicket, targetTicket } = validateMergeTarget(
    context,
    targetTicketId,
  );

  return {
    history: {
      type: "TICKET",
      event: "TICKET_MERGED",
      from_value: {
        status: sourceTicket.status,
        mergedIntoTicketId: null,
      },
      to_value: {
        status: "Closed",
        closeReason: "Merged",
        mergedIntoTicketId: targetTicketId,
        mergedIntoTicketNo: targetTicket.ticket_number,
      },
      metadata: {
        ...toHistoryMetadata(context.content),
        closeReason: "Merged",
        mergedIntoTicketId: targetTicketId,
        mergedIntoTicketNo: targetTicket.ticket_number,
        reason: context.content.content.trim(),
      },
    },
    ticketPatch: {
      close_reason: "Merged",
      merged_into_ticket_id: targetTicketId,
      merged_into_ticket_no: targetTicket.ticket_number,
    },
  };
};

const cancelTicket: LocalActionHandler = (context) => {
  const ticket = assertRequester(context);
  const nextStatus = requireNextStatus(context);

  return {
    history: {
      type: "TICKET",
      event: "TICKET_CANCELED",
      from_value: { status: ticket.status },
      to_value: {
        status: nextStatus,
        closeReason: "Canceled",
      },
      metadata: {
        ...toHistoryMetadata(context.content),
        reason: context.content.content.trim(),
        closeReason: "Canceled",
      },
    },
    ticketPatch: {
      close_reason: "Canceled",
    },
  };
};

const adjustTicket: LocalActionHandler = (context) => {
  const ticket = context.isAdmin
    ? requireTicket(context)
    : assertWorkAssigneeOrAdmin(context);
  const priority = resolvePriority(context.content.priority, ticket.priority);
  const riskLevel = resolveRiskLevel(
    context.content.riskLevel,
    ticket.risk_level,
  );
  const dueAt = context.content.dueAt ?? ticket.due_at;
  const isAdminCorrection =
    context.isAdmin && (ticket.status === "Resolved" || ticket.status === "Closed");

  if (isAdminCorrection && dueAt !== ticket.due_at) {
    throw new ServiceDeskApiError(
      "api.ticketCommand.localDemo.dueAtCorrectionForbidden",
      400,
      { ticketId: ticket.id },
    );
  }

  const previous = {
    priority: ticket.priority,
    risk_level: ticket.risk_level,
    ...(isAdminCorrection ? {} : { due_at: ticket.due_at }),
  };
  const next = {
    priority,
    risk_level: riskLevel,
    ...(isAdminCorrection ? {} : { due_at: dueAt }),
  };
  const changedFields = Object.keys(previous).filter((fieldName) => {
    const key = fieldName as keyof typeof previous;
    return previous[key] !== next[key];
  });

  if (changedFields.length === 0) {
    throw new ServiceDeskApiError(
      "api.ticketCommand.localDemo.noPlanningChanges",
      400,
      { ticketId: ticket.id },
    );
  }

  return {
    history: {
      type: "PLANNING",
      event: "PLANNING_UPDATED",
      from_value: previous,
      to_value: next,
      metadata: {
        ...toHistoryMetadata(context.content),
        ...(isAdminCorrection
          ? {
              isAdminCorrection: true,
              changedFields,
              previous,
              next,
            }
          : { changedFields }),
      },
    },
    ticketPatch: {
      priority,
      risk_level: riskLevel,
      ...(isAdminCorrection ? {} : { due_at: dueAt }),
    },
  };
};

const reopenTicket: LocalActionHandler = (context) => {
  const ticket = assertRequesterOrAdmin(context);
  const nextStatus = requireNextStatus(context);

  if (ticket.assignee_usernames.length === 0) {
    throw new ServiceDeskApiError(
      "api.ticketCommand.localDemo.assigneeUnavailable",
      409,
      { ticketId: ticket.id },
    );
  }

  return {
    history: {
      type: "STATUS",
      event: "TICKET_REOPENED",
      from_value: { status: ticket.status },
      to_value: {
        status: nextStatus,
        assigneeUsernames: ticket.assignee_usernames,
      },
      metadata: {
        ...toHistoryMetadata(context.content),
        reason: context.content.content.trim(),
        previousStatus: ticket.status,
        nextStatus,
        previousAssigneeUsernames: ticket.assignee_usernames,
        nextAssigneeUsernames: ticket.assignee_usernames,
      },
    },
  };
};

const resubmitTicket: LocalActionHandler = (context) => {
  const ticket = assertRequester(context);
  const routing = resolveCreateTicketRouting({
    isInternal: context.isInternal ?? false,
    categoryId: ticket.category_id,
    parentCategoryId: ticket.category_parent_id ?? ticket.category_id,
    requesterUsername: ticket.requester_username,
  });

  return {
    history: [
      {
        type: "TICKET",
        event: "TICKET_SUBMITTED",
        from_value: { status: ticket.status },
        to_value: {
          status: routing.status,
          assigneeUsernames: routing.assigneeUsernames,
          approvalStepId: normalizeApprovalStepId(routing.approvalStepId),
        },
        metadata: {
          ...toHistoryMetadata(context.content),
          reason: context.content.content.trim(),
          previousStatus: ticket.status,
          nextStatus: routing.status,
        },
      },
      createRoutingHistory(ticket, routing),
    ],
    ticketPatch: buildApprovalRoutingPatch(routing, context.employeeUserName),
  };
};

export const actionSpecMap: Record<TicketActionApiType, LocalActionSpec> = {
  approve: { handler: approveTicket, needsTicket: true },
  decline: { handler: declineTicket, needsTicket: true },
  comment: { handler: createMessageHistory("COMMENT"), needsTicket: true },
  note: { handler: createMessageHistory("NOTE"), needsTicket: true },
  assign: { handler: assignTicket, needsTicket: true },
  assignSelf: { handler: assignSelfTicket, needsTicket: true },
  reject: { handler: rejectTicket, needsTicket: true },
  merge: { handler: mergeTicket, needsTicket: true },
  adjust: { handler: adjustTicket, needsTicket: true },
  reopen: { handler: reopenTicket, needsTicket: true },
  resubmit: { handler: resubmitTicket, needsTicket: true },
  cancel: { handler: cancelTicket, needsTicket: true },
};
