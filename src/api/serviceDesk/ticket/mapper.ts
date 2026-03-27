import { Priority } from "@/domain/common";
import {
  Attach,
  CategoryScope,
  TicketDetail,
  TicketStatus,
  TicketSummary,
} from "@/domain/serviceDesk";
import { ArrayMapper } from "@/shared/types";
import { ISODateString } from "@/shared/types/date";
import { nullToUndefined, undefinedToNull } from "@/shared/utils/nullable";

export interface DbTicketSummary {
  id: string;
  ticket_number: string;

  created_at: ISODateString;
  updated_at: ISODateString;

  requester_id: string;

  status: TicketStatus;
  priority: Priority;
  assignee_id: string[];

  last_comment_at: ISODateString | null;
  last_commenter_email: string | null;
  track_time_minutes: number;

  due_at: ISODateString;

  owner: boolean;
  assigned: boolean;
  active: boolean;

  scope: CategoryScope;
  category_name: string;
  approval_step_name: string | null;

  subject: string;
  age: number;
}

export interface DbTicketDetail {
  id: string;
  ticket_number: string;

  created_at: ISODateString;
  updated_at: ISODateString;

  requester_id: string;

  status: TicketStatus;
  priority: Priority;
  assignee_id: string[];

  last_comment_at: ISODateString | null;
  last_commenter_email: string | null;
  track_time_minutes: number;

  due_at: ISODateString;

  owner: boolean;
  assigned: boolean;
  active: boolean;

  scope: CategoryScope;
  category_id: string;
  approval_step_id: string | null;

  subject: string;
  body: string;

  email: {
    to: string[];
    cc: string[];
    bcc: string[];
  };

  files: Attach[];
  images: Attach[];
}

export const camelTicketSummaryMapper: ArrayMapper<
  DbTicketSummary,
  TicketSummary
> = (data) => {
  return data.map((item) => ({
    id: item.id,
    ticketNumber: item.ticket_number,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    requesterId: item.requester_id,
    status: item.status,
    priority: item.priority,
    assigneeIds: item.assignee_id,
    lastCommentAt: nullToUndefined(item.last_comment_at),
    lastCommenterEmail: nullToUndefined(item.last_commenter_email),
    trackTimeMinutes: item.track_time_minutes,
    dueAt: item.due_at,
    owner: item.owner,
    assigned: item.assigned,
    active: item.active,
    scope: item.scope,
    categoryName: item.category_name,
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
    updatedAt: item.updated_at,
    requesterId: item.requester_id,
    status: item.status,
    priority: item.priority,
    assigneeIds: item.assignee_id,
    lastCommentAt: nullToUndefined(item.last_comment_at),
    lastCommenterEmail: nullToUndefined(item.last_commenter_email),
    trackTimeMinutes: item.track_time_minutes,
    dueAt: item.due_at,
    owner: item.owner,
    assigned: item.assigned,
    active: item.active,
    scope: item.scope,
    categoryId: item.category_id,
    approvalStepId: nullToUndefined(item.approval_step_id),
    subject: item.subject,
    body: item.body,
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
    updated_at: item.updatedAt,
    requester_id: item.requesterId,
    status: item.status,
    priority: item.priority,
    assignee_id: item.assigneeIds,
    last_comment_at: undefinedToNull(item.lastCommentAt),
    last_commenter_email: undefinedToNull(item.lastCommenterEmail),
    track_time_minutes: item.trackTimeMinutes,
    due_at: item.dueAt,
    owner: item.owner,
    assigned: item.assigned,
    active: item.active,
    scope: item.scope,
    category_name: item.categoryName,
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
    updated_at: item.updatedAt,
    requester_id: item.requesterId,
    status: item.status,
    priority: item.priority,
    assignee_id: item.assigneeIds,
    last_comment_at: undefinedToNull(item.lastCommentAt),
    last_commenter_email: undefinedToNull(item.lastCommenterEmail),
    track_time_minutes: item.trackTimeMinutes,
    due_at: item.dueAt,
    owner: item.owner,
    assigned: item.assigned,
    active: item.active,
    scope: item.scope,
    category_id: item.categoryId,
    approval_step_id: undefinedToNull(item.approvalStepId),
    subject: item.subject,
    body: item.body,
    email: item.email,
    files: item.files,
    images: item.images,
  }));
};
