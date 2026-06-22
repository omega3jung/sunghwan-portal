import { TicketDetail, TicketSummary } from "@/domain/serviceDesk";
import {
  createItemPayloadMapper,
  createListPayloadMapper,
} from "@/lib/api/utils/payload";
import { ArrayMapper } from "@/shared/types";
import { nullToUndefined, undefinedToNull } from "@/shared/utils/value";

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
    assigneeUsernames: item.assignee_usernames,
    mergedIntoTicketId: item.merged_into_ticket_id,
    mergedIntoTicketNo: item.merged_into_ticket_no,
    lastCommentAt: nullToUndefined(item.last_comment_at),
    lastCommenterEmail: nullToUndefined(item.last_commenter_email),
    lastUserActivityAt: nullToUndefined(item.last_user_activity_at),
    lastUserActivityEmail: nullToUndefined(item.last_user_activity_email),
    closedAt: nullToUndefined(item.closed_at),
    workMinutes: item.work_minutes,
    dueAt: item.due_at,
    owner: item.owner,
    assigned: item.assigned,
    active: item.active,
    scope: item.scope,
    categoryId: item.category_id,
    categoryName: item.category_name,
    categoryParentId: nullToUndefined(item.category_parent_id),
    approvalStepId: nullToUndefined(item.approval_step_id),
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
    assigneeUsernames: item.assignee_usernames,
    mergedIntoTicketId: item.merged_into_ticket_id,
    mergedIntoTicketNo: item.merged_into_ticket_no,
    lastCommentAt: nullToUndefined(item.last_comment_at),
    lastCommenterEmail: nullToUndefined(item.last_commenter_email),
    lastUserActivityAt: nullToUndefined(item.last_user_activity_at),
    lastUserActivityEmail: nullToUndefined(item.last_user_activity_email),
    closedAt: nullToUndefined(item.closed_at),
    workMinutes: item.work_minutes,
    dueAt: item.due_at,
    owner: item.owner,
    assigned: item.assigned,
    active: item.active,
    scope: item.scope,
    categoryId: item.category_id,
    categoryName: item.category_name,
    categoryParentId: nullToUndefined(item.category_parent_id),
    approvalStepId: nullToUndefined(item.approval_step_id),
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
    assignee_usernames: item.assigneeUsernames,
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
    assigned: item.assigned,
    active: item.active,
    scope: item.scope,
    category_id: item.categoryId,
    category_name: item.categoryName,
    category_parent_id: undefinedToNull(item.categoryParentId),
    approval_step_id: undefinedToNull(item.approvalStepId),
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
    assignee_usernames: item.assigneeUsernames,
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
    assigned: item.assigned,
    active: item.active,
    scope: item.scope,
    category_id: item.categoryId,
    category_name: item.categoryName,
    category_parent_id: undefinedToNull(item.categoryParentId),
    approval_step_id: undefinedToNull(item.approvalStepId),
    subject: item.subject,
    content: item.content,
    email: item.email,
    files: item.files,
    images: item.images,
  }));
};

export const mapTicketSummaryListPayload = createListPayloadMapper(
  camelTicketSummaryMapper,
);
export const mapTicketDetailPayload = createItemPayloadMapper(
  camelTicketDetailMapper,
);
