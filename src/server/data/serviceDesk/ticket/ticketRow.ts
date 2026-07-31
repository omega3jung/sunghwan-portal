import { Priority, RiskLevel } from "@/domain/common";
import {
  CategoryScope,
  TicketAttachmentMetadata,
  TicketRequester,
  TicketResolutionReason,
  TicketStatus,
  TicketUser,
} from "@/domain/serviceDesk";
import { ISODateString, LocalizedText } from "@/shared/types";

/** Defines the PostgreSQL service desk ticket email used only within the repository boundary. */
export type ServiceDeskTicketEmail = {
  to: string[];
  cc: string[];
  bcc: string[];
};

/** Defines the PostgreSQL service desk ticket view row used only within the repository boundary. */
export type ServiceDeskTicketViewRow = {
  tk_id: string;
  tk_tenant_id: number | null;
  tn_name: LocalizedText | null;
  tk_ticket_no: string;
  tk_created_at: ISODateString;
  tk_updated_at: ISODateString | null;

  tk_requester_username: string;
  tk_requester: TicketRequester;
  tk_requester_department_id: number | null;
  tk_requester_department_name: LocalizedText | null;

  tk_status: TicketStatus;
  tk_priority: Priority;
  tk_risk_level: RiskLevel;
  tk_assignee_usernames: string[];
  tk_assignees: TicketUser[];

  tk_work_minutes: number;

  tka_last_comment_at: ISODateString | null;
  tka_last_comment_email: string | null;
  tka_last_user_activity_at: ISODateString | null;
  tka_last_user_activity_email: string | null;

  tk_close_reason: TicketResolutionReason | null;
  tk_merged_into_ticket_id: string | null;
  tk_merged_into_ticket_no: string | null;
  tkh_closed_at: ISODateString | null;
  tk_due_at: ISODateString;

  cat_scope: CategoryScope;
  cat_id: number;
  cat_name: LocalizedText;
  cat_parent_id: number | null;

  tk_approval_step_id: number | null;

  tk_subject: string;
  tk_content: string;
  tk_email: ServiceDeskTicketEmail;
  tk_files: TicketAttachmentMetadata[];
  tk_images: TicketAttachmentMetadata[];
};

/** Defines the PostgreSQL ticket mutate row input used only within the repository boundary. */
export type TicketMutateRowInput = {
  tk_tenant_id: number | null;
  tk_category_id: number;
  tk_approval_step_id: number | null;
  tk_subject: string;
  tk_content: string;
  tk_due_at: ISODateString;
  tk_priority: Priority;
  tk_risk_level: RiskLevel;
  tk_email: ServiceDeskTicketEmail;
  tk_files: TicketAttachmentMetadata[];
  tk_images: TicketAttachmentMetadata[];
};

/** Defines the PostgreSQL create ticket row input used only within the repository boundary. */
export type CreateTicketRowInput = TicketMutateRowInput & {
  tk_ticket_no: string;
  tk_requester_username: string;
  tk_requester_department_id: number;
  tk_status: TicketStatus;
};
