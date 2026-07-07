import type { TicketActionType, TicketStatus } from "@/domain/serviceDesk";
import {
  findActiveTicketViewRowById,
  findApprovalStepAssigneeUsernames,
  findCategoryAssignmentUsernames,
  findNextApprovalStepId,
  type TicketQueryExecutor,
  updateTicketApprovalRoutingById,
} from "@/server/data/serviceDesk/ticket/ticketRepository";
import type { ServiceDeskTicketViewRow } from "@/server/data/serviceDesk/ticket/ticketRow";
import {
  createHistoryOfApprovalApproved,
  createHistoryOfApprovalDeclined,
} from "@/server/data/serviceDesk/ticketHistory";
import { withPortalApiTransaction } from "@/server/shared/supabase/portalApiClient";

import type {
  ApprovalTicketActionType,
  CreateApprovalTicketActionDto,
  TicketActionDto,
} from "./ticketActionDto";
import { mapTicketActionRowToDto } from "./ticketActionMapper";
import {
  createApprovalTicketActionRow,
  createTicketActionRow,
  type CreateTicketActionRowInput,
  findActiveTicketActionRowsByTicketId,
  findNextTicketActionNo,
  type TicketActionRepositoryOptions,
} from "./ticketActionRepository";

type TicketActionServiceOptions = TicketActionRepositoryOptions;
export type TicketApprovalActionPath = "approve" | "decline";
export type ApprovalTicketActionRequestDto = {
  content: string;
  actionType?: TicketActionType;
  files?: unknown[];
  images?: unknown[];
};

const APPROVAL_ACTION_TYPES = new Set<ApprovalTicketActionType>([
  "APPROVE",
  "DECLINE",
]);
const APPROVAL_ACTION_TYPE_BY_PATH: Record<
  TicketApprovalActionPath,
  ApprovalTicketActionType
> = {
  approve: "APPROVE",
  decline: "DECLINE",
};
const IMAGE_TAG_PATTERN = /<img\b/i;

type TicketApprovalActionInput = {
  ticketId: string;
  action: TicketApprovalActionPath;
  currentUserName: string;
  payload: ApprovalTicketActionRequestDto;
};

type ApprovalRouting = {
  approvalStepId: number | null;
  assigneeUsernames: string[];
  status: TicketStatus;
};

export async function getTicketActionsByTicketId(
  ticketId: string,
  options?: TicketActionServiceOptions,
): Promise<TicketActionDto[]> {
  const rows = await findActiveTicketActionRowsByTicketId(ticketId, options);

  return rows.map(mapTicketActionRowToDto);
}

export async function createTicketAction(
  input: Omit<CreateTicketActionRowInput, "actionNo">,
  options?: TicketActionServiceOptions,
): Promise<TicketActionDto> {
  const actionNo = await findNextTicketActionNo(input.ticketId, options);
  const row = await createTicketActionRow(
    {
      ...input,
      actionNo,
    },
    options,
  );

  if (!row) {
    throw createStatusError("Unable to create ticket action.", 409);
  }

  return mapTicketActionRowToDto(row);
}

export async function createApprovalTicketAction(
  input: CreateApprovalTicketActionDto,
  options?: TicketActionServiceOptions,
): Promise<TicketActionDto> {
  const content = input.content.trim();

  if (!APPROVAL_ACTION_TYPES.has(input.actionType)) {
    throw createStatusError("Invalid approval action type.", 400);
  }

  if (!content) {
    throw createStatusError("Approval action content is required.", 400);
  }

  if (!input.ownerUsername.trim()) {
    throw createStatusError("Approval action owner is required.", 401);
  }

  const row = await createApprovalTicketActionRow(
    {
      ticketId: input.ticketId,
      actionType: input.actionType,
      content,
      metadata: input.metadata ?? {},
      ownerUsername: input.ownerUsername,
    },
    options,
  );

  if (!row) {
    throw createStatusError("Unable to create approval ticket action.", 409);
  }

  return mapTicketActionRowToDto(row);
}

