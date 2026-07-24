import { queryPortalApi } from "@/server/shared/supabase/portalApiClient";

import {
  findActiveTicketViewRowById,
  findActiveTicketViewRowByIdIncludingDraft,
  type TicketRepositoryOptions,
} from "./ticketRepository";
import {
  CreateTicketRowInput,
  ServiceDeskTicketViewRow,
} from "./ticketRow";
import {
  RequesterUpdateCategorySnapshot,
  RequesterUpdateTicketRowInput,
} from "./ticketUpdateRow";

export type RequesterUpdateTicketRepositoryOptions = TicketRepositoryOptions;

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
  tk_status = $13,
  tk_updated_at = now()
where tk_id = $1
  and tk_active = true
  and tk_status in ('Approval', 'Assigned')
returning tk_id;
`;

const SUBMIT_DRAFT_TICKET_ROW_BY_ID_QUERY = `
update service_desk.ticket
set
  tk_ticket_no = $2,
  tk_tenant_id = $3,
  tk_category_id = $4,
  tk_approval_step_id = $15,
  tk_requester_username = $5,
  tk_requester_department_id = $16,
  tk_assignee_usernames = array[]::text[],
  tk_email = $6::jsonb,
  tk_subject = $7,
  tk_content = $8,
  tk_files = $9::jsonb,
  tk_images = $10::jsonb,
  tk_status = $14,
  tk_priority = $11,
  tk_risk_level = $12,
  tk_due_at = $13,
  tk_active = true,
  tk_created_at = now(),
  tk_updated_at = now()
where tk_id = $1
  and tk_status = 'Draft'
  and tk_requester_username = $5
  and tk_active = true
returning tk_id;
`;

const UPDATE_TICKET_INITIAL_ROUTING_BY_ID_QUERY = `
update service_desk.ticket
set
  tk_approval_step_id = $2,
  tk_assignee_usernames = $3::text[],
  tk_status = $4,
  tk_updated_at = now()
where tk_id = $1
  and tk_active = true
returning tk_id;
`;

const UPDATE_TICKET_APPROVAL_ROUTING_BY_ID_QUERY = `
update service_desk.ticket
set
  tk_approval_step_id = $2,
  tk_assignee_usernames = $3::text[],
  tk_status = $4,
  tk_updated_at = now()
where tk_id = $1
  and tk_active = true
  and tk_status = 'Approval'
  and tk_approval_step_id = $5::bigint
  and ($7::boolean = true or $6 = any(tk_assignee_usernames))
returning tk_id;
`;

const UPDATE_TICKET_ASSIGNEES_BY_ID_QUERY = `
update service_desk.ticket
set
  tk_assignee_usernames = $2::text[],
  tk_status = $3,
  tk_updated_at = now()
where tk_id = $1
  and tk_active = true
  and tk_status != 'Draft'
returning tk_id;
`;

const UPDATE_TICKET_PLANNING_BY_ID_QUERY = `
update service_desk.ticket
set
  tk_priority = $2,
  tk_risk_level = $3,
  tk_due_at = $4,
  tk_updated_at = now()
where tk_id = $1
  and tk_active = true
  and tk_status != 'Draft'
returning tk_id;
`;

const UPDATE_TICKET_STATUS_BY_ID_QUERY = `
update service_desk.ticket
set
  tk_status = $2,
  tk_updated_at = now()
where tk_id = $1
  and tk_active = true
  and tk_status != 'Draft'
returning tk_id;
`;

const START_ASSIGNED_TICKET_WORK_BY_ID_QUERY = `
update service_desk.ticket
set
  tk_status = 'Working',
  tk_updated_at = now()
where tk_id = $1
  and tk_active = true
  and tk_status = 'Assigned'
  and tk_approval_step_id is null
  and $2 = any(tk_assignee_usernames)
returning tk_id;
`;

// Work minutes are derived from service_desk.work_session in vw_ticket.
const UPDATE_TICKET_WORK_PROGRESS_BY_ID_QUERY = `
update service_desk.ticket
set
  tk_status = $2,
  tk_updated_at = now()
where tk_id = $1
  and tk_active = true
  and tk_status != 'Draft'
  and tk_approval_step_id is null
  and $3 = any(tk_assignee_usernames)
returning tk_id;
`;

// Close reason and merge target fields are derived from ticket_history in vw_ticket.
const UPDATE_TICKET_MERGE_STATE_BY_ID_QUERY = `
update service_desk.ticket
set
  tk_status = 'Closed',
  tk_updated_at = now()
where tk_id = $1
  and tk_active = true
  and tk_status != 'Draft'
