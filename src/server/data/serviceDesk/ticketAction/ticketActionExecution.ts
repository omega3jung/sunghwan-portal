import type { TicketStatus } from "@/domain/serviceDesk";
import { canMergeTicketInto } from "@/domain/serviceDesk/ticket/merge";
import {
  findActiveTicketViewRowByIdIncludingDraft,
  findApprovalStepAssigneeUsernames,
  findCategoryAssignmentUsernames,
  findNextApprovalStepId,
  type TicketQueryExecutor,
  updateTicketApprovalRoutingById,
  updateTicketAssigneesById,
  updateTicketCloseStateById,
  updateTicketInitialRoutingById,
  updateTicketMergeStateById,
  updateTicketPlanningById,
  updateTicketStatusById,
} from "@/server/data/serviceDesk/ticket/ticketRepository";
import type { ServiceDeskTicketViewRow } from "@/server/data/serviceDesk/ticket/ticketRow";
import { finishRunningWorkSessionsByTicketId } from "@/server/data/serviceDesk/workSession";

import {
  createHistoryOfApprovalApproved,
  createHistoryOfApprovalDeclined,
  createHistoryOfApprovalRequested,
  createHistoryOfAssignmentChange,
  createHistoryOfAssignmentResolvedByRule,
  createHistoryOfCommentCreated,
  createHistoryOfNoteCreated,
  createHistoryOfPlanningChange,
  createHistoryOfStatusChange,
  createHistoryOfTicketCanceled,
  createHistoryOfTicketMerged,
  createHistoryOfTicketRejected,
} from "../ticketHistory/ticketHistoryEventService";
import { createTicketHistory } from "../ticketHistory/ticketHistoryService";
import {
  assertAdminActionAllowed,
  assertRequesterActionAllowed,
  assertRequesterOrAdmin,
  assertTicketUpdated,
  assertWorkAssignee,
  assertWorkAssigneeOrAdmin,
  compactHistoryObject,
  createStatusError,
  normalizeAssigneeUsernames,
  type NormalizedTicketActionPayload,
  normalizeHistoryMetadataRecord,
  requireCurrentApprovalStepId,
  requireNextTicketStatus,
  resolveNextTicketStatus,
  type TicketActionExecutionMode,
  type TicketGeneralActionPath,
} from "./ticketActionRules";

type ApprovalRouting = {
  approvalStepId: number | null;
  assigneeUsernames: string[];
  status: TicketStatus;
};

export async function applyTicketActionEffect({
  action,
  actionMode,
  ticket,
  targetTicket,
  ticketId,
  actionNo,
  currentUserName,
  isAdmin,
  payload,
  query,
}: {
  action: TicketGeneralActionPath;
  actionMode: TicketActionExecutionMode;
  ticket: ServiceDeskTicketViewRow;
  targetTicket: ServiceDeskTicketViewRow | null;
  ticketId: string;
  actionNo: number;
  currentUserName: string;
  isAdmin: boolean;
  payload: NormalizedTicketActionPayload;
  query: TicketQueryExecutor;
}) {
  switch (action) {
    case "comment":
      await createHistoryOfCommentCreated(
        {
          ticketId,
          actionNo,
          actorUsername: currentUserName,
          metadata: payload.historyMetadata,
        },
        { query },
      );
      return;

    case "note":
      await createHistoryOfNoteCreated(
        {
          ticketId,
          actionNo,
          actorUsername: currentUserName,
          metadata: payload.historyMetadata,
        },
        { query },
      );
      return;

    case "assign":
      await executeAssignTicketAction({
        ticket,
        ticketId,
        actionNo,
        currentUserName,
        isAdmin,
        payload,
        actionMode,
        query,
      });
      return;

    case "assignSelf":
      await executeAssignSelfTicketAction({
        ticket,
        ticketId,
        actionNo,
        currentUserName,
        isAdmin,
        payload,
        query,
      });
      return;

    case "adjust":
      await executeAdjustTicketAction({
        ticket,
        ticketId,
        actionNo,
        currentUserName,
        isAdmin,
        payload,
        query,
      });
      return;

    case "reject":
      await executeRejectTicketAction({
        ticket,
        ticketId,
        actionNo,
        currentUserName,
        isAdmin,
        payload,
        actionMode,
        query,
      });
      return;

    case "merge":
      await executeMergeTicketAction({
        ticket,
        targetTicket,
        ticketId,
        actionNo,
        currentUserName,
        isAdmin,
        payload,
        query,
      });
      return;

    case "reopen":
      await executeReopenTicketAction({
        ticket,
        ticketId,
        actionNo,
        currentUserName,
        isAdmin,
        payload,
        actionMode,
        query,
      });
      return;

    case "resubmit":
      await executeResubmitTicketAction({
        ticket,
        ticketId,
        actionNo,
        currentUserName,
        payload,
        query,
      });
      return;

    case "cancel":
      await executeCancelTicketAction({
        ticket,
        ticketId,
        actionNo,
        currentUserName,
        payload,
        actionMode,
        query,
      });
      return;
  }
}

