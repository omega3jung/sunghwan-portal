import type { Attach, TicketActionType } from "@/domain/serviceDesk";
import type { ISODateString } from "@/shared/types";

export type TicketActionDto = {
  ticket_id: string;
  action_no: number;
  action_type: TicketActionType;
  content: string;
  owner_username: string | null;
  created_at: ISODateString;
  updated_at: ISODateString | null;
  active: boolean;
  files: Attach[];
  images: Attach[];
};
