import type { QueryResultRow } from "pg";

import { queryPortalApi } from "@/server/shared/supabase/portalApiClient";

import type { TicketActionRow } from "./ticketActionRow";

export type TicketActionQueryExecutor = <
  T extends QueryResultRow = QueryResultRow,
>(
  text: string,
  params?: unknown[],
) => Promise<T[]>;

export type TicketActionRepositoryOptions = {
  query?: TicketActionQueryExecutor;
};

const FIND_ACTIVE_TICKET_ACTION_ROWS_BY_TICKET_ID_QUERY = `
select
  tka_ticket_id,
  tka_action_no,
  tka_action_type,
  tka_content,
  tka_files,
  tka_images,
  tka_owner_username,
  tka_active,
  tka_created_at,
  tka_updated_at
from service_desk.ticket_action
where tka_active = true
  and tka_ticket_id = $1
order by tka_action_no asc;
`;

export async function findActiveTicketActionRowsByTicketId(
  ticketId: string,
  options: TicketActionRepositoryOptions = {},
): Promise<TicketActionRow[]> {
  const query = options.query ?? queryPortalApi;

  return query<TicketActionRow>(
    FIND_ACTIVE_TICKET_ACTION_ROWS_BY_TICKET_ID_QUERY,
    [ticketId],
  );
}