async function executeAssignTicketAction({
  ticket,
  ticketId,
  actionNo,
  currentUserName,
  isAdmin,
  payload,
  actionMode,
  query,
}: {
  ticket: ServiceDeskTicketViewRow;
  ticketId: string;
  actionNo: number;
  currentUserName: string;
  isAdmin: boolean;
  payload: NormalizedTicketActionPayload;
  actionMode: TicketActionExecutionMode;
  query: TicketQueryExecutor;
}) {
  const assignmentPhase = ticket.tk_status === "Approval" ? "APPROVAL" : "WORK";

  if (assignmentPhase === "APPROVAL") {
    assertAdminActionAllowed(isAdmin, "Only an admin can reassign approvers.");
  } else {
    assertWorkAssigneeOrAdmin(ticket, currentUserName, isAdmin);
  }

  const assigneeUsernames = payload.assigneeUsernames;
  const status =
    resolveNextTicketStatus(actionMode, ticket.tk_status) ?? ticket.tk_status;
  // TODO(notification):
  // Resolve assignee emails through a trusted server-side employee email resolver
  // and merge them into outbound notification recipients at send time.
  // Keep tk_email as the persisted requester-defined email configuration.
  // Do not persist derived assignee emails into tk_email.
  const updatedTicket = await updateTicketAssigneesById(
    ticketId,
    {
      assigneeUsernames,
      status,
    },
    { query },
  );

  assertTicketUpdated(
    updatedTicket,
    "Assignment action could not update the ticket.",
  );

  await createHistoryOfAssignmentChange(
    {
      ticketId,
      actionNo,
      actorUsername: currentUserName,
      fromAssigneeUsernames: normalizeAssigneeUsernames(
        ticket.tk_assignee_usernames,
      ),
      toAssigneeUsernames: assigneeUsernames,
      metadata: compactHistoryObject({
        ...normalizeHistoryMetadataRecord(payload.historyMetadata),
        assignmentPhase,
        approvalStepId:
          assignmentPhase === "APPROVAL"
            ? ticket.tk_approval_step_id
            : undefined,
        previousStatus: ticket.tk_status,
        nextStatus: status,
      }),
    },
    { query },
  );
}