returning tk_id;
`;

const UPDATE_TICKET_CLOSE_STATE_BY_ID_QUERY = `
update service_desk.ticket
set
  tk_status = 'Closed',
  tk_updated_at = now()
where tk_id = $1
  and tk_active = true
  and tk_status != 'Draft'
returning tk_id;
`;

const CLOSE_RESOLVED_TICKET_BY_ID_QUERY = `
update service_desk.ticket
set
  tk_status = 'Closed',
  tk_updated_at = now()
where tk_id = $1
  and tk_active = true
  and tk_status = 'Resolved'
returning tk_id;
`;

export async function findRequesterUpdateTicketViewRowById(
  ticketId: string,
  options: RequesterUpdateTicketRepositoryOptions = {},
): Promise<ServiceDeskTicketViewRow | null> {
  return findActiveTicketViewRowByIdIncludingDraft(ticketId, options);
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
      input.tk_status,
    ],
  );
  const updatedTicketId = rows[0]?.tk_id;

  return updatedTicketId
    ? findRequesterUpdateTicketViewRowById(updatedTicketId, options)
    : null;
}

export async function submitDraftTicketRowById(
  ticketId: string,
  input: CreateTicketRowInput,
  options: TicketRepositoryOptions = {},
): Promise<ServiceDeskTicketViewRow | null> {
  const query = options.query ?? queryPortalApi;
  const rows = await query<{ tk_id: string }>(
    SUBMIT_DRAFT_TICKET_ROW_BY_ID_QUERY,
    [
      ticketId,
      input.tk_ticket_no,
      input.tk_tenant_id,
      input.tk_category_id,
      input.tk_requester_username,
      JSON.stringify(input.tk_email),
      input.tk_subject,
      input.tk_content,
      JSON.stringify(input.tk_files),
      JSON.stringify(input.tk_images),
      input.tk_priority,
      input.tk_risk_level,
      input.tk_due_at,
      input.tk_status,
      input.tk_approval_step_id,
      input.tk_requester_department_id,
    ],
  );
  const submittedTicketId = rows[0]?.tk_id;

  return submittedTicketId
    ? findActiveTicketViewRowById(submittedTicketId, options)
    : null;
}

export async function updateTicketInitialRoutingById(
  ticketId: string,
  input: {
    approvalStepId: number | string | null;
    assigneeUsernames: string[];
    status: ServiceDeskTicketViewRow["tk_status"];
  },
  options: TicketRepositoryOptions = {},
): Promise<ServiceDeskTicketViewRow | null> {
  const query = options.query ?? queryPortalApi;
  const rows = await query<{ tk_id: string }>(
    UPDATE_TICKET_INITIAL_ROUTING_BY_ID_QUERY,
    [ticketId, input.approvalStepId, input.assigneeUsernames, input.status],
  );
  const updatedTicketId = rows[0]?.tk_id;

  return updatedTicketId
    ? findActiveTicketViewRowById(updatedTicketId, options)
    : null;
}

export async function updateTicketApprovalRoutingById(
  ticketId: string,
  input: {
    approvalStepId: number | string | null;
    assigneeUsernames: string[];
    status: ServiceDeskTicketViewRow["tk_status"];
    currentApprovalStepId: number | string;
    currentApproverUsername: string;
    isAdmin?: boolean;
  },
  options: TicketRepositoryOptions = {},
): Promise<ServiceDeskTicketViewRow | null> {
  const query = options.query ?? queryPortalApi;
  const rows = await query<{ tk_id: string }>(
    UPDATE_TICKET_APPROVAL_ROUTING_BY_ID_QUERY,
    [
      ticketId,
      input.approvalStepId,
      input.assigneeUsernames,
      input.status,
      input.currentApprovalStepId,
      input.currentApproverUsername,
      input.isAdmin ?? false,
    ],
  );
  const updatedTicketId = rows[0]?.tk_id;

  return updatedTicketId
    ? findActiveTicketViewRowById(updatedTicketId, options)
    : null;
}

export async function updateTicketAssigneesById(
  ticketId: string,
  input: {
    assigneeUsernames: string[];
    status: ServiceDeskTicketViewRow["tk_status"];
  },
  options: TicketRepositoryOptions = {},
): Promise<ServiceDeskTicketViewRow | null> {
  const query = options.query ?? queryPortalApi;
  const rows = await query<{ tk_id: string }>(
    UPDATE_TICKET_ASSIGNEES_BY_ID_QUERY,
    [ticketId, input.assigneeUsernames, input.status],
  );
  const updatedTicketId = rows[0]?.tk_id;

  return updatedTicketId
    ? findActiveTicketViewRowByIdIncludingDraft(updatedTicketId, options)
    : null;
}

export async function updateTicketPlanningById(
  ticketId: string,
  input: {
    priority: ServiceDeskTicketViewRow["tk_priority"];
    riskLevel: ServiceDeskTicketViewRow["tk_risk_level"];
    dueAt: ServiceDeskTicketViewRow["tk_due_at"];
  },
  options: TicketRepositoryOptions = {},
): Promise<ServiceDeskTicketViewRow | null> {
  const query = options.query ?? queryPortalApi;
  const rows = await query<{ tk_id: string }>(
    UPDATE_TICKET_PLANNING_BY_ID_QUERY,
    [ticketId, input.priority, input.riskLevel, input.dueAt],
  );
  const updatedTicketId = rows[0]?.tk_id;

  return updatedTicketId
    ? findActiveTicketViewRowByIdIncludingDraft(updatedTicketId, options)
    : null;
}

export async function updateTicketStatusById(
  ticketId: string,
  input: { status: ServiceDeskTicketViewRow["tk_status"] },
  options: TicketRepositoryOptions = {},
): Promise<ServiceDeskTicketViewRow | null> {
  const query = options.query ?? queryPortalApi;
  const rows = await query<{ tk_id: string }>(
    UPDATE_TICKET_STATUS_BY_ID_QUERY,
    [ticketId, input.status],
  );
  const updatedTicketId = rows[0]?.tk_id;

  return updatedTicketId
    ? findActiveTicketViewRowByIdIncludingDraft(updatedTicketId, options)
    : null;
}

export async function startAssignedTicketWorkById(
  ticketId: string,
  input: { assigneeUsername: string },
  options: TicketRepositoryOptions = {},
): Promise<ServiceDeskTicketViewRow | null> {
  const query = options.query ?? queryPortalApi;
  const rows = await query<{ tk_id: string }>(
    START_ASSIGNED_TICKET_WORK_BY_ID_QUERY,
    [ticketId, input.assigneeUsername],
  );
  const updatedTicketId = rows[0]?.tk_id;

  return updatedTicketId
    ? findActiveTicketViewRowById(updatedTicketId, options)
    : null;
}

export async function updateTicketWorkProgressById(
  ticketId: string,
  input: {
    status: ServiceDeskTicketViewRow["tk_status"];
    assigneeUsername: string;
  },
  options: TicketRepositoryOptions = {},
): Promise<ServiceDeskTicketViewRow | null> {
  const query = options.query ?? queryPortalApi;
  const rows = await query<{ tk_id: string }>(
    UPDATE_TICKET_WORK_PROGRESS_BY_ID_QUERY,
    [ticketId, input.status, input.assigneeUsername],
  );
  const updatedTicketId = rows[0]?.tk_id;

  return updatedTicketId
    ? findActiveTicketViewRowByIdIncludingDraft(updatedTicketId, options)
    : null;
}

export async function updateTicketMergeStateById(
  ticketId: string,
  options: TicketRepositoryOptions = {},
): Promise<ServiceDeskTicketViewRow | null> {
  const query = options.query ?? queryPortalApi;
  const rows = await query<{ tk_id: string }>(
    UPDATE_TICKET_MERGE_STATE_BY_ID_QUERY,
    [ticketId],
  );
  const updatedTicketId = rows[0]?.tk_id;

  return updatedTicketId
    ? findActiveTicketViewRowByIdIncludingDraft(updatedTicketId, options)
    : null;
}

export async function updateTicketCloseStateById(
  ticketId: string,
  options: TicketRepositoryOptions = {},
): Promise<ServiceDeskTicketViewRow | null> {
  const query = options.query ?? queryPortalApi;
  const rows = await query<{ tk_id: string }>(
    UPDATE_TICKET_CLOSE_STATE_BY_ID_QUERY,
    [ticketId],
  );
  const updatedTicketId = rows[0]?.tk_id;

  return updatedTicketId
    ? findActiveTicketViewRowByIdIncludingDraft(updatedTicketId, options)
    : null;
}

export async function closeResolvedTicketById(
  ticketId: string,
  options: TicketRepositoryOptions = {},
): Promise<ServiceDeskTicketViewRow | null> {
  const query = options.query ?? queryPortalApi;
  const rows = await query<{ tk_id: string }>(
    CLOSE_RESOLVED_TICKET_BY_ID_QUERY,
    [ticketId],
  );
  const updatedTicketId = rows[0]?.tk_id;

  return updatedTicketId
    ? findActiveTicketViewRowByIdIncludingDraft(updatedTicketId, options)
    : null;
}
