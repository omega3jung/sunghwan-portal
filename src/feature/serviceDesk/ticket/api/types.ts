import { Priority, RiskLevel } from "@/domain/common";
import {
  Attach,
  CategoryScope,
  TicketResolutionReason,
  TicketStatus,
} from "@/domain/serviceDesk";
import type { SortDirection } from "@/shared/types";
import { LocalizedText } from "@/shared/types";
import type { DbParams } from "@/shared/types/api";
import { ISODateString } from "@/shared/types/date";

export type TicketSortField =
  | "ticketNumber"
  | "createdAt"
  | "dueAt"
  | "priority";

export type TicketSearchSort = {
  field: TicketSortField;
  direction: SortDirection;
};

export type TicketSearchRequest = {
  filter: DbParams["filter"];
  sort?: TicketSearchSort;
  page: number;
  pageSize: number;
};

export interface DbTicketSummary {
  id: string;
  ticket_number: string;

  created_at: ISODateString;
  updated_at: ISODateString | null;

  requester_id: string;

  status: TicketStatus;
  close_reason?: TicketResolutionReason | null;
  priority: Priority;
  risk_level: RiskLevel;
  assignee_id: string[];
  merged_into_ticket_id?: string | null;

  last_comment_at: ISODateString | null;
  last_commenter_email: string | null;
  work_minutes: number;

  due_at: ISODateString;

  // Derived per current authenticated user; not a persisted DB field.
  owner: boolean;
  // Derived per current authenticated user; not a persisted DB field.
  assigned: boolean;
  active: boolean;

  scope: CategoryScope;
  category_name: LocalizedText;
  approval_step_name: string | null;

  subject: string;
  age: number;
}

export interface DbTicketDetail {
  id: string;
  ticket_number: string;

  created_at: ISODateString;
  updated_at: ISODateString | null;

  requester_id: string;

  status: TicketStatus;
  close_reason?: TicketResolutionReason | null;
  priority: Priority;
  risk_level: RiskLevel;
  assignee_id: string[];
  merged_into_ticket_id?: string | null;

  last_comment_at: ISODateString | null;
  last_commenter_email: string | null;
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
  approval_step_id: string | null;

  subject: string;
  content: string;

  email: {
    to: string[];
    cc: string[];
    bcc: string[];
  };

  files: Attach[];
  images: Attach[];
}