async function executeAssignSelfTicketAction({
  ticket,
  ticketId,
  actionNo,
  currentUserName,
  isAdmin: _isAdmin,
  payload,
  query,
}: {
  ticket: ServiceDeskTicketViewRow;
  ticketId: string;
  actionNo: number;
  currentUserName: string;
  isAdmin: boolean;
  payload: NormalizedTicketActionPayload;
  query: TicketQueryExecutor;
}) {
  const currentAssigneeUsernames = normalizeAssigneeUsernames(
    ticket.tk_assignee_usernames,
  );

  assertWorkAssignee(ticket, currentUserName);

  if (currentAssigneeUsernames.length < 2) {
    throw createStatusError(
      "Assign self requires at least two current assignees.",
      409,
    );
  }

  const assigneeUsernames = [currentUserName];
  const updatedTicket = await updateTicketAssigneesById(
    ticketId,
    {
      assigneeUsernames,
      status: ticket.tk_status,
    },
    { query },
  );

  assertTicketUpdated(
    updatedTicket,
    "Assign self action could not update the ticket.",
  );

  await createHistoryOfAssignmentChange(
    {
      ticketId,
      actionNo,
      actorUsername: currentUserName,
      fromAssigneeUsernames: currentAssigneeUsernames,
      toAssigneeUsernames: assigneeUsernames,
      metadata: compactHistoryObject({
        ...normalizeHistoryMetadataRecord(payload.historyMetadata),
        claimedByUsername: currentUserName,
      }),
    },
    { query },
  );
}

async function executeAdjustTicketAction({
  ticket,
  ticketId,
  actionNo,
  currentUserName,
  isAdmin,
  payload,
  query,
}: {
  ticket: ServiceDeskTicketViewRow;
  ticketId: string;
  actionNo: number;
  currentUserName: string;
  isAdmin: boolean;
  payload: NormalizedTicketActionPayload;
  query: TicketQueryExecutor;
}) {
  if (!isAdmin) {
    assertWorkAssignee(ticket, currentUserName);
  }

  const priority = payload.priority ?? ticket.tk_priority;
  const riskLevel = payload.riskLevel ?? ticket.tk_risk_level;
  const dueAt = payload.dueAt ?? ticket.tk_due_at;
  const isAdminCorrection =
    isAdmin &&
    (ticket.tk_status === "Resolved" || ticket.tk_status === "Closed");

  if (isAdminCorrection && dueAt !== ticket.tk_due_at) {
    throw createStatusError(
      "Due date cannot be changed for resolved or closed admin correction.",
      400,
    );
  }

  const previousPlanning = compactHistoryObject({
    priority: ticket.tk_priority,
    risk_level: ticket.tk_risk_level,
    ...(isAdminCorrection ? {} : { due_at: ticket.tk_due_at }),
  });
  const nextPlanning = compactHistoryObject({
    priority,
    risk_level: riskLevel,
    ...(isAdminCorrection ? {} : { due_at: dueAt }),
  });
  const changedFields = [
    priority !== ticket.tk_priority ? "priority" : null,
    riskLevel !== ticket.tk_risk_level ? "riskLevel" : null,
    !isAdminCorrection && dueAt !== ticket.tk_due_at ? "dueAt" : null,
  ].filter((field): field is string => field !== null);

  if (changedFields.length === 0) {
    throw createStatusError("No planning fields changed.", 400);
  }

  const updatedTicket = await updateTicketPlanningById(
    ticketId,
    {
      priority,
      riskLevel,
      dueAt: isAdminCorrection ? ticket.tk_due_at : dueAt,
    },
    { query },
  );

  assertTicketUpdated(
    updatedTicket,
    "Adjust action could not update the ticket.",
  );

  await createHistoryOfPlanningChange(
    {
      ticketId,
      actionNo,
      actorUsername: currentUserName,
      fromPlanning: previousPlanning,
      toPlanning: nextPlanning,
      metadata: compactHistoryObject({
        ...normalizeHistoryMetadataRecord(payload.historyMetadata),
        changedFields,
        ...(isAdminCorrection
          ? {
              isAdminCorrection: true,
              previous: previousPlanning,
              next: nextPlanning,
            }
          : {}),
      }),
    },
    { query },
  );
}

