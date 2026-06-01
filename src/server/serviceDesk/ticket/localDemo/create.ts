import { ServiceDeskApiError } from "@/app/api/service-desk/_shared/messages";
import { camelTicketDetailMapper } from "@/feature/serviceDesk/ticket/api";
import { DbTicketDetail } from "@/feature/serviceDesk/ticket/api/types";
import {
  CreateTicketInput,
  toTicketWritePayload,
} from "@/feature/serviceDesk/ticket/write";

import { getLocalDemoTickets } from "../state";
import { splitAttachments } from "./attachments";
import { resolveCategorySnapshot } from "./category";
import { resolveCreateTicketRouting } from "./createRouting";
import {
  createTicketId,
  createTicketNumber,
  resolveNextTicketSequence,
  resolveTicketYear,
} from "./ticketNumber";
import { resolvePriorityValue, resolveRiskLevelValue } from "./ticketValue";

export const localCreateTicket = ({
  isInternal,
  requesterUsername,
  input,
}: {
  isInternal: boolean;
  requesterUsername: string | null;
  input: CreateTicketInput;
}) => {
  const targetMock = getLocalDemoTickets(isInternal);
  const payload = toTicketWritePayload(input);

  if (!payload.category) {
    throw new ServiceDeskApiError("api.tickets.localDemo.invalidPayload", 400);
  }

  const resolvedRequesterId = normalizeRequesterId(
    requesterUsername ?? payload.requester.id,
  );

  if (!resolvedRequesterId) {
    throw new ServiceDeskApiError(
      "api.tickets.localDemo.requesterRequired",
      400,
    );
  }

  const category = resolveCategorySnapshot({
    isInternal,
    categoryId: payload.category,
  });

  const routing = resolveCreateTicketRouting({
    isInternal,
    categoryId: category.id,
    parentCategoryId: category.parentId,
    requesterUsername: resolvedRequesterId,
  });

  const now = new Date().toISOString();
  const year = resolveTicketYear(targetMock, now);
  const nextSequence = resolveNextTicketSequence(targetMock, year);
  const attachments = splitAttachments(payload.attachment);
  const nextTicket: DbTicketDetail = {
    id: createTicketId(year, nextSequence),
    ticket_number: createTicketNumber(year, nextSequence),
    created_at: now,
    updated_at: now,
    requester_id: resolvedRequesterId,
    status: routing.status,
    close_reason: null,
    priority: resolvePriorityValue(
      payload.priority,
      category.defaultPriority ?? "medium",
    ),
    risk_level: resolveRiskLevelValue(
      payload.riskLevel,
      category.defaultRiskLevel ?? "medium",
    ),
    assignee_id: routing.assigneeUsernames,
    merged_into_ticket_id: null,
    work_minutes: 0,
    last_comment_at: null,
    last_commenter_email: null,
    due_at: payload.dueAt,
    owner: false,
    assigned: false,
    active: true,
    scope: category.scope,
    category_id: category.id,
    category_name: category.name,
    approval_step_id: routing.approvalStepId,
    subject: payload.subject,
    content: payload.body,
    email: payload.email,
    files: attachments.files,
    images: attachments.images,
  };

  targetMock.unshift(nextTicket);

  return camelTicketDetailMapper([nextTicket])[0];
};

function normalizeRequesterId(value: string | null): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim();

  return normalizedValue.length > 0 ? normalizedValue : null;
}
