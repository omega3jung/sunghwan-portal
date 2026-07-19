import { Priority, RiskLevel } from "@/domain/common";
import {
  TicketAssignmentPhase,
  TicketAttachmentMetadata,
  TicketStatus,
} from "@/domain/serviceDesk";
import { normalizePostgresStringArray } from "@/server/data/serviceDesk/shared";
import { ISODateString } from "@/shared/types";
import { normalizeNonNegativeInteger } from "@/shared/utils/value";

import {
  TicketCreateRequestDto,
  TicketDetailDto,
  TicketListItemDto,
  TicketMutateRequestDto,
} from "./ticketDto";
import {
  CreateTicketRowInput,
  ServiceDeskTicketEmail,
  ServiceDeskTicketViewRow,
  TicketMutateRowInput,
} from "./ticketRow";

const DEFAULT_PRIORITY: Priority = "medium";
const DEFAULT_RISK_LEVEL: RiskLevel = "medium";
const DEFAULT_CREATE_TICKET_STATUS: TicketStatus = "Assigned";

const EMPTY_EMAIL: ServiceDeskTicketEmail = {
  to: [],
  cc: [],
  bcc: [],
};

export type TicketDetailProjectionContext = {
  currentUserName: string | null;
  hasBeenWorker: boolean;
};

export function toTicketListItemDto(
  row: ServiceDeskTicketViewRow,
  currentUserName: string | null,
): TicketListItemDto {
  return {
    ...toTicketCommonDto(row, currentUserName),
    age: calculateTicketAge(row.tk_created_at),
  };
}

export function toTicketDetailDto(
  row: ServiceDeskTicketViewRow,
  context: TicketDetailProjectionContext,
): TicketDetailDto {
  return {
    ...toTicketCommonDto(row, context.currentUserName),
    has_been_worker: context.hasBeenWorker,
    content: row.tk_content,
    email: row.tk_email,
    files: row.tk_files ?? [],
    images: row.tk_images ?? [],
  };
}

export function mapTicketCreateRequestDtoToRowInput(
  input: TicketCreateRequestDto,
  options: {
    ticketNo: string;
    requesterUsername: string;
    status?: TicketStatus;
  },
): CreateTicketRowInput {
  return {
    ...mapTicketMutateRequestDtoToRowInput(input),
    tk_ticket_no: options.ticketNo,
    tk_requester_username: options.requesterUsername,
    tk_status: options.status ?? DEFAULT_CREATE_TICKET_STATUS,
  };
}

export function mapTicketMutateRequestDtoToRowInput(
  input: TicketMutateRequestDto,
): TicketMutateRowInput {
  return {
    tk_tenant_id: input.tenantId ?? null,
    tk_category_id: input.categoryId,
    tk_approval_step_id: input.approvalStepId ?? null,
    tk_subject: input.subject.trim(),
    tk_content: input.body.trim(),
    tk_due_at: toIsoDateString(input.dueAt),
    tk_priority: input.priority ?? DEFAULT_PRIORITY,
    tk_risk_level: input.riskLevel ?? DEFAULT_RISK_LEVEL,
    tk_email: normalizeTicketEmail(input.email),
    tk_files: normalizeTicketAttachmentMetadata(input.files),
    tk_images: normalizeTicketAttachmentMetadata(input.images),
  };
}

function toTicketCommonDto(
  row: ServiceDeskTicketViewRow,
  currentUserName: string | null,
) {
  const assignment = mapTicketAssignment(row, currentUserName);

  return {
    id: row.tk_id,
    ticket_number: row.tk_ticket_no,
    created_at: row.tk_created_at,
    updated_at: row.tk_updated_at,
    requester_username: row.tk_requester_username,
    status: normalizeTicketStatus(row),
    priority: row.tk_priority,
    risk_level: row.tk_risk_level,
    ...assignment,
    work_minutes: normalizeNonNegativeInteger(row.tk_work_minutes),
    last_comment_at: row.tka_last_comment_at,
    last_commenter_email: row.tka_last_comment_email,
    last_user_activity_at: row.tka_last_user_activity_at,
    last_user_activity_email: row.tka_last_user_activity_email,
    close_reason: row.tk_close_reason,
    merged_into_ticket_id: row.tk_merged_into_ticket_id,
    merged_into_ticket_no: row.tk_merged_into_ticket_no,
    closed_at: row.tkh_closed_at,
    due_at: row.tk_due_at,
    owner:
      currentUserName !== null && currentUserName === row.tk_requester_username,
    active: true,
    scope: row.cat_scope,
    category_id: String(row.cat_id),
    category_name: row.cat_name,
    category_parent_id:
      row.cat_parent_id === null ? null : String(row.cat_parent_id),
    approval_step_id:
      row.tk_approval_step_id === null ? null : String(row.tk_approval_step_id),
    subject: row.tk_subject,
  };
}

