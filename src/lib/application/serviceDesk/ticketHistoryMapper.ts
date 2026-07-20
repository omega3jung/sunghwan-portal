import type {
  CategoryScope,
  TicketCloseReason,
  TicketHistoryDisplayMetadata,
  TicketHistoryEvent,
  TicketHistorySource,
} from "@/domain/serviceDesk";

const TICKET_HISTORY_SOURCES = new Set<TicketHistorySource>([
  "USER_ACTION",
  "SYSTEM_AUTO",
  "ROUTING_RULE",
  "APPROVAL_RULE",
  "ASSIGNMENT_RULE",
]);

const TICKET_HISTORY_EVENTS = new Set<TicketHistoryEvent>([
  "TICKET_SUBMITTED",
  "TICKET_UPDATED",
  "TICKET_REOPENED",
  "TICKET_REJECTED",
  "TICKET_MERGED",
  "TICKET_CANCELED",
  "CATEGORY_UPDATED",
  "STATUS_UPDATED",
  "RESOLUTION_CLOSE",
  "APPROVAL_REQUESTED",
  "APPROVAL_APPROVED",
  "APPROVAL_DECLINED",
  "ASSIGNMENT_RESOLVED",
  "ASSIGNMENT_UPDATED",
  "COMMENT_CREATED",
  "COMMENT_UPDATED",
  "COMMENT_DELETED",
  "NOTE_CREATED",
  "NOTE_UPDATED",
  "NOTE_DELETED",
  "PLANNING_UPDATED",
  "WORK_SESSION_STARTED",
  "WORK_SESSION_STOPPED",
  "WORK_SESSION_UPDATED",
  "WORK_SESSION_DELETED",
  "ROUTING_RESET",
  "ROUTING_PRESERVED",
]);

const TICKET_CLOSE_REASONS = new Set<TicketCloseReason>([
  "Completed",
  "Rejected",
  "Merged",
  "Escalated",
  "Canceled",
]);

export function mapTicketHistoryDisplayMetadata(
  rawMetadata: unknown,
): TicketHistoryDisplayMetadata | null {
  const raw = asRecord(rawMetadata);

  if (!raw) {
    return null;
  }

  const metadata: TicketHistoryDisplayMetadata = {};

  const source = toTicketHistorySource(raw.source);
  if (source) metadata.source = source;

  const event = toTicketHistoryEvent(raw.event);
  if (event) metadata.event = event;

  const reason = toNonEmptyString(raw.reason);
  if (reason) metadata.reason = reason;

  const note = toNonEmptyString(raw.note);
  if (note) metadata.note = note;

  const closeReason = toTicketCloseReason(raw.closeReason);
  if (closeReason) metadata.closeReason = closeReason;

  const resolvedGraceDays = toFiniteNumber(raw.resolvedGraceDays);
  if (resolvedGraceDays !== undefined) {
    metadata.resolvedGraceDays = resolvedGraceDays;
  }

  const mergedIntoTicketId = toNonEmptyString(raw.mergedIntoTicketId);
  if (mergedIntoTicketId) metadata.mergedIntoTicketId = mergedIntoTicketId;

  const mergedIntoTicketNo = toNonEmptyString(raw.mergedIntoTicketNo);
  if (mergedIntoTicketNo) metadata.mergedIntoTicketNo = mergedIntoTicketNo;

  const sourceTenantId = toNonEmptyString(raw.sourceTenantId);
  if (sourceTenantId) metadata.sourceTenantId = sourceTenantId;

  const targetTenantId = toNonEmptyString(raw.targetTenantId);
  if (targetTenantId) metadata.targetTenantId = targetTenantId;

  const sourceScope = toCategoryScope(raw.sourceScope);
  if (sourceScope) metadata.sourceScope = sourceScope;

  const targetScope = toCategoryScope(raw.targetScope);
  if (targetScope) metadata.targetScope = targetScope;

  const previousStatus = toNonEmptyString(raw.previousStatus);
  if (previousStatus) metadata.previousStatus = previousStatus;

  const nextStatus = toNonEmptyString(raw.nextStatus);
  if (nextStatus) metadata.nextStatus = nextStatus;

  const changedFields = toStringArray(raw.changedFields);
  if (changedFields) metadata.changedFields = changedFields;

  if (typeof raw.routingSensitiveChanged === "boolean") {
    metadata.routingSensitiveChanged = raw.routingSensitiveChanged;
  }

  if (typeof raw.routingReset === "boolean") {
    metadata.routingReset = raw.routingReset;
  }

  if (typeof raw.preservedRouting === "boolean") {
    metadata.preservedRouting = raw.preservedRouting;
  }

  const previousApprovalStepId = toNullableString(raw.previousApprovalStepId);
  if (previousApprovalStepId !== undefined) {
    metadata.previousApprovalStepId = previousApprovalStepId;
  }

  const nextApprovalStepId = toNullableString(raw.nextApprovalStepId);
  if (nextApprovalStepId !== undefined) {
    metadata.nextApprovalStepId = nextApprovalStepId;
  }

  const previousAssigneeUsernames = toStringArray(raw.previousAssigneeUsernames);
  if (previousAssigneeUsernames) {
    metadata.previousAssigneeUsernames = previousAssigneeUsernames;
  }

  const nextAssigneeUsernames = toStringArray(raw.nextAssigneeUsernames);
  if (nextAssigneeUsernames) {
    metadata.nextAssigneeUsernames = nextAssigneeUsernames;
  }

  const assigneeUsernames = toStringArray(raw.assigneeUsernames);
  if (assigneeUsernames) metadata.assigneeUsernames = assigneeUsernames;

  return Object.keys(metadata).length > 0 ? metadata : null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function toNonEmptyString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0
    ? value
    : undefined;
}

function toTicketHistorySource(value: unknown): TicketHistorySource | undefined {
  const source = toNonEmptyString(value);

  return source && TICKET_HISTORY_SOURCES.has(source as TicketHistorySource)
    ? (source as TicketHistorySource)
    : undefined;
}

function toTicketHistoryEvent(value: unknown): TicketHistoryEvent | undefined {
  const event = toNonEmptyString(value);

  return event && TICKET_HISTORY_EVENTS.has(event as TicketHistoryEvent)
    ? (event as TicketHistoryEvent)
    : undefined;
}

function toTicketCloseReason(value: unknown): TicketCloseReason | undefined {
  const closeReason = toNonEmptyString(value);

  return closeReason && TICKET_CLOSE_REASONS.has(closeReason as TicketCloseReason)
    ? (closeReason as TicketCloseReason)
    : undefined;
}

function toCategoryScope(value: unknown): CategoryScope | undefined {
  return value === "INTERNAL" || value === "PORTAL" ? value : undefined;
}

function toFiniteNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function toNullableString(value: unknown): string | null | undefined {
  if (value === null) return null;
  if (typeof value === "string" && value.trim().length > 0) return value;
  if (typeof value === "number") return String(value);

  return undefined;
}

function toStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;

  const values = value.filter(
    (item): item is string =>
      typeof item === "string" && item.trim().length > 0,
  );

  return values.length > 0 ? values : undefined;
}
