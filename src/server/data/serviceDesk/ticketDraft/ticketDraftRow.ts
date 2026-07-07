import { Priority, RiskLevel } from "@/domain/common";
import { Attach } from "@/domain/serviceDesk";
import { ISODateString } from "@/shared/types";

import { ServiceDeskTicketEmail } from "../ticket/ticketRow";

export type ServiceDeskTicketDraftRow = {
  tk_id: string;
  tk_ticket_no: string;
  tk_created_at: ISODateString;
  tk_updated_at: ISODateString | null;
  tk_requester_username: string;
  tk_status: "Draft";
  tk_priority: Priority | null;
  tk_risk_level: RiskLevel | null;
  tk_assignee_usernames: string[] | string | null;
  tk_due_at: ISODateString | null;
  tk_category_id: number | null;
  tk_approval_step_id: number | null;
  tk_subject: string | null;
  tk_content: string | null;
  tk_email: ServiceDeskTicketEmail | null;
  tk_files: Attach[] | null;
  tk_images: Attach[] | null;
  tk_active: boolean;
};

export type TicketDraftRowInput = {
  tk_category_id: number | null;
  tk_approval_step_id: number | null;
  tk_priority: Priority;
  tk_risk_level: RiskLevel;
  tk_assignee_usernames: string[];
  tk_due_at: ISODateString;
  tk_subject: string;
  tk_content: string;
  tk_email: ServiceDeskTicketEmail;
  tk_files: Attach[];
  tk_images: Attach[];
};
