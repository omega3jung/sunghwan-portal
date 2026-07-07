import {
  HistoryType,
  TicketHistory,
  TicketHistoryAction,
} from "@/domain/serviceDesk";
import {
  createItemPayloadMapper,
  createListPayloadMapper,
} from "@/lib/api/utils/payload";
import { ArrayMapper } from "@/shared/types";
import { ISODateString } from "@/shared/types/date";

import { mapTicketHistoryDisplayMetadata } from "../utils";

export interface DbTicketHistory {
  ticket_id: string;
  history_no: number;

  type: HistoryType;
  action: TicketHistoryAction;

  actor_username: string | null;
  action_no: number | null;

  from_value?: unknown;
  to_value?: unknown;
  metadata?: unknown;

  created_at: ISODateString;
}

export const camelTicketHistoryMapper: ArrayMapper<
  DbTicketHistory,
  TicketHistory
> = (data) => {
  return data.map((item) => ({
    ticketId: item.ticket_id,
    historyNo: item.history_no,
    type: item.type,
    action: item.action,
    actorUsername: item.actor_username,
    actionNo: item.action_no,
    fromValue: item.from_value,
    toValue: item.to_value,
    metadata: mapTicketHistoryDisplayMetadata(item.metadata),
    createdAt: item.created_at,
  }));
};

export const snakeTicketHistoryMapper: ArrayMapper<
  TicketHistory,
  DbTicketHistory
> = (data) => {
  return data.map((item) => ({
    ticket_id: item.ticketId,
    history_no: item.historyNo,
    type: item.type,
    action: item.action,
    actor_username: item.actorUsername,
    action_no: item.actionNo,
    from_value: item.fromValue,
    to_value: item.toValue,
    metadata: item.metadata,
    created_at: item.createdAt,
  }));
};

export const mapTicketHistoryListPayload = createListPayloadMapper(
  camelTicketHistoryMapper,
);
export const mapTicketHistoryPayload = createItemPayloadMapper(
  camelTicketHistoryMapper,
);
