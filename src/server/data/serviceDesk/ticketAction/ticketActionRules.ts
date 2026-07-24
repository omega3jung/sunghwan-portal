import type { Priority, RiskLevel } from "@/domain/common";
import type {
  Attach,
  TicketActionType,
  TicketStatus,
} from "@/domain/serviceDesk";
import { createServiceDeskStatusError as createStatusError } from "@/server/data/serviceDesk/shared";
import type { ServiceDeskTicketViewRow } from "@/server/data/serviceDesk/ticket/ticketRow";
import type { TicketHistoryJsonValue } from "@/server/data/serviceDesk/ticketHistory/ticketHistoryTypes";

import type {
  ApprovalTicketActionType,
  TicketActionMetadataDto,
  TicketActionRequestDto,
} from "./ticketActionDto";

export type TicketActionPath =
  | "approve"
  | "decline"
  | "comment"
  | "note"
  | "assign"
  | "assignSelf"
  | "adjust"
  | "reject"
  | "merge"
  | "reopen"
  | "resubmit"
  | "cancel";
export type TicketApprovalActionPath = Extract<
  TicketActionPath,
  "approve" | "decline"
>;
export type TicketGeneralActionPath = Exclude<
  TicketActionPath,
  TicketApprovalActionPath
>;
export type ApprovalTicketActionRequestDto = {
  content: string;
  actionType?: TicketActionType;
  files?: unknown[];
  images?: unknown[];
};
export type TicketActionExecutionMode =
  | TicketGeneralActionPath
  | "assignAdminOverride"
  | "adjustAdminOverride"
  | "mergeAdminOverride"
  | "rejectAdminOverride";
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

export const APPROVAL_ACTION_TYPES = new Set<ApprovalTicketActionType>([
  "APPROVE",
  "DECLINE",
]);
const TICKET_ACTION_TYPE_BY_PATH: Record<TicketActionPath, TicketActionType> = {
  approve: "APPROVE",
  decline: "DECLINE",
  comment: "COMMENT",
  note: "NOTE",
  assign: "ASSIGN",
  assignSelf: "ASSIGN_SELF",
  adjust: "ADJUST",
  reject: "REJECT",
  merge: "MERGE",
  reopen: "REOPEN",
  resubmit: "RESUBMIT",
  cancel: "CANCEL",
};
const TICKET_ACTION_PATHS = new Set<TicketActionPath>(
  Object.keys(TICKET_ACTION_TYPE_BY_PATH) as TicketActionPath[],
);
export const APPROVAL_ACTION_TYPE_BY_PATH: Record<
  TicketApprovalActionPath,
  ApprovalTicketActionType
> = {
  approve: "APPROVE",
  decline: "DECLINE",
};
const IMAGE_TAG_PATTERN = /<img\b/i;
const ALL_LIVE_TICKET_STATUSES: readonly TicketStatus[] = [
  "Approval",
  "Declined",
  "Assigned",
  "Working",
  "Pending",
  "Rejected",
  "Resolved",
  "Closed",
];
const COMMENTABLE_TICKET_STATUSES = ALL_LIVE_TICKET_STATUSES.filter(
  (status) => status !== "Closed",
);
const ADMIN_OVERRIDE_ACTION_MODE_BY_PATH: Partial<
  Record<TicketGeneralActionPath, TicketActionExecutionMode>
> = {
  assign: "assignAdminOverride",
  adjust: "adjustAdminOverride",
  merge: "mergeAdminOverride",
  reject: "rejectAdminOverride",
};
const EXECUTABLE_STATUSES_BY_MODE: Record<
  TicketActionExecutionMode,
  readonly TicketStatus[]
> = {
  comment: COMMENTABLE_TICKET_STATUSES,
  note: COMMENTABLE_TICKET_STATUSES,
  assign: ["Assigned", "Working", "Pending"],
  assignAdminOverride: ["Approval", "Assigned", "Working", "Pending"],
  assignSelf: ["Assigned", "Working", "Pending"],
  adjust: ["Assigned", "Working", "Pending"],
  adjustAdminOverride: [
    "Approval",
    "Assigned",
    "Working",
    "Pending",
    "Resolved",
    "Closed",
  ],
  reject: ["Assigned", "Working", "Pending"],
  rejectAdminOverride: ["Assigned", "Working", "Pending"],
  merge: ["Assigned", "Working", "Pending", "Resolved"],
  mergeAdminOverride: [
    "Approval",
    "Declined",
    "Assigned",
    "Working",
    "Pending",
    "Rejected",
    "Resolved",
    "Closed",
  ],
  reopen: ["Resolved"],
  resubmit: ["Declined", "Rejected"],
  cancel: ["Approval", "Declined", "Assigned", "Working", "Pending", "Rejected"],
};

