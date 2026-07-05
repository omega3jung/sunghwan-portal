import type { TicketActionType } from "@/domain/serviceDesk";
import type { ISODateString } from "@/shared/types";

export type TicketActionRow = {
  tka_ticket_id: string;
  tka_action_no: number;
  tka_action_type: TicketActionType | string;
  tka_content: string | null;
  tka_files: unknown | null;
  tka_images: unknown | null;
  tka_owner_username: string | null;
  tka_active: boolean;
  tka_created_at: ISODateString | Date;
  tka_updated_at: ISODateString | Date | null;
};
