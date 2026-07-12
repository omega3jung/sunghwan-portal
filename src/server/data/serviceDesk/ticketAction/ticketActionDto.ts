import type { Priority, RiskLevel } from "@/domain/common";
import type { Attach, TicketActionType } from "@/domain/serviceDesk";
import type { ISODateString } from "@/shared/types";

export type ApprovalTicketActionType = Extract<
  TicketActionType,
  "APPROVE" | "DECLINE"
>;

export type TicketActionMetadataDto = Record<string, unknown>;

export type TicketActionDto = {
  ticket_id: string;
  action_no: number;
  action_type: TicketActionType;
  content: string;
  metadata: TicketActionMetadataDto;
  owner_username: string | null;
  created_at: ISODateString;
  updated_at: ISODateString | null;
  active: boolean;
  files: Attach[];
  images: Attach[];
};

export type CreateApprovalTicketActionDto = {
  ticketId: string;
  actionType: ApprovalTicketActionType;
  content: string;
  metadata?: TicketActionMetadataDto;
  ownerUsername: string;
};

export type TicketActionRequestDto = {
  content: string;
  actionType?: TicketActionType;
  files?: Attach[];
  images?: Attach[];
  assigneeUsernames?: string[];
  priority?: Priority;
  riskLevel?: RiskLevel;
  dueAt?: ISODateString | null;
  targetTicketId?: string;
};
