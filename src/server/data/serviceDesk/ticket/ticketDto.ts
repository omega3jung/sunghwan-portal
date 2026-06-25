import type { RuleGroupTypeIC } from "react-querybuilder";

import { Priority, RiskLevel } from "@/domain/common";
import {
  Attach,
  CategoryScope,
  TicketResolutionReason,
  TicketStatus,
} from "@/domain/serviceDesk";
import { ISODateString, LocalizedText, SortDirection } from "@/shared/types";

import { ServiceDeskTicketEmail } from "./ticketRow";

export type TicketListItemDto = {
  id: string;
  ticket_number: string;
  created_at: ISODateString;
  updated_at: ISODateString | null;

  requester_username: string;
  status: TicketStatus;
  priority: Priority;
  risk_level: RiskLevel;
  assignee_usernames: string[];

  work_minutes: number;
  last_comment_at: ISODateString | null;
  last_commenter_email: string | null;
  last_user_activity_at: ISODateString | null;
  last_user_activity_email: string | null;

  close_reason: TicketResolutionReason | null;
  merged_into_ticket_id: string | null;
  merged_into_ticket_no: string | null;
  closed_at: ISODateString | null;
  due_at: ISODateString;

  owner: boolean;
  assigned: boolean;
  active: boolean;

  scope: CategoryScope;
  category_id: string;
  category_name: LocalizedText;
  category_parent_id: string | null;
  approval_step_id: string | null;

  subject: string;
  age: number;
};

export type TicketDetailDto = Omit<TicketListItemDto, "age"> & {
  content: string;
  email: ServiceDeskTicketEmail;
  files: Attach[];
  images: Attach[];
};

export type TicketSearchSortFieldDto =
  | "ticketNumber"
  | "createdAt"
  | "dueAt"
  | "priority";

export type TicketSearchSortDto = {
  field: TicketSearchSortFieldDto;
  direction: SortDirection;
};

export type TicketSearchRequestDto = {
  filter?: RuleGroupTypeIC;
  sort?: TicketSearchSortDto;
  page?: number;
  pageSize?: number;
};

export type TicketSearchResponseDto = {
  items: TicketListItemDto[];
  totalCount: number;
  page: number;
  pageSize: number;
};
