import type { ServiceDeskRepositoryOptions } from "@/server/data/serviceDesk/shared";
import { queryPortalApi } from "@/server/shared/supabase/portalApiClient";

import { CreateTicketHistoryInput } from "./ticketHistoryDto";
import { TicketHistoryRow } from "./ticketHistoryRow";
import { TicketHistoryJsonValue } from "./ticketHistoryTypes";

export type TicketHistoryRepositoryOptions = ServiceDeskRepositoryOptions;

const CREATE_TICKET_HISTORY_QUERY = `
insert into service_desk.ticket_history (
  tkh_ticket_id,
  tkh_action_no,
  tkh_history_type,
  tkh_source,
  tkh_event,
  tkh_actor_username,
  (
    select employee.e_name
    from public.vw_employee employee
    where employee.e_username = tkh_actor_username
    limit 1
  ) as tkh_actor_name,
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
  $6,
  $7::jsonb,
  $8::jsonb,
  $9::jsonb
)
returning
  tkh_ticket_id,
  tkh_history_no,
  tkh_action_no,
  tkh_history_type,
  tkh_source,
  tkh_event,
  tkh_actor_username,
  (
    select employee.e_name
    from public.vw_employee employee
    where employee.e_username = tkh_actor_username
    limit 1
  ) as tkh_actor_name,
  tkh_from_value,
  tkh_to_value,
  tkh_metadata,
  tkh_created_at;
`;

const FIND_TICKET_HISTORY_ROWS_BY_TICKET_ID_QUERY = `
select
  tkh_ticket_id,
  tkh_history_no,
  tkh_action_no,
  tkh_history_type,
  tkh_source,
  tkh_event,
  tkh_actor_username,
  tkh_from_value,
  tkh_to_value,
  tkh_metadata,
  tkh_created_at
from service_desk.ticket_history
where tkh_ticket_id = $1
order by tkh_history_no asc;
`;

export async function findTicketHistoryRowsByTicketId(
  ticketId: string,
  options: TicketHistoryRepositoryOptions = {},
): Promise<TicketHistoryRow[]> {
  const query = options.query ?? queryPortalApi;

  return query<TicketHistoryRow>(FIND_TICKET_HISTORY_ROWS_BY_TICKET_ID_QUERY, [
    ticketId,
  ]);
}

export async function createTicketHistoryRow(
  input: CreateTicketHistoryInput,
  options: TicketHistoryRepositoryOptions = {},
): Promise<TicketHistoryRow | null> {
  const query = options.query ?? queryPortalApi;
  const rows = await query<TicketHistoryRow>(CREATE_TICKET_HISTORY_QUERY, [
    input.ticketId,
    input.actionNo ?? null,
    input.historyType,
    input.source,
    input.event,
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
