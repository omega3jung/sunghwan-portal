import type { LocalizedName } from "@/domain/organization";
import type { Attach, TicketActionType } from "@/domain/serviceDesk";
import type { ISODateString } from "@/shared/types";

/** Defines the approval ticket action type exchanged across the server API boundary. */
export type ApprovalTicketActionType = Extract<
  TicketActionType,
  "APPROVE" | "DECLINE"
>;

/** Defines the ticket action metadata dto exchanged across the server API boundary. */
export type TicketActionMetadataDto = Record<string, unknown>;

/** Defines the ticket action dto exchanged across the server API boundary. */
export type TicketActionDto = {
  ticket_id: string;
  action_no: number;
  action_type: TicketActionType;
  content: string;
  metadata: TicketActionMetadataDto;
  owner_username: string | null;
  owner_name: LocalizedName | null;
  created_at: ISODateString;
  updated_at: ISODateString | null;
  active: boolean;
  files: Attach[];
  images: Attach[];
};

/** Defines the create approval ticket action dto exchanged across the server API boundary. */
export type CreateApprovalTicketActionDto = {
  ticketId: string;
  actionType: ApprovalTicketActionType;
  content: string;
  metadata?: TicketActionMetadataDto;
  ownerUsername: string;
};