export function isTicketActionPath(action: string): action is TicketActionPath {
  return TICKET_ACTION_PATHS.has(action as TicketActionPath);
}

export function isTicketApprovalActionPath(
  action: string,
): action is TicketApprovalActionPath {
  return action === "approve" || action === "decline";
}

export function isTicketGeneralActionPath(
  action: string,
): action is TicketGeneralActionPath {
  return isTicketActionPath(action) && !isTicketApprovalActionPath(action);
}

export function validateTicketActionPayload(
  action: TicketGeneralActionPath,
  payload: TicketActionRequestDto,
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

export function resolveTicketActionExecutionMode(
  action: TicketGeneralActionPath,
  isAdmin?: boolean,
): TicketActionExecutionMode {
  if (!isAdmin) {
    return action;
  }

  return ADMIN_OVERRIDE_ACTION_MODE_BY_PATH[action] ?? action;
}

export function assertTicketActionAllowed(
  actionMode: TicketActionExecutionMode,
  status: TicketStatus,
) {
  if (EXECUTABLE_STATUSES_BY_MODE[actionMode].includes(status)) {
    return;
  }

  throw createStatusError(
    `Ticket action ${actionMode} cannot be executed in status ${status}.`,
    409,
  );
}

export function resolveNextTicketStatus(
  actionMode: TicketActionExecutionMode,
  currentStatus: TicketStatus,
): TicketStatus | undefined {
  switch (actionMode) {
    case "assign":
    case "assignAdminOverride":
      return currentStatus === "Pending" ? "Working" : undefined;

    case "reject":
    case "rejectAdminOverride":
      return currentStatus === "Rejected" ? undefined : "Rejected";

    case "merge":
    case "mergeAdminOverride":
      return currentStatus === "Closed" ? undefined : "Closed";

    case "reopen":
      return currentStatus === "Resolved" ? "Working" : undefined;

    case "cancel":
      return "Closed";

    default:
      return undefined;
  }
}

export function requireNextTicketStatus(
  actionMode: TicketActionExecutionMode,
  currentStatus: TicketStatus,
) {
  const nextStatus = resolveNextTicketStatus(actionMode, currentStatus);

  if (!nextStatus) {
    throw createStatusError("Next ticket status could not be resolved.", 409);
  }

  return nextStatus;
}

export function validateApprovalActionPayload(
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

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
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

export function compactHistoryObject(
  value: Record<string, TicketHistoryJsonValue | undefined>,
): TicketHistoryJsonValue | null {
  const entries = Object.entries(value).filter(
    (entry): entry is [string, TicketHistoryJsonValue] =>
      entry[1] !== undefined,
  );

  return entries.length > 0 ? Object.fromEntries(entries) : null;
}

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
  return (
    ticket.tk_approval_step_id === null &&
    normalizeAssigneeUsernames(ticket.tk_assignee_usernames).includes(
      currentUserName,
    )
  );
}

export function assertWorkAssignee(
  ticket: ServiceDeskTicketViewRow,
  currentUserName: string,
) {
  if (isWorkAssignee(ticket, currentUserName)) {
    return;
  }

  throw createStatusError("Only a current work assignee can execute this.", 403);
}

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

export function assertAdminActionAllowed(isAdmin: boolean, message: string) {
  if (isAdmin) {
    return;
  }

  throw createStatusError(message, 403);
}

export function assertRequesterActionAllowed(
  ticket: ServiceDeskTicketViewRow,
  currentUserName: string,
) {
  if (ticket.tk_requester_username === currentUserName) {
    return;
  }

  throw createStatusError("Only the requester can execute this action.", 403);
}

export function assertTicketUpdated(
  ticket: ServiceDeskTicketViewRow | null,
  message: string,
) {
  if (ticket) {
    return;
  }

  throw createStatusError(message, 409);
}

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

export function requireCurrentApprovalStepId(ticket: ServiceDeskTicketViewRow) {
  if (ticket.tk_approval_step_id !== null) {
    return ticket.tk_approval_step_id;
  }

  throw createStatusError("Approval step is unavailable.", 409);
}

export function normalizeAssigneeUsernames(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter(
        (item): item is string => typeof item === "string" && item.length > 0,
      )
    : [];
}
