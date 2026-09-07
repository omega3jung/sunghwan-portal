import type { Priority, RiskLevel } from "@/domain/common";
import type {
  Attach,
  TicketActionType,
  TicketStatus,
} from "@/domain/serviceDesk";
import {
  canExecuteTicketAction,
  resolveTicketActionNextStatus,
  TICKET_ACTION_PATH_TO_TYPE,
  type TicketActionCommandRequest,
  type TicketActionExecutionMode,
  type TicketApprovalActionCommandRequest,
  type TicketApprovalActionPath,
  type TicketGeneralActionPath,
} from "@/lib/application/contracts/serviceDesk";
import { createServiceDeskStatusError as createStatusError } from "@/server/data/serviceDesk/shared";
import type { ServiceDeskTicketViewRow } from "@/server/data/serviceDesk/ticket/ticketRow";
import type { TicketHistoryJsonValue } from "@/server/data/serviceDesk/ticketHistory/ticketHistoryTypes";

import type {
  ApprovalTicketActionType,
  TicketActionMetadataDto,
} from "./ticketActionDto";

/** Represents a validated action payload after defaults and attachment values are normalized. */
export type NormalizedTicketActionPayload = {
  actionType: TicketActionType;
  content: string;
  files: Attach[];
  images: Attach[];
  assigneeUsernames: string[];
  priority?: Priority;
  riskLevel?: RiskLevel;
  dueAt?: string | null;
  targetTicketId?: string;
  metadata: TicketActionMetadataDto;
  historyMetadata: TicketHistoryJsonValue;
};

/** Lists the action types that must follow the ticket approval workflow. */
export const APPROVAL_ACTION_TYPES = new Set<ApprovalTicketActionType>([
  "APPROVE",
  "DECLINE",
]);
const TICKET_ACTION_TYPE_BY_PATH = TICKET_ACTION_PATH_TO_TYPE;
/** Maps approval endpoint path segments to their canonical domain action type. */
export const APPROVAL_ACTION_TYPE_BY_PATH: Record<
  TicketApprovalActionPath,
  ApprovalTicketActionType
> = {
  approve: "APPROVE",
  decline: "DECLINE",
};
const IMAGE_TAG_PATTERN = /<img\b/i;

/**
 * Converts an untrusted command body into the single payload used by action,
 * effect, and history writers.
 *
 * The route path determines the command; a supplied action type may only agree
 * with it. Attachment entries are metadata prepared by the upload policy, and
 * browser-local blob/data URLs are rejected because the server cannot treat
 * them as durable resources.
 */
export function validateTicketActionPayload(
  action: TicketGeneralActionPath,
  payload: TicketActionCommandRequest,
): NormalizedTicketActionPayload {
  const actionType = TICKET_ACTION_TYPE_BY_PATH[action];
  const content =
    typeof payload.content === "string" ? payload.content.trim() : "";
  const files = normalizeActionAttachments(payload.files, "file");
  const images = normalizeActionAttachments(payload.images, "image");
  const assigneeUsernames = normalizePayloadStringArray(
    payload.assigneeUsernames,
  );
  const priority = normalizePriorityPayloadValue(payload.priority);
  const riskLevel = normalizeRiskLevelPayloadValue(payload.riskLevel);
  const dueAt = normalizeDueAtPayloadValue(payload.dueAt);
  const targetTicketId = normalizeOptionalPayloadString(payload.targetTicketId);
  const historyMetadata = buildActionHistoryMetadata({
    actionType,
    content,
    files,
    images,
    assigneeUsernames,
    priority,
    riskLevel,
    dueAt,
    targetTicketId,
  });

  if (payload.actionType && payload.actionType !== actionType) {
    throw createStatusError("Action path and payload do not match.", 400);
  }

  if (!content) {
    throw createStatusError("Please enter a reason before submitting.", 400);
  }

  if (action === "assign" && assigneeUsernames.length === 0) {
    throw createStatusError("Assignee is required.", 400);
  }

  if (action === "merge" && !targetTicketId) {
    throw createStatusError("Merge target ticket is required.", 400);
  }

  return {
    actionType,
    content,
    files,
    images,
    assigneeUsernames,
    priority,
    riskLevel,
    dueAt,
    targetTicketId,
    historyMetadata,
    metadata: {
      source: "ticketActionTool",
      ...normalizeHistoryMetadataRecord(historyMetadata),
    },
  };
}

