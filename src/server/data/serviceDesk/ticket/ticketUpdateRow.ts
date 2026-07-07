import type { Priority, RiskLevel } from "@/domain/common";
import { TicketAttachmentMetadata, TicketStatus } from "@/domain/serviceDesk";
import { ISODateString } from "@/shared/types";

import type { ServiceDeskTicketEmail } from "./ticketRow";

export type RequesterUpdateTicketRowInput = {
  tk_category_id: number;
  tk_subject: string;
  tk_content: string;
  tk_due_at: ISODateString;
  tk_email: ServiceDeskTicketEmail;
  tk_files: TicketAttachmentMetadata[];
  tk_images: TicketAttachmentMetadata[];
  tk_priority: Priority;
  tk_risk_level: RiskLevel;
  tk_status: TicketStatus;
  tk_approval_step_id: number | string | null;
  tk_assignee_usernames: string[];
};

export type RequesterUpdateCategorySnapshot = {
  cat_id: number;
  cat_parent_id: number | null;
  cat_default_priority: Priority | null;
  cat_default_risk_level: RiskLevel | null;
};
