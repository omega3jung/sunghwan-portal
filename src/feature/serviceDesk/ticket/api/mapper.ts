import {
  TicketAssignmentPhase,
  TicketAssignmentState,
  TicketCurrentAssignmentState,
  TicketDetail,
  TicketSummary,
} from "@/domain/serviceDesk";
import {
  createItemPayloadMapper,
  createListPayloadMapper,
} from "@/lib/api/utils/payload";
import { ArrayMapper } from "@/shared/types";
import {
  normalizeNonNegativeInteger,
  nullToUndefined,
  undefinedToNull,
} from "@/shared/utils/value";

import { DbTicketDetail, DbTicketSummary } from "./types";

export const camelTicketSummaryMapper: ArrayMapper<
  DbTicketSummary,
  TicketSummary
> = (data) => {
  return data.map((item) => ({
    id: item.id,
    ticketNumber: item.ticket_number,
    createdAt: item.created_at,
    updatedAt: nullToUndefined(item.updated_at),
    requesterUsername: item.requester_username,
    status: item.status,
    closeReason: nullToUndefined(item.close_reason),
    priority: item.priority,
    riskLevel: item.risk_level,
    ...mapTicketCurrentAssignment(item),
    mergedIntoTicketId: item.merged_into_ticket_id,
    mergedIntoTicketNo: item.merged_into_ticket_no,
    lastCommentAt: nullToUndefined(item.last_comment_at),
    lastCommenterEmail: nullToUndefined(item.last_commenter_email),
    lastUserActivityAt: nullToUndefined(item.last_user_activity_at),
    lastUserActivityEmail: nullToUndefined(item.last_user_activity_email),
    closedAt: nullToUndefined(item.closed_at),
    workMinutes: normalizeNonNegativeInteger(item.work_minutes),
    dueAt: item.due_at,
    owner: item.owner,
    active: item.active,
    scope: item.scope,
    categoryId: item.category_id,
    categoryName: item.category_name,
    categoryParentId: nullToUndefined(item.category_parent_id),
    approvalStepId: item.approval_step_id ?? null,
    approvalStepName: nullToUndefined(item.approval_step_name),
    subject: item.subject,
    age: item.age,
  }));
};

export const camelTicketDetailMapper: ArrayMapper<
  DbTicketDetail,
  TicketDetail
> = (data) => {
  return data.map((item) => ({
    id: item.id,
    ticketNumber: item.ticket_number,
    createdAt: item.created_at,
    updatedAt: nullToUndefined(item.updated_at),
    requesterUsername: item.requester_username,
    status: item.status,
    closeReason: nullToUndefined(item.close_reason),
    priority: item.priority,
    riskLevel: item.risk_level,
    ...mapTicketAssignment(item),
    mergedIntoTicketId: item.merged_into_ticket_id,
    mergedIntoTicketNo: item.merged_into_ticket_no,
    lastCommentAt: nullToUndefined(item.last_comment_at),
    lastCommenterEmail: nullToUndefined(item.last_commenter_email),
    lastUserActivityAt: nullToUndefined(item.last_user_activity_at),
    lastUserActivityEmail: nullToUndefined(item.last_user_activity_email),
    closedAt: nullToUndefined(item.closed_at),
    workMinutes: normalizeNonNegativeInteger(item.work_minutes),
    dueAt: item.due_at,
    owner: item.owner,
    active: item.active,
    scope: item.scope,
    categoryId: item.category_id,
    categoryName: item.category_name,
    categoryParentId: nullToUndefined(item.category_parent_id),
    approvalStepId: item.approval_step_id ?? null,
    subject: item.subject,
    content: item.content,
    email: item.email,
    files: item.files,
    images: item.images,
  }));
};

export const snakeTicketSummaryMapper: ArrayMapper<
  TicketSummary,
  DbTicketSummary
> = (data) => {
  return data.map((item) => ({
    id: item.id,
    ticket_number: item.ticketNumber,
    created_at: item.createdAt,
    updated_at: undefinedToNull(item.updatedAt),
    requester_username: item.requesterUsername,
    status: item.status,
    close_reason: undefinedToNull(item.closeReason),
    priority: item.priority,
    risk_level: item.riskLevel,
    assignment_phase: item.assignmentPhase,
    approval_assignee_usernames: item.approvalAssigneeUsernames,
    work_assignee_usernames: item.workAssigneeUsernames,
    assigned_approver: item.isCurrentApprover,
    assigned_worker: item.isCurrentWorker,
    assignee_usernames: selectCurrentResponsibleUsernames(item),
    merged_into_ticket_id: item.mergedIntoTicketId ?? null,
    merged_into_ticket_no: item.mergedIntoTicketNo ?? null,
    last_comment_at: undefinedToNull(item.lastCommentAt),
    last_commenter_email: undefinedToNull(item.lastCommenterEmail),
    last_user_activity_at: undefinedToNull(item.lastUserActivityAt),
    last_user_activity_email: undefinedToNull(item.lastUserActivityEmail),
    closed_at: undefinedToNull(item.closedAt),
    work_minutes: item.workMinutes,
    due_at: item.dueAt,
    owner: item.owner,
    assigned: item.isCurrentApprover || item.isCurrentWorker,
    active: item.active,
    scope: item.scope,
    category_id: item.categoryId,
    category_name: item.categoryName,
    category_parent_id: undefinedToNull(item.categoryParentId),
    approval_step_id: item.approvalStepId,
    approval_step_name: undefinedToNull(item.approvalStepName),
    subject: item.subject,
    age: item.age,
  }));
};

