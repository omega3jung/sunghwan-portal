import {
  canMergeTicketInto,
  resolveTicketMergeCloseReason,
} from "@/domain/serviceDesk/ticket/merge";
import {
  createServiceDeskStatusError as createStatusError,
  type ServiceDeskQueryExecutor,
} from "@/server/data/serviceDesk/shared";
import { findActiveTicketViewRowByIdIncludingDraft } from "@/server/data/serviceDesk/ticket/ticketRepository";
import type { ServiceDeskTicketViewRow } from "@/server/data/serviceDesk/ticket/ticketRow";
import { updateTicketMergeStateById } from "@/server/data/serviceDesk/ticket/ticketUpdateRepository";
import { finishRunningWorkSessionsByTicketId } from "@/server/data/serviceDesk/workSession";

import { createHistoryOfTicketMerged } from "../../ticketHistory/ticketHistoryEventService";
import {
  assertTicketUpdated,
  assertWorkAssigneeOrAdmin,
  type NormalizedTicketActionPayload,
} from "../ticketActionRules";

export async function executeMergeTicketAction({
  ticket,
  targetTicket,
  ticketId,
  actionNo,
  currentUserName,
  isAdmin,
  payload,
  query,
}: {
  ticket: ServiceDeskTicketViewRow;
  targetTicket: ServiceDeskTicketViewRow | null;
  ticketId: string;
  actionNo: number;
  currentUserName: string;
  isAdmin: boolean;
  payload: NormalizedTicketActionPayload;
  query: ServiceDeskQueryExecutor;
}) {
  assertWorkAssigneeOrAdmin(ticket, currentUserName, isAdmin);

  if (!targetTicket || !payload.targetTicketId) {
    throw createStatusError("Merge target ticket is required.", 400);
  }

  const closeReason = resolveTicketMergeCloseReason(
    toMergeAwareTicket(ticket),
    toMergeAwareTicket(targetTicket),
  );

  if (!closeReason) {
    throw createStatusError("Invalid merge target.", 400);
  }

  const updatedTicket = await updateTicketMergeStateById(ticketId, { query });

  assertTicketUpdated(
    updatedTicket,
    "Merge action could not update the ticket.",
  );

  await finishRunningWorkSessionsByTicketId(
    ticketId,
    new Date().toISOString(),
    { query },
  );

  await createHistoryOfTicketMerged(
    {
      ticketId,
      actionNo,
      actorUsername: currentUserName,
      fromStatus: ticket.tk_status,
      targetTicketId: payload.targetTicketId,
      targetTicketNo: targetTicket.tk_ticket_no,
      closeReason,
      sourceTenantId: String(ticket.tk_tenant_id),
      targetTenantId: String(targetTicket.tk_tenant_id),
      sourceScope: ticket.cat_scope,
      targetScope: targetTicket.cat_scope,
      reason: payload.content,
      metadata: payload.historyMetadata,
    },
    { query },
  );
}

export async function resolveMergeTargetTicket({
  ticket,
  targetTicketId,
  query,
}: {
  ticket: ServiceDeskTicketViewRow;
  targetTicketId?: string;
  query: ServiceDeskQueryExecutor;
}) {
  if (!targetTicketId) {
    throw createStatusError("Merge target ticket is required.", 400);
  }

  if (targetTicketId === ticket.tk_id) {
    throw createStatusError("A ticket cannot be merged into itself.", 400);
  }

  const targetTicket = await findActiveTicketViewRowByIdIncludingDraft(
    targetTicketId,
    { query },
  );

  if (!targetTicket) {
    throw createStatusError("Merge target ticket not found.", 404);
  }

  if (ticket.tk_status === "Draft") {
    throw createStatusError("Draft tickets cannot be merged.", 400);
  }

  if (targetTicket.tk_status === "Draft") {
    throw createStatusError("A ticket cannot be merged into a draft.", 400);
  }

  if (ticket.tk_merged_into_ticket_id) {
    throw createStatusError("Ticket has already been merged.", 400);
  }

  if (targetTicket.tk_merged_into_ticket_id) {
    throw createStatusError("Merge target has already been merged.", 400);
  }

  if (
    ticket.tk_tenant_id === null ||
    targetTicket.tk_tenant_id === null ||
    ticket.tk_tenant_id !== targetTicket.tk_tenant_id
  ) {
    throw createStatusError("Merge target ticket not found.", 404);
  }

  if (
    ticket.cat_scope === "PORTAL" &&
    targetTicket.cat_scope === "INTERNAL"
  ) {
    throw createStatusError(
      "Portal tickets cannot be merged into internal tickets.",
      400,
    );
  }

  const canMerge = canMergeTicketInto(
    toMergeAwareTicket(ticket),
    toMergeAwareTicket(targetTicket),
  );

  if (!canMerge) {
    throw createStatusError("Invalid merge target.", 400);
  }

  return targetTicket;
}

function toMergeAwareTicket(ticket: ServiceDeskTicketViewRow) {
  return {
    id: ticket.tk_id,
    tenantId:
      ticket.tk_tenant_id === null ? null : String(ticket.tk_tenant_id),
    scope: ticket.cat_scope,
    status: ticket.tk_status,
    closeReason: ticket.tk_close_reason ?? undefined,
    mergedIntoTicketId: ticket.tk_merged_into_ticket_id,
  };
}