/** Enforces role, ownership, status, and assignment policy before a ticket action executes. */
export function assertTicketActionAllowed(
  actionMode: TicketActionExecutionMode,
  status: TicketStatus,
) {
  if (canExecuteTicketAction(actionMode, status)) {
    return;
  }

  throw createStatusError(
    `Ticket action ${actionMode} cannot be executed in status ${status}.`,
    409,
  );
}

/** Returns the allowed destination status for an action or rejects an invalid transition. */
export function requireNextTicketStatus(
  actionMode: TicketActionExecutionMode,
  currentStatus: TicketStatus,
) {
  const nextStatus = resolveTicketActionNextStatus(
    actionMode,
    currentStatus,
  );

  if (!nextStatus) {
    throw createStatusError("Next ticket status could not be resolved.", 409);
  }

  return nextStatus;
}

/** Validates the content required by approval decisions before persistence. */
export function validateApprovalActionPayload(
  action: TicketApprovalActionPath,
  payload: TicketApprovalActionCommandRequest,
) {
  const content =
    typeof payload.content === "string" ? payload.content.trim() : "";

  // Approval decisions are deliberately text-only. This keeps the approval
  // record reviewable without depending on the demo attachment replacement.
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

function normalizeActionAttachments(
  value: unknown,
  type: Attach["type"],
): Attach[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item, fallbackIndex) => {
    if (!item || typeof item !== "object") {
      return [];
    }

    const record = item as Record<string, unknown>;
    const name = normalizeOptionalPayloadString(record.name);
    const url = normalizeOptionalPayloadString(record.url) ?? "";

    if (!name) {
      return [];
    }

    if (/^(blob|data):/i.test(url)) {
      throw createStatusError("Unsupported attachment payload.", 400);
    }

    return {
      index: normalizeAttachmentIndex(record.index, fallbackIndex),
      type,
      name,
      url,
      active: record.active === false ? false : true,
    };
  });
}

function normalizeAttachmentIndex(value: unknown, fallbackIndex: number) {
  return typeof value === "number" && Number.isInteger(value) && value >= 0
    ? value
    : fallbackIndex;
}

function normalizePayloadStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}

function normalizeOptionalPayloadString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalizedValue = value.trim();
  return normalizedValue ? normalizedValue : undefined;
}

function normalizePriorityPayloadValue(value: unknown): Priority | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (isPriority(value)) {
    return value;
  }

  throw createStatusError("Invalid priority.", 400);
}

function normalizeRiskLevelPayloadValue(value: unknown): RiskLevel | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (isRiskLevel(value)) {
    return value;
  }

  throw createStatusError("Invalid risk level.", 400);
}

