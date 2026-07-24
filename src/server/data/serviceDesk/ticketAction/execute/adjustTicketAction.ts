import {
  createServiceDeskStatusError as createStatusError,
  type ServiceDeskQueryExecutor,
} from "@/server/data/serviceDesk/shared";
import type { ServiceDeskTicketViewRow } from "@/server/data/serviceDesk/ticket/ticketRow";
import { updateTicketPlanningById } from "@/server/data/serviceDesk/ticket/ticketUpdateRepository";

import { createHistoryOfPlanningChange } from "../../ticketHistory/ticketHistoryEventService";
import {
  assertTicketUpdated,
  assertWorkAssignee,
  compactHistoryObject,
  type NormalizedTicketActionPayload,
  normalizeHistoryMetadataRecord,
} from "../ticketActionRules";

export async function executeAdjustTicketAction({
  ticket,
  ticketId,
  actionNo,
  currentUserName,
  isAdmin,
  payload,
  query,
}: {
  ticket: ServiceDeskTicketViewRow;
  ticketId: string;
  actionNo: number;
  currentUserName: string;
  isAdmin: boolean;
  payload: NormalizedTicketActionPayload;
  query: ServiceDeskQueryExecutor;
}) {
  if (!isAdmin) {
    assertWorkAssignee(ticket, currentUserName);
  }

  const priority = payload.priority ?? ticket.tk_priority;
  const riskLevel = payload.riskLevel ?? ticket.tk_risk_level;
  const dueAt = payload.dueAt ?? ticket.tk_due_at;
  const isAdminCorrection =
    isAdmin &&
    (ticket.tk_status === "Resolved" || ticket.tk_status === "Closed");

  if (isAdminCorrection && dueAt !== ticket.tk_due_at) {
    throw createStatusError(
      "Due date cannot be changed for resolved or closed admin correction.",
      400,
    );
  }

  const previousPlanning = compactHistoryObject({
    priority: ticket.tk_priority,
    risk_level: ticket.tk_risk_level,
    ...(isAdminCorrection ? {} : { due_at: ticket.tk_due_at }),
  });
  const nextPlanning = compactHistoryObject({
    priority,
    risk_level: riskLevel,
    ...(isAdminCorrection ? {} : { due_at: dueAt }),
  });
  const changedFields = [
    priority !== ticket.tk_priority ? "priority" : null,
    riskLevel !== ticket.tk_risk_level ? "riskLevel" : null,
    !isAdminCorrection && dueAt !== ticket.tk_due_at ? "dueAt" : null,
  ].filter((field): field is string => field !== null);

  if (changedFields.length === 0) {
    throw createStatusError("No planning fields changed.", 400);
  }

  const updatedTicket = await updateTicketPlanningById(
    ticketId,
    {
      priority,
      riskLevel,
      dueAt: isAdminCorrection ? ticket.tk_due_at : dueAt,
    },
    { query },
  );

  assertTicketUpdated(
    updatedTicket,
    "Adjust action could not update the ticket.",
  );

  await createHistoryOfPlanningChange(
    {
      ticketId,
      actionNo,
      actorUsername: currentUserName,
      fromPlanning: previousPlanning,
      toPlanning: nextPlanning,
      metadata: compactHistoryObject({
        ...normalizeHistoryMetadataRecord(payload.historyMetadata),
        changedFields,
        ...(isAdminCorrection
          ? {
              isAdminCorrection: true,
              previous: previousPlanning,
              next: nextPlanning,
            }
          : {}),
      }),
    },
    { query },
  );
}
