import { queryPortalApi } from "@/server/shared/supabase/portalApiClient";

import { ServiceDeskTicketViewRow } from "./ticketRow";

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

const FIND_ACTIVE_TICKET_VIEW_ROWS_QUERY = `
select
${TICKET_VIEW_COLUMNS}
from service_desk.vw_ticket
where tk_active = true
order by tk_ticket_no desc, tk_created_at desc;
`;

const FIND_ACTIVE_TICKET_VIEW_ROW_BY_ID_QUERY = `
select
${TICKET_VIEW_COLUMNS}
from service_desk.vw_ticket
where tk_active = true
  and tk_id = $1
limit 1;
`;

export async function findActiveTicketViewRows() {
  return queryPortalApi<ServiceDeskTicketViewRow>(
    FIND_ACTIVE_TICKET_VIEW_ROWS_QUERY,
  );
}

export async function findActiveTicketViewRowById(
  ticketId: string,
): Promise<ServiceDeskTicketViewRow | null> {
  const rows = await queryPortalApi<ServiceDeskTicketViewRow>(
    FIND_ACTIVE_TICKET_VIEW_ROW_BY_ID_QUERY,
    [ticketId],
  );

  return rows[0] ?? null;
}
