import { mapTicketHistoryDisplayMetadata } from "@/lib/application/serviceDesk";
import type { ISODateString } from "@/shared/types";

import { TicketHistoryDto } from "./ticketHistoryDto";
import { TicketHistoryRow } from "./ticketHistoryRow";
import {
  TicketHistoryEvent,
  TicketHistoryJsonValue,
  TicketHistorySource,
  TicketHistoryType,
} from "./ticketHistoryTypes";

export function mapTicketHistoryRowToDto(
  row: TicketHistoryRow,
): TicketHistoryDto {
  const fromValue = normalizeTicketHistoryJsonValue(row.tkh_from_value);
  const toValue = normalizeTicketHistoryJsonValue(row.tkh_to_value);

  return {
    ticket_id: row.tkh_ticket_id,
    history_no: row.tkh_history_no,
    type: row.tkh_history_type as TicketHistoryType,
    source: row.tkh_source as TicketHistorySource,
    event: row.tkh_event as TicketHistoryEvent,
    actor_username: row.tkh_actor_username,
    action_no: row.tkh_action_no,
    ...(fromValue !== null ? { from_value: fromValue } : {}),
    ...(toValue !== null ? { to_value: toValue } : {}),
    metadata: mapTicketHistoryDisplayMetadata({
      ...asRecord(row.tkh_metadata),
      source: row.tkh_source,
      event: row.tkh_event,
    }),
    created_at: toIsoDateString(row.tkh_created_at),
  };
}

export function normalizeTicketHistoryJsonValue(
  value: unknown,
): TicketHistoryJsonValue | null {
  if (value === undefined || value === null) {
    return null;
  }

  return isTicketHistoryJsonValue(value) ? value : null;
}

function isTicketHistoryJsonValue(
  value: unknown,
): value is TicketHistoryJsonValue {
  if (value === null) {
    return true;
  }

  const valueType = typeof value;

  if (
    valueType === "string" ||
    valueType === "boolean" ||
    valueType === "number"
  ) {
    return valueType !== "number" || Number.isFinite(value);
  }

  if (Array.isArray(value)) {
    return value.every(isTicketHistoryJsonValue);
  }

  if (valueType !== "object") {
    return false;
  }

  return Object.values(value as Record<string, unknown>).every(
    isTicketHistoryJsonValue,
  );
}

function toIsoDateString(value: ISODateString | Date): ISODateString {
  return (value instanceof Date ? value.toISOString() : value) as ISODateString;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value &&
    typeof value === "object" &&
    !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}
