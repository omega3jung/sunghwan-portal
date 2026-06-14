
import {
  LocalActionHandler,
  LocalActionSpec,
  TicketActionApiType,
} from "../types";
import {
  requireAssigneeIds,
  requireTargetTicketId,
  resolvePriority,
  resolveRiskLevel,
  toHistoryMetadata,
} from "../utils";
import { mergeTicketToEmails } from "./email";
import { createMessageHistory, createStatusHistory } from "./history";
import { validateMergeTarget } from "./merge";
import { requireNextStatus, requireTicket } from "./ticketContext";
import { mergeAssigneeIds } from "./ticketPatch";

const assignTicket: LocalActionHandler = (context) => {
  const ticket = requireTicket(context);
  const assigneeUsernames = requireAssigneeIds(context.content);

  return {
    history: {
      type: "ASSIGNMENT",
      action: "UPDATED",
      from_value: ticket.assignee_id,
      to_value: assigneeUsernames,
      metadata: toHistoryMetadata(context.content),
    },
    ticketPatch: {
      assignee_id: assigneeUsernames,
      email: mergeTicketToEmails(ticket, assigneeUsernames),
      assigned: assigneeUsernames.includes(context.employeeUserName),
    },
  };
};

const assignSelfTicket: LocalActionHandler = (context) => {
  const ticket = requireTicket(context);
  const assigneeUsernames =
    ticket.status === "Working"
      ? mergeAssigneeIds(ticket.assignee_id, context.employeeUserName)
      : [context.employeeUserName];

  return {
    history: {
      type: "ASSIGNMENT",
      action: "UPDATED",
      from_value: ticket.assignee_id,
      to_value: assigneeUsernames,
      metadata: toHistoryMetadata(context.content),
    },
    ticketPatch: {
      assignee_id: assigneeUsernames,
      email: mergeTicketToEmails(ticket, assigneeUsernames),
      assigned: true,
    },
  };
};

const rejectTicket: LocalActionHandler = (context) => {
  const ticket = requireTicket(context);
  const nextStatus = requireNextStatus(context);

  return {
    history: {
      type: "TICKET",
      action: "TICKET_REJECTED",
      from_value: ticket.status,
      to_value: nextStatus,
      metadata: toHistoryMetadata(context.content),
    },
  };
};

const mergeTicket: LocalActionHandler = (context) => {
  const targetTicketId = requireTargetTicketId(context.content);
  const { sourceTicket } = validateMergeTarget(context, targetTicketId);

  return {
    history: {
      type: "TICKET",
      action: "TICKET_MERGED",
      from_value: sourceTicket.merged_into_ticket_id ?? null,
      to_value: targetTicketId,
      metadata: toHistoryMetadata(context.content),
    },
    ticketPatch: {
      close_reason: "Merged",
      merged_into_ticket_id: targetTicketId,
    },
  };
};

const adjustTicket: LocalActionHandler = (context) => {
  const ticket = requireTicket(context);
  const priority = resolvePriority(context.content.priority, ticket.priority);
  const riskLevel = resolveRiskLevel(
    context.content.riskLevel,
    ticket.risk_level,
  );
  const dueAt = context.content.dueAt ?? ticket.due_at;

  return {
    history: {
      type: "PLANNING",
      action: "UPDATED",
      from_value: {
        priority: ticket.priority,
        risk_level: ticket.risk_level,
        due_at: ticket.due_at,
      },
      to_value: {
        priority,
        risk_level: riskLevel,
        due_at: dueAt,
      },
      metadata: toHistoryMetadata(context.content),
    },
    ticketPatch: {
      priority,
      risk_level: riskLevel,
      due_at: dueAt,
    },
  };
};

export const actionSpecMap: Record<TicketActionApiType, LocalActionSpec> = {
  comment: { handler: createMessageHistory("COMMENT") },
  note: { handler: createMessageHistory("NOTE") },
  assign: { handler: assignTicket, needsTicket: true },
  assignSelf: { handler: assignSelfTicket, needsTicket: true },
  reject: { handler: rejectTicket, needsTicket: true },
  merge: { handler: mergeTicket, needsTicket: true },
  adjust: { handler: adjustTicket, needsTicket: true },
  reopen: { handler: createStatusHistory, needsTicket: true },
  resubmit: { handler: createStatusHistory, needsTicket: true },
};
