import type { ISODateString } from "@/shared/types";

export type WorkSessionRow = {
  ws_id: number;
  ws_ticket_id: string;
  ws_assignee_username: string;
  ws_start_at: ISODateString | Date | null;
  ws_end_at: ISODateString | Date | null;
  ws_duration_minutes: number | null;
  ws_note: string | null;
  ws_created_at: ISODateString | Date;
  ws_updated_at: ISODateString | Date | null;
};
