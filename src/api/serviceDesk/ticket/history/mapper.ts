import {
  createItemPayloadMapper,
  createListPayloadMapper,
} from "@/api/utils/payload";
import {
  HistoryType,
  TicketHistory,
  TicketHistoryAction,
} from "@/domain/serviceDesk";
import { ArrayMapper } from "@/shared/types";
import { ISODateString } from "@/shared/types/date";

export interface DbTicketHistory {
  ticket_id: string;
  history_no: number;

  type: HistoryType;
  action: TicketHistoryAction;

  actor_id: string | null;
  comment_no: string | null;

  from_value?: unknown;
  to_value?: unknown;
  metadata?: Record<string, unknown>;

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
    actorId: item.actor_id,
    commentNo: item.comment_no,
    fromValue: item.from_value,
    toValue: item.to_value,
    metadata: item.metadata,
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
    actor_id: item.actorId,
    comment_no: item.commentNo,
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
