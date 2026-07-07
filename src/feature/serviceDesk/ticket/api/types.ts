import { Priority, RiskLevel } from "@/domain/common";
import {
  CategoryScope,
  TicketAssignmentPhase,
  TicketAttachmentMetadata,
  TicketResolutionReason,
  TicketStatus,
} from "@/domain/serviceDesk";
import { LocalizedText } from "@/shared/types";
import type { DbParams, DbSort } from "@/shared/types/api";
import { ISODateString } from "@/shared/types/date";

export type TicketSortField =
  | "ticketNumber"
  | "createdAt"
  | "updatedAt"
  | "dueAt"
  | "priority"
  | "status";

export type TicketSearchSort = DbSort<TicketSortField>;

export type TicketSearchRequest = Required<
  Pick<DbParams<TicketSortField>, "page" | "pageSize">
> &
  Pick<DbParams<TicketSortField>, "filter" | "sort">;

export interface DbTicketSummary {
  id: string;
  ticket_number: string;

  created_at: ISODateString;
  updated_at: ISODateString | null;

  requester_username: string;

  status: TicketStatus;
  close_reason?: TicketResolutionReason | null;
  priority: Priority;
  risk_level: RiskLevel;

  assignment_phase?: TicketAssignmentPhase;
  approval_assignee_usernames?: string[];
  work_assignee_usernames?: string[];
  assigned_approver?: boolean;
  assigned_worker?: boolean;

  assignee_usernames: string[];
  merged_into_ticket_id?: string | null;
  merged_into_ticket_no?: string | null;

  last_comment_at: ISODateString | null;
  last_commenter_email: string | null;
  last_user_activity_at: ISODateString | null;
  last_user_activity_email: string | null;
  closed_at?: ISODateString | null;
  work_minutes: number;

  due_at: ISODateString;

  // Derived per current authenticated user; not a persisted DB field.
  owner: boolean;
  // Derived per current authenticated user; not a persisted DB field.
  assigned: boolean;
  active: boolean;

  scope: CategoryScope;
  category_id?: string;
  category_name: LocalizedText;
  category_parent_id?: string | null;
  approval_step_id?: string | null;
  approval_step_name?: string | null;

  subject: string;
  age: number;
}

export interface DbTicketDetail {
  id: string;
  ticket_number: string;

  created_at: ISODateString;
  updated_at: ISODateString | null;

  requester_username: string;

  status: TicketStatus;
  close_reason?: TicketResolutionReason | null;
  priority: Priority;
  risk_level: RiskLevel;

  assignment_phase?: TicketAssignmentPhase;
  approval_assignee_usernames?: string[];
  work_assignee_usernames?: string[];
  assigned_approver?: boolean;
  assigned_worker?: boolean;

  assignee_usernames: string[];
  merged_into_ticket_id?: string | null;
  merged_into_ticket_no?: string | null;

  last_comment_at: ISODateString | null;
  last_commenter_email: string | null;
  last_user_activity_at: ISODateString | null;
  last_user_activity_email: string | null;
  closed_at?: ISODateString | null;
  work_minutes: number;

  due_at: ISODateString;

  // Derived per current authenticated user; not a persisted DB field.
  owner: boolean;
  // Derived per current authenticated user; not a persisted DB field.
  assigned: boolean;
  active: boolean;

  scope: CategoryScope;
  category_id: string;
  category_name: LocalizedText;
  category_parent_id?: string | null;
  approval_step_id: string | null;

  subject: string;
  content: string;

  email: {
    to: string[];
    cc: string[];
    bcc: string[];
  };

  files: TicketAttachmentMetadata[];
  images: TicketAttachmentMetadata[];
}
