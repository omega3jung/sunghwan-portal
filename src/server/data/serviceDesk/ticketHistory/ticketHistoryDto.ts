import { ISODateString } from "@/shared/types";

import {
  TicketHistoryAction,
  TicketHistoryJsonValue,
  TicketHistoryType,
} from "./ticketHistoryTypes";

export type TicketHistoryDto = {
  ticketId: string;
  historyNo: number;
  actionNo: number | null;
  historyType: TicketHistoryType;
  historyAction: TicketHistoryAction;
  actorUsername: string | null;
  fromValue: TicketHistoryJsonValue | null;
  toValue: TicketHistoryJsonValue | null;
  metadata: TicketHistoryJsonValue | null;
  createdAt: ISODateString;
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