export const snakeTicketDetailMapper: ArrayMapper<
  TicketDetail,
  DbTicketDetail
> = (data) => {
  return data.map((item) => ({
    id: item.id,
    ticket_number: item.ticketNumber,
    created_at: item.createdAt,
    updated_at: undefinedToNull(item.updatedAt),
    requester_username: item.requesterUsername,
    status: item.status,
    close_reason: undefinedToNull(item.closeReason),
    priority: item.priority,
    risk_level: item.riskLevel,
    assignment_phase: item.assignmentPhase,
    approval_assignee_usernames: item.approvalAssigneeUsernames,
    work_assignee_usernames: item.workAssigneeUsernames,
    assigned_approver: item.isCurrentApprover,
    assigned_worker: item.isCurrentWorker,
    has_been_worker: item.hasBeenWorker,
    assignee_usernames: selectCurrentResponsibleUsernames(item),
    merged_into_ticket_id: item.mergedIntoTicketId ?? null,
    merged_into_ticket_no: item.mergedIntoTicketNo ?? null,
    last_comment_at: undefinedToNull(item.lastCommentAt),
    last_commenter_email: undefinedToNull(item.lastCommenterEmail),
    last_user_activity_at: undefinedToNull(item.lastUserActivityAt),
    last_user_activity_email: undefinedToNull(item.lastUserActivityEmail),
    closed_at: undefinedToNull(item.closedAt),
    work_minutes: item.workMinutes,
    due_at: item.dueAt,
    owner: item.owner,
    assigned: item.isCurrentApprover || item.isCurrentWorker,
    active: item.active,
    scope: item.scope,
    category_id: item.categoryId,
    category_name: item.categoryName,
    category_parent_id: undefinedToNull(item.categoryParentId),
    approval_step_id: item.approvalStepId,
    subject: item.subject,
    content: item.content,
    email: item.email,
    files: item.files,
    images: item.images,
  }));
};

type DbTicketAssignmentSource = Pick<
  DbTicketSummary,
  | "approval_step_id"
  | "assignment_phase"
  | "approval_assignee_usernames"
  | "work_assignee_usernames"
  | "assigned_approver"
  | "assigned_worker"
  | "assignee_usernames"
  | "assigned"
>;

function mapTicketAssignment(
  item: DbTicketAssignmentSource & Pick<DbTicketDetail, "has_been_worker">,
): TicketAssignmentState {
  return {
    ...mapTicketCurrentAssignment(item),
    hasBeenWorker: item.has_been_worker === true,
  };
}

function mapTicketCurrentAssignment(
  item: DbTicketAssignmentSource,
): TicketCurrentAssignmentState {
  const assignmentPhase = resolveAssignmentPhase(item);
  const legacyAssigneeUsernames = normalizeStringArray(item.assignee_usernames);
  const approvalAssigneeUsernames = normalizeStringArray(
    item.approval_assignee_usernames ??
      (assignmentPhase === "APPROVAL" ? legacyAssigneeUsernames : []),
  );
  const workAssigneeUsernames = normalizeStringArray(
    item.work_assignee_usernames ??
      (assignmentPhase === "WORK" ? legacyAssigneeUsernames : []),
  );

  return {
    assignmentPhase,
    approvalAssigneeUsernames,
    workAssigneeUsernames,
    isCurrentApprover:
      item.assigned_approver ??
      (assignmentPhase === "APPROVAL" ? item.assigned : false),
    isCurrentWorker:
      item.assigned_worker ??
      (assignmentPhase === "WORK" ? item.assigned : false),
  };
}

function resolveAssignmentPhase(
  item: Pick<DbTicketAssignmentSource, "approval_step_id" | "assignment_phase">,
): TicketAssignmentPhase {
  if (item.assignment_phase === "APPROVAL" || item.assignment_phase === "WORK") {
    return item.assignment_phase;
  }

  return item.approval_step_id == null ? "WORK" : "APPROVAL";
}

function selectCurrentResponsibleUsernames(
  item: TicketCurrentAssignmentState,
): string[] {
  return item.assignmentPhase === "APPROVAL"
    ? item.approvalAssigneeUsernames
    : item.workAssigneeUsernames;
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

export const mapTicketSummaryListPayload = createListPayloadMapper(
  camelTicketSummaryMapper,
);
export const mapTicketDetailPayload = createItemPayloadMapper(
  camelTicketDetailMapper,
);
