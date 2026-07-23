import type { ServiceDeskRepositoryOptions } from "@/server/data/serviceDesk/shared";
import { queryPortalApi } from "@/server/shared/supabase/portalApiClient";

import type { WorkSessionRow } from "./workSessionRow";

export type WorkSessionRepositoryOptions = ServiceDeskRepositoryOptions;

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

const FINISH_RUNNING_WORK_SESSION_ROWS_BY_TICKET_ID_QUERY = `
update service_desk.work_session
set
  ws_end_at = $2::timestamptz,
  ws_duration_minutes = greatest(
    1,
    floor(extract(epoch from ($2::timestamptz - ws_start_at)) / 60)::int
  ),
  ws_updated_at = $2::timestamptz
where ws_ticket_id = $1
  and ws_start_at is not null
  and ws_end_at is null
  and ws_duration_minutes is null
returning
  ws_id,
  ws_ticket_id,
  ws_assignee_username,
  ws_start_at,
  ws_end_at,
  ws_duration_minutes,
  ws_note,
  ws_created_at,
  ws_updated_at;
`;

const CREATE_WORK_SESSION_ROW_QUERY = `
insert into service_desk.work_session (
  ws_ticket_id,
  ws_assignee_username,
  ws_start_at,
  ws_end_at,
  ws_duration_minutes,
  ws_note
)
values (
  $1,
  $2,
  $3,
  $4,
  $5,
  $6
)
returning
  ws_id,
  ws_ticket_id,
  ws_assignee_username,
  ws_start_at,
  ws_end_at,
  ws_duration_minutes,
  ws_note,
  ws_created_at,
  ws_updated_at;
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

export async function finishRunningWorkSessionRowsByTicketId(
  ticketId: string,
  endedAt: string,
  options: WorkSessionRepositoryOptions = {},
): Promise<WorkSessionRow[]> {
  const query = options.query ?? queryPortalApi;

  return query<WorkSessionRow>(FINISH_RUNNING_WORK_SESSION_ROWS_BY_TICKET_ID_QUERY, [
    ticketId,
    endedAt,
  ]);
}

export async function createWorkSessionRow(
  input: {
    ticketId: string;
    assigneeUsername: string;
    startAt: string | null;
    endAt: string | null;
    durationMinutes: number | null;
    note: string | null;
  },
  options: WorkSessionRepositoryOptions = {},
): Promise<WorkSessionRow | null> {
  const query = options.query ?? queryPortalApi;
  const rows = await query<WorkSessionRow>(CREATE_WORK_SESSION_ROW_QUERY, [
    input.ticketId,
    input.assigneeUsername,
    input.startAt,
    input.endAt,
    input.durationMinutes,
    input.note,
  ]);

  return rows[0] ?? null;
}
