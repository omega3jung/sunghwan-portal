import type { TicketHistoryDisplayMetadata } from "./model";

export function mapTicketHistoryDisplayMetadata(
  rawMetadata: unknown,
): TicketHistoryDisplayMetadata | null {
  const raw = asRecord(rawMetadata);

  if (!raw) {
    return null;
  }

  const metadata: TicketHistoryDisplayMetadata = {};

  const reason = toNonEmptyString(raw.reason);
  if (reason) {
    metadata.reason = reason;
  }

  const note = toNonEmptyString(raw.note);
  if (note) {
    metadata.note = note;
  }

  const targetTicketId = toNonEmptyString(raw.targetTicketId);
  if (targetTicketId) {
    metadata.targetTicketId = targetTicketId;
  }

  const targetTicketNumber = toNonEmptyString(raw.targetTicketNumber);
  if (targetTicketNumber) {
    metadata.targetTicketNumber = targetTicketNumber;
  }

  const changedFields = toStringArray(raw.changedFields);
  if (changedFields) {
    metadata.changedFields = changedFields;
  }

  if (typeof raw.routingReset === "boolean") {
    metadata.routingReset = raw.routingReset;
  }

  const previousApprovalStepId = toNullableString(raw.previousApprovalStepId);
  if (previousApprovalStepId !== undefined) {
    metadata.previousApprovalStepId = previousApprovalStepId;
  }

  const nextApprovalStepId = toNullableString(raw.nextApprovalStepId);
  if (nextApprovalStepId !== undefined) {
    metadata.nextApprovalStepId = nextApprovalStepId;
  }

  const assigneeUsernames = toStringArray(raw.assigneeUsernames);
  if (assigneeUsernames) {
    metadata.assigneeUsernames = assigneeUsernames;
  }

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

function toNullableString(value: unknown): string | null | undefined {
  if (value === null) {
    return null;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    return value;
  }

  if (typeof value === "number") {
    return String(value);
  }

  return undefined;
}

function toStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const values = value.filter(
    (item): item is string =>
      typeof item === "string" && item.trim().length > 0,
  );

  return values.length > 0 ? values : undefined;
}
