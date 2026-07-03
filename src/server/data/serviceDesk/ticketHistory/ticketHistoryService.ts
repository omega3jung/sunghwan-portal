import {
  CreateTicketHistoryInput,
  TicketHistoryDto,
} from "./ticketHistoryDto";
import { mapTicketHistoryRowToDto } from "./ticketHistoryMapper";
import {
  createTicketHistoryRow,
  TicketHistoryRepositoryOptions,
} from "./ticketHistoryRepository";
import { TicketHistoryJsonValue } from "./ticketHistoryTypes";

type TicketHistoryServiceOptions = TicketHistoryRepositoryOptions;

export async function createTicketHistory(
  input: CreateTicketHistoryInput,
  options?: TicketHistoryServiceOptions,
): Promise<TicketHistoryDto> {
  const row = await createTicketHistoryRow(input, options);

  if (!row) {
    throw createStatusError("Unable to create ticket history.", 409);
  }

  return mapTicketHistoryRowToDto(row);
}

export async function createHistoryOfTicketCreate(
  params: {
    ticketId: string;
    actorUsername: string;
    ticketNumber?: string;
    categoryId?: number | null;
    status?: string;
  },
  options?: TicketHistoryServiceOptions,
): Promise<TicketHistoryDto> {
  return createTicketHistory(
    {
      ticketId: params.ticketId,
      actionNo: null,
      historyType: "TICKET",
      historyAction: "CREATED",
      actorUsername: params.actorUsername,
      fromValue: null,
      toValue: compactJsonObject({
        ticketNumber: params.ticketNumber,
        categoryId: params.categoryId,
        status: params.status,
      }),
      metadata: null,
    },
    options,
  );
}

export async function createHistoryOfTicketSubmit(
  params: {
    ticketId: string;
    actorUsername: string;
    fromStatus?: string | null;
    toStatus?: string;
    ticketNumber?: string;
    categoryId?: number | null;
    source?: string;
    submittedFromExplicitDraft?: boolean;
  },
  options?: TicketHistoryServiceOptions,
): Promise<TicketHistoryDto> {
  return createTicketHistory(
    {
      ticketId: params.ticketId,
      actionNo: null,
      historyType: "TICKET",
      historyAction: "SUBMITTED",
      actorUsername: params.actorUsername,
      fromValue: params.fromStatus ? { status: params.fromStatus } : null,
      toValue: compactJsonObject({
        status: params.toStatus ?? "Open",
        ticketNumber: params.ticketNumber,
        categoryId: params.categoryId,
      }),
      metadata: compactJsonObject({
        source: params.source,
        submittedFromExplicitDraft: params.submittedFromExplicitDraft,
      }),
    },
    options,
  );
}

export async function createHistoryOfStatusChange(
  params: {
    ticketId: string;
    actorUsername: string | null;
    fromStatus: string;
    toStatus: string;
    reason?: string;
  },
  options?: TicketHistoryServiceOptions,
): Promise<TicketHistoryDto> {
  return createTicketHistory(
    {
      ticketId: params.ticketId,
      actionNo: null,
      historyType: "STATUS",
      historyAction: "STATUS_CHANGED",
      actorUsername: params.actorUsername,
      fromValue: { status: params.fromStatus },
      toValue: { status: params.toStatus },
      metadata: params.reason ? { reason: params.reason } : null,
    },
    options,
  );
}

export async function createHistoryOfApprovalRequested(
  params: {
    ticketId: string;
    actionNo?: number | null;
    actorUsername: string | null;
    approvalStepId: number;
    assigneeUsernames?: string[] | null;
  },
  options?: TicketHistoryServiceOptions,
): Promise<TicketHistoryDto> {
  return createTicketHistory(
    {
      ticketId: params.ticketId,
      actionNo: params.actionNo ?? null,
      historyType: "APPROVAL",
      historyAction: "APPROVAL_REQUESTED",
      actorUsername: params.actorUsername,
      fromValue: null,
      toValue: compactJsonObject({
        approvalStepId: params.approvalStepId,
        assigneeUsernames: params.assigneeUsernames ?? null,
      }),
      metadata: null,
    },
    options,
  );
}

export async function createHistoryOfApprovalApproved(
  params: {
    ticketId: string;
    actionNo?: number | null;
    actorUsername: string;
    approvalStepId: number;
    nextApprovalStepId?: number | null;
  },
  options?: TicketHistoryServiceOptions,
): Promise<TicketHistoryDto> {
  return createTicketHistory(
    {
      ticketId: params.ticketId,
      actionNo: params.actionNo ?? null,
      historyType: "APPROVAL",
      historyAction: "APPROVAL_APPROVED",
      actorUsername: params.actorUsername,
      fromValue: { approvalStepId: params.approvalStepId },
      toValue: { nextApprovalStepId: params.nextApprovalStepId ?? null },
      metadata: null,
    },
    options,
  );
}

export async function createHistoryOfApprovalDeclined(
  params: {
    ticketId: string;
    actionNo?: number | null;
    actorUsername: string;
    approvalStepId: number;
    reason?: string;
  },
  options?: TicketHistoryServiceOptions,
): Promise<TicketHistoryDto> {
  return createTicketHistory(
    {
      ticketId: params.ticketId,
      actionNo: params.actionNo ?? null,
      historyType: "APPROVAL",
      historyAction: "APPROVAL_DECLINED",
      actorUsername: params.actorUsername,
      fromValue: { approvalStepId: params.approvalStepId },
      toValue: null,
      metadata: params.reason ? { reason: params.reason } : null,
    },
    options,
  );
}

export async function createHistoryOfAssignmentChange(
  params: {
    ticketId: string;
    actionNo?: number | null;
    actorUsername: string | null;
    fromAssigneeUsernames?: string[] | null;
    toAssigneeUsernames: string[];
  },
  options?: TicketHistoryServiceOptions,
): Promise<TicketHistoryDto> {
  const fromAssigneeUsernames = params.fromAssigneeUsernames ?? [];

  return createTicketHistory(
    {
      ticketId: params.ticketId,
      actionNo: params.actionNo ?? null,
      historyType: "ASSIGNMENT",
      historyAction:
        fromAssigneeUsernames.length > 0 ? "REASSIGNED" : "ASSIGNED",
      actorUsername: params.actorUsername,
      fromValue: { assigneeUsernames: fromAssigneeUsernames },
      toValue: { assigneeUsernames: params.toAssigneeUsernames },
      metadata: null,
    },
    options,
  );
}

function compactJsonObject(
  value: Record<string, TicketHistoryJsonValue | undefined>,
): TicketHistoryJsonValue | null {
  const entries = Object.entries(value).filter(
    (entry): entry is [string, TicketHistoryJsonValue] =>
      entry[1] !== undefined && entry[1] !== null,
  );

  return entries.length > 0 ? Object.fromEntries(entries) : null;
}

function createStatusError(message: string, status: number) {
  const error = new Error(message) as Error & { status: number };
  error.status = status;
  return error;
}