function mapTicketAssignment(
  row: ServiceDeskTicketViewRow,
  currentUserName: string | null,
) {
  const assigneeUsernames = normalizePostgresStringArray(
    row.tk_assignee_usernames,
  );
  const isApprovalPhase = row.tk_approval_step_id !== null;
  const assignmentPhase: TicketAssignmentPhase = isApprovalPhase
    ? "APPROVAL"
    : "WORK";
  const isAssigned =
    currentUserName !== null && assigneeUsernames.includes(currentUserName);

  return {
    assignment_phase: assignmentPhase,
    approval_assignee_usernames: isApprovalPhase ? assigneeUsernames : [],
    work_assignee_usernames: isApprovalPhase ? [] : assigneeUsernames,
    assigned_approver: isApprovalPhase ? isAssigned : false,
    assigned_worker: isApprovalPhase ? false : isAssigned,
    assignee_usernames: assigneeUsernames,
    assigned: isAssigned,
  };
}

function normalizeTicketStatus(row: ServiceDeskTicketViewRow): TicketStatus {
  const status = row.tk_status as string;

  if (status === "Open") {
    return row.tk_approval_step_id === null ? "Assigned" : "Approval";
  }

  if (status === "Approved") {
    return "Assigned";
  }

  if (status === "Reopen") {
    return "Working";
  }

  return row.tk_status;
}

export function normalizeTicketEmail(
  value: ServiceDeskTicketEmail | null | undefined,
): ServiceDeskTicketEmail {
  if (!value) {
    return EMPTY_EMAIL;
  }

  return {
    to: normalizeStringArray(value.to),
    cc: normalizeStringArray(value.cc),
    bcc: normalizeStringArray(value.bcc),
  };
}

export function normalizeTicketAttachmentMetadata(
  value: TicketAttachmentMetadata[] | null | undefined,
): TicketAttachmentMetadata[] {
  if (!Array.isArray(value)) {
    return [];
  }

  // Attachment policy: DB writes store JSON-safe demo metadata only.
  // Raw File/binary uploads and Supabase Storage integration are intentionally out of scope.
  return value
    .filter(isTicketAttachmentMetadata)
    .map((item) => ({
      originalName: item.originalName.trim(),
      replacedName: item.replacedName.trim(),
      extension: item.extension.trim().toLowerCase(),
      size: item.size,
      type: item.type.trim(),
      demoUrl: item.demoUrl.trim(),
      replaced: true,
      reason: "SECURITY_DEMO_REPLACEMENT",
    }));
}

function isTicketAttachmentMetadata(
  value: TicketAttachmentMetadata | null | undefined,
): value is TicketAttachmentMetadata {
  if (!value) {
    return false;
  }

  return (
    typeof value.originalName === "string" &&
    value.originalName.trim().length > 0 &&
    typeof value.replacedName === "string" &&
    value.replacedName.trim().length > 0 &&
    typeof value.extension === "string" &&
    value.extension.trim().length > 0 &&
    Number.isFinite(value.size) &&
    value.size >= 0 &&
    typeof value.type === "string" &&
    value.type.trim().length > 0 &&
    typeof value.demoUrl === "string" &&
    /^\/files\/demo-[a-z0-9-]+\.[a-z0-9]+$/i.test(value.demoUrl.trim()) &&
    value.replaced === true &&
    value.reason === "SECURITY_DEMO_REPLACEMENT"
  );
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function toIsoDateString(value: Date | string): ISODateString {
  return (value instanceof Date ? value : new Date(value)).toISOString();
}

function calculateTicketAge(createdAt: string) {
  const createdTime = new Date(createdAt).getTime();
  const elapsedTime = Date.now() - createdTime;

  if (!Number.isFinite(elapsedTime) || elapsedTime <= 0) {
    return 0;
  }

  return Math.floor(elapsedTime / (1000 * 60 * 60 * 24));
}
