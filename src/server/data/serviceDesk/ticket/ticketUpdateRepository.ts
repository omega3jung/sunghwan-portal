import type { QueryResultRow } from "pg";

import { queryPortalApi } from "@/server/shared/supabase/portalApiClient";

import { ServiceDeskTicketViewRow } from "./ticketRow";
import {
  RequesterUpdateCategorySnapshot,
  RequesterUpdateTicketRowInput,
} from "./ticketUpdateRow";

export type RequesterUpdateTicketQueryExecutor = <
  T extends QueryResultRow = QueryResultRow,
>(
  text: string,
  params?: unknown[],
) => Promise<T[]>;

export type RequesterUpdateTicketRepositoryOptions = {
  query?: RequesterUpdateTicketQueryExecutor;
};

const TICKET_VIEW_COLUMNS = `
  tk_id,
  tk_ticket_no,
  tk_created_at,
  tk_updated_at,
  tk_requester_username,
  tk_status,
  tk_priority,
  tk_risk_level,
  tk_assignee_usernames,
  tk_work_minutes,
  tka_last_comment_at,
  tka_last_comment_email,
  tka_last_user_activity_at,
  tka_last_user_activity_email,
  tk_close_reason,
  tk_merged_into_ticket_id,
  tk_merged_into_ticket_no,
  tkh_closed_at,
  tk_due_at,
  cat_scope,
  cat_id,
  cat_name,
  cat_parent_id,
  tk_approval_step_id,
  tk_subject,
  tk_content,
  tk_email,
  tk_files,
  tk_images
`;

const FIND_REQUESTER_UPDATE_TICKET_VIEW_ROW_BY_ID_QUERY = `
select
${TICKET_VIEW_COLUMNS}
from service_desk.vw_ticket
where tk_active = true
  and tk_id = $1
limit 1;
`;

const FIND_ACTIVE_REQUESTER_UPDATE_CATEGORY_SNAPSHOT_BY_ID_QUERY = `
select
  child.cat_id,
  child.cat_parent_id,
  coalesce(child.cat_default_priority, parent.cat_default_priority) as cat_default_priority,
  coalesce(child.cat_default_risk_level, parent.cat_default_risk_level) as cat_default_risk_level
from service_desk.category child
left join service_desk.category parent
  on parent.cat_id = child.cat_parent_id
where child.cat_id = $1
  and child.cat_active = true
  and (parent.cat_id is null or parent.cat_active = true)
limit 1;
`;

const UPDATE_REQUESTER_TICKET_ROW_BY_ID_QUERY = `
update service_desk.ticket
set
  tk_category_id = $2,
  tk_subject = $3,
  tk_content = $4,
  tk_due_at = $5,
  tk_email = $6::jsonb,
  tk_files = $7::jsonb,
  tk_images = $8::jsonb,
  tk_priority = $9,
  tk_risk_level = $10,
  tk_approval_step_id = $11,
  tk_assignee_usernames = $12::text[],
  tk_updated_at = now()
where tk_id = $1
  and tk_active = true
  and tk_status = 'Open'
returning tk_id;
`;

export async function findRequesterUpdateTicketViewRowById(
  ticketId: string,
  options: RequesterUpdateTicketRepositoryOptions = {},
): Promise<ServiceDeskTicketViewRow | null> {
  const query = options.query ?? queryPortalApi;
  const rows = await query<ServiceDeskTicketViewRow>(
    FIND_REQUESTER_UPDATE_TICKET_VIEW_ROW_BY_ID_QUERY,
    [ticketId],
  );

  return rows[0] ?? null;
}

export async function findActiveRequesterUpdateCategorySnapshotById(
  categoryId: string | number,
  options: RequesterUpdateTicketRepositoryOptions = {},
): Promise<RequesterUpdateCategorySnapshot | null> {
  const query = options.query ?? queryPortalApi;
  const rows = await query<RequesterUpdateCategorySnapshot>(
    FIND_ACTIVE_REQUESTER_UPDATE_CATEGORY_SNAPSHOT_BY_ID_QUERY,
    [Number(categoryId)],
  );

  return rows[0] ?? null;
}

export async function updateRequesterTicketRowById(
  ticketId: string,
  input: RequesterUpdateTicketRowInput,
  options: RequesterUpdateTicketRepositoryOptions = {},
): Promise<ServiceDeskTicketViewRow | null> {
  const query = options.query ?? queryPortalApi;
  const rows = await query<{ tk_id: string }>(
    UPDATE_REQUESTER_TICKET_ROW_BY_ID_QUERY,
    [
      ticketId,
      input.tk_category_id,
      input.tk_subject,
      input.tk_content,
      input.tk_due_at,
      JSON.stringify(input.tk_email),
      JSON.stringify(input.tk_files),
      JSON.stringify(input.tk_images),
      input.tk_priority,
      input.tk_risk_level,
      input.tk_approval_step_id,
      input.tk_assignee_usernames,
    ],
  );
  const updatedTicketId = rows[0]?.tk_id;

  return updatedTicketId
    ? findRequesterUpdateTicketViewRowById(updatedTicketId, options)
    : null;
}