async function executeRejectTicketAction({
  ticket,
  ticketId,
  actionNo,
  currentUserName,
  isAdmin,
  payload,
  actionMode,
  query,
}: {
  ticket: ServiceDeskTicketViewRow;
  ticketId: string;
  actionNo: number;
  currentUserName: string;
  isAdmin: boolean;
  payload: NormalizedTicketActionPayload;
  actionMode: TicketActionExecutionMode;
  query: TicketQueryExecutor;
}) {
  assertWorkAssigneeOrAdmin(ticket, currentUserName, isAdmin);

  const status = requireNextTicketStatus(actionMode, ticket.tk_status);
  const updatedTicket = await updateTicketStatusById(
    ticketId,
    { status },
    { query },
  );

  assertTicketUpdated(
    updatedTicket,
    "Reject action could not update the ticket.",
  );

  await finishRunningWorkSessionsByTicketId(
    ticketId,
    new Date().toISOString(),
    { query },
  );

  await createHistoryOfTicketRejected(
    {
      ticketId,
      actionNo,
      actorUsername: currentUserName,
      fromStatus: ticket.tk_status,
      toStatus: status,
      reason: payload.content,
      metadata: payload.historyMetadata,
    },
    { query },
  );
}

async function executeMergeTicketAction({
  ticket,
  targetTicket,
  ticketId,
  actionNo,
  currentUserName,
  isAdmin,
  payload,
  query,
}: {
  ticket: ServiceDeskTicketViewRow;
  targetTicket: ServiceDeskTicketViewRow | null;
  ticketId: string;
  actionNo: number;
  currentUserName: string;
  isAdmin: boolean;
  payload: NormalizedTicketActionPayload;
  query: TicketQueryExecutor;
}) {
  assertWorkAssigneeOrAdmin(ticket, currentUserName, isAdmin);

  if (!targetTicket || !payload.targetTicketId) {
    throw createStatusError("Merge target ticket is required.", 400);
  }

  const updatedTicket = await updateTicketMergeStateById(
    ticketId,
    { query },
  );

  assertTicketUpdated(
    updatedTicket,
    "Merge action could not update the ticket.",
  );

  await finishRunningWorkSessionsByTicketId(
    ticketId,
    new Date().toISOString(),
    { query },
  );

  await createHistoryOfTicketMerged(
    {
      ticketId,
      actionNo,
      actorUsername: currentUserName,
      fromStatus: ticket.tk_status,
      targetTicketId: payload.targetTicketId,
      targetTicketNo: targetTicket.tk_ticket_no,
      reason: payload.content,
      metadata: payload.historyMetadata,
    },
    { query },
  );
}

async function executeReopenTicketAction({
  ticket,
  ticketId,
  actionNo,
  currentUserName,
  isAdmin,
  payload,
  actionMode,
  query,
}: {
  ticket: ServiceDeskTicketViewRow;
  ticketId: string;
  actionNo: number;
  currentUserName: string;
  isAdmin: boolean;
  payload: NormalizedTicketActionPayload;
  actionMode: TicketActionExecutionMode;
  query: TicketQueryExecutor;
}) {
  assertRequesterOrAdmin(ticket, currentUserName, isAdmin);

  if (normalizeAssigneeUsernames(ticket.tk_assignee_usernames).length === 0) {
    throw createStatusError("Resolved ticket has no assignee to reopen.", 409);
  }

  const status = requireNextTicketStatus(actionMode, ticket.tk_status);
  const updatedTicket = await updateTicketStatusById(
    ticketId,
    { status },
    { query },
  );

  assertTicketUpdated(
    updatedTicket,
    "Status action could not update the ticket.",
  );

  await createHistoryOfStatusChange(
    {
      ticketId,
      actionNo,
      actorUsername: currentUserName,
      fromStatus: ticket.tk_status,
      toStatus: status,
      reason: payload.content,
      metadata: compactHistoryObject({
        ...normalizeHistoryMetadataRecord(payload.historyMetadata),
        event: "TICKET_REOPENED",
        previousStatus: ticket.tk_status,
        nextStatus: status,
        previousAssigneeUsernames: normalizeAssigneeUsernames(
          ticket.tk_assignee_usernames,
        ),
        nextAssigneeUsernames: normalizeAssigneeUsernames(
          ticket.tk_assignee_usernames,
        ),
      }),
    },
    { query },
  );
}

