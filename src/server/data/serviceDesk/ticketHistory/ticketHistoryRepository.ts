import type { QueryResultRow } from "pg";

import { queryPortalApi } from "@/server/shared/supabase/portalApiClient";

import { CreateTicketHistoryInput } from "./ticketHistoryDto";
import { TicketHistoryRow } from "./ticketHistoryRow";
import { TicketHistoryJsonValue } from "./ticketHistoryTypes";

export type TicketHistoryQueryExecutor = <
  T extends QueryResultRow = QueryResultRow,
>(
  text: string,
  params?: unknown[],
) => Promise<T[]>;

export type TicketHistoryRepositoryOptions = {
  // Allows service flows to execute multiple repository calls in one transaction.
  query?: TicketHistoryQueryExecutor;
};

const CREATE_TICKET_HISTORY_QUERY = `
insert into service_desk.ticket_history (
  tkh_ticket_id,
  tkh_action_no,
  tkh_history_type,
  tkh_history_action,
  tkh_actor_username,
  tkh_from_value,
  tkh_to_value,
  tkh_metadata
)
values (
  $1,
  $2,
  $3,
  $4,
  $5,
  $6::jsonb,
  $7::jsonb,
  $8::jsonb
)
returning
  tkh_ticket_id,
  tkh_history_no,
  tkh_action_no,
  tkh_history_type,
  tkh_history_action,
  tkh_actor_username,
  tkh_from_value,
  tkh_to_value,
  tkh_metadata,
  tkh_created_at;
`;

export async function createTicketHistoryRow(
  input: CreateTicketHistoryInput,
  options: TicketHistoryRepositoryOptions = {},
): Promise<TicketHistoryRow | null> {
  const query = options.query ?? queryPortalApi;
  const rows = await query<TicketHistoryRow>(CREATE_TICKET_HISTORY_QUERY, [
    input.ticketId,
    input.actionNo ?? null,
    input.historyType,
    input.historyAction,
    input.actorUsername ?? null,
    toJsonbParam(input.fromValue),
    toJsonbParam(input.toValue),
    toMetadataJsonbParam(input.metadata),
  ]);

  return rows[0] ?? null;
}

function toJsonbParam(
  value: TicketHistoryJsonValue | null | undefined,
): string | null {
  return value === undefined || value === null ? null : JSON.stringify(value);
}

function toMetadataJsonbParam(
  value: TicketHistoryJsonValue | null | undefined,
): string {
  return JSON.stringify(value ?? {});
}