export async function executeTicketApprovalAction({
  ticketId,
  action,
  currentUserName,
  payload,
}: TicketApprovalActionInput) {
  const content = validateApprovalActionPayload(action, payload);

  return withPortalApiTransaction(async (query) => {
    const ticket = await findActiveTicketViewRowById(ticketId, { query });

    if (!ticket) {
      throw createStatusError("Ticket not found.", 404);
    }

    assertApprovalActionAllowed(ticket, currentUserName);

    const actionDto = await createApprovalTicketAction(
      {
        ticketId,
        actionType: APPROVAL_ACTION_TYPE_BY_PATH[action],
        content,
        metadata: {
          source: "ticketActionTool",
        },
        ownerUsername: currentUserName,
      },
      { query },
    );

    if (action === "approve") {
      await approveTicket({
        ticket,
        ticketId,
        currentUserName,
        actionNo: actionDto.action_no,
        query,
      });
    } else {
      await declineTicket({
        ticket,
        ticketId,
        currentUserName,
        actionNo: actionDto.action_no,
        reason: content,
        query,
      });
    }

    return actionDto;
  });
}

export function isTicketApprovalActionPath(
  action: string,
): action is TicketApprovalActionPath {
  return action === "approve" || action === "decline";
}

async function approveTicket({
  ticket,
  ticketId,
  currentUserName,
  actionNo,
  query,
}: {
  ticket: ServiceDeskTicketViewRow;
  ticketId: string;
  currentUserName: string;
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
}

async function declineTicket({
  ticket,
  ticketId,
  currentUserName,
  actionNo,
  reason,
  query,
}: {
  ticket: ServiceDeskTicketViewRow;
  ticketId: string;
  currentUserName: string;
  actionNo: number;
  reason: string;
  query: TicketQueryExecutor;
}) {
  const currentApprovalStepId = requireCurrentApprovalStepId(ticket);
  const updatedTicket = await updateTicketApprovalRoutingById(
    ticketId,
    {
      approvalStepId: currentApprovalStepId,
      assigneeUsernames: normalizeAssigneeUsernames(
        ticket.tk_assignee_usernames,
      ),
      status: "Declined",
      currentApprovalStepId,
      currentApproverUsername: currentUserName,
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
    return {
      approvalStepId: nextApprovalStepId,
      assigneeUsernames: await findApprovalStepAssigneeUsernames(
        {
          approvalStepId: nextApprovalStepId,
          requesterUsername: ticket.tk_requester_username,
        },
        { query },
      ),
      status: "Approval",
    };
  }

  return {
    approvalStepId: null,
    assigneeUsernames: await findCategoryAssignmentUsernames(
      {
        categoryId: ticket.cat_id,
        requesterUsername: ticket.tk_requester_username,
      },
      { query },
    ),
    status: "Assigned",
  };
}

function validateApprovalActionPayload(
  action: TicketApprovalActionPath,
  payload: ApprovalTicketActionRequestDto,
) {
  const content =
    typeof payload.content === "string" ? payload.content.trim() : "";

  if (
    payload.actionType &&
    payload.actionType !== APPROVAL_ACTION_TYPE_BY_PATH[action]
  ) {
    throw createStatusError("Action path and payload do not match.", 400);
  }

  if (!content) {
    throw createStatusError("Please enter a reason before submitting.", 400);
  }

  if (
    hasAttachmentPayload(payload.files) ||
    hasAttachmentPayload(payload.images) ||
    IMAGE_TAG_PATTERN.test(content)
  ) {
    throw createStatusError(
      "Approval actions do not accept files or inline images.",
      400,
    );
  }

  return content;
}

function hasAttachmentPayload(value: unknown) {
  return Array.isArray(value) && value.length > 0;
}

function assertApprovalActionAllowed(
  ticket: ServiceDeskTicketViewRow,
  currentUserName: string,
) {
  const assigneeUsernames = normalizeAssigneeUsernames(
    ticket.tk_assignee_usernames,
  );

  if (
    ticket.tk_status === "Approval" &&
    ticket.tk_approval_step_id !== null &&
    assigneeUsernames.includes(currentUserName)
  ) {
    return;
  }

  throw createStatusError(
    "Only the assigned approver can approve or decline this ticket.",
    403,
  );
}

function requireCurrentApprovalStepId(ticket: ServiceDeskTicketViewRow) {
  if (ticket.tk_approval_step_id !== null) {
    return ticket.tk_approval_step_id;
  }

  throw createStatusError("Approval step is unavailable.", 409);
}

function normalizeAssigneeUsernames(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter(
        (item): item is string => typeof item === "string" && item.length > 0,
      )
    : [];
}

function createStatusError(message: string, status: number) {
  const error = new Error(message) as Error & { status: number };
  error.status = status;
  return error;
}
