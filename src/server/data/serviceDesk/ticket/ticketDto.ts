import type { RuleGroupTypeIC } from "react-querybuilder";
import { z } from "zod";

import { Priority, RiskLevel } from "@/domain/common";
import {
  CategoryScope,
  TicketAssignmentPhase,
  TicketAttachmentMetadata,
  TicketResolutionReason,
  TicketStatus,
} from "@/domain/serviceDesk";
import { ISODateString, LocalizedText, SortDirection } from "@/shared/types";

import { ServiceDeskTicketEmail } from "./ticketRow";

export const ticketPrioritySchema = z.enum([
  "urgent",
  "high",
  "medium",
  "low",
]);

export const ticketRiskLevelSchema = z.enum([
  "critical",
  "high",
  "medium",
  "low",
]);

export const ticketEmailSchema = z
  .object({
    to: z.array(z.string()).default([]),
    cc: z.array(z.string()).default([]),
    bcc: z.array(z.string()).default([]),
  })
  .default({
    to: [],
    cc: [],
    bcc: [],
  });

export const ticketAttachmentMetadataSchema = z.object({
  originalName: z.string().trim().min(1).max(200),
  replacedName: z.string().trim().min(1),
  extension: z.string().trim().min(1),
  size: z.number().int().nonnegative(),
  type: z.string().trim().min(1),
  demoUrl: z.string().regex(/^\/files\/demo-[a-z0-9-]+\.[a-z0-9]+$/i),
  replaced: z.literal(true),
  reason: z.literal("SECURITY_DEMO_REPLACEMENT"),
});

export const ticketMutateRequestSchema = z.object({
  id: z.string().trim().min(1).nullable().optional(),
  tenantId: z.coerce.number().int().positive().nullable().optional(),
  categoryId: z.coerce.number().int().positive(),
  approvalStepId: z.coerce.number().int().positive().nullable().optional(),
  subject: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1),
  dueAt: z.coerce.date(),
  priority: ticketPrioritySchema.nullable().optional(),
  riskLevel: ticketRiskLevelSchema.nullable().optional(),
  email: ticketEmailSchema,
  files: z.array(ticketAttachmentMetadataSchema).default([]),
  images: z.array(ticketAttachmentMetadataSchema).default([]),
});

export const ticketCreateRequestSchema = ticketMutateRequestSchema;

export type TicketAttachmentMetadataDto = TicketAttachmentMetadata;
export type TicketMutateRequestDto = z.infer<typeof ticketMutateRequestSchema>;
export type TicketCreateRequestDto = z.infer<typeof ticketCreateRequestSchema>;

export type TicketListItemDto = {
  id: string;
  ticket_number: string;
  created_at: ISODateString;
  updated_at: ISODateString | null;

  requester_username: string;
  status: TicketStatus;
  priority: Priority;
  risk_level: RiskLevel;

  assignment_phase: TicketAssignmentPhase;
  approval_assignee_usernames: string[];
  work_assignee_usernames: string[];
  assigned_approver: boolean;
  assigned_worker: boolean;

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
  has_been_worker: boolean;
  content: string;
  email: ServiceDeskTicketEmail;
  files: TicketAttachmentMetadataDto[];
  images: TicketAttachmentMetadataDto[];
};

export type TicketSearchSortFieldDto =
  | "ticketNumber"
  | "createdAt"
  | "updatedAt"
  | "dueAt"
  | "priority"
  | "status";

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