async function executeResubmitTicketAction({
  ticket,
  ticketId,
  actionNo,
  currentUserName,
  payload,
  query,
}: {
  ticket: ServiceDeskTicketViewRow;
  ticketId: string;
  actionNo: number;
  currentUserName: string;
  payload: NormalizedTicketActionPayload;
  query: TicketQueryExecutor;
}) {
  assertRequesterActionAllowed(ticket, currentUserName);

  const routing = await resolveInitialTicketRouting(ticket, { query });
  const updatedTicket = await updateTicketInitialRoutingById(
    ticketId,
    {
      approvalStepId: routing.approvalStepId,
      assigneeUsernames: routing.assigneeUsernames,
      status: routing.status,
    },
    { query },
  );

  assertTicketUpdated(
    updatedTicket,
    "Resubmit action could not update the ticket.",
  );

  await createTicketHistory(
    {
      ticketId,
      actionNo,
      historyType: "TICKET",
      source: "USER_ACTION",
      event: "TICKET_SUBMITTED",
      actorUsername: currentUserName,
      fromValue: { status: ticket.tk_status },
      toValue: {
        status: routing.status,
        approvalStepId: routing.approvalStepId,
        assigneeUsernames: routing.assigneeUsernames,
      },
      metadata: compactHistoryObject({
        ...normalizeHistoryMetadataRecord(payload.historyMetadata),
        reason: payload.content,
        previousStatus: ticket.tk_status,
        nextStatus: routing.status,
      }),
    },
    { query },
  );

  if (routing.approvalStepId !== null) {
    await createHistoryOfApprovalRequested(
      {
        ticketId,
        actionNo,
        actorUsername: currentUserName,
        approvalStepId: routing.approvalStepId,
        assigneeUsernames: routing.assigneeUsernames,
      },
      { query },
    );
  } else {
    await createHistoryOfAssignmentResolvedByRule(
      {
        ticketId,
        actionNo,
        actorUsername: currentUserName,
        fromAssigneeUsernames: normalizeAssigneeUsernames(
          ticket.tk_assignee_usernames,
        ),
        toAssigneeUsernames: routing.assigneeUsernames,
        metadata: {
          previousStatus: ticket.tk_status,
          nextStatus: routing.status,
        },
      },
      { query },
    );
  }
}

async function executeCancelTicketAction({
  ticket,
  ticketId,
  actionNo,
  currentUserName,
  payload,
  actionMode,
  query,
}: {
  ticket: ServiceDeskTicketViewRow;
  ticketId: string;
  actionNo: number;
  currentUserName: string;
  payload: NormalizedTicketActionPayload;
  actionMode: TicketActionExecutionMode;
  query: TicketQueryExecutor;
}) {
  assertRequesterActionAllowed(ticket, currentUserName);

  const status = requireNextTicketStatus(actionMode, ticket.tk_status);
  const updatedTicket = await updateTicketCloseStateById(ticketId, { query });

  assertTicketUpdated(
    updatedTicket,
    "Cancel action could not update the ticket.",
  );

  await finishRunningWorkSessionsByTicketId(
    ticketId,
    new Date().toISOString(),
    { query },
  );

  await createHistoryOfTicketCanceled(
    {
      ticketId,
      actionNo,
      actorUsername: currentUserName,
      fromStatus: ticket.tk_status,
      toStatus: status,
      reason: payload.content,
      metadata: payload.historyMetadata,
    },
    { query },
  );
}

