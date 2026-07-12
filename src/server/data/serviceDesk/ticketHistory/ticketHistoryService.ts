import { CreateTicketHistoryInput, TicketHistoryDto } from "./ticketHistoryDto";
import { mapTicketHistoryRowToDto } from "./ticketHistoryMapper";
import {
  createTicketHistoryRow,
  findTicketHistoryRowsByTicketId,
  TicketHistoryRepositoryOptions,
} from "./ticketHistoryRepository";
import {
  TicketHistoryEvent,
  TicketHistoryJsonValue,
  TicketHistorySource,
} from "./ticketHistoryTypes";

type TicketHistoryServiceOptions = TicketHistoryRepositoryOptions;

export async function createTicketHistory(
  input: CreateTicketHistoryInput,
  options?: TicketHistoryServiceOptions,
): Promise<TicketHistoryDto> {
  const row = await createTicketHistoryRow(
    {
      ...input,
      metadata: omitMetadataIdentityFromJsonValue(input.metadata),
    },
    options,
  );

  if (!row) {
    throw createStatusError("Unable to create ticket history.", 409);
  }

  return mapTicketHistoryRowToDto(row);
}

export async function getTicketHistoriesByTicketId(
  ticketId: string,
  options?: TicketHistoryServiceOptions,
): Promise<TicketHistoryDto[]> {
  const rows = await findTicketHistoryRowsByTicketId(ticketId, options);

  return rows.map(mapTicketHistoryRowToDto);
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
      source: "USER_ACTION",
      event: "TICKET_SUBMITTED",
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

export async function createHistoryOfStatusChange(
  params: {
    ticketId: string;
    actionNo?: number | null;
    actorUsername: string | null;
    fromStatus: string;
    toStatus: string;
    reason?: string;
    metadata?: TicketHistoryJsonValue | null;
  },
  options?: TicketHistoryServiceOptions,
): Promise<TicketHistoryDto> {
  const metadata = normalizeMetadataRecord(params.metadata);
  const source = getMetadataSource(metadata) ?? "USER_ACTION";

  return createTicketHistory(
    {
      ticketId: params.ticketId,
      actionNo: params.actionNo ?? null,
      historyType: "STATUS",
      source,
      event: getMetadataEvent(metadata) ?? "STATUS_UPDATED",
      actorUsername: params.actorUsername,
      fromValue: { status: params.fromStatus },
      toValue: { status: params.toStatus },
      metadata: compactJsonObject({
        ...omitMetadataIdentity(metadata),
        reason: params.reason,
      }),
    },
    options,
  );
}

export async function createHistoryOfSystemResolutionClose(
  params: {
    ticketId: string;
    fromStatus: string;
    toStatus?: string;
    resolvedGraceDays?: number;
  },
  options?: TicketHistoryServiceOptions,
): Promise<TicketHistoryDto> {
  return createTicketHistory(
    {
      ticketId: params.ticketId,
      actionNo: null,
      historyType: "STATUS",
      source: "SYSTEM_AUTO",
      event: "RESOLUTION_CLOSE",
      actorUsername: null,
      fromValue: { status: params.fromStatus },
      toValue: {
        status: params.toStatus ?? "Closed",
        closeReason: "Completed",
      },
      metadata: compactJsonObject({
        closeReason: "Completed",
        resolvedGraceDays: params.resolvedGraceDays,
      }),
    },
    options,
  );
}

export async function createHistoryOfCommentCreated(
  params: {
    ticketId: string;
    actionNo: number;
    actorUsername: string | null;
    metadata?: TicketHistoryJsonValue | null;
  },
  options?: TicketHistoryServiceOptions,
): Promise<TicketHistoryDto> {
  return createTicketHistory(
    {
      ticketId: params.ticketId,
      actionNo: params.actionNo,
      historyType: "COMMENT",
      source: "USER_ACTION",
      event: "COMMENT_CREATED",
      actorUsername: params.actorUsername,
      metadata: compactJsonObject({
        ...omitMetadataIdentity(normalizeMetadataRecord(params.metadata)),
      }),
    },
    options,
  );
}

export async function createHistoryOfNoteCreated(
  params: {
    ticketId: string;
    actionNo: number;
    actorUsername: string | null;
    metadata?: TicketHistoryJsonValue | null;
  },
  options?: TicketHistoryServiceOptions,
): Promise<TicketHistoryDto> {
  return createTicketHistory(
    {
      ticketId: params.ticketId,
      actionNo: params.actionNo,
      historyType: "NOTE",
      source: "USER_ACTION",
      event: "NOTE_CREATED",
      actorUsername: params.actorUsername,
      metadata: compactJsonObject({
        ...omitMetadataIdentity(normalizeMetadataRecord(params.metadata)),
      }),
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
      source: "APPROVAL_RULE",
      event: "APPROVAL_REQUESTED",
      actorUsername: params.actorUsername,
      fromValue: null,
      toValue: compactJsonObject({
        approvalStepId: params.approvalStepId,
        assigneeUsernames: params.assigneeUsernames ?? null,
      }),
      metadata: compactJsonObject({
        nextApprovalStepId: params.approvalStepId,
        nextAssigneeUsernames: params.assigneeUsernames ?? undefined,
      }),
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
      source: "USER_ACTION",
      event: "APPROVAL_APPROVED",
      actorUsername: params.actorUsername,
      fromValue: { approvalStepId: params.approvalStepId },
      toValue: { nextApprovalStepId: params.nextApprovalStepId ?? null },
      metadata: compactJsonObject({
        previousApprovalStepId: params.approvalStepId,
        nextApprovalStepId: params.nextApprovalStepId ?? null,
      }),
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
    fromStatus: string;
    toStatus: string;
    reason?: string;
  },
  options?: TicketHistoryServiceOptions,
): Promise<TicketHistoryDto> {
  return createTicketHistory(
    {
      ticketId: params.ticketId,
      actionNo: params.actionNo ?? null,
      historyType: "APPROVAL",
      source: "USER_ACTION",
      event: "APPROVAL_DECLINED",
      actorUsername: params.actorUsername,
      fromValue: {
        approvalStepId: params.approvalStepId,
        status: params.fromStatus,
      },
      toValue: {
        approvalStepId: params.approvalStepId,
        status: params.toStatus,
        closeReason: "Rejected",
      },
      metadata: compactJsonObject({
        reason: params.reason,
        closeReason: "Rejected",
      }),
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
    metadata?: TicketHistoryJsonValue | null;
  },
  options?: TicketHistoryServiceOptions,
): Promise<TicketHistoryDto> {
  return createAssignmentHistory(
    {
      ...params,
      source: "USER_ACTION",
      event: "ASSIGNMENT_UPDATED",
    },
    options,
  );
}

export async function createHistoryOfAssignmentResolvedByRule(
  params: {
    ticketId: string;
    actionNo?: number | null;
    actorUsername: string | null;
    fromAssigneeUsernames?: string[] | null;
    toAssigneeUsernames: string[];
    metadata?: TicketHistoryJsonValue | null;
  },
  options?: TicketHistoryServiceOptions,
): Promise<TicketHistoryDto> {
  return createAssignmentHistory(
    {
      ...params,
      source: "ASSIGNMENT_RULE",
      event: "ASSIGNMENT_RESOLVED",
    },
    options,
  );
}

async function createAssignmentHistory(
  params: {
    ticketId: string;
    actionNo?: number | null;
    actorUsername: string | null;
    fromAssigneeUsernames?: string[] | null;
    toAssigneeUsernames: string[];
    metadata?: TicketHistoryJsonValue | null;
    source: Extract<TicketHistorySource, "USER_ACTION" | "ASSIGNMENT_RULE">;
    event: Extract<
      TicketHistoryEvent,
      "ASSIGNMENT_UPDATED" | "ASSIGNMENT_RESOLVED"
    >;
  },
  options?: TicketHistoryServiceOptions,
): Promise<TicketHistoryDto> {
  const fromAssigneeUsernames = params.fromAssigneeUsernames ?? [];

  return createTicketHistory(
    {
      ticketId: params.ticketId,
      actionNo: params.actionNo ?? null,
      historyType: "ASSIGNMENT",
      source: params.source,
      event: params.event,
      actorUsername: params.actorUsername,
      fromValue: { assigneeUsernames: fromAssigneeUsernames },
      toValue: { assigneeUsernames: params.toAssigneeUsernames },
      metadata: compactJsonObject({
        ...omitMetadataIdentity(normalizeMetadataRecord(params.metadata)),
        previousAssigneeUsernames: fromAssigneeUsernames,
        nextAssigneeUsernames: params.toAssigneeUsernames,
      }),
    },
    options,
  );
}

export async function createHistoryOfPlanningChange(
  params: {
    ticketId: string;
    actionNo: number;
    actorUsername: string | null;
    fromPlanning: TicketHistoryJsonValue;
    toPlanning: TicketHistoryJsonValue;
    metadata?: TicketHistoryJsonValue | null;
  },
  options?: TicketHistoryServiceOptions,
): Promise<TicketHistoryDto> {
  return createTicketHistory(
    {
      ticketId: params.ticketId,
      actionNo: params.actionNo,
      historyType: "PLANNING",
      source: "USER_ACTION",
      event: "PLANNING_UPDATED",
      actorUsername: params.actorUsername,
      fromValue: params.fromPlanning,
      toValue: params.toPlanning,
      metadata: compactJsonObject({
        ...omitMetadataIdentity(normalizeMetadataRecord(params.metadata)),
      }),
    },
    options,
  );
}

export async function createHistoryOfTicketRejected(
  params: {
    ticketId: string;
    actionNo: number;
    actorUsername: string | null;
    fromStatus: string;
    toStatus: string;
    reason: string;
    metadata?: TicketHistoryJsonValue | null;
  },
  options?: TicketHistoryServiceOptions,
): Promise<TicketHistoryDto> {
  return createTicketHistory(
    {
      ticketId: params.ticketId,
      actionNo: params.actionNo,
      historyType: "STATUS",
      source: "USER_ACTION",
      event: "TICKET_REJECTED",
      actorUsername: params.actorUsername,
      fromValue: { status: params.fromStatus },
      toValue: {
        status: params.toStatus,
        closeReason: "Rejected",
      },
      metadata: compactJsonObject({
        ...omitMetadataIdentity(normalizeMetadataRecord(params.metadata)),
        reason: params.reason,
        closeReason: "Rejected",
      }),
    },
    options,
  );
}

export async function createHistoryOfTicketMerged(
  params: {
    ticketId: string;
    actionNo: number;
    actorUsername: string | null;
    fromStatus: string;
    targetTicketId: string;
    targetTicketNo: string;
    reason: string;
    metadata?: TicketHistoryJsonValue | null;
  },
  options?: TicketHistoryServiceOptions,
): Promise<TicketHistoryDto> {
  return createTicketHistory(
    {
      ticketId: params.ticketId,
      actionNo: params.actionNo,
      historyType: "TICKET",
      source: "USER_ACTION",
      event: "TICKET_MERGED",
      actorUsername: params.actorUsername,
      fromValue: {
        status: params.fromStatus,
        mergedIntoTicketId: null,
      },
      toValue: {
        status: "Closed",
        closeReason: "Merged",
        mergedIntoTicketId: params.targetTicketId,
        mergedIntoTicketNo: params.targetTicketNo,
      },
      metadata: compactJsonObject({
        ...omitMetadataIdentity(normalizeMetadataRecord(params.metadata)),
        closeReason: "Merged",
        mergedIntoTicketId: params.targetTicketId,
        mergedIntoTicketNo: params.targetTicketNo,
        reason: params.reason,
      }),
    },
    options,
  );
}

export async function createHistoryOfTicketCanceled(
  params: {
    ticketId: string;
    actionNo: number;
    actorUsername: string | null;
    fromStatus: string;
    toStatus: string;
    reason: string;
    metadata?: TicketHistoryJsonValue | null;
  },
  options?: TicketHistoryServiceOptions,
): Promise<TicketHistoryDto> {
  return createTicketHistory(
    {
      ticketId: params.ticketId,
      actionNo: params.actionNo,
      historyType: "TICKET",
      source: "USER_ACTION",
      event: "TICKET_CANCELED",
      actorUsername: params.actorUsername,
      fromValue: { status: params.fromStatus },
      toValue: {
        status: params.toStatus,
        closeReason: "Canceled",
      },
      metadata: compactJsonObject({
        ...omitMetadataIdentity(normalizeMetadataRecord(params.metadata)),
        reason: params.reason,
        closeReason: "Canceled",
      }),
    },
    options,
  );
}

function compactJsonObject(
  value: Record<string, TicketHistoryJsonValue | undefined>,
): TicketHistoryJsonValue | null {
  const entries = Object.entries(value).filter(
    (entry): entry is [string, TicketHistoryJsonValue] =>
      entry[1] !== undefined,
  );

  return entries.length > 0 ? Object.fromEntries(entries) : null;
}

function normalizeMetadataRecord(
  value: TicketHistoryJsonValue | null | undefined,
): Record<string, TicketHistoryJsonValue> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function getMetadataSource(
  value: Record<string, TicketHistoryJsonValue>,
): TicketHistorySource | undefined {
  return isTicketHistorySource(value.source) ? value.source : undefined;
}

function getMetadataEvent(
  value: Record<string, TicketHistoryJsonValue>,
): TicketHistoryEvent | undefined {
  return isTicketHistoryEvent(value.event) ? value.event : undefined;
}

function omitMetadataIdentity(
  value: Record<string, TicketHistoryJsonValue>,
): Record<string, TicketHistoryJsonValue> {
  const { event: _event, source: _source, ...metadata } = value;
  return metadata;
}

function omitMetadataIdentityFromJsonValue(
  value: TicketHistoryJsonValue | null | undefined,
): TicketHistoryJsonValue | null | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return value;
  }

  return omitMetadataIdentity(value);
}

function isTicketHistorySource(value: unknown): value is TicketHistorySource {
  return (
    value === "USER_ACTION" ||
    value === "SYSTEM_AUTO" ||
    value === "ROUTING_RULE" ||
    value === "APPROVAL_RULE" ||
    value === "ASSIGNMENT_RULE"
  );
}

function isTicketHistoryEvent(value: unknown): value is TicketHistoryEvent {
  return (
    value === "TICKET_SUBMITTED" ||
    value === "TICKET_UPDATED" ||
    value === "TICKET_REJECTED" ||
    value === "TICKET_MERGED" ||
    value === "TICKET_CANCELED" ||
    value === "CATEGORY_UPDATED" ||
    value === "STATUS_UPDATED" ||
    value === "RESOLUTION_CLOSE" ||
    value === "APPROVAL_REQUESTED" ||
    value === "APPROVAL_APPROVED" ||
    value === "APPROVAL_DECLINED" ||
    value === "ASSIGNMENT_RESOLVED" ||
    value === "ASSIGNMENT_UPDATED" ||
    value === "COMMENT_CREATED" ||
    value === "COMMENT_UPDATED" ||
    value === "COMMENT_DELETED" ||
    value === "NOTE_CREATED" ||
    value === "NOTE_UPDATED" ||
    value === "NOTE_DELETED" ||
    value === "PLANNING_UPDATED" ||
    value === "WORK_SESSION_STARTED" ||
    value === "WORK_SESSION_STOPPED" ||
    value === "WORK_SESSION_UPDATED" ||
    value === "WORK_SESSION_DELETED" ||
    value === "ROUTING_RESET" ||
    value === "ROUTING_PRESERVED"
  );
}

function createStatusError(message: string, status: number) {
  const error = new Error(message) as Error & { status: number };
  error.status = status;
  return error;
}
