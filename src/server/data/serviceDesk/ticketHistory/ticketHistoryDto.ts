import type { TicketHistoryDisplayMetadata } from "@/domain/serviceDesk";
import { ISODateString } from "@/shared/types";

import {
  TicketHistoryAction,
  TicketHistoryJsonValue,
  TicketHistoryType,
} from "./ticketHistoryTypes";

export type TicketHistoryDto = {
  ticket_id: string;
  history_no: number;
  type: TicketHistoryType;
  action: TicketHistoryAction;
  actor_username: string | null;
  action_no: string | null;
  from_value?: TicketHistoryJsonValue;
  to_value?: TicketHistoryJsonValue;
  metadata: TicketHistoryDisplayMetadata | null;
  created_at: ISODateString;
};

export type CreateTicketHistoryInput = {
  ticketId: string;
  actionNo?: number | null;
  historyType: TicketHistoryType;
  historyAction: TicketHistoryAction;
  actorUsername?: string | null;
  fromValue?: TicketHistoryJsonValue | null;
  toValue?: TicketHistoryJsonValue | null;
  metadata?: TicketHistoryJsonValue | null;
};