export async function approveTicket({
  ticket,
  ticketId,
  currentUserName,
  isAdmin,
  actionNo,
  query,
}: {
  ticket: ServiceDeskTicketViewRow;
  ticketId: string;
  currentUserName: string;
  isAdmin: boolean;
  actionNo: number;
  query: TicketQueryExecutor;
}) {
  const currentApprovalStepId = requireCurrentApprovalStepId(ticket);
  const routing = await resolveApprovedTicketRouting(ticket, {
    query,
    currentApprovalStepId,
  });
  const updatedTicket = await updateTicketApprovalRoutingById(
    ticketId,
    {
      ...routing,
      currentApprovalStepId,
      currentApproverUsername: currentUserName,
      isAdmin,
    },
    { query },
  );

  if (!updatedTicket) {
    throw createStatusError(
      "Approval action could not update the ticket.",
      409,
    );
  }

  await createHistoryOfApprovalApproved(
    {
      ticketId,
      actionNo,
      actorUsername: currentUserName,
      approvalStepId: currentApprovalStepId,
      nextApprovalStepId: routing.approvalStepId,
    },
    { query },
  );

  if (routing.approvalStepId !== null) {
    await createHistoryOfApprovalRequested(
      {
        ticketId,
        actionNo,
        actorUsername: currentUserName,
        approvalStepId: routing.approvalStepId,
        assigneeUsernames: routing.assigneeUsernames,
      },
      { query },
    );
  } else {
    await createHistoryOfAssignmentResolvedByRule(
      {
        ticketId,
        actionNo,
        actorUsername: currentUserName,
        fromAssigneeUsernames: normalizeAssigneeUsernames(
          ticket.tk_assignee_usernames,
        ),
        toAssigneeUsernames: routing.assigneeUsernames,
        metadata: {
          previousStatus: ticket.tk_status,
          nextStatus: routing.status,
        },
      },
      { query },
    );
  }
}

export async function declineTicket({
  ticket,
  ticketId,
  currentUserName,
  isAdmin,
  actionNo,
  reason,
  fromStatus,
  toStatus,
  query,
}: {
  ticket: ServiceDeskTicketViewRow;
  ticketId: string;
  currentUserName: string;
  isAdmin: boolean;
  actionNo: number;
  reason: string;
  fromStatus: TicketStatus;
  toStatus: TicketStatus;
  query: TicketQueryExecutor;
}) {
  const currentApprovalStepId = requireCurrentApprovalStepId(ticket);
  const updatedTicket = await updateTicketApprovalRoutingById(
    ticketId,
    {
      approvalStepId: null,
      assigneeUsernames: [],
      status: "Declined",
      currentApprovalStepId,
      currentApproverUsername: currentUserName,
      isAdmin,
    },
    { query },
  );

  if (!updatedTicket) {
    throw createStatusError(
      "Approval action could not update the ticket.",
      409,
    );
  }

  await createHistoryOfApprovalDeclined(
    {
      ticketId,
      actionNo,
      actorUsername: currentUserName,
      approvalStepId: currentApprovalStepId,
      fromStatus,
      toStatus,
      reason,
    },
    { query },
  );
}

async function resolveApprovedTicketRouting(
  ticket: ServiceDeskTicketViewRow,
  {
    query,
    currentApprovalStepId,
  }: {
    query: TicketQueryExecutor;
    currentApprovalStepId: number;
  },
): Promise<ApprovalRouting> {
  const nextApprovalStepId = await findNextApprovalStepId(
    {
      requesterUsername: ticket.tk_requester_username,
      categoryId: ticket.cat_id,
      currentApprovalStepId,
    },
    { query },
  );

  if (nextApprovalStepId !== null) {
    const assigneeUsernames = requireResolvedRoutingAssignees(
      await findApprovalStepAssigneeUsernames(
        {
          approvalStepId: nextApprovalStepId,
          requesterUsername: ticket.tk_requester_username,
        },
        { query },
      ),
      "Unable to resolve approval assignees.",
    );

    return {
      approvalStepId: nextApprovalStepId,
      assigneeUsernames,
      status: "Approval",
    };
  }

  const assigneeUsernames = requireResolvedRoutingAssignees(
    await findCategoryAssignmentUsernames(
      {
        categoryId: ticket.cat_id,
        requesterUsername: ticket.tk_requester_username,
      },
      { query },
    ),
    "Unable to resolve ticket assignees.",
  );

  return {
    approvalStepId: null,
    assigneeUsernames,
    status: "Assigned",
  };
}

