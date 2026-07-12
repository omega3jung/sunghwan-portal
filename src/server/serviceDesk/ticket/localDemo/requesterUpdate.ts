import { ServiceDeskApiError } from "@/app/api/service-desk/_shared/messages";
import type { TicketAttachmentMetadata } from "@/domain/serviceDesk";
import { camelTicketDetailMapper } from "@/feature/serviceDesk/ticket/api";
import { DbTicketDetail } from "@/feature/serviceDesk/ticket/api/types";
import { DbTicketHistory } from "@/feature/serviceDesk/ticketHistory/api";
import type { RequesterUpdateTicketRequestDto } from "@/server/data/serviceDesk/ticket";

import { getLocalDemoHistories, getLocalDemoTickets } from "../state";
import { resolveCategorySnapshot } from "./category";
import { resolveCreateTicketRouting } from "./createRouting";
import { resolvePriorityValue, resolveRiskLevelValue } from "./ticketValue";

const REQUESTER_EDITABLE_TICKET_STATUSES: readonly DbTicketDetail["status"][] =
  ["Approval", "Assigned"];

export const localRequesterUpdateTicket = ({
  isInternal,
  ticketId,
  requesterUsername,
  input,
}: {
  isInternal: boolean;
  ticketId: string;
  requesterUsername: string;
  input: RequesterUpdateTicketRequestDto;
}) => {
  const targetMock = getLocalDemoTickets(isInternal);
  const ticketIndex = targetMock.findIndex((item) => item.id === ticketId);

  if (ticketIndex < 0) {
    throw new ServiceDeskApiError("api.common.notFound", 404);
  }

  const ticket = targetMock[ticketIndex];

  if (!ticket.active) {
    throw new ServiceDeskApiError("api.common.notFound", 404);
  }

  if (ticket.requester_username !== requesterUsername) {
    throw new ServiceDeskApiError(
      "api.tickets.localDemo.updateForbidden",
      403,
    );
  }

  if (!REQUESTER_EDITABLE_TICKET_STATUSES.includes(ticket.status)) {
    throw new ServiceDeskApiError(
      "api.tickets.localDemo.updateNotAllowed",
      409,
      {
        status: ticket.status,
      },
    );
  }

  const category = resolveCategorySnapshot({
    isInternal,
    categoryId: input.categoryId,
  });
  const preservedTicket = createUpdatedTicket({
    ticket,
    input,
    category,
    approvalStepId: ticket.approval_step_id,
    assigneeUsernames: ticket.assignee_usernames,
    status: ticket.status,
    priority: ticket.priority,
    riskLevel: ticket.risk_level,
  });
  const preliminaryChangedFields = resolveChangedFields(ticket, preservedTicket);
  const categoryChanged = preliminaryChangedFields.includes("categoryId");
  const routingSensitiveChanged = preliminaryChangedFields.some(
    isRoutingSensitiveField,
  );
  const routing = routingSensitiveChanged
    ? resolveCreateTicketRouting({
        isInternal,
        categoryId: category.id,
        parentCategoryId: category.parentId,
        requesterUsername,
      })
    : null;
  const updatedTicket = createUpdatedTicket({
    ticket,
    input,
    category,
    approvalStepId: routing?.approvalStepId ?? ticket.approval_step_id,
    assigneeUsernames: routing?.assigneeUsernames ?? ticket.assignee_usernames,
    status: routing?.status ?? ticket.status,
    priority: categoryChanged
      ? resolvePriorityValue(category.defaultPriority, ticket.priority)
      : ticket.priority,
    riskLevel: categoryChanged
      ? resolveRiskLevelValue(category.defaultRiskLevel, ticket.risk_level)
      : ticket.risk_level,
  });
  const changedFields = resolveChangedFields(ticket, updatedTicket);

  targetMock.splice(ticketIndex, 1, updatedTicket);
  getLocalDemoHistories(isInternal).push(
    createUpdateHistory({
      isInternal,
      ticket,
      updatedTicket,
      actorUsername: requesterUsername,
      changedFields,
      routingSensitiveChanged,
    }),
  );

  return camelTicketDetailMapper([updatedTicket])[0];
};

function createUpdatedTicket({
  ticket,
  input,
  category,
  approvalStepId,
  assigneeUsernames,
  status,
  priority,
  riskLevel,
}: {
  ticket: DbTicketDetail;
  input: RequesterUpdateTicketRequestDto;
  category: ReturnType<typeof resolveCategorySnapshot>;
  approvalStepId: string | null;
  assigneeUsernames: string[];
  status: DbTicketDetail["status"];
  priority: DbTicketDetail["priority"];
  riskLevel: DbTicketDetail["risk_level"];
}): DbTicketDetail {
  const isApprovalPhase = approvalStepId !== null;

  return {
    ...ticket,
    status,
    close_reason: ticket.close_reason ?? null,
    priority,
    risk_level: riskLevel,
    assignee_usernames: assigneeUsernames,
    assignment_phase: isApprovalPhase ? "APPROVAL" : "WORK",
    approval_assignee_usernames: isApprovalPhase ? assigneeUsernames : [],
    work_assignee_usernames: isApprovalPhase ? [] : assigneeUsernames,
    scope: category.scope,
    category_id: category.id,
    category_name: category.name,
    approval_step_id: approvalStepId,
    subject: input.subject,
    content: input.content,
    email: input.email,
    due_at: new Date(input.dueAt).toISOString(),
    files: input.files,
    images: input.images,
    updated_at: new Date().toISOString(),
  };
}

