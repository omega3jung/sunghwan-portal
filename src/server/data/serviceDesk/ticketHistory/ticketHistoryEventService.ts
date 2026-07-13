import type { TicketHistoryDto } from "./ticketHistoryDto";
import {
  compactJsonObject,
  getMetadataEvent,
  getMetadataSource,
  normalizeMetadataRecord,
  omitMetadataIdentity,
} from "./ticketHistoryMetadata";
import {
  createTicketHistory,
  type TicketHistoryServiceOptions,
} from "./ticketHistoryService";
import type {
  TicketHistoryEvent,
  TicketHistoryJsonValue,
  TicketHistorySource,
} from "./ticketHistoryTypes";

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
