import { ISODateString } from "@/shared/types";

export type TicketHistoryRow = {
  tkh_ticket_id: string;
  tkh_history_no: number;
  tkh_action_no: number | null;
  tkh_history_type: string;
  tkh_history_action: string;
  tkh_actor_username: string | null;
  tkh_from_value: unknown | null;
  tkh_to_value: unknown | null;
  tkh_metadata: unknown | null;
  tkh_created_at: ISODateString;
};

export type TicketHistoryCreatedRow = {
  tkh_ticket_id: string;
  tkh_history_no: number;
};
