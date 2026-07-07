import type { QueryResultRow } from "pg";

import { queryPortalApi } from "@/server/shared/supabase/portalApiClient";

import type { WorkSessionRow } from "./workSessionRow";

export type WorkSessionQueryExecutor = <
  T extends QueryResultRow = QueryResultRow,
>(
  text: string,
  params?: unknown[],
) => Promise<T[]>;

export type WorkSessionRepositoryOptions = {
  query?: WorkSessionQueryExecutor;
};

const FIND_WORK_SESSION_ROWS_BY_TICKET_ID_QUERY = `
select
  ws_id,
  ws_ticket_id,
  ws_assignee_username,
  ws_start_at,
  ws_end_at,
  ws_duration_minutes,
  ws_note,
  ws_created_at,
  ws_updated_at
from service_desk.work_session
where ws_ticket_id = $1
order by ws_created_at asc, ws_id asc;
`;

export async function findWorkSessionRowsByTicketId(
  ticketId: string,
  options: WorkSessionRepositoryOptions = {},
): Promise<WorkSessionRow[]> {
  const query = options.query ?? queryPortalApi;

  return query<WorkSessionRow>(FIND_WORK_SESSION_ROWS_BY_TICKET_ID_QUERY, [
    ticketId,
  ]);
}
