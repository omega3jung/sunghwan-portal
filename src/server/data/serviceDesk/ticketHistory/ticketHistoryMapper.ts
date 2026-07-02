import { TicketHistoryDto } from "./ticketHistoryDto";
import { TicketHistoryRow } from "./ticketHistoryRow";
import {
  TicketHistoryAction,
  TicketHistoryJsonValue,
  TicketHistoryType,
} from "./ticketHistoryTypes";

export function mapTicketHistoryRowToDto(
  row: TicketHistoryRow,
): TicketHistoryDto {
  return {
    ticketId: row.tkh_ticket_id,
    historyNo: row.tkh_history_no,
    actionNo: row.tkh_action_no,
    historyType: row.tkh_history_type as TicketHistoryType,
    historyAction: row.tkh_history_action as TicketHistoryAction,
    actorUsername: row.tkh_actor_username,
    fromValue: normalizeTicketHistoryJsonValue(row.tkh_from_value),
    toValue: normalizeTicketHistoryJsonValue(row.tkh_to_value),
    metadata: normalizeTicketHistoryJsonValue(row.tkh_metadata),
    createdAt: row.tkh_created_at,
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
