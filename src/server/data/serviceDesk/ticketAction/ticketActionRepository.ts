import type { QueryResultRow } from "pg";

import type { Attach, TicketActionType } from "@/domain/serviceDesk";
import { queryPortalApi } from "@/server/shared/supabase/portalApiClient";

import type {
  ApprovalTicketActionType,
  TicketActionMetadataDto,
} from "./ticketActionDto";
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

export type CreateTicketActionRowInput = {
  ticketId: string;
  actionNo: number;
  actionType: TicketActionType;
  content: string;
  ownerUsername: string;
  files: Attach[];
  images: Attach[];
};

export type CreateApprovalTicketActionRowInput = {
  ticketId: string;
  actionType: ApprovalTicketActionType;
  content: string;
  metadata?: TicketActionMetadataDto;
  ownerUsername: string;
};

const TICKET_ACTION_ROW_COLUMNS = `
  tka_ticket_id,
  tka_action_no,
  tka_action_type,
  tka_content,
  tka_metadata,
  tka_files,
  tka_images,
  tka_owner_username,
  tka_active,
  tka_created_at,
  tka_updated_at
`;

const FIND_ACTIVE_TICKET_ACTION_ROWS_BY_TICKET_ID_QUERY = `
select
${TICKET_ACTION_ROW_COLUMNS}
from service_desk.ticket_action
where tka_active = true
  and tka_ticket_id = $1
order by tka_action_no asc;
`;

const FIND_NEXT_TICKET_ACTION_NO_QUERY = `
select coalesce(max(tka_action_no), 0) + 1 as action_no
from service_desk.ticket_action
where tka_ticket_id = $1;
`;

const CREATE_TICKET_ACTION_ROW_QUERY = `
insert into service_desk.ticket_action (
  tka_ticket_id,
  tka_action_no,
  tka_action_type,
  tka_content,
  tka_files,
  tka_images,
  tka_owner_username
)
values (
  $1,
  $2,
  $3,
  $4,
  $5::jsonb,
  $6::jsonb,
  $7
)
returning
${TICKET_ACTION_ROW_COLUMNS};
`;

const CREATE_APPROVAL_TICKET_ACTION_ROW_QUERY = `
insert into service_desk.ticket_action (
  tka_ticket_id,
  tka_action_type,
  tka_content,
  tka_metadata,
  tka_files,
  tka_images,
  tka_owner_username,
  tka_active
)
values (
  $1,
  $2,
  $3,
  $4::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  $5,
  true
)
returning
${TICKET_ACTION_ROW_COLUMNS};
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

export async function findNextTicketActionNo(
  ticketId: string,
  options: TicketActionRepositoryOptions = {},
): Promise<number> {
  const query = options.query ?? queryPortalApi;
  const rows = await query<{ action_no: number | string }>(
    FIND_NEXT_TICKET_ACTION_NO_QUERY,
    [ticketId],
  );

  return Number(rows[0]?.action_no ?? 1);
}

export async function createTicketActionRow(
  input: CreateTicketActionRowInput,
  options: TicketActionRepositoryOptions = {},
): Promise<TicketActionRow | null> {
  const query = options.query ?? queryPortalApi;
  const rows = await query<TicketActionRow>(CREATE_TICKET_ACTION_ROW_QUERY, [
    input.ticketId,
    input.actionNo,
    input.actionType,
    input.content,
    JSON.stringify(input.files),
    JSON.stringify(input.images),
    input.ownerUsername,
  ]);

  return rows[0] ?? null;
}

export async function createApprovalTicketActionRow(
  input: CreateApprovalTicketActionRowInput,
  options: TicketActionRepositoryOptions = {},
): Promise<TicketActionRow | null> {
  const query = options.query ?? queryPortalApi;
  const rows = await query<TicketActionRow>(
    CREATE_APPROVAL_TICKET_ACTION_ROW_QUERY,
    [
      input.ticketId,
      input.actionType,
      input.content,
      JSON.stringify(input.metadata ?? {}),
      input.ownerUsername,
    ],
  );

  return rows[0] ?? null;
}
