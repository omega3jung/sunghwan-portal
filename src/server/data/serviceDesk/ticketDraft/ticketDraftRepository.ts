import { queryPortalApi } from "@/server/shared/supabase/portalApiClient";

import { ServiceDeskTicketDraftRow, TicketDraftRowInput } from "./ticketDraftRow";

const TICKET_DRAFT_COLUMNS = `
  tk_id,
  tk_ticket_no,
  tk_created_at,
  tk_updated_at,
  tk_requester_username,
  tk_status,
  tk_priority,
  tk_risk_level,
  tk_assignee_usernames,
  tk_due_at,
  tk_category_id,
  tk_approval_step_id,
  tk_subject,
  tk_content,
  tk_email,
  tk_files,
  tk_images,
  tk_active
`;

const FIND_TICKET_DRAFT_ROW_BY_REQUESTER_QUERY = `
select
${TICKET_DRAFT_COLUMNS}
from service_desk.ticket
where tk_status = 'Draft'
  and tk_requester_username = $1
limit 1;
`;

const CREATE_TICKET_DRAFT_ROW_QUERY = `
insert into service_desk.ticket (
  tk_ticket_no,
  tk_requester_username,
  tk_status,
  tk_priority,
  tk_risk_level,
  tk_assignee_usernames,
  tk_due_at,
  tk_category_id,
  tk_approval_step_id,
  tk_subject,
  tk_content,
  tk_email,
  tk_files,
  tk_images,
  tk_active
)
values (
  $1,
  $2,
  'Draft',
  $3,
  $4,
  $5,
  $6,
  $7,
  $8,
  $9,
  $10,
  $11::jsonb,
  $12::jsonb,
  $13::jsonb,
  true
)
returning
${TICKET_DRAFT_COLUMNS};
`;

const UPDATE_TICKET_DRAFT_ROW_BY_ID_QUERY = `
update service_desk.ticket
set
  tk_priority = $3,
  tk_risk_level = $4,
  tk_assignee_usernames = $5,
  tk_due_at = $6,
  tk_category_id = $7,
  tk_approval_step_id = $8,
  tk_subject = $9,
  tk_content = $10,
  tk_email = $11::jsonb,
  tk_files = $12::jsonb,
  tk_images = $13::jsonb,
  tk_active = true,
  tk_updated_at = now()
where tk_id = $1
  and tk_requester_username = $2
  and tk_status = 'Draft'
returning
${TICKET_DRAFT_COLUMNS};
`;

const DISCARD_TICKET_DRAFT_ROW_BY_ID_QUERY = `
update service_desk.ticket
set
  tk_active = false,
  tk_updated_at = now()
where tk_id = $1
  and tk_requester_username = $2
  and tk_status = 'Draft'
returning tk_id;
`;

export async function findTicketDraftRowByRequesterUsername(
  requesterUsername: string,
): Promise<ServiceDeskTicketDraftRow | null> {
  const rows = await queryPortalApi<ServiceDeskTicketDraftRow>(
    FIND_TICKET_DRAFT_ROW_BY_REQUESTER_QUERY,
    [requesterUsername],
  );

  return rows[0] ?? null;
}

export async function createTicketDraftRow(
  requesterUsername: string,
  input: TicketDraftRowInput,
): Promise<ServiceDeskTicketDraftRow | null> {
  const rows = await queryPortalApi<ServiceDeskTicketDraftRow>(
    CREATE_TICKET_DRAFT_ROW_QUERY,
    [
      createDraftTicketNo(requesterUsername),
      requesterUsername,
      input.tk_priority,
      input.tk_risk_level,
      input.tk_assignee_usernames,
      input.tk_due_at,
      input.tk_category_id,
      input.tk_approval_step_id,
      input.tk_subject,
      input.tk_content,
      JSON.stringify(input.tk_email),
      JSON.stringify(input.tk_files),
      JSON.stringify(input.tk_images),
    ],
  );

  return rows[0] ?? null;
}

export async function updateTicketDraftRowById(
  ticketId: string,
  requesterUsername: string,
  input: TicketDraftRowInput,
): Promise<ServiceDeskTicketDraftRow | null> {
  const rows = await queryPortalApi<ServiceDeskTicketDraftRow>(
    UPDATE_TICKET_DRAFT_ROW_BY_ID_QUERY,
    [
      ticketId,
      requesterUsername,
      input.tk_priority,
      input.tk_risk_level,
      input.tk_assignee_usernames,
      input.tk_due_at,
      input.tk_category_id,
      input.tk_approval_step_id,
      input.tk_subject,
      input.tk_content,
      JSON.stringify(input.tk_email),
      JSON.stringify(input.tk_files),
      JSON.stringify(input.tk_images),
    ],
  );

  return rows[0] ?? null;
}

export async function discardTicketDraftRowById(
  ticketId: string,
  requesterUsername: string,
): Promise<boolean> {
  const rows = await queryPortalApi<{ tk_id: string }>(
    DISCARD_TICKET_DRAFT_ROW_BY_ID_QUERY,
    [ticketId, requesterUsername],
  );

  return rows.length > 0;
}

function createDraftTicketNo(requesterUsername: string) {
  return `${requesterUsername}_draft`;
}
