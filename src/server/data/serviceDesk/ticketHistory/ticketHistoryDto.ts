import type { LocalizedName } from "@/domain/organization";
import type { TicketHistoryDisplayMetadata } from "@/domain/serviceDesk";
import { ISODateString } from "@/shared/types";

import {
  TicketHistoryEvent,
  TicketHistoryJsonValue,
  TicketHistorySource,
  TicketHistoryType,
} from "./ticketHistoryTypes";

export type TicketHistoryDto = {
  ticket_id: string;
  history_no: number;
  type: TicketHistoryType;
  source: TicketHistorySource;
  event: TicketHistoryEvent;
  actor_username: string | null;
  actor_name: LocalizedName | null;
  action_no: number | null;
  from_value?: TicketHistoryJsonValue;
  to_value?: TicketHistoryJsonValue;
  metadata: TicketHistoryDisplayMetadata | null;
  created_at: ISODateString;
};

export type CreateTicketHistoryInput = {
  ticketId: string;
  actionNo?: number | null;
  historyType: TicketHistoryType;
  source: TicketHistorySource;
  event: TicketHistoryEvent;
  actorUsername?: string | null;
  fromValue?: TicketHistoryJsonValue | null;
  toValue?: TicketHistoryJsonValue | null;
  metadata?: TicketHistoryJsonValue | null;
};