function normalizeDueAtPayloadValue(value: unknown): string | null | undefined {
  if (value === undefined || value === "") {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  if (typeof value !== "string") {
    throw createStatusError("Invalid due date.", 400);
  }

  const date = new Date(value);

  if (!Number.isFinite(date.getTime())) {
    throw createStatusError("Invalid due date.", 400);
  }

  return date.toISOString();
}

function isPriority(value: unknown): value is Priority {
  return (
    value === "urgent" ||
    value === "high" ||
    value === "medium" ||
    value === "low"
  );
}

function isRiskLevel(value: unknown): value is RiskLevel {
  return (
    value === "critical" ||
    value === "high" ||
    value === "medium" ||
    value === "low"
  );
}

function buildActionHistoryMetadata({
  actionType,
  content,
  files,
  images,
  assigneeUsernames,
  priority,
  riskLevel,
  dueAt,
  targetTicketId,
}: {
  actionType: TicketActionType;
  content: string;
  files: Attach[];
  images: Attach[];
  assigneeUsernames: string[];
  priority?: Priority;
  riskLevel?: RiskLevel;
  dueAt?: string | null;
  targetTicketId?: string;
}): TicketHistoryJsonValue | null {
  return compactHistoryObject({
    actionType,
    content,
    files: files.length > 0 ? serializeAttachmentsForHistory(files) : undefined,
    images:
      images.length > 0 ? serializeAttachmentsForHistory(images) : undefined,
    assigneeUsernames:
      assigneeUsernames.length > 0 ? assigneeUsernames : undefined,
    priority,
    riskLevel,
    dueAt: dueAt ?? undefined,
    targetTicketId,
  });
}

function serializeAttachmentsForHistory(
  attachments: Attach[],
): TicketHistoryJsonValue {
  return attachments.map((attachment) => ({
    index: attachment.index,
    type: attachment.type,
    name: attachment.name,
    url: attachment.url,
    active: attachment.active,
  }));
}

/** Removes undefined history fields while retaining explicit null values for audit comparisons. */
export function compactHistoryObject(
  value: Record<string, TicketHistoryJsonValue | undefined>,
): TicketHistoryJsonValue | null {
  const entries = Object.entries(value).filter(
    (entry): entry is [string, TicketHistoryJsonValue] =>
      entry[1] !== undefined,
  );

  return entries.length > 0 ? Object.fromEntries(entries) : null;
}

/** Normalizes unknown metadata into a JSON-safe history object. */
export function normalizeHistoryMetadataRecord(
  value: TicketHistoryJsonValue | null,
): Record<string, TicketHistoryJsonValue> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function isWorkAssignee(
  ticket: ServiceDeskTicketViewRow,
  currentUserName: string,
) {
  // The same DB array changes meaning by phase, so an approval assignee is not
  // implicitly authorized to execute work commands.
  return (
    ticket.tk_approval_step_id === null &&
    normalizeAssigneeUsernames(ticket.tk_assignee_usernames).includes(
      currentUserName,
    )
  );
}

/** Restricts work-only actions to a current assignee after the approval phase has ended. */
export function assertWorkAssignee(
  ticket: ServiceDeskTicketViewRow,
  currentUserName: string,
) {
  if (isWorkAssignee(ticket, currentUserName)) {
    return;
  }

  throw createStatusError("Only a current work assignee can execute this.", 403);
}

/** Allows work-only actions to a current assignee or an administrator override. */
export function assertWorkAssigneeOrAdmin(
  ticket: ServiceDeskTicketViewRow,
  currentUserName: string,
  isAdmin: boolean,
) {
  if (isAdmin || isWorkAssignee(ticket, currentUserName)) {
    return;
  }

  throw createStatusError(
    "Only a current work assignee or admin can execute this.",
    403,
  );
}

/** Restricts requester-owned actions while retaining the explicit administrator override. */
export function assertRequesterOrAdmin(
  ticket: ServiceDeskTicketViewRow,
  currentUserName: string,
  isAdmin: boolean,
) {
  if (isAdmin || ticket.tk_requester_username === currentUserName) {
    return;
  }

  throw createStatusError("Only the requester or admin can execute this.", 403);
}

/** Enforces an administrator-only action with a caller-specific denial message. */
export function assertAdminActionAllowed(isAdmin: boolean, message: string) {
  if (isAdmin) {
    return;
  }

  throw createStatusError(message, 403);
}

/** Enforces requester ownership for actions that do not permit administrator override. */
export function assertRequesterActionAllowed(
  ticket: ServiceDeskTicketViewRow,
  currentUserName: string,
) {
  if (ticket.tk_requester_username === currentUserName) {
    return;
  }

  throw createStatusError("Only the requester can execute this action.", 403);
}

/** Converts a failed conditional update into a conflict instead of returning a stale ticket. */
export function assertTicketUpdated(
  ticket: ServiceDeskTicketViewRow | null,
  message: string,
) {
  if (ticket) {
    return;
  }

  throw createStatusError(message, 409);
}

/** Ensures the current user is an assignee of the active approval step. */
export function assertApprovalActionAllowed(
  ticket: ServiceDeskTicketViewRow,
  currentUserName: string,
  isAdmin = false,
) {
  const assigneeUsernames = normalizeAssigneeUsernames(
    ticket.tk_assignee_usernames,
  );

  if (
    ticket.tk_status === "Approval" &&
    ticket.tk_approval_step_id !== null &&
    (isAdmin || assigneeUsernames.includes(currentUserName))
  ) {
    return;
  }

  throw createStatusError(
    "Only the assigned approver can approve or decline this ticket.",
    403,
  );
}

/** Returns the active approval step identifier or rejects tickets outside approval routing. */
export function requireCurrentApprovalStepId(ticket: ServiceDeskTicketViewRow) {
  if (ticket.tk_approval_step_id !== null) {
    return ticket.tk_approval_step_id;
  }

  throw createStatusError("Approval step is unavailable.", 409);
}

/** Trims and de-duplicates assignee usernames so authorization and persistence use one canonical list. */
export function normalizeAssigneeUsernames(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}
