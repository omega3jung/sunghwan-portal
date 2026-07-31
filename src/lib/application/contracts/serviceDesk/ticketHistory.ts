import type { LocalizedName } from "@/domain/organization";
import {
  HistoryType,
  TicketHistory,
  TicketHistoryEvent,
  TicketHistorySource,
} from "@/domain/serviceDesk";
import {
  createItemPayloadMapper,
  createListPayloadMapper,
} from "@/lib/application/api/payload";
import { mapTicketHistoryDisplayMetadata } from "@/lib/application/serviceDesk";
import { ArrayMapper } from "@/shared/types";
import { ISODateString } from "@/shared/types/date";

/** Database-facing ticket history shape used by the Service Desk application boundary. */
export interface DbTicketHistory {
  ticket_id: string;
  history_no: number;

  type: HistoryType;
  event: TicketHistoryEvent;
  source: TicketHistorySource;

  actor_username: string | null;
  actor_name?: LocalizedName | null;
  action_no: number | null;

  from_value?: unknown;
  to_value?: unknown;
  metadata?: unknown;

  created_at: ISODateString;
}

/** Maps a database ticket history record into the application-facing model. */
export const camelTicketHistoryMapper: ArrayMapper<
  DbTicketHistory,
  TicketHistory
> = (data) => {
  return data.map((item) => ({
    ticketId: item.ticket_id,
    historyNo: item.history_no,
    type: item.type,
    event: item.event,
    source: item.source,
    actorUsername: item.actor_username,
    actorName: item.actor_name ?? null,
    actionNo: item.action_no,
    fromValue: item.from_value,
    toValue: item.to_value,
    metadata: mapTicketHistoryDisplayMetadata({
      ...asRecord(item.metadata),
      source: item.source,
      event: item.event,
    }),
    createdAt: item.created_at,
  }));
};

/** Maps an application ticket history model into its database-facing shape. */
export const snakeTicketHistoryMapper: ArrayMapper<
  TicketHistory,
  DbTicketHistory
> = (data) => {
  return data.map((item) => ({
    ticket_id: item.ticketId,
    history_no: item.historyNo,
    type: item.type,
    event: item.event,
    source: item.source,
    actor_username: item.actorUsername,
    actor_name: item.actorName,
    action_no: item.actionNo,
    from_value: item.fromValue,
    to_value: item.toValue,
    metadata: item.metadata,
    created_at: item.createdAt,
  }));
};

/** Maps a ticket history collection payload into application models. */
export const mapTicketHistoryListPayload = createListPayloadMapper(
  camelTicketHistoryMapper,
);
/** Maps a ticket history payload into the application model. */
export const mapTicketHistoryPayload = createItemPayloadMapper(
  camelTicketHistoryMapper,
);

function asRecord(value: unknown): Record<string, unknown> {
  return value &&
    typeof value === "object" &&
    !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}