function resolveChangedFields(
  ticket: DbTicketDetail,
  updatedTicket: DbTicketDetail,
) {
  const changedFields: string[] = [];

  if (ticket.category_id !== updatedTicket.category_id) {
    changedFields.push("categoryId");
  }
  if (ticket.subject !== updatedTicket.subject) {
    changedFields.push("subject");
  }
  if (ticket.content !== updatedTicket.content) {
    changedFields.push("content");
  }
  if (
    new Date(ticket.due_at).getTime() !==
    new Date(updatedTicket.due_at).getTime()
  ) {
    changedFields.push("dueAt");
  }
  if (JSON.stringify(ticket.email) !== JSON.stringify(updatedTicket.email)) {
    changedFields.push("email");
  }
  if (
    JSON.stringify(getAttachmentComparisonKeys(ticket.files)) !==
    JSON.stringify(getAttachmentComparisonKeys(updatedTicket.files))
  ) {
    changedFields.push("files");
  }
  if (
    JSON.stringify(getAttachmentComparisonKeys(ticket.images)) !==
    JSON.stringify(getAttachmentComparisonKeys(updatedTicket.images))
  ) {
    changedFields.push("images");
  }

  return changedFields;
}

function createUpdateHistory({
  isInternal,
  ticket,
  updatedTicket,
  actorUsername,
  changedFields,
  routingSensitiveChanged,
}: {
  isInternal: boolean;
  ticket: DbTicketDetail;
  updatedTicket: DbTicketDetail;
  actorUsername: string;
  changedFields: string[];
  routingSensitiveChanged: boolean;
}): DbTicketHistory {
  const histories = getLocalDemoHistories(isInternal).filter(
    (history) => history.ticket_id === ticket.id,
  );
  const nextHistoryNo =
    Math.max(0, ...histories.map((history) => history.history_no)) + 1;

  return {
    ticket_id: ticket.id,
    history_no: nextHistoryNo,
    type: "TICKET",
    event: routingSensitiveChanged ? "ROUTING_RESET" : "ROUTING_PRESERVED",
    source: "ROUTING_RULE",
    actor_username: actorUsername,
    action_no: null,
    from_value: buildHistoryValue(ticket, changedFields),
    to_value: buildHistoryValue(updatedTicket, changedFields),
    metadata: buildHistoryMetadata({
      changedFields,
      routingSensitiveChanged,
      previousApprovalStepId: ticket.approval_step_id,
      nextApprovalStepId: updatedTicket.approval_step_id,
      previousAssigneeUsernames: ticket.assignee_usernames,
      nextAssigneeUsernames: updatedTicket.assignee_usernames,
    }),
    created_at: new Date().toISOString(),
  };
}

function buildHistoryValue(
  ticket: DbTicketDetail,
  changedFields: string[],
): Record<string, unknown> {
  const value: Record<string, unknown> = {};

  if (changedFields.includes("categoryId")) {
    value.categoryId = ticket.category_id;
  }
  if (changedFields.includes("subject")) {
    value.subject = ticket.subject;
  }
  if (changedFields.includes("content")) {
    value.contentChanged = true;
  }
  if (changedFields.includes("dueAt")) {
    value.dueAt = ticket.due_at;
  }
  if (changedFields.includes("email")) {
    value.email = ticket.email;
  }
  if (changedFields.includes("files")) {
    value.files = summarizeAttachments(ticket.files);
  }
  if (changedFields.includes("images")) {
    value.images = summarizeAttachments(ticket.images);
  }

  return value;
}

function buildHistoryMetadata({
  changedFields,
  routingSensitiveChanged,
  previousApprovalStepId,
  nextApprovalStepId,
  previousAssigneeUsernames,
  nextAssigneeUsernames,
}: {
  changedFields: string[];
  routingSensitiveChanged: boolean;
  previousApprovalStepId: string | null;
  nextApprovalStepId: string | null;
  previousAssigneeUsernames: string[];
  nextAssigneeUsernames: string[];
}) {
  const metadata: Record<string, unknown> = {
    changedFields,
    routingSensitiveChanged,
    routingReset: routingSensitiveChanged,
    preservedRouting: !routingSensitiveChanged,
  };

  if (routingSensitiveChanged) {
    metadata.previousApprovalStepId = previousApprovalStepId;
    metadata.nextApprovalStepId = nextApprovalStepId;
    metadata.previousAssigneeUsernames = previousAssigneeUsernames;
    metadata.nextAssigneeUsernames = nextAssigneeUsernames;
  }

  return metadata;
}

function isRoutingSensitiveField(field: string) {
  return (
    field === "categoryId" ||
    field === "subject" ||
    field === "content" ||
    field === "files" ||
    field === "images"
  );
}

function getAttachmentComparisonKeys(items: TicketAttachmentMetadata[]) {
  return items
    .map((item) =>
      [
        item.replacedName,
        item.originalName,
        item.extension,
        String(item.size),
        item.type,
        item.demoUrl,
        item.reason,
      ].join("|"),
    )
    .sort();
}

function summarizeAttachments(items: TicketAttachmentMetadata[]) {
  return {
    count: items.length,
    names: items.map((item) => item.originalName),
  };
}