async function resolveInitialTicketRouting(
  ticket: ServiceDeskTicketViewRow,
  {
    query,
  }: {
    query: TicketQueryExecutor;
  },
): Promise<ApprovalRouting> {
  const nextApprovalStepId = await findNextApprovalStepId(
    {
      requesterUsername: ticket.tk_requester_username,
      categoryId: ticket.cat_id,
      currentApprovalStepId: null,
    },
    { query },
  );

  if (nextApprovalStepId !== null) {
    const assigneeUsernames = requireResolvedRoutingAssignees(
      await findApprovalStepAssigneeUsernames(
        {
          approvalStepId: nextApprovalStepId,
          requesterUsername: ticket.tk_requester_username,
        },
        { query },
      ),
      "Unable to resolve approval assignees.",
    );

    return {
      approvalStepId: nextApprovalStepId,
      assigneeUsernames,
      status: "Approval",
    };
  }

  const assigneeUsernames = requireResolvedRoutingAssignees(
    await findCategoryAssignmentUsernames(
      {
        categoryId: ticket.cat_id,
        requesterUsername: ticket.tk_requester_username,
      },
      { query },
    ),
    "Unable to resolve ticket assignees.",
  );

  return {
    approvalStepId: null,
    assigneeUsernames,
    status: "Assigned",
  };
}

function requireResolvedRoutingAssignees(
  assigneeUsernames: string[],
  message: string,
) {
  if (assigneeUsernames.length === 0) {
    throw createStatusError(message, 409);
  }

  return assigneeUsernames;
}

export async function resolveMergeTargetTicket({
  ticket,
  targetTicketId,
  query,
}: {
  ticket: ServiceDeskTicketViewRow;
  targetTicketId?: string;
  query: TicketQueryExecutor;
}) {
  if (!targetTicketId) {
    throw createStatusError("Merge target ticket is required.", 400);
  }

  if (targetTicketId === ticket.tk_id) {
    throw createStatusError("A ticket cannot be merged into itself.", 400);
  }

  const targetTicket = await findActiveTicketViewRowByIdIncludingDraft(
    targetTicketId,
    { query },
  );

  if (!targetTicket) {
    throw createStatusError("Merge target ticket not found.", 404);
  }

  if (ticket.tk_status === "Draft") {
    throw createStatusError("Draft tickets cannot be merged.", 400);
  }

  if (targetTicket.tk_status === "Draft") {
    throw createStatusError("A ticket cannot be merged into a draft.", 400);
  }

  if (ticket.tk_merged_into_ticket_id) {
    throw createStatusError("Ticket has already been merged.", 400);
  }

  if (targetTicket.tk_merged_into_ticket_id) {
    throw createStatusError("Merge target has already been merged.", 400);
  }

  const canMerge = canMergeTicketInto(
    toMergeAwareTicket(ticket),
    toMergeAwareTicket(targetTicket),
  );

  if (!canMerge) {
    throw createStatusError("Invalid merge target.", 400);
  }

  return targetTicket;
}

function toMergeAwareTicket(ticket: ServiceDeskTicketViewRow) {
  return {
    id: ticket.tk_id,
    status: ticket.tk_status,
    closeReason: ticket.tk_close_reason ?? undefined,
    mergedIntoTicketId: ticket.tk_merged_into_ticket_id,
  };
}
